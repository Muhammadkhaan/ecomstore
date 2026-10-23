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
  Maximize2,
  Heart,
  Star,
  Clock,
  Flame,
  ArrowRight,
  ShieldCheck,
  Check,
  CheckCircle2,
  SlidersHorizontal,
  Globe,
  Scissors,
  Headphones,
  ChevronLeft
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
  getFlexJustifyClass,
  getUniversalWidgetStyles,
  resolveResponsiveSettings,
  isElementHidden,
  parseDimension
} from './styleHelpers.ts';
import { PRODUCTS } from '../../data/products.ts';

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
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({});
  const toggleFaq = (key: string) => {
    setOpenFaqs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getViewportWidthClass = () => {
    switch (viewportMode) {
      case 'tablet':
        return 'w-[768px] min-h-[1024px] shadow-2xl my-4 rounded-xl border border-neutral-300 transition-all duration-300 overflow-hidden';
      case 'mobile':
        return 'w-[375px] min-h-[667px] shadow-2xl my-4 rounded-3xl border-4 border-neutral-800 transition-all duration-300 overflow-hidden';
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
    const isBlkDisabled = Boolean(blk.disabled);
    const isBlkDeviceHidden = isElementHidden(blk.settings, viewportMode);
    const isBlkHidden = isBlkDisabled || isBlkDeviceHidden;
    const s = resolveResponsiveSettings(blk.settings || {}, viewportMode);

    if (isPreviewMode && isBlkHidden) return null;

    let content = null;
    switch (blk.type) {
      case 'heading': {
        const headingStyle = getHeadingStyles(s, viewportMode);
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
        const textStyle = getParagraphStyles(s, viewportMode);
        content = (
          <div style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <p style={textStyle}>{s.content || 'Paragraph block text inside container.'}</p>
          </div>
        );
        break;
      }

      case 'button': {
        const btnStyle = getButtonStyles(s, viewportMode);
        const justifyClass = getFlexJustifyClass(s.alignment);
        content = (
          <div className={`flex ${justifyClass}`} style={{ width: '100%' }}>
            <span style={btnStyle}>{s.label || 'Button'}</span>
          </div>
        );
        break;
      }

      case 'image': {
        const imgStyle = getImageStyles(s, viewportMode);
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
        const divStyle = getDividerStyles(s, viewportMode);
        content = <hr style={divStyle} />;
        break;
      }

      case 'spacer': {
        const spcStyle = getSpacerStyles(s, viewportMode);
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
          <div className="absolute top-1 right-1 z-10 bg-neutral-900/90 text-amber-300 border border-amber-500/30 text-[9px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
            <EyeOff className="w-2.5 h-2.5 text-amber-400" />
            <span>{isBlkDeviceHidden ? `Hidden on ${viewportMode}` : 'Hidden'}</span>
          </div>
        )}

        {content}
      </div>
    );
  };

  const renderSectionContent = (sec: PageBuilderSection) => {
    const s = resolveResponsiveSettings(sec.settings || {}, viewportMode);

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
        const headingStyle = getHeadingStyles(s, viewportMode);
        const level = s.level || 'h2';
        const HeadingTag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(level) ? level : 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        return (
          <div className="p-4" style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <HeadingTag style={headingStyle}>{s.text || 'Section Heading'}</HeadingTag>
          </div>
        );
      }

      case 'text': {
        const textStyle = getParagraphStyles(s, viewportMode);
        return (
          <div className="p-4" style={{ maxWidth: s.maxWidth || '100%', margin: '0 auto' }}>
            <p style={textStyle}>{s.content || 'Paragraph text content detailing collection features and craftsmanship.'}</p>
          </div>
        );
      }

      case 'rich_text': {
        const titleStyle = getHeadingStyles({ ...s, level: 'h3', fontFamily: s.fontFamily || 'serif' }, viewportMode);
        const bodyStyle = getParagraphStyles(s, viewportMode);
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
        const btnStyle = getButtonStyles(s, viewportMode);
        const justifyClass = getFlexJustifyClass(s.alignment);
        return (
          <div className={`p-4 flex ${justifyClass}`} style={{ width: '100%' }}>
            <span style={btnStyle}>{s.label || 'Explore Collection'}</span>
          </div>
        );
      }

      case 'image': {
        const imgStyle = getImageStyles(s, viewportMode);
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
        const divStyle = getDividerStyles(s, viewportMode);
        return (
          <div className="p-4" style={{ width: '100%' }}>
            <hr style={divStyle} />
          </div>
        );
      }

      case 'spacer': {
        const spcStyle = getSpacerStyles(s, viewportMode);
        return <div style={spcStyle} />;
      }

      case 'container':
      case 'section': {
        const isContainerOver = activeContainerDropId === sec.id;
        const containerStyle = getContainerStyles(s, sec.type === 'section', viewportMode);
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
            <div style={getColumnsGridStyles(s, viewportMode)}>
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
        const wrapperStyle = getUniversalWidgetStyles(s, viewportMode, '1200px');
        return (
          <div className="max-w-6xl mx-auto p-4 sm:p-6" style={wrapperStyle}>
            <div
              className={`flex flex-col md:flex-row items-center gap-8 bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-10 shadow-sm ${
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
                <span className="text-xs font-semibold uppercase tracking-wider text-[#087443] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#087443]" />
                  <span>Artisanal Heritage</span>
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#141414] leading-tight">
                  {s.heading || 'Handcrafted With Heritage'}
                </h3>
                <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
                  {s.text || 'Every stitch tells a story of century-old subcontinental heritage, re-imagined for the contemporary global muse.'}
                </p>
                {s.buttonText && (
                  <span className="inline-block px-5 py-2.5 bg-[#141414] text-white rounded-xl text-xs font-semibold shadow-sm">
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
          <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4" style={getUniversalWidgetStyles(s, viewportMode, '896px')}>
            <h3 className="text-2xl font-serif font-bold text-center text-[#141414]">
              {s.heading || 'Frequently Asked Questions'}
            </h3>
            {s.subheading && <p className="text-xs text-[#737373] text-center -mt-2">{s.subheading}</p>}
            <div className="divide-y divide-[#E5E5E5] bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
              {((s.items || [
                { q: 'How long does custom stitching take?', a: 'Bespoke couture typically takes 2-3 weeks for handcrafted embroidery and tailoring.' },
                { q: 'Do you offer worldwide express shipping?', a: 'Yes, we provide DHL Express shipping worldwide with doorstep tracking.' },
                { q: 'How do I determine my size?', a: 'Refer to our Global Size Guide or connect with our AI Concierge stylist for assistance.' }
              ]) as any[]).map((item: any, iIdx: number) => {
                const itemKey = `${sec.id}-${iIdx}`;
                const isOpen = openFaqs[itemKey] ?? (iIdx === 0);
                return (
                  <div
                    key={iIdx}
                    className="p-4 sm:p-5 space-y-1.5 cursor-pointer select-none hover:bg-neutral-50/50 transition-colors"
                    onClick={() => toggleFaq(itemKey)}
                  >
                    <div className="font-bold text-xs sm:text-sm text-[#141414] flex items-center justify-between">
                      <span>{item.q}</span>
                      <ChevronRight
                        className={`w-4 h-4 text-[#737373] transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                    {isOpen && (
                      <div className="text-xs text-[#525252] leading-relaxed pt-2 border-t border-neutral-100 mt-2">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="max-w-4xl mx-auto p-4 sm:p-8" style={getUniversalWidgetStyles(s, viewportMode, '896px')}>
            <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-3xl p-6 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= (Number(s.rating) || 5) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <blockquote className="text-base sm:text-xl font-serif italic text-[#141414] max-w-2xl mx-auto leading-relaxed">
                &ldquo;{s.quote || 'The craftsmanship and fit exceeded all expectations. Exceptional luxury service.'}&rdquo;
              </blockquote>
              <div className="pt-2">
                <div className="font-bold text-xs sm:text-sm text-[#141414]">{s.author || 'Dr. Fatima R.'}</div>
                <div className="text-[11px] text-[#737373]">{s.location || 'London, United Kingdom'}</div>
              </div>
            </div>
          </div>
        );

      case 'newsletter':
        return (
          <div className="max-w-3xl mx-auto p-4 sm:p-6" style={getUniversalWidgetStyles(s, viewportMode, '768px')}>
            <div className="bg-[#141414] text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto text-[#E04F16]">
                <Mail className="w-5 h-5 text-[#E04F16]" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">{s.heading || 'Join the LAAM Inner Circle'}</h3>
              <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                {s.subheading || 'Receive private invitations to couture launches and 10% off your first luxury order.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  disabled
                  placeholder={s.placeholder || 'Enter your email address'}
                  className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/40 flex-1"
                />
                <span className="px-6 py-2.5 bg-[#E04F16] text-white rounded-xl text-xs font-semibold inline-block shrink-0 shadow-sm">
                  {s.buttonText || 'Subscribe'}
                </span>
              </div>
            </div>
          </div>
        );

      case 'trust_signals': {
        const t1 = s.item1Title || '100% Original Designer Wear';
        const d1 = s.item1Subtitle || 'Directly sourced from verified Pakistani ateliers';
        const t2 = s.item2Title || 'Express Global Shipping';
        const d2 = s.item2Subtitle || 'Doorstep DHL delivery across 150+ countries';
        const t3 = s.item3Title || 'Secure Checkout Guaranteed';
        const d3 = s.item3Subtitle || 'End-to-end encrypted international transactions';
        const t4 = s.item4Title || 'Direct From Designers';
        const d4 = s.item4Subtitle || 'Authentic pret, luxury couture & bridal wear';

        return (
          <div className="w-full bg-white border-y border-[#E5E5E5] py-6 sm:py-8" style={getUniversalWidgetStyles(s, viewportMode, '100%')}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { icon: ShieldCheck, title: t1, desc: d1 },
                  { icon: Globe, title: t2, desc: d2 },
                  { icon: Scissors, title: t3, desc: d3 },
                  { icon: Headphones, title: t4, desc: d4 }
                ].map((feat, fIdx) => {
                  const IconComp = feat.icon;
                  return (
                    <div
                      key={fIdx}
                      className="flex items-start gap-3.5 p-3 rounded-xl border border-transparent bg-[#FAF9F6] border-[#E5E5E5]/60"
                    >
                      <div className="p-2.5 rounded-lg bg-[#D3F8DF] shrink-0 border border-[#73E2A3]/40 text-[#087443]">
                        <IconComp className="w-5 h-5 text-[#087443]" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs sm:text-sm font-semibold text-[#141414] leading-snug">
                          {feat.title}
                        </h4>
                        <p className="text-[11px] text-[#525252] leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      case 'product_grid': {
        const defaultCols = viewportMode === 'mobile' ? 1 : viewportMode === 'tablet' ? 2 : 4;
        const cols = Number(s.columnCount) || defaultCols;
        const limit = Number(s.limit) || 8;
        const categoryFilter = s.category || 'all';
        const filteredProds = categoryFilter === 'all'
          ? PRODUCTS
          : PRODUCTS.filter((p) => p.category === categoryFilter);
        const displayProds = (filteredProds.length > 0 ? filteredProds : PRODUCTS).slice(0, limit);

        return (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4" style={getUniversalWidgetStyles(s, viewportMode, '1280px')}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E5E5E5] pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#E04F16]">
                  <Flame className="w-3.5 h-3.5 fill-[#E04F16]" />
                  <span>Official Direct Catalog</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#141414] mt-0.5">
                  {s.heading || 'Trending Ready to Ship Pret'}
                </h3>
                {s.subheading && <p className="text-xs text-[#737373] mt-0.5">{s.subheading}</p>}
              </div>
              <span className="text-xs font-semibold text-[#141414] flex items-center gap-1 self-start sm:self-auto">
                View All Catalog <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gap: parseDimension(s.gap, viewportMode === 'mobile' ? '12px' : '20px')
              }}
            >
              {displayProds.map((prod) => (
                <div
                  key={prod.id}
                  className="group relative flex flex-col bg-white rounded-xl border border-[#E5E5E5] overflow-hidden shadow-xs hover:shadow-md transition-all"
                >
                  {/* Aspect 3:4 Fashion Visual */}
                  <div className="relative aspect-[3/4] w-full bg-[#FAF9F6] overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Top tags */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                      {prod.badge ? (
                        <span className="text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm bg-[#D3F8DF] text-[#087443] border border-[#73E2A3]/50">
                          {prod.badge}
                        </span>
                      ) : (
                        <span />
                      )}
                      <div className="p-1.5 rounded-full bg-white/90 text-[#424242] shadow-sm">
                        <Heart className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    {/* Dispatch badge */}
                    {prod.readyToShip && (
                      <div className="absolute bottom-2.5 left-2.5 z-10">
                        <span className="inline-flex items-center gap-1 bg-[#141414]/85 text-white text-[9px] px-2 py-0.5 rounded backdrop-blur-xs">
                          <Clock className="w-3 h-3 text-[#73E2A3]" />
                          Dispatches in 24h
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-medium tracking-wider uppercase text-[#737373]">
                        <span>{prod.designer}</span>
                        <span className="text-[#087443] font-semibold">★ {prod.rating || '4.9'}</span>
                      </div>
                      <h4 className="mt-1 text-xs font-serif font-bold text-[#141414] truncate">
                        {prod.name}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-[#737373] truncate">
                        {prod.fabric || 'Luxury Embroidered Formals'}
                      </p>
                    </div>

                    <div className="flex items-baseline justify-between pt-2 border-t border-[#E5E5E5]/60">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-[#141414]">${prod.priceUSD} USD</span>
                        {prod.originalPriceUSD && (
                          <span className="text-[10px] text-[#A3A3A3] line-through">${prod.originalPriceUSD}</span>
                        )}
                      </div>
                      <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#141414] text-white flex items-center gap-1 shadow-xs">
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'featured_product': {
        const prod = PRODUCTS.find((p) => p.id === s.productId) || PRODUCTS[0];
        const title = s.productName || prod?.name || "PD Formal '26 Embellished Silk Kaftan";
        const designer = s.designer || prod?.designer || 'Faiza Saqlain';
        const price = s.priceUSD ?? prod?.priceUSD ?? 195;
        const origPrice = s.originalPriceUSD ?? prod?.originalPriceUSD;
        const img = s.imageUrl || prod?.image || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=85';
        const badge = s.badge || 'SPOTLIGHT ATELIER';
        const btnText = s.buttonText || 'Add to Bag — Fast Dispatch';

        return (
          <div className="max-w-6xl mx-auto p-4 sm:p-6" style={getUniversalWidgetStyles(s, viewportMode, '1152px')}>
            <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-10 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Left: Aspect 3:4 Luxury Fashion Visual */}
                <div className="md:col-span-5 relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF9F6] border border-[#E5E5E5]">
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute top-3 left-3 bg-[#141414] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {badge}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/40 flex items-center justify-between text-xs font-semibold text-[#141414]">
                    <span>In Stock · Ready to Ship</span>
                    <span className="text-[#087443] flex items-center gap-1 font-bold">
                      <Clock className="w-3.5 h-3.5" /> 24h
                    </span>
                  </div>
                </div>

                {/* Right: Editorial Details */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#087443] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{designer} · Couture Spotlight</span>
                    </span>
                    <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                      ★ 4.9 (128 reviews)
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#141414] leading-tight">
                    {title}
                  </h3>

                  <div className="flex items-baseline gap-3 pt-1">
                    <span className="text-2xl font-extrabold text-[#141414] font-serif">${price} USD</span>
                    {origPrice && (
                      <span className="text-sm text-[#A3A3A3] line-through">${origPrice} USD</span>
                    )}
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#D3F8DF] text-[#087443]">
                      Original Guaranteed
                    </span>
                  </div>

                  <p className="text-xs text-[#525252] leading-relaxed">
                    Meticulously hand-crafted with intricate zardozi, dabka, and resham threadwork. Designed for heirloom celebrations, festive soirées, and high-fashion luxury occasions.
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-[#141414]">Available Sizes:</span>
                    <div className="flex items-center gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'Custom Fit'].map((sz, szIdx) => (
                        <span
                          key={sz}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                            szIdx === 2
                              ? 'bg-[#141414] text-white border-[#141414]'
                              : 'bg-[#FAF9F6] text-[#424242] border-[#E5E5E5]'
                          }`}
                        >
                          {sz}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#141414] text-white text-xs font-semibold rounded-xl hover:bg-[#2b2b2b] shadow-md transition-all">
                      <ShoppingBag className="w-4 h-4" />
                      <span>{btnText}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E5E5] text-[11px] text-[#525252]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#087443]" />
                      <span>100% Original</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#087443]" />
                      <span>DHL Express</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#087443]" />
                      <span>Bespoke Sizing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'collection_grid': {
        const defaultCols = viewportMode === 'mobile' ? 1 : viewportMode === 'tablet' ? 2 : 3;
        const cols = Number(s.columnCount) || defaultCols;
        const collections = s.collections && s.collections.length > 0
          ? s.collections
          : [
              { title: 'Luxury Pret 2026', image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=80', link: '/collections/pret' },
              { title: 'Bridal Heirloom Couture', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80', link: '/collections/bridal' },
              { title: 'Festive Formals Edit', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=600&q=80', link: '/collections/festive' },
            ];

        return (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4" style={getUniversalWidgetStyles(s, viewportMode, '1280px')}>
            {s.heading && (
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-center text-[#141414]">
                {s.heading}
              </h3>
            )}
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gap: parseDimension(s.gap, viewportMode === 'mobile' ? '16px' : '24px')
              }}
            >
              {collections.map((col: any, cIdx: number) => (
                <div
                  key={cIdx}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <img
                    src={col.image || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=80'}
                    alt={col.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-5 text-white">
                    <h4 className="text-lg sm:text-xl font-serif font-bold mb-1">{col.title}</h4>
                    <span className="text-xs text-[#E04F16] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Explore Collection</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'product_carousel': {
        const cat = s.category || 'all';
        const prods = (cat === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === cat)).slice(0, 6);

        return (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4" style={getUniversalWidgetStyles(s, viewportMode, '1280px')}>
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#087443]">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Curated Carousel</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#141414] mt-0.5">
                  {s.heading || 'New Arrivals · Spring & Festive 2026'}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="p-1.5 rounded-full border border-neutral-300 text-neutral-400">
                  <ChevronLeft className="w-4 h-4" />
                </span>
                <span className="p-1.5 rounded-full border border-neutral-300 text-neutral-400">
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="flex items-stretch gap-4 overflow-x-auto pb-2">
              {prods.map((prod) => (
                <div
                  key={prod.id}
                  className="w-56 sm:w-64 shrink-0 bg-white rounded-xl border border-[#E5E5E5] overflow-hidden flex flex-col justify-between"
                >
                  <div className="aspect-[3/4] bg-[#FAF9F6] relative overflow-hidden">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    {prod.badge && (
                      <span className="absolute top-2 left-2 bg-[#141414]/85 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                        {prod.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#737373]">{prod.designer}</span>
                    <h5 className="font-serif font-bold text-xs text-[#141414] truncate">{prod.name}</h5>
                    <div className="text-xs font-bold text-[#141414] pt-0.5">${prod.priceUSD} USD</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'image_gallery': {
        const imgs = s.images && s.images.length > 0
          ? s.images
          : [
              'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80'
            ];
        const layoutCols = s.layout === 'grid4' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3';

        return (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4" style={getUniversalWidgetStyles(s, viewportMode, '1280px')}>
            <div className="text-center space-y-1 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#087443] flex items-center justify-center gap-1">
                <Images className="w-3.5 h-3.5" />
                <span>Editorial Lookbook</span>
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#141414]">
                {s.heading || 'Visual Lookbook'}
              </h3>
            </div>
            <div className={`grid ${layoutCols} gap-4`}>
              {imgs.map((imgUrl: string, idx: number) => (
                <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-xs">
                  <img src={imgUrl} alt="Editorial Look" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 text-white text-xs font-serif">
                    Editorial Look #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'video':
        return (
          <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-3" style={getUniversalWidgetStyles(s, viewportMode, '1024px')}>
            {s.heading && (
              <h3 className="text-2xl font-serif font-bold text-center text-[#141414]">
                {s.heading}
              </h3>
            )}
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-[#E5E5E5] bg-black shadow-lg">
              <iframe
                src={s.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                title={s.heading || 'Craftsmanship in Motion'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {s.caption && (
              <p className="text-xs text-[#737373] text-center italic">
                {s.caption}
              </p>
            )}
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
      {/* Viewport ruler / indicator when not desktop */}
      {viewportMode !== 'desktop' && (
        <div className="mb-3 px-3.5 py-1 bg-[#141414] text-white rounded-full text-[11px] font-semibold flex items-center gap-2 shadow-md border border-white/10 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#E04F16] animate-pulse" />
          <span>
            {viewportMode === 'tablet' ? 'Tablet Viewport (768px)' : 'Mobile Viewport (375px)'}
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[10px] text-white/60">Device-specific overrides active</span>
        </div>
      )}

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
              const isSecDisabled = Boolean(sec.disabled);
              const isSecDeviceHidden = isElementHidden(sec.settings, viewportMode);
              const isHidden = isSecDisabled || isSecDeviceHidden;

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
                    {/* Device Hidden Badge */}
                    {!isPreviewMode && isSecDeviceHidden && (
                      <div className="absolute top-2 right-2 z-20 bg-neutral-900/90 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <EyeOff className="w-3 h-3 text-amber-400" />
                        <span>Hidden on {viewportMode.toUpperCase()}</span>
                      </div>
                    )}
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
