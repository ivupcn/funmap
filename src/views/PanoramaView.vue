<template>
  <div class="panorama-view">
    <!-- 顶部导航栏 -->
    <div class="panorama-view__nav">
      <button class="panorama-view__back" @click="goBack">
        <van-icon name="arrow-left" size="20" />
        <span>返回</span>
      </button>
      <span class="panorama-view__title">{{ title }}</span>
      <div class="panorama-view__placeholder"></div>
    </div>

    <!-- 全景容器 -->
    <div ref="viewerRef" class="panorama-view__viewer"></div>

    <!-- 底部提示 -->
    <div v-if="showHint" class="panorama-view__hint">
      <van-icon name="scan" size="16" />
      <span>滑动屏幕旋转视角，双指缩放</span>
      <van-icon name="cross" size="14" class="panorama-view__hint-close" @click="showHint = false" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Viewer } from '@photo-sphere-viewer/core'
import '@photo-sphere-viewer/core/index.css'

const route = useRoute()
const router = useRouter()

const viewerRef = ref(null)
const title = ref('VR 全景')
const showHint = ref(true)

let viewer = null

// 全景图片映射：POI ID → 图片路径（后续替换为真实全景图）
const PANORAMA_MAP = {
  // 示例：所有 POI 都指向 demo 全景图
  default: '/panorama/demo.jpg',
}

function getPanoramaUrl() {
  const poiId = route.query.poiId
  if (poiId && PANORAMA_MAP[poiId]) {
    return PANORAMA_MAP[poiId]
  }
  return PANORAMA_MAP.default
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

onMounted(() => {
  const poiName = route.query.poiName
  if (poiName) {
    title.value = poiName
  }

  const url = getPanoramaUrl()

  viewer = new Viewer({
    container: viewerRef.value,
    panorama: url,
    defaultZoomLvl: 0,
    fisheye: false,
    navbar: 'zoom fullscreen',
    touchmoveTwoFingers: false, // 单指即可旋转
    mousewheel: true,
    mousewheelCtrlKey: false,
    moveInertia: true, // 惯性滑动
    minFov: 30,
    maxFov: 90,
    lang: {
      twoFingers: '请用双指滑动旋转视角',
    },
  })

  // 5 秒后自动隐藏操作提示
  setTimeout(() => {
    showHint.value = false
  }, 5000)
})

onUnmounted(() => {
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
})
</script>

<style scoped>
.panorama-view {
  position: fixed;
  inset: 0;
  background: #000;
  display: flex;
  flex-direction: column;
  z-index: 9999;
}

.panorama-view__nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
}

.panorama-view__back {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 14px;
  cursor: pointer;
  backdrop-filter: blur(4px);
}

.panorama-view__back:active {
  background: rgba(255, 255, 255, 0.25);
}

.panorama-view__title {
  color: white;
  font-size: 16px;
  font-weight: 500;
}

.panorama-view__placeholder {
  width: 60px; /* 占位，保持标题居中 */
}

.panorama-view__viewer {
  flex: 1;
  width: 100%;
}

.panorama-view__hint {
  position: absolute;
  bottom: calc(20px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  white-space: nowrap;
  animation: fadeInUp 0.3s ease;
}

.panorama-view__hint-close {
  cursor: pointer;
  opacity: 0.6;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
