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

      {/* Massive proximity sensor (4x4) so you don't clip into the desk */}
      <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={() => setInProximity(true)} onIntersectionExit={() => { setInProximity(false); setIsFullscreen(false); }}>
        <CuboidCollider args={[4, 2, 4]} />
      </RigidBody>

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
