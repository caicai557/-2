# 《大乐斗Ⅱ：灵境续写》2025 美化升级轻量网页放置/异步战斗游戏 PRD

## 一、问题陈述
- **传承需求**：原作《大乐斗Ⅱ》拥有稳定的武侠轻社交玩家群体，但 Flash 生态消亡、移动端浏览器体验老化导致用户流失。
- **体验断层**：现有视觉、交互、易用性无法满足 2025 年用户对跨端、无障碍与高品质 UI 的诉求。
- **技术目标**：以 Vite + React + TypeScript + Tailwind + Zustand 构建可持续迭代的前端基础，提供未来接入 Node/Express + SQLite 的后端扩展空间。
- **商业机会**：通过“精神续作”形式唤回老用户、吸引轻度放置 RPG 玩家，打通腾讯企鹅 IP 衍生及广告/内购变现。

## 二、目标用户
1. **怀旧核心玩家**：曾深度体验《大乐斗Ⅱ》的 25-35 岁用户，期待在现代设备重温武侠轻竞技乐趣。
2. **轻量 RPG/放置玩家**：碎片化时间游玩，追求低操作、高成长反馈的用户。
3. **社交向体验者**：希望与好友比拼、炫耀战绩但对实时操作要求不高的用户。

## 三、产品目标与核心指标
- **激活体验**：新手 3 分钟完成首战引导、属性分配与技能学习；新手 1 日留存 ≥ 45%。
- **参与深度**：日常循环（任务、闭关、日志）完成率 ≥ 60%，平均日登录时长 ≥ 8 分钟。
- **战斗吸引力**：自动战斗回放完播率 ≥ 70%，切磋回放查看率 ≥ 30%。
- **社交触达**：本地排行榜（假数据 + 玩家数据混排）触达率 ≥ 80%，切磋回放发起率 ≥ 20%。
- **可持续性**：Bug 逃逸率 < 5%，核心循环相关体验满意度（问卷）≥ 4.2/5。

## 四、核心体验概述
- **世界观与美术**：重新设定为“腾讯企鹅武林”，玩家化身少侠企鹅，在四大雪山门派中修炼；整体美术以柔和扁平国风 + 腾讯企鹅拟人化形象呈现，支持深色模式与移动端适配。
- **核心循环**：
  1. **养成**：角色四维（力、体、敏、灵）成长、被动技能升级，资源来自战斗奖励、日常任务与闭关修炼。
  2. **自动战斗**：异步战斗系统按回合演算，战斗结果和简易动画回放均可离线查看。
  3. **奖励/升级**：战斗掉落铜币、侠义值、技能残卷；用于属性点分配与被动技能强化。
  4. **解锁进程**：胜利解锁后续关卡、剧情、新被动技能与稀有神技。
- **日常循环**：
  - **日常任务**：每日刷新 5 个轻量任务（例如战斗一次、闭关一次、查看排行榜）。
  - **在线手动乐斗**：每日限定手动对战入口，玩家需在线操作触发被动条件、争取额外经验与资源，延长在线时长体验；完成后计入日常任务并生成战斗日志。
  - **闭关修炼**：离线收益系统，可积累至 12 小时，上限可通过 VIP/活动拓展。
  - **每日日志提醒点**：每日首登展示成长摘要（昨日收益、今日目标、未完成任务）。
- **轻社交**：
  - **本地排行榜**：使用假数据 + 玩家本地存档排序，展示战力、门派、最近战绩。
  - **切磋回放**：玩家可选择榜单角色发起切磋并观看回放，结果记录于本地战斗记录。
- **可访问性**：所有关键交互具备文本描述、键盘导航、对比度符合 WCAG AA；提供字体大小调节与动画减弱选项。
- **技能体系**：所有技能为被动类（基础被动、门派传承、稀有神技），通过固定属性加成与百分比乘区叠加，辅以触发条件（受击、暴击、连胜等）。每次角色升级随机习得/强化一项被动，玩家可选择保留或重掷（消耗残卷），并保留原版“五大神技”机制——稀有技能仅在高难度试炼、排行榜奖励或限时活动中掉落，拥有显著战斗力提升与特效致敬原作表现。

## 五、风险与对策
| 风险 | 影响 | 对策 |
| --- | --- | --- |
| 武侠与企鹅风格融合违和 | 影响品牌认同与美术一致性 | 制定美术规范：核心角色以企鹅拟人造型 + 武侠元素，建立色板与 UI 组件库；与品牌团队联审。
| 自动战斗枯燥、缺乏策略感 | 影响留存与付费潜力 | 引入技能相克、怒气/连击等微策略；战斗回放强化关键事件提示。
| 离线收益平衡难 | 资源膨胀导致进程失衡 | 设定收益上限、随等级调节效率；数据埋点监控资源曲线。
| 本地排行榜缺乏真实性 | 降低社交驱动力 | 设计假数据模板模拟真实玩家，提供后端接口预留与迭代计划。
| 在线手动乐斗占用时长 | 可能与放置节奏冲突 | 控制每日次数与时长上限，提供跳过但少量奖励的选项，监测在线时长与流失率。
| 新手引导流失 | 无法达成 3 分钟上手目标 | 分段式引导（战斗→属性→技能），每步包含可跳过提示与互动演示。
| 移动端性能与 a11y 未达标 | 影响覆盖面与口碑 | Lighthouse & Axe 自动化检测纳入 CI；Tailwind 组件遵循响应式与语义 HTML。

---

## 六、功能列表与里程碑

### MVP（目标：上线内测）
- 框架搭建：Vite + React + TS + Tailwind + Zustand + Vitest，路由与全局状态骨架。
- 核心数据模型：角色（四维、等级、经验、门派、技能抽取历史）、技能（被动属性加成、百分比乘区、触发条件）、关卡（敌方配置、奖励）。
- 新手引导：
  - 首战：预设剧情战斗、展示企鹅门派、引导点击“开始乐斗”。
  - 属性分配：战后奖励 5 点自由属性，提供推荐分配。
  - 技能学习：首度随机习得基础被动技能，演示保留/重掷机制与被动触发提示。
- 自动战斗系统：异步结算、动画回放（可倍速/跳过）、战斗记录存本地；展示被动触发日志。
- 在线手动乐斗模式：即时指令（选择目标/触发特性）+ 被动连携，用于提升在线粘性与资源获取。
- 养成面板：属性点分配、被动技能选择/重掷、装备槽预留（未开放）。
- 日常循环：
  - 日常任务面板（含奖励领取）。
  - 闭关修炼（离线收益计算、上限 12 小时）。
  - 在线手动乐斗入口（限时次数、即时指令）、经验与资源加成结算。
  - 每日日志提醒点（登录弹窗显示昨日收益、待办）。
- 社交基础：
  - 本地排行榜（假数据 + 玩家混排）。
  - 切磋回放（与榜单 NPC 战斗并生成记录）。
- 可访问性：键盘导航、语义标签、对比度检测通过。
- 数据持久化：localStorage（玩家档案、战斗记录、任务状态）。
- QA：关键流程 Vitest 覆盖、Lighthouse 移动端得分 ≥ 85。

### v1.1（目标：公测准备）
- 新增门派剧情线及分支对话（文本系统）。
- 技能系统扩展：深化被动技能谱系（基础/门派/神技）、随机习得日志、技能树 UI 与神技追溯线索。
- 战斗演算优化：属性对战斗的边际收益调优，加入战斗日志详细文本。
- 在线手动乐斗增强：新增动态事件（破防、连击）、时限挑战与神技触发演示，确保在线玩法可持续。
- 离线收益扩展：闭关加速道具、分享提醒（仅记录，不接分享接口）。
- 排行榜增强：增加分类榜（战力榜、修为榜），支持本地筛选与历史记录。
- a11y 强化：自定义对比度主题、屏幕阅读器提示优化。

### v1.2（目标：商业化预备）
- 活动系统：限时试炼塔、节日主题活动（含企鹅主题装扮）。
- 设备协同：PWA 支持、离线包、推送提醒（浏览器通知）。
- 深度社交预留：好友切磋邀请（本地模拟）、留言板原型。
- 经济体系：商城雏形（货币展示、购买占位）、离线收益 VIP 扩展。
- 数据上报：埋点与日志系统（本地缓存 + 预留 API）。
- 服务器对接预研：Node/Express + SQLite Demo，排行榜接口契约定义。

---

## 七、数据模型草案

### 1. 角色（PlayerProfile）
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 本地唯一 ID（UUID）。 |
| name | string | 玩家昵称。 |
| clan | string | 门派选择（雪鹫门 / 寒冰堂 / 霜羽阁 / 凌风寨）。 |
| level | number | 玩家等级。 |
| exp | number | 当前经验。 |
| attributes | { str: number; vit: number; agi: number; wis: number } | 四维属性：力、体、敏、灵。 |
| attrPoints | number | 未分配属性点。 |
| skills | PlayerSkill[] | 已习得被动技能与等级、是否为神技。 |
| skillRolls | SkillRoll[] | 随机习得/重掷历史与来源记录。 |
| inventory | InventoryItem[] | 预留装备/道具。 |
| coins | number | 铜币资源。 |
| honor | number | 侠义值（高级资源）。 |
| manualBattleTickets | number | 当日在线手动乐斗可用次数。 |
| offlineTimestamp | number | 最近离线时间，用于闭关收益。 |
| settings | { theme: 'light' / 'dark'; fontScale: number; reduceMotion: boolean } | a11y & 体验设置。 |

### 2. 技能（Skill & PlayerSkill）
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| Skill.id | string | 技能唯一 ID。 |
| Skill.name | string | 技能名称（企鹅武侠命名，向原作致敬）。 |
| Skill.category | 'basic' / 'clan' / 'god' | 技能分类，对应基础、门派专属、五大神技。 |
| Skill.flatBonus | Partial<AttributeBonus> | 固定属性加成（四维或特殊抗性）。 |
| Skill.percentBonus | Partial<AttributeMultiplier> | 百分比乘区加成。 |
| Skill.trigger | TriggerCondition | 被动触发条件（受击、暴击、回合数等）。 |
| Skill.unlockLevel | number | 可进入随机习得池的等级下限。 |
| Skill.sources | SkillSource[] | 获取来源（等级随机、门派任务、排行榜、限时活动、神技试炼）。 |
| Skill.rarity | number | 稀有度权重，控制随机概率与重掷成本。 |
| PlayerSkill.skillId | string | 关联 Skill。 |
| PlayerSkill.level | number | 被动强化等级（提升数值或触发率）。 |
| PlayerSkill.mastery | number | 技能熟练度（影响被动触发稳定性）。 |
| PlayerSkill.acquiredAt | number | 学习时间，用于神技成就统计。 |

### 2.1 随机习得记录（SkillRoll）
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 记录唯一 ID。 |
| playerId | string | 对应玩家。 |
| level | number | 触发随机习得的角色等级。 |
| offeredSkills | string[] | 本次给出的技能候选（Skill.id）。 |
| chosenSkill | string | 玩家最终选择的技能。 |
| rerollCount | number | 重掷次数。 |
| source | 'level-up' / 'quest' / 'event' / 'trial' | 技能来源标记（神技掉落也记录为 'trial'）。 |
| timestamp | number | 发生时间。 |

### 2.2 原版五大神技复刻
| 原作命名* | 定位 | 被动效果范例 | 获取途径 | 设计备注 |
| --- | --- | --- | --- | --- |
| 神技·玄冥圣羽 | 防御/反击 | 固定体质 +30，受到暴击时 40% 几率触发“玄冥护盾”反弹 25% 伤害。 | 门派护法试炼（难度 S）首通奖励；排行榜月度前 5。 | 命名沿用原作玄冥系神技，表现为冰羽护盾特效。 |
| 神技·凌霄破云 | 爆发/追击 | 力量 +20%，触发连击后追加 120% 攻击力的追击并附带破甲。 | 神技残卷合成（活动、商店限购）+ 隐藏剧情。 | 致敬原作凌霄流派高爆发技能，加入企鹅振翅动画。 |
| 神技·霜羽奇术 | 控制/增益 | 智力 +25%，开局给予己方 3 层“霜羽祝福”提高闪避 15%，每回合衰减 1 层。 | PVE 试炼塔高层宝箱 + 限时活动。 | 原作奇术类神技复刻，兼顾视觉粒子与策略性。 |
| 神技·寒光诀 | 怒气/收割 | 敏捷 +18%，击败敌人后立刻获得 30% 攻击增益并清除负面状态。 | 本地排行榜赛季奖励 + 在线手动乐斗评分 S 评价。 | 奖励在线玩法，鼓励手动乐斗参与度。 |
| 神技·极冰镇世 | 生存/团队 | 体质 +20%，战斗开始时全队获得减伤 12% + 回合结束时恢复最大生命 4%。 | 联动活动兑换、神技试炼限定关卡。 | 再现原作团队增益类神技，支持后续多人扩展。 |

> *最终命名以原作官方档案为准，需在美术与法务确认后固化。

### 3. 属性成长（LevelCurve）
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| level | number | 等级。 |
| expToNext | number | 升级所需经验。 |
| baseAttrGain | { str: [number, number]; vit: [number, number]; agi: [number, number]; wis: [number, number] } | 每级四维随机增长区间（向原作致敬）。 |
| reward | { coins: number; honor: number; rerollToken?: number; godShard?: number } | 升级奖励（包括技能重掷券、神技碎片）。 |
| skillRollUnlock | boolean | 是否在该等级触发随机习得流程。 |

### 4. 关卡（Stage）
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 关卡 ID。 |
| name | string | 关卡名称（雪域/企鹅元素）。 |
| description | string | 剧情介绍。 |
| enemyTeam | EnemyConfig[] | 敌方阵容（属性、技能、AI）。 |
| reward | { exp: number; coins: number; honor: number; drops: DropTableItem[] } | 首胜与常规奖励。 |
| unlockCondition | UnlockCondition | 前置关卡、等级或任务。 |

### 5. 战斗记录（BattleLog）
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 战斗唯一 ID。 |
| timestamp | number | 战斗时间。 |
| type | 'story' / 'daily' / 'duel' / 'manual' | 战斗类型。 |
| playerSnapshot | CombatantSnapshot | 战斗开始时玩家属性与技能状态。 |
| opponentSnapshot | CombatantSnapshot | 敌方属性。 |
| rounds | RoundEvent[] | 回合事件序列。 |
| result | 'win' / 'lose' / 'draw' | 战斗结果。 |
| manualInputs | ManualCommand[] | 在线手动乐斗即时指令（目标选择、触发条件确认）。 |
| rewards | { exp: number; coins: number; honor: number; drops: ItemInstance[] } | 奖励结算。 |

### 5.1 在线手动乐斗状态（ManualBattleState）
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 状态唯一 ID。 |
| playerId | string | 玩家 ID。 |
| stageId | string | 关卡或对手标识。 |
| availableCommands | ManualCommand[] | 当前可用即时指令列表。 |
| cooldowns | Record<string, number> | 指令冷却剩余秒数。 |
| startAt | number | 战斗开始时间戳。 |
| expiresAt | number | 战斗超时时间（限制在线时长）。 |
| rewardPreview | { exp: number; coins: number; honor: number; bonus?: ItemInstance[] } | 预览奖励，用于界面展示。 |

### 6. 日常任务（DailyQuest）
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 任务 ID。 |
| title | string | 任务名称。 |
| description | string | 任务说明。 |
| target | QuestTarget | 完成条件。 |
| reward | { coins: number; honor?: number; itemId?: string } | 任务奖励。 |
| status | 'locked' / 'active' / 'completed' / 'claimed' | 任务状态。 |
| requiresOnline | boolean | 是否必须在线手动乐斗完成（如每日乐斗次数）。 |
| resetAt | number | 下次刷新时间。 |

### 7. 活动（Event）
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 活动 ID。 |
| name | string | 活动名称。 |
| type | 'trial' / 'festival' / 'promotion' | 活动分类。 |
| startAt | number | 开始时间。 |
| endAt | number | 结束时间。 |
| rules | string | 活动规则描述。 |
| rewards | EventReward[] | 活动奖励列表。 |
| progress | EventProgress | 玩家在活动中的进度。 |

