import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Hooks ─────────────────────────────────────────────────────────────── */
function useOnScreen(ref, threshold = 0.12) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return v;
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

function useIsMob() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const h = () => setM(window.innerWidth < 768);
    h(); window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return m;
}

/* ─── Reveal ─────────────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, dir = "up", className = "", style: s = {} }) {
  const ref = useRef(null);
  const v = useOnScreen(ref);
  const t = { up: "translateY(36px)", left: "translateX(-36px)", right: "translateX(36px)", scale: "scale(0.94)" };
  return (
    <div ref={ref} className={className} style={{
      ...s,
      opacity: v ? 1 : 0,
      transform: v ? "none" : (t[dir] || t.up),
      transition: `opacity 0.85s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.85s cubic-bezier(.16,1,.3,1) ${delay}s`
    }}>{children}</div>
  );
}

/* ─── Typewriter ─────────────────────────────────────────────────────────── */
function Typewriter({ words, speed = 68, pause = 2200 }) {
  const [text, setText] = useState("");
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = words[wi];
    if (!del && ci === w.length) { const t = setTimeout(() => setDel(true), pause); return () => clearTimeout(t); }
    if (del && ci === 0) { setDel(false); setWi(i => (i + 1) % words.length); return; }
    const t = setTimeout(() => {
      setText(w.substring(0, del ? ci - 1 : ci + 1));
      setCi(c => c + (del ? -1 : 1));
    }, del ? speed / 2.5 : speed);
    return () => clearTimeout(t);
  }, [ci, del, wi, words, speed, pause]);
  return <span>{text}<span style={{ display: "inline-block", width: 2, height: "1.1em", background: "var(--accent)", marginLeft: 3, verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} /></span>;
}

/* ─── Counter ────────────────────────────────────────────────────────────── */
function Counter({ target, suffix = "" }) {
  const ref = useRef(null);
  const v = useOnScreen(ref);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!v) return;
    const dur = 1400, steps = 50, step = dur / steps;
    let cur = 0;
    const id = setInterval(() => {
      cur++;
      setN(Math.round(target * (cur / steps)));
      if (cur >= steps) clearInterval(id);
    }, step);
    return () => clearInterval(id);
  }, [v, target]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* ─── ScrollProgress ─────────────────────────────────────────────────────── */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const h = () => {
      const el = document.documentElement;
      setPct((window.scrollY / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 1000, background: "transparent" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--accent), var(--accent2))", transition: "width 0.1s linear", boxShadow: "0 0 10px var(--accent)" }} />
    </div>
  );
}

/* ─── BentoCard ──────────────────────────────────────────────────────────── */
function BentoCard({ tag, tagColor = "var(--accent)", title, desc, caseRows, tech, actions, accent, style: s = {}, children }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "var(--card-hover)" : "var(--card)",
        border: `1px solid ${hov ? (accent || "var(--accent)") + "40" : "var(--border)"}`,
        borderRadius: 18,
        padding: "32px 30px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? `0 20px 50px ${(accent || "var(--accent)")}10` : "none",
        transition: "all 0.38s cubic-bezier(.16,1,.3,1)",
        ...s
      }}
    >
      <div>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: tagColor, border: `1px solid ${tagColor}30`, padding: "4px 10px", borderRadius: 100, display: "inline-block", marginBottom: 14 }}>{tag}</span>
        <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.2, color: "var(--text)" }}>{title}</h3>
      </div>
      {desc && <p style={{ fontSize: 13.5, lineHeight: 1.85, color: "var(--text-dim)", margin: 0 }}>{desc}</p>}
      {caseRows && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "var(--case-bg)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--border)" }}>
          {caseRows.map(([label, text]) => (
            <div key={label} style={{ display: "flex", gap: 10, fontSize: 12.5, lineHeight: 1.7 }}>
              <span style={{ fontWeight: 700, color: "var(--accent)", flexShrink: 0, minWidth: 58 }}>{label}</span>
              <span style={{ color: "var(--text-dim)" }}>{text}</span>
            </div>
          ))}
        </div>
      )}
      {children}
      {tech && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tech.map(t => <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 100, background: "var(--tag-bg)", color: "var(--text-dim)", border: "1px solid var(--border)" }}>{t}</span>)}
        </div>
      )}
      {actions}
    </div>
  );
}

/* ─── TimelineItem ───────────────────────────────────────────────────────── */
function TimelineItem({ period, badge, role, org, bullets, techTags, delay = 0, isLast = false }) {
  const ref = useRef(null);
  const v = useOnScreen(ref);
  return (
    <div ref={ref} style={{ display: "flex", gap: 24, opacity: v ? 1 : 0, transform: v ? "none" : "translateX(-28px)", transition: `all 0.85s cubic-bezier(.16,1,.3,1) ${delay}s` }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 20 }}>
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent2))", border: "3px solid var(--bg)", boxShadow: "0 0 0 2px var(--accent)", flexShrink: 0, marginTop: 4 }} />
        {!isLast && <div style={{ flex: 1, width: 2, background: "linear-gradient(to bottom, var(--accent)40, transparent)", marginTop: 6 }} />}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: 1.2, textTransform: "uppercase" }}>{period}</span>
          {badge && <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", padding: "3px 10px", borderRadius: 100, background: "rgba(52,211,153,0.1)", color: "#34D399", border: "1px solid rgba(52,211,153,0.2)" }}>{badge}</span>}
        </div>
        <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 4, letterSpacing: -0.4 }}>{role}</h3>
        <div style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 500, marginBottom: 16 }}>{org}</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {bullets.map((b, i) => (
            <li key={i} style={{ display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.8, color: "var(--text-dim)" }}>
              <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 7, fontSize: 5 }}>●</span>
              <span dangerouslySetInnerHTML={{ __html: b }} />
            </li>
          ))}
        </ul>
        {techTags && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
            {techTags.map(t => <span key={t} style={{ fontSize: 10.5, fontWeight: 600, padding: "4px 10px", borderRadius: 100, background: "var(--tag-bg)", color: "var(--text-dim)", border: "1px solid var(--border)" }}>{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── SkillGroup ─────────────────────────────────────────────────────────── */
function SkillGroup({ icon, title, tags, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 26, transition: "all 0.35s cubic-bezier(.16,1,.3,1)" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)25"; e.currentTarget.style.boxShadow = "0 8px 32px var(--accent)06"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
          <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.3 }}>{title}</h3>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {tags.map(t => {
            const [hov, setHov] = useState(false);
            return (
              <span key={t} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
                fontSize: 11, fontWeight: 500, padding: "6px 13px", borderRadius: 100,
                background: hov ? "rgba(6,182,212,0.1)" : "var(--tag-bg)",
                border: `1px solid ${hov ? "rgba(6,182,212,0.3)" : "var(--border)"}`,
                color: hov ? "var(--accent)" : "var(--text-dim)",
                transition: "all 0.25s cubic-bezier(.16,1,.3,1)",
                transform: hov ? "translateY(-2px)" : "none",
                cursor: "default", display: "inline-block"
              }}>{t}</span>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}

/* ─── Main Portfolio ─────────────────────────────────────────────────────── */
export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [copied, setCopied] = useState(false);
  const scrollY = useScrollY();
  const isMob = useIsMob();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(true); }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText("nikhilpatil1104@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Data ── */
  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Projects", href: "#projects" },
    { label: "Experience", href: "#experience" },
    { label: "Education", href: "#education" },
    { label: "Contact", href: "#contact" },
  ];

  const stats = [
    { target: 380, suffix: "", label: "GPA", sub: "UMBC M.S. Program", display: "3.80" },
    { target: 94, suffix: "%", label: "Model Accuracy", sub: "Glaucoma Detection CNN" },
    { target: 50, suffix: "K+", label: "Records Managed", sub: "ETL Pipelines" },
    { target: 40, suffix: "%", label: "Efficiency Gain", sub: "Reporting Automation" },
  ];

  const skillGroups = [
    { icon: "🤖", title: "AI & LLM Stack", tags: ["Agentic AI", "RAG Systems", "LLM APIs (OpenAI, GPT-4)", "LangChain", "Prompt Engineering", "Fine-tuning", "FAISS / Vector DBs", "Ollama"] },
    { icon: "🧠", title: "Core ML / Deep Learning", tags: ["PyTorch", "Scikit-learn", "CNNs", "Transfer Learning (VGG16)", "AutoML", "Anomaly Detection", "Time Series", "Transformers"] },
    { icon: "📊", title: "Statistical Modeling", tags: ["Bayesian Statistics", "Econometrics", "OLS Regression", "Poisson GLM", "Multivariate Analysis", "Hypothesis Testing", "A/B Testing", "EDA"] },
    { icon: "⚙️", title: "Data Engineering", tags: ["Python", "SQL", "Pandas", "NumPy", "MongoDB (NoSQL)", "MySQL", "ETL Pipelines", "Spark", "Git"] },
    { icon: "📈", title: "BI & Visualization", tags: ["Power BI", "Tableau", "Plotly / Dash", "Streamlit", "Interactive Dashboards", "Business Intelligence"] },
    { icon: "🏢", title: "Domain Expertise", tags: ["Insurance Analytics", "CLV Modeling", "Pure Premium Modeling", "Risk Assessment", "Underwriting Analytics", "Loss Trend Forecasting"] },
  ];

  const bentoProjects = [
    {
      id: "ins-agent",
      tag: "AGENTIC AI",
      tagColor: "#06B6D4",
      title: "Insurance AI Research Agent",
      desc: "Custom four-step agentic loop built from scratch — no external frameworks. Intent classification → search decision → DuckDuckGo retrieval → LLM synthesis. Handles complex multi-turn insurance research queries.",
      caseRows: [
        ["Problem", "Manual insurance research is slow, inconsistent, and unscalable across complex multi-turn queries."],
        ["Approach", "Custom 4-step agent loop: intent classification → search decision → DuckDuckGo retrieval → GPT-4 synthesis."],
        ["Outcome", "Fully autonomous research pipeline with real-time retrieval, zero framework dependency."],
      ],
      pipeline: ["Intent Classification", "Search Decision", "DuckDuckGo Retrieval", "GPT-4 Synthesis"],
      tech: ["OpenAI API", "DuckDuckGo API", "Streamlit", "Python", "Agentic AI"],
      github: "https://github.com/nikhilpatil1104/AI-Agent-For-Insurance-Research",
      size: "large",
      accent: "#06B6D4",
    },
    {
      id: "rag-plymbot",
      tag: "RAG SYSTEM · DEPLOYED",
      tagColor: "#818CF8",
      title: "PlymBot — RAG Policy Q&A",
      desc: "AI-powered RAG application for querying insurance policy documents. FAISS vector embeddings for semantic search, GPT-4o-mini for answer synthesis, production-grade guardrails. Deployed to Streamlit Cloud.",
      caseRows: [
        ["Problem", "Insurance policy documents are dense, unstructured, and slow to navigate manually."],
        ["Approach", "LangChain + FAISS embeddings → GPT-4o-mini synthesis → built-in guardrails + fallback handling."],
        ["Outcome", "Deployed cloud app with semantic search, 100% auditability, and reliable guardrails."],
      ],
      tech: ["LangChain", "FAISS", "GPT-4o-mini", "Streamlit", "RAG", "Vector DB"],
      github: "https://github.com/nikhilpatil1104/Insurance-Policy-Bot",
      size: "medium",
      accent: "#818CF8",
    },
    {
      id: "glaucoma",
      tag: "DEEP LEARNING · 94% ACC",
      tagColor: "#F472B6",
      title: "Glaucoma Detection CNN",
      desc: "End-to-end CNN glaucoma detection from retinal fundus images. VGG16 transfer learning, custom augmentation pipeline increasing dataset diversity 3×, reducing overfitting 25%.",
      caseRows: [
        ["Problem", "Glaucoma affects 80M+ globally — early detection from fundus images requires expert-level accuracy."],
        ["Approach", "VGG16 transfer learning + custom augmentation (3× dataset diversity) + dropout regularization."],
        ["Outcome", "94% accuracy, +15% sensitivity over baseline. ROC-AUC validated."],
      ],
      tech: ["PyTorch", "VGG16", "CNN", "Transfer Learning", "ROC-AUC"],
      github: "https://github.com/nikhilpatil1104/Detection-of-Glaucoma-Disease-using-Image-Processing-SoftComputing-DeepLearningApproaches-",
      size: "medium",
      accent: "#F472B6",
    },
    {
      id: "climate",
      tag: "PREDICTIVE MODELING",
      tagColor: "#34D399",
      title: "Climate Impact Prediction",
      desc: "Multivariate OLS and Poisson regression forecasting rainfall, sea-level rise, extreme weather through 2050. R² = 0.85 with multi-decade environmental features.",
      caseRows: [
        ["Problem", "Climate forecasting to 2050 requires robust statistical models across multi-decade, multi-variable data."],
        ["Approach", "Multivariate OLS + Poisson GLM regression with curated environmental feature engineering."],
        ["Outcome", "R² = 0.85, +20% accuracy over baseline. Reusable modular pipelines."],
      ],
      tech: ["Python", "Scikit-learn", "OLS Regression", "Poisson GLM", "Pandas"],
      github: "https://github.com/nikhilpatil1104/Climate-Impact-Prediction",
      size: "small",
      accent: "#34D399",
    },
    {
      id: "price",
      tag: "FULL STACK · DATA",
      tagColor: "#FBBF24",
      title: "E-Commerce Price Intelligence",
      desc: "Automated scraping aggregating real-time pricing across 10+ platforms, processing 100K+ product records. Optimized MySQL schema cutting query time 40%. Price tracking reducing search time 50%.",
      caseRows: [
        ["Problem", "Manual price comparison across 10+ e-commerce platforms is time-consuming and error-prone."],
        ["Approach", "Selenium + BeautifulSoup scraping → ETL to optimized MySQL → React price tracking dashboard."],
        ["Outcome", "100K+ products, 40% faster queries, 50% search time reduction."],
      ],
      tech: ["Selenium", "BeautifulSoup", "MySQL", "React", "ETL"],
      github: "https://github.com/nikhilpatil1104/Price-Comparison-Website",
      size: "wide",
      accent: "#FBBF24",
    },
  ];

  const experiences = [
    {
      period: "May 2025 — Jul 2025",
      badge: "Recent",
      role: "Data Analyst",
      org: "Buildstone Realty Advisors",
      bullets: [
        "Spearheaded <strong style=\"color:var(--text)\">Power BI dashboards</strong> visualizing CLV and risk metrics, reducing reporting time by <strong style=\"color:var(--accent)\">40%</strong>.",
        "Engineered resilient <strong style=\"color:var(--text)\">ETL pipelines</strong> for insurance analytics, slashing manual handling time by <strong style=\"color:var(--accent)\">60%</strong>.",
        "Applied <strong style=\"color:var(--text)\">econometrics and Bayesian techniques</strong> with scikit-learn for CLV and pure premium modeling, improving decision efficiency by <strong style=\"color:var(--accent)\">35%</strong>.",
        "Translated complex predictive modeling results into actionable business insights for non-technical stakeholders.",
      ],
      techTags: ["Power BI", "scikit-learn", "Bayesian Analysis", "ETL", "CLV Modeling"],
    },
    {
      period: "Sep 2024 — Apr 2025",
      role: "Data Management Intern",
      org: "Buildstone Realty Advisors",
      bullets: [
        "Managed <strong style=\"color:var(--text)\">50,000+ property records</strong> in MySQL and MongoDB with 99% data accuracy.",
        "Architected scalable <strong style=\"color:var(--text)\">ETL processes</strong> using Python and Git, enabling <strong style=\"color:var(--accent)\">40% faster</strong> insight delivery.",
        "Developed automated data cleaning and validation scripts, improving processing speed by <strong style=\"color:var(--accent)\">70%</strong>.",
      ],
      techTags: ["MySQL", "MongoDB", "Python", "Git", "ETL"],
    },
  ];

  const filtered = filter === "All" ? bentoProjects : bentoProjects.filter(p => {
    if (filter === "AI") return ["ins-agent", "rag-plymbot", "glaucoma"].includes(p.id);
    if (filter === "ML") return ["climate"].includes(p.id);
    if (filter === "Data") return ["price"].includes(p.id);
    return true;
  });

  /* ── Render ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg: #080B12;
          --bg2: #0C0F18;
          --card: rgba(255,255,255,0.026);
          --card-hover: rgba(255,255,255,0.042);
          --case-bg: rgba(255,255,255,0.018);
          --border: rgba(255,255,255,0.065);
          --text: #E4E8F2;
          --text-dim: rgba(228,232,242,0.48);
          --accent: #06B6D4;
          --accent2: #818CF8;
          --tag-bg: rgba(255,255,255,0.038);
          --mono: 'JetBrains Mono', monospace;
          --sans: 'DM Sans', sans-serif;
          --display: 'Syne', sans-serif;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: var(--sans); overflow-x: hidden; }
        body::-webkit-scrollbar { display: none; }
        body { scrollbar-width: none; }
        ::selection { background: rgba(6,182,212,0.25); color: #fff; }

        a { color: inherit; text-decoration: none; }
        strong { color: var(--text); }

        @keyframes blink { 50% { opacity: 0; } }
        @keyframes pulse { 0%,100% { opacity:1; box-shadow:0 0 0 0 rgba(52,211,153,0.5); } 50% { opacity:0.8; box-shadow:0 0 0 6px rgba(52,211,153,0); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-7px); } }
        @keyframes gridFade { from { opacity:0; } to { opacity:1; } }
        @keyframes gradPan { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
        @keyframes spinSlow { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }

        .hero-grid {
          position:absolute; inset:0;
          background-image: linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridFade 1.5s ease both;
          mask-image: radial-gradient(ellipse 90% 80% at 50% 40%, black 40%, transparent 100%);
        }
        .hero-glow {
          position:absolute; top:-20%; right:-10%; width:700px; height:700px;
          background:radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 65%);
          filter:blur(60px); pointer-events:none;
        }
        .hero-glow2 {
          position:absolute; bottom:-15%; left:-10%; width:500px; height:500px;
          background:radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 65%);
          filter:blur(80px); pointer-events:none;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--accent), var(--accent2), #F472B6);
          background-size: 200% auto;
          animation: gradPan 5s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-tag {
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: 14px;
        }

        .pipeline-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }
        .pipeline-step {
          font-family: var(--mono);
          font-size: 10.5px;
          padding: 5px 12px;
          background: rgba(6,182,212,0.06);
          border: 1px solid rgba(6,182,212,0.2);
          border-radius: 6px;
          color: var(--accent);
          white-space: nowrap;
        }
        .pipeline-arrow {
          color: var(--text-dim);
          font-size: 12px;
        }

        .bento-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 10px;
          background: rgba(6,182,212,0.08);
          border: 1px solid rgba(6,182,212,0.25);
          color: var(--accent); font-size: 12px; font-weight: 600;
          font-family: var(--sans);
          cursor: pointer; text-decoration: none;
          transition: all 0.25s cubic-bezier(.16,1,.3,1);
        }
        .bento-btn:hover { background: rgba(6,182,212,0.14); transform: translateY(-2px); }
        .bento-private {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600;
          color: var(--text-dim);
          padding: 8px 14px; border-radius: 8px;
          background: var(--tag-bg); border: 1px solid var(--border);
        }

        .nav-link {
          font-size: 13px; font-weight: 500; letter-spacing: 0.02em;
          color: var(--text-dim);
          padding: 6px 2px;
          position: relative;
          transition: color 0.25s;
        }
        .nav-link::after {
          content:''; position:absolute; bottom:-2px; left:0; right:0;
          height:1px; background:var(--accent);
          transform:scaleX(0); transition:transform 0.25s cubic-bezier(.16,1,.3,1);
        }
        .nav-link:hover { color: var(--text); }
        .nav-link:hover::after { transform:scaleX(1); }

        .filter-btn {
          padding: 8px 20px; border-radius: 100px;
          font-size: 12px; font-weight: 600;
          font-family: var(--sans);
          cursor: pointer;
          transition: all 0.28s cubic-bezier(.16,1,.3,1);
          border: 1px solid var(--border);
          background: transparent; color: var(--text-dim);
        }
        .filter-btn.active {
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border-color: transparent; color: #fff;
          box-shadow: 0 4px 18px rgba(6,182,212,0.25);
          transform: scale(1.04);
        }
        .filter-btn:hover:not(.active) { color: var(--text); border-color: var(--accent)40; }

        .contact-cta {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 28px; border-radius: 12px;
          background: var(--card); border: 1px solid var(--border);
          color: var(--text); font-size: 14px; font-weight: 600;
          font-family: var(--sans); cursor: pointer;
          transition: all 0.3s cubic-bezier(.16,1,.3,1);
          letter-spacing: -0.2px;
        }
        .contact-cta:hover { border-color: var(--accent)50; background: var(--card-hover); transform: translateY(-2px); }

        .contact-send {
          display: inline-flex; align-items: center; justify-content: center;
          width: 50px; height: 50px; border-radius: 12px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          box-shadow: 0 4px 20px rgba(6,182,212,0.3);
          transition: all 0.3s; flex-shrink: 0;
        }
        .contact-send:hover { transform: translateY(-3px) rotate(5deg); box-shadow: 0 8px 32px rgba(6,182,212,0.4); }

        .social-link {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 500;
          color: var(--text-dim);
          padding: 8px 14px; border-radius: 8px;
          border: 1px solid var(--border);
          transition: all 0.25s cubic-bezier(.16,1,.3,1);
        }
        .social-link:hover { color: var(--accent); border-color: var(--accent)40; background: rgba(6,182,212,0.04); transform: translateY(-2px); }

        @media (max-width: 768px) {
          .hero-title { font-size: 46px !important; letter-spacing: -2px !important; }
          .bento-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <ScrollProgress />

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
        background: scrollY > 60 ? "rgba(8,11,18,0.82)" : "transparent",
        backdropFilter: scrollY > 60 ? "blur(22px) saturate(1.8)" : "none",
        borderBottom: scrollY > 60 ? "1px solid var(--border)" : "none",
        transition: "all 0.4s cubic-bezier(.16,1,.3,1)",
        padding: isMob ? "14px 20px" : "18px 56px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="#hero" style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
            NP<span style={{ color: "var(--accent)" }}>.</span>
          </a>
          {!isMob && (
            <ul style={{ display: "flex", gap: 28, listStyle: "none", alignItems: "center" }}>
              {navLinks.map(l => <li key={l.label}><a href={l.href} className="nav-link">{l.label}</a></li>)}
            </ul>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a
              href="/Nikhil_Patil_Resume.pdf"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 18px", borderRadius: 9,
                background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                color: "#fff", fontSize: 12, fontWeight: 700,
                boxShadow: "0 3px 16px rgba(6,182,212,0.25)",
                transition: "all 0.25s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(6,182,212,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 3px 16px rgba(6,182,212,0.25)"; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Resume
            </a>
            {isMob && (
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", fontSize: 20, padding: "4px 6px" }}>
                {menuOpen ? "✕" : "☰"}
              </button>
            )}
          </div>
        </div>
        {isMob && menuOpen && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "rgba(8,11,18,0.97)", backdropFilter: "blur(24px)", borderBottom: "1px solid var(--border)", padding: "12px 20px 20px" }}>
            {navLinks.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                style={{ display: "block", padding: "14px 0", borderBottom: "1px solid var(--border)", fontSize: 16, fontWeight: 600 }}>
                {l.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", padding: isMob ? "120px 20px 70px" : "0 56px", overflow: "hidden" }}>
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="hero-glow2" />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, width: "100%", margin: "0 auto" }}>
          <div style={{ maxWidth: 720 }}>
            {/* Status chip */}
            <div style={{
              opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(16px)",
              transition: "all 0.8s cubic-bezier(.16,1,.3,1) 0.2s",
              display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32,
              padding: "7px 18px 7px 12px", borderRadius: 100,
              background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.18)",
              fontSize: 12, fontWeight: 600, letterSpacing: 0.3, color: "var(--accent)"
            }}>
             
            </div>

            {/* Title */}
            <h1 className="hero-title" style={{
              fontFamily: "var(--display)", fontSize: isMob ? 46 : 74, fontWeight: 800,
              lineHeight: 1.0, letterSpacing: -3, marginBottom: 16,
              opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(28px)",
              transition: "all 0.9s cubic-bezier(.16,1,.3,1) 0.35s"
            }}>
              Building AI That<br />
              <span className="gradient-text">Actually Works</span>
            </h1>

            {/* Typewriter */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 24,
              opacity: loaded ? 1 : 0, transition: "opacity 0.9s 0.5s"
            }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)", letterSpacing: 0.5 }}>currently building</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--accent)" }}>
                <Typewriter words={["Agentic AI Systems", "RAG Pipelines", "Deep Learning Models", "Bayesian Analytics", "Insurance AI"]} />
              </span>
            </div>

            {/* Sub */}
            <p style={{
              fontSize: isMob ? 14.5 : 16, lineHeight: 1.9, color: "var(--text-dim)",
              maxWidth: 560, marginBottom: 40,
              opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(16px)",
              transition: "all 0.9s cubic-bezier(.16,1,.3,1) 0.55s"
            }}>
              Graduate Data Science student at UMBC building AI systems that ship —
              agentic research agents, RAG pipelines, deep learning models, and predictive analytics
              for regulated industries.
            </p>

            {/* CTAs */}
            <div style={{
              display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 64,
              opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(16px)",
              transition: "all 0.9s cubic-bezier(.16,1,.3,1) 0.65s"
            }}>
              {[
                { label: "View Projects", href: "#projects", primary: true },
                { label: "Download Resume", href: "/Nikhil_Patil_Resume.pdf", primary: false },
                { label: "nikhilpatil1104@gmail.com", href: "mailto:nikhilpatil1104@gmail.com", primary: false, ghost: true },
              ].map(btn => (
                <a key={btn.label} href={btn.href} target={btn.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: btn.ghost ? "12px 20px" : "13px 28px",
                    borderRadius: 11, fontWeight: 700, fontSize: btn.ghost ? 12 : 14,
                    transition: "all 0.3s cubic-bezier(.16,1,.3,1)",
                    ...(btn.primary ? {
                      background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                      color: "#fff", boxShadow: "0 4px 24px rgba(6,182,212,0.28)",
                      border: "none"
                    } : btn.ghost ? {
                      background: "transparent", color: "var(--text-dim)",
                      border: "1px solid var(--border)", fontFamily: "var(--mono)"
                    } : {
                      background: "transparent", color: "var(--text)",
                      border: "1px solid var(--border)"
                    })
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                >
                  {btn.primary ? (
                    <>{btn.label}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                  ) : btn.label}
                </a>
              ))}
            </div>

            {/* Stats */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: isMob ? 28 : 0, alignItems: "stretch",
              opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(16px)",
              transition: "all 0.9s cubic-bezier(.16,1,.3,1) 0.8s"
            }}>
              {stats.map((s, i) => (
                <div key={s.label} style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
                  {i > 0 && !isMob && <div style={{ width: 1, background: "var(--border)", margin: "0 36px", alignSelf: "stretch" }} />}
                  <div>
                    <div style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>
                      {s.display ? (
                        <span className="gradient-text">{s.display}</span>
                      ) : (
                        <span className="gradient-text"><Counter target={s.target} suffix={s.suffix} /></span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginTop: 5 }}>{s.label}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-dim)", marginTop: 2 }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: isMob ? "72px 20px" : "100px 56px", background: "var(--bg2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <span className="section-tag">// about</span>
            <h2 style={{ fontFamily: "var(--display)", fontSize: isMob ? 30 : 46, fontWeight: 800, letterSpacing: -1.5, marginBottom: 56 }}>Who I Am</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1.1fr 1fr", gap: 56, alignItems: "start" }}>
            <Reveal delay={0.1}>
              <p style={{ fontSize: 15.5, lineHeight: 1.95, color: "var(--text-dim)", marginBottom: 18 }}>
                I'm a graduate Data Science student at <strong>UMBC (3.80 GPA)</strong>, specializing in AI systems, Bayesian statistics, and econometric modeling.
              </p>
              <p style={{ fontSize: 15.5, lineHeight: 1.95, color: "var(--text-dim)", marginBottom: 18 }}>
                At Buildstone Realty Advisors, I built <strong>ETL pipelines, Power BI dashboards, and predictive models</strong> for CLV and insurance pricing — cutting reporting time by 40% and improving decision efficiency by 35%.
              </p>
              <p style={{ fontSize: 15.5, lineHeight: 1.95, color: "var(--text-dim)" }}>
                I believe the gap between "demo" and "deployed" is where real engineering happens. That's where I work — building agentic AI systems, RAG applications, and deep learning models that actually ship.
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { icon: "🎓", title: "M.S. Data Science", sub: "UMBC — GPA 3.80/4.0" },
                  { icon: "🤖", title: "Agentic AI Builder", sub: "Custom loops, no frameworks" },
                  { icon: "📊", title: "Bayesian Analyst", sub: "Econometrics & Predictive ML" },
                  { icon: "🏢", title: "Insurance Domain", sub: "CLV, Pure Premium, Risk" },
                  { icon: "⚡", title: "94% CV Accuracy", sub: "Glaucoma detection CNN" },
                  { icon: "📍", title: "Baltimore, MD", sub: "Open to relocation" },
                ].map(card => (
                  <div key={card.title} style={{
                    background: "var(--card)", border: "1px solid var(--border)",
                    borderRadius: 14, padding: "20px 18px",
                    transition: "all 0.3s cubic-bezier(.16,1,.3,1)", cursor: "default"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.35)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(6,182,212,0.07)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{card.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5 }}>{card.sub}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" style={{ padding: isMob ? "72px 20px" : "100px 56px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <span className="section-tag">// skills</span>
            <h2 style={{ fontFamily: "var(--display)", fontSize: isMob ? 30 : 46, fontWeight: 800, letterSpacing: -1.5, marginBottom: 48 }}>Technical Stack</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {skillGroups.map((g, i) => <SkillGroup key={g.title} {...g} delay={i * 0.07} />)}
          </div>
        </div>
      </section>

      {/* ── PROJECTS (BENTO) ── */}
      <section id="projects" style={{ padding: isMob ? "72px 20px" : "100px 56px", background: "var(--bg2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <span className="section-tag">// featured</span>
            <h2 style={{ fontFamily: "var(--display)", fontSize: isMob ? 30 : 46, fontWeight: 800, letterSpacing: -1.5, marginBottom: 8 }}>AI Systems Built</h2>
            <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 36 }}>End-to-end engineering — not tutorials.</p>
          </Reveal>

          {/* Filter */}
          <Reveal delay={0.08}>
            <div style={{ display: "flex", gap: 8, marginBottom: 36, flexWrap: "wrap" }}>
              {["All", "AI", "ML", "Data"].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`filter-btn${filter === f ? " active" : ""}`}>
                  {f === "All" ? "All Projects" : f === "AI" ? "AI / LLM" : f === "ML" ? "Predictive ML" : "Data Engineering"}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Bento Grid */}
          <div className="bento-grid" style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "repeat(12, 1fr)", gap: 16 }}>
            {filtered.map((p, i) => {
              const colSpan = isMob ? 12 : p.size === "large" ? 7 : p.size === "wide" ? 12 : p.size === "small" ? 5 : 5;
              return (
                <Reveal key={p.id} delay={i * 0.08} style={{ gridColumn: `span ${colSpan}` }}>
                  <BentoCard
                    tag={p.tag}
                    tagColor={p.tagColor}
                    title={p.title}
                    desc={p.desc}
                    caseRows={p.caseRows}
                    tech={p.tech}
                    accent={p.accent}
                    style={{ height: "100%" }}
                    actions={
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {p.github && (
                          <a href={p.github} target="_blank" rel="noopener noreferrer" className="bento-btn">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            View Code
                          </a>
                        )}
                      </div>
                    }
                  >
                    {/* Pipeline for large card */}
                    {p.pipeline && (
                      <div className="pipeline-row">
                        {p.pipeline.map((step, si) => (
                          <span key={step} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <span className="pipeline-step">{step}</span>
                            {si < p.pipeline.length - 1 && <span className="pipeline-arrow">→</span>}
                          </span>
                        ))}
                      </div>
                    )}
                  </BentoCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section id="experience" style={{ padding: isMob ? "72px 20px" : "100px 56px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <span className="section-tag">// experience</span>
            <h2 style={{ fontFamily: "var(--display)", fontSize: isMob ? 30 : 46, fontWeight: 800, letterSpacing: -1.5, marginBottom: 52 }}>Where I've Worked</h2>
          </Reveal>
          <div style={{ maxWidth: 820 }}>
            {experiences.map((exp, i) => (
              <TimelineItem
                key={exp.role}
                {...exp}
                delay={i * 0.14}
                isLast={i === experiences.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── EDUCATION ── */}
      <section id="education" style={{ padding: isMob ? "72px 20px" : "100px 56px", background: "var(--bg2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <span className="section-tag">// education</span>
            <h2 style={{ fontFamily: "var(--display)", fontSize: isMob ? 30 : 46, fontWeight: 800, letterSpacing: -1.5, marginBottom: 48 }}>Education</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 18, maxWidth: 900, marginBottom: 52 }}>
            {[
              {
                school: "University of Maryland Baltimore County",
                degree: "M.S., Data Science",
                year: "Expected May 2027",
                gpa: "3.80",
                courses: "Bayesian Statistics · Econometrics · Machine Learning & Gen AI · Big Data · Statistical Modeling",
                icon: "🎓"
              },
              {
                school: "University of Mumbai",
                degree: "B.E., Electronics & Computer Science",
                year: "Graduated Jun 2025",
                gpa: "3.33",
                courses: "Machine Learning · Deep Learning · NLP · Database Management · Artificial Intelligence",
                icon: "🏛️"
              }
            ].map((edu, i) => (
              <Reveal key={edu.school} delay={i * 0.12}>
                <div style={{
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: 16, padding: 30, height: "100%",
                  transition: "all 0.35s cubic-bezier(.16,1,.3,1)"
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.3)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(6,182,212,0.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <span style={{ fontSize: 36, display: "block", marginBottom: 14 }}>{edu.icon}</span>
                  <h3 style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{edu.school}</h3>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", marginBottom: 14 }}>{edu.degree}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 12, color: "var(--text-dim)" }}>
                    <span>{edu.year}</span>
                    <span style={{ fontWeight: 700, color: "var(--accent2)" }}>GPA: {edu.gpa}</span>
                  </div>
                  <p style={{ fontSize: 12, lineHeight: 1.8, color: "var(--text-dim)" }}>
                    <span style={{ fontWeight: 600, color: "var(--text)", opacity: 0.65 }}>Coursework: </span>{edu.courses}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Certs */}
          <Reveal delay={0.1}>
            <h3 style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, letterSpacing: -0.4, marginBottom: 20 }}>Certifications</h3>
            <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14 }}>
              {[
                { name: "Generative AI Essentials: Using LLMs to Work with Data", org: "IBM SkillsBuild", icon: "🧬" },
                { name: "Enterprise Data Science in Practice", org: "IBM SkillsBuild", icon: "📡" },
                { name: "Python For Beginners", org: "Udemy", icon: "🐍" },
                { name: "Automated Machine Learning For Beginners", org: "Udemy", icon: "⚡" },
              ].map(c => (
                <div key={c.name} style={{
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: 14, padding: 20, textAlign: "center",
                  transition: "all 0.3s cubic-bezier(.16,1,.3,1)"
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "rgba(6,182,212,0.25)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  <span style={{ fontSize: 26, display: "block", marginBottom: 8 }}>{c.icon}</span>
                  <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, marginBottom: 6 }}>{c.name}</p>
                  <p style={{ fontSize: 10, color: "var(--text-dim)" }}>{c.org}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: isMob ? "72px 20px" : "100px 56px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <span className="section-tag" style={{ display: "inline-block", marginBottom: 16 }}>// contact</span>
              <h2 style={{ fontFamily: "var(--display)", fontSize: isMob ? 36 : 58, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, marginBottom: 16 }}>
                Let's Build<br /><span className="gradient-text">Something</span>
              </h2>
              <p style={{ fontSize: 15, color: "var(--text-dim)", maxWidth: 400, margin: "0 auto" }}>
                Open to AI/ML Engineer &amp; Data Science roles.<br />Available immediately — open to relocation.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <button onClick={copyEmail} className="contact-cta">
                nikhilpatil1104@gmail.com
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              </button>
              <a href="mailto:nikhilpatil1104@gmail.com" className="contact-send" aria-label="Send email">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </a>
            </div>
            {copied && (
              <p style={{ textAlign: "center", fontSize: 12, color: "#34D399", fontWeight: 600, fontFamily: "var(--mono)", marginBottom: 8, letterSpacing: 0.5 }}>✓ Copied to clipboard</p>
            )}
          </Reveal>
          <Reveal delay={0.18}>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "LinkedIn", href: "https://www.linkedin.com/in/nikhilpatil7/", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
                { label: "GitHub", href: "https://github.com/nikhilpatil1104", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="social-link">
                  {l.icon}{l.label}
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "28px 56px", borderTop: "1px solid var(--border)", background: "var(--bg2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15 }}>Nikhil Patil</span>
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>© 2026 — Built from scratch, no templates.</span>
          <a href="#hero" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "var(--text-dim)", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 15l7-7 7 7"/></svg>
            Top
          </a>
        </div>
      </footer>
    </>
  );
}
