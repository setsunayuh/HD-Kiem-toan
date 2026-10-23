import React, { useState, useRef, useEffect } from 'react';
import { AUDIT_SECTIONS } from '../types/audit';
import { ChevronDown, X, Check, Plus } from 'lucide-react';

interface SectionMultiSelectProps {
  value: string; // Comma-separated sections, e.g. "Báo cáo, IFRS" or "A, B, C"
  onChange: (newValue: string) => void;
  placeholder?: string;
}

export const SectionMultiSelect: React.FC<SectionMultiSelectProps> = ({
  value,
  onChange,
  placeholder = 'Chọn phần hành...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected list from comma-separated string
  const selectedSections = value
    ? value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSection = (sec: string) => {
    let updated: string[];
    if (selectedSections.includes(sec)) {
      updated = selectedSections.filter((s) => s !== sec);
    } else {
      updated = [...selectedSections, sec];
    }
    onChange(updated.join(', '));
  };

  const removeSection = (e: React.MouseEvent, sec: string) => {
    e.stopPropagation();
    const updated = selectedSections.filter((s) => s !== sec);
    onChange(updated.join(', '));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const selectGroup = (group: string[]) => {
    const combined = Array.from(new Set([...selectedSections, ...group]));
    onChange(combined.join(', '));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[36px] w-full px-2 py-1 bg-white border border-slate-300 hover:border-indigo-400 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 rounded-lg cursor-pointer flex items-center justify-between gap-1 transition-all"
      >
        <div className="flex flex-wrap items-center gap-1 max-w-[calc(100%-24px)]">
          {selectedSections.length === 0 ? (
            <span className="text-xs text-slate-400 select-none pl-1">{placeholder}</span>
          ) : (
            selectedSections.map((sec) => (
              <span
                key={sec}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs"
              >
                <span>{sec}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => removeSection(e, sec)}
                  className="hover:text-red-600 rounded cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </span>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-0.5 text-slate-400">
          {selectedSections.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              title="Xóa tất cả phần hành đã chọn"
              className="p-0.5 hover:text-slate-600 rounded text-[10px]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chọn các phần hành ({selectedSections.length} đã chọn)
            </span>
            {selectedSections.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] text-red-600 hover:underline font-medium"
              >
                Bỏ chọn hết
              </button>
            )}
          </div>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-1 mb-2.5">
            <button
              type="button"
              onClick={() => selectGroup(['Báo cáo', 'IFRS'])}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              + Báo cáo, IFRS
            </button>
            <button
              type="button"
              onClick={() => selectGroup(['A', 'B', 'C', 'D'])}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              + A, B, C, D
            </button>
            <button
              type="button"
              onClick={() => selectGroup(['E', 'F', 'G', 'H'])}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              + E, F, G, H
            </button>
          </div>

          {/* Grid of Sections */}
          <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {AUDIT_SECTIONS.map((sec) => {
              const isSelected = selectedSections.includes(sec);
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => toggleSection(sec)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200'
                  }`}
                >
                  <span className="truncate">{sec}</span>
                  {isSelected && <Check className="w-3 h-3 flex-shrink-0 ml-1 text-white" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
