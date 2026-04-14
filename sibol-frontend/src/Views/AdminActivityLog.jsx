import { useState, useEffect, useCallback, useRef } from "react";
import axiosClient from "./axios";
import echo from "./echo";

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
            <span style={{ background: s.bg, color: s.color }}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium">
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
        <div className="bg-[#f0ece0] min-h-full p-6 font-['DM_Sans',sans-serif]">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
                .al-tr:hover td { background: #f7fdf9; }
                .al-new td { background: #f0fdf4 !important; animation: fadeIn 0.4s ease-out; }
            `}</style>

            {/* ── Header ── */}
            <div className="bg-[#f7f4ee] rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3 mb-5">
                <div>
                    <h1 className="font-['Playfair_Display',serif] text-2xl font-bold text-[#0b3d1e]">
                        Activity <em className="italic text-[#d4840a]">Logs</em>
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5">View all registered users' activity logs.</p>
                </div>

                {/* Date navigator */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button
                        onClick={() => changeDate(-1)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors text-base"
                    >‹</button>
                    <span className="px-3 py-2 text-sm font-medium text-gray-700 border-x border-gray-200">
                        {fmtDate(currentDate)}
                    </span>
                    <button
                        onClick={() => changeDate(1)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors text-base"
                    >›</button>
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div className="flex justify-end gap-2 mb-3 relative">
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700 outline-none bg-white focus:border-green-500 transition-colors"
                />

                {/* Filter dropdown */}
                <div className="relative" ref={filterRef}>
                    <button
                        onClick={() => setFilterOpen(p => !p)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs cursor-pointer transition-colors ${
                            filterType !== "all"
                                ? "border-green-300 bg-green-50 text-[#0b3d1e] font-medium"
                                : "border-gray-300 bg-white text-gray-700"
                        }`}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                        </svg>
                        Filter by{filterType !== "all" ? `: ${LABEL[filterType]}` : ""}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </button>

                    {filterOpen && (
                        <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl overflow-hidden z-50 min-w-[160px] shadow-lg">
                            <div className="px-3 py-1.5 text-[10px] font-medium tracking-widest uppercase text-gray-400 border-b border-gray-100">
                                Log Type
                            </div>
                            {FILTER_OPTIONS.map(opt => (
                                <div
                                    key={opt.value}
                                    onClick={() => { setFilterType(opt.value); setFilterOpen(false); }}
                                    className={`flex items-center justify-between px-3 py-2 text-sm text-gray-700 cursor-pointer transition-colors ${
                                        filterType === opt.value
                                            ? "bg-green-50 text-[#0b3d1e] font-medium"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    {opt.label}
                                    {filterType === opt.value && (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0b3d1e" strokeWidth="2.5" strokeLinecap="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Table Card ── */}
            <div className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden" style={{ maxHeight: 420 }}>

                {/* Table header bar */}
                <div className="bg-[#0b3d1e] flex items-center justify-between px-5 py-3 flex-shrink-0">
                    <span className="text-[11px] font-medium tracking-widest uppercase text-white/75">
                        User Activity Logs
                    </span>
                    <span className="text-xs text-white/60">
                        <span className="text-white font-medium">{filtered.length}</span> logs
                    </span>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <svg style={{ animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2e8b57" strokeWidth="2" strokeLinecap="round">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                    </div>
                ) : error ? (
                    <div className="px-5 py-5 text-sm text-red-600">{error}</div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                        </div>
                        <p className="text-sm text-gray-500">No data available</p>
                    </div>
                ) : (
                    /* ✅ Scrollable table wrapper */
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
                            {/* ✅ Sticky thead */}
                            <thead className="sticky top-0 z-10 bg-white">
                                <tr className="border-b border-gray-100">
                                    {[
                                        { label: "Time",    width: "18%" },
                                        { label: "User",    width: "20%" },
                                        { label: "Action",  width: "37%" },
                                        { label: "Details", width: "25%" },
                                    ].map(h => (
                                        <th
                                            key={h.label}
                                            style={{ width: h.width }}
                                            className="px-5 py-3 text-left text-[11px] font-medium tracking-wide uppercase text-gray-400"
                                        >
                                            {h.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((log, idx) => (
                                    <tr
                                        key={log.id}
                                        className={`al-tr border-b border-gray-50 ${idx === 0 && newCount > 0 ? "al-new" : ""}`}
                                    >
                                        <td className="px-5 py-3 text-xs text-gray-400">
                                            {new Date(log.created_at).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                                        </td>
                                        <td className="px-5 py-3 text-xs font-medium text-[#0b3d1e]">
                                            {log.causer?.name ?? "System"}
                                        </td>
                                        <td className="px-5 py-3 text-xs text-gray-600">
                                            <span className="mr-2">{log.description}</span>
                                            {badge(log.log_name)}
                                        </td>
                                        <td className="px-5 py-3 text-xs text-gray-400 truncate">
                                            {log.properties?.garden_name || log.properties?.crop_name || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
