import React, { useMemo, useRef } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis } from 'recharts';
import { ProcessedReactorData, VisualizationMode, ColoringMode } from '../types';
import CustomTooltip from './CustomTooltip';

interface ReactorChartProps {
  data: ProcessedReactorData[];
  mode: VisualizationMode;
  colorBy: ColoringMode;
  colorMap: Record<string, string>;
  onColorChange: (key: string, color: string) => void;
}

// Custom Legend with color picker functionality
const CustomLegend = (props: any) => {
    const { payload, onColorChange } = props;
    const colorInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const handleLegendItemClick = (entryValue: string) => {
        // Programmatically click the hidden color input for the corresponding legend item
        colorInputRefs.current[entryValue]?.click();
    };

    if (!payload) return null;

    return (
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-4 px-4 max-h-28 overflow-y-auto">
            {payload.map((entry: any, index: number) => (
                <div 
                    key={`item-${index}`}
                    className="flex items-center cursor-pointer p-1 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => handleLegendItemClick(entry.value)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLegendItemClick(entry.value) }}
                    aria-label={`Change color for ${entry.value}`}
                >
                    <div style={{ width: 14, height: 14, backgroundColor: entry.color, marginRight: 6, borderRadius: '2px', border: '1px solid #ccc' }}></div>
                    <span className="text-sm text-gray-700">{entry.value}</span>
                    <input
                        type="color"
                        // FIX: A ref callback should not return a value. The expression-bodied
                        // arrow function was returning the element. Using a block statement `{}`
                        // ensures an implicit `undefined` return, satisfying the type.
                        ref={el => { colorInputRefs.current[entry.value] = el; }}
                        value={entry.color}
                        onChange={(e) => onColorChange(entry.value, e.target.value)}
                        style={{ visibility: 'hidden', width: 0, height: 0, position: 'absolute' }}
                        aria-hidden="true"
                        tabIndex={-1}
                    />
                </div>
            ))}
        </div>
    );
};


const ReactorChart: React.FC<ReactorChartProps> = ({ data, mode, colorBy, colorMap, onColorChange }) => {
  const yAxisKey = mode === VisualizationMode.PER_REACTOR ? 'constructionTimeYears' : 'constructionTimePerGW';
  const yAxisLabel = mode === VisualizationMode.PER_REACTOR ? 'Construction Time (Years)' : 'Construction Time per GW (Years/GW)';

  const dataByGroup = useMemo(() => {
    return data.reduce((acc, point) => {
      const key = colorBy === ColoringMode.COUNTRY ? point.country : point.type || 'Unknown';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(point);
      return acc;
    }, {} as Record<string, ProcessedReactorData[]>);
  }, [data, colorBy]);


  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No data available for the selected filters.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 30,
          left: 30,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
            type="number" 
            dataKey="constructionStartYear" 
            name="Start Year" 
            domain={['dataMin - 2', 'dataMax + 2']}
            tick={{ fill: '#4a5568', fontSize: 12 }} 
            axisLine={{ stroke: '#cbd5e0' }}
            tickLine={{ stroke: '#cbd5e0' }}
            padding={{ left: 20, right: 20 }}
            label={{ value: 'Construction Start Year', position: 'insideBottom', offset: -20, fill: '#374151' }}
            allowDecimals={false}
        />
        <YAxis 
            type="number" 
            dataKey={yAxisKey} 
            name="Construction Time" 
            unit=" yrs" 
            domain={[0, 'auto']}
            tick={{ fill: '#4a5568', fontSize: 12 }}
            axisLine={{ stroke: '#cbd5e0' }}
            tickLine={{ stroke: '#cbd5e0' }}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', offset: -20, fill: '#374151', style: { textAnchor: 'middle' } }}
        />
        <ZAxis type="number" dataKey="capacityMW" range={[30, 400]} name="Capacity (MW)" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
        <Legend content={<CustomLegend onColorChange={onColorChange} />} verticalAlign="bottom" wrapperStyle={{ bottom: -10 }}/>
        {Object.entries(dataByGroup).map(([key, groupData]) => {
          const dataKey = `${colorBy}-${key}`;
          return (
            <Scatter 
              key={dataKey} 
              dataKey={dataKey}
              name={key} 
              data={groupData} 
              fill={colorMap[key] || '#6b7280'} 
              shape="circle"
              stroke="#1f2937"
              strokeWidth={0.5}
            />
          );
        })}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ReactorChart;
