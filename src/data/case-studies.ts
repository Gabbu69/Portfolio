import evidence from "./project-evidence.json";

export type ProjectCaseStudy = {
  status: string;
  audience: string;
  purpose: string;
  features: readonly { title: string; description: string }[];
  workflow: readonly string[];
  layers: readonly { name: string; technology: string; description: string }[];
  limitations: readonly string[];
  sources: readonly { label: string; url: string }[];
  sourceAvailability: "public" | "private";
  reviewedAt?: string;
};

function sources(slug: keyof typeof evidence) {
  const entry = evidence[slug];
  return entry.documents.map(path => ({
    label: path === "README.md" ? "Project documentation" : path,
    url: `${entry.repo}/blob/${entry.commit}/${path.split("/").map(encodeURIComponent).join("/")}`,
  }));
}

function study(slug: keyof typeof evidence, content: Omit<ProjectCaseStudy, "sources" | "sourceAvailability">): ProjectCaseStudy {
  return { ...content, sources: sources(slug), sourceAvailability: "public", reviewedAt: evidence[slug].checkedAt };
}

export const caseStudies = {
  pasibudget: study("pasibudget", {
    status: "Local-first planning research prototype",
    audience: "Rice farmers and researchers exploring season budgets and break-even scenarios.",
    purpose: "Bring a season’s assumptions, spending, harvest, sales, and receipts into one understandable planning workflow, including when connectivity is unavailable.",
    features: [
      { title: "Farms and seasons", description: "Manage separate real and sample farms, copy a previous season’s plan, and archive completed seasons." },
      { title: "Costs and scenarios", description: "Track cash, non-cash, and imputed costs; compare changes in cost, harvest, and price without mixing planned and recorded totals." },
      { title: "Sales and receipts", description: "Record harvested quantity, sales, partial payments, and unpaid balances as distinct measures." },
      { title: "Reports and recovery", description: "Export CSV, print a season report, and validate a JSON restore before adding copies of records." },
    ],
    workflow: ["Create a farm and season, or open the separate sample farm.", "Enter costs, harvest assumptions, matching grain condition, and price.", "Record expenses, harvest, sales, and payments as the season progresses.", "Compare scenarios and break-even results, then export a report and backup."],
    layers: [
      { name: "Interface", technology: "React · TypeScript · Vite", description: "Responsive English/Filipino screens, completeness feedback, and protected unsaved edits." },
      { name: "Application logic", technology: "decimal.js", description: "Browser-side calculations keep unknown values distinct from zero and round break-even targets upward." },
      { name: "Storage", technology: "Dexie · IndexedDB", description: "Versioned records live in the current device’s browser. No server database or account is required." },
      { name: "Offline and portability", technology: "Service worker · JSON backup", description: "Bundled assets are available after a successful initial load; validated backups transfer data across browsers or devices." },
    ],
    limitations: ["Sample costs and prices are invented demonstrations. The app does not predict yields or prices or guarantee profit.", "Clearing browser storage or losing a device can lose records without a backup. Backups are not encrypted.", "Cloud sync, multi-user access, and formal farmer usability evaluation are outside the documented release."],
  }),
  "usm-hospital": {
    status: "Collaborative OJT prototype",
    audience: "Hospital administrators, doctors, nurses, pharmacists, laboratory and radiology staff, and receptionists.",
    purpose: "Connect hospital operations through staff-specific workflows while keeping patient records, service transactions, and inventory work organized.",
    features: [
      { title: "Patient and service workflows", description: "The approved project overview covers patient records, laboratory and radiology transactions, and Konsulta settings." },
      { title: "Pharmacy operations", description: "The approved scope includes inventory and dispensing workflows." },
      { title: "Staff dashboards and reports", description: "Distinct staff workflows support the roles described in the portfolio’s existing project summary." },
    ],
    workflow: ["Staff access the dashboard relevant to their role.", "Work through the patient, service, or pharmacy module relevant to the task.", "Review records and reports within the approved prototype scope."],
    layers: [
      { name: "Interface", technology: "Vue · Tailwind", description: "The approved portfolio stack identifies Vue and Tailwind for the interface." },
      { name: "Application", technology: "Laravel · PHP", description: "The approved stack identifies Laravel and PHP for hospital-operation workflows." },
      { name: "Data and access", technology: "Private implementation", description: "The public overview describes patient records and role-specific workflows. Database and authorization internals are not published here." },
    ],
    limitations: ["This page uses only the project description and assets already approved for the portfolio; the repository is private.", "The work is presented as a prototype and learning project, without a claim of production adoption.", "No patient records, private source code, or confidential hospital information is displayed."],
    sources: [],
    sourceAvailability: "private",
  } satisfies ProjectCaseStudy,
  halalscan: study("halalscan", {
    status: "Label-screening prototype",
    audience: "People checking food labels and reviewing ingredient-level evidence.",
    purpose: "Combine extracted label text, ingredient classification, and knowledge-base checks so a screening result can be understood and reviewed.",
    features: [
      { title: "Label input", description: "Accept barcode, text, or OCR-based analysis, including image and bounded PDF processing." },
      { title: "Ingredient evidence", description: "Combine classification results with structured rules, retaining unresolved and doubtful ingredient warnings." },
      { title: "Explanations and history", description: "Explain rules through a retrieval assistant and keep scan history on the device in deployed builds." },
    ],
    workflow: ["Provide a barcode, ingredient text, or label image.", "Extract and analyze the ingredients through the available OCR and classification paths.", "Review the screening result alongside ingredient warnings and rule references.", "Use the explanation assistant or review device-local scan history."],
    layers: [
      { name: "Interface", technology: "React · TypeScript · Zustand", description: "The Vite interface handles input, scanning, result presentation, and local scan records." },
      { name: "Application and API", technology: "Flask · Vercel TypeScript functions", description: "Local Flask endpoints and deployed serverless adapters implement the screening workflow." },
      { name: "Storage", technology: "SQLite locally · Browser storage on Vercel", description: "The local backend documents SQLite caching/history; deployed history is device-local rather than a persistent shared serverless database." },
      { name: "External services", technology: "Google Vision · RapidAPI · Rule retrieval", description: "Configured services provide OCR and classification; documented fallback paths retain unresolved evidence when credentials are absent." },
    ],
    limitations: ["Screening does not replace an authorized halal certifying body.", "A product result must be read with its ingredient-level unknown or doubtful warnings.", "Live external-service behavior depends on configured credentials; device-local history is not cross-device synchronization."],
  }),
  "ligtas-ai": study("ligtas-ai", {
    status: "Preparedness research prototype · fixture corpus",
    audience: "English, Filipino, and Taglish readers and researchers evaluating grounded preparedness retrieval.",
    purpose: "Provide bounded educational preparedness answers with traceable citations and refuse questions the active corpus cannot support.",
    features: [
      { title: "Grounded retrieval", description: "Compare lexical and dense retrieval, combine rankings, and apply an answerability gate." },
      { title: "Evidence and abstention", description: "Return cited answers, abstention, or safety redirects with active corpus and backend context." },
      { title: "Readiness and research tools", description: "Include a browser-local checklist, printable plan, read-only command center, and evaluation-status views." },
    ],
    workflow: ["Open the local system and inspect its corpus status.", "Ask a preparedness question in a supported language.", "Review cited evidence or the explanation for abstention.", "Use readiness tools or inspect the research evaluation status."],
    layers: [
      { name: "Interface", technology: "Jinja · Vanilla JavaScript", description: "FastAPI serves the local interface without a Node frontend or user account." },
      { name: "Retrieval logic", technology: "BM25 · Dense retrieval · Rank fusion", description: "A bounded retrieval pipeline applies calibrated gates and exposes the active backend." },
      { name: "Evidence storage", technology: "SQLite FTS5", description: "A local indexed corpus retains evidence identifiers, source metadata, and citation context." },
      { name: "Runtime", technology: "Python · FastAPI · Optional ONNX", description: "Offline local operation is distinct from the fixture-based hosted demonstration and its temporary index." },
    ],
    limitations: ["The bundled corpus is researcher-authored paraphrase fixture data, not exact agency wording or the final thesis corpus.", "Human bilingual validation and final locked evaluation remain documented research gates.", "The system is not a live warning service, evacuation router, dispatcher, predictor, or medical adviser."],
  }),
  agripresyo: study("agripresyo", {
    status: "Market-intelligence interface prototype",
    audience: "Farmers, vendors, and consumers exploring agricultural commodity comparisons.",
    purpose: "Make commodity histories, vendor comparisons, and purchase budgets easier to explore through a bilingual market-style interface.",
    features: [
      { title: "Market views", description: "Browse commodity categories, history charts, price movement, and market leaderboards." },
      { title: "Vendor comparison", description: "Explore vendor profiles and compare displayed pricing and stock information." },
      { title: "Purchase planning", description: "Estimate quantities and costs and export budget reports in CSV or PDF." },
    ],
    workflow: ["Choose a commodity or category.", "Inspect displayed history and compare vendors.", "Build a purchase budget using quantities and displayed prices.", "Export the comparison or budget report."],
    layers: [
      { name: "Interface", technology: "React · TypeScript · Tailwind · Recharts", description: "A Vite application provides responsive dashboards, charts, and English/Filipino translations." },
      { name: "Application state", technology: "Zustand · React Router", description: "Client state and routes connect the market, vendor, budget, and role-specific views." },
      { name: "Data connections", technology: "Supabase client · Serverless prices route", description: "The source includes a Supabase connection and a date-seeded simulated price endpoint; those are distinct from verified market feeds." },
      { name: "Reporting", technology: "jsPDF · CSV", description: "Browser reporting exports the displayed purchase-plan information." },
    ],
    limitations: ["The trading experience includes simulated data; displayed movements are not proof of verified live market prices.", "The portfolio does not claim verified vendors, completed market transactions, or production adoption."],
  }),
  rmais: study("rmais", {
    status: "Price-monitoring thesis prototype",
    audience: "Farmers, rice traders, consumers, and price encoders/verifiers.",
    purpose: "Turn collected rice and palay prices into traceable comparisons and explainable decisions without claiming to predict future prices.",
    features: [
      { title: "Verified price board", description: "Publish reviewed records with source types, freshness, comparable averages, and descriptive movement." },
      { title: "Decision journal", description: "Save price evidence and algorithm versions, compare buyer-specific costs, and record later sale outcomes." },
      { title: "Administration and reports", description: "Use independent verification, non-destructive corrections, audit history, and provenance-aware exports." },
    ],
    workflow: ["Encode and independently verify compatible price observations.", "Publish reviewed records to the public price board.", "Compare offers and buyer-specific costs, then save a decision snapshot.", "Record an actual sale and review descriptive differences from the saved decision."],
    layers: [
      { name: "Interface", technology: "Blade · Tailwind · English/Filipino", description: "Mobile-first decision screens and role-specific dashboards present evidence and explicit unknowns." },
      { name: "Application", technology: "Laravel · PHP", description: "Services apply explainable rules, source comparability, ownership checks, and maker-checker publication." },
      { name: "Database", technology: "SQLite locally · MySQL deployment option", description: "Price records, revisions, decisions, planting plans, and outcomes retain traceability." },
      { name: "Reporting and consent", technology: "CSV · Immutable audit history", description: "Exports retain provenance; optional research permission is versioned and withdrawable." },
    ],
    limitations: ["Seeded price histories are demonstration data, not official local observations.", "The baseline is rule-based and does not claim price forecasting or causal income improvement.", "Real pilots require verified sources, calibrated thresholds, and physical-device usability checks."],
  }),
  anitala: study("anitala", {
    status: "Local classroom prototype · synthetic data",
    audience: "Students studying transaction processing, data warehousing, and mining in one application.",
    purpose: "Connect harvest-to-market transactions to a repeatable analytical warehouse and explainable mining results.",
    features: [
      { title: "Operational records", description: "Record harvest batches, multi-item sales, waste, and inventory movements with first-expiring-first-out stock allocation." },
      { title: "Audit-safe corrections", description: "Void sales without deleting them and restore allocated stock through traceable movements." },
      { title: "Warehouse and mining", description: "Refresh reconciled warehouse facts, export CSV, and run Apriori rules and deterministic K-means buyer segmentation." },
    ],
    workflow: ["Record a harvest batch and its shelf life.", "Complete a sale using eligible stock or record waste.", "Inspect inventory and movement history; void mistaken sales when needed.", "Refresh warehouse facts and inspect mining results and reports."],
    layers: [
      { name: "Interface", technology: "HTML · Local Bootstrap · JavaScript", description: "A responsive browser interface uses bundled assets for local operation." },
      { name: "Application and API", technology: "Java · Javalin · JDBC", description: "The loopback HTTP server validates transactions and rolls back incomplete sales." },
      { name: "Data layers", technology: "Embedded SQLite", description: "Operational tables and warehouse dimensions/facts are logically separate inside one database file." },
      { name: "Analytics", technology: "ETL · Apriori · K-means", description: "Repeatable loads and deterministic mining operate on synthetic teaching records." },
    ],
    limitations: ["Names, transactions, prices, and patterns are synthetic educational data.", "The server binds to localhost; it is not a public or LAN deployment.", "Mining outputs are classroom demonstrations, not findings about real agricultural behavior."],
  }),
  scopewatch: study("scopewatch", {
    status: "Requirements-traceability workspace prototype",
    audience: "Student project teams and advisers reviewing scope, progress, and evidence.",
    purpose: "Keep requirements, implementation evidence, tests, and change decisions connected so project scope can be reviewed explicitly.",
    features: [
      { title: "Traceability", description: "Connect problems, objectives, requirements, features, tests, outputs, and evidence." },
      { title: "Scope-risk review", description: "Record progress and test runs and derive deterministic findings from saved project records." },
      { title: "Membership and decisions", description: "Use invitations and active project membership; advisers hold the change-decision role." },
    ],
    workflow: ["Sign in with a verified Google account and access an authorized project.", "Build trace links and attach evidence to project artifacts.", "Record progress and test results and run the risk review.", "Submit a proposed change for an adviser decision."],
    layers: [
      { name: "Interface and API", technology: "Next.js · TypeScript · Vinext", description: "Workspace routes and project APIs run through the Sites adapter." },
      { name: "Application", technology: "Deterministic risk engine", description: "Findings, metrics, and exports are derived from saved records rather than landing-page examples." },
      { name: "Storage", technology: "Cloudflare D1 · Drizzle · R2", description: "D1 holds project and audit records; protected R2 objects hold evidence files." },
      { name: "Identity", technology: "Supabase Auth · Server membership checks", description: "Verified Google identity is separate from project authorization; inaccessible projects return 404." },
    ],
    limitations: ["The public landing sample is separate from authenticated project metrics.", "Deployment access and Google-login rollout checks are documented separately from source-code functionality.", "The engine reports deterministic scope risks; it does not replace adviser decisions."],
  }),
  "yakap-consulta": study("yakap-consulta", {
    status: "Internal financial-monitoring prototype",
    audience: "Administrators, encoders, finance officers, and read-only auditors.",
    purpose: "Reconcile beneficiary readiness, service costs, receivables, payments, and program-year financial reports in one traceable workflow.",
    features: [
      { title: "Readiness and services", description: "Track beneficiary-year readiness, encounters, service utilization, and cost." },
      { title: "Financial reconciliation", description: "Manage SAP receivables, payments, co-payments, variances, and immutable year-effective policy snapshots." },
      { title: "Reports and auditing", description: "Use role controls, masked identifiers, non-destructive voiding, and financial report exports." },
    ],
    workflow: ["Register a beneficiary and review program-year readiness.", "Record service encounters and associated costs.", "Generate financial snapshots and reconcile receipts and variances.", "Review reports and audit history through the appropriate role."],
    layers: [
      { name: "Interface", technology: "React · TypeScript · Inertia · Recharts", description: "Role-specific screens visualize readiness and financial-monitoring records." },
      { name: "Application", technology: "Laravel · PHP", description: "Year-effective policies and reconciliation rules preserve the originating reporting period." },
      { name: "Database", technology: "SQLite", description: "Beneficiaries, encounters, policy versions, payments, and audit history support the documented local prototype." },
      { name: "Privacy and reporting", technology: "Encrypted identifiers · DomPDF", description: "Identifiers are masked and uniqueness-hashed; reports exclude biometric images and detailed clinical notes." },
    ],
    limitations: ["Demo records and financial values are fictional.", "The app does not submit data to PhilHealth or establish accreditation, certification, or an eClaims integration.", "Its program-year reconciliation is not a cash-basis general ledger."],
  }),
  "flow-ruby": study("flow-ruby", {
    status: "Offline-first educational health prototype",
    audience: "People exploring personal cycle logs and pill schedules in a device-local companion.",
    purpose: "Keep core health logs usable offline while offering optional sync and consent-controlled external assistant connections.",
    features: [
      { title: "Personal logging", description: "Organize cycle and health logs, insights, trends, and settings in a mobile-first interface." },
      { title: "Pill schedules", description: "Record taken or missed doses, inspect a recent streak, and show due or missed check-in alerts." },
      { title: "Optional connections", description: "Use native bridges, configured cloud sync, or a bring-your-own-key assistant with category-level consent." },
    ],
    workflow: ["Complete onboarding and record personal logs locally.", "Configure a pill schedule and record daily doses.", "Review trends and informational cycle estimates.", "Optionally enable configured sync or choose what context is shared with the assistant."],
    layers: [
      { name: "Interface", technology: "React · TypeScript · Vite", description: "Touch-oriented screens connect today’s logs, insights, trends, and settings." },
      { name: "Local logic and storage", technology: "Cycle engine · Dexie · IndexedDB", description: "Core logs and tracking work on the device without a Supabase connection." },
      { name: "Mobile shell", technology: "Capacitor · Native bridges", description: "Android/iOS project shells contain notification, haptic, widget, and other platform integrations." },
      { name: "Optional services", technology: "Supabase · BYOK AI transports", description: "Cloud sync follows the documented single-tenant model; external AI context is consent-controlled." },
    ],
    limitations: ["Cycle estimates are informational, not contraception or medical advice.", "The shared sync schema requires owner-scoped authentication and RLS before public multi-user use.", "Source code and mobile shells do not establish physical-device acceptance or app-store release."],
  }),
  pacs: study("pacs", {
    status: "Localhost-only academic research prototype",
    audience: "Students and reviewers preserving permitted thesis PDFs and tracing academic evidence.",
    purpose: "Connect source-aware research review, explainable discovery, an analytical data mart, and a bounded query language without a cloud dependency.",
    features: [
      { title: "Evidence desk", description: "Import permitted searchable PDFs and review extracted fields against source excerpts and pages." },
      { title: "Discovery and continuity", description: "Search verified evidence with FTS5/BM25 and TF-IDF similarity, showing relationships as candidate evidence." },
      { title: "Warehouse and PQL", description: "Run logged ETL, review analytical snapshots, and execute validated saved queries through PQL." },
    ],
    workflow: ["Import a permitted, searchable thesis PDF.", "Review and verify extracted evidence against its source.", "Search related studies or build a bounded PQL query.", "Load eligible evidence into the warehouse and review reports or evaluation artifacts."],
    layers: [
      { name: "Interface", technology: "React · TypeScript · Vite", description: "The local research desk provides review, discovery, query, and backup workspaces." },
      { name: "Application and API", technology: "Node.js · Express", description: "A loopback-only server performs import, review, search, ETL, and backup operations." },
      { name: "Data layers", technology: "SQLite · FTS5 · Local PDFs", description: "Separate operational and analytical databases store evidence, review history, ETL snapshots, and audit records." },
      { name: "Language and analytics", technology: "PQL · BM25 · TF-IDF", description: "Lexer, parser, semantic validation, and prepared execution keep queries bounded and source-aware." },
    ],
    limitations: ["The source thesis remains authoritative; the system does not prove research gaps, grade work, or approve titles.", "Normal operation has no OCR, cloud model, or external API dependency; imported PDFs must be searchable and permitted.", "Offline walkthrough, restore drills, real-corpus evaluation, and target-device performance require separate acceptance evidence."],
  }),
  ugnay: study("ugnay", {
    status: "Research-continuity platform prototype",
    audience: "Students, advisers, coordinators, and curators reviewing research alignment and handoff.",
    purpose: "Preserve an explainable chain from a real problem through related studies, human decisions, implementation evidence, and a successor’s continuity package.",
    features: [
      { title: "Research discovery", description: "Ingest permitted documents, search a catalogue, and compare lexical, semantic, and hybrid retrieval." },
      { title: "Alignment and changes", description: "Link requirements, features, tests, and outputs; review findings and typed change proposals." },
      { title: "Continuity and laboratory", description: "Build evidence-derived handoffs, run RQL queries, and inspect immutable research-warehouse snapshots." },
    ],
    workflow: ["Curate research sources and submit a problem with objectives and evidence.", "Review related studies and record an authorized human disposition.", "Maintain trace links, test evidence, baselines, and change decisions.", "Prepare a continuity package and review successor claims."],
    layers: [
      { name: "Interface", technology: "React · TypeScript · Vite", description: "Research Atlas, alignment workspaces, and laboratory views share a same-origin application." },
      { name: "Application", technology: "Java · Spring Boot · Spring Security", description: "Role-scoped workflows preserve human decisions, audit history, and versioned evidence." },
      { name: "Database and documents", technology: "MySQL · Flyway · Private document objects", description: "Operational records and immutable warehouse loads retain continuity and provenance." },
      { name: "Research engines", technology: "RQL · TF-IDF · Optional E5/ONNX", description: "A bounded interpreter and versioned retrieval arms support reproducible algorithm comparison." },
    ],
    limitations: ["The platform recommends and explains; it does not automatically approve a thesis or declare plagiarism.", "The documented Windows Lite setup requires matching release assets and clean-install verification before installation acceptance can be claimed.", "Unavailable evidence is labeled partial or unassessed rather than replaced with demo data."],
  }),
  gabay: study("gabay", {
    status: "Price-forecasting thesis prototype",
    audience: "Farmers, encoders, verifiers, and researchers evaluating palay price guidance.",
    purpose: "Organize compatible, verified price histories and compare forecasting methods before presenting explainable Sell, Wait, or Monitor guidance.",
    features: [
      { title: "Farmer dashboard", description: "Show verified prices, history, uncertainty, freshness, and explanations in English and Filipino." },
      { title: "Offer and data review", description: "Provide stateless offer comparisons, CSV staging, independent verification, immutable corrections, and auditing." },
      { title: "Forecast laboratory", description: "Compare naive, moving-average, SES, and ARIMA forecasts chronologically with a forecast-to-observation ledger." },
    ],
    workflow: ["Stage, validate, and independently verify compatible price observations.", "Choose the public series and run the forecast laboratory.", "Review uncertainty and the versioned rule explanation with the forecast.", "Compare an offer or inspect later forecast-to-observation evaluation."],
    layers: [
      { name: "Interface", technology: "Django templates · PWA", description: "Mobile-first screens expose provenance and allow read-only offline views." },
      { name: "Application and forecasting", technology: "Python · Django · statsmodels", description: "Chronological evaluation compares baseline methods and versioned decision rules." },
      { name: "Database", technology: "SQLite Lite · PostgreSQL production", description: "The local profile stores records in SQLite; production configuration requires PostgreSQL." },
      { name: "Verification and runtime", technology: "Maker-checker roles · Windows Lite", description: "A maker cannot verify their own observation; local acceptance is measured separately on the target device." },
    ],
    limitations: ["Synthetic demonstrations do not establish real local prices or forecast accuracy.", "Recommendations need sufficient verified, classification-compatible observations and do not guarantee profit.", "Target-hardware performance must be measured on the intended device."],
  }),
  "loyalty-scan": study("loyalty-scan", {
    status: "Staff-first loyalty application",
    audience: "Store owners and staff enrolling customers and recording visits and rewards.",
    purpose: "Connect private QR membership cards to accountable visit points and reward redemption with clear staff and owner controls.",
    features: [
      { title: "Enrollment and cards", description: "Create customer profiles and share, print, download, or replace private QR loyalty IDs." },
      { title: "Visits and rewards", description: "Scan with the camera or use manual lookup, award fixed points, and redeem rewards through server-enforced operations." },
      { title: "Owner operations", description: "Bootstrap the first store, manage staff and program settings, and inspect activity and audit history." },
    ],
    workflow: ["An owner initializes the store and grants staff access.", "Staff enroll a customer and issue their private QR card.", "Scan or look up the customer to record a visit or redeem a reward.", "Review balances and attributable ledger activity."],
    layers: [
      { name: "Interface", technology: "Next.js · React · TypeScript · Tailwind", description: "Mobile-friendly scanning, customer, owner, and settings screens share a PWA shell." },
      { name: "Application operations", technology: "Restricted database RPCs", description: "Server-authoritative points, cooldowns, card replacement, and idempotency protect visit/reward actions." },
      { name: "Database and identity", technology: "Supabase Auth · PostgreSQL · RLS", description: "Store membership scopes access, while an append-only point ledger and audit events retain history." },
      { name: "Demo mode", technology: "Browser-local persistence", description: "Seeded demo customers remain separate from a configured Supabase store." },
    ],
    limitations: ["Without Supabase configuration the app runs in browser-local demo mode.", "Staff invitations require the documented server-only configuration and Auth email templates.", "A public demo link alone does not establish a live store’s configuration or acceptance."],
  }),
  "kabacan-pickleplay": study("kabacan-pickleplay", {
    status: "Court-discovery and reservation prototype",
    audience: "Players, participating court owners, and listing administrators.",
    purpose: "Make local court discovery and reservation requests depend on verified venue facts, generated schedules, and server-authoritative booking rules.",
    features: [
      { title: "Verified discovery", description: "Filter venues, inspect map locations, and view only published, verified listings." },
      { title: "Reservations", description: "Choose generated slots, request a booking, submit payment references or private proof, and track statuses." },
      { title: "Owner and admin tools", description: "Manage schedules and blackouts, review bookings and payment evidence, and gate listing publication." },
    ],
    workflow: ["An owner prepares a court listing and verification evidence.", "An administrator reviews required facts before publication.", "A player chooses an available slot and submits a reservation.", "The owner reviews the request and payment evidence, then tracks completion."],
    layers: [
      { name: "Interface", technology: "Blade · Alpine.js · Tailwind · Leaflet", description: "Player and owner pages use OpenStreetMap-backed venue maps and responsive booking screens." },
      { name: "Application", technology: "Laravel · PHP", description: "Schedule generation, authoritative prices, locks, and atomic operations prevent double booking." },
      { name: "Storage", technology: "SQLite locally · MySQL/MariaDB option", description: "Bookings, venue facts, and audit records are separate from authorization-protected proof files." },
      { name: "Verification and access", technology: "Laravel roles · Email verification", description: "Listings and file reads are gated by publication evidence and the requesting user’s permissions." },
    ],
    limitations: ["The seeded reference venue is a non-public draft with unconfirmed facts left blank.", "Payments use references or proof review; a real payment gateway is a documented future addition.", "Live venue availability requires participating owners and verified schedules."],
  }),
  siloguard: study("siloguard", {
    status: "Connected rice-storage monitoring prototype",
    audience: "Researchers and operators exploring environmental readings in rice storage.",
    purpose: "Connect device readings to current-condition cards, historical trends, risk labels, alerts, and actuator command state.",
    features: [
      { title: "Current conditions", description: "Display temperature, humidity, air-quality, and grain-moisture readings from the current device row." },
      { title: "History and alerts", description: "Inspect bounded historical ranges, mold-risk scores, cooldown-protected alerts, and rollups." },
      { title: "Command state and reports", description: "Review manual/auto actuator command state and print the selected range’s data report." },
    ],
    workflow: ["The configured ESP32 collects and publishes readings.", "Supabase updates the current row and records throttled history.", "The dashboard receives realtime changes and loads selected history.", "Review risk labels, alerts, command state, and a printable report."],
    layers: [
      { name: "Interface", technology: "React · TypeScript · Tailwind", description: "The Vite dashboard presents current cards and on-demand history." },
      { name: "Device and transport", technology: "ESP32 · Supabase · Vercel functions", description: "The documented device path writes directly to Supabase; the repository also includes ingestion and actuator API functions." },
      { name: "Database", technology: "PostgreSQL · Realtime · Triggers", description: "Current readings, history, alerts, rollups, and command records connect through device-scoped policies." },
      { name: "Risk logic", technology: "Weighted sensor thresholds", description: "The prototype computes a mold-risk index from humidity, temperature, gas, and moisture scores." },
    ],
    limitations: ["Missing Supabase configuration produces demo readings.", "Risk scores are prototype threshold calculations, not independently validated mold detection.", "Software dashboards do not establish sensor calibration, actuator behavior, or physical pilot acceptance."],
  }),
  yaelitos: study("yaelitos", {
    status: "Restaurant website and booking-request workflow",
    audience: "Restaurant customers, invited staff, and the business owner.",
    purpose: "Let customers send complete booking requests while staff review and track them through a private dashboard.",
    features: [
      { title: "Customer pages", description: "Present the restaurant, food highlights, private events, visit information, and booking-data notice." },
      { title: "Booking requests", description: "Validate the request, check Turnstile, store a Pending record, and show a reference with optional contact fallbacks." },
      { title: "Staff handoff", description: "Invited staff update statuses; owners manage access, export CSV, inspect activity, and anonymize customer details." },
    ],
    workflow: ["A customer completes the on-page request and Turnstile check.", "The Edge Function validates, rate-limits, and stores the Pending request.", "The customer receives a request reference.", "Staff review and update the request; owners oversee access and retained data."],
    layers: [
      { name: "Interface", technology: "HTML · CSS · JavaScript", description: "Static customer pages and the staff dashboard use approved restaurant content and assets." },
      { name: "Application API", technology: "Supabase Edge Functions", description: "Submission, staff management, and exports use validation, origin checks, and authorization." },
      { name: "Database and identity", technology: "Supabase · Staff profiles", description: "Pending requests and audit activity are stored behind private staff/owner access; anonymous direct table access is excluded." },
      { name: "Abuse protection and retention", technology: "Turnstile · Quotas · Retention job", description: "Idempotency and per-IP limits protect submissions; the documented workflow includes retention and anonymization." },
    ],
    limitations: ["Requests require staff review and do not automatically confirm a booking.", "Online ordering, payments, automatic capacity decisions, and automated customer notifications are outside the documented scope.", "End-to-end business acceptance requires the configured backend and staff walkthrough."],
  }),
  "thesis-defense-scheduler": study("thesis-defense-scheduler", {
    status: "Local-first single-college defense scheduling application",
    audience: "College coordinators, faculty advisers and panelists, and students preparing thesis defenses.",
    purpose: "Coordinate availability and readiness in one workspace so a coordinator can generate, review, adjust, and publish a defense schedule against current participant, room, and workload constraints.",
    features: [
      { title: "Availability and readiness", description: "Students and faculty enter recurring or dated availability and teaching blocks. Coordinators manage rooms, groups, committee assignments, and readiness approval." },
      { title: "Conflict-checked drafts", description: "Generate a bounded first-fit draft, retain locked sessions, inspect projected workload, and review practical explanations for unscheduled groups." },
      { title: "Publication and history", description: "Revalidate the current data during atomic publication, record in-app notifications, and preserve versions when a session is rescheduled with a reason." },
      { title: "Personal schedules and reports", description: "Participants see authorized official sessions. Coordinators preview filtered reports and export published snapshots as PDF or formula-safe CSV with every student listed." },
    ],
    workflow: ["Set up the college term, groups, committee assignments, rooms, and editable workload rules.", "Collect student, faculty, and room availability, then review each group's readiness request.", "Generate a draft for a term, stage, date range, and room set; inspect conflicts, adjust sessions, and lock placements to retain.", "Publish after server revalidation, then review personal schedules, reports, notifications, and versioned rescheduling history."],
    layers: [
      { name: "Interface", technology: "Next.js · TypeScript · Tailwind", description: "Role-specific dashboards, availability, drafts, waiting lists, and reports support light, dark, and system themes with responsive navigation." },
      { name: "Identity and access", technology: "Better Auth · Server authorization", description: "Coordinator-created accounts use credential sessions. Student and faculty records and report scopes are checked on the server." },
      { name: "Scheduling and integrity", technology: "Deterministic first-fit · PostgreSQL advisory locks", description: "The shared validator checks availability, room capacity, turnover, and participant workload; transactional locking serializes scheduling mutations for one college." },
      { name: "Records and exports", technology: "Prisma · PostgreSQL · React PDF", description: "Published participant snapshots, audit events, and session versions preserve report history. PDFs wrap long titles and rosters; CSV exports neutralize formula prefixes." },
    ],
    limitations: ["The public repository is source publication; no public hosted application or actual college adoption is claimed. Demonstration names, groups, and limits are fictional examples.", "The bounded first-fit heuristic does not optimize fairness or prove infeasibility. A missing slot can require more availability, a wider date range, or coordinator adjustment.", "Committee selection remains manual. Grading, manuscript storage, plagiarism checking, automatic panel matching, and external email/SMS/calendar integrations are outside this version.", "Repository verification reports local application and concurrency checks; actual faculty usability acceptance and operational college approval remain separate."],
  }),
  "mlang-go": study("mlang-go", {
    status: "Local-first community directory and errands prototype",
    audience: "People in M’lang looking up places, services, requirements, and personal errands.",
    purpose: "Bring a provisional M’lang directory and an individual errands checklist into one installable browser and Android experience that remains useful when connectivity is limited.",
    features: [
      { title: "Directory search", description: "Search places and services, then filter by category, barangay, or the draft schedule’s open status." },
      { title: "Personal pocket", description: "Save places, create errands, import suggested packing items, and check off documents on the current device." },
      { title: "Transparency and sources", description: "Review source notes, save a correction locally, and copy or export a report to share yourself." },
    ],
    workflow: ["Search the provisional directory for a place or service.", "Review draft details, source notes, map links, and a suggested packing list.", "Save a place or create an errand and check off the documents you need.", "Review source notes or export a correction report when a listing needs attention."],
    layers: [
      { name: "Interface", technology: "React · TypeScript · Vite · Tailwind", description: "Responsive directory, listing, errands, and transparency views share a lightweight browser UI." },
      { name: "Mobile shell", technology: "Capacitor · Android", description: "The same web experience can run as a locally installed Android app with the visible M’lang Go identity." },
      { name: "Local data", technology: "Browser/Android local storage", description: "Favorites, errands, corrections, visit markers, and bag checks stay on the current installation without an account." },
      { name: "Offline delivery", technology: "Service worker · Versioned precache", description: "Production web assets can reopen after they have been cached; external maps and source pages still need their own connection." },
    ],
    limitations: ["Listings, schedules, requirements, and tips are a provisional starter dataset and require confirmation before travel.", "The app does not provide live office availability, route calculations, automatic report submission, or official LGU service.", "Android installation and physical-device behavior require separate checks on the target phone."],
  }),
  presyogo: study("presyogo", {
    status: "Offline personal price notebook and shopping planner",
    audience: "People comparing personal grocery prices and spending across stores and places in the Philippines.",
    purpose: "Keep dated price observations, like-for-like comparisons, shopping plans, purchases, spending, and recovery backups together in an offline Android notebook.",
    features: [
      { title: "Price history", description: "Create products and stores, record dated observations, compare exact units, and select the newest visible offer." },
      { title: "Shopping and spending", description: "Build budgets, record purchases with duplicate-save protection, and review monthly or category spending from the purchase ledger." },
      { title: "Portable recovery", description: "Export versioned JSON backups, validate a replacement restore transactionally, and export formula-safe CSV." },
      { title: "Place-aware records", description: "Use an all-areas view, a manually named area, or a saved nearby area from an explicitly captured phone location." },
    ],
    workflow: ["Add a product or store while entering a price observation.", "Compare dated offers using the same quantity and unit basis.", "Build a shopping budget and record actual purchases separately from observations.", "Review spending or export a validated backup before changing devices."],
    layers: [
      { name: "Interface", technology: "Flutter · Riverpod", description: "Home, Lists, Prices, Spending, and Settings screens support the personal notebook workflow." },
      { name: "Data and calculations", technology: "Drift · SQLite · Integer centavos", description: "Local records keep money exact, quantities canonical, and planned estimates distinct from purchases." },
      { name: "Portability", technology: "Versioned JSON · CSV", description: "Backups validate the complete snapshot before replacement; reports export the records visible in the notebook." },
      { name: "Android", technology: "Flutter Android · Local storage", description: "The PresyoGo app keeps the previous application identity for update compatibility while exposing the rebranded name." },
    ],
    limitations: ["The notebook has no verified live price feed, official partnership, community posting, account, advertising, payment processing, or automatic sharing.", "Location filters use the user’s captured position to filter personal records; they do not discover stores, fetch prices, calculate routes, or track travel.", "The current rebrand and release update still require the documented physical-phone checks before device acceptance can be claimed."],
  }),
  "honesty-store": study("honesty-store", {
    status: "Small-store honesty shop operations prototype",
    audience: "Boarders, helpers, and landlords running one shared-key boarding-house store.",
    purpose: "Connect a searchable menu, declared cash or credit purchases, water payments, key handovers, notebook encoding, repayments, stock, and cash reconciliation in one small-store workflow.",
    features: [
      { title: "Menu and checkout", description: "Browse a photo menu, record cash or approved utang purchases, and keep water payments separate from credit." },
      { title: "Shared-key handover", description: "Record who receives and returns the one physical key so the operational handoff stays visible." },
      { title: "Notebook and reconciliation", description: "Encode paper entries, review repayment declarations, count separate cash boxes, and export reports." },
      { title: "Role-scoped operations", description: "Helper and landlord views separate product, stock, account, buying-cost, correction, and audit responsibilities." },
    ],
    workflow: ["A boarder selects items and declares cash or an approved credit amount.", "The helper records key custody, notebook references, stock changes, or repayment review as needed.", "The landlord reviews accounts, costs, corrections, cash boxes, and reports.", "Offline records remain local until a configured authenticated backend can sync and reconcile them."],
    layers: [
      { name: "Interface", technology: "React · TypeScript · Vite · Capacitor", description: "The browser/PWA and Android shell provide role-specific store screens and an offline practice workspace." },
      { name: "Local projection", technology: "IndexedDB · Dexie", description: "Practice records, menu photos, and pending offline operations remain on the current device." },
      { name: "Shared rules", technology: "Supabase Edge Functions · PGlite", description: "The source documents shared transaction rules, revision-checked commits, and server-side role filtering." },
      { name: "Operational records", technology: "Private JSON snapshot · Command ledger", description: "A small-store state model keeps durable commands, reconciliation context, and audit history together." },
    ],
    limitations: ["The app records declarations and confirmations; it cannot detect coins, control the physical key, or activate the water dispenser.", "Hosted authentication, real multi-device synchronization, backend setup, and camera behavior require separate verification.", "The design is intentionally bounded for one small store; larger inventories and longer histories need a different data and API shape."],
  }),
  thesisflow: study("thesisflow", {
    status: "Private offline thesis progress companion",
    audience: "A student managing one thesis, its adviser feedback, documents, deadlines, and defense preparation.",
    purpose: "Keep thesis progress, consultation follow-ups, document versions, submissions, reminders, and recovery backups together on an Android device without an account or server.",
    features: [
      { title: "Chapters and feedback", description: "Track an editable five-chapter structure, chapter tasks, adviser corrections, consultation decisions, and linked follow-ups." },
      { title: "Documents and submissions", description: "Import PDF, DOCX, JPG, or PNG versions, preserve earlier copies, and record the exact version, recipient, channel, and date of a submission." },
      { title: "Planner and reports", description: "Switch between agenda and calendar views, set Asia/Manila reminders, and export a dated progress report." },
      { title: "Backup and guide", description: "Export a ZIP containing records and attachments, validate restores before replacement, and use the bundled USM thesis preparation guide." },
    ],
    workflow: ["Set up a thesis title and open the editable chapter checklist.", "Record consultations, corrections, deadlines, and document versions as work progresses.", "Create linked tasks from follow-up lines and mark the exact version used for a submission.", "Export a report or complete backup before changing devices or uninstalling the app."],
    layers: [
      { name: "Interface", technology: "Flutter · Soft neumorphic light/dark UI", description: "Touch-oriented screens organize chapters, consultations, documents, planner views, and settings." },
      { name: "Records", technology: "Drift · SQLite · Transactional links", description: "Explicit links preserve the relationship between chapters, tasks, corrections, meetings, documents, versions, and submissions." },
      { name: "Files and portability", technology: "ZIP archive · SHA-256 validation · PDF reports", description: "Attachments are checked before storage, and a complete restore validates paths, sizes, hashes, and limits before replacing records." },
      { name: "Android services", technology: "Local notifications · Share/open-file bridges", description: "Reminders and document sharing are explicitly initiated on the device and remain separate from proof of delivery or approval." },
    ],
    limitations: ["The first version supports one thesis and one user; it has no login, analytics, cloud sync, AI service, or automatic upload.", "Backups are unencrypted and should be stored privately; uninstalling the app deletes its private records.", "The guide is a preparation aid and does not certify adviser approval, university approval, submission delivery, or defense acceptance."],
  }),
} as const;
