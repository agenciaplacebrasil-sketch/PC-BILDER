import React from 'react';
import { Wand2, Loader, AlertTriangle } from 'lucide-react';

interface AiBuilderProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onBuild: () => void;
  isLoading: boolean;
  error: string | null;
}

const AiBuilder: React.FC<AiBuilderProps> = ({ prompt, setPrompt, onBuild, isLoading, error }) => {
  return (
    <div className="bg-gray-800/60 p-6 rounded-lg shadow-lg border border-sky-500/50 relative">
      <h2 className="flex items-center text-xl font-bold mb-4 text-sky-300">
        <Wand2 className="h-6 w-6 mr-3" />
        Orçamento por IA
      </h2>
      <p className="text-gray-400 mb-4 text-sm">
        Cole a configuração do seu cliente abaixo e deixe a IA montar o orçamento com as peças disponíveis.
      </p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ex: 'Quero um PC para jogar Warzone em 1080p, com uma placa de vídeo da NVIDIA e 16GB de RAM...'"
        className="w-full h-28 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition resize-none"
        disabled={isLoading}
      />
      {error && (
        <div className="flex items-center mt-3 text-red-400 text-sm">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <button
        onClick={onBuild}
        disabled={isLoading || !prompt.trim()}
        className="w-full flex justify-center items-center mt-4 py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors duration-300"
      >
        {isLoading ? (
          <>
            <Loader className="animate-spin h-5 w-5 mr-2" />
            Analisando...
          </>
        ) : (
          <>
            <Wand2 className="h-5 w-5 mr-2" />
            Analisar e Montar
          </>
        )}
      </button>
    </div>
  );
};

export default AiBuilder;