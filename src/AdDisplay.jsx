import { useState, useEffect, useMemo } from 'preact/hooks';
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
          {/* CRT scanline overlay */}
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
          {/* Vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.45) 100%)',
              pointerEvents: 'none',
              zIndex: 11,
            }}
          />
        </>
      )}
    </div>
  );
}
