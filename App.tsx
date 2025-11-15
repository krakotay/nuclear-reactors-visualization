
import React, { useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import { ProcessedReactorData, VisualizationMode, ColoringMode } from './types';
import { loadReactorData } from './services/dataService';
import Header from './components/Header';
import Controls from './components/Controls';
import ReactorChart from './components/ReactorChart';
import { REACTOR_TYPE_COLORS, generateColorForString } from './constants';

const DEFAULT_COUNTRIES = ['Russia', 'United States', 'France', 'China'];

const App: React.FC = () => {
  const [allData, setAllData] = useState<ProcessedReactorData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCountries, setSelectedCountries] = useState<string[]>(DEFAULT_COUNTRIES);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>(VisualizationMode.PER_REACTOR);
  const [coloringMode, setColoringMode] = useState<ColoringMode>(ColoringMode.TYPE);
  const [capacityRange, setCapacityRange] = useState<[number, number]>([0, 2000]);
  const [constructionTimeRange, setConstructionTimeRange] = useState<[number, number]>([0, 50]);

  // Color state
  const [typeColorMap, setTypeColorMap] = useState<Record<string, string>>(REACTOR_TYPE_COLORS);
  const [countryColorMap, setCountryColorMap] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await loadReactorData();
        setAllData(data);

        if (data.length > 0) {
          const maxCap = Math.max(...data.map(d => d.capacityMW));
          setCapacityRange([0, Math.ceil(maxCap / 100) * 100]);
          
          const maxConstructionTimeReactor = Math.max(...data.map(d => d.constructionTimeYears));
          const maxConstructionTimeGW = Math.max(...data.map(d => d.constructionTimePerGW));
          setConstructionTimeRange([0, Math.ceil(Math.max(maxConstructionTimeReactor, maxConstructionTimeGW))]);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const countries = useMemo(() => Array.from(new Set(allData.map(d => d.country))).sort(), [allData]);
  const reactorTypes = useMemo(() => ['All', ...Array.from(new Set(allData.map(d => d.type))).sort()], [allData]);

  useEffect(() => {
    if (countries.length === 0) return;

    setCountryColorMap(prevMap => {
        const newMap = { ...prevMap };
        countries.forEach(country => {
            if (!newMap[country]) {
                newMap[country] = generateColorForString(country);
            }
        });
        return newMap;
    });
  }, [countries]);

  const handleColorChange = useCallback((key: string, color: string) => {
    const setter = coloringMode === ColoringMode.TYPE ? setTypeColorMap : setCountryColorMap;
    startTransition(() => {
        setter(prev => {
            if (prev[key] === color) return prev;
            return { ...prev, [key]: color };
        });
    });
  }, [coloringMode, startTransition]);

  const activeColorMap = coloringMode === ColoringMode.TYPE ? typeColorMap : countryColorMap;

  const yAxisKey = visualizationMode === VisualizationMode.PER_REACTOR ? 'constructionTimeYears' : 'constructionTimePerGW';

  const filteredData = useMemo(() => {
    return allData.filter(d => {
      const countryMatch = selectedCountries.length === 0 || selectedCountries.includes(d.country);
      const typeMatch = selectedType === 'All' || d.type === selectedType;
      const capacityMatch = d.capacityMW >= capacityRange[0] && d.capacityMW <= capacityRange[1];
      const constructionTime = d[yAxisKey];
      const constructionTimeMatch = constructionTime >= constructionTimeRange[0] && constructionTime <= constructionTimeRange[1];

      return countryMatch && typeMatch && capacityMatch && constructionTimeMatch;
    });
  }, [allData, selectedCountries, selectedType, capacityRange, constructionTimeRange, yAxisKey]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col p-4 md:p-8">
      <Header />
      <main className="flex-grow flex flex-col lg:flex-row gap-8 mt-6">
        <aside className="lg:w-1/4 xl:w-1/5 flex-shrink-0">
          <Controls
            countries={countries}
            selectedCountries={selectedCountries}
            onCountriesChange={setSelectedCountries}
            reactorTypes={reactorTypes}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            visualizationMode={visualizationMode}
            onModeChange={setVisualizationMode}
            coloringMode={coloringMode}
            onColoringModeChange={setColoringMode}
            capacityRange={capacityRange}
            onCapacityRangeChange={setCapacityRange}
            constructionTimeRange={constructionTimeRange}
            onConstructionTimeRangeChange={setConstructionTimeRange}
            yAxisKey={yAxisKey}
          />
        </aside>
        <section className="flex-grow lg:w-3/4 xl:w-4/5 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl">Loading data...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl text-red-600">{error}</p>
            </div>
          ) : (
            <ReactorChart 
                data={filteredData} 
                mode={visualizationMode} 
                colorBy={coloringMode}
                colorMap={activeColorMap}
                onColorChange={handleColorChange}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
