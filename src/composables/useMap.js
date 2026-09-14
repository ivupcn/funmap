import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import { useMapStore } from '@/stores/map'

/**
 * Leaflet 地图 composable（CRS.Simple 像素坐标系）
 * 封装地图初始化、缩放控制等逻辑
 */
export function useMap(containerRef) {
  const mapStore = useMapStore()
  const map = ref(null)
  const isReady = ref(false)

  onMounted(async () => {
    if (!containerRef.value) return

    // 先加载配置
    await mapStore.loadConfig()

    // 自定义 CRS：scale = 256 / paddedDim，无 y-flip
    // pixelX = scale * 2^z * crsX, pixelY = scale * 2^z * crsY
    const paddedDim = mapStore.paddedDim
    const scale = 256 / paddedDim

    const crs = L.Util.extend({}, L.CRS.Simple, {
      // 覆盖 projection bounds 为实际图片尺寸（而非 LonLat 的 [-180,-90]~[180,90]）
      projection: L.Util.extend({}, L.CRS.Simple.projection, {
        bounds: new L.Bounds([0, 0], [paddedDim, paddedDim]),
      }),
      transformation: new L.Transformation(scale, 0, scale, 0), // 无 y-flip
      infinite: false,
    })

    map.value = L.map(containerRef.value, {
      crs,
      minZoom: 0,
      maxZoom: mapStore.maxZoom + 4,
      zoomSnap: 0, // 允许无级缩放（非整数级别）
      zoomDelta: 0.5, // 按钮每次缩放 0.5 级
      wheelPxPerZoomLevel: 60, // 滚轮缩放灵敏度（值越小越灵敏）
      touchZoom: false, // 禁用内置 touchZoom，用自定义 handler 替代
      bounceAtZoomLimits: false, // 到达缩放极限时不反弹
      zoomControl: false,
      attributionControl: false,
    })

    // 使用 tileLayer 显示手绘地图瓦片
    // 自定义 getTileUrl：翻转 y 坐标以匹配瓦片生成时的 y-flip
    const maxZoom = mapStore.maxZoom + 4
    const tilesPath = mapStore.tilesPath

    const tileLayer = L.tileLayer(`${tilesPath}/{z}/{x}/{y}.png`, {
      minZoom: 0,
      maxZoom,
      maxNativeZoom: mapStore.maxZoom, // 瓦片只生成到 maxZoom，超出级别用 CSS 放大
      noWrap: true,
      tileSize: 256,
    })

    // 覆盖 getTileUrl，翻转 y 坐标
    const originalGetTileUrl = tileLayer.getTileUrl.bind(tileLayer)
    tileLayer.getTileUrl = function (coords) {
      // coords.y 是 Leaflet 计算的 tile y（基于无 y-flip CRS）
      // 需要翻转为瓦片文件中的 y（ty=0 在图片顶部）
      const tilesPerSide = Math.pow(2, coords.z)
      const flippedY = tilesPerSide - 1 - coords.y
      return `${tilesPath}/${coords.z}/${coords.x}/${flippedY}.png`
    }

    tileLayer.addTo(map.value)

    // === 自定义双指缩放：每次张合超过阈值就固定缩放一级 ===
    const mapEl = containerRef.value
    let pinchStartDist = 0
    let pinchDecided = false
    const PINCH_THRESHOLD = 1.15 // 手指张合超过 15% 触发

    function getTouchDist(e) {
      const t = e.touches
      const dx = t[0].clientX - t[1].clientX
      const dy = t[0].clientY - t[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    mapEl.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        pinchStartDist = getTouchDist(e)
        pinchDecided = false
      }
    }, { passive: true })

    mapEl.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 2 || !pinchStartDist || pinchDecided) return
      e.preventDefault()
      const dist = getTouchDist(e)
      const ratio = dist / pinchStartDist
      if (ratio > PINCH_THRESHOLD) {
        pinchDecided = true
        map.value.zoomIn(1, { animate: true })
      } else if (ratio < 1 / PINCH_THRESHOLD) {
        pinchDecided = true
        map.value.zoomOut(1, { animate: true })
      }
    }, { passive: false })

    mapEl.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        pinchStartDist = 0
        pinchDecided = false
      }
    }, { passive: true })

    // 调试信息：监听缩放事件，输出当前缩放级别和瓦片状态
    map.value.on('zoomend', () => {
      const z = map.value.getZoom()
      const tiles = containerRef.value.querySelectorAll('.leaflet-tile')
      const loaded = Array.from(tiles).filter(t => t.complete && t.naturalWidth > 0).length
      const failed = Array.from(tiles).filter(t => t.complete && t.naturalWidth === 0).length
      console.log(`[MapDebug] zoom=${z}, maxZoom=${maxZoom}, maxNativeZoom=${mapStore.maxZoom}, tiles: ${tiles.length} total / ${loaded} loaded / ${failed} failed`)
    })

    // 用 setView 设置初始视图（以实际图片中心为准，而非 pad 正方形中心）
    map.value.setView(
      [mapStore.imgHeight / 2, mapStore.imgWidth / 2],
      mapStore.maxZoom
    )

    isReady.value = true
  })

  /**
   * 缩放地图
   * @param {number} delta - 缩放增量 (+1 或 -1)
   */
  function zoomBy(delta) {
    if (map.value) {
      map.value.setZoom(map.value.getZoom() + delta)
    }
  }

  /**
   * 将视图定位到指定像素坐标
   * @param {[number, number]} latlng - [pixelY, pixelX]
   * @param {number} zoom - 目标缩放级别
   */
  function flyTo(latlng, zoom = 14) {
    if (map.value) {
      map.value.flyTo(latlng, zoom, { duration: 0.8 })
    }
  }

  /**
   * 获取当前地图实例
   */
  function getMap() {
    return map.value
  }

  onUnmounted(() => {
    if (map.value) {
      map.value.remove()
      map.value = null
    }
  })

  return {
    map,
    isReady,
    zoomBy,
    flyTo,
    getMap,
  }
}
