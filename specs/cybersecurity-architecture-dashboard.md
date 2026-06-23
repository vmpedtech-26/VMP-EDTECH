# Spec: Cybersecurity and SOC Architecture Dashboard

## 1. Objective
Provide the Super Admin with a premium, centralized dashboard for cybersecurity monitoring (SOC) that displays real-time security events, intrusion threat indicators, active defense metrics, and a visual assessment of the platform's architecture health mapped to the NICE Cybersecurity Framework categories (Oversight/Govern, Securely Provision, Operate/Maintain, Protect/Defend, Investigate).

## 2. Requirements & Must-Haves
- [ ] **REQ-1**: Create a new independent menu route in the Sidebar for Super Admins called **"Ciberseguridad y SOC"** with a shield icon.
- [ ] **REQ-2**: Implement a dedicated dashboard page at `/dashboard/super/seguridad` that integrates with the backend `/api/admin/security/metrics` endpoint.
- [ ] **REQ-3**: Display KPI Cards for key security metrics with semantic risk-based coloring:
  - Total Security Events (Neutral)
  - Failed Authentication Attempts (Warning/Yellow)
  - Rate Limit Blocks (Critical/Red)
  - SSO Configuration Changes (Informational/Blue)
- [ ] **REQ-4**: Build an interactive **NICE Framework Architectural Health Assessment** visualization showing VMP's compliance and response status across the 5 domains shown in the reference taxonomy:
  - **Oversight and Govern (purple)**: Status of Audit logs and Whistleblowing system.
  - **Securely Provision (light blue)**: Status of secure development controls (ORM Prisma, validation).
  - **Operate and Maintain (dark blue)**: System operations health & connection pooling.
  - **Protect and Defend (orange/yellow)**: Intrusions blocked & active defense alerts.
  - **Investigate (brown/coffee)**: Digital evidence availability & tracing ID metrics.
- [ ] **REQ-5**: Render a real-time **Security Incident Log** table showing timestamps, actions, IP addresses, targeted user emails, and Request-IDs with a quick-copy option.
- [ ] **REQ-6**: Provide filtering options for the incident logs by severity/action type and search by IP address or target email.

## 3. Constraints & Design Guidelines
- **Tech Stack**: Next.js, React, Tailwind CSS, Lucide icons, and the existing API client (`@/lib/api-client`).
- **Design & UX**: 
  - Sleek, premium dashboard layout using glassmorphism components (`bg-white/80 backdrop-blur-md`).
  - Strict responsive layout support (mobile/tablet/desktop compatibility).
  - Subtle micro-animations for hover states and transitions (`transition-all duration-300`).
- **SEO & Accessibility (a11y)**:
  - Accessible contrast ratios for warning and critical badges (e.g., deep reds/yellows on light pastel backgrounds).
  - Semantic HTML structure (`<section>`, `<h1>`, `<table>`).
- **Performance**: Optimal rendering with React states, fetching metrics efficiently on mount and support manual refresh without page reloading.

## 4. Edge Cases & Error States
- [ ] **EDGE-1**: Empty state handling when no security logs or incidents are found.
- [ ] **EDGE-2**: Network failure or unauthorized access handling, with toast notifications and a clear retry action.
- [ ] **EDGE-3**: Handling truncated Request-ID values gracefully on small viewports so they don't break table alignment.

## 5. Definition of Done (DoD)
- [ ] **DoD-1**: Code compiles successfully with no syntax or compiler errors.
- [ ] **DoD-2**: Passes lint checks and formatting rules.
- [ ] **DoD-3**: All requirements (**REQ-1** to **REQ-6**) are implemented and verified.
- [ ] **DoD-4**: All edge cases (**EDGE-1** to **EDGE-3**) are handled and verified.
- [ ] **DoD-5**: The new dashboard page is successfully integrated into the sidebar navigation and works end-to-end with the backend API.
