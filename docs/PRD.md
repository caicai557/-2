# 《大乐斗：新武侠纪》2025 轻量网页放置/异步战斗游戏 PRD

## 一、问题陈述
- **商业背景**：原《大乐斗Ⅱ》老玩家对“轻松放置 + 武侠成长 + 异步切磋”仍有需求，但 Flash 停服、美术老旧、移动端兼容性差，导致用户流失。
- **市场痛点**：新生代玩家偏好轻量网页/小程序式体验，注重视觉焕新、快速上手、轻社交留存；现有竞品在企鹅生态内空缺。
- **机会**：依托腾讯企鹅武侠世界观，通过“精神续作”形式唤醒情怀 + 新体验，结合更高效的技术栈实现低成本迭代。

## 二、目标用户
1. **核心老玩家**：曾接触《大乐斗Ⅱ》、喜欢武侠养成；重视闭关修炼、属性搭配深度。
2. **轻量新用户**：喜欢放置类、异步战斗玩法的休闲人群；希望 3 分钟了解玩法，碎片化时间游玩。
3. **泛社交玩家**：关注排行榜、切磋回放等轻社交元素，期待未来拓展帮派、师徒等互动。

## 三、核心指标（MVP 阶段）
- **次日留存率 ≥ 35%**：通过首战引导、离线收益、每日提醒确保回流。
- **日活时长 ≥ 8 分钟**：核心循环（养成 → 自动战斗 → 奖励）流畅无阻，战斗回放不超过 30 秒。
- **日常任务完成率 ≥ 45%**：以可视化每日面板驱动养成目标。
- **新手引导完成率 ≥ 90%**：3 分钟内完成首战、属性分配、技能学习。

## 四、风险与对策
| 风险 | 描述 | 对策 |
| --- | --- | --- |
| 世界观违和 | 腾讯企鹅元素与武侠融合难度大 | 设定“企鹅门派”文化，武器、服饰、场景加入企鹅符号；与美术协作提供风格手册 |
| 数值节奏不平衡 | 离线收益与战斗难度易导致断档 | 建立数值模拟工具，Zustand 状态 + localStorage 记录；每周调优系数 |
| 首战引导流失 | 新手过长或信息过载 | 分三步：剧情动画 <10 秒、自动战斗演示、一次属性/技能互动 |
| 轻社交缺乏真实感 | 首期仅本地榜和回放 | 设计“AI 侠客”假数据，模拟多样战斗日志；UI 明示“敬请期待联机” |
| a11y 忽视 | 键盘导航、文本对比度不足 | Tailwind 预设 a11y 主题；ARIA 标签、可调字体；测试通过 axe/vitest 断言 |

---

## 五、功能列表与里程碑

### MVP（2025 Q1 内测）
- **世界观与美术基调**：企鹅门派主城、角色立绘（基础 4 套）、UI 主题（深色 + 金色描边）。
- **核心循环实现**：
  - 角色属性四维：力道/身法/内力/心法，升级分配点。
  - 技能系统：初始内功 + 外功技能各 1，学习/升级界面。
  - 自动战斗（异步）：使用预录战斗回放动画，根据数值结果展示胜负与奖励。
  - 奖励发放：银两、修为、装备碎片；升级界面可立即使用。
- **日常循环**：
  - 日常任务面板（3 项固定 + 2 项随机）。
  - 闭关修炼：离线收益计算，登陆弹窗提示。
  - 每日日志提醒：站内通知 + 浏览器通知（用户授权）。
- **轻社交雏形**：
  - 本地排行榜：使用假数据 + 玩家当前数值排序。
  - 切磋回放：保存最近 10 场战斗，支持复盘。
- **新手引导**：剧情开场（10 秒漫画）、首战自动触发、属性分配弹窗、技能学习引导。
- **基础设施**：Vite + React + TS + Tailwind + Zustand + Vitest；localStorage 持久化。
- **a11y 支撑**：键盘可操作、语义化标签、UI 对比度验证。

### v1.1（2025 Q2 公测）
- 新增关卡章节（3 大区域），引入精英战与首领战机制。
- 扩展技能树：新增 6 个技能，加入技能搭配加成（羁绊）。
- 装备系统原型：武器/护甲/饰品位，提供基础属性加成。
- 高级闭关：选择不同闭关场景获得差异化收益。
- 活动系统：限时“企鹅武林大会”挑战，与本地存档 AI 对战。
- 排行榜增强：支持按力道、综合战力等维度切换。

### v1.2（2025 Q3 功能增强）
- 轻社交拓展：好友邀请、留言板（仍为本地模拟）。
- 战斗策略编辑：技能释放优先级、内功运转模式配置。
- 帮会雏形（单机）：创建/命名帮会，解锁帮会技能增益（本地数据）。
- 活动轮换：周/月度活动脚本化，可通过 JSON 配置。
- 预留服务端接口规范：为后续 Node/Express + SQLite/Prisma 接入做准备。
- 多语言支持（简中/繁中），a11y 审核报告（WCAG 2.1 AA 基线）。

---

## 六、数据模型草案
> 按照默认技术栈，使用 TypeScript 接口表示前端本地存储结构；后续易迁移至后端。

### 1. 角色（PlayerCharacter）
```ts
interface PlayerCharacter {
  id: string; // UUID
  name: string;
  level: number;
  exp: number;
  attributes: Attributes;
  attributePoints: number; // 可分配点
  learnedSkills: SkillInstance[];
  equipment: Record<EquipmentSlot, EquipmentItem | null>;
  cultivation: CultivationState;
  createdAt: string; // ISO date
  lastLoginAt: string;
}
```

### 2. 属性（Attributes）
```ts
interface Attributes {
  strength: number; // 力道
  agility: number; // 身法
  spirit: number; // 内力
  willpower: number; // 心法
}
```

### 3. 技能（Skill & SkillInstance）
```ts
interface Skill {
  id: string;
  name: string;
  type: 'internal' | 'external';
  description: string;
  baseEffect: SkillEffect;
  scaling: Partial<Record<keyof Attributes, number>>; // 属性成长系数
  unlockLevel: number;
  penguinLoreTag: string; // 企鹅门派彩蛋
}

interface SkillInstance {
  skillId: string;
  level: number;
  proficiency: number; // 技能熟练度
  equipped: boolean;
}

interface SkillEffect {
  damage?: number;
  heal?: number;
  buff?: BuffEffect;
  triggerRate: number;
}
```

### 4. 关卡（Stage）
```ts
interface Stage {
  id: string;
  chapter: number;
  name: string;
  recommendedPower: number;
  rewards: RewardBundle[];
  enemyPresetId: string;
  unlockConditions: UnlockCondition[];
}
```

### 5. 战斗记录（BattleRecord）
```ts
interface BattleRecord {
  id: string;
  playerId: string;
  opponentId: string; // 可为 AI 侠客或本地假数据
  stageId?: string;
  result: 'win' | 'lose';
  timestamp: string;
  turns: BattleTurn[];
  rewards: RewardBundle[];
  replayData: string; // 压缩 JSON，用于回放
}

interface BattleTurn {
  turn: number;
  actorId: string;
  action: string;
  value: number;
  remainingHp: number;
}
```

### 6. 活动（Event & DailyTask）
```ts
interface GameEvent {
  id: string;
  name: string;
  type: 'seasonal' | 'weekly' | 'daily';
  startAt: string;
  endAt: string;
  description: string;
  rewards: RewardBundle[];
  config: Record<string, unknown>; // JSON 配置以支持快速迭代
}

interface DailyTask {
  id: string;
  name: string;
  description: string;
  progress: number;
  goal: number;
  reward: RewardBundle;
  resetAt: string;
}
```

### 7. 通用结构
```ts
interface RewardBundle {
  silver?: number;
  cultivationPoints?: number;
  equipmentFragments?: number;
  items?: ItemInstance[];
}

interface EquipmentItem {
  id: string;
  slot: EquipmentSlot;
  name: string;
  rarity: 'common' | 'rare' | 'epic';
  attributeBonus: Partial<Attributes>;
  penguinStyleTag: string;
}

type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

interface CultivationState {
  mode: 'online' | 'offline';
  accumulatedPoints: number;
  lastClaimAt: string;
}

interface ItemInstance {
  itemId: string;
  quantity: number;
}

interface UnlockCondition {
  type: 'level' | 'stageClear' | 'event';
  value: string | number;
}
```

---

## 七、后续扩展建议
- 预留服务器 API 设计文档，与 PRD 同步迭代。
- 规划数值 Excel → JSON → 游戏内自动导入流程。
- 建立美术风格板（企鹅元素 + 武侠场景）供 UI/动画共用。

