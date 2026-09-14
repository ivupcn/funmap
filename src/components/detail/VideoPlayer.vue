<template>
  <div class="video-player">
    <video
      v-if="videoUrl"
      ref="videoRef"
      :src="videoUrl"
      :poster="poster"
      class="video-player__video"
      controls
      playsinline
      webkit-playsinline
      preload="metadata"
    >
      您的浏览器不支持视频播放
    </video>
    <div v-else class="video-player__placeholder">
      <van-icon name="video-o" size="48" color="#ccc" />
      <span>暂无视频</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  videoUrl: {
    type: String,
    default: '',
  },
  poster: {
    type: String,
    default: '',
  },
})

const videoRef = ref(null)
</script>

<style scoped>
.video-player {
  width: 100%;
  background: #000;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.video-player__video {
  width: 100%;
  display: block;
  max-height: 240px;
}

.video-player__placeholder {
  width: 100%;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: 13px;
  background: var(--color-bg);
}
</style>
