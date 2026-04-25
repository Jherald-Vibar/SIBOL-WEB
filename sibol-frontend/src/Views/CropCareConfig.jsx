import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "./axios";

/* ── ICONS ── */
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SpinIcon = () => (
  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
const EspIcon = ({ color = "#3B6D11" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/>
    <path d="M6 12h.01M18 12h.01"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1"/>
    <path d="M20.385 6.585a2.1 2.1 0 0 0-2.97-2.97L9 12v3h3zM16 5l3 3"/>
  </svg>
);
const TrashIcon = ({ color = "currentColor" }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const ViewIcon = ({ color = "#3B6D11" }) => (
  <svg width="14" height="14" viewBox="0 0 512 512" fill="none">
    <path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={36} d="M176 176v-40a40 40 0 0 1 40-40h208a40 40 0 0 1 40 40v240a40 40 0 0 1-40 40H216a40 40 0 0 1-40-40v-40"/>
    <path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={36} d="m272 336l80-80l-80-80M48 256h288"/>
  </svg>
);
const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const WifiIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
    <line x1="12" y1="20" x2="12.01" y2="20"/>
  </svg>
);
const LeafIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

/* ── STATUS PILL ── */
const StatusPill = ({ esp }) => {
  if (!esp) return (
    <span className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"/>no device
    </span>
  );
  const active = esp.status === 'active';
  return (
    <span className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}/>
      {esp.status}
    </span>
  );
};

/* ── DEVICE CONNECTED TOAST ── */
const DeviceToast = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 pointer-events-none">
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0)   scale(1);    }
          to   { opacity: 0; transform: translateY(8px)  scale(0.96); }
        }
        @keyframes progressBar {
          from { width: 100%; }
          to   { width: 0%;   }
        }
        .toast-enter { animation: toastIn  0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .toast-exit  { animation: toastOut 0.28s ease-in forwards; }
        @keyframes wifiPulse {
          0%,100% { opacity: 1;   transform: scale(1);    }
          50%     { opacity: 0.6; transform: scale(1.15); }
        }
        .wifi-pulse { animation: wifiPulse 1.4s ease-in-out infinite; }
      `}</style>
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${t.exiting ? 'toast-exit' : 'toast-enter'} pointer-events-auto`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <div className="relative bg-white rounded-2xl border border-green-200 shadow-[0_8px_32px_rgba(11,61,30,0.18)] overflow-hidden w-[320px]">
            <div className="h-1 bg-gradient-to-r from-green-400 via-green-600 to-green-800"/>
            <div className="flex items-start gap-3 px-4 pt-3.5 pb-4">
              <div className="w-9 h-9 rounded-xl bg-green-950 flex items-center justify-center flex-shrink-0 text-white wifi-pulse">
                <WifiIcon/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <LeafIcon style={{ color: '#3B6D11', width: 13, height: 13 }}/>
                  <p className="text-[11px] font-semibold text-green-700 uppercase tracking-wider">Device Connected</p>
                </div>
                <p className="font-['Lora',serif] text-sm font-semibold text-green-950 leading-snug">
                  Your device is connected!
                </p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">{t.serial}</p>
                {t.crop && (
                  <p className="text-xs text-gray-500 mt-1">
                    Monitoring <span className="text-green-800 font-medium">{t.crop}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => onDismiss(t.id)}
                className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer flex-shrink-0 mt-0.5 bg-transparent"
              >
                <XIcon/>
              </button>
            </div>
            <div className="h-[3px] bg-green-50">
              <div
                className="h-full bg-green-400 rounded-full"
                style={{ animation: `progressBar ${t.duration}ms linear forwards` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── WEBSOCKET HOOK ── */
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:6001";

const useDeviceWebSocket = (crops, onDeviceConnected) => {
  const socketsRef = useRef({});
  const cropsRef   = useRef(crops);
  cropsRef.current = crops;

  const connectToDevice = useCallback((serial) => {
    if (socketsRef.current[serial]) return;
    const ws = new WebSocket(`${WS_URL}/app/sibol?protocol=7&client=js&version=8.4.0&flash=false`);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        event: "pusher:subscribe",
        data: { channel: `esp.${serial}` },
      }));
    };
    ws.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (
          payload.event === "sensor.data" ||
          payload.event === "App\\Events\\SensorDataReceived"
        ) {
          const crop = cropsRef.current.find(c => c.esp?.serial_number === serial);
          onDeviceConnected(serial, crop?.name || null);
        }
      } catch (error) {}
    };
    ws.onerror = () => {};
    ws.onclose = () => { delete socketsRef.current[serial]; };
    socketsRef.current[serial] = ws;
  }, [onDeviceConnected]);

  useEffect(() => {
    crops.forEach(crop => {
      if (crop.esp?.serial_number) connectToDevice(crop.esp.serial_number);
    });
    const activeSerials = new Set(
      crops.filter(c => c.esp?.serial_number).map(c => c.esp.serial_number)
    );
    Object.keys(socketsRef.current).forEach(serial => {
      if (!activeSerials.has(serial)) {
        socketsRef.current[serial]?.close();
        delete socketsRef.current[serial];
      }
    });
  }, [crops, connectToDevice]);

  useEffect(() => {
    return () => {
      Object.values(socketsRef.current).forEach(ws => ws?.close());
      socketsRef.current = {};
    };
  }, []);
};

/* ── TOAST MANAGER HOOK ── */
const TOAST_DURATION = 5000;

const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const addToast = useCallback((serial, crop) => {
    const id = `${serial}-${Date.now()}`;
    setToasts(prev => [...prev, { id, serial, crop, exiting: false, duration: TOAST_DURATION }]);
    timersRef.current[id] = setTimeout(() => dismissToast(id), TOAST_DURATION);
  }, []);

  const dismissToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  useEffect(() => {
    return () => Object.values(timersRef.current).forEach(clearTimeout);
  }, []);

  return { toasts, addToast, dismissToast };
};

/* ── MODAL WRAPPER ── */
const Modal = ({ onClose, children }) => (
  <div
    className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div
      className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose, danger }) => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] sticky top-0 bg-white z-10">
    <span className={`font-['Lora',serif] text-lg font-semibold ${danger ? 'text-red-600' : 'text-green-950'}`}>{title}</span>
    <button onClick={onClose} className="w-7 h-7 rounded-full border border-black/10 bg-transparent flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-400">
      <XIcon/>
    </button>
  </div>
);

/* ── ADD DEVICE TO EXISTING CROP MODAL ── */
const AddDeviceModal = ({ crop, onClose, onSave, loading }) => {
  const [espId, setEspId]     = useState("");
  const [espError, setEspError] = useState("");
  const espInputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => espInputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = () => {
    if (!espId.trim()) { setEspError("Please enter a Device ID."); return; }
    setEspError("");
    onSave({ espId: espId.trim() });
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Add Device" onClose={onClose} />

      <div className="px-6 py-5 flex flex-col gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl px-3.5 py-3 text-sm text-green-800">
          Linking a new device to <span className="font-semibold">{crop.name}</span>.
        </div>

        {espError && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {espError}
          </div>
        )}

        <div>
          <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1.5 font-medium">ESP Device ID</label>
          <input
            ref={espInputRef}
            type="text"
            value={espId}
            onChange={e => { setEspId(e.target.value); setEspError(""); }}
            placeholder="ESP-123456789"
            className="w-full px-3.5 py-2.5 border border-black/10 rounded-xl font-mono text-sm text-green-950 bg-[#f7f4ee] outline-none transition-all focus:border-green-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,139,87,0.1)]"
          />
        </div>

        <div className="bg-[#f7f4ee] rounded-xl px-3.5 py-3">
          <p className="text-xs font-semibold text-gray-600 mb-1.5">Where to find your Device ID</p>
          <ul className="text-xs text-gray-500 leading-relaxed space-y-0.5 list-disc pl-4">
            <li>Printed on the LCD of your SIBOL <Hardware></Hardware></li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end gap-2 px-6 py-4 border-t border-black/[0.06] sticky bottom-0 bg-white">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-full border border-black/10 bg-transparent text-gray-400 text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !espId.trim()}
          className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-green-950 border-none text-white text-sm font-medium cursor-pointer hover:bg-green-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <><SpinIcon/> Linking…</> : 'Link Device'}
        </button>
      </div>
    </Modal>
  );
};

/* ── ADD / EDIT CROP MODAL (2-step) ── */
const CropModal = ({ crop, onClose, onSave, loading }) => {
  const isEdit = !!crop;
  const [step, setStep]     = useState(isEdit ? 2 : 1);
  const [espId, setEspId]   = useState("");
  const [espError, setEspError] = useState("");
  const [form, setForm]     = useState({
    name:         crop?.name    || "",
    variety:      crop?.variety || "Vegetable",
    planted_date: crop?.planted_at
      ? new Date(crop.planted_at).toISOString().split("T")[0]
      : "",
  });
  const [formError, setFormError] = useState("");
  const espInputRef = useRef(null);

  useEffect(() => {
    if (step === 1) setTimeout(() => espInputRef.current?.focus(), 100);
  }, [step]);

  const handleNext = () => {
    if (!espId.trim()) { setEspError("Please enter a Device ID."); return; }
    setEspError("");
    setStep(2);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.variety || !form.planted_date) {
      setFormError("All fields are required."); return;
    }
    setFormError("");
    onSave({ ...form, espId: isEdit ? null : espId.trim() });
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader
        title={isEdit ? "Edit Crop" : step === 1 ? "New Crop — Device" : "New Crop — Details"}
        onClose={onClose}
      />

      {!isEdit && (
        <div className="flex items-center gap-2 px-6 pt-4 pb-0">
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${step >= s ? 'text-green-800' : 'text-gray-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors ${step >= s ? 'bg-green-950 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {s}
                </span>
                {s === 1 ? 'Device' : 'Details'}
              </div>
              {s < 2 && <div className={`flex-1 h-px transition-colors ${step > s ? 'bg-green-300' : 'bg-gray-100'}`}/>}
            </React.Fragment>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="px-6 py-5 flex flex-col gap-4">
          {espError && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {espError}
            </div>
          )}
          <div className="bg-green-50 border border-green-200 rounded-xl px-3.5 py-3 text-sm text-green-800">
            A device is required to start monitoring your crop.
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1.5 font-medium">ESP Device ID</label>
            <input
              ref={espInputRef}
              type="text"
              value={espId}
              onChange={e => { setEspId(e.target.value); setEspError(""); }}
              placeholder="e.g. AA:BB:CC:DD:EE:FF"
              className="w-full px-3.5 py-2.5 border border-black/10 rounded-xl font-mono text-sm text-green-950 bg-[#f7f4ee] outline-none transition-all focus:border-green-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,139,87,0.1)]"
            />
          </div>
          <div className="bg-[#f7f4ee] rounded-xl px-3.5 py-3">
            <p className="text-xs font-semibold text-gray-600 mb-1.5">Where to find your Device ID</p>
            <ul className="text-xs text-gray-500 leading-relaxed space-y-0.5 list-disc pl-4">
              <li>Printed on a sticker on your ESP32 board</li>
              <li>Inside your device packaging</li>
              <li>In the SIBOL setup sheet included in the box</li>
            </ul>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="px-6 py-5 flex flex-col gap-4">
          {formError && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1.5 font-medium">Crop Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Pechay, Kamote…"
              className="w-full px-3.5 py-2.5 border border-black/10 rounded-xl text-sm text-green-950 bg-[#f7f4ee] outline-none transition-all focus:border-green-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,139,87,0.1)]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1.5 font-medium">Variety</label>
            <div className="flex gap-3">
              {['Vegetable', 'Fruit'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, variety: v }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                    form.variety === v
                      ? 'border-green-600 bg-green-50 text-green-800'
                      : 'border-black/10 bg-[#f7f4ee] text-gray-500 hover:border-black/20'
                  }`}
                >
                  {v === 'Vegetable' ? '🥬' : '🍓'} {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1.5 font-medium">Planted Date</label>
            <input
              type="date"
              value={form.planted_date}
              onChange={e => setForm(f => ({ ...f, planted_date: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-black/10 rounded-xl text-sm text-green-950 bg-[#f7f4ee] outline-none transition-all focus:border-green-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,139,87,0.1)]"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 px-6 py-4 border-t border-black/[0.06] sticky bottom-0 bg-white">
        {step === 1 && (
          <button onClick={onClose} className="px-5 py-2 rounded-full border border-black/10 bg-transparent text-gray-400 text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        )}
        {step === 2 && (
          <>
            {!isEdit ? (
              <button onClick={() => setStep(1)} className="px-5 py-2 rounded-full border border-black/10 bg-transparent text-gray-400 text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">
                Back
              </button>
            ) : (
              <button onClick={onClose} className="px-5 py-2 rounded-full border border-black/10 bg-transparent text-gray-400 text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            )}
          </>
        )}

        {step === 1 ? (
          <button
            onClick={handleNext}
            disabled={!espId.trim()}
            className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-green-950 border-none text-white text-sm font-medium cursor-pointer hover:bg-green-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-green-950 border-none text-white text-sm font-medium cursor-pointer hover:bg-green-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <><SpinIcon/> Saving…</> : isEdit ? 'Update Crop' : 'Save Crop'}
          </button>
        )}
      </div>
    </Modal>
  );
};

/* ── DELETE CROP MODAL ── */
const DeleteCropModal = ({ crop, onClose, onConfirm, loading }) => (
  <Modal onClose={onClose}>
    <ModalHeader title="Delete Crop" onClose={onClose} danger/>
    <div className="px-6 py-8 flex flex-col items-center text-center gap-3">
      <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center text-3xl">🗑️</div>
      <p className="text-sm text-gray-500">Permanently delete</p>
      <p className="font-['Lora',serif] text-lg text-green-950 font-semibold">"{crop?.name}"</p>
      <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
        This will also unlink any device assigned to it. All sensor data will be preserved. This action cannot be undone.
      </p>
    </div>
    <div className="flex justify-end gap-2 px-6 py-4 border-t border-black/[0.06]">
      <button onClick={onClose} className="px-5 py-2 rounded-full border border-black/10 bg-transparent text-gray-400 text-sm font-medium cursor-pointer hover:bg-gray-50">
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-red-600 border-none text-white text-sm font-medium cursor-pointer hover:bg-red-700 disabled:opacity-40"
      >
        {loading ? <><SpinIcon/> Deleting…</> : 'Yes, delete'}
      </button>
    </div>
  </Modal>
);

/* ── REMOVE DEVICE MODAL ── */
const RemoveEspModal = ({ esp, onClose, onConfirm, loading }) => (
  <Modal onClose={onClose}>
    <ModalHeader title="Remove Device" onClose={onClose} danger/>
    <div className="px-6 py-8 flex flex-col items-center text-center gap-3">
      <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center text-3xl">📡</div>
      <p className="text-sm text-gray-500">Remove device</p>
      <p className="font-mono text-sm text-green-950 font-medium">{esp?.serial_number}</p>
      <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
        This will disconnect the device from this crop. Sensor data will be preserved but no new readings will come in.
      </p>
    </div>
    <div className="flex justify-end gap-2 px-6 py-4 border-t border-black/[0.06]">
      <button onClick={onClose} className="px-5 py-2 rounded-full border border-black/10 bg-transparent text-gray-400 text-sm font-medium cursor-pointer hover:bg-gray-50">
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-red-600 border-none text-white text-sm font-medium cursor-pointer hover:bg-red-700 disabled:opacity-40"
      >
        {loading ? <><SpinIcon/> Removing…</> : 'Remove'}
      </button>
    </div>
  </Modal>
);

/* ── CROP CARD ── */
const CropCard = ({ crop, onEdit, onDelete, onRemoveEsp, onAddEsp, onView }) => {
  const planted = new Date(crop.planted_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const esp = crop.esp;

  return (
    <div id={`coach-crop-card-${crop.id}`} className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(11,61,30,0.10)] group">
      <div className="relative h-44 overflow-hidden bg-[#f7f4ee]">
        {crop.image
          ? <img src={crop.image} alt={crop.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
          : <div className="w-full h-full flex items-center justify-center text-4xl">🌱</div>
        }
        <StatusPill esp={esp}/>
      </div>

      <div className="p-4">
        <div className="font-['Lora',serif] text-base font-semibold text-green-950 mb-0.5">{crop.name}</div>
        <div className="text-xs text-gray-400 mb-3">{crop.variety} · Planted {planted}</div>
        <div className="h-px bg-black/[0.05] mb-3"/>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <EspIcon color={esp ? "#3B6D11" : "#9ca3af"}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Monitoring device</div>
            {esp
              ? <div className="font-mono text-xs text-green-800 truncate">{esp.serial_number}</div>
              : <div className="text-xs text-gray-400 italic">No device assigned</div>
            }
          </div>
          {esp ? (
            <button
              onClick={() => onRemoveEsp(crop)}
              title="Remove device"
              className="w-8 h-8 rounded-lg border border-black/[0.08] bg-transparent flex items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-300 transition-all flex-shrink-0"
            >
              <TrashIcon color="#E24B4A"/>
            </button>
          ) : (
            <button
              onClick={() => onAddEsp(crop)}
              title="Add device"
              className="w-8 h-8 rounded-lg border border-dashed border-green-300 bg-transparent flex items-center justify-center cursor-pointer hover:bg-green-50 hover:border-green-500 transition-all flex-shrink-0 text-green-600"
            >
              <PlusIcon/>
            </button>
          )}
        </div>

        <div className="flex gap-1.5 mt-3">
          <button
            id={`coach-view-btn-${crop.id}`}
            onClick={() => onView(crop)}
            disabled={!esp}
            title={esp ? "View data" : "Add a device to view data"}
            className={`w-9 h-9 rounded-xl border border-black/[0.08] bg-transparent flex items-center justify-center cursor-pointer transition-all ${
              !esp ? 'opacity-30 cursor-not-allowed' : 'hover:bg-green-50 hover:border-green-400'
            }`}
          >
            <ViewIcon color={esp ? "#3B6D11" : "#9ca3af"}/>
          </button>
          <button
            onClick={() => onEdit(crop)}
            title="Edit crop"
            className="w-9 h-9 rounded-xl border border-black/[0.08] bg-transparent flex items-center justify-center cursor-pointer hover:bg-green-50 hover:border-green-400 transition-all text-green-700"
          >
            <EditIcon/>
          </button>
          <button
            onClick={() => onDelete(crop)}
            title="Delete crop"
            className="w-9 h-9 rounded-xl border border-black/[0.08] bg-transparent flex items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-300 transition-all"
          >
            <TrashIcon color="#E24B4A"/>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
const CropCareConfig = () => {
  const { garden_id } = useParams();
  const navigate = useNavigate();

  const [crops, setCrops]               = useState([]);
  const [pageLoading, setPageLoading]   = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [globalError, setGlobalError]   = useState("");

  const [cropModal,        setCropModal]        = useState(null);
  const [addDeviceModal,   setAddDeviceModal]   = useState(null); // { crop }
  const [deleteModal,      setDeleteModal]      = useState(null);
  const [removeEspModal,   setRemoveEspModal]   = useState(null);

  // ── Track whether CoachMark is waiting for the crop to be saved ───────────
  useEffect(() => {
    window.__sibolWaitingForCrop = false;
    const onWait = () => { window.__sibolWaitingForCrop = true; };
    window.addEventListener('sibol:waiting-for-crop', onWait);
    return () => {
      window.removeEventListener('sibol:waiting-for-crop', onWait);
      window.__sibolWaitingForCrop = false;
    };
  }, []);

  const { toasts, addToast, dismissToast } = useToasts();

  const handleDeviceConnected = useCallback((serial, cropName) => {
    addToast(serial, cropName);
  }, [addToast]);

  useDeviceWebSocket(crops, handleDeviceConnected);

  /* ── Data fetching ── */
  const fetchCrops = async () => {
    try {
      const r = await axiosClient.get(`/getCropData/${garden_id}`);
      setCrops(r.data.data);
    } catch (err) {
      setGlobalError(err.response?.data?.message || "Failed to load crops.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => { fetchCrops(); }, [garden_id]);

  /* ── Save crop (add / edit) ── */
  const handleSaveCrop = async (form) => {
    setActionLoading(true);
    try {
      const fd = new FormData();
      fd.append("name",         form.name);
      fd.append("variety",      form.variety);
      fd.append("planted_date", new Date(form.planted_date).toISOString().split("T")[0]);

      if (cropModal.mode === 'edit') {
        fd.append("_method", "PUT");
        const res = await axiosClient.post(`/updateCrop/${cropModal.crop.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setCrops(prev =>
          prev.map(c => c.id === cropModal.crop.id ? { ...res.data.data, esp: c.esp } : c)
        );
      } else {
        // 1. Create the crop
        const res = await axiosClient.post(`/addCrop/${garden_id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newCrop = res.data.data;

        // 2. Claim & link the device
        const claimRes = await axiosClient.post(`/claimDevice/${garden_id}`, {
          "esp-number": form.espId,
          "crop_id":    newCrop.id,
        });

        const espRecord = claimRes?.data?.data;
        const espSerial =
          espRecord?.serial_number ||
          claimRes?.data?.serial_number ||
          form.espId;

        // 3. Refresh crop list
        await fetchCrops();

        // 4. Notify CoachMark if waiting
        if (window.__sibolWaitingForCrop) {
          window.__sibolWaitingForCrop = false;
          window.dispatchEvent(
            new CustomEvent('sibol:crop-added', {
              detail: {
                cropId:   newCrop.id,
                gardenId: garden_id,
                espId:    espSerial,
              },
            })
          );
        }
      }
      setCropModal(null);
    } catch (err) {
      setGlobalError(
        err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(", ")
          : err.response?.data?.message || "Something went wrong."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Add device to existing crop ── */
  const handleAddDevice = async ({ espId }) => {
    setActionLoading(true);
    try {
      await axiosClient.post(`/claimDevice/${garden_id}`, {
        "esp-number": espId,
        "crop_id":    addDeviceModal.crop.id,
      });
      await fetchCrops();
      setAddDeviceModal(null);
    } catch (err) {
      setGlobalError(
        err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(", ")
          : err.response?.data?.message || "Failed to link device."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Delete crop ── */
  const handleDeleteCrop = async () => {
    setActionLoading(true);
    try {
      await axiosClient.delete(`/deleteCrop/${deleteModal.id}`);
      setCrops(prev => prev.filter(c => c.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      setGlobalError(err.response?.data?.message || "Failed to delete crop.");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Remove device ── */
  const handleRemoveEsp = async () => {
    setActionLoading(true);
    try {
      await axiosClient.delete(`/deleteEsp/${removeEspModal.esp.id}`);
      setCrops(prev =>
        prev.map(c => c.id === removeEspModal.id ? { ...c, esp: null } : c)
      );
      setRemoveEspModal(null);
    } catch (err) {
      setGlobalError(err.response?.data?.message || "Failed to remove device.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-[#f7f4ee] min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,400&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
      `}</style>

      <div className="px-4 sm:px-8 lg:px-10 py-8 pb-24 md:pb-12 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap pb-6 border-b border-green-950/10 mb-7">
          <div>
            <button
              onClick={() => navigate('/user/crop-care')}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-950 transition-colors mb-2 group cursor-pointer bg-transparent border-none p-0"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform"><BackIcon/></span>
              Back to Crop Care
            </button>
            <h1 className="font-['Lora',serif] text-3xl md:text-4xl font-semibold text-green-950 leading-tight">
              Your <em className="italic text-green-700">Crops</em>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Each crop is paired with its own monitoring device.</p>
          </div>

          <button
            id="coach-add-crop-btn"
            onClick={() => setCropModal({ mode: 'add', crop: null })}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-950 text-white border-none rounded-full text-sm font-medium cursor-pointer hover:bg-green-800 transition-all"
          >
            <PlusIcon/> Claim Device
          </button>
        </div>

        {/* Global error */}
        {globalError && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="flex-1">{globalError}</span>
            <button onClick={() => setGlobalError("")} className="text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-none">
              <XIcon/>
            </button>
          </div>
        )}

        {/* Content */}
        {pageLoading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
            <SpinIcon/> Loading crops…
          </div>
        ) : crops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-green-950/5 flex items-center justify-center text-3xl mb-4">🌿</div>
            <p className="font-['Lora',serif] text-xl text-green-950 mb-1.5">No crops yet</p>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Claim your first device to start monitoring its crop health in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {crops.map(crop => (
              <CropCard
                key={crop.id}
                crop={crop}
                onEdit={c => setCropModal({ mode: 'edit', crop: c })}
                onDelete={c => setDeleteModal(c)}
                onRemoveEsp={c => setRemoveEspModal(c)}
                onAddEsp={c => setAddDeviceModal({ crop: c })}
                onView={c => {
                  if (c.esp) navigate(`/user/crop-care/${garden_id}/${c.id}/${c.esp.serial_number}`);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {cropModal && (
        <CropModal
          crop={cropModal.mode === 'edit' ? cropModal.crop : null}
          onClose={() => setCropModal(null)}
          onSave={handleSaveCrop}
          loading={actionLoading}
        />
      )}
      {addDeviceModal && (
        <AddDeviceModal
          crop={addDeviceModal.crop}
          onClose={() => setAddDeviceModal(null)}
          onSave={handleAddDevice}
          loading={actionLoading}
        />
      )}
      {deleteModal && (
        <DeleteCropModal
          crop={deleteModal}
          onClose={() => setDeleteModal(null)}
          onConfirm={handleDeleteCrop}
          loading={actionLoading}
        />
      )}
      {removeEspModal && (
        <RemoveEspModal
          esp={removeEspModal.esp}
          onClose={() => setRemoveEspModal(null)}
          onConfirm={handleRemoveEsp}
          loading={actionLoading}
        />
      )}

      <DeviceToast toasts={toasts} onDismiss={dismissToast}/>
    </div>
  );
};

export default CropCareConfig;
