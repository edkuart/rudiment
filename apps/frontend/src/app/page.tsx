import Link from "next/link";
import { NavBar } from "@/components/marketing/NavBar";
import { ScrollRevealInit } from "@/components/marketing/ScrollRevealInit";

/* ─── Static data ─────────────────────────────────────────────────── */

const WAVE_HEIGHTS = [
  22, 48, 68, 38, 82, 54, 28, 64, 88, 42, 70, 32, 60, 78, 46, 24, 56, 72, 38,
  84, 50, 30, 66, 44, 76, 36, 58, 26,
];

const COURSE_CARDS = [
  {
    tag: "PATH · GROOVE",
    num: "01",
    thumbClass: "thumb-a",
    difficulty: "Foundational",
    lessons: "12 Lessons",
    title: "Pocket Architecture",
    subtitle: "Subdivision, dynamics and limb independence in a 4-piece kit.",
    progress: 67,
    bars: [30, 60, 80, 46, 72, 38, 90, 54, 30, 64, 48, 78],
  },
  {
    tag: "PATH · TECHNIQUE",
    num: "02",
    thumbClass: "thumb-b",
    difficulty: "Intermediate",
    lessons: "18 Lessons",
    title: "Hand Technique I",
    subtitle: "Moeller, Free Stroke, finger control. From rebound to expression.",
    progress: 34,
    bars: [46, 24, 70, 52, 88, 34, 60, 76, 42, 58, 30, 82],
  },
  {
    tag: "PATH · COORDINATION",
    num: "03",
    thumbClass: "thumb-c",
    difficulty: "Advanced",
    lessons: "22 Lessons",
    title: "Polyrhythmic Mind",
    subtitle: "3:2, 4:3, 5:4 — internalized as feel, not arithmetic.",
    progress: 12,
    bars: [36, 74, 48, 82, 30, 66, 54, 88, 42, 58, 24, 78],
  },
  {
    tag: "PATH · READING",
    num: "04",
    thumbClass: "thumb-d",
    difficulty: "Foundational",
    lessons: "16 Lessons",
    title: "Reading Charts",
    subtitle: "Slash, comp, kicks, hits — read a chart at a session, not a class.",
    progress: 0,
    bars: [54, 36, 80, 42, 64, 28, 74, 50, 86, 38, 62, 46],
  },
];

/* ─── Inline SVG icons ────────────────────────────────────────────── */

function ArrowRight() {
  return (
    <svg
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

function Check({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 8l4 4 8-9" />
    </svg>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      <NavBar />

      <main>
        {/* ══════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════ */}
        <section
          className="hero-section relative overflow-hidden border-b border-white/8 pb-20 pt-7"
          id="top"
        >
          <div className="mkt-glow mkt-glow-brand" aria-hidden="true" />
          <div className="mkt-glow mkt-glow-gold" aria-hidden="true" />

          <div className="relative mx-auto max-w-[1280px] px-8">
            <div className="grid items-center gap-16 pt-10 lg:grid-cols-[1.15fr_0.95fr]">
              {/* Left: Headline + stats */}
              <div>
                <div className="mb-[22px] inline-flex items-center gap-3">
                  <span className="eyebrow-tick" aria-hidden="true" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-gold-400)]">
                    Premium drum academy · Vol. 01
                  </span>
                </div>

                <h1
                  className="font-[family-name:var(--font-display)] uppercase text-white tracking-[-0.005em]"
                  style={{ fontSize: "clamp(56px, 8.4vw, 132px)", lineHeight: "0.88" }}
                >
                  Practice
                  <br />
                  with intent.
                  <br />
                  <span className="text-[var(--color-gold-400)]">Publish</span> like a pro.
                </h1>

                <p className="mt-[26px] max-w-[520px] text-[17px] leading-[1.6] text-[var(--text-2)]">
                  Rudiment is a structured library of audiovisual drum lessons for adults who
                  already practice daily. No tricks, no algorithm tax — just the craft, in the
                  order it should be learned.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/register" className="mkt-btn mkt-btn-primary mkt-btn-lg">
                    Start Membership
                    <ArrowRight />
                  </Link>
                  <Link href="/library" className="mkt-btn mkt-btn-ghost mkt-btn-lg">
                    Explore the Library
                  </Link>
                </div>

                {/* Stat row */}
                <div
                  className="mt-20 grid grid-cols-2 border-t border-b border-white/8 sm:grid-cols-4"
                  aria-label="Platform statistics"
                >
                  {[
                    { num: "128", unit: "+", label: "Structured lessons" },
                    { num: "14", unit: "", label: "Curriculum paths" },
                    { num: "90", unit: "%", label: "Completion trigger" },
                    { num: "4K", unit: "", label: "Multi-angle video" },
                  ].map((stat, i) => (
                    <div
                      key={stat.label}
                      className="stat-row-cell border-r border-white/8 px-6 py-[22px] last:border-r-0"
                      style={i === 1 ? { borderRight: "1px solid var(--hairline)" } : undefined}
                    >
                      <div
                        className="font-[family-name:var(--font-display)] text-[44px] leading-none text-white"
                      >
                        {stat.num}
                        {stat.unit && (
                          <span className="ml-1 align-top text-[22px] text-[var(--color-gold-400)]">
                            {stat.unit}
                          </span>
                        )}
                      </div>
                      <div className="mt-[10px] text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Session preview card */}
              <div className="reveal">
                <article className="session-card" aria-label="Lesson preview">
                  {/* Card header */}
                  <header className="mb-[18px] flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-3)]">
                        Now training
                      </div>
                      <div
                        className="mt-2 font-[family-name:var(--font-display)] text-[32px] uppercase leading-none text-white"
                      >
                        Pocket Architecture
                      </div>
                    </div>
                    <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-[10px] py-1.5 text-[11px] tracking-[0.06em] text-[var(--color-gold-400)] font-[family-name:var(--font-mono)]"
                      style={{
                        borderColor: "color-mix(in oklab, var(--color-gold-400) 30%, transparent)",
                        background: "color-mix(in oklab, var(--color-gold-400) 8%, transparent)",
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold-500)]"
                        style={{ boxShadow: "0 0 8px var(--color-gold-500)" }}
                      />
                      Lesson 08 / 12
                    </div>
                  </header>

                  {/* Player */}
                  <div
                    className="rounded-[18px] border border-white/8 p-[14px]"
                    style={{ background: "var(--color-surface-0)" }}
                  >
                    <div className="mb-3 flex items-center justify-between font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--text-3)]">
                      <span>Path · Groove Foundations</span>
                      <span>14:28 / 22:10</span>
                    </div>

                    {/* Video stage */}
                    <div
                      className="player-stage"
                      role="img"
                      aria-label="Lesson video preview placeholder"
                    >
                      {/* Timecode */}
                      <span
                        className="absolute left-[14px] top-[14px] rounded-[6px] border border-white/8 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-gold-400)] px-2 py-1"
                        style={{ background: "rgba(0,0,0,0.4)" }}
                      >
                        PRIVATE STREAM · MUX
                      </span>

                      {/* Decorative rings */}
                      <span
                        className="absolute rounded-full border border-white/[0.12]"
                        style={{ width: "64%", aspectRatio: "1", left: "18%", top: "12%" }}
                      />
                      <span
                        className="absolute rounded-full border border-white/[0.18]"
                        style={{ width: "38%", aspectRatio: "1", left: "31%", top: "24%" }}
                      />
                      <span
                        className="absolute rounded-full"
                        style={{
                          width: "18%",
                          aspectRatio: "1",
                          left: "41%",
                          top: "34%",
                          background:
                            "radial-gradient(circle, color-mix(in oklab, var(--color-gold-400) 50%, transparent), transparent 70%)",
                          borderColor:
                            "color-mix(in oklab, var(--color-gold-400) 35%, transparent)",
                          border: "1px solid",
                        }}
                      />

                      {/* Play button */}
                      <span
                        className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90"
                        style={{
                          color: "var(--color-surface-0)",
                          boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
                        }}
                        aria-hidden="true"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          style={{ transform: "translateX(2px)" }}
                        >
                          <path d="M4 3l9 5-9 5z" />
                        </svg>
                      </span>

                      {/* Waveform */}
                      <div
                        className="absolute bottom-[14px] left-[14px] right-[14px] flex items-end gap-[3px]"
                        style={{ height: "38px" }}
                        aria-hidden="true"
                      >
                        {WAVE_HEIGHTS.map((h, i) => (
                          <span
                            key={i}
                            className="waveform-bar flex-1"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Progress track */}
                    <div className="player-progress-track" aria-hidden="true" />

                    {/* Chips */}
                    <div className="mt-[14px] grid grid-cols-3 gap-2">
                      {[
                        { v: "90%", l: "Completion trigger" },
                        { v: "Mux", l: "Secure delivery" },
                        { v: "Live", l: "Progress sync" },
                      ].map((chip) => (
                        <div
                          key={chip.l}
                          className="rounded-[12px] border border-white/8 p-[10px_12px]"
                          style={{ background: "rgba(255,255,255,0.025)" }}
                        >
                          <div className="font-[family-name:var(--font-display)] text-[22px] text-white">
                            {chip.v}
                          </div>
                          <div className="mt-1 text-[9.5px] uppercase tracking-[0.14em] text-[var(--text-3)]">
                            {chip.l}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flow list */}
                  <div className="mt-[14px] grid gap-1.5">
                    {[
                      { label: "Choose a path", done: true },
                      { label: "Train one concept deeply", done: true },
                      { label: "Track wins by lesson", done: false },
                      { label: "Return where you left off", done: false },
                    ].map((step, i) => (
                      <div
                        key={step.label}
                        className="flex items-center justify-between rounded-[12px] border border-white/8 px-[14px] py-3 text-[13px] text-[var(--text-2)]"
                        style={{ background: "rgba(255,255,255,0.025)" }}
                      >
                        <span>{step.label}</span>
                        <div className="flex items-center gap-[14px]">
                          <span
                            className="h-4 w-4 rounded-full border"
                            style={
                              step.done
                                ? {
                                    background: "var(--color-gold-400)",
                                    borderColor: "var(--color-gold-400)",
                                  }
                                : { borderColor: "var(--hairline-strong)" }
                            }
                          />
                          <span className="font-[family-name:var(--font-display)] text-[22px] leading-none text-[var(--color-gold-400)]">
                            0{i + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            TRUST BAR
        ══════════════════════════════════════════════ */}
        <section
          className="border-b border-white/8"
          style={{ background: "rgba(0,0,0,0.18)" }}
          aria-label="Platform features"
        >
          <div className="mx-auto max-w-[1280px] px-8">
            <div className="flex items-center justify-between gap-[18px] py-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)] overflow-x-auto md:h-16 md:py-0">
              {[
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M8 1.5l5.5 2v4c0 3-2.4 5.6-5.5 6.5C4.9 13.1 2.5 10.5 2.5 7.5v-4z" />
                    </svg>
                  ),
                  label: "Secure video delivery",
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2 12V4M2 12h12M5 9V6M8 9V4M11 9V7" />
                    </svg>
                  ),
                  label: "Progress tracking",
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="2" y="3" width="12" height="10" rx="1" />
                      <path d="M2 6h12M5 9h2" />
                    </svg>
                  ),
                  label: "Stripe billing",
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M3 3h10v10H3zM3 7h10M7 3v10" />
                    </svg>
                  ),
                  label: "Admin publishing",
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" />
                    </svg>
                  ),
                  label: "Resume points",
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2 8l4 4 8-9" />
                    </svg>
                  ),
                  label: "No ads, ever",
                },
              ].map((item, i) => (
                <div key={item.label} className="contents">
                  <span className="inline-flex shrink-0 items-center gap-[10px] whitespace-nowrap">
                    <span className="text-[var(--color-gold-400)]">{item.icon}</span>
                    {item.label}
                  </span>
                  {i < 5 && (
                    <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--hairline-strong)" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            PROBLEMS / MANIFESTO
        ══════════════════════════════════════════════ */}
        <section className="py-[120px] md:py-[80px]" id="manifest">
          <div className="mx-auto max-w-[1280px] px-8">
            {/* Section head */}
            <div className="mb-14 flex items-end justify-between gap-6 md:flex-col md:items-stretch">
              <div className="max-w-[820px]">
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-gold-400)]">
                  The problem we solve
                </div>
                <h2
                  className="mt-[14px] font-[family-name:var(--font-display)] uppercase leading-[0.92] text-white"
                  style={{ fontSize: "clamp(40px, 5.6vw, 84px)" }}
                >
                  Most drum content is{" "}
                  <span className="text-[var(--text-3)]">made for the algorithm.</span>
                </h2>
              </div>
              <div className="font-[family-name:var(--font-mono)] text-right text-[11px] uppercase tracking-[0.18em] text-[var(--text-3)] min-w-[140px] md:text-left">
                Manifesto
                <br />
                §01 · §02 · §03
              </div>
            </div>

            {/* Problems grid */}
            <div className="grid grid-cols-3 border-t border-b border-white/8 md:grid-cols-1">
              {[
                {
                  num: "01",
                  title: "Tutorials end at the hook.",
                  body: "You see the pattern, you don't see the weeks of practice that make it sit in the pocket. Rudiment teaches the work, not the trick.",
                  tag: "Long-form, structured craft",
                },
                {
                  num: "02",
                  title: "Playlists pretend to be paths.",
                  body: "A row of unrelated videos doesn't compound. Each Rudiment path is sequenced — every lesson assumes the one before.",
                  tag: "Curriculum, not catalog",
                },
                {
                  num: "03",
                  title: "Progress disappears.",
                  body: "Bookmarks and likes are not practice. Rudiment tracks completion, resume points and time on tool — privately, by lesson.",
                  tag: "Practice you can measure",
                },
              ].map((card, i) => (
                <article
                  key={card.num}
                  className="problem-card-el reveal border-r border-white/8 px-8 py-9 transition-colors hover:bg-white/[0.02] last:border-r-0 md:border-r-0 md:border-b md:last:border-b-0"
                >
                  <div className="problem-num">{card.num}</div>
                  <h3 className="mt-7 font-[family-name:var(--font-display)] text-[30px] uppercase leading-none text-white">
                    {card.title}
                  </h3>
                  <p className="mt-[14px] max-w-[32ch] text-[15px] leading-[1.6] text-[var(--text-2)]">
                    {card.body}
                  </p>
                  <div className="mt-7 inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-[10.5px] uppercase tracking-[0.16em] text-[var(--text-3)]">
                    <span className="text-[var(--color-brand-500)]">→</span>
                    {card.tag}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            LIBRARY PREVIEW
        ══════════════════════════════════════════════ */}
        <section className="pb-[120px] md:pb-[80px]" id="library">
          <div className="mx-auto max-w-[1280px] px-8">
            {/* Section head */}
            <div className="mb-14 flex items-end justify-between gap-6 md:flex-col md:items-stretch">
              <div className="max-w-[820px]">
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-gold-400)]">
                  What you'll train
                </div>
                <h2
                  className="mt-[14px] font-[family-name:var(--font-display)] uppercase leading-[0.92] text-white"
                  style={{ fontSize: "clamp(40px, 5.6vw, 84px)" }}
                >
                  A library, sequenced{" "}
                  <span className="text-[var(--text-3)]">the way a drummer thinks.</span>
                </h2>
              </div>
              <div className="font-[family-name:var(--font-mono)] text-right text-[11px] uppercase tracking-[0.18em] text-[var(--text-3)] min-w-[140px] md:text-left">
                Library
                <br />
                14 paths · 128 lessons
              </div>
            </div>

            {/* Course rail */}
            <div
              className="grid gap-5 overflow-x-auto pb-2"
              style={{
                gridTemplateColumns: "repeat(4, minmax(280px, 1fr))",
                scrollSnapType: "x mandatory",
              }}
            >
              {COURSE_CARDS.map((course) => (
                <article
                  key={course.num}
                  className="course-card-el reveal overflow-hidden rounded-[24px] border border-white/8 transition-all hover:-translate-y-0.5 hover:border-white/[0.14] scroll-snap-align-start"
                  style={{ background: "var(--color-surface-1)", scrollSnapAlign: "start" }}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative border-b border-white/8"
                    style={{ aspectRatio: "16/10", overflow: "hidden" }}
                  >
                    <div
                      className="h-full w-full"
                      style={{
                        background:
                          course.thumbClass === "thumb-a"
                            ? "linear-gradient(135deg, oklch(0.32 0.14 18) 0%, oklch(0.12 0.02 260) 70%)"
                            : course.thumbClass === "thumb-b"
                              ? "linear-gradient(135deg, oklch(0.30 0.10 80) 0%, oklch(0.10 0.01 260) 70%)"
                              : course.thumbClass === "thumb-c"
                                ? "linear-gradient(135deg, oklch(0.22 0.09 220) 0%, oklch(0.11 0.02 260) 70%)"
                                : "linear-gradient(135deg, oklch(0.28 0.06 320) 0%, oklch(0.10 0.02 260) 70%)",
                      }}
                    />
                    {/* Tag */}
                    <span
                      className="absolute left-[14px] top-[14px] rounded-[6px] border border-white/[0.18] px-2 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm"
                      style={{ background: "rgba(0,0,0,0.32)" }}
                    >
                      {course.tag}
                    </span>
                    {/* Number */}
                    <span className="absolute right-4 top-[14px] font-[family-name:var(--font-display)] text-[38px] leading-none text-white/85">
                      {course.num}
                    </span>
                    {/* Waveform bars */}
                    <div
                      className="absolute bottom-4 left-4 right-4 flex items-end gap-[3px] opacity-70"
                      style={{ height: "38px" }}
                      aria-hidden="true"
                    >
                      {course.bars.map((h, i) => (
                        <span
                          key={i}
                          className="flex-1 rounded-[1.5px] bg-white/55"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-[22px]">
                    <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[10.5px] uppercase tracking-[0.14em] text-[var(--text-3)]">
                      <span className="rounded-full border border-white/[0.14] px-2 py-0.5 text-[var(--text-2)]">
                        {course.difficulty}
                      </span>
                      <span
                        className="rounded-full border px-2 py-0.5 text-[var(--color-gold-400)]"
                        style={{
                          borderColor: "color-mix(in oklab, var(--color-gold-400) 30%, transparent)",
                        }}
                      >
                        {course.lessons}
                      </span>
                    </div>
                    <h3 className="mt-[14px] font-[family-name:var(--font-display)] text-[28px] uppercase leading-[1.02] text-white">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-[13px] text-[var(--text-3)]">{course.subtitle}</p>

                    {/* Progress */}
                    <div className="mt-5 flex items-center justify-between font-[family-name:var(--font-mono)] text-[10.5px] uppercase tracking-[0.14em] text-[var(--text-3)]">
                      <span>Path progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div
                      className="relative mt-2 h-0.5 rounded-sm"
                      style={{ background: "var(--color-surface-3)" }}
                    >
                      <span
                        className="course-progress-fill"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Rail footer */}
            <div className="mt-9 flex items-center justify-between border-t border-white/8 pt-6">
              <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
                Showing 4 of 14 paths
              </span>
              <Link
                href="/library"
                className="inline-flex items-center gap-2 text-[14px] font-medium text-[var(--color-gold-400)] hover:text-white transition-colors"
              >
                Explore the full library
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════ */}
        <section className="pb-[120px] md:pb-[80px]" id="how">
          <div className="mx-auto max-w-[1280px] px-8">
            {/* Section head */}
            <div className="mb-14 flex items-end justify-between gap-6 md:flex-col md:items-stretch">
              <div className="max-w-[820px]">
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-gold-400)]">
                  How it works
                </div>
                <h2
                  className="mt-[14px] font-[family-name:var(--font-display)] uppercase leading-[0.92] text-white"
                  style={{ fontSize: "clamp(40px, 5.6vw, 84px)" }}
                >
                  Three steps.{" "}
                  <span className="text-[var(--text-3)]">No funnel, no fluff.</span>
                </h2>
              </div>
              <div className="font-[family-name:var(--font-mono)] text-right text-[11px] uppercase tracking-[0.18em] text-[var(--text-3)] min-w-[140px] md:text-left">
                Daily practice
                <br />
                ~25 min sessions
              </div>
            </div>

            {/* Steps grid */}
            <div className="steps-grid grid grid-cols-3 border-t border-b border-white/8 md:grid-cols-1">
              {[
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M3 6h12M3 12h18M3 18h10" />
                      <circle cx="20" cy="6" r="2" />
                      <circle cx="14" cy="18" r="2" />
                    </svg>
                  ),
                  num: "Step 01",
                  title: "Choose a path",
                  body: "Pick a discipline — groove, technique, reading, coordination — and Rudiment sequences the lessons in order.",
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <circle cx="12" cy="12" r="9" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="12" cy="12" r="1" fill="currentColor" />
                    </svg>
                  ),
                  num: "Step 02",
                  title: "Train one concept",
                  body: "Each lesson is built for repeat practice — drills, examples, play-along stems and resume points down to the second.",
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M3 17l5-5 4 4 9-9" />
                      <path d="M14 7h7v7" />
                    </svg>
                  ),
                  num: "Step 03",
                  title: "Track progress",
                  body: "Completion fires at 90% watch time. See your week, your streak and your weakest concept — privately, never social.",
                },
              ].map((step, i) => (
                <div
                  key={step.num}
                  className="step-el reveal relative z-[1] border-r border-white/8 p-11 last:border-r-0 md:border-r-0 md:border-b md:last:border-b-0"
                  style={{ background: "var(--color-surface-0)" }}
                >
                  <div
                    className="mb-[22px] flex h-14 w-14 items-center justify-center rounded-[14px] border text-[var(--color-gold-400)]"
                    style={{
                      borderColor: "var(--hairline-strong)",
                      background: "linear-gradient(180deg, var(--color-surface-1), var(--color-surface-0))",
                    }}
                  >
                    {step.icon}
                  </div>
                  <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--text-3)]">
                    {step.num}
                  </div>
                  <h4 className="mt-[10px] font-[family-name:var(--font-display)] text-[32px] uppercase leading-none text-white">
                    {step.title}
                  </h4>
                  <p className="mt-3 max-w-[32ch] text-[14px] leading-[1.6] text-[var(--text-2)]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            PRICING
        ══════════════════════════════════════════════ */}
        <section className="pb-[120px] md:pb-[80px]" id="pricing">
          <div className="mx-auto max-w-[1280px] px-8">
            <div className="grid items-start gap-16 lg:grid-cols-[0.95fr_1.4fr] md:gap-10 md:grid-cols-1">
              {/* Copy */}
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-gold-400)]">
                  Membership
                </div>
                <h2
                  className="mt-[14px] font-[family-name:var(--font-display)] uppercase leading-[0.95] text-white"
                  style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
                >
                  One library.{" "}
                  <span className="text-[var(--text-3)]">No tiers.</span>
                </h2>
                <p className="mt-[22px] max-w-[44ch] text-[16px] leading-[1.7] text-[var(--text-2)]">
                  Every member gets every path, every lesson, every play-along — the same access
                  whether you join for a month or for life. We don't gate the craft.
                </p>
                <ul className="mt-7 grid gap-[10px]">
                  {[
                    "Unlimited access to all paths",
                    "Multi-angle 4K video, downloadable stems",
                    "Private progress tracking, no social feed",
                    "Cancel anytime, in-app",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-[14px] text-[var(--text-2)]">
                      <span className="text-[var(--color-gold-400)]">
                        <Check />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link href="/pricing" className="mkt-btn mkt-btn-gold mkt-btn-lg">
                    View full pricing
                  </Link>
                  <a href="#" className="mkt-btn mkt-btn-ghost mkt-btn-lg">
                    Read the FAQ
                  </a>
                </div>
              </div>

              {/* Price cards */}
              <div className="grid grid-cols-3 gap-[14px] sm:grid-cols-1">
                {[
                  {
                    plan: "Monthly",
                    price: "$29",
                    per: "/ mo",
                    note: "Full access, billed every 30 days. Cancel anytime, in-app.",
                    foot: "Best for trial",
                    featured: false,
                    ribbon: null,
                    footAccent: false,
                  },
                  {
                    plan: "Annual",
                    price: "$290",
                    per: "/ yr",
                    note: "Best rate for committed students. ~$24/mo, billed yearly.",
                    foot: "Save 17%",
                    featured: true,
                    ribbon: "Recommended",
                    footAccent: true,
                  },
                  {
                    plan: "Lifetime",
                    price: "$1,990",
                    per: "once",
                    note: "One payment. Permanent access to everything we ever publish.",
                    foot: "Limited cohort",
                    featured: false,
                    ribbon: null,
                    footAccent: false,
                  },
                ].map((card) => (
                  <article
                    key={card.plan}
                    className={`price-card-el reveal relative rounded-[24px] border border-white/8 p-[26px_22px] transition-transform hover:-translate-y-0.5 hover:border-white/[0.14] ${
                      card.featured ? "price-card-featured" : ""
                    }`}
                    style={!card.featured ? { background: "var(--color-surface-1)" } : undefined}
                  >
                    {card.ribbon && (
                      <div
                        className="absolute right-[18px] top-[18px] rounded-[6px] border px-2 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold-400)]"
                        style={{
                          borderColor: "color-mix(in oklab, var(--color-gold-400) 35%, transparent)",
                          background: "color-mix(in oklab, var(--color-gold-400) 8%, transparent)",
                        }}
                      >
                        {card.ribbon}
                      </div>
                    )}
                    <div
                      className={`font-[family-name:var(--font-mono)] text-[10.5px] uppercase tracking-[0.18em] ${
                        card.featured ? "text-[var(--color-gold-400)]" : "text-[var(--text-3)]"
                      }`}
                    >
                      {card.plan}
                    </div>
                    <div className="mt-[18px] font-[family-name:var(--font-display)] text-[64px] leading-none text-white">
                      {card.price}
                      <span className="ml-1 font-[family-name:var(--font-sans)] text-[14px] normal-case tracking-normal text-[var(--text-3)]">
                        {card.per}
                      </span>
                    </div>
                    <p className="mt-[14px] text-[13px] leading-[1.55] text-[var(--text-2)]">
                      {card.note}
                    </p>
                    <div className="mt-[22px] flex items-center justify-between border-t border-white/8 pt-[18px] font-[family-name:var(--font-mono)] text-[10.5px] uppercase tracking-[0.14em]">
                      <span
                        style={
                          card.footAccent ? { color: "var(--color-gold-400)" } : { color: "var(--text-3)" }
                        }
                      >
                        {card.foot}
                      </span>
                      <span className="text-[var(--text-3)]">→</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FINAL CTA BAND
        ══════════════════════════════════════════════ */}
        <section
          className="cta-band border-t border-b border-white/8 py-[140px] text-center md:py-[80px]"
          style={{
            background:
              "radial-gradient(ellipse at center top, color-mix(in oklab, var(--color-brand-700) 36%, transparent), transparent 60%), var(--color-surface-0)",
          }}
        >
          <div className="relative z-[1] mx-auto max-w-[1280px] px-8">
            <div className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-gold-400)]">
              Ready to begin
            </div>
            <h2
              className="mt-[22px] font-[family-name:var(--font-display)] uppercase leading-[0.86] text-white tracking-[-0.005em]"
              style={{ fontSize: "clamp(56px, 9vw, 144px)" }}
            >
              Ready to train
              <br />
              <span className="text-[var(--color-gold-400)]">seriously?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[520px] text-[17px] leading-[1.6] text-[var(--text-2)]">
              No trials, no tiers, no algorithm. One library, paced for adult drummers who already
              practice every day.
            </p>
            <div className="mt-[42px] inline-flex gap-3">
              <Link href="/register" className="mkt-btn mkt-btn-primary mkt-btn-lg">
                Start Membership
                <ArrowRight />
              </Link>
              <Link href="/library" className="mkt-btn mkt-btn-ghost mkt-btn-lg">
                Browse library first
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer style={{ background: "var(--color-surface-0)", padding: "72px 0 36px" }}>
        <div className="mx-auto max-w-[1280px] px-8">
          {/* Grid */}
          <div className="grid grid-cols-[1.4fr_repeat(3,1fr)] gap-12 border-b border-white/8 pb-14 md:grid-cols-2 md:gap-10 sm:grid-cols-1">
            {/* Brand */}
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-[10px] font-[family-name:var(--font-display)] text-[36px] tracking-[0.08em] text-[var(--color-gold-400)]"
              >
                <span className="logo-dot" aria-hidden="true" />
                Rudiment
              </Link>
              <p className="mt-[14px] max-w-[36ch] text-[14px] leading-[1.6] text-[var(--text-3)]">
                Practice with intent. Publish like a pro. A premium audiovisual academy for serious
                drummers.
              </p>
            </div>

            {/* Link columns */}
            {[
              {
                heading: "Platform",
                links: [
                  { label: "Library", href: "/library" },
                  { label: "How it works", href: "#how" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Changelog", href: "#" },
                ],
              },
              {
                heading: "Legal",
                links: [
                  { label: "Terms", href: "/terms" },
                  { label: "Privacy", href: "/privacy" },
                  { label: "Refunds", href: "#" },
                  { label: "DMCA", href: "#" },
                ],
              },
              {
                heading: "Connect",
                links: [
                  { label: "Newsletter", href: "#" },
                  { label: "Instagram", href: "#" },
                  { label: "YouTube", href: "#" },
                  { label: "Contact", href: "#" },
                ],
              },
            ].map((col) => (
              <div key={col.heading}>
                <h5 className="mb-[18px] font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--text-3)]">
                  {col.heading}
                </h5>
                <ul className="grid gap-[10px]">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[14px] text-[var(--text-2)] hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer bar */}
          <div className="mt-7 flex items-center justify-between font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--text-3)]">
            <span>© 2026 Rudiment Studio</span>
            <span className="inline-flex gap-[18px]">
              <span>Mux delivery</span>
              <span>·</span>
              <span>Stripe billing</span>
              <span>·</span>
              <span>Built in Brooklyn</span>
            </span>
          </div>
        </div>
      </footer>

      <ScrollRevealInit />
    </>
  );
}
