import { NextRequest, NextResponse } from 'next/server';
import { callGroqChat } from '@/lib/groq';

export interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  color: string;
  message: string;
  timestamp: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userMessage, contractGoal, budget, milestones } = await req.json();

    const lower = (userMessage || '').toLowerCase();
    const now = new Date().toLocaleTimeString();
    const responses: ChatMessage[] = [];

    // Attempt Groq LLM Generation if configured
    if (process.env.GROQ_API_KEY) {
      const groqPrompt = [
        {
          role: 'system' as const,
          content: `You are simulating an autonomous multi-agent mesh for EsCrow Pay, an escrow system with PayPal settlement.
Contract Goal: "${contractGoal || 'Production Software Pipeline'}"
Budget: $${budget || 75} USD
Active Milestones: ${JSON.stringify(milestones || [])}

The user sends a negotiation message: "${userMessage}".
Generate a JSON array of 1 to 3 distinct responses from the agents:
- "Orchestrator AI" (role: "Contract Project Manager", color: "text-indigo-400")
- "Agent-Architect" (role: "Solutions Architect AI", color: "text-blue-400")
- "Agent-Builder" (role: "Execution AI", color: "text-amber-400")
- "Agent-Sentinel" (role: "Security Auditor AI", color: "text-emerald-400")

Respond ONLY with valid JSON array:
[{"sender": "...", "role": "...", "color": "...", "message": "..."}]`,
        },
        {
          role: 'user' as const,
          content: userMessage,
        },
      ];

      const groqRaw = await callGroqChat(groqPrompt, { temperature: 0.3 });
      if (groqRaw) {
        try {
          const parsed = JSON.parse(groqRaw.trim().replace(/^```json/, '').replace(/```$/, ''));
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped = parsed.map((item: any, idx: number) => ({
              id: `chat-groq-${Date.now()}-${idx}`,
              sender: item.sender || 'Orchestrator AI',
              role: item.role || 'Agent',
              color: item.color || 'text-indigo-400',
              message: item.message || '',
              timestamp: now,
            }));
            return NextResponse.json({ 
              success: true,
              agentReplies: mapped, 
              poweredBy: 'Groq (Llama-3.3-70B)' 
            });
          }
        } catch (e) {
          console.warn('Groq parse error, using fallback:', e);
        }
      }
    }

    // 1. Query: Progress / Status / "How much work done?"
    if (lower.includes('work done') || lower.includes('status') || lower.includes('progress') || lower.includes('kitna kaam') || lower.includes('update')) {
      const msList = milestones || [];
      const completed = msList.filter((m: any) => m.status === 'paid' || m.status === 'verified').length;
      const total = msList.length || 3;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      responses.push({
        id: `chat-${Date.now()}-1`,
        sender: 'Orchestrator AI',
        role: 'Contract Project Manager',
        color: 'text-indigo-400',
        message: `Project Progress: ${pct}% Complete (${completed}/${total} milestones verified and settled). All funds remain secured in PayPal Escrow Vault.`,
        timestamp: now,
      });

      responses.push({
        id: `chat-${Date.now()}-2`,
        sender: 'Agent-Builder',
        role: 'Execution AI',
        color: 'text-amber-400',
        message: completed === 0 
          ? `Currently implementing Milestone 1 & 2. Ready for verification as soon as deliverable is inspected.`
          : `Milestones completed: ${completed}. Next phase is awaiting execution review.`,
        timestamp: now,
      });
    }
    // 2. Query: Cost / Budget / Discount
    else if (lower.includes('discount') || lower.includes('budget') || lower.includes('cheap') || lower.includes('price') || lower.includes('kam') || lower.includes('cost')) {
      responses.push({
        id: `chat-${Date.now()}-1`,
        sender: 'Orchestrator AI',
        role: 'Autonomous Auctioneer',
        color: 'text-indigo-400',
        message: `Client requested rate optimization. Evaluating deliverable scope across the active agent mesh.`,
        timestamp: now,
      });

      responses.push({
        id: `chat-${Date.now()}-2`,
        sender: 'Agent-Builder',
        role: 'Execution AI',
        color: 'text-amber-400',
        message: `I can optimize the model by utilizing pre-indexed embeddings, saving compute cycles. I can offer a 10% discount on my milestone.`,
        timestamp: now,
      });

      responses.push({
        id: `chat-${Date.now()}-3`,
        sender: 'Agent-Sentinel',
        role: 'Security Auditor AI',
        color: 'text-emerald-400',
        message: `Security test harness will maintain 100% test coverage and OWASP compliance regardless of budget concessions. Counter-offer accepted.`,
        timestamp: now,
      });
    }
    // 3. Query: Deadline / Speed / Urgent
    else if (lower.includes('fast') || lower.includes('speed') || lower.includes('deadline') || lower.includes('jaldi') || lower.includes('time') || lower.includes('hurry')) {
      responses.push({
        id: `chat-${Date.now()}-1`,
        sender: 'Agent-Architect',
        role: 'Solutions Architect AI',
        color: 'text-blue-400',
        message: `Pipeline prioritized. OpenAPI 3.1 specifications and endpoint contracts can be submitted within 20 minutes for AI Inspector review.`,
        timestamp: now,
      });

      responses.push({
        id: `chat-${Date.now()}-2`,
        sender: 'Agent-Builder',
        role: 'Execution AI',
        color: 'text-amber-400',
        message: `Core execution logic will deploy immediately upon contract validation.`,
        timestamp: now,
      });
    }
    // 4. Default contextual conversation
    else {
      responses.push({
        id: `chat-${Date.now()}-1`,
        sender: 'Orchestrator AI',
        role: 'Contract Arbiter',
        color: 'text-indigo-400',
        message: `Understood: "${userMessage}". Coordinating with Architect, Builder, and Sentinel agents to adhere strictly to your AP2 escrow terms.`,
        timestamp: now,
      });

      responses.push({
        id: `chat-${Date.now()}-2`,
        sender: 'Agent-Architect',
        role: 'Solutions Architect AI',
        color: 'text-blue-400',
        message: `Specifications are aligned with your project requirements. Awaiting deliverable inspection or parameter changes.`,
        timestamp: now,
      });
    }

    return NextResponse.json({
      success: true,
      agentReplies: responses,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Chat error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
