---
name: uni-app-mobile
description: 用于本仓库（conti-visitor）移动端 H5 + 微信小程序开发。基于 Wot UI v2（@wot-ui/ui）+ Vue3 + Vite + TS + UnoCSS 技术栈，覆盖架构、组件、页面、状态管理、请求、i18n、样式、表单、性能、工程化、双端兼容、安全、测试等全套规范。新增/修改功能前先阅读对应 spec。
---

# uni-app 移动端项目规范（conti-visitor）— 入口

## 概述

本仓库是「Conti 数字访客管理系统」移动端：一套代码同时发布 **H5** 与 **微信小程序**。员工端与访客端共用登录、单套部署，用运行时角色区分。遵循本规范可保证双端行为一致、避免踩小程序端兼容性坑。

技术栈：uni-app（Vue 3 + Vite + TS）+ Wot UI v2（@wot-ui/ui、@wot-ui/router）+ Pinia + vue-i18n + UnoCSS + unocss-preset-weapp + @wot-ui/unocss-preset。

业务背景、功能点与设计图映射见 `docs/移动端架构与设计映射.md`。

## 规范索引（Specs）

所有详细规范按主题拆分，放在 `.codex/specs/` 目录下。开发对应功能时先阅读对应 spec：

| 编号 | 规范                                                           | 适用场景                            |
| ---- | -------------------------------------------------------------- | ----------------------------------- |
| 01   | [项目架构与目录规范](../../specs/01-项目架构与目录规范.md)     | 新建页面、组件、目录调整            |
| 02   | [组件开发规范](../../specs/02-组件开发规范.md)                 | 开发/修改组件                       |
| 03   | [页面开发规范](../../specs/03-页面开发规范.md)                 | 开发/修改页面                       |
| 04   | [状态管理规范](../../specs/04-状态管理规范.md)                 | 新增/修改 Pinia store               |
| 05   | [网络请求规范](../../specs/05-网络请求规范.md)                 | 新增/修改接口、请求封装             |
| 06   | [国际化规范](../../specs/06-国际化规范.md)                     | 新增文案、语言切换                  |
| 07   | [样式与原子化CSS规范](../../specs/07-样式与原子化CSS规范.md)   | 写样式、UnoCSS 类、主题定制         |
| 09   | [表单与校验规范](../../specs/09-表单与校验规范.md)             | 开发表单、校验规则                  |
| 10   | [性能优化规范](../../specs/10-性能优化规范.md)                 | 性能优化、列表渲染                  |
| 11   | [工程化与代码质量规范](../../specs/11-工程化与代码质量规范.md) | Git 工作流、lint、构建、代码规范    |
| 12   | [双端兼容规范](../../specs/12-双端兼容规范.md)                 | 平台差异处理、条件编译              |
| 13   | [错误处理与日志规范](../../specs/13-错误处理与日志规范.md)     | 错误处理、日志上报                  |
| 14   | [测试规范](../../specs/14-测试规范.md)                         | 单元测试、组件测试                  |
| 15   | [安全规范](../../specs/15-安全规范.md)                         | 安全自查、数据保护                  |
| 16   | [Wot UI v2集成规范](../../specs/16-wot-ui-v2集成规范.md)       | wot-ui v2 组件、路由、主题、AI 接入 |

## 核心约束速查（必读）

以下是最容易踩坑的几条，务必遵守：

1. **双端一致优先**：组件自动注册用 uni-app 原生 **easycom**，**不要使用 `unplugin-vue-components`**；API 自动导入用 `unplugin-auto-import`。
2. **单套部署、角色运行时区分**：员工与访客是同一应用的两个角色，首页用角色区块而非整页拆分。
3. **Tab 主包约束**：tabBar 页面（首页、我的）必须在主包，业务二级页放 `subPackages`。
4. **三语必填**：所有用户可见文案走 `vue-i18n`，禁止硬编码；德文仅访客端。
5. **样式用 UnoCSS 原子类**：小程序端不支持通配符/属性选择器/`:hover` 伪类。
6. **请求走 `uni.request` 封装**：不要引 axios；401 由 request 层统一处理。
7. **条件编译只用于平台差异**：角色差异走 store，不要用 `#ifdef` 区分角色。
8. **UI 统一 Wot UI v2**：只用 `@wot-ui/ui`、`@wot-ui/router` 与 `--wot-*` Token，禁止引入其他 UI 库或绕过主题变量。

## Spec Coding 工作流

本项目采用 Spec-driven 开发模式：

```
需求 → 写 spec → 评审 → 按 spec 实现 → 对照 spec 自测 → Code Review
```

每个页面/组件的 spec 文档放在对应目录的 `specs/` 子目录下，命名格式：`功能描述.spec.md`。

spec 必须包含：需求描述、交互流程、UI 规格、接口契约、校验规则、边界情况。

## 参考来源

本规范体系参考了以下高星项目和官方文档：

- [dcloudio/uni-app](https://github.com/dcloudio/uni-app) — 40k+ ⭐ 官方跨端框架
- [wot-ui/wot-ui](https://github.com/wot-ui/wot-ui) — Wot UI v2 组件库
- [uview-plus/uview-plus](https://github.com/uview-plus/uview-plus) — 6k+ ⭐ 生态化 UI 库
- [Tencent/tdesign](https://github.com/Tencent/tdesign) — 20k+ ⭐ 腾讯设计体系
- [jdf2e/nutui](https://github.com/jdf2e/nutui) — 8k+ ⭐ 京东移动端组件库
- [youzan/vant](https://github.com/youzan/vant) — 23k+ ⭐ 有赞移动端组件库
- [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) — 40k+ ⭐ 企业级工程化参考
- [antfu/vitesse](https://github.com/antfu/vitesse) — 30k+ ⭐ Vite 生态最佳实践
