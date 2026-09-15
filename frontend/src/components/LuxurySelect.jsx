import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * LuxurySelect — Architectural Champagne & Obsidian Custom Select Dropdown
 * Replaces crude native browser <select> with a luxury animated dropdown.
 */
export default function LuxurySelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  icon: Icon,
  className = '',
  dropdownClassName = '',
  disabled = false,
  size = 'md'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options to [{ value, label, icon, badge }]
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value,
        label: opt.label !== undefined ? opt.label : String(opt.value),
        icon: opt.icon,
        badge: opt.badge
      };
    }
    return {
      value: opt,
      label: String(opt),
      icon: null,
      badge: null
    };
  });

  // Find currently selected option
  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optValue) => {
    if (disabled) return;
    if (typeof onChange === 'function') {
      onChange({ target: { value: optValue } });
    }
    setIsOpen(false);
  };

  // Size variations
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs rounded-xl',
    md: 'px-3 py-2 text-xs sm:text-sm rounded-xl',
    lg: 'px-4 py-2.5 text-sm rounded-2xl'
  };

  const SelectedIcon = selectedOption?.icon;

  return (
    <div ref={dropdownRef} className={`relative inline-block w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 text-left bg-[#F7F6F2] dark:bg-[#252525] border transition-all duration-200 outline-none select-none ${
          isOpen
            ? 'border-[#C8A96B] ring-2 ring-[#C8A96B]/25 shadow-md'
            : 'border-[#E2E0DB] dark:border-[#2E2E2E] hover:border-[#C8A96B]/80 hover:bg-[#FAF7F0] dark:hover:bg-[#2A2A2A]'
        } ${sizeClasses[size] || sizeClasses.md} ${className}`}
      >
        <div className="flex items-center gap-2 truncate flex-1">
          {Icon && (
            <Icon className="w-4 h-4 text-[#C8A96B] shrink-0" />
          )}
          {SelectedIcon && (
            <SelectedIcon className="w-4 h-4 text-[#C8A96B] shrink-0" />
          )}
          <span className={`truncate font-semibold ${selectedOption ? 'text-[#111111] dark:text-white' : 'text-[#858585]'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FAF7F0] dark:bg-[#1E1E1E] text-[#C8A96B] border border-[#C8A96B]/30 shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#858585] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#C8A96B]' : ''
          }`}
        />
      </button>

      {/* Floating Animated Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 w-full min-w-[190px] max-h-60 overflow-y-auto z-50 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 ${dropdownClassName}`}
        >
          {normalizedOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-[#858585] text-center">No options available</div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              const OptIcon = opt.icon;
              return (
                <div
                  key={String(opt.value)}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#FAF7F0] dark:bg-[#252525] text-[#111111] dark:text-[#C8A96B] font-bold shadow-sm'
                      : 'text-[#555555] dark:text-[#E2E0DB] hover:bg-[#FAF7F0] dark:hover:bg-[#252525] hover:text-[#111111] dark:hover:text-[#C8A96B]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1">
                    {OptIcon && (
                      <OptIcon className="w-3.5 h-3.5 text-[#C8A96B] shrink-0" />
                    )}
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white dark:bg-[#1E1E1E] text-[#C8A96B] border border-[#C8A96B]/30">
                        {opt.badge}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#C8A96B] shrink-0 font-black" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
