"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { apiUrl } from '@/lib/api';

// Force client-side only rendering to prevent hydration crashes
const SimulationCanvas = dynamic(() => import('@/components/SimulationCanvas'), { ssr: false });
const Headquarters3D = dynamic(() => import('@/components/Headquarters3D'), { ssr: false });

export default function Home() {
  const [prompt, setPrompt] = useState("Simulate the DCoop Constellation with 500 active agents");
  const [activeDomain, setActiveDomain] = useState("DCoop Constellation");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [liveData, setLiveData] = useState<any>({ entities: [] });
  const [isSimulationFullscreen, setIsSimulationFullscreen] = useState(false);
  const [entityCount, setEntityCount] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchLiveState = async () => {
    setIsSynthesizing(true);
    setApiError(null);
    try {
      // Published backend port is 3135 (not container-internal 3131)
      const res = await fetch(apiUrl("/api/state"));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLiveData(data);
      setEntityCount(Array.isArray(data?.entities) ? data.entities.length : 0);
      setActiveDomain(`Live HQ · ${data?.entities?.length ?? 0} buildings`);
    } catch (e: any) {
      console.error("Backend offline", e);
      setApiError(String(e?.message || e));
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
      {!isSimulationFullscreen && (
        <header className="dashboard-header" style={{ display: 'flex', alignItems: 'center', background: '#020617', borderBottom: '1px solid #c9a96a' }}>
          <img src="/cooperlux_transparent.png" alt="Cooper Lux" style={{ height: '50px', marginRight: '15px' }} />
          <div className="header-brand" style={{ color: '#c9a96a', letterSpacing: '2px', fontFamily: 'serif' }}>COOPER LUX <span>ELITE</span></div>
          <div className="telemetry" style={{ color: '#c9a96a' }}>
            <div>TVP VERIFIED <span>{activeDomain}</span></div>
            <div style={{ color: '#38bdf8' }}>OODA LOOP <span>STANDBY</span></div>
          </div>
        </header>
      )}

      <main className="dashboard-container" style={{ display: isSimulationFullscreen ? 'block' : 'grid' }}>
        {!isSimulationFullscreen && (
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
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Buildings</div>
                  <div style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>{entityCount || liveData?.entities?.length || 0}</div>
                </div>
                {apiError && (
                  <div style={{ gridColumn: '1 / -1', color: '#f87171', fontSize: '0.75rem' }}>
                    API: {apiError}
                  </div>
                )}
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
        )}

        <section 
          className="canvas-container" 
          style={isSimulationFullscreen ? {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            margin: 0,
            padding: 0,
            borderRadius: 0
          } : {}}
        >
          <div className="canvas-header" style={{ position: isSimulationFullscreen ? 'absolute' : 'relative', top: 0, left: 0, width: '100%', zIndex: 10000, background: isSimulationFullscreen ? 'rgba(2, 6, 23, 0.8)' : 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                Live Execution: <span style={{ color: 'var(--gold)' }}>{activeDomain}</span>
              </div>
              <div className="status-badge">
                <div className="status-dot"></div>
                Engine Active
              </div>
            </div>
            
            <button 
              onClick={() => setIsSimulationFullscreen(!isSimulationFullscreen)}
              style={{
                background: 'transparent',
                border: '1px solid var(--gold)',
                color: 'var(--gold)',
                padding: '5px 15px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }}
            >
              {isSimulationFullscreen ? '[EXIT FULLSCREEN]' : '[ENTER FULLSCREEN]'}
            </button>
          </div>
          
          {/* Canvas Component */}
          {viewMode === '2d' ? (
            <div style={{ width: '100%', height: isSimulationFullscreen ? '100%' : '100%' }}>
              <SimulationCanvas liveData={liveData} activeDomain={activeDomain} />
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%', height: isSimulationFullscreen ? '100%' : '100%', minHeight: '60vh' }}>
              <Headquarters3D domainData={liveData} />
            </div>
          )}
        </section>
      </main>
    </>
  );
}
