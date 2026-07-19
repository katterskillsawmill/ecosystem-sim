"use client";

import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

interface TerminalProps {
  position: [number, number, number];
  dept: string;
}

export default function ComputerTerminal({ position, dept }: TerminalProps) {
  const [inProximity, setInProximity] = useState(false);

  return (
    <group position={position}>
      {/* Procedural Corporate Desk Interior */}
      <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 1, 1.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      
      {/* Glowing Computer Terminal Mesh */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 0.8, 0.2]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.5} />
      </mesh>

      {/* Invisible Proximity Sensor to trigger the Holographic Viewport */}
      <RigidBody type="fixed">
        <CuboidCollider 
          args={[2, 2, 2]} 
          sensor 
          onIntersectionEnter={() => setInProximity(true)} 
          onIntersectionExit={() => setInProximity(false)} 
        />
      </RigidBody>

      {/* Massive React UI Viewport triggered by proximity */}
      {inProximity && (
        <Html center position={[0, 1.5, 0]} transform>
          <div style={{
            background: 'rgba(2, 6, 23, 0.95)',
            border: `2px solid #38bdf8`,
            padding: '20px',
            borderRadius: '8px',
            color: '#38bdf8',
            width: '600px',
            height: '400px',
            textAlign: 'left',
            boxShadow: `0 0 30px #38bdf8`,
            backdropFilter: 'blur(10px)',
            pointerEvents: 'auto',
            fontFamily: 'monospace',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #38bdf8', paddingBottom: '10px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, textTransform: 'uppercase', fontSize: '24px' }}>// DIRECTORY: {dept}</h2>
              <span style={{ color: '#ef4444', fontWeight: 'bold', animation: 'blink 1s infinite' }}>[PRESS ESC TO UNLOCK MOUSE]</span>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', background: '#0f172a', padding: '10px', border: '1px solid #1e293b' }}>
              <p style={{ color: '#a3e635', margin: '0 0 5px 0' }}>{'>'} Scanning ecosystem files...</p>
              <p style={{ color: '#94a3b8', margin: '0 0 5px 0' }}>- /src/workflows/main.py</p>
              <p style={{ color: '#94a3b8', margin: '0 0 5px 0' }}>- /src/agents/handler.py</p>
              <p style={{ color: '#94a3b8', margin: '0 0 5px 0' }}>- /tests/verification.py</p>
              <p style={{ color: '#94a3b8', margin: '0 0 5px 0' }}>- README.md</p>
              <p style={{ color: '#a3e635', margin: '15px 0 5px 0' }}>{'>'} Status: ONLINE</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => alert(`Opening Code Editor for ${dept}`)} style={{
                background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px'
              }}>OPEN CODE EDITOR</button>
              
              <button onClick={() => alert(`Executing Workflows in ${dept}`)} style={{
                background: 'transparent', color: '#38bdf8', border: `1px solid #38bdf8`, padding: '15px', cursor: 'pointer', fontSize: '16px'
              }}>EXECUTE WORKFLOWS</button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
