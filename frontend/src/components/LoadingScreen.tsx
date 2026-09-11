export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[999] grid animate-fadeIn place-items-center overflow-hidden bg-polar-950/90 text-white backdrop-blur-md">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(95,134,255,.30),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(0,236,174,.16),transparent_32%)]" />
      <div className="absolute left-[-12%] top-[18%] h-64 w-[58rem] rotate-[-14deg] rounded-full bg-[linear-gradient(90deg,transparent,rgba(0,236,174,.28),rgba(0,190,255,.22),rgba(116,92,255,.18),transparent)] blur-3xl animate-aurora" />
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,.55)_1px,transparent_0)] [background-size:28px_28px]" />

      <div className="relative flex flex-col items-center gap-6">
        <img src="/logo/polaryon-icon.svg" alt="Polaryon" className="h-32 w-32 animate-pulseLogo drop-shadow-[0_0_36px_rgba(137,215,247,.40)]" />
        <div className="h-1 w-44 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-progressSweep rounded-full bg-cyan-200/80" />
        </div>
      </div>
    </div>
  );
}
