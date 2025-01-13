import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export default function SkinHeadGenerator() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSparkle, setShowSparkle] = useState(false);

  const generateHead = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setShowSparkle(false);

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('图片加载失败'));
      });

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;

      // 设置画布参数
      canvas.width = 1000;
      canvas.height = 1000;
      ctx.imageSmoothingEnabled = false;

      // 计算头部参数
      const headWidth = img.width / 8;
      const headX = 8;
      const headY = 8;
      
      // 计算渲染参数
      const extraSize = 125;
      const baseSize = 875;
      const overlaySize = baseSize + extraSize;
      const margin = 62.5;

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制基础层（头部）
      ctx.drawImage(
        img,
        headX, headY,
        8, 8,
        margin, margin,
        baseSize, baseSize
      );

      // 绘制覆盖层（帽子层）
      ctx.drawImage(
        img,
        headX + 32, headY,
        8, 8,
        0, 0,
        overlaySize, overlaySize
      );

      // 更新预览
      setPreview(canvas.toDataURL('image/png'));
      setShowSparkle(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '处理过程中出现错误');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith('image/png')) {
      setError('请上传 PNG 格式的皮肤文件');
      return;
    }

    await generateHead(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png']
    },
    multiple: false
  });

  const downloadHead = () => {
    if (!preview) return;

    const link = document.createElement('a');
    link.href = preview;
    link.download = 'minecraft-head.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-block p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full animate-float">
          <ImageIcon className="h-12 w-12 text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          皮肤头像生成器
        </h1>
        <p className="text-gray-400">将 Minecraft 皮肤转换为高清头像</p>
      </div>

      <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-xl">
        {/* 上传区域 */}
        <div
          {...getRootProps()}
          className={`relative overflow-hidden border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            isDragActive 
              ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' 
              : 'border-gray-700 hover:border-blue-500/50 hover:scale-[1.01]'
          }`}
        >
          <input {...getInputProps()} />
          <div className="relative z-10 space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full">
                <ImageIcon className="h-12 w-12 text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-lg text-gray-300">
                {isDragActive ? '放开以添加皮肤' : '拖放皮肤文件到此处，或点击选择文件'}
              </p>
              <p className="text-sm text-gray-500 mt-2">仅支持 PNG 格式的 Minecraft 皮肤文件</p>
            </div>
          </div>
          {isDragActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-gradient" />
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 rounded-xl">
            <p className="text-red-400 flex items-center gap-2">
              <span className="flex-shrink-0">⚠️</span>
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* 预览和下载区域 */}
        {(isProcessing || preview) && (
          <div className="mt-8 space-y-6">
            {/* 预览 */}
            <div className="flex justify-center">
              {isProcessing ? (
                <div className="w-64 h-64 flex items-center justify-center bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl">
                  <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                </div>
              ) : preview ? (
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-[28px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <img
                      src={preview}
                      alt="头像预览"
                      className="w-64 h-64 rounded-xl image-pixelated transition-transform duration-300 group-hover:scale-[1.02] shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                    {showSparkle && (
                      <Sparkles className="absolute top-2 right-2 h-6 w-6 text-yellow-400 animate-pulse" />
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* 下载按钮 */}
            {preview && !isProcessing && (
              <button
                onClick={downloadHead}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
              >
                <Download className="h-5 w-5" />
                <span>下载头像</span>
              </button>
            )}
          </div>
        )}

        {/* 隐藏的 Canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}