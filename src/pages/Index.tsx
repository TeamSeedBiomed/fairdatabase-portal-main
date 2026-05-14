import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Database, Users, Shield, Activity, ArrowRight,
  ChevronLeft, ChevronRight, X, Search, FlaskConical,
} from "lucide-react";
import { Nav } from "@/components/Nav";

const FAIR_PILLARS = [
  {
    letter: "F",
    title: "Findable",
    description: "Datasets carry persistent identifiers and rich metadata so they can be discovered by humans and machines.",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    letterColor: "text-blue-600",
  },
  {
    letter: "A",
    title: "Accessible",
    description: "Data is retrievable via open, standardised protocols with clear authentication rules and long-term availability.",
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    letterColor: "text-emerald-600",
  },
  {
    letter: "I",
    title: "Interoperable",
    description: "Data uses community vocabularies and formats, enabling seamless integration across systems and disciplines.",
    color: "bg-violet-50 border-violet-200 text-violet-700",
    letterColor: "text-violet-600",
  },
  {
    letter: "R",
    title: "Reusable",
    description: "Rich provenance, clear licensing, and community standards ensure data can be reliably reused by future researchers.",
    color: "bg-amber-50 border-amber-200 text-amber-700",
    letterColor: "text-amber-600",
  },
];

const CAPABILITIES = [
  {
    icon: <Activity className="h-6 w-6 text-primary" />,
    title: "PBK Modelling",
    description:
      "Physiologically Based Kinetic modelling for precision medicine and drug development. Import SBML models, run real-time simulations, and generate regulatory-compliant reports.",
    link: "/pkpd",
    linkLabel: "Run simulations",
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "GDPR Compliance",
    description:
      "Automated P29 Score calculation, differential privacy algorithms, and audit trail generation. Upload your dataset and see anonymisation in action.",
    link: "/explore",
    linkLabel: "Try the demo",
  },
  {
    icon: <Database className="h-6 w-6 text-primary" />,
    title: "FAIR Data Management",
    description:
      "Complete data lifecycle management with DOI assignment, faceted search, version control, and an API-first architecture for seamless integration.",
    link: "/explore",
    linkLabel: "Browse datasets",
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Collaborative Workspace",
    description:
      "Role-based access control, real-time team collaboration, and customisable dashboards designed for multi-site research consortia.",
    link: "/researchers",
    linkLabel: "Researcher docs",
  },
];

const SCREENSHOTS = [
  { src: "127.0.0.1_5000_dashboard(Desktop Screenshot).png", caption: "Research Dashboard — dataset overview and activity feed" },
  { src: "127.0.0.1_5000_p29score(Desktop Screenshot) (1).png", caption: "P29 Privacy Score — GDPR compliance assessment" },
  { src: "127.0.0.1_5000_upload(Desktop Screenshot).png", caption: "Dataset Upload — guided ingestion with metadata extraction" },
  { src: "search.png", caption: "Faceted Search — discover datasets by metadata, format, and access level" },
];

const Index = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextImage = () => setActiveImage((prev) => (prev + 1) % SCREENSHOTS.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + SCREENSHOTS.length) % SCREENSHOTS.length);

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-28 px-4 min-h-[80vh] flex items-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(5,19,18,0.78), rgba(5,19,18,0.78)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 backdrop-blur-sm rounded-full mb-6 border border-primary/30">
            <FlaskConical className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">
              PBK Modelling · GDPR Compliance · FAIR Data
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-5 animate-fade-up">
            FAIRDatabase
          </h1>

          <p className="text-xl md:text-2xl text-white/85 mb-3 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Research data management built on FAIR principles
          </p>
          <p className="text-base text-white/60 mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Findable · Accessible · Interoperable · Reusable — with integrated PBK modelling and automated GDPR compliance scoring.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-primary text-white rounded-lg font-semibold shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Search className="h-4 w-4" />
              Explore the Platform
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              Learn about FAIR
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAIR Pillars ────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Built on FAIR Principles</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Every dataset managed through FAIRDatabase follows the internationally recognised FAIR Data Principles,
              maximising scientific value and reuse potential.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FAIR_PILLARS.map((pillar) => (
              <div
                key={pillar.letter}
                className={`rounded-xl border p-6 ${pillar.color} transition-shadow hover:shadow-md`}
              >
                <div className={`text-4xl font-black mb-3 ${pillar.letterColor}`}>{pillar.letter}</div>
                <h3 className="text-lg font-bold mb-2">{pillar.title}</h3>
                <p className="text-sm leading-relaxed opacity-80">{pillar.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
            >
              How we implement each principle <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Platform Capabilities ────────────────────────────────────── */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Platform Capabilities</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              An integrated toolkit for modern biomedical research — from raw data ingestion to regulatory submission.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                className="p-6 rounded-xl border border-slate-200 hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-white"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">{cap.icon}</div>
                  <h3 className="text-lg font-bold text-slate-900">{cap.title}</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{cap.description}</p>
                <Link
                  to={cap.link}
                  className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
                >
                  {cap.linkLabel} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Screenshots ──────────────────────────────────────────────── */}
      <section id="screenshots" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Platform Overview</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              A tour of the core interfaces — from dataset discovery to compliance reporting.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div
              className="relative rounded-2xl overflow-hidden bg-slate-200 shadow-xl cursor-pointer h-[360px] md:h-[480px]"
              onClick={() => setIsModalOpen(true)}
            >
              {SCREENSHOTS.map((s, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-500 ${activeImage === i ? "opacity-100" : "opacity-0"}`}
                >
                  <img
                    src={s.src}
                    alt={s.caption}
                    className="w-full h-full object-contain p-6"
                  />
                </div>
              ))}

              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 p-2.5 rounded-full shadow transition-all hover:scale-110 z-10"
                aria-label="Previous screenshot"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 p-2.5 rounded-full shadow transition-all hover:scale-110 z-10"
                aria-label="Next screenshot"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {SCREENSHOTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setActiveImage(i); }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${activeImage === i ? "bg-primary scale-125" : "bg-white/70 hover:bg-white"}`}
                    aria-label={`Go to screenshot ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Caption */}
            <p className="mt-4 text-center text-sm text-slate-500 italic">
              {SCREENSHOTS[activeImage].caption} — click to enlarge
            </p>

            {/* Thumbnail strip */}
            <div className="mt-4 grid grid-cols-4 gap-3">
              {SCREENSHOTS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`rounded-lg overflow-hidden border-2 transition-all ${activeImage === i ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  <img src={s.src} alt={s.caption} className="w-full h-16 object-cover object-top" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lightbox */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <button
              className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors z-20"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close lightbox"
            >
              <X className="h-8 w-8" />
            </button>

            <img
              src={SCREENSHOTS[activeImage].src}
              alt={SCREENSHOTS[activeImage].caption}
              className="max-w-full max-h-[88vh] object-contain rounded-lg shadow-2xl"
            />

            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm italic">
              {SCREENSHOTS[activeImage].caption}
            </p>

            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 text-white p-3 rounded-full transition-colors z-10"
              aria-label="Previous screenshot"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 text-white p-3 rounded-full transition-colors z-10"
              aria-label="Next screenshot"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
        )}
      </section>

      {/* ── SEEDBiomed CTA ──────────────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Built by SEEDBiomed</h2>
          <p className="text-slate-500 mb-8 text-base leading-relaxed">
            FAIRDatabase is developed by the SEEDBiomed consortium — a multidisciplinary team of researchers,
            data scientists, and regulatory specialists committed to open and reproducible biomedical science.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://seedbiomed.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-primary text-white font-semibold rounded-lg shadow hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
            >
              Meet the Team
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/researchers"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:border-primary/40 hover:text-primary transition-all"
            >
              API & Integration docs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-[#051312] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-3">FAIRDatabase</h3>
              <p className="text-white/55 text-sm leading-relaxed">
                Research data management platform with integrated PBK modelling and GDPR compliance tools, built on FAIR principles.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Platform</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link to="/explore" className="hover:text-primary transition-colors">Explore Data</Link></li>
                <li><Link to="/pkpd" className="hover:text-primary transition-colors">PBK Simulations</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">FAIR Principles</Link></li>
                <li><Link to="/researchers" className="hover:text-primary transition-colors">For Researchers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Organisation</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>
                  <a href="https://seedbiomed.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    SEEDBiomed Consortium
                  </a>
                </li>
                <li>
                  <a href="mailto:info@seedbiomed.com" className="hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/40 text-xs">
              © {new Date().getFullYear()} FAIRDatabase · SEEDBiomed Consortium · Open research infrastructure
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
