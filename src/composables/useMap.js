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

    // === 自定义双指缩放（解决 Leaflet Drag 拦截问题）===
    // 问题：Leaflet Drag handler 在 document 上注册 touchmove（bubble phase），
    //       会调用 preventDefault() 阻止我们的容器 listener 收到事件。
    // 解决：使用 capture phase 监听器，它在 bubble phase 之前触发，优先级更高。
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

    // capture phase：优先于 document 上的 bubble phase listener
    mapEl.addEventListener('touchstart', (e) => {
      console.log('[PinchDebug] touchstart, touches:', e.touches.length)
      if (e.touches.length === 2) {
        pinchStartDist = getTouchDist(e)
        pinchDecided = false
        console.log('[PinchDebug] 2-finger detected, startDist:', pinchStartDist.toFixed(1))
        // 禁用 drag 防止它拦截 pinch 手势
        map.value.dragging.disable()
      }
    }, { passive: true, capture: true })

    mapEl.addEventListener('touchmove', (e) => {
      console.log('[PinchDebug] touchmove, touches:', e.touches.length, 'pinchStartDist:', pinchStartDist, 'decided:', pinchDecided)
      if (e.touches.length !== 2 || !pinchStartDist || pinchDecided) return
      e.preventDefault() // 阻止 Leaflet Drag 处理
      const dist = getTouchDist(e)
      const ratio = dist / pinchStartDist
      console.log('[PinchDebug] dist:', dist.toFixed(1), 'ratio:', ratio.toFixed(3))
      if (ratio > PINCH_THRESHOLD) {
        pinchDecided = true
        console.log('[PinchDebug] zoomIn!')
        map.value.zoomIn(1, { animate: true })
      } else if (ratio < 1 / PINCH_THRESHOLD) {
        pinchDecided = true
        console.log('[PinchDebug] zoomOut!')
        map.value.zoomOut(1, { animate: true })
      }
    }, { passive: false, capture: true })

    mapEl.addEventListener('touchend', (e) => {
      console.log('[PinchDebug] touchend, touches:', e.touches.length)
      if (e.touches.length < 2) {
        pinchStartDist = 0
        pinchDecided = false
        // 恢复 drag
        map.value.dragging.enable()
      }
    }, { passive: true, capture: true })

    // 调试信息：监听缩放事件，输出当前缩放级别和瓦片状态
    map.value.on('zoomend', () => {
      const z = map.value.getZoom()
      const tiles = containerRef.value.querySelectorAll('.leaflet-tile')
      const loaded = Array.from(tiles).filter(t => t.complete && t.naturalWidth > 0).length
      const failed = Array.from(tiles).filter(t => t.complete && t.naturalWidth === 0).length
      console.log(`[MapDebug] zoom=${z}, maxZoom=${maxZoom}, maxNativeZoom=${mapStore.maxZoom}, tiles: ${tiles.length} total / ${loaded} loaded / ${failed} failed`)
    })

    // 恢复上次地图状态（路由返回时），否则使用默认初始视图
    if (mapStore.lastZoom != null && mapStore.lastCenter != null) {
      map.value.setView(mapStore.lastCenter, mapStore.lastZoom)
      console.log(`[MapDebug] 恢复上次视图: zoom=${mapStore.lastZoom}, center=${mapStore.lastCenter}`)
    } else {
      map.value.setView(
        [mapStore.imgHeight / 2, mapStore.imgWidth / 2],
        mapStore.initialZoom
      )
    }

    // 监听用户操作，实时保存地图状态
    map.value.on('moveend zoomend', () => {
      mapStore.saveMapView(map.value.getZoom(), map.value.getCenter())
    })

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
