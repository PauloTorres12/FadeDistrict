'use client';

export default function Footer() {
  return (
    <footer className="py-16 md:py-24 border-t border-black/8">
      <div className="container-fluid">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 max-w-5xl mx-auto">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <div className="w-10 h-10 border border-black/20 flex items-center justify-center">
                <span className="text-base font-bold font-[family-name:var(--font-syne)] tracking-wider">FD</span>
              </div>
              <span className="text-xs tracking-[0.3em] uppercase text-black/50">Fade District</span>
            </div>
          </div>

          {/* Links */}
          <div className="text-center md:text-left">
            <h4 className="text-xs tracking-[0.2em] uppercase text-black/55 mb-4 font-semibold">Navegación</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Galería', href: '#galeria' },
                { label: 'Turnos', href: '#turnos' },
                { label: 'Contacto', href: '#contacto' },
              ].map((link) => (
                <a key={link.label} href={link.href} className="text-xs text-black/40 hover:text-black/70 transition-colors duration-300 font-[family-name:var(--font-space)]">
                  {link.label}
                </a>
              ))}
              <a href="/admin" className="text-xs text-black/15 hover:text-black/40 transition-colors duration-300 font-[family-name:var(--font-space)]">
                Admin
              </a>
            </div>
          </div>

          {/* Social */}
          <div className="text-center md:text-left">
            <h4 className="text-xs tracking-[0.2em] uppercase text-black/55 mb-4 font-semibold">Seguinos</h4>
            <div className="flex flex-col gap-2">
              {['Instagram', 'TikTok', 'WhatsApp'].map((social) => (
                <span key={social} className="text-xs text-black/40 hover:text-black/70 transition-colors duration-300 cursor-pointer font-[family-name:var(--font-space)]">
                  {social}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="divider mb-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
          <p className="text-[11px] text-black/30 font-[family-name:var(--font-space)]">
            © {new Date().getFullYear()} Fade District. Todos los derechos reservados.
          </p>
          <p className="text-[11px] text-black/30 font-[family-name:var(--font-space)]">
            Diseñado con precisión
          </p>
        </div>
      </div>
    </footer>
  );
}
