'use client';

import React from 'react';
import { PreviewData } from '@/types';
import { Heart, MessageCircle, Share2, MoreHorizontal, Camera, ArrowLeft, Star } from 'lucide-react';

interface RendererProps {
  data: PreviewData;
}

// ==========================================
// Shared Components
// ==========================================

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'full' | 'lg' | 'none';
}

function Avatar({ src, alt, size = 'md', rounded = 'full' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };
  const roundedClasses = {
    full: 'rounded-full',
    lg: 'rounded-lg',
    none: 'rounded-none',
  };

  return (
    <div className={`${sizeClasses[size]} ${roundedClasses[rounded]} overflow-hidden`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}

interface CommentProps {
  avatar: string;
  author: string;
  text: string;
}

function Comment({ avatar, author, text }: CommentProps) {
  return (
    <div className="flex gap-3">
      <Avatar src={avatar} alt={author} size="sm" />
      <div className="flex-1">
        <div className="text-xs text-gray-500 mb-0.5">{author}</div>
        <div className="text-sm text-gray-800">{text}</div>
      </div>
      <Heart size={14} className="text-gray-300 flex-shrink-0 mt-1" />
    </div>
  );
}

// Helper to format time string
function formatCurrentTime(): string {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
}

interface FooterButtonProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  count: string;
}

function FooterButton({ icon: Icon, iconColor, count }: FooterButtonProps) {
  return (
    <div className="flex flex-col items-center">
      <Icon size={22} className={iconColor} />
      <span className="text-[10px] font-medium text-gray-600 mt-0.5">{count}</span>
    </div>
  );
}

// ==========================================
// WeChat Moments Preview
// ==========================================
export function WeChatPreview({ data }: RendererProps) {
  const timeString = formatCurrentTime();

  return (
    <div className="bg-white h-full w-full flex flex-col font-sans text-gray-900">
      {/* iOS Status Bar */}
      <div className="h-12 bg-[#EDEDED] flex items-center justify-between px-5 text-xs font-semibold shrink-0">
        <span className="tabular-nums">{timeString}</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            <div className="w-1 h-2.5 bg-gray-900 rounded-sm" />
            <div className="w-1 h-3 bg-gray-900 rounded-sm" />
            <div className="w-1 h-3.5 bg-gray-900 rounded-sm" />
            <div className="w-1 h-4 bg-gray-900 rounded-sm" />
          </div>
          <div className="w-6 h-3 bg-gray-900 rounded-sm ml-1 relative">
            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gray-300 rounded-r-sm" />
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-gray-200/80 bg-[#EDEDED] shrink-0">
        <div className="flex items-center gap-2 text-gray-900 font-medium">
          <ArrowLeft size={22} strokeWidth={2.5} />
          <span className="text-base font-semibold">朋友圈</span>
        </div>
        <Camera size={24} className="text-gray-900" />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        {/* Cover Image Area */}
        <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 relative">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 right-4 flex items-end gap-3">
            <span className="text-white font-semibold text-base drop-shadow-lg">Jane Doe</span>
            <div className="ring-2 ring-white shadow-lg">
              <Avatar
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
                alt="Avatar"
                size="lg"
                rounded="lg"
              />
            </div>
          </div>
        </div>

        {/* Moment Post */}
        <div className="p-4">
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
                alt="Avatar"
                size="md"
                rounded="lg"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-[#576B95] font-semibold text-[15px] mb-1.5">Jane Doe</h3>
              <p className="text-[15px] text-gray-900 mb-3 leading-relaxed whitespace-pre-wrap">
                {data.prompt || "发现了一个超棒的宝藏产品！✨\n\n用了一段时间，真的太惊艳了！无论是颜值还是实用性都满分，强烈推荐给大家～"}
              </p>

              {/* Image Grid */}
              <div className="mb-3">
                {data.image ? (
                  <img src={data.image} alt="Upload" className="max-w-[85%] max-h-60 object-cover rounded" />
                ) : (
                  <div className="grid grid-cols-3 gap-1 max-w-[85%]">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={`https://picsum.photos/300/300?random=${i}`}
                          className="w-full h-full object-cover"
                          alt={`Gallery ${i}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">刚刚</span>
                <div className="w-8 h-5 bg-[#F7F7F7] rounded flex items-center justify-center gap-0.5">
                  <div className="w-1 h-1 bg-[#576B95] rounded-full" />
                  <div className="w-1 h-1 bg-[#576B95] rounded-full" />
                </div>
              </div>

              {/* Interaction Area */}
              <div className="bg-[#F7F7F7] mt-3 rounded overflow-hidden">
                <div className="flex items-center gap-2 text-xs text-[#576B95] font-medium px-2 py-2 border-b border-gray-200/50">
                  <Heart size={12} className="fill-[#576B95]" />
                  <span>小明, 小红, 和其他 128 人</span>
                </div>
                <div className="px-2 py-2 text-[13px]">
                  <span className="text-[#576B95] font-semibold">小明:</span>
                  <span className="text-gray-800 ml-1">这个看起来太棒了！在哪里买的？</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// RedNote Preview
// ==========================================
export function RedNotePreview({ data }: RendererProps) {
  const currentDate = new Date();

  // Helper for truncating title
  const truncatedTitle = data.prompt
    ? data.prompt.slice(0, 24) + (data.prompt.length > 24 ? '...' : '')
    : "✨ 必入好物 | 绝绝子的氛围感神器";

  const displayImage = data.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80";

  return (
    <div className="bg-white h-full w-full flex flex-col font-sans text-gray-900 relative">
      {/* Header */}
      <div className="h-12 bg-white flex items-center justify-between px-4 sticky top-0 z-10 shrink-0 border-b border-gray-100">
        <ArrowLeft size={22} className="text-gray-800" strokeWidth={2} />
        <div className="flex gap-5">
          <Share2 size={20} className="text-gray-800" />
          <MoreHorizontal size={20} className="text-gray-800" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Image */}
        <div className="w-full aspect-[3/4] bg-gray-100 relative">
          <img src={displayImage} alt="Main" className="w-full h-full object-cover" />
          {/* Pagination */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          </div>
        </div>

        <div className="p-4">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80"
              alt="Author"
            />
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900">时尚达人小红</div>
              <div className="text-xs text-gray-400">2小时前</div>
            </div>
            <button className="px-4 py-1.5 bg-[#FF2442] text-white text-xs font-semibold rounded-full">
              关注
            </button>
          </div>

          {/* Title */}
          <h1 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
            {truncatedTitle}
          </h1>

          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-4">
            {data.prompt || `姐妹们！这款真的绝了！🔥

从质感到设计都太对味了，拍照超出片，而且性价比也很高～

不吹不黑，用过的都说好！强烈安利给你们！

#${data.style || '日常分享'} #${data.product || '好物推荐'} #必买清单`}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">#{data.product || '好物'}</span>
            <span className="px-3 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">#{data.style || '风格'}</span>
            <span className="px-3 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">#每日穿搭</span>
          </div>

          <div className="text-xs text-gray-400 mb-6">编辑于 {currentDate.toLocaleDateString('zh-CN')}</div>

          <div className="border-t border-gray-100 my-4" />

          {/* Comments */}
          <div className="space-y-4">
            <Comment
              avatar="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80"
              author="爱购物的小仙女"
              text="姐妹求链接！这也太好看了吧 😍"
            />
            <Comment
              avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"
              author="时尚研究所"
              text="已加购！期待收货 ✨"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-14 bg-white border-t border-gray-100 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full flex-1 mr-4">
          <span className="text-xs text-gray-400">说点什么...</span>
        </div>
        <div className="flex items-center gap-6">
          <FooterButton icon={Heart} iconColor="text-[#FF2442] fill-[#FF2442]" count="2.3k" />
          <FooterButton icon={Star} iconColor="text-[#FAA61A] fill-[#FAA61A]" count="1.8k" />
          <FooterButton icon={MessageCircle} iconColor="text-gray-600" count="456" />
        </div>
      </div>
    </div>
  );
}
