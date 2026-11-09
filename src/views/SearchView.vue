<template>
  <div class="search-view">
    <!-- 搜索栏 -->
    <van-nav-bar :border="false" fixed placeholder>
      <template #left>
        <van-icon name="arrow-left" size="20" @click="router.back()" />
      </template>
      <template #title>
        <div class="search-view__input-wrap">
          <van-icon name="search" />
          <input
            ref="inputRef"
            v-model="keyword"
            class="search-view__input"
            type="search"
            placeholder="搜索景点、美食、住宿..."
            @input="handleSearch"
          />
          <van-icon v-if="keyword" name="clear" class="search-view__clear" @click="clearSearch" />
        </div>
      </template>
    </van-nav-bar>

    <!-- 搜索结果 -->
    <div class="search-view__results">
      <!-- 默认状态 -->
      <div v-if="!keyword" class="search-view__empty">
        <van-icon name="search" size="48" color="#ddd" />
        <p>输入关键词搜索</p>
      </div>

      <!-- 无结果 -->
      <div v-else-if="!results.length" class="search-view__empty">
        <van-icon name="warning-o" size="48" color="#ddd" />
        <p>未找到相关结果</p>
      </div>

      <!-- 结果列表 -->
      <div v-else class="search-view__list">
        <div
          v-for="poi in results"
          :key="poi.id"
          class="search-view__item"
          @click="goDetail(poi)"
        >
          <div class="search-view__item-icon" :style="{ background: getCategoryColor(poi.category) }">
            <van-icon :name="getCategoryIcon(poi.category)" color="white" size="14" />
          </div>
          <div class="search-view__item-info">
            <h4 class="search-view__item-name">{{ poi.name }}</h4>
            <p class="search-view__item-desc">{{ poi.description }}</p>
            <div v-if="poi.tags?.length" class="search-view__item-tags">
              <van-tag v-for="tag in poi.tags.slice(0, 2)" :key="tag" plain size="medium">
                {{ tag }}
              </van-tag>
            </div>
          </div>
          <van-icon name="arrow" class="search-view__item-arrow" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePoiStore } from '@/stores/poi'

const router = useRouter()
const poiStore = usePoiStore()

const inputRef = ref(null)
const keyword = ref('')
const results = ref([])

onMounted(() => {
  inputRef.value?.focus()
})

function handleSearch() {
  results.value = poiStore.searchPois(keyword.value)
}

function clearSearch() {
  keyword.value = ''
  results.value = []
}

function goDetail(poi) {
  router.push(`/poi/${poi.id}`)
}

function getCategoryColor(category) {
  return poiStore.categories.find((c) => c.key === category)?.color || '#1989fa'
}

function getCategoryIcon(category) {
  return poiStore.categories.find((c) => c.key === category)?.icon || 'flag-o'
}
</script>

<style scoped>
.search-view {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--color-bg);
}

.search-view__input-wrap {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--color-bg);
  border-radius: var(--radius-round);
  padding: var(--spacing-xs) var(--spacing-md);
  flex: 1;
  min-width: 0; /* 防止 flex 子项溢出 */
}

/* 覆盖 Vant NavBar title 的 van-ellipsis 裁剪 */
.search-view :deep(.van-nav-bar__title) {
  overflow: visible;
  max-width: none;
}

.search-view__input {
  flex: 1;
  min-width: 0; /* flex 子项必须设 min-width:0 才能正确收缩 */
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
  color: var(--color-text);
}

/* 隐藏浏览器原生 search 清除按钮，使用自定义 van-icon */
.search-view__input::-webkit-search-cancel-button {
  display: none;
}

.search-view__input::placeholder {
  color: var(--color-text-secondary);
}

.search-view__clear {
  color: var(--color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
}

.search-view__results {
  padding: var(--spacing-lg);
}

.search-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: 60px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.search-view__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.search-view__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}

.search-view__item:active {
  background: var(--color-bg);
}

.search-view__item-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.search-view__item-info {
  flex: 1;
  min-width: 0;
}

.search-view__item-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  margin: 0 0 2px;
}

.search-view__item-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-view__item-tags {
  display: flex;
  gap: var(--spacing-xs);
}

.search-view__item-arrow {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
</style>
