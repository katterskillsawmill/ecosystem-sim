"use client";

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { Text, Html } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { apiUrl } from '@/lib/api';

interface AgentProps {
  position: [number, number, number];
  role: string;
  name: string;
  dept?: string;
  folder?: string;
}

export default function AgentCharacter({ position, role, name, dept, folder }: AgentProps) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Mesh>(null);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const [inProximity, setInProximity] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');

  useFrame((state, delta) => {
    if (groupRef.current && headRef.current) {
      groupRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 4)) * 0.1;
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.3;
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  const isCoS = role === 'Chief of Staff';
  const isCOO = role === 'COO';
  const isKTRSKL = role === 'Shell Corp Entity';

  let color = '#6f9bd6';
  if (isCoS) color = '#c9a96a';
  if (isCOO) color = '#5fb98c';
  if (isKTRSKL) color = '#fb923c';

  const targetDept = dept || name;
  const targetFolder = folder;

  const run = async (action: string, prompt: string) => {
    setBusy(true);
    setLastResult('running…');
    try {
      const res = await fetch(apiUrl('/api/workflow/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          target_ecosystem: targetDept,
          folder: targetFolder,
          prompt,
          dry_run: false,
        }),
      });
      const data = await res.json();
      const msg = `${data.status} · ${data.eco_name || data.eco_path || '?'} · ${data.receipt || data.error || ''}`;
      setLastResult(msg);
    } catch (e: any) {
      setLastResult(`error: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders="cuboid">
        <group ref={groupRef} scale={active ? 1.2 : 1}>
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.2}
            color={hovered ? '#ffffff' : color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {name}
          </Text>

          <Text position={[0, 1.0, 0]} fontSize={0.12} color="#9aa2ad" anchorX="center" anchorY="middle">
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

      <RigidBody type="fixed">
        <CuboidCollider
          args={[2, 2, 2]}
          sensor
          onIntersectionEnter={() => setInProximity(true)}
          onIntersectionExit={() => setInProximity(false)}
        />
      </RigidBody>

      {inProximity && (
        <Html center position={[0, 2.5, 0]}>
          <div
            style={{
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
              fontFamily: 'monospace',
            }}
          >
            <h2 style={{ color, margin: '0 0 8px 0', textTransform: 'uppercase', fontSize: 14 }}>
              NEURAL LINK: {name}
            </h2>
            <p style={{ color: '#ef4444', fontWeight: 'bold', margin: '0 0 8px 0' }}>
              [PRESS ESC TO UNLOCK MOUSE]
            </p>
            <p style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: 12 }}>
              Target: {targetFolder || targetDept}
            </p>

            <div style={{ display: 'grid', gap: '10px' }}>
              <button
                disabled={busy}
                onClick={() => run('ooda', `OODA execute by agent ${name}`)}
                style={{
                  background: color,
                  color: '#0f172a',
                  border: 'none',
                  padding: '10px',
                  fontWeight: 'bold',
                  cursor: busy ? 'wait' : 'pointer',
                }}
              >
                {busy ? 'RUNNING…' : 'EXECUTE OODA LOOP'}
              </button>

              <button
                disabled={busy}
                onClick={() => run('review', `Architectural review requested from ${name}`)}
                style={{
                  background: 'transparent',
                  color,
                  border: `1px solid ${color}`,
                  padding: '10px',
                  cursor: busy ? 'wait' : 'pointer',
                }}
              >
                REQUEST REVIEW
              </button>

              <button
                disabled={busy}
                onClick={() => run('status', 'status')}
                style={{
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  padding: '8px',
                  cursor: busy ? 'wait' : 'pointer',
                }}
              >
                STATUS / LS
              </button>
            </div>
            {lastResult && (
              <p
                style={{
                  marginTop: 12,
                  fontSize: 10,
                  color: '#86efac',
                  wordBreak: 'break-all',
                  textAlign: 'left',
                }}
              >
                {lastResult}
              </p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
