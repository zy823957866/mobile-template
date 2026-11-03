# 07 — 样式与原子化 CSS 规范

> 基于 UnoCSS + unocss-preset-weapp 方案，参考 Tailwind CSS 最佳实践、TDesign / NutUI 设计规范，结合微信小程序 WXSS 限制制定。

## 技术选型

- **原子化 CSS**：UnoCSS v0.66
- **小程序适配**：unocss-preset-weapp（处理 rpx 转换、小程序不兼容的选择器）
- **CSS 预处理器**：SCSS（sass）
- **样式校验**：Stylelint

## 为什么用原子化 CSS

1. **双端一致**：同一套类名在 H5（rem 自适应）和小程序（rpx）生效，由 preset 自动转换。
2. **零样式文件膨胀**：不需要写大量 scoped 样式文件。
3. **设计系统一致**：统一间距、颜色、字号等设计 token。
4. **体积可控**：按需生成，用多少生成多少。

## 主题配置（unocss.config.ts）

```ts
export default {
  presets: [presetWeapp()],
  transformers: [transformerClass()],
  theme: {
    // 品牌色
    colors: {
      brand: "#1677ff", // 示例主色
      "brand-light": "#E8F3FF", // 主色浅
      "brand-dark": "#0958D9", // 主色深
      ink: "#1A1A1A", // 正文
      sub: "#6B6B6B", // 次级文本
      "sub-light": "#999999", // 辅助文本
      line: "#EBEBEB", // 分割线
      bg: "#F5F6F7", // 页面背景
      success: "#00B578",
      warning: "#FF8A00",
      danger: "#F53F3F",
      info: "#3491FA",
    },
    // 间距（默认 4px 基准，rpx 自动处理）
    spacing: {
      xs: "8rpx",
      sm: "16rpx",
      md: "24rpx",
      lg: "32rpx",
      xl: "48rpx",
    },
    // 字号
    fontSize: {
      xs: ["20rpx", "28rpx"],
      sm: ["24rpx", "36rpx"],
      base: ["28rpx", "40rpx"],
      lg: ["32rpx", "48rpx"],
      xl: ["36rpx", "52rpx"],
      "2xl": ["44rpx", "64rpx"],
    },
    // 圆角
    borderRadius: {
      sm: "8rpx",
      md: "12rpx",
      lg: "16rpx",
      full: "9999rpx",
    },
  },
  // 安全列表：动态拼接的类名必须预声明
  safelist: [
    // 动态状态色
    ...["draft", "published", "archived"].map((s) => `text-${s}`),
  ],
}
```

> **注意**：以上主题值为占位示例，实际值以设计 Token 和设计稿为准。

## 颜色使用规范

| 层级     | 用途                     | 色值 token                | 示例                 |
| -------- | ------------------------ | ------------------------- | -------------------- |
| 主色     | 主按钮、选中态、强调文字 | `text-brand` / `bg-brand` | CTA 按钮             |
| 正文     | 主要文字、标题           | `text-ink`                | 页面标题、列表主文本 |
| 次级文字 | 说明文字、辅助信息       | `text-sub`                | 列表副文本、时间戳   |
| 辅助文字 | 次要信息、占位符         | `text-sub-light`          | 输入框 placeholder   |
| 分割线   | 边框、分割线             | `border-line` / `bg-line` | 列表分割线           |
| 页面背景 | 页面底色                 | `bg-bg`                   | 页面背景             |
| 卡片背景 | 卡片、内容区             | `bg-white`                | 列表项背景           |

## 间距系统

统一使用 8rpx 基准的间距刻度：

| 类名          | 实际值（rpx） | 用途                       |
| ------------- | ------------- | -------------------------- |
| `p-1` / `m-1` | 8             | 极小间距（图标与文字间）   |
| `p-2` / `m-2` | 16            | 小间距（内部元素间）       |
| `p-3` / `m-3` | 24            | 中等间距（卡片内边距）     |
| `p-4` / `m-4` | 32            | 常规间距（区块间距）       |
| `p-6` / `m-6` | 48            | 大间距（页面左右边距）     |
| `p-8` / `m-8` | 64            | 超大间距（页面顶底部留白） |

**页面标准边距**：左右 `px-6`（48rpx = 24px）。

## 字号规范

| 类名        | 字号/行高（rpx） | 用途             |
| ----------- | ---------------- | ---------------- |
| `text-xs`   | 20/28            | 标签、角标       |
| `text-sm`   | 24/36            | 辅助文字、说明   |
| `text-base` | 28/40            | 正文、列表主文本 |
| `text-lg`   | 32/48            | 小标题、重要文字 |
| `text-xl`   | 36/52            | 页面标题         |
| `text-2xl`  | 44/64            | 大标题、数字展示 |

## 原子类使用规则

### 推荐写法

```vue
<template>
  <view class="flex items-center justify-between p-4 border-b border-line">
    <view class="flex items-center gap-3">
      <image class="w-12 h-12 rounded-full" src="..." />
      <view>
        <view class="text-base font-medium text-ink">{{ name }}</view>
        <view class="text-sm text-sub mt-1">{{ company }}</view>
      </view>
    </view>
    <view class="text-sm text-brand">查看详情</view>
  </view>
</template>
```

### 类名顺序约定

按照「布局 → 尺寸 → 间距 → 文字 → 颜色 → 边框 → 其他」的顺序写：

1. 布局：`flex`、`grid`、`block`、`inline-block`
2. 定位：`relative`、`absolute`、`fixed`
3. Flex/Grid：`items-center`、`justify-between`、`flex-col`
4. 尺寸：`w-*`、`h-*`、`min-w-*`、`max-w-*`
5. 间距：`p-*`、`m-*`、`gap-*`
6. 文字：`text-*`、`font-*`、`leading-*`、`text-center`
7. 颜色：`text-*`、`bg-*`、`border-color`
8. 边框：`border`、`rounded-*`
9. 其他：`shadow`、`opacity-*`、`z-*`、`truncate`

> 建议通过 Stylelint 插件（如 stylelint-plugin-unicss 或自定义规则）自动排序。

### 禁止事项

1. ❌ 禁止使用 `*` 通配选择器（WXSS 不支持）
2. ❌ 禁止使用属性选择器 `[type="text"]`（WXSS 不支持）
3. ❌ 禁止使用 `:hover`、`:active` 等伪类（小程序端不生效，用 `hover-class` 替代）
4. ❌ 禁止使用 `!important`（除非覆盖第三方组件样式且无其他办法）
5. ❌ 禁止在 scoped 样式中使用 `::v-deep` 深度选择器操控 wot 组件（小程序端不稳定）
6. ❌ 禁止直接用 `px` 写布局尺寸（用 rpx，UnoCSS 自动处理）

## 什么时候用 scoped 样式

以下场景可以用 `<style scoped>` 写自定义样式：

1. **复杂动画**：`@keyframes` 动画
2. **第三方组件深度定制**：Wot UI v2 组件的局部样式微调（用 CSS 变量控制优先）
3. **特殊排版**：富文本、Markdown 渲染样式

**原则**：能不用 scoped 就不用，优先用原子类组合。

## SCSS 使用规范

1. **变量走 UnoCSS theme**：颜色、间距、字号在 unocss.config.ts 定义，不重复定义 SCSS 变量。
2. **全局 SCSS 仅用于 CSS 变量或 mixin**：放在 `src/styles/` 目录。
3. **避免嵌套过深**：scoped 样式嵌套不超过 3 层。
4. **BEM 命名**：scoped 样式中的类名用 BEM：
   ```scss
   .resource-card {
     &__header {
       /* ... */
     }
     &__body {
       /* ... */
     }
     &--active {
       /* ... */
     }
   }
   ```

## 小程序端特殊注意

1. **rpx 单位**：UnoCSS preset-weapp 自动将 px 类名转为 rpx，开发时按 1:2 比例（设计稿 750 宽度下 1px = 1rpx）。
2. **选择器限制**：子代选择器 `>` 在小程序端可用，但通配符、伪类（除 `::before`/`::after` 外）不支持。
3. **背景图片**：本地图片不能用 `background-image`，需用 `<image>` 标签或转 base64。
4. **1px 边框**：使用 `border-0.5` 或自定义 class，避免 1rpx 在高分屏变粗。

## 响应式与适配

- H5 端：unocss-preset-weapp 将 rpx 转为 rem（基准 375px 宽度）
- 小程序端：rpx 由微信运行时自动换算
- 设计稿基准：750px 宽度（标准小程序设计稿尺寸）

## 暗色模式

本项目暂不要求暗色模式，但在定义颜色变量时预留扩展空间：

- 优先用 semantic token（`text-ink`、`bg-bg`）而非直接色值
- 如后续支持暗色模式，只需修改 unocss theme 配置

## 参考项目

- [UnoCSS 官方文档](https://unocss.dev)
- [unocss-preset-weapp](https://github.com/MellowCo/unocss-preset-weapp)
- [Tailwind CSS 最佳实践](https://tailwindcss.com/docs)
- [TDesign 设计规范](https://tdesign.tencent.com)
