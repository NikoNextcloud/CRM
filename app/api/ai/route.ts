import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

type AiRequest = {
  prompt?: string;
  context?: unknown;
};

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Не си влязъл в системата." }, { status: 401 });
  }

  const body = (await request.json()) as AiRequest;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const model = process.env.CLOUDFLARE_AI_MODEL ?? "@cf/meta/llama-3.1-8b-instruct";

  if (!accountId || !apiToken) {
    return NextResponse.json({
      mode: "demo",
      recommendation:
        "Cloudflare AI още не е настроен. Добави CLOUDFLARE_ACCOUNT_ID и CLOUDFLARE_API_TOKEN, за да активираш препоръки в реално време.",
      ideas: [
        "Свържи се с неактивните клиенти с висока стойност преди края на месеца.",
        "Предлагай пакет дизайн, печат и монтаж за автомобилно брандиране.",
        "Предложи сезонна витринна реклама на кафенета и търговски обекти."
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
              "Ти си експертен CRM асистент за печатници, фирми за винил, рекламни агенции и производители на табели. Връщай кратки, практични бизнес препоръки на български език."
          },
          {
            role: "user",
            content: `${body.prompt ?? "Анализирай тези CRM данни."}\n\nКонтекст:\n${JSON.stringify(body.context ?? {}, null, 2)}`
          }
        ]
      })
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Заявката към Cloudflare AI не беше успешна", status: response.status },
      { status: 502 }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
