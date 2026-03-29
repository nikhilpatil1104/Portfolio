import { useState, useEffect, useRef } from "react";

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

function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const v = useOnScreen(ref);
  return (
    <div ref={ref} style={{
      ...style, opacity: v ? 1 : 0,
      transform: v ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.8s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>{children}</div>
  );
}

function Typewriter({ words, speed = 80, pause = 2200 }) {
  const [text, setText] = useState("");
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = words[wi];
    if (!del && ci === w.length) { setTimeout(() => setDel(true), pause); return; }
    if (del && ci === 0) { setDel(false); setWi((i) => (i + 1) % words.length); return; }
    const t = setTimeout(() => {
      setText(w.substring(0, del ? ci - 1 : ci + 1));
      setCi((c) => c + (del ? -1 : 1));
    }, del ? speed / 2 : speed);
    return () => clearTimeout(t);
  }, [ci, del, wi, words, speed, pause]);
  return <span>{text}<span style={{ borderRight: "2px solid currentColor", marginLeft: 1, animation: "blink 1s step-end infinite" }}>&thinsp;</span></span>;
}

function Particles({ dark }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); let id;
    let w, h; const ps = []; const N = 45;
    function resize() { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; }
    resize(); window.addEventListener("resize", resize);
    for (let i = 0; i < N; i++) ps.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: Math.random() * 1.5 + .5 });
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const col = dark ? "100,200,255" : "37,99,235";
      ps.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},0.3)`; ctx.fill();
      });
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) { ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y); ctx.strokeStyle = `rgba(${col},${(0.08 * (1 - d / 100)).toFixed(3)})`; ctx.lineWidth = .5; ctx.stroke(); }
      }
      id = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, [dark]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

export default function Portfolio() {
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [scrollY, setScrollY] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [formMsg, setFormMsg] = useState("");
  const [isMob, setIsMob] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onResize = () => setIsMob(window.innerWidth < 768);
    onResize(); onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
  }, []);

  const A = dark ? "#06B6D4" : "#0891B2";
  const A2 = dark ? "#818CF8" : "#6366F1";
  const bg = dark ? "#09090B" : "#FAFAFA";
  const bg2 = dark ? "#0F0F12" : "#FFFFFF";
  const text = dark ? "#FAFAFA" : "#09090B";
  const textDim = dark ? "rgba(250,250,250,0.55)" : "rgba(9,9,11,0.5)";
  const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const cardBg = dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)";
  const pad = isMob ? "64px 20px" : "100px 64px";

  const projects = [
    {
      title: "Insurance AI Research Agent",
      tag: "AI AGENT", tagColor: "#06B6D4", icon: "🤖", category: "AI",
      description: "Designed and built a custom four-step agentic AI loop from scratch — no external agent frameworks used. The system performs intelligent intent classification, makes autonomous search decisions, retrieves real-time insurance data via DuckDuckGo API, and synthesizes comprehensive answers through LLM-powered generation.",
      tech: ["OpenAI API", "Streamlit", "DuckDuckGo API", "Python", "Agentic AI"],
      highlights: ["Custom Agentic Loop", "No Frameworks", "Real-time Retrieval"],
      github: "https://github.com/nikhilpatil1104/AI-Agent-For-Insurance-Research",
    },
    {
      title: "RAG Insurance Policy Q&A — PlymBot",
      tag: "AI / RAG", tagColor: "#818CF8", icon: "📄", category: "AI",
      description: "Built an AI-powered Retrieval-Augmented Generation application for natural language querying of insurance policy documents. Implemented FAISS vector embeddings for semantic search, integrated GPT-4o-mini for answer synthesis, and added production-grade guardrails. Deployed to Streamlit Community Cloud.",
      tech: ["LangChain", "FAISS", "GPT-4o-mini", "Streamlit", "RAG", "Vector DB"],
      highlights: ["Deployed to Cloud", "Guardrails Built-in", "Semantic Search"],
      github: "https://github.com/nikhilpatil1104/Insurance-Policy-Bot",
    },
    {
      title: "Glaucoma Detection Model",
      tag: "DEEP LEARNING", tagColor: "#F472B6", icon: "🧠", category: "AI",
      description: "End-to-end CNN-based glaucoma detection from retinal fundus images achieving 94% accuracy. Leveraged VGG16 transfer learning and custom augmentation pipeline that increased dataset diversity 3×, reduced overfitting by 25%, and cut training time by 40% with GPU optimization.",
      tech: ["PyTorch", "VGG16", "CNN", "Transfer Learning", "ROC-AUC", "Git"],
      highlights: ["94% Accuracy", "+15% Sensitivity", "3× Dataset Diversity"],
      github: "https://github.com/nikhilpatil1104/Detection-of-Glaucoma-Disease-using-Image-Processing-SoftComputing-DeepLearningApproaches-",
    },
    {
      title: "Climate Impact Prediction — Regression Models",
      tag: "AI / ML", tagColor: "#34D399", icon: "🌍", category: "ML",
      description: "Multivariate OLS and Poisson regression models forecasting rainfall, sea-level rise, and extreme weather through 2050. Achieved R² = 0.85 with multi-decade environmental features. Built reusable ML pipelines improving country-level forecast precision by 22%.",
      tech: ["Python", "Scikit-learn", "OLS Regression", "Poisson GLM", "Pandas"],
      highlights: ["R² = 0.85", "+20% Accuracy", "Reusable Pipelines"],
      github: "https://github.com/nikhilpatil1104/Climate-Impact-Prediction",
    },
    {
      title: "E-Commerce Price Intelligence Platform",
      tag: "FULL STACK", tagColor: "#FBBF24", icon: "🛒", category: "Web",
      description: "Automated web scraping system aggregating real-time pricing across 10+ e-commerce platforms, processing 100,000+ product records. Optimized MySQL schema with strategic indexing cutting query time by 40%. Built price tracking algorithms reducing customer search time by 50%.",
      tech: ["Selenium", "BeautifulSoup", "MySQL", "React", "ETL"],
      highlights: ["100K+ Products", "40% Faster Queries", "50% Time Saved"],
      github: "https://github.com/nikhilpatil1104/Price-Comparison-Website",
    },
  ];

  const filtered = filter === "All" ? projects : projects.filter(p => p.category === filter);

  const skillGroups = [
    { title: "AI & Machine Learning", icon: "🤖", tags: ["Agentic AI", "RAG Systems", "LLM APIs (OpenAI, GPT-4)", "LangChain", "Prompt Engineering", "Transfer Learning", "CNNs", "PyTorch", "Scikit-learn", "AutoML"] },
    { title: "Statistical Modeling", icon: "📊", tags: ["Bayesian Statistics", "Econometrics", "Predictive Modeling", "OLS / Poisson / Multivariate Regression", "Hypothesis & A/B Testing", "EDA", "Pure Premium Modeling"] },
    { title: "Data Engineering & Tools", icon: "⚙️", tags: ["Python", "SQL", "MongoDB (NoSQL)", "Pandas", "NumPy", "ETL Pipelines", "Git", "AWS (basic)", "R (basic)", "FAISS / Vector DBs"] },
    { title: "BI & Visualization", icon: "📈", tags: ["Power BI", "Tableau", "Interactive Dashboards", "Business Intelligence", "Streamlit Deployment"] },
    { title: "Domain Expertise", icon: "🏢", tags: ["Insurance Analytics", "Customer Lifetime Value", "Pricing Strategy", "Risk Assessment", "Loss Trend Forecasting", "Underwriting Analytics"] },
  ];

  const experiences = [
    {
      date: "May 2025 – Jul 2025", role: "Data Analyst", company: "Buildstone Realty Advisors",
      bullets: [
        "Spearheaded Power BI dashboards visualizing CLV and risk metrics, reducing reporting time by 40% and accelerating cross-functional decision-making.",
        "Engineered resilient ETL pipelines for insurance analytics, slashing manual handling time by 60% and increasing workflow reliability.",
        "Applied econometrics and Bayesian techniques with scikit-learn to develop predictive models for CLV and pure premium modeling, improving decision efficiency by 35%.",
        "Translated complex predictive modeling concepts into actionable insights for stakeholders aligned with pricing strategy and underwriting guidelines.",
      ],
    },
    {
      date: "Sep 2024 – Apr 2025", role: "Data Management Intern", company: "Buildstone Realty Advisors",
      bullets: [
        "Managed 50,000+ property records in MySQL and MongoDB with automated validation routines sustaining 99% data accuracy.",
        "Architected scalable ETL processes using Python and Git, enabling the analytics team to deliver insights 40% faster.",
        "Developed automated data cleaning and validation scripts, improving processing speed by 70%.",
      ],
    },
  ];

  const certs = [
    { name: "Generative AI Essentials: Using LLMs to Work with Data", org: "IBM SkillsBuild", icon: "🧬" },
    { name: "Enterprise Data Science in Practice", org: "IBM SkillsBuild", icon: "📡" },
    { name: "Python For Beginners", org: "Udemy", icon: "🐍" },
    { name: "Automated Machine Learning For Beginners", org: "Udemy", icon: "⚡" },
  ];

  const navLinks = ["About", "Skills", "Experience", "Projects", "Education", "Contact"];

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) { setFormMsg("Please fill in all fields."); return; }
    window.open(`mailto:nikhilpatil1104@gmail.com?subject=Portfolio Contact from ${form.name}&body=${encodeURIComponent(form.message + "\n\nFrom: " + form.name + "\nEmail: " + form.email)}`);
    setFormMsg("Opening your email client..."); setForm({ name: "", email: "", message: "" });
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", color: text, background: bg, minHeight: "100vh", overflowX: "hidden", transition: "background 0.4s, color 0.4s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes blink { 50% { opacity: 0 } }
        * { margin: 0; padding: 0; box-sizing: border-box; scrollbar-width: none !important; -ms-overflow-style: none !important; }
        *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        html { scroll-behavior: smooth; overflow-x: hidden; scrollbar-width: none !important; -ms-overflow-style: none !important; }
        html::-webkit-scrollbar { display: none !important; width: 0 !important; }
        body { overflow-x: hidden; scrollbar-width: none !important; -ms-overflow-style: none !important; }
        body::-webkit-scrollbar { display: none !important; width: 0 !important; }
        a { color: inherit; }
        ::selection { background: ${A}33; }
        input, textarea { font-family: 'Outfit', sans-serif; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrollY > 60 ? (dark ? "rgba(9,9,11,0.82)" : "rgba(250,250,250,0.82)") : "transparent",
        backdropFilter: scrollY > 60 ? "blur(24px) saturate(1.8)" : "none",
        borderBottom: scrollY > 60 ? `1px solid ${border}` : "none",
        transition: "all 0.35s", padding: isMob ? "14px 20px" : "16px 48px",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="#" style={{ textDecoration: "none", fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
            <span style={{ color: A }}>nikhil</span><span style={{ opacity: 0.4 }}>patil</span>
          </a>
          {!isMob && (
            <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
              {navLinks.map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} style={{ textDecoration: "none", fontSize: 13, fontWeight: 500, letterSpacing: 0.3, opacity: 0.55, transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.55}>{l}</a>
              ))}
              <a href="https://github.com/nikhilpatil1104" target="_blank" rel="noopener noreferrer" style={{ opacity: 0.55, transition: "opacity 0.2s", display: "flex", alignItems: "center" }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.55}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/nikhilpatil7/" target="_blank" rel="noopener noreferrer" style={{ opacity: 0.55, transition: "opacity 0.2s", display: "flex", alignItems: "center" }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.55}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <button onClick={() => setDark(!dark)} style={{
                background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: `1px solid ${border}`,
                borderRadius: 8, padding: "7px 10px", cursor: "pointer", fontSize: 14, color: text, transition: "all 0.2s", display: "flex", alignItems: "center",
              }}>{dark ? "☀️" : "🌙"}</button>
            </div>
          )}
          {isMob && (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: text }}>{dark ? "☀️" : "🌙"}</button>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: text }}>{menuOpen ? "✕" : "☰"}</button>
            </div>
          )}
        </div>
        {isMob && menuOpen && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: dark ? "rgba(9,9,11,0.95)" : "rgba(250,250,250,0.95)", backdropFilter: "blur(20px)", padding: 20, borderBottom: `1px solid ${border}` }}>
            {navLinks.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 0", textDecoration: "none", fontSize: 15, fontWeight: 500, borderBottom: `1px solid ${border}` }}>{l}</a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", padding: isMob ? "120px 20px 60px" : "0 64px", overflow: "hidden" }}>
        <Particles dark={dark} />
        <div style={{ position: "absolute", top: "10%", right: isMob ? "-20%" : "8%", width: isMob ? 350 : 500, height: isMob ? 350 : 500, borderRadius: "50%", background: `radial-gradient(circle, ${A}10, ${A2}08, transparent 70%)`, filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1120, width: "100%", margin: "0 auto" }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28,
              padding: "6px 16px 6px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
              background: dark ? "rgba(6,182,212,0.08)" : "rgba(6,182,212,0.06)",
              border: `1px solid ${A}25`, color: A,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 8px #34D39966", flexShrink: 0 }} />
              Open to AI & Data Science Roles
            </div>
            <h1 style={{ fontSize: isMob ? 42 : 68, fontWeight: 900, lineHeight: 1.02, letterSpacing: -2, marginBottom: 12 }}>Nikhil Patil</h1>
            <h2 style={{ fontSize: isMob ? 18 : 26, fontWeight: 400, opacity: 0.5, marginBottom: 28, minHeight: 34 }}>
              <Typewriter words={["AI Engineer & Researcher", "Building Agentic AI Systems", "Predictive Modeling & Bayesian Analysis", "Insurance Analytics & CLV Expert"]} />
            </h2>
            <p style={{ fontSize: isMob ? 14 : 16, lineHeight: 1.85, color: textDim, maxWidth: 560, marginBottom: 36 }}>
              Graduate Data Science student at UMBC building AI-powered systems — from agentic research agents and RAG applications to deep learning models and predictive analytics pipelines.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 52 }}>
              <a href="#projects" style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 10,
                background: `linear-gradient(135deg, ${A}, ${A2})`, color: "#fff", textDecoration: "none",
                fontWeight: 600, fontSize: 14, transition: "transform 0.2s, box-shadow 0.2s", boxShadow: `0 4px 24px ${A}30`,
              }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${A}45`; }}
                 onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 4px 24px ${A}30`; }}>
                View AI Projects <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17l9.2-9.2M17 17V8H8"/></svg>
              </a>
              <a href="#contact" style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 10,
                border: `1.5px solid ${border}`, background: "transparent", textDecoration: "none",
                fontWeight: 600, fontSize: 14, transition: "all 0.2s", color: text,
              }} onMouseEnter={e => e.currentTarget.style.borderColor = A} onMouseLeave={e => e.currentTarget.style.borderColor = border}>Get in Touch</a>
              <a href="/Data Science V5 (Nikhil Patil)" download style={{
                display: "inline-flex", alignItems: "center", gap: 6, padding: "13px 28px", borderRadius: 10,
                border: `1.5px solid ${border}`, background: "transparent", textDecoration: "none",
                fontWeight: 600, fontSize: 14, transition: "all 0.2s", color: text,
              }} onMouseEnter={e => e.currentTarget.style.borderColor = A} onMouseLeave={e => e.currentTarget.style.borderColor = border}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Resume
              </a>
            </div>
            <div style={{ display: "flex", gap: isMob ? 24 : 48, flexWrap: "wrap" }}>
              {[
                { val: "3.80", label: "GPA at UMBC" }, { val: "5+", label: "AI/ML Projects" },
                { val: "94%", label: "Model Accuracy" }, { val: "50K+", label: "Records Processed" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, background: `linear-gradient(135deg, ${A}, ${A2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: textDim, marginTop: 2, fontWeight: 500, letterSpacing: 0.3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding: pad, background: bg2 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Reveal>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: A, display: "block", marginBottom: 12 }}>About</span>
            <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 48, alignItems: "start" }}>
              <div>
                <h2 style={{ fontSize: isMob ? 26 : 36, fontWeight: 800, lineHeight: 1.15, letterSpacing: -0.8, marginBottom: 24 }}>
                  AI-First Thinker.<br /><span style={{ color: A }}>Data-Driven Builder.</span>
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.9, color: textDim, marginBottom: 14 }}>
                  I'm pursuing an M.S. in Data Science at UMBC with a 3.80 GPA, specializing in AI systems, Bayesian statistics, and econometric analysis. My work sits at the intersection of artificial intelligence and business impact.
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.9, color: textDim, marginBottom: 14 }}>
                  At Buildstone Realty Advisors, I built ETL pipelines, Power BI dashboards, and predictive models for customer lifetime value and insurance pricing — cutting reporting time by 40% and improving decision efficiency by 35%.
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.9, color: textDim }}>
                  I build agentic AI systems, RAG applications, and deep learning models. I communicate complex AI findings to both technical and non-technical stakeholders to drive data-informed decisions.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { icon: "🤖", title: "AI & LLMs", text: "Agentic AI, RAG, GPT-4" },
                  { icon: "📊", title: "Statistics", text: "Bayesian, Econometrics" },
                  { icon: "🎓", title: "Education", text: "M.S. Data Science, UMBC" },
                  { icon: "📍", title: "Location", text: "Baltimore, MD" },
                  { icon: "💼", title: "Experience", text: "Data Analyst + AI Builder" },
                  { icon: "🎯", title: "Domain", text: "Insurance Analytics, CLV" },
                ].map(item => (
                  <div key={item.title} style={{
                    background: cardBg, borderRadius: 12, padding: 18, border: `1px solid ${border}`, transition: "border-color 0.3s",
                  }} onMouseEnter={e => e.currentTarget.style.borderColor = A + "40"} onMouseLeave={e => e.currentTarget.style.borderColor = border}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: textDim, lineHeight: 1.4 }}>{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" style={{ padding: pad }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Reveal>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: A, display: "block", marginBottom: 12 }}>Technical Arsenal</span>
            <h2 style={{ fontSize: isMob ? 26 : 36, fontWeight: 800, letterSpacing: -0.8, marginBottom: 44 }}>Skills & Technologies</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {skillGroups.map((g, gi) => (
              <Reveal key={g.title} delay={gi * 0.06}>
                <div style={{
                  background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 24, transition: "border-color 0.3s", height: "100%",
                }} onMouseEnter={e => e.currentTarget.style.borderColor = A + "30"} onMouseLeave={e => e.currentTarget.style.borderColor = border}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: 20 }}>{g.icon}</span>
                    <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>{g.title}</h3>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {g.tags.map(t => (
                      <span key={t} style={{
                        fontSize: 11, fontWeight: 500, padding: "5px 12px", borderRadius: 100,
                        background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                        border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                        transition: "all 0.25s", cursor: "default",
                      }} onMouseEnter={e => { e.target.style.background = A + "15"; e.target.style.borderColor = A + "30"; e.target.style.color = A; }}
                         onMouseLeave={e => { e.target.style.background = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"; e.target.style.borderColor = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"; e.target.style.color = text; }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" style={{ padding: pad, background: bg2 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Reveal>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: A, display: "block", marginBottom: 12 }}>Career</span>
            <h2 style={{ fontSize: isMob ? 26 : 36, fontWeight: 800, letterSpacing: -0.8, marginBottom: 44 }}>Professional Experience</h2>
          </Reveal>
          <div style={{ maxWidth: 760 }}>
            {experiences.map((exp, idx) => {
              const ref = useRef(null);
              const vis = useOnScreen(ref);
              return (
                <div ref={ref} key={idx} style={{
                  display: "flex", gap: isMob ? 16 : 24,
                  opacity: vis ? 1 : 0, transform: vis ? "none" : "translateX(-20px)",
                  transition: `all 0.7s cubic-bezier(.16,1,.3,1) ${idx * 0.15}s`,
                }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 16, flexShrink: 0 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: A, border: `3px solid ${bg2}`, boxShadow: `0 0 0 2px ${A}`, flexShrink: 0 }} />
                    <div style={{ width: 1.5, flex: 1, background: border }} />
                  </div>
                  <div style={{ paddingBottom: 40 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: A, letterSpacing: 1.5, textTransform: "uppercase" }}>{exp.date}</span>
                    <h3 style={{ fontSize: 19, fontWeight: 800, marginTop: 4, marginBottom: 2, letterSpacing: -0.3 }}>{exp.role}</h3>
                    <p style={{ fontSize: 13, fontWeight: 500, color: textDim, marginBottom: 14 }}>{exp.company}</p>
                    {exp.bullets.map((b, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7, fontSize: 13, lineHeight: 1.75, color: textDim }}>
                        <span style={{ color: A, marginTop: 7, flexShrink: 0, fontSize: 5 }}>●</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" style={{ padding: pad }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Reveal>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: A, display: "block", marginBottom: 12 }}>Portfolio</span>
            <h2 style={{ fontSize: isMob ? 26 : 36, fontWeight: 800, letterSpacing: -0.8, marginBottom: 8 }}>AI & ML Projects</h2>
            <p style={{ fontSize: 14, color: textDim, marginBottom: 28, maxWidth: 500 }}>Hands-on AI systems — from agentic architectures and RAG pipelines to deep learning and predictive analytics.</p>
          </Reveal>
          <Reveal delay={0.06}>
            <div style={{ display: "flex", gap: 6, marginBottom: 32, flexWrap: "wrap" }}>
              {["All", "AI", "ML", "Web"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "7px 18px", borderRadius: 100, border: filter === f ? "none" : `1px solid ${border}`,
                  background: filter === f ? `linear-gradient(135deg, ${A}, ${A2})` : "transparent",
                  color: filter === f ? "#fff" : text, fontWeight: 600, fontSize: 12, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.25s", letterSpacing: 0.3,
                }}>{f === "All" ? "All Projects" : f}</button>
              ))}
            </div>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map((p, i) => {
              const ref = useRef(null);
              const vis = useOnScreen(ref);
              const [hov, setHov] = useState(false);
              return (
                <div ref={ref} key={p.title} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
                  background: cardBg, border: `1px solid ${hov ? A + "30" : border}`, borderRadius: 16, padding: isMob ? 22 : 32,
                  opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
                  transition: `opacity 0.6s ease ${i * 0.07}s, transform 0.6s ease ${i * 0.07}s, border-color 0.3s, box-shadow 0.3s`,
                  boxShadow: hov ? `0 8px 32px ${A}06` : "none",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMob ? "flex-start" : "center", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 26 }}>{p.icon}</span>
                      <div>
                        <h3 style={{ fontSize: isMob ? 17 : 20, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1.25 }}>{p.title}</h3>
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                          color: p.tagColor, background: p.tagColor + "12", padding: "2px 8px", borderRadius: 100, marginTop: 4, display: "inline-block",
                        }}>{p.tag}</span>
                      </div>
                    </div>
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noopener noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11,
                        fontWeight: 600, color: A, textDecoration: "none", padding: "5px 12px",
                        borderRadius: 8, border: `1px solid ${A}25`, transition: "all 0.2s", flexShrink: 0,
                      }} onMouseEnter={e => e.currentTarget.style.background = A + "10"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                        GitHub
                      </a>
                    )}
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.8, color: textDim, marginBottom: 16, maxWidth: 780 }}>{p.description}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                    {p.tech.map(t => (
                      <span key={t} style={{
                        fontSize: 10, fontWeight: 500, padding: "4px 10px", borderRadius: 100,
                        background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                      }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {p.highlights.map(h => (
                      <span key={h} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: p.tagColor }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section id="education" style={{ padding: pad, background: bg2 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Reveal>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: A, display: "block", marginBottom: 12 }}>Academic</span>
            <h2 style={{ fontSize: isMob ? 26 : 36, fontWeight: 800, letterSpacing: -0.8, marginBottom: 44 }}>Education</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 16, maxWidth: 860, marginBottom: 48 }}>
            {[
              { school: "University of Maryland Baltimore County", degree: "M.S., Data Science", year: "Expected May 2027", gpa: "3.80", courses: "Bayesian Statistics, Econometrics, Machine Learning & Gen AI, Big Data, Statistical Modeling", icon: "🎓" },
              { school: "University of Mumbai", degree: "B.E., Electronics & Computer Science", year: "Jun 2025", gpa: "3.33", courses: "ML, Deep Learning, NLP, Database Management, AI", icon: "🏛️" },
            ].map((edu, i) => (
              <Reveal key={edu.school} delay={i * 0.1}>
                <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 26, height: "100%" }}>
                  <span style={{ fontSize: 30 }}>{edu.icon}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: 10, marginBottom: 3, lineHeight: 1.3 }}>{edu.school}</h3>
                  <p style={{ fontSize: 13, fontWeight: 600, color: A, marginBottom: 10 }}>{edu.degree}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 11, color: textDim }}>
                    <span>{edu.year}</span><span style={{ fontWeight: 700, color: A2 }}>GPA: {edu.gpa}</span>
                  </div>
                  <p style={{ fontSize: 11, lineHeight: 1.7, color: textDim }}><span style={{ fontWeight: 600, color: text, opacity: 0.7 }}>Coursework:</span> {edu.courses}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 20 }}>Certifications</h3>
            <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
              {certs.map(c => (
                <div key={c.name} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: 18, textAlign: "center" }}>
                  <span style={{ fontSize: 24, display: "block", marginBottom: 6 }}>{c.icon}</span>
                  <p style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.4, marginBottom: 4 }}>{c.name}</p>
                  <p style={{ fontSize: 10, color: textDim }}>{c.org}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: pad }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: A, display: "block", marginBottom: 12 }}>Contact</span>
              <h2 style={{ fontSize: isMob ? 26 : 36, fontWeight: 800, letterSpacing: -0.8, marginBottom: 10 }}>Let's Build Something <span style={{ color: A }}>Intelligent</span></h2>
              <p style={{ fontSize: 13, color: textDim, lineHeight: 1.7 }}>Open to AI Engineering, Data Science, and ML roles. Let's discuss how I can bring impact to your team.</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: isMob ? 22 : 32 }}>
              {["name", "email"].map(f => (
                <input key={f} type={f === "email" ? "email" : "text"} placeholder={f === "name" ? "Your Name" : "Your Email"} value={form[f]}
                  onChange={e => setForm({ ...form, [f]: e.target.value })}
                  style={{
                    width: "100%", padding: "12px 16px", marginBottom: 10, borderRadius: 10,
                    border: `1px solid ${border}`, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    color: text, fontSize: 13, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
                  }} onFocus={e => e.target.style.borderColor = A} onBlur={e => e.target.style.borderColor = border} />
              ))}
              <textarea placeholder="Your Message" rows={4} value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                style={{
                  width: "100%", padding: "12px 16px", marginBottom: 12, borderRadius: 10,
                  border: `1px solid ${border}`, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                  color: text, fontSize: 13, resize: "vertical", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
                }} onFocus={e => e.target.style.borderColor = A} onBlur={e => e.target.style.borderColor = border} />
              <button onClick={handleSubmit} style={{
                width: "100%", padding: "13px", borderRadius: 10, border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: 14, background: `linear-gradient(135deg, ${A}, ${A2})`,
                color: "#fff", fontFamily: "inherit", boxShadow: `0 4px 20px ${A}20`, transition: "transform 0.2s",
              }} onMouseEnter={e => e.target.style.transform = "translateY(-1px)"} onMouseLeave={e => e.target.style.transform = ""}>Send Message</button>
              {formMsg && <p style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: A, fontWeight: 500 }}>{formMsg}</p>}
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 24, flexWrap: "wrap" }}>
              {[
                { label: "nikhilpatil1104@gmail.com", href: "mailto:nikhilpatil1104@gmail.com", icon: "✉️" },
                { label: "LinkedIn", href: "https://www.linkedin.com/in/nikhilpatil7/", icon: "🔗" },
                { label: "GitHub", href: "https://github.com/nikhilpatil1104", icon: "💻" },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500,
                  textDecoration: "none", color: textDim, transition: "color 0.2s",
                }} onMouseEnter={e => e.currentTarget.style.color = A} onMouseLeave={e => e.currentTarget.style.color = textDim}>
                  {l.icon} {l.label}
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "24px 20px", borderTop: `1px solid ${border}`, textAlign: "center", background: bg2 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginBottom: 10, alignItems: "center" }}>
          <a href="https://www.linkedin.com/in/nikhilpatil7/" target="_blank" rel="noopener noreferrer" style={{ color: textDim, transition: "color 0.2s", display: "flex", alignItems: "center" }}
            onMouseEnter={e => e.currentTarget.style.color = A} onMouseLeave={e => e.currentTarget.style.color = textDim}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="https://github.com/nikhilpatil1104" target="_blank" rel="noopener noreferrer" style={{ color: textDim, transition: "color 0.2s", display: "flex", alignItems: "center" }}
            onMouseEnter={e => e.currentTarget.style.color = A} onMouseLeave={e => e.currentTarget.style.color = textDim}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <a href="mailto:nikhilpatil1104@gmail.com" style={{ color: textDim, transition: "color 0.2s", display: "flex", alignItems: "center" }}
            onMouseEnter={e => e.currentTarget.style.color = A} onMouseLeave={e => e.currentTarget.style.color = textDim}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/></svg>
          </a>
        </div>
        <p style={{ fontSize: 11, color: textDim }}>© 2026 Nikhil Patil. Built with precision.</p>
      </footer>
    </div>
  );
}