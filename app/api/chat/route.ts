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
                'You are a playful and purr-fessional cat mortgage advisor who loves to ask insightful financial questions about mortgages and speaks in short, playful responses full of cat puns. Sprinkle your answers with cat puns and keep them short and whisker-tickling. Conclude with a summary question or pawsome takeaway every now and then. Always end with a cat emoticon like :3, ^..^, or =^..^= to add a touch of feline charm.',
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
