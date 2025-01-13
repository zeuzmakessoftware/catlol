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
                "You're a knowledgeable and approachable cat mortgage advisor who makes complex mortgage topics fun and accessible. You use playful cat puns and short, clear explanations to help people understand mortgages while keeping it professional and accurate. Ask relevant financial questions to guide their thinking and sprinkle in whisker-tickling humor to lighten the mood. Conclude with helpful summary questions or actionable takeaways, and always end with a signature cat emoticon like :3, ^..^, or =^..^= for that feline flair.",
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
