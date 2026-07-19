"use client";

import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Box } from '@react-three/drei';

export default function AIDataCenter() {
  return (
    <group position={[0, 0, 0]}>
      {/* The Central Power Source Core */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[2, 2, 8, 32]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
      </mesh>

      {/* Static Floor */}
      <RigidBody type="fixed">
        <mesh position={[0, -0.25, 0]} receiveShadow>
          <boxGeometry args={[30, 0.5, 30]} />
          <meshStandardMaterial color="#1a1c23" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Hollow Walls (Composite Colliders) */}
      <RigidBody type="fixed">
        {/* North Wall */}
        <Box args={[30, 10, 1]} position={[0, 5, -15]}>
          <meshStandardMaterial color="#0f172a" />
        </Box>
        <CuboidCollider args={[15, 5, 0.5]} position={[0, 5, -15]} />

        {/* East Wall */}
        <Box args={[1, 10, 30]} position={[15, 5, 0]}>
          <meshStandardMaterial color="#0f172a" />
        </Box>
        <CuboidCollider args={[0.5, 5, 15]} position={[15, 5, 0]} />

        {/* West Wall */}
        <Box args={[1, 10, 30]} position={[-15, 5, 0]}>
          <meshStandardMaterial color="#0f172a" />
        </Box>
        <CuboidCollider args={[0.5, 5, 15]} position={[-15, 5, 0]} />

        {/* South Wall with Massive Doorway */}
        <Box args={[12, 10, 1]} position={[-9, 5, 15]}>
          <meshStandardMaterial color="#0f172a" />
        </Box>
        <CuboidCollider args={[6, 5, 0.5]} position={[-9, 5, 15]} />
        
        <Box args={[12, 10, 1]} position={[9, 5, 15]}>
          <meshStandardMaterial color="#0f172a" />
        </Box>
        <CuboidCollider args={[6, 5, 0.5]} position={[9, 5, 15]} />
        
        {/* Top Door Frame */}
        <Box args={[6, 4, 1]} position={[0, 8, 15]}>
          <meshStandardMaterial color="#0f172a" />
        </Box>
        <CuboidCollider args={[3, 2, 0.5]} position={[0, 8, 15]} />
      </RigidBody>

      {/* Server Racks (Symbolic) */}
      {[...Array(20)].map((_, i) => (
        <RigidBody type="fixed" key={i}>
          <mesh position={[-10 + (i % 5) * 5, 2, -10 + Math.floor(i / 5) * 4]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 4, 1.5]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <CuboidCollider args={[0.75, 2, 0.75]} position={[-10 + (i % 5) * 5, 2, -10 + Math.floor(i / 5) * 4]} />
        </RigidBody>
      ))}
    </group>
  );
}
