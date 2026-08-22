'use client';

import { useEffect, useRef } from 'react';

type Dot = { x: number; y: number; ox: number; oy: number };

export function AuthDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: -1000, y: -1000 });
  const shockRef = useRef({ x: -1000, y: -1000, time: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let resizeObserver: ResizeObserver | null = null;
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const buildGrid = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const gap = width < 640 ? 24 : 28;
      const radius = width < 640 ? 1.5 : 1.8;
      dots.length = 0;
      for (let y = gap / 2; y < height + gap; y += gap) {
        for (let x = gap / 2; x < width + gap; x += gap) {
          dots.push({ x, y, ox: x, oy: y });
        }
      }
      draw(radius);
    };

    const draw = (radius = width < 640 ? 1.5 : 1.8) => {
      ctx.clearRect(0, 0, width, height);
      const pointer = pointerRef.current;
      const shock = shockRef.current;
      const now = performance.now();
      const shockAge = now - shock.time;
      const proximity = width < 640 ? 90 : 125;
      const shockRadius = 190;

      for (const dot of dots) {
        const dx = dot.ox - pointer.x;
        const dy = dot.oy - pointer.y;
        const distance = Math.hypot(dx, dy);
        const influence = !reducedMotion && distance < proximity ? 1 - distance / proximity : 0;

        let x = dot.ox;
        let y = dot.oy;
        if (influence > 0) {
          const push = influence * 7;
          x += (dx / (distance || 1)) * push;
          y += (dy / (distance || 1)) * push;
        }

        if (!reducedMotion && shockAge >= 0 && shockAge < 1200) {
          const sx = dot.ox - shock.x;
          const sy = dot.oy - shock.y;
          const distanceFromShock = Math.hypot(sx, sy);
          const wave = Math.max(0, 1 - Math.abs(distanceFromShock - shockAge * 0.34) / 42);
          x += (sx / (distanceFromShock || 1)) * wave * 11;
          y += (sy / (distanceFromShock || 1)) * wave * 11;
        }

        const alpha = 0.24 + influence * 0.58;
        const dotRadius = radius + influence * 1.8;
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${influence > 0.35 ? '216,180,254' : '167,139,250'},${alpha})`;
        ctx.fill();
      }
    };

    const loop = () => {
      draw();
      if (!reducedMotion) raf = requestAnimationFrame(loop);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current.x = event.clientX;
      pointerRef.current.y = event.clientY;
      if (reducedMotion) return;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        draw();
      });
    };

    const handleClick = (event: MouseEvent) => {
      if (reducedMotion) return;
      shockRef.current = { x: event.clientX, y: event.clientY, time: performance.now() };
    };

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (!reducedMotion && !raf) raf = requestAnimationFrame(loop);
      if (reducedMotion && raf) cancelAnimationFrame(raf);
      if (reducedMotion) draw();
    };

    buildGrid();
    if (!reducedMotion) raf = requestAnimationFrame(loop);
    const ResizeObserverCtor = window.ResizeObserver;
    if (typeof ResizeObserverCtor === 'function') {
      resizeObserver = new ResizeObserverCtor(buildGrid);
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener('resize', buildGrid);
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    motionQuery.addEventListener?.('change', handleMotionChange);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', buildGrid);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('click', handleClick);
      motionQuery.removeEventListener?.('change', handleMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="auth-dot-grid" aria-hidden="true" />;
}
