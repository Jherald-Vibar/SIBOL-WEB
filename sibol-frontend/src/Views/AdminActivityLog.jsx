import { useState, useEffect, useCallback, useRef } from "react";
import axiosClient from "./axios";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "http") === "https",
    enabledTransports: ["ws", "wss"],
});

const BADGE = {
    garden:       { bg: "#dcfce7", color: "#166634" },
    crop:         { bg: "#fef9c3", color: "#854d0e" },
    crop_profile: { bg: "#dbeafe", color: "#1e40af" },
};
const LABEL = { garden: "Garden", crop: "Crop", crop_profile: "Crop Profile" };

function fmtDate(d) {
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

export default function AdminActivityLog() {
    const [logs, setLogs]               = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState("");
    const [search, setSearch]           = useState("");
    const [filterOpen, setFilterOpen]   = useState(false);
    const [filterType, setFilterType]   = useState("all");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [newCount, setNewCount]       = useState(0);
    const filterRef                     = useRef(null);

    const changeDate = (offset) => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() + offset);
            return d;
        });
        setNewCount(0);
    };

    const fetchLogs = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const dateStr = currentDate.toISOString().split("T")[0];
            const params  = { date: dateStr };
            if (filterType !== "all") params.log_name = filterType;
            const res = await axiosClient.get("/admin/activity-logs", { params });
            setLogs(res.data.data ?? []);
            setNewCount(0);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load logs.");
        } finally {
            setLoading(false);
        }
    }, [currentDate, filterType]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    // WebSocket listener
    useEffect(() => {
        const channel = echo.channel("activity-logs");

        channel.listen(".ActivityLogCreated", (e) => {
            const incoming = e.log;
            const incomingDate = new Date(incoming.created_at);

            if (isToday(currentDate) && isToday(incomingDate)) {
                const matchesFilter = filterType === "all" || incoming.log_name === filterType;
                if (matchesFilter) {
                    setLogs(prev => [incoming, ...prev]);
                    setNewCount(prev => prev + 1);
                }
            }
        });

        return () => {
            channel.stopListening(".ActivityLogCreated");
            echo.leave("activity-logs");
        };
    }, [currentDate, filterType]);

    // Close filter dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = logs.filter(l => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            (l.causer?.name ?? "").toLowerCase().includes(q) ||
            (l.description ?? "").toLowerCase().includes(q) ||
            (l.properties?.garden_name ?? "").toLowerCase().includes(q) ||
            (l.properties?.crop_name ?? "").toLowerCase().includes(q)
        );
    });

    const badge = (logName) => {
        const s = BADGE[logName] || { bg: "#f3f4f6", color: "#374151" };
        return (
            <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 500 }}>
                {LABEL[logName] || logName}
            </span>
        );
    };

    const FILTER_OPTIONS = [
        { value: "all",          label: "All" },
        { value: "garden",       label: "Garden" },
        { value: "crop",         label: "Crop" },
        { value: "crop_profile", label: "Crop Profile" },
    ];

    return (
        <div style={{ background: "#f0ece0", minHeight: "100%", fontFamily: "'DM Sans', sans-serif", padding: 24 }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
                .al-tr:hover td { background: #f7fdf9; }
                .al-new td { background: #f0fdf4 !important; animation: fadeIn 0.4s ease-out; }
                .date-btn { background: none; border: none; padding: 7px 12px; cursor: pointer; font-size: 15px; color: #374151; }
                .date-btn:hover { background: #f3f4f6; }
                .filter-opt:hover { background: #f3f4f6; }
                .filter-opt.active { background: #f0fdf4; color: #0b3d1e; font-weight: 500; }
            `}</style>

            {/* Header */}
            <div style={{ background: "#f7f4ee", borderRadius: 14, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#0b3d1e" }}>
                            Activity <em style={{ fontStyle: "italic", color: "#d4840a" }}>Logs</em>
                        </div>
                        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>View all registered users' activity logs.</p>
                    </div>
                </div>

                {/* Date navigator */}
                <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #d1d5db", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
                    <button className="date-btn" onClick={() => changeDate(-1)}>‹</button>
                    <span style={{ padding: "7px 14px", fontSize: 13, fontWeight: 500, color: "#374151", borderLeft: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb" }}>
                        {fmtDate(currentDate)}
                    </span>
                    <button className="date-btn" onClick={() => changeDate(1)}>›</button>
                </div>
            </div>

            {/* Toolbar */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 14, position: "relative" }}>
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: "7px 12px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#374151", outline: "none", background: "#fff" }}
                />

                {/* Filter dropdown */}
                <div style={{ position: "relative" }} ref={filterRef}>
                    <button
                        onClick={() => setFilterOpen(p => !p)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: "1.5px solid #d1d5db", borderRadius: 8, background: filterType !== "all" ? "#f0fdf4" : "#fff", fontSize: 12, color: filterType !== "all" ? "#0b3d1e" : "#374151", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: filterType !== "all" ? 500 : 400 }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                        Filter by{filterType !== "all" ? `: ${LABEL[filterType]}` : ""}
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>

                    {filterOpen && (
                        <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden", zIndex: 50, minWidth: 160, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
                            <div style={{ padding: "6px 12px", fontSize: 10, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", color: "#9ca3af", borderBottom: "1px solid #f3f4f6" }}>
                                Log Type
                            </div>
                            {FILTER_OPTIONS.map(opt => (
                                <div
                                    key={opt.value}
                                    className={`filter-opt${filterType === opt.value ? " active" : ""}`}
                                    onClick={() => { setFilterType(opt.value); setFilterOpen(false); }}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", fontSize: 13, color: "#374151", cursor: "pointer" }}
                                >
                                    {opt.label}
                                    {filterType === opt.value && (
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0b3d1e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table card */}
            <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                <div style={{ background: "#0b3d1e", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px" }}>
                    <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>User Activity Logs</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                        <span style={{ color: "#fff", fontWeight: 500 }}>{filtered.length}</span> logs
                    </span>
                </div>

                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                        <svg style={{ animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2e8b57" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    </div>
                ) : error ? (
                    <div style={{ padding: "20px", fontSize: 13, color: "#be123c" }}>{error}</div>
                ) : filtered.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" }}>
                        <div style={{ width: 48, height: 48, border: "1.5px solid #d1d5db", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                        </div>
                        <p style={{ fontSize: 14, color: "#6b7280" }}>No data available</p>
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                                {["Time", "User", "Action", "Details"].map((h, i) => (
                                    <th key={h} style={{ width: ["18%","20%","37%","25%"][i], padding: "11px 20px", textAlign: "left", fontSize: 11, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#9ca3af" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((log, idx) => (
                                <tr key={log.id} className={`al-tr${idx === 0 && newCount > 0 ? " al-new" : ""}`} style={{ borderBottom: "1px solid #f9fafb" }}>
                                    <td style={{ padding: "13px 20px", fontSize: 13, color: "#9ca3af" }}>
                                        {new Date(log.created_at).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                                    </td>
                                    <td style={{ padding: "13px 20px", fontSize: 13, fontWeight: 500, color: "#0b3d1e" }}>
                                        {log.causer?.name ?? "System"}
                                    </td>
                                    <td style={{ padding: "13px 20px", fontSize: 13, color: "#374151" }}>
                                        {log.description} {badge(log.log_name)}
                                    </td>
                                    <td style={{ padding: "13px 20px", fontSize: 12, color: "#9ca3af" }}>
                                        {log.properties?.garden_name || log.properties?.crop_name || "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
