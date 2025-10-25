// Nota: Este arquivo foi reaproveitado para gerar uma página HTML imprimível
// em vez de um PDF, para fornecer uma solução de impressão mais robusta e confiável.
import type { BuildConfiguration } from '../types';
import { CATEGORIES } from '../constants';

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const generatePrintableHtml = (
  build: BuildConfiguration,
  totalCost: number,
  priceVista: number,
  priceParcelado: number,
  showTotalCost: boolean,
  vistaPercentage: number,
  parceladoPercentage: number,
  showItemPrices: boolean
): string => {
  const today = new Date().toLocaleDateString('pt-BR');

  const tableRows = CATEGORIES.map(cat => {
    const part = build[cat.key];
    if (part) {
      const itemVistaPrice = part.price * (1 + vistaPercentage / 100);
      const itemParceladoPrice = itemVistaPrice * (1 + parceladoPercentage / 100);
      const priceCells = showItemPrices ? `
        <td class="py-3 px-4 text-right font-medium text-green-700">${formatCurrency(itemVistaPrice)}</td>
        <td class="py-3 px-4 text-right font-medium text-sky-700">${formatCurrency(itemParceladoPrice)}</td>
      ` : '';
      return `
        <tr class="border-b border-gray-200">
          <td class="py-3 px-4 font-semibold text-gray-700">${cat.label}</td>
          <td class="py-3 px-4 text-gray-600">${part.name}</td>
          ${priceCells}
        </tr>
      `;
    }
    return '';
  }).join('');

  const costSummaryHtml = showTotalCost ? `
    <div class="flex justify-between text-gray-600">
      <span>Custo das Peças:</span>
      <span class="font-medium">${formatCurrency(totalCost)}</span>
    </div>
  ` : '';

  const costHeaderHtml = showItemPrices ? `
    <th class="py-3 px-4 font-bold uppercase text-sm text-right">Valor à Vista</th>
    <th class="py-3 px-4 font-bold uppercase text-sm text-right">Valor Parcelado</th>
  ` : '';

  const vistaLabel = showTotalCost ? `Valor à Vista (+${vistaPercentage}%)` : 'Valor à Vista';
  const parceladoLabel = showTotalCost ? `Valor Parcelado (+${parceladoPercentage}%)` : 'Valor Parcelado';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Orçamento - BeB Games</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @page {
          size: A4;
          margin: 10mm; /* Margem reduzida */
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 9pt; /* Fonte base menor */
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none;
          }
          /* Otimizações agressivas para caber em uma página */
          header, main, footer {
             page-break-inside: avoid;
          }
          header h1 { font-size: 1.25rem; }
          header p { font-size: 0.75rem; margin-bottom: 1px; }
          header { margin-bottom: 1rem; padding-bottom: 0.75rem; }
          main h2 { font-size: 1.75rem; margin-bottom: 1rem; }
          table th, table td {
            padding: 4px 6px; /* Padding da tabela reduzido */
            font-size: 8pt;
          }
          .summary-container { margin-top: 1rem; }
          .summary-container h3 { font-size: 1.1rem; }
          .summary-container span { font-size: 0.9rem; }
          .summary-container .font-bold { font-size: 1rem; }
        }
      </style>
    </head>
    <body class="bg-gray-100 font-sans p-4 sm:p-8">
      <div class="max-w-[600px] mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-xl print-container">
        
        <header class="mb-8 border-b pb-4">
          <h1 class="text-3xl font-bold text-gray-800">BeB Games Rio de Janeiro</h1>
          <p class="text-gray-600">Unidades: Barra Shopping, Parkshopping Jacarepaguá e Parkshopping Campo Grande</p>
          <p class="text-gray-600">CNPJ: 49.935.105/0002-02</p>
          <div class="mt-4 text-sm text-gray-500">
            <p><span class="font-semibold">Contatos:</span></p>
            <p>Loja Barra: 21 97194-6669</p>
            <p>Loja Campo Grande: 21 98966-0026</p>
            <p>Loja Jacarepaguá: 21 99569-1209</p>
          </div>
        </header>

        <main>
          <div class="text-center mb-8">
            <h2 class="text-4xl font-bold text-sky-600">Orçamento de Computador</h2>
            <p class="text-gray-500 mt-2">Data de Emissão: ${today}</p>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-800 text-white">
                  <th class="py-3 px-4 font-bold uppercase text-sm">Componente</th>
                  <th class="py-3 px-4 font-bold uppercase text-sm">Peça Selecionada</th>
                  ${costHeaderHtml}
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>

          <div class="mt-8 flex justify-end">
            <div class="w-full max-w-sm space-y-4 summary-container">
              <h3 class="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Resumo Financeiro</h3>
              
              ${costSummaryHtml}
              
              <div>
                <div class="flex justify-between items-baseline text-gray-800">
                  <span class="font-semibold text-lg">${vistaLabel}:</span>
                  <span class="font-bold text-2xl text-green-600">${formatCurrency(priceVista)}</span>
                </div>
              </div>

              <div class="border-t pt-4 mt-4">
                <div class="flex justify-between items-baseline text-gray-800">
                  <span class="font-semibold text-lg">${parceladoLabel}:</span>
                  <span class="font-bold text-2xl text-sky-600">${formatCurrency(priceParcelado)}</span>
                </div>
                <p class="text-right font-semibold text-sky-500">ou 12x de ${formatCurrency(priceParcelado / 12)}</p>
              </div>
            </div>
          </div>
        </main>

        <footer class="mt-12 text-center text-gray-500 text-sm no-print">
          <p>Orçamento gerado pelo PC Builder Pro. Válido por 7 dias.</p>
          <button onclick="window.print()" class="mt-4 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded">
            Imprimir Orçamento
          </button>
        </footer>

      </div>
    </body>
    </html>
  `;
};