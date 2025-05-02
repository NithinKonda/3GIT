import { useState } from 'react';
import GithubContributionHeatmap from './GitHeatMap';
import ContributionStats from './ContributionStats';
import ContributionTypes from './ContributionTypes';

export default function GitHubProfileDashboard() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('heatmap');
  
  // Fetch GitHub data
  const fetchGitHubData = async (username) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock data - in a real app this would come from GitHub API
      const today = new Date();
      const contributionData = [];
      
      // Generate 365 days of mock data
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (364 - i));
        
        const count = Math.floor(Math.random() * 12); // Random contribution count
        contributionData.push({
          date: date.toISOString().split('T')[0],
          count,
          level: getContributionLevel(count)
        });
      }
      
      setContributions(contributionData);
      
      // Set user data
      setUserData({
        name: username,
        avatarUrl: `https://ui-avatars.com/api/?name=${username}&background=random`,
        totalContributions: contributionData.reduce((acc, curr) => acc + curr.count, 0),
        streaks: calculateStreaks(contributionData),
        mostActiveDay: getMostActiveDay(contributionData),
        averageDaily: calculateAverage(contributionData)
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error fetching GitHub data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Determine contribution level based on count
  const getContributionLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 8) return 3;
    return 4;
  };
  
  // Calculate longest streak
  const calculateStreaks = (data) => {
    let currentStreak = 0;
    let longestStreak = 0;
    
    data.forEach(day => {
      if (day.count > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return {
      current: currentStreak,
      longest: longestStreak
    };
  };
  
  // Get most active day of the week
  const getMostActiveDay = (data) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    
    data.forEach(item => {
      const date = new Date(item.date);
      const dayIndex = date.getDay();
      dayCounts[dayIndex] += item.count;
    });
    
    let maxIndex = 0;
    for (let i = 1; i < 7; i++) {
      if (dayCounts[i] > dayCounts[maxIndex]) {
        maxIndex = i;
      }
    }
    
    return daysOfWeek[maxIndex];
  };
  
  // Calculate average daily contributions
  const calculateAverage = (data) => {
    const total = data.reduce((sum, day) => sum + day.count, 0);
    return (total / data.length).toFixed(1);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!username.trim()) return;
    fetchGitHubData(username);
  };
  
  // Example usernames for demo
  const exampleUsernames = ['octocat', 'torvalds', 'gaearon', 'yyx990803', 'kentcdodds'];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white pt-6 pb-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">GitHub Profile Dashboard</h1>
          <p className="text-gray-300 mb-6">Visualize GitHub contributions and activity in 3D</p>
          
          <div className="max-w-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username"
                className="flex-1 px-4 py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Generate Dashboard'}
              </button>
            </form>
            
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-gray-300">Try examples:</span>
              {exampleUsernames.map(name => (
                <button
                  key={name}
                  onClick={() => {
                    setUsername(name);
                    fetchGitHubData(name);
                  }}
                  className="text-sm text-blue-300 hover:text-blue-100 hover:underline"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile data for {username}...</p>
            </div>
          </div>
        )}
        
        {userData && !loading && (
          <>
            {/* User Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col sm:flex-row items-center">
              <img 
                src={userData.avatarUrl} 
                alt={`${userData.name}'s avatar`} 
                className="w-24 h-24 rounded-full border-4 border-gray-100 shadow mb-4 sm:mb-0 sm:mr-6"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{userData.name}</h2>
                <p className="text-gray-600">GitHub Activity Dashboard</p>
                
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Contributions</p>
                    <p className="text-lg font-semibold text-blue-600">{userData.totalContributions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Longest Streak</p>
                    <p className="text-lg font-semibold text-green-600">{userData.streaks.longest} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Most Active Day</p>
                    <p className="text-lg font-semibold text-purple-600">{userData.mostActiveDay}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Daily Average</p>
                    <p className="text-lg font-semibold text-amber-600">{userData.averageDaily}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('heatmap')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'heatmap'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  3D Contribution Heatmap
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'stats'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Contribution Stats
                </button>
                <button
                  onClick={() => setActiveTab('types')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'types'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Activity Types
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="mb-8">
              {activeTab === 'heatmap' && (
                <div className="h-96 md:h-96">
                  <GithubContributionHeatmap 
                    username={userData.name}
                    userData={userData}
                    contributions={contributions}
                  />
                </div>
              )}
              
              {activeTab === 'stats' && (
                <ContributionStats 
                  contributions={contributions}
                  userData={userData}
                />
              )}
              
              {activeTab === 'types' && (
                <ContributionTypes username={userData.name} />
              )}
            </div>
          </>
        )}
        
        {!userData && !loading && (
          <div className="text-center py-12">
            <svg 
              className="mx-auto h-24 w-24 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No GitHub profile loaded</h3>
            <p className="mt-1 text-sm text-gray-500">Enter a GitHub username to see their contribution data.</p>
          </div>
        )}
      </main>
      
      <footer className="bg-gray-900 text-white py-6 px-4">
        <div className="container mx-auto">
          <p className="text-center text-gray-400">GitHub 3D Profile Dashboard</p>
          <p className="text-center text-gray-500 text-sm mt-2">Using Three.js for 3D visualization</p>
        </div>
      </footer>
    </div>
  );
}