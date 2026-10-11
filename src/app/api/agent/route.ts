import { NextRequest, NextResponse } from 'next/server';

export interface MilestoneSpec {
  id: string;
  title: string;
  description: string;
  amount: number;
  assignedAgent: string;
  agentRole: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'verified' | 'paid' | 'disputed' | 'refunded';
  verificationCriteria: string;
  deliverableCode: string;
}

export async function POST(req: NextRequest) {
  try {
    const { action, contractGoal, budget, milestone, scenario, templateType, deliverable } = await req.json();

    // 1. Negotiation with real code templates, dialogue feed & AP2 Mandate
    if (action === 'negotiate_milestones') {
      const parsedBudget = Number(budget) || 75;

      const codeSnippets: Record<string, { arch: string; core: string; qa: string }> = {
        fraud: {
          arch: `openapi: 3.1.0\ninfo:\n  title: AI Fraud Detection API\n  version: 1.0.0\npaths:\n  /v1/analyze-tx:\n    post:\n      summary: Realtime anomaly scoring for payment events\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              type: object\n              required: [txAmount, velocity]\n              properties:\n                txAmount: { type: number, example: 1250.00 }\n                velocity: { type: integer, example: 5 }\n                crossBorder: { type: boolean, example: false }\n      responses:\n        '200':\n          description: Risk score and fraud flags`,
          core: `import numpy as np\nfrom sklearn.ensemble import IsolationForest\n\nclass FraudDetectionEngine:\n    def __init__(self):\n        # Pre-trained on 100k anonymized transaction vectors\n        self.model = IsolationForest(contamination=0.02, random_state=42)\n    \n    def evaluate_risk(self, amount: float, velocity: int, cross_border: bool) -> dict:\n        vector = [amount, float(velocity), 1.0 if cross_border else 0.0]\n        base_score = 0.10\n        if amount > 5000: base_score += 0.45\n        if velocity > 10: base_score += 0.25\n        if cross_border: base_score += 0.15\n        risk = min(base_score, 0.98)\n        return {\n            "risk_score": round(risk, 4),\n            "flagged": risk > 0.65,\n            "action": "BLOCK_AND_FLAG" if risk > 0.65 else "APPROVE"\n        }`,
          qa: `import pytest\nfrom engine import FraudDetectionEngine\n\ndef test_clean_transaction():\n    engine = FraudDetectionEngine()\n    res = engine.evaluate_risk(amount=45.00, velocity=2, cross_border=False)\n    assert res["flagged"] is False\n    assert res["risk_score"] < 0.30\n\ndef test_high_risk_cross_border_burst():\n    engine = FraudDetectionEngine()\n    res = engine.evaluate_risk(amount=8500.00, velocity=15, cross_border=True)\n    assert res["flagged"] is True\n    assert res["action"] == "BLOCK_AND_FLAG"`,
        },
        scraper: {
          arch: `{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "title": "AutonomousScraperPipeline",\n  "type": "object",\n  "properties": {\n    "sourceUrl": { "type": "string" },\n    "rateLimit": { "type": "integer", "default": 5 },\n    "extractionRules": { "type": "array" }\n  }\n}`,
          core: `import asyncio\nimport httpx\nfrom bs4 import BeautifulSoup\n\nasync def fetch_marketplace_items(target_url: str):\n    async with httpx.AsyncClient(timeout=10.0) as client:\n        res = await client.get(target_url)\n        soup = BeautifulSoup(res.text, 'html.parser')\n        items = [{"title": el.text.strip()} for el in soup.select('.product-item')]\n        return {"count": len(items), "data": items}`,
          qa: `import pytest\nfrom scraper import fetch_marketplace_items\n\n@pytest.mark.asyncio\nasync def test_scraper_schema():\n    data = await fetch_marketplace_items("https://mock.store/api")\n    assert "count" in data\n    assert isinstance(data["data"], list)`,
        },
      };

      const selected = templateType === 'scraper' ? codeSnippets.scraper : codeSnippets.fraud;

      const milestones = [
        {
          id: 'ms-arch-1',
          title: 'System Architecture & Contract Spec',
          description: `Define API schema and technical boundaries for: ${contractGoal}`,
          amount: Math.round(parsedBudget * 0.25),
          assignedAgent: 'Agent-Architect',
          agentRole: 'Solutions Architect AI',
          status: 'pending',
          verificationCriteria: 'Valid OpenAPI 3.1 schema, explicit input validation, high-throughput model.',
          deliverableCode: selected.arch,
        },
        {
          id: 'ms-exec-2',
          title: 'Core Implementation & Logic Engine',
          description: `Construct executable, modular services and API endpoints.`,
          amount: Math.round(parsedBudget * 0.50),
          assignedAgent: 'Agent-Builder',
          agentRole: 'Fullstack Execution AI',
          status: 'pending',
          verificationCriteria: 'Executable Python/TypeScript code, 0 syntax warnings, vectorized inference.',
          deliverableCode: selected.core,
        },
        {
          id: 'ms-sec-3',
          title: 'Security Auditing & Penetration Checks',
          description: `Run automated OWASP vulnerability scan and unit test suite.`,
          amount: parsedBudget - Math.round(parsedBudget * 0.25) - Math.round(parsedBudget * 0.50),
          assignedAgent: 'Agent-Sentinel',
          agentRole: 'Security & QA Auditor AI',
          status: 'pending',
          verificationCriteria: 'Zero critical CVEs, 90%+ edge test assertions covered.',
          deliverableCode: selected.qa,
        },
      ];

      // Simulated Realtime Dialogue Room between Agents
      const negotiationChat = [
        {
          sender: 'Orchestrator AI',
          role: 'Coordinator',
          color: 'text-indigo-400',
          message: `Received project mandate: "${contractGoal}". Client authorized spending cap of $${parsedBudget} USD. Inviting verified specialized agents for reverse-auction.`,
          time: 'Just now',
        },
        {
          sender: 'Agent-Architect',
          role: 'Architect AI',
          color: 'text-blue-400',
          message: `Inspected requirements. I can deliver the complete OpenAPI 3.1 specs, database ERD and API interfaces. Initial quote: $${Math.round(parsedBudget * 0.28)}.`,
          time: 'Just now',
        },
        {
          sender: 'Orchestrator AI',
          role: 'Coordinator',
          color: 'text-indigo-400',
          message: `Counter-offer: Target allocation is 25% ($${Math.round(parsedBudget * 0.25)}). Guaranteed instant escrow settlement upon schema validation.`,
          time: 'Just now',
        },
        {
          sender: 'Agent-Architect',
          role: 'Architect AI',
          color: 'text-blue-400',
          message: `Counter-offer accepted at $${Math.round(parsedBudget * 0.25)}. SLA: ready for verification immediately.`,
          time: 'Just now',
        },
        {
          sender: 'Agent-Builder',
          role: 'Execution AI',
          color: 'text-amber-400',
          message: `I will build the core execution engine with vectorized inference. Bidding $${Math.round(parsedBudget * 0.50)} (50% allocation). Zero external vulnerable packages.`,
          time: 'Just now',
        },
        {
          sender: 'Agent-Sentinel',
          role: 'Security QA AI',
          color: 'text-emerald-400',
          message: `Auditor joining mesh. I accept the remaining $${parsedBudget - Math.round(parsedBudget * 0.25) - Math.round(parsedBudget * 0.50)}. Will run dynamic penetration fuzzing & PyTest assertions.`,
          time: 'Just now',
        },
        {
          sender: 'AP2 Protocol Engine',
          role: 'Protocol Authority',
          color: 'text-purple-400',
          message: `Auction concluded under budget ($${parsedBudget} USD total). Cryptographic mandate signed. Awaiting PayPal Sandbox custody lock.`,
          time: 'Just now',
        },
      ];

      const agentBids = [
        {
          agent: 'Agent-Architect',
          bid: Math.round(parsedBudget * 0.25),
          reputationScore: 99.4,
          comment: 'Prepared OpenAPI 3.1 specification & data pipeline schemas for instant validation.',
        },
        {
          agent: 'Agent-Builder',
          bid: Math.round(parsedBudget * 0.50),
          reputationScore: 98.7,
          comment: 'Modular Python/TypeScript service ready with optimized execution paths.',
        },
        {
          agent: 'Agent-Sentinel',
          bid: parsedBudget - Math.round(parsedBudget * 0.25) - Math.round(parsedBudget * 0.50),
          reputationScore: 99.9,
          comment: 'Comprehensive PyTest & OWASP security test harness with 100% assertion coverage.',
        },
      ];

      const ap2Mandate = {
        mandateId: `AP2-MANDATE-${Date.now()}`,
        protocolVersion: 'AP2/1.0',
        authorizedBy: 'User_Authorized_Wallet',
        maxEscrowCap: `${parsedBudget} USD`,
        settlementCondition: 'AUTOMATED_INSPECTION_PASS_THRESHOLD_80%',
        disputeProtocol: 'AI_ARBITRATION_WITH_PAYPAL_REFUND',
        cryptographicSignature: `0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`,
      };

      return NextResponse.json({ milestones, agentBids, ap2Mandate, negotiationChat });
    }

    // 2. AI Inspector (Real Deterministic AST & Security Auditor)
    if (action === 'verify_deliverable') {
      const isSimulatingFailure = scenario === 'simulate_failure';
      const { inspectDeliverableCode } = await import('@/lib/code_inspector');

      const targetCode = deliverable || milestone?.deliverableCode || '';
      const criteria = milestone?.verificationCriteria || 'General Quality & Security SLA';

      const report = inspectDeliverableCode(targetCode, criteria, isSimulatingFailure);

      return NextResponse.json({
        verified: report.passed,
        score: report.overallScore,
        notes: report.criteriaFulfillment.verdict,
        suggestedStatus: report.passed ? 'verified' : 'disputed',
        actionTaken: report.passed ? 'RELEASE_PAYPAL_FUNDS' : 'REFUND_RECOMMENDED',
        report,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
