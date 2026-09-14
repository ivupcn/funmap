<template>
  <div class="search-bar" @click="$emit('click')">
    <van-icon name="search" class="search-bar__icon" />
    <span class="search-bar__placeholder">{{ placeholder }}</span>
  </div>
</template>

<script setup>
defineProps({
  placeholder: {
    type: String,
    default: '搜索景点、美食、住宿...',
  },
})

defineEmits(['click'])
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--color-white);
  border-radius: var(--radius-round);
  padding: var(--spacing-sm) var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  flex: 1;
  max-width: 280px;
  height: 36px;
}

.search-bar__icon {
  color: var(--color-text-secondary);
  font-size: 16px;
}

.search-bar__placeholder {
  color: var(--color-text-secondary);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
