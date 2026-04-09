# ✂️ Fade District — Barbería Premium

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer&logoColor=white)

**Sitio web premium para barbería con estética minimalista B&W, animaciones de alta gama y sistema de reservas integrado.**

[🔗 Ver Demo en Vivo](https://fade-district.vercel.app) · [📱 Vista Móvil](https://fade-district.vercel.app)

</div>

---

## 📸 Preview

<div align="center">

| Desktop | Mobile |
|---------|--------|
| Hero con efecto Glitch + Scroll Indicator | Responsive con menú hamburguesa |
| Galería Bento interactiva | Cards adaptativas |
| Sistema de reservas paso a paso | Flujo completo de booking |

</div>

---

## ✨ Características

- 🎨 **Diseño Minimalista B&W** — Fondo blanco con acentos negros, alineado a la identidad de Instagram
- ✍️ **Tipografía Premium** — Syne (headings) + Space Grotesk (body)
- 🌀 **Animaciones High-End** — Efecto glitch sutil, staggered reveals, parallax scroll
- 📱 **100% Responsive** — Diseñado mobile-first con breakpoints optimizados
- 🖼️ **Galería Bento** — Grid asimétrico con lightbox expandible
- 📅 **Sistema de Reservas** — Flujo paso a paso: Servicio → Fecha → Hora → Confirmación
- 🧭 **Navegación Dinámica** — Logo que cambia al scrollear (FD → Logo real)
- 🔄 **Smooth Scroll** — Lenis para navegación fluida
- 🛡️ **Panel Admin** — Dashboard con estadísticas y gestión de galería

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **Next.js 16** | Framework React (App Router) |
| **TypeScript** | Tipado estático |
| **Tailwind CSS v4** | Sistema de estilos |
| **Framer Motion** | Animaciones y transiciones |
| **Lenis** | Smooth scroll |
| **Lucide React** | Iconografía |

---

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/PauloTorres12/FadeDistrict.git
cd FadeDistrict

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 📁 Estructura del Proyecto

```
FadeDistrict/
├── public/
│   ├── assets/          ← Imágenes permanentes (logo, favicon)
│   └── gallery/         ← Fotos de la galería
├── src/
│   ├── app/
│   │   ├── admin/       ← Panel de administración
│   │   ├── globals.css  ← Sistema de diseño + animaciones
│   │   ├── layout.tsx   ← Layout raíz (fuentes, metadata SEO)
│   │   └── page.tsx     ← Página principal
│   ├── components/
│   │   ├── Navbar.tsx   ← Navegación dinámica
│   │   ├── Hero.tsx     ← Sección hero + efecto glitch
│   │   ├── Gallery.tsx  ← Galería bento interactiva
│   │   ├── Booking.tsx  ← Sistema de reservas
│   │   ├── Contact.tsx  ← Información de contacto
│   │   ├── Footer.tsx   ← Pie de página
│   │   ├── AdminDashboard.tsx
│   │   └── SmoothScroll.tsx
│   └── lib/
│       └── supabase.ts  ← Cliente Supabase (mock)
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 🗺️ Roadmap

- [x] Diseño UI/UX completo (B&W minimalista)
- [x] Animaciones premium (glitch, staggered, parallax)
- [x] Sistema de reservas (frontend)
- [x] Panel de administración (frontend)
- [x] Responsive design
- [ ] **Integración Supabase** — Base de datos real para turnos y galería
- [ ] **Mercado Pago** — Pasarela de pagos para reservas
- [ ] **Auth real** — Login de administrador con Supabase Auth
- [ ] **Deploy** — Vercel con dominio personalizado
- [ ] **SEO avanzado** — Open Graph, sitemap, robots.txt

---

## 📄 Licencia

Este proyecto es privado y pertenece a **Fade District**.

---

<div align="center">

Hecho con 🖤 por el equipo de **Fade District**

</div>
