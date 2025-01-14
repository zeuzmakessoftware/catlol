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
        model: "Qwen/Qwen2-VL-72B-Instruct",
        messages: [
          {
            role: "system",
            content: "Make the response short. Comically analyze myself(features and clothing) in the image in 2-3 sentences. Deliver a witty roast tying their fashion to mortgage or real estate terms. For example 'Looking at you, your style screams 'adjustable-rate personality'—starts bold but shifts unpredictably, like a house with curb appeal but a questionable foundation.",
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