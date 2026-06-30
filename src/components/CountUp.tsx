import { useEffect, useState } from "react";

export function CountUp({
  value,
  format,
  duration = 800,
}: {
  value: number;
  format: (v: number) => string;
  duration?: number;
}) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const start = performance.now();
    const from = v;
    const to = value;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);
  return <span>{format(v)}</span>;
}
