
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center pb-4 border-b border-gray-200">
      <h1 className="text-3xl md:text-4xl font-light text-gray-900">
        Nuclear Reactor Construction Timelines
      </h1>
      <p className="text-md text-gray-500 mt-1">
        A visualization of global reactor construction data. 
      </p>
      <a href="https://github.com/krakotay/nuclear-reactors-visualization">github</a>

    </header>
  );
};

export default Header;
