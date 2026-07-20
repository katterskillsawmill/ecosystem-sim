"use client";

import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export default function JupyterTerminal({ position }: { position: [number, number, number] }) {
  const [inProximity, setInProximity] = useState(false);
  
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={() => setInProximity(true)} onIntersectionExit={() => setInProximity(false)}>
        <CuboidCollider args={[8, 4, 8]} />
      </RigidBody>

      {/* Physics Research Desk */}
      <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 1, 3]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      
      {/* Glowing Computer Terminal Mesh */}
      <mesh position={[0, 0, -1]} castShadow>
        <boxGeometry args={[2.5, 1.2, 0.2]} />
        <meshStandardMaterial color="#c9a96a" emissive="#c9a96a" emissiveIntensity={1.5} />
      </mesh>

      {inProximity && (
        <Html position={[0, 3, 0]} transform distanceFactor={7} zIndexRange={[100, 0]}>
          <div style={{ width: '1200px', height: '800px', border: '4px solid #c9a96a', background: '#000' }}>
             <iframe src="http://localhost:8888/lab/tree/landauer_limit_simulation.ipynb" width="100%" height="100%" style={{ border: 'none' }} />
          </div>
        </Html>
      )}
    </group>
  );
}
