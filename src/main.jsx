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
  Mail,
  BookOpen,
  LayoutDashboard,
  Send,
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
const blogIdeas = [
  { title: "Fleet downtime checklist for Saskatoon businesses", status: "Needs approval", type: "Idea" },
  { title: "When a work van will not start on a cold morning", status: "Draft ready", type: "Blog" },
  { title: "Mobile maintenance vs. sending every vehicle to a shop", status: "Draft ready", type: "Blog" },
  { title: "How to reduce repeat battery failures across a fleet", status: "Needs approval", type: "Idea" },
  { title: "A practical pre-trip inspection for local delivery fleets", status: "Published", type: "Blog" },
];
const outreachRecords = [
  { id: "5b84bdd8324d4471896e3a94", company: "Custom Courier Co. Ltd", contact: "Company prospect · customcourier.com", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent" },
  { id: "556cfced73696411f4bd7300", company: "Q-Line Trucking", contact: "Company prospect · qlinetrucking.com", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent" },
  { id: "55edfec2f3e5bb16320001b7", company: "Ghost Transportation Services", contact: "Company prospect · ghosttrans.com", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent" },
  { id: "6049b954df6ac00001116d48", company: "Aero Delivery and Storage", contact: "Company prospect · aerodelivery.ca", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent" },
  { id: "5e57a755f017340001612c5c", company: "SST Trucking", contact: "Company prospect · ssttrucking.com", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent" },
  { id: "5e55d8e871bea9000159a119", company: "Northern Resource Trucking", contact: "Company prospect · nrtlp.com", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent" },
  { id: "5e56750f18a6380001d02775", company: "Hawk Logistics Ltd.", contact: "Company prospect · hawklogistics.ca", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent" },
  { id: "556973db73696425c4fa2f00", company: "Wright Construction Western Inc.", contact: "Company prospect · wrightconstruction.ca", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent" },
  { id: "apollo-we-do-all", company: "We-Do-All Contractors", contact: "Apollo prospect · Saskatoon", subject: "Keep your work vehicles moving", status: "Draft", lastActivity: "Not sent" },
  { id: "apollo-sawyers-tree", company: "Sawyer’s Tree Services", contact: "Apollo prospect · Saskatoon", subject: "Keep your crew moving between jobs", status: "Draft", lastActivity: "Not sent" },
  { id: "apollo-pace-it", company: "Pace-It Courier", contact: "Apollo prospect · Saskatoon", subject: "A simpler way to keep your delivery vans moving", status: "Draft", lastActivity: "Not sent" },
  { id: "apollo-runnr", company: "RUNNR", contact: "Apollo prospect · Saskatoon", subject: "Mobile support for your delivery vehicles", status: "Draft", lastActivity: "Not sent" },
  { id: "apollo-peters", company: "Peters Excavating", contact: "Apollo prospect · Saskatoon", subject: "Keep your equipment and trucks working", status: "Draft", lastActivity: "Not sent" },
  { id: "apollo-dutch-growers", company: "Dutch Growers", contact: "Apollo prospect · Saskatoon", subject: "Keep your service vehicles ready for the season", status: "Draft", lastActivity: "Not sent" },
];
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
    [activeView, setActiveView] = useState("overview"),
    [pillar, setPillar] = useState("All"),
    [platform, setPlatform] = useState("All"),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState({}),
    [agentOpen, setAgentOpen] = useState(false),
    [selectedIds, setSelectedIds] = useState([]),
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
  const [generationStatus, setGenerationStatus] = useState("Using the saved queue");
  useEffect(() => {
    fetch("/data/daily-posts.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length === 5) {
          setDailyPosts(data);
          setGenerationStatus(data[0]?.date ? `Generated ${data[0].date}` : "Daily queue loaded");
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
  const draftCount = activePosts.filter((p) => (status[p.id] || p.status) === "Draft").length;
  const renderWorkspace = () => {
    if (activeView === "overview") return <Overview activePosts={activePosts} draftCount={draftCount} />;
    if (activeView === "blogs") return <BlogWorkspace />;
    if (activeView === "outreach") return <OutreachWorkspace />;
    return <SocialWorkspace />;
  };
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
  const selectedVisible = filtered.filter((p) => selectedIds.includes(p.id));
  const toggleSelected = (id) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  const selectAllVisible = () => setSelectedIds((ids) => ids.length === filtered.length ? [] : filtered.map((p) => p.id));
  const approveSelected = () => setStatus((current) => ({ ...current, ...Object.fromEntries(selectedVisible.map((p) => [p.id, "Approved"])) }));
  const approveAndScheduleSelected = () => {
    approveSelected();
    selectedVisible.forEach((p) => sendToGhl(p));
  };
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
            <button className={activeView === "social" ? "active" : ""} onClick={() => setActiveView("social")}>
            <CalendarDays size={18} />
            Content desk
          </button>
            <button className={activeView === "blogs" ? "active" : ""} onClick={() => setActiveView("blogs")}>
              <Sparkles size={18} />
              Blog ideas <b>{blogIdeas.filter((x) => x.status === "Needs approval").length}</b>
            </button>
            <button className={activeView === "blogs" ? "active" : ""} onClick={() => setActiveView("blogs")}>
              <CheckCircle2 size={18} />
              Blog approvals <b>{blogIdeas.filter((x) => x.status !== "Published").length}</b>
            </button>
            <button className={activeView === "outreach" ? "active" : ""} onClick={() => setActiveView("outreach")}>
              <Mail size={18} />
              Email outreach <b>{outreachRecords.filter((x) => x.status === "Draft").length}</b>
            </button>
            <button className={activeView === "overview" ? "active" : ""} onClick={() => setActiveView("overview")}>
              <LayoutDashboard size={18} />
              Overview
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
        {activeView !== "social" && renderWorkspace()}
        {activeView === "social" && <SocialWorkspace>
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
        <p className="generation-status" role="status">{generationStatus} · Images included · Approval required before GHL scheduling</p>
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
        <div className="bulk-actions">
          <label><input type="checkbox" checked={filtered.length > 0 && selectedVisible.length === filtered.length} onChange={selectAllVisible} /> Select all for {days[selectedDay]}</label>
          <span>{selectedVisible.length} selected</span>
          <button className="approve-btn" disabled={!selectedVisible.length} onClick={approveAndScheduleSelected}>Approve &amp; schedule in GHL</button>
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
              selected={selectedIds.includes(p.id)}
              toggleSelected={toggleSelected}
            />
          ))}
          {!filtered.length && (
            <div className="empty">No posts match those filters.</div>
          )}
        </div>
        </SocialWorkspace>}
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
function SocialWorkspace({ children }) { return <>{children}</>; }

function WorkspaceHeader({ eyebrow, title, sub }) {
  return <header><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="sub">{sub}</p></div></header>;
}

function Overview({ activePosts, draftCount }) {
  return <><WorkspaceHeader eyebrow="FIXAUR OPERATIONS" title="One view of the work." sub="Social, blog and outreach activity in one approval-first workspace." />
    <section className="stats">
      <Stat label="Social" value={String(activePosts.length)} detail="posts in queue" icon={<Sparkles />} />
      <Stat label="Blogs" value="5" detail="ideas and drafts" icon={<BookOpen />} />
      <Stat label="Email" value="0" detail="sent without approval" icon={<Mail />} />
      <Stat label="Needs review" value={String(draftCount + 2)} detail="items awaiting sign-off" icon={<CheckCircle2 />} />
    </section>
    <div className="workspace-grid"><div className="workspace-card"><p className="eyebrow">TODAY</p><h2>Approval queue</h2><p>Social drafts, blog drafts and outreach messages stay in review until you approve them.</p><span className="status-chip">Approval guardrail on</span></div><div className="workspace-card"><p className="eyebrow">OUTREACH</p><h2>Fleet prospecting</h2><p>Use public business contact details, keep a clear source, and track every approved message and reply.</p><span className="status-chip">Draft-only mode</span></div></div>
  </>;
}

function BlogWorkspace() {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem("fixaur-blog-drafts")) || blogIdeas.map((x, i) => ({ ...x, id: i + 1, body: `Direct answer: ${x.title}.\n\nAdd the useful Saskatoon-specific guidance here before approval.` })); } catch { return blogIdeas; } });
  const [selected, setSelected] = useState(items[0]?.id);
  useEffect(() => { fetch("/api/state?key=blog").then((r) => r.ok ? r.json() : null).then((data) => { if (Array.isArray(data?.value)) { setItems(data.value); setSelected(data.value[0]?.id); } }).catch(() => {}); }, []);
  const current = items.find((x) => x.id === selected) || items[0];
  const update = (field, value) => setItems((all) => { const next = all.map((x) => x.id === selected ? { ...x, [field]: value } : x); localStorage.setItem("fixaur-blog-drafts", JSON.stringify(next)); fetch("/api/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "blog", value: next }) }).catch(() => {}); return next; });
  return <><WorkspaceHeader eyebrow="BLOG OPERATIONS" title="Ideas and approvals, together." sub="Edit daily drafts, approve the ones you want, and keep the review state visible." /><div className="workspace-card"><div className="section-head"><div><p className="eyebrow">BLOG PIPELINE</p><h2>Ideas & approvals</h2></div><span className="status-chip">{items.filter((x) => x.status !== "Published").length} awaiting review</span></div><div className="editor-layout"><div className="simple-list">{items.map((idea) => <button className={idea.id === selected ? "list-row selected-row" : "list-row"} key={idea.id} onClick={() => setSelected(idea.id)}><div><strong>{idea.title}</strong><small>{idea.type} · {idea.status}</small></div><span className={idea.status === "Published" ? "approved" : "draft-label"}>{idea.status}</span></button>)}</div>{current && <div className="editor-panel"><label>Title<input value={current.title} onChange={(e) => update("title", e.target.value)} /></label><label>Draft body<textarea rows="10" value={current.body} onChange={(e) => update("body", e.target.value)} /></label><div className="editor-actions"><button className="approve-btn" onClick={() => update("status", current.status === "Approved" ? "Needs approval" : "Approved")}>{current.status === "Approved" ? "Move to review" : "Approve draft"}</button><span className="saved-note">Saved to Fixaur database</span></div></div>}</div></div></>;
}

function OutreachWorkspace() {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem("fixaur-outreach")) || outreachRecords.map((x) => ({ ...x, email: "", body: "Hi,\n\nWe’re Fixaur, a mobile mechanic serving Saskatoon. We help local teams keep work vehicles moving without sending every van to a shop.\n\nWould a quick conversation about fleet support be useful?\n\n— Fixaur" })); } catch { return outreachRecords; } });
  const [selected, setSelected] = useState(items[0]?.id);
  const [notice, setNotice] = useState("");
  useEffect(() => { fetch("/api/state?key=outreach").then((r) => r.ok ? r.json() : null).then((data) => { if (Array.isArray(data?.value)) { setItems(data.value); setSelected(data.value[0]?.id); } }).catch(() => {}); }, []);
  const current = items.find((x) => x.id === selected) || items[0];
  const update = (field, value) => setItems((all) => { const next = all.map((x) => x.id === selected ? { ...x, [field]: value } : x); localStorage.setItem("fixaur-outreach", JSON.stringify(next)); fetch("/api/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "outreach", value: next }) }).catch(() => {}); return next; });
  const send = async () => { if (!current?.email || !current.email.includes("@")) return setNotice("Add a valid business email before sending."); setNotice("Sending…"); const res = await fetch("/api/outreach/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: current.email, subject: current.subject, text: current.body, sourceUrl: `https://${current.contact.split("·").pop().trim()}`, approved: current.status === "Approved" }) }); const data = await res.json().catch(() => ({})); if (!res.ok) return setNotice(data.error || "Resend rejected the message."); setItems((all) => { const next = all.map((x) => x.id === selected ? { ...x, status: "Sent", resendId: data.id, lastActivity: data.sentAt } : x); localStorage.setItem("fixaur-outreach", JSON.stringify(next)); return next; }); setNotice("Sent through Resend. Reply tracking requires the Resend webhook connection."); };
  return <><WorkspaceHeader eyebrow="EMAIL OUTREACH" title="Fleet outreach, with a paper trail." sub="Edit each message, verify the recipient and source, then approve before Resend sends." /><div className="workspace-card"><div className="section-head"><div><p className="eyebrow">RESEND TRACKER</p><h2>Sent, replied and pending</h2></div><span className="status-chip">{items.filter((x) => x.status === "Sent").length} sent</span></div><div className="outreach-note">Apollo supplied company prospects, not contact emails. Add a verified business email; no addresses are guessed or scraped.</div><div className="editor-layout"><div className="simple-list">{items.map((record) => <button className={record.id === selected ? "list-row selected-row" : "list-row"} key={record.id} onClick={() => setSelected(record.id)}><div><strong>{record.company}</strong><small>{record.contact} · {record.status}</small></div><span className={record.status === "Sent" ? "approved" : "draft-label"}>{record.status}</span></button>)}</div>{current && <div className="editor-panel"><label>Business email<input type="email" value={current.email} placeholder="fleet@company.ca" onChange={(e) => update("email", e.target.value)} /></label><label>Subject<input value={current.subject} onChange={(e) => update("subject", e.target.value)} /></label><label>Message<textarea rows="9" value={current.body} onChange={(e) => update("body", e.target.value)} /></label><div className="editor-actions"><button className="approve-btn" onClick={() => update("status", current.status === "Approved" ? "Draft" : "Approved")}>{current.status === "Approved" ? "Move to draft" : "Approve email"}</button><button className="primary" disabled={current.status !== "Approved" || current.status === "Sent"} onClick={send}><Send size={15} /> Send through Resend</button></div>{notice && <p className="saved-note">{notice}</p>}</div>}</div></div></>;
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
function PostCard({ p, state, toggle, sendToGhl, ghlState, selected, toggleSelected }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(p.copy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <article className="post">
      <div className="select-post"><input type="checkbox" aria-label={`Select ${p.title}`} checked={selected} onChange={() => toggleSelected(p.id)} /></div>
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
