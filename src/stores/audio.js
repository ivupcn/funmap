import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAudioStore = defineStore('audio', () => {
  // 当前播放的 POI ID
  const currentPoiId = ref(null)

  // 播放状态
  const isPlaying = ref(false)

  // 当前播放进度（秒）
  const currentTime = ref(0)

  // 总时长（秒）
  const duration = ref(0)

  // Audio 实例引用
  let audioInstance = null

  /**
   * 播放指定 POI 的语音
   * @param {string} poiId
   * @param {string} url - 音频 URL
   */
  function play(poiId, url) {
    // 如果已经在播放同一个，暂停
    if (currentPoiId.value === poiId && isPlaying.value) {
      pause()
      return
    }

    // 切换到新的音频
    if (audioInstance) {
      audioInstance.pause()
      audioInstance = null
    }

    audioInstance = new Audio(url)
    currentPoiId.value = poiId
    isPlaying.value = true

    audioInstance.addEventListener('timeupdate', () => {
      currentTime.value = audioInstance.currentTime
    })

    audioInstance.addEventListener('loadedmetadata', () => {
      duration.value = audioInstance.duration
    })

    audioInstance.addEventListener('ended', () => {
      isPlaying.value = false
      currentTime.value = 0
    })

    audioInstance.play().catch(() => {
      isPlaying.value = false
    })
  }

  function pause() {
    if (audioInstance) {
      audioInstance.pause()
      isPlaying.value = false
    }
  }

  function resume() {
    if (audioInstance) {
      audioInstance.play().catch(() => {
        isPlaying.value = false
      })
      isPlaying.value = true
    }
  }

  function stop() {
    if (audioInstance) {
      audioInstance.pause()
      audioInstance.currentTime = 0
      audioInstance = null
    }
    currentPoiId.value = null
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
  }

  /**
   * 跳转到指定时间
   * @param {number} time - 秒
   */
  function seek(time) {
    if (audioInstance) {
      audioInstance.currentTime = time
      currentTime.value = time
    }
  }

  return {
    currentPoiId,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    resume,
    stop,
    seek,
  }
})
