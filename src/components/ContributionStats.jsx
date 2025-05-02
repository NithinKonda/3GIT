import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ContributionStats = ({ contributions, }) => {
  if (!contributions || !contributions.length) {
    return null;
  }

  // Process data for different charts
  const getMonthlyData = () => {
    const monthlyData = Array(12).fill(0).map((_, idx) => ({
      name: new Date(2023, idx).toLocaleString('default', { month: 'short' }),
      contributions: 0
    }));
    
    contributions.forEach(contribution => {
      const date = new Date(contribution.date);
      const month = date.getMonth();
      monthlyData[month].contributions += contribution.count;
    });
    
    return monthlyData;
  };
  
  const getDailyData = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyData = daysOfWeek.map(day => ({ name: day, contributions: 0 }));
    
    contributions.forEach(contribution => {
      const date = new Date(contribution.date);
      const day = date.getDay();
      dailyData[day].contributions += contribution.count;
    });
    
    return dailyData;
  };
  
  const getHourlyDistribution = () => {
    // In a real app, we would have timestamp data
    // This is simulated data for demonstration
    const hourlyData = [];
    for (let i = 0; i < 24; i++) {
      const hour = i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i-12}pm`;
      
      // Create a distribution peaking around 11am-3pm and 8-10pm
      let value;
      if (i >= 9 && i <= 15) {
        value = 15 + Math.floor(Math.random() * 10);
      } else if (i >= 20 && i <= 22) {
        value = 10 + Math.floor(Math.random() * 8);
      } else {
        value = Math.floor(Math.random() * 5);
      }
      
      hourlyData.push({
        name: hour,
        contributions: value
      });
    }
    
    return hourlyData;
  };
  
  // Get streak data for visualization
  const getStreakData = () => {
    const streakData = [];
    let currentStreak = 0;
    
    contributions.forEach((day, index) => {
      if (day.count > 0) {
        currentStreak++;
      } else {
        if (currentStreak > 0) {
          streakData.push({
            startDate: contributions[index - currentStreak].date,
            endDate: contributions[index - 1].date,
            length: currentStreak
          });
          currentStreak = 0;
        }
      }
    });
    
    // Add the last streak if we ended on one
    if (currentStreak > 0) {
      const lastIndex = contributions.length - 1;
      streakData.push({
        startDate: contributions[lastIndex - currentStreak + 1].date,
        endDate: contributions[lastIndex].date,
        length: currentStreak
      });
    }
    
    return streakData.sort((a, b) => b.length - a.length).slice(0, 5); // Top 5 streaks
  };
  
  const monthlyData = getMonthlyData();
  const dailyData = getDailyData();
  const hourlyData = getHourlyDistribution();
  const streakData = getStreakData();
  
  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-sm">
          <p className="font-semibold">{label}</p>
          <p className="text-green-600">{`${payload[0].value} contributions`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Contribution Distribution</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Distribution */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Monthly Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="contributions" fill="#40c463" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Day of Week Distribution */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Day of Week Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="contributions" fill="#30a14e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Hour of Day Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Time of Day Activity</h2>
        <p className="text-gray-600 mb-4">When you're most likely to contribute (simulated data)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="contributions" fill="#216e39" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Top Streaks */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Top Contribution Streaks</h2>
        
        {streakData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {streakData.map((streak, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{streak.length} days</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(streak.startDate).toLocaleDateString()} - {new Date(streak.endDate).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No streaks found in this period</p>
        )}
      </div>
    </div>
  );
};

export default ContributionStats;