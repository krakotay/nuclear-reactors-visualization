
import React from 'react';
import { VisualizationMode, ColoringMode } from '../types';

interface ControlsProps {
  countries: string[];
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
  reactorTypes: string[];
  selectedType: string;
  onTypeChange: (type: string) => void;
  visualizationMode: VisualizationMode;
  onModeChange: (mode: VisualizationMode) => void;
  coloringMode: ColoringMode;
  onColoringModeChange: (mode: ColoringMode) => void;
  capacityRange: [number, number];
  onCapacityRangeChange: (range: [number, number]) => void;
  constructionTimeRange: [number, number];
  onConstructionTimeRangeChange: (range: [number, number]) => void;
  yAxisKey: string;
}

const ControlSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-md font-semibold text-gray-600 mb-2 border-b border-gray-200 pb-1">{title}</h3>
        {children}
    </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-sm" />
);

const NumberInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input type="number" {...props} className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-sm" />
);


const RadioButton: React.FC<{ id: string; name: string; value: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string }> = ({ id, name, value, checked, onChange, label }) => (
    <div className="flex items-center">
        <input 
            type="radio" 
            id={id}
            name={name} 
            value={value}
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-700">{label}</label>
    </div>
);


const Controls: React.FC<ControlsProps> = ({
  countries,
  selectedCountries,
  onCountriesChange,
  reactorTypes,
  selectedType,
  onTypeChange,
  visualizationMode,
  onModeChange,
  coloringMode,
  onColoringModeChange,
  capacityRange,
  onCapacityRangeChange,
  constructionTimeRange,
  onConstructionTimeRangeChange,
  yAxisKey,
}) => {

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    if (selectedOptions.length === 0) {
      onCountriesChange(['All']);
      return;
    }
    if (selectedOptions.length > 1 && selectedOptions.includes('All')) {
      onCountriesChange(selectedOptions.filter(o => o !== 'All'));
    } else {
      onCountriesChange(selectedOptions);
    }
  };

  const constructionTimeLabel = yAxisKey === 'constructionTimeYears' ? 'Construction Time (Years)' : 'Construction Time (Years/GW)';

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm h-full">
      <h2 className="text-xl font-medium mb-4 text-gray-800">Options</h2>
      
      <ControlSection title="Filters">
        <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 mb-1">Country (Ctrl+Click for multi-select)</label>
        <Select id="country-select" multiple value={selectedCountries} onChange={handleCountryChange} size={8}>
          {countries.map(country => <option key={country} value={country}>{country}</option>)}
        </Select>
        
        <label htmlFor="type-select" className="block text-sm font-medium text-gray-700 mt-4 mb-1">Reactor Type</label>
        <Select id="type-select" value={selectedType} onChange={(e) => onTypeChange(e.target.value)}>
          {reactorTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </Select>

        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (MW)</label>
            <div className="flex items-center gap-2">
                <NumberInput placeholder="Min" value={capacityRange[0]} onChange={e => onCapacityRangeChange([Number(e.target.value), capacityRange[1]])} />
                <span className="text-gray-500">-</span>
                <NumberInput placeholder="Max" value={capacityRange[1]} onChange={e => onCapacityRangeChange([capacityRange[0], Number(e.target.value)])} />
            </div>
        </div>

        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{constructionTimeLabel}</label>
            <div className="flex items-center gap-2">
                <NumberInput placeholder="Min" value={constructionTimeRange[0]} onChange={e => onConstructionTimeRangeChange([Number(e.target.value), constructionTimeRange[1]])} />
                <span className="text-gray-500">-</span>
                <NumberInput placeholder="Max" value={constructionTimeRange[1]} onChange={e => onConstructionTimeRangeChange([constructionTimeRange[0], Number(e.target.value)])} />
            </div>
        </div>
      </ControlSection>

      <ControlSection title="Y-Axis">
        <div className="space-y-2">
            <RadioButton
                id="mode-per-reactor" name="vis-mode" value={VisualizationMode.PER_REACTOR}
                checked={visualizationMode === VisualizationMode.PER_REACTOR}
                onChange={(e) => onModeChange(e.target.value as VisualizationMode)}
                label="Time per Reactor"
            />
            <RadioButton
                id="mode-per-gw" name="vis-mode" value={VisualizationMode.PER_GIGAWATT}
                checked={visualizationMode === VisualizationMode.PER_GIGAWATT}
                onChange={(e) => onModeChange(e.target.value as VisualizationMode)}
                label="Time per Gigawatt"
            />
        </div>
      </ControlSection>
      
      <ControlSection title="Color By">
        <div className="space-y-2">
            <RadioButton
                id="color-by-type" name="color-mode" value={ColoringMode.TYPE}
                checked={coloringMode === ColoringMode.TYPE}
                onChange={(e) => onColoringModeChange(e.target.value as ColoringMode)}
                label="Reactor Type"
            />
            <RadioButton
                id="color-by-country" name="color-mode" value={ColoringMode.COUNTRY}
                checked={coloringMode === ColoringMode.COUNTRY}
                onChange={(e) => onColoringModeChange(e.target.value as ColoringMode)}
                label="Country"
            />
        </div>
      </ControlSection>
    </div>
  );
};

export default Controls;
