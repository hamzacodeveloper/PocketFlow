# PocketFlow

PocketFlow is an offline-first personal finance and budgeting mobile app built with Expo and React Native. It lets you record income and expenses, enforce monthly and category budgets, view financial reports, and export/import data via PDF and Excel — all stored securely on-device with zero server dependencies or account requirements.

Bilingual out of the box with complete **English** and **Urdu** support, including right-to-left (RTL) layout switching.

---

## Key Features

- **Transaction Tracking**: Add, edit, and delete income and expense records with category tagging, notes, and dates. Includes a searchable, date-grouped list with daily summaries.
- **Monthly Budgeting**: Define monthly budget targets and monitor real-time spending with remaining balance and overspend indicators.
- **Category Budgets & Limits**: Assign monthly spending limits per category, complete with automatic alert banners when spending crosses 80% or exceeds 100%.
- **Interactive Reports**:
  - Donut chart breakdown of monthly category expenses.
  - 6-month historical savings bar chart highlighting surplus vs. overspend.
- **Data Export**:
  - Monthly statements exported to styled PDF documents or `.xlsx` spreadsheets.
  - Full-database workbook export containing transactions, categories, budgets, and summary sheets.
- **Data Import**: Restore transactions and categories from PocketFlow `.xlsx` backups with pre-validation and preview (classifying entries into new, duplicate, or invalid before committing in a single database transaction).
- **Backup Reminders**: Configurable backup reminders with customizable snooze options to safeguard your data.
- **Bilingual & RTL**: Switch seamlessly between English (LTR) and Urdu (RTL) or follow system language preferences.
- **Local-First & Private**: Powered by SQLite via `expo-sqlite` synchronous APIs. Works 100% offline with zero cloud telemetry or data leakage.
- **Paisa Precision**: Financial values are handled and stored as 64-bit minor units (paisa in PKR) to eliminate floating-point calculation inaccuracies.

---

## Tech Stack

| Area | Technologies |
| --- | --- |
| **Framework** | [Expo](https://docs.expo.dev/) SDK 58, React Native 0.88, React 19.3 |
| **Language** | TypeScript (strict mode) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction) v58 (file-based navigation with typed routes) |
| **Local Database** | [`expo-sqlite`](https://docs.expo.dev/versions/latest/sdk/sqlite/) (synchronous SQLite API) |
| **State Management** | [Zustand](https://zustand.docs.pmnd.rs/) |
| **Internationalization** | [`i18next`](https://www.i18next.com/) & `react-i18next` with `I18nManager` RTL integration |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) |
| **Charts** | [`react-native-gifted-charts`](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) |
| **Export / Import** | `expo-print` (PDF), [`SheetJS xlsx`](https://sheetjs.com/), `expo-sharing`, `expo-document-picker` |
| **UI & Animations** | `react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`, `@expo/vector-icons` |
| **Dates & Crypto** | `date-fns`, `expo-crypto` |
| **Testing** | Jest with `jest-expo` |

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- [Expo Go](https://expo.dev/go) app on a physical device, or configured Android Emulator / iOS Simulator

### Installation & Launch

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npx expo start
   ```

3. **Open the app:**
   - Scan the terminal QR code with the Expo Go app (Android) or Camera app (iOS).
   - Or press `a` to open in Android Emulator, `i` for iOS Simulator, or `w` for Web preview.

> [!NOTE]
> PocketFlow uses Continuous Native Generation (CNG). Do not create or edit `ios/` or `android/` folders manually; configure native properties through `app.json`. To add libraries requiring custom native modules, run `npx expo run:android` / `npx expo run:ios` or use EAS Build.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run android` | Launch the app in Android Emulator / connected device |
| `npm run ios` | Launch the app in iOS Simulator |
| `npm run web` | Run the web development build |
| `npm run lint` | Run ESLint check via `expo lint` |
| `npm test` | Execute the unit test suite using `jest-expo` |
| `npm run reset-project`| Script to archive starter code and reset route setup |

### Quality & Diagnostics

```bash
npx tsc --noEmit        # Run TypeScript typecheck
npx expo lint           # Run ESLint rules
npx expo-doctor         # Diagnose dependency and configuration health
npx expo install --fix  # Fix version mismatches across Expo packages
```

---

## Project Structure

```
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
│   │   ├── add-transaction.tsx  # Add / Edit / Delete transaction modal
│   │   ├── categories.tsx  # Category management & limit configuration
│   │   ├── export.tsx      # Export view (PDF / Excel)
│   │   └── import.tsx      # Import & preview view (.xlsx backup restoration)
│   ├── components/         # Reusable UI components (Cards, Inputs, Buttons, Modals)
│   ├── db/                 # SQLite database schema and repository modules
│   │   ├── schema.ts       # Table declarations & seed data
│   │   └── repositories/   # CRUD repositories for transactions, categories, budgets, reports
│   ├── hooks/              # Custom React hooks (e.g., useFonts)
│   ├── i18n/               # Localization dictionaries (en, ur) and month translations
│   ├── mock/               # Mock dataset for development previews
│   ├── services/           # PDF and Excel export/import business logic
│   ├── store/              # Zustand global state slices (transactions, budgets)
│   ├── theme/              # Theme tokens (colors, spacing, shadows, radius, typography)
│   ├── utils/              # Helper utilities (date formatting, paisa/currency arithmetic)
│   └── __tests__/          # Jest unit tests (dates, money calculations)
├── app.json                # Expo configuration and plugins
├── metro.config.js         # Metro bundler customization (WASM, server output)
└── package.json            # Project manifest and dependencies
```

---

## Architecture & Data Flow

PocketFlow adopts a clean, layered architecture ensuring low latency and instant offline reads:

```
UI Screens (src/app) ──▶ Zustand Stores (src/store) ──▶ Repositories (src/db/repositories) ──▶ SQLite Engine
```

1. **Synchronous Execution**: Database operations utilize `expo-sqlite` synchronous calls (`runSync`, `getAllSync`, `getFirstSync`), eliminating unnecessary asynchronous loading flickers across primary screens.
2. **Focus-Based Invalidation**: Analytical views and list screens re-evaluate data queries on navigation focus via `useFocusEffect`.
3. **Integer Currency Handling**: All monetary inputs are converted to integer paisa minor units (PKR 1.00 = 100 paisa) through `src/utils/money.ts`. Floating-point sums are prohibited in storage and queries to guarantee arithmetic precision.
4. **Resilient Import Pipeline**: Backups are inspected and categorized by status before writing to the database within an atomic SQLite transaction.

---

## Testing

Run unit tests covering utility calculations and money conversions:

```bash
npm test
```

Tests reside in [`src/__tests__/`](file:///d:/React%20Native/PocketFlow/src/__tests__/) and validate:
- Currency string parsing, formatting, and minor unit preservation (`money.test.ts`).
- Month key computation, formatting, and date localization (`dates.test.ts`).

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
