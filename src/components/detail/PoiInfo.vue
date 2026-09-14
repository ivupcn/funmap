<template>
  <div v-if="poi" class="poi-info">
    <!-- 封面图 -->
    <div class="poi-info__cover">
      <img
        v-if="poi.image"
        :src="poi.image"
        :alt="poi.name"
        class="poi-info__image"
      />
      <div v-else class="poi-info__placeholder">
        <van-icon name="photo-o" size="48" color="#ccc" />
        <span>暂无图片</span>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="poi-info__content">
      <h1 class="poi-info__name">{{ poi.name }}</h1>

      <!-- 标签 -->
      <div v-if="poi.tags?.length" class="poi-info__tags">
        <van-tag v-for="tag in poi.tags" :key="tag" type="primary" plain>
          {{ tag }}
        </van-tag>
      </div>

      <!-- 描述 -->
      <p class="poi-info__desc">{{ poi.description }}</p>

      <!-- 信息列表 -->
      <div class="poi-info__meta">
        <div v-if="poi.address" class="poi-info__meta-item">
          <van-icon name="location-o" />
          <span>{{ poi.address }}</span>
        </div>
        <div v-if="poi.openTime" class="poi-info__meta-item">
          <van-icon name="clock-o" />
          <span>{{ poi.openTime }}</span>
        </div>
        <div v-if="poi.phone" class="poi-info__meta-item">
          <van-icon name="phone-o" />
          <span>{{ poi.phone }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  poi: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.poi-info__cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--color-bg);
}

.poi-info__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poi-info__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: 13px;
}

.poi-info__content {
  padding: var(--spacing-lg);
}

.poi-info__name {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--spacing-sm);
}

.poi-info__tags {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-md);
}

.poi-info__desc {
  font-size: 14px;
  line-height: 1.8;
  color: var(--color-text);
  margin: 0 0 var(--spacing-lg);
}

.poi-info__meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.poi-info__meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 13px;
  color: var(--color-text-secondary);
}

.poi-info__meta-item .van-icon {
  color: var(--color-primary);
}
</style>
