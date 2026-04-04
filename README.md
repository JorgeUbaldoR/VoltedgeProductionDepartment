# VoltEdge Production Department - Client API Web Resources

This repository contains the source code for the Web Resources (Client-side scripts) developed for the **VoltEdge Production Department** application in Microsoft Dataverse / Dynamics 365. 

The project utilizes **TypeScript** to ensure strong typing, auto-completion, and greater robustness before compiling into the final JavaScript (`.js`) files that are imported into the environment.

---

## 🚀 Technologies and Tools

* **Language:** TypeScript / JavaScript (ES6+)
* **API:** Microsoft Dataverse Client API Reference (`Xrm.FormContext`, `Xrm.WebApi`, etc.)
* **Package Manager:** npm (Node.js)
* **Code Quality:** ESLint
* **Code Formatter:** Prettier

---

## 📁 Repository Structure

The project architecture follows a modular approach, where each Dataverse table (Entity) has its own directory.

```text
VOLTEDGEPRODUCTIONDEPARTMENT/
│
├── Webresources/               # Main resources folder
│   ├── js/                     # Compiled JavaScript files (Output - Upload to D365)
│   └── ts/                     # TypeScript source code (Input)
│       ├── AssemblyLine/       # Assembly Line table scripts
│       ├── AssemblyProcess/    # Assembly Process form and BPF logic
│       ├── CaseReport/         # Case reports logic
│       ├── Common/             # Global utilities, shared constants, and helpers
│       ├── Device/             # Device validations and logic
│       ├── Package/            # Package table logic
│       ├── Replacement/        # Replacement management
│       ├── ServiceRequest/     # Service and maintenance requests
│       ├── TestingGoalIndicator/ # Mutual exclusion logic and test calculations
│       └── TestRecord/         # Quality test records logic
│
├── .eslintrc.json              # ESLint rules (Linter)
├── .prettierrc.json            # Formatting rules (Prettier)
├── tsconfig.json               # TypeScript compiler configurations
├── package.json                # Project dependencies and npm scripts
└── README.md                   # Project documentation
```

---

## 🛠️ Installation and Local Setup

To start developing in this project, you need to have [Node.js](https://nodejs.org/) installed on your machine.

**1. Clone the repository**
```bash
git clone https://github.com/JorgeUbaldoR/VoltedgeProductionDepartment.git
cd VOLTEDGEPRODUCTIONDEPARTMENT
```

**2. Install dependencies**
This will install TypeScript, ESLint, Prettier, and the XRM typings (`@types/xrm`).
```bash
npm install
```

---

## 💻 Development Workflow

### 1. Writing Code
All development should take place inside the `Webresources/ts/` directory. 
* Each entity should have an entry file (e.g., `main.ts`).
* The code must be wrapped in a `namespace` corresponding to the table (e.g., `namespace Device.Main { ... }`).
* Export only the functions that will be triggered directly by Dataverse form events (e.g., `export function onLoad(...)`).

### 2. Compile TypeScript to JavaScript
Before uploading the code to Dataverse, you must compile the TypeScript files.
*(Depending on your `package.json` setup, you can use one of the commands below):*
```bash
npm run build
# or
tsc
```
This will generate the corresponding `.js` files inside the `Webresources/js/` folder.

### 3. Deployment
Upload the compiled/minified files from the `js/` folder into your Solution in Power Apps / Dynamics 365, updating the existing Web Resources.

---

## 📏 Coding Standards

To maintain consistency and data integrity across the application, we strictly follow these guidelines:

1. **Constants:** All "Logical Names" for tables, fields, and processes must be stored in constants at the top of the file to prevent typos.
2. **Strict Null Checks:** Always validate if controls and attributes exist before attempting to access or manipulate their values (e.g., `if (!control) return;`).
3. **Prefixes:**
    * To access the actual DB value: `formContext.getAttribute("logical_name")`
    * To access the visual control in the form body: `formContext.getControl("logical_name")`
    * To access the control in the Header: `formContext.getControl("header_logical_name")`
    * To access the control in the Business Process Flow (BPF): `formContext.getControl("header_process_logical_name")`
4. **Auto-Formatting:** Before committing, ensure the code is formatted according to the project's Prettier rules.

---

**VoltEdge Production Department** - Maintaining Quality and Production Data Integrity.
