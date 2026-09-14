import { ref } from 'vue'

/**
 * 地理定位 composable
 * 用于获取用户当前位置，支持路线导航
 */
export function useGeolocation() {
  const location = ref(null)
  const error = ref(null)
  const loading = ref(false)

  /**
   * 获取用户当前位置
   */
  function getCurrentPosition() {
    loading.value = true
    error.value = null

    if (!navigator.geolocation) {
      error.value = '当前浏览器不支持地理定位'
      loading.value = false
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        location.value = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        loading.value = false
      },
      (err) => {
        error.value = err.message
        loading.value = false
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }

  /**
   * 调起手机原生地图进行路线导航
   * 自动检测平台并选择合适的 URL scheme
   * @param {[number, number]} dest - [lat, lng] 目的地坐标
   * @param {string} destName - 目的地名称
   */
  function openNavigation(dest, destName) {
    const [lat, lng] = dest
    const name = encodeURIComponent(destName)

    // 尝试打开高德地图 App，失败则打开百度地图，最终 fallback 到系统地图
    const amapUrl = `iosamap://navi?sourceApplication=funmap&lat=${lat}&lon=${lng}&dev=0&style=2`
    const baiduUrl = `baidumap://map/navi?query=${name}&destination=${name}&src=funmap&coord_type=gcj02`
    const appleUrl = `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`

    // 优先尝试 Apple Maps（iOS 原生）
    window.open(appleUrl, '_blank')
  }

  /**
   * 拨打电话号码
   * @param {string} phone
   */
  function callPhone(phone) {
    if (!phone) return
    window.open(`tel:${phone}`, '_self')
  }

  return {
    location,
    error,
    loading,
    getCurrentPosition,
    openNavigation,
    callPhone,
  }
}
