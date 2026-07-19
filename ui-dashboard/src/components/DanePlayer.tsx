"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { PointerLockControls, useKeyboardControls, Html } from '@react-three/drei';
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

  const [isLocked, setIsLocked] = useState(false);

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
      const offset = new THREE.Vector3(0, 1.5, 4);
      const rotatedOffset = offset.applyEuler(new THREE.Euler(0, camera.rotation.y, 0));
      camera.position.set(
        translation.x + rotatedOffset.x,
        translation.y + rotatedOffset.y,
        translation.z + rotatedOffset.z
      );
    } else {
      camera.position.set(translation.x, translation.y + 0.4, translation.z); 
    }

    // Only apply keyboard movement if pointer is locked, otherwise player can't look around while interacting with UI
    if (isLocked) {
      frontVector.set(0, 0, Number(backward) - Number(forward));
      sideVector.set(Number(left) - Number(right), 0, 0);

      direction
        .subVectors(frontVector, sideVector)
        .normalize()
        .multiplyScalar(SPEED)
        .applyEuler(camera.rotation); 

      rigidBodyRef.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);

      if (jump && Math.abs(velocity.y) < 0.05) {
        rigidBodyRef.current.setLinvel({ x: velocity.x, y: 10, z: velocity.z }, true);
      }
    } else {
      // Decelerate if unlocked
      rigidBodyRef.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true);
    }
  });

  return (
    <>
      <PointerLockControls 
        onLock={() => setIsLocked(true)}
        onUnlock={() => setIsLocked(false)}
        selector="#lock-button"
      />
      
      {!isLocked && (
        <Html fullscreen zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '10vh' }}>
            <h1 style={{ color: '#38bdf8', fontFamily: 'monospace', textShadow: '0 0 10px #38bdf8', background: 'rgba(0,0,0,0.5)', padding: '10px' }}>NEURAL LINK: STANDBY</h1>
            <p style={{ color: 'white', fontFamily: 'monospace', background: 'rgba(0,0,0,0.5)', padding: '5px' }}>You can now freely click the Holographic UIs.</p>
            <button id="lock-button" style={{ 
              pointerEvents: 'auto',
              marginTop: '20px', padding: '15px 30px', fontSize: '1.2rem', 
              background: '#38bdf8', color: '#0f172a', border: 'none', 
              cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 0 15px #38bdf8' 
            }}>
              CLICK HERE TO LOCK MOUSE & RESUME MOVEMENT
            </button>
          </div>
        </Html>
      )}

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
