
import React from 'react';
import { Cpu } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center">
        <Cpu className="h-8 w-8 text-sky-400 mr-3" />
        <h1 className="text-2xl font-bold tracking-tight text-white">
          PC <span className="text-sky-400">Builder</span> Pro
        </h1>
      </div>
    </header>
  );
};

export default Header;
