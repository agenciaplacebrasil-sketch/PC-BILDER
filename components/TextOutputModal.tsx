import React, { useState, useCallback } from 'react';
import { X, Clipboard, Check } from 'lucide-react';

interface TextOutputModalProps {
  content: string;
  onClose: () => void;
}

const TextOutputModal: React.FC<TextOutputModalProps> = ({ content, onClose }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copiar para a Área de Transferência');
  const [copyButtonIcon, setCopyButtonIcon] = useState(<Clipboard className="h-5 w-5 mr-2" />);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopyButtonText('Copiado!');
      setCopyButtonIcon(<Check className="h-5 w-5 mr-2" />);
      setTimeout(() => {
        setCopyButtonText('Copiar para a Área de Transferência');
        setCopyButtonIcon(<Clipboard className="h-5 w-5 mr-2" />);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      setCopyButtonText('Erro ao Copiar');
    });
  }, [content]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-sky-300">Orçamento em Texto</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition">
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </header>

        <div className="p-6 flex-grow overflow-y-auto">
          <textarea
            readOnly
            value={content}
            className="w-full h-80 p-3 bg-gray-900 border border-gray-600 rounded-md resize-none font-mono text-sm"
          />
        </div>

        <footer className="p-4 border-t border-gray-700 flex justify-end space-x-4">
          <button
            onClick={handleCopy}
            className="flex items-center py-2 px-4 bg-sky-600 hover:bg-sky-700 rounded-lg font-semibold transition-colors duration-300"
          >
            {copyButtonIcon}
            {copyButtonText}
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors duration-300"
          >
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default TextOutputModal;
