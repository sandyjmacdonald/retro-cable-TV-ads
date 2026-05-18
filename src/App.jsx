import { useState, useEffect, useRef } from 'preact/hooks';
import { load as parseYaml } from 'js-yaml';
import AdDisplay from './AdDisplay';
import { useAudio } from './useAudio';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildOrder(count, mode) {
  const indices = Array.from({ length: count }, (_, i) => i);
  return mode === 'random' ? shuffle(indices) : indices;
}

export default function App() {
  const [config, setConfig]     = useState(null);
  const [error, setError]       = useState(null);
  const [orderIdx, setOrderIdx] = useState(0);
  const pageOrder = useRef([]);

  useEffect(() => {
    fetch('/ads.yaml')
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.text(); })
      .then(txt => {
        const cfg = parseYaml(txt);
        pageOrder.current = buildOrder(cfg.pages.length, cfg.global?.order);
        if (cfg.global?.random_start) {
          setOrderIdx(Math.floor(Math.random() * pageOrder.current.length));
        }
        if (cfg.global?.page_title) {
          document.title = cfg.global.page_title;
        }
        setConfig(cfg);
      })
      .catch(err => setError(err.message));
  }, []);

  useEffect(() => {
    if (!config) return;
    const ms = (config.global?.page_duration ?? 8) * 1000;
    const t = setTimeout(() => {
      setOrderIdx(i => {
        const next = (i + 1) % pageOrder.current.length;
        // Re-shuffle when we wrap around in random mode
        if (next === 0 && config.global?.order === 'random') {
          pageOrder.current = buildOrder(config.pages.length, 'random');
        }
        return next;
      });
    }, ms);
    return () => clearTimeout(t);
  }, [config, orderIdx]);

  if (error) {
    return (
      <div style={{ color: '#ff004d', fontFamily: 'monospace', padding: '2rem' }}>
        Error loading ads.yaml: {error}
      </div>
    );
  }
  if (!config) return null;

  const pageIndex = pageOrder.current[orderIdx];
  const page       = config.pages[pageIndex];
  const lineDelay  = config.global?.line_delay ?? 0.1;
  const crtParam   = new URLSearchParams(window.location.search).get('crt');
  const crtEffects = crtParam !== null
    ? (crtParam !== '0' && crtParam !== 'false')
    : (config.global?.crt_effects ?? true);
  const { audioRef, blocked, unblock } = useAudio(config.global?.audio ?? null);

  return (
    <div
      onClick={unblock}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#111',
      }}
    >
      {/* Constrain to 4:3 */}
      <div
        style={{
          aspectRatio: '4 / 3',
          height: '100%',
          maxWidth: '100%',
          maxHeight: 'calc(100vw * 3 / 4)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <AdDisplay
          key={`${pageIndex}-${orderIdx}`}
          page={page}
          lineDelay={lineDelay}
          crtEffects={crtEffects}
        />
        {blocked && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            cursor: 'pointer',
          }}>
            <span style={{
              fontFamily: "'VT323', monospace",
              fontSize: '4vh',
              color: '#FFF1E8',
              background: 'rgba(0,0,0,0.65)',
              padding: '0.3em 0.8em',
              letterSpacing: '0.05em',
            }}>
              CLICK TO START
            </span>
          </div>
        )}
      </div>
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
