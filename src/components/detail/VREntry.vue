<template>
  <div class="vr-entry" @click="handleClick">
    <div class="vr-entry__icon">
      <van-icon name="video-o" size="32" />
    </div>
    <div class="vr-entry__info">
      <span class="vr-entry__title">VR 全景</span>
      <span class="vr-entry__desc">沉浸式 360° 全景体验</span>
    </div>
    <van-icon name="arrow" class="vr-entry__arrow" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  poiId: {
    type: [String, Number],
    default: '',
  },
  poiName: {
    type: String,
    default: '',
  },
})

function handleClick() {
  router.push({
    path: '/panorama',
    query: {
      poiId: props.poiId,
      poiName: props.poiName,
    },
  })
}
</script>

<style scoped>
.vr-entry {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-lg);
  margin: var(--spacing-lg);
  cursor: pointer;
  color: white;
}

.vr-entry:active {
  opacity: 0.9;
}

.vr-entry__icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vr-entry__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vr-entry__title {
  font-size: 16px;
  font-weight: 600;
}

.vr-entry__desc {
  font-size: 12px;
  opacity: 0.8;
}

.vr-entry__arrow {
  opacity: 0.6;
}
</style>
