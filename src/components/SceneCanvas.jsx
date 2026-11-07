import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createExperience } from '../engine/experience.js';

export const SceneCanvas = forwardRef(function SceneCanvas(
  { theme, phase, reduced, onReady, onFallback },
  ref,
) {
  const canvasRef = useRef(null);
  const apiRef = useRef(null);
  const themeRef = useRef(theme);
  const phaseRef = useRef(phase);
  const reducedRef = useRef(reduced);
  themeRef.current = theme;
  phaseRef.current = phase;
  reducedRef.current = reduced;

  useImperativeHandle(ref, () => ({
    celebrate: () => apiRef.current?.celebrate(),
    poke: () => apiRef.current?.poke(),
  }));

  useEffect(() => {
    const experience = createExperience(canvasRef.current, {
      theme: themeRef.current,
      phase: phaseRef.current,
      reduced: reducedRef.current,
      onReady,
      onFallback,
    });
    apiRef.current = experience;
    return () => {
      apiRef.current = null;
      experience.dispose();
    };
  }, [onReady, onFallback]);

  useEffect(() => {
    apiRef.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    apiRef.current?.setPhase(phase);
  }, [phase]);

  useEffect(() => {
    apiRef.current?.setReduced(reduced);
  }, [reduced]);

  return <canvas ref={canvasRef} className="scene-canvas" aria-hidden="true" />;
});
