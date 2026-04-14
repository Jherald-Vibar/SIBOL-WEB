import React, { useState, useEffect, useRef, useCallback } from 'react';

const STEPS = [
  {
    targetId: 'coach-sidebar',
    title: <>Your <em className="text-[#f0a830]">Sidebar</em></>,
    body:  'Your main navigation. Move between Dashboard, Crop Care, Reports, and Settings here.',
    placement: 'right',
  },
  {
    targetId: 'coach-nav-dashboard',
    title: <><em className="text-[#f0a830]">Dashboard</em></>,
    body:  'Your central hub for weather, sensor readings, and alerts.',
    placement: 'right',
  },
  {
    targetId: 'coach-nav-crop-care',
    title: <>Daily <em className="text-[#f0a830]">Care</em></>,
    body:  'Keep track of watering and health logs for your plants.',
    placement: 'right',
  },
  {
    targetId: 'coach-weather',
    title: <>Live <em className="text-[#f0a830]">Weather</em></>,
    body:  'Current conditions at your farm. Tap the C / F toggle to switch units.',
    placement: 'bottom',
  },
];

const PAD = 10;
const GAP = 14;

const CoachMark = ({ open, onClose, autoLaunch = true }) => {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [spotStyle, setSpotStyle] = useState({});
  const [cardStyle, setCardStyle] = useState({});
  const rafRef = useRef(null);

  const userId = localStorage.getItem("userId") || "guest";
  const storageKey = `sibol_toured_${userId}`;

  useEffect(() => {
    if (autoLaunch && open === undefined) {
      const toured = localStorage.getItem(storageKey);
      if (!toured) {
        const t = setTimeout(() => setActive(true), 1200);
        return () => clearTimeout(t);
      }
    }
  }, [autoLaunch, open, storageKey]);

  const position = useCallback(() => {
    const s = STEPS[step];

    // RESPONSIVE LOGIC: Check desktop ID, if hidden, check mobile ID
    let target = document.getElementById(s.targetId);
    if (!target || target.offsetParent === null) {
      target = document.getElementById(`${s.targetId}-mobile`);
    }

    if (!target) return;

    const tr = target.getBoundingClientRect();
    setSpotStyle({
      top: tr.top - PAD,
      left: tr.left - PAD,
      width: tr.width + PAD * 2,
      height: tr.height + PAD * 2
    });

    const isMobile = window.innerWidth < 768;
    const CW = isMobile ? 240 : 272;
    const CH = 180;

    let top, left;

    // Flip card to top if target is at the bottom (Mobile Nav)
    if (tr.top > window.innerHeight / 2) {
      top = tr.top - CH - GAP;
      left = tr.left + tr.width / 2 - CW / 2;
    } else {
      switch (s.placement) {
        case 'right':
          top = tr.top;
          left = tr.right + PAD + GAP;
          break;
        case 'bottom':
          top = tr.bottom + PAD + GAP;
          left = tr.left + tr.width / 2 - CW / 2;
          break;
        default:
          top = tr.top - CH - GAP;
          left = tr.left + tr.width / 2 - CW / 2;
      }
    }

    // Clamping to screen edges
    left = Math.max(10, Math.min(left, window.innerWidth - CW - 10));
    top = Math.max(10, Math.min(top, window.innerHeight - CH - 10));
    setCardStyle({ top, left, width: CW });
  }, [step]);

  useEffect(() => {
    if (!active) return;
    position();
    window.addEventListener('resize', position);
    return () => window.removeEventListener('resize', position);
  }, [active, step, position]);

  const finish = () => { setActive(false); setDone(true); localStorage.setItem(storageKey, '1'); onClose?.(); };
  const skip = () => { setActive(false); localStorage.setItem(storageKey, '1'); onClose?.(); };

  if (!active && !done) return null;

  return (
    <>
      {active && (
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-[rgba(11,61,30,0.7)]" style={{ clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${spotStyle.top}px, ${spotStyle.left}px ${spotStyle.top}px, ${spotStyle.left}px ${spotStyle.top + spotStyle.height}px, ${spotStyle.left + spotStyle.width}px ${spotStyle.top + spotStyle.height}px, ${spotStyle.left + spotStyle.width}px ${spotStyle.top}px, 0% ${spotStyle.top}px)` }} onClick={skip} />
          <div className="absolute rounded-xl border-2 border-[#d4840a] pointer-events-none" style={{ ...spotStyle }} />
          <div className="fixed bg-white rounded-2xl p-5 shadow-2xl" style={{ ...cardStyle }}>
            <h3 className="font-bold text-[#0b3d1e] mb-2">{STEPS[step].title}</h3>
            <p className="text-xs text-gray-500 mb-4">{STEPS[step].body}</p>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400">Step {step + 1}/{STEPS.length}</span>
              <div className="flex gap-2">
                {step > 0 && <button onClick={() => setStep(s => s - 1)} className="text-xs px-2 py-1 text-gray-400">Back</button>}
                <button onClick={step < STEPS.length - 1 ? () => setStep(s => s + 1) : finish} className="text-xs font-bold text-white bg-[#0b3d1e] px-4 py-2 rounded-lg">
                  {step < STEPS.length - 1 ? 'Next' : 'Finish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {done && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-white p-8 rounded-2xl text-center max-w-xs shadow-2xl">
            <h2 className="text-xl font-bold text-[#0b3d1e] mb-2">Welcome to SIBOL!</h2>
            <p className="text-sm text-gray-500 mb-6">You're ready to start monitoring your garden.</p>
            <button onClick={() => setDone(false)} className="w-full py-3 bg-[#0b3d1e] text-white rounded-xl font-bold">Start Exploring</button>
          </div>
        </div>
      )}
    </>
  );
};

export default CoachMark;
