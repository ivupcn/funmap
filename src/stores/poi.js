import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockPois } from '@/data/mock'

export const usePoiStore = defineStore('poi', () => {
  // POI 分类定义
  const categories = ref([
    { key: 'all', label: '全部', icon: 'apps-o', color: '#1989fa' },
    { key: 'scenic', label: '讲解', icon: 'flag-o', color: '#1989fa' },
    { key: 'food', label: '美食', icon: 'fire-o', color: '#ff976a' },
    { key: 'hotel', label: '住宿', icon: 'hotel-o', color: '#07c160' },
    { key: 'shopping', label: '购物', icon: 'shopping-cart-o', color: '#f44336' },
    { key: 'toilet', label: '卫生间', icon: 'underway-o', color: '#9c27b0' },
    { key: 'parking', label: '停车场', icon: 'logistics', color: '#607d8b' },
    { key: 'service', label: '游客服务', icon: 'service-o', color: '#ff5722' },
  ])

  // 全部 POI 数据
  const pois = ref(mockPois)

  // 当前选中的分类 Tab
  const activeCategory = ref('all')

  // 当前选中的 POI（点击标记后）
  const selectedPoi = ref(null)

  // 根据当前分类过滤 POI 列表
  const filteredPois = computed(() => {
    if (activeCategory.value === 'all') return pois.value
    return pois.value.filter((p) => p.category === activeCategory.value)
  })

  // 根据 ID 获取 POI
  function getPoiById(id) {
    return pois.value.find((p) => p.id === id)
  }

  // 设置当前分类
  function setCategory(key) {
    activeCategory.value = key
  }

  // 选中 POI
  function selectPoi(poi) {
    selectedPoi.value = poi
  }

  // 清除选中
  function clearSelection() {
    selectedPoi.value = null
  }

  // 搜索 POI
  function searchPois(keyword) {
    if (!keyword) return []
    const kw = keyword.toLowerCase()
    return pois.value.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        p.description.toLowerCase().includes(kw) ||
        p.tags?.some((t) => t.toLowerCase().includes(kw))
    )
  }

  // 添加新 POI（仅内存）
  function addPoi(poi) {
    pois.value.push(poi)
  }

  return {
    categories,
    pois,
    activeCategory,
    selectedPoi,
    filteredPois,
    getPoiById,
    setCategory,
    selectPoi,
    clearSelection,
    searchPois,
    addPoi,
  }
})
