---
kind: error_handling
name: 前端错误处理：基于 ref 状态与 console.error 的轻量级策略
category: error_handling
scope:
    - '**'
source_files:
    - src/composables/useGeolocation.js
    - src/stores/map.js
    - src/stores/audio.js
    - src/router/index.js
    - src/main.js
---

## 1. 整体方案

该仓库是一个基于 Vite + Vue3 + Pinia + Leaflet 的前端单页应用，**没有引入统一的错误处理框架、全局异常捕获或自定义 Error 类型**。错误处理以“局部消化 + 降级展示”为主，遵循以下约定：
- 异步/网络错误通过 `try...catch` 包裹后记录到 `console.error`；
- 浏览器 API（如 Geolocation、Audio）的错误通过回调参数或 `.catch()` 捕获，并写入组件/Pinia 的 `ref` 状态，由 UI 层渲染提示；
- 路由层未注册全局错误守卫；
- 未使用 `throw` 抛出业务错误对象，也未定义统一错误码枚举。

## 2. 关键文件与位置

| 文件 | 职责 | 错误处理方式 |
|---|---|---|
| `src/composables/useGeolocation.js` | 地理定位 composable | 将错误信息写入 `error` ref（字符串），调用方读取并展示；对不支持 geolocation 的情况直接返回用户可读消息 |
| `src/stores/map.js` | 地图配置加载 Pinia store | `loadConfig` 用 `try...catch` 包裹 `fetch` 和图片加载，失败时 `console.error('[MapStore] 配置加载失败:', err)` |
| `src/stores/audio.js` | 语音播放 Pinia store | `audio.play()` 返回 Promise，使用 `.catch(() => { isPlaying.value = false })` 静默吞掉自动播放被阻止的错误，仅重置播放态 |
| `src/router/index.js` | Vue Router 路由表 | 未挂载任何 `router.onError` / `beforeEach` 中的错误处理逻辑 |
| `src/main.js` | 应用入口 | 无全局 `window.onerror` / `unhandledrejection` 监听 |

## 3. 架构与约定

### 3.1 错误状态上抛给视图
`useGeolocation` 是典型模式：内部维护 `error`、`loading` 两个 `ref`，在获取位置失败时将 `err.message` 赋值给 `error.value`，调用方（如 POI 详情或地图界面）通过响应式绑定显示错误文案。这是一种 **UI 驱动的错误传播**——错误不通过返回值或异常传递，而是作为可观察状态暴露。

### 3.2 Store 层吞错 + 日志
`map.js` 的 `loadConfig` 在 `catch` 分支中只打印 `console.error`，不向上抛出，也不设置业务错误标志位（除了已有的 `configLoaded` 默认 `false`）。这意味着配置加载失败时，地图会保持初始空状态，同时控制台可见错误。

### 3.3 浏览器 API 错误的静默降级
`audio.js` 中 `play().catch(...)` 和 `resume()` 中对自动播放失败的捕获都是“静默降级”：仅把 `isPlaying` 重置为 `false`，不向用户抛出错误提示。这是移动端 Web Audio 自动播放限制的常见处理方式。

### 3.4 无全局错误边界
Vue 应用未使用 `app.config.errorHandler`，也没有在 `main.js` 中注册 `window.addEventListener('error' | 'unhandledrejection', ...)`。因此运行时 JavaScript 错误不会集中上报或统一展示。

## 4. 约束与规则（从代码中归纳）

- **composable 错误通过 ref 暴露**：`useGeolocation` 将错误信息存入 `error` ref，而非 throw —— 这是本仓库 composables 的错误约定。
- **Pinia store 的异步副作用必须 try/catch**：`map.js` 的 `loadConfig` 展示了 store 内网络请求的标准写法：包裹 try/catch，失败时写日志但不中断后续逻辑。
- **浏览器 API 错误优先降级而非中断**：音频播放失败仅重置状态，不阻断业务流程。
- **未定义统一错误类型/错误码**：仓库中没有 `errors/` 目录、错误枚举或自定义 Error 子类；错误以原生 DOMException / TypeError 等对象形式存在。
- **路由层无错误拦截**：`router/index.js` 仅声明路由表，未添加 `router.onError` 或全局导航守卫中的错误处理。

## 5. 缺失部分（当前未实现）

- 无全局未捕获异常处理器（`window.onerror` / `unhandledrejection`）；
- 无统一的业务错误类或错误码体系；
- 无 Axios 拦截器或 fetch 封装的统一错误处理；
- 无 Sentry / 其他错误上报集成；
- 无 Vue 全局 `errorHandler` 用于组件渲染期错误收集。

综上，该仓库的错误处理属于**轻量级、分散式**风格：每个模块自行处理自身可能出现的错误，通过 ref 状态传递给 UI，或通过 `console.error` 记录，没有跨模块共享的错误抽象。