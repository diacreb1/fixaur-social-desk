import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  Filter,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import "./styles.css";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const pillars = [
  ["Educational", "teal"],
  ["Meme", "orange"],
  ["Entertaining", "purple"],
  ["Serious", "red"],
  ["Competitive", "blue"],
];
const seeds = [
  [
    "Educational",
    "Battery tip",
    "A slow crank is your car asking for attention. Check the battery, terminals and charging system before the next cold morning. Save this for later.",
    "/assets/generated/battery-check.png",
  ],
  [
    "Meme",
    "The shop waiting room",
    "You: “It should only take an hour.”\nThe shop: “We’ll call you.”\nYour afternoon: gone.\nFixaur comes to the driveway when the job fits on-site.",
    "01-launch.png",
  ],
  [
    "Entertaining",
    "Mechanic translator",
    "“It makes a weird noise” is a valid starting point. Tell us when it happens, what it sounds like and whether the car feels different. We’ll start there.",
    "05-diagnostics.png",
  ],
  [
    "Serious",
    "Brake warning",
    "Grinding, pulling or a soft pedal deserves attention. Park somewhere safe and get the problem assessed before a small issue becomes a safety issue.",
    "/assets/generated/brake-inspection.png",
  ],
  [
    "Competitive",
    "Skip the tow",
    "A dead battery does not always need a tow truck and a shop appointment. If your vehicle is safely accessible, Fixaur can come to you for mobile assessment and battery service.",
    "/assets/generated/mechanic-driveway.png",
  ],
];
const times = ["07:30", "10:15", "12:45", "16:30", "19:00"];
const posts = days.flatMap((day, di) =>
  seeds.map((s, si) => ({
    id: di * 5 + si + 1,
    day,
    dayIndex: di,
    time: times[si],
    pillar: s[0],
    title: s[1],
    copy:
      di === 0
        ? s[2]
        : s[2].replace(
            "next cold morning",
            di % 2 ? "your next commute" : "the next cold morning",
          ),
    asset: s[3],
    status: di === 0 && si < 2 ? "Approved" : "Draft",
    platforms: ["Facebook", "Instagram", "Google Business"],
  })),
);

function App() {
  const [selectedDay, setSelectedDay] = useState(
    (new Date().getDay() + 6) % 7,
  ),
    [pillar, setPillar] = useState("All"),
    [platform, setPlatform] = useState("All"),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState({}),
    [agentOpen, setAgentOpen] = useState(false),
    [messages, setMessages] = useState([
      {
        role: "agent",
        text: "I can help shape the queue. Try “approve today”, “show competitive posts”, or ask for a caption idea.",
      },
    ]),
    [agentInput, setAgentInput] = useState(""),
    [ghlState, setGhlState] = useState({});
  const [ghlAccounts, setGhlAccounts] = useState([]);
  const [dailyPosts, setDailyPosts] = useState(null);
  useEffect(() => {
    fetch("/data/daily-posts.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length === 5) {
          setDailyPosts(data);
          if (data[0]?.date) {
            setSelectedDay(
              (new Date(`${data[0].date}T12:00:00`).getDay() + 6) % 7,
            );
          }
        }
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    fetch("/api/ghl/accounts", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const accounts =
          data?.accounts ??
          data?.data?.accounts ??
          data?.results?.accounts ??
          data?.data;
        if (Array.isArray(accounts)) {
          setGhlAccounts(accounts.map((account) => account.id ?? account._id).filter(Boolean));
        }
      })
      .catch(() => {});
  }, []);
  const activePosts = (dailyPosts || posts).map((p) => ({
    ...p,
    dayIndex: p.dayIndex ?? (p.date ? (new Date(`${p.date}T12:00:00`).getDay() + 6) % 7 : 0),
    day: p.day ?? days[p.dayIndex ?? (p.date ? (new Date(`${p.date}T12:00:00`).getDay() + 6) % 7 : 0)],
    copy: p.copy ?? p.caption,
    asset: p.asset ?? p.image,
  }));
  const filtered = useMemo(
    () =>
      activePosts.filter(
        (p) =>
          p.dayIndex === selectedDay &&
          (pillar === "All" || p.pillar === pillar) &&
          (platform === "All" || p.platforms.includes(platform)) &&
          (p.title + " " + p.copy).toLowerCase().includes(query.toLowerCase()),
      ),
    [activePosts, selectedDay, pillar, platform, query],
  );
  const toggle = (id) =>
    setStatus((x) => ({
      ...x,
      [id]: x[id] === "Approved" ? "Draft" : "Approved",
    }));
  const sendToGhl = async (p) => {
    if (!ghlAccounts.length) {
      setGhlState((x) => ({ ...x, [p.id]: "Connect GHL accounts first" }));
      return;
    }
    setGhlState((x) => ({ ...x, [p.id]: "Sending…" }));
    try {
      const res = await fetch("/api/ghl/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: p.copy,
          accountIds: ghlAccounts,
          mediaUrl: new URL(p.asset, window.location.origin).toString(),
          altText: `${p.title}: ${p.pillar} social post for Fixaur Mobile Mechanic.`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setGhlState((x) => ({
        ...x,
        [p.id]: res.ok ? "Sent to GHL" : data.error || "GHL failed",
      }));
    } catch {
      setGhlState((x) => ({ ...x, [p.id]: "GHL unavailable" }));
    }
  };
  const sendAgent = async (e) => {
    e?.preventDefault();
    const text = agentInput.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setAgentInput("");
    const lower = text.toLowerCase();
    let reply =
      "I can help with captions, filters, and approvals. Try “approve today” or “show competitive posts”.";
    if (lower.includes("approve")) {
      const next = { ...status };
      activePosts
        .filter((p) => p.dayIndex === selectedDay)
        .forEach((p) => (next[p.id] = "Approved"));
      setStatus(next);
      reply = `Approved the ${days[selectedDay]} queue. Nothing publishes without a separate connector action.`;
    } else if (lower.includes("competitive")) {
      setPillar("Competitive");
      reply =
        "Showing the competitive posts. They focus on convenience without making claims about other businesses.";
    } else if (lower.includes("educational")) {
      setPillar("Educational");
      reply = "Showing the educational posts for practical car-care content.";
    } else {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            context: {
              day: days[selectedDay],
              posts: filtered.map((p) => p.title),
            },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.reply;
        }
      } catch {
        reply =
          "The live AI connection is not configured yet, but the queue controls still work locally.";
      }
    }
    setMessages((m) => [...m, { role: "agent", text: reply }]);
  };
  return (
    <div className="app">
      <aside>
        <div className="logo">
          <span>F</span>
          <div>
            FIXAUR<small>Mobile mechanic</small>
          </div>
        </div>
        <nav>
          <button className="active">
            <CalendarDays size={18} />
            Content desk
          </button>
          <button>
            <Sparkles size={18} />
            Ideas lab
          </button>
          <button>
            <CheckCircle2 size={18} />
            Approvals <b>{activePosts.filter((p) => (status[p.id] || p.status) === "Draft").length}</b>
          </button>
          <button>
            <Settings size={18} />
            Brand settings
          </button>
        </nav>
        <div className="side-note">
          <div className="note-dot" />
          <strong>Publishing guardrail</strong>
          <p>
            Posts remain drafts until approval, then can be sent to GHL for
            scheduling.
          </p>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <p className="eyebrow">SOCIAL OPERATIONS</p>
            <h1>Good content. On your schedule.</h1>
            <p className="sub">
              Five useful, human posts a day for Saskatoon, Warman and
              Martensville.
            </p>
          </div>
          <button className="primary" onClick={() => setAgentOpen(true)}>
            <Sparkles size={17} />
            Talk to Fixaur AI
          </button>
        </header>
        <section className="stats">
          <Stat
            label="Today"
            value={String(activePosts.length)}
            detail="posts prepared"
            icon={<CalendarDays />}
          />
          <Stat
            label="Ready to review"
            value={String(
              activePosts.filter((p) => (status[p.id] || p.status) === "Draft")
                .length,
            )}
            detail="need your sign-off"
            icon={<Clock3 />}
          />
          <Stat
            label="Platforms"
            value="3"
            detail="Facebook · Instagram · GBP"
            icon={<MapPin />}
          />
          <Stat
            label="Content mix"
            value="5"
            detail="pillars per day"
            icon={<Sparkles />}
          />
        </section>
        <div className="toolbar">
          <div className="days">
            {days.map((d, i) => (
              <button
                className={selectedDay === i ? "day active-day" : "day"}
                onClick={() => setSelectedDay(i)}
                key={d}
              >
                <span>{d.slice(0, 3)}</span>
                <b>{i + 1}</b>
              </button>
            ))}
          </div>
          <div className="filters">
            <div className="search">
              <Search size={16} />
              <input
                placeholder="Search posts"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select value={pillar} onChange={(e) => setPillar(e.target.value)}>
              <option>All</option>
              {pillars.map((p) => (
                <option key={p[0]}>{p[0]}</option>
              ))}
            </select>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option>All</option>
              <option>Facebook</option>
              <option>Instagram</option>
              <option>Google Business</option>
            </select>
            <Filter size={17} className="muted" />
          </div>
        </div>
        <div className="section-head">
          <div>
            <p className="eyebrow">
              {days[selectedDay].toUpperCase()} · {filtered.length} POSTS
            </p>
            <h2>Publishing queue</h2>
          </div>
          <div className="legend">
            <span>
              <i className="live" />
              Approved
            </span>
            <span>
              <i className="draft" />
              Draft
            </span>
          </div>
        </div>
        <div className="queue">
          {filtered.map((p) => (
            <PostCard
              key={p.id}
              p={p}
              state={status[p.id] || p.status}
              toggle={toggle}
              sendToGhl={sendToGhl}
              ghlState={ghlState[p.id]}
            />
          ))}
          {!filtered.length && (
            <div className="empty">No posts match those filters.</div>
          )}
        </div>
      </main>
      {agentOpen && (
        <section className="agent-panel">
          <div className="agent-head">
            <div>
              <p className="eyebrow">FIXAUR AI</p>
              <h2>Content partner</h2>
            </div>
            <button onClick={() => setAgentOpen(false)}>×</button>
          </div>
          <div className="agent-messages">
            {messages.map((m, i) => (
              <div key={i} className={"message " + m.role}>
                {m.text}
              </div>
            ))}
          </div>
          <form onSubmit={sendAgent} className="agent-form">
            <input
              autoFocus
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              placeholder="Ask for a change…"
            />
            <button className="primary">Send</button>
          </form>
          <p className="agent-foot">
            Local controls work now. Live replies use MiniMax. Approved posts
            can be sent to GHL after its private integration token is
            configured.
          </p>
        </section>
      )}
      <button className="agent-fab" onClick={() => setAgentOpen(!agentOpen)}>
        <Sparkles size={18} />
        {agentOpen ? "Close" : "Fixaur AI"}
      </button>
    </div>
  );
}
function Stat({ label, value, detail, icon }) {
  return (
    <div className="stat">
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}
function PostCard({ p, state, toggle, sendToGhl, ghlState }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(p.copy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <article className="post">
      <div className="time">
        <strong>{p.time}</strong>
        <small>CDT</small>
      </div>
      <div className="thumb">
        <img src={p.asset} alt={`${p.title} social post`} loading="lazy" />
      </div>
      <div className="post-body">
        <div className="post-top">
          <span className={"pill " + pillars.find((x) => x[0] === p.pillar)[1]}>
            {p.pillar}
          </span>
          <span className={state === "Approved" ? "approved" : "draft-label"}>
            {state === "Approved" ? (
              <CheckCircle2 size={14} />
            ) : (
              <Clock3 size={14} />
            )}{" "}
            {state}
          </span>
        </div>
        <h3>{p.title}</h3>
        <p className="copy">{p.copy}</p>
        <div className="platforms">
          <span className="platform-mark">f</span>
          <span className="platform-mark">◎</span>
          <span className="gbp">G</span>
          <span>Facebook · Instagram · Google Business</span>
        </div>
      </div>
      <div className="actions">
        <button title="Copy caption" aria-label="Copy caption" onClick={copy}>
          {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}
        </button>
        <button title="More" aria-label={`More options for ${p.title}`}>
          <MoreHorizontal size={18} />
        </button>
        <button
          className={
            state === "Approved" ? "approve-btn approved-btn" : "approve-btn"
          }
          onClick={() => toggle(p.id)}
        >
          {state === "Approved" ? "Move to draft" : "Approve"}
        </button>
        <button
          className="approve-btn"
          disabled={state !== "Approved" || ghlState === "Sending…"}
          onClick={() => sendToGhl(p)}
        >
          {ghlState || "Send to GHL"}
        </button>
      </div>
    </article>
  );
}
createRoot(document.getElementById("root")).render(<App />);
