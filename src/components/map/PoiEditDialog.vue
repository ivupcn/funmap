<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ maxHeight: '70vh' }"
    @update:show="$emit('update:show', $event)"
  >
    <div class="poi-edit-dialog">
      <van-cell-group inset title="新增 POI">
        <van-field
          v-model="form.name"
          label="名称"
          placeholder="请输入 POI 名称"
          required
          :rules="[{ required: true, message: '名称不能为空' }]"
        />
        <van-field
          v-model="categoryText"
          is-link
          readonly
          label="分类"
          placeholder="请选择分类"
          required
          @click="showCategoryPicker = true"
        />
        <van-field
          v-model="form.description"
          label="描述"
          type="textarea"
          placeholder="请输入描述（选填）"
          autosize
        />
        <van-field
          v-model="form.address"
          label="地址"
          placeholder="请输入地址（选填）"
        />
        <van-field
          v-model="form.phone"
          label="电话"
          type="tel"
          placeholder="请输入电话（选填）"
        />
        <van-field
          v-model="form.tags"
          label="标签"
          placeholder="多个标签用逗号分隔（选填）"
        />
      </van-cell-group>

      <div class="poi-edit-dialog__actions">
        <van-button block plain type="default" @click="onCancel">取消</van-button>
        <van-button block type="primary" @click="onConfirm">确定</van-button>
      </div>
    </div>

    <!-- 分类选择器 -->
    <van-popup v-model:show="showCategoryPicker" position="bottom" round>
      <van-picker
        :columns="categoryOptions"
        @confirm="onCategoryConfirm"
        @cancel="showCategoryPicker = false"
      />
    </van-popup>
  </van-popup>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { usePoiStore } from '@/stores/poi'

const props = defineProps({
  show: { type: Boolean, default: false },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
})

const emit = defineEmits(['update:show', 'confirm'])

const poiStore = usePoiStore()

const form = reactive({
  name: '',
  category: '',
  description: '',
  address: '',
  phone: '',
  tags: '',
})

const showCategoryPicker = ref(false)

// 分类选项（排除 'all'）
const categoryOptions = computed(() =>
  poiStore.categories
    .filter((c) => c.key !== 'all')
    .map((c) => ({ text: c.label, value: c.key }))
)

// 当前选中分类的显示文本
const categoryText = computed(() => {
  const cat = poiStore.categories.find((c) => c.key === form.category)
  return cat ? cat.label : ''
})

// 弹窗打开时重置表单
watch(
  () => props.show,
  (val) => {
    if (val) {
      form.name = ''
      form.category = ''
      form.description = ''
      form.address = ''
      form.phone = ''
      form.tags = ''
    }
  }
)

function onCategoryConfirm({ selectedOptions }) {
  form.category = selectedOptions[0]?.value || ''
  showCategoryPicker.value = false
}

function onConfirm() {
  if (!form.name.trim()) return

  const tags = form.tags
    ? form.tags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  emit('confirm', {
    id: `poi-${Date.now()}`,
    name: form.name.trim(),
    category: form.category,
    description: form.description.trim(),
    x: props.x,
    y: props.y,
    image: '',
    audioUrl: '',
    audioDuration: 0,
    videoUrl: '',
    vrUrl: '',
    phone: form.phone.trim(),
    address: form.address.trim(),
    openTime: '',
    tags,
  })
}

function onCancel() {
  emit('update:show', false)
}
</script>

<style scoped>
.poi-edit-dialog {
  padding: var(--spacing-md) 0;
  padding-bottom: calc(var(--spacing-md) + env(safe-area-inset-bottom));
}

.poi-edit-dialog__actions {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-lg) 0;
}
</style>
