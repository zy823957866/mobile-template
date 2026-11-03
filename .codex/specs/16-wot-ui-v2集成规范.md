# 16 - Wot UI v2 集成规范

## 概述

本项目 UI 组件库统一使用 Wot UI v2（npm 包 `@wot-ui/ui`），配套使用 `@wot-ui/router` 作为编程式路由层、`@wot-ui/unocss-preset` 暴露设计 Token，并通过 `@wot-ui/cli` 提供 MCP Server 与 Agent Skill。

## 核心依赖

| 包                      | 作用                                                           |
| ----------------------- | -------------------------------------------------------------- |
| `@wot-ui/ui`            | 80+ uni-app Vue3 组件，支持暗黑模式、国际化、主题定制          |
| `@wot-ui/router`        | 基于 uni 导航能力的编程式路由，支持 `beforeEach` / `afterEach` |
| `@wot-ui/unocss-preset` | 将设计 Token 映射为 `wot-` 前缀原子类                          |
| `@wot-ui/cli`           | CLI、MCP Server（8 个工具）与离线组件知识库                    |

Sass 需使用 `^1.98.0`，组件自动引入仍使用 uni-app 原生 easycom。

## 组件引入

easycom 已在 `pages.json` 配置，业务代码直接使用 `wd-*` 标签，禁止 import 组件，禁止使用 `unplugin-vue-components`：

```json
"^wd-(.*)": "@wot-ui/ui/components/wd-$1/wd-$1.vue"
```

全局组件类型在 `tsconfig.json` 中声明：

```json
"types": ["@dcloudio/types", "@wot-ui/ui/global"]
```

`Toast`、`Dialog`、`Notify` 等函数式组件仍需在页面 SFC 中显式放置实例，如 `<wd-toast />`。

## 主题与设计 Token

Wot UI v2 使用三层 Design Token 体系，品牌色通过覆盖 `--wot-*` 语义变量实现：

```scss
page {
  --wot-primary-6: #1677ff; // 默认主色
  --wot-text-main: #1a1a1a;
  --wot-text-secondary: #6b6b6b;
}
```

局部主题使用 `wd-config-provider`；暗黑模式由 `.wot-theme-dark` 作用域自动切换变量。

## UnoCSS 接入

`unocss.config.ts` 在 `presetWeapp` 之后注册：

```ts
presetWot({ prefix: "wot", preflight: true, baseTokens: false })
```

可直接使用 `wot-text-primary`、`wot-bg-filled-oppo`、`wot-p-main`、`wot-rounded-md` 等类。基础色板类仅在 `baseTokens: true` 时开放。

## 路由

路由模块位于 `src/router`，采用显式路由表（`routes.ts`），需与 `pages.json` 保持一致。

meta 约定：

| 字段       | 含义                                |
| ---------- | ----------------------------------- |
| `public`   | 无需登录                            |
| `roles`    | 允许访问的角色数组，如 `['role-a']` |
| `tab`      | tabBar 页面，需用 `pushTab` 跳转    |
| `titleKey` | 导航栏标题的 i18n key               |

导航统一使用 `@wot-ui/router` 实例：`push`、`replace`、`replaceAll`、`pushTab`、`back`。守卫顺序为登录校验、角色校验；后置钩子负责标题与 PV 埋点。

## AI 接入

MCP 为项目级配置（`.codex/config.toml`），版本固定：

```toml
[mcp_servers.wot-ui]
command = "npx"
args = ["-y", "@wot-ui/cli@1.2.1", "mcp"]
```

wot-ui-v2 Skill 位于 `.agents/skills/wot-ui-v2/`。编写或修改组件代码前，应先查询 MCP 获取版本准确的 props、events、slots 与示例，避免臆造 API。

MCP 提供 8 个工具：`wot_status`、`wot_list`、`wot_info`、`wot_doc`、`wot_demo`、`wot_token`、`wot_changelog`、`wot_lint`。

表单相关的 `label`、`prop`、`rules` 统一使用 `wd-form` / `wd-form-item`。
