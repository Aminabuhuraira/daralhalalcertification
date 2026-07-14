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

// ─── seed ─────────────────────────────────────────────────────────────────────

export async function seedDemoData(prisma: PrismaClient) {
  const existing = await prisma.certificationApplication.count().catch(() => 0);
  if (existing > 0) return; // already seeded

  const hash = await bcrypt.hash("Demo1234!", 10);

  // ── 1. System accounts ──
  await prisma.user.upsert({
    where: { email: "admin@daralhalalcertification.com" },
    update: {},
    create: {
      id: "demo-admin-001",
      name: "Admin",
      email: "admin@daralhalalcertification.com",
      passwordHash: hash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "user@daralhalalcertification.com" },
    update: {},
    create: {
      id: "demo-user-001",
      name: "Demo User",
      email: "user@daralhalalcertification.com",
      passwordHash: hash,
      role: "USER",
    },
  });

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

  for (const c of COMPANIES) {
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

    const app = await (prisma.certificationApplication as unknown as {
      create: (args: { data: Record<string, unknown> }) => Promise<{ id: string }>;
    }).create({
      data: {
        userId:          user.id,
        businessName:    c.biz,
        sector:          c.sector,
        schemeCode:      c.schemeCode,
        referenceNumber: c.refNumber,
        productionScale: c.scale,
        productList:     c.products,
        status:          c.status,
        reviewNotes:     c.reviewNotes,
        createdAt:       daysAgo(c.created),
        updatedAt:       daysAgo(c.created),
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

  // ── 6. Demo user application ──
  await (prisma.certificationApplication as unknown as {
    create: (args: { data: Record<string, unknown> }) => Promise<{ id: string }>;
  }).create({
    data: {
      userId:          "demo-user-001",
      businessName:    "Demo Foods Nigeria",
      sector:          "Food and Beverages",
      schemeCode:      "FB",
      productionScale: "SMALL",
      productList:     "Organic Groundnut Oil, Pure Honey",
      notes:           "We are a small startup looking to export to the GCC market.",
      status:          "SUBMITTED",
      createdAt:       daysAgo(5),
      updatedAt:       daysAgo(5),
    },
  });
}
