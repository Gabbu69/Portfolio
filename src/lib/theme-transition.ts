export const THEME_TRANSITION_DURATION = 640;

/** A pixel-edged iris centered on the actual sun/moon control. */
export function themeReveal(x: number, y: number, width: number, height: number, dark: boolean) {
  // The extra reach covers the inward corners of the pixel staircase too.
  const radius = Math.ceil(Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) * 1.08) + 24;
  const step = dark ? 12 : 8;
  const polygon = (progress: number) => {
    const points: string[] = [];
    const size = radius * progress;
    let previousY = y;
    for (let index = 0; index <= 64; index++) {
      const angle = index / 64 * Math.PI * 2;
      const px = size ? Math.round((x + Math.cos(angle) * size) / step) * step : x;
      const py = size ? Math.round((y + Math.sin(angle) * size) / step) * step : y;
      if (index) points.push(`${px}px ${previousY}px`);
      points.push(`${px}px ${py}px`);
      previousY = py;
    }
    return `polygon(${points.join(",")})`;
  };
  return {
    radius,
    frames: [0, .16, .44, .76, 1].map(progress => ({
      offset: progress,
      clipPath: polygon(progress),
      filter: `brightness(${1 + (1 - progress) * (dark ? .13 : .06)}) saturate(${1 + (1 - progress) * .16})`,
    })),
  };
}
