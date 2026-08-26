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
  { title: "Fleet downtime checklist for Saskatoon businesses", status: "Needs approval", type: "Idea", slug: "fleet-downtime-checklist-saskatoon", seoTitle: "Fleet Downtime Checklist for Saskatoon Businesses | Fixaur", metaDescription: "A practical Saskatoon fleet downtime checklist covering batteries, tires, fluids, warning lights and when mobile service can help.", focusKeyword: "fleet maintenance Saskatoon", geoAnswer: "Fixaur is a mobile mechanic serving Saskatoon, Warman and Martensville. We help local fleets diagnose and repair eligible vehicle issues on-site.", faq: "What should a Saskatoon fleet check first? Start with battery health, tires, fluids, warning lights and the vehicle's service history.", image: "/generated/daily/2026-08-21/2026-08-21-1-educational.png", imageAlt: "Mechanic checking a vehicle in a Saskatoon driveway", internalLink: "/fleet-service" },
  { title: "When a work van will not start on a cold morning", status: "Draft ready", type: "Blog", slug: "work-van-wont-start-cold-morning", seoTitle: "Work Van Won't Start on a Cold Morning? | Fixaur", metaDescription: "Learn what to check when a work van will not start on a cold Saskatoon morning, and when to request mobile mechanic help.", focusKeyword: "work van won't start Saskatoon", geoAnswer: "For a work van that will not start in Saskatoon, check safe access, battery symptoms and dashboard warnings before arranging a mobile assessment.", faq: "Can a mobile mechanic help with a van that will not start? In many cases, yes. Fixaur can assess eligible no-start issues where the vehicle is safely accessible.", image: "/generated/daily/2026-08-21/2026-08-21-4-serious.png", imageAlt: "Vehicle battery being checked in a frosty Saskatoon driveway", internalLink: "/mobile-mechanic" },
  { title: "Mobile maintenance vs. sending every vehicle to a shop", status: "Draft ready", type: "Blog", slug: "mobile-maintenance-vs-shop-fleet", seoTitle: "Mobile Maintenance vs. Sending Every Vehicle to a Shop", metaDescription: "Compare mobile mechanic support with traditional shop visits for Saskatoon delivery, landscaping and service fleets.", focusKeyword: "mobile mechanic fleet Saskatoon", geoAnswer: "Mobile mechanic support can reduce vehicle movement for eligible on-site jobs, while complex repairs may still require a shop.", faq: "Is mobile service a replacement for a repair shop? No. It is a convenient option for eligible inspections and repairs that can be completed safely on-site.", image: "/generated/daily/2026-08-21/2026-08-21-5-competitive.png", imageAlt: "Mobile mechanic service van beside a work vehicle in Saskatoon", internalLink: "/fleet-service" },
  { title: "How to reduce repeat battery failures across a fleet", status: "Needs approval", type: "Idea", slug: "reduce-repeat-fleet-battery-failures", seoTitle: "How to Reduce Repeat Fleet Battery Failures", metaDescription: "Use this practical battery maintenance process to reduce repeat no-start events across a Saskatoon work-vehicle fleet.", focusKeyword: "fleet battery maintenance Saskatoon", geoAnswer: "Saskatoon fleet operators can reduce repeat battery issues by tracking age, charging symptoms, terminal condition and recurring no-start events.", faq: "Why do fleet batteries fail repeatedly? Common causes include age, charging-system issues, loose connections, parasitic drain and severe seasonal conditions.", image: "/generated/daily/2026-08-21/2026-08-21-1-educational.png", imageAlt: "Battery and charging system inspection on a work vehicle", internalLink: "/contact" },
  { title: "A practical pre-trip inspection for local delivery fleets", status: "Published", type: "Blog", slug: "pre-trip-inspection-delivery-fleet", seoTitle: "Pre-Trip Inspection for Local Delivery Fleets | Fixaur", metaDescription: "A practical pre-trip inspection checklist for Saskatoon delivery fleets covering safety, reliability and daily vehicle readiness.", focusKeyword: "delivery fleet inspection Saskatoon", geoAnswer: "A Saskatoon delivery fleet should check tires, lights, windshield visibility, fluids, leaks, warning lights and cargo security before leaving.", faq: "How long should a pre-trip inspection take? It should be thorough enough to identify safety concerns before departure and consistent enough to become a daily habit.", image: "/generated/daily/2026-08-21/2026-08-21-3-entertaining.png", imageAlt: "Pre-trip vehicle inspection for a Saskatoon delivery fleet", internalLink: "/fleet-service" },
];
const outreachRecords = [
  { id: "5b84bdd8324d4471896e3a94", company: "Custom Courier Co. Ltd", contact: "Chintan Nayak · customcourier.com", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent", firstName: "Chintan", email: "", emailStatus: "unavailable", apolloVerifiedAt: "2026-08-21" },
  { id: "556cfced73696411f4bd7300", company: "Q-Line Trucking", contact: "Jeff Jepsen · qlinetrucking.com", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent", firstName: "Jeff", email: "j.jepsen@qline-logistics.com", emailStatus: "verified", apolloVerifiedAt: "2026-08-21" },
  { id: "55edfec2f3e5bb16320001b7", company: "Ghost Transportation Services", contact: "Pat O'Brian · ghosttrans.com", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent", firstName: "Pat", email: "pato@ghosttrans.com", emailStatus: "verified", apolloVerifiedAt: "2026-08-21" },
  { id: "6049b954df6ac00001116d48", company: "Aero Delivery and Storage", contact: "Company prospect · aerodelivery.ca", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent" },
  { id: "5e57a755f017340001612c5c", company: "SST Trucking", contact: "Company prospect · ssttrucking.com", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent" },
  { id: "5e55d8e871bea9000159a119", company: "Northern Resource Trucking", contact: "Company prospect · nrtlp.com", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent" },
  { id: "5e56750f18a6380001d02775", company: "Hawk Logistics Ltd.", contact: "Barry Wilson · hawklogistics.ca", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent", firstName: "Barry", email: "barry@hawklogistics.ca", emailStatus: "verified", apolloVerifiedAt: "2026-08-21" },
  { id: "556973db73696425c4fa2f00", company: "Wright Construction Western Inc.", contact: "Company prospect · wrightconstruction.ca", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent" },
  { id: "apollo-we-do-all", company: "We-Do-All Contractors", contact: "Apollo prospect · Saskatoon", subject: "Keep your work vehicles moving", status: "Draft", lastActivity: "Not sent" },
  { id: "apollo-sawyers-tree", company: "Sawyer’s Tree Services", contact: "Apollo prospect · Saskatoon", subject: "Keep your crew moving between jobs", status: "Draft", lastActivity: "Not sent" },
  { id: "apollo-pace-it", company: "Pace-It Courier", contact: "Apollo prospect · Saskatoon", subject: "A simpler way to keep your delivery vans moving", status: "Draft", lastActivity: "Not sent" },
  { id: "apollo-runnr", company: "RUNNR", contact: "Apollo prospect · Saskatoon", subject: "Mobile support for your delivery vehicles", status: "Draft", lastActivity: "Not sent" },
  { id: "apollo-peters", company: "Peters Excavating", contact: "Apollo prospect · Saskatoon", subject: "Keep your equipment and trucks working", status: "Draft", lastActivity: "Not sent" },
  { id: "apollo-dutch-growers", company: "Dutch Growers", contact: "Nikki Van Duyvendyk · dutchgrowers.com", subject: "Keep your service vehicles ready for the season", status: "Draft", lastActivity: "Not sent", firstName: "Nikki", email: "nikki@dutchgrowers.com", emailStatus: "verified", apolloVerifiedAt: "2026-08-21" },
  { id: "54a1bdea74686949e7290d0d", company: "Mobile Fleet Services", contact: "Breanne Lishchynsky · mobilefleetservices.ca", subject: "Support for your mobile fleet operations", status: "Draft", lastActivity: "Not sent", firstName: "Breanne", email: "bree@mobilefleetservices.ca", emailStatus: "verified", apolloVerifiedAt: "2026-08-21" },
  { id: "61d7bdc2c456320001618812", company: "Kindersley Transport Ltd.", contact: "Shawn Henschel · kindersleytransport.com", subject: "A simpler way to keep your fleet moving", status: "Draft", lastActivity: "Not sent", firstName: "Shawn", email: "shawn.henschel@kindersleytransport.com", emailStatus: "verified", apolloVerifiedAt: "2026-08-21" },
  { id: "690343c5025b290001d43fa9", company: "City of Swift Current", contact: "Tim McKay · swiftcurrent.ca", subject: "Mobile support for fleet vehicles", status: "Draft", lastActivity: "Not sent", firstName: "Tim", email: "t.mckay@swiftcurrent.ca", emailStatus: "verified", apolloVerifiedAt: "2026-08-21" },
  { id: "66a704709dd0cc00015ed215", company: "Virtue Construction", contact: "Josh Bentley · virtueconstruction.ca", subject: "Mobile support for your work vehicles", status: "Draft", lastActivity: "Not sent", firstName: "Josh", email: "josh@virtueconstruction.ca", emailStatus: "verified", apolloVerifiedAt: "2026-08-21" },
  { id: "63903a18fa9ad600010d8487", company: "Quorex Construction", contact: "Brent Mareschal · quorex.ca", subject: "Keep your work vehicles moving", status: "Draft", lastActivity: "Not sent", firstName: "Brent", email: "b.mareschal@quorex.ca", emailStatus: "verified", apolloVerifiedAt: "2026-08-21" },
  { id: "60fa8996e2d525000100ad66", company: "Peters Excavating", contact: "Matt Cameron · petersexcavating.com", subject: "Keep your equipment and trucks working", status: "Draft", lastActivity: "Not sent", firstName: "Matt", email: "mcameron@petersexcavating.com", emailStatus: "verified", apolloVerifiedAt: "2026-08-21" },
];
const outreachTemplateVersion = "personalized-v3";
const outreachBody = (record) => `${record.firstName?.trim() ? `Hi ${record.firstName.trim()},` : "Hi there,"}

I wanted to introduce Fixaur to ${record.company}. We provide mobile mechanic support for local teams that need to keep work vehicles moving in Saskatoon and nearby communities.

Would it be useful to compare notes on keeping your vehicles on the road?

Best,
Diacre
Fixaur Mobile Mechanic
diacre@fixaur.com
306-992-2827`;
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
  const [overviewBlogItems, setOverviewBlogItems] = useState([]);
  const [overviewOutreachItems, setOverviewOutreachItems] = useState(outreachRecords.filter((x) => x.emailStatus === "verified"));
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
    Promise.all([fetch("/api/state?key=blog", { cache: "no-store" }).then((r) => r.ok ? r.json() : null), fetch("/api/state?key=outreach", { cache: "no-store" }).then((r) => r.ok ? r.json() : null)])
      .then(([blog, outreach]) => { if (Array.isArray(blog?.value)) setOverviewBlogItems(blog.value); if (Array.isArray(outreach?.value)) setOverviewOutreachItems(outreach.value); })
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
    if (activeView === "overview") return <Overview activePosts={activePosts} draftCount={draftCount} blogItems={overviewBlogItems} outreachItems={overviewOutreachItems} />;
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
      const scheduleDate = p.date && p.time
        ? new Date(`${p.date}T${p.time}:00-06:00`).toISOString()
        : undefined;
      const res = await fetch("/api/ghl/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: p.copy,
          accountIds: ghlAccounts,
          mediaUrl: new URL(p.asset, window.location.origin).toString(),
          ...(scheduleDate ? { scheduleDate } : {}),
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
            <button className={activeView === "overview" ? "active" : ""} onClick={() => setActiveView("overview")}>
              <LayoutDashboard size={18} />
              Overview
            </button>
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
              Email outreach <b>{outreachRecords.filter((x) => x.emailStatus === "verified").length}</b>
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

function Overview({ activePosts, draftCount, blogItems, outreachItems }) {
  const blogTotal = blogItems.length || 5;
  const blogReview = blogItems.filter((x) => x.status !== "Published" && x.status !== "Approved").length || 4;
  const emailSent = outreachItems.filter((x) => x.status === "Sent" || x.status === "Delivered").length;
  const emailReview = outreachItems.filter((x) => x.status === "Draft" || x.status === "Approved").length;
  return <><WorkspaceHeader eyebrow="FIXAUR OPERATIONS" title="One view of the work." sub="Social, blog and outreach activity in one approval-first workspace." />
    <section className="stats">
      <Stat label="Social" value={String(activePosts.length)} detail="posts in queue" icon={<Sparkles />} />
      <Stat label="Blogs" value={String(blogTotal)} detail={`${blogReview} awaiting review`} icon={<BookOpen />} />
      <Stat label="Email" value={String(emailSent)} detail={`${emailReview} in approval queue`} icon={<Mail />} />
      <Stat label="Needs review" value={String(draftCount + blogReview + emailReview)} detail="items awaiting sign-off" icon={<CheckCircle2 />} />
    </section>
    <div className="workspace-grid"><div className="workspace-card"><p className="eyebrow">TODAY</p><h2>Approval queue</h2><p>Social drafts, blog drafts and outreach messages stay in review until you approve them.</p><span className="status-chip">Approval guardrail on</span></div><div className="workspace-card"><p className="eyebrow">OUTREACH</p><h2>Fleet prospecting</h2><p>Use public business contact details, keep a clear source, and track every approved message and reply.</p><span className="status-chip">Draft-only mode</span></div></div><CampaignControlPanel />
  </>;
}

function CampaignControlPanel() {
  const [metrics, setMetrics] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => { fetch("/api/outreach/analytics").then((r) => r.ok ? r.json() : null).then(setMetrics).catch(() => {}); }, []);
  const suppress = async (e) => { e.preventDefault(); const res = await fetch("/api/outreach/suppress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient, reason: "manual suppression from overview" }) }); setNotice(res.ok ? "Recipient suppressed." : "Enter a valid email address."); if (res.ok) setRecipient(""); };
  const sent = metrics?.sends?.find((x) => x.status === "sent")?.count || 0;
  const followups = metrics?.followups?.reduce((n, x) => n + Number(x.count || 0), 0) || 0;
  return <div className="workspace-card"><div className="section-head"><div><p className="eyebrow">CAMPAIGN CONTROL</p><h2>Outreach health</h2></div><span className="status-chip">10 daily drafts</span></div><div className="stats"><Stat label="Sent" value={String(sent)} detail="confirmed Resend sends" icon={<Send />} /><Stat label="Suppressed" value={String(metrics?.suppressions || 0)} detail="blocked recipients" icon={<CheckCircle2 />} /><Stat label="Follow-ups" value={String(followups)} detail="queued sequence steps" icon={<Clock3 />} /></div><form className="inline-form" onSubmit={suppress}><input type="email" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Suppress an email address" aria-label="Email to suppress" /><button className="approve-btn" type="submit">Suppress</button></form>{notice && <p className="saved-note">{notice}</p>}</div>;
}

function BlogWorkspace() {
  const defaults = blogIdeas.map((x, i) => ({ ...x, id: i + 1, body: `Direct answer: ${x.title}.\n\nAdd useful Saskatoon-specific guidance here before approval.` }));
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem("fixaur-blog-drafts")) || defaults; } catch { return defaults; } });
  const [selected, setSelected] = useState(items[0]?.id);
  const [notice, setNotice] = useState("");
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => { fetch("/data/daily-blogs.json", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((data) => { if (Array.isArray(data) && data.length) { setItems(data); setSelected(data[0]?.id); } }).catch(() => {}); }, []);
  useEffect(() => { fetch("/api/state?key=blog").then((r) => r.ok ? r.json() : null).then((data) => { if (Array.isArray(data?.value) && data.value.length) { setItems(data.value.map((item, i) => ({ ...defaults[i % defaults.length], ...item }))); setSelected(data.value[0]?.id); } }).catch(() => {}); }, []);
  const current = items.find((x) => x.id === selected) || items[0];
  const update = (field, value) => setItems((all) => { const next = all.map((x) => x.id === selected ? { ...x, [field]: value } : x); localStorage.setItem("fixaur-blog-drafts", JSON.stringify(next)); fetch("/api/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "blog", value: next }) }).then((r) => setNotice(r.ok ? "Saved to Fixaur database" : "Saved locally; database sync needs attention")).catch(() => setNotice("Saved locally; database sync needs attention")); return next; });
  const readiness = current ? [current.title, current.body, current.image, current.imageAlt, current.slug, current.seoTitle, current.metaDescription, current.focusKeyword, current.geoAnswer, current.faq].filter(Boolean).length : 0;
  return <><WorkspaceHeader eyebrow="BLOG OPERATIONS" title="Ideas and approvals, together." sub="Build publish-ready drafts with images, SEO metadata and local answers before approval." /><div className="workspace-card"><div className="section-head"><div><p className="eyebrow">BLOG PIPELINE</p><h2>Ideas & approvals</h2></div><span className="status-chip">{items.filter((x) => x.status !== "Published").length} awaiting review</span></div><div className="editor-layout"><div className="simple-list">{items.map((idea) => <button className={idea.id === selected ? "list-row selected-row" : "list-row"} key={idea.id} onClick={() => setSelected(idea.id)}><div><strong>{idea.title}</strong><small>{idea.type} · {idea.status}</small></div><span className={idea.status === "Published" ? "approved" : "draft-label"}>{idea.status}</span></button>)}</div>{current && <div className="editor-panel"><div className="blog-readiness"><strong>{readiness}/10 publish-ready fields</strong><span>{current.image ? "Image attached" : "Image missing"}</span></div>{current.image && <img className="blog-hero-preview" src={current.image} alt={current.imageAlt || "Blog hero preview"} />}<label>Title<input value={current.title || ""} onChange={(e) => update("title", e.target.value)} /></label><label>Draft body<textarea rows="8" value={current.body || ""} onChange={(e) => update("body", e.target.value)} /></label><div className="field-grid"><label>Slug<input value={current.slug || ""} onChange={(e) => update("slug", e.target.value)} /></label><label>Focus keyword<input value={current.focusKeyword || ""} onChange={(e) => update("focusKeyword", e.target.value)} /></label><label>SEO title<input value={current.seoTitle || ""} onChange={(e) => update("seoTitle", e.target.value)} /></label><label>Image alt text<input value={current.imageAlt || ""} onChange={(e) => update("imageAlt", e.target.value)} /></label></div><label>Meta description<textarea rows="3" value={current.metaDescription || ""} onChange={(e) => update("metaDescription", e.target.value)} /></label><label>GEO / direct answer<textarea rows="3" value={current.geoAnswer || ""} onChange={(e) => update("geoAnswer", e.target.value)} /></label><label>FAQ answer<textarea rows="3" value={current.faq || ""} onChange={(e) => update("faq", e.target.value)} /></label><label>Hero image URL<input value={current.image || ""} onChange={(e) => update("image", e.target.value)} /></label><div className="editor-actions"><button className="approve-btn" disabled={readiness < 10} onClick={() => update("status", current.status === "Approved" ? "Needs approval" : "Approved")}>{current.status === "Approved" ? "Move to review" : "Approve publish-ready draft"}</button><span className="saved-note">{notice || "Saved to Fixaur database"}</span></div></div>}</div></div></>;
}

function OutreachWorkspace() {
  const [items, setItems] = useState(() => { try { const saved = JSON.parse(localStorage.getItem("fixaur-outreach")); if (saved && localStorage.getItem("fixaur-outreach-template") === outreachTemplateVersion) return saved; const next = (saved || outreachRecords).map((x) => ({ ...x, firstName: x.firstName || "", email: x.email || "", body: outreachBody(x) })); localStorage.setItem("fixaur-outreach", JSON.stringify(next)); localStorage.setItem("fixaur-outreach-template", outreachTemplateVersion); return next; } catch { return outreachRecords.map((x) => ({ ...x, firstName: "", email: "", body: outreachBody(x) })); } });
  const [selected, setSelected] = useState(items[0]?.id);
  const [notice, setNotice] = useState("");
  useEffect(() => { fetch("/api/state?key=outreach").then((r) => r.ok ? r.json() : null).then((data) => { if (Array.isArray(data?.value)) { const byId = new Map(outreachRecords.map((x) => [x.id, x])); const merged = data.value.map((x) => ({ ...byId.get(x.id), ...x, email: x.email || byId.get(x.id)?.email || "", firstName: x.firstName || byId.get(x.id)?.firstName || "", emailStatus: x.emailStatus || byId.get(x.id)?.emailStatus })); setItems(merged); setSelected(merged[0]?.id); } }).catch(() => {}); }, []);
  useEffect(() => { fetch("/data/daily-outreach.json", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((daily) => { if (Array.isArray(daily) && daily.length === 10) setItems((currentItems) => daily.map((draft) => ({ ...draft, ...(currentItems.find((x) => x.email?.toLowerCase() === draft.email.toLowerCase()) || {}), subject: draft.subject, body: draft.body, firstName: draft.firstName, company: draft.company, email: draft.email, emailStatus: draft.emailStatus, campaignKey: draft.campaignKey }))); }).catch(() => {}); }, []);
  useEffect(() => { setItems((all) => all.map((x) => x.emailStatus === "verified" && x.status !== "Sent" ? { ...x, status: "Approved" } : x)); }, []);
  useEffect(() => { fetch("/api/outreach/analytics").then((r) => r.ok ? r.json() : null).then(setAnalytics).catch(() => {}); }, []);
  const current = items.find((x) => x.id === selected) || items[0];
  const update = (field, value) => setItems((all) => { const next = all.map((x) => x.id === selected ? { ...x, [field]: value } : x); localStorage.setItem("fixaur-outreach", JSON.stringify(next)); fetch("/api/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "outreach", value: next }) }).catch(() => {}); return next; });
  const updateFirstName = (value) => setItems((all) => { const next = all.map((x) => x.id === selected ? { ...x, firstName: value, body: outreachBody({ ...x, firstName: value }) } : x); localStorage.setItem("fixaur-outreach", JSON.stringify(next)); localStorage.setItem("fixaur-outreach-template", outreachTemplateVersion); fetch("/api/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "outreach", value: next }) }).catch(() => {}); return next; });
  const suppress = async () => { if (!current?.email) return setNotice("A verified email is required to suppress a contact."); const res = await fetch("/api/outreach/suppress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient: current.email, reason: "manual suppression" }) }); setNotice(res.ok ? "Contact suppressed; future sends are blocked." : "Could not update suppression list."); };
  const send = async () => { if (!current?.email || !current.email.includes("@")) return setNotice("Add a valid business email before sending."); if (current.emailStatus !== "verified") return setNotice("Only Apollo-verified business emails can be sent."); setNotice("Sending…"); const res = await fetch("/api/outreach/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: current.email, cc: ["diacre@fixaur.com"], subject: current.subject, text: current.body, sourceUrl: `https://${current.contact.split("·").pop().trim()}`, campaignKey: current.campaignKey || "fixaur-fleet-outreach-v1", approved: true }) }); const data = await res.json().catch(() => ({})); if (!res.ok) return setNotice(data.error || "Resend rejected the message."); setItems((all) => { const next = all.map((x) => x.email?.toLowerCase() === current.email.toLowerCase() ? { ...x, status: "Sent", resendId: data.id, lastActivity: data.sentAt } : x); localStorage.setItem("fixaur-outreach", JSON.stringify(next)); return next; }); setNotice("Sent through Resend with a copy to diacre@fixaur.com."); };
  return <><WorkspaceHeader eyebrow="EMAIL OUTREACH" title="Fleet outreach, with a paper trail." sub="Edit each message, verify the recipient and source, then approve before Resend sends." /><div className="workspace-card"><div className="section-head"><div><p className="eyebrow">RESEND TRACKER</p><h2>Sent, replied and pending</h2></div><span className="status-chip">{items.filter((x) => x.status === "Sent").length} sent</span></div><div className="outreach-note">Apollo supplied company prospects, not contact emails. Add a verified business email; no addresses are guessed or scraped.</div><div className="editor-layout"><div className="simple-list">{items.map((record) => <button className={record.id === selected ? "list-row selected-row" : "list-row"} key={record.id} onClick={() => setSelected(record.id)}><div><strong>{record.company}</strong><small>{record.contact} · {record.status}</small></div><span className={record.status === "Sent" ? "approved" : "draft-label"}>{record.status}</span></button>)}</div>{current && <div className="editor-panel"><label>First name<input value={current.firstName || ""} placeholder="Optional until verified" onChange={(e) => updateFirstName(e.target.value)} /></label><label>Business email<input type="email" value={current.email} placeholder="fleet@company.ca" onChange={(e) => update("email", e.target.value)} /></label><label>Subject<input value={current.subject} onChange={(e) => update("subject", e.target.value)} /></label><label>Message<textarea rows="9" value={current.body} onChange={(e) => update("body", e.target.value)} /></label><div className="editor-actions"><button className="approve-btn" onClick={() => update("status", current.status === "Approved" ? "Draft" : "Approved")}>{current.status === "Approved" ? "Move to draft" : "Approve email"}</button><button className="primary" disabled={current.status !== "Approved" || current.status === "Sent"} onClick={send}><Send size={15} /> Send through Resend</button></div>{notice && <p className="saved-note">{notice}</p>}</div>}</div></div></>;
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
