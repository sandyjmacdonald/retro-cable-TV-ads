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
  const audioRef  = useRef(null);
  const tracksRef = useRef([]);
  const indexRef  = useRef(0);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!audioConfig) return;

    const { folder = 'music', shuffle: doShuffle = true, volume = 0.6 } = audioConfig;

    function playTrack() {
      const el = audioRef.current;
      if (!el || !tracksRef.current.length) return;
      el.src    = tracksRef.current[indexRef.current];
      el.volume = volume;
      el.play()
        .then(() => setBlocked(false))
        .catch(() => setBlocked(true));
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
        indexRef.current  = 0;
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
