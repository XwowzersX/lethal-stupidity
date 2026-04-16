import * as THREE from "three";

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext("2d")! };
}

function rng(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

// Kenney-style concrete block wall with clear mortar lines
export function createConcreteTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 512);
  const rand = rng(42);

  // Base concrete color — warm grey
  ctx.fillStyle = "#3a3835";
  ctx.fillRect(0, 0, 512, 512);

  const brickW = 128;
  const brickH = 64;
  const mortar = 6;

  for (let row = 0; row < 512 / brickH + 1; row++) {
    const offset = (row % 2) * (brickW / 2);
    for (let col = -1; col < 512 / brickW + 1; col++) {
      const bx = col * brickW + offset;
      const by = row * brickH;
      const shade = Math.floor(rand() * 20 - 10);
      const r = 58 + shade;
      const g = 56 + shade;
      const b = 52 + shade;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(bx + mortar, by + mortar, brickW - mortar, brickH - mortar);

      // Subtle surface variation on each brick
      for (let i = 0; i < 6; i++) {
        const nx = bx + mortar + rand() * (brickW - mortar);
        const ny = by + mortar + rand() * (brickH - mortar);
        const nr = Math.floor(rand() * 10);
        const na = rand() * 0.15;
        ctx.fillStyle = `rgba(${r + nr},${g + nr},${b + nr},${na})`;
        ctx.beginPath();
        ctx.arc(nx, ny, rand() * 8 + 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Occasional chip or stain
      if (rand() > 0.75) {
        ctx.fillStyle = `rgba(20,18,15,${rand() * 0.4 + 0.1})`;
        ctx.beginPath();
        ctx.arc(bx + mortar + rand() * (brickW - mortar * 2), by + mortar + rand() * (brickH - mortar * 2), rand() * 5 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Mortar grooves — dark, slightly recessed look
  ctx.fillStyle = "#1e1c1a";
  for (let row = 0; row <= 512 / brickH + 1; row++) {
    ctx.fillRect(0, row * brickH, 512, mortar);
  }
  for (let row = 0; row < 512 / brickH + 1; row++) {
    const offset = (row % 2) * (brickW / 2);
    for (let col = -1; col <= 512 / brickW + 1; col++) {
      ctx.fillRect(col * brickW + offset, row * brickH, mortar, brickH);
    }
  }

  // Subtle vertical moisture streaks
  for (let i = 0; i < 8; i++) {
    const x = rand() * 512;
    const len = rand() * 180 + 40;
    const grad = ctx.createLinearGradient(x, rand() * 300, x + (rand() - 0.5) * 12, rand() * 300 + len);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.4, `rgba(10,8,6,${rand() * 0.3 + 0.05})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - 4, 0, 8, 512);
  }

  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

// Kenney-style metal panel wall — grid panels with rivets
export function createRustMetalTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 512);
  const rand = rng(99);

  // Base brushed dark metal
  ctx.fillStyle = "#252628";
  ctx.fillRect(0, 0, 512, 512);

  // Horizontal brush lines
  for (let y = 0; y < 512; y++) {
    const a = rand() * 0.06;
    const v = Math.floor(rand() * 8);
    ctx.fillStyle = `rgba(${35 + v},${35 + v},${38 + v},${a})`;
    ctx.fillRect(0, y, 512, 1);
  }

  // Panel grid — large rectangular metal panels
  const pw = 256;
  const ph = 128;
  const gap = 5;
  const rivetR = 5;

  for (let row = 0; row < 512 / ph + 1; row++) {
    const rowOff = (row % 2) * (pw / 2);
    for (let col = -1; col < 512 / pw + 2; col++) {
      const px = col * pw + rowOff;
      const py = row * ph;

      // Panel face — slightly lighter than base
      const shade = Math.floor(rand() * 8);
      ctx.fillStyle = `rgb(${36 + shade},${37 + shade},${40 + shade})`;
      ctx.fillRect(px + gap, py + gap, pw - gap * 2, ph - gap * 2);

      // Panel bevel highlight top/left
      ctx.fillStyle = "rgba(80,80,85,0.25)";
      ctx.fillRect(px + gap, py + gap, pw - gap * 2, 2);
      ctx.fillRect(px + gap, py + gap, 2, ph - gap * 2);

      // Panel bevel shadow bottom/right
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(px + gap, py + ph - gap - 2, pw - gap * 2, 2);
      ctx.fillRect(px + pw - gap - 2, py + gap, 2, ph - gap * 2);

      // Corner rivets
      const rivets: [number, number][] = [
        [px + gap + 10, py + gap + 10],
        [px + pw - gap - 10, py + gap + 10],
        [px + gap + 10, py + ph - gap - 10],
        [px + pw - gap - 10, py + ph - gap - 10],
      ];
      for (const [rx, ry] of rivets) {
        const rivetGrad = ctx.createRadialGradient(rx - 2, ry - 2, 0, rx, ry, rivetR);
        rivetGrad.addColorStop(0, "#888890");
        rivetGrad.addColorStop(0.5, "#444448");
        rivetGrad.addColorStop(1, "#1a1a1c");
        ctx.fillStyle = rivetGrad;
        ctx.beginPath();
        ctx.arc(rx, ry, rivetR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Occasional rust streak from rivet
      if (rand() > 0.55) {
        const [rrx, rry] = rivets[Math.floor(rand() * 4)];
        const len = rand() * 40 + 15;
        const rg = ctx.createLinearGradient(rrx, rry, rrx + (rand() - 0.5) * 8, rry + len);
        rg.addColorStop(0, `rgba(${110 + Math.floor(rand() * 40)},${25 + Math.floor(rand() * 15)},5,${rand() * 0.5 + 0.15})`);
        rg.addColorStop(1, "rgba(80,15,3,0)");
        ctx.fillStyle = rg;
        ctx.fillRect(rrx - 2, rry, 4, len);
      }
    }
  }

  // Gap / weld seams
  ctx.fillStyle = "#0e0e10";
  for (let row = 0; row <= 512 / ph + 1; row++) {
    ctx.fillRect(0, row * ph, 512, gap);
  }
  for (let row = 0; row <= 512 / ph + 1; row++) {
    const rowOff = (row % 2) * (pw / 2);
    for (let col = -1; col <= 512 / pw + 2; col++) {
      ctx.fillRect(col * pw + rowOff, row * ph, gap, ph);
    }
  }

  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

// Kenney-style industrial floor tiles — large grey tiles with dark grout
export function createFloorTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 512);
  const rand = rng(77);

  ctx.fillStyle = "#1a1a1e";
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 128;
  const grout = 5;

  for (let row = 0; row < 512 / tileSize; row++) {
    for (let col = 0; col < 512 / tileSize; col++) {
      const tx = col * tileSize;
      const ty = row * tileSize;
      const shade = Math.floor(rand() * 16 - 8);
      const base = 38 + shade;
      ctx.fillStyle = `rgb(${base},${base},${base + 2})`;
      ctx.fillRect(tx + grout, ty + grout, tileSize - grout * 2, tileSize - grout * 2);

      // Subtle specular patch
      const specGrad = ctx.createRadialGradient(tx + tileSize * 0.35, ty + tileSize * 0.3, 0, tx + tileSize / 2, ty + tileSize / 2, tileSize * 0.7);
      specGrad.addColorStop(0, `rgba(60,60,65,${rand() * 0.2})`);
      specGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = specGrad;
      ctx.fillRect(tx + grout, ty + grout, tileSize - grout * 2, tileSize - grout * 2);

      // Scuff / dirt marks
      if (rand() > 0.6) {
        ctx.fillStyle = `rgba(8,8,8,${rand() * 0.25 + 0.05})`;
        ctx.beginPath();
        ctx.ellipse(tx + rand() * tileSize, ty + rand() * tileSize, rand() * 20 + 5, rand() * 10 + 3, rand() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tile corner dots (like real industrial tiles)
      ctx.fillStyle = `rgba(20,20,22,0.8)`;
      ctx.beginPath();
      ctx.arc(tx + grout + 3, ty + grout + 3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx + tileSize - grout - 3, ty + grout + 3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx + grout + 3, ty + tileSize - grout - 3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx + tileSize - grout - 3, ty + tileSize - grout - 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Grout lines
  ctx.fillStyle = "#0c0c0e";
  for (let i = 0; i <= 512 / tileSize; i++) {
    ctx.fillRect(i * tileSize, 0, grout, 512);
    ctx.fillRect(0, i * tileSize, 512, grout);
  }

  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(8, 8);
  return t;
}

// Kenney-style acoustic ceiling tiles — suspended grid with recessed panels
export function createCeilingTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 512);
  const rand = rng(55);

  ctx.fillStyle = "#181818";
  ctx.fillRect(0, 0, 512, 512);

  const tileW = 128;
  const tileH = 64;
  const frame = 6;

  for (let row = 0; row < 512 / tileH; row++) {
    for (let col = 0; col < 512 / tileW; col++) {
      const tx = col * tileW;
      const ty = row * tileH;

      // Tile base — slightly lighter than background
      const shade = Math.floor(rand() * 10);
      ctx.fillStyle = `rgb(${24 + shade},${24 + shade},${24 + shade})`;
      ctx.fillRect(tx + frame, ty + frame, tileW - frame * 2, tileH - frame * 2);

      // Perforated pattern (acoustic dots)
      ctx.fillStyle = `rgba(10,10,10,0.7)`;
      const dotSpacing = 12;
      for (let dy = ty + frame + 8; dy < ty + tileH - frame; dy += dotSpacing) {
        for (let dx = tx + frame + 8; dx < tx + tileW - frame; dx += dotSpacing) {
          if (rand() > 0.25) {
            ctx.beginPath();
            ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Inset shadow
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(tx + frame, ty + frame, tileW - frame * 2, 2);
      ctx.fillRect(tx + frame, ty + frame, 2, tileH - frame * 2);
    }
  }

  // Grid tracks (ceiling grid metal strips)
  ctx.fillStyle = "#0a0a0a";
  for (let i = 0; i <= 512 / tileW; i++) {
    ctx.fillRect(i * tileW, 0, frame, 512);
  }
  for (let i = 0; i <= 512 / tileH; i++) {
    ctx.fillRect(0, i * tileH, 512, frame);
  }
  // Highlight on grid edges
  ctx.fillStyle = "rgba(50,50,50,0.5)";
  for (let i = 0; i <= 512 / tileW; i++) {
    ctx.fillRect(i * tileW + 1, 0, 1, 512);
  }
  for (let i = 0; i <= 512 / tileH; i++) {
    ctx.fillRect(0, i * tileH + 1, 512, 1);
  }

  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 4);
  return t;
}

// Kenney-style wooden crate — planks with metal corner brackets
export function createCrateTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 256);
  const rand = rng(13);

  // Wood base
  ctx.fillStyle = "#8B6914";
  ctx.fillRect(0, 0, 256, 256);

  // Wood plank lines (horizontal)
  const plankH = 64;
  for (let row = 0; row < 256 / plankH; row++) {
    const py = row * plankH;
    const shade = Math.floor(rand() * 20 - 10);
    const r = 135 + shade;
    const g = 98 + Math.floor(shade * 0.7);
    const b = 15 + Math.floor(shade * 0.3);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, py + 4, 256, plankH - 8);

    // Wood grain
    for (let i = 0; i < 14; i++) {
      const gx = rand() * 256;
      const len = rand() * 180 + 60;
      const ga = rand() * 0.15 + 0.02;
      ctx.strokeStyle = `rgba(${r - 20},${g - 15},${b},${ga})`;
      ctx.lineWidth = rand() * 1.5 + 0.5;
      ctx.beginPath();
      ctx.moveTo(gx, py + 4);
      ctx.bezierCurveTo(gx + rand() * 30 - 15, py + plankH / 2, gx + rand() * 30 - 15, py + plankH / 2, gx + (rand() - 0.5) * 20, py + plankH - 4);
      ctx.stroke();
    }

    // Plank gap
    ctx.fillStyle = "#3d2a05";
    ctx.fillRect(0, py, 256, 4);
    ctx.fillRect(0, py + plankH - 4, 256, 4);
  }

  // Metal corner brackets — kenney style
  const bracketSize = 36;
  const bracketW = 12;
  ctx.fillStyle = "#4a4a52";

  // Top-left
  ctx.fillRect(0, 0, bracketSize, bracketW);
  ctx.fillRect(0, 0, bracketW, bracketSize);

  // Top-right
  ctx.fillRect(256 - bracketSize, 0, bracketSize, bracketW);
  ctx.fillRect(256 - bracketW, 0, bracketW, bracketSize);

  // Bottom-left
  ctx.fillRect(0, 256 - bracketW, bracketSize, bracketW);
  ctx.fillRect(0, 256 - bracketSize, bracketW, bracketSize);

  // Bottom-right
  ctx.fillRect(256 - bracketSize, 256 - bracketW, bracketSize, bracketW);
  ctx.fillRect(256 - bracketW, 256 - bracketSize, bracketW, bracketSize);

  // Metal rivets on brackets
  ctx.fillStyle = "#7a7a84";
  const rivetPositions: [number, number][] = [
    [16, 6], [28, 6], [6, 18], [6, 30],
    [256 - 16, 6], [256 - 28, 6], [256 - 6, 18], [256 - 6, 30],
    [16, 250], [28, 250], [6, 238], [6, 226],
    [256 - 16, 250], [256 - 28, 250], [256 - 6, 238], [256 - 6, 226],
  ];
  for (const [rx, ry] of rivetPositions) {
    ctx.beginPath();
    ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a3a40";
    ctx.beginPath();
    ctx.arc(rx + 1, ry + 1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7a7a84";
  }

  // Center brand stamp
  ctx.fillStyle = "rgba(30,18,0,0.5)";
  ctx.fillRect(80, 104, 96, 48);
  ctx.fillStyle = "rgba(180,120,20,0.35)";
  ctx.font = "bold 22px monospace";
  ctx.textAlign = "center";
  ctx.fillText("FRAGILE", 128, 134);

  return new THREE.CanvasTexture(canvas);
}

// Barrel texture — dark metal drum with banding
export function createBarrelTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 256);
  const rand = rng(200);

  ctx.fillStyle = "#2d3a1e";
  ctx.fillRect(0, 0, 256, 256);

  // Vertical metal ribbing
  for (let x = 0; x < 256; x++) {
    const wave = Math.sin(x * 0.15) * 0.08 + 0.92;
    ctx.fillStyle = `rgba(${Math.floor(40 * wave)},${Math.floor(55 * wave)},${Math.floor(25 * wave)},1)`;
    ctx.fillRect(x, 0, 1, 256);
  }

  // Horizontal band rings
  const bands = [30, 80, 128, 176, 226];
  for (const by of bands) {
    ctx.fillStyle = "#1a1f12";
    ctx.fillRect(0, by - 5, 256, 10);
    ctx.fillStyle = "rgba(80,90,50,0.5)";
    ctx.fillRect(0, by - 5, 256, 2);
  }

  // Rust/wear
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = `rgba(${90 + Math.floor(rand() * 40)},${20 + Math.floor(rand() * 15)},5,${rand() * 0.4 + 0.1})`;
    ctx.beginPath();
    ctx.ellipse(rand() * 256, rand() * 256, rand() * 10 + 2, rand() * 5 + 1, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
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
