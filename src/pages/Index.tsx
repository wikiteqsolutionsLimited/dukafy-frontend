import { Link } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Store, ShoppingCart, Package, BarChart3, Users, Shield, TrendingUp,
  ArrowRight, CheckCircle2, Zap, Globe, Clock, ChevronRight, Star,
  Smartphone, CreditCard, Receipt, Play, HeartHandshake, Headphones,
  Lock, Rocket, BadgeCheck, Banknote, Menu, X, HelpCircle, ChevronDown,
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const whyUsReasons = [
  { icon: Rocket, title: "Built for Kenya", desc: "Designed specifically for the Kenyan market with M-Pesa integration, KES currency, and local business workflows baked in from day one.", color: "168 55% 38%" },
  { icon: Lock, title: "Bank-Grade Security", desc: "Role-based access, encrypted data, audit logging, and rate-limited APIs keep your business data safe 24/7.", color: "220 70% 50%" },
  { icon: Headphones, title: "Dedicated Support", desc: "Our Nairobi-based team provides priority support via phone, email, and WhatsApp — we speak your language.", color: "280 60% 50%" },
  { icon: Banknote, title: "Affordable Pricing", desc: "Start free with no credit card. Upgrade only when you need it — no hidden fees, no surprises, cancel anytime.", color: "38 92% 50%" },
  { icon: BadgeCheck, title: "Proven Reliability", desc: "99.9% uptime with automated backups. Your data is always safe and your shop never stops selling.", color: "340 65% 50%" },
  { icon: HeartHandshake, title: "Grows With You", desc: "From a single shop to a franchise — multi-store support, unlimited users, and an open API for custom integrations.", color: "152 60% 40%" },
];

const features = [
  { icon: ShoppingCart, title: "Lightning POS", desc: "Barcode scanning, keyboard shortcuts, and instant checkout. Process sales in seconds.", color: "168 55% 38%" },
  { icon: Package, title: "Smart Inventory", desc: "Real-time stock tracking, low-stock alerts, and automated reorder points.", color: "220 70% 50%" },
  { icon: BarChart3, title: "Rich Analytics", desc: "Sales reports, profit & loss, category breakdowns, and daily summaries.", color: "280 60% 50%" },
  { icon: Users, title: "Customer CRM", desc: "Track customer purchases, manage contacts, and build loyalty.", color: "340 65% 50%" },
  { icon: Shield, title: "Role-Based Access", desc: "Admin, manager, and cashier roles with granular permissions.", color: "38 92% 50%" },
  { icon: Smartphone, title: "M-Pesa Payments", desc: "Integrated STK Push and C2B payments for seamless mobile money.", color: "152 60% 40%" },
];

const stats = [
  { value: "10x", label: "Faster Checkout", icon: Zap },
  { value: "99.9%", label: "Uptime", icon: Globe },
  { value: "50+", label: "API Endpoints", icon: Clock },
  { value: "24/7", label: "Audit Logging", icon: Shield },
];

const testimonials = [
  { name: "Sarah Kimani", role: "Retail Store Owner, Nairobi", text: "DukaFlo transformed how we run our store. Checkout is 10x faster and M-Pesa integration just works perfectly.", stars: 5, avatar: "SK" },
  { name: "James Mwangi", role: "Franchise Manager, Mombasa", text: "The analytics alone saved us thousands. We finally understand our margins and can make data-driven decisions.", stars: 5, avatar: "JM" },
  { name: "Amara Ochieng", role: "Boutique Owner, Kisumu", text: "Beautiful interface, easy to train staff. The best POS system we've ever used. Absolutely love it!", stars: 5, avatar: "AO" },
];

const faqs = [
  { q: "What is DukaFlo?", a: "DukaFlo is an all-in-one point of sale and business management platform designed specifically for Kenyan retailers. It includes POS, inventory management, M-Pesa payments, analytics, customer CRM, and more." },
  { q: "How much does DukaFlo cost?", a: "DukaFlo offers 4 plans: Basic (KES 500/mo, 1 shop), Starter (KES 1,000/mo, up to 3 shops), Pro (KES 2,000/mo, up to 5 shops), and Enterprise (custom pricing). All plans start with a 30-day free trial." },
  { q: "Does DukaFlo support M-Pesa?", a: "Yes! DukaFlo has built-in M-Pesa integration with STK Push and C2B payments. Your customers can pay via M-Pesa directly at checkout with instant confirmation." },
  { q: "Can I use DukaFlo on my phone?", a: "Absolutely. DukaFlo is fully responsive and works on any device — desktop, tablet, or smartphone. No app download required, it runs in your browser." },
  { q: "Is my data secure?", a: "Yes. DukaFlo uses bank-grade encryption, role-based access controls, audit logging, and automated backups. Your data is stored securely with 99.9% uptime guarantee." },
  { q: "Can I manage multiple shops?", a: "Yes, the Pro plan includes multi-store support. You can manage all your locations from a single dashboard with separate inventory and reporting per store." },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-7 py-5 text-left"
      >
        <span className="text-sm font-bold text-card-foreground">{q}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "200px" : "0", opacity: open ? 1 : 0 }}
      >
        <p className="px-7 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
      </div>
    </div>
  );
}

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const smoothScroll = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const navItems = ["Features", "Why Us", "Testimonials", "Pricing", "FAQ"];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden scroll-smooth">
      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b shadow-sm backdrop-blur-xl" : "backdrop-blur-sm"
        }`}
        style={{ backgroundColor: scrolled ? "hsl(var(--background) / 0.95)" : "hsl(var(--background) / 0.7)" }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-black tracking-tight text-foreground">DukaFlo</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                onClick={(e) => smoothScroll(e, `#${item.toLowerCase().replace(" ", "-")}`)}
                className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block">
              Sign In
            </Link>
            <Link to="/register" className="group hidden sm:inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.97]">
              Get Started <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-card/80 text-foreground backdrop-blur-sm md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-[500px] border-t" : "max-h-0"
          }`}
          style={{ backgroundColor: "hsl(var(--background) / 0.98)" }}
        >
          <div className="flex flex-col gap-1 px-6 py-4">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                onClick={(e) => smoothScroll(e, `#${item.toLowerCase().replace(" ", "-")}`)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                {item}
              </a>
            ))}
            <hr className="my-2 border-border" />
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent">
              Sign In
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-16">
        {/* Hero background image — visible with warm overlay */}
        <div className="pointer-events-none absolute inset-0">
          <img src={heroBg} alt="Modern retail shop with POS system" className="h-full w-full object-cover opacity-[0.35]" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
        </div>

        {/* Animated gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, hsl(168 55% 38%), transparent 70%)" }} />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, hsl(220 70% 50%), transparent 70%)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, hsl(280 60% 50%), transparent 70%)" }} />
        </div>

        {/* Dot grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <AnimatedSection>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-card/80 px-4 py-2 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
                  <Zap className="h-3 w-3 text-primary" />
                </span>
                Production-Ready POS System for Kenya
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Run Your Shop
                <br />
                <span className="relative inline-block text-primary">
                  Smarter & Faster
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 8C50 3 100 2 150 4C200 6 250 3 298 7" stroke="hsl(168 55% 38%)" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
                  </svg>
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                The all-in-one point of sale system built for modern retail in Kenya.
                Manage inventory, process M-Pesa payments, track profits — all from one beautiful dashboard.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/register" className="group relative inline-flex h-13 items-center gap-2.5 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]">
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent" />
                  <span className="relative flex items-center gap-2">Start Free Trial <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></span>
                </Link>
                <a href="#features" onClick={(e) => smoothScroll(e, "#features")} className="group inline-flex h-13 items-center gap-2 rounded-2xl border bg-card/80 px-8 py-3.5 text-sm font-semibold text-card-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-card hover:shadow-md">
                  <Play className="h-4 w-4 text-primary" /> See How It Works
                </a>
              </div>
            </AnimatedSection>
          </div>

          {/* Stats bar */}
          <AnimatedSection delay={450}>
            <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="group relative overflow-hidden rounded-2xl border bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <s.icon className="mx-auto mb-2 h-5 w-5 text-primary/40 transition-colors group-hover:text-primary/70" />
                  <p className="text-3xl font-black text-primary">{s.value}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

        </div>
      </section>

      {/* ── Mock Dashboard Preview ── */}
      <section className="relative -mt-10 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection delay={550}>
            <div className="mx-auto max-w-5xl">
              <div className="relative rounded-2xl border bg-card shadow-2xl shadow-foreground/5 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 border-b px-4 py-3 bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-destructive/60" />
                    <div className="h-3 w-3 rounded-full bg-warning/60" />
                    <div className="h-3 w-3 rounded-full bg-success/60" />
                  </div>
                  <div className="mx-auto flex h-7 w-72 items-center justify-center rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    app.dukaflo.co.ke/dashboard
                  </div>
                </div>
                {/* Dashboard mockup */}
                <div className="p-6 bg-background/50">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {[
                      { label: "Today's Sales", value: "KES 48,250", change: "+12%" },
                      { label: "Orders", value: "127", change: "+8%" },
                      { label: "Products", value: "1,854", change: "+3%" },
                      { label: "Customers", value: "432", change: "+15%" },
                    ].map((card) => (
                      <div key={card.label} className="rounded-xl border bg-card p-4 shadow-sm">
                        <p className="text-xs text-muted-foreground">{card.label}</p>
                        <p className="mt-1 text-lg font-bold text-foreground">{card.value}</p>
                        <p className="mt-0.5 text-xs font-semibold text-success">{card.change}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 rounded-xl border bg-card p-4 shadow-sm">
                      <p className="text-sm font-semibold text-foreground mb-3">Sales Overview</p>
                      <div className="flex items-end gap-2 h-24">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t-md bg-primary/20 transition-all hover:bg-primary/40" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                      <p className="text-sm font-semibold text-foreground mb-3">Top Products</p>
                      <div className="space-y-2.5">
                        {["Unga Flour 2kg", "Brookside Milk 500ml", "Royco Cubes"].map((p, i) => (
                          <div key={p} className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{p}</span>
                            <span className="text-xs font-semibold text-foreground">{45 - i * 8}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative py-28 scroll-mt-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">Features</span>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
                Everything You Need
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From lightning-fast checkout to deep analytics — DukaFlo has you covered.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 80}>
                <div className="group relative overflow-hidden rounded-2xl border bg-card p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
                      style={{ backgroundColor: `hsl(${f.color} / 0.1)` }}>
                      <f.icon className="h-7 w-7" style={{ color: `hsl(${f.color})` }} />
                    </div>
                    <h3 className="text-lg font-bold text-card-foreground">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-28 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">Getting Started</span>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
                Up and Running in Minutes
              </h2>
            </div>
          </AnimatedSection>

          <div className="relative mt-16 grid gap-8 sm:grid-cols-3">
            <div className="pointer-events-none absolute top-16 left-[16.6%] right-[16.6%] hidden h-px sm:block" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.3), transparent)" }} />
            {[
              { step: "01", icon: Globe, title: "Deploy Backend", desc: "Set up your Node.js server with PostgreSQL in minutes." },
              { step: "02", icon: Package, title: "Add Products", desc: "Import your inventory or add products one by one with barcodes." },
              { step: "03", icon: Zap, title: "Start Selling", desc: "Process sales with the blazing-fast POS interface." },
            ].map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 120}>
                <div className="group relative rounded-2xl border bg-card p-8 shadow-sm text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="mx-auto -mt-12 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-foreground shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110">
                    {item.step}
                  </div>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                    <item.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-card-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section id="why-us" className="relative py-28 scroll-mt-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">Why DukaFlo</span>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
                Why Shop Owners Choose Us
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We're not just another POS. We're your growth partner — purpose-built for Kenyan retail.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyUsReasons.map((r, i) => (
              <AnimatedSection key={r.title} delay={i * 80}>
                <div className="group relative overflow-hidden rounded-2xl border bg-card p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
                      style={{ backgroundColor: `hsl(${r.color} / 0.1)` }}>
                      <r.icon className="h-7 w-7" style={{ color: `hsl(${r.color})` }} />
                    </div>
                    <h3 className="text-lg font-bold text-card-foreground">{r.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="relative py-28 scroll-mt-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">Testimonials</span>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
                Loved by Shop Owners
              </h2>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 100}>
                <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="absolute top-0 right-0 h-32 w-32 opacity-[0.03]" style={{ background: "radial-gradient(circle at top right, hsl(var(--primary)), transparent 70%)" }} />
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-4.5 w-4.5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-card-foreground">"{t.text}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-bold text-primary ring-2 ring-primary/10">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-card-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-28 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">Pricing</span>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">No hidden fees. No surprises. Start with a 30-day free trial and upgrade as you grow.</p>
            </div>
          </AnimatedSection>

          <div className="mx-auto mt-16 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Basic", price: "500", desc: "Perfect for a single shop", features: ["1 Shop", "200 Products", "2 Users", "Basic POS", "M-Pesa Payments", "Basic Reports"], popular: false },
              { name: "Starter", price: "1,000", desc: "For growing businesses", features: ["Up to 3 Shops", "1,000 Products", "5 Users", "Full POS", "M-Pesa Payments", "Advanced Reports", "Customer CRM"], popular: false },
              { name: "Pro", price: "2,000", desc: "For multi-store operations", features: ["Up to 5 Shops", "Unlimited Products", "15 Users", "Full POS + Barcode", "All Payment Methods", "Advanced Analytics", "Priority Support"], popular: true },
              { name: "Enterprise", price: "Custom", desc: "For large enterprises", features: ["Unlimited Shops", "Unlimited Products", "Unlimited Users", "Custom Integrations", "API Access", "Dedicated Support", "SLA Guarantee"], popular: false },
            ].map((plan, i) => (
              <AnimatedSection key={plan.name} delay={i * 80}>
                <div className={`group relative overflow-hidden rounded-2xl border bg-card p-7 shadow-sm transition-all duration-300 hover:shadow-lg ${plan.popular ? "border-2 border-primary shadow-xl shadow-primary/5" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-0 right-4 rounded-b-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Most Popular</div>
                  )}
                  <h3 className="text-xl font-bold text-card-foreground">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
                  <p className="mt-5">
                    {plan.price === "Custom" ? (
                      <span className="text-3xl font-black text-foreground">Custom</span>
                    ) : (
                      <><span className="text-4xl font-black text-foreground">KES {plan.price}</span><span className="text-sm text-muted-foreground">/mo</span></>
                    )}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4.5 w-4.5 text-success shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={plan.price === "Custom" ? "mailto:hello@dukaflo.co.ke" : "/register"} className={`mt-7 flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold shadow-sm transition-all duration-300 hover:shadow-md ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25"
                      : "border bg-card text-card-foreground hover:bg-muted"
                  }`}>
                    {plan.price === "Custom" ? "Contact Us" : "Start Free Trial"}
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="relative py-28 scroll-mt-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">FAQ</span>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to know about DukaFlo.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-12 space-y-3">
            {faqs.map((faq, i) => (
              <AnimatedSection key={faq.q} delay={i * 60}>
                <FAQItem q={faq.q} a={faq.a} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="pointer-events-none absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }} />
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <AnimatedSection>
            <h2 className="text-4xl font-black text-primary-foreground sm:text-5xl">
              Ready to Transform
              <br />Your Shop?
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg text-primary-foreground/70 leading-relaxed">
              Join thousands of shop owners across Kenya who switched to DukaFlo for faster sales, better insights, and happier customers.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/login" className="group inline-flex h-13 items-center gap-2.5 rounded-2xl bg-card px-8 py-3.5 text-sm font-bold text-card-foreground shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]">
                Get Started Free <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a href="#features" onClick={(e) => smoothScroll(e, "#features")} className="inline-flex h-13 items-center gap-2 rounded-2xl border border-primary-foreground/20 px-8 py-3.5 text-sm font-semibold text-primary-foreground/90 transition-all duration-300 hover:bg-primary-foreground/10 hover:border-primary-foreground/30">
                Learn More
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t bg-card py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
                  <Store className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-black text-foreground">DukaFlo</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                The modern POS system built for Kenyan businesses. Manage your shop smarter with real-time analytics and M-Pesa integration.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Product</h4>
              <ul className="mt-4 space-y-2.5">
                {["Features", "Pricing", "Testimonials", "FAQ"].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase()}`} onClick={(e) => smoothScroll(e, `#${link.toLowerCase()}`)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Legal</h4>
              <ul className="mt-4 space-y-2.5">
                <li><Link to="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy Policy</Link></li>
                <li><a href="mailto:support@dukaflo.co.ke" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center gap-4 border-t pt-8 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground">© 2026 DukaFlo. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/terms" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Terms</Link>
              <Link to="/privacy" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
