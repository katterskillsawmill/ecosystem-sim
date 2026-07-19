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

export default function SimulationCanvas({ activeDomain, liveData }: { activeDomain: string, liveData?: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    window.addEventListener('resize', resize);
    resize();

    // Pull real entities from Python Big Brain payload
    const sourceEntities = liveData?.entities || [];
    
    // Map the payload into 2D physics nodes
    const nodes = sourceEntities.map((entity: any, i: number) => {
      const sizeMb = entity.size_mb || 0.1;
      const fileCount = entity.num_files || 1;
      
      // Scale radius massive for massive ecosystems
      let radius = 3;
      if (fileCount > 50 || sizeMb > 10) radius = Math.min(20, sizeMb * 2);
      else if (fileCount > 5) radius = 8;

      return {
        id: i,
        name: entity.dept || 'Stub Node',
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        radius: radius,
        isMassive: radius >= 15
      };
    });

    let animationFrameId: number;

    const render = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.4)'; // Dark background with trailing
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((node: any) => {
        // Update physics
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off walls
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Draw Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        
        // Massive nodes are Gold, others are Blue
        ctx.fillStyle = node.isMassive ? '#c9a96a' : '#38bdf8';
        ctx.shadowBlur = node.isMassive ? 15 : 5;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
        
        // Draw Neural Network Synapses
        nodes.forEach((other: any) => {
          if (node.id !== other.id) {
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // Connect massive nodes further, smaller nodes closer
            const threshold = node.isMassive ? 150 : 80;
            
            if (dist < threshold) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = node.isMassive 
                ? `rgba(201, 169, 106, ${1 - dist/threshold})` 
                : `rgba(56, 189, 248, ${0.5 - (dist/threshold)*0.5})`;
              ctx.lineWidth = node.isMassive ? 1.5 : 0.5;
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
