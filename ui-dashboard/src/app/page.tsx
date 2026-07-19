"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Force client-side only rendering to prevent hydration crashes
const SimulationCanvas = dynamic(() => import('@/components/SimulationCanvas'), { ssr: false });
const Headquarters3D = dynamic(() => import('@/components/Headquarters3D'), { ssr: false });

export default function Home() {
  const [prompt, setPrompt] = useState("Simulate the DCoop Constellation with 500 active agents");
  const [activeDomain, setActiveDomain] = useState("DCoop Constellation");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [liveData, setLiveData] = useState<any>({ entities: [] });

  const fetchLiveState = async () => {
    setIsSynthesizing(true);
    try {
      // Connect to the real Python Big Brain using the remote IP
      const apiUrl = `http://${window.location.hostname}:3131/api/state`;
      const res = await fetch(apiUrl);
      const data = await res.json();
      setLiveData(data);
      setActiveDomain("Live TVP Verified State");
    } catch (e) {
      console.error("Backend offline", e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  useEffect(() => {
    fetchLiveState();
  }, []);

  const handleSynthesize = () => {
    fetchLiveState();
  };

  return (
    <>
      {/* Elite Cooper Lux Dashboard Header */}
      <header className="dashboard-header" style={{ display: 'flex', alignItems: 'center', background: '#020617', borderBottom: '1px solid #c9a96a' }}>
        <img src="/cooperlux.jpg" alt="Cooper Lux" style={{ height: '50px', marginRight: '15px', mixBlendMode: 'screen' }} />
        <div className="header-brand" style={{ color: '#c9a96a', letterSpacing: '2px', fontFamily: 'serif' }}>COOPER LUX <span>ELITE</span></div>
        <div className="telemetry" style={{ color: '#c9a96a' }}>
          <div>TVP VERIFIED <span>{activeDomain}</span></div>
          <div style={{ color: '#38bdf8' }}>OODA LOOP <span>STANDBY</span></div>
        </div>
      </header>

      <main className="dashboard-container">
        <aside className="control-panel">
          <h2 className="panel-title">Domain Synthesizer</h2>
          
          <div className="input-group">
            <label>Natural Language Input</label>
            <textarea 
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Simulate a 500-bed hospital ER during a power outage..."
            />
          </div>

          <button className="btn" onClick={handleSynthesize} disabled={isSynthesizing}>
            {isSynthesizing ? "Synthesizing Domain..." : "Compile ECS Rules"}
          </button>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              className="btn" 
              style={{ flex: 1, background: viewMode === '2d' ? 'var(--gold)' : 'transparent', color: viewMode === '2d' ? '#000' : 'var(--gold)' }} 
              onClick={() => setViewMode('2d')}
            >
              2D Topology
            </button>
            <button 
              className="btn" 
              style={{ flex: 1, background: viewMode === '3d' ? 'var(--gold)' : 'transparent', color: viewMode === '3d' ? '#000' : 'var(--gold)' }} 
              onClick={() => setViewMode('3d')}
            >
              3D HQ
            </button>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h2 className="panel-title">Active Metrics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Tick Rate</div>
                <div style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>60 Hz</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Entities</div>
                <div style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>50</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Core</div>
                <div style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>Rust FFI</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Load</div>
                <div style={{ fontSize: '1.25rem', color: 'var(--gold)' }}>12.4%</div>
              </div>
            </div>
          </div>
        </aside>

        <section className="canvas-container">
          <div className="canvas-header">
            <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              Live Execution: <span style={{ color: 'var(--gold)' }}>{activeDomain}</span>
            </div>
            <div className="status-badge">
              <div className="status-dot"></div>
              Engine Active
            </div>
          </div>
          
          {/* Canvas Component */}
          {viewMode === '2d' ? (
            <SimulationCanvas liveData={liveData} activeDomain={activeDomain} />
          ) : (
            <div style={{ position: 'relative', flex: 1, minHeight: '60vh' }}>
              <Headquarters3D domainData={liveData} />
            </div>
          )}
        </section>
      </main>
    </>
  );
}
