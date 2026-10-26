import React, { useState, useRef, useEffect } from 'react';
import { AUDIT_SECTIONS } from '../types/audit';
import { ChevronDown, X, Check, Sparkles } from 'lucide-react';

interface SectionMultiSelectProps {
  value: string; // Comma-separated sections, e.g. "Báo cáo, IFRS" or "F tiền, Q"
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

  const selectAll = () => {
    onChange(Array.from(AUDIT_SECTIONS).join(', '));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[38px] w-full px-2.5 py-1.5 bg-white hover:bg-orange-50/30 border border-slate-300 hover:border-orange-500 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 rounded-xl cursor-pointer flex items-center justify-between gap-1.5 transition-all shadow-xs"
      >
        <div className="flex flex-wrap items-center gap-1 max-w-[calc(100%-24px)]">
          {selectedSections.length === 0 ? (
            <span className="text-xs text-slate-400 select-none pl-1 italic">{placeholder}</span>
          ) : (
            selectedSections.map((sec) => (
              <span
                key={sec}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-200 shadow-2xs"
              >
                <span>{sec}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => removeSection(e, sec)}
                  className="hover:text-red-600 rounded cursor-pointer transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </span>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          {selectedSections.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              title="Xóa tất cả phần hành đã chọn"
              className="p-0.5 hover:text-orange-600 rounded text-[10px] cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-500 ${
              isOpen ? 'rotate-180 text-orange-600' : ''
            }`}
          />
        </div>
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-80 sm:w-96 bg-white border border-orange-300 rounded-2xl shadow-2xl p-3.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-orange-100">
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              🎃 Chọn Phần Hành ({selectedSections.length}/{AUDIT_SECTIONS.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-[11px] text-orange-600 hover:text-orange-700 hover:underline font-extrabold cursor-pointer"
              >
                + Chọn hết
              </button>
              {selectedSections.length > 0 && (
                <>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[11px] text-slate-500 hover:text-red-600 hover:underline font-bold cursor-pointer"
                  >
                    Bỏ chọn hết
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Select Buttons including + Tất cả button */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              type="button"
              onClick={selectAll}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-extrabold transition-colors cursor-pointer shadow-xs"
            >
              + Tất cả ({AUDIT_SECTIONS.length})
            </button>
            <button
              type="button"
              onClick={() => selectGroup(['Báo cáo', 'IFRS'])}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold transition-colors cursor-pointer"
            >
              + Báo cáo, IFRS
            </button>
            <button
              type="button"
              onClick={() => selectGroup(['A', 'B', 'C', 'D'])}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition-colors cursor-pointer"
            >
              + A, B, C, D
            </button>
            <button
              type="button"
              onClick={() => selectGroup(['F tiền', 'F vay'])}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition-colors cursor-pointer"
            >
              + F tiền, F vay
            </button>
            <button
              type="button"
              onClick={() => selectGroup(['Q', 'P', 'R'])}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition-colors cursor-pointer"
            >
              + Q, P, R
            </button>
            <button
              type="button"
              onClick={() => selectGroup(['Khác'])}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition-colors cursor-pointer"
            >
              + Khác
            </button>
          </div>

          {/* Grid of Sections - Uniform clean styling, F tien, F vay, Q have SAME color */}
          <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {AUDIT_SECTIONS.map((sec) => {
              const isSelected = selectedSections.includes(sec);
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => toggleSection(sec)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-sm shadow-orange-500/30'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <span className="truncate">{sec}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 ml-1 text-white" />}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-orange-100 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 italic">Có thể chọn nhiều phần hành</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Đồng ý
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
