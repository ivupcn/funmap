import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mapConfig } from '@/data/mock'

export const useMapStore = defineStore('map', () => {
  // 图片尺寸（运行时从图片加载获取）
  const imgWidth = ref(0)
  const imgHeight = ref(0)

  // Pad 后的正方形边长（用于 CRS bounds，保证 Leaflet 瓦片坐标正确）
  const paddedDim = ref(0)

  // CRS.Simple bounds: [[0,0], [paddedDim, paddedDim]]
  const bounds = ref([
    [0, 0],
    [0, 0],
  ])

  // 地图中心（像素坐标）
  const center = ref([0, 0])

  // 缩放级别
  const zoom = ref(0)

  // 上次用户操作的地图状态（用于路由返回时恢复）
  const lastZoom = ref(null)
  const lastCenter = ref(null)

  // 缩放范围
  const minZoom = 0
  const maxZoom = ref(12)
  const initialZoom = ref(0)

  // 瓦片路径
  const tilesPath = ref('/map/tiles')

  // 图片路径
  const imagePath = ref('')

  // 配置是否已加载
  const configLoaded = ref(false)

  /**
   * 加载地图配置和图片尺寸
   * 当前从 mock 数据读取，后续切换为后端 API
   */
  async function loadConfig() {
    try {
      const config = mapConfig

      tilesPath.value = config.tilesPath || '/map/tiles'
      imagePath.value = config.image || '/map/hand-drawn.jpg'

      // 加载图片获取尺寸
      const img = new Image()
      img.src = config.image
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      imgWidth.value = img.naturalWidth
      imgHeight.value = img.naturalHeight

      // Pad 为正方形，保证 Leaflet 瓦片坐标系统正确
      paddedDim.value = Math.max(imgWidth.value, imgHeight.value)

      // CRS bounds: [[0,0], [paddedDim, paddedDim]]
      bounds.value = [
        [0, 0],
        [paddedDim.value, paddedDim.value],
      ]

      center.value = [paddedDim.value / 2, paddedDim.value / 2]

      // 自动计算 maxZoom（基于 pad 后的正方形边长）
      if (config.maxZoom != null) {
        maxZoom.value = config.maxZoom
      } else {
        maxZoom.value = Math.ceil(Math.log2(paddedDim.value / 256))
      }

      // 初始缩放级别（可在 config.json 中配置，默认 = maxZoom - 2）
      initialZoom.value = config.initialZoom ?? Math.max(0, maxZoom.value - 2)

      // 初始 zoom
      zoom.value = initialZoom.value

      configLoaded.value = true
      console.log(`[MapStore] 配置加载完成: ${imgWidth.value}×${imgHeight.value}, paddedDim=${paddedDim.value}, maxZoom=${maxZoom.value}, initialZoom=${initialZoom.value}`)
    } catch (err) {
      console.error('[MapStore] 配置加载失败:', err)
    }
  }

  /**
   * 将百分比坐标转换为 CRS.Simple 像素坐标 [crsY, crsX]
   * @param {number} x - 百分比 X (0-100)
   * @param {number} y - 百分比 Y (0-100，0=顶部，100=底部)
   * @returns {[number, number]} [crsY, crsX]
   */
  function percentToLatLng(x, y) {
    const pixelX = (x / 100) * imgWidth.value
    const pixelY = (y / 100) * imgHeight.value
    return [pixelY, pixelX]
  }

  function pixelToPercent(crsY, crsX) {
    const x = (crsX / imgWidth.value) * 100
    const y = (crsY / imgHeight.value) * 100
    return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 }
  }

  /**
   * 保存当前地图状态（缩放级别 + 中心点）
   */
  function saveMapView(zoomLevel, centerLatLng) {
    lastZoom.value = zoomLevel
    lastCenter.value = centerLatLng
  }

  return {
    imgWidth,
    imgHeight,
    paddedDim,
    bounds,
    center,
    zoom,
    minZoom,
    maxZoom,
    initialZoom,
    lastZoom,
    lastCenter,
    tilesPath,
    imagePath,
    configLoaded,
    loadConfig,
    percentToLatLng,
    pixelToPercent,
    saveMapView,
  }
})
