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
  FolderOpen,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Info,
  Eye,
  EyeOff,
  Star,
  ShieldCheck,
  Images,
  Video,
  SlidersHorizontal,
  Flame,
  ShoppingBag,
  Sparkles,
  HelpCircle,
  MessageSquareQuote,
  Mail,
  Globe,
  Scissors,
  Headphones,
  Check
} from 'lucide-react';
import { StorePage, PageBuilderSection, PageBuilderBlock } from '../../types/pageBuilder.ts';
import { MediaPickerModal } from '../components/MediaPickerModal.tsx';
import { DeviceViewport } from './styleHelpers.ts';
import { PRODUCTS } from '../../data/products.ts';

interface BuilderSidebarRightProps {
  token?: string;
  page: StorePage | null;
  selectedElement: PageBuilderSection | null;
  selectedBlockId?: string | null;
  viewportMode?: DeviceViewport;
  onViewportChange?: (mode: DeviceViewport) => void;
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
  viewportMode = 'desktop',
  onViewportChange,
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

  // Padding & Margin lock state for 4-sided controls
  const [isPaddingLinked, setIsPaddingLinked] = useState(false);
  const [isMarginLinked, setIsMarginLinked] = useState(false);

  // Set of styling keys that support responsive device overrides
  const RESPONSIVE_KEYS = new Set<string>([
    'fontSize',
    'alignment',
    'lineHeight',
    'letterSpacing',
    'maxWidth',
    'width',
    'height',
    'minHeight',
    'maxHeight',
    'paddingTop',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingY',
    'paddingX',
    'marginTop',
    'marginBottom',
    'marginLeft',
    'marginRight',
    'columnCount',
    'gap',
    'borderRadius',
    'objectFit',
    'aspectRatio',
    'fullWidthMobile',
    'hideOnDesktop',
    'hideOnTablet',
    'hideOnMobile'
  ]);

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

  /**
   * Resolves the responsive status of a property:
   * whether it is explicitly overridden on the active viewport,
   * or inherited from Desktop / Tablet.
   */
  const getResponsivePropStatus = (key: string, defaultValue?: any) => {
    const rawVal = currentTargetSettings[key];
    const isDesktop = viewportMode === 'desktop';
    const isTablet = viewportMode === 'tablet';

    if (isDesktop || !RESPONSIVE_KEYS.has(key)) {
      return {
        isOverridden: false,
        isInherited: false,
        inheritedFrom: null as 'desktop' | 'tablet' | null,
        value: rawVal !== undefined ? rawVal : defaultValue,
        baseValue: rawVal !== undefined ? rawVal : defaultValue
      };
    }

    if (isTablet) {
      const tabletOverride = currentTargetSettings.responsive?.tablet?.[key];
      if (tabletOverride !== undefined) {
        return {
          isOverridden: true,
          isInherited: false,
          inheritedFrom: null,
          value: tabletOverride,
          baseValue: rawVal !== undefined ? rawVal : defaultValue
        };
      }
      return {
        isOverridden: false,
        isInherited: true,
        inheritedFrom: 'desktop' as const,
        value: rawVal !== undefined ? rawVal : defaultValue,
        baseValue: rawVal !== undefined ? rawVal : defaultValue
      };
    }

    // isMobile
    const mobileOverride = currentTargetSettings.responsive?.mobile?.[key];
    if (mobileOverride !== undefined) {
      return {
        isOverridden: true,
        isInherited: false,
        inheritedFrom: null,
        value: mobileOverride,
        baseValue: rawVal !== undefined ? rawVal : defaultValue
      };
    }

    const tabletOverride = currentTargetSettings.responsive?.tablet?.[key];
    if (tabletOverride !== undefined) {
      return {
        isOverridden: false,
        isInherited: true,
        inheritedFrom: 'tablet' as const,
        value: tabletOverride,
        baseValue: rawVal !== undefined ? rawVal : defaultValue
      };
    }

    return {
      isOverridden: false,
      isInherited: true,
      inheritedFrom: 'desktop' as const,
      value: rawVal !== undefined ? rawVal : defaultValue,
      baseValue: rawVal !== undefined ? rawVal : defaultValue
    };
  };

  const handleSettingChange = (key: string, value: any) => {
    const isResponsive = viewportMode !== 'desktop' && RESPONSIVE_KEYS.has(key);

    let updatedSettings: Record<string, any>;
    if (!isResponsive) {
      // Base setting (Desktop or non-responsive content property)
      updatedSettings = {
        ...currentTargetSettings,
        [key]: value
      };
    } else {
      // Device-specific override (Tablet or Mobile)
      const currentResponsive = { ...(currentTargetSettings.responsive || {}) };
      const deviceKey = viewportMode as 'tablet' | 'mobile';
      currentResponsive[deviceKey] = {
        ...(currentResponsive[deviceKey] || {}),
        [key]: value
      };
      updatedSettings = {
        ...currentTargetSettings,
        responsive: currentResponsive
      };
    }

    if (activeBlock && selectedElement && onUpdateBlock) {
      onUpdateBlock(selectedElement.id, activeBlock.id, {
        settings: updatedSettings
      });
    } else if (selectedElement) {
      onUpdateSection(selectedElement.id, {
        settings: updatedSettings
      });
    }
  };

  const handleMultipleSettingsChange = (updates: Record<string, any>) => {
    let updatedSettings: Record<string, any>;

    if (viewportMode === 'desktop') {
      updatedSettings = {
        ...currentTargetSettings,
        ...updates
      };
    } else {
      const currentResponsive = { ...(currentTargetSettings.responsive || {}) };
      const deviceKey = viewportMode as 'tablet' | 'mobile';
      const deviceOverrides = { ...(currentResponsive[deviceKey] || {}) };

      const baseUpdates: Record<string, any> = {};
      for (const [key, val] of Object.entries(updates)) {
        if (RESPONSIVE_KEYS.has(key)) {
          deviceOverrides[key] = val;
        } else {
          baseUpdates[key] = val;
        }
      }

      currentResponsive[deviceKey] = deviceOverrides;
      updatedSettings = {
        ...currentTargetSettings,
        ...baseUpdates,
        responsive: currentResponsive
      };
    }

    if (activeBlock && selectedElement && onUpdateBlock) {
      onUpdateBlock(selectedElement.id, activeBlock.id, {
        settings: updatedSettings
      });
    } else if (selectedElement) {
      onUpdateSection(selectedElement.id, {
        settings: updatedSettings
      });
    }
  };

  const handleResetResponsiveSetting = (key: string) => {
    if (viewportMode === 'desktop') return;
    const deviceKey = viewportMode as 'tablet' | 'mobile';
    const currentResponsive = { ...(currentTargetSettings.responsive || {}) };
    if (!currentResponsive[deviceKey]) return;

    const deviceOverrides = { ...currentResponsive[deviceKey] };
    delete deviceOverrides[key];
    currentResponsive[deviceKey] = deviceOverrides;

    const updatedSettings = {
      ...currentTargetSettings,
      responsive: currentResponsive
    };

    if (activeBlock && selectedElement && onUpdateBlock) {
      onUpdateBlock(selectedElement.id, activeBlock.id, {
        settings: updatedSettings
      });
    } else if (selectedElement) {
      onUpdateSection(selectedElement.id, {
        settings: updatedSettings
      });
    }
  };

  const handleResetAllDeviceOverrides = () => {
    if (viewportMode === 'desktop') return;
    const deviceKey = viewportMode as 'tablet' | 'mobile';
    const currentResponsive = { ...(currentTargetSettings.responsive || {}) };
    delete currentResponsive[deviceKey];

    const updatedSettings = {
      ...currentTargetSettings,
      responsive: currentResponsive
    };

    if (activeBlock && selectedElement && onUpdateBlock) {
      onUpdateBlock(selectedElement.id, activeBlock.id, {
        settings: updatedSettings
      });
    } else if (selectedElement) {
      onUpdateSection(selectedElement.id, {
        settings: updatedSettings
      });
    }
  };

  const activeDeviceOverrides =
    viewportMode !== 'desktop' && currentTargetSettings.responsive?.[viewportMode]
      ? currentTargetSettings.responsive[viewportMode]
      : null;
  const hasDeviceOverrides =
    Boolean(activeDeviceOverrides && Object.keys(activeDeviceOverrides).length > 0);

  const renderResponsiveLabel = (label: string, propKey: string, defaultValue?: any) => {
    const status = getResponsivePropStatus(propKey, defaultValue);
    const isDeviceResponsive = viewportMode !== 'desktop' && RESPONSIVE_KEYS.has(propKey);

    return (
      <div className="flex items-center justify-between mb-1">
        <label className="text-[#737373] font-semibold text-xs flex items-center gap-1.5">
          <span>{label}</span>
        </label>
        {isDeviceResponsive && (
          <div className="flex items-center gap-1">
            {status.isOverridden ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#E04F16]/15 text-[#E04F16] border border-[#E04F16]/30">
                <span>Overridden</span>
                <button
                  type="button"
                  onClick={() => handleResetResponsiveSetting(propKey)}
                  className="hover:text-red-600 transition-colors ml-0.5 p-0.5"
                  title={`Reset ${label} to inherited value`}
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              </span>
            ) : (
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-neutral-100 text-neutral-500 border border-neutral-200"
                title={`Inherited from ${status.inheritedFrom === 'tablet' ? 'Tablet override' : 'Desktop base'}`}
              >
                Inherited ({status.inheritedFrom === 'tablet' ? 'Tablet' : 'Desktop'})
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const sanitizeLink = (url: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (/^(javascript|vbscript|data):/i.test(trimmed)) {
      return '#';
    }
    return trimmed;
  };

  const [mediaTargetField, setMediaTargetField] = useState<string>('imageUrl');
  const [mediaTargetIndex, setMediaTargetIndex] = useState<number | null>(null);

  const openMediaPicker = (field: string = 'imageUrl', index: number | null = null) => {
    setMediaTargetField(field);
    setMediaTargetIndex(index);
    setIsMediaModalOpen(true);
  };

  const handleMediaSelect = (url: string, altText?: string) => {
    if (mediaTargetField === 'gallery' && mediaTargetIndex !== null) {
      const images = [...(currentTargetSettings.images || [])];
      images[mediaTargetIndex] = url;
      handleSettingChange('images', images);
    } else if (mediaTargetField === 'gallery_add') {
      const images = [...(currentTargetSettings.images || []), url];
      handleSettingChange('images', images);
    } else if (mediaTargetField === 'collection' && mediaTargetIndex !== null) {
      const collections = [...(currentTargetSettings.collections || [])];
      if (collections[mediaTargetIndex]) {
        collections[mediaTargetIndex] = { ...collections[mediaTargetIndex], image: url };
        handleSettingChange('collections', collections);
      }
    } else if (mediaTargetField === 'imageUrl') {
      handleMultipleSettingsChange({
        imageUrl: url,
        ...(altText ? { altText } : {})
      });
    } else {
      handleSettingChange(mediaTargetField, url);
    }
    setIsMediaModalOpen(false);
  };

  // Universal customizability like Elementor: all widgets can be customized
  const hasTypography = Boolean(currentTargetType && currentTargetType !== 'spacer' && currentTargetType !== 'divider');
  const hasColors = Boolean(currentTargetType);
  const hasLayout = Boolean(currentTargetType);
  const hasBorders = Boolean(currentTargetType);

  // Preset luxury colors
  const luxuryColors = ['#FFFFFF', '#FAF9F6', '#141414', '#404040', '#737373', '#087443', '#E04F16', '#B45309', '#1E3A8A', 'transparent'];

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

        {/* Device Viewport Bar for Selected Element */}
        {(selectedElement || activeBlock) && (
          <div className="bg-[#141414] text-white px-3.5 py-2.5 border-b border-[#262626]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 flex items-center gap-1.5">
                <span>Device Context:</span>
                <span className="text-[#E04F16] font-extrabold">{viewportMode.toUpperCase()}</span>
              </span>
              {viewportMode !== 'desktop' && hasDeviceOverrides && (
                <button
                  type="button"
                  onClick={handleResetAllDeviceOverrides}
                  className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors font-medium hover:underline"
                  title={`Reset all ${viewportMode} overrides on this element to inherited`}
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset All ({viewportMode})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1 bg-white/10 p-0.5 rounded-lg border border-white/10 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => onViewportChange?.('desktop')}
                className={`py-1 rounded flex items-center justify-center gap-1 transition-all ${
                  viewportMode === 'desktop'
                    ? 'bg-[#E04F16] text-white shadow-xs font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Desktop View (Base styles)"
              >
                <Monitor className="w-3 h-3" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => onViewportChange?.('tablet')}
                className={`py-1 rounded flex items-center justify-center gap-1 transition-all ${
                  viewportMode === 'tablet'
                    ? 'bg-[#E04F16] text-white shadow-xs font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Tablet View (768px overrides)"
              >
                <Tablet className="w-3 h-3" />
                <span>Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => onViewportChange?.('mobile')}
                className={`py-1 rounded flex items-center justify-center gap-1 transition-all ${
                  viewportMode === 'mobile'
                    ? 'bg-[#E04F16] text-white shadow-xs font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Mobile View (375px overrides)"
              >
                <Smartphone className="w-3 h-3" />
                <span>Mobile</span>
              </button>
            </div>

            <div className="mt-1.5 text-[10px] text-white/50 flex items-center gap-1">
              <Info className="w-3 h-3 text-[#E04F16] shrink-0" />
              <span className="truncate">
                {viewportMode === 'desktop'
                  ? 'Base styles apply to all screens unless overridden.'
                  : viewportMode === 'tablet'
                  ? 'Editing Tablet overrides. Unset properties inherit Desktop.'
                  : 'Editing Mobile overrides. Unset properties inherit Tablet/Desktop.'}
              </span>
            </div>

            {/* Current device hidden warning & quick unhide */}
            {((viewportMode === 'desktop' && currentTargetSettings.hideOnDesktop) ||
              (viewportMode === 'tablet' && (currentTargetSettings.hideOnTablet || currentTargetSettings.responsive?.tablet?.hideOnTablet)) ||
              (viewportMode === 'mobile' && (currentTargetSettings.hideOnMobile || currentTargetSettings.responsive?.mobile?.hideOnMobile))) && (
              <div className="mt-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded text-[10px] font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <EyeOff className="w-3 h-3 text-amber-400" />
                  <span>Hidden on {viewportMode.toUpperCase()}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (viewportMode === 'desktop') handleSettingChange('hideOnDesktop', false);
                    else if (viewportMode === 'tablet') handleSettingChange('hideOnTablet', false);
                    else if (viewportMode === 'mobile') handleSettingChange('hideOnMobile', false);
                  }}
                  className="text-amber-200 hover:text-white underline font-bold"
                >
                  Unhide
                </button>
              </div>
            )}
          </div>
        )}

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
                          {renderResponsiveLabel('Column Count', 'columnCount', 2)}
                          <select
                            value={Number(getResponsivePropStatus('columnCount', 2).value) || 2}
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
                          {renderResponsiveLabel('Grid Gap', 'gap', '24px')}
                          <select
                            value={getResponsivePropStatus('gap', '24px').value}
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

                  {/* Product Grid Content */}
                  {currentTargetType === 'product_grid' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Section Heading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.heading || ''}
                          onChange={(e) => handleSettingChange('heading', e.target.value)}
                          placeholder="Trending Ready to Ship Pret"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Subheading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.subheading || ''}
                          onChange={(e) => handleSettingChange('subheading', e.target.value)}
                          placeholder="Handcrafted luxury couture"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          {renderResponsiveLabel('Columns', 'columnCount', 4)}
                          <select
                            value={Number(getResponsivePropStatus('columnCount', 4).value) || 4}
                            onChange={(e) => handleSettingChange('columnCount', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value={1}>1 Column</option>
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns</option>
                            <option value={5}>5 Columns</option>
                          </select>
                        </div>
                        <div>
                          {renderResponsiveLabel('Grid Gap', 'gap', '20px')}
                          <select
                            value={getResponsivePropStatus('gap', '20px').value}
                            onChange={(e) => handleSettingChange('gap', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="12px">Compact (12px)</option>
                            <option value="16px">Normal (16px)</option>
                            <option value="20px">Standard (20px)</option>
                            <option value="24px">Spacious (24px)</option>
                            <option value="32px">Generous (32px)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Product Display Limit</label>
                        <select
                          value={currentTargetSettings.limit || 8}
                          onChange={(e) => handleSettingChange('limit', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                        >
                          <option value={4}>4 Products</option>
                          <option value={8}>8 Products</option>
                          <option value={12}>12 Products</option>
                          <option value={16}>16 Products</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Collection Grid Content */}
                  {currentTargetType === 'collection_grid' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Section Heading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.heading || ''}
                          onChange={(e) => handleSettingChange('heading', e.target.value)}
                          placeholder="Featured Collections"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          {renderResponsiveLabel('Columns', 'columnCount', 3)}
                          <select
                            value={Number(getResponsivePropStatus('columnCount', 3).value) || 3}
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
                          {renderResponsiveLabel('Grid Gap', 'gap', '24px')}
                          <select
                            value={getResponsivePropStatus('gap', '24px').value}
                            onChange={(e) => handleSettingChange('gap', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="12px">Compact (12px)</option>
                            <option value="16px">Normal (16px)</option>
                            <option value="24px">Standard (24px)</option>
                            <option value="32px">Generous (32px)</option>
                          </select>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-neutral-200">
                        <label className="block text-[#737373] mb-2 font-semibold text-[11px]">Manage Curated Collections</label>
                        <div className="space-y-2">
                          {((currentTargetSettings.collections || [
                            { title: 'Luxury Pret 2026', image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=80', link: '/collections/pret' },
                            { title: 'Bridal Heirloom Couture', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80', link: '/collections/bridal' },
                            { title: 'Festive Formals Edit', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=600&q=80', link: '/collections/festive' }
                          ]) as any[]).map((col, idx) => (
                            <div key={idx} className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#141414] uppercase">Collection #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cols = [...(currentTargetSettings.collections || [])];
                                    cols.splice(idx, 1);
                                    handleSettingChange('collections', cols);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-0.5"
                                  title="Delete collection"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={col.title || ''}
                                onChange={(e) => {
                                  const cols = [...(currentTargetSettings.collections || [])];
                                  cols[idx] = { ...cols[idx], title: e.target.value };
                                  handleSettingChange('collections', cols);
                                }}
                                placeholder="Collection Title"
                                className="w-full px-2 py-1 text-xs border border-[#E5E5E5] rounded bg-white"
                              />
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={col.image || ''}
                                  onChange={(e) => {
                                    const cols = [...(currentTargetSettings.collections || [])];
                                    cols[idx] = { ...cols[idx], image: e.target.value };
                                    handleSettingChange('collections', cols);
                                  }}
                                  placeholder="Image URL"
                                  className="flex-1 px-2 py-1 text-[11px] font-mono border border-[#E5E5E5] rounded bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => openMediaPicker('collection', idx)}
                                  className="px-2 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded text-[10px] font-semibold text-[#141414] shrink-0"
                                >
                                  Media
                                </button>
                              </div>
                              <input
                                type="text"
                                value={col.link || ''}
                                onChange={(e) => {
                                  const cols = [...(currentTargetSettings.collections || [])];
                                  cols[idx] = { ...cols[idx], link: e.target.value };
                                  handleSettingChange('collections', cols);
                                }}
                                placeholder="/collections/pret"
                                className="w-full px-2 py-1 text-[11px] font-mono border border-[#E5E5E5] rounded bg-white"
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const cols = [...(currentTargetSettings.collections || [])];
                              cols.push({
                                title: 'New Luxury Curation',
                                image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80',
                                link: '/collections'
                              });
                              handleSettingChange('collections', cols);
                            }}
                            className="w-full py-1.5 bg-white hover:bg-neutral-50 border border-dashed border-[#141414] rounded-lg text-xs font-semibold text-[#141414] flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#E04F16]" /> Add Collection Card
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Featured Product Content */}
                  {currentTargetType === 'featured_product' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Section Heading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.heading || ''}
                          onChange={(e) => handleSettingChange('heading', e.target.value)}
                          placeholder="Couture Spotlight"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Quick Autofill from Catalog</label>
                        <select
                          value={currentTargetSettings.productId || ''}
                          onChange={(e) => {
                            const pId = e.target.value;
                            const prod = PRODUCTS.find((p) => p.id === pId);
                            if (prod) {
                              handleMultipleSettingsChange({
                                productId: prod.id,
                                productName: prod.name,
                                designer: prod.designer,
                                priceUSD: prod.priceUSD,
                                originalPriceUSD: prod.originalPriceUSD || null,
                                imageUrl: prod.image,
                                badge: prod.badge || 'SPOTLIGHT'
                              });
                            }
                          }}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                        >
                          <option value="">Select a catalog product...</option>
                          {PRODUCTS.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.designer} — {p.name} (${p.priceUSD})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Product Name</label>
                        <input
                          type="text"
                          value={currentTargetSettings.productName || ''}
                          onChange={(e) => handleSettingChange('productName', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Designer Name</label>
                        <input
                          type="text"
                          value={currentTargetSettings.designer || ''}
                          onChange={(e) => handleSettingChange('designer', e.target.value)}
                          placeholder="Zara Shahjahan"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Price ($ USD)</label>
                          <input
                            type="number"
                            value={currentTargetSettings.priceUSD ?? 195}
                            onChange={(e) => handleSettingChange('priceUSD', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Compare At ($)</label>
                          <input
                            type="number"
                            value={currentTargetSettings.originalPriceUSD ?? ''}
                            onChange={(e) => handleSettingChange('originalPriceUSD', e.target.value ? Number(e.target.value) : null)}
                            placeholder="Optional"
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Badge Pill</label>
                        <input
                          type="text"
                          value={currentTargetSettings.badge || ''}
                          onChange={(e) => handleSettingChange('badge', e.target.value)}
                          placeholder="READY TO SHIP"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Product Image URL</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={currentTargetSettings.imageUrl || ''}
                            onChange={(e) => handleSettingChange('imageUrl', e.target.value)}
                            className="flex-1 px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                          />
                          <button
                            type="button"
                            onClick={() => openMediaPicker('imageUrl')}
                            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-[#141414] font-semibold text-xs rounded-lg border border-neutral-200 flex items-center gap-1 shrink-0"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-[#E04F16]" /> Choose
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Button Label</label>
                          <input
                            type="text"
                            value={currentTargetSettings.buttonText || 'Add to Bag'}
                            onChange={(e) => handleSettingChange('buttonText', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Button URL</label>
                          <input
                            type="text"
                            value={currentTargetSettings.buttonLink || '/collections'}
                            onChange={(e) => handleSettingChange('buttonLink', sanitizeLink(e.target.value))}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Carousel Content */}
                  {currentTargetType === 'product_carousel' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Section Heading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.heading || ''}
                          onChange={(e) => handleSettingChange('heading', e.target.value)}
                          placeholder="New Arrivals · Spring & Festive 2026"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Subheading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.subheading || ''}
                          onChange={(e) => handleSettingChange('subheading', e.target.value)}
                          placeholder="Handcrafted silk kalidars & luxury formals"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Catalog Category</label>
                        <select
                          value={currentTargetSettings.category || 'all'}
                          onChange={(e) => handleSettingChange('category', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                        >
                          <option value="all">All Categories</option>
                          <option value="pret">Luxury Pret</option>
                          <option value="festive">Festive Formals</option>
                          <option value="bridal">Bridal Couture</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <label className="text-[#525252] font-semibold flex items-center gap-1.5 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={currentTargetSettings.autoplay ?? false}
                            onChange={(e) => handleSettingChange('autoplay', e.target.checked)}
                            className="rounded text-[#141414]"
                          />
                          <span>Autoplay Carousel</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Image Gallery Content */}
                  {currentTargetType === 'image_gallery' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Gallery Heading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.heading || ''}
                          onChange={(e) => handleSettingChange('heading', e.target.value)}
                          placeholder="Visual Lookbook"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Gallery Layout</label>
                        <select
                          value={currentTargetSettings.layout || 'grid3'}
                          onChange={(e) => handleSettingChange('layout', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                        >
                          <option value="grid3">3 Columns Grid</option>
                          <option value="grid4">4 Columns Grid</option>
                          <option value="masonry">Editorial Masonry</option>
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[#737373] font-semibold">Gallery Images</label>
                          <button
                            type="button"
                            onClick={() => openMediaPicker('gallery_add')}
                            className="px-2 py-1 bg-white hover:bg-neutral-50 border border-neutral-200 rounded text-[11px] font-semibold text-[#141414] flex items-center gap-1 shadow-xs"
                          >
                            <Plus className="w-3 h-3 text-[#E04F16]" /> Add from Media
                          </button>
                        </div>
                        <div className="space-y-2">
                          {((currentTargetSettings.images || [
                            'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
                            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
                            'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80'
                          ]) as string[]).map((imgUrl, iIdx) => (
                            <div key={iIdx} className="flex items-center gap-2 p-1.5 bg-neutral-50 rounded-lg border border-neutral-200">
                              <img src={imgUrl} alt="Thumbnail" className="w-10 h-10 object-cover rounded shrink-0 border" />
                              <input
                                type="text"
                                value={imgUrl}
                                onChange={(e) => {
                                  const imgs = [...(currentTargetSettings.images || [])];
                                  imgs[iIdx] = e.target.value;
                                  handleSettingChange('images', imgs);
                                }}
                                className="flex-1 px-2 py-1 text-[11px] font-mono border border-neutral-300 rounded bg-white truncate"
                              />
                              <button
                                type="button"
                                onClick={() => openMediaPicker('gallery', iIdx)}
                                className="p-1 hover:bg-neutral-200 rounded text-[#141414]"
                                title="Change Media"
                              >
                                <FolderOpen className="w-3.5 h-3.5 text-[#E04F16]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const imgs = [...(currentTargetSettings.images || [])];
                                  imgs.splice(iIdx, 1);
                                  handleSettingChange('images', imgs);
                                }}
                                className="p-1 hover:bg-red-100 rounded text-red-600"
                                title="Remove Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video Content */}
                  {currentTargetType === 'video' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Video Heading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.heading || ''}
                          onChange={(e) => handleSettingChange('heading', e.target.value)}
                          placeholder="Craftsmanship in Motion"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Video URL (YouTube embed or MP4)</label>
                        <input
                          type="text"
                          value={currentTargetSettings.videoUrl || ''}
                          onChange={(e) => handleSettingChange('videoUrl', e.target.value)}
                          placeholder="https://www.youtube.com/embed/..."
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Aspect Ratio</label>
                          <select
                            value={currentTargetSettings.aspectRatio || '16:9'}
                            onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                          >
                            <option value="16:9">16:9 (Widescreen)</option>
                            <option value="4:3">4:3 (Classic)</option>
                            <option value="1:1">1:1 (Square)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Atelier Caption</label>
                          <input
                            type="text"
                            value={currentTargetSettings.caption || ''}
                            onChange={(e) => handleSettingChange('caption', e.target.value)}
                            placeholder="Inside our Lahore atelier"
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image with Text Content */}
                  {currentTargetType === 'image_with_text' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Headline</label>
                        <input
                          type="text"
                          value={currentTargetSettings.heading || ''}
                          onChange={(e) => handleSettingChange('heading', e.target.value)}
                          placeholder="Handcrafted With Heritage"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Narrative Story Copy</label>
                        <textarea
                          rows={4}
                          value={currentTargetSettings.text || ''}
                          onChange={(e) => handleSettingChange('text', e.target.value)}
                          placeholder="Every stitch tells a story of century-old subcontinental heritage..."
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Visual Asset</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={currentTargetSettings.imageUrl || ''}
                            onChange={(e) => handleSettingChange('imageUrl', e.target.value)}
                            className="flex-1 px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                          />
                          <button
                            type="button"
                            onClick={() => openMediaPicker('imageUrl')}
                            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-[#141414] font-semibold text-xs rounded-lg border border-neutral-200 flex items-center gap-1 shrink-0"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-[#E04F16]" /> Choose
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Image Placement</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSettingChange('imagePosition', 'left')}
                            className={`py-1.5 rounded-lg border text-xs font-semibold ${
                              (currentTargetSettings.imagePosition || 'left') === 'left'
                                ? 'bg-[#141414] text-white border-[#141414]'
                                : 'bg-neutral-50 text-[#737373] hover:bg-neutral-100 border-neutral-200'
                            }`}
                          >
                            Image Left / Text Right
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSettingChange('imagePosition', 'right')}
                            className={`py-1.5 rounded-lg border text-xs font-semibold ${
                              currentTargetSettings.imagePosition === 'right'
                                ? 'bg-[#141414] text-white border-[#141414]'
                                : 'bg-neutral-50 text-[#737373] hover:bg-neutral-100 border-neutral-200'
                            }`}
                          >
                            Image Right / Text Left
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Button Label</label>
                          <input
                            type="text"
                            value={currentTargetSettings.buttonText || ''}
                            onChange={(e) => handleSettingChange('buttonText', e.target.value)}
                            placeholder="Learn More"
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Button URL</label>
                          <input
                            type="text"
                            value={currentTargetSettings.buttonLink || ''}
                            onChange={(e) => handleSettingChange('buttonLink', sanitizeLink(e.target.value))}
                            placeholder="/collections"
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FAQ Content */}
                  {currentTargetType === 'faq' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">FAQ Section Heading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.heading || ''}
                          onChange={(e) => handleSettingChange('heading', e.target.value)}
                          placeholder="Frequently Asked Questions"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[#737373] font-semibold">Questions & Answers</label>
                          <button
                            type="button"
                            onClick={() => {
                              const items = [...(currentTargetSettings.items || [])];
                              items.push({ q: 'New Question Title', a: 'Detailed answer regarding shipping, sizing or bespoke tailoring.' });
                              handleSettingChange('items', items);
                            }}
                            className="px-2 py-1 bg-white hover:bg-neutral-50 border border-neutral-200 rounded text-[11px] font-semibold text-[#141414] flex items-center gap-1 shadow-xs"
                          >
                            <Plus className="w-3 h-3 text-[#E04F16]" /> Add FAQ Item
                          </button>
                        </div>
                        <div className="space-y-2">
                          {((currentTargetSettings.items || [
                            { q: 'How long does custom stitching take?', a: 'Bespoke couture typically takes 2-3 weeks for handcrafted embroidery and tailoring.' },
                            { q: 'Do you offer worldwide express shipping?', a: 'Yes, we provide DHL Express shipping worldwide with doorstep tracking.' },
                            { q: 'How do I determine my size?', a: 'Refer to our Global Size Guide or connect with our AI Concierge stylist for assistance.' }
                          ]) as any[]).map((item, qIdx) => (
                            <div key={qIdx} className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#141414] uppercase">Item #{qIdx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const items = [...(currentTargetSettings.items || [])];
                                    items.splice(qIdx, 1);
                                    handleSettingChange('items', items);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-0.5"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={item.q || ''}
                                onChange={(e) => {
                                  const items = [...(currentTargetSettings.items || [])];
                                  items[qIdx] = { ...items[qIdx], q: e.target.value };
                                  handleSettingChange('items', items);
                                }}
                                placeholder="Question"
                                className="w-full px-2 py-1 text-xs font-semibold border border-[#E5E5E5] rounded bg-white"
                              />
                              <textarea
                                rows={2}
                                value={item.a || ''}
                                onChange={(e) => {
                                  const items = [...(currentTargetSettings.items || [])];
                                  items[qIdx] = { ...items[qIdx], a: e.target.value };
                                  handleSettingChange('items', items);
                                }}
                                placeholder="Answer details..."
                                className="w-full px-2 py-1 text-xs border border-[#E5E5E5] rounded bg-white"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Testimonials Content */}
                  {currentTargetType === 'testimonials' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Heading</label>
                        <input
                          type="text"
                          value={currentTargetSettings.heading || ''}
                          onChange={(e) => handleSettingChange('heading', e.target.value)}
                          placeholder="Loved by Patrons Worldwide"
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Customer Endorsement / Quote</label>
                        <textarea
                          rows={3}
                          value={currentTargetSettings.quote || ''}
                          onChange={(e) => handleSettingChange('quote', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Author Name</label>
                          <input
                            type="text"
                            value={currentTargetSettings.author || ''}
                            onChange={(e) => handleSettingChange('author', e.target.value)}
                            placeholder="Dr. Fatima R."
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[#737373] mb-1 font-semibold">Location / Role</label>
                          <input
                            type="text"
                            value={currentTargetSettings.location || ''}
                            onChange={(e) => handleSettingChange('location', e.target.value)}
                            placeholder="London, UK"
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold">Star Rating</label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleSettingChange('rating', star)}
                              className={`p-1.5 rounded-lg border flex items-center justify-center transition-all ${
                                (currentTargetSettings.rating ?? 5) >= star
                                  ? 'bg-amber-50 border-amber-300 text-amber-500'
                                  : 'bg-white border-neutral-200 text-neutral-300'
                              }`}
                            >
                              <Star className={`w-4 h-4 ${(currentTargetSettings.rating ?? 5) >= star ? 'fill-amber-400' : ''}`} />
                            </button>
                          ))}
                          <span className="text-xs font-bold text-[#141414] ml-2">
                            {currentTargetSettings.rating ?? 5} / 5 Stars
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trust Signals Content */}
                  {currentTargetType === 'trust_signals' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold text-xs">Signal 1: Title & Subtitle</label>
                        <input
                          type="text"
                          value={currentTargetSettings.item1Title || '100% Original Designer Wear'}
                          onChange={(e) => handleSettingChange('item1Title', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg text-xs font-semibold mb-1"
                        />
                        <input
                          type="text"
                          value={currentTargetSettings.item1Subtitle || 'Directly sourced from verified Pakistani ateliers'}
                          onChange={(e) => handleSettingChange('item1Subtitle', e.target.value)}
                          className="w-full px-2.5 py-1 text-xs border border-[#E5E5E5] rounded-lg text-neutral-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold text-xs">Signal 2: Title & Subtitle</label>
                        <input
                          type="text"
                          value={currentTargetSettings.item2Title || 'Express Global Shipping'}
                          onChange={(e) => handleSettingChange('item2Title', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg text-xs font-semibold mb-1"
                        />
                        <input
                          type="text"
                          value={currentTargetSettings.item2Subtitle || 'Doorstep DHL delivery across 150+ countries'}
                          onChange={(e) => handleSettingChange('item2Subtitle', e.target.value)}
                          className="w-full px-2.5 py-1 text-xs border border-[#E5E5E5] rounded-lg text-neutral-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold text-xs">Signal 3: Title & Subtitle</label>
                        <input
                          type="text"
                          value={currentTargetSettings.item3Title || 'Secure Checkout Guaranteed'}
                          onChange={(e) => handleSettingChange('item3Title', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg text-xs font-semibold mb-1"
                        />
                        <input
                          type="text"
                          value={currentTargetSettings.item3Subtitle || 'End-to-end encrypted international transactions'}
                          onChange={(e) => handleSettingChange('item3Subtitle', e.target.value)}
                          className="w-full px-2.5 py-1 text-xs border border-[#E5E5E5] rounded-lg text-neutral-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737373] mb-1 font-semibold text-xs">Signal 4: Title & Subtitle</label>
                        <input
                          type="text"
                          value={currentTargetSettings.item4Title || 'Direct From Designers'}
                          onChange={(e) => handleSettingChange('item4Title', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg text-xs font-semibold mb-1"
                        />
                        <input
                          type="text"
                          value={currentTargetSettings.item4Subtitle || 'Authentic pret, luxury couture & bridal wear'}
                          onChange={(e) => handleSettingChange('item4Subtitle', e.target.value)}
                          className="w-full px-2.5 py-1 text-xs border border-[#E5E5E5] rounded-lg text-neutral-600"
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
                          {renderResponsiveLabel('Font Size', 'fontSize', currentTargetType === 'heading' ? '32px' : '14px')}
                          <input
                            type="text"
                            value={getResponsivePropStatus('fontSize', currentTargetType === 'heading' ? '32px' : '14px').value}
                            onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                            placeholder="e.g. 24px"
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          {renderResponsiveLabel('Alignment', 'alignment', 'center')}
                          <select
                            value={getResponsivePropStatus('alignment', 'center').value}
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
                          {renderResponsiveLabel('Line Height', 'lineHeight', '1.4')}
                          <select
                            value={getResponsivePropStatus('lineHeight', '1.4').value}
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
                          {renderResponsiveLabel('Letter Spacing', 'letterSpacing', '0em')}
                          <select
                            value={getResponsivePropStatus('letterSpacing', '0em').value}
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

                      {/* Background Image & Opacity for Section / Container / Hero / Banner */}
                      {(currentTargetType === 'section' || currentTargetType === 'container' || currentTargetType === 'hero' || currentTargetType === 'banner') && (
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
                              {renderResponsiveLabel('Max Width', 'maxWidth', currentTargetType === 'section' ? '1280px' : '1024px')}
                              <select
                                value={getResponsivePropStatus('maxWidth', currentTargetType === 'section' ? '1280px' : '1024px').value}
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
                              {renderResponsiveLabel('Min Height', 'minHeight', '0px')}
                              <input
                                type="text"
                                value={getResponsivePropStatus('minHeight', '0px').value}
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
                              {renderResponsiveLabel('Horiz. Padding', 'paddingX', '24px')}
                              <select
                                value={getResponsivePropStatus('paddingX', '24px').value}
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
                              {renderResponsiveLabel('Vert. Padding', 'paddingY', '12px')}
                              <select
                                value={getResponsivePropStatus('paddingY', '12px').value}
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
                          <div>
                            <label className="text-[#525252] font-semibold flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(getResponsivePropStatus('fullWidthMobile', false).value)}
                                onChange={(e) => handleSettingChange('fullWidthMobile', e.target.checked)}
                                className="rounded text-[#141414] focus:ring-[#141414]"
                              />
                              <span>Always Full Width on Mobile</span>
                            </label>
                          </div>
                        </>
                      )}

                      {/* Image Dimensions & Object Fit */}
                      {currentTargetType === 'image' && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              {renderResponsiveLabel('Max Width', 'maxWidth', '800px')}
                              <select
                                value={getResponsivePropStatus('maxWidth', '800px').value}
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
                              {renderResponsiveLabel('Max Height', 'maxHeight', '480px')}
                              <select
                                value={getResponsivePropStatus('maxHeight', '480px').value}
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
                              {renderResponsiveLabel('Object Fit', 'objectFit', 'cover')}
                              <select
                                value={getResponsivePropStatus('objectFit', 'cover').value}
                                onChange={(e) => handleSettingChange('objectFit', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                              >
                                <option value="cover">Cover (Crop)</option>
                                <option value="contain">Contain (Full)</option>
                                <option value="fill">Fill (Stretch)</option>
                              </select>
                            </div>
                            <div>
                              {renderResponsiveLabel('Aspect Ratio', 'aspectRatio', 'auto')}
                              <select
                                value={getResponsivePropStatus('aspectRatio', 'auto').value}
                                onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                              >
                                <option value="auto">Auto / Natural</option>
                                <option value="1/1">1:1 Square</option>
                                <option value="4/5">4:5 Editorial Portrait</option>
                                <option value="3/4">3:4 Fashion</option>
                                <option value="16/9">16:9 Landscape</option>
                                <option value="2/3">2:3 Classic Portrait</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            {renderResponsiveLabel('Alignment', 'alignment', 'center')}
                            <select
                              value={getResponsivePropStatus('alignment', 'center').value}
                              onChange={(e) => handleSettingChange('alignment', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg bg-white"
                            >
                              <option value="left">Left</option>
                              <option value="center">Center</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                        </>
                      )}

                      {/* 4-Sided Padding & Margin for All Widgets & Containers */}
                      {Boolean(currentTargetType) && (
                        <div className="space-y-3 pt-1">
                          {/* 4-Sided Internal Padding */}
                          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-[11px] text-[#141414]">Internal Padding</span>
                                {viewportMode !== 'desktop' && (
                                  getResponsivePropStatus('paddingTop').isOverridden ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#E04F16]/15 text-[#E04F16] border border-[#E04F16]/30">
                                      <span>Overridden</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleResetResponsiveSetting('paddingTop');
                                          handleResetResponsiveSetting('paddingRight');
                                          handleResetResponsiveSetting('paddingBottom');
                                          handleResetResponsiveSetting('paddingLeft');
                                          handleResetResponsiveSetting('paddingY');
                                          handleResetResponsiveSetting('paddingX');
                                        }}
                                        className="hover:text-red-600 transition-colors ml-0.5 p-0.5"
                                        title="Reset padding to inherited"
                                      >
                                        <RotateCcw className="w-2.5 h-2.5" />
                                      </button>
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-neutral-100 text-neutral-500 border border-neutral-200">
                                      Inherited ({getResponsivePropStatus('paddingTop').inheritedFrom === 'tablet' ? 'Tablet' : 'Desktop'})
                                    </span>
                                  )
                                )}
                              </div>
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
                                  value={getResponsivePropStatus('paddingTop', currentTargetSettings.paddingY || '32px').value}
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
                                  value={getResponsivePropStatus('paddingRight', currentTargetSettings.paddingX || '24px').value}
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
                                  value={getResponsivePropStatus('paddingBottom', currentTargetSettings.paddingY || '32px').value}
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
                                  value={getResponsivePropStatus('paddingLeft', currentTargetSettings.paddingX || '24px').value}
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
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-[11px] text-[#141414]">Outer Margin</span>
                                {viewportMode !== 'desktop' && (
                                  getResponsivePropStatus('marginTop').isOverridden ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#E04F16]/15 text-[#E04F16] border border-[#E04F16]/30">
                                      <span>Overridden</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleResetResponsiveSetting('marginTop');
                                          handleResetResponsiveSetting('marginRight');
                                          handleResetResponsiveSetting('marginBottom');
                                          handleResetResponsiveSetting('marginLeft');
                                        }}
                                        className="hover:text-red-600 transition-colors ml-0.5 p-0.5"
                                        title="Reset margin to inherited"
                                      >
                                        <RotateCcw className="w-2.5 h-2.5" />
                                      </button>
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-neutral-100 text-neutral-500 border border-neutral-200">
                                      Inherited ({getResponsivePropStatus('marginTop').inheritedFrom === 'tablet' ? 'Tablet' : 'Desktop'})
                                    </span>
                                  )
                                )}
                              </div>
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
                                  value={getResponsivePropStatus('marginTop', '0px').value}
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
                                  value={getResponsivePropStatus('marginRight', 'auto').value}
                                  onChange={(e) => handleSettingChange('marginRight', e.target.value)}
                                  placeholder="auto"
                                  className="w-full px-1 py-1 border border-[#E5E5E5] rounded text-center text-xs bg-white"
                                />
                              </div>
                              <div>
                                <span className="text-neutral-400 block mb-0.5">Bottom</span>
                                <input
                                  type="text"
                                  value={getResponsivePropStatus('marginBottom', '0px').value}
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
                                  value={getResponsivePropStatus('marginLeft', 'auto').value}
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
                          {renderResponsiveLabel('Border Radius', 'borderRadius', '0px')}
                          <select
                            value={getResponsivePropStatus('borderRadius', '0px').value || '0px'}
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

                  {/* Responsive Device Visibility */}
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#141414] flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#E04F16]" />
                        <span>Responsive Visibility</span>
                      </span>
                      <span className="text-[10px] text-neutral-400">Per-Device Display</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer">
                        <span className="flex items-center gap-2 text-xs font-medium text-neutral-800">
                          <Monitor className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Hide on Desktop</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={Boolean(currentTargetSettings.hideOnDesktop)}
                          onChange={(e) => handleSettingChange('hideOnDesktop', e.target.checked)}
                          className="rounded text-[#E04F16] focus:ring-[#E04F16] w-4 h-4 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer">
                        <span className="flex items-center gap-2 text-xs font-medium text-neutral-800">
                          <Tablet className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Hide on Tablet</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={Boolean(currentTargetSettings.hideOnTablet || currentTargetSettings.responsive?.tablet?.hideOnTablet)}
                          onChange={(e) => {
                            if (viewportMode === 'tablet') {
                              handleSettingChange('hideOnTablet', e.target.checked);
                            } else {
                              const currentResponsive = { ...(currentTargetSettings.responsive || {}) };
                              currentResponsive.tablet = {
                                ...(currentResponsive.tablet || {}),
                                hideOnTablet: e.target.checked
                              };
                              handleMultipleSettingsChange({
                                hideOnTablet: e.target.checked,
                                responsive: currentResponsive
                              });
                            }
                          }}
                          className="rounded text-[#E04F16] focus:ring-[#E04F16] w-4 h-4 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer">
                        <span className="flex items-center gap-2 text-xs font-medium text-neutral-800">
                          <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Hide on Mobile</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={Boolean(currentTargetSettings.hideOnMobile || currentTargetSettings.responsive?.mobile?.hideOnMobile)}
                          onChange={(e) => {
                            if (viewportMode === 'mobile') {
                              handleSettingChange('hideOnMobile', e.target.checked);
                            } else {
                              const currentResponsive = { ...(currentTargetSettings.responsive || {}) };
                              currentResponsive.mobile = {
                                ...(currentResponsive.mobile || {}),
                                hideOnMobile: e.target.checked
                              };
                              handleMultipleSettingsChange({
                                hideOnMobile: e.target.checked,
                                responsive: currentResponsive
                              });
                            }
                          }}
                          className="rounded text-[#E04F16] focus:ring-[#E04F16] w-4 h-4 cursor-pointer"
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-tight">
                      Elements hidden on the active viewport appear with dashed amber borders and a &quot;Hidden&quot; badge in the builder so you can still select and edit them.
                    </p>
                  </div>

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
