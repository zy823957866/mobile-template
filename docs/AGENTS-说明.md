# AGENTS 与项目 Skill 使用说明

本文档面向**团队开发者**，解释本仓库的 `AGENTS.md`、项目 Skill（`.codex/skills/uni-app-mobile/SKILL.md`）是什么、如何生效、以及如何维护。

## 一、它们是什么

| 文件                                    | 面向对象                | 作用                                                                 |
| --------------------------------------- | ----------------------- | -------------------------------------------------------------------- |
| `AGENTS.md`（仓库根目录）               | AI 编码代理（Codex 等） | 项目级指令：入口、常用命令、核心约束摘要、指向详细规范               |
| `.codex/skills/uni-app-mobile/SKILL.md` | AI 编码代理             | 项目级 Skill：详细、可执行的开发规则（架构/国际化/样式/工程化/避坑） |
| `docs/技术方案调研.md`                  | 人类 + AI               | 技术选型与方案对比（为什么选 uni-app / UnoCSS / vue-i18n 等）        |
| `docs/移动端架构与设计映射.md`          | 人类 + AI               | 业务功能 ↔ 27 张设计图映射、角色功能矩阵、品牌色占位、页面清单       |

## 二、它们如何生效

1. **自动加载**：代理在仓库内工作时会自动读取根目录 `AGENTS.md`；Skill 由 Codex 按描述自动发现并加载。
2. **从摘要到细节**：`AGENTS.md` 只放「核心约束摘要 + 命令速查」，避免冗长；具体怎么做看 Skill。
3. **与方案/设计文档联动**：所有规则都源于 `docs/技术方案调研.md` 的技术决策与 `docs/移动端架构与设计映射.md` 的业务设计，改任一处需同步其余文档。

## 三、核心规则速览（详见 Skill）

- **架构**：单项目单部署；员工/访客 = 两个运行时角色；首页用角色区块，禁止整页拆分。
- **Tab/分包**：Tab 页（首页、我的）在主包；公共页（登录/注册/重置）在主包；员工/访客二级页在分包。
- **组件**：easycom 自动注册，不用 `unplugin-vue-components`；API 用 `unplugin-auto-import`。
- **国际化**：三语（zh-CN / en / de）必填，文案走 `vue-i18n`，禁硬编码；**德文仅访客端**（`getSupportedLocales(role)`）。
- **样式**：UnoCSS + `unocss-preset-weapp`；禁通配符/属性选择器；单位用 rpx；品牌色 `#F5A800` / `#1A1A1A` / `#6B6B6B`。
- **请求**：统一 `src/api/request.ts`（uni.request），禁 axios。
- **工程化**：eslint + prettier + stylelint + husky + lint-staged + commitlint。

## 四、给开发者的日常指引

1. 新增页面：按「目录约定」放置（Tab 页/公共页在主包，二级页在分包），`pages.json` 注册；受保护页面 `onLoad` 加 `ensureAuthenticated()`。
2. 新增组件：放入 `src/components/**`，命名与目录匹配（easycom 自动可用）；业务组件不手动 import。
3. 新增文案：同步补 `zh-CN.ts` / `en.ts` / `de.ts` 三个文件，键结构一致；涉及语言选项时走 `getSupportedLocales`。
4. 提交前：`npm run type-check` + `npm run lint` + `npm run format`，提交信息用 Conventional Commits。
5. 双端验证：改动后至少跑一次 `npm run build:h5` 与 `npm run build:mp-weixin`。

## 五、如何维护这套规则

- **规则变更流程**：先在 `docs/技术方案调研.md`（技术）或 `docs/移动端架构与设计映射.md`（业务）记录决策 → 再同步 Skill 对应章节 → 最后更新 `AGENTS.md` 摘要。
- **新增避坑经验**：补到 Skill「常见坑」章节，保持条目短、可执行，不写泛泛建议。
- **保持简洁**：`AGENTS.md` 只留摘要；细节只放在 Skill；避免重复维护同一信息。

## 六、常见问题

- **为什么不用 `unplugin-vue-components`？** 它是 H5 向方案，小程序端与 uni-app 的 easycom 不兼容；easycom 是 uni-app 原生、双端一致的自动注册机制。
- **为什么首页不拆两个整页？** tabBar 页必须在主包且入口唯一；拆页需换自定义 TabBar，成本高。差异是「局部」的，用区块渲染即可。
- **为什么不用 axios？** 小程序端 axios 走 adapter 转换，体积与复杂度增加；`uni.request` 封装已覆盖拦截/鉴权/错误处理。
- **为什么德文仅访客端？** 业务约束（见设计映射文档角色功能矩阵）；员工端仅 中文/English，语言入口按角色过滤。
- **为什么不升级 `@dcloudio/*`？** 其 npm 版本按 dist-tag 发布，`latest` 是旧 Vue2 线；本项目已锁定 Vue3 固定版本，升级需专门验证。
