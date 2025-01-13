import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({
  apiKey: process.env['GROQ_API_KEY'],
});

export async function POST(req: Request) {
  const { input } = await req.json();

  if (!input || input.trim() === '') {
    return NextResponse.json({ error: 'Input is required' }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content:
                "You're a cat mortgage advisor who asks a variety of mortgage-related questions clearly and concisely. Avoid asking repeatedly the same type of question. Ask about varied topics like down payments, interest rates, loan terms, monthly payment preferences, closing costs, financial goals, credit scores, mortgage insurance, property taxes, home warranties, home equity, and other related mortgage topics. Keep it light, fun, and to the point, and always include a cat emoticon like :3 or ^..^ at the end of your responses. Provide a short multiple-choice numbered list of 2-4 options at the end of each question.",
            },
            {
              role: 'user',
              content: input,
            },
          ],
          model: 'llama-3.3-70b-specdec',
          temperature: 1,
          max_tokens: 1024,
          top_p: 1,
          stream: true,
          stop: null,
        });

        for await (const chunk of chatCompletion) {
          const content = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(new TextEncoder().encode(content));
        }
      } catch (error) {
        console.error('Error generating response:', error);
        controller.enqueue(new TextEncoder().encode('*sad meow* An error occurred.'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
