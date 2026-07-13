import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";

const COURSES = [
  {
    slug: "halal-fundamentals",
    title: "Halal Certification Fundamentals",
    level: "Beginner",
    durationLabel: "3h 20m",
    category: "Foundation",
    description:
      "Understand what halal means in a global business context, the standards involved, and how certification works.",
    modules: [
      {
        title: "What is Halal?",
        lessons: [
          { title: "Defining Halal & Haram", durationMin: 18 },
          { title: "Halal in a Global Business Context", durationMin: 22 },
        ],
      },
      {
        title: "The Certification Landscape",
        lessons: [
          { title: "Major Standards Bodies (SMIIC, JAKIM, ESMA)", durationMin: 25 },
          { title: "Why Businesses Seek Certification", durationMin: 20 },
        ],
      },
      {
        title: "The Dar Al Halal Process",
        lessons: [
          { title: "Application to Certificate: An Overview", durationMin: 30 },
          { title: "Maintaining Your Certification", durationMin: 15 },
        ],
      },
    ],
    quiz: [
      q("Which of the following best defines 'Halal'?", [
        "Anything legally permissible under Islamic law",
        "Only food prepared in a mosque",
        "A brand name for organic food",
        "A government food safety grade",
      ], 0, "Halal means 'permissible' under Islamic law and applies to far more than just food."),
      q("Which body developed the OIC/SMIIC halal standards?", [
        "World Health Organization",
        "Standards and Metrology Institute for Islamic Countries",
        "United Nations",
        "International Trade Commission",
      ], 1, "SMIIC is the OIC-affiliated body responsible for harmonized halal standards."),
      q("What is the opposite of Halal called?", [
        "Mashbooh",
        "Haram",
        "Tayyib",
        "Zabiha",
      ], 1, "Haram refers to anything forbidden under Islamic law."),
      q("Why do many businesses pursue halal certification?", [
        "It is required for all food products worldwide",
        "It only matters for restaurants",
        "It opens access to halal-conscious consumer markets and export opportunities",
        "It replaces the need for food safety standards",
      ], 2, "Certification unlocks trust with halal-conscious consumers and access to halal-import markets."),
      q("'Mashbooh' refers to ingredients or products that are:", [
        "Definitely halal",
        "Definitely haram",
        "Doubtful or unclear in halal status",
        "Only relevant to cosmetics",
      ], 2, "Mashbooh items require further verification before a halal/haram ruling can be made."),
    ],
  },
  {
    slug: "ingredient-compliance",
    title: "Ingredient Compliance & Labeling",
    level: "Intermediate",
    durationLabel: "5h 10m",
    category: "Compliance",
    description:
      "Deep dive into E-numbers, additives, enzymes, and how to audit ingredient lists for halal compliance.",
    modules: [
      {
        title: "Understanding E-Numbers",
        lessons: [
          { title: "Common Additives and Their Sources", durationMin: 28 },
          { title: "Animal-Derived vs Plant-Derived Additives", durationMin: 24 },
        ],
      },
      {
        title: "Enzymes & Processing Aids",
        lessons: [
          { title: "Microbial vs Animal Enzymes", durationMin: 26 },
          { title: "Cross-Contamination Risk Points", durationMin: 20 },
        ],
      },
      {
        title: "Auditing Ingredient Lists",
        lessons: [
          { title: "Building a Compliance Checklist", durationMin: 22 },
          { title: "Working With Suppliers for Documentation", durationMin: 18 },
        ],
      },
    ],
    quiz: [
      q("Gelatin sourced from pork is considered:", ["Halal", "Haram", "Mashbooh", "Irrelevant to certification"], 1, "Pork-derived gelatin is haram; halal gelatin must come from permissible sources."),
      q("Which type of enzyme source is generally easiest to verify as halal?", ["Animal-derived", "Microbial/plant-derived", "Unlabeled", "None of the above"], 1, "Microbial and plant-derived enzymes avoid animal-sourcing concerns entirely."),
      q("E-numbers are used to identify:", ["Country of origin", "Food additives", "Expiry dates", "Nutritional values"], 1, "E-numbers are a coding system for food additives used across labeling systems."),
      q("Cross-contamination risk is highest at which point?", ["Marketing", "Shared processing equipment/lines", "Retail pricing", "Customer service"], 1, "Shared lines/equipment between halal and non-halal products is a major contamination risk."),
      q("A supplier halal declaration letter should be:", ["Ignored if the product looks fine", "Verified and kept on file as supporting documentation", "Used only for cosmetics", "Optional for all products"], 1, "Supplier declarations are key supporting evidence during certification audits."),
    ],
  },
  {
    slug: "export-markets",
    title: "Accessing GCC Export Markets",
    level: "Advanced",
    durationLabel: "4h 45m",
    category: "Business",
    description:
      "Navigate UAE, Saudi, and Qatar import requirements for halal-certified Nigerian exports.",
    modules: [
      {
        title: "GCC Market Overview",
        lessons: [
          { title: "UAE, Saudi & Qatar Import Requirements", durationMin: 30 },
          { title: "Recognized Certification Bodies in the GCC", durationMin: 22 },
        ],
      },
      {
        title: "Logistics & Documentation",
        lessons: [
          { title: "Shipping Halal Goods Internationally", durationMin: 26 },
          { title: "Customs Documentation Checklist", durationMin: 20 },
        ],
      },
      {
        title: "Growing in the GCC",
        lessons: [
          { title: "Pricing for Premium Halal Markets", durationMin: 18 },
        ],
      },
    ],
    quiz: [
      q("Which GCC country requires ESMA-recognized halal certification for imports?", ["Only Qatar", "UAE", "Neither", "Only for cosmetics"], 1, "The UAE's ESMA scheme requires recognized halal certification for many imported goods."),
      q("Mutual recognition agreements between certification bodies help:", ["Slow down trade", "Streamline market access for certified exporters", "Replace the need for any certification", "Only apply to cosmetics"], 1, "Mutual recognition reduces duplicate certification work across markets."),
      q("Why might certified products command a price premium in GCC markets?", ["They are cheaper to produce", "Consumer trust and demand for verified halal status", "Lower import duties always apply", "They are exempt from inspection"], 1, "Verified halal status builds consumer trust, supporting premium pricing."),
      q("A key export logistics risk for halal goods is:", ["Too much documentation", "Contamination during mixed-cargo shipping", "Currency exchange rates only", "Packaging color"], 1, "Mixed cargo shipping can risk contact with non-halal goods if not properly segregated."),
      q("Customs documentation for halal exports typically includes:", ["Halal certificate and commercial invoice", "Only a price list", "Nothing beyond the product itself", "A marketing brochure"], 0, "A valid halal certificate alongside standard trade documents is typically required."),
    ],
  },
  {
    slug: "halal-audit",
    title: "Halal Audit & HACCP Integration",
    level: "Advanced",
    durationLabel: "6h 30m",
    category: "Operations",
    description:
      "Learn how to integrate halal requirements into your existing HACCP and ISO 22000 quality systems.",
    modules: [
      {
        title: "Audit Fundamentals",
        lessons: [
          { title: "Pre-Audit Preparation", durationMin: 24 },
          { title: "On-Site Audit Walkthrough", durationMin: 28 },
        ],
      },
      {
        title: "Integrating with HACCP",
        lessons: [
          { title: "Identifying Halal Critical Control Points", durationMin: 26 },
          { title: "Aligning with ISO 22000", durationMin: 22 },
        ],
      },
      {
        title: "Continuous Compliance",
        lessons: [
          { title: "Internal Audit Scheduling", durationMin: 18 },
          { title: "Corrective Action Procedures", durationMin: 20 },
        ],
      },
    ],
    quiz: [
      q("A Halal Critical Control Point (HCCP) is a point where:", ["Marketing decisions are made", "Halal status could be compromised without controls", "Pricing is determined", "Packaging design is finalized"], 1, "HCCPs are process points where halal integrity could be lost without proper controls."),
      q("HACCP primarily focuses on:", ["Food safety hazard control", "Halal status only", "Employee scheduling", "Marketing strategy"], 0, "HACCP is a food safety system; halal controls can be integrated alongside it."),
      q("On-site halal audits typically review:", ["Only paperwork", "Facilities, ingredients, and processes together", "Only the finished product taste", "Employee social media"], 1, "A thorough audit reviews documentation, facilities, ingredients, and processes."),
      q("Corrective action procedures are triggered when:", ["Everything passes", "A non-conformance is identified", "An audit is scheduled", "A new product launches"], 1, "Corrective actions address identified non-conformances to restore compliance."),
      q("ISO 22000 relates most closely to:", ["Food safety management systems", "Halal certification exclusively", "Financial auditing", "Marketing compliance"], 0, "ISO 22000 is a food safety management standard that can integrate with halal requirements."),
    ],
  },
  {
    slug: "cosmetics-halal",
    title: "Halal Cosmetics Standards",
    level: "Intermediate",
    durationLabel: "2h 55m",
    category: "Cosmetics",
    description:
      "MS 2200, OIC/SMIIC 4 standards for halal personal care products and what ingredients to avoid.",
    modules: [
      {
        title: "Standards Overview",
        lessons: [
          { title: "Introduction to MS 2200 & SMIIC 4", durationMin: 20 },
        ],
      },
      {
        title: "Ingredients to Watch",
        lessons: [
          { title: "Animal-Derived Cosmetic Ingredients", durationMin: 22 },
          { title: "Alcohol in Cosmetics: What's Permissible", durationMin: 18 },
        ],
      },
      {
        title: "Certifying a Cosmetics Line",
        lessons: [
          { title: "Documentation Required for Cosmetics", durationMin: 16 },
        ],
      },
    ],
    quiz: [
      q("MS 2200 is a halal standard specific to:", ["Pharmaceuticals", "Personal care and cosmetics", "Logistics", "Finance"], 1, "MS 2200 (Malaysian Standard) covers halal cosmetics and personal care goods."),
      q("Which ingredient type requires the most scrutiny in halal cosmetics?", ["Water", "Animal-derived collagen/glycerin", "Packaging color", "Fragrance bottle shape"], 1, "Animal-derived ingredients like collagen or glycerin need source verification."),
      q("Is all alcohol automatically haram in cosmetics?", ["Yes, always", "No — context and type matter under most rulings", "Only in shampoo", "Only in lipstick"], 1, "Many halal cosmetic standards permit certain non-intoxicating alcohols used externally."),
      q("SMIIC 4 is issued by:", ["A private cosmetics brand", "The OIC-affiliated standards body", "A national tax authority", "A retail chain"], 1, "SMIIC, affiliated with the OIC, issues harmonized halal standards including SMIIC 4 for cosmetics."),
      q("Certifying a cosmetics line typically requires:", ["No documentation", "Full ingredient sourcing and formulation documentation", "Only a sample product", "A social media post"], 1, "Certifiers require full ingredient and formulation documentation to assess compliance."),
    ],
  },
  {
    slug: "logistics-chain",
    title: "Halal Supply Chain Management",
    level: "Intermediate",
    durationLabel: "3h 40m",
    category: "Logistics",
    description:
      "Maintain halal integrity from farm/factory to retail shelf, including cold chain and warehousing.",
    modules: [
      {
        title: "Supply Chain Integrity",
        lessons: [
          { title: "Farm-to-Shelf Halal Traceability", durationMin: 24 },
          { title: "Segregation in Warehousing", durationMin: 20 },
        ],
      },
      {
        title: "Cold Chain & Transport",
        lessons: [
          { title: "Cold Chain Requirements for Halal Goods", durationMin: 22 },
        ],
      },
      {
        title: "Working with Partners",
        lessons: [
          { title: "Vetting Halal-Compliant Logistics Partners", durationMin: 18 },
          { title: "Audit Trails Across the Supply Chain", durationMin: 16 },
        ],
      },
    ],
    quiz: [
      q("Halal traceability ideally covers:", ["Only the factory stage", "The full farm-to-shelf journey", "Only retail pricing", "Only marketing claims"], 1, "Full traceability from source to shelf protects halal integrity at every step."),
      q("Why is warehouse segregation important for halal goods?", ["To save space only", "To prevent cross-contamination with non-halal goods", "To reduce paperwork", "It isn't important"], 1, "Segregation prevents physical or residue contact with non-halal products."),
      q("Cold chain integrity matters for halal compliance because:", ["It only affects taste", "Mixed storage can risk contamination and quality", "It has no relation to halal status", "It only matters for cosmetics"], 1, "Improper cold chain storage can create contamination or quality risks affecting compliance."),
      q("When vetting a logistics partner for halal goods, you should check:", ["Their marketing budget", "Their handling procedures and segregation practices", "Their office decor", "Nothing in particular"], 1, "Handling and segregation practices directly affect halal integrity in transit."),
      q("Audit trails across the supply chain help:", ["Slow down operations unnecessarily", "Demonstrate and verify halal compliance at each stage", "Replace the need for certification", "Only matter for exports"], 1, "Audit trails provide evidence of compliance throughout the supply chain."),
    ],
  },
];

function q(text: string, options: string[], correctIndex: number, explanation: string) {
  return { text, options, correctIndex, explanation };
}

async function main() {
  const { prisma } = await import("../lib/db");

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "DarAlHalal2026!";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: "admin@daralhalalcertification.com" },
    update: {},
    create: {
      name: "Dar Al Halal Admin",
      email: "admin@daralhalalcertification.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("Seeded admin user: admin@daralhalalcertification.com");

  for (const c of COURSES) {
    const course = await prisma.course.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        description: c.description,
        category: c.category,
        level: c.level,
        durationLabel: c.durationLabel,
      },
      create: {
        slug: c.slug,
        title: c.title,
        description: c.description,
        category: c.category,
        level: c.level,
        durationLabel: c.durationLabel,
      },
    });

    // Clear existing modules/quiz for idempotent reseeding
    await prisma.module.deleteMany({ where: { courseId: course.id } });
    await prisma.quiz.deleteMany({ where: { courseId: course.id } });

    for (let mi = 0; mi < c.modules.length; mi++) {
      const m = c.modules[mi];
      const mod = await prisma.module.create({
        data: { courseId: course.id, title: m.title, order: mi },
      });
      for (let li = 0; li < m.lessons.length; li++) {
        const l = m.lessons[li];
        await prisma.lesson.create({
          data: {
            moduleId: mod.id,
            title: l.title,
            order: li,
            durationMin: l.durationMin,
            contentMd: `## ${l.title}\n\nThis lesson covers **${l.title.toLowerCase()}** as part of *${c.title}*.\n\n- Key concept one related to ${c.category.toLowerCase()} compliance\n- Key concept two with practical examples\n- A short case study from the Nigerian halal market\n\n> Dar Al Halal certifiers look for clear, documented evidence of compliance at every stage.\n\nContinue to the next lesson when you're ready, or mark this lesson complete.`,
            videoUrl: null,
          },
        });
      }
    }

    const quiz = await prisma.quiz.create({
      data: { courseId: course.id, title: `${c.title} — Knowledge Check`, passScore: 70 },
    });
    for (let qi = 0; qi < c.quiz.length; qi++) {
      const question = c.quiz[qi];
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          order: qi,
          text: question.text,
          options: JSON.stringify(question.options),
          correctIndex: question.correctIndex,
          explanation: question.explanation,
        },
      });
    }

    console.log(`Seeded course: ${c.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .then(() => process.exit(0));
