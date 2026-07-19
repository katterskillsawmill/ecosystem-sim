"use client";

import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Box } from '@react-three/drei';

export default function AIDataCenter() {
  const size = 150; // Colossal 150x150 warehouse
  const height = 40;
  const half = size / 2;
  const thickness = 2;

  return (
    <group position={[0, 0, 0]}>
      {/* Massive Central Power Source Core */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[10, 10, height, 64]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={3} />
      </mesh>

      {/* Massive Static Floor */}
      <RigidBody type="fixed">
        <mesh position={[0, -0.25, 0]} receiveShadow>
          <boxGeometry args={[size, 0.5, size]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Hollow Walls (Composite Colliders) */}
      <RigidBody type="fixed">
        {/* North Wall */}
        <Box args={[size, height, thickness]} position={[0, height / 2, -half]}>
          <meshStandardMaterial color="#020617" />
        </Box>
        <CuboidCollider args={[half, height / 2, thickness / 2]} position={[0, height / 2, -half]} />

        {/* East Wall */}
        <Box args={[thickness, height, size]} position={[half, height / 2, 0]}>
          <meshStandardMaterial color="#020617" />
        </Box>
        <CuboidCollider args={[thickness / 2, height / 2, half]} position={[half, height / 2, 0]} />

        {/* West Wall */}
        <Box args={[thickness, height, size]} position={[-half, height / 2, 0]}>
          <meshStandardMaterial color="#020617" />
        </Box>
        <CuboidCollider args={[thickness / 2, height / 2, half]} position={[-half, height / 2, 0]} />

        {/* South Wall with MASSIVE Doorway */}
        <Box args={[half - 10, height, thickness]} position={[-(half/2 + 5), height / 2, half]}>
          <meshStandardMaterial color="#020617" />
        </Box>
        <CuboidCollider args={[(half - 10) / 2, height / 2, thickness / 2]} position={[-(half/2 + 5), height / 2, half]} />
        
        <Box args={[half - 10, height, thickness]} position={[(half/2 + 5), height / 2, half]}>
          <meshStandardMaterial color="#020617" />
        </Box>
        <CuboidCollider args={[(half - 10) / 2, height / 2, thickness / 2]} position={[(half/2 + 5), height / 2, half]} />
        
        {/* Top Door Frame */}
        <Box args={[20, 10, thickness]} position={[0, height - 5, half]}>
          <meshStandardMaterial color="#020617" />
        </Box>
        <CuboidCollider args={[10, 5, thickness / 2]} position={[0, height - 5, half]} />
      </RigidBody>

      {/* Massive Server Racks Forest */}
      {[...Array(200)].map((_, i) => (
        <RigidBody type="fixed" key={i}>
          <mesh position={[-60 + (i % 20) * 6, 5, -60 + Math.floor(i / 20) * 8]} castShadow receiveShadow>
            <boxGeometry args={[3, 10, 3]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <CuboidCollider args={[1.5, 5, 1.5]} position={[-60 + (i % 20) * 6, 5, -60 + Math.floor(i / 20) * 8]} />
        </RigidBody>
      ))}
    </group>
  );
}
