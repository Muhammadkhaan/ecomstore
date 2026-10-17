import React, { useState } from 'react';
import {
  Settings,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Sliders,
  Plus,
  X,
  Copy,
  Box,
  Columns as ColumnsIcon,
  ArrowLeft,
  Type,
  Palette,
  Layout,
  Maximize2,
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImageIcon,
  ExternalLink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FolderOpen
} from 'lucide-react';
import { StorePage, PageBuilderSection, PageBuilderBlock } from '../../types/pageBuilder.ts';
import { MediaPickerModal } from '../components/MediaPickerModal.tsx';

interface BuilderSidebarRightProps {
  token?: string;
  page: StorePage | null;
  selectedElement: PageBuilderSection | null;
  selectedBlockId?: string | null;
  isOpen: boolean;
  onToggleOpen: () => void;
  onUpdatePageMeta: (field: string, value: any) => void;
  onUpdateSection: (sectionId: string, updatedFields: Partial<PageBuilderSection>) => void;
  onUpdateBlock?: (sectionId: string, blockId: string, updatedFields: Partial<PageBuilderBlock>) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteBlock?: (sectionId: string, blockId: string) => void;
  onDuplicateSection?: (sectionId: string) => void;
  onDuplicateBlock?: (sectionId: string, blockId: string) => void;
  onSelectBlock?: (sectionId: string, blockId: string | null) => void;
  onAddBlockToContainer?: (sectionId: string, blockType: string) => void;
  onDeselect: () => void;
}

export const BuilderSidebarRight: React.FC<BuilderSidebarRightProps> = ({
  token = '',
  page,
  selectedElement,
  selectedBlockId,
  isOpen,
  onToggleOpen,
  onUpdatePageMeta,
  onUpdateSection,
  onUpdateBlock,
  onDeleteSection,
  onDeleteBlock,
  onDuplicateSection,
  onDuplicateBlock,
  onSelectBlock,
  onAddBlockToContainer,
  onDeselect
}) => {
  // Tab within properties panel: 'content' | 'style' | 'advanced'
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');

  // Media Library Modal state
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState<'imageUrl' | 'backgroundImage'>('imageUrl');

  // Padding & Margin lock state for 4-sided controls
  const [isPaddingLinked, setIsPaddingLinked] = useState(false);
  const [isMarginLinked, setIsMarginLinked] = useState(false);

  if (!isOpen) {
    return (
      <div className="w-12 bg-white border-l border-[#E5E5E5] flex flex-col items-center py-3 shrink-0 shadow-sm z-20">
        <button
          onClick={onToggleOpen}
          className="p-2 rounded-xl text-[#737373] hover:text-[#141414] hover:bg-neutral-100 transition-colors"
          title="Expand properties panel"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="h-4 w-px bg-neutral-200 my-2" />
        <button
          onClick={onToggleOpen}
          className="p-2 rounded-xl text-[#737373] hover:text-[#141414] hover:bg-neutral-100 transition-colors"
          title="Properties & Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Find active block if selected
  const activeBlock: PageBuilderBlock | null =
    selectedElement && selectedBlockId && Array.isArray(selectedElement.blocks)
      ? selectedElement.blocks.find((b) => b.id === selectedBlockId) || null
      : null;

  // Active target is either block or section
  const currentTargetType = activeBlock ? activeBlock.type : selectedElement?.type;
  const currentTargetSettings = activeBlock ? activeBlock.settings || {} : selectedElement?.settings || {};

  const handleSettingChange = (key: string, value: any) => {
    if (activeBlock && selectedElement && onUpdateBlock) {
      onUpdateBlock(selectedElement.id, activeBlock.id, {
        settings: {
          ...activeBlock.settings,
          [key]: value
        }
      });
    } else if (selectedElement) {
      onUpdateSection(selectedElement.id, {
        settings: {
          ...selectedElement.settings,
          [key]: value
        }
      });
    }
  };

  const handleMultipleSettingsChange = (updates: Record<string, any>) => {
    if (activeBlock && selectedElement && onUpdateBlock) {
      onUpdateBlock(selectedElement.id, activeBlock.id, {
        settings: {
          ...activeBlock.settings,
          ...updates
        }
      });
    } else if (selectedElement) {
      onUpdateSection(selectedElement.id, {
        settings: {
          ...selectedElement.settings,
          ...updates
        }
      });
    }
  };

  const sanitizeLink = (url: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (/^(javascript|vbscript|data):/i.test(trimmed)) {
      return '#';
    }
    return trimmed;
  };

  const openMediaPicker = (field: 'imageUrl' | 'backgroundImage') => {
    setMediaTargetField(field);
    setIsMediaModalOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    handleSettingChange(mediaTargetField, url);
    setIsMediaModalOpen(false);
  };

  const hasTypography = ['heading', 'text', 'rich_text', 'button', 'hero', 'banner'].includes(currentTargetType || '');
  const hasColors = ['section', 'container', 'heading', 'text', 'button', 'divider', 'hero', 'banner'].includes(currentTargetType || '');
  const hasLayout = ['section', 'container', 'columns', 'heading', 'text', 'button', 'image', 'spacer', 'divider'].includes(currentTargetType || '');
  const hasBorders = ['section', 'container', 'button', 'image', 'divider'].includes(currentTargetType || '');

  // Preset luxury colors
  const luxuryColors = ['#FFFFFF', '#FAF9F6', '#141414', '#404040', '#737373', '#E04F16', '#B45309', '#1E3A8A', 'transparent'];

  return (
    <>
      <aside className="w-80 bg-white border-l border-[#E5E5E5] flex flex-col shrink-0 overflow-hidden shadow-sm z-20">
        {/* Top Header */}
        <div className="border-b border-[#E5E5E5] bg-[#FAF9F6] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            {activeBlock ? (
              <div className="flex items-center gap-1.5 text-xs truncate">
                <button
                  onClick={() => onSelectBlock && onSelectBlock(selectedElement!.id, null)}
                  className="text-[#737373] hover:text-[#141414] flex items-center gap-1 font-semibold"
                  title="Back to parent container"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[70px]">{selectedElement?.title || 'Container'}</span>
                </button>
                <span className="text-neutral-300">/</span>
                <span className="font-bold text-[#E04F16] truncate max-w-[100px]">
                  {activeBlock.title || activeBlock.type}
                </span>
              </div>
            ) : selectedElement ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onDeselect}
                  className="text-[11px] text-[#737373] hover:text-[#141414] font-semibold underline"
                >
                  Page
                </button>
                <span className="text-[#737373] text-xs">/</span>
                <span className="font-bold text-xs text-[#141414] truncate max-w-[140px]">
                  {selectedElement.title || selectedElement.type}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#141414]" />
                <span className="font-bold text-xs text-[#141414]">Page Settings</span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleOpen}
            className="p-1 rounded-lg text-[#737373] hover:text-[#141414] hover:bg-neutral-200 transition-colors"
            title="Collapse panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs for Selected Element: Content | Style | Advanced */}
        {(selectedElement || activeBlock) && (
          <div className="flex border-b border-[#E5E5E5] bg-white text-xs font-semibold">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === 'content'
                  ? 'border-[#141414] text-[#141414]'
                  : 'border-transparent text-[#737373] hover:text-[#141414]'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === 'style'
                  ? 'border-[#141414] text-[#141414]'
                  : 'border-transparent text-[#737373] hover:text-[#141414]'
              }`}
            >
              Style
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === 'advanced'
                  ? 'border-[#141414] text-[#141414]'
                  : 'border-transparent text-[#737373] hover:text-[#141414]'
              }`}
            >
              Advanced
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {selectedElement || activeBlock ? (
            <>
              {/* Identity Card: Type, Label, Visibility, Actions */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#737373] tracking-wider">
                    Type: <strong className="text-[#141414]">{currentTargetType}</strong>
                  </span>
                  <span className="text-[10px] font-mono text-[#737373]">
                    #{(activeBlock ? activeBlock.id : selectedElement!.id).slice(-6)}
                  </span>
                </div>

                <div>
                  <label className="block text-[#737373] mb-1 font-semibold text-[11px]">Admin Label</label>
                  <input
                    type="text"
                    value={activeBlock ? activeBlock.title || '' : selectedElement?.title || ''}
                    onChange={(e) => {
                      if (activeBlock && onUpdateBlock) {
                        onUpdateBlock(selectedElement!.id, activeBlock.id, { title: e.target.value });
                      } else if (selectedElement) {
                        onUpdateSection(selectedElement.id, { title: e.target.value });
                      }
                    }}
                    placeholder="e.g. Hero Section"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#141414]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="text-[#525252] font-semibold flex items-center gap-1.5 cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      checked={activeBlock ? !activeBlock.disabled : !selectedElement?.disabled}
                      onChange={(e) => {
                        if (activeBlock && onUpdateBlock) {
                          onUpdateBlock(selectedElement!.id, activeBlock.id, { disabled: !e.target.checked });
                        } else if (selectedElement) {
                          onUpdateSection(selectedElement.id, { disabled: !e.target.checked });
                        }
                      }}
                      className="rounded text-[#141414] focus:ring-[#141414]"
                    />
                    <span>Visible on Storefront</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    {activeBlock && onDuplicateBlock ? (
                      <button
                        onClick={() => onDuplicateBlock(selectedElement!.id, activeBlock.id)}
                        className="text-[#737373] hover:text-[#141414] p-1 rounded hover:bg-neutral-200"
                        title="Duplicate Block"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    ) : onDuplicateSection ? (
                      <button
                        onClick={() => onDuplicateSection(selectedElement!.id)}
                        className="text-[#737373] hover:text-[#141414] p-1 rounded hover:bg-neutral-200"
                        title="Duplicate Section"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    ) : null}

                    <button
                      onClick={() => {
                        if (activeBlock && onDeleteBlock) {
                          onDeleteBlock(selectedElement!.id, activeBlock.id);
                        } else if (selectedElement) {
                          onDeleteSection(selectedElement.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* TAB 1: CONTENT */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  {/* Heading Content */}
                  {currentTargetType === 'heading' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Heading Text</label>
                        <textarea
                          rows={2}
                          value={currentTargetSettings.text || ''}
                          onChange={(e) => handleSettingChange('text', e.target.value)}
                          placeholder="Enter headline..."
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#141414]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Heading Level (HTML Tag)</label>
                        <select
                          value={currentTargetSettings.level || 'h2'}
                          onChange={(e) => handleSettingChange('level', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                        >
                          <option value="h1">H1 — Page Title (Primary)</option>
                          <option value="h2">H2 — Section Header</option>
                          <option value="h3">H3 — Sub-Section Header</option>
                          <option value="h4">H4 — Small Header</option>
                          <option value="h5">H5 — Minor Heading</option>
                          <option value="h6">H6 — Eyebrow Label</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Text / Paragraph Content */}
                  {(currentTargetType === 'text' || currentTargetType === 'rich_text') && (
                    <div className="space-y-3">
                      {currentTargetType === 'rich_text' && (
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Section Title</label>
                          <input
                            type="text"
                            value={currentTargetSettings.title || ''}
                            onChange={(e) => handleSettingChange('title', e.target.value)}
                            placeholder="Our Heritage & Philosophy"
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[#737373] font-semibold">Paragraph Copy</label>
                          <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                            <button
                              type="button"
                              onClick={() => {
                                const cur = currentTargetSettings.content || '';
                                handleSettingChange('content', cur + ' **bold text**');
                              }}
                              className="px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 flex items-center gap-0.5 font-bold"
                              title="Insert Bold"
                            >
                              <Bold className="w-2.5 h-2.5" /> B
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const cur = currentTargetSettings.content || '';
                                handleSettingChange('content', cur + ' *italic text*');
                              }}
                              className="px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 flex items-center gap-0.5 italic"
                              title="Insert Italic"
                            >
                              <Italic className="w-2.5 h-2.5" /> I
                            </button>
                          </div>
                        </div>
                        <textarea
                          rows={6}
                          value={currentTargetSettings.content || ''}
                          onChange={(e) => handleSettingChange('content', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg leading-relaxed focus:outline-none focus:border-[#141414]"
                          placeholder="Write your narrative or description..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Button Content */}
                  {currentTargetType === 'button' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Button Label</label>
                        <input
                          type="text"
                          value={currentTargetSettings.label || ''}
                          onChange={(e) => handleSettingChange('label', e.target.value)}
                          placeholder="Explore Collection"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Action / Link Target</label>
                        <input
                          type="text"
                          value={currentTargetSettings.linkUrl || ''}
                          onChange={(e) => handleSettingChange('linkUrl', sanitizeLink(e.target.value))}
                          placeholder="/collections or https://..."
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                        />
                        <div className="flex gap-1.5 mt-1 flex-wrap text-[10px]">
                          {['/collections', '/products', '/cart', '#story'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleSettingChange('linkUrl', preset)}
                              className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded font-mono"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Link Target</label>
                          <select
                            value={currentTargetSettings.linkTarget || '_self'}
                            onChange={(e) => handleSettingChange('linkTarget', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="_self">Same Tab (_self)</option>
                            <option value="_blank">New Tab (_blank)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Style Variant</label>
                          <select
                            value={currentTargetSettings.variant || 'solid'}
                            onChange={(e) => handleSettingChange('variant', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="solid">Dark Noir (Solid)</option>
                            <option value="orange">Terracotta (Orange)</option>
                            <option value="outline">Outline (Bordered)</option>
                            <option value="text">Clean Text Link</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image Content */}
                  {currentTargetType === 'image' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[#737373] font-semibold">Image Source</label>
                          <button
                            type="button"
                            onClick={() => openMediaPicker('imageUrl')}
                            className="text-[#E04F16] hover:underline flex items-center gap-1 font-bold text-[11px]"
                          >
                            <FolderOpen className="w-3.5 h-3.5" /> Media Library
                          </button>
                        </div>
                        <input
                          type="text"
                          value={currentTargetSettings.imageUrl || ''}
                          onChange={(e) => handleSettingChange('imageUrl', e.target.value)}
                          placeholder="https://..."
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                        />

                        {/* Preview thumbnail */}
                        {currentTargetSettings.imageUrl && (
                          <div className="mt-2 relative rounded-lg overflow-hidden border border-[#E5E5E5] bg-neutral-50 h-24 flex items-center justify-center">
                            <img
                              src={currentTargetSettings.imageUrl}
                              alt="Preview"
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as any).style.display = 'none';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSettingChange('imageUrl', '')}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded p-1 hover:bg-black"
                              title="Clear Image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Alt Text (Accessibility & SEO)</label>
                        <input
                          type="text"
                          value={currentTargetSettings.altText || ''}
                          onChange={(e) => handleSettingChange('altText', e.target.value)}
                          placeholder="Descriptive image text"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Optional Destination Link</label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={currentTargetSettings.linkUrl || ''}
                            onChange={(e) => handleSettingChange('linkUrl', sanitizeLink(e.target.value))}
                            placeholder="/collections"
                            className="col-span-2 px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                          />
                          <select
                            value={currentTargetSettings.linkTarget || '_self'}
                            onChange={(e) => handleSettingChange('linkTarget', e.target.value)}
                            className="px-2 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="_self">_self</option>
                            <option value="_blank">_blank</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Divider Content */}
                  {currentTargetType === 'divider' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Divider Width</label>
                          <select
                            value={currentTargetSettings.width || '100%'}
                            onChange={(e) => handleSettingChange('width', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="100%">100% (Full)</option>
                            <option value="80%">80%</option>
                            <option value="60%">60%</option>
                            <option value="40%">40%</option>
                            <option value="20%">20% (Accent)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Thickness</label>
                          <select
                            value={currentTargetSettings.thickness || '1px'}
                            onChange={(e) => handleSettingChange('thickness', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="1px">1px (Subtle)</option>
                            <option value="2px">2px</option>
                            <option value="3px">3px</option>
                            <option value="4px">4px (Bold)</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Line Style</label>
                          <select
                            value={currentTargetSettings.style || 'solid'}
                            onChange={(e) => handleSettingChange('style', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Alignment</label>
                          <select
                            value={currentTargetSettings.alignment || 'center'}
                            onChange={(e) => handleSettingChange('alignment', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="center">Center</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Spacer Content */}
                  {currentTargetType === 'spacer' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[#737373] font-semibold">Vertical Height</label>
                          <span className="font-mono text-neutral-600 font-bold">{currentTargetSettings.height || '40px'}</span>
                        </div>
                        <input
                          type="range"
                          min="8"
                          max="160"
                          step="8"
                          value={parseInt(currentTargetSettings.height || '40')}
                          onChange={(e) => handleSettingChange('height', `${e.target.value}px`)}
                          className="w-full accent-[#141414]"
                        />
                        <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                          <span>8px</span>
                          <span>40px</span>
                          <span>80px</span>
                          <span>160px</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Columns Content */}
                  {currentTargetType === 'columns' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Column Count</label>
                          <select
                            value={currentTargetSettings.columnCount || 2}
                            onChange={(e) => handleSettingChange('columnCount', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value={1}>1 Column</option>
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Grid Gap</label>
                          <select
                            value={currentTargetSettings.gap || '24px'}
                            onChange={(e) => handleSettingChange('gap', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="12px">Compact (12px)</option>
                            <option value="16px">Normal (16px)</option>
                            <option value="24px">Standard (24px)</option>
                            <option value="32px">Generous (32px)</option>
                            <option value="48px">Spacious (48px)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Vertical Alignment</label>
                        <select
                          value={currentTargetSettings.verticalAlign || 'stretch'}
                          onChange={(e) => handleSettingChange('verticalAlign', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                        >
                          <option value="stretch">Stretch to equal height</option>
                          <option value="start">Align Top</option>
                          <option value="center">Align Center</option>
                          <option value="end">Align Bottom</option>
                        </select>
                      </div>

                      {/* Fallback column texts when empty */}
                      <div className="space-y-2 pt-2 border-t border-neutral-100">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                          Fallback Text Content
                        </span>
                        <div>
                          <label className="block text-[#737373] text-[10px]">Column 1 Text</label>
                          <input
                            type="text"
                            value={currentTargetSettings.col1Text || ''}
                            onChange={(e) => handleSettingChange('col1Text', e.target.value)}
                            className="w-full px-2 py-1 border border-[#E5E5E5] rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[#737373] text-[10px]">Column 2 Text</label>
                          <input
                            type="text"
                            value={currentTargetSettings.col2Text || ''}
                            onChange={(e) => handleSettingChange('col2Text', e.target.value)}
                            className="w-full px-2 py-1 border border-[#E5E5E5] rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hero Specific Content */}
                  {currentTargetType === 'hero' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Badge Pill</label>
                        <input
                          type="text"
                          value={currentTargetSettings.badge || ''}
                          onChange={(e) => handleSettingChange('badge', e.target.value)}
                          placeholder="e.g. Royal Festive Edit 2026"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Main Heading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.heading || ''}
                          onChange={(e) => handleSettingChange('heading', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Subheading</label>
                        <textarea
                          rows={2}
                          value={currentTargetSettings.subheading || ''}
                          onChange={(e) => handleSettingChange('subheading', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Button Label</label>
                          <input
                            type="text"
                            value={currentTargetSettings.buttonText || ''}
                            onChange={(e) => handleSettingChange('buttonText', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Button URL</label>
                          <input
                            type="text"
                            value={currentTargetSettings.buttonLink || ''}
                            onChange={(e) => handleSettingChange('buttonLink', sanitizeLink(e.target.value))}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Banner Specific Content */}
                  {currentTargetType === 'banner' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Banner Heading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.heading || currentTargetSettings.title || ''}
                          onChange={(e) => handleSettingChange('heading', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Banner Subheading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.subheading || ''}
                          onChange={(e) => handleSettingChange('subheading', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Newsletter Content */}
                  {currentTargetType === 'newsletter' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Heading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.heading || ''}
                          onChange={(e) => handleSettingChange('heading', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Subheading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.subheading || ''}
                          onChange={(e) => handleSettingChange('subheading', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Button Label</label>
                        <input
                          type="text"
                          value={currentTargetSettings.buttonText || ''}
                          onChange={(e) => handleSettingChange('buttonText', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Nested Block Adder for Container/Section */}
                  {(currentTargetType === 'container' || currentTargetType === 'section') && onAddBlockToContainer && (
                    <div className="pt-2 border-t border-neutral-200">
                      <span className="block text-[11px] font-semibold text-[#737373] mb-2">
                        Insert Nested Element into this Container:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => onAddBlockToContainer(selectedElement!.id, 'heading')}
                          className="px-2 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-left flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#E04F16]" /> Heading
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddBlockToContainer(selectedElement!.id, 'text')}
                          className="px-2 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-left flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#E04F16]" /> Text
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddBlockToContainer(selectedElement!.id, 'button')}
                          className="px-2 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-left flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#E04F16]" /> Button
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddBlockToContainer(selectedElement!.id, 'image')}
                          className="px-2 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-left flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#E04F16]" /> Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: STYLE */}
              {activeTab === 'style' && (
                <div className="space-y-5">
                  {/* 1. Typography Controls */}
                  {hasTypography && (
                    <div className="space-y-3">
                      <div className="font-bold text-[#141414] border-b border-[#E5E5E5] pb-1 flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5 text-[#E04F16]" />
                        <span>Typography</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Font Family</label>
                          <select
                            value={currentTargetSettings.fontFamily || (currentTargetType === 'heading' ? 'serif' : 'sans')}
                            onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="serif">Luxury Serif</option>
                            <option value="sans">Modern Sans</option>
                            <option value="mono">Clean Mono</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Font Weight</label>
                          <select
                            value={currentTargetSettings.fontWeight || (currentTargetType === 'heading' ? '700' : '400')}
                            onChange={(e) => handleSettingChange('fontWeight', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="300">300 (Light)</option>
                            <option value="400">400 (Regular)</option>
                            <option value="500">500 (Medium)</option>
                            <option value="600">600 (Semibold)</option>
                            <option value="700">700 (Bold)</option>
                            <option value="800">800 (Extra Bold)</option>
                            <option value="900">900 (Black)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Font Size</label>
                          <input
                            type="text"
                            value={currentTargetSettings.fontSize || (currentTargetType === 'heading' ? '32px' : '14px')}
                            onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                            placeholder="e.g. 24px"
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Alignment</label>
                          <select
                            value={currentTargetSettings.alignment || 'center'}
                            onChange={(e) => handleSettingChange('alignment', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                            <option value="justify">Justify</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Line Height</label>
                          <select
                            value={currentTargetSettings.lineHeight || '1.4'}
                            onChange={(e) => handleSettingChange('lineHeight', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="1.1">Tight (1.1)</option>
                            <option value="1.25">Heading (1.25)</option>
                            <option value="1.4">Standard (1.4)</option>
                            <option value="1.6">Relaxed (1.6)</option>
                            <option value="1.8">Loose (1.8)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Letter Spacing</label>
                          <select
                            value={currentTargetSettings.letterSpacing || '0em'}
                            onChange={(e) => handleSettingChange('letterSpacing', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="-0.03em">Tight (-0.03em)</option>
                            <option value="0em">Normal (0em)</option>
                            <option value="0.05em">Wide (+0.05em)</option>
                            <option value="0.1em">Spacious (+0.1em)</option>
                            <option value="0.2em">Editorial (+0.2em)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Text Transformation</label>
                        <div className="grid grid-cols-4 gap-1">
                          {['none', 'uppercase', 'lowercase', 'capitalize'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleSettingChange('textTransform', t)}
                              className={`py-1 text-[10px] rounded border font-semibold capitalize ${
                                (currentTargetSettings.textTransform || 'none') === t
                                  ? 'bg-[#141414] text-white border-[#141414]'
                                  : 'bg-neutral-50 text-[#737373] hover:bg-neutral-100 border-neutral-200'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Paragraph Spacing for text / rich_text */}
                      {(currentTargetType === 'text' || currentTargetType === 'rich_text') && (
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Paragraph Bottom Spacing</label>
                          <select
                            value={currentTargetSettings.paragraphSpacing || '16px'}
                            onChange={(e) => handleSettingChange('paragraphSpacing', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="8px">8px (Compact)</option>
                            <option value="12px">12px</option>
                            <option value="16px">16px (Standard)</option>
                            <option value="20px">20px</option>
                            <option value="24px">24px (Relaxed)</option>
                            <option value="32px">32px (Editorial)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Colors & Background Controls */}
                  {hasColors && (
                    <div className="space-y-3">
                      <div className="font-bold text-[#141414] border-b border-[#E5E5E5] pb-1 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-[#E04F16]" />
                        <span>Colors & Background</span>
                      </div>

                      {/* Text Color */}
                      {['heading', 'text', 'rich_text', 'button'].includes(currentTargetType || '') && (
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Text Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={currentTargetSettings.textColor || currentTargetSettings.color || '#141414'}
                              onChange={(e) => {
                                handleSettingChange('color', e.target.value);
                                handleSettingChange('textColor', e.target.value);
                              }}
                              className="w-8 h-8 rounded border border-[#E5E5E5] p-0.5 cursor-pointer bg-white"
                            />
                            <input
                              type="text"
                              value={currentTargetSettings.textColor || currentTargetSettings.color || '#141414'}
                              onChange={(e) => {
                                handleSettingChange('color', e.target.value);
                                handleSettingChange('textColor', e.target.value);
                              }}
                              className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                            />
                          </div>
                          <div className="flex gap-1.5 mt-1.5">
                            {luxuryColors.slice(0, 6).map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  handleSettingChange('color', c);
                                  handleSettingChange('textColor', c);
                                }}
                                style={{ backgroundColor: c }}
                                className="w-5 h-5 rounded-full border border-neutral-300 shadow-xs"
                                title={c}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Background Color for Section, Container, Button, Divider */}
                      {['section', 'container', 'button', 'divider'].includes(currentTargetType || '') && (
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">
                            {currentTargetType === 'divider' ? 'Divider Line Color' : 'Background Color'}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={
                                currentTargetSettings.backgroundColor === 'transparent'
                                  ? '#ffffff'
                                  : currentTargetSettings.backgroundColor || currentTargetSettings.color || '#ffffff'
                              }
                              onChange={(e) => {
                                handleSettingChange('backgroundColor', e.target.value);
                                if (currentTargetType === 'divider') handleSettingChange('color', e.target.value);
                              }}
                              className="w-8 h-8 rounded border border-[#E5E5E5] p-0.5 cursor-pointer bg-white"
                            />
                            <input
                              type="text"
                              value={currentTargetSettings.backgroundColor || currentTargetSettings.color || '#FFFFFF'}
                              onChange={(e) => {
                                handleSettingChange('backgroundColor', e.target.value);
                                if (currentTargetType === 'divider') handleSettingChange('color', e.target.value);
                              }}
                              placeholder="#FFFFFF or transparent"
                              className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                            />
                          </div>
                          <div className="flex gap-1.5 mt-1.5 items-center">
                            {luxuryColors.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  handleSettingChange('backgroundColor', c);
                                  if (currentTargetType === 'divider') handleSettingChange('color', c);
                                }}
                                style={{ backgroundColor: c === 'transparent' ? 'white' : c }}
                                className={`w-5 h-5 rounded-full border border-neutral-300 shadow-xs text-[9px] flex items-center justify-center font-bold ${
                                  c === 'transparent' ? 'text-red-500' : ''
                                }`}
                                title={c}
                              >
                                {c === 'transparent' ? '✕' : ''}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Background Image & Opacity for Section / Container */}
                      {(currentTargetType === 'section' || currentTargetType === 'container') && (
                        <>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[#737373] font-semibold">Background Image</label>
                              <button
                                type="button"
                                onClick={() => openMediaPicker('backgroundImage')}
                                className="text-[#E04F16] hover:underline flex items-center gap-1 font-bold text-[11px]"
                              >
                                <FolderOpen className="w-3.5 h-3.5" /> Media Library
                              </button>
                            </div>
                            <input
                              type="text"
                              value={currentTargetSettings.backgroundImage || ''}
                              onChange={(e) => handleSettingChange('backgroundImage', e.target.value)}
                              placeholder="https://..."
                              className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                            />

                            {/* Background Image Preview & Clear */}
                            {currentTargetSettings.backgroundImage && (
                              <div className="mt-2 relative rounded-lg overflow-hidden border border-[#E5E5E5] bg-neutral-100 h-20 flex items-center justify-center">
                                <img
                                  src={currentTargetSettings.backgroundImage}
                                  alt="Background Preview"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSettingChange('backgroundImage', '')}
                                  className="absolute top-1 right-1 bg-black/70 text-white rounded p-1 hover:bg-black"
                                  title="Clear Background"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          {currentTargetSettings.backgroundImage && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[#737373] font-semibold">Darkening Overlay</label>
                                <span className="font-mono text-neutral-600 font-bold">
                                  {Math.round((currentTargetSettings.overlayOpacity ?? 0) * 100)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={currentTargetSettings.overlayOpacity ?? 0}
                                onChange={(e) => handleSettingChange('overlayOpacity', parseFloat(e.target.value))}
                                className="w-full accent-[#141414]"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* 3. Layout & Dimensions Controls */}
                  {hasLayout && (
                    <div className="space-y-3">
                      <div className="font-bold text-[#141414] border-b border-[#E5E5E5] pb-1 flex items-center gap-1.5">
                        <Layout className="w-3.5 h-3.5 text-[#E04F16]" />
                        <span>Layout & Dimensions</span>
                      </div>

                      {/* Section & Container Width & Max-width */}
                      {(currentTargetType === 'section' || currentTargetType === 'container') && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[#737373] mb-1 font-semibold">Content Width</label>
                              <select
                                value={currentTargetSettings.contentWidth || 'boxed'}
                                onChange={(e) => handleSettingChange('contentWidth', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                              >
                                <option value="boxed">Boxed (Constrained)</option>
                                <option value="full">Full Bleed (100%)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[#737373] mb-1 font-semibold">Max Width</label>
                              <select
                                value={currentTargetSettings.maxWidth || (currentTargetType === 'section' ? '1280px' : '1024px')}
                                onChange={(e) => handleSettingChange('maxWidth', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                              >
                                <option value="1440px">Wide (1440px)</option>
                                <option value="1280px">Standard (1280px)</option>
                                <option value="1024px">Medium (1024px)</option>
                                <option value="768px">Narrow (768px)</option>
                                <option value="100%">100%</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[#737373] mb-1 font-semibold">Min Height</label>
                              <input
                                type="text"
                                value={currentTargetSettings.minHeight || '0px'}
                                onChange={(e) => handleSettingChange('minHeight', e.target.value)}
                                placeholder="0px"
                                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="block text-[#737373] mb-1 font-semibold">Horiz. Align</label>
                              <select
                                value={currentTargetSettings.horizontalAlign || 'center'}
                                onChange={(e) => handleSettingChange('horizontalAlign', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                                <option value="space-between">Space Between</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Button Full Width & Padding */}
                      {currentTargetType === 'button' && (
                        <>
                          <div>
                            <label className="text-[#525252] font-semibold flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(currentTargetSettings.fullWidth)}
                                onChange={(e) => handleSettingChange('fullWidth', e.target.checked)}
                                className="rounded text-[#141414] focus:ring-[#141414]"
                              />
                              <span>Full-Width Button</span>
                            </label>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[#737373] mb-1 font-semibold">Horiz. Padding</label>
                              <select
                                value={currentTargetSettings.paddingX || '24px'}
                                onChange={(e) => handleSettingChange('paddingX', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                              >
                                <option value="12px">Compact (12px)</option>
                                <option value="16px">Regular (16px)</option>
                                <option value="24px">Standard (24px)</option>
                                <option value="32px">Generous (32px)</option>
                                <option value="40px">Wide (40px)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[#737373] mb-1 font-semibold">Vert. Padding</label>
                              <select
                                value={currentTargetSettings.paddingY || '12px'}
                                onChange={(e) => handleSettingChange('paddingY', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                              >
                                <option value="8px">Compact (8px)</option>
                                <option value="12px">Standard (12px)</option>
                                <option value="16px">Generous (16px)</option>
                                <option value="20px">Prominent (20px)</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Image Dimensions & Object Fit */}
                      {currentTargetType === 'image' && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[#737373] mb-1 font-semibold">Max Width</label>
                              <select
                                value={currentTargetSettings.maxWidth || '800px'}
                                onChange={(e) => handleSettingChange('maxWidth', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                              >
                                <option value="100%">100%</option>
                                <option value="1024px">1024px</option>
                                <option value="800px">800px</option>
                                <option value="600px">600px</option>
                                <option value="480px">480px</option>
                                <option value="320px">320px</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[#737373] mb-1 font-semibold">Max Height</label>
                              <select
                                value={currentTargetSettings.maxHeight || '480px'}
                                onChange={(e) => handleSettingChange('maxHeight', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                              >
                                <option value="none">No Limit</option>
                                <option value="600px">600px</option>
                                <option value="480px">480px</option>
                                <option value="360px">360px</option>
                                <option value="240px">240px</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[#737373] mb-1 font-semibold">Object Fit</label>
                              <select
                                value={currentTargetSettings.objectFit || 'cover'}
                                onChange={(e) => handleSettingChange('objectFit', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                              >
                                <option value="cover">Cover (Crop)</option>
                                <option value="contain">Contain (Full)</option>
                                <option value="fill">Fill (Stretch)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[#737373] mb-1 font-semibold">Alignment</label>
                              <select
                                value={currentTargetSettings.alignment || 'center'}
                                onChange={(e) => handleSettingChange('alignment', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                      {/* 4-Sided Padding & Margin for Section / Container */}
                      {(currentTargetType === 'section' || currentTargetType === 'container') && (
                        <div className="space-y-3 pt-1">
                          {/* 4-Sided Internal Padding */}
                          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[11px] text-[#141414]">Internal Padding</span>
                              <button
                                type="button"
                                onClick={() => setIsPaddingLinked(!isPaddingLinked)}
                                className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                  isPaddingLinked ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white text-neutral-600 border-neutral-200'
                                }`}
                              >
                                {isPaddingLinked ? 'Linked (All sides)' : 'Independent'}
                              </button>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                              <div>
                                <span className="text-neutral-400 block mb-0.5">Top</span>
                                <input
                                  type="text"
                                  value={currentTargetSettings.paddingTop || currentTargetSettings.paddingY || '32px'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (isPaddingLinked) {
                                      handleMultipleSettingsChange({
                                        paddingTop: val,
                                        paddingRight: val,
                                        paddingBottom: val,
                                        paddingLeft: val,
                                        paddingY: val,
                                        paddingX: val
                                      });
                                    } else {
                                      handleSettingChange('paddingTop', val);
                                    }
                                  }}
                                  className="w-full px-1 py-1 border border-[#E5E5E5] rounded text-center text-xs bg-white"
                                />
                              </div>
                              <div>
                                <span className="text-neutral-400 block mb-0.5">Right</span>
                                <input
                                  type="text"
                                  value={currentTargetSettings.paddingRight || currentTargetSettings.paddingX || '24px'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (isPaddingLinked) {
                                      handleMultipleSettingsChange({
                                        paddingTop: val,
                                        paddingRight: val,
                                        paddingBottom: val,
                                        paddingLeft: val
                                      });
                                    } else {
                                      handleSettingChange('paddingRight', val);
                                    }
                                  }}
                                  className="w-full px-1 py-1 border border-[#E5E5E5] rounded text-center text-xs bg-white"
                                />
                              </div>
                              <div>
                                <span className="text-neutral-400 block mb-0.5">Bottom</span>
                                <input
                                  type="text"
                                  value={currentTargetSettings.paddingBottom || currentTargetSettings.paddingY || '32px'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (isPaddingLinked) {
                                      handleMultipleSettingsChange({
                                        paddingTop: val,
                                        paddingRight: val,
                                        paddingBottom: val,
                                        paddingLeft: val
                                      });
                                    } else {
                                      handleSettingChange('paddingBottom', val);
                                    }
                                  }}
                                  className="w-full px-1 py-1 border border-[#E5E5E5] rounded text-center text-xs bg-white"
                                />
                              </div>
                              <div>
                                <span className="text-neutral-400 block mb-0.5">Left</span>
                                <input
                                  type="text"
                                  value={currentTargetSettings.paddingLeft || currentTargetSettings.paddingX || '24px'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (isPaddingLinked) {
                                      handleMultipleSettingsChange({
                                        paddingTop: val,
                                        paddingRight: val,
                                        paddingBottom: val,
                                        paddingLeft: val
                                      });
                                    } else {
                                      handleSettingChange('paddingLeft', val);
                                    }
                                  }}
                                  className="w-full px-1 py-1 border border-[#E5E5E5] rounded text-center text-xs bg-white"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 4-Sided Margin Spacing */}
                          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[11px] text-[#141414]">Outer Margin</span>
                              <button
                                type="button"
                                onClick={() => setIsMarginLinked(!isMarginLinked)}
                                className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                  isMarginLinked ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white text-neutral-600 border-neutral-200'
                                }`}
                              >
                                {isMarginLinked ? 'Linked' : 'Independent'}
                              </button>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                              <div>
                                <span className="text-neutral-400 block mb-0.5">Top</span>
                                <input
                                  type="text"
                                  value={currentTargetSettings.marginTop || '0px'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (isMarginLinked) {
                                      handleMultipleSettingsChange({
                                        marginTop: val,
                                        marginRight: val,
                                        marginBottom: val,
                                        marginLeft: val
                                      });
                                    } else {
                                      handleSettingChange('marginTop', val);
                                    }
                                  }}
                                  placeholder="0px"
                                  className="w-full px-1 py-1 border border-[#E5E5E5] rounded text-center text-xs bg-white"
                                />
                              </div>
                              <div>
                                <span className="text-neutral-400 block mb-0.5">Right</span>
                                <input
                                  type="text"
                                  value={currentTargetSettings.marginRight || 'auto'}
                                  onChange={(e) => handleSettingChange('marginRight', e.target.value)}
                                  placeholder="auto"
                                  className="w-full px-1 py-1 border border-[#E5E5E5] rounded text-center text-xs bg-white"
                                />
                              </div>
                              <div>
                                <span className="text-neutral-400 block mb-0.5">Bottom</span>
                                <input
                                  type="text"
                                  value={currentTargetSettings.marginBottom || '0px'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (isMarginLinked) {
                                      handleMultipleSettingsChange({
                                        marginTop: val,
                                        marginRight: val,
                                        marginBottom: val,
                                        marginLeft: val
                                      });
                                    } else {
                                      handleSettingChange('marginBottom', val);
                                    }
                                  }}
                                  placeholder="0px"
                                  className="w-full px-1 py-1 border border-[#E5E5E5] rounded text-center text-xs bg-white"
                                />
                              </div>
                              <div>
                                <span className="text-neutral-400 block mb-0.5">Left</span>
                                <input
                                  type="text"
                                  value={currentTargetSettings.marginLeft || 'auto'}
                                  onChange={(e) => handleSettingChange('marginLeft', e.target.value)}
                                  placeholder="auto"
                                  className="w-full px-1 py-1 border border-[#E5E5E5] rounded text-center text-xs bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. Border & Effects Controls */}
                  {hasBorders && (
                    <div className="space-y-3">
                      <div className="font-bold text-[#141414] border-b border-[#E5E5E5] pb-1 flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-[#E04F16]" />
                        <span>Border & Effects</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Border Style</label>
                          <select
                            value={currentTargetSettings.borderStyle || 'none'}
                            onChange={(e) => handleSettingChange('borderStyle', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="none">None</option>
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Border Width</label>
                          <select
                            value={currentTargetSettings.borderWidth || '1px'}
                            onChange={(e) => handleSettingChange('borderWidth', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="1px">1px</option>
                            <option value="2px">2px</option>
                            <option value="3px">3px</option>
                            <option value="4px">4px</option>
                          </select>
                        </div>
                      </div>

                      {currentTargetSettings.borderStyle && currentTargetSettings.borderStyle !== 'none' && (
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Border Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={currentTargetSettings.borderColor || '#E5E5E5'}
                              onChange={(e) => handleSettingChange('borderColor', e.target.value)}
                              className="w-8 h-8 rounded border border-[#E5E5E5] p-0.5 cursor-pointer bg-white"
                            />
                            <input
                              type="text"
                              value={currentTargetSettings.borderColor || '#E5E5E5'}
                              onChange={(e) => handleSettingChange('borderColor', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Border Radius</label>
                          <select
                            value={currentTargetSettings.borderRadius || '0px'}
                            onChange={(e) => handleSettingChange('borderRadius', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="0px">Sharp (0px)</option>
                            <option value="6px">Slight (6px)</option>
                            <option value="12px">Rounded (12px)</option>
                            <option value="16px">Large (16px)</option>
                            <option value="24px">Curved (24px)</option>
                            <option value="9999px">Pill (9999px)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Box Shadow</label>
                          <select
                            value={currentTargetSettings.boxShadow || 'none'}
                            onChange={(e) => handleSettingChange('boxShadow', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="none">None</option>
                            <option value="sm">Subtle (sm)</option>
                            <option value="md">Medium (md)</option>
                            <option value="lg">Elevated (lg)</option>
                            <option value="xl">Float (xl)</option>
                          </select>
                        </div>
                      </div>

                      {/* Overflow Behavior for Container / Section */}
                      {(currentTargetType === 'section' || currentTargetType === 'container') && (
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Overflow Handling</label>
                          <select
                            value={currentTargetSettings.overflow || 'visible'}
                            onChange={(e) => handleSettingChange('overflow', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="visible">Visible</option>
                            <option value="hidden">Hidden (Crop Spills)</option>
                            <option value="auto">Auto (Scroll if needed)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ADVANCED */}
              {activeTab === 'advanced' && (
                <div className="space-y-4">
                  <div className="font-bold text-[#141414] border-b border-[#E5E5E5] pb-1">Advanced Settings</div>

                  <div>
                    <label className="block text-[#737373] mb-1 font-semibold">CSS ID / Anchor</label>
                    <input
                      type="text"
                      value={currentTargetSettings.cssId || ''}
                      onChange={(e) => handleSettingChange('cssId', e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                      placeholder="e.g. couture-story"
                      className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">Use for in-page navigation anchors (e.g. #couture-story).</span>
                  </div>

                  <div>
                    <label className="block text-[#737373] mb-1 font-semibold">Custom Class Names</label>
                    <input
                      type="text"
                      value={currentTargetSettings.customClasses || ''}
                      onChange={(e) => handleSettingChange('customClasses', e.target.value)}
                      placeholder="e.g. luxury-glow tracking-tight"
                      className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#737373] mb-1 font-semibold">Overflow Behavior</label>
                    <select
                      value={currentTargetSettings.overflow || 'visible'}
                      onChange={(e) => handleSettingChange('overflow', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                    >
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden (Crop Spills)</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Page Settings when no element is selected */
            <div className="space-y-4">
              <div className="p-3 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">Page Information</span>
                <p className="text-xs text-[#525252]">Editing page identity and global SEO settings.</p>
              </div>

              <div>
                <label className="block text-[#737373] mb-1 font-semibold">Page Title</label>
                <input
                  type="text"
                  value={page?.title || ''}
                  onChange={(e) => onUpdatePageMeta('title', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[#737373] mb-1 font-semibold">URL Slug / Handle</label>
                <input
                  type="text"
                  value={page?.handle || ''}
                  onChange={(e) =>
                    onUpdatePageMeta(
                      'handle',
                      e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-')
                    )
                  }
                  className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Public URL: /pages/{page?.handle || 'example'}
                </span>
              </div>

              <div>
                <label className="block text-[#737373] mb-1 font-semibold">Page Type</label>
                <select
                  value={page?.type || 'Standard'}
                  onChange={(e) => onUpdatePageMeta('type', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                >
                  <option value="Standard">Standard Content Page</option>
                  <option value="Landing">Landing Page</option>
                  <option value="Editorial">Editorial Story</option>
                  <option value="Campaign">Campaign Page</option>
                  <option value="Lookbook">Lookbook</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#E5E5E5]">
                <span className="block font-bold text-[#141414] mb-2 text-xs">Search Engine Optimization (SEO)</span>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[#737373] mb-1 font-semibold">SEO Meta Title</label>
                    <input
                      type="text"
                      value={page?.seoTitle || ''}
                      onChange={(e) => onUpdatePageMeta('seoTitle', e.target.value)}
                      placeholder={page?.title ? `${page.title} | LAAM Luxury` : 'Title'}
                      className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#737373] mb-1 font-semibold">SEO Meta Description</label>
                    <textarea
                      rows={3}
                      value={page?.seoDescription || ''}
                      onChange={(e) => onUpdatePageMeta('seoDescription', e.target.value)}
                      placeholder="Brief summary for Google search snippets (150-160 characters)"
                      className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Centralized Media Picker Modal */}
      <MediaPickerModal
        token={token}
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelect}
      />
    </>
  );
};
