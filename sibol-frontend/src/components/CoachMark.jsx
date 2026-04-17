import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * SIBOL CoachMark — Onboarding Overlay
 * Per-user: stores `sibol_toured_<userId>` in localStorage.
 * Pass `userId` prop (from localStorage or auth context).
 */

const STEPS = [
  {
    targetId:  'coach-sidebar',
    title:     <>Your <em className="text-[#f0a830]">Sidebar</em></>,
    body:      'This is your main navigation panel. Use it to move between Dashboard, Crop Care, Reports, Crop Profile, and Account Settings.',
    placement: 'right',
  },
  {
    targetId:  'coach-nav-dashboard',
    title:     <><em className="text-[#f0a830]">Dashboard</em> Home</>,
    body:      'Your central hub — weather, sensor readings, crop status, and alerts are all here at a glance.',
    placement: 'right',
  },
  {
    targetId:  'coach-nav-cropcare',
    title:     <>Crop <em className="text-[#f0a830]">Care</em></>,
    body:      'Monitor and manage your individual crops. Dive into detailed sensor data and health history.',
    placement: 'right',
  },
  {
    targetId:  'coach-weather',
    title:     <>Live <em className="text-[#f0a830]">Weather</em></>,
    body:      'Current conditions at your farm location. Tap the C / F toggle to switch temperature units.',
    placement: 'bottom',
  },
  {
    targetId:  'coach-advisory',
    title:     <>Crop <em className="text-[#f0a830]">Alerts</em></>,
    body:      'System-generated advisories based on detected crop health and disease risk. Act early!',
    placement: 'bottom',
  },
  {
    targetId:  'coach-sensors',
    title:     <>Sensor <em className="text-[#f0a830]">Trends</em></>,
    body:      'Real-time temperature and humidity readings from your IoT garden sensors, plotted over time.',
    placement: 'top',
  },
  {
    targetId:  'coach-crops',
    title:     <>Your <em className="text-[#f0a830]">Crops</em></>,
    body:      'Browse planted crops and check their health. Select one and tap Details for full information.',
    placement: 'top',
  },
];

const PAD = 10;  // spotlight padding around target
const GAP = 16;  // gap between spotlight edge and tooltip card

/** Returns the arrow direction label given card placement */
const arrowSide = (placement) => {
  switch (placement) {
    case 'right':  return 'left';   // card is to the right  → arrow points left
    case 'left':   return 'right';  // card is to the left   → arrow points right
    case 'bottom': return 'top';    // card is below         → arrow points up
    case 'top':    return 'bottom'; // card is above         → arrow points down
    default:       return 'top';
  }
};

const ARROW = 10; // arrow size px

const CoachMark = ({ open, onClose, userId }) => {
  const storageKey = userId ? `sibol_toured_${userId}` : 'sibol_toured';

  const [active,    setActive]    = useState(false);
  const [step,      setStep]      = useState(0);
  const [done,      setDone]      = useState(false);
  const [spotStyle, setSpotStyle] = useState({});
  const [cardPos,   setCardPos]   = useState({ top: 0, left: 0, width: 272 });
  const [arrowPos,  setArrowPos]  = useState({ side: 'top', offset: 0 });
  const rafRef = useRef(null);

  /* ── auto-launch once per user ── */
  useEffect(() => {
    if (open === undefined) {
      const toured = localStorage.getItem(storageKey);
      if (!toured) {
        const t = setTimeout(() => setActive(true), 600);
        return () => clearTimeout(t);
      }
    }
  }, [storageKey, open]);

  /* ── controlled mode ── */
  useEffect(() => {
    if (open !== undefined) setActive(open);
  }, [open]);

  /* ── position spotlight + tooltip card + arrow ── */
  const position = useCallback(() => {
    const s      = STEPS[step];
    const target = document.getElementById(s.targetId);
    if (!target) return;

    const tr = target.getBoundingClientRect();

    // spotlight rect
    const spot = {
      top:    tr.top    - PAD,
      left:   tr.left   - PAD,
      width:  tr.width  + PAD * 2,
      height: tr.height + PAD * 2,
    };
    setSpotStyle(spot);

    const CW = 272;
    const CH = 195; // estimated card height

    let top, left, side, arrowOffset;

    switch (s.placement) {
      case 'right': {
        left = tr.right + PAD + GAP;
        // vertically centre card on target
        top  = tr.top + tr.height / 2 - CH / 2;
        side = 'left';
        // arrow at vertical centre of card
        arrowOffset = CH / 2 - ARROW;
        break;
      }
      case 'left': {
        left = tr.left - PAD - GAP - CW;
        top  = tr.top + tr.height / 2 - CH / 2;
        side = 'right';
        arrowOffset = CH / 2 - ARROW;
        break;
      }
      case 'bottom': {
        top  = tr.bottom + PAD + GAP;
        left = tr.left + tr.width / 2 - CW / 2;
        side = 'top';
        // arrow at horizontal centre of card
        arrowOffset = CW / 2 - ARROW;
        break;
      }
      case 'top':
      default: {
        top  = tr.top - PAD - GAP - CH;
        left = tr.left + tr.width / 2 - CW / 2;
        side = 'bottom';
        arrowOffset = CW / 2 - ARROW;
        break;
      }
    }

    // clamp card inside viewport
    const clampedLeft = Math.max(8, Math.min(left, window.innerWidth  - CW - 8));
    const clampedTop  = Math.max(8, Math.min(top,  window.innerHeight - CH - 8));

    // adjust arrow offset if card was clamped
    let adjustedArrowOffset = arrowOffset;
    if (s.placement === 'bottom' || s.placement === 'top') {
      adjustedArrowOffset = arrowOffset + (left - clampedLeft);
      adjustedArrowOffset = Math.max(ARROW * 2, Math.min(adjustedArrowOffset, CW - ARROW * 4));
    }
    if (s.placement === 'right' || s.placement === 'left') {
      adjustedArrowOffset = arrowOffset + (top - clampedTop);
      adjustedArrowOffset = Math.max(ARROW * 2, Math.min(adjustedArrowOffset, CH - ARROW * 4));
    }

    setCardPos({ top: clampedTop, left: clampedLeft, width: CW });
    setArrowPos({ side, offset: adjustedArrowOffset });
  }, [step]);

  useEffect(() => {
    if (!active) return;
    position();
    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(position);
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(rafRef.current); };
  }, [active, step, position]);

  /* ── handlers ── */
  const finish = () => {
    setActive(false);
    setDone(true);
    localStorage.setItem(storageKey, '1');
    onClose?.();
  };
  const skip = () => {
    setActive(false);
    localStorage.setItem(storageKey, '1');
    onClose?.();
  };
  const next = () => step < STEPS.length - 1 ? setStep(s => s + 1) : finish();
  const prev = () => step > 0 && setStep(s => s - 1);
  const restartTour = () => { setDone(false); setStep(0); setActive(true); };

  /* ── arrow CSS ── */
  const arrowStyle = () => {
    const base = {
      position:    'absolute',
      width:       0,
      height:      0,
      pointerEvents: 'none',
    };
    const color = '#ffffff';
    const shadow = 'rgba(0,0,0,0.10)';

    switch (arrowPos.side) {
      case 'left': // arrow points left (card is to the right of target)
        return {
          ...base,
          top:         arrowPos.offset,
          left:        -ARROW,
          borderTop:   `${ARROW}px solid transparent`,
          borderBottom:`${ARROW}px solid transparent`,
          borderRight: `${ARROW}px solid ${color}`,
          filter:      `drop-shadow(-2px 0 2px ${shadow})`,
        };
      case 'right': // arrow points right
        return {
          ...base,
          top:         arrowPos.offset,
          right:       -ARROW,
          borderTop:   `${ARROW}px solid transparent`,
          borderBottom:`${ARROW}px solid transparent`,
          borderLeft:  `${ARROW}px solid ${color}`,
          filter:      `drop-shadow(2px 0 2px ${shadow})`,
        };
      case 'top': // arrow points up (card is below target)
        return {
          ...base,
          top:          -ARROW,
          left:          arrowPos.offset,
          borderLeft:   `${ARROW}px solid transparent`,
          borderRight:  `${ARROW}px solid transparent`,
          borderBottom: `${ARROW}px solid ${color}`,
          filter:       `drop-shadow(0 -2px 2px ${shadow})`,
        };
      case 'bottom': // arrow points down (card is above target)
      default:
        return {
          ...base,
          bottom:      -ARROW,
          left:         arrowPos.offset,
          borderLeft:  `${ARROW}px solid transparent`,
          borderRight: `${ARROW}px solid transparent`,
          borderTop:   `${ARROW}px solid ${color}`,
          filter:      `drop-shadow(0 2px 2px ${shadow})`,
        };
    }
  };

  if (!active && !done) return null;

  return (
    <>
      {active && (
        <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: 'all' }}>

          {/* ── Overlay with cutout ── */}
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(11,61,30,0.72)',
              clipPath: `polygon(
                0% 0%, 100% 0%, 100% 100%, 0% 100%,
                0% ${spotStyle.top}px,
                ${spotStyle.left}px ${spotStyle.top}px,
                ${spotStyle.left}px ${(spotStyle.top  || 0) + (spotStyle.height || 0)}px,
                ${(spotStyle.left  || 0) + (spotStyle.width  || 0)}px ${(spotStyle.top || 0) + (spotStyle.height || 0)}px,
                ${(spotStyle.left  || 0) + (spotStyle.width  || 0)}px ${spotStyle.top}px,
                0% ${spotStyle.top}px
              )`,
              transition: 'clip-path 0.45s cubic-bezier(0.4,0,0.2,1)',
            }}
            onClick={skip}
          />

          {/* ── Spotlight border ring ── */}
          <div
            className="absolute rounded-[14px] pointer-events-none"
            style={{
              ...spotStyle,
              border:     '2px solid #d4840a',
              boxShadow:  '0 0 0 4px rgba(212,132,10,0.22)',
              transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)',
            }}
          />

          {/* ── Tooltip card ── */}
          <div
            className="fixed bg-white rounded-2xl p-5 shadow-2xl"
            style={{
              top:        cardPos.top,
              left:       cardPos.left,
              width:      cardPos.width,
              transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
              fontFamily: "'DM Sans', sans-serif",
              position:   'fixed',
            }}
          >
            {/* Arrow pointer */}
            <div style={arrowStyle()} />

            {/* Step pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[rgba(212,132,10,0.3)] bg-[rgba(212,132,10,0.1)] text-[10px] font-semibold tracking-widest uppercase text-[#d4840a] mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4840a] animate-pulse" />
              Step {step + 1} of {STEPS.length}
            </div>

            <h3
              className="font-bold text-[#0b3d1e] mb-1.5 leading-snug"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 17 }}
            >
              {STEPS[step].title}
            </h3>

            <p className="text-[12px] text-gray-500 leading-relaxed mb-4">
              {STEPS[step].body}
            </p>

            {/* Progress dots + nav buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width:      i === step ? 18 : 6,
                      background: i === step ? '#d4840a' : 'rgba(11,61,30,0.15)',
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {step > 0 ? (
                  <button
                    onClick={prev}
                    className="text-[12px] text-gray-400 hover:text-[#0b3d1e] px-2 py-1.5 rounded-lg transition-colors"
                  >
                    ← Back
                  </button>
                ) : (
                  <button
                    onClick={skip}
                    className="text-[12px] text-gray-400 hover:text-[#0b3d1e] px-2 py-1.5 rounded-lg transition-colors"
                  >
                    Skip
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button
                    onClick={next}
                    className="text-[12px] font-semibold text-white bg-[#0b3d1e] hover:bg-[#2e8b57] px-4 py-2 rounded-lg transition-all hover:-translate-y-px"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={finish}
                    className="text-[12px] font-semibold text-white bg-[#d4840a] hover:bg-[#f0a830] px-4 py-2 rounded-lg transition-colors"
                  >
                    Finish ✓
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Done screen ── */}
      {done && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(11,61,30,0.75)]">
          <div
            className="bg-white rounded-2xl p-9 text-center max-w-xs mx-4 shadow-2xl"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <div className="w-14 h-14 rounded-full bg-[rgba(46,139,87,0.1)] border-2 border-[rgba(46,139,87,0.25)] flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2e8b57" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#0b3d1e', marginBottom: 8 }}>
              You're all <em style={{ color: '#f0a830' }}>set!</em>
            </h2>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-5">
              You now know the key areas of SIBOL. Start exploring your garden and keep your crops healthy.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setDone(false)}
                className="text-[13px] font-semibold text-white bg-[#0b3d1e] hover:bg-[#2e8b57] py-3 px-6 rounded-xl transition-colors"
              >
                Start Exploring →
              </button>
              <button
                onClick={restartTour}
                className="text-[12px] text-gray-400 hover:text-[#0b3d1e] py-2 transition-colors"
              >
                Replay tour
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoachMark;
