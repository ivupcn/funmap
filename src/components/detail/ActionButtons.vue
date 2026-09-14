<template>
  <div class="action-buttons">
    <!-- 路线导航 -->
    <button class="action-buttons__btn action-buttons__btn--primary" @click="handleNavigate">
      <van-icon name="guide-o" size="20" />
      <span>路线导航</span>
    </button>

    <!-- 电话拨打 -->
    <button
      v-if="poi?.phone"
      class="action-buttons__btn action-buttons__btn--secondary"
      @click="handleCall"
    >
      <van-icon name="phone-o" size="20" />
      <span>电话咨询</span>
    </button>
  </div>
</template>

<script setup>
import { showToast } from 'vant'

const props = defineProps({
  poi: {
    type: Object,
    required: true,
  },
})

function handleNavigate() {
  showToast('手绘地图模式下暂不支持路线导航')
}

function handleCall() {
  if (props.poi.phone) {
    window.location.href = `tel:${props.poi.phone}`
  }
}
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

.action-buttons__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--radius-round);
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}

.action-buttons__btn:active {
  opacity: 0.8;
}

.action-buttons__btn--primary {
  background: var(--color-primary);
  color: white;
}

.action-buttons__btn--secondary {
  background: var(--color-white);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
</style>
