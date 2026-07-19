"use client";

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { Text, Html } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

interface AgentProps {
  position: [number, number, number];
  role: string;
  name: string;
}

export default function AgentCharacter({ position, role, name }: AgentProps) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Mesh>(null);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const [inProximity, setInProximity] = useState(false);

  useFrame((state, delta) => {
    if (groupRef.current && headRef.current) {
      groupRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 4)) * 0.1;
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.3;
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  const isCoS = role === "Chief of Staff";
  const isCOO = role === "COO";
  const isKTRSKL = role === "Shell Corp Entity";

  let color = '#6f9bd6';
  if (isCoS) color = '#c9a96a';
  if (isCOO) color = '#5fb98c';
  if (isKTRSKL) color = '#fb923c';

  return (
    <group position={position}>
      {/* Physical Agent Hitbox */}
      <RigidBody type="fixed" colliders="cuboid">
        <group ref={groupRef} scale={active ? 1.2 : 1}>
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.2}
            color={hovered ? "#ffffff" : color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {name}
          </Text>

          <Text
            position={[0, 1.0, 0]}
            fontSize={0.12}
            color="#9aa2ad"
            anchorX="center"
            anchorY="middle"
          >
            [{role}]
          </Text>

          <mesh ref={headRef} position={[0, 0.625, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>

          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.75, 0.25]} />
            <meshStandardMaterial color={hovered ? '#ffffff' : color} roughness={0.8} />
          </mesh>
        </group>
      </RigidBody>

      {/* Invisible Proximity Sensor for Interaction */}
      <RigidBody type="fixed">
        <CuboidCollider 
          args={[2, 2, 2]} 
          sensor 
          onIntersectionEnter={() => setInProximity(true)} 
          onIntersectionExit={() => setInProximity(false)} 
        />
      </RigidBody>

      {/* Massive React UI Overlay triggered by proximity */}
      {inProximity && (
        <Html center position={[0, 2.5, 0]}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: `2px solid ${color}`,
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            width: '450px',
            textAlign: 'center',
            boxShadow: `0 0 20px ${color}`,
            backdropFilter: 'blur(10px)',
            pointerEvents: 'auto',
            fontFamily: 'monospace'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ color: color, margin: 0, textTransform: 'uppercase' }}>ACCESSING NEURAL LINK: {name}</h2>
            </div>
            <p style={{ color: '#ef4444', fontWeight: 'bold', margin: '0 0 10px 0', animation: 'blink 1s infinite' }}>[PRESS ESC TO UNLOCK MOUSE]</p>
            <p style={{ margin: '0 0 20px 0', color: '#94a3b8' }}>Authentication Verified. Connection established with {role}.</p>
            
            <div style={{ display: 'grid', gap: '10px' }}>
              <button onClick={() => alert(`Initiating OODA Loop Workflow for ${name}`)} style={{
                background: color, color: '#0f172a', border: 'none', padding: '10px', fontWeight: 'bold', cursor: 'pointer'
              }}>EXECUTE OODA LOOP</button>
              
              <button onClick={() => alert(`Requesting Architectural Review from ${name}`)} style={{
                background: 'transparent', color: color, border: `1px solid ${color}`, padding: '10px', cursor: 'pointer'
              }}>REQUEST REVIEW</button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
