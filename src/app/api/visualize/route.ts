import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { products } from "@/data/products";

export async function POST(req: NextRequest) {
  const { productIds } = await req.json() as { productIds: string[] };

  if (!productIds?.length) {
    return NextResponse.json({ error: "No product IDs provided" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  const selected = products.filter((p) => productIds.includes(p.id));
  if (!selected.length) {
    return NextResponse.json({ error: "Products not found" }, { status: 404 });
  }

  // Determine model gender from product genders (men > women > unisex)
  const genders = selected.map((p) => p.gender);
  const modelGender = genders.includes("men")
    ? "male"
    : genders.includes("women")
    ? "female"
    : "male";

  // Read product images from public/ folder
  const imageParts = selected
    .map((product) => {
      const imagePath = product.images[0]; // e.g. "/products/01-linen-shirt-oversize.png"
      const filePath = path.join(process.cwd(), "public", imagePath);
      if (!fs.existsSync(filePath)) return null;
      const buffer = fs.readFileSync(filePath);
      return {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: "image/png" as const,
        },
      };
    })
    .filter(Boolean);

  if (!imageParts.length) {
    return NextResponse.json({ error: "Could not read product images" }, { status: 500 });
  }

  const itemNames = selected.map((p) => p.name).join(", ");
  const prompt = `You are a fashion photographer. Generate a high-quality editorial fashion photograph of a real ${modelGender} human model wearing these exact clothing items: ${itemNames}.

The model should be styled in a natural, confident pose — standing or walking — as if photographed for a fashion magazine or e-commerce brand. The background should be clean and minimal (white studio, soft grey, or a light lifestyle setting). The clothing items should be clearly recognizable and styled together as a complete outfit. Professional studio lighting, photorealistic quality. No text, no watermarks.`;

  const client = new GoogleGenAI({ apiKey });

  const response = await client.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: [prompt, ...imageParts],
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: "3:4",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if ((part as { inlineData?: { data: string } }).inlineData?.data) {
      const data = (part as { inlineData: { data: string } }).inlineData.data;
      return NextResponse.json({ image: `data:image/png;base64,${data}` });
    }
  }

  return NextResponse.json({ error: "Gemini returned no image" }, { status: 500 });
}
