'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Platform, DeviceMode, PreviewData, GeneratedContent } from '@/types';
import { STYLES, PURPOSES } from '@/lib/constants';
import { WeChatPreview, RedNotePreview } from '@/components/PreviewRenderers';
import {
    Sparkles, MessageCircle, Heart, Upload, Monitor, Smartphone,
    Zap, X, Loader2, Copy, Check, Wand2, Feather
} from 'lucide-react';

/*
 * ── Playground C: "Aurora Dreamscape" ──
 *
 * Aesthetic: Dreamy, organic, aurora borealis-inspired
 * - Deep dark navy (#0F1729) base with luminous aurora gradients
 * - Soft pastel accent colors that shift: teal, lavender, soft rose
 * - Rounded, pill-shaped UI elements
 * - Font: Outfit (geometric but warm) + Crimson Pro (elegant serif accents)
 * - Floating card with frosted glass effect
 * - Animated aurora gradient background
 * - Delicate particle-like dots
 */

export default function PlaygroundAurora() {
    const [platform, setPlatform] = useState<Platform>(Platform.WeChat);
    const [device, setDevice] = useState<DeviceMode>(DeviceMode.Phone);
    const [previewData, setPreviewData] = useState<PreviewData>({
        images: [],
        style: '',
        purpose: '',
        prompt: '',
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [userId, setUserId] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const uid = params.get('userId');
        const plt = params.get('platform');
        if (uid) setUserId(uid);
        if (plt === 'rednote') setPlatform(Platform.RedNote);
        else if (plt === 'wechat') setPlatform(Platform.WeChat);
    }, []);

    async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) formData.append('files', files[i]);
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!response.ok) {
                const raw = await response.text();
                let message = '图片上传失败，请重试';
                try { const parsed = JSON.parse(raw); if (parsed?.error) message = parsed.error; } catch { }
                throw new Error(message);
            }
            const data = await response.json();
            setPreviewData(prev => ({ ...prev, images: [...prev.images, ...data.blobs.map((b: { url: string }) => b.url)] }));
        } catch (error) {
            alert(error instanceof Error ? error.message : '图片上传失败，请重试');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    function handleRemoveImage(idx: number) { setPreviewData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) })); }
    function handleClearAllImages() { setPreviewData(prev => ({ ...prev, images: [] })); }

    async function handleGenerate() {
        if (!previewData.prompt.trim()) { setGenerateError('请输入创作提示词'); return; }
        setIsGenerating(true); setGenerateError(null);
        const controller = new AbortController(); abortControllerRef.current = controller;
        try {
            const res = await fetch('/api/generate', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform, style: previewData.style, purpose: previewData.purpose, prompt: previewData.prompt, images: previewData.images }),
                signal: controller.signal,
            });
            if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Generation failed'); }
            const data = await res.json();
            setPreviewData(prev => ({ ...prev, generatedContent: data.content as GeneratedContent }));
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') return;
            setGenerateError(error instanceof Error ? error.message : '生成失败，请重试');
        } finally { setIsGenerating(false); abortControllerRef.current = null; }
    }

    function handleCancelGenerate() { abortControllerRef.current?.abort(); setIsGenerating(false); }

    async function handleCopyAndSync() {
        const gc = previewData.generatedContent;
        if (!gc) return;
        try { await navigator.clipboard.writeText(gc.body); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); } catch { }
        setIsSyncing(true);
        try {
            await fetch('/api/feishu-sync', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: gc.body, purpose: previewData.purpose, style: previewData.style, platform, userId })
            });
        } catch { } finally { setIsSyncing(false); }
    }

    const accentGradient = platform === Platform.WeChat
        ? 'linear-gradient(135deg, #4FD1C5, #81E6D9, #B2F5EA)'
        : 'linear-gradient(135deg, #F687B3, #FC8181, #FBD38D)';
    const accentColor = platform === Platform.WeChat ? '#81E6D9' : '#F687B3';
    const accentGlow = platform === Platform.WeChat ? 'rgba(79,209,197,0.3)' : 'rgba(246,135,179,0.3)';

    return (
        <>
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />

            <div className="flex h-screen w-full overflow-hidden relative" style={{ fontFamily: "'Outfit', sans-serif" }}>

                {/* Full-page aurora background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0" style={{ background: '#0F1729' }} />

                    {/* Aurora ribbons - positioned via CSS animations */}
                    <div className="aurora-ribbon aurora-1" />
                    <div className="aurora-ribbon aurora-2" />
                    <div className="aurora-ribbon aurora-3" />

                    {/* Subtle stars */}
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: 'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.6), transparent), radial-gradient(1px 1px at 60% 40%, rgba(255,255,255,0.7), transparent), radial-gradient(1.5px 1.5px at 80% 20%, rgba(255,255,255,0.9), transparent), radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.5), transparent), radial-gradient(1.5px 1.5px at 70% 60%, rgba(255,255,255,0.6), transparent), radial-gradient(1px 1px at 90% 50%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 50% 90%, rgba(255,255,255,0.4), transparent), radial-gradient(1.5px 1.5px at 30% 10%, rgba(255,255,255,0.8), transparent)',
                    }} />
                </div>

                {/* ── SIDEBAR ── */}
                <aside className="w-[420px] h-full flex flex-col shrink-0 relative z-10 overflow-hidden" style={{
                    background: 'rgba(15,23,41,0.6)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    borderRight: '1px solid rgba(255,255,255,0.08)',
                }}>

                    {/* Header */}
                    <div className="px-8 pt-8 pb-5">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: accentGradient, boxShadow: `0 4px 16px ${accentGlow}` }}>
                                <Feather className="w-5 h-5 text-white drop-shadow" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-white">Moments</h1>
                                <p className="text-[11px] font-light tracking-widest text-white/40" style={{ fontFamily: "'Crimson Pro', serif", fontStyle: 'italic' }}>
                                    dream it, create it
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Soft divider */}
                    <div className="mx-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)` }} />

                    {/* Content */}
                    <ScrollArea className="flex-1">
                        <div className="px-8 py-6 space-y-7">

                            {/* Platform */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-medium tracking-wider uppercase text-white/35">Platform</label>
                                <div className="flex p-1.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="relative flex w-full">
                                        <div
                                            className="absolute top-0 bottom-0 w-1/2 rounded-xl transition-all duration-500 ease-out"
                                            style={{
                                                left: platform === Platform.WeChat ? '0%' : '50%',
                                                background: accentGradient,
                                                boxShadow: `0 2px 12px ${accentGlow}`,
                                            }}
                                        />
                                        <button
                                            onClick={() => setPlatform(Platform.WeChat)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl z-10 transition-all text-sm font-medium"
                                            style={{ color: platform === Platform.WeChat ? '#0F1729' : 'rgba(255,255,255,0.4)' }}
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            WeChat
                                        </button>
                                        <button
                                            onClick={() => setPlatform(Platform.RedNote)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl z-10 transition-all text-sm font-medium"
                                            style={{ color: platform === Platform.RedNote ? '#0F1729' : 'rgba(255,255,255,0.4)' }}
                                        >
                                            <Heart className="w-4 h-4" />
                                            RedNote
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Prompt */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-medium tracking-wider uppercase text-white/35">Inspiration</label>
                                <Textarea
                                    placeholder="What's on your mind? Describe the mood, the story you want to tell..."
                                    className="min-h-[140px] resize-none rounded-2xl text-sm leading-relaxed border-0 ring-0 focus-visible:ring-1 focus-visible:ring-white/15"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        color: '#E2E8F0',
                                        fontFamily: "'Outfit', sans-serif",
                                    }}
                                    value={previewData.prompt}
                                    onChange={(e) => setPreviewData(prev => ({ ...prev, prompt: e.target.value }))}
                                />
                                <div className="text-right text-[10px] text-white/20">
                                    {previewData.prompt.length} / 500
                                </div>
                            </div>

                            {/* Style & Purpose */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-medium tracking-wider uppercase text-white/35">Style</label>
                                    <Select value={previewData.style} onValueChange={(v) => setPreviewData(prev => ({ ...prev, style: v }))}>
                                        <SelectTrigger className="rounded-xl h-11 text-sm border-0 ring-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#E2E8F0' }}>
                                            <SelectValue placeholder="Choose" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-0" style={{ background: 'rgba(15,23,41,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0' }}>
                                            {STYLES.map(s => (
                                                <SelectItem key={s.value} value={s.value} className="rounded-lg text-sm">{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-medium tracking-wider uppercase text-white/35">Purpose</label>
                                    <Select value={previewData.purpose} onValueChange={(v) => setPreviewData(prev => ({ ...prev, purpose: v }))}>
                                        <SelectTrigger className="rounded-xl h-11 text-sm border-0 ring-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#E2E8F0' }}>
                                            <SelectValue placeholder="Choose" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-0" style={{ background: 'rgba(15,23,41,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0' }}>
                                            {PURPOSES.map(p => (
                                                <SelectItem key={p.value} value={p.value} className="rounded-lg text-sm">{p.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Upload */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-medium tracking-wider uppercase text-white/35">
                                        Visuals {previewData.images.length > 0 && `(${previewData.images.length})`}
                                    </label>
                                    {previewData.images.length > 0 && (
                                        <button onClick={handleClearAllImages} className="text-[11px] font-medium" style={{ color: '#FC8181' }}>Clear</button>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />

                                {previewData.images.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {previewData.images.map((url, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <img src={url} className="w-full h-full object-cover" alt={`Upload ${idx + 1}`} />
                                                <button onClick={() => handleRemoveImage(idx)} className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(252,129,129,0.9)' }}>
                                                    <X size={10} className="text-white" />
                                                </button>
                                            </div>
                                        ))}
                                        <div onClick={() => !isUploading && fileInputRef.current?.click()} className="aspect-square rounded-xl border border-dashed flex items-center justify-center cursor-pointer transition-all" style={{ borderColor: `${accentColor}40` }}>
                                            {isUploading ? <Loader2 size={16} className="animate-spin" style={{ color: accentColor }} /> : <Upload size={16} style={{ color: accentColor }} />}
                                        </div>
                                    </div>
                                ) : (
                                    <div onClick={() => !isUploading && fileInputRef.current?.click()} className="h-28 rounded-2xl border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                                        {isUploading ? (
                                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: accentColor }} />
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110" style={{ background: `${accentColor}15` }}>
                                                    <Upload className="w-4 h-4" style={{ color: accentColor }} />
                                                </div>
                                                <p className="text-xs font-medium text-white/40">Add your images</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Generate */}
                    <div className="p-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {generateError && <p className="text-[11px] mb-2 text-center" style={{ color: '#FC8181' }}>{generateError}</p>}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                background: accentGradient,
                                color: '#0F1729',
                                boxShadow: `0 4px 24px ${accentGlow}`,
                                opacity: isGenerating ? 0.7 : 1,
                            }}
                        >
                            {isGenerating ? (
                                <><div className="w-4 h-4 border-2 border-black/30 border-t-black/80 rounded-full animate-spin" /> Dreaming...</>
                            ) : (
                                <><Sparkles size={16} /> Create Magic</>
                            )}
                        </button>
                        {isGenerating && (
                            <button onClick={handleCancelGenerate} className="w-full mt-2 text-xs py-2 text-white/30 hover:text-white/50 transition-colors">
                                Cancel
                            </button>
                        )}
                    </div>
                </aside>

                {/* ── PREVIEW ── */}
                <main className="flex-1 flex flex-col h-full relative z-10">

                    {/* Top bar */}
                    <div className="h-14 flex items-center justify-between px-8 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,41,0.3)', backdropFilter: 'blur(20px)' }}>
                        <span className="text-[11px] font-medium tracking-wider uppercase text-white/30" style={{ fontFamily: "'Crimson Pro', serif", fontStyle: 'italic', letterSpacing: '0.15em' }}>
                            Preview Canvas
                        </span>
                        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <button onClick={() => setDevice(DeviceMode.Web)} className="p-2 rounded-lg transition-all" style={{ background: device === DeviceMode.Web ? 'rgba(255,255,255,0.1)' : 'transparent', color: device === DeviceMode.Web ? accentColor : 'rgba(255,255,255,0.3)' }}>
                                <Monitor className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDevice(DeviceMode.Phone)} className="p-2 rounded-lg transition-all" style={{ background: device === DeviceMode.Phone ? 'rgba(255,255,255,0.1)' : 'transparent', color: device === DeviceMode.Phone ? accentColor : 'rgba(255,255,255,0.3)' }}>
                                <Smartphone className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
                        <div
                            className={`relative bg-white overflow-hidden transition-all duration-700 ease-out flex flex-col ${device === DeviceMode.Phone
                                    ? 'w-[390px] h-[780px] rounded-[48px]'
                                    : 'w-[1100px] h-[700px] rounded-2xl'
                                }`}
                            style={{
                                boxShadow: device === DeviceMode.Phone
                                    ? `0 0 60px ${accentGlow}, 0 24px 80px rgba(0,0,0,0.3), 0 0 0 12px rgba(15,23,41,0.8)`
                                    : `0 0 40px ${accentGlow}, 0 24px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.08)`,
                            }}
                        >
                            {device === DeviceMode.Phone && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[32px] rounded-b-3xl z-30 flex justify-center items-center" style={{ background: 'rgba(15,23,41,0.9)' }}>
                                    <div className="w-16 h-4 bg-black/50 rounded-full" />
                                </div>
                            )}

                            <div className={`h-full w-full overflow-hidden bg-white ${device === DeviceMode.Phone ? 'rounded-[36px]' : 'rounded-2xl'}`}>
                                {platform === Platform.WeChat ? <WeChatPreview data={previewData} /> : <RedNotePreview data={previewData} />}
                            </div>

                            {isGenerating && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 rounded-[inherit]" style={{ background: 'rgba(15,23,41,0.8)', backdropFilter: 'blur(30px)' }}>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: accentGradient, boxShadow: `0 4px 24px ${accentGlow}` }}>
                                        <Wand2 className="w-7 h-7 text-white animate-pulse" />
                                    </div>
                                    <p className="text-sm font-semibold text-white">Weaving your story...</p>
                                    <p className="text-xs mt-1 text-white/40" style={{ fontFamily: "'Crimson Pro', serif", fontStyle: 'italic' }}>patience is an art</p>
                                </div>
                            )}
                        </div>

                        {previewData.generatedContent && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                                <button
                                    onClick={handleCopyAndSync} disabled={isSyncing}
                                    className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                                    style={{ background: isCopied ? 'linear-gradient(135deg, #48BB78, #38A169)' : accentGradient, color: '#0F1729', boxShadow: `0 4px 20px ${accentGlow}` }}
                                >
                                    {isCopied ? <><Check size={16} /> 已复制</> : isSyncing ? <><Loader2 size={16} className="animate-spin" /> 同步中...</> : <><Copy size={16} /> 复制文案</>}
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .aurora-ribbon {
          position: absolute;
          width: 200%;
          height: 40%;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          pointer-events: none;
        }
        .aurora-1 {
          top: -15%;
          left: -30%;
          background: linear-gradient(90deg, rgba(79,209,197,0.6), rgba(129,230,217,0.3), rgba(159,122,234,0.4));
          animation: aurora1 12s ease-in-out infinite alternate;
        }
        .aurora-2 {
          top: 10%;
          right: -40%;
          background: linear-gradient(90deg, rgba(246,135,179,0.4), rgba(252,129,129,0.3), rgba(251,211,141,0.3));
          animation: aurora2 15s ease-in-out infinite alternate;
        }
        .aurora-3 {
          bottom: -10%;
          left: -20%;
          background: linear-gradient(90deg, rgba(99,179,237,0.3), rgba(159,122,234,0.4), rgba(79,209,197,0.3));
          animation: aurora3 18s ease-in-out infinite alternate;
        }
        @keyframes aurora1 {
          0% { transform: translateX(-10%) rotate(-5deg); }
          100% { transform: translateX(10%) rotate(5deg); }
        }
        @keyframes aurora2 {
          0% { transform: translateX(5%) rotate(3deg); }
          100% { transform: translateX(-15%) rotate(-3deg); }
        }
        @keyframes aurora3 {
          0% { transform: translateX(-5%) rotate(2deg); }
          100% { transform: translateX(10%) rotate(-4deg); }
        }
      `}} />
        </>
    );
}
