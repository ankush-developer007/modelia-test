import React from 'react';

const STYLES = [
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'bohemian', label: 'Bohemian' },
];

interface StyleDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function StyleDropdown({ value, onChange, disabled = false }: StyleDropdownProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="style" className="block text-sm font-medium text-gray-700">
        Style
      </label>
      <select
        id="style"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        aria-describedby="style-help"
      >
        <option value="">Select a style</option>
        {STYLES.map((style) => (
          <option key={style.value} value={style.value}>
            {style.label}
          </option>
        ))}
      </select>
      <p id="style-help" className="text-sm text-gray-500">
        Choose the fashion style for your generation
      </p>
    </div>
  );
}

