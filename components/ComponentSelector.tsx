
import React from 'react';
import type { Part, PartCategory } from '../types';
import { Package } from 'lucide-react';

interface ComponentSelectorProps {
  category: PartCategory;
  label: string;
  parts: Part[];
  selectedPart: Part | null;
  onSelectPart: (category: PartCategory, part: Part | null) => void;
}

const ComponentSelector: React.FC<ComponentSelectorProps> = ({ category, label, parts, selectedPart, onSelectPart }) => {
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPartName = event.target.value;
    const part = parts.find(p => p.name === selectedPartName) || null;
    onSelectPart(category, part);
  };

  return (
    <div className="bg-gray-800/60 p-5 rounded-lg shadow-md border border-gray-700 hover:border-sky-500 transition-colors duration-300">
      <label htmlFor={category} className="flex items-center text-lg font-semibold mb-3 text-gray-300">
        <Package className="h-5 w-5 mr-3 text-sky-400" />
        {label}
      </label>
      <select
        id={category}
        value={selectedPart?.name || ''}
        onChange={handleSelectChange}
        className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
      >
        <option value="">-- Selecione uma peça --</option>
        {parts.map((part) => (
          <option key={part.name} value={part.name}>
            {part.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ComponentSelector;
