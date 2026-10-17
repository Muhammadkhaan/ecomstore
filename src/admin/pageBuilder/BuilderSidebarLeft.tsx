import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Eye,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Copy,
  Edit2,
  Check,
  X,
  GripVertical,
  Box,
  Columns as ColumnsIcon
} from 'lucide-react';
import { PageBuilderSection, PageBuilderSectionType, PageBuilderBlock } from '../../types/pageBuilder.ts';
import { BUILDER_ELEMENTS, ELEMENT_CATEGORIES, createSectionInstance, createBlockInstance } from './builderElements.ts';

interface BuilderSidebarLeftProps {
  sections: PageBuilderSection[];
  selectedElementId: string | null;
  selectedBlockId?: string | null;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelectElement: (sectionId: string | null, blockId?: string | null) => void;
  onAddSection: (newSection: PageBuilderSection, atIndex?: number) => void;
  onToggleSectionVisibility: (id: string) => void;
  onToggleBlockVisibility?: (sectionId: string, blockId: string) => void;
  onDeleteSection: (id: string) => void;
  onDeleteBlock?: (sectionId: string, blockId: string) => void;
  onDuplicateSection?: (id: string) => void;
  onDuplicateBlock?: (sectionId: string, blockId: string) => void;
  onMoveSection: (id: string, direction: 'up' | 'down') => void;
  onReorderSections?: (fromIndex: number, toIndex: number) => void;
  onRenameSection?: (id: string, newTitle: string) => void;
  onRenameBlock?: (sectionId: string, blockId: string, newTitle: string) => void;
  onAddBlockToContainer?: (sectionId: string, blockType: string) => void;
}

export const BuilderSidebarLeft: React.FC<BuilderSidebarLeftProps> = ({
  sections,
  selectedElementId,
  selectedBlockId,
  isOpen,
  onToggleOpen,
  onSelectElement,
  onAddSection,
  onToggleSectionVisibility,
  onToggleBlockVisibility,
  onDeleteSection,
  onDeleteBlock,
  onDuplicateSection,
  onDuplicateBlock,
  onMoveSection,
  onReorderSections,
  onRenameSection,
  onRenameBlock,
  onAddBlockToContainer
}) => {
  const [activeTab, setActiveTab] = useState<'elements' | 'layers'>('elements');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Collapsible hierarchy in layers
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Inline renaming state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Drag-and-drop state in layers
  const [draggedLayerIndex, setDraggedLayerIndex] = useState<number | null>(null);
  const [dragOverLayerIndex, setDragOverLayerIndex] = useState<number | null>(null);

  const toggleExpand = (secId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSections((prev) => ({
      ...prev,
      [secId]: prev[secId] === undefined ? false : !prev[secId] // Default open
    }));
  };

  const isSectionExpanded = (secId: string) => {
    return expandedSections[secId] !== false; // default true
  };

  const startRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItemId(id);
    setEditingTitle(currentTitle);
  };

  const saveRename = (secId: string, blockId?: string) => {
    if (!editingTitle.trim()) {
      setEditingItemId(null);
      return;
    }
    if (blockId && onRenameBlock) {
      onRenameBlock(secId, blockId, editingTitle.trim());
    } else if (onRenameSection) {
      onRenameSection(secId, editingTitle.trim());
    }
    setEditingItemId(null);
  };

  const cancelRename = () => {
    setEditingItemId(null);
  };

  const filteredElements = BUILDER_ELEMENTS.filter((el) => {
    const matchesSearch =
      el.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || el.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  if (!isOpen) {
    return (
      <div className="w-12 bg-white border-r border-[#E5E5E5] flex flex-col items-center py-3 shrink-0 shadow-sm z-20">
        <button
          onClick={onToggleOpen}
          className="p-2 rounded-xl text-[#737373] hover:text-[#141414] hover:bg-neutral-100 transition-colors"
          title="Expand elements & layers panel"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="h-4 w-px bg-neutral-200 my-2" />
        <button
          onClick={() => {
            onToggleOpen();
            setActiveTab('elements');
          }}
          className={`p-2 rounded-xl transition-colors ${
            activeTab === 'elements' ? 'bg-[#141414] text-white' : 'text-[#737373] hover:bg-neutral-100'
          }`}
          title="Elements"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            onToggleOpen();
            setActiveTab('layers');
          }}
          className={`p-2 rounded-xl mt-1 transition-colors ${
            activeTab === 'layers' ? 'bg-[#141414] text-white' : 'text-[#737373] hover:bg-neutral-100'
          }`}
          title="Layers"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-80 bg-white border-r border-[#E5E5E5] flex flex-col shrink-0 overflow-hidden shadow-sm z-20">
      {/* Top Header & Tabs */}
      <div className="border-b border-[#E5E5E5] bg-[#FAF9F6] px-4 pt-3 pb-0 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('elements')}
            className={`pb-2.5 px-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'elements'
                ? 'border-[#141414] text-[#141414]'
                : 'border-transparent text-[#737373] hover:text-[#141414]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Elements</span>
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`pb-2.5 px-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'layers'
                ? 'border-[#141414] text-[#141414]'
                : 'border-transparent text-[#737373] hover:text-[#141414]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layers ({sections.length})</span>
          </button>
        </div>

        <button
          onClick={onToggleOpen}
          className="p-1 rounded-lg text-[#737373] hover:text-[#141414] hover:bg-neutral-200 transition-colors mb-2"
          title="Collapse panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Tab: Elements */}
      {activeTab === 'elements' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Categories */}
          <div className="p-3 border-b border-[#E5E5E5] space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search elements..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl text-xs focus:outline-none focus:border-[#141414]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#141414] text-white'
                    : 'bg-neutral-100 text-[#737373] hover:bg-neutral-200'
                }`}
              >
                All
              </button>
              {ELEMENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-[#141414] text-white'
                      : 'bg-neutral-100 text-[#737373] hover:bg-neutral-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="text-[10px] text-[#737373] flex items-center gap-1.5 bg-neutral-100 px-2 py-1 rounded-lg">
              <GripVertical className="w-3 h-3 text-[#E04F16]" />
              <span>Tip: Click to insert, or drag directly onto the canvas.</span>
            </div>
          </div>

          {/* Elements List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredElements.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#737373]">
                No elements match &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredElements.map((el) => {
                const Icon = el.icon;
                return (
                  <div
                    key={el.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/laam-element-type', el.type);
                      e.dataTransfer.setData('text/plain', el.type);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onClick={() => {
                      const newSec = createSectionInstance(el.type);
                      onAddSection(newSec);
                    }}
                    className="w-full p-2.5 bg-[#FAF9F6] hover:bg-[#F2EFE9] border border-[#E5E5E5] hover:border-[#141414]/40 rounded-xl flex items-start gap-3 transition-all text-left group cursor-grab active:cursor-grabbing shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center shrink-0 group-hover:bg-[#141414] group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4 text-[#141414] group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#141414] group-hover:text-[#E04F16] transition-colors">
                          {el.label}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-[#737373] bg-white px-1.5 py-0.5 rounded border border-[#E5E5E5]">
                          {el.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#737373] leading-snug line-clamp-1 mt-0.5">
                        {el.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab: Layers */}
      {activeTab === 'layers' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#E5E5E5] bg-neutral-50/50 flex items-center justify-between text-xs text-[#737373]">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Page Element Hierarchy</span>
            <span className="text-[11px]">{sections.length} sections</span>
          </div>

          <div
            className="flex-1 overflow-y-auto p-2 space-y-1.5"
            onDragOver={(e) => e.preventDefault()}
          >
            {sections.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#737373] space-y-2">
                <LayoutGrid className="w-8 h-8 mx-auto text-neutral-300" />
                <p>No sections on this page yet.</p>
                <button
                  onClick={() => setActiveTab('elements')}
                  className="px-3 py-1.5 bg-[#141414] text-white rounded-lg text-xs font-semibold"
                >
                  Add an Element
                </button>
              </div>
            ) : (
              sections.map((sec, idx) => {
                const isSelected = selectedElementId === sec.id && !selectedBlockId;
                const def = BUILDER_ELEMENTS.find((e) => e.type === sec.type);
                const Icon = def ? def.icon : Layers;
                const isHidden = Boolean(sec.disabled);
                const hasBlocks = Array.isArray(sec.blocks) && sec.blocks.length > 0;
                const expanded = isSectionExpanded(sec.id);
                const isEditing = editingItemId === sec.id;
                const isDropTarget = dragOverLayerIndex === idx;

                return (
                  <div key={sec.id} className="space-y-1">
                    {/* Drop Indicator Bar above layer if dragging */}
                    {isDropTarget && draggedLayerIndex !== null && draggedLayerIndex !== idx && (
                      <div className="h-1 bg-[#E04F16] rounded-full mx-1 animate-pulse" />
                    )}

                    {/* Section Layer Item */}
                    <div
                      draggable
                      onDragStart={(e) => {
                        setDraggedLayerIndex(idx);
                        e.dataTransfer.setData('application/laam-layer-index', String(idx));
                        e.dataTransfer.setData('application/laam-section-id', sec.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverLayerIndex !== idx) setDragOverLayerIndex(idx);
                      }}
                      onDragLeave={() => {
                        if (dragOverLayerIndex === idx) setDragOverLayerIndex(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverLayerIndex(null);
                        const fromIdxStr = e.dataTransfer.getData('application/laam-layer-index');
                        if (fromIdxStr !== '') {
                          const fromIdx = Number(fromIdxStr);
                          if (fromIdx !== idx && onReorderSections) {
                            onReorderSections(fromIdx, idx);
                          }
                        }
                        setDraggedLayerIndex(null);
                      }}
                      onClick={() => onSelectElement(sec.id, null)}
                      className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-1.5 cursor-pointer transition-all group select-none ${
                        isSelected
                          ? 'bg-[#141414] text-white border-[#141414] shadow-sm'
                          : isHidden
                          ? 'bg-neutral-50 border-neutral-200 text-neutral-400 opacity-60'
                          : 'bg-[#FAF9F6] border-[#E5E5E5] text-[#141414] hover:bg-neutral-100'
                      }`}
                    >
                      {/* Left side: Expand toggle + Drag Handle + Icon + Title */}
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {/* Drag Handle */}
                        <div
                          className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-700 p-0.5"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>

                        {/* Expand toggle for containers */}
                        {hasBlocks ? (
                          <button
                            onClick={(e) => toggleExpand(sec.id, e)}
                            className="p-0.5 rounded hover:bg-black/10 transition-colors"
                            title={expanded ? 'Collapse' : 'Expand'}
                          >
                            {expanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ) : (
                          <div className="w-3.5" />
                        )}

                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#141414] border border-[#E5E5E5]'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                        </div>

                        {/* Title or Inline Edit */}
                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveRename(sec.id);
                                  if (e.key === 'Escape') cancelRename();
                                }}
                                autoFocus
                                className="w-full text-xs px-1.5 py-0.5 rounded border border-[#141414] text-[#141414] bg-white font-semibold"
                              />
                              <button
                                onClick={() => saveRename(sec.id)}
                                className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={cancelRename}
                                className="p-0.5 text-neutral-400 hover:bg-neutral-100 rounded"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onDoubleClick={(e) => startRename(sec.id, sec.title || def?.label || sec.type, e)}
                              className="font-bold text-xs truncate flex items-center gap-1.5"
                            >
                              <span className="truncate">{sec.title || def?.label || sec.type}</span>
                              {hasBlocks && (
                                <span className={`text-[9px] px-1 rounded ${isSelected ? 'bg-white/20' : 'bg-neutral-200'}`}>
                                  {sec.blocks!.length}
                                </span>
                              )}
                            </div>
                          )}
                          {!isEditing && (
                            <div
                              className={`text-[10px] font-mono truncate ${
                                isSelected ? 'text-white/60' : 'text-[#737373]'
                              }`}
                            >
                              {sec.type}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side: Actions (Rename, Duplicate, Up, Down, Visibility, Delete) */}
                      {!isEditing && (
                        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {/* Rename */}
                          <button
                            onClick={(e) => startRename(sec.id, sec.title || def?.label || sec.type, e)}
                            className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                              isSelected ? 'text-white/80 hover:text-white' : 'text-[#737373] hover:text-[#141414]'
                            }`}
                            title="Rename Layer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>

                          {/* Duplicate */}
                          {onDuplicateSection && (
                            <button
                              onClick={() => onDuplicateSection(sec.id)}
                              className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                                isSelected ? 'text-white/80 hover:text-white' : 'text-[#737373] hover:text-[#141414]'
                              }`}
                              title="Duplicate Section"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}

                          {/* Move Up */}
                          <button
                            onClick={() => onMoveSection(sec.id, 'up')}
                            disabled={idx === 0}
                            className={`p-1 rounded transition-colors ${
                              isSelected
                                ? 'text-white/60 hover:text-white disabled:opacity-20'
                                : 'text-[#737373] hover:text-[#141414] disabled:opacity-20'
                            }`}
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>

                          {/* Move Down */}
                          <button
                            onClick={() => onMoveSection(sec.id, 'down')}
                            disabled={idx === sections.length - 1}
                            className={`p-1 rounded transition-colors ${
                              isSelected
                                ? 'text-white/60 hover:text-white disabled:opacity-20'
                                : 'text-[#737373] hover:text-[#141414] disabled:opacity-20'
                            }`}
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>

                          {/* Visibility Toggle */}
                          <button
                            onClick={() => onToggleSectionVisibility(sec.id)}
                            className={`p-1 rounded transition-colors ${
                              isSelected ? 'text-white/80 hover:text-white' : 'text-[#737373] hover:text-[#141414]'
                            }`}
                            title={isHidden ? 'Show Section' : 'Hide Section'}
                          >
                            {isHidden ? <EyeOff className="w-3 h-3 text-amber-500" /> : <Eye className="w-3 h-3" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteSection(sec.id)}
                            className={`p-1 rounded transition-colors ${
                              isSelected ? 'text-red-300 hover:text-red-100' : 'text-[#737373] hover:text-red-600'
                            }`}
                            title="Delete Section"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Nested Blocks List (if container / columns and expanded) */}
                    {hasBlocks && expanded && (
                      <div className="pl-6 pr-1 space-y-1 border-l-2 border-neutral-200 ml-4 py-1">
                        {sec.blocks!.map((blk) => {
                          const isBlockSelected = selectedElementId === sec.id && selectedBlockId === blk.id;
                          const blkDef = BUILDER_ELEMENTS.find((e) => e.type === blk.type);
                          const BlkIcon = blkDef ? blkDef.icon : Box;
                          const isBlkHidden = Boolean(blk.disabled);
                          const isBlkEditing = editingItemId === blk.id;

                          return (
                            <div
                              key={blk.id}
                              onClick={() => onSelectElement(sec.id, blk.id)}
                              className={`p-1.5 rounded-lg border text-xs flex items-center justify-between gap-1.5 cursor-pointer transition-all group ${
                                isBlockSelected
                                  ? 'bg-[#E04F16] text-white border-[#E04F16] shadow-sm'
                                  : isBlkHidden
                                  ? 'bg-neutral-50 border-neutral-200 text-neutral-400 opacity-60'
                                  : 'bg-white border-[#E5E5E5] text-[#141414] hover:bg-neutral-50'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <BlkIcon className="w-3 h-3 shrink-0" />
                                {isBlkEditing ? (
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="text"
                                      value={editingTitle}
                                      onChange={(e) => setEditingTitle(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveRename(sec.id, blk.id);
                                        if (e.key === 'Escape') cancelRename();
                                      }}
                                      autoFocus
                                      className="w-full text-xs px-1 py-0.5 rounded border border-[#141414] text-[#141414] bg-white font-semibold"
                                    />
                                    <button
                                      onClick={() => saveRename(sec.id, blk.id)}
                                      className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    onDoubleClick={(e) => startRename(blk.id, blk.title || blkDef?.label || blk.type, e)}
                                    className="truncate text-[11px] font-semibold"
                                  >
                                    {blk.title || blkDef?.label || blk.type}
                                  </div>
                                )}
                              </div>

                              {/* Block Actions */}
                              {!isBlkEditing && (
                                <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={(e) => startRename(blk.id, blk.title || blkDef?.label || blk.type, e)}
                                    className="p-0.5 text-neutral-400 hover:text-neutral-700 opacity-0 group-hover:opacity-100"
                                    title="Rename Block"
                                  >
                                    <Edit2 className="w-2.5 h-2.5" />
                                  </button>

                                  {onDuplicateBlock && (
                                    <button
                                      onClick={() => onDuplicateBlock(sec.id, blk.id)}
                                      className="p-0.5 text-neutral-400 hover:text-neutral-700 opacity-0 group-hover:opacity-100"
                                      title="Duplicate Block"
                                    >
                                      <Copy className="w-2.5 h-2.5" />
                                    </button>
                                  )}

                                  {onToggleBlockVisibility && (
                                    <button
                                      onClick={() => onToggleBlockVisibility(sec.id, blk.id)}
                                      className="p-0.5 text-neutral-400 hover:text-neutral-700"
                                      title={isBlkHidden ? 'Show Block' : 'Hide Block'}
                                    >
                                      {isBlkHidden ? <EyeOff className="w-2.5 h-2.5 text-amber-500" /> : <Eye className="w-2.5 h-2.5" />}
                                    </button>
                                  )}

                                  {onDeleteBlock && (
                                    <button
                                      onClick={() => onDeleteBlock(sec.id, blk.id)}
                                      className="p-0.5 text-neutral-400 hover:text-red-600"
                                      title="Delete Block"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Quick Add Block inside Container */}
                        {onAddBlockToContainer && (
                          <div className="flex items-center gap-1 pt-1">
                            <button
                              onClick={() => onAddBlockToContainer(sec.id, 'heading')}
                              className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded text-[10px] font-semibold flex items-center gap-1"
                            >
                              <Plus className="w-2.5 h-2.5" /> Heading
                            </button>
                            <button
                              onClick={() => onAddBlockToContainer(sec.id, 'text')}
                              className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded text-[10px] font-semibold flex items-center gap-1"
                            >
                              <Plus className="w-2.5 h-2.5" /> Text
                            </button>
                            <button
                              onClick={() => onAddBlockToContainer(sec.id, 'button')}
                              className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded text-[10px] font-semibold flex items-center gap-1"
                            >
                              <Plus className="w-2.5 h-2.5" /> Button
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
