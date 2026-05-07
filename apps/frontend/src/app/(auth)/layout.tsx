export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Panel izquierdo — branding */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "var(--color-surface-1)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 70%, var(--color-brand-500), transparent 60%)",
          }}
        />
        <div className="relative z-10">
          <span className="text-2xl font-bold tracking-tight" style={{ color: "white" }}>
            Rudiment
          </span>
        </div>
        <div className="relative z-10">
          <blockquote
            className="text-xl font-medium leading-relaxed"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            "The drum is the heartbeat of all music. Master it, and you master everything."
          </blockquote>
        </div>
      </div>

      {/* Panel derecho — form */}
      <div
        className="flex items-center justify-center p-6 lg:p-12"
        style={{ background: "var(--color-surface-0)" }}
      >
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
