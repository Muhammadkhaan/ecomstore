import React, { useEffect, useState, useCallback } from 'react';
import { StorePage, PageBuilderSection, PageBuilderBlock } from '../../types/pageBuilder.ts';
import { BuilderToolbar, ViewportMode } from '../pageBuilder/BuilderToolbar.tsx';
import { BuilderSidebarLeft } from '../pageBuilder/BuilderSidebarLeft.tsx';
import { BuilderCanvas } from '../pageBuilder/BuilderCanvas.tsx';
import { BuilderSidebarRight } from '../pageBuilder/BuilderSidebarRight.tsx';
import {
  createSectionInstance,
  createBlockInstance,
  duplicateSectionInstance,
  duplicateBlockInstance
} from '../pageBuilder/builderElements.ts';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface AdminPageBuilderPageProps {
  token: string;
  pageId: string;
  onNavigate: (path: string) => void;
}

export const AdminPageBuilderPage: React.FC<AdminPageBuilderPageProps> = ({
  token,
  pageId,
  onNavigate
}) => {
  const [page, setPage] = useState<StorePage | null>(null);
  const [sections, setSections] = useState<PageBuilderSection[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Editor states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

  // Undo / Redo history stacks
  const [undoStack, setUndoStack] = useState<PageBuilderSection[][]>([]);
  const [redoStack, setRedoStack] = useState<PageBuilderSection[][]>([]);

  // Feedback notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Fetch Real Page Data from Backend
  const loadPageData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/storefront/pages/${pageId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Page not found in database');
          throw new Error('Failed to load page data');
        }
        return res.json();
      })
      .then((data) => {
        const loadedPage: StorePage = data.page;
        setPage(loadedPage);
        const initialSections = loadedPage.builderContent?.sections || [];
        setSections(initialSections);
        setHasUnsavedChanges(false);
        setUndoStack([]);
        setRedoStack([]);
        if (initialSections.length > 0) {
          setSelectedElementId(initialSections[0].id);
          setSelectedBlockId(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [pageId, token]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  // Warn on browser unload if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Push state to undo stack before mutation
  const pushToUndo = (currentSections: PageBuilderSection[]) => {
    setUndoStack((prev) => [...prev.slice(-30), JSON.parse(JSON.stringify(currentSections))]);
    setRedoStack([]);
    setHasUnsavedChanges(true);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(sections))]);
    setUndoStack((prev) => prev.slice(0, -1));
    setSections(previous);
    setHasUnsavedChanges(true);
    showNotification('Undo applied');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(sections))]);
    setRedoStack((prev) => prev.slice(0, -1));
    setSections(next);
    setHasUnsavedChanges(true);
    showNotification('Redo applied');
  };

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, sections]);

  // --- SECTION MUTATIONS ---

  const handleAddSection = (newSection: PageBuilderSection, atIndex?: number) => {
    pushToUndo(sections);
    const updated = [...sections];
    if (typeof atIndex === 'number' && atIndex >= 0 && atIndex <= sections.length) {
      updated.splice(atIndex, 0, newSection);
    } else {
      updated.push(newSection);
    }
    setSections(updated);
    setSelectedElementId(newSection.id);
    setSelectedBlockId(null);
    showNotification(`Added ${newSection.title || newSection.type}`);
  };

  const handleReorderSections = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || fromIndex >= sections.length) return;
    if (toIndex < 0 || toIndex >= sections.length) return;

    pushToUndo(sections);
    const updated = [...sections];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setSections(updated);
    showNotification(`Reordered section "${moved.title || moved.type}"`);
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const idx = sections.findIndex((s) => s.id === sectionId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sections.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    handleReorderSections(idx, targetIdx);
  };

  const handleUpdateSection = (sectionId: string, updatedFields: Partial<PageBuilderSection>) => {
    pushToUndo(sections);
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            ...updatedFields,
            settings: updatedFields.settings ? { ...s.settings, ...updatedFields.settings } : s.settings
          };
        }
        return s;
      })
    );
  };

  const handleRenameSection = (sectionId: string, newTitle: string) => {
    handleUpdateSection(sectionId, { title: newTitle });
    showNotification(`Renamed section to "${newTitle}"`);
  };

  const handleToggleSectionVisibility = (sectionId: string) => {
    pushToUndo(sections);
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId) {
          const nextDisabled = !s.disabled;
          showNotification(nextDisabled ? `Hidden: ${s.title || s.type}` : `Revealed: ${s.title || s.type}`);
          return { ...s, disabled: nextDisabled };
        }
        return s;
      })
    );
  };

  const handleDuplicateSection = (sectionId: string) => {
    const target = sections.find((s) => s.id === sectionId);
    if (!target) return;

    pushToUndo(sections);
    const duplicated = duplicateSectionInstance(target);
    const targetIdx = sections.findIndex((s) => s.id === sectionId);
    const updated = [...sections];
    updated.splice(targetIdx + 1, 0, duplicated);

    setSections(updated);
    setSelectedElementId(duplicated.id);
    setSelectedBlockId(null);
    showNotification(`Duplicated ${target.title || target.type}`);
  };

  const handleDeleteSection = (sectionId: string) => {
    const target = sections.find((s) => s.id === sectionId);
    if (!target) return;

    if (Array.isArray(target.blocks) && target.blocks.length > 0) {
      if (!confirm(`Are you sure you want to delete "${target.title || target.type}" and its ${target.blocks.length} nested blocks?`)) {
        return;
      }
    }

    pushToUndo(sections);
    const updated = sections.filter((s) => s.id !== sectionId);
    setSections(updated);
    if (selectedElementId === sectionId) {
      setSelectedElementId(updated.length > 0 ? updated[0].id : null);
      setSelectedBlockId(null);
    }
    showNotification(`Deleted section: ${target.title || target.type}`);
  };

  // --- NESTED BLOCK MUTATIONS ---

  const handleAddBlockToContainer = (sectionId: string, blockType: string, atIndex?: number) => {
    const target = sections.find((s) => s.id === sectionId);
    if (!target) return;

    pushToUndo(sections);
    const newBlock = createBlockInstance(blockType);
    const currentBlocks = Array.isArray(target.blocks) ? [...target.blocks] : [];

    if (typeof atIndex === 'number' && atIndex >= 0 && atIndex <= currentBlocks.length) {
      currentBlocks.splice(atIndex, 0, newBlock);
    } else {
      currentBlocks.push(newBlock);
    }

    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, blocks: currentBlocks } : s))
    );

    setSelectedElementId(sectionId);
    setSelectedBlockId(newBlock.id);
    showNotification(`Added ${newBlock.title || blockType} to container`);
  };

  const handleUpdateBlock = (
    sectionId: string,
    blockId: string,
    updatedFields: Partial<PageBuilderBlock>
  ) => {
    pushToUndo(sections);
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId && Array.isArray(s.blocks)) {
          return {
            ...s,
            blocks: s.blocks.map((b) => {
              if (b.id === blockId) {
                return {
                  ...b,
                  ...updatedFields,
                  settings: updatedFields.settings ? { ...b.settings, ...updatedFields.settings } : b.settings
                };
              }
              return b;
            })
          };
        }
        return s;
      })
    );
  };

  const handleRenameBlock = (sectionId: string, blockId: string, newTitle: string) => {
    handleUpdateBlock(sectionId, blockId, { title: newTitle });
    showNotification(`Renamed block to "${newTitle}"`);
  };

  const handleToggleBlockVisibility = (sectionId: string, blockId: string) => {
    pushToUndo(sections);
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId && Array.isArray(s.blocks)) {
          return {
            ...s,
            blocks: s.blocks.map((b) => (b.id === blockId ? { ...b, disabled: !b.disabled } : b))
          };
        }
        return s;
      })
    );
  };

  const handleDuplicateBlock = (sectionId: string, blockId: string) => {
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec || !Array.isArray(sec.blocks)) return;
    const blk = sec.blocks.find((b) => b.id === blockId);
    if (!blk) return;

    pushToUndo(sections);
    const duplicated = duplicateBlockInstance(blk);
    const blkIdx = sec.blocks.findIndex((b) => b.id === blockId);
    const updatedBlocks = [...sec.blocks];
    updatedBlocks.splice(blkIdx + 1, 0, duplicated);

    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, blocks: updatedBlocks } : s))
    );

    setSelectedElementId(sectionId);
    setSelectedBlockId(duplicated.id);
    showNotification(`Duplicated ${blk.title || blk.type}`);
  };

  const handleDeleteBlock = (sectionId: string, blockId: string) => {
    pushToUndo(sections);
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId && Array.isArray(s.blocks)) {
          return {
            ...s,
            blocks: s.blocks.filter((b) => b.id !== blockId)
          };
        }
        return s;
      })
    );
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
    showNotification('Removed block');
  };

  // --- SELECTION DISPATCH ---

  const handleSelect = (sectionId: string | null, blockId: string | null = null) => {
    setSelectedElementId(sectionId);
    setSelectedBlockId(blockId);
  };

  // Page Meta Update
  const handleUpdatePageMeta = (field: string, value: any) => {
    if (!page) return;
    setPage((prev) => (prev ? { ...prev, [field]: value } : prev));
    setHasUnsavedChanges(true);
  };

  // Back to Pages with confirmation
  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (
        !confirm(
          'You have unsaved changes in this page builder session. Are you sure you want to leave without saving?'
        )
      ) {
        return;
      }
    }
    onNavigate('/admin/pages');
  };

  // Save changes to backend
  const handleSave = async (actionOverride?: 'draft' | 'publish') => {
    if (!page) return;
    setIsSaving(true);

    const finalStatus =
      actionOverride === 'publish'
        ? 'Published'
        : actionOverride === 'draft'
        ? 'Draft'
        : page.status;

    const payload = {
      title: page.title,
      handle: page.handle,
      type: page.type,
      status: finalStatus,
      action: actionOverride,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      builderContent: {
        schemaVersion: 1,
        sections,
        globalStyles: page.builderContent?.globalStyles || {
          maxWidth: '1280px',
          paddingY: '48px',
          backgroundColor: '#FAF9F6'
        }
      },
      expectedVersion: page.version,
      changeSummary:
        actionOverride === 'publish'
          ? `Published v${page.version + 1} with ${sections.length} sections from Visual Builder`
          : `Saved draft v${page.version + 1} with ${sections.length} sections from Visual Builder`
    };

    try {
      const res = await fetch(`/api/admin/storefront/pages/${page.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to save page');
      }

      setPage(data.page);
      setHasUnsavedChanges(false);
      showNotification(
        actionOverride === 'publish'
          ? `Page published live to storefront! (v${data.page.version})`
          : `Page changes saved successfully! (v${data.page.version})`
      );
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FAF9F6] gap-3">
        <div className="w-8 h-8 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-widest uppercase text-[#737373]">
          Loading Visual Page Builder...
        </span>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FAF9F6] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-serif text-[#141414]">Unable to load Page Builder</h2>
        <p className="text-xs text-[#737373] max-w-md">{error || 'Page record was not found in the database.'}</p>
        <button
          onClick={() => onNavigate('/admin/pages')}
          className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Pages</span>
        </button>
      </div>
    );
  }

  const selectedElement = sections.find((s) => s.id === selectedElementId) || null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#E8E8E8] text-[#141414] font-sans">
      {/* 1. Top Fixed Toolbar */}
      <BuilderToolbar
        pageTitle={page.title}
        pageStatus={page.status}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        viewportMode={viewportMode}
        isPreviewMode={isPreviewMode}
        onBack={handleBack}
        onTitleChange={(newTitle) => handleUpdatePageMeta('title', newTitle)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onViewportChange={setViewportMode}
        onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
        onSave={handleSave}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold animate-fade-in flex items-center gap-2 border ${
            notification.type === 'error'
              ? 'bg-red-600 text-white border-red-700'
              : 'bg-[#141414] text-white border-white/20'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* 2. Workspace Body (Left Sidebar + Center Canvas + Right Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Elements & Layers) */}
        {!isPreviewMode && (
          <BuilderSidebarLeft
            sections={sections}
            selectedElementId={selectedElementId}
            selectedBlockId={selectedBlockId}
            isOpen={isLeftOpen}
            onToggleOpen={() => setIsLeftOpen(!isLeftOpen)}
            onSelectElement={handleSelect}
            onAddSection={handleAddSection}
            onToggleSectionVisibility={handleToggleSectionVisibility}
            onToggleBlockVisibility={handleToggleBlockVisibility}
            onDeleteSection={handleDeleteSection}
            onDeleteBlock={handleDeleteBlock}
            onDuplicateSection={handleDuplicateSection}
            onDuplicateBlock={handleDuplicateBlock}
            onMoveSection={handleMoveSection}
            onReorderSections={handleReorderSections}
            onRenameSection={handleRenameSection}
            onRenameBlock={handleRenameBlock}
            onAddBlockToContainer={handleAddBlockToContainer}
          />
        )}

        {/* Center Interactive Canvas */}
        <BuilderCanvas
          sections={sections}
          selectedElementId={selectedElementId}
          selectedBlockId={selectedBlockId}
          viewportMode={viewportMode}
          isPreviewMode={isPreviewMode}
          onSelectElement={handleSelect}
          onDeleteElement={handleDeleteSection}
          onDeleteBlock={handleDeleteBlock}
          onDuplicateElement={handleDuplicateSection}
          onDuplicateBlock={handleDuplicateBlock}
          onToggleSectionVisibility={handleToggleSectionVisibility}
          onToggleBlockVisibility={handleToggleBlockVisibility}
          onMoveSection={handleMoveSection}
          onReorderSections={handleReorderSections}
          onAddSection={handleAddSection}
          onAddBlockToContainer={handleAddBlockToContainer}
          onAddFirstSection={() => handleAddSection(createSectionInstance('hero'))}
        />

        {/* Right Sidebar (Properties & Settings) */}
        {!isPreviewMode && (
          <BuilderSidebarRight
            token={token || ''}
            page={page}
            selectedElement={selectedElement}
            selectedBlockId={selectedBlockId}
            isOpen={isRightOpen}
            onToggleOpen={() => setIsRightOpen(!isRightOpen)}
            onUpdatePageMeta={handleUpdatePageMeta}
            onUpdateSection={handleUpdateSection}
            onUpdateBlock={handleUpdateBlock}
            onDeleteSection={handleDeleteSection}
            onDeleteBlock={handleDeleteBlock}
            onDuplicateSection={handleDuplicateSection}
            onDuplicateBlock={handleDuplicateBlock}
            onSelectBlock={(secId, blkId) => handleSelect(secId, blkId)}
            onAddBlockToContainer={handleAddBlockToContainer}
            onDeselect={() => handleSelect(null, null)}
          />
        )}
      </div>
    </div>
  );
};
