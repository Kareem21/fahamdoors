import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import SceneInit from './SceneInit';
import ColorPicker from './ColorPicker';
import DimensionControls from './DimensionControls';
import FeatureToggle from './FeatureToggle';
import './closetconfigurator.css';

function ClosetConfigurator() {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1, height: 1, depth: 1 });
  const [colors, setColors] = useState({
    body: '#8B4513',
    doors: '#A0522D',
    drawers: '#D2691E',
    shelves: '#DEB887',
    safeBox: '#808080'
  });
  const [features, setFeatures] = useState({
    doors: true,
    drawers: true,
    shelves: true,
    safeBox: false
  });
  const [modelLoaded, setModelLoaded] = useState(false);
  const modelRef = useRef(null);
  const sceneRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  useEffect(() => {
    const test = new SceneInit('closetCanvas');
    test.initialize();
    sceneRef.current = test;

    const glftLoader = new GLTFLoader();
    glftLoader.load('/Wardrobe.glb',
        (gltfScene) => {
          modelRef.current = gltfScene.scene;
          gltfScene.scene.scale.set(5, 5, 5);
          gltfScene.scene.position.set(0, -10, 0);
          test.scene.add(gltfScene.scene);
          setModelLoaded(true);
          console.log('Model loaded successfully');
          gltfScene.scene.traverse((child) => {
            console.log(child.name);
          });
        },
        (progress) => {
          console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
        },
        (error) => {
          console.error('An error happened:', error);
        }
    );

    const handleResize = () => test.onWindowResize();
    window.addEventListener('resize', handleResize);

    const canvas = document.getElementById('closetCanvas');
    canvas.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      test.render();
      updateDoorRotation();
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      if (test.renderer) {
        test.renderer.dispose();
      }
      if (test.scene) {
        test.scene.clear();
      }
    };
  }, []);

  const onMouseMove = (event) => {
    const canvas = document.getElementById('closetCanvas');
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const updateDoorRotation = () => {
    if (!modelRef.current || !sceneRef.current) return;

    raycasterRef.current.setFromCamera(mouseRef.current, sceneRef.current.camera);
    const intersects = raycasterRef.current.intersectObjects(modelRef.current.children, true);

    const doorNames = ['Wardrobe_door_1', 'Wardrobe_door_2', 'Wardrobe_door_3'];
    const doors = doorNames.map(name => modelRef.current.getObjectByName(name));

    doors.forEach((door, index) => {
      if (door) {
        const isHovered = intersects.some(intersect => {
          let currentObj = intersect.object;
          while (currentObj) {
            if (currentObj === door) return true;
            currentObj = currentObj.parent;
          }
          return false;
        });
        const targetRotation = isHovered ? Math.PI / 2 : 0;
        const rotationFactor = index === 1 ? -1 : 1; // Invert rotation for middle door

        door.rotation.y = THREE.MathUtils.lerp(door.rotation.y, targetRotation * rotationFactor, 0.1);
      }
    });
  };

  const handleColorChange = (part, color) => {
    setColors(prevColors => ({ ...prevColors, [part]: color }));
    // Update model materials here
  };

  const handleDimensionChange = (dimension, value) => {
    setDimensions(prevDimensions => ({ ...prevDimensions, [dimension]: value }));
    if (modelRef.current) {
      modelRef.current.scale.set(value, value, value);
    }
  };

  const handleFeatureToggle = (feature) => {
    setFeatures(prevFeatures => ({ ...prevFeatures, [feature]: !prevFeatures[feature] }));
    // Toggle visibility of model parts here
  };

  return (
      <div className="closet-configurator-container">
        <div className="canvas-container">
          <canvas id="closetCanvas" ref={canvasRef} />
        </div>
        <div className="settings-panel">
          <h2>Customize Your Closet</h2>
          <DimensionControls dimensions={dimensions} onChange={handleDimensionChange} />
          <h3>Colors</h3>
          {Object.entries(colors).map(([part, color]) => (
              <ColorPicker key={part} label={part} color={color} onChange={(newColor) => handleColorChange(part, newColor)} />
          ))}
          <h3>Features</h3>
          {Object.entries(features).map(([feature, enabled]) => (
              <FeatureToggle key={feature} label={feature} enabled={enabled} onToggle={() => handleFeatureToggle(feature)} />
          ))}
          {modelLoaded ? <p>Model loaded successfully!</p> : <p>Loading model...</p>}
        </div>
      </div>
  );
}

export default ClosetConfigurator;