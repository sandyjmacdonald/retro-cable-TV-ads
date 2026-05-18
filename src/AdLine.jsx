import { useState, useEffect } from 'preact/hooks';
import { color } from './palette';
import { strftime } from './strftime';

export default function AdLine({ line }) {
  const isDatetime = line.type === 'datetime';
  const [now, setNow]       = useState(() => new Date());
  const [show, setShow]     = useState(true);

  useEffect(() => {
    if (!isDatetime) return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [isDatetime]);

  useEffect(() => {
    if (!line.blink) return;
    const ms = Math.round((line.blink_interval ?? 0.5) * 1000);
    const t = setInterval(() => setShow(v => !v), ms);
    return () => clearInterval(t);
  }, [line.blink, line.blink_interval]);

  const height   = line.height === 2 ? 2 : 1;
  const inverted = !!line.inverted;
  const align    = line.align ?? 'center';

  // Normal: coloured bar behind the whole line, text in fg colour.
  // Inverted: line is transparent (page bg shows through), highlight
  // box sits behind the text only — like a text selection / highlighter.
  const lineBg        = inverted ? 'transparent' : color(line.bg);
  const highlightColor = inverted ? color(line.color) : undefined;
  const textColor      = inverted ? color(line.bg)    : color(line.color);

  let text = isDatetime
    ? strftime(line.format ?? '%-I:%M:%S %p', now)
    : (line.text ?? '');
  if (line.caps) text = text.toUpperCase();

  const fontVh = height === 2 ? 13 : 6.5;
  const rowVh  = height * 9;

  return (
    <div
      style={{
        width: '100%',
        minHeight: `${rowVh}vh`,
        background: lineBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
        padding: '0 2vw',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: `${fontVh}vh`,
          lineHeight: 1,
          color: textColor,
          letterSpacing: '0.04em',
          textAlign: align,
          visibility: show ? 'visible' : 'hidden',
          textShadow: `1px 2px 0 rgba(0,0,0,0.45), 0 0 8px ${textColor}55`,
          userSelect: 'none',
          // Highlight box — only for inverted lines
          ...(inverted && {
            background: highlightColor,
            padding: '0.04em 0.35em',
          }),
        }}
      >
        {text}
      </span>
    </div>
  );
}
