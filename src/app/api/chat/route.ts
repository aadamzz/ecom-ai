import { NextRequest, NextResponse } from "next/server";
import { searchProducts, getProductBySlug } from "@/lib/products";
import { products } from "@/data/products";
import type { Product, Category, Style, Occasion } from "@/types/product";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `You are NØRD Stylist — a personal AI fashion stylist at the NØRD fashion store.

Your tasks:
- Ask about occasion, style, budget, and preferences (colors, materials, fit)
- Search for products in the catalog using tools
- Suggest outfits (2-3 pieces) tailored to the user's needs
- Be natural, friendly, with a touch of expertise
- Respond in English
- Keep it short and concrete — max 2-3 paragraphs

Formatting rules:
- Use **bold** for key questions or section labels so the user can scan quickly
- When listing questions or options, use a numbered list (1. 2. 3.) — each on its own line
- Use short single-line paragraphs separated by a blank line for distinct thoughts
- Never write long unbroken paragraphs — break them up
- Use emoji sparingly — max one per message, at the start if at all

Styling rules:
- Don't combine more than 3 colors in an outfit
- Shoes should color-coordinate with the rest
- For weddings: elegant, not streetwear
- For everyday: casual or smart-casual
- For office: smart-casual or elegant
- For dates: smart-casual or elegant, with one "statement piece"

If the user didn't specify a budget, suggest various price options.
If the user is on a product page, you can suggest matching items.
Always suggest specific products from the catalog using tools.`;

const tools = [
  {
    name: "search_products",
    description: "Search products in the NØRD catalog. Use to find specific items (e.g. shirts, wedding shoes, black pants).",
    input_schema: {
      type: "object" as const,
      properties: {
        category: { type: "string", enum: ["tops", "bottoms", "shoes", "outerwear", "accessories"], description: "Product category" },
        style: { type: "string", enum: ["casual", "elegant", "smart-casual", "streetwear", "sporty", "minimal"], description: "Style" },
        occasion: { type: "string", enum: ["everyday", "wedding", "date", "office", "party", "vacation"], description: "Occasion" },
        maxPrice: { type: "number", description: "Maximum price in USD" },
        color: { type: "string", description: "Color (e.g. black, navy, white)" },
        gender: { type: "string", enum: ["men", "women", "unisex"], description: "Gender" },
        query: { type: "string", description: "Search query (e.g. 'linen', 'cotton', 'shirt')" },
      },
    },
  },
  {
    name: "get_product",
    description: "Get details of a specific product by slug.",
    input_schema: {
      type: "object" as const,
      properties: {
        slug: { type: "string", description: "Product slug" },
      },
      required: ["slug"],
    },
  },
  {
    name: "build_outfit",
    description: "Build an outfit from selected products. Use after finding suitable products.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Outfit name (e.g. 'Smart Casual Date Night')" },
        productSlugs: {
          type: "array",
          items: { type: "string" },
          description: "Product slugs for the outfit",
        },
        occasion: { type: "string", description: "Occasion" },
      },
      required: ["name", "productSlugs"],
    },
  },
];

function executeTool(name: string, input: Record<string, unknown>): { result: unknown; products?: Product[] } {
  switch (name) {
    case "search_products": {
      const found = searchProducts({
        category: input.category as Category | undefined,
        style: input.style as Style | undefined,
        occasion: input.occasion as Occasion | undefined,
        maxPrice: input.maxPrice as number | undefined,
        color: input.color as string | undefined,
        gender: input.gender as string | undefined,
        query: input.query as string | undefined,
      });
      return {
        result: found.map((p) => ({
          slug: p.slug,
          name: p.name,
          price: p.salePrice ?? p.price,
          originalPrice: p.salePrice ? p.price : undefined,
          category: p.category,
          subcategory: p.subcategory,
          colors: p.colors,
          styles: p.styles,
          material: p.material,
        })),
        products: found,
      };
    }
    case "get_product": {
      const product = getProductBySlug(input.slug as string);
      if (!product) return { result: { error: "Product not found" } };
      return { result: product, products: [product] };
    }
    case "build_outfit": {
      const slugs = input.productSlugs as string[];
      const outfitProducts = slugs
        .map((slug) => products.find((p) => p.slug === slug))
        .filter(Boolean) as Product[];
      const totalPrice = outfitProducts.reduce((sum, p) => sum + (p.salePrice ?? p.price), 0);
      return {
        result: {
          name: input.name,
          items: outfitProducts.map((p) => ({ name: p.name, slug: p.slug, price: p.salePrice ?? p.price })),
          totalPrice,
          occasion: input.occasion,
        },
        products: outfitProducts,
      };
    }
    default:
      return { result: { error: "Unknown tool" } };
  }
}

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        content: "AI Stylist is temporarily unavailable. Add ANTHROPIC_API_KEY to .env.local\n\nIn the meantime, browse the collection manually! 🛍️",
        products: [],
      },
      { status: 200 }
    );
  }

  const body = await request.json();
  const userMessages = body.messages;

  if (!Array.isArray(userMessages) || userMessages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  // Sanitize messages - only allow role and content
  const sanitizedMessages = userMessages.map((m: { role: string; content: string }) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: String(m.content).slice(0, 2000),
  }));

  let allProducts: Product[] = [];
  let messages = sanitizedMessages;
  let finalContent = "";

  // Tool use loop (max 5 iterations to prevent infinite loops)
  for (let i = 0; i < 5; i++) {
    let response: Response | null = null;

    // Retry up to 3 times on transient errors (429, 529)
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          tools,
          messages,
        }),
      });

      if (response.ok || (response.status !== 429 && response.status !== 529)) break;

      // Wait before retrying: 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }

    if (!response || !response.ok) {
      const error = response ? await response.text() : "No response";
      const status = response?.status ?? 0;
      console.error("Claude API error:", status, error);
      return NextResponse.json(
        { content: `Sorry, I'm having a temporary issue (${status}). Please try again!`, products: [] },
        { status: 200 }
      );
    }

    const data = await response.json();

    // Check for tool use
    if (data.stop_reason === "tool_use") {
      const toolBlocks = data.content.filter((b: { type: string }) => b.type === "tool_use");
      const textBlocks = data.content.filter((b: { type: string }) => b.type === "text");

      if (textBlocks.length > 0) {
        finalContent += textBlocks.map((b: { text: string }) => b.text).join("\n");
      }

      // Execute tools
      const toolResults = toolBlocks.map((block: { id: string; name: string; input: Record<string, unknown> }) => {
        const { result, products: foundProducts } = executeTool(block.name, block.input);
        if (foundProducts) allProducts.push(...foundProducts);
        return {
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: JSON.stringify(result),
        };
      });

      // Add assistant response and tool results to messages for next iteration
      messages = [
        ...messages,
        { role: "assistant", content: data.content },
        { role: "user", content: toolResults },
      ];
    } else {
      // Final text response
      const textBlocks = data.content.filter((b: { type: string }) => b.type === "text");
      finalContent += textBlocks.map((b: { text: string }) => b.text).join("\n");
      break;
    }
  }

  // Deduplicate products
  const uniqueProducts = Array.from(
    new Map(allProducts.map((p) => [p.id, p])).values()
  );

  return NextResponse.json({
    content: finalContent,
    products: uniqueProducts.slice(0, 8),
  });
}
