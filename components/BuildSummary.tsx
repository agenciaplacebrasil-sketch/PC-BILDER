
import React from 'react';
import type { BuildConfiguration } from '../types';
import { CATEGORIES } from '../constants';
import { ShoppingCart, Trash2, Printer } from 'lucide-react';

interface BuildSummaryProps {
  selectedBuild: BuildConfiguration;
  totalCost: number;
  priceVista: number;
  priceParcelado: number;
  onReset: () => void;
  onPrintBudget: () => void;
  showTotalCost: boolean;
  onToggleTotalCost: () => void;
  showItemPrices: boolean;
  onToggleItemPrices: () => void;
  vistaPercentage: number;
  parceladoPercentage: number;
  setVistaPercentage: (value: number) => void;
  setParceladoPercentage: (value: number) => void;
  showMarginEditor: boolean;
  onToggleMarginEditor: () => void;
}

const BuildSummary: React.FC<BuildSummaryProps> = ({
  selectedBuild,
  totalCost,
  priceVista,
  priceParcelado,
  onReset,
  onPrintBudget,
  showTotalCost,
  onToggleTotalCost,
  showItemPrices,
  onToggleItemPrices,
  vistaPercentage,
  parceladoPercentage,
  setVistaPercentage,
  setParceladoPercentage,
  showMarginEditor,
  onToggleMarginEditor,
}) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const selectedParts = CATEGORIES.filter(cat => selectedBuild[cat.key]);
  const atLeastOnePartSelected = selectedParts.length > 0;

  return (
    <div className="sticky top-24 bg-gray-800/60 border border-gray-700 rounded-lg shadow-xl p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6 border-b border-gray-600 pb-4">
        <h2 className="flex items-center text-2xl font-bold text-gray-200">
          <ShoppingCart className="h-6 w-6 mr-3 text-sky-400" />
          Sua Configuração
        </h2>
        <label htmlFor="show-item-prices" className="flex items-center cursor-pointer text-sm text-gray-400">
          <input
            type="checkbox"
            id="show-item-prices"
            checked={showItemPrices}
            onChange={onToggleItemPrices}
            className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-sky-500 focus:ring-sky-600 mr-2"
          />
          Mostrar Preços
        </label>
      </div>
      
      <div className="space-y-4 mb-6 min-h-[200px]">
        {selectedParts.length > 0 ? (
          selectedParts.map(cat => {
            const part = selectedBuild[cat.key];
            const itemVistaPrice = (part?.price || 0) * (1 + vistaPercentage / 100);
            const itemParceladoPrice = itemVistaPrice * (1 + parceladoPercentage / 100);

            return (
              <div key={cat.key} className="flex justify-between items-center text-sm bg-gray-700/50 p-3 rounded-md">
                <div>
                  <p className="font-semibold text-gray-300">{cat.label}</p>
                  <p className="text-gray-400 truncate max-w-[200px]">{part?.name}</p>
                </div>
                {showItemPrices && (
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-green-400">{formatCurrency(itemVistaPrice)}</p>
                    <p className="font-medium text-sky-300 text-xs">{formatCurrency(itemParceladoPrice)}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 h-full pt-10">
            <p>Nenhuma peça selecionada.</p>
            <p className="text-sm">Comece a escolher os componentes.</p>
          </div>
        )}
      </div>

      <div className="border-t-2 border-dashed border-gray-600 pt-6 space-y-4">
        <div className="flex justify-between items-center text-md">
            <span className="text-gray-400">Custo das Peças:</span>
            <div className="flex items-center space-x-2">
                {showTotalCost ? (
                    <span className="text-gray-400 font-medium">{formatCurrency(totalCost)}</span>
                ) : (
                    <span className="text-gray-500 italic">Oculto</span>
                )}
                <button onClick={onToggleTotalCost} className="text-xs text-sky-400 hover:text-sky-300 font-semibold px-2 py-1 rounded bg-gray-700/50 hover:bg-gray-700">
                    {showTotalCost ? 'Ocultar' : 'Mostrar'}
                </button>
            </div>
        </div>


        <div className="mt-4 space-y-2 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-sky-300">Opções de Pagamento</h3>
            <label htmlFor="show-margins" className="flex items-center cursor-pointer text-sm text-gray-400">
              <input
                type="checkbox"
                id="show-margins"
                checked={showMarginEditor}
                onChange={onToggleMarginEditor}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-sky-500 focus:ring-sky-600 mr-2"
              />
              Editar Margens
            </label>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-baseline">
                 <div className="flex items-center space-x-2">
                    <p className="text-md text-gray-300">Valor à Vista</p>
                    {showMarginEditor && (
                        <div className="flex items-center bg-gray-700 border border-gray-600 rounded">
                            <input
                                type="number"
                                value={vistaPercentage}
                                onChange={(e) => setVistaPercentage(Number(e.target.value))}
                                className="w-14 p-1 text-sm bg-transparent text-center focus:outline-none"
                                aria-label="Porcentagem à vista"
                            />
                            <span className="text-sm text-gray-400 pr-2">%</span>
                        </div>
                    )}
                 </div>
                 <span className="text-2xl font-bold text-green-400">{formatCurrency(priceVista)}</span>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
               <div className="flex justify-between items-baseline">
                <div className="flex items-center space-x-2">
                    <p className="text-md text-gray-300">Valor Parcelado</p>
                    {showMarginEditor && (
                        <div className="flex items-center bg-gray-700 border border-gray-600 rounded">
                           <input
                                type="number"
                                value={parceladoPercentage}
                                onChange={(e) => setParceladoPercentage(Number(e.target.value))}
                                className="w-14 p-1 text-sm bg-transparent text-center focus:outline-none"
                                aria-label="Porcentagem parcelado"
                            />
                            <span className="text-sm text-gray-400 pr-2">%</span>
                        </div>
                    )}
                </div>
                 <span className="text-2xl font-bold text-sky-400">{formatCurrency(priceParcelado)}</span>
              </div>
               <p className="text-right text-sm font-semibold text-sky-300">
                 ou 12x de {formatCurrency(priceParcelado / 12)}
               </p>
            </div>
          </div>
        </div>
        
        {atLeastOnePartSelected && (
             <button
                onClick={onPrintBudget}
                className="w-full flex justify-center items-center py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors duration-300 mt-4 text-white"
            >
                <Printer className="h-5 w-5 mr-2" />
                Gerar Página de Impressão
            </button>
        )}
        <button
          onClick={onReset}
          disabled={Object.keys(selectedBuild).length === 0}
          className="w-full flex justify-center items-center py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors duration-300 mt-4"
        >
          <Trash2 className="h-5 w-5 mr-2" />
          Limpar Configuração
        </button>
      </div>
    </div>
  );
};

export default BuildSummary;