"use client";

import React, { useEffect, useRef } from 'react';

interface Entity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  role: string;
  load: number;
}

export default function SimulationCanvas({ activeDomain }: { activeDomain: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resize
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    window.addEventListener('resize', resize);
    resize();

    // Mock initial state from Rust ECS
    const entities: Entity[] = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.width,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      role: Math.random() > 0.8 ? 'Broker' : 'Agent',
      load: Math.random() * 100
    }));

    let animationFrameId: number;

    const render = () => {
      // Clear with trailing effect
      ctx.fillStyle = 'rgba(20, 23, 28, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      entities.forEach(entity => {
        // Update physics
        entity.x += entity.vx;
        entity.y += entity.vy;

        // Bounce off walls
        if (entity.x < 0 || entity.x > canvas.width) entity.vx *= -1;
        if (entity.y < 0 || entity.y > canvas.height) entity.vy *= -1;

        // Draw Entity
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, entity.role === 'Broker' ? 8 : 4, 0, Math.PI * 2);
        
        if (activeDomain.includes("Constellation")) {
          ctx.fillStyle = entity.role === 'Broker' ? '#c9a96a' : '#5fb98c';
        } else {
          ctx.fillStyle = entity.role === 'Broker' ? '#6f9bd6' : '#cf6a5a';
        }
        
        ctx.fill();
        
        // Draw links between close entities (representing workload routing)
        entities.forEach(other => {
          if (entity.id !== other.id) {
            const dx = entity.x - other.x;
            const dy = entity.y - other.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 80) {
              ctx.beginPath();
              ctx.moveTo(entity.x, entity.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `rgba(201, 169, 106, ${1 - dist/80})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeDomain]);

  return <canvas ref={canvasRef} />;
}
