---
kind: dependency_management
name: 基于 npm + Vite 的前端依赖管理
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - vite.config.js
---

## 1. 使用的系统与工具

本项目采用 **npm** 作为包管理器，配合 **Vite 8** 作为构建与开发服务器。依赖声明集中在根目录的 `package.json` 中，通过同级的 `package-lock.json` 锁定精确版本，确保多环境安装一致性。

- 运行时依赖（`dependencies`）：Vue 3、Vue Router、Pinia、Leaflet、Vant 组件库、Photo Sphere Viewer、自动导入插件等。
- 构建期依赖（`devDependencies`）：`vite`、`@vitejs/plugin-vue`、`sharp`（用于图片处理）。
- 项目类型：`"type": "module"`，使用 ESM 模块语法。

## 2. 关键文件

- `package.json`：唯一依赖清单，定义脚本命令 `dev` / `build` / `preview`。
- `package-lock.json`：npm 生成的锁文件，固定所有传递依赖的精确版本。
- `vite.config.js`：Vite 配置入口，集中注册 Vue 插件、自动导入（AutoImport）、组件按需解析（Components + VantResolver），并配置 `@` 路径别名指向 `src/`。
- `.gitignore`：应忽略 `node_modules/` 与 `dist/`（若存在）。

## 3. 架构与约定

- **单一来源声明**：所有第三方依赖仅通过 `package.json` 的 `dependencies` / `devDependencies` 声明，无 `vendor/` 或手动拷贝的第三方源码。
- **语义化版本范围**：依赖统一使用 `^` 前缀（如 `vue: ^3.5.41`、`leaflet: ^1.9.4`），允许主版本内的小版本升级，同时由 `package-lock.json` 锁定实际安装版本。
- **构建时依赖隔离**：Vite 及其插件、Sharp 等仅在 `devDependencies` 中声明，不进入生产产物。
- **按需引入策略**：通过 `unplugin-auto-import` 与 `unplugin-vue-components` + `@vant/auto-import-resolver` 实现 Vant 组件与 API 的自动导入，减少显式 import 语句，降低打包体积。
- **路径别名**：在 `vite.config.js` 中通过 `resolve.alias` 将 `@` 映射到 `./src`，统一模块引用方式。

## 4. 约定与约束

- **禁止直接修改 `package-lock.json`**：应通过 `npm install` / `npm update` 让 npm 生成锁文件，以保证跨机器一致。
- **新增依赖需区分运行/构建依赖**：仅运行时需要的库放入 `dependencies`；仅构建期使用的插件放入 `devDependencies`。
- **不使用私有 npm 仓库或 registry 覆盖**：当前未配置 `.npmrc`、`.yarnrc` 或 Vite `resolve.alias` 之外的私有源，所有包均来自默认 npm registry。
- **无 vendoring**：项目中不存在 `vendor/`、`lib/` 等手动维护的第三方代码副本，全部通过 npm 管理。
- **脚本约定**：开发、构建、预览分别通过 `npm run dev`、`npm run build`、`npm run preview` 执行，遵循 Vite 标准工作流。

## 5. 相关资源

- 地图瓦片数据以静态资源形式存放在 `public/map/tiles/`，不属于 npm 依赖，由 `scripts/generate-tiles-leaflet.js` 生成后直接发布。
- 全景图资源位于 `public/panorama/`，同样作为静态资源随构建输出。