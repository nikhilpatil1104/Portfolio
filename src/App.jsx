import { useState, useEffect, useRef, useCallback } from "react";

function useOnScreen(ref, threshold = 0.1) {
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

function useMouse() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return pos;
}

function Reveal({ children, delay = 0, direction = "up", style = {} }) {
  const ref = useRef(null);
  const v = useOnScreen(ref);
  const t = { up: "translateY(40px)", left: "translateX(40px)", right: "translateX(-40px)" };
  return (
    <div ref={ref} style={{ ...style, opacity: v ? 1 : 0, transform: v ? "translate(0)" : (t[direction] || t.up), transition: `opacity 0.9s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.9s cubic-bezier(.16,1,.3,1) ${delay}s` }}>{children}</div>
  );
}

function Typewriter({ words, speed = 70, pause = 2400 }) {
  const [text, setText] = useState("");
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = words[wi];
    if (!del && ci === w.length) { setTimeout(() => setDel(true), pause); return; }
    if (del && ci === 0) { setDel(false); setWi((i) => (i + 1) % words.length); return; }
    const t = setTimeout(() => { setText(w.substring(0, del ? ci - 1 : ci + 1)); setCi((c) => c + (del ? -1 : 1)); }, del ? speed / 2.5 : speed);
    return () => clearTimeout(t);
  }, [ci, del, wi, words, speed, pause]);
  return <span>{text}<span style={{ borderRight: "2px solid currentColor", marginLeft: 2, animation: "blink 1s step-end infinite" }}>&thinsp;</span></span>;
}

function Starfield({ dark }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); let id;
    let w, h; const stars = []; const N = 180; const shooting = [];
    function resize() { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; }
    resize(); window.addEventListener("resize", resize);
    for (let i = 0; i < N; i++) stars.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 0.3, b: Math.random() * 0.5 + 0.5, ts: Math.random() * 0.02 + 0.005, tp: Math.random() * Math.PI * 2 });
    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h); frame++;
      stars.forEach(s => {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame * s.ts + s.tp));
        const a = s.b * tw;
        ctx.fillStyle = dark ? `rgba(200,220,255,${a})` : `rgba(50,80,160,${a * 0.3})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        if (s.r > 1.2 && dark) {
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
          g.addColorStop(0, `rgba(140,180,255,${a * 0.25})`); g.addColorStop(1, "transparent");
          ctx.fillStyle = g; ctx.fill();
        }
      });
      if (Math.random() < 0.003 && shooting.length < 2) shooting.push({ x: Math.random() * w, y: Math.random() * h * 0.3, vx: 4 + Math.random() * 4, vy: 2 + Math.random() * 2, life: 60, ml: 60 });
      for (let i = shooting.length - 1; i >= 0; i--) {
        const ss = shooting[i]; ss.x += ss.vx; ss.y += ss.vy; ss.life--;
        const a = ss.life / ss.ml;
        ctx.beginPath(); ctx.moveTo(ss.x, ss.y); ctx.lineTo(ss.x - ss.vx * 8, ss.y - ss.vy * 8);
        const gr = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * 8, ss.y - ss.vy * 8);
        gr.addColorStop(0, `rgba(200,230,255,${a * 0.8})`); gr.addColorStop(1, "transparent");
        ctx.strokeStyle = gr; ctx.lineWidth = 1.5; ctx.stroke();
        if (ss.life <= 0) shooting.splice(i, 1);
      }
      if (dark) { for (let i = 0; i < stars.length; i++) { for (let j = i + 1; j < stars.length; j++) { if (stars[i].r < 1 || stars[j].r < 1) continue; const dx = stars[i].x - stars[j].x, dy = stars[i].y - stars[j].y, d = Math.sqrt(dx * dx + dy * dy); if (d < 80) { ctx.beginPath(); ctx.moveTo(stars[i].x, stars[i].y); ctx.lineTo(stars[j].x, stars[j].y); ctx.strokeStyle = `rgba(140,180,255,${0.04 * (1 - d / 80)})`; ctx.lineWidth = 0.4; ctx.stroke(); } } } }
      id = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, [dark]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

function MouseGlow({ mouse, dark }) {
  if (!dark) return null;
  return <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(6,182,212,0.06), transparent 50%)`, transition: "background 0.15s ease" }} />;
}

function MagButton({ children, href, style: s, ...props }) {
  const ref = useRef(null);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const Tag = href ? "a" : "button";
  return (
    <Tag ref={ref} href={href} {...props}
      onMouseMove={e => { const r = ref.current.getBoundingClientRect(); setOff({ x: (e.clientX - r.left - r.width / 2) * 0.15, y: (e.clientY - r.top - r.height / 2) * 0.15 }); }}
      onMouseLeave={() => setOff({ x: 0, y: 0 })}
      style={{ ...s, transform: `translate(${off.x}px, ${off.y}px)`, transition: "transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s, background 0.3s" }}>
      {children}
    </Tag>
  );
}

function SkillTag({ label, dark, A, text }) {
  const [h, setH] = useState(false);
  return <span onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ fontSize: 11, fontWeight: 500, padding: "6px 14px", borderRadius: 100, background: h ? A + "18" : (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"), border: `1px solid ${h ? A + "35" : (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)")}`, color: h ? A : text, transition: "all 0.3s cubic-bezier(.16,1,.3,1)", cursor: "default", transform: h ? "translateY(-2px)" : "none", display: "inline-block" }}>{label}</span>;
}

export default function Portfolio() {
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [scrollY, setScrollY] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [formMsg, setFormMsg] = useState("");
  const [isMob, setIsMob] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const mouse = useMouse();

  useEffect(() => { setLoaded(true); const onS = () => setScrollY(window.scrollY); const onR = () => setIsMob(window.innerWidth < 768); onR(); onS(); window.addEventListener("scroll", onS, { passive: true }); window.addEventListener("resize", onR); return () => { window.removeEventListener("scroll", onS); window.removeEventListener("resize", onR); }; }, []);

  const A = dark ? "#06B6D4" : "#0891B2", A2 = dark ? "#818CF8" : "#6366F1";
  const bg = dark ? "#0C0E14" : "#FAFAFA", bg2 = dark ? "#10131A" : "#FFFFFF";
  const text = dark ? "#E8ECF4" : "#09090B", textDim = dark ? "rgba(232,236,244,0.5)" : "rgba(9,9,11,0.45)";
  const border = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const cardBg = dark ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.9)";
  const pad = isMob ? "72px 20px" : "110px 64px";

  const projects = [
    { title: "Insurance AI Research Agent", tag: "AI AGENT", tagColor: "#06B6D4", icon: "\u{1F916}", category: "AI", description: "Custom four-step agentic AI loop built from scratch \u2014 no external frameworks. Intent classification \u2192 search decision \u2192 DuckDuckGo retrieval \u2192 LLM synthesis. Handles complex multi-turn insurance research queries.", tech: ["OpenAI API", "Streamlit", "DuckDuckGo API", "Python", "Agentic AI"], highlights: ["Custom Agentic Loop", "No Frameworks", "Real-time Retrieval"], github: "https://github.com/nikhilpatil1104/AI-Agent-For-Insurance-Research" },
    { title: "RAG Insurance Policy Q&A \u2014 PlymBot", tag: "AI / RAG", tagColor: "#818CF8", icon: "\u{1F4C4}", category: "AI", description: "AI-powered RAG application for querying insurance policy documents. FAISS vector embeddings for semantic search, GPT-4o-mini for answer synthesis, production-grade guardrails. Deployed to Streamlit Community Cloud.", tech: ["LangChain", "FAISS", "GPT-4o-mini", "Streamlit", "RAG", "Vector DB"], highlights: ["Deployed to Cloud", "Guardrails Built-in", "Semantic Search"], github: "https://github.com/nikhilpatil1104/Insurance-Policy-Bot" },
    { title: "Glaucoma Detection Model", tag: "DEEP LEARNING", tagColor: "#F472B6", icon: "\u{1F9E0}", category: "AI", description: "End-to-end CNN glaucoma detection from retinal fundus images \u2014 94% accuracy. VGG16 transfer learning, custom augmentation pipeline increasing dataset diversity 3\u00D7, reducing overfitting 25%.", tech: ["PyTorch", "VGG16", "CNN", "Transfer Learning", "ROC-AUC", "Git"], highlights: ["94% Accuracy", "+15% Sensitivity", "3\u00D7 Dataset Diversity"], github: "https://github.com/nikhilpatil1104/Detection-of-Glaucoma-Disease-using-Image-Processing-SoftComputing-DeepLearningApproaches-" },
    { title: "Climate Impact Prediction", tag: "AI / ML", tagColor: "#34D399", icon: "\u{1F30D}", category: "ML", description: "Multivariate OLS and Poisson regression models forecasting rainfall, sea-level rise, extreme weather through 2050. R\u00B2 = 0.85 with multi-decade environmental features. Reusable ML pipelines.", tech: ["Python", "Scikit-learn", "OLS Regression", "Poisson GLM", "Pandas"], highlights: ["R\u00B2 = 0.85", "+20% Accuracy", "Reusable Pipelines"], github: "https://github.com/nikhilpatil1104/Climate-Impact-Prediction" },
    { title: "E-Commerce Price Intelligence", tag: "FULL STACK", tagColor: "#FBBF24", icon: "\u{1F6D2}", category: "Web", description: "Automated web scraping aggregating real-time pricing across 10+ platforms, processing 100K+ records. Optimized MySQL schema cutting query time 40%. Price tracking algorithms reducing search time 50%.", tech: ["Selenium", "BeautifulSoup", "MySQL", "React", "ETL"], highlights: ["100K+ Products", "40% Faster Queries", "50% Time Saved"], github: "https://github.com/nikhilpatil1104/Price-Comparison-Website" },
  ];
  const filtered = filter === "All" ? projects : projects.filter(p => p.category === filter);

  const skillGroups = [
    { title: "AI & Machine Learning", icon: "\u{1F916}", tags: ["Agentic AI", "RAG Systems", "LLM APIs (OpenAI, GPT-4)", "LangChain", "Prompt Engineering", "Transfer Learning", "CNNs", "PyTorch", "Scikit-learn", "AutoML"] },
    { title: "Statistical Modeling", icon: "\u{1F4CA}", tags: ["Bayesian Statistics", "Econometrics", "Predictive Modeling", "OLS / Poisson / Multivariate Regression", "Hypothesis & A/B Testing", "EDA", "Pure Premium Modeling"] },
    { title: "Data Engineering & Tools", icon: "\u2699\uFE0F", tags: ["Python", "SQL", "MongoDB (NoSQL)", "Pandas", "NumPy", "ETL Pipelines", "Git", "AWS (basic)", "R (basic)", "FAISS / Vector DBs"] },
    { title: "BI & Visualization", icon: "\u{1F4C8}", tags: ["Power BI", "Tableau", "Interactive Dashboards", "Business Intelligence", "Streamlit Deployment"] },
    { title: "Domain Expertise", icon: "\u{1F3E2}", tags: ["Insurance Analytics", "Customer Lifetime Value", "Pricing Strategy", "Risk Assessment", "Loss Trend Forecasting", "Underwriting Analytics"] },
  ];

  const experiences = [
    { date: "May 2025 \u2013 Jul 2025", role: "Data Analyst", company: "Buildstone Realty Advisors", bullets: ["Spearheaded Power BI dashboards visualizing CLV and risk metrics, reducing reporting time by 40%.", "Engineered resilient ETL pipelines for insurance analytics, slashing manual handling time by 60%.", "Applied econometrics and Bayesian techniques with scikit-learn for CLV and pure premium modeling, improving decision efficiency by 35%.", "Translated complex predictive modeling concepts into actionable insights for stakeholders."] },
    { date: "Sep 2024 \u2013 Apr 2025", role: "Data Management Intern", company: "Buildstone Realty Advisors", bullets: ["Managed 50,000+ property records in MySQL and MongoDB with 99% data accuracy.", "Architected scalable ETL processes using Python and Git, enabling 40% faster insight delivery.", "Developed automated data cleaning and validation scripts, improving processing speed by 70%."] },
  ];

  const certs = [
    { name: "Generative AI Essentials: Using LLMs to Work with Data", org: "IBM SkillsBuild", icon: "\u{1F9EC}" },
    { name: "Enterprise Data Science in Practice", org: "IBM SkillsBuild", icon: "\u{1F4E1}" },
    { name: "Python For Beginners", org: "Udemy", icon: "\u{1F40D}" },
    { name: "Automated Machine Learning For Beginners", org: "Udemy", icon: "\u26A1" },
  ];

  const navLinks = ["About", "Skills", "Experience", "Projects", "Education", "Contact"];
  const handleSubmit = () => { if (!form.name || !form.email || !form.message) { setFormMsg("Please fill in all fields."); return; } window.open(`mailto:nikhilpatil1104@gmail.com?subject=Portfolio Contact from ${form.name}&body=${encodeURIComponent(form.message + "\n\nFrom: " + form.name + "\nEmail: " + form.email)}`); setFormMsg("Opening your email client..."); setForm({ name: "", email: "", message: "" }); };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", color: text, background: bg, minHeight: "100vh", overflowX: "hidden", transition: "background 0.5s, color 0.5s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes blink { 50% { opacity: 0 } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        @keyframes gradientMove { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
        * { margin: 0; padding: 0; box-sizing: border-box; scrollbar-width: none !important; -ms-overflow-style: none !important; }
        *::-webkit-scrollbar { display: none !important; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        a { color: inherit; }
        ::selection { background: ${A}44; color: #fff; }
        input, textarea { font-family: 'Outfit', sans-serif; }
      `}</style>

      <MouseGlow mouse={mouse} dark={dark} />

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, background: scrollY > 60 ? (dark ? "rgba(12,14,20,0.75)" : "rgba(250,250,250,0.75)") : "transparent", backdropFilter: scrollY > 60 ? "blur(20px) saturate(1.8)" : "none", borderBottom: scrollY > 60 ? `1px solid ${border}` : "none", transition: "all 0.4s", padding: isMob ? "14px 20px" : "18px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="#" style={{ textDecoration: "none", fontSize: 21, fontWeight: 800, letterSpacing: -0.5 }}><span style={{ color: A }}>nikhil</span><span style={{ opacity: 0.35 }}>patil</span></a>
          {!isMob && <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
            {navLinks.map(l => <a key={l} href={`#${l.toLowerCase()}`} style={{ textDecoration: "none", fontSize: 13, fontWeight: 500, letterSpacing: 0.4, opacity: 0.5, transition: "all 0.3s" }} onMouseEnter={e => { e.target.style.opacity = 1; e.target.style.color = A; }} onMouseLeave={e => { e.target.style.opacity = 0.5; e.target.style.color = text; }}>{l}</a>)}
            {[{ href: "https://github.com/nikhilpatil1104", d: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" }, { href: "https://www.linkedin.com/in/nikhilpatil7/", d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" }].map((l, i) => <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" style={{ opacity: 0.45, transition: "opacity 0.3s", display: "flex", alignItems: "center" }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.45}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={l.d}/></svg></a>)}
            <button onClick={() => setDark(!dark)} style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `1px solid ${border}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", fontSize: 14, color: text, transition: "all 0.2s", display: "flex", alignItems: "center" }}>{dark ? "\u2600\uFE0F" : "\u{1F319}"}</button>
          </div>}
          {isMob && <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: text }}>{dark ? "\u2600\uFE0F" : "\u{1F319}"}</button>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: text }}>{menuOpen ? "\u2715" : "\u2630"}</button>
          </div>}
        </div>
        {isMob && menuOpen && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: dark ? "rgba(12,14,20,0.96)" : "rgba(250,250,250,0.96)", backdropFilter: "blur(20px)", padding: 20, borderBottom: `1px solid ${border}` }}>{navLinks.map(l => <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "14px 0", textDecoration: "none", fontSize: 16, fontWeight: 500, borderBottom: `1px solid ${border}` }}>{l}</a>)}</div>}
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", padding: isMob ? "130px 20px 70px" : "0 64px", overflow: "hidden" }}>
        <Starfield dark={dark} />
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${A}0C, transparent 65%)`, filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${A2}08, transparent 65%)`, filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, width: "100%", margin: "0 auto" }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: "all 0.8s cubic-bezier(.16,1,.3,1) 0.2s", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32, padding: "7px 18px 7px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600, letterSpacing: 0.5, background: dark ? "rgba(6,182,212,0.08)" : "rgba(6,182,212,0.06)", border: `1px solid ${A}20`, color: A }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 10px #34D39966", animation: "pulse 2s ease infinite" }} />Open to AI & Data Science Roles
            </div>
            <h1 style={{ fontSize: isMob ? 46 : 76, fontWeight: 900, lineHeight: 1.0, letterSpacing: -3, marginBottom: 14, opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(30px)", transition: "all 0.9s cubic-bezier(.16,1,.3,1) 0.35s" }}>
              <span>Nikhil </span><span style={{ background: `linear-gradient(135deg, ${A}, ${A2}, #F472B6)`, backgroundSize: "200% auto", animation: "gradientMove 4s ease infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Patil</span>
            </h1>
            <h2 style={{ fontSize: isMob ? 17 : 24, fontWeight: 400, opacity: loaded ? 0.5 : 0, marginBottom: 30, minHeight: 32, transition: "opacity 0.9s cubic-bezier(.16,1,.3,1) 0.5s" }}>
              <Typewriter words={["AI Engineer & Researcher", "Building Agentic AI Systems", "Predictive Modeling & Bayesian Analysis", "Insurance Analytics & CLV Expert"]} />
            </h2>
            <p style={{ fontSize: isMob ? 14 : 16, lineHeight: 1.9, color: textDim, maxWidth: 560, marginBottom: 40, opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: "all 0.9s cubic-bezier(.16,1,.3,1) 0.6s" }}>
              Graduate Data Science student at UMBC building AI-powered systems — from agentic research agents and RAG applications to deep learning models and predictive analytics pipelines.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56, opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: "all 0.9s cubic-bezier(.16,1,.3,1) 0.7s" }}>
              <MagButton href="#projects" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 30px", borderRadius: 12, background: `linear-gradient(135deg, ${A}, ${A2})`, color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 14, boxShadow: `0 4px 30px ${A}30`, border: "none", cursor: "pointer" }}>View AI Projects <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17l9.2-9.2M17 17V8H8"/></svg></MagButton>
              <MagButton href="#contact" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 30px", borderRadius: 12, border: `1.5px solid ${border}`, background: "transparent", textDecoration: "none", fontWeight: 600, fontSize: 14, color: text, cursor: "pointer" }}>Get in Touch</MagButton>
              <MagButton href="/Nikhil_Patil_Resume.pdf" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "14px 30px", borderRadius: 12, border: `1.5px solid ${border}`, background: "transparent", textDecoration: "none", fontWeight: 600, fontSize: 14, color: text, cursor: "pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Resume
              </MagButton>
            </div>
            <div style={{ display: "flex", gap: isMob ? 24 : 52, flexWrap: "wrap", opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: "all 0.9s cubic-bezier(.16,1,.3,1) 0.85s" }}>
              {[{ val: "3.80", label: "GPA at UMBC" }, { val: "5+", label: "AI/ML Projects" }, { val: "94%", label: "Model Accuracy" }, { val: "50K+", label: "Records Processed" }].map(s => <div key={s.label}><div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, background: `linear-gradient(135deg, ${A}, ${A2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.val}</div><div style={{ fontSize: 11, color: textDim, marginTop: 3, fontWeight: 500, letterSpacing: 0.3 }}>{s.label}</div></div>)}
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", opacity: scrollY > 100 ? 0 : 0.4, transition: "opacity 0.5s", animation: "float 2.5s ease infinite", textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Scroll</div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding: pad, background: bg2 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: A, display: "block", marginBottom: 14 }}>About</span></Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1.2fr 1fr", gap: 56, alignItems: "start" }}>
            <Reveal delay={0.1}><div>
              <h2 style={{ fontSize: isMob ? 28 : 40, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1, marginBottom: 28 }}>AI-First Thinker.<br /><span style={{ background: `linear-gradient(135deg, ${A}, ${A2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Data-Driven Builder.</span></h2>
              <p style={{ fontSize: 15, lineHeight: 1.95, color: textDim, marginBottom: 16 }}>I'm pursuing an M.S. in Data Science at UMBC with a 3.80 GPA, specializing in AI systems, Bayesian statistics, and econometric analysis.</p>
              <p style={{ fontSize: 15, lineHeight: 1.95, color: textDim, marginBottom: 16 }}>At Buildstone Realty Advisors, I built ETL pipelines, Power BI dashboards, and predictive models for CLV and insurance pricing — cutting reporting time by 40% and improving decision efficiency by 35%.</p>
              <p style={{ fontSize: 15, lineHeight: 1.95, color: textDim }}>I build agentic AI systems, RAG applications, and deep learning models. I communicate complex AI findings to drive data-informed decisions.</p>
            </div></Reveal>
            <Reveal delay={0.25}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[{ icon: "\u{1F916}", title: "AI & LLMs", text: "Agentic AI, RAG, GPT-4" }, { icon: "\u{1F4CA}", title: "Statistics", text: "Bayesian, Econometrics" }, { icon: "\u{1F393}", title: "Education", text: "M.S. Data Science, UMBC" }, { icon: "\u{1F4CD}", title: "Location", text: "Baltimore, MD" }, { icon: "\u{1F4BC}", title: "Experience", text: "Data Analyst + AI Builder" }, { icon: "\u{1F3AF}", title: "Domain", text: "Insurance Analytics, CLV" }].map(item => (
                <div key={item.title} style={{ background: cardBg, borderRadius: 14, padding: 20, border: `1px solid ${border}`, transition: "all 0.35s cubic-bezier(.16,1,.3,1)", cursor: "default" }} onMouseEnter={e => { e.currentTarget.style.borderColor = A + "40"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${A}08`; }} onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: textDim, lineHeight: 1.5 }}>{item.text}</div>
                </div>
              ))}
            </div></Reveal>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" style={{ padding: pad }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: A, display: "block", marginBottom: 14 }}>Technical Arsenal</span><h2 style={{ fontSize: isMob ? 28 : 40, fontWeight: 800, letterSpacing: -1, marginBottom: 48 }}>Skills & Technologies</h2></Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {skillGroups.map((g, gi) => <Reveal key={g.title} delay={gi * 0.08}><div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: 28, transition: "all 0.35s cubic-bezier(.16,1,.3,1)", height: "100%" }} onMouseEnter={e => { e.currentTarget.style.borderColor = A + "25"; e.currentTarget.style.boxShadow = `0 8px 32px ${A}06`; }} onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}><span style={{ fontSize: 22 }}>{g.icon}</span><h3 style={{ fontSize: 15, fontWeight: 700 }}>{g.title}</h3></div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{g.tags.map(t => <SkillTag key={t} label={t} dark={dark} A={A} text={text} />)}</div>
            </div></Reveal>)}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" style={{ padding: pad, background: bg2 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: A, display: "block", marginBottom: 14 }}>Career</span><h2 style={{ fontSize: isMob ? 28 : 40, fontWeight: 800, letterSpacing: -1, marginBottom: 48 }}>Professional Experience</h2></Reveal>
          <div style={{ maxWidth: 800 }}>
            {experiences.map((exp, idx) => { const ref = useRef(null); const vis = useOnScreen(ref); return (
              <div ref={ref} key={idx} style={{ display: "flex", gap: isMob ? 16 : 28, opacity: vis ? 1 : 0, transform: vis ? "none" : "translateX(-30px)", transition: `all 0.8s cubic-bezier(.16,1,.3,1) ${idx * 0.15}s` }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 18, flexShrink: 0 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: `linear-gradient(135deg, ${A}, ${A2})`, border: `3px solid ${bg2}`, boxShadow: `0 0 0 2px ${A}`, flexShrink: 0 }} />
                  <div style={{ width: 2, flex: 1, background: `linear-gradient(to bottom, ${A}30, transparent)` }} />
                </div>
                <div style={{ paddingBottom: 44 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: A, letterSpacing: 1.5, textTransform: "uppercase" }}>{exp.date}</span>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginTop: 5, marginBottom: 3 }}>{exp.role}</h3>
                  <p style={{ fontSize: 14, fontWeight: 500, color: textDim, marginBottom: 16 }}>{exp.company}</p>
                  {exp.bullets.map((b, i) => <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13.5, lineHeight: 1.8, color: textDim }}><span style={{ color: A, marginTop: 8, flexShrink: 0, fontSize: 5 }}>{"\u25CF"}</span><span>{b}</span></div>)}
                </div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" style={{ padding: pad }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: A, display: "block", marginBottom: 14 }}>Portfolio</span><h2 style={{ fontSize: isMob ? 28 : 40, fontWeight: 800, letterSpacing: -1, marginBottom: 8 }}>AI & ML Projects</h2><p style={{ fontSize: 15, color: textDim, marginBottom: 32, maxWidth: 520 }}>Hands-on AI systems — from agentic architectures and RAG pipelines to deep learning and predictive analytics.</p></Reveal>
          <Reveal delay={0.08}><div style={{ display: "flex", gap: 8, marginBottom: 36, flexWrap: "wrap" }}>
            {["All", "AI", "ML", "Web"].map(f => <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 20px", borderRadius: 100, border: filter === f ? "none" : `1px solid ${border}`, background: filter === f ? `linear-gradient(135deg, ${A}, ${A2})` : "transparent", color: filter === f ? "#fff" : text, fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s cubic-bezier(.16,1,.3,1)", transform: filter === f ? "scale(1.05)" : "scale(1)" }}>{f === "All" ? "All Projects" : f}</button>)}
          </div></Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {filtered.map((p, i) => { const ref = useRef(null); const vis = useOnScreen(ref); const [hov, setHov] = useState(false); return (
              <div ref={ref} key={p.title} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: hov ? (dark ? "rgba(255,255,255,0.04)" : "#fff") : cardBg, border: `1px solid ${hov ? A + "30" : border}`, borderRadius: 18, padding: isMob ? 24 : 36, opacity: vis ? 1 : 0, transform: vis ? (hov ? "translateY(-4px)" : "none") : "translateY(30px)", transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${i * 0.08}s, transform 0.5s cubic-bezier(.16,1,.3,1), border-color 0.3s, background 0.3s, box-shadow 0.3s`, boxShadow: hov ? `0 16px 48px ${A}0A` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMob ? "flex-start" : "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 30, animation: hov ? "float 2s ease infinite" : "none" }}>{p.icon}</span>
                    <div><h3 style={{ fontSize: isMob ? 18 : 22, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.25 }}>{p.title}</h3><span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: p.tagColor, background: p.tagColor + "14", padding: "3px 10px", borderRadius: 100, marginTop: 5, display: "inline-block" }}>{p.tag}</span></div>
                  </div>
                  {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: A, textDecoration: "none", padding: "6px 14px", borderRadius: 8, border: `1px solid ${A}25`, transition: "all 0.25s", flexShrink: 0 }} onMouseEnter={e => { e.currentTarget.style.background = A + "12"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>GitHub</a>}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.85, color: textDim, marginBottom: 18, maxWidth: 800 }}>{p.description}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>{p.tech.map(t => <span key={t} style={{ fontSize: 11, fontWeight: 500, padding: "5px 12px", borderRadius: 100, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}>{t}</span>)}</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>{p.highlights.map(h => <span key={h} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: p.tagColor }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>{h}</span>)}</div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section id="education" style={{ padding: pad, background: bg2 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: A, display: "block", marginBottom: 14 }}>Academic</span><h2 style={{ fontSize: isMob ? 28 : 40, fontWeight: 800, letterSpacing: -1, marginBottom: 48 }}>Education</h2></Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr" : "1fr 1fr", gap: 18, maxWidth: 900, marginBottom: 52 }}>
            {[{ school: "University of Maryland Baltimore County", degree: "M.S., Data Science", year: "Expected May 2027", gpa: "3.80", courses: "Bayesian Statistics, Econometrics, Machine Learning & Gen AI, Big Data, Statistical Modeling", icon: "\u{1F393}" }, { school: "University of Mumbai", degree: "B.E., Electronics & Computer Science", year: "Jun 2025", gpa: "3.33", courses: "ML, Deep Learning, NLP, Database Management, AI", icon: "\u{1F3DB}\uFE0F" }].map((edu, i) => (
              <Reveal key={edu.school} delay={i * 0.12}><div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: 28, height: "100%", transition: "all 0.35s cubic-bezier(.16,1,.3,1)" }} onMouseEnter={e => { e.currentTarget.style.borderColor = A + "30"; e.currentTarget.style.transform = "translateY(-3px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.transform = "none"; }}>
                <span style={{ fontSize: 34 }}>{edu.icon}</span>
                <h3 style={{ fontSize: 17, fontWeight: 800, marginTop: 12, marginBottom: 4, lineHeight: 1.3 }}>{edu.school}</h3>
                <p style={{ fontSize: 14, fontWeight: 600, color: A, marginBottom: 12 }}>{edu.degree}</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 12, color: textDim }}><span>{edu.year}</span><span style={{ fontWeight: 700, color: A2 }}>GPA: {edu.gpa}</span></div>
                <p style={{ fontSize: 12, lineHeight: 1.7, color: textDim }}><span style={{ fontWeight: 600, color: text, opacity: 0.65 }}>Coursework:</span> {edu.courses}</p>
              </div></Reveal>
            ))}
          </div>
          <Reveal><h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 22 }}>Certifications</h3>
            <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14 }}>
              {certs.map(c => <div key={c.name} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 20, textAlign: "center", transition: "all 0.3s cubic-bezier(.16,1,.3,1)" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = A + "25"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = border; }}>
                <span style={{ fontSize: 26, display: "block", marginBottom: 8 }}>{c.icon}</span>
                <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, marginBottom: 5 }}>{c.name}</p>
                <p style={{ fontSize: 10, color: textDim }}>{c.org}</p>
              </div>)}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: pad }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <Reveal><div style={{ textAlign: "center", marginBottom: 36 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: A, display: "block", marginBottom: 14 }}>Contact</span>
            <h2 style={{ fontSize: isMob ? 28 : 40, fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>Let's Build Something <span style={{ background: `linear-gradient(135deg, ${A}, ${A2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Intelligent</span></h2>
            <p style={{ fontSize: 14, color: textDim, lineHeight: 1.8 }}>Open to AI Engineering, Data Science, and ML roles.</p>
          </div></Reveal>
          <Reveal delay={0.1}><div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 18, padding: isMob ? 24 : 36 }}>
            {["name", "email"].map(f => <input key={f} type={f === "email" ? "email" : "text"} placeholder={f === "name" ? "Your Name" : "Your Email"} value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} style={{ width: "100%", padding: "13px 18px", marginBottom: 12, borderRadius: 12, border: `1px solid ${border}`, background: dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.015)", color: text, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.3s, box-shadow 0.3s" }} onFocus={e => { e.target.style.borderColor = A; e.target.style.boxShadow = `0 0 0 3px ${A}15`; }} onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = "none"; }} />)}
            <textarea placeholder="Your Message" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ width: "100%", padding: "13px 18px", marginBottom: 14, borderRadius: 12, border: `1px solid ${border}`, background: dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.015)", color: text, fontSize: 14, resize: "vertical", outline: "none", fontFamily: "inherit", transition: "border-color 0.3s, box-shadow 0.3s" }} onFocus={e => { e.target.style.borderColor = A; e.target.style.boxShadow = `0 0 0 3px ${A}15`; }} onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = "none"; }} />
            <button onClick={handleSubmit} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15, background: `linear-gradient(135deg, ${A}, ${A2})`, color: "#fff", fontFamily: "inherit", boxShadow: `0 4px 24px ${A}25`, transition: "transform 0.3s, box-shadow 0.3s" }} onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 8px 32px ${A}35`; }} onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = `0 4px 24px ${A}25`; }}>Send Message</button>
            {formMsg && <p style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: A, fontWeight: 500 }}>{formMsg}</p>}
          </div></Reveal>
          <Reveal delay={0.15}><div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
            {[{ label: "nikhilpatil1104@gmail.com", href: "mailto:nikhilpatil1104@gmail.com", icon: "\u2709\uFE0F" }, { label: "LinkedIn", href: "https://www.linkedin.com/in/nikhilpatil7/", icon: "\u{1F517}" }, { label: "GitHub", href: "https://github.com/nikhilpatil1104", icon: "\u{1F4BB}" }].map(l => <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, textDecoration: "none", color: textDim, transition: "color 0.3s" }} onMouseEnter={e => e.currentTarget.style.color = A} onMouseLeave={e => e.currentTarget.style.color = textDim}>{l.icon} {l.label}</a>)}
          </div></Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "28px 20px", borderTop: `1px solid ${border}`, textAlign: "center", background: bg2 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 12, alignItems: "center" }}>
          {[{ href: "https://www.linkedin.com/in/nikhilpatil7/", d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" }, { href: "https://github.com/nikhilpatil1104", d: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" }].map((l, i) => <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" style={{ color: textDim, transition: "color 0.3s", display: "flex", alignItems: "center" }} onMouseEnter={e => e.currentTarget.style.color = A} onMouseLeave={e => e.currentTarget.style.color = textDim}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={l.d}/></svg></a>)}
          <a href="mailto:nikhilpatil1104@gmail.com" style={{ color: textDim, transition: "color 0.3s", display: "flex", alignItems: "center" }} onMouseEnter={e => e.currentTarget.style.color = A} onMouseLeave={e => e.currentTarget.style.color = textDim}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/></svg></a>
        </div>
        <p style={{ fontSize: 11, color: textDim }}>{"\u00A9"} 2026 Nikhil Patil. Built with precision.</p>
      </footer>
    </div>
  );
}
