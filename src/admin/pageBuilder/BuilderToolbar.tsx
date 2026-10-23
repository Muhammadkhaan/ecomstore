import React from 'react';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Globe,
  Radio
} from 'lucide-react';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface BuilderToolbarProps {
  pageTitle: string;
  pageStatus: 'Draft' | 'Published' | 'Archived';
  pageHandle?: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  viewportMode: ViewportMode;
  isPreviewMode: boolean;
  onBack: () => void;
  onTitleChange: (newTitle: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onViewportChange: (mode: ViewportMode) => void;
  onTogglePreview: () => void;
  onOpenStorefrontPreview?: () => void;
  onSave: (action?: 'draft' | 'publish' | 'unpublish') => void;
}

export const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  pageTitle,
  pageStatus,
  pageHandle,
  hasUnsavedChanges,
  isSaving,
  canUndo,
  canRedo,
  viewportMode,
  isPreviewMode,
  onBack,
  onTitleChange,
  onUndo,
  onRedo,
  onViewportChange,
  onTogglePreview,
  onOpenStorefrontPreview,
  onSave
}) => {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [tempTitle, setTempTitle] = React.useState(pageTitle);
  const [showSaveDropdown, setShowSaveDropdown] = React.useState(false);

  React.useEffect(() => {
    setTempTitle(pageTitle);
  }, [pageTitle]);

  const handleFinishTitleEdit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim() && tempTitle !== pageTitle) {
      onTitleChange(tempTitle.trim());
    } else {
      setTempTitle(pageTitle);
    }
  };

  const isPublished = pageStatus === 'Published';

  return (
    <header className="h-14 bg-[#141414] text-white border-b border-[#262626] px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Left: Navigation & Page Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          title="Return to Pages list"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Pages</span>
        </button>

        <div className="h-4 w-px bg-white/20 hidden sm:block" />

        {/* Editable Title */}
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleFinishTitleEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishTitleEdit();
                if (e.key === 'Escape') {
                  setTempTitle(pageTitle);
                  setIsEditingTitle(false);
                }
              }}
              className="bg-neutral-800 text-white px-2 py-0.5 rounded text-xs font-semibold border border-neutral-600 focus:outline-none focus:border-[#E04F16]"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="font-bold text-xs text-white hover:text-[#E04F16] truncate max-w-[160px] sm:max-w-xs transition-colors flex items-center gap-1 text-left"
              title="Click to edit title"
            >
              <span className="truncate">{pageTitle || 'Untitled Page'}</span>
            </button>
          )}

          {/* Publishing Status Badge */}
          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1 ${
                isPublished
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{pageStatus}</span>
            </span>
          </div>
        </div>

        {/* Unsaved status */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-white/60 ml-2">
          {isSaving ? (
            <span className="flex items-center gap-1 text-amber-400">
              <Clock className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : hasUnsavedChanges ? (
            <span className="flex items-center gap-1 text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Unsaved changes</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Saved</span>
            </span>
          )}
        </div>
      </div>

      {/* Center: Undo/Redo & Viewport Switchers */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-white/30 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${
              canRedo ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-white/30 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Viewport Toggles */}
        <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5">
          <button
            onClick={() => onViewportChange('desktop')}
            className={`p-1.5 rounded transition-colors ${
              viewportMode === 'desktop' ? 'bg-[#E04F16] text-white shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Desktop view (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewportChange('tablet')}
            className={`p-1.5 rounded transition-colors ${
              viewportMode === 'tablet' ? 'bg-[#E04F16] text-white shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Tablet view (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewportChange('mobile')}
            className={`p-1.5 rounded transition-colors ${
              viewportMode === 'mobile' ? 'bg-[#E04F16] text-white shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Mobile view (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Preview & Publishing Actions */}
      <div className="flex items-center gap-2">
        {/* Preview Actions Group */}
        <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-0.5">
          {/* Toggle In-Editor Canvas Preview */}
          <button
            onClick={onTogglePreview}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isPreviewMode
                ? 'bg-white text-[#141414] shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title={isPreviewMode ? 'Exit preview mode' : 'Preview clean layout in canvas'}
          >
            {isPreviewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isPreviewMode ? 'Editor View' : 'Preview'}</span>
          </button>

          {/* Open Real Storefront Preview */}
          {onOpenStorefrontPreview && (
            <button
              onClick={onOpenStorefrontPreview}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors border-l border-white/10 ml-0.5"
              title="Open real storefront preview with device frames"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Save Draft Action */}
        <button
          onClick={() => onSave('draft')}
          disabled={isSaving}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors bg-white/10 text-white hover:bg-white/20 border border-white/15 disabled:opacity-50"
          title="Save working draft without altering live storefront"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Save Draft</span>
        </button>

        {/* Primary Action Button (Publish or Update Published Page) with Options Dropdown */}
        <div className="relative">
          <div className="flex items-center rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => onSave('publish')}
              disabled={isSaving}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              title={isPublished ? 'Deploy latest draft changes to live storefront' : 'Publish page to live storefront'}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isSaving
                  ? 'Saving...'
                  : isPublished
                  ? 'Update Published Page'
                  : 'Publish'}
              </span>
            </button>
            <button
              onClick={() => setShowSaveDropdown(!showSaveDropdown)}
              disabled={isSaving}
              className="px-2 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs border-l border-white/20 transition-colors"
              title="More publishing options"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {showSaveDropdown && (
            <div className="absolute right-0 mt-1.5 w-56 bg-[#1E1E1E] text-white rounded-xl shadow-2xl border border-white/10 py-1.5 z-50 text-xs animate-fade-in divide-y divide-white/10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowSaveDropdown(false);
                    onSave('draft');
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Save as Draft</div>
                    <div className="text-[10px] text-white/50">Keep current changes private</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowSaveDropdown(false);
                    onSave('publish');
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center gap-2 text-emerald-400 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold">
                      {isPublished ? 'Update Live Page' : 'Publish to Live Store'}
                    </div>
                    <div className="text-[10px] text-emerald-300/70">
                      Make visible to international shoppers
                    </div>
                  </div>
                </button>
              </div>

              {onOpenStorefrontPreview && (
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowSaveDropdown(false);
                      onOpenStorefrontPreview();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center gap-2 text-white/90 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <div>
                      <div className="font-semibold">Storefront Preview</div>
                      <div className="text-[10px] text-white/50">Preview in actual store chrome</div>
                    </div>
                  </button>
                </div>
              )}

              {isPublished && (
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowSaveDropdown(false);
                      onSave('unpublish');
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-amber-500/10 flex items-center gap-2 text-amber-400 transition-colors"
                  >
                    <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-semibold">Unpublish Page</div>
                      <div className="text-[10px] text-amber-300/70">Revert to Draft; remove from storefront</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
