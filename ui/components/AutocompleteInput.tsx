import { useState, useEffect, useRef } from 'react';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  onOptionSelect?: (value: string) => void;
}

export default function AutocompleteInput({
  value,
  onChange,
  options,
  placeholder,
  onOptionSelect,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((option) =>
    option.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    onOptionSelect?.(val);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        className="input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
          {filtered.map((option) => (
            <li
              key={option}
              onClick={() => handleSelect(option)}
              className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
