---
kind: configuration_system
name: 基于 JSON 配置文件的运行时地图配置系统
category: configuration_system
scope:
    - '**'
source_files:
    - public/map/config.json
    - src/stores/map.js
    - src/composables/useMap.js
    - scripts/generate-tiles-leaflet.js
    - vite.config.js
---

## 1. 使用的系统与方式

本项目没有使用传统的环境变量（`.env`、`process.env`）或构建期配置框架，而是采用**静态 JSON 配置文件 + 运行时 fetch 加载**的方式管理地图运行参数。核心思路是：将地图相关的可配置项集中放在 `public/map/config.json`，前端在应用启动时通过 HTTP 请求动态读取该文件，再据此初始化 Leaflet 地图实例与瓦片路径。

## 2. 关键文件

- `public/map/config.json`：唯一的运行时配置源，声明图片路径、瓦片目录和最大缩放级别。
- `src/stores/map.js`：Pinia store，负责 `fetch('/map/config.json')` 加载配置、解析图片尺寸、计算 paddedDim / bounds / maxZoom，并暴露给组件使用。
- `src/composables/useMap.js`：地图 composable，在 `onMounted` 中先调用 `mapStore.loadConfig()`，再基于 store 中的配置创建 Leaflet 实例、tileLayer 和自定义 CRS。
- `scripts/generate-tiles-leaflet.js`：Node 脚本，同样读取 `public/map/config.json` 来生成瓦片金字塔，确保“生成端”和“运行端”对同一份配置保持一致。
- `vite.config.js`：仅包含 Vite 插件、别名 `@` → `./src`、开发服务器 host 等构建期配置；无环境变量注入。
- `index.html`：入口 HTML，无内联配置。

## 3. 架构与设计约定

### 配置结构
`public/map/config.json` 的字段约定如下：
- `image`：手绘地图源图路径（相对于项目根，如 `/map/hand-drawn.jpg`），用于设置背景图和计算初始视图中心。
- `tilesPath`：瓦片目录路径（如 `/map/tiles`），用于构造 `{z}/{x}/{y}.png` 瓦片 URL。
- `maxZoom`：可选。若提供则直接作为最大缩放级；若为 `null`/未提供，则按 `Math.ceil(Math.log2(paddedDim / 256))` 自动推导，使每片瓦片约 256px。

### 加载时序
1. 页面加载 → `main.js` 挂载 Vue 应用。
2. 地图组件 mounted → `useMap` 调用 `mapStore.loadConfig()`。
3. `loadConfig` 发起 `fetch('/map/config.json')`，解析 JSON，加载图片获取 `naturalWidth/naturalHeight`，计算 `paddedDim = Math.max(imgW, imgH)`，设置 `bounds = [[0,0],[paddedDim,paddedDim]]`，并初始化 `center`、`zoom`、`configLoaded`。
4. 随后用这些值创建 Leaflet 实例、自定义 CRS.Simple（覆盖 projection bounds 与 transformation）、tileLayer（带 y-flip 的 `getTileUrl` 覆盖）。

### 生成端与运行端共享配置
`scripts/generate-tiles-leaflet.js` 在构建/预处理阶段读取同一份 `config.json`，依据相同的 `image`、`tilesPath`、`maxZoom` 逻辑生成瓦片金字塔，保证服务端渲染路径与客户端请求路径一致。

### 无环境变量
代码库中不存在 `.env`、`.env.*`、`import.meta.env`、`process.env` 或 `VITE_` 前缀变量的任何引用。所有可配置项均通过 JSON 文件传递，部署时只需替换 `public/map/config.json` 即可切换地图资源。

## 4. 约定与约束

- **单一配置源**：地图相关的所有外部路径与行为开关集中在 `public/map/config.json`，禁止在组件或 store 中硬编码 `/map/tiles`、`/map/hand-drawn.jpg` 等路径。
- **JSON 字段契约**：`image`、`tilesPath` 为必填字符串；`maxZoom` 可为数字或 `null`。store 中对缺失字段提供了默认值（如 `tilesPath || '/map/tiles'`、`image || '/map/hand-drawn.jpg'`），但新增字段应在两端同步处理。
- **瓦片命名规范**：瓦片必须遵循 `{tilesPath}/{z}/{x}/{y}.png` 的目录结构，且 y 轴需做翻转（`ty = tilesPerSide - 1 - coords.y`），由生成脚本与前端 `getTileUrl` 共同保证。
- **CRS 一致性**：前端使用自定义 `L.CRS.Simple`，projection bounds 设为 `[0,0]~[paddedDim,paddedDim]`，transformation scale = `256/paddedDim`，且 `infinite: false`；这与生成脚本的 pad 正方形策略严格对应。
- **错误处理**：`loadConfig` 捕获 fetch/json 异常并 `console.error`，同时保持 `configLoaded` 为 `false`，调用方应据此判断地图是否就绪。
- **扩展性约束**：由于当前没有 schema 校验，新增配置字段需在 `stores/map.js`、`scripts/generate-tiles-leaflet.js` 两处同步更新，否则会出现生成端与运行端不一致的问题。