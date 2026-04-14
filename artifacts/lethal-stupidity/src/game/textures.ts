import * as THREE from "three";

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext("2d")! };
}

export function createConcreteTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = "#2a2a30";
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const l = Math.floor(Math.random() * 30 + 15);
    ctx.strokeStyle = `rgba(${l},${l},${l + 5},${Math.random() * 0.4 + 0.1})`;
    ctx.lineWidth = Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20);
    ctx.stroke();
  }

  for (let i = 0; i < 8; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.6 + 0.3})`;
    ctx.lineWidth = Math.random() * 0.8 + 0.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    let cx = x;
    let cy = y;
    for (let j = 0; j < 5; j++) {
      cx += (Math.random() - 0.5) * 60;
      cy += Math.random() * 40 + 10;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 4);
  return t;
}

export function createRustMetalTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = "#1a1a20";
  ctx.fillRect(0, 0, 512, 512);

  for (let y = 0; y < 512; y += 64) {
    ctx.fillStyle = `rgba(30,30,40,${Math.random() * 0.3 + 0.1})`;
    ctx.fillRect(0, y, 512, 2);
  }

  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 8 + 1;
    const rust = Math.random();
    if (rust > 0.7) {
      ctx.fillStyle = `rgba(${100 + Math.random() * 60},${20 + Math.random() * 20},${10 + Math.random() * 10},${Math.random() * 0.7 + 0.3})`;
    } else {
      ctx.fillStyle = `rgba(40,40,50,${Math.random() * 0.3})`;
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = `rgba(150,60,10,${Math.random() * 0.5})`;
    ctx.fillRect(x, y, Math.random() * 20 + 2, Math.random() * 80 + 10);
  }

  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

export function createFloorTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = "#151520";
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 64;
  for (let y = 0; y < 512; y += tileSize) {
    for (let x = 0; x < 512; x += tileSize) {
      const shade = 20 + Math.floor(Math.random() * 12);
      ctx.fillStyle = `rgb(${shade},${shade},${shade + 4})`;
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

      ctx.strokeStyle = "rgba(0,0,0,0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, tileSize, tileSize);

      if (Math.random() > 0.85) {
        ctx.fillStyle = `rgba(80,80,90,${Math.random() * 0.4})`;
        ctx.beginPath();
        const sx = x + Math.random() * tileSize;
        const sy = y + Math.random() * tileSize;
        ctx.arc(sx, sy, Math.random() * 8 + 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(10, 10);
  return t;
}

export function createCeilingTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = "#111118";
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = `rgba(${20 + Math.random() * 10},${20 + Math.random() * 10},${28 + Math.random() * 10},${Math.random() * 0.8})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 20 + 2, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let y = 0; y < 512; y += 128) {
    for (let x = 0; x < 512; x += 128) {
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 4, y + 4, 120, 120);
    }
  }

  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(5, 5);
  return t;
}

export function createNormalMap(baseTexture: THREE.CanvasTexture): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = "#8080ff";
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const g = ctx.createRadialGradient(x, y, 0, x, y, Math.random() * 30 + 5);
    g.addColorStop(0, `rgba(${100 + Math.random() * 50},${100 + Math.random() * 50},255,0.6)`);
    g.addColorStop(1, "rgba(128,128,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.copy(baseTexture.repeat);
  return t;
}

export function createMonsterSkinTexture(baseColor: string): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 256);
  const c = new THREE.Color(baseColor);
  ctx.fillStyle = `rgb(${Math.floor(c.r * 255)},${Math.floor(c.g * 255)},${Math.floor(c.b * 255)})`;
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 15; i++) {
    ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.5 + 0.2})`;
    ctx.lineWidth = Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(Math.random() * 256, Math.random() * 256);
    ctx.lineTo(Math.random() * 256, Math.random() * 256);
    ctx.stroke();
  }

  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15})`;
    ctx.beginPath();
    ctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 6, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}
