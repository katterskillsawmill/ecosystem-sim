"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Ecctrl } from 'ecctrl';

export default function DanePlayer() {
  return (
    <Ecctrl
      maxVelLimit={8}
      jumpVel={5}
      position={[0, 20, 60]} // Spawn outside the data center in the massive courtyard
      camInitDis={-0.01} // First person mode
      camMaxDis={-0.01}
      camMinDis={-0.01}
    >
      {/* Invisible hitbox for Dane */}
      <mesh visible={false}>
        <capsuleGeometry args={[0.5, 1, 4]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </Ecctrl>
  );
}
