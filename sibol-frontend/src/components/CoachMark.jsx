import React, { useState, useEffect, useRef, useCallback } from 'react';

const STEPS = [
  {
    targetId: 'coach-sidebar',
    title: <>Your <em className="text-[#f0a830]">Sidebar</em></>,
    body: 'This is your main navigation panel. Use it to move between Dashboard, Crop Care, Reports, and Settings.',
    placement: 'right',
  },
  {
    targetId: 'coach-nav-dashboard',
    title: <><em className="text-[#f0a830]">Dashboard</em> Home</>,
    body: 'Your central hub — weather, sensor readings, and crop status are all here at a glance.',
    placement: 'right',
  },
  {
    targetId: 'coach-nav-cropcare',
    title: <>Crop <em className="text-[#f0a830]">Care</em></>,
    body: 'Monitor and manage your individual crops. Dive into detailed sensor data and health history.',
    placement: 'right',
  },
  {
    targetId: 'coach-weather',
    title: <>Live <em className="text-[#f0a830]">Weather</em></>,
    body: 'Current conditions at your farm. Tap the C / F toggle to switch units.',
    placement: 'bottom',
  },
  {
    targetId: 'coach-advisory',
    title: <>Crop <em className="text-[#f0a830]">Alerts</em></>,
    body: 'System-generated advisories based on detected crop health. Act early!',
    placement: 'bottom',
  },
  {
    targetId: 'coach-sensors',
    title: <>Sensor <em className="text-[#f0a830]">Trends</em></>,
    body: 'Real-time readings from your IoT sensors, plotted over time.',
    placement: 'top',
  },
  {
    targetId: 'coach-crops',
    title: <>Your <em className="text-[#f0a830]">Crops</em></>,
    body: 'Browse planted crops and check their health status here.',
    placement: 'top',
  },
];

const PAD = 10;
const GAP = 16;
const ARROW = 10;

const CoachMark = ({ open, onClose, userId }) => {
  const storageKey = userId ? `sibol_toured_${userId}` : 'sibol_toured';

  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [spotStyle, setSpotStyle] = useState({});
  const [cardPos, setCardPos] = useState({ top: 0, left: 0, width: 272 });
  const [arrowPos, setArrowPos] = useState({ side: 'top', offset: 0 });
  const rafRef = useRef(null);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-launch
  useEffect(() => {
    if (open === undefined) {
      const toured = localStorage.getItem(storageKey);
      if (!toured) {
        const t = setTimeout(() => setActive(true), 1000);
        return () => clearTimeout(t);
      }
    }
  }, [storageKey, open]);

  // Controlled mode
  useEffect(() => {
    if (open !== undefined) setActive(open);
  }, [open]);

  const position = useCallback(() => {
    const s = STEPS[step];
    const target = document.getElementById(s.targetId);
    if (!target) return;

    const tr = target.getBoundingClientRect();

    // 1. Spotlight Style
    setSpotStyle({
      top: tr.top - PAD,
      left: tr.left - PAD,
      width: tr.width + PAD * 2,
      height: tr.height + PAD * 2,
    });

    // 2. Scroll element into view (Crucial for mobile)
    if (active) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 3. Card Positioning
    if (window.innerWidth < 768) {
      // MOBILE: Fixed Bottom Sheet
      setCardPos({
        top: 'auto',
        left: 16,
        width: window.innerWidth - 32,
        bottom: 24
      });
      setArrowPos({ side: 'none', offset: 0 });
    } else {
      // DESKTOP: Original Relative Logic
      const CW = 272;
      const CH = 195;
      let top, left, side, arrowOffset;

      switch (s.placement) {
        case 'right':
          left = tr.right + PAD + GAP;
          top = tr.top + tr.height / 2 - CH / 2;
          side = 'left';
          arrowOffset = CH / 2 - ARROW;
          break;
        case 'bottom':
          top = tr.bottom + PAD + GAP;
          left = tr.left + tr.width / 2 - CW / 2;
          side = 'top';
          arrowOffset = CW / 2 - ARROW;
          break;
        case 'top':
        default:
          top = tr.top - PAD - GAP - CH;
          left = tr.left + tr.width / 2 - CW / 2;
          side = 'bottom';
          arrowOffset = CW / 2 - ARROW;
          break;
      }

      const clampedLeft = Math.max(8, Math.min(left, window.innerWidth - CW - 8));
      const clampedTop = Math.max(8, Math.min(top, window.innerHeight - CH - 8));

      setCardPos({ top: clampedTop, left: clampedLeft, width: CW, bottom: 'auto' });
      setArrowPos({ side, offset: arrowOffset });
    }
  }, [step, active]);

  useEffect(() => {
    if (!active) return;
    position();
    const onRes = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(position);
    };
    window.addEventListener('resize', onRes);
    window.addEventListener('scroll', onRes, true);
    return () => {
      window.removeEventListener('resize', onRes);
      window.removeEventListener('scroll', onRes, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, step, position]);

  const finish = () => { setActive(false); setDone(true); localStorage.setItem(storageKey, '1'); onClose?.(); };
  const skip = () => { setActive(false); localStorage.setItem(storageKey, '1'); onClose?.(); };
  const next = () => step < STEPS.length - 1 ? setStep(s => s + 1) : finish();
  const prev = () => step > 0 && setStep(s => s - 1);

  const arrowStyle = () => {
    if (arrowPos.side === 'none') return { display: 'none' };
    const base = { position: 'absolute', width: 0, height: 0, pointerEvents: 'none' };
    const color = '#ffffff';
    switch (arrowPos.side) {
      case 'left': return { ...base, top: arrowPos.offset, left: -ARROW, borderTop: `${ARROW}px solid transparent`, borderBottom: `${ARROW}px solid transparent`, borderRight: `${ARROW}px solid ${color}` };
      case 'top': return { ...base, top: -ARROW, left: arrowPos.offset, borderLeft: `${ARROW}px solid transparent`, borderRight: `${ARROW}px solid transparent`, borderBottom: `${ARROW}px solid ${color}` };
      case 'bottom': default: return { ...base, bottom: -ARROW, left: arrowPos.offset, borderLeft: `${ARROW}px solid transparent`, borderRight: `${ARROW}px solid transparent`, borderTop: `${ARROW}px solid ${color}` };
    }
  };

  if (!active && !done) return null;

  return (
    <>
      {active && (
        <div className="fixed inset-0 z-[10000] overflow-hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-[rgba(11,61,30,0.75)]"
            style={{
              clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${spotStyle.top}px, ${spotStyle.left}px ${spotStyle.top}px, ${spotStyle.left}px ${spotStyle.top + spotStyle.height}px, ${spotStyle.left + spotStyle.width}px ${spotStyle.top + spotStyle.height}px, ${spotStyle.left + spotStyle.width}px ${spotStyle.top}px, 0% ${spotStyle.top}px)`,
              transition: 'clip-path 0.4s ease'
            }}
            onClick={skip}
          />

          {/* Spotlight Border */}
          <div
            className="absolute rounded-xl border-2 border-[#d4840a] shadow-[0_0_0_4px_rgba(212,132,10,0.2)] transition-all duration-400"
            style={spotStyle}
          />

          {/* Tooltip Card */}
          <div
            className="fixed bg-white rounded-2xl p-6 shadow-2xl transition-all duration-400"
            style={{
              top: cardPos.top,
              bottom: cardPos.bottom,
              left: cardPos.left,
              width: cardPos.width,
              zIndex: 10001
            }}
          >
            <div style={arrowStyle()} />
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#d4840a]/10 text-[#d4840a] text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                Step {step + 1} of {STEPS.length}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#0b3d1e] mb-2 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {STEPS[step].title}
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {STEPS[step].body}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {STEPS.map((_, i) => (
                  <div key={i} className="h-1 rounded-full transition-all" style={{ width: i === step ? 16 : 4, background: i === step ? '#d4840a' : '#eee' }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={step > 0 ? prev : skip} className="text-xs text-gray-400 px-3 py-2 font-medium">
                  {step > 0 ? 'Back' : 'Skip'}
                </button>
                <button onClick={next} className="bg-[#0b3d1e] text-white text-xs font-bold px-5 py-2.5 rounded-xl">
                  {step === STEPS.length - 1 ? 'Finish' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Done Modal */}
      {done && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-6 bg-black/60">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
            <div className="text-4xl mb-4">🌱</div>
            <h2 className="text-2xl font-bold text-[#0b3d1e] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              You're a <em className="text-[#f0a830]">Pro!</em>
            </h2>
            <p className="text-gray-500 text-sm mb-6">You've explored the essentials of SIBOL. Time to grow some healthy crops!</p>
            <button onClick={() => setDone(false)} className="w-full bg-[#0b3d1e] text-white py-4 rounded-2xl font-bold">
              Let's Go!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CoachMark;
