import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ContributionTypes = ({ username }) => {
  // In a real implementation, this data would come from a GitHub API call
  // This is simulated data for demonstration purposes
  const generateMockData = () => {
    // Create realistic-looking GitHub activity distribution
    return [
      { name: 'Code', value: 35 + Math.floor(Math.random() * 20), color: '#6366f1' },
      { name: 'Pull Requests', value: 15 + Math.floor(Math.random() * 15), color: '#8b5cf6' },
      { name: 'Issues', value: 10 + Math.floor(Math.random() * 10), color: '#ec4899' },
      { name: 'Code Reviews', value: 15 + Math.floor(Math.random() * 15), color: '#f97316' },
      { name: 'Discussion', value: 5 + Math.floor(Math.random() * 10), color: '#14b8a6' }
    ];
  };

  const data = generateMockData();
  
  // Generate fake repository stats
  const generateRepositoryStats = () => {
    return {
      totalRepos: 15 + Math.floor(Math.random() * 20),
      starsReceived: 100 + Math.floor(Math.random() * 500),
      forksReceived: 20 + Math.floor(Math.random() * 100),
      topLanguages: [
        { name: 'JavaScript', percentage: 40 + Math.floor(Math.random() * 20), color: '#f7df1e' },
        { name: 'TypeScript', percentage: 20 + Math.floor(Math.random() * 15), color: '#3178c6' },
        { name: 'Python', percentage: 10 + Math.floor(Math.random() * 10), color: '#3776ab' },
        { name: 'HTML/CSS', percentage: 5 + Math.floor(Math.random() * 5), color: '#e34c26' },
        { name: 'Other', percentage: 5 + Math.floor(Math.random() * 5), color: '#cccccc' }
      ]
    };
  };

  const repoStats = generateRepositoryStats();
  
  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p style={{ color: payload[0].payload.color }}>{`${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Contribution Types</h2>
        <p className="text-gray-600 mb-6">How {username || 'you'} contribute to GitHub (simulated data)</p>
        
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="md:w-1/2 flex flex-col justify-center">
            <ul className="space-y-3">
              {data.map((item, index) => (
                <li key={index} className="flex items-center">
                  <span 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-gray-700">{item.name}</span>
                  <span className="ml-auto font-semibold">{item.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Repository Stats</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="text-sm uppercase text-gray-500 font-medium">Total Repositories</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{repoStats.totalRepos}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="text-sm uppercase text-gray-500 font-medium">Stars Received</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{repoStats.starsReceived}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="text-sm uppercase text-gray-500 font-medium">Forks Received</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{repoStats.forksReceived}</p>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Top Languages</h3>
        
        <div className="space-y-3">
          {repoStats.topLanguages.map((language, index) => (
            <div key={index} className="relative">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{language.name}</span>
                <span className="text-sm font-medium text-gray-500">{language.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full" 
                  style={{ 
                    width: `${language.percentage}%`,
                    backgroundColor: language.color
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContributionTypes;