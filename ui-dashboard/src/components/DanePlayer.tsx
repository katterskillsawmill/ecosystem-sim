"use client";

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

const SPEED = 20;
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

export default function DanePlayer() {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls();

  useEffect(() => {
    // Force camera click-to-lock instruction overlay if needed
  }, []);

  useFrame((state) => {
    if (!rigidBodyRef.current) return;

    const { forward, backward, left, right, jump } = getKeys();
    
    // Read the player's current physical velocity
    const velocity = rigidBodyRef.current.linvel();

    // Update camera position to follow the invisible physical hitbox
    const translation = rigidBodyRef.current.translation();
    camera.position.set(translation.x, translation.y + 0.4, translation.z); // Precise 1.8m human eye level

    // Movement calculation
    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED)
      .applyEuler(camera.rotation); // Move exactly where camera is looking

    // Apply movement physics while preserving gravity (y velocity)
    rigidBodyRef.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);

    // Jumping
    if (jump && Math.abs(velocity.y) < 0.05) {
      rigidBodyRef.current.setLinvel({ x: velocity.x, y: 10, z: velocity.z }, true);
    }
  });

  return (
    <>
      <PointerLockControls />
      <RigidBody 
        ref={rigidBodyRef} 
        colliders={false} 
        mass={1} 
        type="dynamic" 
        position={[0, 5, 120]} // Spawn completely outside the massive Data Center to guarantee a clean drop to the courtyard floor
        enabledRotations={[false, false, false]} // Don't let the capsule tip over
      >
        <CapsuleCollider args={[0.3, 0.3]} />
        <mesh visible={false}>
          <capsuleGeometry args={[0.3, 0.6]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </RigidBody>
    </>
  );
}
