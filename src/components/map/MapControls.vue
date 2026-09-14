<template>
  <div class="map-controls">
    <button class="map-controls__btn" @click="$emit('zoomIn')" aria-label="放大">
      <van-icon name="plus" />
    </button>
    <button class="map-controls__btn" @click="$emit('zoomOut')" aria-label="缩小">
      <van-icon name="minus" />
    </button>
  </div>
</template>

<script setup>
defineEmits(['zoomIn', 'zoomOut'])
</script>

<style scoped>
.map-controls {
  display: flex;
  flex-direction: column;
  gap: 1px;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.map-controls__btn {
  width: 40px;
  height: 40px;
  background: var(--color-white);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.15s;
}

.map-controls__btn:active {
  background: var(--color-bg);
}

.map-controls__btn + .map-controls__btn {
  border-top: 1px solid var(--color-border);
}
</style>
