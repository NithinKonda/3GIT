import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function GithubContributionHeatmap() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contributions, setContributions] = useState([]);
  const [hoveredContribution, setHoveredContribution] = useState(null);
  
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const tooltipRef = useRef(null);
  
  // Fetch GitHub contribution data
  const fetchGithubData = async () => {
    if (!username) return;
    
    setLoading(true);
    setError('');
    try {
      // This is a simple simulation of GitHub API data for demonstration
      // In a real app, you would make an actual API call to GitHub
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create sample contribution data (for demo purposes)
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
      setUserData({ 
        name: username, 
        totalContributions: contributionData.reduce((acc, curr) => acc + curr.count, 0),
        streaks: calculateStreaks(contributionData),
        mostActiveDay: getMostActiveDay(contributionData),
        averageDaily: calculateAverage(contributionData)
      });
    } catch (err) {
      setError('Error fetching GitHub data');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
  
  // Determine contribution level based on count
  const getContributionLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 8) return 3;
    return 4;
  };
  
  // Handle mouse movements for hover effect
  const handleMouseMove = (event) => {
    if (!sceneRef.current || !contributions.length) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(x, y);
    
    raycaster.setFromCamera(mouse, sceneRef.current.userData.camera);
    
    const intersects = raycaster.intersectObjects(sceneRef.current.children);
    
    if (intersects.length > 0) {
      // Find the first intersection that is a contribution cube (not grid or other objects)
      const intersectedCube = intersects.find(item => 
        item.object.userData && item.object.userData.isContributionCube
      );
      
      if (intersectedCube) {
        setHoveredContribution(intersectedCube.object.userData.contributionData);
        
        // Position tooltip near the mouse
        if (tooltipRef.current) {
          tooltipRef.current.style.left = `${event.clientX + 10}px`;
          tooltipRef.current.style.top = `${event.clientY + 10}px`;
        }
      } else {
        setHoveredContribution(null);
      }
    } else {
      setHoveredContribution(null);
    }
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoveredContribution(null);
  };
  
  // Initialize and render 3D scene
  useEffect(() => {
    if (!contributions.length || !canvasRef.current) return;
    
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf6f8fa); // GitHub-like background
    
    const camera = new THREE.PerspectiveCamera(
      60, 
      canvasRef.current.clientWidth / canvasRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(30, 30, 30);
    
    // Store camera in scene userData for raycaster
    scene.userData.camera = camera;
    
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true,
      alpha: true
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 20);
    scene.add(directionalLight);
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent camera from going below the ground
    
    // Create contribution cubes
    const weeksCount = Math.ceil(contributions.length / 7);
    const daysInWeek = 7;
    
    // Define colors for different contribution levels (GitHub-like colors)
    const colors = [
      0xebedf0, // No contributions
      0x9be9a8, // Level 1
      0x40c463, // Level 2
      0x30a14e, // Level 3
      0x216e39  // Level 4
    ];
    
    // Add month labels
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let lastMonth = -1;
    
    contributions.forEach((contribution, index) => {
      const date = new Date(contribution.date);
      const month = date.getMonth();
      const week = Math.floor(index / 7);
      
      if (month !== lastMonth && index % 7 === 0) {
        lastMonth = month;
        
        // Create month label
        const monthLabel = document.createElement('div');
        monthLabel.textContent = monthNames[month];
        monthLabel.style.position = 'absolute';
        monthLabel.style.left = `${(week / weeksCount) * 100}%`;
        monthLabel.style.bottom = '-25px';
        monthLabel.style.fontSize = '12px';
        monthLabel.style.color = '#586069';
        
        // We would append this in a real DOM, but for Three.js we'd need TextGeometry
        // This is just to demonstrate the concept
      }
    });
    
    // Create each contribution cube
    contributions.forEach((contribution, index) => {
      const week = Math.floor(index / 7);
      const day = index % 7;
      
      // Create cube with height based on contribution count
      const height = contribution.count * 0.3 + 0.1;
      const cubeGeometry = new THREE.BoxGeometry(0.9, height, 0.9);
      
      // Set color based on contribution level
      const material = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color(colors[contribution.level])
      });
      
      const cube = new THREE.Mesh(cubeGeometry, material);
      
      // Store contribution data in the cube for hover interactions
      cube.userData = {
        isContributionCube: true,
        contributionData: {
          ...contribution,
          week,
          day
        }
      };
      
      // Position the cube in the grid
      cube.position.x = week;
      cube.position.z = day;
      cube.position.y = height / 2; // Raise to sit on the "ground"
      
      // Store original position and scale for hover animation
      cube.userData.originalY = cube.position.y;
      cube.userData.originalHeight = height;
      
      scene.add(cube);
    });
    
    // Add a grid for reference
    const gridHelper = new THREE.GridHelper(weeksCount + 2, weeksCount + 2, 0x888888, 0xcccccc);
    gridHelper.position.x = (weeksCount - 1) / 2;
    gridHelper.position.z = (daysInWeek - 1) / 2;
    scene.add(gridHelper);     
    // Center camera on the grid
    controls.target.set((weeksCount - 1) / 2, 0, (daysInWeek - 1) / 2);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Apply hover effects
      scene.traverse((object) => {
        if (object.userData && object.userData.isContributionCube) {
          if (hoveredContribution && 
              hoveredContribution.date === object.userData.contributionData.date) {
            // Highlight hovered cube
            object.position.y = object.userData.originalY + 0.2;
            object.scale.y = 1.1;
            object.material.emissive.set(0x555555);
          } else {
            // Reset to original state
            object.position.y = object.userData.originalY;
            object.scale.y = 1;
            object.material.emissive.set(0x000000);
          }
        }
      });
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Add event listeners for hover effects
    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('mouseleave', handleMouseLeave);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      canvasRef.current.removeEventListener('mousemove', handleMouseMove);
      canvasRef.current.removeEventListener('mouseleave', handleMouseLeave);
      
      // Dispose of resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
      
      renderer.dispose();
    };
  }, [contributions, hoveredContribution]);
  
  // Handle form submission
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    fetchGithubData();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">GitHub 3D Contribution Heatmap</h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username"
              className="flex-1 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : 'Generate Heatmap'}
            </button>
          </form>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}
        
        {userData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Contributions</h3>
              <p className="text-3xl font-bold text-blue-600">{userData.totalContributions}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Longest Streak</h3>
              <p className="text-3xl font-bold text-green-600">{userData.streaks.longest} days</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Most Active Day</h3>
              <p className="text-3xl font-bold text-purple-600">{userData.mostActiveDay}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Daily Average</h3>
              <p className="text-3xl font-bold text-amber-600">{userData.averageDaily}</p>
            </div>
          </div>
        )}
        
        <div className="relative bg-white rounded-lg shadow-lg overflow-hidden h-96 md:h-96">
          {contributions.length > 0 ? (
            <>
              <canvas 
                ref={canvasRef} 
                className="w-full h-full cursor-move"
              />
              
              {/* Tooltip */}
              {hoveredContribution && (
                <div 
                  ref={tooltipRef}
                  className="absolute bg-gray-900 text-white px-3 py-2 rounded shadow-lg text-sm z-10 pointer-events-none"
                  style={{
                    left: 0,
                    top: 0,
                    transform: 'translate(0, 0)',
                    opacity: 0.9
                  }}
                >
                  <p className="font-semibold">{formatDate(hoveredContribution.date)}</p>
                  <p>{hoveredContribution.count} contribution{hoveredContribution.count !== 1 ? 's' : ''}</p>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              {loading ? (
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Loading contribution data...</p>
                </div>
              ) : (
                <p>Enter a GitHub username to view their contribution heatmap in 3D</p>
              )}
            </div>
          )}
        </div>
        
        {contributions.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Interaction Tips</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Click and drag to rotate the view</li>
              <li>• Scroll to zoom in/out</li>
              <li>• Hover over any cube to see contribution details</li>
              <li>• Higher columns represent more contributions on that day</li>
            </ul>
          </div>
        )}
      </main>
      
      <footer className="bg-gray-900 text-white p-4 text-center">
        <p>GitHub 3D Contribution Heatmap Visualizer</p>
      </footer>
    </div>
  );
}