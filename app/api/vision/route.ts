import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { image } = await req.json();

  const NEBIUS_API_KEY = process.env.NEBIUS_API_KEY;

  if (!NEBIUS_API_KEY) {
    return NextResponse.json({ error: "NEBIUS_API_KEY is not set" }, { status: 500 });
  }

  try {
    const response = await fetch("https://api.studio.nebius.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NEBIUS_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llava-hf/llava-1.5-13b-hf",
        messages: [
          {
            role: "system",
            content: "Analyze my outfit in the image and deliver a witty roast that connects their fashion choices to mortgage/real estate terminology in a couple sentences. Have the last sentence tell me to click you to continue with mortgage related questions.",
          },
          {
            role: "user",
            content: [
                {
                  type: "image_url",
                    image_url: {
                        url: `data:image/webp;base64,${image}`
                    }
                },
            ],
          },
        ],
        temperature: 0,
        prompt: "",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}