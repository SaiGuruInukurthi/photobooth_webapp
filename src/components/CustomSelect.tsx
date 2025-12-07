import { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  label: string;
}

export function CustomSelect({ value, onChange, options, disabled = false, label }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-[#f5e6d3] text-sm tracking-wider">{label}:</label>
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="px-4 py-2 bg-[#4a3828] text-[#f5e6d3] rounded border-2 border-[#2d1810] focus:outline-none focus:border-[#ffe8b3] tracking-wide disabled:opacity-50 min-w-[140px] text-left flex items-center justify-between"
        >
          <span>{selectedOption?.label}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full bottom-full mb-1 bg-[#4a3828] border-2 border-[#2d1810] rounded shadow-xl overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-2 text-left tracking-wide transition-colors ${
                  option.value === value
                    ? 'bg-[#5a4838] text-[#ffe8b3]'
                    : 'bg-[#4a3828] text-[#f5e6d3] hover:bg-[#5a4838] hover:text-[#ffe8b3]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
