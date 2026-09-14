<template>
  <div v-if="currentPoi" class="audio-player">
    <!-- 播放信息 -->
    <div class="audio-player__info">
      <van-icon :name="isPlaying ? 'pause-circle' : 'play-circle'" class="audio-player__toggle" @click="togglePlayback" />
      <div class="audio-player__text">
        <span class="audio-player__title">{{ currentPoi.name }}</span>
        <span class="audio-player__time">
          {{ formatTime(audioStore.currentTime) }} / {{ formatTime(audioStore.duration) }}
        </span>
      </div>
    </div>

    <!-- 进度条 -->
    <van-slider
      :model-value="progress"
      :max="100"
      bar-height="2px"
      active-color="var(--color-primary)"
      @change="handleSeek"
    />

    <!-- 关闭按钮 -->
    <van-icon name="cross" class="audio-player__close" @click="audioStore.stop()" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAudio } from '@/composables/useAudio'

const { audioStore, togglePlayback, getCurrentPoi, formatTime } = useAudio()

const currentPoi = computed(() => getCurrentPoi())
const isPlaying = computed(() => audioStore.isPlaying)

const progress = computed(() => {
  if (!audioStore.duration) return 0
  return (audioStore.currentTime / audioStore.duration) * 100
})

function handleSeek(value) {
  const time = (value / 100) * audioStore.duration
  audioStore.seek(time)
}
</script>

<style scoped>
.audio-player {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.audio-player__info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.audio-player__toggle {
  font-size: 28px;
  color: var(--color-primary);
  cursor: pointer;
  flex-shrink: 0;
}

.audio-player__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.audio-player__title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audio-player__time {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.audio-player :deep(.van-slider) {
  flex: 1;
}

.audio-player__close {
  font-size: 16px;
  color: var(--color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  padding: 4px;
}
</style>
