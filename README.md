# FunMap UI — 全域旅游智慧导览

基于手绘地图的移动端旅游导览应用，以青海大柴旦区域为原型，提供地图浏览、POI 标注、全景查看、语音讲解等功能。

## 功能特性

### 地图系统
- **手绘地图瓦片渲染**：基于 Leaflet CRS.Simple 自定义像素坐标系，将手绘地图切割为瓦片金字塔，支持多级缩放
- **POI 标记**：按分类（景点/美食/住宿/购物/卫生间/停车场/游客服务）展示彩色标记，文字自适应宽度
- **分类筛选**：底部 Tab 切换 POI 分类，地图标记实时响应
- **编辑模式**：点击地图空白处添加自定义 POI，填写表单后即时标注（会话级，不持久化）
- **无级缩放**：滚轮/按钮支持平滑缩放，不跳级

### POI 详情
- 点击标记弹出底部详情面板，展示名称、描述、地址、开放时间、标签等
- 支持语音讲解播放（全局悬浮播放器）
- 支持视频播放
- 支持 360° 全景查看

### 全景查看
- 基于 `@photo-sphere-viewer/core` 的等距柱状投影全景图片查看器
- 触摸拖拽旋转视角 + 双指缩放 + 惯性滑动
- 全屏模式支持
- 支持通过 URL query 传入 POI ID 加载对应全景图

### 搜索
- 按名称、描述、标签关键词搜索 POI

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.5 | 框架（Composition API + `<script setup>`） |
| Vite | ^8.2 | 构建工具 |
| Pinia | ^4.0 | 状态管理 |
| Vue Router | ^4.6 | 路由 |
| Leaflet | ^1.9 | 地图引擎 |
| Vant | ^4.10 | 移动端 UI 组件库 |
| @photo-sphere-viewer/core | latest | 360° 全景查看器 |
| sharp | ^0.35 | 瓦片图片处理（开发脚本） |

## 项目结构

```
FunMapUI/
├── public/
│   ├── map/                    # 地图资源
│   │   ├── config.json         # 地图配置（图片路径、瓦片路径、maxZoom）
│   │   ├── hand-drawn.jpg      # 手绘地图原图
│   │   └── tiles/              # 瓦片金字塔（z/x/y.png）
│   ├── panorama/               # 全景图片
│   │   └── demo.jpg            # 示例全景图（4096×2048 等距柱状投影）
│   ├── icons.svg               # SVG 图标集
│   └── favicon.svg
├── src/
│   ├── composables/            # 组合式函数
│   │   ├── useMap.js           # 地图初始化、缩放、CRS 配置
│   │   ├── useAudio.js         # 语音播放逻辑
│   │   └── useGeolocation.js   # 地理定位
│   ├── components/
│   │   ├── common/             # 通用组件
│   │   │   ├── AudioPlayer.vue     # 全局悬浮语音播放器
│   │   │   ├── PoiBottomSheet.vue  # POI 底部详情弹窗
│   │   │   ├── SearchBar.vue       # 搜索栏
│   │   │   └── VisitorCounter.vue  # 访客计数器
│   │   ├── detail/             # 详情页组件
│   │   │   ├── ActionButtons.vue   # 底部操作按钮
│   │   │   ├── PoiInfo.vue         # POI 信息展示
│   │   │   ├── VREntry.vue         # VR 全景入口
│   │   │   ── VideoPlayer.vue     # 视频播放器
│   │   └── map/                # 地图组件
│   │       ├── CategoryTabs.vue    # 分类标签栏
│   │       ├── LeafletMap.vue      # Leaflet 地图主体
│   │       ├── MapControls.vue     # 缩放/编辑控件
│   │       ├── PoiEditDialog.vue   # POI 编辑弹窗
│   │       └── PoiMarker.vue       # POI 标记点
│   ├── data/
│   │   └── mock.js             # Mock POI 数据（18 个 POI）
│   ├── router/
│   │   └── index.js            # 路由配置
│   ├── stores/
│   │   ├── map.js              # 地图状态（图片尺寸、CRS bounds、坐标转换）
│   │   ├── poi.js              # POI 数据（分类、筛选、搜索）
│   │   └── audio.js            # 音频播放状态
│   ├── styles/
│   │   └── variables.css       # CSS 变量（主题色、间距、圆角、层级）
│   ├── views/
│   │   ├── HomeView.vue        # 首页（地图主界面）
│   │   ├── PoiDetailView.vue   # POI 详情页
│   │   ├── SearchView.vue      # 搜索页
│   │   └── PanoramaView.vue    # 全景查看页
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口
├── scripts/
│   └── generate-tiles-leaflet.js  # 瓦片生成脚本
├── package.json
├── vite.config.js
└── README.md
```

## 路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | HomeView | 地图主页（POI 标记 + 分类筛选 + 搜索） |
| `/poi/:id` | PoiDetailView | POI 详情（信息 + VR + 视频 + 语音） |
| `/search` | SearchView | POI 搜索 |
| `/panorama?poiId=&poiName=` | PanoramaView | 360° 全景查看 |

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173`

### 生成瓦片

```bash
node scripts/generate-tiles-leaflet.js
```

脚本读取 `public/map/config.json` 配置，自动：
1. 加载手绘地图原图
2. Pad 为正方形（`max(width, height)`）
3. 按瓦片金字塔（z=0 ~ maxZoom）切割为 256×256 PNG
4. 输出到 `public/map/tiles/`

### 替换全景图

将 Insta360 输出的 2:1 等距柱状投影图片放入 `public/panorama/`，然后在 `PanoramaView.vue` 的 `PANORAMA_MAP` 中添加映射：

```js
const PANORAMA_MAP = {
  aikanquan: '/panorama/aikanquan.jpg',
  feicuihu: '/panorama/feicuihu.jpg',
  default: '/panorama/demo.jpg',
}
```

## 架构说明

### 瓦片坐标系统

使用 Leaflet `CRS.Simple` 自定义像素坐标系：

```
scale = 256 / paddedDim
transformation: (scale, 0, scale, 0)  // 无 y-flip
projection.bounds: [0,0] → [paddedDim, paddedDim]
infinite: false
```

瓦片 y 坐标在 `getTileUrl` 中翻转以匹配文件存储约定（ty=0 在图片顶部）。`maxNativeZoom` 限制瓦片请求级别，超出级别由 Leaflet CSS 放大。

### 状态管理

- **map store**：管理地图配置、图片尺寸、CRS bounds、坐标转换（百分比 ↔ 像素）
- **poi store**：管理 POI 数据、分类筛选、搜索、选中状态
- **audio store**：管理语音播放状态（当前 POI、播放/暂停）

### 数据流

```
mock.js → poi store → LeafletMap（标记渲染）
                      → PoiBottomSheet（详情展示）
                      → PoiDetailView（完整详情）
```

## 浏览器支持

- Chrome / Safari / Firefox 最新版
- iOS Safari 14+
- Android Chrome 90+
