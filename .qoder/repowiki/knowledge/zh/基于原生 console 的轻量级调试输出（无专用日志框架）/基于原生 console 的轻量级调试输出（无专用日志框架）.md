---
kind: logging_system
name: 基于原生 console 的轻量级调试输出（无专用日志框架）
category: logging_system
scope:
    - '**'
source_files:
    - src/main.js
    - src/stores/map.js
    - src/composables/useMap.js
    - scripts/generate-tiles-leaflet.js
    - package.json
---

## 1. 使用的系统/方案

本仓库**没有引入任何第三方日志库或统一的 logger 模块**。所有运行时输出均直接使用浏览器原生的 `console.log` / `console.error`，以及 Node 侧脚本中的 `console.log` / `console.error`。未定义任何 log level、结构化字段、sink 或集中式配置。

- 依赖清单 (`package.json`) 中不存在如 `winston`、`pino`、`loglevel`、`bunyan`、`debug` 等日志相关包。
- 应用入口 `src/main.js` 仅初始化 Vue、Pinia、Router 与样式，无任何全局日志拦截或覆写。

## 2. 关键文件与位置

| 文件 | 用途 |
|---|---|
| `src/stores/map.js` | 地图状态 store，使用 `console.log` 打印配置加载结果，用 `console.error` 捕获配置加载失败 |
| `src/composables/useMap.js` | 地图组合式函数，在瓦片加载回调中使用带 `[MapDebug]` 前缀的 `console.log` 输出缩放级别与瓦片计数 |
| `scripts/generate-tiles-leaflet.js` | 构建期脚本，使用大量带 emoji 的 `console.log` 输出瓦片生成进度，并用 `console.error` 输出失败信息 |

## 3. 架构与约定

- **无中心化日志层**：每个模块自行调用 `console.*`，不存在统一导出或注入的 logger。
- **调试前缀约定**：前端调试日志通过方括号前缀区分来源，例如 `[MapDebug]`、`[MapStore]`，便于在浏览器控制台过滤。
- **错误输出**：异常路径统一使用 `console.error`，成功/进度信息使用 `console.log`。
- **构建期 vs 运行期**：`scripts/` 下的 Node 脚本用于离线生成瓦片，其日志面向终端；`src/` 下代码的日志面向浏览器控制台，两者互不共享。

## 4. 约定与约束

- **无强制规范**：仓库未提供 ESLint 规则禁止 `console.*`、也未提供自定义 logger 接口，因此新增日志时完全自由——当前模式即为“直接调用 `console.log/console.error`”。
- **可观察到的约定**（非强制，但已贯穿现有代码）：
  - 调试日志以 `[模块名]` 形式作为字符串前缀，方便控制台过滤。
  - 错误信息统一走 `console.error`。
  - 构建脚本使用 emoji 前缀增强可读性（如 `📷`、`✅`、`❌`），属于风格偏好而非约束。
- **生产环境**：由于未做任何 `process.env.NODE_ENV` 判断或构建期剔除，`console.log` 会随源码一起打包到产物中，无内置开关机制。

综上，该仓库的“日志系统”本质上是**零配置的浏览器 `console.*` 直出**，辅以简单的 `[Tag]` 前缀约定来区分来源，不具备结构化字段、分级控制、远程上报或 sink 路由能力。