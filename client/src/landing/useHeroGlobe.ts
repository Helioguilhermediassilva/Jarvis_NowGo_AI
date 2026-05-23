import { useEffect, RefObject } from "react";

/**
 * Globo cinematográfico em canvas 2D — porta exata do interactions.js da
 * referência Asimov AI Intelligence SaaS, com tokens da nowgo ai (#33D2FF).
 *
 * Renderiza:
 *  - 800 nós distribuídos esfericamente (Fibonacci sphere)
 *  - 18 arcos animados conectando pares aleatórios de nós
 *  - 3 anéis orbitais com inclinações distintas
 *  - latitudes e longitudes pontilhadas
 *  - rotação contínua em angleY
 *
 * Pausa o requestAnimationFrame quando o componente desmonta.
 */
export function useHeroGlobe(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let rafId = 0;
    let mounted = true;

    const numNodes = 800;
    // globeRadius agora e dinamico (calculado em cada frame com base no tamanho do canvas)
    let globeRadius = 220;
    const phi = Math.PI * (3 - Math.sqrt(5));

    type Node = { x: number; y: number; z: number; baseRadius: number; color: string };
    const globeNodes: Node[] = [];

    for (let i = 0; i < numNodes; i++) {
      const y = 1 - (i / (numNodes - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const isHighlight = Math.random() > 0.92;
      const depthOffset = 1 + (Math.random() * 0.06 - 0.03);
      globeNodes.push({
        x: x * depthOffset,
        y: y * depthOffset,
        z: z * depthOffset,
        baseRadius: isHighlight ? 2 : 1,
        color: isHighlight ? "#33D2FF" : "rgba(74, 140, 255, 0.8)",
      });
    }

    type Arc = { n1: number; n2: number; progress: number; speed: number };
    const arcs: Arc[] = [];
    for (let i = 0; i < 18; i++) {
      arcs.push({
        n1: Math.floor(Math.random() * numNodes),
        n2: Math.floor(Math.random() * numNodes),
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.005,
      });
    }

    const orbitalRings = [
      { radius: 1.3, tiltX: 0.2, tiltZ: 0.5, speed: 0.001, angle: 0 },
      { radius: 1.45, tiltX: -0.4, tiltZ: 0.2, speed: -0.0015, angle: Math.PI / 3 },
      { radius: 1.2, tiltX: 0.5, tiltZ: -0.3, speed: 0.002, angle: Math.PI / 1.5 },
    ];

    function resize() {
      const parent = canvas?.parentElement;
      if (!parent || !canvas) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
    }

    window.addEventListener("resize", resize);
    resize();

    let angleY = 0;
    const angleX = 0.2;

    function render() {
      if (!mounted || !ctx) return;
      ctx.clearRect(0, 0, width, height);
      angleY += 0.002;
      const cx = width / 2;
      const cy = height / 2;
      const fov = 800;
      // Recalcula raio do globo proporcionalmente ao canvas para nunca cortar
      // o anel orbital mais externo (raio = globeRadius * 1.45).
      // 30% do menor lado deixa folga suficiente: 1.45 * 0.30 = 0.435 (<0.5).
      globeRadius = Math.min(width, height) * 0.30;

      const gradient = ctx.createRadialGradient(cx, cy, globeRadius * 0.4, cx, cy, globeRadius * 1.6);
      gradient.addColorStop(0, "rgba(51, 210, 255, 0.15)");
      gradient.addColorStop(0.5, "rgba(51, 210, 255, 0.04)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const sinY = Math.sin(angleY);
      const cosY = Math.cos(angleY);
      const sinX = Math.sin(angleX);
      const cosX = Math.cos(angleX);

      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(74, 140, 255, 0.1)";
      ctx.setLineDash([2, 4]);

      for (let lat = -4; lat <= 4; lat++) {
        const y = lat * 0.22;
        const r = Math.sqrt(1 - y * y) * globeRadius;
        ctx.beginPath();
        for (let lon = 0; lon <= Math.PI * 2.01; lon += 0.1) {
          const x = Math.cos(lon) * r;
          const z = Math.sin(lon) * r;
          const x1 = x * cosY - z * sinY;
          const z1 = x * sinY + z * cosY;
          const y1 = y * globeRadius * cosX - z1 * sinX;
          const z2 = y * globeRadius * sinX + z1 * cosX;
          const scale = fov / (fov + z2);
          const px = cx + x1 * scale;
          const py = cy + y1 * scale;
          if (lon === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      for (let lon = 0; lon < Math.PI; lon += Math.PI / 6) {
        ctx.beginPath();
        for (let lat = -Math.PI / 2; lat <= Math.PI / 2 + 0.01; lat += 0.1) {
          const y = Math.sin(lat) * globeRadius;
          const r = Math.cos(lat) * globeRadius;
          const x = Math.cos(lon) * r;
          const z = Math.sin(lon) * r;
          const x1 = x * cosY - z * sinY;
          const z1 = x * sinY + z * cosY;
          const y1 = y * cosX - z1 * sinX;
          const z2 = y * sinX + z1 * cosX;
          const scale = fov / (fov + z2);
          const px = cx + x1 * scale;
          const py = cy + y1 * scale;
          if (lat === -Math.PI / 2) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      ctx.setLineDash([]);

      const projectedNodes: Array<{ px: number; py: number; z: number; scale: number; color: string; r: number }> = [];
      for (let i = 0; i < numNodes; i++) {
        const n = globeNodes[i];
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.x * sinY + n.z * cosY;
        const y1 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;
        const scale = fov / (fov + z2 * globeRadius);
        const px = cx + x1 * globeRadius * scale;
        const py = cy + y1 * globeRadius * scale;
        projectedNodes.push({ px, py, z: z2, scale, color: n.color, r: n.baseRadius });
      }

      orbitalRings.forEach((ring) => {
        ring.angle += ring.speed;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(51, 210, 255, 0.2)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= Math.PI * 2.01; i += 0.05) {
          const x = Math.cos(i) * globeRadius * ring.radius;
          const z = Math.sin(i) * globeRadius * ring.radius;
          const ty = x * ring.tiltX + z * ring.tiltZ;
          const x1 = x * Math.cos(ring.angle) - z * Math.sin(ring.angle);
          const z1 = x * Math.sin(ring.angle) + z * Math.cos(ring.angle);
          const px_rot = x1 * cosY - z1 * sinY;
          const pz_rot = x1 * sinY + z1 * cosY;
          const py_rot = ty * cosX - pz_rot * sinX;
          const final_z = ty * sinX + pz_rot * cosX;
          const scale = fov / (fov + final_z);
          const px = cx + px_rot * scale;
          const py = cy + py_rot * scale;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        const dot_x = Math.cos(0) * globeRadius * ring.radius;
        const dot_z = Math.sin(0) * globeRadius * ring.radius;
        const dot_ty = dot_x * ring.tiltX + dot_z * ring.tiltZ;
        const dx1 = dot_x * Math.cos(ring.angle) - dot_z * Math.sin(ring.angle);
        const dz1 = dot_x * Math.sin(ring.angle) + dot_z * Math.cos(ring.angle);
        const px_rot_d = dx1 * cosY - dz1 * sinY;
        const pz_rot_d = dx1 * sinY + dz1 * cosY;
        const py_rot_d = dot_ty * cosX - pz_rot_d * sinX;
        const final_z_d = dot_ty * sinX + pz_rot_d * cosX;
        if (final_z_d > -globeRadius * 1.5) {
          const scale = fov / (fov + final_z_d);
          const pX = cx + px_rot_d * scale;
          const pY = cy + py_rot_d * scale;
          ctx.beginPath();
          ctx.arc(pX, pY, 2 * scale, 0, Math.PI * 2);
          ctx.fillStyle = "#33D2FF";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(pX, pY, 6 * scale, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(51, 210, 255, 0.4)";
          ctx.fill();
        }
      });

      ctx.lineWidth = 1.5;
      arcs.forEach((arc) => {
        arc.progress += arc.speed;
        if (arc.progress > 1) arc.progress = 0;
        const pn1 = projectedNodes[arc.n1];
        const pn2 = projectedNodes[arc.n2];
        if (pn1.z > -0.5 && pn2.z > -0.5) {
          ctx.beginPath();
          ctx.moveTo(pn1.px, pn1.py);
          const mx = (pn1.px + pn2.px) / 2;
          const my = (pn1.py + pn2.py) / 2 - 20 * pn1.scale;
          ctx.quadraticCurveTo(mx, my, pn2.px, pn2.py);
          const grad = ctx.createLinearGradient(pn1.px, pn1.py, pn2.px, pn2.py);
          grad.addColorStop(0, "rgba(51, 210, 255, 0)");
          grad.addColorStop(arc.progress, "rgba(51, 210, 255, 0.8)");
          grad.addColorStop(Math.min(1, arc.progress + 0.1), "rgba(51, 210, 255, 0)");
          ctx.strokeStyle = grad;
          ctx.stroke();
        }
      });

      projectedNodes.sort((a, b) => b.z - a.z);
      for (let i = 0; i < projectedNodes.length; i++) {
        const p = projectedNodes[i];
        const alpha = Math.min(1, Math.max(0.1, p.z + 1.2));
        const distFromCenter = Math.sqrt(Math.pow(p.px - cx, 2) + Math.pow(p.py - cy, 2));
        const edgeFactor = Math.min(1, distFromCenter / (globeRadius * 0.8));
        const finalAlpha = Math.min(1, alpha * (0.5 + edgeFactor * 0.5));
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.r * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = finalAlpha;
        ctx.fill();
        if (p.r > 1.5 && finalAlpha > 0.4) {
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.r * 2.5 * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(51, 210, 255, 0.3)";
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}
