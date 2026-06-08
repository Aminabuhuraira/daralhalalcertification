import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are DARI — Digital Assistant for Regulatory Intelligence — the official AI assistant for Dar Al Halal Certification, Nigeria's premier halal certification authority.

IMPORTANT FRAMING: Halal certification is a globally recognized quality and compliance standard, not just a religious requirement. It assures rigorous inspection, hygiene standards, ethical production, and supply chain transparency. It opens access to the $3 trillion global halal economy — attractive to businesses of ALL backgrounds.

Your role is to educate businesses on the commercial, regulatory, and market value of halal certification. You serve businesses of all religions and backgrounds.

You explain:
- The business value of halal certification (revenue growth, market access, export opportunities, quality branding)
- The certification process (application → screening → document review → audit → compliance verification → certificate issuance)
- Market opportunities in Nigeria and Africa ($3T global halal economy, 95M Nigerian halal consumers, 400M+ African halal consumers, AfCFTA access)
- Compliance, ingredient permissibility, production standards, and supply chain requirements
- The 12 certified sectors: Food & Beverage, Cosmetics, Pharmaceuticals, Hospitality, Logistics, Manufacturing, Fashion, Finance, Agriculture, Healthcare, Education, Animal Feed

Key facts:
- Dar Al Halal is headquartered at 14 Oguda Close, Maitama, Abuja, Nigeria
- Phone: +234 806 333 4296 | Email: info@daralhalalcertification.com
- Certification mark is copyright-protected under Nigerian and international IP law
- Certified businesses report 30-45% increase in export revenue within 12 months
- Halal certification is accepted in over 57 partner countries worldwide

Always speak with authority, clarity, and warmth. Be inclusive — halal certification serves ALL businesses.
Always end responses with a call to action encouraging certification application.
Keep responses concise, professional, and helpful.
You are DARI. Never call yourself HalalBot.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        content: generateFallbackResponse(messages[messages.length - 1]?.content || ""),
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-10).map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ content: data.content[0]?.text || "I apologize, please try again." });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ content: generateFallbackResponse("") }, { status: 200 });
  }
}

function generateFallbackResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("islam") || msg.includes("religion") || msg.includes("muslim only") || msg.includes("christian") || msg.includes("force") || msg.includes("convert")) {
    return `Great question — and a very common concern.\n\n**Halal certification is not about religion. It is about quality.**\n\nHalal standards require rigorous hygiene controls, transparent ingredient sourcing, ethical production practices, and independent third-party audits. Businesses of every background globally pursue halal certification purely for market access and quality branding.\n\nAny business that meets the production and quality standards can be certified — which yours likely already does. **Apply today and open your products to 2 billion consumers worldwide.**`;
  }

  if (msg.includes("revenue") || msg.includes("money") || msg.includes("profit") || msg.includes("sales")) {
    return `Certified businesses report a **30-45% increase in export revenue within 12 months** of certification.\n\nHalal certification opens access to GCC, Malaysian, Indonesian, and North African import markets — premium markets that require halal-certified suppliers. Your certification is not a cost; it is a market entry key.\n\nReady to grow? **Apply for certification today.**`;
  }

  if (msg.includes("sector") || msg.includes("industry") || msg.includes("type") || msg.includes("what kind")) {
    return `Dar Al Halal certifies businesses across **12 sectors**:\n\n` +
      `- Food & Beverage\n- Cosmetics & Personal Care\n- Pharmaceuticals & Nutraceuticals\n- Hospitality\n` +
      `- Logistics & Supply Chain\n- Manufacturing\n- Fashion & Textiles\n- Finance & Banking\n` +
      `- Agriculture\n- Animal Feed\n- Healthcare\n- Education\n\n` +
      `Whatever sector you are in, if quality and market access matter to you, we can certify it. **Apply today.**`;
  }

  if (msg.includes("long") || msg.includes("time") || msg.includes("process") || msg.includes("how") || msg.includes("steps")) {
    return `The certification process typically takes **4-8 weeks** from application to certificate:\n\n` +
      `1. Application submission\n2. Initial screening (1 week)\n3. Document review (1-2 weeks)\n` +
      `4. On-site audit (1 week)\n5. Compliance verification\n6. Certificate issuance\n\n` +
      `The process is thorough, ensuring your certification carries credibility in 57+ countries. **Start your application today.**`;
  }

  if (msg.includes("ingredient") || msg.includes("haram") || msg.includes("permiss") || msg.includes("e-number")) {
    return `Visit our **Ingredient Checker** tool at \`/resources/ingredient-checker\` to check any ingredient or E-number for halal compliance status.\n\nFor a full product compliance review, our certification team assesses all ingredients, production processes, and supply chain documentation. **Apply for certification to get a complete compliance assessment.**`;
  }

  if (msg.includes("africa") || msg.includes("market") || msg.includes("export") || msg.includes("nigeria")) {
    return `Nigeria is positioned at the centre of Africa's halal economy. With **95 million halal consumers** and Africa's largest GDP, Nigerian businesses have a unique opportunity.\n\n` +
      `Through AfCFTA, certified products access **400+ million African halal consumers** — from Dakar to Nairobi to Cairo. The global halal economy exceeds **$3 trillion**.\n\nReady to claim your market share? **Apply for Dar Al Halal certification today.**`;
  }

  return `Hello! I'm **DARI** — Digital Assistant for Regulatory Intelligence.\n\n` +
    `I help businesses navigate halal certification to access the **$3 trillion global quality market**. I can help with:\n\n` +
    `- Is halal certification right for my business?\n- Understanding the certification process\n- Market opportunity data\n- Ingredient and compliance checks\n- Revenue impact projections\n\n` +
    `What would you like to know? **Apply for certification today and open global markets.**`;
}
