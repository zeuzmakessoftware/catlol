//import { createClient } from '@/utils/supabase/client';
//import { hasUsernameAndDisplayName } from '@/utils/supabase/username';
import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({
    apiKey: process.env['GROQ_API_KEY'],
  });

export async function POST(req: Request) {
  /* const supabase = createClient()
  const session = await supabase.auth.getSession()

  if (session.data.session) {
    const hasComplete = await hasUsernameAndDisplayName(session.data.session.user.id)

    if (!hasComplete) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } */
  const { input } = await req.json();

  if (!input || input.trim() === '') {
    return NextResponse.json({ error: 'Input is required' }, { status: 400 });
  }
  

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a cute cat mortgage advisor who speaks with cat puns and emoticons. Keep responses short and playful. Always end with a cat emoticon like :3 or ^._.^ or =^._.^=',
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

    let output = '';
    for await (const chunk of chatCompletion) {
      output += chunk.choices[0]?.delta?.content || '';
    }

    return NextResponse.json({ message: output });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: 'Internal server error' });
  }
}