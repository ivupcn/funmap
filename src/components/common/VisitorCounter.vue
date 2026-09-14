<template>
  <div class="visitor-counter">
    <van-icon name="friends-o" class="visitor-counter__icon" />
    <span class="visitor-counter__text">第 <strong>{{ displayCount }}</strong> 位访客</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  count: {
    type: Number,
    default: 425,
  },
})

const displayCount = ref(0)

// 数字递增动画
onMounted(() => {
  const target = props.count
  const duration = 1500
  const step = Math.ceil(target / (duration / 16))
  const timer = setInterval(() => {
    displayCount.value = Math.min(displayCount.value + step, target)
    if (displayCount.value >= target) {
      clearInterval(timer)
    }
  }, 16)
})
</script>

<style scoped>
.visitor-counter {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-round);
  padding: 4px 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(4px);
}

.visitor-counter__icon {
  font-size: 14px;
  color: var(--color-primary);
}

.visitor-counter__text strong {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
