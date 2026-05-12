'use client';

export default function Footer() {
  return (
    <footer className="py-16 md:py-24 border-t border-black/8">
      <div className="container-fluid flex flex-col items-center">
        <a href="/admin" className="text-xs text-black/30 hover:text-black/60 transition-colors duration-300 font-[family-name:var(--font-space)] tracking-widest uppercase text-center mb-8">
          Panel de Admin
        </a>

        <div className="divider w-full max-w-5xl mb-4" />

        <p className="text-[11px] text-black/30 font-[family-name:var(--font-space)] text-center">
          © {new Date().getFullYear()} Fade Distric. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
