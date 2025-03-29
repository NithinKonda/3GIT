import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const GitHub3DHeatmap = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [contributions, setContributions] = useState(null);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  // Function to fetch GitHub contributions
  const fetchContributions = async (username) => {
    setIsLoading(true);
    setError('');
    
    try {
      // In a real implementation, you would use the GitHub API
      // For demonstration, we'll create mock data
      const now = new Date();
      const startDate = new Date(now.getFullYear(), 0, 1);
      const days = Math.floor((now - startDate) / (24 * 60 * 60 * 1000));
      
      const mockData = [];
      for (let i = 0; i < 52; i++) {
        for (let j = 0; j < 7; j++) {
          const dayIndex = i * 7 + j;
          if (dayIndex <= days) {
            // Generate random contribution count, weighted to have some high peaks
            let count = 0;
            const rand = Math.random();
            if (rand > 0.95) {
              count = Math.floor(Math.random() * 20) + 10; // High activity
            } else if (rand > 0.7) {
              count = Math.floor(Math.random() * 5) + 1; // Medium activity
            }
            
            mockData.push({
              date: new Date(startDate.getTime() + dayIndex * 24 * 60 * 60 * 1000),
              count: count
            });
          }
        }
      }
      
      setContributions(mockData);
    } catch (err) {
      setError('Failed to fetch GitHub data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize and render the 3D scene
  useEffect(() => {
    if (!contributions || !mountRef.current) return;

    // Clean up any existing scene
    if (sceneRef.current) {
      mountRef.current.removeChild(sceneRef.current.domElement);
      sceneRef.current = null;
    }

    // Set up the scene
    const width = mountRef.current.clientWidth;
    const height = 400;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 10, 20);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Create grid for weeks and days
    const weeks = Math.ceil(contributions.length / 7);
    const gridWidth = weeks * 1.2;
    const gridHeight = 7 * 1.2;
    
    // Add a base plane
    const planeGeometry = new THREE.PlaneGeometry(gridWidth, gridHeight);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xdddddd, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    scene.add(plane);
    
    // Create contribution "mountains"
    const maxCount = Math.max(...contributions.map(c => c.count));
    const maxHeight = 5; // Maximum height for visualization
    
    contributions.forEach((contribution, idx) => {
      const weekIdx = Math.floor(idx / 7);
      const dayIdx = idx % 7;
      
      const x = weekIdx * 1.2 - gridWidth / 2 + 0.6;
      const z = dayIdx * 1.2 - gridHeight / 2 + 0.6;
      
      // Skip if no contributions
      if (contribution.count === 0) return;
      
      // Calculate height based on contribution count
      const height = (contribution.count / maxCount) * maxHeight;
      
      // Create a "mountain" for this day
      const geometry = new THREE.CylinderGeometry(0.4, 0.6, height, 6);
      
      // Color based on contribution intensity
      const intensity = contribution.count / maxCount;
      const color = new THREE.Color(
        0.1,
        0.4 + intensity * 0.6, // More green for more contributions
        0.1
      );
      
      const material = new THREE.MeshLambertMaterial({ color });
      const cylinder = new THREE.Mesh(geometry, material);
      
      cylinder.position.set(x, height / 2, z);
      scene.add(cylinder);
    });
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Store reference for cleanup
    sceneRef.current = renderer;
    
    // Cleanup function
    return () => {
      if (sceneRef.current && mountRef.current) {
        mountRef.current.removeChild(sceneRef.current.domElement);
        sceneRef.current = null;
      }
    };
  }, [contributions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      fetchContributions(username);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">GitHub 3D Contribution Heatmap</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Generate'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div
        ref={mountRef}
        className="w-full h-96 bg-gray-200 rounded-md overflow-hidden"
        style={{ display: contributions ? 'block' : 'none' }}
      />
      
      {!contributions && !isLoading && (
        <div className="p-8 text-center text-gray-500">
          Enter a GitHub username to generate the 3D heatmap visualization
        </div>
      )}
      
      {isLoading && (
        <div className="p-8 text-center text-gray-500">
          Loading contribution data...
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>The visualization shows your GitHub contributions as a 3D landscape:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Higher mountains represent days with more contributions</li>
          <li>Darker green indicates higher activity</li>
          <li>You can rotate, zoom, and pan the visualization</li>
        </ul>
      </div>
    </div>
  );
};

export default GitHub3DHeatmap;