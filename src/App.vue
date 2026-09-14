<template>
  <router-view />
</template>

<style>
/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior: none;
}

#app {
  width: 100%;
  height: 100%;
}

/* Leaflet 标记自定义样式 */
.poi-marker {
  background: transparent !important;
  border: none !important;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.poi-marker__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.poi-marker__label {
  margin-top: 2px;
  font-size: 14px;
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 8px;
  border-radius: 8px;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-weight: 500;
}
</style>
