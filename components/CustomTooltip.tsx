
import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const labelYear = typeof label === 'string' ? Number(label) : label;
    const matchingEntry = payload.find(entry => {
      const entryYear = entry.payload?.constructionStartYear;
      return labelYear !== undefined && labelYear === entryYear;
    });
    const data = matchingEntry?.payload || payload[0].payload;
    return (
      <div className="bg-white text-gray-900 p-3 rounded-md shadow-lg border border-gray-200 opacity-95 text-sm">
        <p className="font-bold text-md mb-1">{data.plantName}</p>
        <p className="text-gray-700">Type: <span className="font-medium">{data.type}</span></p>
        <p className="text-gray-700">Country: <span className="font-medium">{data.country}</span></p>
        <p className="text-gray-700">Capacity: <span className="font-medium">{data.capacityMW.toLocaleString()} MW</span></p>
        <p className="text-gray-700">Start Year: <span className="font-medium">{data.constructionStartYear}</span></p>
        <p className="text-gray-700">End Date: <span className="font-medium">{data.constructionEndDate}</span></p>
        <p className="text-gray-700">Construction: <span className="font-medium">{data.constructionTimeYears.toFixed(2)} years</span></p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
