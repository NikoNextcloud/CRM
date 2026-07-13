import { NextResponse } from "next/server";

type AiRequest = {
  prompt?: string;
  context?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json()) as AiRequest;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const model = process.env.CLOUDFLARE_AI_MODEL ?? "@cf/meta/llama-3.1-8b-instruct";

  if (!accountId || !apiToken) {
    return NextResponse.json({
      mode: "demo",
      recommendation:
        "Cloudflare AI is not configured yet. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to enable live recommendations.",
      ideas: [
        "Contact inactive high-value clients before the end of the month.",
        "Bundle design, print and installation for vehicle branding orders.",
        "Offer seasonal window graphics to coffee shops and retail clients."
      ]
    });
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are an expert CRM assistant for print shops, vinyl printing companies and sign makers. Return concise, practical business recommendations."
          },
          {
            role: "user",
            content: `${body.prompt ?? "Analyze this CRM data."}\n\nContext:\n${JSON.stringify(body.context ?? {}, null, 2)}`
          }
        ]
      })
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Cloudflare AI request failed", status: response.status },
      { status: 502 }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
