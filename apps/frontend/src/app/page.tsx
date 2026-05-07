import Link from "next/link";

const focusAreas = [
  {
    title: "Curriculum that compounds",
    body: "Structured paths for groove, technique, reading, fills, coordination, and musical control.",
  },
  {
    title: "Private playback and progress",
    body: "Every lesson is built for repeat practice with secure video, resume points, and completion tracking.",
  },
  {
    title: "Admin-ready publishing",
    body: "Create courses, upload lessons, organize sections, and manage the academy without leaving the app.",
  },
];

const learningFlow = [
  "Choose a path",
  "Train one concept deeply",
  "Track wins by lesson",
  "Return where you left off",
];

const membershipPreview = [
  {
    name: "Monthly",
    price: "$29",
    note: "Full access, billed every 30 days",
  },
  {
    name: "Annual",
    price: "$290",
    note: "Best rate for committed students",
  },
  {
    name: "Lifetime",
    price: "$199",
    note: "One payment for long-term access",
  },
];

const statBlocks = [
  { value: "15", label: "planned phases" },
  { value: "27", label: "backend tests passing" },
  { value: "3", label: "core learning surfaces" },
  { value: "1", label: "academy experience" },
];

export default function HomePage() {
  return (
    <main className="bg-[var(--color-surface-0)] text-[var(--text-1)]">
      <section className="hero-noise relative overflow-hidden border-b border-white/8">
        <div className="pointer-events-none absolute inset-0">
          <div className="pulse-glow absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-[var(--color-brand-500)]/18 blur-3xl" />
          <div className="slow-drift absolute right-[-6rem] top-12 h-80 w-80 rounded-full bg-[var(--color-gold-500)]/10 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col px-5 pb-12 pt-6 sm:px-8 md:pb-16 lg:px-10">
          <div className="mb-10 flex items-center justify-between gap-6">
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-4xl uppercase text-[var(--color-gold-400)]"
            >
              Rudiment
            </Link>
            <div className="flex items-center gap-4 text-sm text-[var(--text-2)]">
              <Link href="/pricing" className="transition-colors hover:text-[var(--text-1)]">
                Pricing
              </Link>
              <Link href="/library" className="transition-colors hover:text-[var(--text-1)]">
                Library
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/12 px-4 py-2 text-[var(--text-1)] transition-colors hover:border-[var(--color-gold-400)]/50 hover:bg-white/4"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div className="max-w-2xl">
              <p className="mb-5 text-sm uppercase text-[var(--color-gold-400)]">
                Premium drum academy platform
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-6xl uppercase leading-none text-white sm:text-7xl md:text-8xl">
                Practice with intent. Publish like a pro.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[var(--text-2)] sm:text-lg">
                Rudiment is the premium learning surface for serious drummers:
                structured courses, secure video delivery, student progress,
                billing, and an admin workflow built to run the academy cleanly.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Start Membership
                </Link>
                <Link
                  href="/library"
                  className="rounded-full border border-white/12 px-6 py-3 text-sm font-semibold text-[var(--text-1)] transition-colors hover:border-[var(--color-gold-400)]/40 hover:bg-white/4"
                >
                  Explore Library
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {statBlocks.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4"
                  >
                    <p className="font-[family-name:var(--font-display)] text-4xl uppercase text-white">
                      {item.value}
                    </p>
                    <p className="mt-2 text-xs uppercase text-[var(--text-3)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[2rem] bg-white/6 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--color-surface-1)]/92 p-6 shadow-2xl shadow-black/30">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase text-[var(--text-3)]">
                      Session preview
                    </p>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-3xl uppercase text-white">
                      Pocket Architecture
                    </p>
                  </div>
                  <div className="rounded-full border border-[var(--color-gold-400)]/25 bg-[var(--color-gold-400)]/10 px-3 py-1 text-xs uppercase text-[var(--color-gold-400)]">
                    Lesson 08
                  </div>
                </div>

                <div className="mb-6 overflow-hidden rounded-[1.5rem] border border-white/8 bg-[var(--color-surface-0)] p-5">
                  <div className="mb-5 flex items-center justify-between text-xs uppercase text-[var(--text-3)]">
                    <span>Private playback</span>
                    <span>14:28</span>
                  </div>
                  <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-white/8 bg-[linear-gradient(135deg,rgba(174,61,43,0.35),rgba(11,12,16,0.9))]">
                    <div className="absolute left-8 top-8 h-28 w-28 rounded-full border border-[var(--color-gold-400)]/40 bg-black/20" />
                    <div className="absolute bottom-8 right-8 h-36 w-36 rounded-full border border-white/15 bg-[var(--color-brand-500)]/20" />
                    <div className="absolute inset-x-6 bottom-8 flex items-end gap-2">
                      {Array.from({ length: 18 }).map((_, index) => (
                        <span
                          key={index}
                          className="flex-1 rounded-full bg-[var(--color-gold-400)]/80"
                          style={{ height: `${18 + ((index * 7) % 54)}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs uppercase text-[var(--text-3)]">
                    <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3">
                      <p className="font-[family-name:var(--font-display)] text-2xl text-white">
                        90%
                      </p>
                      Completion trigger
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3">
                      <p className="font-[family-name:var(--font-display)] text-2xl text-white">
                        Mux
                      </p>
                      Secure delivery
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3">
                      <p className="font-[family-name:var(--font-display)] text-2xl text-white">
                        Live
                      </p>
                      Progress sync
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {learningFlow.map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-4 py-3"
                    >
                      <span className="text-sm text-[var(--text-2)]">{step}</span>
                      <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-gold-400)]">
                        0{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/8 bg-black/10 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {focusAreas.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.5rem] border border-white/8 bg-white/4 p-6"
            >
              <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase text-white">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm uppercase text-[var(--color-gold-400)]">
              Membership snapshot
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-5xl uppercase text-white sm:text-6xl">
              Built to sell a serious learning product.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-[var(--text-2)]">
              The public surface can convert new students, the student area can
              keep them training, and the admin side can publish and measure the
              academy without duct tape.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/pricing"
                className="rounded-full border border-[var(--color-gold-400)]/35 px-5 py-3 text-sm font-semibold text-[var(--color-gold-400)] transition-colors hover:bg-[var(--color-gold-400)]/10"
              >
                View Pricing
              </Link>
              <Link
                href="/admin"
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-[var(--text-1)] transition-colors hover:bg-white/4"
              >
                Open Admin
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {membershipPreview.map((plan) => (
              <article
                key={plan.name}
                className="rounded-[1.5rem] border border-white/8 bg-[var(--color-surface-1)] p-5"
              >
                <p className="text-xs uppercase text-[var(--text-3)]">{plan.name}</p>
                <p className="mt-4 font-[family-name:var(--font-display)] text-5xl uppercase text-white">
                  {plan.price}
                </p>
                <p className="mt-4 text-sm leading-7 text-[var(--text-2)]">
                  {plan.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
