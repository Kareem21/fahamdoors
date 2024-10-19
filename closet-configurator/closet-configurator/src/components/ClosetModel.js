import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const ClosetModel = ({ dimensions, colors, features, modelUrl }) => {
  console.log("Attempting to load model from URL:", modelUrl);

  const groupRef = useRef();
  console.log("GLTF model loaded:", gltf);

  const gltf = useLoader(GLTFLoader, modelUrl, undefined, (error) => {
    console.error("Error loading model:", error);
  });
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
