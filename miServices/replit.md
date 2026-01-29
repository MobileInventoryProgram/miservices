# miServices Website

### Overview
The miServices website is a Next.js 14 application designed to be the central online hub for a professional property inspection service with a nationwide UK franchise network. Its primary purpose is to enhance miServices' online presence, attract new clients, support existing franchisees, and drive business growth by providing a professional platform for clients, franchisees, and prospective franchise owners.

### User Preferences
I want the agent to use clear, professional, and concise language. I prefer an iterative development approach where changes are proposed and discussed before implementation. Please prioritize user experience and SEO considerations in all development tasks. Do not make changes to the `globals.css` file unless explicitly instructed.

### System Architecture
The miServices website is built using Next.js 14 (App Router), TypeScript, and Tailwind CSS v3, featuring a responsive, corporate design.

**UI/UX Decisions:**
- **Branding:** Uses corporate colors (Dark Blue: `#3f59a9`, Light Blue: `#157ec3`), professional stock imagery, and wavy SVG shapes.
- **Navigation:** Mega menus for primary navigation, including CTAs for franchise opportunities.
- **Visuals:** Hero sections with professional imagery and wavy SVGs, animated scroll-triggered statistics, and client logo displays.
- **Consistency:** Corporate color palette, professional typography (Maitree, Helvetica), card-based layouts, and a comprehensive four-column footer.

**Technical Implementations & Feature Specifications:**
- **Public Website:**
    - **Franchise Network Locator:** Postcode search at `/our-network` with dynamic detail pages.
    - **Content Pages:** Dedicated pages for services, team (`/our-team`), about us (`/about`), and FAQs (`/faq`).
    - **Lead Capture:** Gated forms for sample documents (`/sample-documents`) and pricing requests (`/pricing`), integrated with Zapier and Google Calendar for bookings.
    - **Franchise Opportunities:** Conversion-optimized page (`/franchise`) with prospectus download and call scheduling.
    - **News/Blog:** Headless CMS integration with Ghost CMS (`/news`) for dynamic content, featuring ISR.
    - **Booking Page:** Custom booking form at `/booking` with visual property size selector, conditional file uploads for check-out jobs, and secure API endpoint with Zapier integration.
    - **Contact Us:** Redesigned page (`/contact`) with advanced contact form and booking prompt.
    - **SEO:** Comprehensive page-level metadata and Open Graph tags.
    - **Dynamic Content:** Franchise data from `data/franchisees.json`, blog content from Ghost CMS.
- **Members Area:**
    - **Authentication:** NextAuth.js with JWT sessions, Node.js scrypt for hashing, and role-based access (Superadmin, Admin, Franchise).
    - **Database:** PostgreSQL (Replit/Neon) with Drizzle ORM.
    - **User Management (Admin):** CRUD for users, CSV import, bulk actions (password reset, email), and profile picture uploads. Admins and superadmins have full access.
    - **Process Docs Management (Admin):** CRUD for database-driven process documentation, drag-and-drop reordering, audience filtering (franchise/admin), and Ghost CMS integration for content.
    - **Dashboards:** Role-specific dashboards for franchise owners and administrators with access to documents and process guides.
    - **Guides Pages:** Database-driven process documentation, grouped by section, fetching content from Ghost CMS via `/api/process-guides/[audience]`.
    - **Protected Routes:** Middleware for secure, role-based access.
    - **Our Network Integration:** Franchise data from the Members Area populates the public `/our-network` page.
    - **CRM Module (Phase 1):**
        - **Contacts Management:** Full CRUD operations at `/members/crm/contacts` with search, filtering, and batch actions.
        - **Contact Profiles:** Detailed view at `/members/crm/contacts/[id]` with tabbed interface for overview, notes, emails, proposals.
        - **Franchise Association:** Contacts are associated with franchise owners via franchiseId; admins can filter by franchisee.
        - **Permission Model:** Superadmin/Admin see all contacts (with optional franchisee filter); franchise owners see contacts where `franchiseId = userId` OR matching territory field for territory-based sharing.
        - **Database Schema:** `contacts`, `contact_notes`, `contact_emails`, `proposals`, `proposal_templates`, `contact_imports` tables with proper foreign key relationships.
        - **Security:** SQL-level authorization checks prevent cross-franchise access and authorization oracle vulnerabilities.
    - **API Endpoints:** Extensive API for admin, user, process documentation, CRM, and Ghost CMS content management.

**System Design Choices:**
- **Routing:** Next.js App Router for file-based organization.
- **Architecture:** Component-based for modularity and reusability.
- **Assets:** `public/` directory for static resources.

### External Dependencies
-   **React Icons (Feather Icons):** For scalable vector icons.
-   **Google Fonts (Maitree):** For specific typographic elements.
-   **Ghost CMS:** Headless blog platform (miservices.ghost.io) via `@tryghost/content-api` for news/blog content and members area process documentation.
-   **NextAuth.js:** For secure user authentication and session management.
-   **Drizzle ORM:** For type-safe database operations.
-   **PostgreSQL (Neon/Replit):** Database for user accounts, sessions, and application data.
-   **Resend (Optional):** Transactional email service for credentials and password resets.