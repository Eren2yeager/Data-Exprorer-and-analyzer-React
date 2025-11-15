/**
 * Data Visualization Components
 * Charts and graphs for data analysis
 */
import React from 'react';
import { Card, Badge } from '../ui';

/**
 * Simple Bar Chart Component
 */
export const BarChart = ({ data, title, height = 300 }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-8 text-sm">No data to display</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="overflow-hidden">
      {title && <h3 className="font-semibold mb-4 text-sm md:text-base">{title}</h3>}
      <div className="space-y-2 md:space-y-3 overflow-auto" style={{ maxHeight: height }}>
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="w-20 md:w-32 text-xs md:text-sm font-medium truncate flex-shrink-0" title={item.label}>
              {item.label}
            </div>
            <div className="flex-1 flex items-center gap-1 md:gap-2 min-w-0">
              <div className="flex-1 bg-gray-100 rounded-full h-6 md:h-8 overflow-hidden min-w-0">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-end px-2 md:px-3 transition-all duration-500"
                  style={{ width: `${Math.max((item.value / maxValue) * 100, 5)}%` }}
                >
                  <span className="text-white text-xs font-semibold whitespace-nowrap">
                    {item.value}
                  </span>
                </div>
              </div>
              <div className="w-10 md:w-16 text-xs md:text-sm text-gray-600 text-right flex-shrink-0">
                {item.percentage ? `${item.percentage}%` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Pie Chart Component (using CSS)
 */
export const PieChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-8 text-sm">No data to display</div>;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = [
    'bg-purple-500',
    'bg-pink-500',
    'bg-blue-500',
    'bg-cyan-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500'
  ];

  return (
    <div className="overflow-hidden">
      {title && <h3 className="font-semibold mb-4 text-sm md:text-base">{title}</h3>}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
        {/* Pie visualization */}
        <div className="relative w-32 h-32 md:w-48 md:h-48 flex-shrink-0">
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const rotation = data
                .slice(0, index)
                .reduce((sum, d) => sum + (d.value / total) * 360, 0);
              
              return (
                <div
                  key={index}
                  className={`absolute inset-0 ${colors[index % colors.length]}`}
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${
                      50 + 50 * Math.sin((rotation * Math.PI) / 180)
                    }% ${50 - 50 * Math.cos((rotation * Math.PI) / 180)}%, ${
                      50 + 50 * Math.sin(((rotation + (percentage * 3.6)) * Math.PI) / 180)
                    }% ${50 - 50 * Math.cos(((rotation + (percentage * 3.6)) * Math.PI) / 180)}%)`
                  }}
                />
              );
            })}
          </div>
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1 md:space-y-2 w-full min-w-0">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 ${colors[index % colors.length]}`} />
                <span className="text-xs md:text-sm truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <span className="text-xs md:text-sm font-semibold">{item.value}</span>
                <span className="text-xs text-gray-600">
                  ({((item.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Stats Grid Component
 */
export const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="text-center p-3 md:p-4">
          <div className="text-xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
            {stat.value}
          </div>
          <div className="text-xs md:text-sm text-gray-600 mt-1 truncate">{stat.label}</div>
          {stat.change && (
            <Badge
              variant={stat.change > 0 ? 'success' : 'danger'}
              size="sm"
              className="mt-2"
            >
              {stat.change > 0 ? '+' : ''}{stat.change}%
            </Badge>
          )}
        </Card>
      ))}
    </div>
  );
};

/**
 * Field Type Distribution Component
 */
export const FieldTypeDistribution = ({ fields }) => {
  if (!fields || fields.length === 0) {
    return <div className="text-gray-500 text-center py-8">No fields to display</div>;
  }

  // Count types
  const typeCounts = {};
  fields.forEach(field => {
    const type = field.primaryType || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const data = Object.entries(typeCounts).map(([label, value]) => ({
    label,
    value
  }));

  return <PieChart data={data} title="Field Type Distribution" />;
};

/**
 * Field Frequency Chart
 */
export const FieldFrequencyChart = ({ fields, limit = 10 }) => {
  if (!fields || fields.length === 0) {
    return <div className="text-gray-500 text-center py-8">No fields to display</div>;
  }

  const sortedFields = [...fields]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);

  const data = sortedFields.map(field => ({
    label: field.path,
    value: field.count,
    percentage: (field.frequency * 100).toFixed(1)
  }));

  return <BarChart data={data} title="Field Frequency" />;
};

/**
 * Data Quality Score Component
 */
export const DataQualityScore = ({ fields, totalDocuments }) => {
  if (!fields || fields.length === 0) {
    return null;
  }

  // Calculate quality metrics
  const requiredFields = fields.filter(f => f.isRequired).length;
  const uniqueFields = fields.filter(f => f.isUnique).length;
  const avgFrequency = fields.reduce((sum, f) => sum + f.frequency, 0) / fields.length;
  
  const qualityScore = Math.round(
    (requiredFields / fields.length) * 30 +
    (uniqueFields / fields.length) * 30 +
    avgFrequency * 40
  );

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4 text-sm md:text-base">Data Quality Score</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - qualityScore / 100)}`}
              className={getScoreColor(qualityScore)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl md:text-3xl font-bold ${getScoreColor(qualityScore)}`}>
                {qualityScore}
              </div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-xs md:text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-gray-600 truncate">Required Fields</span>
          <span className="font-semibold flex-shrink-0">{requiredFields}/{fields.length}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-600 truncate">Unique Fields</span>
          <span className="font-semibold flex-shrink-0">{uniqueFields}/{fields.length}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-600 truncate">Avg Frequency</span>
          <span className="font-semibold flex-shrink-0">{(avgFrequency * 100).toFixed(1)}%</span>
        </div>
      </div>
    </Card>
  );
};

export default {
  BarChart,
  PieChart,
  StatsGrid,
  FieldTypeDistribution,
  FieldFrequencyChart,
  DataQualityScore
};
