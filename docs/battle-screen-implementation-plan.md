# 《大乐斗2》战斗界面复刻实现计划

> 目标：完全复刻《大乐斗2》Q宠大乐斗2的战斗体验（更清晰流畅的画面）
> 技术栈：React 18 + TypeScript + Tailwind CSS + Motion (Framer Motion) + Zustand
> 更新日期：2025年12月

---

## 一、原版《大乐斗2》战斗界面核心特征分析

### 1.1 界面布局
- **左右对战布局**：玩家角色在左侧，敌方角色在右侧
- **角色立绘区**：大尺寸企鹅角色立绘，带有待机动画
- **HP/气力条**：角色上方显示HP条和气力条
- **技能栏**：底部横向排列4-6个技能图标，带冷却遮罩
- **战斗日志**：右侧或底部滚动显示战斗文本
- **伤害数字**：攻击时在角色头顶弹出飘动数字

### 1.2 战斗流程
- **回合制**：速度属性决定先手
- **主动战斗**：玩家点击技能释放（左侧位置时）
- **被动战斗**：系统自动按技能槽顺序释放（右侧位置时）
- **快速战斗**：一键跳过动画直接出结果
- **自动战斗**：系统自动进行每回合，可观看动画

### 1.3 技能系统
- **主动技能**：物理/魔法/特技三类，需手动点击释放
- **被动技能（内功）**：攻击或被攻击时按几率自动触发
- **神技**：消耗10点气力，每场限用2次
- **气力消耗**：技能消耗3-30点不等

### 1.4 视觉效果
- **攻击动画**：角色冲刺、挥舞武器
- **技能特效**：粒子效果、光效、震屏
- **状态图标**：暴怒/金刚/附灵等状态buff图标
- **伤害数字**：普通白色、暴击红色放大、治疗绿色
- **连击提示**：连续攻击时显示连击数

---

## 二、技术架构设计（2025最佳实践）

### 2.1 动画方案选择

| 场景 | 推荐方案 | 理由 |
|-----|---------|------|
| UI过渡（HP条、菜单） | Motion (Framer Motion) | 声明式、React友好、自动布局动画 |
| 角色动作序列 | CSS Animations + Motion | 性能好、可GPU加速 |
| 伤害数字飘动 | Motion + AnimatePresence | 自动处理入场/退场动画 |
| 技能特效粒子 | CSS + Canvas (可选) | 轻量、高性能 |
| 震屏效果 | CSS transform + Motion | 简单高效 |

### 2.2 项目结构扩展

```
src/
├── components/
│   └── battle/
│       ├── BattleScreen.tsx        # 战斗主容器
│       ├── BattleStage.tsx         # 战斗舞台（背景+角色区）
│       ├── CharacterSprite.tsx     # 角色精灵（立绘+动画）
│       ├── HealthBar.tsx           # HP条组件
│       ├── EnergyBar.tsx           # 气力条组件
│       ├── SkillBar.tsx            # 技能栏容器
│       ├── SkillButton.tsx         # 单个技能按钮
│       ├── DamageNumber.tsx        # 伤害数字飘字
│       ├── BattleLog.tsx           # 战斗日志面板
│       ├── StatusEffects.tsx       # 状态效果图标组
│       ├── TurnIndicator.tsx       # 回合指示器
│       ├── BattleResult.tsx        # 战斗结算面板
│       ├── QuickBattleButton.tsx   # 快速战斗按钮
│       └── index.ts                # 导出入口
├── hooks/
│   └── battle/
│       ├── useBattleAnimation.ts   # 战斗动画控制
│       ├── useBattlePlayback.ts    # 战斗回放控制
│       ├── useDamageNumbers.ts     # 伤害数字管理
│       └── useSkillCooldown.ts     # 技能冷却管理
├── animations/
│   ├── battleMotions.ts            # Motion变体定义
│   ├── damageStyles.ts             # 伤害数字样式
│   └── characterAnimations.ts      # 角色动画关键帧
├── assets/
│   └── battle/
│       ├── backgrounds/            # 战斗背景图
│       ├── characters/             # 角色立绘
│       ├── effects/                # 技能特效图
│       └── ui/                     # UI素材
└── types/
    └── battle.ts                   # 战斗相关类型定义
```

### 2.3 状态管理扩展

```typescript
// 战斗UI状态（独立于游戏逻辑状态）
interface BattleUIState {
  // 回放控制
  playbackState: 'idle' | 'playing' | 'paused' | 'finished';
  playbackSpeed: 1 | 2 | 4;
  currentTurnIndex: number;

  // 动画队列
  animationQueue: BattleAnimation[];
  isAnimating: boolean;

  // 显示状态
  heroDisplayHp: number;
  enemyDisplayHp: number;
  damageNumbers: DamageNumberData[];
  activeEffects: EffectData[];

  // 交互状态
  selectedSkillId: string | null;
  canInteract: boolean;
}
```

---

## 三、最小颗粒度任务分解（按实现顺序）

### 阶段一：基础架构搭建 (Foundation)

#### 1.1 类型定义与数据结构
- [ ] **T1.1.1** 创建 `src/types/battle.ts` - 战斗UI类型定义
  - BattleUIState 接口
  - BattleAnimation 接口
  - DamageNumberData 接口
  - EffectData 接口
  - CharacterDisplayState 接口

- [ ] **T1.1.2** 扩展 `src/domain/models.ts` - 添加战斗动画相关类型
  - AnimationType 枚举 (attack/skill/damage/heal/buff/debuff)
  - ScreenEffect 枚举 (shake/flash/none)

#### 1.2 动画基础设施
- [ ] **T1.2.1** 安装 Motion 依赖
  ```bash
  npm install motion
  ```

- [ ] **T1.2.2** 创建 `src/animations/battleMotions.ts` - Motion变体定义
  - characterIdle: 待机呼吸动画
  - characterAttack: 攻击冲刺动画
  - characterHit: 受击后退动画
  - characterDeath: 死亡倒下动画

- [ ] **T1.2.3** 创建 `src/animations/damageStyles.ts` - 伤害数字样式
  - normalDamage: 普通伤害（白色）
  - criticalDamage: 暴击伤害（红色放大）
  - healAmount: 治疗（绿色）
  - missText: 未命中（灰色"MISS"）

- [ ] **T1.2.4** 创建 `src/animations/characterAnimations.ts` - CSS关键帧
  - @keyframes breathe - 呼吸动画
  - @keyframes attack-left - 左侧角色攻击
  - @keyframes attack-right - 右侧角色攻击
  - @keyframes shake - 受击震动

#### 1.3 战斗UI状态管理
- [ ] **T1.3.1** 创建 `src/state/battleUIStore.ts` - 战斗UI状态
  - 回放状态管理
  - 动画队列管理
  - 显示HP同步
  - 伤害数字列表管理

- [ ] **T1.3.2** 创建 `src/hooks/battle/useBattlePlayback.ts` - 回放控制Hook
  - play(): 开始/继续回放
  - pause(): 暂停回放
  - setSpeed(speed): 设置倍速
  - reset(): 重置回放
  - skipToEnd(): 跳到结束

---

### 阶段二：核心组件开发 (Core Components)

#### 2.1 战斗舞台
- [ ] **T2.1.1** 创建 `src/components/battle/BattleStage.tsx` - 战斗舞台
  - 战斗背景渲染（渐变/图片）
  - 左右角色位置容器
  - 响应式布局（移动端适配）
  - 震屏效果容器

- [ ] **T2.1.2** 创建 `src/assets/battle/backgrounds/` - 背景素材
  - 默认战斗背景（CSS渐变实现）
  - 预留图片背景接口

#### 2.2 角色精灵
- [ ] **T2.2.1** 创建 `src/components/battle/CharacterSprite.tsx` - 角色精灵
  - 角色立绘显示（企鹅造型）
  - 待机动画（呼吸效果）
  - 攻击动画状态
  - 受击动画状态
  - 死亡动画状态
  - 左/右位置镜像处理

- [ ] **T2.2.2** 创建占位角色立绘
  - CSS绘制简易企鹅轮廓
  - 或使用emoji/SVG作为临时素材

#### 2.3 HP条和气力条
- [ ] **T2.3.1** 创建 `src/components/battle/HealthBar.tsx` - HP条
  - 当前HP/最大HP显示
  - HP变化动画（平滑过渡）
  - HP阶段颜色变化（绿→黄→红）
  - 低HP闪烁警告效果

- [ ] **T2.3.2** 创建 `src/components/battle/EnergyBar.tsx` - 气力条
  - 当前气力/最大气力显示
  - 气力消耗/恢复动画
  - 气力不足灰显状态

#### 2.4 伤害数字
- [ ] **T2.4.1** 创建 `src/components/battle/DamageNumber.tsx` - 单个伤害数字
  - 数字弹出动画（上浮+缩放）
  - 普通/暴击/治疗/未命中样式
  - 自动消失（AnimatePresence）

- [ ] **T2.4.2** 创建 `src/hooks/battle/useDamageNumbers.ts` - 伤害数字管理
  - addDamageNumber(data): 添加新数字
  - 自动清理过期数字
  - 数字位置偏移防重叠

- [ ] **T2.4.3** 创建 `src/components/battle/DamageNumberLayer.tsx` - 伤害数字层
  - 管理多个同时显示的伤害数字
  - z-index层级管理

---

### 阶段三：技能系统UI (Skill System)

#### 3.1 技能栏
- [ ] **T3.1.1** 创建 `src/components/battle/SkillBar.tsx` - 技能栏容器
  - 横向技能按钮布局
  - 普通攻击按钮
  - 技能按钮组（4-6个）
  - 移动端适配（可滚动/缩放）

- [ ] **T3.1.2** 创建 `src/components/battle/SkillButton.tsx` - 技能按钮
  - 技能图标显示
  - 技能名称tooltip
  - 冷却遮罩（扇形/数字倒计时）
  - 气力不足禁用状态
  - 点击/hover效果
  - 快捷键提示（1-4/空格）

- [ ] **T3.1.3** 创建 `src/hooks/battle/useSkillCooldown.ts` - 冷却管理
  - 技能冷却状态追踪
  - 冷却倒计时更新
  - 可用技能判断

#### 3.2 技能特效
- [ ] **T3.2.1** 创建 `src/components/battle/SkillEffect.tsx` - 技能特效
  - 特效动画播放
  - 特效位置（施法者/目标）
  - 特效持续时间控制

- [ ] **T3.2.2** 创建基础技能特效CSS
  - 普通攻击光效
  - 技能释放光环
  - 命中闪光效果

---

### 阶段四：战斗流程控制 (Battle Flow)

#### 4.1 回合系统
- [ ] **T4.1.1** 创建 `src/components/battle/TurnIndicator.tsx` - 回合指示器
  - 当前回合数显示
  - 当前行动方指示（玩家/敌方）
  - 回合切换动画

- [ ] **T4.1.2** 创建 `src/hooks/battle/useBattleAnimation.ts` - 动画控制
  - 动画队列处理
  - 动画间隔控制（基于倍速）
  - 动画完成回调
  - 跳过动画处理

#### 4.2 战斗日志
- [ ] **T4.2.1** 创建 `src/components/battle/BattleLog.tsx` - 战斗日志
  - 滚动日志容器
  - 日志条目动画入场
  - 关键事件高亮（暴击/神技/击杀）
  - 可展开/收起

- [ ] **T4.2.2** 创建 `src/components/battle/BattleLogEntry.tsx` - 日志条目
  - 回合号显示
  - 行动者图标
  - 行动描述文本
  - 伤害/效果数值

#### 4.3 状态效果
- [ ] **T4.3.1** 创建 `src/components/battle/StatusEffects.tsx` - 状态效果组
  - Buff/Debuff图标显示
  - 状态层数显示
  - 状态剩余时间
  - 状态tooltip说明

- [ ] **T4.3.2** 创建 `src/components/battle/StatusIcon.tsx` - 单个状态图标
  - 图标样式（增益绿边/减益红边）
  - 层数角标
  - 闪烁即将消失提示

---

### 阶段五：战斗控制面板 (Battle Controls)

#### 5.1 战斗控制按钮
- [ ] **T5.1.1** 创建 `src/components/battle/BattleControls.tsx` - 控制面板
  - 自动战斗开关
  - 倍速切换（1x/2x/4x）
  - 暂停/继续按钮
  - 跳过战斗按钮

- [ ] **T5.1.2** 创建 `src/components/battle/QuickBattleButton.tsx` - 快速战斗
  - 一键跳过所有动画
  - 直接显示结果
  - 确认提示（可选）

#### 5.2 战斗结算
- [ ] **T5.2.1** 创建 `src/components/battle/BattleResult.tsx` - 结算面板
  - 胜利/失败状态显示
  - 战斗统计（总伤害/回合数/暴击次数）
  - 奖励展示动画
  - 继续/重试按钮

- [ ] **T5.2.2** 创建 `src/components/battle/RewardDisplay.tsx` - 奖励展示
  - 经验值获取动画
  - 银两获取动画
  - 道具掉落动画
  - 升级提示

---

### 阶段六：战斗主界面集成 (Integration)

#### 6.1 战斗主容器
- [ ] **T6.1.1** 创建 `src/components/battle/BattleScreen.tsx` - 战斗主容器
  - 整合所有战斗组件
  - 布局管理（舞台/技能栏/日志）
  - 全屏模式支持
  - 响应式适配

- [ ] **T6.1.2** 创建 `src/components/battle/index.ts` - 导出入口
  - 统一导出所有战斗组件

#### 6.2 战斗流程集成
- [ ] **T6.2.1** 修改 `src/pages/PlayPage.tsx` - 集成战斗界面
  - 战斗模式状态管理
  - 战斗开始/结束流程
  - 战斗界面与主界面切换动画

- [ ] **T6.2.2** 修改 `src/state/gameStore.ts` - 战斗状态集成
  - 战斗中状态标记
  - 战斗结果处理
  - 奖励发放整合

---

### 阶段七：战斗回放系统 (Replay System)

#### 7.1 回放核心
- [ ] **T7.1.1** 创建 `src/hooks/battle/useBattleReplay.ts` - 回放Hook
  - 从BattleRecord解析动画序列
  - 逐帧回放控制
  - 时间轴跳转

- [ ] **T7.1.2** 扩展 `src/domain/battle.ts` - 回放数据结构
  - 为TurnLogEntry添加动画提示
  - 添加技能特效标记
  - 添加屏幕效果标记

#### 7.2 回放增强
- [ ] **T7.2.1** 创建 `src/components/battle/ReplayControls.tsx` - 回放控制
  - 时间轴滑块
  - 回合快速跳转
  - 倍速控制
  - 全屏观看

- [ ] **T7.2.2** 修改 `src/pages/LogPage.tsx` - 日志页面集成回放
  - 战斗记录列表
  - 点击回放功能
  - 回放界面入口

---

### 阶段八：视觉增强 (Visual Polish)

#### 8.1 特效增强
- [ ] **T8.1.1** 创建 `src/animations/screenEffects.ts` - 屏幕效果
  - 震屏效果（受击/暴击）
  - 闪白效果（暴击）
  - 暗角效果（低HP警告）
  - 胜利/失败全屏效果

- [ ] **T8.1.2** 创建 `src/components/battle/ScreenEffectLayer.tsx` - 效果层
  - 全屏效果渲染
  - 效果叠加管理
  - 效果优先级

#### 8.2 音效预留
- [ ] **T8.2.1** 创建 `src/hooks/battle/useBattleSound.ts` - 音效Hook（接口预留）
  - 音效播放接口
  - 音效配置结构
  - 静音控制

- [ ] **T8.2.2** 创建 `src/config/soundConfig.ts` - 音效配置
  - 攻击音效映射
  - 技能音效映射
  - UI音效映射

#### 8.3 主题样式
- [ ] **T8.3.1** 扩展 `tailwind.config.ts` - 战斗主题颜色
  - HP颜色系列（健康/警告/危险）
  - 伤害颜色系列（普通/暴击/治疗）
  - 技能品质颜色（普通/稀有/神技）

- [ ] **T8.3.2** 创建 `src/styles/battle.css` - 战斗专用样式
  - 战斗背景样式
  - 技能按钮样式
  - 伤害数字字体

---

### 阶段九：性能优化 (Performance)

#### 9.1 渲染优化
- [ ] **T9.1.1** 组件memo优化
  - React.memo包装静态组件
  - useMemo优化计算值
  - useCallback优化回调函数

- [ ] **T9.1.2** 动画性能优化
  - 使用transform代替位置属性
  - 启用GPU加速（will-change）
  - 减少重排重绘

#### 9.2 内存优化
- [ ] **T9.2.1** 伤害数字池化
  - 对象池复用DamageNumber实例
  - 自动回收超时数字

- [ ] **T9.2.2** 动画队列优化
  - 限制同时动画数量
  - 自动清理完成动画

---

### 阶段十：测试与文档 (Testing & Docs)

#### 10.1 单元测试
- [ ] **T10.1.1** 创建 `src/components/battle/__tests__/` - 组件测试
  - HealthBar渲染测试
  - SkillButton交互测试
  - DamageNumber动画测试

- [ ] **T10.1.2** 创建 `src/hooks/battle/__tests__/` - Hook测试
  - useBattlePlayback测试
  - useDamageNumbers测试
  - useSkillCooldown测试

#### 10.2 集成测试
- [ ] **T10.2.1** 战斗流程集成测试
  - 完整战斗回放测试
  - 技能使用流程测试
  - 结算流程测试

#### 10.3 文档
- [ ] **T10.3.1** 更新README - 战斗系统说明
- [ ] **T10.3.2** 创建组件API文档

---

## 四、任务优先级与依赖关系

```
阶段一 ─┬─► 阶段二 ─┬─► 阶段四 ─► 阶段六 ─► 阶段七
        │          │
        │          └─► 阶段三 ─┘
        │
        └─► 阶段五 ───────────┘

阶段六 ─► 阶段八 ─► 阶段九 ─► 阶段十
```

### 关键路径（Critical Path）
1. **T1.2.1** → **T1.2.2** → **T2.2.1** → **T2.3.1** → **T2.4.1** → **T6.1.1**

### MVP最小可行产品（建议首批完成）
- 阶段一全部
- 阶段二全部
- T3.1.1, T3.1.2
- T4.1.1, T4.1.2, T4.2.1
- T5.2.1
- T6.1.1, T6.2.1

---

## 五、技术实现要点

### 5.1 Motion (Framer Motion) 使用示例

```tsx
// 伤害数字组件示例
import { motion, AnimatePresence } from 'motion/react';

const DamageNumber: React.FC<{ damage: number; isCritical: boolean }> = ({ damage, isCritical }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{
        opacity: [1, 1, 0],
        y: -60,
        scale: isCritical ? [0.5, 1.5, 1.2] : [0.5, 1.1, 1]
      }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className={`absolute font-bold ${isCritical ? 'text-red-500 text-3xl' : 'text-white text-xl'}`}
    >
      {isCritical && <span className="text-yellow-400">暴击!</span>}
      {damage}
    </motion.div>
  );
};
```

### 5.2 HP条动画示例

```tsx
// HP条组件示例
import { motion } from 'motion/react';

const HealthBar: React.FC<{ current: number; max: number }> = ({ current, max }) => {
  const percentage = (current / max) * 100;
  const color = percentage > 50 ? 'bg-green-500' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
      <motion.div
        className={`h-full ${color}`}
        initial={false}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      <span className="absolute text-xs text-white">{current}/{max}</span>
    </div>
  );
};
```

### 5.3 战斗回放控制示例

```typescript
// 战斗回放Hook示例
function useBattlePlayback(battleRecord: BattleRecord) {
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTurn(prev => {
        if (prev >= battleRecord.turns.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, battleRecord.turns.length]);

  return { currentTurn, isPlaying, speed, setIsPlaying, setSpeed, setCurrentTurn };
}
```

---

## 六、资源需求

### 6.1 必需资源
- [ ] 企鹅角色立绘（至少2套：玩家/敌人）
- [ ] 战斗背景图（至少3种场景）
- [ ] 技能图标（至少10个）
- [ ] UI装饰素材（边框、按钮等）

### 6.2 可选资源（首期可用CSS/SVG替代）
- [ ] 技能特效动画
- [ ] 角色攻击帧动画
- [ ] 音效资源

### 6.3 临时替代方案
- 使用CSS绘制简易角色轮廓
- 使用emoji或SVG作为临时图标
- 使用CSS渐变作为临时背景
- 使用Tailwind内置颜色和阴影模拟特效

---

## 七、里程碑检查点

### Milestone 1: 基础战斗展示（预计2-3天）
- [x] 动画库集成
- [ ] 战斗舞台渲染
- [ ] 角色占位显示
- [ ] HP条基础显示

### Milestone 2: 战斗动画回放（预计3-4天）
- [ ] 伤害数字飘动
- [ ] 回合动画播放
- [ ] 战斗日志显示

### Milestone 3: 技能系统UI（预计2-3天）
- [ ] 技能栏显示
- [ ] 冷却效果
- [ ] 技能点击交互

### Milestone 4: 完整战斗流程（预计2-3天）
- [ ] 战斗开始过渡
- [ ] 战斗结算面板
- [ ] 奖励展示

### Milestone 5: 视觉打磨（预计2-3天）
- [ ] 震屏/闪光效果
- [ ] 状态图标
- [ ] 主题美化

---

## 八、参考资料

- [Motion官方文档](https://motion.dev/docs/react)
- [《大乐斗Ⅱ》百度百科](https://baike.baidu.com/item/大乐斗Ⅱ/3037584)
- [RPGUI - RPG风格HTML UI框架](https://ronenness.github.io/RPGUI/)
- [Web Game Dev - HTML/CSS UI指南](https://www.webgamedev.com/graphics/html-css-ui)

---

> 本计划采用最小颗粒度任务分解，每个任务可在1-4小时内完成。
> 建议按阶段顺序实现，优先完成MVP所需任务。
> 持续迭代优化，逐步接近原版《大乐斗2》体验。
