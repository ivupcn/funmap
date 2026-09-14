import { useAudioStore } from '@/stores/audio'
import { usePoiStore } from '@/stores/poi'

/**
 * 语音播放 composable
 * 封装语音播放的便捷方法
 */
export function useAudio() {
  const audioStore = useAudioStore()
  const poiStore = usePoiStore()

  /**
   * 播放指定 POI 的语音讲解
   * @param {object} poi - POI 数据对象
   */
  function playPoiAudio(poi) {
    if (!poi.audioUrl) return
    audioStore.play(poi.id, poi.audioUrl)
  }

  /**
   * 切换播放/暂停
   */
  function togglePlayback() {
    if (audioStore.isPlaying) {
      audioStore.pause()
    } else {
      audioStore.resume()
    }
  }

  /**
   * 获取当前正在播放的 POI 数据
   */
  function getCurrentPoi() {
    if (!audioStore.currentPoiId) return null
    return poiStore.getPoiById(audioStore.currentPoiId)
  }

  /**
   * 格式化时间为 mm:ss
   * @param {number} seconds
   */
  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return {
    audioStore,
    playPoiAudio,
    togglePlayback,
    getCurrentPoi,
    formatTime,
  }
}
