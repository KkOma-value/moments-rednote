'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Smartphone, Monitor, Wand2, MessageCircle, Heart, History, ChevronDown, Sparkles, Zap, X, Loader2 } from 'lucide-react';
import { Platform, DeviceMode, PreviewData, HistoryItem, GeneratedContent } from '@/types';
import { STYLES, PRODUCTS } from '@/lib/constants';
import { WeChatPreview, RedNotePreview } from '@/components/PreviewRenderers';

// Platform-specific styling configuration
const PLATFORM_COLORS = {
  [Platform.WeChat]: {
    primary: 'emerald',
    secondary: 'teal',
    gradientFrom: 'from-emerald-400',
    gradientTo: 'to-teal-500',
    bgGradient: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    bgGradientHover: 'hover:from-emerald-400 hover:to-teal-400',
    shadow: 'shadow-emerald-500/25',
    bgClass: 'bg-mesh-gradient-wechat',
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-400',
    pillBg: 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 shadow-lg shadow-emerald-500/20',
    glowClass: 'glow-wechat',
  },
  [Platform.RedNote]: {
    primary: 'rose',
    secondary: 'pink',
    gradientFrom: 'from-rose-400',
    gradientTo: 'to-pink-500',
    bgGradient: 'bg-gradient-to-r from-rose-500 to-pink-500',
    bgGradientHover: 'hover:from-rose-400 hover:to-pink-400',
    shadow: 'shadow-rose-500/25',
    bgClass: 'bg-mesh-gradient-rednote',
    iconBg: 'bg-rose-500/20',
    iconText: 'text-rose-400',
    pillBg: 'bg-gradient-to-r from-rose-500/30 to-pink-500/30 shadow-lg shadow-rose-500/20',
    glowClass: 'glow-rednote',
  },
} as const;

function getPlatformColors(platform: Platform) {
  return PLATFORM_COLORS[platform];
}

interface PlatformToggleProps {
  currentPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

function PlatformToggle({ currentPlatform, onPlatformChange }: PlatformToggleProps) {
  const isWeChat = currentPlatform === Platform.WeChat;
  const colors = getPlatformColors(currentPlatform);

  return (
    <div className="relative">
      <div className="glass rounded-2xl p-1.5 flex relative">
        <div
          className={`absolute top-1.5 h-[calc(100%-12px)] w-[calc(50%-6px)] rounded-xl transition-all duration-500 ease-out ${isWeChat ? 'left-1.5' : 'left-[calc(50%+1.5px)]'
            } ${colors.pillBg}`}
        />
        <button
          onClick={() => onPlatformChange(Platform.WeChat)}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold z-10 transition-all duration-300 flex items-center justify-center gap-2 ${isWeChat ? colors.iconText : 'text-white/50 hover:text-white/70'
            }`}
        >
          <MessageCircle size={16} className={isWeChat ? 'fill-emerald-400/30' : ''} />
          WeChat
        </button>
        <button
          onClick={() => onPlatformChange(Platform.RedNote)}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold z-10 transition-all duration-300 flex items-center justify-center gap-2 ${!isWeChat ? colors.iconText : 'text-white/50 hover:text-white/70'
            }`}
        >
          <Heart size={16} className={!isWeChat ? 'fill-rose-400/30' : ''} />
          RedNote
        </button>
      </div>
    </div>
  );
}

interface DeviceToggleButtonProps {
  currentDevice: DeviceMode;
  targetDevice: DeviceMode;
  onDeviceChange: (device: DeviceMode) => void;
  icon: React.ComponentType<{ size?: number }>;
  title: string;
}

function DeviceToggleButton({ currentDevice, targetDevice, onDeviceChange, icon: Icon, title }: DeviceToggleButtonProps) {
  const isActive = currentDevice === targetDevice;

  return (
    <button
      onClick={() => onDeviceChange(targetDevice)}
      className={`p-2.5 rounded-lg transition-all duration-300 ${isActive
          ? 'bg-white/15 text-white shadow-sm'
          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
        }`}
      title={title}
    >
      <Icon size={16} />
    </button>
  );
}

interface DeviceToggleProps {
  currentDevice: DeviceMode;
  onDeviceChange: (device: DeviceMode) => void;
}

function DeviceToggle({ currentDevice, onDeviceChange }: DeviceToggleProps) {
  return (
    <div className="glass rounded-xl p-1 flex gap-1">
      <DeviceToggleButton
        currentDevice={currentDevice}
        targetDevice={DeviceMode.Web}
        onDeviceChange={onDeviceChange}
        icon={Monitor}
        title="Desktop View"
      />
      <DeviceToggleButton
        currentDevice={currentDevice}
        targetDevice={DeviceMode.Phone}
        onDeviceChange={onDeviceChange}
        icon={Smartphone}
        title="Mobile View"
      />
    </div>
  );
}

interface HistoryItemCardProps {
  item: HistoryItem;
  index: number;
  isActive?: boolean;
  onClick?: () => void;
}

function HistoryItemCard({ item, index, isActive, onClick }: HistoryItemCardProps) {
  const isWeChat = item.platform === Platform.WeChat;

  return (
    <div
      key={item.id}
      onClick={onClick}
      className={`group flex items-center p-3 rounded-xl glass hover:bg-white/10 transition-all cursor-pointer gap-3 ${isActive ? 'ring-1 ring-white/20 bg-white/10' : ''}`}
      style={{ animationDelay: `${375 + index * 50}ms` }}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isWeChat
            ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30'
            : 'bg-rose-500/20 text-rose-400 group-hover:bg-rose-500/30'
          }`}
      >
        {isWeChat ? (
          <MessageCircle size={16} className="fill-current opacity-60" />
        ) : (
          <Heart size={16} className="fill-current opacity-60" />
        )}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="font-medium text-xs text-white/80 truncate group-hover:text-white transition-colors">
          {item.title}
        </span>
        <span className="text-[10px] text-white/40 mt-0.5">{item.timestamp}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [platform, setPlatform] = useState<Platform>(Platform.WeChat);
  const [device, setDevice] = useState<DeviceMode>(DeviceMode.Phone);
  const [previewData, setPreviewData] = useState<PreviewData>({
    images: [],
    style: '',
    product: '',
    prompt: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const colors = getPlatformColors(platform);

  // 加载历史记录
  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const conversations = await res.json();
        const items: HistoryItem[] = conversations.map((conv: { id: string; title: string; platform: string; updatedAt: string }) => {
          const date = new Date(conv.updatedAt);
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          let timestamp: string;
          if (diffDays === 0) {
            timestamp = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
          } else if (diffDays === 1) {
            timestamp = '昨天';
          } else {
            timestamp = `${diffDays} 天前`;
          }
          return {
            id: conv.id,
            title: conv.title,
            timestamp,
            platform: conv.platform as Platform,
          };
        });
        setHistory(items);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // 点击历史记录加载对话
  async function handleLoadConversation(conversationId: string, itemPlatform: Platform) {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!res.ok) return;
      const messages = await res.json();

      // 找到最新的 assistant 消息
      const assistantMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'assistant');
      // 找到最新的 user 消息
      const userMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user');

      let generatedContent: GeneratedContent | undefined;
      if (assistantMsg) {
        try {
          generatedContent = JSON.parse(assistantMsg.content);
        } catch {
          generatedContent = {
            title: '',
            body: assistantMsg.content,
            tags: [],
            rawText: assistantMsg.content,
          };
        }
      }

      setPlatform(itemPlatform);
      setCurrentConversationId(conversationId);
      setPreviewData({
        images: userMsg?.images || [],
        style: '',
        product: '',
        prompt: userMsg?.content || '',
        generatedContent,
      });
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const raw = await response.text();
        let message = '图片上传失败，请重试';
        try {
          const parsed = JSON.parse(raw);
          if (typeof parsed?.error === 'string' && parsed.error.length > 0) {
            message = parsed.error;
          }
          if (typeof parsed?.details === 'string' && parsed.details.length > 0) {
            message = `${message} (${parsed.details})`;
          }
        } catch {
          if (raw) message = `${message} (${raw})`;
        }
        throw new Error(message);
      }

      const data = await response.json();
      const newUrls = data.blobs.map((blob: { url: string }) => blob.url);

      setPreviewData(prev => ({
        ...prev,
        images: [...prev.images, ...newUrls],
      }));
    } catch (error) {
      console.error('Upload error:', error);
      const message = error instanceof Error ? error.message : '图片上传失败，请重试';
      alert(message);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleRemoveImage(index: number) {
    setPreviewData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function handleClearAllImages() {
    setPreviewData(prev => ({ ...prev, images: [] }));
  }

  async function handleGenerate() {
    if (!previewData.prompt.trim()) {
      setGenerateError('请输入创作提示词');
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    // 创建 AbortController 用于取消
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          style: previewData.style,
          product: previewData.product,
          prompt: previewData.prompt,
          images: previewData.images,
          conversationId: currentConversationId,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Generation failed');
      }

      const data = await res.json();

      // 更新预览数据
      setPreviewData(prev => ({
        ...prev,
        generatedContent: data.content as GeneratedContent,
      }));
      setCurrentConversationId(data.conversationId);

      // 刷新历史记录
      await loadHistory();
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        // 用户取消，不做处理
        return;
      }
      console.error('Generate error:', error);
      setGenerateError(error instanceof Error ? error.message : '生成失败，请重试');
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }

  function handleCancelGenerate() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row overflow-hidden">

      {/* ============================================
          SIDEBAR - Glass Panel
      ============================================ */}
      <aside className="w-full md:w-[360px] glass-dark relative flex flex-col z-20 shrink-0 h-screen noise-overlay">

        {/* Header with Logo */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${colors.gradientFrom} ${colors.gradientTo} ${colors.glowClass}`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-white tracking-tight">
                Moments RedNote
              </h1>
              <p className="text-xs text-white/40">AI-Powered Content Studio</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 scrollbar-hide">

          {/* Platform Toggle */}
          <PlatformToggle currentPlatform={platform} onPlatformChange={setPlatform} />

          {/* Configuration Cards */}
          <div className="space-y-4">

            {/* Image Upload — Multi-Image */}
            <div className="space-y-2 animate-in delay-75">
              <label className="flex items-center justify-between text-[10px] uppercase tracking-widest font-semibold text-white/40">
                <span>Visual Assets {previewData.images.length > 0 && `(${previewData.images.length})`}</span>
                {previewData.images.length > 0 && (
                  <button
                    onClick={handleClearAllImages}
                    className="text-rose-400/70 hover:text-rose-400 transition-colors normal-case tracking-normal"
                  >
                    Clear All
                  </button>
                )}
              </label>

              {/* Upload Area */}
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`
                  relative w-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group
                  ${previewData.images.length > 0
                    ? 'min-h-[80px]'
                    : 'h-36'}
                  ${isUploading
                    ? 'opacity-60 cursor-wait'
                    : 'glass hover:bg-white/10 border border-dashed border-white/15 hover:border-white/25'}
                `}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />

                {previewData.images.length > 0 ? (
                  /* Image Grid Thumbnails */
                  <div className="p-3">
                    <div className="grid grid-cols-3 gap-2">
                      {previewData.images.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group/thumb">
                          <img
                            src={url}
                            className="w-full h-full object-cover"
                            alt={`Upload ${idx + 1}`}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-red-500"
                          >
                            <X size={10} className="text-white" />
                          </button>
                        </div>
                      ))}
                      {/* Add More Button */}
                      <div
                        className={`aspect-square rounded-lg border border-dashed border-white/20 flex items-center justify-center hover:border-white/40 transition-colors ${colors.iconText}`}
                      >
                        {isUploading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Upload size={18} />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    {isUploading ? (
                      <>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors.iconBg} ${colors.iconText}`}>
                          <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                        <p className="text-sm font-medium text-white/70">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${colors.iconBg} ${colors.iconText}`}>
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-white/70">Drop your images here</p>
                          <p className="text-xs text-white/40 mt-0.5">supports multiple files</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Style & Product Selects */}
            <div className="grid grid-cols-2 gap-3 animate-in delay-150">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-white/40">Style</label>
                <div className="relative group">
                  <select
                    value={previewData.style}
                    onChange={(e) => setPreviewData(prev => ({ ...prev, style: e.target.value }))}
                    className={`input-glass w-full appearance-none pl-4 pr-10 py-3 text-sm font-medium cursor-pointer ${previewData.style === '' ? 'text-white/40 italic' : 'text-white'
                      }`}
                  >
                    {STYLES.map(s => (
                      <option
                        key={s.value}
                        value={s.value}
                        className="bg-[#0a0a0f] text-white"
                        disabled={s.value === ''}
                      >
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none group-hover:text-white/50 transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-white/40">Product</label>
                <div className="relative group">
                  <select
                    value={previewData.product}
                    onChange={(e) => setPreviewData(prev => ({ ...prev, product: e.target.value }))}
                    className={`input-glass w-full appearance-none pl-4 pr-10 py-3 text-sm font-medium cursor-pointer ${previewData.product === '' ? 'text-white/40 italic' : 'text-white'
                      }`}
                  >
                    {PRODUCTS.map(p => (
                      <option
                        key={p.value}
                        value={p.value}
                        className="bg-[#0a0a0f] text-white"
                        disabled={p.value === ''}
                      >
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none group-hover:text-white/50 transition-colors" />
                </div>
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="space-y-2 animate-in delay-225">
              <label className="flex items-center justify-between text-[10px] uppercase tracking-widest font-semibold text-white/40">
                <span>Creative Prompt</span>
                <span className="tabular-nums">{previewData.prompt.length}/500</span>
              </label>
              <textarea
                value={previewData.prompt}
                onChange={(e) => setPreviewData(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Describe the vibe, key selling points, and target audience..."
                maxLength={500}
                className="input-glass w-full h-28 px-4 py-3 resize-none text-sm leading-relaxed text-white placeholder-white/30"
              />
            </div>
          </div>

          {/* Recent History */}
          <div className="pt-2 animate-in delay-300">
            <div className="flex items-center gap-2 mb-3 text-white/40">
              <History size={12} />
              <span className="text-[10px] uppercase tracking-widest font-semibold">Recent Projects</span>
            </div>
            <div className="space-y-2">
              {history.length > 0 ? (
                history.slice(0, 10).map((item, idx) => (
                  <HistoryItemCard
                    key={item.id}
                    item={item}
                    index={idx}
                    isActive={currentConversationId === item.id}
                    onClick={() => handleLoadConversation(item.id, item.platform)}
                  />
                ))
              ) : (
                <p className="text-xs text-white/30 text-center py-4">暂无历史记录</p>
              )}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="p-6 border-t border-white/5">
          {generateError && (
            <p className="text-xs text-rose-400 mb-2 text-center">{generateError}</p>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`relative w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-white text-sm transition-all duration-300 active:scale-[0.98] overflow-hidden ${colors.bgGradient} ${colors.bgGradientHover} shadow-lg ${colors.shadow} ${isGenerating ? 'opacity-80 cursor-wait' : 'btn-shimmer hover:shadow-xl'}`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Magic...</span>
              </>
            ) : (
              <>
                <Zap size={18} className="fill-white/30" />
                <span>Generate Content</span>
              </>
            )}
          </button>

          {isGenerating && (
            <button
              onClick={handleCancelGenerate}
              className="w-full mt-2 text-xs font-medium text-white/40 hover:text-rose-400 transition-colors py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </aside>

      {/* ============================================
          MAIN PREVIEW AREA
      ============================================ */}
      <main className={`flex-1 relative flex flex-col transition-all duration-700 ${colors.bgClass}`}>

        {/* Device Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <DeviceToggle currentDevice={device} onDeviceChange={setDevice} />
        </div>

        {/* Preview Container */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <div
            className={`
              relative bg-white transition-all duration-700 ease-out flex flex-col
              ${device === DeviceMode.Phone
                ? 'w-[390px] h-[780px] rounded-[48px] ring-[12px] ring-[#0a0a0f] device-shadow-phone'
                : 'w-[1100px] h-[700px] rounded-2xl ring-1 ring-white/10 device-shadow-web'}
            `}
          >
            {/* Phone Notch */}
            {device === DeviceMode.Phone && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[32px] bg-[#0a0a0f] rounded-b-3xl z-30 flex justify-center items-center">
                <div className="w-16 h-4 bg-black rounded-full" />
              </div>
            )}

            {/* Content */}
            <div className={`h-full w-full overflow-hidden bg-white ${device === DeviceMode.Phone ? 'rounded-[36px]' : 'rounded-2xl'}`}>
              {platform === Platform.WeChat ? (
                <WeChatPreview data={previewData} />
              ) : (
                <RedNotePreview data={previewData} />
              )}
            </div>

            {/* Loading Overlay */}
            {isGenerating && (
              <div className={`absolute inset-0 flex flex-col items-center justify-center z-50 rounded-[inherit] ${device === DeviceMode.Phone ? 'bg-white/60 backdrop-blur-xl' : 'bg-white/50 backdrop-blur-lg'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${colors.gradientFrom} ${colors.gradientTo}`}>
                  <Wand2 className="w-7 h-7 text-white animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-[#0a0a0f]">Creating your content...</p>
                <p className="text-xs text-[#0a0a0f]/50 mt-1">AI is working its magic</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
