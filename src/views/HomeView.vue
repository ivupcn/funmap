<template>
  <div class="home-view">
    <!-- 顶部栏：搜索 + 游客计数器 -->
    <header class="home-view__header">
      <SearchBar @click="goSearch" />
      <VisitorCounter :count="425" />
    </header>

    <!-- 地图区域 -->
    <div class="home-view__map-area">
      <LeafletMap
        ref="mapRef"
        :edit-mode="editMode"
        @add-poi="onAddPoi"
      />

      <!-- 缩放 + 编辑控件 -->
      <div class="home-view__controls">
        <MapControls @zoom-in="handleZoomIn" @zoom-out="handleZoomOut" />
        <van-button
          size="small"
          :type="editMode ? 'success' : 'default'"
          @click="toggleEditMode"
        >
          {{ editMode ? '完成' : '编辑' }}
        </van-button>
      </div>
    </div>

    <!-- 语音播放条（全局悬浮） -->
    <AudioPlayer />

    <!-- POI 底部弹窗 -->
    <PoiBottomSheet />

    <!-- POI 编辑弹窗 -->
    <PoiEditDialog
      v-model:show="showEditDialog"
      :x="pendingPoi.x"
      :y="pendingPoi.y"
      @confirm="onEditConfirm"
    />

    <!-- 底部 POI 分类 Tab -->
    <CategoryTabs />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LeafletMap from '@/components/map/LeafletMap.vue'
import MapControls from '@/components/map/MapControls.vue'
import CategoryTabs from '@/components/map/CategoryTabs.vue'
import PoiEditDialog from '@/components/map/PoiEditDialog.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import VisitorCounter from '@/components/common/VisitorCounter.vue'
import PoiBottomSheet from '@/components/common/PoiBottomSheet.vue'
import AudioPlayer from '@/components/common/AudioPlayer.vue'
import { usePoiStore } from '@/stores/poi'

const router = useRouter()
const mapRef = ref(null)
const poiStore = usePoiStore()

// 编辑模式
const editMode = ref(false)
const showEditDialog = ref(false)
const pendingPoi = ref({ x: 0, y: 0 })

// 从 composable 获取缩放方法（通过 mapRef 获取地图实例）
function handleZoomIn() {
  mapRef.value?.getMap()?.zoomIn()
}

function handleZoomOut() {
  mapRef.value?.getMap()?.zoomOut()
}

function goSearch() {
  router.push('/search')
}

function toggleEditMode() {
  editMode.value = !editMode.value
}

function onAddPoi({ x, y }) {
  pendingPoi.value = { x, y }
  showEditDialog.value = true
}

function onEditConfirm(poi) {
  poiStore.addPoi(poi)
  showEditDialog.value = false
}
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.home-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  padding-top: calc(var(--spacing-sm) + env(safe-area-inset-top));
  background: var(--color-white);
  z-index: var(--z-header);
  flex-shrink: 0;
}

.home-view__map-area {
  flex: 1;
  position: relative;
  min-height: 0;
}

.home-view__controls {
  position: absolute;
  right: var(--spacing-lg);
  bottom: var(--spacing-lg);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  align-items: flex-end;
}
</style>
