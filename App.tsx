
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchPartsData } from './services/googleSheetService';
import type { Part, PartCategory, PartsData, BuildConfiguration, ProcessedAiBuildOption, AiBuildOption } from './types';
import { CATEGORIES } from './constants';
import ComponentSelector from './components/ComponentSelector';
import BuildSummary from './components/BuildSummary';
import Header from './components/Header';
import AiBuilder from './components/AiBuilder';
import AiOptionsModal from './components/AiOptionsModal';
import { Loader, AlertTriangle } from 'lucide-react';
import { generatePrintableHtml } from './services/pdfService';

const App: React.FC = () => {
  const [partsData, setPartsData] = useState<PartsData | null>(null);
  const [selectedBuild, setSelectedBuild] = useState<BuildConfiguration>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for AI Builder
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiBuildOptions, setAiBuildOptions] = useState<ProcessedAiBuildOption[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  
  // State for cost visibility and margins
  const [showTotalCost, setShowTotalCost] = useState(false);
  const [showItemPrices, setShowItemPrices] = useState(true);
  const [vistaPercentage, setVistaPercentage] = useState(30);
  const [parceladoPercentage, setParceladoPercentage] = useState(13);
  const [showMarginEditor, setShowMarginEditor] = useState(false);


  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPartsData();
        setPartsData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
        setError(`Falha ao carregar os dados: ${errorMessage}. Isso pode ser causado por um problema de conexão, bloqueadores de anúncio ou firewalls. Por favor, verifique e tente novamente.`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSelectPart = useCallback((category: PartCategory, part: Part | null) => {
    setSelectedBuild(prevBuild => {
      const newBuild = { ...prevBuild };
      if (part) {
        newBuild[category] = part;
      } else {
        delete newBuild[category];
      }
      return newBuild;
    });
  }, []);

  const handleResetBuild = useCallback(() => {
    setSelectedBuild({});
  }, []);
  
    const handleToggleTotalCost = useCallback(() => {
    setShowTotalCost(prev => !prev);
  }, []);

  const handleToggleItemPrices = useCallback(() => {
    setShowItemPrices(prev => !prev);
  }, []);

  const handleToggleMarginEditor = useCallback(() => {
    setShowMarginEditor(prev => !prev);
  }, []);

  const handleAiBuild = async () => {
    if (!aiPrompt.trim() || !partsData) return;

    setIsAiLoading(true);
    setAiError(null);

    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const partsListString = CATEGORIES.map(category => {
          const parts = partsData[category.key] || [];
          return `## ${category.label}\n${parts.map(p => `- ${p.name} (Custo: ${p.price})`).join('\n')}`;
      }).join('\n\n');
      
      const itemProperties = CATEGORIES.reduce((acc, category) => {
        acc[category.key] = {
          type: Type.STRING,
          description: `The exact name of the chosen ${category.label} from the list.`,
        };
        return acc;
      }, {} as any);

      const buildOptionSchema = {
        type: Type.OBJECT,
        properties: {
            tier: { 
                type: Type.STRING,
                description: "The tier of this build option. Must be one of: 'Custo-Benefício', 'Equilibrada', 'Performance'."
            },
            justificativa: {
                type: Type.STRING,
                description: "A brief explanation of why these parts were chosen for this tier."
            },
            ...itemProperties
        }
      };
      
      const responseSchema = {
        type: Type.ARRAY,
        items: buildOptionSchema,
      };

      const prompt = `
        Você é um assistente especialista em montagem de computadores. Sua tarefa é analisar o pedido de um cliente e criar TRÊS opções de configuração (builds) usando uma lista de peças disponíveis.

        As três opções devem ser:
        1.  **Custo-Benefício:** A opção mais barata que atende aos requisitos mínimos do cliente.
        2.  **Equilibrada:** A melhor combinação de performance e preço, a opção recomendada.
        3.  **Performance:** A melhor opção possível usando os componentes disponíveis, focando em desempenho.

        **Pedido do Cliente:**
        "${aiPrompt}"

        **Peças Disponíveis (com custos):**
        ${partsListString}

        **Instruções:**
        - Crie exatamente TRÊS opções, uma para cada tier (Custo-Benefício, Equilibrada, Performance).
        - Para cada opção, selecione UMA peça para CADA categoria da lista de peças.
        - Para cada opção, forneça uma breve "justificativa" explicando suas escolhas.
        - Se o cliente não especificar uma peça, escolha uma opção compatível e adequada para o tier.
        - Retorne sua seleção como um array de 3 objetos JSON, seguindo o schema solicitado.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });
      
      const aiSelection = JSON.parse(response.text) as AiBuildOption[];
      
      const processedOptions: ProcessedAiBuildOption[] = aiSelection.map(option => {
          const newBuild: BuildConfiguration = {};
          let currentCost = 0;

          // Ensure we iterate in the defined order of CATEGORIES
          CATEGORIES.forEach(catInfo => {
              const categoryKey = catInfo.key;
              const partName = option[categoryKey];
              const part = partsData[categoryKey]?.find(p => p.name === partName);

              if (part) {
                newBuild[categoryKey] = part;
                currentCost += part.price;
              }
          });
          
          return {
            tier: option.tier,
            justificativa: option.justificativa,
            build: newBuild,
            totalCost: currentCost
          };
      });
      
      setAiBuildOptions(processedOptions);
      setIsAiModalOpen(true);

    } catch (err) {
      console.error("AI Build Error:", err);
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setAiError(`A IA não conseguiu montar a configuração. Detalhes: ${errorMessage}`);
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const handleSelectAiOption = (build: BuildConfiguration, vista: number, parcelado: number) => {
    setSelectedBuild(build);
    setVistaPercentage(vista);
    setParceladoPercentage(parcelado);
    setIsAiModalOpen(false);
  };
  
  const handleCloseAiModal = () => {
    setIsAiModalOpen(false);
  };

  const totalCost = useMemo(() => {
    return (Object.values(selectedBuild) as Part[]).reduce((total, part) => {
      return total + (part.price || 0);
    }, 0);
  }, [selectedBuild]);

  const priceVista = useMemo(() => totalCost * (1 + vistaPercentage / 100), [totalCost, vistaPercentage]);
  const priceParcelado = useMemo(() => priceVista * (1 + parceladoPercentage / 100), [priceVista, parceladoPercentage]);
  
  const handlePrintBudget = useCallback(() => {
    try {
      const htmlContent = generatePrintableHtml(selectedBuild, totalCost, priceVista, priceParcelado, showTotalCost, vistaPercentage, parceladoPercentage, showItemPrices);
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      } else {
        alert('Não foi possível abrir a página de impressão. Por favor, verifique se o seu navegador está bloqueando pop-ups.');
      }
    } catch (err) {
      console.error("Failed to generate printable page:", err);
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      alert(`Não foi possível gerar a página de impressão. Detalhes: ${errorMessage}`);
    }
  }, [selectedBuild, totalCost, priceVista, priceParcelado, showTotalCost, vistaPercentage, parceladoPercentage, showItemPrices]);


  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-sky-400">
          <Loader className="animate-spin h-12 w-12 mb-4" />
          <p className="text-lg">Carregando componentes...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-400 bg-red-900/20 rounded-lg p-6">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg text-center">{error}</p>
        </div>
      );
    }

    if (partsData) {
      return (
        <>
          <AiBuilder 
            prompt={aiPrompt}
            setPrompt={setAiPrompt}
            onBuild={handleAiBuild}
            isLoading={isAiLoading}
            error={aiError}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {CATEGORIES.map(({ key, label }) => (
              <ComponentSelector
                key={key}
                category={key}
                label={label}
                parts={partsData[key] || []}
                selectedPart={selectedBuild[key] || null}
                onSelectPart={handleSelectPart}
              />
            ))}
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          <div className="flex-grow lg:w-2/3">
            {renderContent()}
          </div>
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <BuildSummary
              selectedBuild={selectedBuild}
              totalCost={totalCost}
              priceVista={priceVista}
              priceParcelado={priceParcelado}
              onReset={handleResetBuild}
              onPrintBudget={handlePrintBudget}
              showTotalCost={showTotalCost}
              onToggleTotalCost={handleToggleTotalCost}
              showItemPrices={showItemPrices}
              onToggleItemPrices={handleToggleItemPrices}
              vistaPercentage={vistaPercentage}
              parceladoPercentage={parceladoPercentage}
              setVistaPercentage={setVistaPercentage}
              setParceladoPercentage={setParceladoPercentage}
              showMarginEditor={showMarginEditor}
              onToggleMarginEditor={handleToggleMarginEditor}
            />
          </div>
        </div>
      </main>
      {isAiModalOpen && (
        <AiOptionsModal 
          options={aiBuildOptions}
          onSelect={handleSelectAiOption}
          onClose={handleCloseAiModal}
          showTotalCost={showTotalCost}
        />
      )}
    </div>
  );
};

export default App;
