<template>
  <div class="category-tabs">
    <div
      v-for="cat in poiStore.categories"
      :key="cat.key"
      class="category-tabs__item"
      :class="{ 'category-tabs__item--active': poiStore.activeCategory === cat.key }"
      @click="poiStore.setCategory(cat.key)"
    >
      <van-icon :name="cat.icon" class="category-tabs__icon" />
      <span class="category-tabs__label">{{ cat.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { usePoiStore } from '@/stores/poi'

const poiStore = usePoiStore()
</script>

<style scoped>
.category-tabs {
  display: flex;
  background: var(--color-white);
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-sm) 0;
  padding-bottom: calc(var(--spacing-sm) + env(safe-area-inset-bottom));
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.category-tabs__item {
  flex: 1;
  min-width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  transition: color 0.2s;
  color: var(--color-text-secondary);
}

.category-tabs__item--active {
  color: var(--color-primary);
}

.category-tabs__icon {
  font-size: 20px;
}

.category-tabs__label {
  font-size: 11px;
  white-space: nowrap;
}
</style>
