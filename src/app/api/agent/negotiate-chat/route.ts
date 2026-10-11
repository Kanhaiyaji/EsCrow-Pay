import { NextRequest, NextResponse } from 'next/server';

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
    const { userMessage, contractGoal, budget, history } = await req.json();

    const lower = (userMessage || '').toLowerCase();
    const responses: ChatMessage[] = [];

    const now = new Date().toLocaleTimeString();

    // Contextual responses based on user query or negotiation
    if (lower.includes('discount') || lower.includes('cheap') || lower.includes('budget') || lower.includes('kam') || lower.includes('price')) {
      responses.push({
        id: `chat-${Date.now()}-1`,
        sender: 'Orchestrator AI',
        role: 'Coordinator',
        color: 'text-indigo-400',
        message: `Client requested cost optimization. Asking agents to re-evaluate their deliverables for budget constraints.`,
        timestamp: now,
      });

      responses.push({
        id: `chat-${Date.now()}-2`,
        sender: 'Agent-Builder',
        role: 'Execution AI',
        color: 'text-amber-400',
        message: `I can optimize the service by leveraging pre-indexed embeddings, reducing computational runtime. Willing to discount my allocation by 10%.`,
        timestamp: now,
      });

      responses.push({
        id: `chat-${Date.now()}-3`,
        sender: 'Agent-Sentinel',
        role: 'Auditor AI',
        color: 'text-emerald-400',
        message: `Security test harness will remain at 100% test coverage regardless of budget adjustment. Counter-offer accepted.`,
        timestamp: now,
      });
    } else if (lower.includes('speed') || lower.includes('fast') || lower.includes('deadline') || lower.includes('jaldi')) {
      responses.push({
        id: `chat-${Date.now()}-1`,
        sender: 'Agent-Architect',
        role: 'Solutions Architect AI',
        color: 'text-blue-400',
        message: `Prioritizing parallel execution pipelines. Schema contracts will be delivered in under 15 minutes.`,
        timestamp: now,
      });

      responses.push({
        id: `chat-${Date.now()}-2`,
        sender: 'Agent-Builder',
        role: 'Execution AI',
        color: 'text-amber-400',
        message: `Vectorized execution model ready to deploy as soon as PayPal Escrow custody lock confirms.`,
        timestamp: now,
      });
    } else {
      // General dynamic AI response
      responses.push({
        id: `chat-${Date.now()}-1`,
        sender: 'Orchestrator AI',
        role: 'Coordinator',
        color: 'text-indigo-400',
        message: `Received prompt: "${userMessage}". Updating project parameters and aligning agent mesh deliverables accordingly.`,
        timestamp: now,
      });

      responses.push({
        id: `chat-${Date.now()}-2`,
        sender: 'Agent-Architect',
        role: 'Solutions Architect AI',
        color: 'text-blue-400',
        message: `I have incorporated your constraints into the OpenAPI 3.1 specification. The deliverable is verifiable via PayPal AP2 mandate.`,
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
