import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  // ── Phase 1: Tour ──────────────────────────────────────────────────────────
  { phase: 'tour', targetId: 'coach-sidebar',        title: <>Your <em className="text-[#f0a830]">Sidebar</em></>,          body: 'This is your main navigation panel. Use it to move between Dashboard, Crop Care, Reports, and Settings.', placement: 'right' },
  { phase: 'tour', targetId: 'coach-nav-dashboard',  title: <><em className="text-[#f0a830]">Dashboard</em> Home</>,        body: 'Your central hub — weather, sensor readings, and crop status at a glance.', placement: 'right' },
  { phase: 'tour', targetId: 'coach-nav-cropcare',   title: <>Crop <em className="text-[#f0a830]">Care</em></>,             body: 'Monitor and manage your individual crops. Dive into detailed sensor data and health history.', placement: 'right' },
  { phase: 'tour', targetId: 'coach-nav-report',     title: <>Reports & <em className="text-[#f0a830]">Insights</em></>,    body: 'View historical data and generated reports for all your crops and sensors.', placement: 'right' },
  { phase: 'tour', targetId: 'coach-nav-cropprofile',title: <>Crop <em className="text-[#f0a830]">Profile</em></>,          body: "Manage your crop profiles and gardens.", placement: 'right' },
  { phase: 'tour', targetId: 'coach-nav-account',    title: <>Account <em className="text-[#f0a830]">Settings</em></>,      body: 'Update your profile, manage devices, and claim new IoT sensors here.', placement: 'right' },
  { phase: 'tour', targetId: 'coach-weather',        title: <>Live <em className="text-[#f0a830]">Weather</em></>,           body: 'Current conditions at your farm. Tap the C / F toggle to switch units.', placement: 'bottom' },
  { phase: 'tour', targetId: 'coach-advisory',       title: <>Crop <em className="text-[#f0a830]">Alerts</em></>,            body: 'System-generated advisories based on detected crop health.', placement: 'bottom' },
  { phase: 'tour', targetId: 'coach-sensors',        title: <>Sensor <em className="text-[#f0a830]">Trends</em></>,          body: 'Real-time readings from your IoT sensors, plotted over time.', placement: 'top' },
  { phase: 'tour', targetId: 'coach-crops',          title: <>Your <em className="text-[#f0a830]">Crops</em></>,             body: 'Browse planted crops and check their health status here.', placement: 'top' },

  // ── Phase 2: Onboarding ────────────────────────────────────────────────────
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
    body: 'Tap the "New Garden" button below to create your first garden. Give it a name and location.',
    placement: 'bottom',
    // ✅ programmatically click the button, then WAIT for sibol:garden-created
    action: 'click',
    waitForEvent: 'sibol:garden-created',
    cta: 'Open Garden Form →',
  },
  // Step inserted dynamically after garden-created — see goToStep logic
  {
    phase: 'onboard',
    navigate: null,           // filled in at runtime with real garden id
    targetId: 'coach-add-crop-btn',
    title: <>Add your first <em className="text-[#f0a830]">Crop</em></>,
    body: 'Add a crop inside your new garden. Choose the plant type and planted date.',
    placement: 'bottom',
    cta: 'Add Crop →',
  },
  {
    phase: 'onboard',
    navigate: '/user/account-settings',
    targetId: 'coach-claim-device-btn',
    title: <>Claim your <em className="text-[#f0a830]">Device</em></>,
    body: 'Enter your device ID to link your IoT sensor. Live data will appear on your dashboard.',
    placement: 'bottom',
    cta: 'Claim Device →',
  },
];

const PAD   = 10;
const GAP   = 16;
const ARROW = 10;
const ELEMENT_WAIT_TIMEOUT = 8000;

function waitForElement(id, onFound, onTimeout) {
  const existing = document.getElementById(id);
  if (existing) { onFound(existing); return () => {}; }
  let cancelled = false;
  const timer = setTimeout(() => {
    if (cancelled) return;
    observer.disconnect();
    onTimeout?.();
  }, ELEMENT_WAIT_TIMEOUT);
  const observer = new MutationObserver(() => {
    if (cancelled) return;
    const el = document.getElementById(id);
    if (el) { clearTimeout(timer); observer.disconnect(); onFound(el); }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return () => { cancelled = true; clearTimeout(timer); observer.disconnect(); };
}

const CoachMark = ({ open, onClose, userId }) => {
  const storageKey = userId ? `sibol_toured_${userId}` : 'sibol_toured';
  const navigate   = useNavigate();

  const [active,    setActive]    = useState(false);
  const [step,      setStep]      = useState(0);
  const [done,      setDone]      = useState(false);
  const [spotStyle, setSpotStyle] = useState({});
  const [cardPos,   setCardPos]   = useState({ top: 0, left: 0, width: 272 });
  const [arrowPos,  setArrowPos]  = useState({ side: 'top', offset: 0 });
  // Holds runtime-resolved steps (we may patch the garden step's navigate url)
  const stepsRef       = useRef([...STEPS]);
  const rafRef         = useRef(null);
  const cancelWaitRef  = useRef(null);
  // Holds the cancel fn for the garden-created event listener
  const cancelEventRef = useRef(null);

  useEffect(() => {
    if (open === undefined) {
      const toured = localStorage.getItem(storageKey);
      if (!toured) { const t = setTimeout(() => setActive(true), 1000); return () => clearTimeout(t); }
    }
  }, [storageKey, open]);

  useEffect(() => { if (open !== undefined) setActive(open); }, [open]);

  const positionOnElement = useCallback((target, s) => {
    if (!target) return;
    const tr = target.getBoundingClientRect();
    setSpotStyle({ top: tr.top - PAD, left: tr.left - PAD, width: tr.width + PAD * 2, height: tr.height + PAD * 2 });
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (window.innerWidth < 768) {
      setCardPos({ top: 'auto', left: 16, width: window.innerWidth - 32, bottom: 24 });
      setArrowPos({ side: 'none', offset: 0 });
      return;
    }

    const CW = 288, CH = 200;
    let top, left, side, arrowOffset;
    switch (s.placement) {
      case 'right':  left = tr.right + PAD + GAP; top = tr.top + tr.height / 2 - CH / 2; side = 'left';   arrowOffset = CH / 2 - ARROW; break;
      case 'bottom': top  = tr.bottom + PAD + GAP; left = tr.left + tr.width / 2 - CW / 2; side = 'top';  arrowOffset = CW / 2 - ARROW; break;
      default:       top  = tr.top - PAD - GAP - CH; left = tr.left + tr.width / 2 - CW / 2; side = 'bottom'; arrowOffset = CW / 2 - ARROW; break;
    }
    setCardPos({ top: Math.max(8, Math.min(top, window.innerHeight - CH - 8)), left: Math.max(8, Math.min(left, window.innerWidth - CW - 8)), width: CW, bottom: 'auto' });
    setArrowPos({ side, offset: arrowOffset });
  }, []);

  const position = useCallback((targetStep) => {
    const s = stepsRef.current[targetStep !== undefined ? targetStep : step];
    if (!s) return;
    cancelWaitRef.current?.();
    cancelWaitRef.current = null;

    if (!s.targetId || s.placement === 'center') {
      const CW = 320, CH = 210;
      setSpotStyle({ top: -999, left: -999, width: 0, height: 0 });
      setCardPos({ top: window.innerHeight / 2 - CH / 2, left: window.innerWidth / 2 - CW / 2, width: CW, bottom: 'auto' });
      setArrowPos({ side: 'none', offset: 0 });
      return;
    }
    cancelWaitRef.current = waitForElement(s.targetId, (el) => positionOnElement(el, s), () => console.warn(`CoachMark: #${s.targetId} never appeared`));
  }, [step, positionOnElement]);

  useEffect(() => {
    if (!active) return;
    position();
    const onResize = () => { cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(() => position()); };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => { window.removeEventListener('resize', onResize); window.removeEventListener('scroll', onResize, true); cancelAnimationFrame(rafRef.current); };
  }, [active, step, position]);

  useEffect(() => () => { cancelWaitRef.current?.(); cancelEventRef.current?.(); cancelAnimationFrame(rafRef.current); }, []);

  const finish = useCallback(() => {
    cancelWaitRef.current?.();
    cancelEventRef.current?.();
    setActive(false); setDone(true);
    localStorage.setItem(storageKey, '1');
    onClose?.();
  }, [storageKey, onClose]);

  const skip = useCallback(() => {
    cancelWaitRef.current?.();
    cancelEventRef.current?.();
    setActive(false);
    localStorage.setItem(storageKey, '1');
    onClose?.();
  }, [storageKey, onClose]);

  // ── goToStep: navigate → set step (triggers position → MutationObserver) ──
  const goToStep = useCallback((newStep) => {
    cancelWaitRef.current?.();
    cancelEventRef.current?.();
    cancelWaitRef.current  = null;
    cancelEventRef.current = null;

    const s = stepsRef.current[newStep];
    if (s?.navigate) navigate(s.navigate);
    setStep(newStep);
  }, [navigate]);

  // ── next: handles action:'click' + waitForEvent ────────────────────────────
  const next = useCallback(() => {
    const s = stepsRef.current[step];

    // If this step has an action, execute it then wait for an event before advancing
    if (s?.action === 'click' && s?.waitForEvent) {
      // Click the target element
      const el = s.targetId ? document.getElementById(s.targetId) : null;
      if (el) el.click();

      // Listen for the custom event (e.g. sibol:garden-created)
      const handler = (e) => {
        window.removeEventListener(s.waitForEvent, handler);
        cancelEventRef.current = null;

        const { id } = e.detail || {};
        if (id) {
          // Patch the next step's navigate url with the real garden id
          const gardenStep = stepsRef.current.findIndex((st, i) => i > step && st.targetId === 'coach-add-crop-btn');
          if (gardenStep !== -1) {
            stepsRef.current = stepsRef.current.map((st, i) =>
              i === gardenStep ? { ...st, navigate: `/user/crop-care/${encodeURIComponent(id)}` } : st
            );
          }
        }
        // Advance to next step after the event fires
        goToStep(step + 1);
      };

      window.addEventListener(s.waitForEvent, handler);
      // Store cancel so skip/finish can clean up
      cancelEventRef.current = () => window.removeEventListener(s.waitForEvent, handler);
      return; // don't advance yet — waiting for garden-created
    }

    if (step < stepsRef.current.length - 1) goToStep(step + 1);
    else finish();
  }, [step, goToStep, finish]);

  const prev = useCallback(() => { if (step > 0) goToStep(step - 1); }, [step, goToStep]);

  const arrowStyle = () => {
    if (arrowPos.side === 'none') return { display: 'none' };
    const base = { position: 'absolute', width: 0, height: 0, pointerEvents: 'none' };
    const color = '#ffffff';
    switch (arrowPos.side) {
      case 'left':   return { ...base, top: arrowPos.offset, left: -ARROW, borderTop: `${ARROW}px solid transparent`, borderBottom: `${ARROW}px solid transparent`, borderRight: `${ARROW}px solid ${color}` };
      case 'top':    return { ...base, top: -ARROW, left: arrowPos.offset, borderLeft: `${ARROW}px solid transparent`, borderRight: `${ARROW}px solid transparent`, borderBottom: `${ARROW}px solid ${color}` };
      default:       return { ...base, bottom: -ARROW, left: arrowPos.offset, borderLeft: `${ARROW}px solid transparent`, borderRight: `${ARROW}px solid transparent`, borderTop: `${ARROW}px solid ${color}` };
    }
  };

  const tourSteps   = STEPS.filter(s => s.phase === 'tour').length;
  const currentStep = stepsRef.current[step];
  const phaseLabel  = currentStep?.phase === 'onboard' ? 'Setup' : 'Tour';
  const phaseStep   = currentStep?.phase === 'onboard' ? step - tourSteps + 1 : step + 1;
  const phaseTotal  = currentStep?.phase === 'onboard' ? stepsRef.current.length - tourSteps : tourSteps;

  if (!active && !done) return null;

  return (
    <>
      {active && (
        <div className="fixed inset-0 z-[10000] overflow-hidden">
          {currentStep?.targetId && currentStep.placement !== 'center' ? (
            <div
              className="absolute inset-0 bg-[rgba(11,61,30,0.75)]"
              style={{
                clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${spotStyle.top}px, ${spotStyle.left}px ${spotStyle.top}px, ${spotStyle.left}px ${spotStyle.top + spotStyle.height}px, ${spotStyle.left + spotStyle.width}px ${spotStyle.top + spotStyle.height}px, ${spotStyle.left + spotStyle.width}px ${spotStyle.top}px, 0% ${spotStyle.top}px)`,
                transition: 'clip-path 0.4s ease',
              }}
              onClick={skip}
            />
          ) : (
            <div className="absolute inset-0 bg-[rgba(11,61,30,0.75)]" onClick={skip} />
          )}

          {currentStep?.targetId && currentStep.placement !== 'center' && (
            <div className="absolute rounded-xl border-2 border-[#d4840a] shadow-[0_0_0_4px_rgba(212,132,10,0.2)] transition-all duration-400" style={spotStyle} />
          )}

          <div className="fixed bg-white rounded-2xl p-6 shadow-2xl transition-all duration-400" style={{ top: cardPos.top, bottom: cardPos.bottom, left: cardPos.left, width: cardPos.width, zIndex: 10001 }}>
            <div style={arrowStyle()} />

            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${currentStep?.phase === 'onboard' ? 'bg-[#0b3d1e]/10 text-[#0b3d1e]' : 'bg-[#d4840a]/10 text-[#d4840a]'}`}>
                {phaseLabel} {phaseStep} / {phaseTotal}
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#0b3d1e] mb-2 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {currentStep?.title}
            </h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">{currentStep?.body}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {stepsRef.current.map((s, i) => (
                  <div key={i} className="h-1 rounded-full transition-all" style={{ width: i === step ? 16 : 4, background: i === step ? (s.phase === 'onboard' ? '#0b3d1e' : '#d4840a') : i < step ? '#d4840a44' : '#eee' }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={step > 0 ? prev : skip} className="text-xs text-gray-400 px-3 py-2 font-medium">
                  {step > 0 ? 'Back' : 'Skip'}
                </button>
                <button
                  onClick={next}
                  className={`text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors ${currentStep?.phase === 'onboard' ? 'bg-[#2e8b57] hover:bg-[#1a6636]' : 'bg-[#0b3d1e] hover:bg-[#1a6636]'}`}
                >
                  {step === stepsRef.current.length - 1 ? 'Finish' : currentStep?.cta || 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {done && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-6 bg-black/60">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
            <div className="text-4xl mb-4">🌱</div>
            <h2 className="text-2xl font-bold text-[#0b3d1e] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              You're all set, <em className="text-[#f0a830]">Farmer!</em>
            </h2>
            <p className="text-gray-500 text-sm mb-6">You've toured SIBOL and set up your farm. Head to your dashboard to watch your crops thrive.</p>
            <button onClick={() => { setDone(false); navigate('/user/dashboard'); }} className="w-full bg-[#0b3d1e] text-white py-4 rounded-2xl font-bold hover:bg-[#1a6636] transition-colors">
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CoachMark;
