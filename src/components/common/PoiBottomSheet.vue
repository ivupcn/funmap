<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    round
    :style="{ maxHeight: '45vh' }"
    @close="handleClose"
  >
    <div v-if="poi" class="poi-bottom-sheet">
      <!-- 拖拽指示条 -->
      <div class="poi-bottom-sheet__handle"></div>

      <!-- POI 基本信息 -->
      <div class="poi-bottom-sheet__header" @click="goDetail">
        <div class="poi-bottom-sheet__info">
          <h3 class="poi-bottom-sheet__name">{{ poi.name }}</h3>
          <p class="poi-bottom-sheet__desc">{{ poi.description }}</p>
          <div v-if="poi.tags?.length" class="poi-bottom-sheet__tags">
            <van-tag
              v-for="tag in poi.tags.slice(0, 3)"
              :key="tag"
              type="primary"
              plain
              size="medium"
            >
              {{ tag }}
            </van-tag>
          </div>
        </div>
        <van-icon name="arrow" class="poi-bottom-sheet__arrow" />
      </div>

      <!-- 快捷操作 -->
      <div class="poi-bottom-sheet__actions">
        <button
          v-if="poi.audioUrl"
          class="poi-bottom-sheet__action-btn"
          @click.stop="handlePlayAudio"
        >
          <van-icon :name="isPlaying ? 'pause-circle-o' : 'play-circle-o'" />
          <span>{{ isPlaying ? '暂停' : '语音讲解' }}</span>
        </button>
        <button class="poi-bottom-sheet__action-btn" @click.stop="handleNavigate">
          <van-icon name="guide-o" />
          <span>导航</span>
        </button>
        <button v-if="poi.phone" class="poi-bottom-sheet__action-btn" @click.stop="handleCall">
          <van-icon name="phone-o" />
          <span>电话</span>
        </button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePoiStore } from '@/stores/poi'
import { useAudio } from '@/composables/useAudio'
import { useGeolocation } from '@/composables/useGeolocation'
import { useMapStore } from '@/stores/map'

const router = useRouter()
const poiStore = usePoiStore()
const mapStore = useMapStore()
const { audioStore, playPoiAudio } = useAudio()
const { openNavigation, callPhone } = useGeolocation()

const poi = computed(() => poiStore.selectedPoi)
const visible = computed({
  get: () => !!poiStore.selectedPoi,
  set: () => poiStore.clearSelection(),
})
const isPlaying = computed(
  () => audioStore.isPlaying && audioStore.currentPoiId === poi.value?.id
)

function handleClose() {
  poiStore.clearSelection()
}

function goDetail() {
  if (!poi.value) return
  router.push(`/poi/${poi.value.id}`)
}

function handlePlayAudio() {
  if (!poi.value) return
  playPoiAudio(poi.value)
}

function handleNavigate() {
  if (!poi.value) return
  const [lat, lng] = mapStore.percentToLatLng(poi.value.x, poi.value.y)
  openNavigation([lat, lng], poi.value.name)
}

function handleCall() {
  if (!poi.value?.phone) return
  callPhone(poi.value.phone)
}
</script>

<style scoped>
.poi-bottom-sheet {
  padding: var(--spacing-md) var(--spacing-lg);
  padding-bottom: calc(var(--spacing-lg) + env(safe-area-inset-bottom));
}

.poi-bottom-sheet__handle {
  width: 32px;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  margin: 0 auto var(--spacing-md);
}

.poi-bottom-sheet__header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.poi-bottom-sheet__info {
  flex: 1;
}

.poi-bottom-sheet__name {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--spacing-xs);
}

.poi-bottom-sheet__desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-sm);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.poi-bottom-sheet__tags {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.poi-bottom-sheet__arrow {
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.poi-bottom-sheet__actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.poi-bottom-sheet__action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--spacing-sm);
  background: var(--color-bg);
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-primary);
  font-size: 12px;
  cursor: pointer;
}

.poi-bottom-sheet__action-btn:active {
  background: var(--color-border);
}

.poi-bottom-sheet__action-btn .van-icon {
  font-size: 20px;
}
</style>
