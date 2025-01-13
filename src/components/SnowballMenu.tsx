import React, { useState } from 'react';
import { Trash2, Plus, Code2, Box, Copy, Check, Wand2 } from 'lucide-react';
import MinecraftText from './MinecraftText';

interface MenuItem {
  text: string;
  command: string;
}

interface CommandPreset {
  text: string;
  command: string;
  category: string;
}

const commandPresets: CommandPreset[] = [
  // 传送类
  { text: "随机传送", command: "spreadplayers ~ ~ 0 1000 false @s", category: "传送" },
  
  // 游戏模式
  { text: "切换生存模式", command: "gamemode survival", category: "游戏模式" },
  { text: "切换创造模式", command: "gamemode creative", category: "游戏模式" },
  { text: "切换冒险模式", command: "gamemode adventure", category: "游戏模式" },
  { text: "切换旁观模式", command: "gamemode spectator", category: "游戏模式" },
  
  // 时间天气
  { text: "设置白天", command: "time set day", category: "时间天气" },
  { text: "设置夜晚", command: "time set night", category: "时间天气" },
  { text: "设置晴天", command: "weather clear", category: "时间天气" },
  { text: "设置雨天", command: "weather rain", category: "时间天气" },
  { text: "设置雷暴", command: "weather thunder", category: "时间天气" },
  
  // 效果
  { text: "清除所有效果", command: "effect clear @s", category: "效果" },
  { text: "夜视效果", command: "effect give @s night_vision 999999 1 true", category: "效果" },
  { text: "速度效果", command: "effect give @s speed 999999 1 true", category: "效果" },
  { text: "跳跃提升", command: "effect give @s jump_boost 999999 1 true", category: "效果" },
  
  // 实用
  { text: "自杀", command: "kill @s", category: "实用" },
  { text: "清空背包", command: "clear @s", category: "实用" },
  { text: "满血满饱", command: "effect give @s instant_health 1 255 true", category: "实用" },
  { text: "经验+30", command: "xp add @s 30 levels", category: "实用" }
];

export default function SnowballMenu() {
  const [scoreboardName, setScoreboardName] = useState('');
  const [headTitle, setHeadTitle] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('§e§l');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCommand, setNewItemCommand] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedItem, setSelectedItem] = useState(0);
  const [showPresets, setShowPresets] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  const categories = ['全部', ...Array.from(new Set(commandPresets.map(p => p.category)))];

  const filteredPresets = commandPresets.filter(preset => 
    selectedCategory === '全部' || preset.category === selectedCategory
  );

  const generateCommand = () => {
    // 生成初始化命令
    const initCommands = [
      `scoreboard objectives add ${scoreboardName} dummy`
    ].join('\n');

    // 生成循环命令（显示菜单）
    let menuCommand = `/execute as @a[scores={${scoreboardName}=1..}] run titleraw @s actionbar {"rawtext":[{"text":"${headTitle}\\n——————————\\n"}`;

    // 添加菜单项
    const menuTexts = menuItems.map(item => item.text);
    for (let i = 0; i < menuTexts.length; i++) {
      menuCommand += `,{"translate":"§r§f%%5${menuTexts[i]}","with":{"rawtext":[{"selector":"@s[scores={${scoreboardName}=${i + 1}}]}"},{"text":"${selectedStyle}"}]}}`;
      if (i < menuTexts.length - 1) {
        menuCommand += ',{"text":"\\n"}';
      }
    }

    menuCommand += ',{"text":"\\n——————————"}]}';

    // 生成连锁命令（执行操作）
    const chainCommands = menuItems.map((item, index) => 
      `execute as @a[scores={${scoreboardName}=${index + 1}}] at @s run ${item.command}`
    ).join('\n');

    // 雪球检测和重置命令
    const detectCommands = [
      `execute at @e[type=snowball] run scoreboard players add @p[r=2] ${scoreboardName} 1`,
      `execute as @a[scores={${scoreboardName}=!0},rxm=88] run scoreboard players set @s ${scoreboardName} 0`
    ].join('\n');

    // 组合最终结果
    setResult(
      `# 初始化命令（仅需执行一次）：\n${initCommands}\n\n` +
      `# 循环命令块 片段（无条件，保持活动）：\n${menuCommand}\n\n` +
      `# 循环命令块 片段（无条件，保持活动）：\n${detectCommands}\n\n` +
      `# 连锁命令块（无条件，保持活动）：\n${chainCommands}`
    );
  };

  const addMenuItem = () => {
    if (newItemText.trim() && newItemCommand.trim()) {
      setMenuItems([...menuItems, {
        text: newItemText.trim(),
        command: newItemCommand.trim()
      }]);
      setNewItemText('');
      setNewItemCommand('');
    }
  };

  const addPreset = (preset: CommandPreset) => {
    setMenuItems([...menuItems, preset]);
  };

  const removeMenuItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          雪球菜单生成器
        </h1>
        <p className="text-gray-400 mt-2">扔雪球打开菜单，低头关闭菜单</p>
      </div>

      {/* 其余 JSX 代码保持不变 */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 border border-gray-700/50">
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-300">记分板名称</label>
              <input
                type="text"
                value={scoreboardName}
                onChange={(e) => setScoreboardName(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="输入记分板名称"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-300">菜单标题</label>
              <input
                type="text"
                value={headTitle}
                onChange={(e) => setHeadTitle(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="输入菜单标题"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-300">选中样式</label>
            <div className="space-y-3">
              <input
                type="text"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="输入选中样式（默认为§e§l）"
              />
              <div className="bg-gray-900/75 rounded-xl p-4 border border-gray-700/50">
                <div className="text-sm text-gray-400 mb-2">样式预览：</div>
                <div className="font-minecraft">
                  <MinecraftText text={`§r${selectedStyle}示例文本`} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-blue-300">菜单项目</label>
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors duration-200"
              >
                <Wand2 className="h-4 w-4" />
                <span>使用预设</span>
              </button>
            </div>

            {showPresets && (
              <div className="bg-gray-900/75 rounded-xl p-6 border border-gray-700/50 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => addPreset(preset)}
                      className="text-left bg-gray-800/50 hover:bg-gray-700/50 p-4 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-all duration-200"
                    >
                      <div className="text-blue-300 font-medium mb-1">{preset.text}</div>
                      <div className="text-gray-400 text-sm truncate">{preset.command}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="输入显示文本"
              />
              <input
                type="text"
                value={newItemCommand}
                onChange={(e) => setNewItemCommand(e.target.value)}
                className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="输入执行命令"
              />
            </div>
            <button
              onClick={addMenuItem}
              className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>添加菜单项</span>
            </button>

            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between bg-gray-900/50 border border-gray-700 rounded-xl px-5 py-3 group hover:border-blue-500/50 transition-all duration-200"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <span className="text-gray-200">{item.text}</span>
                    <span className="text-gray-400">{item.command}</span>
                  </div>
                  <button
                    onClick={() => removeMenuItem(index)}
                    className="text-gray-500 hover:text-red-400 transition-colors duration-200"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={generateCommand}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-4 rounded-xl flex items-center justify-center space-x-3 text-lg font-medium transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Code2 className="h-6 w-6" />
            <span>生成命令</span>
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-blue-300">生成的命令</h2>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors duration-200"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-green-400">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  <span>复制命令</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900/75 rounded-xl p-6 overflow-x-auto border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-4">菜单预览：</div>
              <div className="bg-gray-950/50 rounded-lg p-4 border border-gray-800/50">
                <div className="text-center space-y-2">
                  <MinecraftText text={headTitle} />
                  <div className="text-gray-500">——————————</div>
                  <div className="space-y-1">
                    {menuItems.map((item, index) => (
                      <div key={index}>
                        <MinecraftText 
                          text={index === selectedItem ? `${selectedStyle}${item.text}` : `§r§f${item.text}`} 
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-gray-500">——————————</div>
                </div>
              </div>
              <div className="mt-4 flex justify-center space-x-2">
                <button
                  onClick={() => setSelectedItem(Math.max(0, selectedItem - 1))}
                  className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm"
                  disabled={selectedItem === 0}
                >
                  上一项
                </button>
                <button
                  onClick={() => setSelectedItem(Math.min(menuItems.length - 1, selectedItem + 1))}
                  className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm"
                  disabled={selectedItem >= menuItems.length - 1}
                >
                  下一项
                </button>
              </div>
            </div>

            <div className="bg-gray-900/75 rounded-xl p-6 overflow-x-auto border border-gray-700/50">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{result}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}