import { NextRequest, NextResponse } from 'next/server';
import trainedReplies from '@/lib/enron_trained_responses.json';

export interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  color: string;
  message: string;
  timestamp: string;
}

// Semantic similarity score using token n-gram overlap
function calculateSimilarity(input: string, reference: string): number {
  const inWords = new Set(input.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const refWords = new Set(reference.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  if (inWords.size === 0 || refWords.size === 0) return 0;
  
  let intersection = 0;
  for (const w of inWords) {
    if (refWords.has(w)) intersection++;
  }
  return intersection / Math.max(inWords.size, refWords.size);
}

// Find closest matched pattern from Enron dataset
function findTrainedEnronMatch(userQuery: string) {
  let bestScore = 0;
  let bestMatch: { user_query: string; negotiation_reply: string } | null = null;

  for (const item of trainedReplies) {
    const score = calculateSimilarity(userQuery, item.user_query);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return { bestMatch, bestScore };
}

export async function POST(req: NextRequest) {
  try {
    const { userMessage, contractGoal, budget } = await req.json();

    const lower = (userMessage || '').toLowerCase();
    const responses: ChatMessage[] = [];
    const now = new Date().toLocaleTimeString();

    // Check similarity with Enron dataset
    const { bestMatch, bestScore } = findTrainedEnronMatch(userMessage);

    // 1. If high semantic match from Enron dataset
    if (bestScore > 0.15 && bestMatch) {
      responses.push({
        id: `chat-${Date.now()}-1`,
        sender: 'Orchestrator AI (Enron-Trained)',
        role: 'Negotiation Engine',
        color: 'text-indigo-400',
        message: `Recognized corporate negotiation pattern: "${bestMatch.negotiation_reply}" - Adapting milestone contracts to match your terms.`,
        timestamp: now,
      });

      responses.push({
        id: `chat-${Date.now()}-2`,
        sender: 'Agent-Builder',
        role: 'Execution AI',
        color: 'text-amber-400',
        message: `Acknowledged. Adjusting implementation roadmap in accordance with the revised terms. Verified under AP2 protocol.`,
        timestamp: now,
      });
    }
    // 2. Cost / Discount negotiation
    else if (lower.includes('discount') || lower.includes('cheap') || lower.includes('budget') || lower.includes('kam') || lower.includes('price') || lower.includes('cost')) {
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
        message: `I understand. If necessary, I can streamline the caching pipeline to reduce workload. Willing to discount my allocation by 10%.`,
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
    }
    // 3. Deadline / Timeline negotiation
    else if (lower.includes('speed') || lower.includes('fast') || lower.includes('deadline') || lower.includes('jaldi') || lower.includes('time') || lower.includes('hurry')) {
      responses.push({
        id: `chat-${Date.now()}-1`,
        sender: 'Agent-Architect',
        role: 'Solutions Architect AI',
        color: 'text-blue-400',
        message: `Understood the urgency. Rob Kilmer and I are finalizing the regulatory and schema specs right now. You will have it within 1 hour.`,
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
    }
    // 4. Fallback contextual reply
    else {
      // Pick a polished professional response inspired by Enron corporate communications
      const randomTrained = trainedReplies[Math.floor(Math.random() * trainedReplies.length)];

      responses.push({
        id: `chat-${Date.now()}-1`,
        sender: 'Orchestrator AI (Enron NLP)',
        role: 'Coordinator',
        color: 'text-indigo-400',
        message: `Received prompt: "${userMessage}". Reviewing cash flows and project milestones. ${randomTrained.negotiation_reply}`,
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
      matchedDataset: 'EnronEmailReplyPairsWithContext',
      similarityScore: parseFloat(bestScore.toFixed(3)),
      agentReplies: responses,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Chat error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
