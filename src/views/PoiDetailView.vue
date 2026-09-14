<template>
  <div class="poi-detail-view">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="详情"
      left-arrow
      @click-left="router.back()"
      :border="false"
      fixed
      placeholder
    />

    <!-- 可滚动内容 -->
    <div class="poi-detail-view__content">
      <!-- POI 基本信息 -->
      <PoiInfo v-if="poi" :poi="poi" />

      <!-- VR 全景入口 -->
      <VREntry v-if="poi" :poi-id="poi.id" :poi-name="poi.name" />

      <!-- 视频播放 -->
      <div v-if="poi?.videoUrl" class="poi-detail-view__section">
        <h3 class="poi-detail-view__section-title">视频介绍</h3>
        <VideoPlayer :video-url="poi.videoUrl" />
      </div>

      <!-- 语音讲解 -->
      <div v-if="poi?.audioUrl" class="poi-detail-view__section">
        <h3 class="poi-detail-view__section-title">语音讲解</h3>
        <div class="poi-detail-view__audio-card" @click="handlePlayAudio">
          <van-icon
            :name="isPlaying ? 'pause-circle' : 'play-circle'"
            size="36"
            color="var(--color-primary)"
          />
          <div class="poi-detail-view__audio-info">
            <span>{{ isPlaying ? '正在播放...' : '点击播放语音讲解' }}</span>
            <span class="poi-detail-view__audio-duration">
              {{ formatDuration(poi.audioDuration) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <ActionButtons v-if="poi" :poi="poi" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePoiStore } from '@/stores/poi'
import { useAudio } from '@/composables/useAudio'
import PoiInfo from '@/components/detail/PoiInfo.vue'
import VREntry from '@/components/detail/VREntry.vue'
import VideoPlayer from '@/components/detail/VideoPlayer.vue'
import ActionButtons from '@/components/detail/ActionButtons.vue'

const route = useRoute()
const router = useRouter()
const poiStore = usePoiStore()
const { audioStore, playPoiAudio, formatTime } = useAudio()

const poi = computed(() => poiStore.getPoiById(route.params.id))

const isPlaying = computed(
  () => audioStore.isPlaying && audioStore.currentPoiId === poi.value?.id
)

function handlePlayAudio() {
  if (!poi.value) return
  playPoiAudio(poi.value)
}

function formatDuration(seconds) {
  return formatTime(seconds)
}
</script>

<style scoped>
.poi-detail-view {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-white);
}

.poi-detail-view__content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.poi-detail-view__section {
  padding: var(--spacing-lg);
  padding-top: 0;
}

.poi-detail-view__section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--spacing-md);
}

.poi-detail-view__audio-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.poi-detail-view__audio-card:active {
  background: var(--color-border);
}

.poi-detail-view__audio-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
  color: var(--color-text);
}

.poi-detail-view__audio-duration {
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>
