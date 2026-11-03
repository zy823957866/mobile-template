# AGENTS.md — Conti Visitor

移动端访客管理项目：**uni-app（Vue3 + Vite + TypeScript）**，同一套代码同时发布 **H5** 与 **微信小程序**。员工端 / 访客端共用登录、单套部署，两角色通过运行时角色区分；三语 `zh-CN` / `en` / `de`（**德文仅访客端**）。

技术栈：**Wot UI v2（`@wot-ui/ui`）+ Vue 3 + Vite + TypeScript + Pinia + UnoCSS + vue-i18n**。

开发模式：**Spec-driven**（先写 spec 再实现），所有规范按主题拆分存放。

## 快速命令

| 命令                                          | 说明                                                            |
| --------------------------------------------- | --------------------------------------------------------------- |
| `npm run dev:h5`                              | 本地运行 H5                                                     |
| `npm run dev:mp-weixin`                       | 本地运行微信小程序（用微信开发者工具打开 `dist/dev/mp-weixin`） |
| `npm run build:h5`                            | 构建 H5 产物（`dist/build/h5`）                                 |
| `npm run build:mp-weixin`                     | 构建微信小程序产物（`dist/build/mp-weixin`）                    |
| `npm run type-check`                          | vue-tsc 类型检查                                                |
| `npm run lint` / `npm run lint:fix`           | ESLint 检查 / 修复                                              |
| `npm run format` / `npm run format:check`     | Prettier 格式化 / 校验                                          |
| `npm run stylelint` / `npm run stylelint:fix` | Stylelint 检查 / 修复                                           |

## 规范体系（必读）

### 项目 Skill 入口

`.codex/skills/uni-app-mobile/SKILL.md` — 所有规范的索引入口，开发前先读对应主题的 spec。

### 详细规范（15 个主题，按主题拆分存放在 `.codex/specs/`）

| 编号 | 规范文件                     | 覆盖范围                                    |
| ---- | ---------------------------- | ------------------------------------------- |
| 01   | `01-项目架构与目录规范.md`   | 目录结构、分包策略、命名约定、Spec Coding   |
| 02   | `02-组件开发规范.md`         | 组件分层、Props/Events/Slots、Easycom、性能 |
| 03   | `03-页面开发规范.md`         | 生命周期、路由、加载模式、角色区块化        |
| 04   | `04-状态管理规范.md`         | Pinia Setup Store、持久化、使用规则         |
| 05   | `05-网络请求规范.md`         | request 封装、接口组织、类型定义、错误处理  |
| 06   | `06-国际化规范.md`           | 三语管理、按角色过滤、vue-i18n 使用         |
| 07   | `07-样式与原子化CSS规范.md`  | UnoCSS 使用、主题系统、WXSS 限制            |
| 09   | `09-表单与校验规范.md`       | wd-form、async-validator、校验器库          |
| 10   | `10-性能优化规范.md`         | 启动、列表、渲染、包体积、网络              |
| 11   | `11-工程化与代码质量规范.md` | Git 工作流、ESLint、TS、构建发布            |
| 12   | `12-双端兼容规范.md`         | 条件编译、平台差异封装、双端验证            |
| 13   | `13-错误处理与日志规范.md`   | 错误分层、全局捕获、日志上报                |
| 14   | `14-测试规范.md`             | vitest 单元测试、组件测试、覆盖率           |
| 15   | `15-安全规范.md`             | 认证、XSS、数据脱敏、小程序安全             |
| 16   | `16-wot-ui-v2集成规范.md`    | 组件使用、路由、主题、UnoCSS、AI 接入       |

## Spec Coding 工作流

本项目采用 Spec-driven 开发模式：

```
需求澄清 → 编写 spec → spec 评审 → 按 spec 实现 → 对照 spec 自测 → Code Review
```

**spec 编写规范**：

1. **存放位置**：对应页面/组件目录的 `specs/` 子目录（如 `src/pages/visitor/register/specs/`）
2. **命名格式**：`功能描述.spec.md`（如 `visitor-register.spec.md`）
3. **必备章节**：
   - 需求描述
   - 交互流程（正常流 + 异常流）
   - UI 规格（布局、状态、文案）
   - 接口契约（请求参数、响应结构）
   - 校验规则
   - 边界情况与异常处理

## 核心约束速查

以下是最容易踩坑的硬约束，务必遵守：

- **双端一致优先**：组件自动注册用 uni-app 原生 **easycom**，**禁止使用 `unplugin-vue-components`**；API 自动导入用 `unplugin-auto-import`。
- **单套部署、角色运行时区分**：员工与访客是同一应用的两个角色，首页用角色区块而非整页拆分。
- **Tab 主包约束**：微信 tabBar 页面（首页、我的）必须在主包，不能放分包；员工/访客二级页放 `subPackages`。
- **三语必填**：所有用户可见文案走 `vue-i18n`（`src/locales/`），禁止硬编码；**德文仅访客端**（`getSupportedLocales(role)` 控制）。
- **样式**：原子化 CSS 用 **UnoCSS + unocss-preset-weapp**；小程序端禁止通配符/属性选择器/`:hover` 伪类；尺寸用 `rpx`。
- **请求**：统一走 `src/api/request.ts`（`uni.request` 封装），禁止直接引 axios。
- **条件编译**：`#ifdef MP-WEIXIN` / `#ifdef H5` 只处理平台差异；角色差异走 store，禁止用条件编译区分角色。
- **UI 统一**：组件库只使用 `@wot-ui/ui`，路由使用 `@wot-ui/router`，主题 Token 使用 `--wot-*`。

## 参考项目

本规范体系基于以下高星项目和官方文档的最佳实践沉淀：

- [dcloudio/uni-app](https://github.com/dcloudio/uni-app) — 40k+ ⭐ 官方跨端框架
- [wot-ui/wot-ui](https://github.com/wot-ui/wot-ui) — Wot UI v2 组件库
- [uview-plus/uview-plus](https://github.com/uview-plus/uview-plus) — 6k+ ⭐ 生态化 UI 库
- [Tencent/tdesign](https://github.com/Tencent/tdesign) — 20k+ ⭐ 腾讯设计体系
- [jdf2e/nutui](https://github.com/jdf2e/nutui) — 8k+ ⭐ 京东移动端组件库
- [youzan/vant](https://github.com/youzan/vant) — 23k+ ⭐ 有赞移动端组件库
- [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) — 40k+ ⭐ 企业级工程化参考
- [antfu/vitesse](https://github.com/antfu/vitesse) — 30k+ ⭐ Vite 生态最佳实践

<!-- open-wot agent instructions start -->

## Wot UI Agent Instructions

Before generating or modifying wot-ui component code, read the project Skill at `.agents/skills/wot-ui-v2/SKILL.md` and query the configured `wot-ui` MCP server for version-accurate APIs and examples.

<!-- open-wot agent instructions end -->
