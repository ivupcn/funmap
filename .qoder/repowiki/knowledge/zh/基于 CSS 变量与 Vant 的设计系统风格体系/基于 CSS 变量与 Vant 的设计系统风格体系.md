---
kind: frontend_style
name: 基于 CSS 变量与 Vant 的设计系统风格体系
category: frontend_style
scope:
    - '**'
source_files:
    - src/styles/variables.css
    - src/main.js
    - vite.config.js
    - src/App.vue
---

## 1. 使用的系统与工具

- **CSS 原生变量（CSS Custom Properties）**：所有设计令牌集中定义在 `src/styles/variables.css`，通过 `:root` 声明全局变量，组件内直接使用 `var(--xxx)` 引用。
- **Vant 4**：移动端 UI 组件库，样式通过 `import 'vant/lib/index.css'` 在 `src/main.js` 中全局引入；配合 `unplugin-vue-components` + `@vant/auto-import-resolver` 实现按需自动导入，无需手动注册组件。
- **Leaflet**：地图引擎，其默认样式通过 `import 'leaflet/dist/leaflet.css'` 引入，并在 `App.vue` 中以全局 `<style>` 覆盖标记点样式（`.poi-marker`、`.poi-marker__dot`、`.poi-marker__label`）。
- **Vite**：构建工具，无 SCSS/Less 预处理，纯 CSS 工作流。

## 2. 核心文件

- `src/styles/variables.css`：唯一的设计令牌源，包含主题色、功能色、POI 分类色、中性色、间距、圆角、阴影、z-index 层级等全部视觉变量。
- `src/main.js`：统一引入 Vant 样式、Leaflet 样式和全局变量。
- `vite.config.js`：配置 `unplugin-auto-import` 与 `unplugin-vue-components`，解析器为 `VantResolver`，实现 Vant 组件的零配置使用。
- `src/App.vue`：全局重置样式（box-sizing、字体栈、滚动行为）以及 Leaflet 标记点的覆盖样式。

## 3. 架构与约定

### 设计令牌分层
`variables.css` 将视觉规范分为清晰的命名空间：
- 主题色：`--color-primary / -light / -dark`
- 功能色：`--color-success / -warning / -danger`
- POI 分类色：`--color-scenic / -food / -hotel / -shopping / -toilet / -parking / -service`（直接对应业务分类）
- 中性色：`--color-text / -secondary / -bg / -white / -border`
- 间距：`--spacing-xs/sm/md/lg/xl`（4px → 24px 步进）
- 圆角：`--radius-sm/md/lg/round`
- 阴影：`--shadow-sm/md/lg`
- z-index 层级：`--z-map / -overlay / -header / -bottom-sheet / -popup`（数值化层级管理）

### 组件样式组织
- 每个 `.vue` 组件均使用 `<style scoped>` 隔离样式，避免全局污染。
- 组件内部通过 `var(--xxx)` 引用设计令牌，不出现硬编码颜色或尺寸值。
- 仅 `App.vue` 拥有全局 `<style>`，用于 reset 和第三方库（Leaflet）覆盖。

### 响应式策略
- 采用移动端优先：`html/body` 设置 `width: 100%; height: 100%`，并禁用 `overscroll-behavior`。
- 使用 `env(safe-area-inset-bottom)` 适配刘海屏底部安全区域（见 `PoiBottomSheet.vue`）。
- 未使用媒体查询断点，依赖弹性布局与百分比尺寸适应不同屏幕。

### 主题扩展机制
由于所有颜色、间距、圆角、阴影均以 CSS 变量形式暴露，切换主题只需替换 `:root` 下的变量值即可，无需修改组件代码。当前定义了完整的白天主题色板，具备暗色模式扩展能力。

## 4. 约定与约束

- **禁止硬编码视觉值**：组件样式中应使用 `var(--color-*)`、`var(--spacing-*)`、`var(--radius-*)`、`var(--shadow-*)`，而非直接写十六进制颜色或像素值。
- **统一引入顺序**：入口 `main.js` 按「Vant 样式 → Leaflet 样式 → 自定义变量」顺序引入，确保自定义变量可覆盖第三方库默认值。
- **z-index 必须使用变量**：层级通过 `--z-*` 变量统一管理，避免随意使用数字导致层叠冲突。
- **组件样式作用域**：所有组件样式必须写在 `<style scoped>` 中，全局样式仅限 `App.vue` 的 reset 与第三方覆盖。
- **Vant 组件按需使用**：通过自动导入插件使用 Vant 组件，无需手动 import 单个组件，但需保留 `import 'vant/lib/index.css'` 以加载基础样式。
- **Leaflet 标记定制**：通过 `.poi-marker` 系列类名覆盖默认图标样式，保持手绘地图风格一致性。

## 5. 适用性说明

该仓库是一个前端 Vue 单页应用，具备完整的前端样式体系（设计令牌、组件级样式、第三方库样式集成），因此本类别完全适用。