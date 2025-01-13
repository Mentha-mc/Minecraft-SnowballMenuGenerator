import React, { useState } from 'react';
import { Box, Hammer, Menu, FileJson, Image as ImageIcon } from 'lucide-react';
import SnowballMenu from './components/SnowballMenu';
import ModelConverter from './components/ModelConverter';
import SkinHeadGenerator from './components/SkinHeadGenerator';

export default function App() {
  const [currentTool, setCurrentTool] = useState<string>('home');

  const tools = [
    {
      id: 'snowball-menu',
      name: '雪球菜单生成器',
      icon: <Menu className="h-6 w-6" />,
      description: '生成基于记分板的雪球菜单命令',
    },
    {
      id: 'model-converter',
      name: '模型转换器',
      icon: <FileJson className="h-6 w-6" />,
      description: '将JSON模型文件转换为OBJ格式',
    },
    {
      id: 'skin-head-generator',
      name: '皮肤头像生成器',
      icon: <ImageIcon className="h-6 w-6" />,
      description: '将 Minecraft 皮肤转换为高清头像',
    },
    {
      id: 'coming-soon',
      name: '更多工具即将推出',
      icon: <Hammer className="h-6 w-6" />,
      description: '敬请期待更多实用的命令工具',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-gray-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {currentTool === 'home' ? (
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center mb-4">
                <Box className="h-16 w-16 text-blue-400 animate-float" />
              </div>
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                我的世界指令工具箱
              </h1>
              <p className="text-gray-400 text-lg">by Mentha</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id)}
                  className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-gray-900/50 rounded-xl group-hover:bg-blue-900/20 transition-colors duration-300">
                      {tool.icon}
                    </div>
                    <h2 className="text-xl font-semibold text-blue-300">{tool.name}</h2>
                    <p className="text-gray-400">{tool.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center text-gray-400 mt-12">
              <p>更多工具正在开发中，敬请期待！</p>
            </div>
          </div>
        ) : currentTool === 'snowball-menu' ? (
          <div>
            <button
              onClick={() => setCurrentTool('home')}
              className="mb-8 px-4 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>← 返回工具箱</span>
            </button>
            <SnowballMenu />
          </div>
        ) : currentTool === 'model-converter' ? (
          <div>
            <button
              onClick={() => setCurrentTool('home')}
              className="mb-8 px-4 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>← 返回工具箱</span>
            </button>
            <ModelConverter />
          </div>
        ) : currentTool === 'skin-head-generator' ? (
          <div>
            <button
              onClick={() => setCurrentTool('home')}
              className="mb-8 px-4 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>← 返回工具箱</span>
            </button>
            <SkinHeadGenerator />
          </div>
        ) : null}
      </div>
    </div>
  );
}