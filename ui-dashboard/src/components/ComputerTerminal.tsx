"use client";

import React, { useState } from 'react';
import { Html, useTexture } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { apiUrl, wsUrl } from '@/lib/api';

interface TerminalProps {
  position: [number, number, number];
  dept: string;
  folder?: string;
  brandColor?: string;
  logoUrl?: string;
}

export default function ComputerTerminal({
  position,
  dept,
  folder,
  brandColor = "#38bdf8",
  logoUrl,
}: TerminalProps) {
  const [inProximity, setInProximity] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<string[]>([
    "SYSTEM ONLINE. WAITING FOR DIRECTIVE.",
    `> Directory: ${dept}`,
    `> Folder: ${folder || '(resolve by dept)'}`,
    "> Commands: status | doctor | execute | mine | review | <free text>",
  ]);

  const endOfMessagesRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let ws: WebSocket | undefined;
    try {
      ws = new WebSocket(wsUrl('/api/twin/stream'));
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.log) {
            setLogs((prev) => [...prev.slice(-49), `[STREAM] ${data.log}`]);
          }
        } catch {
          /* ignore */
        }
      };
    } catch {
      /* ignore */
    }
    return () => {
      try {
        ws?.close();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const texture = logoUrl ? useTexture(logoUrl) : null;

  React.useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const runWorkflow = async (action: string, prompt: string) => {
    const res = await fetch(apiUrl('/api/workflow/run'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        target_ecosystem: dept,
        folder: folder || undefined,
        prompt,
        dry_run: false,
      }),
    });
    return res.json();
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const newCommand = command;
    setCommand('');
    setLogs((prev) => [...prev, `root@${dept}:~$ ${newCommand}`]);

    const lower = newCommand.toLowerCase();
    try {
      let data: any;
      if (lower.includes('execute') || lower.includes('ooda') || lower.includes('workflow')) {
        setLogs((prev) => [...prev, `[SYSTEM] Running OODA-lite on estate dir...`]);
        data = await runWorkflow('ooda', newCommand);
      } else if (lower.includes('doctor')) {
        setLogs((prev) => [...prev, `[SYSTEM] constellation-doctor...`]);
        data = await runWorkflow('doctor', newCommand);
      } else if (lower.includes('mine') || lower.includes('plux')) {
        setLogs((prev) => [...prev, `[SYSTEM] plux mine...`]);
        data = await runWorkflow('plux_mine', newCommand);
      } else if (lower.includes('review')) {
        data = await runWorkflow('review', newCommand);
      } else if (
        lower.trim() === 'status' ||
        lower.trim() === 'ls' ||
        lower.trim() === 'list' ||
        lower.startsWith('ls ') ||
        lower.startsWith('status')
      ) {
        data = await runWorkflow('status', newCommand);
      } else {
        // Free-text → agent chat (workflows for verbs, receipt otherwise)
        setLogs((prev) => [...prev, `[SYSTEM] Transmitting to agent/workflow router...`]);
        const res = await fetch(apiUrl('/api/agent/chat'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: newCommand,
            target_ecosystem: dept,
            folder: folder || undefined,
          }),
        });
        data = await res.json();
        setLogs((prev) => [...prev, data.reply || JSON.stringify(data)]);
        if (data.detail?.receipt) {
          setLogs((prev) => [...prev, `[DISK] receipt → ${data.detail.receipt}`]);
        }
        return;
      }

      setLogs((prev) => [
        ...prev,
        `[WORKFLOW] status=${data.status} eco=${data.eco_name || data.eco_path || '?'}`,
      ]);
      if (data.receipt) setLogs((prev) => [...prev, `[DISK] ${data.receipt}`]);
      if (data.detail?.top_level) {
        setLogs((prev) => [
          ...prev,
          `[FILES] ${data.detail.top_level.slice(0, 20).join(', ')}${data.detail.top_level.length > 20 ? '…' : ''}`,
        ]);
      }
      if (data.detail?.git_status) {
        setLogs((prev) => [...prev, `[GIT] ${String(data.detail.git_status).split('\n')[0]}`]);
      }
      if (data.error) setLogs((prev) => [...prev, `[ERROR] ${data.error}`]);
    } catch {
      setLogs((prev) => [...prev, `[ERROR] Connection to Python workflow API severed.`]);
    }
  };

  const TerminalUI = () => (
    <div
      style={{
        width: isFullscreen ? '100vw' : '420px',
        height: isFullscreen ? '100vh' : '320px',
        background: 'rgba(2, 6, 23, 0.95)',
        border: `1px solid ${brandColor}`,
        borderRadius: isFullscreen ? 0 : 8,
        color: '#e2e8f0',
        fontFamily: 'monospace',
        fontSize: 12,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          borderBottom: `1px solid ${brandColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          color: brandColor,
        }}
      >
        <span>
          {dept} {folder ? `(${folder})` : ''}
        </span>
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          style={{ background: 'transparent', border: 'none', color: brandColor, cursor: 'pointer' }}
        >
          {isFullscreen ? '[MINIMIZE]' : '[MAXIMIZE TERMINAL]'}
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 10 }}>
        {logs.map((line, i) => (
          <div key={i} style={{ marginBottom: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {line}
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>
      <form onSubmit={handleCommand} style={{ display: 'flex', borderTop: `1px solid ${brandColor}` }}>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="status | doctor | execute | mine | review | free text..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#fff',
            padding: 10,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            background: brandColor,
            border: 'none',
            color: '#0f172a',
            padding: '0 14px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          RUN
        </button>
      </form>
      <div style={{ padding: '4px 10px', color: '#64748b', fontSize: 10 }}>
        [PRESS ESC TO UNLOCK MOUSE] · writes under eco/.ai-notes/sim-workflows/
      </div>
    </div>
  );

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.9, 0.15]} />
          <meshStandardMaterial color="#0f172a" emissive={brandColor} emissiveIntensity={0.35} />
        </mesh>
        {texture && (
          <mesh position={[0, 0, 0.09]}>
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial map={texture} transparent />
          </mesh>
        )}
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
        <Html center position={[0, 1.8, 0]} style={{ pointerEvents: 'auto' }}>
          {isFullscreen ? (
            <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>{TerminalUI()}</div>
          ) : (
            <TerminalUI />
          )}
        </Html>
      )}
    </group>
  );
}
