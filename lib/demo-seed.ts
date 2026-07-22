/**
 * Demo seed — populates the tmp SQLite database with realistic halal
 * certification data so the admin dashboard shows meaningful charts
 * and tables rather than empty state.
 *
 * Called automatically by ensureDb() after schema migrations run.
 * Is idempotent: checks for existing applications before inserting.
 *
 * 21 companies  ·  6 LARGE (28.57%)  ·  7 MEDIUM (33.33%)  ·  8 SMALL (38.10%)
 * 10 CERTIFIED (47.62%)  ·  5 in-progress (23.81%)  ·  6 REJECTED (28.57%)
 *
 * In-progress spread: SCREENING / ELIGIBILITY_REVIEW / SUBMITTED / DEFICIENCY_NOTICE / AWAITING_PAYMENT
 */

import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";

// ─── helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

// ─── company master list ──────────────────────────────────────────────────────
// status = new state-machine values
// schemeCode = DAHC scheme codes: FB FP AQ SL CS PH CG LG
// referenceNumber = DAHC/YY/SCH/XXXX (only for CERTIFIED companies)

const COMPANIES = [
  // ── CERTIFIED · LARGE (4) ───────────────────────────────────────────────────
  {
    name: "Usman Aliyu",
    email: "usman@halalalimentos.ng",
    biz: "Halal Alimentos Ltd",
    sector: "Food and Beverages",
    schemeCode: "FB",
    refNumber: "DAHC/25/FB/0001",
    scale: "LARGE",
    products: "Halal Seasoned Chicken, Beef Suya Mix, Jollof Spice Blend",
    status: "CERTIFIED",
    issueCert: true,
    certDaysAgo: 180,
    certExpiresIn: 45,
    created: 210,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },
  {
    name: "Maryam Garba",
    email: "maryam@nigermeat.ng",
    biz: "NigerMeat Express",
    sector: "Slaughterhouse / Meat and Poultry",
    schemeCode: "SL",
    refNumber: "DAHC/25/SL/0001",
    scale: "LARGE",
    products: "Fresh Halal Beef, Halal Mutton, Smoked Chicken Wings",
    status: "CERTIFIED",
    issueCert: true,
    certDaysAgo: 155,
    certExpiresIn: 210,
    created: 185,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },
  {
    name: "Abdullahi Tanko",
    email: "abdullahi@pharmaherb.ng",
    biz: "Pharmaherb Nigeria",
    sector: "Pharmaceuticals and Supplements",
    schemeCode: "PH",
    refNumber: "DAHC/25/PH/0001",
    scale: "LARGE",
    products: "Herbal Immune Tonic, Halal Vitamin Capsules",
    status: "CERTIFIED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 160,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },
  {
    name: "Suleiman Kano",
    email: "suleiman@kanodairy.ng",
    biz: "Kano Dairy Fresh",
    sector: "Food and Beverages",
    schemeCode: "FB",
    refNumber: "DAHC/25/FB/0002",
    scale: "LARGE",
    products: "Pasteurised Halal Milk, Yoghurt, Cheese",
    status: "CERTIFIED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 140,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },

  // ── CERTIFIED · MEDIUM (4) ──────────────────────────────────────────────────
  {
    name: "Fatima Bello",
    email: "fatima@greenleaf.ng",
    biz: "GreenLeaf Cosmetics",
    sector: "Cosmetics and Personal Care",
    schemeCode: "CS",
    refNumber: "DAHC/25/CS/0001",
    scale: "MEDIUM",
    products: "Halal Face Cream, Natural Lip Balm, Body Lotion",
    status: "CERTIFIED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 130,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },
  {
    name: "Ibrahim Musa",
    email: "ibrahim@blessedbev.ng",
    biz: "Blessed Beverages",
    sector: "Food and Beverages",
    schemeCode: "FB",
    refNumber: "DAHC/25/FB/0003",
    scale: "MEDIUM",
    products: "Zobo Concentrate, Tigernut Drink, Ginger Lemon Shot",
    status: "CERTIFIED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 120,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },
  {
    name: "Halima Sule",
    email: "halima@premiumtex.ng",
    biz: "Premium Textiles Co",
    sector: "Consumer Goods",
    schemeCode: "CG",
    refNumber: "DAHC/25/CG/0001",
    scale: "MEDIUM",
    products: "Halal-Dyed Cotton Fabric, Embroidered Prayer Mat",
    status: "CERTIFIED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 110,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },
  {
    name: "Zainab Danbatta",
    email: "zainab@swiftlogix.ng",
    biz: "SwiftLogix Nigeria",
    sector: "Logistics and Supply Chain",
    schemeCode: "LG",
    refNumber: "DAHC/25/LG/0001",
    scale: "MEDIUM",
    products: "Halal Cold-Chain Transport, Certified Storage Service",
    status: "CERTIFIED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 95,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },

  // ── CERTIFIED · SMALL (2) ───────────────────────────────────────────────────
  {
    name: "Aisha Bakr",
    email: "aisha@mamaskitchen.ng",
    biz: "Mama's Kitchen Ltd",
    sector: "Food Premises",
    schemeCode: "FP",
    refNumber: "DAHC/25/FP/0001",
    scale: "SMALL",
    products: "Halal Lunch Buffet, Outdoor Catering Service",
    status: "CERTIFIED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 80,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },
  {
    name: "Mohammed Bello",
    email: "mohammed@econaturals.ng",
    biz: "EcoNaturals Health",
    sector: "Pharmaceuticals and Supplements",
    schemeCode: "PH",
    refNumber: "DAHC/25/PH/0002",
    scale: "SMALL",
    products: "Moringa Powder, Black Seed Oil, Herbal Tea Blend",
    status: "CERTIFIED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 70,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },

  // ── IN-PROGRESS · LARGE (2) ─────────────────────────────────────────────────
  {
    name: "Garba Ilyas",
    email: "garba@goldengrains.ng",
    biz: "Golden Grains Mills",
    sector: "Food and Beverages",
    schemeCode: "FB",
    refNumber: null,
    scale: "LARGE",
    products: "Stone-Milled Wheat Flour, Semolina, Rice Flour",
    status: "SCREENING",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 55,
    reviewNotes: "Documents received. Screening in progress.",
  },
  {
    name: "Yusuf Ahmad",
    email: "yusuf@northeastfarm.ng",
    biz: "NorthEast Agro Ltd",
    sector: "Food and Beverages",
    schemeCode: "FB",
    refNumber: "DAHC/26/FB/0001",
    scale: "LARGE",
    products: "Certified Organic Vegetables, Sun-Dried Tomatoes",
    status: "ELIGIBILITY_REVIEW",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 45,
    reviewNotes: "Documents complete. Eligibility review in progress.",
  },

  // ── IN-PROGRESS · MEDIUM (2) ────────────────────────────────────────────────
  {
    name: "Hauwa Dogo",
    email: "hauwa@riverbend.ng",
    biz: "Riverbend Farms",
    sector: "Aquatic Animals and Fish Processing",
    schemeCode: "AQ",
    refNumber: null,
    scale: "MEDIUM",
    products: "Smoked Catfish, Dried Crayfish, Fish Sauce",
    status: "SUBMITTED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 35,
    reviewNotes: null,
  },
  {
    name: "Ismail Lawan",
    email: "ismail@techfoods.ng",
    biz: "TechFoods NG",
    sector: "Food and Beverages",
    schemeCode: "FB",
    refNumber: null,
    scale: "MEDIUM",
    products: "Instant Noodles, Seasoning Cubes, Pepper Sauce",
    status: "DEFICIENCY_NOTICE",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 28,
    reviewNotes: "Missing: NAFDAC registration certificates for 2 products.",
  },

  // ── IN-PROGRESS · SMALL (1) ─────────────────────────────────────────────────
  {
    name: "Bilkisu Hassan",
    email: "bilkisu@sunstarsnacks.ng",
    biz: "SunStar Snacks",
    sector: "Food and Beverages",
    schemeCode: "FB",
    refNumber: "DAHC/26/FB/0002",
    scale: "SMALL",
    products: "Groundnut Cake (Kuli-Kuli), Chin-Chin, Coconut Candy",
    status: "AWAITING_PAYMENT",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 18,
    reviewNotes: "Eligible. Application approved for registration. Fee invoice sent.",
  },

  // ── REJECTED · MEDIUM (1) ───────────────────────────────────────────────────
  {
    name: "Aminu Sale",
    email: "aminu@sahara.ng",
    biz: "Sahara Confectionery",
    sector: "Food and Beverages",
    schemeCode: "FB",
    refNumber: null,
    scale: "MEDIUM",
    products: "Chocolate Truffle, Caramel Candy",
    status: "REJECTED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 195,
    reviewNotes: "Product ingredients contain non-halal emulsifiers. Application rejected.",
  },

  // ── REJECTED · SMALL (5) ────────────────────────────────────────────────────
  {
    name: "Rabi Nuhu",
    email: "rabi@fortuna.ng",
    biz: "Fortuna Cosmetics",
    sector: "Cosmetics and Personal Care",
    schemeCode: "CS",
    refNumber: null,
    scale: "SMALL",
    products: "Anti-Ageing Serum, Hair Relaxer",
    status: "REJECTED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 175,
    reviewNotes: "Formulation contains alcohol-based preservatives not compliant with Shariah standards.",
  },
  {
    name: "Sadiq Waziri",
    email: "sadiq@abujatex.ng",
    biz: "AbujaTex Industries",
    sector: "Consumer Goods",
    schemeCode: "CG",
    refNumber: null,
    scale: "SMALL",
    products: "Polyester Fabric, Synthetic Dye Bath",
    status: "REJECTED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 155,
    reviewNotes: "Dye processing uses non-halal binding agents. Please reformulate and reapply.",
  },
  {
    name: "Ladi Bature",
    email: "ladi@lagosbakery.ng",
    biz: "Lagos Bakery House",
    sector: "Food and Beverages",
    schemeCode: "FB",
    refNumber: null,
    scale: "SMALL",
    products: "Birthday Cake, Meat Pie, Cream Puff",
    status: "REJECTED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 168,
    reviewNotes: "Lard-based shortening detected in product formulation. Application rejected.",
  },
  {
    name: "Chukwuma Nwosu",
    email: "chukwuma@quickbite.ng",
    biz: "QuickBite Restaurants",
    sector: "Food Premises",
    schemeCode: "FP",
    refNumber: null,
    scale: "SMALL",
    products: "Street Food Stand, Mixed Grill Set",
    status: "REJECTED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 145,
    reviewNotes: "On-site inspection revealed shared utensils with non-halal food lines.",
  },
  {
    name: "Grace Okonkwo",
    email: "grace@deltaspices.ng",
    biz: "Delta Spices Co",
    sector: "Food and Beverages",
    schemeCode: "FB",
    refNumber: null,
    scale: "SMALL",
    products: "Mixed Spice Blend",
    status: "REJECTED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 122,
    reviewNotes: "Spice blend contains alcohol-based extraction. Does not meet halal standards.",
  },
];

// ─── payment rows ─────────────────────────────────────────────────────────────

const PAYMENT_ROWS = [
  { idx: 0,  desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 209 },
  { idx: 0,  desc: "Certification Fee — Large Scale",  type: "COMPANY", amt: 35_000_000, status: "COMPLETED", daysAgo: 190 },
  { idx: 1,  desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 184 },
  { idx: 1,  desc: "Certification Fee — Large Scale",  type: "COMPANY", amt: 35_000_000, status: "COMPLETED", daysAgo: 165 },
  { idx: 2,  desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 159 },
  { idx: 3,  desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 139 },
  { idx: 3,  desc: "Certification Fee — Large Scale",  type: "COMPANY", amt: 35_000_000, status: "COMPLETED", daysAgo: 120 },
  { idx: 4,  desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 129 },
  { idx: 5,  desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 119 },
  { idx: 5,  desc: "Certification Fee — Medium Scale", type: "COMPANY", amt: 25_000_000, status: "COMPLETED", daysAgo: 100 },
  { idx: 6,  desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 109 },
  { idx: 6,  desc: "Certification Fee — Medium Scale", type: "COMPANY", amt: 25_000_000, status: "COMPLETED", daysAgo: 90  },
  { idx: 7,  desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 94  },
  { idx: 7,  desc: "Certification Fee — Medium Scale", type: "COMPANY", amt: 25_000_000, status: "COMPLETED", daysAgo: 75  },
  { idx: 8,  desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 79  },
  { idx: 8,  desc: "Certification Fee — Small Scale",  type: "COMPANY", amt: 15_000_000, status: "PENDING",   daysAgo: 60  },
  { idx: 9,  desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 69  },
  { idx: 14, desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 17  },
];

// ─── platform settings ────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Record<string, string> = {
  price_cert_large:   "350000",
  price_cert_medium:  "250000",
  price_cert_small:   "150000",
  price_application:  "75000",
  price_renewal:      "100000",
  price_inspection:   "200000",
  price_surveillance: "125000",
};

// ─── LMS course data ─────────────────────────────────────────────────────────

const DEMO_COURSES = [
  {
    slug: "halal-fundamentals",
    title: "Halal Certification Fundamentals",
    description: "A comprehensive introduction to Halal principles, global standards, and the DAHC certification journey from application to certificate.",
    category: "Foundation",
    level: "Beginner",
    durationLabel: "3h 20m",
    modules: [
      {
        title: "What is Halal?",
        lessons: [
          {
            title: "Defining Halal & Haram",
            durationMin: 18,
            contentMd: `## Defining Halal & Haram

**Halal** (حلال) is an Arabic word meaning "permissible" under Islamic law (Shari'ah). Its opposite, **Haram** (حرام), means "forbidden." For food and consumer products, these concepts govern everything from ingredient sourcing to processing methods and packaging.

### Key Prohibited Substances
- **Pork** and all by-products (gelatin, lard, carmine from insects)
- **Alcohol** and intoxicants in any quantity
- **Blood** and blood by-products
- Animals **not slaughtered** in accordance with Islamic rites (tasmiyyah + facing qiblah)
- Animals that **died before slaughter**

### What Makes a Product Halal?
A product is only Halal if **every ingredient, processing aid, and contact surface** is compliant. A single non-Halal ingredient — even a trace amount from cross-contamination — renders the entire product Haram.

> "Eat of what is on earth, lawful and good; and do not follow the footsteps of the evil one, for he is to you an avowed enemy." — Qur'an 2:168

### Practical Implication
For manufacturers, this means maintaining rigorous **supply chain documentation** for every raw material. It is not sufficient for a finished product to appear Halal — the entire production process must be verifiably compliant.

Mark this lesson complete when you are confident you can distinguish between permissible and impermissible substances under Shari'ah.`,
          },
          {
            title: "Halal in a Global Business Context",
            durationMin: 22,
            contentMd: `## Halal in a Global Business Context

The global Halal economy is worth an estimated **USD 3.2 trillion** annually and is growing at approximately 6% per year. Beyond religion, Halal certification is increasingly recognised as a quality and safety mark by non-Muslim consumers worldwide.

### Who Buys Halal?
- **1.9 billion Muslims** globally, representing ~24% of the world population
- Non-Muslim consumers in the **GCC, Southeast Asia, and Europe** who associate Halal with ethical and hygienic production
- **Institutional buyers** (airlines, hospitals, hotels) with Halal procurement policies

### Nigeria's Halal Market
Nigeria is home to approximately **100 million Muslims** — the largest Muslim population in sub-Saharan Africa. Lagos, Kano, Abuja, and the entire North-West geopolitical zone represent a massive captive domestic market, while proximity to ECOWAS neighbours creates significant export opportunity.

### Certification as a Business Tool
| Without Certification | With Certification |
|---|---|
| Access to local markets only | Access to GCC, EU Halal zones |
| Self-declaration (low trust) | Third-party verified (high trust) |
| No premium pricing | 5–25% Halal premium documented |
| Excluded from institutional tenders | Eligible for airline/hospital contracts |

A DAHC certificate is recognised under Nigeria's NAFDAC framework and is accepted by multiple GCC importing authorities.`,
          },
        ],
      },
      {
        title: "The Certification Landscape",
        lessons: [
          {
            title: "Major Standards Bodies (SMIIC, JAKIM, ESMA)",
            durationMin: 25,
            contentMd: `## Major Standards Bodies

No single global Halal authority exists; instead, a network of national and intergovernmental bodies sets standards and grants mutual recognition.

### SMIIC — Standards and Metrology Institute for Islamic Countries
Established under the OIC (Organisation of Islamic Cooperation), **SMIIC OIC/SMIIC 1** is the most widely referenced international standard. It covers Food, Food Ingredients, Animal Feed, Cosmetics, and Pharmaceuticals. DAHC certifications are aligned with SMIIC 1.

### JAKIM — Malaysia
The **Department of Islamic Development Malaysia** runs one of the world's most rigorous Halal schemes. JAKIM recognition is often required for products entering Southeast Asian Muslim markets and is highly respected globally.

### ESMA — UAE
The **Emirates Authority for Standardisation & Metrology** administers UAE's mandatory Halal import requirements. Products entering the UAE must bear an ESMA-recognised Halal mark. DAHC has initiated the inter-certification recognition pathway with ESMA.

### Nigeria — NAFDAC & DAHC
The **National Agency for Food and Drug Administration and Control (NAFDAC)** does not issue Halal certificates directly but accepts third-party Halal certification from accredited bodies including DAHC as supporting documentation for product registration.

> **For export to the GCC:** Ensure your certification body is listed on the importing country's approved foreign body registry. DAHC's status is listed on the SMIIC directory of OIC member-state bodies.`,
          },
          {
            title: "Why Businesses Seek Certification",
            durationMin: 20,
            contentMd: `## Why Businesses Seek Halal Certification

Businesses pursue Halal certification for a combination of ethical, commercial, and regulatory reasons.

### Top Reasons

**1. Market Access**
Many export markets — UAE, Saudi Arabia, Malaysia, Indonesia — require Halal certification at the border. Without it, products are turned back or detained. Certification is not a "nice to have"; it is a licence to trade.

**2. Consumer Trust**
A third-party Halal mark on packaging immediately signals compliance to Muslim consumers who cannot verify ingredients themselves. Brand loyalty studies show Muslim consumers pay a **15–20% premium** for verified Halal products.

**3. Institutional Contracts**
Airlines (Emirates, Air Peace's Muslim routes), hotel chains (Hilton, Marriott Halal-certified kitchens), hospitals, and government canteens all require supplier Halal certification for tender eligibility.

**4. Quality Halo Effect**
Halal production demands strict hygiene, animal welfare, and traceability standards that overlap significantly with ISO 22000 and HACCP. Businesses often report improved overall quality management as a by-product of Halal certification.

**5. Regulatory Compliance**
CAC (Codex Alimentarius Commission) guidelines and OIC member-state import regulations increasingly mandate third-party Halal verification for packaged food products.

### The Cost of NOT Certifying
Market exclusion, lost tenders, brand exposure if a product is publicly revealed as non-compliant, and regulatory fines in strict-compliance markets like Saudi Arabia and Malaysia.`,
          },
        ],
      },
      {
        title: "The Dar Al Halal Process",
        lessons: [
          {
            title: "Application to Certificate: An Overview",
            durationMin: 30,
            contentMd: `## From Application to Certificate

DAHC follows a rigorous 15-stage certification workflow aligned with OIC/SMIIC standards.

### The 15 Stages

| Stage | Status Code | Description |
|---|---|---|
| 1 | DRAFT | Applicant completes AP/AF/01 form |
| 2 | SUBMITTED | Form submitted; fee invoice generated |
| 3 | SCREENING | Admin reviews documents for completeness |
| 4 | DEFICIENCY_NOTICE | Missing documents requested (14-day deadline) |
| 5 | ELIGIBILITY_REVIEW | Operations Manager evaluates application |
| 6 | TRC_ESCALATION | Technical Review Committee pre-screens complex cases |
| 7 | AWAITING_PAYMENT | Certification fee invoice sent |
| 8 | PENDING_AUDIT | Payment confirmed; audit scheduled |
| 9 | AUDITING | On-site inspection conducted |
| 10 | ACTION_REQUIRED_NCR | Non-Conformance Report issued |
| 11 | VERIFYING_NCR | Corrective Actions verified by Inspector |
| 12 | BOARD_REVIEW | Complete file reviewed by Technical + Shariah Panel |
| 13 | CERTIFIED | Certificate issued (DAHC/CERT/YY/XXXXXX) |
| 14 | REJECTED | Application rejected with written reasons |
| 15 | CLOSED_INCOMPLETE | Deficiency deadline expired with no response |

### Typical Timeline
- Simple applications (Food Premises, single-product SMEs): **8–12 weeks**
- Complex applications (multi-site, large manufacturers): **16–24 weeks**

### Key Documents Required
- Business Registration (CAC certificate)
- NAFDAC product registration certificates
- Ingredient list with supplier halal status for each ingredient
- Process flow diagram
- Site hygiene and pest control records`,
          },
          {
            title: "Maintaining Your Certification",
            durationMin: 15,
            contentMd: `## Maintaining Your Halal Certificate

Certification is not a one-time event. DAHC certificates are **valid for 2 years** with mandatory annual surveillance audits.

### Annual Surveillance Audit
Every certified company must undergo a surveillance visit 12 months after the initial certification. The inspector verifies:
- No new non-Halal ingredients have been introduced
- Supplier documentation is current (no expired Halal certs from ingredient suppliers)
- Production processes remain unchanged or changes have been pre-approved
- Staff awareness of Halal Critical Control Points (HCCPs)

### Renewal Process
**60 days before expiry**, DAHC issues a renewal notice. The renewal process is abbreviated — applicants do not need to resubmit the full AP/AF/01 form but must:
1. Submit an updated ingredient and supplier list
2. Pay the renewal fee
3. Pass a renewal audit (scope: changes since last audit only)

### What Triggers Re-Certification?
- Change of production site
- Addition of new product lines
- Change of key suppliers
- Process changes affecting HCCPs
- Merger or acquisition

> **Pro tip:** Maintain a live Halal file — a folder (physical or digital) containing all current supplier Halal certificates, updated ingredient lists, and your DAHC audit reports. Present this to your inspector to dramatically reduce audit time.

### Listing in the DAHC Public Registry
All certified companies are listed in the publicly searchable DAHC Halal Registry. Keep your contact details and product list up to date through the portal to maximise the marketing value of your certificate.`,
          },
        ],
      },
    ],
    quiz: [
      { text: "Which Arabic term means 'forbidden' under Islamic law?", options: ["Halal", "Haram", "Tayyib", "Makruh"], correctIndex: 1, explanation: "Haram (حرام) means forbidden. Halal means permissible, Tayyib means wholesome, and Makruh means discouraged." },
      { text: "What is the approximate annual value of the global Halal economy?", options: ["USD 500 billion", "USD 1.2 trillion", "USD 3.2 trillion", "USD 7 trillion"], correctIndex: 2, explanation: "The global Halal economy is estimated at approximately USD 3.2 trillion annually and growing at ~6% per year." },
      { text: "Which body sets the most widely referenced international Halal standard?", options: ["NAFDAC", "JAKIM", "SMIIC", "Codex Alimentarius"], correctIndex: 2, explanation: "SMIIC (Standards and Metrology Institute for Islamic Countries) issues OIC/SMIIC 1, the most widely referenced international Halal standard." },
      { text: "How long is a DAHC Halal certificate valid?", options: ["6 months", "1 year", "2 years", "5 years"], correctIndex: 2, explanation: "DAHC certificates are valid for 2 years with mandatory annual surveillance audits at the 12-month mark." },
      { text: "What must a food manufacturer document for every ingredient to achieve Halal certification?", options: ["Only the finished product analysis", "Supplier Halal status and certificate for each ingredient", "Only the product's retail packaging", "A consumer taste test report"], correctIndex: 1, explanation: "Halal compliance requires documented Halal status and valid certificates for every ingredient — a single non-compliant ingredient makes the product Haram." },
    ],
  },
  {
    slug: "ingredient-compliance",
    title: "Ingredient Compliance & Labeling",
    description: "Master the identification of permissible and impermissible food additives, enzymes, and processing aids — and build audit-ready ingredient documentation.",
    category: "Compliance",
    level: "Intermediate",
    durationLabel: "5h 10m",
    modules: [
      {
        title: "Understanding E-Numbers",
        lessons: [
          {
            title: "Common Additives and Their Sources",
            durationMin: 28,
            contentMd: `## Common Food Additives and Their Sources

The European Union's **E-number system** classifies food additives. Each number maps to a specific function (colour, preservative, emulsifier, etc.) and — critically for Halal compliance — a source that may be animal-derived, alcohol-based, or synthetic.

### E-Number Categories of Concern

| Range | Category | Halal Risk |
|---|---|---|
| E100–E199 | Colours | Some animal-derived (E120 Carmine from insects) |
| E200–E299 | Preservatives | E210–E215 benzoic acid derivatives generally safe |
| E400–E499 | Thickeners/Stabilisers | E441 Gelatine (pork/beef origin) |
| E500–E599 | Acidity Regulators | Generally safe |
| E600–E699 | Flavour Enhancers | E631 IMP (may be animal-derived) |
| E900–E999 | Glazing Agents | E920 L-Cysteine (often hair-derived) |

### The Most Problematic E-Numbers for Halal

**E120 (Carmine / Cochineal):** Red colour derived from crushed female cochineal insects. Not Halal under most scholarly opinions. Often found in confectionery, fruit drinks, and yoghurt.

**E441 (Gelatine):** Protein derived from animal skin and bones. **Source determines Halal status.** Pork gelatine = Haram. Certified beef gelatine from a Halal slaughterhouse = Halal. Always verify the source declaration.

**E631 (Disodium Inosinate):** Flavour enhancer that may be derived from fish or pork. Requires supplier documentation to confirm source.

**E920 (L-Cysteine):** Amino acid used as a flour treatment agent; most commercial L-Cysteine is derived from human hair or poultry feathers. Look for the synthetic (fermentation-derived) version.

> **Compliance tip:** Never assume "no animal ingredients" from an ingredients label alone. E-numbers can conceal animal origins. Always obtain a **Halal Compliance Statement** from suppliers for every additive used.`,
          },
          {
            title: "Animal-Derived vs Plant-Derived Additives",
            durationMin: 24,
            contentMd: `## Animal-Derived vs Plant-Derived Additives

Determining whether an additive is animal-derived is one of the most technically challenging aspects of Halal compliance. The same additive may be produced from multiple sources, and suppliers frequently switch sources based on price.

### Key Dual-Source Additives

| Additive | Animal Source | Plant/Synthetic Source |
|---|---|---|
| Gelatine | Pork/Beef skin & bones | Agar (seaweed), Pectin (fruit) |
| Stearic Acid (E570) | Animal fat (tallow) | Vegetable stearic acid |
| Glycerol (E422) | Animal fat rendering | Vegetable oil by-product |
| Casein | Cow's milk | — (always animal, but dairy OK if halal) |
| Whey | Cow's milk | — (always animal) |
| Lecithin (E322) | Egg yolk (animal) | Soy or sunflower (plant) |

### Screening Protocol

**Step 1:** Identify all additives in your ingredient by E-number or INCI name.

**Step 2:** For each additive on the "dual-source" list, request a **Certificate of Origin** or **Halal Compliance Declaration** from the supplier specifying plant or synthetic origin.

**Step 3:** If the supplier cannot confirm source, treat the additive as **suspect** and seek an alternative source.

**Step 4:** Document all declarations and include them in your Halal file for the DAHC auditor.

### Scenario: Lecithin Sourcing
A biscuit manufacturer uses lecithin (E322) as an emulsifier. If the supplier's specification sheet says "lecithin" without specifying source, assume egg (animal) origin and request clarification. If confirmed as **soy lecithin**, it is Halal-compliant. If **egg lecithin**, it is Halal only if from a Halal-certified egg source.`,
          },
        ],
      },
      {
        title: "Enzymes & Processing Aids",
        lessons: [
          {
            title: "Microbial vs Animal Enzymes",
            durationMin: 26,
            contentMd: `## Microbial vs Animal Enzymes

Enzymes are biological catalysts used extensively in food processing. They do not appear on finished product labels but remain present as **processing aids** and must be Halal-compliant.

### Common Food Enzymes

| Enzyme | Use | Source Concern |
|---|---|---|
| Rennet (Chymosin) | Cheese making | Calf stomach (animal) or microbial/GMO |
| Lipase | Flavour development in dairy | Porcine (pork) pancreas risk |
| Protease | Meat tenderising, bread | Microbial or animal |
| Amylase | Bread, beer, glucose syrups | Usually microbial (safe) |
| Lactase | Lactose-free products | Microbial (safe) |
| Pectinase | Fruit juice clarification | Microbial (safe) |

### The Rennet Question

Traditional animal rennet is extracted from the stomach lining of suckling calves. Its Halal status depends on:
1. Whether the calf was slaughtered according to Islamic rites
2. Whether purification steps in extraction are sufficient (scholarly debate exists)

**Best practice:** Specify **microbial rennet** (from Rhizomucor miehei) or **fermentation-derived chymosin (FPC)** — both are widely available and universally accepted as Halal by SMIIC-aligned bodies including DAHC.

### Documenting Enzyme Compliance

Request a **Halal Enzyme Certificate** or at minimum a **source declaration letter** on supplier letterhead for every enzyme used in your process. DAHC auditors will inspect enzyme documentation as part of the HCCP (Halal Critical Control Point) review.

> **Key rule:** If an enzyme could be porcine in origin and the supplier cannot confirm otherwise in writing, it must be treated as Haram until proven compliant.`,
          },
          {
            title: "Cross-Contamination Risk Points",
            durationMin: 20,
            contentMd: `## Managing Cross-Contamination Risk

A product can be formulated with perfectly Halal ingredients and still fail a Halal audit if **cross-contamination** occurs during production, storage, or transport.

### The Three Contamination Vectors

**1. Physical Cross-Contamination**
Shared equipment between Halal and non-Halal production lines. A frying vat used for both pork and chicken products contaminates the chicken regardless of ingredient compliance.

**Mitigation:** Dedicated equipment for Halal lines, or validated deep-cleaning (samak protocol) between runs.

**2. Chemical Cross-Contamination**
Cleaning agents containing alcohol (ethanol-based sanitisers above permitted thresholds) or other Haram substances contacting food-contact surfaces.

**Mitigation:** Use DAHC-approved cleaning protocols. Water-based and QAC (quaternary ammonium compound) sanitisers are generally acceptable.

**3. Biological Cross-Contamination**
Residual animal protein from shared drainage, shared refrigeration, or shared waste disposal creating Najis (impurity) contamination.

**Mitigation:** Separate waste streams; dedicated refrigeration zones; colour-coded utensils.

### Halal Critical Control Points (HCCPs)
DAHC auditors map your process and identify **HCCPs** — points where a Halal defect could be introduced if controls fail. These are directly analogous to HACCP CCPs:

- Ingredient intake (source verification)
- Storage (segregation)
- Production (equipment dedication or validated cleaning)
- Packaging (contact material compliance)
- Dispatch (transport vehicle cleanliness)

Maintain a **HCCP monitoring log** for each point with daily sign-offs. This is the primary document reviewed during surveillance audits.`,
          },
        ],
      },
      {
        title: "Auditing Ingredient Lists",
        lessons: [
          {
            title: "Building a Compliance Checklist",
            durationMin: 22,
            contentMd: `## Building a Halal Ingredient Compliance Checklist

A compliance checklist converts the abstract principle of "every ingredient must be Halal" into an operational, auditable system.

### Your Master Ingredient Register

For each raw material used in your facility, maintain:

| Field | Example |
|---|---|
| Ingredient Name | Soy Lecithin |
| Supplier | Archer Daniels Midland NG |
| E-Number / INCI | E322 |
| Origin | Plant (Soybean) |
| Halal Certificate # | ADM-HL-2025-0041 |
| Cert Body | IFANCA |
| Cert Expiry | 2026-06-30 |
| DAHC Review Status | Approved |

### Categorising Your Ingredients

**Green (Always Halal if uncontaminated):** Pure water, salt, sugar, most plant-derived ingredients, single-origin fruit/vegetable concentrates.

**Amber (Conditionally Halal — requires documentation):** Fats and oils (verify non-porcine source), emulsifiers, flavours, enzymes, colourings.

**Red (Haram or high-risk — must be substituted or proven compliant):** Any product listing pork or lard, alcohol-based ingredients, unverified gelatine, carmine (E120).

### Checklist Review Cadence

| Trigger | Action |
|---|---|
| New ingredient | Full screen before use |
| Supplier change (same ingredient) | Re-screen new supplier |
| Cert expiry (30 days before) | Request renewal from supplier |
| Annual surveillance audit | Full register review |

> **Best practice:** Store your compliance register in a shared drive accessible to QA, procurement, and your DAHC-designated Halal Internal Auditor (HIA).`,
          },
          {
            title: "Working With Suppliers for Documentation",
            durationMin: 18,
            contentMd: `## Obtaining and Managing Supplier Documentation

The most common reason Halal applications are delayed at DAHC is **missing or expired supplier documentation**. This lesson gives you a practical system for staying ahead.

### What to Request from Suppliers

**Tier 1 (Essential):** Halal Certificate issued by a recognised body (list recognised bodies: JAKIM, ESMA, IFANCA, MUI, SMIIC-accredited bodies, DAHC). Certificate must be current and specify the exact product or product category.

**Tier 2 (For complex ingredients):** Certificate of Origin (for animal-derived ingredients — confirms species and slaughter method); Technical Data Sheet confirming ingredient specification; MSDS where chemical inputs are involved.

**Tier 3 (For processing aids and enzymes):** Halal Compliance Declaration on company letterhead, signed by an authorised representative, confirming source and absence of Haram substances.

### Template Request Letter

When requesting documentation from suppliers who are unfamiliar with Halal requirements, use a structured request:

> "We are undergoing DAHC Halal Certification for our [product name] product line. To complete our application we require: (1) A current Halal Certificate covering [ingredient name] from a SMIIC-recognised certification body, OR (2) A signed Halal Compliance Declaration confirming the ingredient is free from porcine, alcohol, blood, and carrion-derived substances. Please provide this documentation by [date]."

### Document Management
- Set calendar reminders **60 days before** each supplier certificate expires
- Maintain version-controlled records — DAHC auditors may ask for the previous year's documentation
- For imported ingredients, also retain the **import health certificate** showing the exporting country's Halal verification

Keep your supplier documentation binder organised — it is the single most important document set you will present at your DAHC audit.`,
          },
        ],
      },
    ],
    quiz: [
      { text: "Which E-number is derived from crushed cochineal insects?", options: ["E102", "E120", "E220", "E322"], correctIndex: 1, explanation: "E120 (Carmine/Cochineal) is derived from the female cochineal insect and is not considered Halal by most scholarly opinions." },
      { text: "Gelatine's Halal status depends primarily on:", options: ["The country of manufacture", "The source animal and whether it was Halal slaughtered", "Whether it is listed as an E-number", "The quantity used in the product"], correctIndex: 1, explanation: "The source (pork vs. beef) and whether that animal was slaughtered according to Islamic rites determines gelatine's Halal status." },
      { text: "Which type of rennet is universally accepted as Halal by SMIIC-aligned bodies?", options: ["Calf stomach rennet", "Porcine rennet", "Microbial or fermentation-derived rennet", "Synthetic chemical rennet"], correctIndex: 2, explanation: "Microbial rennet (from fungi) and fermentation-derived chymosin (FPC) are both widely available and universally accepted as Halal by DAHC and SMIIC-aligned bodies." },
      { text: "What is a Halal Critical Control Point (HCCP)?", options: ["A point in the supply chain where prices are highest", "A point in the production process where Halal compliance could fail if controls are absent", "A government checkpoint for food imports", "A monthly compliance meeting"], correctIndex: 1, explanation: "An HCCP is analogous to a HACCP CCP — a point in the process (intake, storage, production, packaging, dispatch) where Halal non-compliance could be introduced if controls fail." },
      { text: "How far in advance should you request renewal of supplier Halal certificates?", options: ["1 week before expiry", "The day of expiry", "60 days before expiry", "Only after audit failure"], correctIndex: 2, explanation: "The best practice is to request renewal 60 days before expiry to allow time for the supplier to obtain a new certificate without causing gaps in your compliance documentation." },
    ],
  },
  {
    slug: "export-markets",
    title: "Accessing GCC Export Markets",
    description: "Navigate the regulatory requirements, documentation standards, and market strategies needed to export certified Halal products to the UAE, Saudi Arabia, and Qatar.",
    category: "Business",
    level: "Advanced",
    durationLabel: "4h 45m",
    modules: [
      {
        title: "GCC Market Overview",
        lessons: [
          {
            title: "UAE, Saudi & Qatar Import Requirements",
            durationMin: 30,
            contentMd: `## GCC Import Requirements for Halal Products

The Gulf Cooperation Council (GCC) represents a combined Halal import market of approximately **USD 200 billion** annually. Each member state has distinct regulatory requirements, though mutual recognition agreements simplify multi-country market access.

### UAE — ESMA Requirements
The Emirates Authority for Standardisation & Metrology (ESMA) mandates that all food products with animal ingredients imported into the UAE bear a **Halal mark from an ESMA-approved foreign body**. Unapproved certification will result in customs seizure.

Key requirements:
- Certificate of Halal Conformity (CoHC) on every shipment
- Halal mark on retail packaging (Arabic and English)
- Certificate must be issued by a body on ESMA's approved list (updated annually)

### Saudi Arabia — SFDA Requirements
The Saudi Food and Drug Authority requires:
- Halal certificate from a **SMIIC-accredited** body or a body recognised by Saudi Arabia's Customs Authority
- Arabic-language product label with "حلال" mark
- For poultry/meat: additional **health certificate** from SFDA-approved slaughterhouse in exporting country
- Certificate of Origin from Nigerian Export Promotion Council (NEPC)

### Qatar — MOPH Requirements
Qatar's Ministry of Public Health requires Halal certificates from bodies on its approved list. Qatar has been aligning with SMIIC standards since 2022.

> **DAHC Status:** DAHC is listed in the SMIIC directory of OIC member-state certification bodies, which provides the regulatory pathway for DAHC-certified products to enter the GCC. Contact DAHC's export desk for a letter of recognition to accompany your shipment documentation.`,
          },
          {
            title: "Recognised Certification Bodies in the GCC",
            durationMin: 22,
            contentMd: `## Recognised Certification Bodies

Not all Halal certificates are accepted in all markets. Understanding which certification bodies hold recognition in your target markets is critical before investing in export.

### Mutual Recognition Architecture

SMIIC maintains a registry of OIC member-state Halal bodies. GCC countries typically accept:
1. Their own national body (strongest recognition)
2. SMIIC-registered bodies from OIC member states
3. Bilaterally agreed bodies (e.g., JAKIM-Malaysia has bilateral agreements with UAE, Saudi Arabia, Qatar)

### JAKIM (Malaysia) — Why It Matters
JAKIM holds **bilateral Halal MRAs** with over 70 countries including all GCC states. A JAKIM certificate is often the "gold standard" for export markets. However, JAKIM certifies Malaysian facilities directly — Nigerian manufacturers must work with JAKIM's international panel or obtain DAHC certification (which aligns with SMIIC/OIC frameworks).

### Practical Strategy for Nigerian Exporters

**Tier 1 Export** (ECOWAS): DAHC certificate sufficient. Regional markets (Ghana, Senegal, Côte d'Ivoire) generally accept Nigerian certification.

**Tier 2 Export** (UAE, Qatar): DAHC certificate + ESMA/MOPH approval letter. DAHC handles this on behalf of certified clients.

**Tier 3 Export** (Saudi Arabia, EU, UK): DAHC certification + bilateral verification process. Timeline: 3–6 months additional. Contact DAHC export desk early.

### Documentation Checklist for GCC Shipment
- [ ] DAHC Certificate of Conformity (original + notarised copy)
- [ ] Halal-marked commercial invoice
- [ ] Certificate of Origin (Chamber of Commerce + NEPC)
- [ ] Product label (Arabic translation if required)
- [ ] Phytosanitary/Health certificate (for animal products)`,
          },
        ],
      },
      {
        title: "Logistics & Documentation",
        lessons: [
          {
            title: "Shipping Halal Goods Internationally",
            durationMin: 26,
            contentMd: `## Shipping Halal Goods Internationally

Halal integrity must be maintained throughout the supply chain — including transport. A product that was certified Halal at production can lose its Halal status if transported improperly.

### Halal Transport Requirements

**Dedicated or Cleaned Vehicles:** Transport containers and vehicles must be free from previous Haram cargo (pork, alcohol). DAHC's logistics checklist requires a **cleaning and sterilisation declaration** from the shipping company for any vessel that previously carried non-Halal goods.

**Segregation During Transit:** Halal and non-Halal goods must not share the same refrigerated compartment without a validated physical barrier. Cold chain breaks can also trigger product rejection.

**Sealed Packaging:** Halal-certified goods should be shipped in tamper-evident, sealed cartons. Any evidence of tamper or damage at the border may trigger a mandatory Halal re-inspection.

### Freight Forwarder Selection

Choose a freight forwarder experienced in Halal commodity export. Key questions to ask:
- Do you have experience with ESMA/SFDA clearance documentation?
- Do you maintain Halal-certified cold chain facilities (for meat, dairy)?
- Can you provide a history of successful clearance through our target GCC ports?

### Ports of Entry

| Destination | Primary Port | Authority |
|---|---|---|
| UAE | Jebel Ali, Dubai | ESMA, Dubai Customs |
| Saudi Arabia | Jeddah Islamic Port | SFDA, Saudi Customs |
| Qatar | Hamad Port, Doha | MOPH Qatar |

### Insurance
Ensure your cargo insurance covers Halal-related seizure or rejection. Standard marine cargo policies may not cover regulatory non-compliance issues — discuss Halal-specific riders with your broker.`,
          },
          {
            title: "Customs Documentation Checklist",
            durationMin: 20,
            contentMd: `## Customs Documentation Checklist for Halal Exports

Incomplete documentation is the #1 cause of customs delays and cargo seizure for Nigerian Halal exporters. This checklist covers every document you need.

### Universal Documents (All GCC Markets)

- [ ] **Commercial Invoice** — must state "Halal certified" and include DAHC certificate number
- [ ] **Packing List** — detailed breakdown by product, weight, lot number
- [ ] **Bill of Lading / Airway Bill** — carrier document
- [ ] **DAHC Certificate of Conformity** — original, legible, not expired
- [ ] **Certificate of Origin** — issued by the Nigerian Chamber of Commerce and NEPC (for non-preferential origin goods)
- [ ] **Product Label Sample** — pre-approval of label by the importing country authority

### Market-Specific Additional Documents

**UAE:**
- ESMA Import Notification (filed through UAE Trade Portal 3–5 days before arrival)
- Arabic-language product label (or sticker translation)

**Saudi Arabia:**
- SFDA Product Registration (for first-time products — 60–90 day process)
- SFDA Letter of Attestation for the DAHC certificate
- Ingredients Declaration in Arabic

**Qatar:**
- MOPH Prior Approval for new products
- Qatar-specific Halal mark on packaging (if required by product category)

### Pro Tips
1. **Apostille** your DAHC certificate if shipping to countries that require notarised documents
2. Allow **30 days** for documentation preparation for first GCC shipments
3. Join the **NEPC Halal Export Programme** — they provide pre-clearance support and facilitate DAHC certificate attestation at Nigerian missions abroad

> Keep a digital archive of every submitted shipment's document set. If a customs query arises, you need to retrieve documents within 24–48 hours.`,
          },
        ],
      },
      {
        title: "Growing in the GCC",
        lessons: [
          {
            title: "Pricing for Premium Halal Markets",
            durationMin: 18,
            contentMd: `## Pricing Strategies for Premium Halal Markets

GCC consumers pay a premium for verified Halal products, but pricing must reflect the market's expectations and competition.

### The Halal Premium
Research across GCC markets documents a **5–25% willingness to pay premium** for Halal-certified products over uncertified equivalents. The premium is highest for:
- Meat and poultry (safety and slaughter assurance)
- Infant formula and baby food (purity perception)
- Cosmetics and pharmaceuticals (ingredient trust)

The premium is lowest for commodity staples where Halal is assumed (rice, plain sugar, unprocessed vegetables).

### Cost-Plus Halal Pricing Model
Start with your total landed cost (production + freight + customs + certification overhead) and add:
- Standard GCC distributor margin: 25–35%
- Retailer margin: 30–50%
- Halal premium adjustment: 5–15% on top of competitor pricing
- Currency risk buffer: 3–5% (NGN/AED volatility)

### Market Entry Strategy

**Broker/Importer Model:** Lowest risk for first entry. Find a GCC-based Halal food importer to handle local distribution. Margin share is higher but capital risk is minimised.

**Direct Distribution:** Suitable once brand is established. Requires local entity registration, warehouse in free zone (JAFZA, KIZAD for UAE), and local Halal re-inspection registration.

**Private Label/OEM:** Fastest GCC penetration. Manufacture to a GCC buyer's specifications under their brand. Lower margin but high volume and zero marketing cost.

### Building a GCC-Ready Brand
GCC consumers respond to: Arabic language branding, prominent Halal mark placement, quality certifications (ISO 22000 alongside DAHC), country-of-origin story (Nigerian spices, honey, and dried foods have strong premium positioning).`,
          },
          {
            title: "Finding GCC Buyers and Distributors",
            durationMin: 20,
            contentMd: `## Finding Buyers and Distributors in the GCC

The most common challenge for Nigerian Halal exporters is not certification or logistics — it is **finding the right buyer**. This lesson provides a structured approach.

### Trade Shows and Exhibitions

**Gulfood (Dubai, February):** The world's largest annual food and hospitality trade show. A DAHC-certified exhibitor badge enables preferential buyer introductions through DAHC's international desk. Booth costs range from USD 8,000–25,000 but ROI can be significant.

**SIAL Middle East (Abu Dhabi, November):** Focused on international food brands entering the GCC. Strong buyer-seller matchmaking programme.

**Saudi Food Show (Riyadh, March):** Mandatory for Saudi market penetration. Saudi distributors strongly prefer to meet suppliers in-country before placing orders.

### NEPC and Trade Attachés
The **Nigerian Export Promotion Council** maintains trade attachés in UAE, Saudi Arabia, and Qatar embassies. Request introductions to importer networks — this service is free for NEPC-registered exporters.

### Digital Platforms for B2B Sourcing
- **Tradekey.com** and **EC21.com**: Widely used by GCC importers sourcing African food products
- **LinkedIn:** Many GCC food importers and purchasing directors are active; search for "Halal food importer [country]"
- **SMIIC Business Directory:** Lists OIC member-state certified businesses — GCC buyers use this to find verified suppliers

### Due Diligence on Buyers
Before committing to a distribution agreement:
- Verify the buyer's trade licence (DED for UAE, MOCI for Saudi Arabia)
- Request bank references and credit history
- Use **Letter of Credit (LC)** for first shipments, not open account
- Engage a local legal counsel for distribution agreement review

> DAHC's Business Support Desk offers a **GCC Market Entry Consultation** for certified companies at no cost. Contact us through your portal profile.`,
          },
        ],
      },
    ],
    quiz: [
      { text: "Which UAE authority maintains the approved list of foreign Halal certification bodies?", options: ["SFDA", "ESMA", "MOPH", "JAKIM"], correctIndex: 1, explanation: "ESMA (Emirates Authority for Standardisation & Metrology) maintains the UAE's approved list of foreign Halal certification bodies." },
      { text: "What certificate is required from the Nigerian Chamber of Commerce for GCC exports?", options: ["Halal Certificate", "Certificate of Origin", "Phytosanitary Certificate", "NAFDAC Certificate"], correctIndex: 1, explanation: "A Certificate of Origin (from the Nigerian Chamber of Commerce and NEPC) is required for all GCC exports to confirm the goods were produced in Nigeria." },
      { text: "In which city is Gulfood, the world's largest annual food trade show, held?", options: ["Riyadh", "Doha", "Dubai", "Abu Dhabi"], correctIndex: 2, explanation: "Gulfood is held annually in February in Dubai, UAE, and is the world's largest annual food and hospitality trade show." },
      { text: "What pricing model buffer accounts for NGN/AED exchange rate volatility?", options: ["Halal premium", "Currency risk buffer", "Distributor margin", "Customs duty reserve"], correctIndex: 1, explanation: "A currency risk buffer (typically 3–5%) should be added to export pricing to account for NGN/AED volatility between order placement and payment." },
      { text: "For first GCC shipments, which payment method is recommended to reduce buyer default risk?", options: ["Open account (30 days)", "Advance payment only", "Letter of Credit (LC)", "Cash on delivery"], correctIndex: 2, explanation: "A Letter of Credit (LC) is recommended for first shipments as it ensures payment is guaranteed by the buyer's bank once shipping documents are presented, protecting against non-payment." },
    ],
  },
  {
    slug: "halal-audit",
    title: "Halal Audit & HACCP Integration",
    description: "Prepare for, conduct, and document a DAHC on-site Halal audit. Integrate Halal Critical Control Points with your existing HACCP and food safety management systems.",
    category: "Operations",
    level: "Advanced",
    durationLabel: "6h 30m",
    modules: [
      {
        title: "Audit Fundamentals",
        lessons: [
          {
            title: "Pre-Audit Preparation",
            durationMin: 24,
            contentMd: `## Pre-Audit Preparation

The DAHC on-site audit is not a surprise inspection — it is a planned, collaborative assessment. Companies that prepare thoroughly consistently receive faster certification with fewer Non-Conformance Reports (NCRs).

### 8 Weeks Before the Audit

- [ ] Confirm audit date with DAHC inspector
- [ ] Appoint your **Halal Internal Auditor (HIA)** — the primary contact for the inspector
- [ ] Conduct a **pre-audit gap assessment** using DAHC's self-assessment checklist (available in your portal)
- [ ] Update your Ingredient Register and ensure all supplier Halal certificates are current

### 4 Weeks Before the Audit

- [ ] Prepare your **HCCP matrix** — a table mapping each production step to its Halal risk and control measure
- [ ] Verify equipment cleaning records are complete and signed
- [ ] Ensure staff aware of Halal protocols (brief all production line workers before the audit date)
- [ ] Arrange access to all areas the inspector will visit: intake store, production floor, packaging area, finished goods store, laboratory

### 1 Week Before the Audit

- [ ] Prepare your **Halal File** in order:
  1. DAHC application acknowledgement letter
  2. Company profile and site layout
  3. Master Ingredient Register with certificates
  4. HCCP matrix and monitoring logs
  5. Cleaning and sanitation records
  6. Staff training records (Halal awareness)
  7. Pest control log
  8. Latest internal audit report

> **The auditor will follow the product flow**: raw material arrival → storage → production → packaging → finished goods storage. Walk this route yourself before the audit and check every touchpoint for compliance.`,
          },
          {
            title: "On-Site Audit Walkthrough",
            durationMin: 28,
            contentMd: `## On-Site Audit: What to Expect

The DAHC on-site audit typically takes **4–8 hours** depending on facility size and product complexity. Understanding each phase helps you prepare effectively.

### Phase 1: Opening Meeting (30–60 min)
The lead inspector introduces themselves, confirms the audit scope, and reviews your application summary. Be prepared to present:
- Your Halal Organisational Chart (who is responsible for Halal compliance?)
- Summary of products in scope
- Any changes since the last audit (or since application for new applicants)

### Phase 2: Document Review (60–120 min)
Inspector reviews your Halal File. Common findings at this stage:
- Expired supplier certificates (most common NCR)
- Missing enzyme or processing aid documentation
- Incomplete HCCP monitoring logs

**Bring:** All original supplier Halal certificates, purchase orders for key ingredients, and cleaning records.

### Phase 3: Production Floor Inspection (90–180 min)
Inspector observes a live production run or reviews the idle facility:
- Checks for Haram ingredient storage in the same cold room as Halal ingredients
- Inspects equipment for signs of cross-contamination
- Checks for dedicated Halal utensils (colour coding)
- Reviews staff practices (handwashing, protective clothing compliance)
- Verifies Halal signage is posted at HCCPs

### Phase 4: Packaging and Labeling Review (30 min)
- Confirms Halal mark on approved artworks
- Verifies DAHC certificate number on labels matches active certificate
- Checks lot coding and traceability

### Phase 5: Closing Meeting (30 min)
Inspector presents preliminary findings. NCRs are discussed. A correction timeline is agreed. **You will receive the formal Audit Report within 5 working days.**`,
          },
        ],
      },
      {
        title: "Integrating with HACCP",
        lessons: [
          {
            title: "Identifying Halal Critical Control Points",
            durationMin: 26,
            contentMd: `## Halal Critical Control Points (HCCPs)

Halal Critical Control Points (HCCPs) are borrowed directly from the HACCP (Hazard Analysis and Critical Control Points) methodology — but instead of biological, chemical, or physical hazards, they focus on Halal integrity hazards.

### HACCP vs. HCCP

| HACCP CCP | HCCP Equivalent |
|---|---|
| Biological hazard (pathogen) | Najis contamination (pork protein, blood) |
| Chemical hazard (pesticide) | Haram additive (alcohol-based input) |
| Physical hazard (metal) | Cross-contamination during non-Halal equipment sharing |

### Mapping Your HCCPs

**Step 1: List all process steps** (use a flow diagram)

**Step 2: For each step, ask:** "Could a Halal integrity failure occur here if controls are absent?"

**Step 3: Assign control measures** and monitoring procedures

### Example HCCP Matrix — Food Manufacturer

| Process Step | Halal Hazard | Control Measure | Monitoring Frequency |
|---|---|---|---|
| Ingredient intake | Non-Halal ingredient delivered in error | Supplier cert check + label verification | Every delivery |
| Cold storage | Cross-contamination from stored pork | Dedicated Halal storage zone | Daily inspection |
| Mixing | Haram processing aid in mixing vessel | Approved ingredient list only + pre-use check | Each batch |
| Cleaning between runs | Residual Haram product | Validated CIP protocol + rinse test | Each cleaning cycle |
| Packaging | Wrong packaging (non-Halal label on Halal product) | Label reconciliation | Each production run |

### HCCP Monitoring Records

For each HCCP, maintain a **daily/batch monitoring log** with:
- Date/Time
- Operator signature
- Result (Pass/Fail)
- Corrective action taken if Fail

DAHC auditors will request 6–12 months of HCCP monitoring records at the annual surveillance audit.`,
          },
          {
            title: "Aligning with ISO 22000",
            durationMin: 22,
            contentMd: `## Aligning Halal Compliance with ISO 22000

ISO 22000 (Food Safety Management Systems) and Halal certification share significant overlap in their requirements for documentation, process control, and management commitment. Companies already holding ISO 22000 certification have a significant head start in the DAHC audit process.

### Synergies Between ISO 22000 and DAHC

| ISO 22000 Requirement | DAHC Parallel |
|---|---|
| Hazard Analysis (HACCP) | Halal Critical Control Point Analysis |
| Supplier Approval Programme | Halal Supplier Qualification |
| Management Review | Halal Management Review (annual) |
| Internal Audit | Halal Internal Audit (semi-annual) |
| Corrective Action | NCR Corrective Action Response |
| Document Control | Halal File Management |
| Traceability | Halal Lot Traceability |

### Integration Strategy

**If you already have ISO 22000:**
1. Add Halal-specific hazards to your existing HACCP study
2. Add Halal compliance criteria to your Supplier Qualification Procedure
3. Appoint a Halal Internal Auditor (may be the same person as your Food Safety Team Leader)
4. Add a Halal Review agenda item to your existing Management Review meetings

**If you don't have ISO 22000:**
Consider pursuing both certifications together — the documentation infrastructure required is largely identical. DAHC can recommend ISO consultants who specialise in combined Halal + ISO 22000 implementations.

### FSSC 22000 and Halal
FSSC 22000 (the GFSI-benchmarked food safety scheme) added a **Halal Module** in version 5.1. Companies certified to FSSC 22000 + Halal Module have the most streamlined path to DAHC certification.

> Ask your DAHC account manager about the **combined audit pathway** if you are pursuing multiple certifications simultaneously.`,
          },
        ],
      },
      {
        title: "Continuous Compliance",
        lessons: [
          {
            title: "Internal Audit Scheduling",
            durationMin: 18,
            contentMd: `## Setting Up a Halal Internal Audit Programme

A robust internal audit programme catches compliance gaps before the DAHC inspector arrives. Companies with active internal audit programmes typically resolve 80–90% of potential NCRs before the external audit.

### Who Conducts the Internal Audit?

The **Halal Internal Auditor (HIA)** must be:
- A company employee (or retained consultant)
- Trained in Halal requirements (a DAHC-approved training course or equivalent)
- Independent of the production line they are auditing (auditors should not audit their own work)

### Audit Frequency

| Audit Type | Frequency | Scope |
|---|---|---|
| Document Review | Monthly | Supplier cert expiry check, HCCP log completeness |
| Process Walkthrough | Quarterly | HCCP monitoring, equipment cleanliness, staff practices |
| Full Internal Audit | Semi-annually | Complete simulation of DAHC external audit |

### Internal Audit Report Format

Your internal audit report should mirror the DAHC external audit report structure:
1. **Scope** — products and processes audited
2. **Findings by Category** — Ingredients, Process, Labeling, Training, Documentation
3. **Non-Conformances** — with severity rating (Major / Minor)
4. **Corrective Actions** — assigned to named individuals with due dates
5. **Sign-off** — HIA signature + management representative signature

### Common Internal Audit Findings

The following issues appear most frequently in DAHC pre-audits:
- Supplier Halal certificate expired for 1+ ingredients (60% of audits)
- HCCP monitoring logs not filled in consistently (45%)
- Cleaning records missing inspector signatures (35%)
- Staff unaware of HCCP locations on the production floor (25%)

Identifying and resolving these before the external audit is the primary value of the internal audit programme.`,
          },
          {
            title: "Corrective Action Procedures",
            durationMin: 20,
            contentMd: `## Corrective Action: From NCR to Closure

A Non-Conformance Report (NCR) from a DAHC audit is not a rejection — it is a formal record of a compliance gap that must be addressed. Understanding the NCR process and responding effectively is critical.

### NCR Severity Levels

**Major NCR:** A finding that indicates a fundamental breakdown in Halal integrity. Examples:
- Haram ingredient found in production
- Shared equipment with confirmed pork contamination
- Falsified supplier documentation

A Major NCR **suspends the certification process** (or triggers certificate suspension for existing certified companies) until the finding is resolved and re-verified.

**Minor NCR:** A documentation or procedural gap that does not indicate actual Halal contamination but represents a risk if not corrected. Examples:
- Expired supplier certificate (product itself is from a Halal source, certificate simply lapsed)
- HCCP monitoring log with gaps (process was actually controlled, just not documented)
- Missing training record

Minor NCRs have a **30-day correction window**. Evidence of corrective action submitted through the DAHC portal.

### Corrective Action Response (CAR) Structure

When submitting a CAR:
1. **Root Cause:** What caused the non-conformance? (Be specific — "human error" is not sufficient)
2. **Immediate Containment:** What was done immediately to prevent further non-compliance?
3. **Corrective Action:** What systemic change was made to prevent recurrence?
4. **Evidence:** Attach documentary proof (updated procedure, training record, new supplier certificate, corrected monitoring log)
5. **Effectiveness Review Date:** When will you verify the correction has been sustained?

> A well-written CAR demonstrates competence to DAHC and typically accelerates the verification process. A vague CAR with no systemic corrective action almost always results in a follow-up inspection visit.`,
          },
        ],
      },
    ],
    quiz: [
      { text: "What is the primary role of a Halal Internal Auditor (HIA)?", options: ["To certify products as Halal", "To identify and address Halal compliance gaps before the external DAHC audit", "To approve new ingredient purchases", "To conduct customer surveys"], correctIndex: 1, explanation: "The HIA conducts internal audits to identify compliance gaps before the DAHC external audit, giving the company the opportunity to correct issues proactively." },
      { text: "What is the most common NCR finding in DAHC pre-audits?", options: ["Haram ingredients in production", "Expired supplier Halal certificates", "Missing pest control records", "Incorrect product labeling"], correctIndex: 1, explanation: "Expired supplier Halal certificates appear in approximately 60% of DAHC pre-audits — the most common and most easily preventable finding." },
      { text: "Which ISO standard has the most overlap with DAHC Halal certification requirements?", options: ["ISO 9001", "ISO 14001", "ISO 22000", "ISO 45001"], correctIndex: 2, explanation: "ISO 22000 (Food Safety Management Systems) shares significant overlap with DAHC requirements including HACCP, supplier management, documentation control, and internal audit." },
      { text: "A Major NCR during a DAHC audit results in:", options: ["An automatic rejection of the application", "Suspension of the certification process until resolved", "A 30-day window to provide corrective action evidence", "An immediate re-audit"], correctIndex: 1, explanation: "A Major NCR suspends the certification process (or triggers certificate suspension for existing certified companies) until the finding is resolved and independently verified." },
      { text: "At which HCCP is an expired supplier Halal certificate most likely to be identified?", options: ["Packaging", "Ingredient intake", "Finished goods storage", "Cleaning between runs"], correctIndex: 1, explanation: "Ingredient intake is the first control point — supplier certificates should be checked against the register at every delivery. This is where expired certificates are caught before non-compliant ingredients enter production." },
    ],
  },
  {
    slug: "cosmetics-halal",
    title: "Halal Cosmetics Standards",
    description: "Understand the unique challenges of Halal compliance for cosmetics and personal care products, including ingredient screening, alcohol use rules, and labeling requirements.",
    category: "Cosmetics",
    level: "Intermediate",
    durationLabel: "2h 55m",
    modules: [
      {
        title: "Standards Overview",
        lessons: [
          {
            title: "Introduction to MS 2200 & SMIIC 4",
            durationMin: 20,
            contentMd: `## Halal Cosmetics Standards: MS 2200 and SMIIC 4

Halal cosmetics compliance is governed by two primary international standards:

### MS 2200 (Malaysia)
Malaysia's **MS 2200** series (published by SIRIM) is the world's first comprehensive Halal cosmetics standard and remains the most widely referenced. It covers:
- **Part 1:** General requirements (ingredients, manufacturing)
- **Part 2:** Cosmetics and personal care products

MS 2200 explicitly addresses the **alcohol question** — distinguishing between ethanol (Haram) and fatty alcohols like cetyl and stearyl alcohol (Halal, plant-derived).

### SMIIC 4 (OIC International)
The **OIC/SMIIC 4** standard for Halal cosmetics aligns with MS 2200 but provides the international framework applicable across all 57 OIC member states, including Nigeria. DAHC certifies cosmetics companies against SMIIC 4.

### Key Prohibited Inputs (SMIIC 4)
- Pork-derived ingredients (lard, porcine collagen, pork placenta)
- Human-derived ingredients (human placenta, human hair keratin)
- Alcohol (ethanol) above permitted thresholds
- Najas substances (blood, urine-derived)
- Animal testing ingredients (varies by market — EU cosmetics ban overlaps here)

### Permitted Animal-Derived Ingredients
The following are **Halal** when properly sourced and documented:
- Beeswax (E901) — from Halal-compliant beekeeping
- Lanolin — from wool of living sheep (not slaughtered)
- Honey — pure, no additives
- Hyaluronic acid — if from microbial fermentation (not rooster combs)
- Collagen — if from certified Halal bovine source

> DAHC issues separate certificates for cosmetics companies. The SMIIC 4-aligned certificate is accepted in UAE (ESMA), Saudi Arabia, and Qatar for cosmetics import compliance.`,
          },
          {
            title: "Halal Cosmetics Certification Process",
            durationMin: 18,
            contentMd: `## The Cosmetics Certification Process at DAHC

Halal cosmetics certification follows the same 15-stage DAHC workflow as food certification but with a specialist Technical Review Committee (TRC) for cosmetic formulations.

### Key Differences from Food Certification

**Formulation Review:** For cosmetics, every ingredient — including trace-level ingredients — undergoes INCI (International Nomenclature of Cosmetic Ingredients) review. The TRC maintains a database of INCI names mapped to Halal/Haram status.

**Lab Testing:** DAHC may require **gas chromatography (GC)** testing for finished products to verify alcohol content and screen for undeclared animal-derived fatty acids.

**Manufacturing Site Audit:** Focus areas for cosmetics differ from food:
- Contamination from shared processing equipment (filling lines used for alcohol-based and non-alcohol products)
- Cleaning validation for equipment switching
- Storage segregation of Haram inputs (nail polish remover, perfumes with ethanol)

### Labeling for Halal Cosmetics

Halal-certified cosmetics must display:
- DAHC Halal mark (logo provided by DAHC after certification)
- Certificate number (DAHC/CERT/YY/XXXXXX)
- "Certified Halal" statement (English) or equivalent in target market language

**Tip:** Avoid the phrase "alcohol-free" on packaging unless you have tested for ALL alcohol types. "Ethanol-free" is more specific and defensible. Many cosmetics contain fatty alcohols which are Halal but technically "alcohols."

### DAHC Cosmetics Certificate
A DAHC cosmetics certificate specifies:
- Company and manufacturing site
- Product names covered (each SKU must be listed)
- Validity period (2 years)
- Applicable standard (OIC/SMIIC 4)`,
          },
        ],
      },
      {
        title: "Ingredients to Watch",
        lessons: [
          {
            title: "Animal-Derived Cosmetic Ingredients",
            durationMin: 22,
            contentMd: `## Animal-Derived Cosmetic Ingredients

Cosmetics and personal care products use a wide range of animal-derived ingredients, many of which are not obvious from their INCI names. This lesson provides a reference guide.

### High-Risk Animal-Derived Ingredients (Haram or Suspect)

| INCI Name | Source | Halal Status | Alternative |
|---|---|---|---|
| Lard (Adeps Suillus) | Pork fat | **Haram** | Shea butter, coconut oil |
| Porcine Collagen | Pig skin | **Haram** | Plant collagen (hydrolysed wheat protein), microbial HA |
| Carmine (CI 75470) | Cochineal insects | **Haram** (majority opinion) | Iron oxides, beet root powder |
| Placenta Extract (Sus scrofa) | Pig placenta | **Haram** | Plant stem cell extracts |
| Stearic Acid (non-specified) | May be tallow (beef/pork) | **Suspect** | Vegetable stearic acid |
| Glycerol (non-specified) | May be rendered animal fat | **Suspect** | Palm or rapeseed glycerol |

### Conditionally Halal Animal Ingredients

| INCI Name | Condition for Halal |
|---|---|
| Lanolin | From living wool-bearing animals; no slaughter |
| Beeswax (Cera Alba) | No fermentation-derived adulterants |
| Hyaluronic Acid | Confirm microbial (not rooster comb) sourcing |
| Collagen / Hydrolysed Collagen | Bovine source + Halal slaughter certificate |
| Keratin | Human hair source = **Haram**; wool-derived = Halal |
| Silk (Serica) | Silkworm cocoon; scholarly difference of opinion — confirm with DAHC TRC |

### Practical Screening Tip
When reviewing a cosmetic formula, start by screening all INCI names against this list. Flag any "suspect" ingredients and request supplier origin documentation before proceeding to the DAHC application.`,
          },
          {
            title: "Alcohol in Cosmetics: What's Permissible",
            durationMin: 18,
            contentMd: `## Alcohol in Cosmetics: Navigating the Rules

Alcohol in cosmetics is one of the most frequently misunderstood aspects of Halal cosmetics compliance. Not all "alcohols" are prohibited — and the rules vary between scholarly opinions and certification bodies.

### Types of Alcohol in Cosmetics

**Ethanol (Ethyl Alcohol):**
The primary concern. Ethanol is the same alcohol found in alcoholic beverages. Under Hanafi fiqh (the dominant school in Nigeria and South Asia), ethanol is a Najis substance and is **Haram** in cosmetics applied to the body.

**Fatty Alcohols:**
Cetyl alcohol, stearyl alcohol, cetearyl alcohol, behenyl alcohol — these are **not** related to ethanol. They are long-chain carbon molecules derived from plant fats. They are **Halal** and widely used as emulsifiers and moisturising agents in cosmetics.

**Benzyl Alcohol (Preservative E1519):**
A synthetic alcohol used as a preservative. Under SMIIC 4, benzyl alcohol is **permitted** in cosmetics at permitted usage levels (typically < 1%) as it is not intoxicating and is not derived from fermentation.

### The Threshold Question

DAHC's position aligns with SMIIC 4: **ethanol must not be present above naturally occurring levels** in Halal cosmetics. Naturally occurring means: trace fermentation by-products in plant extracts at levels undetectable by standard GC testing (typically < 0.5% w/w).

Products formulated with ethanol as a functional ingredient (as a solvent, preservative, or penetration enhancer above 0.5%) are **not certifiable** under DAHC's current standard.

### Fragrance / Parfum
Fragrances often contain ethanol as a carrier. For Halal certification, request a **fragrance declaration** confirming the fragrance compound is free from ethanol, or use only solid fragrance compounds or oil-based fragrances.`,
          },
        ],
      },
      {
        title: "Certifying a Cosmetics Line",
        lessons: [
          {
            title: "Documentation Required for Cosmetics",
            durationMin: 16,
            contentMd: `## Documentation Required for Halal Cosmetics Certification

Cosmetics certification requires more detailed formulation documentation than food certification because ingredients are often proprietary and INCI names can mask multiple source options.

### Required Documents at Application

1. **Full Ingredient List (INCI format)** for every product in scope
   - Listing must include: INCI name, trade name, supplier, concentration range, source (plant/animal/synthetic)

2. **Halal Compliance Letters** from ingredient suppliers for all animal-derived or suspect ingredients

3. **Safety Data Sheets (SDS)** for raw materials

4. **Manufacturing Process Description** — step-by-step production process including cleaning procedures

5. **Certificate of Analysis (CoA)** for finished products — batch records demonstrating consistent formulation

6. **Fragrance Ingredient Declaration** — full disclosure of fragrance compound components (many suppliers provide this under NDA)

7. **Labeling Artwork (PDF)** — all product labels for DAHC design review

8. **GMP Certificate or Compliance Statement** — evidence of Good Manufacturing Practice compliance (ISO 22716 preferred)

### DAHC Cosmetics Application Form

The AP/AF/01C (Cosmetics version) is available on your DAHC portal. Key additional sections vs. the food form:
- Product-by-product INCI listing (attachment)
- Statement on alcohol use policy
- Confirmation of no animal testing (required for EU-destined products)
- Batch coding system description (for traceability)

> **Tip:** Organise your documentation by product SKU. For a brand with 20 products, DAHC auditors need to trace every ingredient for every product. A well-organised submission significantly reduces review time.`,
          },
          {
            title: "Label Compliance and Market-Specific Rules",
            durationMin: 14,
            contentMd: `## Cosmetics Label Compliance for Halal Markets

Once certified, your product labels must display the correct Halal claims and marks. Each export market may have additional requirements on top of the DAHC certificate.

### DAHC Halal Mark Guidelines

**Position:** Front of pack, clearly visible. Minimum size: 10mm diameter.

**Required elements on label:**
- DAHC Halal logo (download from your portal)
- Certificate number: DAHC/CERT/YY/XXXXXX
- "Certified Halal" text (English) — additional languages as required by market

**Prohibited claims:**
- "100% Halal" (absolute claims not permitted — DAHC certifies compliance to SMIIC 4, not an absolute)
- "Suitable for Muslims" without the actual Halal certificate reference

### UAE — ESMA Cosmetics Labeling
For UAE market:
- Arabic product name and description mandatory
- Arabic translation of ingredient list
- Halal mark from ESMA-approved body
- "Made in Nigeria" (country of origin) in Arabic

### Saudi Arabia — SFDA Cosmetics
- Product registration through SFDA's Halal e-Portal required before sale
- Arabic full-label compliance (all text in Arabic)
- Batch/lot number and manufacturing date on label

### Malaysia — Halal Mark Placement
Malaysia's KKM (Ministry of Health) requires that the Halal mark not be placed on products with multiple functions (e.g., a cream claiming both cosmetic and medicinal benefits) without NPRA (pharmaceutical) clearance as well.

> Keep a record of which version of your label artwork received DAHC approval — any label change must be submitted for DAHC review before going to print.`,
          },
        ],
      },
    ],
    quiz: [
      { text: "Which international standard does DAHC use for Halal cosmetics certification?", options: ["MS 2200", "OIC/SMIIC 4", "ISO 22716", "EU Cosmetics Regulation"], correctIndex: 1, explanation: "DAHC certifies cosmetics companies against OIC/SMIIC 4 — the international standard applicable across OIC member states, aligned with Malaysia's MS 2200." },
      { text: "Cetyl alcohol in a cosmetics formulation is:", options: ["Haram — all alcohol is forbidden", "Halal — it is a fatty alcohol, not ethanol", "Suspect — requires additional documentation", "Only Halal if below 1% concentration"], correctIndex: 1, explanation: "Cetyl, stearyl, and cetearyl alcohols are long-chain plant-derived molecules — not related to ethanol. They are fully Halal." },
      { text: "Which ingredient is considered Haram in cosmetics by DAHC due to its insect origin?", options: ["Beeswax", "Lanolin", "Carmine (CI 75470)", "Hyaluronic Acid"], correctIndex: 2, explanation: "Carmine (CI 75470, also called Cochineal or E120) is derived from crushed female cochineal insects and is considered Haram by the majority scholarly opinion." },
      { text: "For Halal cosmetics, ethanol is permissible at what level?", options: ["Up to 10% w/w", "Up to 5% w/w", "Only at naturally occurring trace levels (typically below 0.5%)", "It is never permitted in any amount"], correctIndex: 2, explanation: "Under SMIIC 4 and DAHC's standard, ethanol must not be present above naturally occurring trace levels (typically undetectable or below 0.5% w/w from plant extracts) — any intentionally added ethanol disqualifies the product." },
      { text: "What document must be submitted for fragrance compounds to achieve Halal cosmetics certification?", options: ["A NAFDAC registration", "A fragrance declaration confirming absence of ethanol and Haram ingredients", "An ISO 22716 certificate", "A GCC import permit"], correctIndex: 1, explanation: "A fragrance ingredient declaration from the fragrance supplier — confirming the compound is free from ethanol and Haram substances — is required by DAHC for products containing parfum/fragrance." },
    ],
  },
  {
    slug: "logistics-chain",
    title: "Halal Supply Chain Management",
    description: "Build and maintain a Halal-compliant supply chain from farm to shelf, covering segregation, cold chain, warehouse management, and multi-tier supplier vetting.",
    category: "Logistics",
    level: "Intermediate",
    durationLabel: "3h 40m",
    modules: [
      {
        title: "Supply Chain Integrity",
        lessons: [
          {
            title: "Farm-to-Shelf Halal Traceability",
            durationMin: 24,
            contentMd: `## Farm-to-Shelf Halal Traceability

Halal integrity is only as strong as the weakest link in your supply chain. A DAHC-certified product that uses non-certified inputs from an unverified supplier is non-compliant, regardless of what your label says.

### The Traceability Requirement

DAHC auditors must be able to trace a finished product back to its raw material sources. This means for every lot of product you ship, you must be able to answer:
- Which lot of each ingredient was used?
- Who was the supplier?
- Was that supplier's Halal certificate valid at the time of purchase?
- Where was the raw material stored before use, and was it segregated from non-Halal materials?

### Building a Lot Traceability System

**Minimum requirement:** A batch record system linking each production batch to specific raw material lot numbers. Can be paper-based for small businesses.

**Recommended:** A digital inventory system (even a simple Excel template) that records:
- Goods received: date, supplier, lot number, Halal cert number, expiry
- Goods issued to production: date, batch number, lots used
- Finished goods: lot number, production date, ingredients used

### Tier 1 vs Tier 2 Suppliers

| Supplier Tier | Description | Documentation Required |
|---|---|---|
| Tier 1 | Your direct supplier | Full Halal cert + origin declaration |
| Tier 2 | Your supplier's supplier | Encourage Tier 1 to obtain Tier 2 declarations |
| Tier 3+ | Deep in supply chain | Beyond typical DAHC audit scope, but risk-assess |

> **The 2024 DAHC audit finding report** identified Tier 2 supplier non-compliance as the fastest-growing source of NCRs. Always ask your key ingredient suppliers: "Where do your raw materials come from?"`,
          },
          {
            title: "Segregation in Warehousing",
            durationMin: 20,
            contentMd: `## Warehousing and Segregation for Halal Compliance

Physical segregation of Halal and non-Halal goods in warehousing is a fundamental HCCP. Even if a warehouse stores mainly Halal goods, the presence of any non-Halal product creates a cross-contamination risk.

### The DAHC Segregation Standard

DAHC requires that Halal raw materials and finished goods are physically separated from:
- Products containing pork or pork derivatives
- Products containing ethanol above permitted thresholds
- Non-certified products awaiting Halal status determination

### Acceptable Segregation Methods

**Dedicated Warehouse / Zone:** Best practice. A physically walled or fenced area used exclusively for Halal goods. Separate access control.

**Dedicated Racking / Shelving:** In a mixed warehouse, Halal goods occupy clearly marked, labelled shelving bays. Non-Halal products must not be stored above Halal products (spillage risk).

**Temporal Segregation:** Non-Halal goods are never present in the warehouse at the same time as Halal goods. Requires validated empty-warehouse procedure between runs. Auditors will request the log.

### Colour-Coding System

DAHC recommends a warehouse colour-coding system:
- **Green** labels/pallets: Halal-certified, approved for use
- **Yellow** labels/pallets: Pending Halal verification
- **Red** labels/pallets: Non-Halal or Haram — isolated and segregated

### Warehouse HCCP Controls

At minimum, implement:
1. Daily stock check confirming no Haram products in Halal zones
2. Separate refrigeration for Halal meat/poultry products
3. Pest control records (bait stations must not contaminate food — use sealed, tamper-resistant bait boxes away from product)
4. Visitor log (external visitors to the Halal zone must be briefed on Halal protocol)`,
          },
        ],
      },
      {
        title: "Cold Chain & Transport",
        lessons: [
          {
            title: "Cold Chain Requirements for Halal Goods",
            durationMin: 22,
            contentMd: `## Cold Chain Requirements for Halal Products

Temperature-sensitive Halal products (meat, poultry, dairy, seafood, ready-to-eat meals) require a documented cold chain that maintains both product safety and Halal integrity throughout the distribution network.

### Cold Chain Halal Risks

Unlike ambient temperature products, cold chain products face additional Halal risks:
1. **Shared refrigerated transport** with non-Halal products (cross-contamination)
2. **Temperature breaks** that could accelerate spoilage (food safety, but also affect Halal audit trail if product condition is questionable)
3. **Third-party cold storage** facilities that may not have Halal-compliant segregation

### DAHC Cold Chain Requirements

**Refrigerated Transport:**
- Vehicle must be either: (a) dedicated to Halal goods only, or (b) cleaned and sanitised between Halal and non-Halal loads with a documented cleaning record
- Temperature logging required from loading to delivery (data logger or manual log every 4 hours)

**Third-Party Cold Storage:**
- Request a **Halal Compliance Declaration** from cold store operators confirming they maintain Halal segregation practices
- DAHC auditors may request to inspect third-party cold stores as part of the supply chain audit

**Maximum Temperature Thresholds:**
- Fresh Halal meat: ≤ 4°C throughout
- Frozen Halal products: ≤ -18°C
- Chilled dairy: ≤ 8°C

### Temperature Excursion Procedure

If a temperature excursion is discovered:
1. **Segregate** the affected lot immediately
2. **Assess** whether Halal integrity has been compromised (separate from food safety assessment)
3. **Do not release** to market without QA sign-off
4. **Document** the excursion, investigation, and disposition decision
5. **Report** to DAHC within 24 hours if the lot has already been dispatched with a Halal claim`,
          },
          {
            title: "Selecting Halal-Compliant Transport Partners",
            durationMin: 20,
            contentMd: `## Selecting and Vetting Halal-Compliant Transport Partners

Your logistics partners are an extension of your Halal supply chain. Their vehicles, drivers, and loading practices directly affect the Halal integrity of your product.

### Transport Partner Qualification Checklist

Before appointing a transport partner for Halal goods, verify:

- [ ] **Vehicle History:** Has the vehicle recently transported pork, alcohol, or other Haram goods? If yes, was a validated Halal cleaning (samak) procedure conducted?
- [ ] **Driver Awareness:** Are drivers briefed on Halal integrity requirements? (Do not eat, smoke, or consume alcohol in the delivery vehicle; do not allow unauthorised loading)
- [ ] **Segregation Practice:** Can the carrier guarantee dedicated Halal space during multi-drop deliveries?
- [ ] **GPS Tracking:** For high-value Halal shipments, GPS tracking verifies the vehicle did not make unauthorised stops
- [ ] **Halal Certification:** Some major logistics companies (DHL, Aramex) hold Halal logistics certification — prefer these where available

### Halal Cleaning of Vehicles (Samak)

If a vehicle must be reused after transporting Haram goods, the Islamic purification procedure (samak) requires:
1. Remove all physical traces of the Haram substance
2. Wash thoroughly with water three times (or seven times with the first wash using soil/detergent, per strict Shafi'i opinion)
3. Document the procedure in writing

DAHC accepts a simplified cleaning validation: documented commercial deep-clean by a third-party cleaning company, with a declaration that no Haram residues remain.

### Halal Logistics Partners in Nigeria

Several logistics companies in Nigeria have adopted Halal transport protocols. Ask your DAHC account manager for the current recommended partner list — this is updated quarterly based on audit feedback from DAHC-certified companies.`,
          },
        ],
      },
      {
        title: "Working with Partners",
        lessons: [
          {
            title: "Vetting Halal-Compliant Logistics Partners",
            durationMin: 18,
            contentMd: `## Multi-Tier Partner Vetting Programme

For companies with complex supply chains — importers, contract manufacturers, distributors — a structured partner vetting programme is essential for maintaining Halal certification.

### The Approved Supplier / Partner List (ASL)

Maintain a single register of all supply chain partners:

| Partner | Type | Halal Cert # | Cert Expiry | DAHC Verified | Review Date |
|---|---|---|---|---|---|
| Agro Input Ltd | Ingredient supplier | IFANCA-2025-0312 | Dec 2026 | Yes | Jan 2026 |
| SwiftLogix NG | Transport | N/A (declaration) | Annual | Yes | Mar 2026 |
| ColdStore Central | Warehouse | DAHC/CERT/26/000044 | Apr 2027 | Yes | Apr 2026 |

Review this register **quarterly** — update any expired certifications and re-qualify partners whose circumstances have changed.

### On-Site Partner Audits

For critical partners (your primary ingredient supplier, exclusive contract manufacturer), conduct an **annual on-site visit**:
- Does their facility match what was declared on their Halal application?
- Are their segregation practices actually implemented (not just documented)?
- Have there been any production changes affecting Halal compliance?

Document findings in your audit report and retain for DAHC surveillance visits.

### Partner Non-Conformance Protocol

If a partner fails your internal audit:
1. Issue a Supplier Corrective Action Request (SCAR) with a 30-day response deadline
2. Evaluate whether product supplied during the non-conformance period is still Halal (product recall may be necessary)
3. If the partner cannot correct, replace them and update your ASL

> A Halal supply chain is only as strong as your ongoing management of it. DAHC auditors increasingly evaluate partner management as part of the surveillance audit, not just your own facility.`,
          },
          {
            title: "Audit Trails Across the Supply Chain",
            durationMin: 16,
            contentMd: `## Building and Maintaining Audit Trails

An audit trail is the documentary chain of evidence that proves Halal compliance at every step from raw material to finished product delivery. It is the backbone of your certification.

### What Constitutes an Audit Trail?

A complete Halal audit trail for a single finished product lot includes:

1. **Incoming goods record** — supplier, lot number, delivery date, Halal cert reference, approved by HIA
2. **Storage record** — location in Halal zone, temperature log (if applicable), pest control compliance
3. **Production batch record** — date, batch number, ingredients used (with lot numbers), processing steps, HCCP monitoring sign-offs
4. **Cleaning record** — last cleaning before the Halal batch, protocol used, operator sign-off
5. **QA release** — finished product lot released by authorised person after Halal compliance check
6. **Dispatch record** — consignment note, transport partner, Halal seal/tamper evidence, delivery confirmation

### Digital vs. Paper Audit Trails

Both are acceptable to DAHC. Paper systems must be:
- Legibly completed (no whiteout/correction fluid without line-through and re-sign)
- Stored for minimum 3 years (or duration of product shelf life + 1 year, whichever is longer)
- Retrievable within 48 hours of an auditor request

Digital systems must:
- Have access controls (who can edit, who can only view)
- Generate an audit log of changes
- Be backed up

### DAHC Portal Integration

DAHC's certified companies can upload batch records and supplier documentation directly to their portal account. This creates a centralised audit trail accessible to DAHC auditors during remote verification reviews and reduces audit time significantly.

> Companies that maintained complete digital audit trails reduced their on-site DAHC audit time by an average of 2.5 hours in the 2025 audit cohort.`,
          },
        ],
      },
    ],
    quiz: [
      { text: "What colour label should be used for Halal-certified materials in a warehouse colour-coding system?", options: ["Red", "Yellow", "Green", "Blue"], correctIndex: 2, explanation: "Green labels/pallets designate Halal-certified, approved materials. Yellow = pending verification, Red = non-Halal or Haram (segregated)." },
      { text: "What is the maximum storage temperature for fresh Halal meat in cold chain?", options: ["0°C", "4°C", "8°C", "-18°C"], correctIndex: 1, explanation: "Fresh Halal meat must be maintained at ≤ 4°C throughout the cold chain from slaughter to point of sale." },
      { text: "How long must Halal audit trail documents be retained?", options: ["1 year", "2 years", "Minimum 3 years or shelf life + 1 year", "10 years"], correctIndex: 2, explanation: "Halal compliance documents must be retained for a minimum of 3 years, or the product shelf life plus 1 year, whichever is longer." },
      { text: "Which document must a transport company provide before handling Halal goods if it previously transported Haram products?", options: ["A health certificate", "A Halal cleaning (samak) record", "A NAFDAC clearance", "An ISO 9001 certificate"], correctIndex: 1, explanation: "A documented Halal cleaning (samak) record — confirming the vehicle was thoroughly cleaned using an approved procedure — is required before a vehicle that transported Haram goods can be used for Halal goods." },
      { text: "What should a company do if a temperature excursion is discovered in a Halal cold chain product?", options: ["Immediately release to market before the product deteriorates further", "Segregate, assess, do not release without QA sign-off, document, and report to DAHC within 24 hours if dispatched", "Discard the product without documentation", "Continue distribution and notify DAHC at the next audit"], correctIndex: 1, explanation: "The correct procedure is to segregate the affected lot, conduct a Halal integrity assessment, withhold from market without QA sign-off, document the excursion, and report to DAHC within 24 hours if the lot has already been dispatched with a Halal claim." },
    ],
  },
];

// ─── LMS seed ─────────────────────────────────────────────────────────────────

async function seedCoursesAndLMS(prisma: PrismaClient) {
  const existingCourses = await prisma.course.count().catch(() => 0);
  if (existingCourses > 0) return;

  const courseIds: string[] = [];

  for (const c of DEMO_COURSES) {
    const course = await prisma.course.create({
      data: {
        slug: c.slug, title: c.title, description: c.description,
        category: c.category, level: c.level, durationLabel: c.durationLabel,
      },
    });
    courseIds.push(course.id);

    const lessonIds: string[] = [];
    for (let mi = 0; mi < c.modules.length; mi++) {
      const m = c.modules[mi];
      const mod = await prisma.module.create({ data: { courseId: course.id, title: m.title, order: mi } });
      for (let li = 0; li < m.lessons.length; li++) {
        const l = m.lessons[li];
        const lesson = await prisma.lesson.create({
          data: { moduleId: mod.id, title: l.title, order: li, contentMd: l.contentMd, durationMin: l.durationMin },
        });
        lessonIds.push(lesson.id);
      }
    }

    const quiz = await prisma.quiz.create({
      data: { courseId: course.id, title: `${c.title} — Knowledge Check`, passScore: 70 },
    });
    for (let qi = 0; qi < c.quiz.length; qi++) {
      const q = c.quiz[qi];
      await prisma.question.create({
        data: {
          quizId: quiz.id, order: qi, text: q.text,
          options: JSON.stringify(q.options), correctIndex: q.correctIndex, explanation: q.explanation,
        },
      });
    }

  }

  // Enroll demo-user-001 in the first two courses
  if (courseIds.length >= 2) {
    // Course 1: all 6 lessons completed
    const enroll1 = await prisma.enrollment.create({
      data: { userId: "demo-user-001", courseId: courseIds[0], enrolledAt: daysAgo(30), completedAt: daysAgo(5) },
    }).catch(() => null);
    if (enroll1) {
      const lessons1 = await prisma.lesson.findMany({
        where: { module: { courseId: courseIds[0] } }, orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
      });
      for (const lesson of lessons1) {
        await prisma.lessonProgress.create({
          data: { enrollmentId: enroll1.id, lessonId: lesson.id, completed: true, completedAt: daysAgo(6) },
        }).catch(() => {});
      }
    }

    // Course 2: first 3 lessons completed
    const enroll2 = await prisma.enrollment.create({
      data: { userId: "demo-user-001", courseId: courseIds[1], enrolledAt: daysAgo(14) },
    }).catch(() => null);
    if (enroll2) {
      const lessons2 = await prisma.lesson.findMany({
        where: { module: { courseId: courseIds[1] } }, orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
      });
      for (let i = 0; i < Math.min(3, lessons2.length); i++) {
        await prisma.lessonProgress.create({
          data: { enrollmentId: enroll2.id, lessonId: lessons2[i].id, completed: true, completedAt: daysAgo(14 - i * 3) },
        }).catch(() => {});
      }
    }
  }
}

// ─── seed ─────────────────────────────────────────────────────────────────────

export async function seedDemoData(prisma: PrismaClient) {
  const existing = await prisma.certificationApplication.count().catch(() => 0);
  if (existing > 0) return; // already seeded

  const hash = await bcrypt.hash("Demo1234!", 10);

  // ── 1. System accounts ──
  const SYSTEM_ACCOUNTS = [
    { id: "demo-admin-001",   name: "System Administrator",          email: "admin@daralhalalcertification.com",        role: "ADMIN" as const },
    { id: "demo-sadmin-001",  name: "Super Administrator",           email: "superadmin@daralhalalcertification.com",   role: "SUPER_ADMIN" as const },
    { id: "demo-reviewer-001",name: "Amara Okonkwo (Reviewer)",      email: "reviewer@daralhalalcertification.com",     role: "REVIEWER" as const },
    { id: "demo-opsmgr-001",  name: "Bello Abdullahi (Ops Manager)", email: "opsmanager@daralhalalcertification.com",   role: "OPERATIONS_MANAGER" as const },
    { id: "demo-insp-001",    name: "Yusuf Aliyu (Inspector)",       email: "inspector@daralhalalcertification.com",    role: "INSPECTOR" as const },
    { id: "demo-tech-001",    name: "Dr. Fatima Sule (Technical)",   email: "technical@daralhalalcertification.com",    role: "TECHNICAL" as const },
    { id: "demo-sharia-001",  name: "Sheikh Ibrahim Kano (Shariah)", email: "shariah@daralhalalcertification.com",      role: "SHARIA_PANEL" as const },
    { id: "demo-user-001",    name: "Demo User",                      email: "user@daralhalalcertification.com",         role: "USER" as const },
  ];

  for (const acct of SYSTEM_ACCOUNTS) {
    await prisma.user.upsert({
      where: { email: acct.email },
      update: {},
      create: { ...acct, passwordHash: hash },
    });
  }

  // ── 2. Platform pricing defaults ──
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.platformSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  // ── 3. Company users + applications ──
  const userIds: string[] = [];
  const appIds:  string[] = [];

  for (let idx = 0; idx < COMPANIES.length; idx++) {
    const c = COMPANIES[idx];
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        passwordHash: hash,
        role: "USER" as const,
        businessName: c.biz,
        sector: c.sector,
      },
    });
    userIds.push(user.id);

    const appNum = `DAHC/APP/25/${String(idx + 1).padStart(4, "0")}`;
    const app = await (prisma.certificationApplication as unknown as {
      create: (args: { data: Record<string, unknown> }) => Promise<{ id: string }>;
    }).create({
      data: {
        userId:            user.id,
        applicationNumber: appNum,
        businessName:      c.biz,
        sector:            c.sector,
        schemeCode:        c.schemeCode,
        referenceNumber:   c.refNumber,
        productionScale:   c.scale,
        productList:       c.products,
        status:            c.status,
        reviewNotes:       c.reviewNotes,
        createdAt:         daysAgo(c.created),
        updatedAt:         daysAgo(c.created),
      },
    });
    appIds.push(app.id);
  }

  // ── 4. Certificates (2 BUSINESS tier — Halal Alimentos & NigerMeat) ──
  await prisma.certificate.create({
    data: {
      userId:        userIds[0],
      applicationId: appIds[0],
      tier:          "BUSINESS",
      serial:        "DAH-2025-000001",
      issuedAt:      daysAgo(COMPANIES[0].certDaysAgo),
      expiresAt:     daysFromNow(COMPANIES[0].certExpiresIn),
    },
  });

  await prisma.certificate.create({
    data: {
      userId:        userIds[1],
      applicationId: appIds[1],
      tier:          "BUSINESS",
      serial:        "DAH-2025-000002",
      issuedAt:      daysAgo(COMPANIES[1].certDaysAgo),
      expiresAt:     daysFromNow(COMPANIES[1].certExpiresIn),
    },
  });

  // ── 5. Payments ──
  for (const row of PAYMENT_ROWS) {
    await prisma.payment.create({
      data: {
        userId:        userIds[row.idx],
        applicationId: appIds[row.idx],
        description:   row.desc,
        paymentType:   row.type,
        amount:        row.amt,
        currency:      "NGN",
        status:        row.status as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED",
        createdAt:     daysAgo(row.daysAgo),
      },
    });
  }

  // ── 6. LMS courses, modules, lessons, quizzes, enrollments ──
  await seedCoursesAndLMS(prisma).catch(() => {});

  // ── 7. Demo user application (full QMS/AP/AF/01 data) ──
  await (prisma.certificationApplication as unknown as {
    create: (args: { data: Record<string, unknown> }) => Promise<{ id: string }>;
  }).create({
    data: {
      userId:             "demo-user-001",
      applicationNumber:  `DAHC/APP/26/${String(COMPANIES.length + 1).padStart(4, "0")}`,
      businessName:       "Demo Foods Nigeria",
      businessRegNo:      "RC-1234567",
      entityType:         "Limited Liability Company",
      headOfficeAddress:  "12 Aliyu Street, Wuse Zone 5, Abuja, FCT, Nigeria",
      factoryAddress:     "Plot 7B, Idu Industrial Layout, Abuja, FCT, Nigeria",
      telephone:          "+234 803 456 7890",
      website:            "www.demofoods.ng",
      sector:             "Food and Beverages",
      schemeCode:         "FB",
      productionScale:    "SMALL",
      productList:        JSON.stringify([
        { name: "Organic Groundnut Oil", brand: "PureNut" },
        { name: "Pure Raw Honey",         brand: "BeeHarvest NG" },
      ]),
      ingredientList:     JSON.stringify([
        { name: "Groundnuts (Arachis hypogaea)", source: "Plant", manufacturer: "Local Farm Cooperative, Kano", halalStatus: "Certified Halal", certBody: "NAFDAC", certExpiry: "2026-12-31", otherDoc: "" },
        { name: "Hexane (food-grade extraction solvent)", source: "Synthetic", manufacturer: "Sigma Chemicals Nigeria", halalStatus: "Pending Review", certBody: "", certExpiry: "", otherDoc: "MSDS on file" },
        { name: "Raw Wildflower Honey", source: "Animal", manufacturer: "BeeHarvest Apiaries, Jos Plateau", halalStatus: "Certified Halal", certBody: "DAHC", certExpiry: "2025-06-30", otherDoc: "" },
      ]),
      otherCertifications: JSON.stringify({
        nafdac: true, nafdacRef: "A7-1234L",
        son:    false, sonRef: "",
        iso:    false, isoRef: "",
        otherHalal: false, otherHalalRef: "",
      }),
      picName:            "Amina Demo",
      picDesignation:     "Managing Director",
      picPhone:           "+234 803 456 7891",
      picEmail:           "amina@demofoods.ng",
      notes:              "We are a small startup looking to export to the GCC market.",
      declarationAccepted: true,
      status:             "SUBMITTED",
      createdAt:          daysAgo(5),
      updatedAt:          daysAgo(5),
    },
  });
}
