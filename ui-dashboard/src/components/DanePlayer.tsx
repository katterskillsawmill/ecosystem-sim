"use client";

import React, { useRef, useEffect, useState } from 'react';
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
  const [isThirdPerson, setIsThirdPerson] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyV') {
        setIsThirdPerson((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useFrame((state) => {
    if (!rigidBodyRef.current) return;

    const { forward, backward, left, right, jump } = getKeys();
    const velocity = rigidBodyRef.current.linvel();
    const translation = rigidBodyRef.current.translation();

    // Camera View Toggle
    if (isThirdPerson) {
      // Third-Person Over-the-Shoulder Camera
      const offset = new THREE.Vector3(0, 1.5, 4);
      // We apply the camera's rotation to the offset so the camera orbits behind the player's view
      const rotatedOffset = offset.applyEuler(new THREE.Euler(0, camera.rotation.y, 0));
      camera.position.set(
        translation.x + rotatedOffset.x,
        translation.y + rotatedOffset.y,
        translation.z + rotatedOffset.z
      );
    } else {
      // First-Person Camera
      camera.position.set(translation.x, translation.y + 0.4, translation.z); 
    }

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
        position={[0, 5, 120]} 
        enabledRotations={[false, false, false]} 
      >
        <CapsuleCollider args={[0.3, 0.3]} />
        <mesh visible={isThirdPerson}>
          <capsuleGeometry args={[0.3, 0.6]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.8} />
        </mesh>
      </RigidBody>
    </>
  );
}
