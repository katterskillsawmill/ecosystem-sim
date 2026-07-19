"use client";

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Text } from '@react-three/drei';
import AgentCharacter from './AgentCharacter';

export default function Headquarters3D({ domainData }: { domainData: any }) {
  const entities = domainData?.entities || [];

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas camera={{ position: [0, 8, 15], fov: 45 }}>
        {/* Minecraft Voxel Environment Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#c9a96a" />
        
        {/* Minecraft Style Skybox */}
        <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} target={[0, 0, 0]} />

        {/* Voxel Grass/Concrete Grid Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#2E3A34" roughness={1} />
        </mesh>

        {/* Grid Lines for Voxel feel */}
        <gridHelper args={[50, 50, '#1a1f1c', '#1a1f1c']} position={[0, -0.49, 0]} />

        {/* Render Minecraft Voxel Buildings & Agents */}
        {entities.map((entity: any, index: number) => {
          // Calculate grid positions
          const x = (index % 4) * 6 - 9;
          const z = Math.floor(index / 4) * 6 - 9;
          
          return (
            <group key={index} position={[x, 0, z]}>
              {/* Voxel Building Base (e.g., Office/Data Center) */}
              <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 2, 3]} />
                <meshStandardMaterial color="#1a1c23" roughness={0.9} />
              </mesh>
              
              {/* Building Roof */}
              <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.2, 0.2, 3.2]} />
                <meshStandardMaterial color="#23282f" roughness={0.9} />
              </mesh>

              {/* Department Signage */}
              <Text
                position={[0, 2.6, 0]}
                fontSize={0.3}
                color="#f8fafc"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
              >
                {entity.dept}
              </Text>

              {/* Minecraft Voxel Agent Character standing near their building */}
              <AgentCharacter 
                position={[0, 0.5, 2]} 
                role={entity.role} 
                name={entity.name}
              />
            </group>
          );
        })}
      </Canvas>
    </div>
  );
}
