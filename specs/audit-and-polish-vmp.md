# Spec: Audit and Polish VMP-EDTECH

## 1. Objective
Perform a complete audit and polish of the VMP-EDTECH platform, encompassing the landing page (vmp-edtech.com) and the LMS/Admin dashboard. The goal is to verify all existing workflows, remove placeholders, correct broken links, ensure data flows correctly between the landing page and the database, and verify overall correctness for a production release.

## 2. Requirements & Must-Haves

### Part 1 — Landing Page (vmp-edtech.com)
- [ ] **REQ-1.1**: Clean up the landing page header and footer. Remove the fake/placeholder "Instructor Certificado - Matrícula 12345/2025" from the footer. Remove or disable unused social media links, leaving only the real Instagram link pointing to `https://www.instagram.com/vmpservicios`.
- [ ] **REQ-1.2**: Ensure all links in the main navigation menu (Servicios, Cursos, Blog, Alianzas, Login, Contacto) point to correct sections or pages.
- [ ] **REQ-1.3**: Validate that the course catalog loads all 7 courses correctly, and the technical sheet drawers open without error.
- [ ] **REQ-1.4**: Ensure all 7 course detail pages (/cursos/[slug]) load duration, modality, validity, minimum score, and contact details properly without broken assets.
- [ ] **REQ-1.5**: Update the contact form's "Curso de interés" select dropdown to list all 7 courses from the catalog.
- [ ] **REQ-1.6**: Update the contact form submission API endpoint to:
  - Send the email to `administracion@vmp-edtech.com`.
  - Create a corresponding `Cotizacion` record in the database so that leads arrive at the LMS Cotizaciones panel.
- [ ] **REQ-1.7**: Ensure the 3 WhatsApp links (Neuquén, Cipolletti, España) have the correct international phone number formats and load the correct pre-loaded message.
- [ ] **REQ-1.8**: Ensure /blog loads without error and displays articles correctly.
- [ ] **REQ-1.9**: Ensure /terminos and /privacidad pages load real policies instead of empty or generic placeholders.
- [ ] **REQ-1.10**: Populate/verify Meta OG tags (title, description, image) for all routes. Generate sitemap.xml and robots.txt in the `public` directory.

### Part 2 — LMS / Admin Dashboard
- [ ] **REQ-2.1**: Ensure the dashboard widgets and KPIs (active companies, total courses, enrolled students, credentials issued, quotes, conversion rate) show live, accurate database counts in real time.
- [ ] **REQ-2.2**: Validate that company creation, editing, deletion, and assignment of students work end-to-end.
- [ ] **REQ-2.3**: Verify student creation prevents duplicate emails, and display active/completed courses and credentials on their profile page.
- [ ] **REQ-2.4**: Ensure global courses can be created, edited, and deleted, and content modules can be uploaded.
- [ ] **REQ-2.5**: Check that session creation (presential or online) properly links to courses/companies, and that status is tracked correctly (pendiente, en curso, completada).
- [ ] **REQ-2.6**: Verify QR-code based credential issuance works. Scanning the QR code must link directly to the unauthenticated public validation page `/validar/[codigo]`, loading student and course metadata correctly.
- [ ] **REQ-2.7**: Ensure PDF downloading of generated credentials works.
- [ ] **REQ-2.8**: Ensure the lead conversion flow works in the Cotizaciones panel (converting a quote into a company/student).
- [ ] **REQ-2.9**: Audit the roles and permissions middleware. Super Admin, Company Admin, and Student must only access their respective dashboard paths.
- [ ] **REQ-2.10**: Audit transactional emails (Welcome, credential issued, expiration warning, enrollment confirmation) to ensure correct configuration.
- [ ] **REQ-2.11**: Verify the Ciberseguridad/SOC panel requires Super Admin authentication and activity logs track requests correctly.

## 3. Constraints & Design Guidelines
- **Tech Stack**: Next.js (App Router), FastAPI (Python), Prisma ORM, PostgreSQL.
- **Design & UX**: Maintain high-quality visual aesthetics, glassmorphism headers, responsive mobile layouts (375px), smooth animations, and descriptive alt text for images.
- **SEO & Accessibility**: Complete meta descriptions, unique HTML IDs, correct heading hierarchies, and standard accessibility compliance.
- **Performance**: Optimize heavy background images to load the hero under 3 seconds.

## 4. Edge Cases & Error States
- [ ] **EDGE-1**: Contact form validation (empty fields, invalid email format) must fail gracefully on the client and backend.
- [ ] **EDGE-2**: Duplicate student emails must trigger a clean, user-friendly error message, not a database crash.
- [ ] **EDGE-3**: Unauthenticated requests to private admin endpoints must be blocked and return HTTP 401/403.
- [ ] **EDGE-4**: Credential validation for non-existent codes must display a clear "not found" state.

## 5. Definition of Done (DoD)
- [ ] **DoD-1**: Next.js client builds successfully (`npm run build`) and TypeScript types compile cleanly.
- [ ] **DoD-2**: Backend tests pass and no linter errors are found.
- [ ] **DoD-3**: All landing page links, forms, and WhatsApp buttons are verified manually and function perfectly.
- [ ] **DoD-4**: The database schema is fully aligned with production, and leads/conversions are verified end-to-end.
- [ ] **DoD-5**: Walkthrough report is updated and verified.
