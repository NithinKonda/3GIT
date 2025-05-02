import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function GithubContributionHeatmap() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contributions, setContributions] = useState([]);
  
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  
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
      setUserData({ name: username, totalContributions: contributionData.reduce((acc, curr) => acc + curr.count, 0) });
    } catch (err) {
      setError('Error fetching GitHub data');
      console.error(err);
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
  
  // Initialize and render 3D scene
  useEffect(() => {
    if (!contributions.length || !canvasRef.current) return;
    
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf0f0f0);
    
    const camera = new THREE.PerspectiveCamera(
      60, 
      canvasRef.current.clientWidth / canvasRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(30, 30, 30);
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    
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
    
    // Create contribution cubes
    const weeksCount = Math.ceil(contributions.length / 7);
    const daysInWeek = 7;
    
    // Define colors for different contribution levels
    const colors = [
      0xebedf0, // No contributions
      0x9be9a8, // Level 1
      0x40c463, // Level 2
      0x30a14e, // Level 3
      0x216e39  // Level 4
    ];
    
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
      
      // Position the cube in the grid
      cube.position.x = week;
      cube.position.z = day;
      cube.position.y = height / 2; // Raise to sit on the "ground"
      
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
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Dispose of resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
      
      renderer.dispose();
    };
  }, [contributions]);
  
  // Handle form submission
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    fetchGithubData();
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">GitHub 3D Contribution Heatmap</h1>
      </header>
      
      <main className="flex-1 p-4">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username"
              className="flex-1 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Generate Heatmap'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {userData && (
          <div className="mb-4">
            <h2 className="text-xl font-bold">{username}'s GitHub Contributions</h2>
            <p className="text-gray-600">Total contributions: {userData.totalContributions}</p>
          </div>
        )}
        
        <div className="relative bg-white rounded-lg shadow-lg overflow-hidden h-96 md:h-96">
          {contributions.length > 0 ? (
            <canvas 
              ref={canvasRef} 
              className="w-full h-full"
            />
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
          <div className="mt-4 text-sm text-gray-600">
            <p>Tip: Click and drag to rotate the view. Scroll to zoom in/out.</p>
          </div>
        )}
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>GitHub 3D Contribution Heatmap Visualizer</p>
      </footer>
    </div>
  );
}