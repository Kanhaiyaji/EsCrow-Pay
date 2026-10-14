/**
 * Groq Ultra-Fast AI Inference Integration for EsCrow Pay
 * Supports llama-3.3-70b-versatile and openai/gpt-oss-120b
 * Provides contract goal decomposition and real-time agent negotiation.
 */

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callGroqChat(
  messages: GroqChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: 'json_object' | 'text' };
  } = {}
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.startsWith('your_')) {
    return null; // Gracefully fallback when key is not configured
  }

  const model = options.model || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 2048,
        response_format: options.responseFormat,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`[Groq API] HTTP ${response.status}: ${await response.text().catch(() => '')}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn('[Groq API] Network or timeout error:', err);
    return null;
  }
}
