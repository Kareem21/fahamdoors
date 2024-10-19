# Create project directory
New-Item -ItemType Directory -Force -Path closet-configurator
Set-Location closet-configurator

# Initialize npm project
npm init -y

# Install dependencies
npm install react react-dom @react-three/fiber @react-three/drei three
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react webpack webpack-cli webpack-dev-server babel-loader css-loader style-loader html-webpack-plugin

# Create directory structure
New-Item -ItemType Directory -Force -Path src, public, src/components

# Create webpack.config.js
@"
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 3000,
  },
};
"@ | Out-File -FilePath webpack.config.js -Encoding utf8

# Create .babelrc
@"
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
"@ | Out-File -FilePath .babelrc -Encoding utf8

# Create public/index.html
@"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Closet Configurator</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
"@ | Out-File -FilePath public/index.html -Encoding utf8

# Create src/index.js
@"
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"@ | Out-File -FilePath src/index.js -Encoding utf8

# Create src/App.js
@"
import React from 'react';
import ClosetConfigurator from './components/ClosetConfigurator';

function App() {
  return (
    <div className="App">
      <ClosetConfigurator />
    </div>
  );
}

export default App;
"@ | Out-File -FilePath src/App.js -Encoding utf8

# Create src/components/ClosetConfigurator.js
@"
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ClosetModel from './ClosetModel';
import ColorPicker from './ColorPicker';
import DimensionControls from './DimensionControls';
import FeatureToggle from './FeatureToggle';
import FileUpload from './FileUpload';

function ClosetConfigurator() {
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
  const [modelUrl, setModelUrl] = useState(null);

  const handleColorChange = (part, color) => {
    setColors(prevColors => ({ ...prevColors, [part]: color }));
  };

  const handleDimensionChange = (dimension, value) => {
    setDimensions(prevDimensions => ({ ...prevDimensions, [dimension]: value }));
  };

  const handleFeatureToggle = (feature) => {
    setFeatures(prevFeatures => ({ ...prevFeatures, [feature]: !prevFeatures[feature] }));
  };

  const handleFileUpload = (url) => {
    setModelUrl(url);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '70%', height: '100%' }}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <ClosetModel
            dimensions={dimensions}
            colors={colors}
            features={features}
            modelUrl={modelUrl}
          />
          <OrbitControls />
        </Canvas>
      </div>
      <div style={{ width: '30%', padding: '20px', overflowY: 'auto' }}>
        <h2>Customize Your Closet</h2>
        <FileUpload onUpload={handleFileUpload} />
        <DimensionControls dimensions={dimensions} onChange={handleDimensionChange} />
        <h3>Colors</h3>
        {Object.entries(colors).map(([part, color]) => (
          <ColorPicker key={part} label={part} color={color} onChange={(newColor) => handleColorChange(part, newColor)} />
        ))}
        <h3>Features</h3>
        {Object.entries(features).map(([feature, enabled]) => (
          <FeatureToggle key={feature} label={feature} enabled={enabled} onToggle={() => handleFeatureToggle(feature)} />
        ))}
      </div>
    </div>
  );
}

export default ClosetConfigurator;
"@ | Out-File -FilePath src/components/ClosetConfigurator.js -Encoding utf8

# Create src/components/ClosetModel.js
@"
import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const ClosetModel = ({ dimensions, colors, features, modelUrl }) => {
  const groupRef = useRef();
  const gltf = useLoader(GLTFLoader, modelUrl);

  useEffect(() => {
    if (gltf) {
      // Apply colors to the model
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material.color.setStyle(colors.body);
        }
      });
    }
  }, [gltf, colors]);

  useEffect(() => {
    if (gltf && groupRef.current) {
      // Apply dimensions to the model
      groupRef.current.scale.set(dimensions.width, dimensions.height, dimensions.depth);
    }
  }, [gltf, dimensions]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  if (!gltf) {
    return (
      <mesh>
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
        <meshStandardMaterial color={colors.body} />
      </mesh>
    );
  }

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  );
};

export default ClosetModel;
"@ | Out-File -FilePath src/components/ClosetModel.js -Encoding utf8

# Create src/components/ColorPicker.js
@"
import React from 'react';

function ColorPicker({ label, color, onChange }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <label>
        {label}:
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          style={{ marginLeft: '10px' }}
        />
      </label>
    </div>
  );
}

export default ColorPicker;
"@ | Out-File -FilePath src/components/ColorPicker.js -Encoding utf8

# Create src/components/DimensionControls.js
@"
import React from 'react';

function DimensionControls({ dimensions, onChange }) {
  return (
    <div>
      <h3>Dimensions</h3>
      {Object.entries(dimensions).map(([dimension, value]) => (
        <div key={dimension} style={{ marginBottom: '10px' }}>
          <label>
            {dimension.charAt(0).toUpperCase() + dimension.slice(1)}:
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(dimension, parseFloat(e.target.value))}
              step="0.1"
              min="0.1"
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
      ))}
    </div>
  );
}

export default DimensionControls;
"@ | Out-File -FilePath src/components/DimensionControls.js -Encoding utf8

# Create src/components/FeatureToggle.js
@"
import React from 'react';

function FeatureToggle({ label, enabled, onToggle }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
        />
        {label}
      </label>
    </div>
  );
}

export default FeatureToggle;
"@ | Out-File -FilePath src/components/FeatureToggle.js -Encoding utf8

# Create src/components/FileUpload.js
@"
import React, { useCallback } from 'react';

function FileUpload({ onUpload }) {
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpload(url);
    }
  }, [onUpload]);

  return (
    <div>
      <h3>Upload GLTF Model</h3>
      <input type="file" accept=".gltf,.glb" onChange={handleFileChange} />
    </div>
  );
}

export default FileUpload;
"@ | Out-File -FilePath src/components/FileUpload.js -Encoding utf8

# Update package.json scripts
$packageJson = Get-Content -Raw -Path package.json | ConvertFrom-Json
$packageJson.scripts = @{
    "start" = "webpack serve --mode development"
    "build" = "webpack --mode production"
}
$packageJson | ConvertTo-Json -Depth 100 | Set-Content package.json

Write-Host "Project setup complete. To run the project:"
Write-Host "1. Ensure you're in the project directory: cd closet-configurator"
Write-Host "2. Install dependencies: npm install"
Write-Host "3. Start the development server: npm start"