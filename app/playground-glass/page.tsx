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
    Zap, X, Loader2, Copy, Check, Wand2, Terminal
} from 'lucide-react';

/*
 * ── Playground B: "Neon Cyber" ──
 *
 * Aesthetic: Cyberpunk / Neo-Tokyo vibes
 * - Deep void black (#0A0A0F) base
 * - Neon cyan (#00F0FF) and hot magenta (#FF0090) accents
 * - Monospace + futuristic sans-serif font (JetBrains Mono + Sora)
 * - Scanline overlays, glitch-like hover effects
 * - Animated neon border glow
 * - Grid-pattern backgrounds
 */

export default function PlaygroundCyber() {
    const [platform, setPlatform] = useState<Platform>(Platform.WeChat);
    const [device, setDevice] = useState<DeviceMode>(DeviceMode.Phone);
    const [previewData, setPreviewData] = useState<PreviewData>({
        images: [],
        style: [],
        purpose: [],
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

    const neonAccent = platform === Platform.WeChat ? '#00F0FF' : '#FF0090';
    const neonGlow = platform === Platform.WeChat ? '0 0 20px rgba(0,240,255,0.4)' : '0 0 20px rgba(255,0,144,0.4)';

    return (
        <>
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

            <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "'Sora', sans-serif", background: '#0A0A0F', color: '#E0E0E0' }}>

                {/* ── SIDEBAR ── */}
                <aside className="w-[400px] h-full flex flex-col shrink-0 relative overflow-hidden" style={{ background: '#0D0D14', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

                    {/* Scanline overlay */}
                    <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03]" style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
                    }} />

                    {/* Grid pattern */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '32px 32px',
                    }} />

                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center relative overflow-hidden" style={{ background: neonAccent, boxShadow: neonGlow }}>
                                <Terminal className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-white">MOMENTS</h1>
                                <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: neonAccent, fontFamily: "'JetBrains Mono', monospace" }}>
                  // AI_CORE v2.0
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Neon line separator */}
                    <div className="h-px mx-6" style={{ background: `linear-gradient(90deg, transparent, ${neonAccent}, transparent)`, boxShadow: neonGlow }} />

                    {/* Content */}
                    <ScrollArea className="flex-1 relative z-10">
                        <div className="p-6 space-y-6">

                            {/* Platform */}
                            <div className="space-y-3">
                                <label className="text-[10px] tracking-[0.2em] uppercase font-mono" style={{ color: neonAccent, fontFamily: "'JetBrains Mono', monospace" }}>
                                    &gt; target_platform
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: Platform.WeChat, label: 'WECHAT', icon: MessageCircle, color: '#00F0FF' },
                                        { key: Platform.RedNote, label: 'REDNOTE', icon: Heart, color: '#FF0090' },
                                    ].map(p => (
                                        <button
                                            key={p.key}
                                            onClick={() => setPlatform(p.key)}
                                            className="flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold text-xs tracking-wider transition-all duration-300 relative overflow-hidden"
                                            style={{
                                                background: platform === p.key ? `${p.color}15` : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${platform === p.key ? p.color : 'rgba(255,255,255,0.08)'}`,
                                                color: platform === p.key ? p.color : 'rgba(255,255,255,0.4)',
                                                boxShadow: platform === p.key ? `0 0 20px ${p.color}20, inset 0 0 20px ${p.color}10` : 'none',
                                            }}
                                        >
                                            <p.icon className="w-4 h-4" />
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Prompt */}
                            <div className="space-y-3">
                                <label className="text-[10px] tracking-[0.2em] uppercase font-mono" style={{ color: neonAccent, fontFamily: "'JetBrains Mono', monospace" }}>
                                    &gt; prompt_input
                                </label>
                                <Textarea
                                    placeholder="// Initialize your creative parameters..."
                                    className="min-h-[130px] resize-none rounded-lg text-sm leading-relaxed border-0"
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: `1px solid rgba(255,255,255,0.08)`,
                                        color: '#E0E0E0',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: '13px',
                                    }}
                                    value={previewData.prompt}
                                    onChange={(e) => setPreviewData(prev => ({ ...prev, prompt: e.target.value }))}
                                />
                                <div className="text-right text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                    [{previewData.prompt.length}/500]
                                </div>
                            </div>

                            {/* Params */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[10px] tracking-[0.2em] uppercase font-mono" style={{ color: neonAccent, fontFamily: "'JetBrains Mono', monospace" }}>
                                        &gt; style
                                    </label>
                                    <Select value={previewData.style[0] || ''} onValueChange={(v) => setPreviewData(prev => ({ ...prev, style: [v] }))}>
                                        <SelectTrigger className="rounded-lg h-10 text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#E0E0E0' }}>
                                            <SelectValue placeholder="null" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg" style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.1)', color: '#E0E0E0' }}>
                                            {/* Style & Purpose */}
                                            <div className="grid grid-cols-2 gap-4 hidden">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] uppercase tracking-wider font-semibold text-white/50 pl-1">Style</label>
                                                    <Select value={previewData.style[0] || ''} onValueChange={(v) => setPreviewData(prev => ({ ...prev, style: [v] }))}>
                                                        <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                                                            <SelectValue placeholder="Choose style" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#2A2A35] border-white/10 text-white">
                                                            {STYLES.map(s => (
                                                                <SelectItem key={s.value} value={s.value} className="focus:bg-white/10 focus:text-white">{s.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] uppercase tracking-wider font-semibold text-white/50 pl-1">Purpose</label>
                                                    <Select value={previewData.purpose[0] || ''} onValueChange={(v) => setPreviewData(prev => ({ ...prev, purpose: [v] }))}>
                                                        <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                                                            <SelectValue placeholder="Choose purpose" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#2A2A35] border-white/10 text-white">
                                                            {PURPOSES.map(p => (
                                                                <SelectItem key={p.value} value={p.value} className="focus:bg-white/10 focus:text-white">{p.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            {STYLES.map(s => (
                                                <SelectItem key={s.value} value={s.value} className="text-xs rounded-md">{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] tracking-[0.2em] uppercase font-mono" style={{ color: neonAccent, fontFamily: "'JetBrains Mono', monospace" }}>
                                        &gt; purpose
                                    </label>
                                    <Select value={previewData.purpose[0] || ''} onValueChange={(v) => setPreviewData(prev => ({ ...prev, purpose: [v] }))}>
                                        <SelectTrigger className="rounded-lg h-10 text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#E0E0E0' }}>
                                            <SelectValue placeholder="null" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg" style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.1)', color: '#E0E0E0' }}>
                                            {PURPOSES.map(p => (
                                                <SelectItem key={p.value} value={p.value} className="text-xs rounded-md">{p.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Media Upload */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] tracking-[0.2em] uppercase font-mono" style={{ color: neonAccent, fontFamily: "'JetBrains Mono', monospace" }}>
                                        &gt; assets {previewData.images.length > 0 && `[${previewData.images.length}]`}
                                    </label>
                                    {previewData.images.length > 0 && (
                                        <button onClick={handleClearAllImages} className="text-[10px] font-mono" style={{ color: '#FF0090' }}>rm -rf *</button>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />

                                {previewData.images.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {previewData.images.map((url, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-md overflow-hidden group" style={{ border: `1px solid ${neonAccent}30` }}>
                                                <img src={url} className="w-full h-full object-cover" alt={`Upload ${idx + 1}`} />
                                                <button onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: '#FF0090' }}>
                                                    <X size={10} className="text-white" />
                                                </button>
                                            </div>
                                        ))}
                                        <div onClick={() => !isUploading && fileInputRef.current?.click()} className="aspect-square rounded-md border border-dashed flex items-center justify-center cursor-pointer" style={{ borderColor: `${neonAccent}40` }}>
                                            {isUploading ? <Loader2 size={16} className="animate-spin" style={{ color: neonAccent }} /> : <Upload size={16} style={{ color: neonAccent }} />}
                                        </div>
                                    </div>
                                ) : (
                                    <div onClick={() => !isUploading && fileInputRef.current?.click()} className="h-24 rounded-lg border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group" style={{ borderColor: `${neonAccent}30`, background: 'rgba(255,255,255,0.02)' }}>
                                        {isUploading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: neonAccent }} />
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5 mb-2 group-hover:-translate-y-0.5 transition-transform" style={{ color: neonAccent }} />
                                                <p className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>upload --files</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Generate */}
                    <div className="p-6 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {generateError && <p className="text-[11px] mb-2 text-center font-mono" style={{ color: '#FF0090' }}>[ERR] {generateError}</p>}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full py-4 rounded-lg font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden"
                            style={{
                                background: `${neonAccent}`,
                                color: '#0A0A0F',
                                boxShadow: neonGlow,
                                opacity: isGenerating ? 0.7 : 1,
                            }}
                        >
                            {isGenerating ? (
                                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Processing...</>
                            ) : (
                                <><Zap size={16} /> Execute Generate</>
                            )}
                        </button>
                        {isGenerating && (
                            <button onClick={handleCancelGenerate} className="w-full mt-2 text-[11px] font-mono py-2" style={{ color: '#FF0090' }}>
                                ^C abort
                            </button>
                        )}
                    </div>
                </aside>

                {/* ── PREVIEW ── */}
                <main className="flex-1 flex flex-col h-full relative overflow-hidden" style={{ background: '#08080D' }}>

                    {/* Grid BG */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                    }} />

                    {/* Ambient glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none opacity-20" style={{ background: `radial-gradient(ellipse, ${neonAccent}, transparent 70%)`, filter: 'blur(80px)' }} />

                    {/* Top bar */}
                    <div className="h-12 flex items-center justify-between px-8 shrink-0 relative z-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="text-[10px] tracking-[0.25em] uppercase font-mono" style={{ color: neonAccent, fontFamily: "'JetBrains Mono', monospace" }}>
              // preview_canvas
                        </span>
                        <div className="flex items-center gap-1 p-1 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <button onClick={() => setDevice(DeviceMode.Web)} className="p-2 rounded transition-all" style={{ background: device === DeviceMode.Web ? `${neonAccent}20` : 'transparent', color: device === DeviceMode.Web ? neonAccent : 'rgba(255,255,255,0.3)' }}>
                                <Monitor className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDevice(DeviceMode.Phone)} className="p-2 rounded transition-all" style={{ background: device === DeviceMode.Phone ? `${neonAccent}20` : 'transparent', color: device === DeviceMode.Phone ? neonAccent : 'rgba(255,255,255,0.3)' }}>
                                <Smartphone className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative z-10">
                        <div
                            className={`relative bg-white overflow-hidden transition-all duration-700 ease-out flex flex-col ${device === DeviceMode.Phone
                                ? 'w-[390px] h-[780px] rounded-[48px]'
                                : 'w-[1100px] h-[700px] rounded-2xl'
                                }`}
                            style={{
                                boxShadow: `0 0 40px ${neonAccent}15, 0 0 80px ${neonAccent}08, 0 24px 60px rgba(0,0,0,0.5)`,
                                border: `2px solid ${neonAccent}40`,
                            }}
                        >
                            {device === DeviceMode.Phone && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[32px] rounded-b-3xl z-30 flex justify-center items-center" style={{ background: '#0A0A0F' }}>
                                    <div className="w-16 h-4 rounded-full" style={{ background: '#1a1a24' }} />
                                </div>
                            )}

                            <div className={`h-full w-full overflow-hidden bg-white ${device === DeviceMode.Phone ? 'rounded-[36px]' : 'rounded-2xl'}`}>
                                {platform === Platform.WeChat ? <WeChatPreview data={previewData} /> : <RedNotePreview data={previewData} />}
                            </div>

                            {isGenerating && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 rounded-[inherit]" style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)' }}>
                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ background: neonAccent, boxShadow: neonGlow }}>
                                        <Wand2 className="w-7 h-7 text-black animate-pulse" />
                                    </div>
                                    <p className="text-sm font-semibold text-white">Processing request...</p>
                                    <p className="text-xs mt-1 font-mono" style={{ color: neonAccent }}>// neural_engine active</p>
                                </div>
                            )}
                        </div>

                        {previewData.generatedContent && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                                <button
                                    onClick={handleCopyAndSync} disabled={isSyncing}
                                    className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold tracking-wider uppercase transition-all duration-300"
                                    style={{ background: isCopied ? '#00F0FF' : neonAccent, color: '#0A0A0F', boxShadow: isCopied ? '0 0 20px rgba(0,240,255,0.4)' : neonGlow }}
                                >
                                    {isCopied ? <><Check size={16} /> COPIED</> : isSyncing ? <><Loader2 size={16} className="animate-spin" /> SYNCING</> : <><Copy size={16} /> COPY</>}
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
