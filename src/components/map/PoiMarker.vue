<template>
  <div class="poi-marker-dot" :style="{ borderColor: color }">
    <span class="poi-marker-dot__inner" :style="{ background: color }"></span>
  </div>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: '#1989fa',
  },
})
</script>

<style scoped>
.poi-marker-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.poi-marker-dot__inner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
</style>
