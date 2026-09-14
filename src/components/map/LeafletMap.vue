<template>
  <div ref="mapContainer" class="leaflet-map"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import L from 'leaflet'
import { useMap } from '@/composables/useMap'
import { usePoiStore } from '@/stores/poi'
import { useMapStore } from '@/stores/map'

const props = defineProps({
  editMode: { type: Boolean, default: false },
})

const emit = defineEmits(['add-poi'])

const mapContainer = ref(null)
const { map, isReady, getMap } = useMap(mapContainer)
const poiStore = usePoiStore()
const mapStore = useMapStore()

// 存储地图上的 marker 实例
const markers = ref([])

// 地图就绪后，初始化标记
onMounted(() => {
  // isReady 变为 true 后由 watch 处理
})

// 监听过滤后的 POI 变化，更新地图标记
watch(
  () => poiStore.filteredPois,
  (pois) => {
    if (!isReady.value) return
    updateMarkers(pois)
  },
  { immediate: true }
)

// 等待地图就绪
watch(isReady, (ready) => {
  if (ready) {
    updateMarkers(poiStore.filteredPois)
  }
})

/**
 * 测量文字宽度（用于自适应标记容器）
 */
function measureTextWidth(text, font) {
  const canvas = measureTextWidth._canvas || (measureTextWidth._canvas = document.createElement('canvas'))
  const ctx = canvas.getContext('2d')
  ctx.font = font
  return Math.ceil(ctx.measureText(text).width)
}

/**
 * 更新地图上的 POI 标记
 */
function updateMarkers(pois) {
  // 清除旧标记
  markers.value.forEach((m) => m.remove())
  markers.value = []

  if (!map.value) return

  pois.forEach((poi) => {
    // 百分比 → 像素坐标 [pixelY, pixelX]
    const [pixelY, pixelX] = mapStore.percentToLatLng(poi.x, poi.y)

    // 根据文字长度自适应容器宽度
    const labelWidth = measureTextWidth(poi.name, '500 14px -apple-system, sans-serif')
    const containerWidth = Math.max(labelWidth + 16, 20) // 左右各 8px padding
    const containerHeight = 36

    // 创建自定义 HTML 标记
    const icon = L.divIcon({
      className: 'poi-marker',
      html: `<div class="poi-marker__dot" style="background:${getCategoryColor(poi.category)}"></div>
             <div class="poi-marker__label">${poi.name}</div>`,
      iconSize: [containerWidth, containerHeight],
      iconAnchor: [containerWidth / 2, 18],
    })

    const marker = L.marker([pixelY, pixelX], { icon }).addTo(map.value)

    marker.on('click', (e) => {
      e.originalEvent.stopPropagation()
      poiStore.selectPoi(poi)
    })

    markers.value.push(marker)
  })
}

/**
 * 获取分类对应的颜色
 */
function getCategoryColor(category) {
  const cat = poiStore.categories.find((c) => c.key === category)
  return cat ? cat.color : '#1989fa'
}

/**
 * 地图点击处理（编辑模式下添加 POI）
 */
function onMapClick(e) {
  if (!props.editMode) return

  // CRS.Simple: e.latlng 为像素坐标 [pixelY, pixelX]
  const { lat: pixelY, lng: pixelX } = e.latlng
  const { x, y } = mapStore.pixelToPercent(pixelY, pixelX)

  emit('add-poi', { x, y })
}

// 监听编辑模式切换，绑定/解绑地图点击
watch(
  () => props.editMode,
  (mode) => {
    if (!isReady.value || !map.value) return
    if (mode) {
      map.value.on('click', onMapClick)
    } else {
      map.value.off('click', onMapClick)
    }
  }
)

// 暴露方法供父组件调用
defineExpose({ getMap })
</script>

<style scoped>
.leaflet-map {
  width: 100%;
  height: 100%;
}
</style>
