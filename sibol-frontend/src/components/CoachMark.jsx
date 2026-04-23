import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ─── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  {
    phase: 'tour',
    navigate: '/user/dashboard',
    targetId: 'coach-sidebar',
    title: <>Your <em className="text-[#f0a830]">Sidebar</em></>,
    body: 'This is your main navigation panel. Use it to move between Dashboard, Crop Care, Reports, and Settings.',
    placement: 'right',
  },
  {
    phase: 'tour',
    navigate: '/user/dashboard',
    targetId: 'coach-nav-dashboard',
    title: <><em className="text-[#f0a830]">Dashboard</em> Home</>,
    body: 'Your central hub — weather, sensor readings, and crop status at a glance.',
    placement: 'right',
  },
  {
    phase: 'tour',
    navigate: '/user/dashboard',
    targetId: 'coach-nav-cropcare',
    title: <>Crop <em className="text-[#f0a830]">Care</em></>,
    body: 'Monitor and manage your individual crops. Dive into detailed sensor data and health history.',
    placement: 'right',
  },
  {
    phase: 'tour',
    navigate: '/user/dashboard',
    targetId: 'coach-nav-report',
    title: <>Reports & <em className="text-[#f0a830]">Insights</em></>,
    body: 'View historical data and generated reports for all your crops and sensors.',
    placement: 'right',
  },
  {
    phase: 'tour',
    navigate: '/user/dashboard',
    targetId: 'coach-nav-cropprofile',
    title: <>Crop <em className="text-[#f0a830]">Profile</em></>,
    body: "Manage your crop profiles and gardens. This is also where you'll add new gardens.",
    placement: 'right',
  },
  {
    phase: 'tour',
    navigate: '/user/dashboard',
    targetId: 'coach-nav-account',
    title: <>Account <em className="text-[#f0a830]">Settings</em></>,
    body: 'Update your profile, manage devices, and claim new IoT sensors here.',
    placement: 'right',
  },
  {
    phase: 'tour',
    navigate: '/user/dashboard',
    targetId: 'coach-weather',
    title: <>Live <em className="text-[#f0a830]">Weather</em></>,
    body: 'Current conditions at your farm. Tap the C / F toggle to switch units.',
    placement: 'bottom',
  },
  {
    phase: 'tour',
    navigate: '/user/dashboard',
    targetId: 'coach-advisory',
    title: <>Crop <em className="text-[#f0a830]">Alerts</em></>,
    body: 'System-generated advisories based on detected crop health. Act early to protect your harvest!',
    placement: 'bottom',
  },
  {
    phase: 'tour',
    navigate: '/user/dashboard',
    targetId: 'coach-sensors',
    title: <>Sensor <em className="text-[#f0a830]">Trends</em></>,
    body: 'Real-time readings from your IoT sensors, plotted over time.',
    placement: 'top',
  },
  {
    phase: 'tour',
    navigate: '/user/dashboard',
    targetId: 'coach-crops',
    title: <>Your <em className="text-[#f0a830]">Crops</em></>,
    body: 'Browse planted crops and check their health status here.',
    placement: 'top',
  },

  // ── Phase 2: Onboarding wizard ─────────────────────────────────────────────
  {
    phase: 'onboard',
    navigate: null,
    targetId: null,
    title: <>Let's set up your <em className="text-[#f0a830]">Farm</em></>,
    body: "You've seen the whole app! Now let's get you set up. We'll help you create your first garden, add a crop, and claim your IoT device. It only takes a minute.",
    placement: 'center',
    cta: "Let's go →",
  },
  {
    phase: 'onboard',
    navigate: '/user/crop-care',
    targetId: 'coach-add-garden-btn',
    title: <>Create your first <em className="text-[#f0a830]">Garden</em></>,
    body: "Tap \"Create Garden\" below to open the form. Fill in a name and location, then save — we'll guide you right in!",
    placement: 'bottom',
    cta: 'Create Garden →',
  },
  {
    phase: 'onboard',
    navigate: null,
    targetId: '__GARDEN_OPEN__',
    title: <>Open your <em className="text-[#f0a830]">Garden</em></>,
    body: "Your garden is ready! Tap the open button to step inside and start managing your crops.",
    placement: 'bottom',
    cta: 'Open Garden →',
  },
  {
    phase: 'onboard',
    navigate: '/user/crop-profile',
    targetId: 'coach-add-crop-btn',
    title: <>Add your first <em className="text-[#f0a830]">Crop</em></>,
    body: "Inside your garden, add a crop. Choose the plant type and planted date — SIBOL will start monitoring it right away.",
    placement: 'bottom',
    cta: 'Add Crop →',
  },
  {
    phase: 'onboard',
    navigate: '/user/account-settings',
    targetId: 'coach-claim-device-btn',
    title: <>Claim your <em className="text-[#f0a830]">Device</em></>,
    body: 'Enter your device ID to link your IoT sensor to your garden. Once claimed, live sensor data will appear on your dashboard.',
    placement: 'bottom',
    cta: 'Claim Device →',
  },
];

const GARDEN_STEP_IDX      = 11;
const GARDEN_OPEN_STEP_IDX = 12;
const PAD   = 10;
const GAP   = 16;
const ARROW = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveTargetId(step, gardenId) {
  if (!step) return null;
  if (step.targetId === '__GARDEN_OPEN__') {
    return gardenId ? `coach-open-garden-${gardenId}` : null;
  }
  return step.targetId || null;
}

/**
 * Poll until an element with `id` exists AND has a non-zero bounding rect.
 */
function pollForElement(id, onFound, maxMs = 5000) {
  const interval = 100;
  let elapsed = 0;
  const timer = setInterval(() => {
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        clearInterval(timer);
        onFound(el);
        return;
      }
    }
    elapsed += interval;
    if (elapsed >= maxMs) { clearInterval(timer); onFound(null); }
  }, interval);
  return () => clearInterval(timer);
}

// ─── Component ────────────────────────────────────────────────────────────────
const CoachMark = ({ open, onClose, userId }) => {
  const storageKey = userId ? `sibol_toured_${userId}` : 'sibol_toured';
  const navigate   = useNavigate();
  const location   = useLocation();

  const [active,           setActive]           = useState(false);
  const [step,             setStep]             = useState(0);
  const [done,             setDone]             = useState(false);
  const [navigating,       setNavigating]       = useState(false);
  const [waitingForGarden, setWaitingForGarden] = useState(false);
  const [spotStyle,        setSpotStyle]        = useState({});
  const [cardPos,          setCardPos]          = useState({ top: 0, left: 0, width: 272 });
  const [arrowPos,         setArrowPos]         = useState({ side: 'top', offset: 0 });

  const createdGardenIdRef  = useRef(null);
  const [createdGardenId, _setCreatedGardenId] = useState(null);
  const setCreatedGardenId  = useCallback((id) => {
    createdGardenIdRef.current = id;
    _setCreatedGardenId(id);
  }, []);

  const cancelPollRef       = useRef(null);
  const rafRef              = useRef(null);
  const waitingForGardenRef = useRef(false);
  // ─── FIX: track when goToStep's own rAF chain is running so the
  //         resize/scroll effect doesn't race against it ───────────────────────
  const isPositioningRef    = useRef(false);

  // ── Auto-launch (first visit) ───────────────────────────────────────────────
  useEffect(() => {
    if (open === undefined && !localStorage.getItem(storageKey)) {
      const t = setTimeout(() => {
        setActive(true);
        navigate('/user/dashboard');
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [storageKey, open, navigate]);

  // ── Controlled open prop ────────────────────────────────────────────────────
  useEffect(() => {
    if (open !== undefined) setActive(open);
  }, [open]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => () => {
    cancelPollRef.current?.();
    cancelAnimationFrame(rafRef.current);
  }, []);

  // ─── FIX: Accept explicit stepOverride so callers can pass the *new* step
  //         index before React has re-rendered — eliminates the stale-closure
  //         problem that caused the spotlight to jump back to the previous target.
  const position = useCallback((gardenIdOverride, stepOverride) => {
    // Use the explicitly provided step index when available; fall back to the
    // current state value for resize/scroll re-positioning calls.
    const stepIndex = stepOverride !== undefined ? stepOverride : null;

    // We need the STEPS entry: use stepOverride if given, otherwise read
    // the step state directly from the DOM-time closure.  Because `position`
    // is only called synchronously (via rAF) we capture `step` as a ref below.
    const s        = STEPS[stepIndex !== null ? stepIndex : step];
    const gardenId = gardenIdOverride !== undefined ? gardenIdOverride : createdGardenIdRef.current;
    const targetId = resolveTargetId(s, gardenId);

    if (!targetId || s.placement === 'center') {
      const CW = 320, CH = 210;
      setSpotStyle({ top: -9999, left: -9999, width: 0, height: 0 });
      setCardPos({
        top:    window.innerHeight / 2 - CH / 2,
        left:   window.innerWidth  / 2 - CW / 2,
        width:  CW,
        bottom: 'auto',
      });
      setArrowPos({ side: 'none', offset: 0 });
      return;
    }

    const el = document.getElementById(targetId);
    if (!el) return;

    const tr = el.getBoundingClientRect();

    // Guard: element not yet painted
    if (tr.width === 0 && tr.height === 0) return;

    setSpotStyle({
      top:    tr.top  - PAD,
      left:   tr.left - PAD,
      width:  tr.width  + PAD * 2,
      height: tr.height + PAD * 2,
    });
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (window.innerWidth < 768) {
      setCardPos({ top: 'auto', left: 16, width: window.innerWidth - 32, bottom: 24 });
      setArrowPos({ side: 'none', offset: 0 });
      return;
    }

    const CW = 288, CH = 200;
    let top, left, side, arrowOffset;
    switch (s.placement) {
      case 'right':
        left = tr.right + PAD + GAP;
        top  = tr.top + tr.height / 2 - CH / 2;
        side = 'left'; arrowOffset = CH / 2 - ARROW; break;
      case 'bottom':
        top  = tr.bottom + PAD + GAP;
        left = tr.left + tr.width / 2 - CW / 2;
        side = 'top'; arrowOffset = CW / 2 - ARROW; break;
      case 'top':
        top  = tr.top - PAD - GAP - CH;
        left = tr.left + tr.width / 2 - CW / 2;
        side = 'bottom'; arrowOffset = CW / 2 - ARROW; break;
      default:
        top  = tr.top - PAD - GAP - CH;
        left = tr.left + tr.width / 2 - CW / 2;
        side = 'bottom'; arrowOffset = CW / 2 - ARROW; break;
    }

    setCardPos({
      top:    Math.max(8, Math.min(top,  window.innerHeight - CH - 8)),
      left:   Math.max(8, Math.min(left, window.innerWidth  - CW - 8)),
      width:  CW,
      bottom: 'auto',
    });
    setArrowPos({ side, offset: arrowOffset });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  // NOTE: `step` stays in the dep array so the resize/scroll path (which does
  // NOT pass stepOverride) still reads the correct current step.

  // ── Re-position on resize / scroll ──────────────────────────────────────────
  useEffect(() => {
    if (!active || navigating || waitingForGarden) return;

    // Initial position (no override needed — step state is already current)
    position();

    const onLayout = () => {
      // ─── FIX: Don't race against goToStep's own rAF chain ────────────────
      if (isPositioningRef.current) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => position());
    };
    window.addEventListener('resize', onLayout);
    window.addEventListener('scroll', onLayout, true);
    return () => {
      window.removeEventListener('resize', onLayout);
      window.removeEventListener('scroll', onLayout, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, step, position, navigating, waitingForGarden]);

  // ── Navigate then poll for target element ────────────────────────────────────
  const goToStep = useCallback((newStep, gardenIdOverride) => {
    const s = STEPS[newStep];
    if (!s) return;

    const gId      = gardenIdOverride !== undefined ? gardenIdOverride : createdGardenIdRef.current;
    const targetId = resolveTargetId(s, gId);

    cancelPollRef.current?.();
    cancelPollRef.current = null;

    // Update step state so the UI card renders immediately with the new content
    setStep(newStep);

    // ─── FIX: pass newStep explicitly into position() so it uses the correct
    //         STEPS entry before React has committed the setStep re-render ───
    const doPosition = () => {
      setNavigating(false);
      isPositioningRef.current = true;
      // Three rAF frames: 1st lets React flush state, 2nd lets browser paint,
      // 3rd lets CSS transitions (sidebar width, NavLink active styles) settle
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            position(gId, newStep);
            isPositioningRef.current = false;
          })
        )
      );
    };

    const alreadyThere = s.navigate
      ? location.pathname === s.navigate
      : true;

    if (s.navigate && !alreadyThere) {
      setNavigating(true);
      navigate(s.navigate);
    }

    if (targetId) {
      const delay = alreadyThere ? 200 : 0;
      setTimeout(() => {
        cancelPollRef.current = pollForElement(
          targetId,
          (el) => {
            if (el) doPosition();
            else    setNavigating(false);
          },
          5000,
        );
      }, delay);
    } else {
      setTimeout(doPosition, s.navigate && !alreadyThere ? 400 : 0);
    }
  }, [navigate, position, location.pathname]);

  // ── Garden-created event ─────────────────────────────────────────────────────
  useEffect(() => {
    waitingForGardenRef.current = waitingForGarden;
  }, [waitingForGarden]);

  useEffect(() => {
    const handler = (e) => {
      if (!waitingForGardenRef.current) return;

      let id = e.detail?.id ?? null;

      const proceed = (resolvedId) => {
        console.log('[CoachMark] sibol:garden-created — resolved id:', resolvedId);
        setCreatedGardenId(resolvedId);
        setWaitingForGarden(false);
        waitingForGardenRef.current = false;
        setTimeout(() => goToStep(GARDEN_OPEN_STEP_IDX, resolvedId), 800);
      };

      if (id) {
        // Happy path: id came from the API response
        proceed(id);
      } else {
        // Fallback: poll the DOM until a coach-open-garden-* button appears
        // (this happens after fetchGarden re-renders the garden list)
        console.warn('[CoachMark] garden id missing from event — polling DOM for fallback…');
        let elapsed = 0;
        const timer = setInterval(() => {
          const el = document.querySelector('[id^="coach-open-garden-"]');
          if (el) {
            clearInterval(timer);
            const fallbackId = el.id.replace('coach-open-garden-', '') || null;
            proceed(fallbackId);
            return;
          }
          elapsed += 100;
          if (elapsed >= 5000) {
            clearInterval(timer);
            // Last resort: advance without an id (tooltip will show but spotlight won't lock)
            proceed(null);
          }
        }, 100);
      }
    };
    window.addEventListener('sibol:garden-created', handler);
    return () => window.removeEventListener('sibol:garden-created', handler);
  }, [goToStep, setCreatedGardenId]);

  // ── Finish / skip ────────────────────────────────────────────────────────────
  const finish = useCallback(() => {
    setActive(false);
    setDone(true);
    setWaitingForGarden(false);
    waitingForGardenRef.current = false;
    cancelPollRef.current?.();
    localStorage.setItem(storageKey, '1');
    onClose?.();
  }, [storageKey, onClose]);

  const skip = useCallback(() => {
    setActive(false);
    setWaitingForGarden(false);
    waitingForGardenRef.current = false;
    cancelPollRef.current?.();
    localStorage.setItem(storageKey, '1');
    onClose?.();
  }, [storageKey, onClose]);

  // ── Next / prev ──────────────────────────────────────────────────────────────
  const next = useCallback(() => {
    if (step === GARDEN_STEP_IDX) {
      const btn = document.getElementById('coach-add-garden-btn');
      if (btn) {
        waitingForGardenRef.current = true;
        setWaitingForGarden(true);
        btn.click();
      }
      return;
    }

    if (step === GARDEN_OPEN_STEP_IDX) {
      const targetId = createdGardenIdRef.current
        ? `coach-open-garden-${createdGardenIdRef.current}`
        : null;
      if (targetId) {
        document.getElementById(targetId)?.click();
      }
      if (step < STEPS.length - 1) goToStep(step + 1);
      else finish();
      return;
    }

    if (step < STEPS.length - 1) goToStep(step + 1);
    else finish();
  }, [step, goToStep, finish]);

  const prev = useCallback(() => {
    if (step > 0) goToStep(step - 1);
  }, [step, goToStep]);

  // ── Arrow style ──────────────────────────────────────────────────────────────
  const arrowStyle = () => {
    if (arrowPos.side === 'none') return { display: 'none' };
    const base = { position: 'absolute', width: 0, height: 0, pointerEvents: 'none' };
    const c    = '#ffffff';
    switch (arrowPos.side) {
      case 'left':
        return { ...base, top: arrowPos.offset, left: -ARROW, borderTop: `${ARROW}px solid transparent`, borderBottom: `${ARROW}px solid transparent`, borderRight: `${ARROW}px solid ${c}` };
      case 'top':
        return { ...base, top: -ARROW, left: arrowPos.offset, borderLeft: `${ARROW}px solid transparent`, borderRight: `${ARROW}px solid transparent`, borderBottom: `${ARROW}px solid ${c}` };
      case 'bottom':
      default:
        return { ...base, bottom: -ARROW, left: arrowPos.offset, borderLeft: `${ARROW}px solid transparent`, borderRight: `${ARROW}px solid transparent`, borderTop: `${ARROW}px solid ${c}` };
    }
  };

  // ── Phase labels ─────────────────────────────────────────────────────────────
  const tourSteps   = STEPS.filter(s => s.phase === 'tour').length;
  const currentStep = STEPS[step];
  const isOnboard   = currentStep?.phase === 'onboard';
  const phaseLabel  = isOnboard ? 'Setup' : 'Tour';
  const phaseStep   = isOnboard ? step - tourSteps + 1 : step + 1;
  const phaseTotal  = isOnboard ? STEPS.length - tourSteps : tourSteps;

  if (!active && !done) return null;

  return (
    <>
      {active && (
        <div className={`fixed inset-0 z-[10000] overflow-hidden${waitingForGarden ? ' pointer-events-none' : ''}`}>

          {/* ── Overlay + spotlight cutout ── */}
          {!waitingForGarden && (
            <>
              {currentStep?.targetId && currentStep.placement !== 'center' ? (
                <div
                  className="absolute inset-0 bg-[rgba(11,61,30,0.75)]"
                  style={{
                    clipPath: `polygon(
                      0% 0%, 100% 0%, 100% 100%, 0% 100%,
                      0% ${spotStyle.top}px,
                      ${spotStyle.left}px ${spotStyle.top}px,
                      ${spotStyle.left}px ${(spotStyle.top ?? 0) + (spotStyle.height ?? 0)}px,
                      ${(spotStyle.left ?? 0) + (spotStyle.width ?? 0)}px ${(spotStyle.top ?? 0) + (spotStyle.height ?? 0)}px,
                      ${(spotStyle.left ?? 0) + (spotStyle.width ?? 0)}px ${spotStyle.top}px,
                      0% ${spotStyle.top}px
                    )`,
                    transition: 'clip-path 0.4s ease',
                  }}
                  onClick={skip}
                />
              ) : (
                <div className="absolute inset-0 bg-[rgba(11,61,30,0.75)]" onClick={skip} />
              )}

              {currentStep?.targetId && currentStep.placement !== 'center' && (
                <div
                  className="absolute rounded-xl border-2 border-[#d4840a] shadow-[0_0_0_4px_rgba(212,132,10,0.2)] transition-all duration-400"
                  style={spotStyle}
                />
              )}
            </>
          )}

          {/* ── "Waiting for garden" pill ── */}
          {waitingForGarden && step === GARDEN_STEP_IDX && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10002] flex items-center gap-3 bg-[#0b3d1e] text-white px-5 py-3 rounded-full shadow-2xl text-sm font-medium select-none pointer-events-none">
              <svg className="animate-spin shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Fill in the form and tap{' '}
              <strong className="text-[#f0a830]">Save Garden</strong> to continue…
            </div>
          )}

          {/* ── Tooltip card ── */}
          {!waitingForGarden && (
            <div
              className="fixed bg-white rounded-2xl p-6 shadow-2xl transition-all duration-400"
              style={{
                top:    cardPos.top,
                bottom: cardPos.bottom,
                left:   cardPos.left,
                width:  cardPos.width,
                zIndex: 10001,
              }}
            >
              <div style={arrowStyle()} />

              {/* Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                  isOnboard
                    ? 'bg-[#0b3d1e]/10 text-[#0b3d1e]'
                    : 'bg-[#d4840a]/10 text-[#d4840a]'
                }`}>
                  {phaseLabel} {phaseStep} / {phaseTotal}
                </span>
              </div>

              <h3
                className="text-lg font-bold text-[#0b3d1e] mb-2 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {currentStep?.title}
              </h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">{currentStep?.body}</p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {STEPS.map((s, i) => (
                    <div
                      key={i}
                      className="h-1 rounded-full transition-all"
                      style={{
                        width:      i === step ? 16 : 4,
                        background: i === step
                          ? (s.phase === 'onboard' ? '#0b3d1e' : '#d4840a')
                          : i < step ? '#d4840a44' : '#eee',
                      }}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={step > 0 ? prev : skip}
                    className="text-xs text-gray-400 px-3 py-2 font-medium"
                  >
                    {step > 0 ? 'Back' : 'Skip'}
                  </button>
                  <button
                    onClick={next}
                    className={`text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors ${
                      isOnboard
                        ? 'bg-[#2e8b57] hover:bg-[#1a6636]'
                        : 'bg-[#0b3d1e] hover:bg-[#1a6636]'
                    }`}
                  >
                    {step === STEPS.length - 1 ? 'Finish' : currentStep?.cta || 'Next →'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Done modal ── */}
      {done && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-6 bg-black/60">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
            <div className="text-4xl mb-4">🌱</div>
            <h2
              className="text-2xl font-bold text-[#0b3d1e] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              You're all set,{' '}
              <em className="text-[#f0a830]">Farmer!</em>
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              You've toured SIBOL and set up your farm. Head to your dashboard to watch your crops thrive.
            </p>
            <button
              onClick={() => { setDone(false); navigate('/user/dashboard'); }}
              className="w-full bg-[#0b3d1e] text-white py-4 rounded-2xl font-bold hover:bg-[#1a6636] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CoachMark;
