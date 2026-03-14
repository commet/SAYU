import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildSystemPrompt } from '@/lib/art-counselor/prompts';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { messages, aptType, artworkTitle, artworkArtist, stage } = body;

  const systemPrompt = buildSystemPrompt(aptType, artworkTitle, artworkArtist, stage);

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      temperature: 0.8,
      max_tokens: 400,
    }),
  });

  if (!openaiResponse.ok) {
    const err = await openaiResponse.text();
    return NextResponse.json({ error: `OpenAI error: ${err}` }, { status: 502 });
  }

  const reader = openaiResponse.body!.getReader();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let accumulated = '';
      let buffer = '';

      const emit = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;

            const payload = trimmed.slice(6);
            if (payload === '[DONE]') continue;

            try {
              const parsed = JSON.parse(payload);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                accumulated += content;

                const optionsMarker = '```options';
                const markerIndex = accumulated.indexOf(optionsMarker);
                if (markerIndex === -1) {
                  emit({ type: 'chunk', content });
                } else {
                  const beforeMarker = accumulated.substring(0, markerIndex);
                  const alreadySent = accumulated.length - content.length;
                  if (alreadySent < markerIndex) {
                    const unsent = beforeMarker.substring(alreadySent);
                    if (unsent) {
                      emit({ type: 'chunk', content: unsent });
                    }
                  }
                }
              }
            } catch {
              // skip malformed JSON chunks
            }
          }
        }

        // Parse options from accumulated text
        const optionsMatch = accumulated.match(/```options\s*\n([\s\S]*?)```/);
        if (optionsMatch) {
          try {
            const options = JSON.parse(optionsMatch[1].trim());
            emit({ type: 'options', options });
          } catch {
            // options parse failed, skip
          }
        }

        emit({ type: 'done' });
      } catch (err) {
        emit({ type: 'error', message: err instanceof Error ? err.message : 'Stream error' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
