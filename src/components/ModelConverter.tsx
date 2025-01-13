import React, { useState, useCallback } from 'react';
import { Upload, FileJson, Download, Loader2, CheckCircle, XCircle, ChevronLeft, ChevronRight, Files } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import * as JSZip from 'jszip';

interface FileStatus {
  name: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  file?: File;
  result?: string;
}

type ConversionMode = 'single' | 'folder';

export default function ModelConverter() {
  const [mode, setMode] = useState<ConversionMode>('single');
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // 如果是文件夹模式，过滤出所有JSON文件
    const jsonFiles = mode === 'folder' 
      ? acceptedFiles.filter(file => file.name.endsWith('.json'))
      : acceptedFiles;

    const newFiles = jsonFiles.map(file => ({
      name: file.name,
      status: 'pending' as const,
      file: file
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, [mode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    multiple: mode === 'folder', // 文件夹模式允许多选
    noClick: mode === 'folder' // 文件夹模式下禁用点击（因为我们使用自定义按钮）
  });

  const convertSingleFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          
          const vertices: number[][] = [];
          const uvCoords: number[][] = [];
          const faces: number[][] = [];
          
          for (const mesh of jsonData.mesh) {
            let vertexOffset = vertices.length;
            
            for (const vertex of mesh.vertices) {
              vertices.push(vertex.pos);
              uvCoords.push([vertex.uvcoord[0], 1 - vertex.uvcoord[1]]);
            }
            
            for (let i = 0; i < mesh.indices.length; i += 3) {
              faces.push([
                mesh.indices[i] + vertexOffset + 1,
                mesh.indices[i + 1] + vertexOffset + 1,
                mesh.indices[i + 2] + vertexOffset + 1
              ]);
            }
          }
          
          const objParts = [];
          objParts.push(vertices.map(v => `v ${v[0]} ${v[1]} ${v[2]}`).join('\n'));
          objParts.push(uvCoords.map(uv => `vt ${uv[0]} ${uv[1]}`).join('\n'));
          objParts.push(faces.map(f => `f ${f[0]}/${f[0]} ${f[1]}/${f[1]} ${f[2]}/${f[2]}`).join('\n'));
          
          resolve(objParts.join('\n'));
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  };

  const convertFiles = async () => {
    setIsConverting(true);
    setDownloadReady(false);
    
    try {
      await Promise.all(
        files.map(async (fileStatus, index) => {
          if (!fileStatus.file) return;
          
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, status: 'processing' } : f
          ));
          
          try {
            const result = await convertSingleFile(fileStatus.file);
            setFiles(prev => prev.map((f, i) => 
              i === index ? { ...f, status: 'success', result } : f
            ));
          } catch (error) {
            setFiles(prev => prev.map((f, i) => 
              i === index ? { ...f, status: 'error', error: error.message } : f
            ));
          }
        })
      );
      
      setDownloadReady(true);
    } catch (error) {
      console.error('转换过程出错:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadResults = async () => {
    const zip = new JSZip();
    
    files.forEach(file => {
      if (file.status === 'success' && file.result) {
        const objFileName = file.name.replace('.json', '.obj');
        zip.file(objFileName, file.result);
      }
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_models.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFolderSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const jsonFiles = Array.from(files).filter(file => file.name.endsWith('.json'));
        onDrop(jsonFiles);
      }
    };
    
    input.click();
  };

  const totalPages = Math.ceil(files.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFiles = files.slice(startIndex, endIndex);

  const clearFiles = () => {
    setFiles([]);
    setDownloadReady(false);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          模型转换器
        </h1>
        <p className="text-gray-400 mt-2">将JSON模型文件转换为OBJ格式</p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
        {/* 模式切换按钮 */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => {
              setMode('single');
              clearFiles();
            }}
            className={`flex-1 px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 ${
              mode === 'single'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
            }`}
          >
            <FileJson className="h-5 w-5" />
            <span>单文件转换</span>
          </button>
          <button
            onClick={() => {
              setMode('folder');
              clearFiles();
            }}
            className={`flex-1 px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 ${
              mode === 'folder'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
            }`}
          >
            <Files className="h-5 w-5" />
            <span>文件夹转换</span>
          </button>
        </div>

        {/* 拖放区域 */}
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
          isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-blue-500/50'
        }`}>
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="flex justify-center">
              {mode === 'single' ? (
                <FileJson className="h-12 w-12 text-gray-400" />
              ) : (
                <Files className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-lg text-gray-300">
                {isDragActive ? '放开以添加文件' : (
                  mode === 'single' ? '拖放文件到此处，或点击选择文件' : '拖放文件夹到此处'
                )}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {mode === 'single' ? '支持单个 .json 文件' : '支持包含 .json 文件的文件夹'}
              </p>
              {mode === 'folder' && (
                <button
                  onClick={handleFolderSelect}
                  className="mt-4 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors duration-200"
                >
                  选择文件夹
                </button>
              )}
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              {currentFiles.map((file, index) => (
                <div
                  key={file.name + index}
                  className="bg-gray-900/50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <FileJson className="h-6 w-6 text-blue-400" />
                    <div>
                      <p className="text-gray-200">{file.name}</p>
                      {file.error && (
                        <p className="text-sm text-red-400 mt-1">{file.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === 'pending' && (
                      <div className="text-gray-400">等待转换</div>
                    )}
                    {file.status === 'processing' && (
                      <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                    {file.status === 'error' && (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="flex items-center text-gray-400">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={convertFiles}
                disabled={isConverting || files.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors duration-200"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>转换中...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>开始转换</span>
                  </>
                )}
              </button>
              <button
                onClick={downloadResults}
                disabled={!downloadReady}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors duration-200"
              >
                <Download className="h-5 w-5" />
                <span>下载转换结果</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}