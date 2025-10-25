
import React, { useState, useMemo } from 'react';
import type { BuildConfiguration, ProcessedAiBuildOption } from '../types';
import { CATEGORIES } from '../constants';
import { X, Check, Star, Zap, ShieldCheck } from 'lucide-react';

interface AiOptionsModalProps {
  options: ProcessedAiBuildOption[];
  onSelect: (build: BuildConfiguration, vistaPercentage: number, parceladoPercentage: number) => void;
  onClose: () => void;
  showTotalCost: boolean;
}

const tierIcons: { [key: string]: React.ReactElement } = {
  'Custo-Benefício': <ShieldCheck className="h-6 w-6 text-green-400" />,
  'Equilibrada': <Star className="h-6 w-6 text-yellow-400" />,
  'Performance': <Zap className="h-6 w-6 text-purple-400" />,
};

const tierColors: { [key: string]: string } = {
    'Custo-Benefício': 'border-green-500/50 hover:border-green-500',
    'Equilibrada': 'border-yellow-500/50 hover:border-yellow-500',
    'Performance': 'border-purple-500/50 hover:border-purple-500',
};

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const OptionCard: React.FC<{
    option: ProcessedAiBuildOption;
    onSelect: (build: BuildConfiguration, vistaPercentage: number, parceladoPercentage: number) => void;
    showTotalCost: boolean;
}> = ({ option, onSelect, showTotalCost }) => {
    const [vistaPercentage, setVistaPercentage] = useState(30);
    const [parceladoPercentage, setParceladoPercentage] = useState(13);
    const [showMarginEditor, setShowMarginEditor] = useState(false);

    const priceVista = useMemo(() => option.totalCost * (1 + vistaPercentage / 100), [option.totalCost, vistaPercentage]);
    const priceParcelado = useMemo(() => priceVista * (1 + parceladoPercentage / 100), [priceVista, parceladoPercentage]);

    return (
        <div className={`flex flex-col bg-gray-900/50 rounded-lg border-2 transition-all duration-300 ${tierColors[option.tier] || 'border-gray-700'}`}>
            <div className="p-4 border-b-2 border-dashed border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{option.tier}</h3>
                    {tierIcons[option.tier]}
                </div>
                <p className="text-gray-400 text-sm mt-2 italic">"{option.justificativa}"</p>
            </div>
            
            <div className="p-4 space-y-2 flex-grow overflow-y-auto">
                {CATEGORIES.map(cat => {
                    const part = option.build[cat.key];
                    return part ? (
                        <div key={cat.key} className="flex justify-between items-start text-xs">
                            <span className="text-gray-400 font-medium w-1/3">{cat.label}:</span>
                            <span className="text-gray-200 text-right w-2/3">{part.name}</span>
                        </div>
                    ) : null;
                })}
            </div>
            
            <div className="p-4 mt-auto border-t border-gray-700 space-y-4">
                {showTotalCost && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-gray-400">Custo Total:</span>
                        <span className="font-bold text-sky-400">{formatCurrency(option.totalCost)}</span>
                    </div>
                )}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h4 className="text-md font-semibold text-sky-300">Opções de Pagamento</h4>
                        <label htmlFor={`show-margins-${option.tier}`} className="flex items-center cursor-pointer text-xs text-gray-400">
                            <input
                                type="checkbox"
                                id={`show-margins-${option.tier}`}
                                checked={showMarginEditor}
                                onChange={() => setShowMarginEditor(p => !p)}
                                className="w-3 h-3 rounded bg-gray-700 border-gray-600 text-sky-500 focus:ring-sky-600 mr-2"
                            />
                            Editar Margens
                        </label>
                    </div>

                    <div>
                        <div className="flex justify-between items-baseline">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-300">À Vista</p>
                                {showMarginEditor && (
                                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded">
                                        <input
                                            type="number"
                                            value={vistaPercentage}
                                            onChange={(e) => setVistaPercentage(Number(e.target.value))}
                                            className="w-12 p-1 text-xs bg-transparent text-center focus:outline-none"
                                        />
                                        <span className="text-xs text-gray-400 pr-1">%</span>
                                    </div>
                                )}
                            </div>
                            <span className="text-lg font-bold text-green-400">{formatCurrency(priceVista)}</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-baseline">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-300">Parcelado</p>
                                {showMarginEditor && (
                                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded">
                                        <input
                                            type="number"
                                            value={parceladoPercentage}
                                            onChange={(e) => setParceladoPercentage(Number(e.target.value))}
                                            className="w-12 p-1 text-xs bg-transparent text-center focus:outline-none"
                                        />
                                        <span className="text-xs text-gray-400 pr-1">%</span>
                                    </div>
                                )}
                            </div>
                            <span className="text-lg font-bold text-sky-400">{formatCurrency(priceParcelado)}</span>
                        </div>
                        <p className="text-right text-xs font-semibold text-sky-300">
                            12x de {formatCurrency(priceParcelado / 12)}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => onSelect(option.build, vistaPercentage, parceladoPercentage)}
                    className="w-full flex justify-center items-center py-2 px-4 mt-2 bg-sky-600 hover:bg-sky-700 rounded-lg font-semibold transition-colors duration-300 text-sm"
                >
                    <Check className="h-4 w-4 mr-2" />
                    Selecionar
                </button>
            </div>
        </div>
    );
};

const AiOptionsModal: React.FC<AiOptionsModalProps> = ({ options, onSelect, onClose, showTotalCost }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-sky-300">Opções Geradas pela IA</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition">
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </header>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
          {options.map((option) => (
            <OptionCard 
                key={option.tier}
                option={option}
                onSelect={onSelect}
                showTotalCost={showTotalCost}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiOptionsModal;
