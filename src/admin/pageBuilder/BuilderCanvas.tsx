import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  HelpCircle,
  MessageSquareQuote,
  Mail,
  Video,
  Images,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Box,
  Columns as ColumnsIcon,
  Layout,
  Type,
  MousePointer,
  Image as ImageIcon,
  Minus,
  Maximize2
} from 'lucide-react';
import { PageBuilderSection, PageBuilderBlock } from '../../types/pageBuilder.ts';
import { ViewportMode } from './BuilderToolbar.tsx';
import { createSectionInstance, createBlockInstance } from './builderElements.ts';
import {
  getHeadingStyles,
  getParagraphStyles,
  getButtonStyles,
  getImageStyles,
  getContainerStyles,
  getDividerStyles,
  getSpacerStyles,
  getColumnsGridStyles,
  getFlexJustifyClass
} from './styleHelpers.ts';

interface BuilderCanvasProps {
  sections: PageBuilderSection[];
  selectedElementId: string | null;
  selectedBlockId?: string | null;
  viewportMode: ViewportMode;
  isPreviewMode: boolean;
  onSelectElement: (sectionId: string | null, blockId?: string | null) => void;
  onDeleteElement: (id: string) => void;
  onDeleteBlock?: (sectionId: string, blockId: string) => void;
  onDuplicateElement: (id: string) => void;
  onDuplicateBlock?: (sectionId: string, blockId: string) => void;
  onToggleSectionVisibility?: (id: string) => void;
  onToggleBlockVisibility?: (sectionId: string, blockId: string) => void;
  onMoveSection?: (id: string, direction: 'up' | 'down') => void;
  onReorderSections: (fromIndex: number, toIndex: number) => void;
  onAddSection: (newSection: PageBuilderSection, atIndex?: number) => void;
  onAddBlockToContainer?: (sectionId: string, blockType: string, atIndex?: number) => void;
  onAddFirstSection: () => void;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  sections,
  selectedElementId,
  selectedBlockId,
  viewportMode,
  isPreviewMode,
  onSelectElement,
  onDeleteElement,
  onDeleteBlock,
  onDuplicateElement,
  onDuplicateBlock,
  onToggleSectionVisibility,
  onToggleBlockVisibility,
  onMoveSection,
  onReorderSections,
  onAddSection,
  onAddBlockToContainer,
  onAddFirstSection
}) => {
  // Drag and drop states
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [hoveredAddIndex, setHoveredAddIndex] = useState<number | null>(null);
  const [activeContainerDropId, setActiveContainerDropId] = useState<string | null>(null);

  const getViewportWidthClass = () => {
    switch (viewportMode) {
      case 'tablet':
        return 'w-[768px] min-h-[1024px] shadow-2xl my-6 transition-all duration-300';
      case 'mobile':
        return 'w-[375px] min-h-[667px] shadow-2xl my-6 transition-all duration-300';
      case 'desktop':
      default:
        return 'w-full min-h-full my-0 transition-all duration-300';
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropIndicatorIndex !== index) {
      setDropIndicatorIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropIndicatorIndex(null);
    setActiveContainerDropId(null);

    // 1. Check if dragging new element from left sidebar
    const elementType = e.dataTransfer.getData('application/laam-element-type');
    if (elementType) {
      const newSec = createSectionInstance(elementType as any);
      onAddSection(newSec, targetIndex);
      return;
    }

    // 2. Check if reordering existing section
    const fromIndexStr = e.dataTransfer.getData('application/laam-section-index');
    if (fromIndexStr !== '') {
      const fromIndex = Number(fromIndexStr);
      if (fromIndex !== targetIndex && fromIndex !== targetIndex - 1) {
        onReorderSections(fromIndex, targetIndex > fromIndex ? targetIndex - 1 : targetIndex);
      }
    }
    setDraggedSectionIndex(null);
  };

  const handleContainerDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveContainerDropId(null);
    setDropIndicatorIndex(null);

    const elementType = e.dataTransfer.getData('application/laam-element-type');
    if (elementType && onAddBlockToContainer) {
      onAddBlockToContainer(sectionId, elementType);
    }
  };

  // Helper for rendering child blocks inside container/columns
  const renderChildBlock = (sec: PageBuilderSection, blk: PageBuilderBlock) => {
    const isBlockSelected = selectedElementId === sec.id && selectedBlockId === blk.id;
    const isBlkHidden = Boolean(blk.disabled);
    const s = blk.settings || {};

    if (isPreviewMode && isBlkHidden) return null;

    let content = null;
    switch (blk.type) {
      case 'heading': {
        const headingStyle = getHeadingStyles(s);
        const level = s.level || 'h2';
        const HeadingTag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(level) ? level : 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        content = (
          <div style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <HeadingTag style={headingStyle}>{s.text || 'Heading Block'}</HeadingTag>
          </div>
        );
        break;
      }

      case 'text': {
        const textStyle = getParagraphStyles(s);
        content = (
          <div style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <p style={textStyle}>{s.content || 'Paragraph block text inside container.'}</p>
          </div>
        );
        break;
      }

      case 'button': {
        const btnStyle = getButtonStyles(s);
        const justifyClass = getFlexJustifyClass(s.alignment);
        content = (
          <div className={`flex ${justifyClass}`} style={{ width: '100%' }}>
            <span style={btnStyle}>{s.label || 'Button'}</span>
          </div>
        );
        break;
      }

      case 'image': {
        const imgStyle = getImageStyles(s);
        content = (
          <div style={{ width: '100%' }}>
            <img
              src={s.imageUrl || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80'}
              alt={s.altText || 'Editorial'}
              style={imgStyle}
            />
          </div>
        );
        break;
      }

      case 'divider': {
        const divStyle = getDividerStyles(s);
        content = <hr style={divStyle} />;
        break;
      }

      case 'spacer': {
        const spcStyle = getSpacerStyles(s);
        content = <div style={spcStyle} />;
        break;
      }

      default:
        content = (
          <div className="p-3 bg-neutral-100 rounded text-xs text-[#737373]">
            {blk.title || blk.type}
          </div>
        );
    }

    return (
      <div
        key={blk.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectElement(sec.id, blk.id);
        }}
        className={`relative group/blk p-2 rounded-xl transition-all ${
          isPreviewMode
            ? ''
            : isBlockSelected
            ? 'ring-2 ring-[#E04F16] bg-amber-50/20'
            : 'hover:ring-1 hover:ring-amber-400 cursor-pointer'
        } ${isBlkHidden && !isPreviewMode ? 'opacity-50 border-2 border-dashed border-amber-300' : ''}`}
      >
        {/* Floating Block Pill when Selected */}
        {!isPreviewMode && isBlockSelected && (
          <div
            className="absolute -top-3 left-3 z-30 bg-[#E04F16] text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{blk.title || blk.type}</span>
            <div className="h-2.5 w-px bg-white/30" />
            {onDuplicateBlock && (
              <button
                onClick={() => onDuplicateBlock(sec.id, blk.id)}
                className="hover:text-white/80"
                title="Duplicate Block"
              >
                <Copy className="w-2.5 h-2.5" />
              </button>
            )}
            {onToggleBlockVisibility && (
              <button
                onClick={() => onToggleBlockVisibility(sec.id, blk.id)}
                className="hover:text-white/80"
                title={isBlkHidden ? 'Show Block' : 'Hide Block'}
              >
                {isBlkHidden ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
              </button>
            )}
            {onDeleteBlock && (
              <button
                onClick={() => onDeleteBlock(sec.id, blk.id)}
                className="hover:text-red-200"
                title="Delete Block"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        )}

        {/* Hidden Indicator */}
        {!isPreviewMode && isBlkHidden && (
          <div className="absolute top-1 right-1 z-10 bg-neutral-800 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
            <EyeOff className="w-2.5 h-2.5 text-amber-400" />
            <span>Hidden</span>
          </div>
        )}

        {content}
      </div>
    );
  };

  const renderSectionContent = (sec: PageBuilderSection) => {
    const s = sec.settings || {};

    switch (sec.type) {
      case 'hero':
        return (
          <div
            className="relative overflow-hidden bg-[#141414] text-white flex items-center justify-center p-8 sm:p-16 text-center"
            style={{
              minHeight: s.minHeight || '420px',
              backgroundImage: s.backgroundImage ? `url(${s.backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: s.overlayOpacity ?? 0.4 }}
            />
            <div className="relative max-w-2xl mx-auto space-y-4">
              {s.badge && (
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] tracking-widest uppercase font-semibold text-white">
                  {s.badge}
                </span>
              )}
              <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight drop-shadow-sm">
                {s.heading || 'Royal Festive Edit 2026'}
              </h1>
              {s.subheading && (
                <p className="text-sm sm:text-base text-white/90 font-light leading-relaxed drop-shadow-sm">
                  {s.subheading}
                </p>
              )}
              {s.buttonText && (
                <div className="pt-2">
                  <span className="inline-block px-6 py-2.5 bg-[#E04F16] text-white rounded-xl text-xs font-semibold shadow-md">
                    {s.buttonText}
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 'banner':
        return (
          <div className="p-8 sm:p-12 bg-[#FAF9F6] border-y border-[#E5E5E5] text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#141414]">
              {s.heading || s.title || 'Curated Festive Edit'}
            </h2>
            {s.subheading && (
              <p className="text-xs sm:text-sm text-[#737373] max-w-xl mx-auto">
                {s.subheading}
              </p>
            )}
          </div>
        );

      case 'heading': {
        const headingStyle = getHeadingStyles(s);
        const level = s.level || 'h2';
        const HeadingTag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(level) ? level : 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        return (
          <div className="p-4" style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <HeadingTag style={headingStyle}>{s.text || 'Section Heading'}</HeadingTag>
          </div>
        );
      }

      case 'text': {
        const textStyle = getParagraphStyles(s);
        return (
          <div className="p-4" style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <p style={textStyle}>{s.content || 'Paragraph text content detailing collection features and craftsmanship.'}</p>
          </div>
        );
      }

      case 'rich_text': {
        const titleStyle = getHeadingStyles({ ...s, level: 'h3', fontFamily: s.fontFamily || 'serif' });
        const bodyStyle = getParagraphStyles(s);
        return (
          <div className="max-w-4xl mx-auto p-6 sm:p-8">
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 text-center space-y-3 shadow-sm">
              {s.title && <h3 style={titleStyle}>{s.title}</h3>}
              {s.content && <div style={bodyStyle} className="whitespace-pre-line max-w-2xl mx-auto">{s.content}</div>}
            </div>
          </div>
        );
      }

      case 'button': {
        const btnStyle = getButtonStyles(s);
        const justifyClass = getFlexJustifyClass(s.alignment);
        return (
          <div className={`p-4 flex ${justifyClass}`} style={{ width: '100%' }}>
            <span style={btnStyle}>{s.label || 'Explore Collection'}</span>
          </div>
        );
      }

      case 'image': {
        const imgStyle = getImageStyles(s);
        return (
          <div className="p-4" style={{ width: '100%' }}>
            <img
              src={s.imageUrl || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=85'}
              alt={s.altText || 'Editorial'}
              style={imgStyle}
            />
          </div>
        );
      }

      case 'divider': {
        const divStyle = getDividerStyles(s);
        return (
          <div className="p-4" style={{ width: '100%' }}>
            <hr style={divStyle} />
          </div>
        );
      }

      case 'spacer': {
        const spcStyle = getSpacerStyles(s);
        return <div style={spcStyle} />;
      }

      case 'container':
      case 'section': {
        const isContainerOver = activeContainerDropId === sec.id;
        const containerStyle = getContainerStyles(s, sec.type === 'section');
        return (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (activeContainerDropId !== sec.id) setActiveContainerDropId(sec.id);
            }}
            onDragLeave={(e) => {
              e.stopPropagation();
              if (activeContainerDropId === sec.id) setActiveContainerDropId(null);
            }}
            onDrop={(e) => handleContainerDrop(e, sec.id)}
            className={`transition-all rounded-2xl ${
              isContainerOver ? 'ring-2 ring-[#E04F16] bg-orange-50/20' : ''
            }`}
            style={containerStyle}
          >
            {/* Background darkening overlay if image is present */}
            {s.backgroundImage && (s.overlayOpacity ?? 0) > 0 && (
              <div
                className="absolute inset-0 bg-black pointer-events-none rounded-[inherit]"
                style={{ opacity: s.overlayOpacity }}
              />
            )}
            {/* Header label for container */}
            {!isPreviewMode && (
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-dashed border-[#E5E5E5] text-[10px] uppercase font-bold text-[#737373]">
                <span className="flex items-center gap-1">
                  <Box className="w-3 h-3 text-[#E04F16]" />
                  <span>{sec.title || sec.type}</span>
                </span>
                <span>{sec.blocks?.length || 0} nested items</span>
              </div>
            )}

            {/* Child blocks */}
            {sec.blocks && sec.blocks.length > 0 ? (
              <div className="space-y-3">
                {sec.blocks.map((blk) => renderChildBlock(sec, blk))}
              </div>
            ) : null}

            {/* Empty or Add block drop zone inside container */}
            {!isPreviewMode && (
              <div
                className={`mt-3 p-4 border-2 border-dashed rounded-xl text-center transition-all ${
                  isContainerOver
                    ? 'border-[#E04F16] bg-orange-50 text-[#E04F16]'
                    : 'border-neutral-300 hover:border-neutral-400 text-neutral-500'
                }`}
              >
                <p className="text-xs font-semibold mb-2">
                  {isContainerOver ? 'Drop element to insert inside container' : 'Container Drop Zone'}
                </p>
                {onAddBlockToContainer && (
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => onAddBlockToContainer(sec.id, 'heading')}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3 h-3 text-[#E04F16]" /> Heading
                    </button>
                    <button
                      onClick={() => onAddBlockToContainer(sec.id, 'text')}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3 h-3 text-[#E04F16]" /> Text
                    </button>
                    <button
                      onClick={() => onAddBlockToContainer(sec.id, 'button')}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3 h-3 text-[#E04F16]" /> Button
                    </button>
                    <button
                      onClick={() => onAddBlockToContainer(sec.id, 'image')}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3 h-3 text-[#E04F16]" /> Image
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      case 'columns': {
        const colCount = Number(s.columnCount) || 2;
        return (
          <div className="max-w-6xl mx-auto p-6">
            {!isPreviewMode && (
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-dashed border-[#E5E5E5] text-[10px] uppercase font-bold text-[#737373]">
                <span className="flex items-center gap-1">
                  <ColumnsIcon className="w-3 h-3 text-[#E04F16]" />
                  <span>{sec.title || 'Columns Layout'} ({colCount} Columns)</span>
                </span>
              </div>
            )}
            <div style={getColumnsGridStyles(s)}>
              {sec.blocks && sec.blocks.length > 0 ? (
                sec.blocks.map((blk) => renderChildBlock(sec, blk))
              ) : (
                <>
                  <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl shadow-sm space-y-2">
                    <h4 className="font-serif font-bold text-base text-[#141414]">Column 1</h4>
                    <p className="text-xs text-[#525252] leading-relaxed">
                      {s.col1Text || 'Handcrafted luxury and artisan tailoring.'}
                    </p>
                  </div>
                  <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl shadow-sm space-y-2">
                    <h4 className="font-serif font-bold text-base text-[#141414]">Column 2</h4>
                    <p className="text-xs text-[#525252] leading-relaxed">
                      {s.col2Text || 'Global express shipping directly to your doorstep.'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      }

      case 'image_with_text': {
        const isLeft = s.imagePosition !== 'right';
        return (
          <div className="max-w-6xl mx-auto p-6 sm:p-8">
            <div
              className={`flex flex-col md:flex-row items-center gap-8 bg-white rounded-3xl border border-[#E5E5E5] p-8 shadow-sm ${
                isLeft ? '' : 'md:flex-row-reverse'
              }`}
            >
              <div className="w-full md:w-1/2">
                <img
                  src={s.imageUrl || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'}
                  alt={s.heading || 'Editorial'}
                  className="rounded-2xl object-cover w-full h-[320px] shadow-sm"
                />
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#141414]">
                  {s.heading || 'Handcrafted With Heritage'}
                </h3>
                <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
                  {s.text || 'Every stitch tells a story of century-old subcontinental heritage, re-imagined for the contemporary global muse.'}
                </p>
                {s.buttonText && (
                  <span className="inline-block px-5 py-2.5 bg-[#141414] text-white rounded-xl text-xs font-semibold">
                    {s.buttonText}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'faq':
        return (
          <div className="max-w-4xl mx-auto p-6 space-y-4">
            <h3 className="text-2xl font-serif font-bold text-center text-[#141414]">
              {s.heading || 'Frequently Asked Questions'}
            </h3>
            <div className="divide-y divide-[#E5E5E5] bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
              {(s.items || []).map((item: any, iIdx: number) => (
                <div key={iIdx} className="p-4 space-y-1">
                  <div className="font-bold text-xs text-[#141414]">{item.q}</div>
                  <div className="text-xs text-[#525252]">{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="max-w-4xl mx-auto p-8">
            <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <MessageSquareQuote className="w-8 h-8 text-[#E04F16] mx-auto opacity-70" />
              <blockquote className="text-base sm:text-lg font-serif italic text-[#141414] max-w-2xl mx-auto">
                &ldquo;{s.quote || 'The craftsmanship and fit exceeded all expectations. Exceptional luxury service.'}&rdquo;
              </blockquote>
              <div>
                <div className="font-bold text-xs text-[#141414]">{s.author || 'Fatima R.'}</div>
                <div className="text-[11px] text-[#737373]">{s.location || 'London, UK'}</div>
              </div>
            </div>
          </div>
        );

      case 'newsletter':
        return (
          <div className="max-w-3xl mx-auto p-6">
            <div className="bg-[#141414] text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
              <Mail className="w-8 h-8 text-[#E04F16] mx-auto" />
              <h3 className="text-2xl font-serif font-bold">{s.heading || 'Join the LAAM Inner Circle'}</h3>
              <p className="text-xs text-white/70 max-w-md mx-auto">{s.subheading || 'Receive private invitations to couture launches and 10% off.'}</p>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  disabled
                  placeholder={s.placeholder || 'Enter your email address'}
                  className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/40 flex-1"
                />
                <span className="px-6 py-2.5 bg-[#E04F16] text-white rounded-xl text-xs font-semibold inline-block">
                  {s.buttonText || 'Subscribe'}
                </span>
              </div>
            </div>
          </div>
        );

      case 'product_grid':
        return (
          <div className="max-w-6xl mx-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <h3 className="text-xl font-serif font-bold text-[#141414]">
                {s.heading || 'Trending Ready to Ship Pret'}
              </h3>
              <span className="text-xs font-semibold text-[#E04F16] flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white rounded-2xl border border-[#E5E5E5] p-3 space-y-2 shadow-sm">
                  <div className="w-full h-44 bg-neutral-100 rounded-xl overflow-hidden relative">
                    <img
                      src={`https://images.unsplash.com/photo-${item === 1 ? '1566737236500-c8ac43014a67' : item === 2 ? '1583391733956-3750e0ff4e8b' : item === 3 ? '1594223274512-ad4803739b7c' : '1529139574466-a303027c1d8b'}?auto=format&fit=crop&w=600&q=80`}
                      alt="Catalog Item"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      PRE-ORDER
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#141414] truncate">PD Luxury Pret Couture</div>
                  <div className="text-xs font-semibold text-[#E04F16]">$195 USD</div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-8 max-w-4xl mx-auto text-center border border-dashed border-[#E5E5E5] rounded-2xl bg-white space-y-2">
            <div className="font-bold text-xs capitalize text-[#141414]">{sec.type.replace(/_/g, ' ')}</div>
            <p className="text-xs text-[#737373]">{s.content || s.title || 'Component preview'}</p>
          </div>
        );
    }
  };

  return (
    <div
      onClick={() => onSelectElement(null, null)}
      className="flex-1 h-full overflow-y-auto bg-[#E8E8E8] flex flex-col items-center p-4 sm:p-8 select-none"
    >
      <div
        className={`${getViewportWidthClass()} bg-white shadow-xl transition-all relative min-h-[600px] flex flex-col`}
      >
        {/* Top Drop Zone (Index 0) */}
        {!isPreviewMode && sections.length > 0 && (
          <div
            onDragOver={(e) => handleDragOver(e, 0)}
            onDragLeave={() => setDropIndicatorIndex(null)}
            onDrop={(e) => handleDrop(e, 0)}
            className={`transition-all ${
              dropIndicatorIndex === 0
                ? 'h-10 bg-[#E04F16]/10 border-2 border-dashed border-[#E04F16] flex items-center justify-center text-[#E04F16] text-xs font-bold'
                : 'h-2 hover:h-4 opacity-0 hover:opacity-100 hover:bg-neutral-200'
            }`}
          >
            {dropIndicatorIndex === 0 && (
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Drop Section at Top
              </span>
            )}
          </div>
        )}

        {sections.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center text-[#737373]">
              <Layers className="w-8 h-8 text-[#E04F16]" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-serif font-bold text-lg text-[#141414]">Canvas is Empty</h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                Drag any element from the Elements library on the left, or click below to start designing your custom layout.
              </p>
            </div>
            <button
              onClick={onAddFirstSection}
              className="px-5 py-2.5 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 text-[#E04F16]" />
              <span>Add Your First Section</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-transparent flex-1">
            {sections.map((sec, index) => {
              const isSelected = selectedElementId === sec.id && !selectedBlockId;
              const isHidden = Boolean(sec.disabled);

              if (isPreviewMode && isHidden) return null;

              return (
                <React.Fragment key={sec.id}>
                  {/* Insertion Drop Line above this section if dragging */}
                  {dropIndicatorIndex === index && (
                    <div className="h-8 bg-[#E04F16]/15 border-2 border-dashed border-[#E04F16] flex items-center justify-center text-[#E04F16] text-xs font-bold animate-pulse">
                      <span className="flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Insert Section Here
                      </span>
                    </div>
                  )}

                  {/* Section Container on Canvas */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectElement(sec.id, null);
                    }}
                    className={`relative group transition-all ${
                      isPreviewMode
                        ? ''
                        : isSelected
                        ? 'ring-2 ring-[#E04F16] z-10'
                        : 'hover:ring-1 hover:ring-blue-400 cursor-pointer'
                    } ${isHidden && !isPreviewMode ? 'opacity-40 grayscale-[40%] border-2 border-dashed border-amber-400' : ''}`}
                  >
                    {/* Floating Action Header when Selected */}
                    {!isPreviewMode && isSelected && (
                      <div
                        className="absolute -top-3.5 left-4 z-30 bg-[#141414] text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2.5 shadow-xl border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Drag Handle to reorder */}
                        <div
                          draggable
                          onDragStart={(e) => {
                            setDraggedSectionIndex(index);
                            e.dataTransfer.setData('application/laam-section-index', String(index));
                            e.dataTransfer.setData('application/laam-section-id', sec.id);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-white p-0.5 flex items-center gap-1"
                          title="Drag to reorder section"
                        >
                          <GripVertical className="w-3.5 h-3.5 text-[#E04F16]" />
                          <span>{sec.title || sec.type}</span>
                        </div>

                        <div className="h-3 w-px bg-white/20" />

                        {/* Move Up / Down */}
                        {onMoveSection && (
                          <>
                            <button
                              onClick={() => onMoveSection(sec.id, 'up')}
                              disabled={index === 0}
                              className="hover:text-white/80 disabled:opacity-20"
                              title="Move section up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onMoveSection(sec.id, 'down')}
                              disabled={index === sections.length - 1}
                              className="hover:text-white/80 disabled:opacity-20"
                              title="Move section down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <div className="h-3 w-px bg-white/20" />
                          </>
                        )}

                        {/* Duplicate */}
                        <button
                          onClick={() => onDuplicateElement(sec.id)}
                          className="hover:text-[#E04F16] transition-colors"
                          title="Duplicate section"
                        >
                          <Copy className="w-3 h-3" />
                        </button>

                        {/* Visibility */}
                        {onToggleSectionVisibility && (
                          <button
                            onClick={() => onToggleSectionVisibility(sec.id)}
                            className="hover:text-amber-400 transition-colors"
                            title={isHidden ? 'Show on storefront' : 'Hide from storefront'}
                          >
                            {isHidden ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteElement(sec.id)}
                          className="hover:text-red-400 transition-colors"
                          title="Delete section"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Hidden Indicator Badge */}
                    {!isPreviewMode && isHidden && (
                      <div className="absolute top-2 right-2 z-20 bg-neutral-900/90 text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        <span>Hidden on Storefront</span>
                      </div>
                    )}

                    {/* Section Content */}
                    <div className="w-full">
                      {renderSectionContent(sec)}
                    </div>
                  </div>

                  {/* Inter-section Drop & Quick Add slot */}
                  {!isPreviewMode && (
                    <div
                      onMouseEnter={() => setHoveredAddIndex(index + 1)}
                      onMouseLeave={() => setHoveredAddIndex(null)}
                      onDragOver={(e) => handleDragOver(e, index + 1)}
                      onDragLeave={() => setDropIndicatorIndex(null)}
                      onDrop={(e) => handleDrop(e, index + 1)}
                      className={`relative flex items-center justify-center transition-all ${
                        dropIndicatorIndex === index + 1
                          ? 'h-8 bg-[#E04F16]/15 border-2 border-dashed border-[#E04F16] text-[#E04F16] text-xs font-bold'
                          : hoveredAddIndex === index + 1
                          ? 'h-6 bg-neutral-100'
                          : 'h-1.5'
                      }`}
                    >
                      {dropIndicatorIndex === index + 1 ? (
                        <span className="flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Insert Section Here
                        </span>
                      ) : hoveredAddIndex === index + 1 ? (
                        <button
                          onClick={() => onAddSection(createSectionInstance('section'), index + 1)}
                          className="px-2.5 py-0.5 bg-[#141414] text-white rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-sm hover:scale-105 transition-transform"
                        >
                          <Plus className="w-3 h-3 text-[#E04F16]" />
                          <span>Insert Section</span>
                        </button>
                      ) : null}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Bottom Canvas Drop Zone */}
        {!isPreviewMode && sections.length > 0 && (
          <div
            onDragOver={(e) => handleDragOver(e, sections.length)}
            onDragLeave={() => setDropIndicatorIndex(null)}
            onDrop={(e) => handleDrop(e, sections.length)}
            className={`p-4 border-t-2 border-dashed transition-all text-center ${
              dropIndicatorIndex === sections.length
                ? 'border-[#E04F16] bg-orange-50 text-[#E04F16] font-bold text-xs'
                : 'border-transparent hover:border-neutral-300 text-neutral-400 hover:text-neutral-600 text-xs'
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <Plus className="w-3.5 h-3.5 text-[#E04F16]" />
              <span>Drag elements here to add to bottom of page</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
