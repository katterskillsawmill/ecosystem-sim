"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Text, KeyboardControls } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import AgentCharacter from './AgentCharacter';
import DanePlayer from './DanePlayer';
import AIDataCenter from './AIDataCenter';

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['Shift'] },
];

export default function Headquarters3D({ domainData }: { domainData: any }) {
  const entities = domainData?.entities || [];

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      {/* ecctrl requires KeyboardControls at the top level */}
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 8, 15], fov: 45 }}>
          {/* Distance Fog */}
          <fog attach="fog" args={['#87CEEB', 50, 400]} />

          {/* Massive Voxel Environment Lighting */}
          <ambientLight intensity={1.8} />
          <directionalLight position={[50, 100, 50]} intensity={2.5} castShadow />
          <pointLight position={[-10, 20, -10]} intensity={1.5} color="#c9a96a" />
          
          <Sky distance={450000} sunPosition={[100, 20, 100]} inclination={0} azimuth={0.25} />
          
          <Suspense fallback={null}>
            <Physics gravity={[0, -9.81, 0]}>
              {/* The Player Controller */}
              <DanePlayer />

              {/* Central Power Source & Data Center */}
              <AIDataCenter />

              {/* Massive Voxel Grass/Concrete Global Floor */}
              <RigidBody type="fixed">
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                  <planeGeometry args={[1000, 1000]} />
                  <meshStandardMaterial color="#2E3A34" roughness={1} />
                </mesh>
              </RigidBody>
              <gridHelper args={[1000, 1000, '#1a1f1c', '#1a1f1c']} position={[0, -0.49, 0]} />

              {/* Dynamic Ecosystem Buildings from Big Brain API */}
              {entities.map((entity: any, index: number) => {
                // Calculate massive grid positions further out so they surround the Data Center
                const radius = 100;
                const angle = (index / entities.length) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                
                return (
                  <group key={index} position={[x, 0, z]}>
                    {/* Hollow Ecosystem Building so player can enter */}
                    <RigidBody type="fixed">
                      {/* Back Wall */}
                      <mesh position={[0, 2, -2.5]} castShadow receiveShadow>
                        <boxGeometry args={[6, 4, 1]} />
                        <meshStandardMaterial color="#1a1c23" roughness={0.9} />
                      </mesh>
                      {/* Side Walls */}
                      <mesh position={[-2.5, 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1, 4, 6]} />
                        <meshStandardMaterial color="#1a1c23" roughness={0.9} />
                      </mesh>
                      <mesh position={[2.5, 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1, 4, 6]} />
                        <meshStandardMaterial color="#1a1c23" roughness={0.9} />
                      </mesh>
                      {/* Front Wall with Doorway */}
                      <mesh position={[-2, 2, 2.5]} castShadow receiveShadow>
                        <boxGeometry args={[2, 4, 1]} />
                        <meshStandardMaterial color="#1a1c23" roughness={0.9} />
                      </mesh>
                      <mesh position={[2, 2, 2.5]} castShadow receiveShadow>
                        <boxGeometry args={[2, 4, 1]} />
                        <meshStandardMaterial color="#1a1c23" roughness={0.9} />
                      </mesh>
                      {/* Roof */}
                      <mesh position={[0, 4.2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[6.4, 0.4, 6.4]} />
                        <meshStandardMaterial color="#23282f" roughness={0.9} />
                      </mesh>
                    </RigidBody>

                    {/* Department Signage */}
                    <Text
                      position={[0, 5, 0]}
                      fontSize={0.5}
                      color="#f8fafc"
                      anchorX="center"
                      anchorY="middle"
                      outlineWidth={0.03}
                      outlineColor="#000000"
                    >
                      {entity.dept}
                    </Text>

                    {/* NPC Agent guarding the building */}
                    <AgentCharacter 
                      position={[0, 0.5, 4]} 
                      role={entity.role} 
                      name={entity.name}
                    />
                  </group>
                );
              })}
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
