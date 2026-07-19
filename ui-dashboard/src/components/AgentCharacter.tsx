"use client";

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { Text } from '@react-three/drei';

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

  useFrame((state, delta) => {
    if (groupRef.current && headRef.current) {
      // Minecraft style walking/bobbing
      groupRef.current.position.y = position[1] + Math.abs(Math.sin(state.clock.elapsedTime * 4)) * 0.1;
      // Head looking around slightly
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.3;
      // Turn entire body slowly
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  const isCoS = role === "Chief of Staff";
  const isCOO = role === "COO";
  const isKTRSKL = role === "Shell Corp Entity";

  // Minecraft Character Voxel Proportions
  // Head: 0.5 x 0.5 x 0.5
  // Body: 0.5 x 0.75 x 0.25

  let color = '#6f9bd6'; // default agent
  if (isCoS) color = '#c9a96a'; // Gold for Cooplux
  if (isCOO) color = '#5fb98c'; // Green for Plux
  if (isKTRSKL) color = '#fb923c'; // Orange for KTRSKL

  return (
    <group ref={groupRef} position={position} scale={active ? 1.2 : 1}>
      {/* Voxel Nametag */}
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

      {/* Voxel Head */}
      <mesh ref={headRef} position={[0, 0.625, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* Voxel Body */}
      <mesh position={[0, 0, 0]} onClick={() => setActive(!active)} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
        <boxGeometry args={[0.5, 0.75, 0.25]} />
        <meshStandardMaterial color={hovered ? '#ffffff' : color} roughness={0.8} />
      </mesh>
    </group>
  );
}
