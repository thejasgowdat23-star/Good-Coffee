import React, { useRef, useEffect } from 'react';

/**
 * Atmospheric Steam & Golden Mote Canvas Simulation
 * Uses physics-based particle lifecycles to create realistic rising coffee vapor
 * and floating sunlit dust particles.
 */
export const SteamCanvas = ({
  mode = 'steam-and-dust', // 'steam', 'dust', or 'steam-and-dust'
  density = 1,
  className = '',
  originX = 0.5, // 0 to 1 horizontal anchor of steam
  originY = 0.75  // 0 to 1 vertical anchor of steam source
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Steam Vapor Particles
    const steamParticles = [];
    const maxSteam = Math.floor(45 * density);

    class SteamParticle {
      constructor() {
        this.reset();
      }

      reset() {
        // Emit from near the coffee cup anchor
        const sourceX = width * originX;
        const sourceY = height * originY;
        this.x = sourceX + (Math.random() - 0.5) * 50;
        this.y = sourceY + (Math.random() - 0.5) * 20;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = -0.7 - Math.random() * 0.9;
        this.radius = 12 + Math.random() * 16;
        this.growth = 0.35 + Math.random() * 0.35;
        this.alpha = 0.01;
        this.maxAlpha = 0.08 + Math.random() * 0.12;
        this.life = 0;
        this.maxLife = 140 + Math.random() * 100;
        this.wobbleSpeed = 0.02 + Math.random() * 0.03;
        this.wobbleAmp = 0.4 + Math.random() * 0.6;
      }

      update() {
        this.life++;
        this.x += this.vx + Math.sin(this.life * this.wobbleSpeed) * this.wobbleAmp;
        this.y += this.vy;
        this.radius += this.growth;

        // Soft fade in, long fade out
        if (this.life < 30) {
          this.alpha = (this.life / 30) * this.maxAlpha;
        } else {
          const remaining = (this.maxLife - this.life) / (this.maxLife - 30);
          this.alpha = Math.max(0, remaining * this.maxAlpha);
        }

        if (this.life >= this.maxLife || this.y < -50) {
          this.reset();
        }
      }

      draw() {
        if (this.alpha <= 0.001) return;
        const grad = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.radius
        );
        grad.addColorStop(0, `rgba(250, 240, 225, ${this.alpha * 1.2})`);
        grad.addColorStop(0.5, `rgba(240, 220, 195, ${this.alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(230, 210, 180, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Warm Sunlit Golden Dust Motes
    const dustParticles = [];
    const maxDust = Math.floor(40 * density);

    class DustParticle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = -0.15 - Math.random() * 0.25;
        this.radius = 0.8 + Math.random() * 1.8;
        this.baseAlpha = 0.15 + Math.random() * 0.55;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.03;
      }

      update() {
        this.pulse += this.pulseSpeed;
        this.x += this.vx + Math.sin(this.pulse) * 0.2;
        this.y += this.vy;

        if (this.y < -10) this.y = height + 10;
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
      }

      draw() {
        const currentAlpha = this.baseAlpha * (0.6 + 0.4 * Math.sin(this.pulse));
        ctx.fillStyle = `rgba(246, 200, 136, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Populate initial
    if (mode === 'steam' || mode === 'steam-and-dust') {
      for (let i = 0; i < maxSteam; i++) {
        const p = new SteamParticle();
        p.life = Math.random() * p.maxLife; // stagger lifecycle
        steamParticles.push(p);
      }
    }

    if (mode === 'dust' || mode === 'steam-and-dust') {
      for (let i = 0; i < maxDust; i++) {
        dustParticles.push(new DustParticle());
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw steam with composite operation for silky blending
      if (steamParticles.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let p of steamParticles) {
          p.update();
          p.draw();
        }
        ctx.restore();
      }

      // Draw dust
      if (dustParticles.length > 0) {
        for (let d of dustParticles) {
          d.update();
          d.draw();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, density, originX, originY]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    />
  );
};
export default SteamCanvas;
