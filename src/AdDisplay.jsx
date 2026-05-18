import { useState, useEffect, useRef, useMemo } from 'preact/hooks';
import AdLine from './AdLine';
import { color } from './palette';

function expandLines(lines) {
  const result = [];
  for (const line of lines) {
    if (line.type === 'block') {
      const { lines: blockLines, type: _t, ...shared } = line;
      for (const text of (blockLines ?? [])) {
        result.push({ ...shared, type: 'text', text });
      }
    } else {
      result.push(line);
    }
  }
  return result;
}

function NoiseOverlay() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let rafId;
    let skip = 0;
    const draw = () => {
      skip = (skip + 1) % 4;
      if (skip === 0) {
        const { width: w, height: h } = canvas;
        const img = ctx.createImageData(w, h);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const on = Math.random() > 0.93;
          d[i] = d[i + 1] = d[i + 2] = on ? 210 : 0;
          d[i + 3] = on ? 28 : 0;
        }
        ctx.putImageData(img, 0, 0);
      }
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 12,
        mixBlendMode: 'screen',
      }}
    />
  );
}

export default function AdDisplay({ page, lineDelay, crtEffects = true }) {
  const lines = useMemo(() => expandLines(page.lines ?? []), [page]);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    setVisible(0);
    if (lines.length === 0) return;
    let i = 0;
    const next = () => {
      i++;
      setVisible(i);
      if (i < lines.length) setTimeout(next, lineDelay * 1000);
    };
    const t = setTimeout(next, lineDelay * 1000);
    return () => clearTimeout(t);
  }, [page, lineDelay, lines.length]);

  const pageBg = color(page.bg ?? 8);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: pageBg,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {lines.slice(0, visible).map((line, i) => (
        <AdLine key={i} line={line} />
      ))}

      {crtEffects && (
        <>
          {/* Scanlines */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.09) 3px, rgba(0,0,0,0.09) 4px)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
          {/* Vignette — tighter and darker than before */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.8) 100%)',
              pointerEvents: 'none',
              zIndex: 11,
            }}
          />
          {/* Corner blur — backdrop-filter masked to edges */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              maskImage:
                'radial-gradient(ellipse 75% 75% at center, transparent 55%, black 100%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 75% 75% at center, transparent 55%, black 100%)',
              pointerEvents: 'none',
              zIndex: 13,
            }}
          />
          {/* Animated noise/static */}
          <NoiseOverlay />
        </>
      )}
    </div>
  );
}
