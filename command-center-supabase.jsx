import { useState, useEffect, useCallback, useRef } from "react";
// ─── SUPABASE CONFIG ─────────────────────────────────────────────────────────
const SUPABASE_URL = "https://lkgtwsdscxowrficpmgr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZ3R3c2RzY3hvd3JmaWNwbWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNzY2MzcsImV4cCI6MjA5NTk1MjYzN30.ayrk5XPK7EA5HBzJlMd4fzIk1A41rr3XU0n93Qljxfw";

async function sbGet() {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/command_center?id=eq.main&select=data`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
    });
    const rows = await r.json();
    return rows?.[0]?.data || null;
  } catch { return null; }
}

async function sbSet(data) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/command_center?id=eq.main`, {
      method: "PATCH",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ data, updated_at: new Date().toISOString() })
    });
  } catch {}
}



const COLORS = {
  gold: "#C17D3C", goldLight: "#FDF3E7", goldBorder: "#E8C49A",
  teal: "#4A7C6F", tealLight: "#EAF4F1", tealBorder: "#9DCEC4",
  navy: "#2C3E6B", navyLight: "#EEF1F8", navyBorder: "#A8B4D4",
  rose: "#B05070", roseLight: "#FBF0F3", roseBorder: "#E0A0B5",
  a: "#C0392B", aLight: "#FDF0EE", aBorder: "#E8A8A0",
  b: "#C17D3C", bLight: "#FDF3E7", bBorder: "#E8C49A",
  c: "#4A7C6F", cLight: "#EAF4F1", cBorder: "#9DCEC4",
  bg: "#FAF8F5", dark: "#1C1C1E", text: "#2C2C2E", muted: "#888", border: "#EBEBEB", white: "#FFFFFF",
};

const ABC = {
  A: { label: "A — Must Do", color: COLORS.a, light: COLORS.aLight, border: COLORS.aBorder, desc: "Critical · Serious consequences if skipped" },
  B: { label: "B — Should Do", color: COLORS.b, light: COLORS.bLight, border: COLORS.bBorder, desc: "Important · Do after all A tasks" },
  C: { label: "C — Nice to Do", color: COLORS.c, light: COLORS.cLight, border: COLORS.cBorder, desc: "Low priority · No consequence if postponed" },
};

const TABS = ["🗓 This Week", "✅ To-Do", "🏆 Wins", "🤖 Coach", "🅿️ Ideas"];

const WEEKLY_LANES = [
  { id: "mustdo", label: "Must-Do's This Week", emoji: "🔴", color: COLORS.a, light: COLORS.aLight, border: COLORS.aBorder, sub: "Non-negotiable — business & work combined" },
  { id: "workbook", label: "Powerful All Along", emoji: "📖", color: COLORS.gold, light: COLORS.goldLight, border: COLORS.goldBorder, sub: "Your path to $1,000/month" },
  { id: "ai", label: "AI Training", emoji: "🤖", color: COLORS.teal, light: COLORS.tealLight, border: COLORS.tealBorder, sub: "Efficiency investment" },
  { id: "work", label: "Work Priorities", emoji: "📋", color: COLORS.navy, light: COLORS.navyLight, border: COLORS.navyBorder, sub: "INROADS deliverables" },
  { id: "personal", label: "Personal & Family", emoji: "🏠", color: COLORS.rose, light: COLORS.roseLight, border: COLORS.roseBorder, sub: "Caleb, home, appointments" },
];

const PREPOPULATED = {
  mustdo: [
    { text: "PA Annual Report: FILED AND PAID June 1", done: true },
    { text: "PSLF Step 1: Husband submits Direct Consolidation Loan application at StudentAid.gov this week", done: false },
    { text: "Elijah: Docs sent, kickoff call June 2 at 12pm", done: true },
  ],
  workbook: [
    { text: "Porsche permission: text sent 5/31 — follow up June 7 if no response", done: false },
    { text: "Calcie Cooper permission: email sent 5/31 — follow up June 7 if no response", done: false },
    { text: "DONE: Completed draft of Chapters 1 through 5 — June 1, 2026", done: true },
  ],
  ai: [{ text: "Complete next Anthropic Academy module", done: false }],
  work: [
    { text: "INROADS: Email Harbor Bank and Bates White today", done: false },
    { text: "INROADS: Send 20 more CEO event invites by June 5", done: false },
    { text: "INROADS: Career Advisor inputs review — August through October", done: false },
    { text: "INROADS: Final bill report for Young Men United", done: false },
  ],
  personal: [
    { text: "Caleb party: Check weather June 7 then book chair/table rental", done: false },
    { text: "TJF grant call tomorrow — prep Caleb grant questions", done: false },
    { text: "TISLA email tomorrow — PSLF questions re: Parent PLUS consolidation", done: false },
  ],
};

const QUOTES = [
  "She decided to build the life she kept imagining — one focused hour at a time.",
  "The most powerful woman in the room is the one who knows exactly what she's building.",
  "Your consistency today is someone else's inspiration tomorrow.",
  "A visionary with a system is unstoppable. You are both.",
  "She didn't wait for permission. She built the door.",
  "Success isn't found — it's constructed, brick by brick, choice by choice.",
  "The work you do in the margins of your day will define the center of your future.",
  "Lead your business like you lead your team — with clarity, purpose, and no wasted motion.",
  "Your story is already written. You're just living up to it.",
  "A focused woman with a deadline is the most powerful force in any room.",
  "She balanced everything because she knew what mattered most.",
  "Every small step you take today is a promise to your future self.",
];

const PREPOPULATED_TODOS = [
  // Compass Advising Group — A task (June 30 deadline)
  { text: "File Pennsylvania Annual Report for Compass Advising Group Inc. — due 06/30/2026 at PA Dept of State Bureau of Corporations (dos.pa.gov)", abc: "A", deadline: "2026-06-30" },
  // PSLF — A tasks (husband must act TODAY)
  { text: "Husband logs into StudentAid.gov and begins Direct Consolidation Loan application TODAY", abc: "A", deadline: "2026-06-30" },
  { text: "Submit Employment Certification Form (ECF) for PSLF at StudentAid.gov — use e-signature for speed", abc: "A", deadline: "2026-06-30" },
  { text: "Call MOHELA (1-888-866-4352) — flag urgency of June 30 consolidation deadline, ask about expedited processing", abc: "A", deadline: "2026-06-01" },
  { text: "Confirm husband's school district AND nonprofit both qualify as PSLF employers at studentaid.gov/pslf", abc: "A", deadline: "2026-06-07" },
  { text: "Verify husband's current qualifying payment count toward 120 PSLF payments at StudentAid.gov", abc: "A", deadline: "2026-06-07" },
  { text: "Do NOT take out any new Parent PLUS loans after July 1, 2026 — would destroy PSLF eligibility on all loans", abc: "A", deadline: "" },
  // Compass Annual Report — B task (gather info before filing)
  { text: "Gather info for PA Annual Report: principal office address, officer/director names, confirm registered agent address", abc: "B", deadline: "2026-06-20" },
  // Elijah gap funding — B tasks
  { text: "Find out exact dollar amount of Elijah's financial aid gap for next year", abc: "B", deadline: "2026-06-14" },
  { text: "Contact Elijah's school financial aid office — appeal aid package and ask about gap options", abc: "B", deadline: "2026-06-14" },
  { text: "Check what unsubsidized Direct Loans Elijah can take in his own name to cover the gap", abc: "B", deadline: "2026-06-14" },
  { text: "Ask Elijah's school about interest-free installment payment plan as alternative to loans", abc: "B", deadline: "2026-06-21" },
  { text: "Schedule free NFCC nonprofit student loan counseling call — 1-800-388-2227", abc: "B", deadline: "2026-06-07" },
  // Caleb graduation party — B tasks
  { text: "Finalize guest list and headcount for Caleb's graduation party", abc: "B", deadline: "" },
  { text: "Confirm venue, food, and day-of logistics for Caleb's party", abc: "B", deadline: "" },
  { text: "Send graduation party invitations", abc: "B", deadline: "" },
  // Workbook — B tasks
  { text: "Porsche permission: text sent 5/31 — follow up June 7 if no response", abc: "B", deadline: "2026-06-07" },
  { text: "Calcie Cooper (Social Dad DC) permission: email sent 5/31 — follow up June 7 if no response", abc: "B", deadline: "2026-06-07" },
  // Elijah — Project setup
  { text: "ELIJAH: Set up project — share Anthropic AI training link and explain both tracks (Workbook + DJ Flash)", abc: "B", deadline: "2026-06-14" },
  { text: "ELIJAH: Complete Anthropic AI training modules (both of you do this together)", abc: "B", deadline: "2026-06-21" },
  // Elijah — Track 1: Powerful All Along
  { text: "ELIJAH (Track 1): Research target audience for Powerful All Along — nonprofit/higher ed professionals", abc: "B", deadline: "2026-06-21" },
  { text: "ELIJAH (Track 1): Draft 4 LinkedIn launch posts for Powerful All Along using AI tools", abc: "B", deadline: "2026-06-28" },
  { text: "ELIJAH (Track 1): Write Gumroad product listing copy for the workbook", abc: "B", deadline: "2026-06-28" },
  { text: "ELIJAH (Track 1): Build pre-launch email list strategy using free tool (Mailchimp or ConvertKit)", abc: "C", deadline: "" },
  { text: "ELIJAH (Track 1): Create content calendar for workbook launch week", abc: "C", deadline: "" },
  // Elijah — Track 2: DJ Flash
  { text: "ELIJAH (Track 2): Audit DJ Flash current social media presence — Instagram, TikTok, Facebook", abc: "B", deadline: "2026-06-14" },
  { text: "ELIJAH (Track 2): Create content strategy — 2-3 posts/week cadence with themes and formats", abc: "B", deadline: "2026-06-21" },
  { text: "ELIJAH (Track 2): Design 5 branded Canva graphics for DJ Flash social posts", abc: "B", deadline: "2026-06-28" },
  { text: "ELIJAH (Track 2): Build a simple DJ Flash booking inquiry process (form or contact workflow)", abc: "C", deadline: "" },
  { text: "ELIJAH (Track 2): Research local venues and events for DJ Flash outreach list", abc: "C", deadline: "" },
];

const STORAGE_KEY = "niaomi_v4";
const mkId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function getWeekKey() {
  const now = new Date();
  const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1);
  return start.toISOString().slice(0, 10);
}
function getWeekLabel() {
  const now = new Date();
  const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  const fmt = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}
function todayKey() { return new Date().toISOString().slice(0, 10); }
function todayLabel() { return new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }); }
function daysUntil(ds) {
  if (!ds) return null;
  return Math.ceil((new Date(ds + "T12:00:00") - new Date()) / 86400000);
}
function getDailyQuote() {
  const idx = new Date().getDate() % QUOTES.length;
  return QUOTES[idx];
}

function defaultWeekly() {
  const lanes = {};
  WEEKLY_LANES.forEach(l => {
    const pre = PREPOPULATED[l.id] || [];
    lanes[l.id] = pre.length
      ? pre.map(p => ({ id: mkId(), text: p.text, done: p.done }))
      : [{ id: mkId(), text: "", done: false }];
  });
  return lanes;
}

const defaultState = () => ({
  weekKey: getWeekKey(),
  weekly: defaultWeekly(),
  todos: reassignANums(PREPOPULATED_TODOS.map(t => ({ id: mkId(), done: false, ...t }))),
  wins: {},
  parkedIdeas: [],
  lastCoachFetch: null,
  coachNudge: null,
  coachFull: null,
});

// ABC helpers
function getAbcGroups(todos) {
  const groups = { A: [], B: [], C: [], none: [] };
  todos.forEach(t => {
    const k = t.abc || "none";
    if (groups[k]) groups[k].push(t); else groups.none.push(t);
  });
  // Sort A tasks by number
  groups.A.sort((a, b) => (a.abcNum || 99) - (b.abcNum || 99));
  return groups;
}

function reassignANums(todos) {
  let n = 1;
  return todos.map(t => t.abc === "A" ? { ...t, abcNum: n++ } : t);
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function CheckCircle({ done, color, onClick }) {
  return (
    <button onClick={onClick} style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${done ? color : "#DDD"}`, background: done ? color : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, transition: "all 0.2s" }}>
      {done && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </button>
  );
}

function AbcBadge({ val, onChange }) {
  const [open, setOpen] = useState(false);
  const cfg = val ? ABC[val] : null;
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: cfg ? cfg.light : "#F5F5F5", border: `1.5px solid ${cfg ? cfg.border : "#DDD"}`, borderRadius: 7, padding: "3px 9px", fontSize: 11, fontWeight: 700, color: cfg ? cfg.color : COLORS.muted, cursor: "pointer", fontFamily: "system-ui", minWidth: 32, letterSpacing: 0.5 }}>
        {val || "—"}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "110%", left: 0, background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", zIndex: 50, minWidth: 200, overflow: "hidden" }}>
          {["A", "B", "C"].map(k => (
            <button key={k} onClick={() => { onChange(k); setOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", background: "transparent", border: "none", cursor: "pointer", borderBottom: k !== "C" ? `1px solid ${COLORS.border}` : "none" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ABC[k].color, fontFamily: "system-ui" }}>{k}</div>
              <div style={{ fontSize: 10, color: COLORS.muted, fontFamily: "system-ui", marginTop: 1 }}>{ABC[k].desc}</div>
            </button>
          ))}
          {val && <button onClick={() => { onChange(null); setOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "#FAFAFA", border: "none", cursor: "pointer", fontSize: 11, color: COLORS.muted, fontFamily: "system-ui" }}>Clear</button>}
        </div>
      )}
    </div>
  );
}

function TodoItem({ todo, abcNum, onUpdate, onRemove }) {
  const cfg = todo.abc ? ABC[todo.abc] : null;
  const days = daysUntil(todo.deadline);
  const overdue = days !== null && days < 0 && !todo.done;
  const dueSoon = days !== null && days >= 0 && days <= 2 && !todo.done;

  return (
    <div style={{ background: cfg ? cfg.light : COLORS.white, border: `1.5px solid ${cfg ? cfg.border : COLORS.border}`, borderRadius: 12, padding: "10px 13px", marginBottom: 8, position: "relative" }}>
      {todo.abc === "A" && abcNum && (
        <div style={{ position: "absolute", top: -1, right: 10, background: COLORS.a, color: "#fff", fontSize: 9, fontFamily: "system-ui", fontWeight: 700, padding: "2px 8px", borderRadius: "0 0 6px 6px", letterSpacing: 1 }}>
          A-{abcNum}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
        <CheckCircle done={todo.done} color={cfg ? cfg.color : COLORS.gold} onClick={() => onUpdate(todo.id, "done", !todo.done)} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <input type="text" value={todo.text} onChange={e => onUpdate(todo.id, "text", e.target.value)} placeholder="What needs to happen?" style={{ width: "100%", border: "none", outline: "none", fontSize: 13, fontFamily: "Georgia, serif", color: todo.done ? "#AAA" : COLORS.text, textDecoration: todo.done ? "line-through" : "none", background: "transparent", boxSizing: "border-box" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
            <AbcBadge val={todo.abc} onChange={v => onUpdate(todo.id, "abc", v)} />
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, color: COLORS.muted, fontFamily: "system-ui" }}>Due:</span>
              <input type="date" value={todo.deadline || ""} onChange={e => onUpdate(todo.id, "deadline", e.target.value)} style={{ border: `1px solid ${overdue ? COLORS.a : dueSoon ? COLORS.b : COLORS.border}`, borderRadius: 6, padding: "2px 6px", fontSize: 11, fontFamily: "system-ui", color: overdue ? COLORS.a : dueSoon ? COLORS.b : COLORS.muted, background: "transparent", outline: "none", cursor: "pointer" }} />
              {(overdue || dueSoon) && <span style={{ fontSize: 10, fontWeight: 700, color: overdue ? COLORS.a : COLORS.b, fontFamily: "system-ui" }}>{overdue ? "OVERDUE" : days === 0 ? "TODAY" : `${days}d`}</span>}
            </div>
          </div>
        </div>
        <button onClick={() => onRemove(todo.id)} style={{ background: "none", border: "none", color: "#CCC", cursor: "pointer", fontSize: 15, padding: "0 1px", flexShrink: 0 }}>×</button>
      </div>
    </div>
  );
}

function LaneCard({ lane, tasks, onUpdate, onAdd, onRemove }) {
  const filled = tasks.filter(t => t.text.trim());
  const done = filled.filter(t => t.done).length;
  return (
    <div style={{ background: COLORS.white, borderRadius: 14, border: `1.5px solid ${lane.border}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ background: lane.light, padding: "11px 15px", borderBottom: `1px solid ${lane.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 16 }}>{lane.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: "bold", color: lane.color }}>{lane.label}</span>
            {filled.length > 0 && <span style={{ fontSize: 10, color: lane.color, background: COLORS.white, padding: "1px 7px", borderRadius: 20, border: `1px solid ${lane.border}`, fontFamily: "system-ui" }}>{done}/{filled.length}</span>}
          </div>
          {lane.sub && <div style={{ fontSize: 10, color: COLORS.muted, fontFamily: "system-ui", marginTop: 2, paddingLeft: 23 }}>{lane.sub}</div>}
        </div>
      </div>
      <div style={{ padding: "8px 13px" }}>
        {tasks.map((task, idx) => (
          <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 2px", borderBottom: idx < tasks.length - 1 ? "1px solid #F5F5F5" : "none" }}>
            <CheckCircle done={task.done} color={lane.color} onClick={() => onUpdate(task.id, "done", !task.done)} />
            <input type="text" value={task.text} onChange={e => onUpdate(task.id, "text", e.target.value)} placeholder="Add item..." style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "Georgia, serif", color: task.done ? "#AAA" : COLORS.text, textDecoration: task.done ? "line-through" : "none", background: "transparent" }} />
            <button onClick={() => onRemove(task.id)} style={{ background: "none", border: "none", color: "#CCC", cursor: "pointer", fontSize: 15, padding: "0 1px" }}>×</button>
          </div>
        ))}
        <button onClick={onAdd} style={{ marginTop: 6, background: "none", border: `1px dashed ${lane.border}`, borderRadius: 8, color: lane.color, cursor: "pointer", fontSize: 11, fontFamily: "system-ui", padding: "5px 12px", width: "100%", textAlign: "center" }}>+ Add</button>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function CommandCenter() {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState(0);
  const [winNote, setWinNote] = useState("");
  const [newIdea, setNewIdea] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState(null);
  const [quoteExpanded, setQuoteExpanded] = useState(false);

  const saveTimer = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const saved = await sbGet();
        if (saved && Object.keys(saved).length > 0) {
          const existingTexts = new Set((saved.todos || []).map(t => t.text));
          const newTodos = PREPOPULATED_TODOS
            .filter(t => !existingTexts.has(t.text))
            .map(t => ({ id: mkId(), done: false, ...t }));
          const mergedTodos = reassignANums([...(saved.todos || []), ...newTodos]);
          if (saved.weekKey !== getWeekKey()) {
            setState({ ...saved, weekKey: getWeekKey(), weekly: defaultWeekly(), todos: mergedTodos, coachNudge: null, lastCoachFetch: null });
          } else {
            setState({ ...saved, todos: mergedTodos });
          }
        } else {
          setState(defaultState());
        }
      } catch { setState(defaultState()); }
    }
    load();
  }, []);

  useEffect(() => {
    if (!state) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { sbSet(state); }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  const update = patch => setState(s => ({ ...s, ...patch }));

  // Auto-log wins when tasks are checked
  const autoLogWin = useCallback((text) => {
    if (!text?.trim()) return;
    const key = todayKey();
    setState(s => {
      const existing = s.wins[key] || { count: 0, notes: [] };
      if (existing.notes.includes(`✓ ${text.trim()}`)) return s;
      return { ...s, wins: { ...s.wins, [key]: { count: existing.count + 1, notes: [...existing.notes, `✓ ${text.trim()}`] } } };
    });
  }, []);

  // Weekly
  const updateWeekTask = (laneId, taskId, field, val) => {
    setState(s => {
      const lane = s.weekly[laneId];
      const task = lane.find(t => t.id === taskId);
      if (field === "done" && val === true && task?.text?.trim()) autoLogWin(task.text);
      return { ...s, weekly: { ...s.weekly, [laneId]: lane.map(t => t.id === taskId ? { ...t, [field]: val } : t) } };
    });
  };
  const addWeekTask = laneId => update({ weekly: { ...state.weekly, [laneId]: [...state.weekly[laneId], { id: mkId(), text: "", done: false }] } });
  const removeWeekTask = (laneId, taskId) => update({ weekly: { ...state.weekly, [laneId]: state.weekly[laneId].filter(t => t.id !== taskId) } });

  // Todos
  const updateTodo = (id, field, val) => {
    setState(s => {
      const todo = s.todos.find(t => t.id === id);
      if (field === "done" && val === true && todo?.text?.trim()) autoLogWin(todo.text);
      let updated = s.todos.map(t => t.id === id ? { ...t, [field]: val } : t);
      if (field === "abc") updated = reassignANums(updated);
      return { ...s, todos: updated };
    });
  };
  const addTodo = () => update({ todos: [...state.todos, { id: mkId(), text: "", done: false, deadline: "", abc: null }] });
  const removeTodo = id => update({ todos: state.todos.filter(t => t.id !== id) });

  // Manual wins
  const today = todayKey();
  const todayWins = state?.wins?.[today] || { count: 0, notes: [] };
  const addWin = () => {
    if (!winNote.trim()) return;
    const updated = { count: todayWins.count + 1, notes: [...todayWins.notes, winNote.trim()] };
    update({ wins: { ...state.wins, [today]: updated } });
    setWinNote("");
  };
  const weeklyWinCount = () => {
    if (!state) return 0;
    return Object.entries(state.wins).filter(([k]) => k >= getWeekKey()).reduce((a, [, v]) => a + v.count, 0);
  };

  // Coach
  const buildContext = useCallback((s) => {
    const wb = s.weekly.workbook || [];
    const wbPct = wb.length > 0 ? Math.round(wb.filter(t => t.done).length / wb.length * 100) : 0;
    const groups = getAbcGroups(s.todos);
    const overdueA = groups.A.filter(t => !t.done && daysUntil(t.deadline) < 0).map(t => t.text);
    const winsThisWeek = Object.entries(s.wins).filter(([k]) => k >= getWeekKey()).reduce((a, [, v]) => a + v.count, 0);
    return `
You are Niaomi Carter's personal productivity coach inside her Command Center app.

NIAOMI'S CONTEXT:
- Goal: $1,000/month net extra income ASAP
- Primary vehicle: "Powerful All Along" digital workbook under Compass Advising Group LLC
- Bandwidth: evenings and weekends only
- Pattern: tends to hop to new ideas instead of finishing — your job is to refocus her
- Husband is an executor — handles tech/logistics when she writes
- Son Caleb at Cheyney University — financial aid follow-ups ongoing
- Uses Franklin Covey ABC prioritization system

THIS WEEK SNAPSHOT:
- Workbook progress: ${wbPct}% of steps done
- A-tasks total: ${groups.A.length} (${groups.A.filter(t => t.done).length} done)
- Overdue A-tasks: ${overdueA.join(", ") || "none"}
- Parked ideas waiting: ${s.parkedIdeas.length}
- Wins this week: ${winsThisWeek}

TASK: Generate two things:
1. NUDGE: 1-2 sentence daily motivational nudge. Warm, direct, specific to her situation.
2. RECOMMENDATIONS: 3-5 concrete prioritization recommendations for this week. Reference the ABC system. Call out blockers. Be honest if workbook is stalling.

Respond ONLY as valid JSON, no markdown, no preamble:
{"nudge":"...","recommendations":["...","...","..."]}
`.trim();
  }, []);

  const fetchCoach = useCallback(async (s) => {
    setCoachLoading(true); setCoachError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: buildContext(s) }] }),
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      update({ coachNudge: parsed.nudge, coachFull: parsed.recommendations, lastCoachFetch: new Date().toISOString() });
    } catch { setCoachError("Couldn't load recommendations right now. Try again."); }
    setCoachLoading(false);
  }, [buildContext]);

  // Auto-fetch on load if stale
  useEffect(() => {
    if (!state) return;
    const last = state.lastCoachFetch ? new Date(state.lastCoachFetch) : null;
    if (!last || (new Date() - last) > 6 * 3600000) fetchCoach(state);
  }, [!!state]);

  if (!state) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: COLORS.bg, fontFamily: "Georgia, serif", color: COLORS.muted }}>
      Loading your command center...
    </div>
  );

  const [syncStatus, setSyncStatus] = useState("saved");
  useEffect(() => {
    if (!state) return;
    setSyncStatus("saving");
    const t = setTimeout(() => setSyncStatus("saved"), 1200);
    return () => clearTimeout(t);
  }, [state]);

  const allWeekTasks = WEEKLY_LANES.flatMap(l => state.weekly[l.id].filter(t => t.text.trim()));
  const doneTasks = allWeekTasks.filter(t => t.done).length;
  const pct = allWeekTasks.length > 0 ? Math.round(doneTasks / allWeekTasks.length * 100) : 0;
  const groups = getAbcGroups(state.todos);
  const parkCount = state.parkedIdeas.length;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "Georgia, 'Times New Roman', serif", paddingBottom: 60 }}>

      {/* ── HEADER ── */}
      <div style={{ background: COLORS.dark, padding: "18px 16px 0", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>

          {/* Quote */}
          <div onClick={() => setQuoteExpanded(e => !e)} style={{ background: "linear-gradient(135deg, #2A2200 0%, #1C1C1E 100%)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, borderLeft: `3px solid ${COLORS.gold}`, cursor: "pointer" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.gold, fontFamily: "system-ui", textTransform: "uppercase", marginBottom: 4 }}>Daily Intention</div>
            <div style={{ fontSize: 13, color: "#F0DFC0", fontStyle: "italic", lineHeight: 1.5, fontFamily: "Georgia, serif" }}>"{getDailyQuote()}"</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 3, color: COLORS.gold, textTransform: "uppercase", fontFamily: "system-ui", marginBottom: 1 }}>Compass Advising Group</div>
              <div style={{ fontSize: 18, color: "#FAF8F5", fontWeight: "normal" }}>Command Center</div>
              <div style={{ fontSize: 10, color: "#555", fontFamily: "system-ui", marginTop: 1 }}>
                {getWeekLabel()} · {weeklyWinCount()} wins this week
                <span style={{ marginLeft: 8, color: syncStatus === "saved" ? "#4A7C6F" : "#C17D3C" }}>
                  {syncStatus === "saved" ? "✓ synced" : "· saving..."}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {parkCount > 0 && (
                <button onClick={() => setTab(4)} style={{ background: "#2A2A2C", border: `1px solid #444`, borderRadius: 20, padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 12 }}>🅿️</span>
                  <span style={{ fontSize: 11, color: COLORS.gold, fontFamily: "system-ui", fontWeight: 700 }}>{parkCount}</span>
                </button>
              )}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: "bold", color: pct === 100 ? COLORS.teal : COLORS.gold, lineHeight: 1 }}>{pct}%</div>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "system-ui" }}>{doneTasks}/{allWeekTasks.length}</div>
              </div>
            </div>
          </div>

          {/* Coach nudge */}
          {state.coachNudge && (
            <div style={{ background: "#2A2A2C", borderRadius: 8, padding: "8px 12px", marginBottom: 8, borderLeft: `2px solid ${COLORS.teal}`, display: "flex", gap: 7, alignItems: "flex-start" }}>
              <span style={{ fontSize: 12, flexShrink: 0 }}>🤖</span>
              <span style={{ fontSize: 11, color: "#CCC", fontFamily: "system-ui", lineHeight: 1.5 }}>{state.coachNudge}</span>
            </div>
          )}

          {allWeekTasks.length > 0 && (
            <div style={{ background: "#333", borderRadius: 3, height: 3, marginBottom: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? COLORS.teal : COLORS.gold, borderRadius: 3, transition: "width 0.4s" }} />
            </div>
          )}

          <div style={{ display: "flex", gap: 1, overflowX: "auto" }}>
            {TABS.map((t, i) => (
              <button key={i} onClick={() => setTab(i)} style={{ padding: "7px 10px", border: "none", cursor: "pointer", fontSize: 11, fontFamily: "system-ui", whiteSpace: "nowrap", background: tab === i ? COLORS.gold : "transparent", color: tab === i ? "#fff" : "#666", borderRadius: "7px 7px 0 0", transition: "all 0.2s", fontWeight: tab === i ? 600 : 400 }}>
                {t}{i === 4 && parkCount > 0 ? ` (${parkCount})` : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "16px 14px 0" }}>

        {/* TAB 0: THIS WEEK */}
        {tab === 0 && (() => {
          const aTodos = getAbcGroups(state.todos).A;
          const nonMustLanes = WEEKLY_LANES.filter(l => l.id !== "mustdo");
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: COLORS.goldLight, borderRadius: 10, padding: "9px 13px", border: `1px solid ${COLORS.goldBorder}` }}>
                <div style={{ fontSize: 11, color: COLORS.gold, fontFamily: "system-ui", fontWeight: 600 }}>📌 30-Day Commitment</div>
                <div style={{ fontSize: 12, color: "#7A5C30", marginTop: 2, fontStyle: "italic" }}>"I am building Powerful All Along. Every other idea gets parked until the workbook launches."</div>
              </div>

              {/* AUTO-POPULATED MUST-DO LANE from A-ranked todos */}
              <div style={{ background: COLORS.white, borderRadius: 14, border: `1.5px solid ${COLORS.aBorder}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ background: COLORS.aLight, padding: "11px 15px", borderBottom: `1px solid ${COLORS.aBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 16 }}>🔴</span>
                      <span style={{ fontSize: 13, fontWeight: "bold", color: COLORS.a }}>Must-Do's This Week</span>
                      {aTodos.length > 0 && (
                        <span style={{ fontSize: 10, color: COLORS.a, background: COLORS.white, padding: "1px 7px", borderRadius: 20, border: `1px solid ${COLORS.aBorder}`, fontFamily: "system-ui" }}>
                          {aTodos.filter(t => t.done).length}/{aTodos.length}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: COLORS.muted, fontFamily: "system-ui", marginTop: 2, paddingLeft: 23 }}>Auto-filled from your A-priority tasks · edit in To-Do tab</div>
                  </div>
                  <button onClick={() => setTab(1)} style={{ fontSize: 10, fontFamily: "system-ui", color: COLORS.a, background: "transparent", border: `1px solid ${COLORS.aBorder}`, borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}>+ Add A task</button>
                </div>
                <div style={{ padding: "8px 13px" }}>
                  {aTodos.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "16px", color: COLORS.muted, fontSize: 12, fontFamily: "system-ui" }}>
                      No A-priority tasks yet. Go to To-Do tab and assign A to your most critical items.
                    </div>
                  ) : aTodos.map((task, idx) => (
                    <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 2px", borderBottom: idx < aTodos.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                      <CheckCircle done={task.done} color={COLORS.a} onClick={() => updateTodo(task.id, "done", !task.done)} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontFamily: "Georgia, serif", color: task.done ? "#AAA" : COLORS.text, textDecoration: task.done ? "line-through" : "none", lineHeight: 1.4 }}>{task.text}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 3 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.a, fontFamily: "system-ui", background: COLORS.aLight, border: `1px solid ${COLORS.aBorder}`, borderRadius: 5, padding: "1px 6px" }}>A-{task.abcNum || idx + 1}</span>
                          {task.deadline && (() => {
                            const d = daysUntil(task.deadline);
                            return <span style={{ fontSize: 10, color: d !== null && d <= 2 ? COLORS.a : COLORS.muted, fontFamily: "system-ui", fontWeight: d !== null && d <= 2 ? 700 : 400 }}>{d === 0 ? "⚠️ TODAY" : d < 0 ? "⚠️ OVERDUE" : `Due in ${d}d`}</span>;
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other lanes */}
              {nonMustLanes.map(lane => (
                <LaneCard key={lane.id} lane={lane} tasks={state.weekly[lane.id]}
                  onUpdate={(id, f, v) => updateWeekTask(lane.id, id, f, v)}
                  onAdd={() => addWeekTask(lane.id)}
                  onRemove={id => removeWeekTask(lane.id, id)} />
              ))}
            </div>
          );
        })()}

        {/* TAB 1: TO-DO (ABC) */}
        {tab === 1 && (
          <div>
            {/* ABC legend */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {["A", "B", "C"].map(k => (
                <div key={k} style={{ background: ABC[k].light, border: `1.5px solid ${ABC[k].border}`, borderRadius: 10, padding: "7px 12px", flex: 1, minWidth: 80 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: ABC[k].color, fontFamily: "system-ui" }}>{k}</div>
                  <div style={{ fontSize: 10, color: COLORS.muted, fontFamily: "system-ui", marginTop: 1, lineHeight: 1.3 }}>{k === "A" ? "Must Do" : k === "B" ? "Should Do" : "Nice to Do"}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: "bold", color: COLORS.text }}>Master To-Do List</div>
                <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "system-ui", marginTop: 1 }}>Brain dump everything · tap — to assign A, B, or C</div>
              </div>
              <button onClick={addTodo} style={{ background: COLORS.gold, color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontFamily: "system-ui", fontWeight: 600 }}>+ Add</button>
            </div>

            {/* A tasks first */}
            {groups.A.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontFamily: "system-ui", fontWeight: 700, color: COLORS.a, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>A — Must Do First</div>
                {groups.A.map((todo, i) => <TodoItem key={todo.id} todo={todo} abcNum={i + 1} onUpdate={updateTodo} onRemove={removeTodo} />)}
              </div>
            )}
            {groups.B.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontFamily: "system-ui", fontWeight: 700, color: COLORS.b, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>B — After A's Done</div>
                {groups.B.map(todo => <TodoItem key={todo.id} todo={todo} onUpdate={updateTodo} onRemove={removeTodo} />)}
              </div>
            )}
            {groups.C.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontFamily: "system-ui", fontWeight: 700, color: COLORS.c, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>C — If Time Allows</div>
                {groups.C.map(todo => <TodoItem key={todo.id} todo={todo} onUpdate={updateTodo} onRemove={removeTodo} />)}
              </div>
            )}
            {groups.none.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontFamily: "system-ui", fontWeight: 700, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Unassigned — tap — to prioritize</div>
                {groups.none.map(todo => <TodoItem key={todo.id} todo={todo} onUpdate={updateTodo} onRemove={removeTodo} />)}
              </div>
            )}
            {state.todos.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: COLORS.muted, fontSize: 13, fontFamily: "system-ui" }}>
                Hit "+ Add" to dump everything on your mind. Then assign A, B, or C.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WINS */}
        {tab === 2 && (
          <div>
            <div style={{ background: COLORS.white, borderRadius: 14, border: `1.5px solid ${COLORS.tealBorder}`, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ background: COLORS.tealLight, padding: "12px 15px", borderBottom: `1px solid ${COLORS.tealBorder}` }}>
                <div style={{ fontSize: 14, fontWeight: "bold", color: COLORS.teal }}>🏆 Today's Wins</div>
                <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "system-ui", marginTop: 1 }}>{todayLabel()} · Tasks you check off are logged automatically</div>
              </div>
              <div style={{ padding: "12px 15px" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <input type="text" value={winNote} onChange={e => setWinNote(e.target.value)} onKeyDown={e => e.key === "Enter" && addWin()} placeholder="Add a win manually..." style={{ flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "8px 11px", fontSize: 13, fontFamily: "Georgia, serif", outline: "none", color: COLORS.text }} />
                  <button onClick={addWin} style={{ background: COLORS.teal, color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontFamily: "system-ui", fontWeight: 600 }}>Log it</button>
                </div>
                {todayWins.notes.length === 0
                  ? <div style={{ textAlign: "center", padding: "16px", color: COLORS.muted, fontSize: 12, fontFamily: "system-ui" }}>Check off a task anywhere in the app — it'll appear here automatically.</div>
                  : todayWins.notes.map((n, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "7px 0", borderBottom: i < todayWins.notes.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                      <span style={{ color: COLORS.teal, fontSize: 13, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, fontFamily: "Georgia, serif", color: COLORS.text }}>{n}</span>
                    </div>
                  ))
                }
              </div>
            </div>
            <div style={{ background: COLORS.white, borderRadius: 14, border: `1.5px solid ${COLORS.border}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 15px", borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 13, fontWeight: "bold", color: COLORS.text }}>📅 Weekly Log</div>
              </div>
              <div style={{ padding: "8px 15px" }}>
                {Object.entries(state.wins).filter(([k]) => k >= getWeekKey()).length === 0
                  ? <div style={{ padding: "20px", textAlign: "center", color: COLORS.muted, fontSize: 12, fontFamily: "system-ui" }}>Your wins will appear here as you check things off.</div>
                  : Object.entries(state.wins).filter(([k]) => k >= getWeekKey()).sort(([a], [b]) => b.localeCompare(a)).map(([date, data]) => (
                    <div key={date} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontFamily: "system-ui", fontWeight: 700, color: COLORS.muted, letterSpacing: 1, marginBottom: 5, textTransform: "uppercase" }}>
                        {new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {data.count} {data.count === 1 ? "win" : "wins"}
                      </div>
                      {data.notes.map((n, i) => (
                        <div key={i} style={{ fontSize: 12, fontFamily: "Georgia, serif", color: COLORS.text, padding: "3px 0 3px 12px", borderLeft: `2px solid ${COLORS.tealBorder}`, marginBottom: 3 }}>{n}</div>
                      ))}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COACH */}
        {tab === 3 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: "bold", color: COLORS.text }}>🤖 AI Coach</div>
                <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "system-ui", marginTop: 1 }}>Personalized recommendations based on your real data and patterns.</div>
              </div>
              <button onClick={() => fetchCoach(state)} disabled={coachLoading} style={{ background: coachLoading ? "#DDD" : COLORS.navy, color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", cursor: coachLoading ? "default" : "pointer", fontSize: 11, fontFamily: "system-ui", fontWeight: 600 }}>
                {coachLoading ? "Thinking..." : "↻ Refresh"}
              </button>
            </div>
            {coachError && <div style={{ background: "#FFF5F2", borderRadius: 12, padding: "12px 14px", border: "1px solid #E07B5A", marginBottom: 14, fontSize: 12, color: "#B05030", fontFamily: "system-ui" }}>{coachError}</div>}
            {coachLoading && (
              <div style={{ background: COLORS.white, borderRadius: 14, border: `1.5px solid ${COLORS.border}`, padding: "30px", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>🤖</div>
                <div style={{ fontSize: 13, color: COLORS.muted, fontFamily: "system-ui" }}>Analyzing your priorities...</div>
              </div>
            )}
            {!coachLoading && state.coachFull && (
              <div style={{ background: COLORS.white, borderRadius: 14, border: `1.5px solid ${COLORS.navyBorder}`, overflow: "hidden", marginBottom: 14 }}>
                <div style={{ background: COLORS.navyLight, padding: "12px 15px", borderBottom: `1px solid ${COLORS.navyBorder}` }}>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: COLORS.navy }}>This Week's Recommendations</div>
                  {state.lastCoachFetch && <div style={{ fontSize: 10, color: COLORS.muted, fontFamily: "system-ui", marginTop: 1 }}>Updated {new Date(state.lastCoachFetch).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</div>}
                </div>
                <div style={{ padding: "12px 15px" }}>
                  {state.coachFull.map((rec, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < state.coachFull.length - 1 ? "1px solid #F5F5F5" : "none", alignItems: "flex-start" }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS.navyLight, border: `2px solid ${COLORS.navyBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: "bold", color: COLORS.navy, fontFamily: "system-ui" }}>{i + 1}</div>
                      <div style={{ fontSize: 13, fontFamily: "Georgia, serif", color: COLORS.text, lineHeight: 1.6 }}>{rec}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ background: COLORS.goldLight, borderRadius: 14, padding: "13px 15px", border: `1.5px solid ${COLORS.goldBorder}` }}>
              <div style={{ fontSize: 11, fontWeight: "bold", color: COLORS.gold, marginBottom: 5 }}>💡 How this works</div>
              <div style={{ fontSize: 12, color: "#7A5C30", fontFamily: "system-ui", lineHeight: 1.7 }}>
                Looks at your A-task progress, overdue items, workbook steps, and wins — then gives specific honest recommendations tied to your $1,000/month goal. Auto-refreshes every 6 hours. Hit Refresh anytime.
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: IDEAS */}
        {tab === 4 && (
          <div>
            <div style={{ background: COLORS.white, borderRadius: 14, border: `1.5px solid ${COLORS.border}`, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ background: "#F9F9F9", padding: "12px 15px", borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 14, fontWeight: "bold", color: COLORS.text }}>🅿️ Idea Parking Lot</div>
                <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "system-ui", marginTop: 1 }}>Capture it. Don't act on it. Review monthly with your husband.</div>
              </div>
              <div style={{ padding: "12px 15px" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <input type="text" value={newIdea} onChange={e => setNewIdea(e.target.value)} onKeyDown={e => e.key === "Enter" && (state.parkedIdeas && update({ parkedIdeas: [{ id: mkId(), text: newIdea.trim(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) }, ...state.parkedIdeas] }), setNewIdea(""))} placeholder="New idea — park it, don't chase it..." style={{ flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "8px 11px", fontSize: 13, fontFamily: "Georgia, serif", outline: "none", color: COLORS.text }} />
                  <button onClick={() => { if (!newIdea.trim()) return; update({ parkedIdeas: [{ id: mkId(), text: newIdea.trim(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) }, ...state.parkedIdeas] }); setNewIdea(""); }} style={{ background: COLORS.gold, color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontFamily: "system-ui", fontWeight: 600 }}>Park it</button>
                </div>
                {state.parkedIdeas.length === 0
                  ? <div style={{ textAlign: "center", padding: "24px", color: COLORS.muted, fontSize: 12, fontFamily: "system-ui" }}>Next time a new idea hits — put it here, not on your plate.</div>
                  : state.parkedIdeas.map(idea => (
                    <div key={idea.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: "#FAFAFA", borderRadius: 10, border: `1px solid ${COLORS.border}`, marginBottom: 7 }}>
                      <span style={{ fontSize: 15, flexShrink: 0 }}>💡</span>
                      <span style={{ flex: 1, fontSize: 13, fontFamily: "Georgia, serif", color: COLORS.text }}>{idea.text}</span>
                      <span style={{ fontSize: 10, color: COLORS.muted, fontFamily: "system-ui", flexShrink: 0 }}>{idea.date}</span>
                      <button onClick={() => update({ parkedIdeas: state.parkedIdeas.filter(i => i.id !== idea.id) })} style={{ background: "none", border: "none", color: "#CCC", cursor: "pointer", fontSize: 15 }}>×</button>
                    </div>
                  ))
                }
              </div>
            </div>
            <div style={{ background: COLORS.goldLight, borderRadius: 14, padding: "13px 15px", border: `1.5px solid ${COLORS.goldBorder}` }}>
              <div style={{ fontSize: 11, fontWeight: "bold", color: COLORS.gold, marginBottom: 5 }}>📅 Monthly Review (you + your husband)</div>
              <div style={{ fontSize: 12, color: "#7A5C30", fontFamily: "system-ui", lineHeight: 1.8 }}>
                1. Still excited about this after a month?<br />
                2. Does it serve the $1,000/month goal better than the workbook right now?<br />
                3. If no to both — delete it.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
