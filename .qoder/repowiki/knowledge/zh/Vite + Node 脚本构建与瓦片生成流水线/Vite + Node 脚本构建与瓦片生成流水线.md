---
kind: build_system
name: Vite + Node 脚本构建与瓦片生成流水线
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.js
    - scripts/generate-tiles-leaflet.js
---

## 1. 构建系统与工具链

该项目采用 **Vite 8** 作为前端构建工具，配合 **Vue 3** 单文件组件。构建入口由 `package.json` 中的 npm scripts 定义：
- `npm run dev` → 启动 Vite 开发服务器（监听 `0.0.0.0`，便于容器/局域网访问）
- `npm run build` → 执行 `vite build` 生产构建
- `npm run preview` → 本地预览构建产物

无 Makefile、Dockerfile、CI 配置文件（如 `.github/workflows`），也没有自定义的 `build.sh` / `deploy.sh` 等 shell 脚本。项目是纯前端 SPA，构建产物为静态资源。

## 2. 关键构建文件

- `package.json`：声明依赖与脚本命令，版本固定于 `0.0.0`（私有包，无发布流程）。
- `vite.config.js`：核心构建配置，启用以下插件与特性：
  - `@vitejs/plugin-vue`：Vue SFC 支持
  - `unplugin-auto-import` + `unplugin-vue-components` + `@vant/auto-import-resolver`：自动导入 Vue API 与 Vant 组件，无需手动 import
  - `resolve.alias`：将 `@` 映射到 `./src`，统一模块路径
  - `server.host: '0.0.0.0'`：开发服务器绑定所有网卡
- `scripts/generate-tiles-leaflet.js`：Node 脚本，使用 `sharp` 将手绘地图图片按 Leaflet 标准瓦片金字塔（CRS.Simple + y-flip）切割为 PNG 瓦片，输出至 `public/map/tiles/{z}/{x}/{y}.png`。通过读取 `public/map/config.json` 驱动源图路径、输出目录和最大缩放级别。

## 3. 架构与约定

- **构建产物**：Vite 默认输出到 `dist/`（未显式配置 `build.outDir`），包含 HTML、JS、CSS 及 `public/` 下的静态资源（含瓦片图）。
- **资源组织**：地图瓦片不在源码中，而是通过运行 `node scripts/generate-tiles-leaflet.js` 预先生成后随 `public/` 一起部署。脚本会先 `rmSync` 清理旧瓦片目录再重建。
- **依赖策略**：仅使用 `package.json` 管理依赖，无 lock 文件外的锁定机制；`type: "module"` 启用 ESM，脚本与配置均使用 ES 模块语法。
- **无后端/跨编译**：项目不涉及多语言交叉编译、二进制打包或容器化，因此没有 Dockerfile、Makefile 或多阶段构建。

## 4. 约定与约束

- 开发/构建命令必须通过 `npm run dev|build|preview` 调用，不直接执行 `vite` CLI（遵循 npm scripts 约定）。
- 新增 Vant 组件无需手动 import，需确保组件位于 `src/components/` 下以被 `unplugin-vue-components` 自动发现。
- 地图瓦片生成必须基于 `public/map/config.json` 配置，且输出目录结构严格遵循 `{z}/{x}/{y}.png` 的 Leaflet 标准格式，y 轴遵循 CRS.Simple 的翻转约定（ty=0 对应图像底部）。
- 仓库不包含 CI/CD、Docker 或发布脚本，因此不存在自动化测试、制品上传或版本发布的强制流程。