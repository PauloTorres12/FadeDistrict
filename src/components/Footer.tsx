'use client';

export default function Footer() {
  return (
    <footer className="border-t border-black/8" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
      <div className="container-fluid flex flex-col items-center">
        <a href="/admin" className="text-xs text-black/30 hover:text-black/60 transition-colors duration-300 font-[family-name:var(--font-space)] tracking-widest uppercase text-center" style={{ marginBottom: '10px' }}>
          Panel de Admin
        </a>

        <div className="divider w-full max-w-5xl" style={{ marginBottom: '10px' }} />

        <p className="text-[11px] text-black/30 font-[family-name:var(--font-space)] text-center">
          © {new Date().getFullYear()} Fade Distric. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
