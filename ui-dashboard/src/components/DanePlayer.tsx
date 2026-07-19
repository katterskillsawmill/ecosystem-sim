"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Ecctrl } from 'ecctrl';

export default function DanePlayer() {
  return (
    <Ecctrl
      camInitDis={-0.01} // Force First-Person View by putting camera inside the head
      camMaxDis={-0.01}
      camMinDis={-0.01}
      maxVelLimit={5}
      jumpVel={4}
      position={[0, 5, 10]} // Spawn point
    >
      {/* Invisible hitbox for Dane */}
      <mesh visible={false}>
        <capsuleGeometry args={[0.5, 1, 4]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </Ecctrl>
  );
}
