'use client';

import React, { useState, useRef } from 'react';
import { Upload, Smartphone, Monitor, Wand2, MessageCircle, Heart, History, ChevronDown, Sparkles, Zap } from 'lucide-react';
import { Platform, DeviceMode, PreviewData } from '@/types';
import { STYLES, PRODUCTS, MOCK_HISTORY } from '@/lib/constants';
import { WeChatPreview, RedNotePreview } from '@/components/PreviewRenderers';

// Platform-specific styling helpers
function getPlatformColors(isWeChat: boolean) {
  return isWeChat
    ? {
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
      }
    : {
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
      };
}

export default function Home() {
  const [platform, setPlatform] = useState<Platform>(Platform.WeChat);
  const [device, setDevice] = useState<DeviceMode>(DeviceMode.Phone);
  const [previewData, setPreviewData] = useState<PreviewData>({
    image: null,
    style: STYLES[0].value,
    product: PRODUCTS[0].value,
    prompt: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isWeChat = platform === Platform.WeChat;
  const colors = getPlatformColors(isWeChat);

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewData(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function handleGenerate() {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2500);
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
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${colors.gradientFrom} ${colors.gradientTo} ${isWeChat ? 'glow-wechat' : 'glow-rednote'}`}>
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
          <div className="relative">
            <div className="glass rounded-2xl p-1.5 flex relative">
              {/* Animated Background Pill */}
              <div className={`absolute top-1.5 h-[calc(100%-12px)] w-[calc(50%-6px)] rounded-xl transition-all duration-500 ease-out ${isWeChat ? 'left-1.5' : 'left-[calc(50%+1.5px)]'} ${colors.pillBg}`} />
              <button
                onClick={() => setPlatform(Platform.WeChat)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold z-10 transition-all duration-300 flex items-center justify-center gap-2 ${isWeChat ? colors.iconText : 'text-white/50 hover:text-white/70'}`}
              >
                <MessageCircle size={16} className={isWeChat ? 'fill-emerald-400/30' : ''} />
                WeChat
              </button>
              <button
                onClick={() => setPlatform(Platform.RedNote)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold z-10 transition-all duration-300 flex items-center justify-center gap-2 ${!isWeChat ? colors.iconText : 'text-white/50 hover:text-white/70'}`}
              >
                <Heart size={16} className={!isWeChat ? 'fill-rose-400/30' : ''} />
                RedNote
              </button>
            </div>
          </div>

          {/* Configuration Cards */}
          <div className="space-y-4">

            {/* Image Upload */}
            <div className="space-y-2 animate-in delay-75">
              <label className="flex items-center justify-between text-[10px] uppercase tracking-widest font-semibold text-white/40">
                <span>Visual Asset</span>
                {previewData.image && (
                  <button
                    onClick={() => setPreviewData(prev => ({ ...prev, image: null }))}
                    className="text-rose-400/70 hover:text-rose-400 transition-colors normal-case tracking-normal"
                  >
                    Remove
                  </button>
                )}
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative h-36 w-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group
                  ${previewData.image
                    ? 'ring-2 ring-white/10'
                    : 'glass hover:bg-white/10 border border-dashed border-white/15 hover:border-white/25'}
                `}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {previewData.image ? (
                  <>
                    <img
                      src={previewData.image}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt="Preview"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="glass px-4 py-2 rounded-xl text-xs font-medium text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        Replace Image
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${colors.iconBg} ${colors.iconText}`}>
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white/70">Drop your image here</p>
                      <p className="text-xs text-white/40 mt-0.5">or click to browse</p>
                    </div>
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
                    className="input-glass w-full appearance-none pl-4 pr-10 py-3 text-sm font-medium text-white cursor-pointer"
                  >
                    {STYLES.map(s => <option key={s.value} value={s.value} className="bg-[#0a0a0f] text-white">{s.label}</option>)}
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
                    className="input-glass w-full appearance-none pl-4 pr-10 py-3 text-sm font-medium text-white cursor-pointer"
                  >
                    {PRODUCTS.map(p => <option key={p.value} value={p.value} className="bg-[#0a0a0f] text-white">{p.label}</option>)}
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
              {MOCK_HISTORY.map((item, idx) => (
                <div
                  key={item.id}
                  className="group flex items-center p-3 rounded-xl glass hover:bg-white/10 transition-all cursor-pointer gap-3"
                  style={{ animationDelay: `${375 + idx * 50}ms` }}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${item.platform === Platform.WeChat ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-400 group-hover:bg-rose-500/30'}`}>
                    {item.platform === Platform.WeChat ? (
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
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="p-6 border-t border-white/5">
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
              onClick={() => setIsGenerating(false)}
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
          <div className="glass rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setDevice(DeviceMode.Web)}
              className={`
                p-2.5 rounded-lg transition-all duration-300
                ${device === DeviceMode.Web
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'}
              `}
              title="Desktop View"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setDevice(DeviceMode.Phone)}
              className={`
                p-2.5 rounded-lg transition-all duration-300
                ${device === DeviceMode.Phone
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'}
              `}
              title="Mobile View"
            >
              <Smartphone size={16} />
            </button>
          </div>
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
