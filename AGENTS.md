PocketFlow — Agent Instructions
1. Project Context
- This is an Expo / React Native mobile application.
- PocketFlow is an offline-first personal finance and budgeting app.
- It supports income and expense tracking, monthly and category budgets, financial reports, and PDF / Excel data export and import.
- The app supports English and Urdu, including right-to-left (RTL) layout switching.
- The app stores its data locally on-device and has no server dependencies or account requirements.
- Prioritize mobile-first patterns, performance, and cross-platform compatibility.
2. Tech Stack & Version Rules
Use the project's declared dependencies and versions as the source of truth.
- Read the major version of the expo package in package.json before writing code that touches Expo, EAS, or React Native APIs.
- Expo ships breaking changes between SDK releases. Do not rely on remembered API names or behavior.
- Fetch the matching versioned Expo documentation: https://docs.expo.dev/versions/v<major>.0.0/.
- For other Expo documentation, fetch https://docs.expo.dev/llms.txt, follow its links to the relevant page, and do not answer from memory.
- The project stack documented in README.md is:
  - Expo SDK 58
  - React Native 0.88
  - React 19.3
  - TypeScript (strict mode)
  - Expo Router v58
  - expo-sqlite
  - Zustand
  - i18next and react-i18next
  - React Hook Form and Zod
  - react-native-gifted-charts
  - expo-print, SheetJS xlsx, expo-sharing, and expo-document-picker
  - react-native-reanimated, react-native-gesture-handler, react-native-safe-area-context, and @expo/vector-icons
  - date-fns and expo-crypto
  - Jest with jest-expo
- Verify installed versions in package.json; do not assume the README version is necessarily the currently installed version.
- Use bunx instead of npx if the project uses Bun (bun.lock is present).
- Use npx expo install <package> to install Expo-compatible packages instead of npm, yarn, pnpm, or bun add.
3. Expo & React Native Rules
- Use Expo Router for navigation.
- Routes live in src/app/; every file there is a screen, and _layout.tsx files define navigators.
- Keep non-route code, including components, hooks, and utilities, outside src/app/.
- Import Link, router, and useLocalSearchParams from expo-router.
- If ios/ and android/ directories do not exist, they are generated through Continuous Native Generation (CNG). Do not create or edit them by hand; configure native behavior in app.json and config plugins.
- Expo Go includes only its bundled native modules. After adding a library with native code, use a development build:
  - npx expo run:ios or npx expo run:android, or
  - eas build --profile development.
- Prefer recommended Expo modules over third-party libraries.
- Check available skills before adding dependencies.
- Use EAS for cloud builds, signing, submission, and over-the-air updates:
  - eas build
  - eas submit
  - eas update
- Run EAS CLI as bunx eas-cli <command> in Bun projects, or npx eas-cli@latest <command> otherwise.
4. Project Structure & File Placement
Follow the documented project structure:
PocketFlow/
├── assets/                 # App icons, splash screens, and asset images
├── doc/                    # Architecture, PRD, memory, design, and task specs
│   ├── ARCHITECTURE.md     # System architecture and technical guidelines
│   ├── DESIGN.md           # Visual design system, palette, and typography
│   ├── MEMORY.md           # Implementation decisions and project history
│   ├── PRD.md              # Product requirements document
│   └── TASKS.md            # Feature checklist and status
├── src/
│   ├── app/                # Expo Router screens (file-based navigation)
│   │   ├── _layout.tsx     # Root stack (DB initialization, fonts, i18n)
│   │   ├── (tabs)/         # Tab navigator (Home, Transactions, Add, Reports, Settings)
│   │   ├── add-transaction.tsx
│   │   ├── categories.tsx
│   │   ├── export.tsx
│   │   └── import.tsx
│   ├── components/         # Reusable UI components (Cards, Inputs, Buttons, Modals)
│   ├── db/                 # SQLite database schema and repository modules
│   │   ├── schema.ts       # Table declarations & seed data
│   │   └── repositories/   # CRUD repositories
│   ├── hooks/              # Custom React hooks
│   ├── i18n/               # Localization dictionaries (en, ur) and month translations
│   ├── mock/               # Mock dataset for development previews
│   ├── services/           # PDF and Excel export/import business logic
│   ├── store/              # Zustand global state slices
│   ├── theme/              # Theme tokens (colors, spacing, shadows, radius, typography)
│   ├── utils/              # Helper utilities
│   └── __tests__/           # Jest unit tests
├── app.json                # Expo configuration and plugins
├── metro.config.js         # Metro bundler customization
└── package.json            # Project manifest and dependencies
- Keep Expo Router screens in src/app/.
- Keep components, hooks, and utilities outside src/app/, in their corresponding documented directories.
5. Architecture & Data Flow
The documented data flow is:
UI Screens (src/app)
    → Zustand Stores (src/store)
    → Repositories (src/db/repositories)
    → SQLite Engine
- Keep the application organized around this documented layered data flow.
- Database operations are performed through expo-sqlite synchronous APIs: runSync, getAllSync, and getFirstSync.
- Analytical views and list screens re-evaluate data queries on navigation focus via useFocusEffect.
- Use src/utils/money.ts for integer-paisa currency conversion and arithmetic.
6. Database & SQLite Rules
- Use expo-sqlite as the local database.
- The documented database schema and seed data are in src/db/schema.ts.
- Database CRUD repository modules belong in src/db/repositories/.
- The app uses the synchronous SQLite APIs runSync, getAllSync, and getFirstSync.
- Import data is written within an atomic SQLite transaction.
7. Financial Calculation Rules
- Store and handle financial values as 64-bit integer minor units (paisa in PKR).
- PKR 1.00 equals 100 paisa.
- Do not use floating-point sums for financial storage or queries.
- Use src/utils/money.ts for currency conversion and arithmetic.
- Preserve integer-paisa precision in financial calculations.
8. State Management Rules
- Use Zustand for application state management.
- Zustand global state slices belong in src/store/.
- The documented architecture places Zustand stores between UI screens and database repositories.
9. Localization & RTL Rules
- Support English and Urdu.
- Use i18next and react-i18next for internationalization.
- Support RTL layout switching through I18nManager integration.
- Support switching between English (LTR), Urdu (RTL), and system language preferences.
- Localization dictionaries and month translations belong in src/i18n/.
10. UI & Design Guidelines
- Prioritize mobile-first patterns, performance, and cross-platform compatibility.
- Reusable UI components belong in src/components/.
- Theme tokens for colors, spacing, shadows, radius, and typography belong in src/theme/.
- The documented UI and animation dependencies include react-native-reanimated, react-native-gesture-handler, react-native-safe-area-context, and @expo/vector-icons.
- The project's visual design system, palette, and typography are documented in doc/DESIGN.md.
11. Feature Implementation Rules
The README documents these application features:
- Add, edit, and delete income and expense transactions.
- Categorize transactions and support notes and dates.
- Show searchable, date-grouped transactions with daily summaries.
- Define monthly budget targets and show remaining balance and overspend indicators.
- Set monthly category spending limits and show alert banners when spending crosses 80% or exceeds 100%.
- Show a monthly category-expense donut chart.
- Show a six-month historical savings bar chart for surplus versus overspend.
- Export monthly statements as PDF or .xlsx.
- Export a full-database workbook containing transactions, categories, budgets, and summary sheets.
- Import PocketFlow .xlsx backups with pre-validation and a preview that classifies entries as new, duplicate, or invalid.
- Provide configurable backup reminders with customizable snooze options.
- Preserve the documented English / Urdu and RTL support.
Project Summary Documentation (Required After Every Completed Feature)
After completing a feature or requested implementation task:
1. Check whether a doc/ directory exists at the project root.
2. If the root-level doc/ directory does not exist, create it.
3. Inside the root-level doc/ directory, create projectsummary.md if it does not already exist.
4. Add a new entry to doc/projectsummary.md documenting the completed work. If the file already exists, preserve its existing content and append the new entry; do not overwrite previous summaries.
5. Record the following information for each completed feature or implementation task:
   - Feature / Task: What was implemented.
   - Changes Made: What was added or changed as part of the implementation.
   - Errors Fixed: Which errors or bugs were fixed. If none, write None.
   - Status: The actual completion status. Do not mark work as completed unless it has been implemented and verified.
   - Implementation Date: The actual date the work was completed, in YYYY-MM-DD format.
6. Write only factual information about work actually performed. Do not claim that a feature, change, or fix was implemented or verified if it was not.
7. Update doc/projectsummary.md as part of the same task before reporting the task as complete.
12. Data Import & Export Rules
- PDF export uses expo-print.
- Excel export uses SheetJS xlsx.
- Use expo-sharing for sharing exported files.
- Use expo-document-picker for selecting files to import.
- Monthly statements can be exported as styled PDF documents or .xlsx spreadsheets.
- Full-database workbook export includes transactions, categories, budgets, and summary sheets.
- Import PocketFlow .xlsx backups with pre-validation and preview.
- Classify imported entries as new, duplicate, or invalid before committing.
- Commit the import in a single atomic SQLite transaction.
13. Security & Privacy Rules
- PocketFlow is documented as local-first and private.
- Store application data on-device using SQLite.
- The documented application has zero server dependencies, zero cloud telemetry, and no data leakage.
14. Error Handling
The provided project documentation does not define additional general error-handling conventions. Follow the documented import validation and preview behavior: classify imported entries as new, duplicate, or invalid before committing them.
15. Testing & Quality Assurance
- Run lint and TypeScript checks before declaring a task complete.
- Run npx expo lint to check lint rules.
- Run npx tsc --noEmit to run the TypeScript typecheck.
- Run npx expo-doctor to diagnose dependency and configuration issues.
- Use npx expo install --fix to fix incompatible Expo package versions when needed.
- Run npm test to execute the Jest test suite using jest-expo.
- Tests documented in src/__tests__/ cover:
  - Currency string parsing, formatting, and minor-unit preservation (money.test.ts).
  - Month-key computation, formatting, and date localization (dates.test.ts).
16. Git & Code Management
The provided AGENTS.md and README.md do not specify project-specific Git or commit-management rules. Do not infer additional Git rules from these files.
17. Final Verification Checklist
Before declaring a task complete:
- [ ] Run npx expo lint.
- [ ] Run npx tsc --noEmit.
- [ ] Run npx expo-doctor to diagnose dependency and configuration issues.
- [ ] Run npm test for the documented Jest test suite.
- [ ] Check for a root-level doc/ directory; create it if it does not exist.
- [ ] Create or update doc/projectsummary.md with the feature/task, changes made, errors fixed, actual status, and implementation date (YYYY-MM-DD). Preserve previous entries.
- [ ] Confirm that the implementation follows the documented Expo Router and project structure rules.
- [ ] Confirm that financial values retain integer-paisa precision.
- [ ] Confirm that the documented English / Urdu and RTL support is preserved when relevant.
- [ ] Confirm that import data is validated and committed in a single atomic SQLite transaction when import functionality is changed.