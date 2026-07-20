"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Text, KeyboardControls, useTexture } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import AgentCharacter from './AgentCharacter';
import DanePlayer from './DanePlayer';
import AIDataCenter from './AIDataCenter';
import ComputerTerminal from './ComputerTerminal';
import JupyterTerminal from './JupyterTerminal';

function QRCodePoster({ position, url }: { position: [number, number, number], url: string }) {
  const texture = useTexture(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(url)}`);
  return (
    <mesh position={position} castShadow>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['Shift'] },
  { name: 'toggleView', keys: ['KeyV'] },
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
              <JupyterTerminal position={[20, 0, 20]} />

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
                // Brutally massive scaling based on real file sizes
                const sizeMb = entity.size_mb || 0.1;
                const fileCount = entity.num_files || 1;
                
                // Base dimensions
                let buildingSize = 6;
                let height = 4;
                
                // If it's a massive ecosystem, make it a massive skyscraper/warehouse
                if (fileCount > 50 || sizeMb > 10) {
                  buildingSize = Math.max(10, sizeMb * 1.5 + (fileCount / 20));
                  height = Math.max(10, sizeMb * 2.0 + (fileCount / 10));
                } else if (fileCount > 5) {
                  // Medium ecosystem
                  buildingSize = 8;
                  height = 6;
                }
                
                // Clamp maximums so it doesn't break the physics grid
                buildingSize = Math.min(buildingSize, 40);
                height = Math.min(height, 60);
                
                // Calculate massive grid positions further out so they surround the Data Center
                const radius = 250; // Explode out to 250
                const angle = (index / entities.length) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                
                const halfW = buildingSize / 2;
                const isMassive = sizeMb > 10 || fileCount > 50;
                const brandColor = isMassive ? "#c9a96a" : "#38bdf8";

                return (
                  <group key={index} position={[x, 0, z]}>
                    {/* Hollow Ecosystem Building so player can enter */}
                    <RigidBody type="fixed">
                      {/* Back Wall */}
                      <mesh position={[0, height / 2, -halfW + 0.5]} castShadow receiveShadow>
                        <boxGeometry args={[buildingSize, height, 1]} />
                        <meshStandardMaterial color="#1a1c23" roughness={0.9} />
                      </mesh>
                      {/* Side Walls */}
                      <mesh position={[-halfW + 0.5, height / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1, height, buildingSize]} />
                        <meshStandardMaterial color="#1a1c23" roughness={0.9} />
                      </mesh>
                      <mesh position={[halfW - 0.5, height / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1, height, buildingSize]} />
                        <meshStandardMaterial color="#1a1c23" roughness={0.9} />
                      </mesh>
                      {/* Front Wall with Doorway */}
                      <mesh position={[-halfW / 2 - 1, height / 2, halfW - 0.5]} castShadow receiveShadow>
                        <boxGeometry args={[halfW - 2, height, 1]} />
                        <meshStandardMaterial color="#1a1c23" roughness={0.9} />
                      </mesh>
                      <mesh position={[halfW / 2 + 1, height / 2, halfW - 0.5]} castShadow receiveShadow>
                        <boxGeometry args={[halfW - 2, height, 1]} />
                        <meshStandardMaterial color="#1a1c23" roughness={0.9} />
                      </mesh>
                      {/* Roof */}
                      <mesh position={[0, height + 0.2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[buildingSize + 0.4, 0.4, buildingSize + 0.4]} />
                        <meshStandardMaterial color="#23282f" roughness={0.9} />
                      </mesh>
                    </RigidBody>

                    {/* Interactive Computer Terminal with Viewport & Bespoke Wall Art */}
                    <ComputerTerminal 
                      position={[0, 1.25, -halfW + 2]} 
                      dept={entity.dept} 
                      brandColor={brandColor}
                      logoUrl={isMassive ? "/cooperlux_transparent.png" : undefined}
                    />

                    {/* Massive Floating Holographic Signage Above Building */}
                    <Text
                      position={[0, height + 8, 0]}
                      fontSize={Math.max(2, buildingSize / 4)}
                      color={brandColor}
                      anchorX="center"
                      anchorY="middle"
                      outlineWidth={0.05}
                      outlineColor={brandColor}
                    >
                      {entity.dept.toUpperCase()}
                    </Text>

                    {/* Department Signage - Glowing Neon Exterior Above Doorway */}
                    <Text
                      position={[0, height / 2 + 1.5, halfW - 0.45]}
                      fontSize={Math.max(0.5, buildingSize / 15)}
                      color={brandColor}
                      anchorX="center"
                      anchorY="bottom"
                      outlineWidth={0.03}
                      outlineColor={brandColor}
                    >
                      {entity.dept.toUpperCase()}
                    </Text>

                    {/* Left Wall QR Code: GitHub Repo */}
                    <QRCodePoster 
                      position={[-1.5, 1.5, halfW - 0.49]} 
                      url={`https://github.com/cooperlux/${entity.dept.replace(/\s+/g, '-').toLowerCase()}`} 
                    />

                    {/* Right Wall QR Code: Live Production Site */}
                    <QRCodePoster 
                      position={[1.5, 1.5, halfW - 0.49]} 
                      url={`https://cooperlux.com/features/${entity.dept.replace(/\s+/g, '-').toLowerCase()}`} 
                    />

                    {/* NPC Agent guarding the building - placed directly in front of doorway */}
                    <AgentCharacter 
                      position={[0, 0.5, halfW + 2]} 
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
