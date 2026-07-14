/**
 * Demo seed — populates the tmp SQLite database with realistic halal
 * certification data so the admin dashboard shows meaningful charts
 * and tables rather than empty state.
 *
 * Called automatically by ensureDb() after schema migrations run.
 * Is idempotent: checks for existing applications before inserting.
 *
 * 21 companies  ·  6 LARGE (28.57%)  ·  7 MEDIUM (33.33%)  ·  8 SMALL (38.10%)
 * 10 APPROVED (47.62%)  ·  5 PENDING (23.81%)  ·  6 REJECTED (28.57%)
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

const COMPANIES = [
  // ── APPROVED · LARGE (4) ────────────────────────────────────────────────────
  {
    name: "Usman Aliyu",
    email: "usman@halalalimentos.ng",
    biz: "Halal Alimentos Ltd",
    sector: "Food Processing",
    scale: "LARGE",
    products: "Halal Seasoned Chicken, Beef Suya Mix, Jollof Spice Blend",
    status: "APPROVED",
    issueCert: true,
    certDaysAgo: 180,
    certExpiresIn: 45,   // within upcoming renewals, not an alert
    created: 210,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },
  {
    name: "Maryam Garba",
    email: "maryam@nigermeat.ng",
    biz: "NigerMeat Express",
    sector: "Meat & Poultry",
    scale: "LARGE",
    products: "Fresh Halal Beef, Halal Mutton, Smoked Chicken Wings",
    status: "APPROVED",
    issueCert: true,
    certDaysAgo: 155,
    certExpiresIn: 210,  // healthy, 7+ months
    created: 185,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },
  {
    name: "Abdullahi Tanko",
    email: "abdullahi@pharmaherb.ng",
    biz: "Pharmaherb Nigeria",
    sector: "Pharmaceuticals",
    scale: "LARGE",
    products: "Herbal Immune Tonic, Halal Vitamin Capsules",
    status: "APPROVED",
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
    sector: "Dairy & Dairy Products",
    scale: "LARGE",
    products: "Pasteurised Halal Milk, Yoghurt, Cheese",
    status: "APPROVED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 140,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },

  // ── APPROVED · MEDIUM (4) ───────────────────────────────────────────────────
  {
    name: "Fatima Bello",
    email: "fatima@greenleaf.ng",
    biz: "GreenLeaf Cosmetics",
    sector: "Cosmetics & Personal Care",
    scale: "MEDIUM",
    products: "Halal Face Cream, Natural Lip Balm, Body Lotion",
    status: "APPROVED",
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
    sector: "Beverages & Soft Drinks",
    scale: "MEDIUM",
    products: "Zobo Concentrate, Tigernut Drink, Ginger Lemon Shot",
    status: "APPROVED",
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
    sector: "Textiles & Fashion",
    scale: "MEDIUM",
    products: "Halal-Dyed Cotton Fabric, Embroidered Prayer Mat",
    status: "APPROVED",
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
    sector: "Logistics & Supply Chain",
    scale: "MEDIUM",
    products: "Halal Cold-Chain Transport, Certified Storage Service",
    status: "APPROVED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 95,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },

  // ── APPROVED · SMALL (2) ────────────────────────────────────────────────────
  {
    name: "Aisha Bakr",
    email: "aisha@mamaskitchen.ng",
    biz: "Mama's Kitchen Ltd",
    sector: "Restaurant & Catering",
    scale: "SMALL",
    products: "Halal Lunch Buffet, Outdoor Catering Service",
    status: "APPROVED",
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
    sector: "Health & Wellness",
    scale: "SMALL",
    products: "Moringa Powder, Black Seed Oil, Herbal Tea Blend",
    status: "APPROVED",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 70,
    reviewNotes: "All documentation verified. Shariah Panel approved.",
  },

  // ── PENDING · LARGE (2) ─────────────────────────────────────────────────────
  {
    name: "Garba Ilyas",
    email: "garba@goldengrains.ng",
    biz: "Golden Grains Mills",
    sector: "Grain & Milling",
    scale: "LARGE",
    products: "Stone-Milled Wheat Flour, Semolina, Rice Flour",
    status: "PENDING",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 55,
    reviewNotes: null,
  },
  {
    name: "Yusuf Ahmad",
    email: "yusuf@northeastfarm.ng",
    biz: "NorthEast Agro Ltd",
    sector: "Agriculture & Fresh Produce",
    scale: "LARGE",
    products: "Certified Organic Vegetables, Sun-Dried Tomatoes",
    status: "PENDING",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 45,
    reviewNotes: null,
  },

  // ── PENDING · MEDIUM (2) ────────────────────────────────────────────────────
  {
    name: "Hauwa Dogo",
    email: "hauwa@riverbend.ng",
    biz: "Riverbend Farms",
    sector: "Agriculture & Fresh Produce",
    scale: "MEDIUM",
    products: "Smoked Catfish, Dried Crayfish, Fish Sauce",
    status: "PENDING",
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
    sector: "Food Processing",
    scale: "MEDIUM",
    products: "Instant Noodles, Seasoning Cubes, Pepper Sauce",
    status: "PENDING",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 28,
    reviewNotes: null,
  },

  // ── PENDING · SMALL (1) ─────────────────────────────────────────────────────
  {
    name: "Bilkisu Hassan",
    email: "bilkisu@sunstarsnacks.ng",
    biz: "SunStar Snacks",
    sector: "Food Processing",
    scale: "SMALL",
    products: "Groundnut Cake (Kuli-Kuli), Chin-Chin, Coconut Candy",
    status: "PENDING",
    issueCert: false,
    certDaysAgo: 0,
    certExpiresIn: 0,
    created: 18,
    reviewNotes: null,
  },

  // ── REJECTED · MEDIUM (1) ───────────────────────────────────────────────────
  {
    name: "Aminu Sale",
    email: "aminu@sahara.ng",
    biz: "Sahara Confectionery",
    sector: "Confectionery & Sweets",
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
    sector: "Cosmetics & Personal Care",
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
    sector: "Textiles & Fashion",
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
    sector: "Bakery & Confectionery",
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
    sector: "Restaurant & Catering",
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
    sector: "Food Processing",
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
// amounts in kobo (÷100 = naira)  e.g. 35_000_000 = ₦350,000

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
  { idx: 6,  desc: "Certification Fee — Medium Scale", type: "COMPANY", amt: 25_000_000, status: "COMPLETED", daysAgo: 90 },
  { idx: 7,  desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 94 },
  { idx: 7,  desc: "Certification Fee — Medium Scale", type: "COMPANY", amt: 25_000_000, status: "COMPLETED", daysAgo: 75 },
  { idx: 8,  desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 79 },
  { idx: 8,  desc: "Certification Fee — Small Scale",  type: "COMPANY", amt: 15_000_000, status: "PENDING",   daysAgo: 60 },
  { idx: 9,  desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 69 },
  { idx: 9,  desc: "Certification Fee — Small Scale",  type: "COMPANY", amt: 15_000_000, status: "PENDING",   daysAgo: 50 },
  { idx: 10, desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 54 },
  { idx: 11, desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "PENDING",   daysAgo: 44 },
  { idx: 12, desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 34 },
  { idx: 13, desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "COMPLETED", daysAgo: 27 },
  { idx: 14, desc: "Application Fee",                  type: "COMPANY", amt: 7_500_000,  status: "PENDING",   daysAgo: 17 },
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

    const app = await prisma.certificationApplication.create({
      data: {
        userId: user.id,
        businessName: c.biz,
        sector: c.sector,
        productionScale: c.scale,
        productList: c.products,
        status: c.status as "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW",
        reviewNotes: c.reviewNotes,
        createdAt: daysAgo(c.created),
        updatedAt: daysAgo(c.created),
      },
    });
    appIds.push(app.id);
  }

  // ── 4. Certificates (2 BUSINESS tier) ──
  // Halal Alimentos — cert expiring in 45 days (shows in upcoming renewals)
  await prisma.certificate.create({
    data: {
      userId: userIds[0],
      applicationId: appIds[0],
      tier: "BUSINESS",
      serial: "DAH-2025-000001",
      issuedAt: daysAgo(COMPANIES[0].certDaysAgo),
      expiresAt: daysFromNow(COMPANIES[0].certExpiresIn),
    },
  });

  // NigerMeat Express — cert expiring in 210 days (healthy)
  await prisma.certificate.create({
    data: {
      userId: userIds[1],
      applicationId: appIds[1],
      tier: "BUSINESS",
      serial: "DAH-2025-000002",
      issuedAt: daysAgo(COMPANIES[1].certDaysAgo),
      expiresAt: daysFromNow(COMPANIES[1].certExpiresIn),
    },
  });

  // ── 5. Payments ──
  for (const row of PAYMENT_ROWS) {
    await prisma.payment.create({
      data: {
        userId: userIds[row.idx],
        applicationId: appIds[row.idx],
        description: row.desc,
        paymentType: row.type,
        amount: row.amt,
        currency: "NGN",
        status: row.status as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED",
        createdAt: daysAgo(row.daysAgo),
      },
    });
  }

  // ── 6. Demo user application (visible when logged in as demo user) ──
  await prisma.certificationApplication.create({
    data: {
      userId: "demo-user-001",
      businessName: "Demo Foods Nigeria",
      sector: "Food Processing",
      productionScale: "SMALL",
      productList: "Organic Groundnut Oil, Pure Honey",
      notes: "We are a small startup looking to export to the GCC market.",
      status: "PENDING",
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
  });
}
