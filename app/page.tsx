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
    Zap, X, Loader2, Copy, Check, Wand2
} from 'lucide-react';

/*
 * ── Playground A: "Editorial Luxury" ──
 * 
 * Aesthetic: High-end fashion magazine editorial.
 * - Warm cream/ivory backgrounds (#FAF8F5)
 * - Serif display font (Playfair Display) + clean body font (DM Sans)
 * - Subtle warm color palette: burnt sienna accents, deep charcoal text
 * - Elegant card layouts with delicate gold/warm borders
 * - Asymmetric layout with generous whitespace
 * - Subtle paper-like texture overlay
 */

export default function PlaygroundEditorial() {
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
    const autoGenerateRef = useRef(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const uid = params.get('userId');
        const plt = params.get('platform');
        if (uid) setUserId(uid);
        if (plt === 'rednote') setPlatform(Platform.RedNote);
        else if (plt === 'wechat') setPlatform(Platform.WeChat);

        // Auto-fill from `b` URL param and trigger generation
        const b = params.get('b');
        if (b) {
            const decoded = decodeURIComponent(b);
            setPreviewData(prev => ({ ...prev, prompt: decoded }));
            autoGenerateRef.current = true;
        }
    }, []);

    // Auto-generate after brief is filled
    useEffect(() => {
        if (autoGenerateRef.current && previewData.prompt) {
            autoGenerateRef.current = false;
            handleGenerate();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewData.prompt]);

    // ── Handlers (same logic as original) ──
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
            const newUrls = data.blobs.map((blob: { url: string }) => blob.url);
            setPreviewData(prev => ({ ...prev, images: [...prev.images, ...newUrls] }));
        } catch (error) {
            console.error('Upload error:', error);
            alert(error instanceof Error ? error.message : '图片上传失败，请重试');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    function handleRemoveImage(index: number) {
        setPreviewData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    }

    function handleClearAllImages() {
        setPreviewData(prev => ({ ...prev, images: [] }));
    }

    async function handleGenerate() {
        if (!previewData.prompt.trim()) { setGenerateError('请输入创作提示词'); return; }
        setIsGenerating(true);
        setGenerateError(null);
        const controller = new AbortController();
        abortControllerRef.current = controller;
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform, style: previewData.style, purpose: previewData.purpose, prompt: previewData.prompt, images: previewData.images }),
                signal: controller.signal,
            });
            if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Generation failed'); }
            const data = await res.json();
            setPreviewData(prev => ({ ...prev, generatedContent: data.content as GeneratedContent }));
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') return;
            console.error('Generate error:', error);
            setGenerateError(error instanceof Error ? error.message : '生成失败，请重试');
        } finally {
            setIsGenerating(false);
            abortControllerRef.current = null;
        }
    }

    function handleCancelGenerate() {
        abortControllerRef.current?.abort();
        setIsGenerating(false);
    }

    async function handleCopyAndSync() {
        const gc = previewData.generatedContent;
        if (!gc) return;
        try { await navigator.clipboard.writeText(gc.body); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); } catch { }
        setIsSyncing(true);
        try {
            await fetch('/api/feishu-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: gc.body, purpose: previewData.purpose, style: previewData.style, platform, userId }),
            });
        } catch { } finally { setIsSyncing(false); }
    }

    return (
        <>
            {/* Google Fonts */}
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAF8F5' }}>

                {/* ── LEFT SIDEBAR ── */}
                <aside className="w-[440px] h-full flex flex-col shrink-0 border-r relative overflow-hidden" style={{ borderColor: '#E8E0D8', background: '#FFFDF9' }}>

                    {/* Paper texture overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
                    }} />

                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 relative z-10">
                        <div className="flex items-center gap-4 mb-1">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C4956A, #A67C52)' }}>
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: '#2C2016' }}>
                                    Moments
                                </h1>
                                <p className="text-xs tracking-[0.2em] uppercase" style={{ color: '#A89580' }}>Content Atelier</p>
                            </div>
                        </div>
                    </div>

                    {/* Separator line with diamond ornament */}
                    <div className="relative px-8">
                        <div className="h-px w-full" style={{ background: '#E8E0D8' }} />
                        <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rotate-45" style={{ background: '#C4956A', border: '1px solid #E8E0D8' }} />
                    </div>

                    {/* Content - Scrollable */}
                    <ScrollArea className="flex-1 relative z-10">
                        <div className="px-8 py-6 space-y-8">

                            {/* Platform Selector */}
                            <div className="space-y-3">
                                <label className="text-xs tracking-[0.15em] uppercase font-medium" style={{ color: '#A89580' }}>
                                    Platform
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPlatform(Platform.WeChat)}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300"
                                        style={{
                                            background: platform === Platform.WeChat ? 'linear-gradient(135deg, #4A7C59, #5B9A6E)' : '#F5F0EA',
                                            color: platform === Platform.WeChat ? '#fff' : '#8A7D6F',
                                            border: `1px solid ${platform === Platform.WeChat ? '#4A7C59' : '#E8E0D8'}`,
                                            boxShadow: platform === Platform.WeChat ? '0 4px 16px rgba(74,124,89,0.3)' : 'none',
                                        }}
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        <span className="text-sm font-medium">WeChat</span>
                                    </button>
                                    <button
                                        onClick={() => setPlatform(Platform.RedNote)}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300"
                                        style={{
                                            background: platform === Platform.RedNote ? 'linear-gradient(135deg, #C25B5B, #D4696E)' : '#F5F0EA',
                                            color: platform === Platform.RedNote ? '#fff' : '#8A7D6F',
                                            border: `1px solid ${platform === Platform.RedNote ? '#C25B5B' : '#E8E0D8'}`,
                                            boxShadow: platform === Platform.RedNote ? '0 4px 16px rgba(194,91,91,0.3)' : 'none',
                                        }}
                                    >
                                        <Heart className="w-5 h-5" />
                                        <span className="text-sm font-medium">RedNote</span>
                                    </button>
                                </div>
                            </div>

                            {/* Creative Prompt */}
                            <div className="space-y-3">
                                <label className="text-xs tracking-[0.15em] uppercase font-medium" style={{ color: '#A89580' }}>
                                    Creative Brief
                                </label>
                                <Textarea
                                    placeholder="Tell us about your content vision..."
                                    className="min-h-[130px] resize-none rounded-xl text-sm leading-relaxed"
                                    style={{
                                        background: '#F5F0EA',
                                        border: '1px solid #E8E0D8',
                                        color: '#2C2016',
                                        fontFamily: "'DM Sans', sans-serif",
                                    }}
                                    value={previewData.prompt}
                                    onChange={(e) => setPreviewData(prev => ({ ...prev, prompt: e.target.value }))}
                                />
                                <div className="text-right text-xs" style={{ color: '#C4B5A0' }}>
                                    {previewData.prompt.length}/500
                                </div>
                            </div>

                            {/* Style & Purpose */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs tracking-[0.15em] uppercase font-medium" style={{ color: '#A89580' }}>Style</label>
                                    <Select value={previewData.style} onValueChange={(v) => setPreviewData(prev => ({ ...prev, style: v }))}>
                                        <SelectTrigger className="rounded-xl h-11 text-sm" style={{ background: '#F5F0EA', border: '1px solid #E8E0D8', color: '#2C2016' }}>
                                            <SelectValue placeholder="Choose style" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl" style={{ background: '#FFFDF9', border: '1px solid #E8E0D8' }}>
                                            {STYLES.map(s => (
                                                <SelectItem key={s.value} value={s.value} className="rounded-lg text-sm">{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs tracking-[0.15em] uppercase font-medium" style={{ color: '#A89580' }}>Purpose</label>
                                    <Select value={previewData.purpose} onValueChange={(v) => setPreviewData(prev => ({ ...prev, purpose: v }))}>
                                        <SelectTrigger className="rounded-xl h-11 text-sm" style={{ background: '#F5F0EA', border: '1px solid #E8E0D8', color: '#2C2016' }}>
                                            <SelectValue placeholder="Choose purpose" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl" style={{ background: '#FFFDF9', border: '1px solid #E8E0D8' }}>
                                            {PURPOSES.map(p => (
                                                <SelectItem key={p.value} value={p.value} className="rounded-lg text-sm">{p.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs tracking-[0.15em] uppercase font-medium" style={{ color: '#A89580' }}>
                                        Visual Assets {previewData.images.length > 0 && `(${previewData.images.length})`}
                                    </label>
                                    {previewData.images.length > 0 && (
                                        <button onClick={handleClearAllImages} className="text-xs font-medium" style={{ color: '#C25B5B' }}>Clear All</button>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />

                                {previewData.images.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-2">
                                            {previewData.images.map((url, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                                    <img src={url} className="w-full h-full object-cover" alt={`Upload ${idx + 1}`} />
                                                    <button
                                                        onClick={() => handleRemoveImage(idx)}
                                                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        style={{ background: 'rgba(194,91,91,0.9)' }}
                                                    >
                                                        <X size={10} className="text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                            <div
                                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                                className="aspect-square rounded-lg border border-dashed flex items-center justify-center cursor-pointer transition-all hover:opacity-80"
                                                style={{ borderColor: '#D4C4B0', background: '#F5F0EA' }}
                                            >
                                                {isUploading ? <Loader2 size={18} className="animate-spin" style={{ color: '#C4956A' }} /> : <Upload size={18} style={{ color: '#C4956A' }} />}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => !isUploading && fileInputRef.current?.click()}
                                        className="h-28 rounded-xl border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:opacity-80 group"
                                        style={{ borderColor: '#D4C4B0', background: '#F5F0EA' }}
                                    >
                                        {isUploading ? (
                                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#C4956A' }} />
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110" style={{ background: '#EDE5DA' }}>
                                                    <Upload className="w-4 h-4" style={{ color: '#C4956A' }} />
                                                </div>
                                                <p className="text-xs font-medium" style={{ color: '#8A7D6F' }}>Drop images or click to browse</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>
                    </ScrollArea>

                    {/* Generate Button */}
                    <div className="p-6 relative z-10" style={{ borderTop: '1px solid #E8E0D8' }}>
                        {generateError && <p className="text-xs mb-2 text-center" style={{ color: '#C25B5B' }}>{generateError}</p>}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full py-4 rounded-xl font-semibold text-white text-sm transition-all duration-300 flex items-center justify-center gap-2"
                            style={{
                                background: platform === Platform.WeChat
                                    ? 'linear-gradient(135deg, #4A7C59, #5B9A6E)'
                                    : 'linear-gradient(135deg, #C25B5B, #D4696E)',
                                boxShadow: platform === Platform.WeChat
                                    ? '0 4px 20px rgba(74,124,89,0.35)'
                                    : '0 4px 20px rgba(194,91,91,0.35)',
                                opacity: isGenerating ? 0.8 : 1,
                            }}
                        >
                            {isGenerating ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                            ) : (
                                <><Zap size={16} className="fill-white/30" /> Generate Content</>
                            )}
                        </button>
                        {isGenerating && (
                            <button onClick={handleCancelGenerate} className="w-full mt-2 text-xs font-medium py-2 transition-colors" style={{ color: '#A89580' }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </aside>

                {/* ── MAIN PREVIEW ── */}
                <main className="flex-1 flex flex-col h-full relative" style={{ background: '#F5F0EA' }}>

                    {/* Top bar */}
                    <div className="h-14 flex items-center justify-between px-8 shrink-0" style={{ borderBottom: '1px solid #E8E0D8' }}>
                        <span className="text-xs tracking-[0.15em] uppercase font-medium" style={{ color: '#A89580', fontFamily: "'DM Sans', sans-serif" }}>
                            Live Preview
                        </span>
                        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: '#EDE5DA' }}>
                            <button onClick={() => setDevice(DeviceMode.Web)} className="p-2 rounded-md transition-all" style={{ background: device === DeviceMode.Web ? '#FFFDF9' : 'transparent', color: device === DeviceMode.Web ? '#2C2016' : '#A89580', boxShadow: device === DeviceMode.Web ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
                                <Monitor className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDevice(DeviceMode.Phone)} className="p-2 rounded-md transition-all" style={{ background: device === DeviceMode.Phone ? '#FFFDF9' : 'transparent', color: device === DeviceMode.Phone ? '#2C2016' : '#A89580', boxShadow: device === DeviceMode.Phone ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
                                <Smartphone className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Preview Canvas */}
                    <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">

                        {/* De decorative circles */}
                        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle, #C4956A, transparent 70%)' }} />
                        <div className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle, #4A7C59, transparent 70%)' }} />

                        <div
                            className={`relative z-10 bg-white overflow-hidden transition-all duration-700 ease-out flex flex-col ${device === DeviceMode.Phone
                                    ? 'w-[390px] h-[780px] rounded-[48px]'
                                    : 'w-[1100px] h-[700px] rounded-2xl'
                                }`}
                            style={{
                                boxShadow: device === DeviceMode.Phone
                                    ? '0 24px 80px rgba(44,32,22,0.12), 0 0 0 12px #2C2016'
                                    : '0 24px 60px rgba(44,32,22,0.08), 0 0 0 1px rgba(44,32,22,0.05)',
                            }}
                        >
                            {device === DeviceMode.Phone && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[32px] rounded-b-3xl z-30 flex justify-center items-center" style={{ background: '#2C2016' }}>
                                    <div className="w-16 h-4 bg-black/80 rounded-full" />
                                </div>
                            )}

                            <div className={`h-full w-full overflow-hidden bg-white ${device === DeviceMode.Phone ? 'rounded-[36px]' : 'rounded-2xl'}`}>
                                {platform === Platform.WeChat ? <WeChatPreview data={previewData} /> : <RedNotePreview data={previewData} />}
                            </div>

                            {isGenerating && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 rounded-[inherit] backdrop-blur-xl" style={{ background: 'rgba(255,253,249,0.7)' }}>
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #C4956A, #A67C52)' }}>
                                        <Wand2 className="w-7 h-7 text-white animate-pulse" />
                                    </div>
                                    <p className="text-sm font-semibold" style={{ color: '#2C2016', fontFamily: "'Playfair Display', serif" }}>Crafting your content...</p>
                                    <p className="text-xs mt-1" style={{ color: '#A89580' }}>This may take a moment</p>
                                </div>
                            )}
                        </div>

                        {/* Copy button */}
                        {previewData.generatedContent && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                                <button
                                    onClick={handleCopyAndSync}
                                    disabled={isSyncing}
                                    className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium transition-all duration-300"
                                    style={{
                                        background: isCopied ? 'linear-gradient(135deg, #4A7C59, #5B9A6E)' : 'linear-gradient(135deg, #C4956A, #A67C52)',
                                        boxShadow: '0 4px 20px rgba(196,149,106,0.35)',
                                    }}
                                >
                                    {isCopied ? <><Check size={16} /> 已复制</> : isSyncing ? <><Loader2 size={16} className="animate-spin" /> 同步中...</> : <><Copy size={16} /> 复制文案</>}
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
