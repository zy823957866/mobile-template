import presetWeapp from "unocss-preset-weapp"
import { transformerClass } from "unocss-preset-weapp/transformer"
import { presetWot } from "@wot-ui/unocss-preset"

/**
 * UnoCSS 配置
 *
 * 设计 Token 与 CSS 变量（styles/tokens/）对齐
 * 品牌色：#F5A800（暂定，以品牌手册为准）
 */
export default {
  presets: [
    presetWeapp({
      // 以 rpx 为单位（小程序端原生，H5 端自动转 rem）
    }),
    // wot-ui v2 设计 token：wot-text-* / wot-bg-* / wot-p-* 等
    presetWot({ prefix: "wot", preflight: true, baseTokens: false }),
  ],
  transformers: [transformerClass()],

  theme: {
    // ============================================================
    // 颜色
    // ============================================================
    colors: {
      // 主色
      brand: {
        50: "#FFF7E0",
        100: "#FFECB3",
        200: "#FFDF80",
        300: "#FFD14D",
        400: "#FFC41A",
        500: "#F5A800", // 默认主色
        600: "#D98F00",
        700: "#B07300",
        800: "#875800",
        900: "#5E3D00",
        DEFAULT: "#F5A800",
      },

      // 功能色
      success: "#00B578",
      warning: "#FF8A00",
      danger: "#F53F3F",
      info: "#3491FA",

      // 文本色
      ink: "#1A1A1A", // 主文本
      sub: "#6B6B6B", // 次级文本
      tertiary: "#999999", // 辅助文本
      disabled: "#CCCCCC", // 禁用文本

      // 背景色
      bg: "#F5F6F7", // 页面背景
      card: "#FFFFFF", // 卡片背景
      container: "#F2F3F5", // 容器背景

      // 边框色
      line: "#E5E6EB",
      "line-light": "#F2F3F5",

      // 中性色
      gray: {
        50: "#F7F8FA",
        100: "#F2F3F5",
        200: "#E5E6EB",
        300: "#C9CDD4",
        400: "#86909C",
        500: "#4E5969",
        600: "#272E3B",
        700: "#1D2129",
        800: "#0F1218",
      },
    },

    // ============================================================
    // 间距（rpx）
    // ============================================================
    spacing: {
      px: "2rpx",
      0.5: "4rpx",
      1: "8rpx",
      1.5: "12rpx",
      2: "16rpx",
      2.5: "20rpx",
      3: "24rpx",
      3.5: "28rpx",
      4: "32rpx",
      5: "40rpx",
      6: "48rpx",
      7: "56rpx",
      8: "64rpx",
      10: "80rpx",
      12: "96rpx",
      16: "128rpx",
      20: "160rpx",
      "page-x": "48rpx", // 页面左右边距
    },

    // ============================================================
    // 字号 / 行高
    // ============================================================
    fontSize: {
      xs: ["20rpx", "28rpx"],
      sm: ["24rpx", "36rpx"],
      base: ["28rpx", "40rpx"],
      md: ["30rpx", "44rpx"],
      lg: ["32rpx", "48rpx"],
      xl: ["36rpx", "52rpx"],
      "2xl": ["44rpx", "64rpx"],
      "3xl": ["56rpx", "72rpx"],
    },

    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    // ============================================================
    // 圆角
    // ============================================================
    borderRadius: {
      sm: "8rpx",
      md: "12rpx",
      lg: "16rpx",
      xl: "24rpx",
      "2xl": "32rpx",
      full: "9999rpx",
    },

    // ============================================================
    // 阴影
    // ============================================================
    boxShadow: {
      sm: "0 2rpx 8rpx rgb(0 0 0 / 6%)",
      md: "0 4rpx 16rpx rgb(0 0 0 / 8%)",
      lg: "0 8rpx 24rpx rgb(0 0 0 / 10%)",
      xl: "0 16rpx 48rpx rgb(0 0 0 / 12%)",
    },

    // ============================================================
    // 高度
    // ============================================================
    height: {
      button: "88rpx",
      input: "80rpx",
      cell: "96rpx",
      navbar: "88rpx",
      tabbar: "98rpx",
    },

    minHeight: {
      button: "88rpx",
      input: "80rpx",
    },

    // ============================================================
    // z-index
    // ============================================================
    zIndex: {
      dropdown: 1000,
      popup: 1500,
      modal: 2000,
      toast: 2500,
      loading: 3500,
    },
  },

  // ============================================================
  // 安全列表：动态拼接的类名必须预声明
  // ============================================================
  safelist: [
    // 状态标签颜色
    ...["pending", "approved", "rejected", "checked_in", "checked_out"].flatMap((s) => [
      `text-${s}`,
      `bg-${s}`,
      `border-${s}`,
    ]),
  ],

  // ============================================================
  // 快捷规则
  // ============================================================
  shortcuts: {
    "flex-center": "flex items-center justify-center",
    "flex-between": "flex items-center justify-between",
    "page-x": "px-page-x",
    "text-ellipsis": "truncate",
  },
}
