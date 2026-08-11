
(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Subtle mouse-follow spotlight.
  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth) * 100;
    const y = (event.clientY / window.innerHeight) * 100;
    root.style.setProperty('--mouse-x', `${x}%`);
    root.style.setProperty('--mouse-y', `${y}%`);

    const hero = document.getElementById('hero-card');
    if (hero) {
      const rect = hero.getBoundingClientRect();
      const hx = ((event.clientX - rect.left) / rect.width) * 100;
      const hy = ((event.clientY - rect.top) / rect.height) * 100;
      root.style.setProperty('--hero-x', `${hx}%`);
      root.style.setProperty('--hero-y', `${hy}%`);
    }
  }, { passive: true });

  // A restrained "research network" background for the homepage.
  const canvas = document.getElementById('ambient-network');
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext('2d');
  let points = [];
  let width = 0;
  let height = 0;
  let mouse = { x: -9999, y: -9999 };
  let rafId;

  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(height * DPR);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const count = Math.max(24, Math.min(48, Math.floor(width / 32)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      r: 0.7 + Math.random() * 0.9
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const p of points) {
      const dxm = p.x - mouse.x;
      const dym = p.y - mouse.y;
      const md = Math.hypot(dxm, dym);

      if (md < 125 && md > 0) {
        p.x += (dxm / md) * 0.09;
        p.y += (dym / md) * 0.09;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(50, 99, 155, 0.20)';
      ctx.fill();
    }

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < 118) {
          const alpha = (1 - d / 118) * 0.105;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(50, 99, 155, ${alpha})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(draw);
  }

  window.addEventListener('pointermove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(rafId);
    resize();
    draw();
  });

  resize();
  draw();
})();
