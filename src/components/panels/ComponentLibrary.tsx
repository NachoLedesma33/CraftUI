import React, { useState, useCallback, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  Search,
  Square,
  Type,
  MousePointer2,
  Image,
  Columns,
  LayoutGrid,
  AlignJustify,
  ChevronDown,
  ChevronRight,
  Box,
} from 'lucide-react';
import { componentBlueprints, type ComponentBlueprint } from '@/constants/componentBlueprints';
import type { ComponentType } from '@/types/canvas';

const componentIcons: Record<ComponentType, React.ReactNode> = {
  box: <Square size={16} />,
  text: <Type size={16} />,
  button: <MousePointer2 size={16} />,
  image: <Image size={16} />,
  container: <AlignJustify size={16} />,
  flex: <Columns size={16} />,
  grid: <LayoutGrid size={16} />,
};

interface DraggableItemProps {
  blueprint: ComponentBlueprint;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ blueprint }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${blueprint.type}`,
    data: {
      type: 'new',
      componentType: blueprint.type,
      blueprint,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-3 p-3 rounded-lg cursor-grab active:cursor-grabbing
        bg-slate-700/50 hover:bg-slate-700 border border-slate-600
        transition-all duration-150
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
      title={blueprint.description}
    >
      <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center
        ${blueprint.category === 'layout' ? 'bg-purple-500/20 text-purple-400' :
          blueprint.category === 'media' ? 'bg-green-500/20 text-green-400' :
          'bg-blue-500/20 text-blue-400'}
      `}>
        {componentIcons[blueprint.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">
          {blueprint.label}
        </div>
        <div className="text-xs text-slate-400 truncate">
          {blueprint.description}
        </div>
      </div>
    </div>
  );
};

interface CategorySectionProps {
  category: { id: string; label: string; icon: string };
  blueprints: ComponentBlueprint[];
  isExpanded: boolean;
  onToggle: () => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  blueprints,
  isExpanded,
  onToggle,
}) => {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full px-2 py-2 text-xs font-medium text-slate-400 hover:text-white"
      >
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>{category.icon}</span>
        <span>{category.label}</span>
        <span className="ml-auto text-slate-500">({blueprints.length})</span>
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {blueprints.map((bp) => (
            <DraggableItem key={bp.type} blueprint={bp} />
          ))}
        </div>
      )}
    </div>
  );
};

const TemplatesSection: React.FC = () => {
  return (
    <div className="mt-6 pt-4 border-t border-slate-700">
      <div className="px-2 py-2 text-xs font-medium text-slate-400">
        My Components
      </div>
      <div className="mt-2 p-4 border border-dashed border-slate-600 rounded-lg text-center">
        <Box size={24} className="mx-auto text-slate-500 mb-2" />
        <p className="text-xs text-slate-500">Coming Soon</p>
        <p className="text-xs text-slate-600 mt-1">
          Save your own component templates
        </p>
      </div>
    </div>
  );
};

export const ComponentLibrary: React.FC = () => {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['layout', 'basic', 'media'])
  );

  const filteredBlueprints = useMemo(() => {
    if (!search.trim()) return componentBlueprints;
    
    const query = search.toLowerCase();
    return componentBlueprints.filter(
      (bp) =>
        bp.label.toLowerCase().includes(query) ||
        bp.description.toLowerCase().includes(query) ||
        bp.category.toLowerCase().includes(query)
    );
  }, [search]);

  const blueprintsByCategory = useMemo(() => {
    const grouped: Record<string, ComponentBlueprint[]> = {
      layout: [],
      basic: [],
      media: [],
      form: [],
    };
    
    filteredBlueprints.forEach((bp) => {
      if (grouped[bp.category]) {
        grouped[bp.category].push(bp);
      }
    });
    
    return grouped;
  }, [filteredBlueprints]);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const categories = [
    { id: 'layout', label: 'Layout', icon: '▦' },
    { id: 'basic', label: 'Basic', icon: '□' },
    { id: 'media', label: 'Media', icon: '◎' },
    { id: 'form', label: 'Form', icon: '▢' },
  ];

  return (
    <div className="flex flex-col bg-slate-800 h-full w-full">
      <div className="p-3 border-b border-slate-700">
        <h3 className="text-sm font-medium text-white mb-3">Components</h3>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {search ? (
          <div className="space-y-2">
            {filteredBlueprints.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">
                No components found
              </p>
            ) : (
              filteredBlueprints.map((bp) => (
                <DraggableItem key={bp.type} blueprint={bp} />
              ))
            )}
          </div>
        ) : (
          <>
            {categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                blueprints={blueprintsByCategory[category.id]}
                isExpanded={expandedCategories.has(category.id)}
                onToggle={() => toggleCategory(category.id)}
              />
            ))}
            <TemplatesSection />
          </>
        )}
      </div>

      <div className="p-3 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">
          Drag components to canvas
        </p>
      </div>
    </div>
  );
};