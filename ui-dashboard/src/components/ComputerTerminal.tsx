"use client";

import React, { useState } from 'react';
import * as THREE from 'three';
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
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<string[]>([
    "SYSTEM ONLINE. WAITING FOR DIRECTIVE.",
    `> Directory Scanned: ${dept}`,
    "> AI Payload Router: STANDBY"
  ]);
  
  const endOfMessagesRef = React.useRef<HTMLDivElement>(null);
  
  // Conditionally load texture if provided
  const texture = logoUrl ? useTexture(logoUrl) : null;

  React.useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    
    const newCommand = command;
    setCommand('');
    setLogs(prev => [...prev, `root@${dept}:~$ ${newCommand}`]);
    
    if (newCommand.toLowerCase().includes('execute') || newCommand.toLowerCase().includes('ooda')) {
      setLogs(prev => [...prev, `[SYSTEM] Firing POST /api/ooda/execute for ${dept}...`]);
      try {
        const res = await fetch(`http://localhost:3131/api/ooda/execute?target_ecosystem=${dept}`, { method: 'POST' });
        const data = await res.json();
        setLogs(prev => [...prev, `[SUCCESS] Marathon Cycle Complete. Target: ${data.target}`]);
      } catch (err) {
        setLogs(prev => [...prev, `[ERROR] Failed to contact Python Big Brain.`]);
      }
    } else {
      setLogs(prev => [...prev, `[BASH] Command not found: ${newCommand}. Try 'execute workflow'`]);
    }
  };

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
      
      <div style={{ flex: 1, overflowY: 'auto', fontSize: isFullscreen ? '1.2rem' : '0.9rem', marginBottom: '10px' }}>
        {logs.map((log, i) => (
          <p key={i} style={{ margin: '5px 0' }}>{log}</p>
        ))}
        {isFullscreen && (
          <div style={{ marginTop: '20px', color: brandColor }}>
            <p>[SYSTEM LOG] Entering Fullscreen Immersion Mode.</p>
            <p>[AI ROUTER] Kimi / Grok / ComfyUI / Cursor / Mangos integration nodes standing by.</p>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <form onSubmit={handleCommand} style={{ display: 'flex', marginTop: '10px' }}>
        <span style={{ padding: '10px', background: 'transparent', color: brandColor, fontWeight: 'bold' }}>&gt;</span>
        <input 
          autoFocus
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Type 'execute workflow'..."
          style={{ 
            flex: 1, background: 'rgba(0,0,0,0.5)', color: '#fff', border: `1px solid ${brandColor}`, 
            padding: '10px', outline: 'none', fontFamily: 'monospace', fontSize: '1rem' 
          }} 
        />
        <button type="submit" style={{ 
          padding: '10px 20px', background: brandColor, color: '#0f172a', 
          border: 'none', fontWeight: 'bold', cursor: 'pointer', marginLeft: '10px' 
        }}>
          SEND
        </button>
      </form>
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
          <meshBasicMaterial 
            map={texture} 
            transparent 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
          />
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
