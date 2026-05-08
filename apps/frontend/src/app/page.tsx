import Link from "next/link";
import { NavBar } from "@/components/marketing/NavBar";
import { ScrollRevealInit } from "@/components/marketing/ScrollRevealInit";

const HERO_STATS = [
  { value: "128+", label: "lessons" },
  { value: "14", label: "paths" },
  { value: "4K", label: "video" },
  { value: "90%", label: "completion" },
];

const BENEFITS = [
  {
    title: "Sequenced paths",
    body: "Groove, technique, reading and coordination in order.",
  },
  {
    title: "Progress saved",
    body: "Resume points and completion tracking stay private.",
  },
  {
    title: "Serious practice",
    body: "Lessons are built for repetition, not quick tricks.",
  },
  {
    title: "Clean access",
    body: "One membership, no ads, cancel anytime.",
  },
];

const COURSE_CARDS = [
  {
    tag: "Groove",
    title: "Pocket Architecture",
    meta: "12 lessons",
    level: "Foundational",
    progress: 67,
    note: "Subdivision, dynamics and limb independence.",
  },
  {
    tag: "Technique",
    title: "Hand Technique I",
    meta: "18 lessons",
    level: "Intermediate",
    progress: 34,
    note: "Rebound, Moeller and finger control.",
  },
  {
    tag: "Coordination",
    title: "Polyrhythmic Mind",
    meta: "22 lessons",
    level: "Advanced",
    progress: 12,
    note: "3:2, 4:3 and 5:4 as feel.",
  },
  {
    tag: "Reading",
    title: "Reading Charts",
    meta: "16 lessons",
    level: "Foundational",
    progress: 0,
    note: "Slash, comp, kicks and hits.",
  },
];

const METHOD_STEPS = [
  {
    num: "01",
    title: "Pick a path",
    body: "Start with the discipline you actually need this month.",
  },
  {
    num: "02",
    title: "Repeat one idea",
    body: "Train the lesson, the drill and the play-along until it lands.",
  },
  {
    num: "03",
    title: "Return exactly there",
    body: "Progress and resume points keep the next session obvious.",
  },
];

const PLANS = [
  {
    name: "Monthly",
    price: "$29",
    cadence: "/ mo",
    detail: "Full access. Cancel anytime.",
  },
  {
    name: "Annual",
    price: "$290",
    cadence: "/ yr",
    detail: "Best value for committed practice.",
    featured: true,
  },
  {
    name: "Lifetime",
    price: "$199",
    cadence: "once",
    detail: "Permanent access to the academy.",
  },
];

const FAQS = [
  {
    q: "Is Rudiment for beginners?",
    a: "The first paths are foundational, but the product is aimed at adults who can already practice consistently.",
  },
  {
    q: "Can I cancel monthly access?",
    a: "Yes. Billing is handled in-app, and monthly members can cancel without contacting support.",
  },
  {
    q: "What makes this different from YouTube?",
    a: "The order. Rudiment turns lessons into paths, tracks progress and keeps every session tied to the next one.",
  },
  {
    q: "Do I need a full kit?",
    a: "Most paths are written for a standard kit, but technique and reading lessons can be practiced with a pad.",
  },
];

function ArrowRight() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function Check() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 8l4 4 8-9" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M5 3.5v11l9-5.5z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      <NavBar />

      <main>
        <section className="hero-section relative overflow-hidden border-b border-white/8 pb-16 pt-8" id="top">
          <div className="mkt-shell relative grid items-center gap-12 pt-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="min-w-0 max-w-[700px]">
              <div className="mb-5 inline-flex items-center gap-3">
                <span className="eyebrow-tick" aria-hidden="true" />
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-gold-400)]">
                  Premium drum academy
                </span>
              </div>

              <h1
                className="font-[family-name:var(--font-display)] uppercase leading-[0.88] tracking-normal text-white"
                style={{ fontSize: "clamp(58px, 9vw, 132px)" }}
              >
                Practice
                <br />
                with intent.
              </h1>

              <p className="mt-6 max-w-[34ch] text-[17px] leading-[1.6] text-[var(--text-2)] sm:max-w-[500px]">
                Structured drum paths for adults.
                <br />
                Clear lessons, saved progress, fewer distractions.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="mkt-btn mkt-btn-primary mkt-btn-lg">
                  Start membership
                  <ArrowRight />
                </Link>
                <Link href="#library" className="mkt-btn mkt-btn-ghost mkt-btn-lg">
                  View paths
                </Link>
              </div>

              <div className="mt-10 grid max-w-[560px] grid-cols-2 border-y border-white/8 sm:grid-cols-4">
                {HERO_STATS.map((stat) => (
                  <div key={stat.label} className="stat-row-cell border-r border-white/8 px-4 py-5 last:border-r-0">
                    <div className="font-[family-name:var(--font-display)] text-[38px] leading-none text-white">
                      {stat.value}
                    </div>
                    <div className="mt-2 text-[10.5px] uppercase tracking-[0.16em] text-[var(--text-3)]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <ProductPreview />
            </div>
          </div>
        </section>

        <section className="border-b border-white/8 bg-black/[0.12]" aria-label="Rudiment benefits">
          <div className="mkt-shell grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((item) => (
              <article key={item.title} className="border-b border-white/8 py-7 pr-8 last:border-b-0 sm:border-r sm:odd:border-r sm:[&:nth-child(3)]:border-b-0 lg:border-b-0 lg:last:border-r-0">
                <h2 className="text-[15px] font-semibold text-white">{item.title}</h2>
                <p className="mt-2 max-w-[28ch] text-[13px] leading-6 text-[var(--text-3)]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-[96px] md:py-[72px]" id="library">
          <div className="mkt-shell">
            <SectionHead
              eyebrow="Curriculum"
              title="Train by path, not by playlist."
              side="14 paths / 128 lessons"
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {COURSE_CARDS.map((course, index) => (
                <article key={course.title} className="library-preview-card reveal">
                  <div className="flex items-center justify-between">
                    <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-gold-400)]">
                      {course.tag}
                    </span>
                    <span className="font-[family-name:var(--font-display)] text-[32px] leading-none text-white/45">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-8 font-[family-name:var(--font-display)] text-[34px] uppercase leading-none text-white">
                    {course.title}
                  </h3>
                  <p className="mt-3 text-[13px] leading-6 text-[var(--text-3)]">{course.note}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="metric-pill">{course.level}</span>
                    <span className="metric-pill">{course.meta}</span>
                  </div>
                  <div className="mt-8">
                    <div className="flex justify-between font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--text-3)]">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-white/8">
                      <span
                        className="block h-full rounded-full bg-[var(--color-gold-500)]"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/8 pt-6 sm:flex-col sm:items-start sm:gap-4">
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
                Showing the first 4 paths
              </p>
              <Link href="/library" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-gold-400)] hover:text-white">
                Explore full library
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>

        <section className="pb-[96px] md:pb-[72px]" id="how">
          <div className="mkt-shell">
            <SectionHead
              eyebrow="Method"
              title="Simple enough to repeat daily."
              side="25 min sessions"
            />

            <div className="mt-10 grid border-y border-white/8 md:grid-cols-3 sm:grid-cols-1">
              {METHOD_STEPS.map((step) => (
                <article key={step.num} className="reveal border-r border-white/8 p-8 last:border-r-0 sm:border-b sm:border-r-0 sm:last:border-b-0">
                  <div className="font-[family-name:var(--font-display)] text-[72px] leading-none text-[var(--color-gold-400)]/75">
                    {step.num}
                  </div>
                  <h3 className="mt-6 text-[18px] font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 max-w-[30ch] text-[14px] leading-6 text-[var(--text-3)]">
                    {step.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-[96px] md:pb-[72px]" id="pricing">
          <div className="mkt-shell">
            <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-gold-400)]">
                  Membership
                </div>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-[64px] uppercase leading-[0.95] text-white sm:text-[52px]">
                  One library.
                  <br />
                  No tiers.
                </h2>
                <p className="mt-5 max-w-[42ch] text-[15px] leading-7 text-[var(--text-2)]">
                  Every plan opens the same paths, lessons and progress tools.
                </p>
                <ul className="mt-7 grid gap-3">
                  {["All paths included", "Private progress", "Secure checkout", "Cancel monthly anytime"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-[var(--text-2)]">
                      <span className="text-[var(--color-gold-400)]">
                        <Check />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-1">
                {PLANS.map((plan) => (
                  <article
                    key={plan.name}
                    className={`price-card-el reveal rounded-[20px] border p-6 ${
                      plan.featured
                        ? "border-[color-mix(in_oklab,var(--color-brand-500)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-brand-700)_28%,var(--color-surface-1))]"
                        : "border-white/8 bg-[var(--color-surface-1)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-[family-name:var(--font-mono)] text-[10.5px] uppercase tracking-[0.18em] text-[var(--text-3)]">
                        {plan.name}
                      </h3>
                      {plan.featured && (
                        <span className="rounded-full border border-[color-mix(in_oklab,var(--color-gold-400)_35%,transparent)] px-2 py-1 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.14em] text-[var(--color-gold-400)]">
                          Best
                        </span>
                      )}
                    </div>
                    <p className="mt-6 font-[family-name:var(--font-display)] text-[60px] leading-none text-white">
                      {plan.price}
                      <span className="ml-1 font-[family-name:var(--font-sans)] text-sm normal-case text-[var(--text-3)]">
                        {plan.cadence}
                      </span>
                    </p>
                    <p className="mt-4 min-h-[44px] text-[13px] leading-6 text-[var(--text-3)]">
                      {plan.detail}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pricing" className="mkt-btn mkt-btn-gold mkt-btn-lg">
                View pricing
              </Link>
              <Link href="/register" className="mkt-btn mkt-btn-primary mkt-btn-lg">
                Start membership
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>

        <section className="pb-[96px] md:pb-[72px]" id="faq">
          <div className="mkt-shell grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-gold-400)]">
                FAQ
              </div>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-[60px] uppercase leading-none text-white">
                Useful details,
                <br />
                only when needed.
              </h2>
            </div>

            <div className="border-t border-white/8">
              {FAQS.map((item) => (
                <details key={item.q} className="faq-item group border-b border-white/8 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[16px] font-semibold text-white">
                    {item.q}
                    <span className="text-[var(--color-gold-400)] transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[62ch] text-[14px] leading-7 text-[var(--text-3)]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band border-y border-white/8 py-[110px] text-center md:py-[76px]">
          <div className="mkt-shell relative z-[1] max-w-[900px]">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-gold-400)]">
              Ready to begin
            </p>
            <h2
              className="mt-5 font-[family-name:var(--font-display)] uppercase leading-[0.88] text-white"
              style={{ fontSize: "clamp(58px, 9vw, 128px)" }}
            >
              Train with
              <br />
              a map.
            </h2>
            <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-7 text-[var(--text-2)]">
              Start with a path, finish with a clearer practice habit.
            </p>
            <div className="mt-8 flex justify-center gap-3 sm:flex-col">
              <Link href="/register" className="mkt-btn mkt-btn-primary mkt-btn-lg">
                Start membership
                <ArrowRight />
              </Link>
              <Link href="/library" className="mkt-btn mkt-btn-ghost mkt-btn-lg">
                Browse library
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollRevealInit />
    </>
  );
}

function ProductPreview() {
  return (
    <article className="session-card max-w-full min-w-0" aria-label="Rudiment lesson preview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--text-3)]">
            Now training
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-[34px] uppercase leading-none text-white sm:text-[38px]">
            Pocket Architecture
          </h2>
        </div>
        <span className="lesson-pill rounded-full border border-[color-mix(in_oklab,var(--color-gold-400)_35%,transparent)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-gold-400)]">
          Lesson 08
        </span>
      </div>

      <div className="mt-5 rounded-[18px] border border-white/8 bg-[var(--color-surface-0)] p-3">
        <div className="player-stage" role="img" aria-label="Video lesson interface preview">
          <span className="absolute left-4 top-4 rounded-md border border-white/10 bg-black/40 px-2 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-gold-400)]">
            14:28 / 22:10
          </span>
          <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-surface-0)] shadow-2xl">
            <PlayIcon />
          </span>
          <div className="absolute bottom-4 left-4 right-4 grid grid-cols-12 items-end gap-1" aria-hidden="true">
            {[36, 58, 80, 44, 72, 52, 90, 64, 42, 76, 50, 68].map((height, index) => (
              <span
                key={index}
                className="rounded-sm bg-[var(--color-gold-500)]/85"
                style={{ height: `${height * 0.42}px` }}
              />
            ))}
          </div>
        </div>
        <div className="player-progress-track" aria-hidden="true" />
      </div>

      <div className="mt-4 grid gap-2">
        {["Train the groove", "Repeat the drill", "Save resume point"].map((item, index) => (
          <div key={item} className="flex items-center justify-between rounded-[12px] border border-white/8 bg-white/[0.025] px-4 py-3">
            <span className="text-[13px] text-[var(--text-2)]">{item}</span>
            <span className="font-[family-name:var(--font-display)] text-[24px] leading-none text-[var(--color-gold-400)]">
              0{index + 1}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function SectionHead({
  eyebrow,
  title,
  side,
}: {
  eyebrow: string;
  title: string;
  side: string;
}) {
  return (
    <div className="flex items-end justify-between gap-8 md:flex-col md:items-start">
      <div className="max-w-[760px]">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-gold-400)]">
          {eyebrow}
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(38px,6vw,84px)] uppercase leading-[0.92] text-white">
          {title}
        </h2>
      </div>
      <p className="font-[family-name:var(--font-mono)] text-right text-[11px] uppercase tracking-[0.18em] text-[var(--text-3)] md:text-left">
        {side}
      </p>
    </div>
  );
}

function Footer() {
  const links = [
    { label: "Library", href: "/library" },
    { label: "How it works", href: "#how" },
    { label: "Pricing", href: "#pricing" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ];

  return (
    <footer className="bg-[var(--color-surface-0)] py-10">
      <div className="mkt-shell flex items-center justify-between gap-6 md:flex-col md:items-start">
        <Link
          href="/"
          className="inline-flex items-center gap-[10px] font-[family-name:var(--font-display)] text-[34px] tracking-[0.08em] text-[var(--color-gold-400)]"
        >
          <span className="logo-dot" aria-hidden="true" />
          Rudiment
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--text-3)]">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--text-3)]">
          © 2026 Rudiment Studio
        </p>
      </div>
    </footer>
  );
}
