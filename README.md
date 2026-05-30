# Yarig · Consejo de Startup

Nueva versión de Yarig.ai para **control de startups**: cada miembro del equipo tiene
un **consejero del Consejo AdmiraNext** que le ayuda a ser mejor en su disciplina.

## Visión
El Consejo deja de ser solo un debate y se convierte en un equipo de **mentores 1-a-1**.
Cada uno de los 8 consejeros acompaña al miembro del equipo de su misma disciplina.

## Estado — MVP 1: Equipo + mentor por rol
- Defines tu startup y das de alta miembros (nombre + rol + cargo).
- El sistema asigna a cada miembro su **consejero** por rol.
- Toggle **Leyendas ⭐ / Coetáneos 🚀** cambia el mentor (p.ej. CEO → Steve Jobs o Elon Musk).
- Vista founder: equipo ↔ mentor + cobertura del consejo (roles cubiertos/vacantes).
- Persistencia local (localStorage). Single-file (`index.html`), desplegable en Pages.

## Roster de consejeros
CEO 🏛️ · CTO ⚙️ · COO 📋 · CFO 💰 · CCO 💡 · CDO 🎨 · CXO 🌐 · CSO 📖
(leyendas + coetáneos, importados del Consejo AdmiraNext / admira.live)

## Roadmap
- **MVP 2 — Coaching sobre tareas**: el consejero genera feedback + 3 acciones de mejora
  sobre las tareas/OKRs de cada miembro (vía LLM del Consejo, `/api/council/ask-one`).
- **MVP 3 — Scoreboard de progreso** por miembro en el tiempo.
- Conectar con el sistema de tareas de Yarig (buckets Pendiente/En proceso/Finalizada).
