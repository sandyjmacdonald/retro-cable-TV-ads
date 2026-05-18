import { useEffect, useRef, useState } from 'preact/hooks';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useAudio(audioConfig) {
  const audioRef     = useRef(null);
  const tracksRef    = useRef([]);
  const indexRef     = useRef(0);
  const firstPlayRef = useRef(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!audioConfig) return;

    const { folder = 'music', shuffle: doShuffle = true, volume = 0.6 } = audioConfig;

    function playTrack() {
      const el = audioRef.current;
      if (!el || !tracksRef.current.length) return;
      el.volume = volume;

      if (firstPlayRef.current) {
        firstPlayRef.current = false;
        el.addEventListener('loadedmetadata', function seekRandom() {
          el.removeEventListener('loadedmetadata', seekRandom);
          el.currentTime = Math.random() * el.duration;
          el.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
        });
      } else {
        el.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
      }

      el.src = tracksRef.current[indexRef.current];
    }

    function onEnded() {
      indexRef.current = (indexRef.current + 1) % tracksRef.current.length;
      playTrack();
    }

    fetch(`/${folder}/manifest.json`)
      .then(r => r.json())
      .then(files => {
        const tracks = files.map(f => `/${folder}/${f}`);
        tracksRef.current = doShuffle ? shuffle(tracks) : tracks;
        indexRef.current  = Math.floor(Math.random() * tracksRef.current.length);
        playTrack();
      })
      .catch(err => console.warn('Audio manifest load failed:', err));

    const el = audioRef.current;
    if (el) el.addEventListener('ended', onEnded);
    return () => { if (el) el.removeEventListener('ended', onEnded); };
  }, [audioConfig]);

  function unblock() {
    const el = audioRef.current;
    if (!el) return;
    el.play()
      .then(() => setBlocked(false))
      .catch(() => {});
  }

  return { audioRef, blocked, unblock };
}
