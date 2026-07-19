"use client";

import React, { useState } from 'react';
import { Html, useTexture } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

interface TerminalProps {
  position: [number, number, number];
  dept: string;
  brandColor?: string;
  logoUrl?: string;
}

export default function ComputerTerminal({ position, dept, brandColor = "#38bdf8", logoUrl }: TerminalProps) {
  const [inProximity, setInProximity] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Conditionally load texture if provided
  const texture = logoUrl ? useTexture(logoUrl) : null;

  const TerminalUI = () => (
    <div style={{
      width: isFullscreen ? '100vw' : '400px',
      height: isFullscreen ? '100vh' : '300px',
      background: 'rgba(2, 6, 23, 0.95)',
      border: `2px solid ${brandColor}`,
      borderRadius: isFullscreen ? '0' : '10px',
      padding: isFullscreen ? '40px' : '20px',
      color: brandColor,
      fontFamily: 'monospace',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: `0 0 20px ${brandColor}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${brandColor}`, paddingBottom: '10px', marginBottom: '10px' }}>
        <h2 style={{ margin: 0, fontSize: isFullscreen ? '2rem' : '1.2rem' }}>{dept.toUpperCase()} CONSOLE</h2>
        <div>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            style={{ background: 'transparent', border: `1px solid ${brandColor}`, color: brandColor, cursor: 'pointer', padding: '5px 10px', marginRight: '10px' }}
          >
            {isFullscreen ? '[MINIMIZE]' : '[MAXIMIZE TERMINAL]'}
          </button>
          <button 
            onClick={() => { setInProximity(false); setIsFullscreen(false); }} 
            style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', padding: '5px 10px' }}
          >
            [CLOSE]
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', fontSize: isFullscreen ? '1.2rem' : '0.9rem' }}>
        <p>SYSTEM ONLINE. WAITING FOR DIRECTIVE.</p>
        <p>> Directory Scanned: {dept}</p>
        <p>> AI Payload Router: STANDBY</p>
        {isFullscreen && (
          <div style={{ marginTop: '20px', color: brandColor }}>
            <p>[SYSTEM LOG] Entering Fullscreen Immersion Mode.</p>
            <p>[AI ROUTER] Kimi / Grok / ComfyUI / Cursor / Mangos integration nodes standing by for execution.</p>
          </div>
        )}
      </div>

      <button onClick={() => alert(`OODA Loop Marathon Fired for ${dept} via POST /api/ooda/execute! NIMs, Qwen, DeepSeek, and Azure Quantum are now executing.`)} style={{ 
        marginTop: '10px', padding: '10px', background: brandColor, color: '#0f172a', 
        border: 'none', fontWeight: 'bold', cursor: 'pointer' 
      }}>
        EXECUTE WORKFLOW
      </button>
    </div>
  );

  return (
    <group position={position}>
      {/* Massive proximity sensor (4x4) */}
      <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={() => setInProximity(true)} onIntersectionExit={() => { setInProximity(false); setIsFullscreen(false); }}>
        <CuboidCollider args={[4, 2, 4]} />
      </RigidBody>

      {/* The Computer Desk */}
      <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 1, 1.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* Glowing Computer Terminal Mesh */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 0.8, 0.2]} />
        <meshStandardMaterial color={brandColor} emissive={brandColor} emissiveIntensity={1.5} />
      </mesh>

      {/* Bespoke Interior Wall Art Frame */}
      {texture && (
        <mesh position={[0, 1.5, -0.76]} castShadow>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial map={texture} transparent />
        </mesh>
      )}

      {/* The Holographic Display */}
      {inProximity && !isFullscreen && (
        <Html position={[0, 1.5, 0]} transform distanceFactor={5} zIndexRange={[100, 0]}>
          <TerminalUI />
        </Html>
      )}

      {/* Fullscreen Breakout UI */}
      {isFullscreen && (
        <Html fullscreen zIndexRange={[100, 0]}>
          <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'auto' }}>
            <TerminalUI />
          </div>
        </Html>
      )}
    </group>
  );
}
