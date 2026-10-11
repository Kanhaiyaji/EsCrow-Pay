'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  RefreshCw, 
  Sparkles, 
  Lock, 
  ChevronRight, 
  Fingerprint, 
  Undo2, 
  Sliders, 
  Binary,
  CreditCard,
  Code2,
  FileText,
  PlayCircle,
  MessagesSquare,
  Play,
  Terminal,
  PlusCircle,
  Download,
  Trash2,
  DollarSign
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { EscrowContract, ContractMilestone } from '@/types/contract';
import EcpLogo from '@/components/EcpLogo';

export default function EscrowPayDashboard() {
  const [goal, setGoal] = useState('Build an AI-Powered Fraud Detection Microservice with REST APIs');
  const [budget, setBudget] = useState(75);
  const [currency] = useState('USD');
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [contract, setContract] = useState<EscrowContract | null>(null);
  const [fundingLoading, setFundingLoading] = useState(false);
  const [executingMilestone, setExecutingMilestone] = useState<string | null>(null);
  const [testScenario, setTestScenario] = useState<'normal' | 'failure'>('normal');
  const [activeTab, setActiveTab] = useState<'topology' | 'chat'>('topology');

  // Modals
  const [showMandateModal, setShowMandateModal] = useState(false);
  const [selectedMilestoneCode, setSelectedMilestoneCode] = useState<ContractMilestone | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ContractMilestone | null>(null);

  // Live Test Playground
  const [testingPayload, setTestingPayload] = useState({ txAmount: 1250, velocity: 4, crossBorder: false });
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Custom Milestone Creator state
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customAmount, setCustomAmount] = useState(15);
  const [customAgent, setCustomAgent] = useState('Agent-Architect');

  // Real-time Chat with Agents state
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'BAAmBsUf3aIIoRcL-D5RcunYSC6jf2eFkdbyRezRQNH2xrhpncxM3_5H6m6tqmRc4jqIXbG7VbZyivIzhw';

  // Persistent storage (Loads previous contract & chat history from localStorage)
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('escrowpay_active_contract');
      if (saved) {
        const parsed = JSON.parse(saved);
        setContract(parsed);
      }
    } catch (e) {
      console.warn('Failed to restore contract from storage', e);
    }
  }, []);

  // Save to localStorage whenever contract changes
  React.useEffect(() => {
    if (contract) {
      try {
        localStorage.setItem('escrowpay_active_contract', JSON.stringify(contract));
      } catch (e) {
        console.warn('Failed to save contract to storage', e);
      }
    }
  }, [contract]);

  // Preset Handlers
  const handleSelectTemplate = (tmplGoal: string, tmplBudget: number) => {
    setGoal(tmplGoal);
    setBudget(tmplBudget);
  };

  // 1. Trigger Agentic Milestone Negotiation
  const handleNegotiate = async (isDemo: boolean = false) => {
    setIsNegotiating(true);
    try {
      const isScraper = goal.toLowerCase().includes('scraper');
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'negotiate_milestones',
          contractGoal: goal,
          budget: Number(budget),
          templateType: isScraper ? 'scraper' : 'fraud',
        }),
      });
      const data = await res.json();

      const newContract: EscrowContract = {
        id: `CTR-${Date.now()}`,
        title: goal,
        description: `Autonomous Escrow agreement managed by EscrowPay AI with PayPal Settlement.`,
        clientName: 'Alex Carter (Client)',
        clientEmail: 'client@example.com',
        totalBudget: Number(budget),
        currency: currency,
        status: isDemo ? 'funded_in_escrow' : 'draft',
        paypalOrderId: isDemo ? `MOCK-DEMO-ORD-${Date.now()}` : undefined,
        paypalCaptureId: isDemo ? `MOCK-DEMO-CAP-${Date.now()}` : undefined,
        isSimulatedDemo: isDemo,
        createdAt: new Date().toLocaleTimeString(),
        ap2Mandate: data.ap2Mandate,
        negotiationChat: data.negotiationChat,
        milestones: data.milestones,
        agentLogs: [
          ...(isDemo ? [{
            id: `log-demo-fund`,
            timestamp: new Date().toLocaleTimeString(),
            agentName: 'Demo Escrow Simulator',
            agentColor: 'text-emerald-400',
            message: `Instant Demo Escrow Active ($${budget} USD pre-funded). You can execute and verify milestones without logging into PayPal.`,
            type: 'info' as const,
          }] : []),
          {
            id: `log-mandate-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            agentName: 'AP2 Protocol Engine',
            agentColor: 'text-indigo-400',
            message: `Generated AP2 Mandate [${data.ap2Mandate.mandateId}]. Cryptographic spending cap: $${budget} USD.`,
            type: 'info',
          },
          {
            id: 'log-1',
            timestamp: new Date().toLocaleTimeString(),
            agentName: 'Orchestrator AI',
            agentColor: 'text-sky-400',
            message: `Decomposed goal into 3 milestones based on market rates ($${budget} total).`,
            type: 'bidding',
          },
          ...data.agentBids.map((b: { agent: string; comment: string; bid: number; reputationScore: number }, idx: number) => ({
            id: `log-bid-${idx}`,
            timestamp: new Date().toLocaleTimeString(),
            agentName: b.agent,
            agentColor: idx === 0 ? 'text-blue-400' : idx === 1 ? 'text-amber-400' : 'text-emerald-400',
            message: `Bid accepted: $${b.bid} (Reputation: ${b.reputationScore}%) - "${b.comment}"`,
            type: 'bidding' as const,
          })),
        ],
      };
      setContract(newContract);
    } catch (err) {
      console.error(err);
    } finally {
      setIsNegotiating(false);
    }
  };

  // Add Custom Milestone
  const handleAddCustomMilestone = () => {
    if (!contract || !customTitle) return;
    const newMs: ContractMilestone = {
      id: `ms-custom-${Date.now()}`,
      title: customTitle,
      description: `Custom deliverable: ${customTitle}`,
      amount: Number(customAmount) || 10,
      assignedAgent: customAgent,
      agentRole: customAgent === 'Agent-Architect' ? 'Solutions Architect AI' : customAgent === 'Agent-Builder' ? 'Fullstack Execution AI' : 'Security & QA Auditor AI',
      status: 'pending',
      verificationCriteria: 'Custom validation assertions and automated lint verification pass.',
      deliverableCode: `// Custom deliverable created by client\nexport const ${customTitle.replace(/\s+/g, '')} = async () => {\n  return { success: true, timestamp: Date.now() };\n};`,
    };

    setContract((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        totalBudget: prev.totalBudget + newMs.amount,
        milestones: [...prev.milestones, newMs],
        agentLogs: [
          {
            id: `log-add-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            agentName: 'Contract Manager',
            agentColor: 'text-sky-400',
            message: `Added custom milestone "${customTitle}" ($${newMs.amount} USD). Assigned to ${customAgent}.`,
            type: 'info',
          },
          ...prev.agentLogs,
        ],
      };
    });

    setCustomTitle('');
    setShowAddMilestone(false);
  };

  // Delete Milestone
  const handleDeleteMilestone = (id: string) => {
    if (!contract) return;
    setContract((prev) => {
      if (!prev) return null;
      const target = prev.milestones.find((m) => m.id === id);
      const updated = prev.milestones.filter((m) => m.id !== id);
      return {
        ...prev,
        totalBudget: Math.max(0, prev.totalBudget - (target?.amount || 0)),
        milestones: updated,
      };
    });
  };

  // Real-time Chat message sender
  const handleSendNegotiationMessage = async () => {
    if (!chatInput.trim() || !contract || isChatSending) return;
    const userText = chatInput.trim();
    setChatInput('');
    setIsChatSending(true);

    // Optimistically append user message
    const userMsg = {
      sender: 'You (Client)',
      role: 'Buyer',
      color: 'text-sky-300',
      message: userText,
      time: new Date().toLocaleTimeString(),
    };

    setContract((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        negotiationChat: [...(prev.negotiationChat || []), userMsg],
      };
    });

    try {
      const res = await fetch('/api/agent/negotiate-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userText,
          contractGoal: contract.title,
          budget: contract.totalBudget,
        }),
      });
      const data = await res.json();

      if (data.agentReplies) {
        setContract((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            negotiationChat: [
              ...(prev.negotiationChat || []),
              ...data.agentReplies.map((r: any) => ({
                sender: r.sender,
                role: r.role,
                color: r.color,
                message: r.message,
                time: r.timestamp,
              })),
            ],
          };
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatSending(false);
    }
  };

  // Live Test Execution in Browser
  const handleExecuteInteractiveTest = async (m: ContractMilestone) => {
    setTestRunning(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/agent/execute-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: m.id,
          inputData: testingPayload,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTestRunning(false);
    }
  };

  // Download Smart Contract HTML/Text
  const handleDownloadContract = () => {
    if (!contract) return;
    const content = `=====================================================
ESCROWPAY: AGENTIC COMMERCE SMART CONTRACT & AP2 MANDATE
=====================================================
CONTRACT ID: ${contract.id}
DATE: ${contract.createdAt}
CLIENT: ${contract.clientName} (${contract.clientEmail})
ESCROW PROTOCOL: AP2/1.0 - PAYPAL SANDBOX CUSTODY
PAYPAL ORDER ID: ${contract.paypalOrderId || 'NOT_FUNDED_YET'}
TOTAL ESCROW BUDGET: $${contract.totalBudget}.00 ${contract.currency}

CRYPTOGRAPHIC AP2 MANDATE:
- Mandate ID: ${contract.ap2Mandate?.mandateId}
- Authorization Cap: ${contract.ap2Mandate?.maxEscrowCap}
- Digital Signature: ${contract.ap2Mandate?.cryptographicSignature}
- Settlement Condition: ${contract.ap2Mandate?.settlementCondition}
- Dispute Protocol: ${contract.ap2Mandate?.disputeProtocol}

DECOMPOSED MILESTONES:
${contract.milestones.map((m, idx) => `
[${idx + 1}] ${m.title}
    Amount: $${m.amount} USD
    Assigned Agent: ${m.assignedAgent} (${m.agentRole})
    Status: ${m.status.toUpperCase()}
    Criteria: ${m.verificationCriteria}
    Payout Tx: ${m.payoutTxId || m.refundTxId || 'PENDING_SETTLEMENT'}
`).join('')}

AUDIT TRAIL LOGS:
${contract.agentLogs.map((l) => `[${l.timestamp}] [${l.agentName}]: ${l.message}`).join('\n')}

Generated by EsCrow Pay — Autonomous Settlement Layer for PayPal.
`;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `EscrowPay-Contract-${contract.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Real PayPal Order Creation Callback for PayPal Buttons
  const createOrder = async () => {
    if (!contract) throw new Error('Contract not initialized');
    setFundingLoading(true);
    const res = await fetch('/api/paypal/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', amount: contract.totalBudget, currency: contract.currency }),
    });
    const orderData = await res.json();
    if (!orderData.id) {
      setFundingLoading(false);
      throw new Error(orderData.error || 'Failed to create PayPal order');
    }
    return orderData.id;
  };

  // Real PayPal Approve & Capture Callback
  const onApproveOrder = async (data: { orderID: string }) => {
    try {
      const res = await fetch('/api/paypal/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'capture', orderId: data.orderID }),
      });
      const captureData = await res.json();

      setContract((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'funded_in_escrow',
          paypalOrderId: data.orderID,
          paypalCaptureId: captureData.id,
          agentLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              agentName: 'PayPal Escrow Vault',
              agentColor: 'text-sky-400',
              message: `VERIFIED TRANSACTION: Funds ($${prev.totalBudget} USD) locked in PayPal Sandbox Custody (Capture: ${captureData.id || data.orderID}).`,
              type: 'info',
            },
            ...prev.agentLogs,
          ],
        };
      });
    } catch (err) {
      console.error('Capture Error:', err);
    } finally {
      setFundingLoading(false);
    }
  };

  // Execute Milestone with AI Verification & PayPal Payout or Dispute Refund
  const handleRunMilestone = async (m: ContractMilestone) => {
    if (!contract) return;
    setExecutingMilestone(m.id);

    try {
      const isSimulateFail = testScenario === 'failure';
      const sampleDeliverable = isSimulateFail
        ? `[INSPECTED_SOURCE]: Malicious SQL injection test string detected. Lacks parameterized bindings.`
        : (m.deliverableCode || `[DELIVERABLE_${m.id.toUpperCase()}]: Production-ready verified module.`);

      // Step A: AI Inspector checks deliverable
      const verifyRes = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_deliverable',
          milestone: m,
          deliverable: sampleDeliverable,
          scenario: isSimulateFail ? 'simulate_failure' : 'normal',
        }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.verified) {
        // Step B1: DISPUTE TRIGGERED -> Auto Refund Escrow via PayPal
        const refundRes = await fetch('/api/paypal/refund', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: contract.paypalOrderId,
            captureId: contract.paypalCaptureId,
            amount: m.amount,
            currency: contract.currency,
            reason: `Dispute: Milestone "${m.title}" failed AI Quality Inspection (Score: ${verifyData.score}%).`,
          }),
        });
        const refundData = await refundRes.json();

        setContract((prev) => {
          if (!prev) return null;
          const updatedMilestones = prev.milestones.map((item) => {
            if (item.id === m.id) {
              return {
                ...item,
                status: 'disputed' as const,
                deliverable: {
                  content: sampleDeliverable,
                  submittedAt: new Date().toLocaleTimeString(),
                  verificationScore: verifyData.score,
                  verificationNotes: verifyData.notes,
                },
                refundTxId: refundData.id || `RFD-${Date.now()}`,
              };
            }
            return item;
          });

          return {
            ...prev,
            status: 'disputed',
            milestones: updatedMilestones,
            agentLogs: [
              {
                id: `log-ref-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                agentName: 'PayPal Dispute Engine',
                agentColor: 'text-rose-400',
                message: `REFUND ISSUED: $${m.amount} USD returned to buyer via PayPal (Refund ID: ${refundData.id || 'RFD-AUTONOMOUS'}).`,
                type: 'refund',
              },
              {
                id: `log-ver-fail-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                agentName: 'AI Inspector',
                agentColor: 'text-amber-400',
                message: `FAIL (Score: ${verifyData.score}%): Deliverable violated security constraints. Payout denied.`,
                type: 'dispute',
              },
              ...prev.agentLogs,
            ],
          };
        });

      } else {
        // Step B2: VERIFICATION PASSED -> Trigger Automated PayPal Payout
        const payoutRes = await fetch('/api/paypal/payout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: `${m.assignedAgent.toLowerCase()}@sandbox.paypal.com`,
            amount: m.amount,
            currency: contract.currency,
            milestoneId: m.id,
            note: `Escrow release: ${m.title}`,
          }),
        });
        const payoutData = await payoutRes.json();

        setContract((prev) => {
          if (!prev) return null;
          const updatedMilestones = prev.milestones.map((item) => {
            if (item.id === m.id) {
              return {
                ...item,
                status: 'paid' as const,
                deliverable: {
                  content: sampleDeliverable,
                  submittedAt: new Date().toLocaleTimeString(),
                  verificationScore: verifyData.score,
                  verificationNotes: verifyData.notes,
                },
                payoutTxId: payoutData?.batch_header?.payout_batch_id || `TX-${Date.now()}`,
              };
            }
            return item;
          });

          const allPaid = updatedMilestones.every((x) => x.status === 'paid');

          return {
            ...prev,
            status: allPaid ? 'completed' : 'in_progress',
            milestones: updatedMilestones,
            agentLogs: [
              {
                id: `log-pay-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                agentName: 'PayPal Payout Engine',
                agentColor: 'text-emerald-400',
                message: `SUCCESS: Auto-released $${m.amount} to ${m.assignedAgent} (Payout Batch: ${payoutData?.batch_header?.payout_batch_id || 'SANDBOX-BATCH'}).`,
                type: 'payout',
              },
              {
                id: `log-ver-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                agentName: 'AI Inspector',
                agentColor: 'text-purple-400',
                message: `VERIFIED: "${m.title}" achieved quality score of ${verifyData.score}%. Verification passed.`,
                type: 'verification',
              },
              ...prev.agentLogs,
            ],
          };
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExecutingMilestone(null);
    }
  };

  return (
    <PayPalScriptProvider options={{ clientId: clientId, currency: 'USD' }}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        
        {/* Top Navbar */}
        <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <EcpLogo className="h-10 w-10" />
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  EsCrow <span className="text-sky-400">Pay</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono">
                    ENTERPRISE AGENTIC COMMERCE
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              {/* Instant Demo Sandbox Button */}
              <button
                onClick={() => handleNegotiate(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer shadow-sm"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                <span>Instant 1-Click Sandbox Demo</span>
              </button>

              {contract?.ap2Mandate && (
                <button
                  onClick={() => setShowMandateModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/80 text-indigo-300 text-xs font-mono hover:bg-indigo-900/60 transition-colors cursor-pointer"
                >
                  <Fingerprint className="h-3.5 w-3.5" />
                  <span>AP2 Mandate</span>
                </button>
              )}

              {contract && (
                <button
                  onClick={handleDownloadContract}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Contract</span>
                </button>
              )}

              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>OAuth: BAAmBs...</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 p-6 sm:p-8">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Autonomous Agent Commerce & Escrow Settlement
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                The Economic Operating System for AI Agents Powered by PayPal.
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Specialized agents negotiate reverse-auction bids and sign AP2 payment mandates. Funds are secured in PayPal Escrow custody, code deliverables are inspected & executed dynamically, and payouts or refunds settle with zero human friction.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Quick Demo Presets:</span>
              <button
                onClick={() => handleSelectTemplate('Build an AI-Powered Fraud Detection Microservice with REST APIs', 75)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                🛡️ AI Fraud Detection ($75)
              </button>
              <button
                onClick={() => handleSelectTemplate('Develop High-Speed Autonomous Web Scraper & Data Pipeline', 45)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                🕷️ Web Scraper Pipeline ($45)
              </button>
              <button
                onClick={() => handleSelectTemplate('Build Smart Contract Security Auditor & Fuzz Tester', 110)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                🔐 Smart Contract Auditor ($110)
              </button>
            </div>

            {/* Goal Input & Test Control */}
            <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-8 space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Project Goal or Deliverable Scope</label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Build an AI-Powered Fraud Detection Microservice with REST APIs..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Budget ($)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-500 font-mono text-sm">$</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-3 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <button
                    onClick={() => handleNegotiate(false)}
                    disabled={isNegotiating || !goal}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                  >
                    {isNegotiating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Negotiating...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4" />
                        <span>Assemble Agents</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Judge Demonstration Controller */}
              {contract && (
                <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Sliders className="h-4 w-4 text-sky-400" />
                    <span>Judges Interactive Testing Console:</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="scenario"
                        checked={testScenario === 'normal'}
                        onChange={() => setTestScenario('normal')}
                        className="accent-indigo-500"
                      />
                      <span className="text-emerald-400 font-semibold">Standard Pass (Auto-Payout)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="scenario"
                        checked={testScenario === 'failure'}
                        onChange={() => setTestScenario('failure')}
                        className="accent-rose-500"
                      />
                      <span className="text-rose-400 font-semibold">Simulate Failure (Auto-Refund Dispute)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contract & Escrow Center */}
          {contract && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Escrow & Milestones */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Escrow Status Banner */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">CONTRACT ID: {contract.id}</span>
                        {contract.isSimulatedDemo && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                            INSTANT DEMO ACTIVE
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-white mt-0.5">{contract.title}</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {contract.status === 'draft' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" /> Awaiting PayPal Escrow Deposit
                        </span>
                      )}
                      {contract.status === 'funded_in_escrow' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5" /> Secured in PayPal Escrow
                        </span>
                      )}
                      {contract.status === 'in_progress' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Autonomous Execution
                        </span>
                      )}
                      {contract.status === 'completed' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> 100% Settled
                        </span>
                      )}
                      {contract.status === 'disputed' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                          <Undo2 className="h-3.5 w-3.5" /> Dispute Resolved (Refunded)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* REAL PAYPAL BUTTONS CONTAINER */}
                  {contract.status === 'draft' && (
                    <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-white flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-sky-400" />
                          Lock ${contract.totalBudget} USD in Official PayPal Escrow
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">Click below to open PayPal popup & authorize funds from your sandbox buyer wallet.</p>
                      </div>

                      <div className="max-w-md pt-1">
                        <PayPalButtons
                          style={{ layout: 'horizontal', color: 'gold', shape: 'pill', label: 'paypal' }}
                          createOrder={createOrder}
                          onApprove={onApproveOrder}
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span>Don't want to log in right now?</span>
                        <button
                          onClick={() => {
                            setContract(prev => prev ? ({ ...prev, status: 'funded_in_escrow', paypalOrderId: `MOCK-SKIP-${Date.now()}`, isSimulatedDemo: true }) : null);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline flex items-center gap-1"
                        >
                          <PlayCircle className="h-3.5 w-3.5" /> Bypass to Demo Escrow (No login required)
                        </button>
                      </div>
                    </div>
                  )}

                  {contract.paypalOrderId && (
                    <div className="px-4 py-3 rounded-lg bg-sky-950/40 border border-sky-900/60 text-xs font-mono text-sky-300 flex items-center justify-between">
                      <div>
                        <div>PayPal Order ID: <span className="text-white font-bold">{contract.paypalOrderId}</span></div>
                        {contract.paypalCaptureId && <div className="text-[11px] text-slate-400">Capture ID: {contract.paypalCaptureId}</div>}
                      </div>
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="h-4 w-4" /> Live Custody Active
                      </span>
                    </div>
                  )}
                </div>

                {/* Milestones Header & Custom Creator Toggle */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-indigo-400" />
                      Decomposed Milestones & Agent Contracts ({contract.milestones.length})
                    </h3>

                    <button
                      onClick={() => setShowAddMilestone(!showAddMilestone)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>{showAddMilestone ? 'Cancel' : 'Add Custom Milestone'}</span>
                    </button>
                  </div>

                  {/* Custom Milestone Creator Form */}
                  {showAddMilestone && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-indigo-900/60 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Add Custom Deliverable</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6">
                          <input
                            type="text"
                            placeholder="Milestone title (e.g. Documentation & Deployment Runbook)"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <select
                            value={customAgent}
                            onChange={(e) => setCustomAgent(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white"
                          >
                            <option value="Agent-Architect">Agent-Architect</option>
                            <option value="Agent-Builder">Agent-Builder</option>
                            <option value="Agent-Sentinel">Agent-Sentinel</option>
                          </select>
                        </div>
                        <div className="sm:col-span-3 flex gap-2">
                          <input
                            type="number"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(Number(e.target.value))}
                            className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white font-mono"
                          />
                          <button
                            onClick={handleAddCustomMilestone}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Milestones Cards */}
                  {contract.milestones.map((m, idx) => (
                    <div 
                      key={m.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        m.status === 'paid' 
                          ? 'bg-slate-900/90 border-emerald-900/50' 
                          : m.status === 'disputed'
                          ? 'bg-slate-900/90 border-rose-900/50'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              Milestone #{idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-indigo-400">
                              {m.assignedAgent} ({m.agentRole})
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white">{m.title}</h4>
                          <p className="text-xs text-slate-400">{m.description}</p>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            <div className="text-lg font-mono font-bold text-white">${m.amount} {contract.currency}</div>
                            <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                              m.status === 'paid' 
                                ? 'text-emerald-400' 
                                : m.status === 'disputed'
                                ? 'text-rose-400'
                                : 'text-slate-500'
                            }`}>
                              {m.status === 'paid' ? 'Paid via PayPal' : m.status === 'disputed' ? 'Disputed & Refunded' : 'Pending Verification'}
                            </span>
                          </div>

                          {/* Delete milestone if still draft */}
                          {contract.status === 'draft' && contract.milestones.length > 1 && (
                            <button
                              onClick={() => handleDeleteMilestone(m.id)}
                              className="text-slate-600 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                              title="Remove milestone"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Criteria & Action Bar */}
                      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Inspection:</span>
                          <span className="text-slate-300 font-medium truncate max-w-xs">{m.verificationCriteria}</span>
                          
                          {/* Deliverable Code View Button */}
                          {m.deliverableCode && (
                            <button
                              onClick={() => {
                                setSelectedMilestoneCode(m);
                                setTestResult(null);
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Code2 className="h-3 w-3" /> View & Run Code
                            </button>
                          )}
                        </div>

                        {contract.status !== 'draft' && (
                          <div className="flex items-center gap-2">
                            {m.status === 'pending' || m.status === 'in_progress' ? (
                              <button
                                onClick={() => handleRunMilestone(m)}
                                disabled={executingMilestone === m.id}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                {executingMilestone === m.id ? (
                                  <>
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                    <span>Inspecting & Settling...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Verify Deliverable</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedReceipt(m)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5 text-indigo-400" />
                                <span>View Receipt</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Deliverable & AI Audit Card */}
                      {m.deliverable && (
                        <div className={`mt-3 p-3 rounded-xl border text-xs space-y-1 ${
                          m.status === 'paid' 
                            ? 'bg-slate-950 border-emerald-950/80' 
                            : 'bg-slate-950 border-rose-950/80'
                        }`}>
                          <div className={`flex items-center justify-between font-semibold ${
                            m.status === 'paid' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            <span>AI Inspector Score: {m.deliverable.verificationScore}%</span>
                            <span>Timestamp: {m.deliverable.submittedAt}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{m.deliverable.verificationNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Visual Mesh / Agent Chat & Realtime Logs */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Switchable Tabs: Topology vs Negotiation Room */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('topology')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          activeTab === 'topology'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Bot className="h-3.5 w-3.5" />
                        <span>Mesh Topology</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('chat')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          activeTab === 'chat'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <MessagesSquare className="h-3.5 w-3.5" />
                        <span>Negotiation Room</span>
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-emerald-400">Live Active</span>
                  </div>

                  {/* Tab 1: Topology */}
                  {activeTab === 'topology' && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                        <span className="font-semibold text-white">Client Escrow Vault</span>
                        <span className="font-mono text-sky-400">${contract.totalBudget} USD Locked</span>
                      </div>

                      <div className="flex justify-center text-slate-600">
                        <ChevronRight className="h-4 w-4 rotate-90" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-blue-900/40 text-blue-300">
                          <div className="font-bold">Architect</div>
                          <div className="font-mono text-slate-400 mt-1">${contract.milestones[0]?.amount}</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-amber-900/40 text-amber-300">
                          <div className="font-bold">Builder</div>
                          <div className="font-mono text-slate-400 mt-1">${contract.milestones[1]?.amount}</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-900/40 text-emerald-300">
                          <div className="font-bold">Sentinel</div>
                          <div className="font-mono text-slate-400 mt-1">${contract.milestones[2]?.amount}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Interactive Real-Time Negotiation Room */}
                  {activeTab === 'chat' && (
                    <div className="space-y-3">
                      <div className="h-72 overflow-y-auto space-y-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                        {(contract.negotiationChat || []).map((msg, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={`font-bold ${msg.color}`}>{msg.sender} ({msg.role})</span>
                              <span className="text-slate-600">{msg.time}</span>
                            </div>
                            <p className="text-slate-300 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800 leading-relaxed text-[11px]">
                              {msg.message}
                            </p>
                          </div>
                        ))}
                        {isChatSending && (
                          <div className="text-[11px] text-indigo-400 font-mono animate-pulse flex items-center gap-1.5 p-2">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            <span>Agents deliberating & negotiating counter-offer...</span>
                          </div>
                        )}
                      </div>

                      {/* Interactive Bid & Query Input Bar */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendNegotiationMessage()}
                          placeholder="e.g. Can you do this faster for a $65 budget? Or reduce API scope?"
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                        />
                        <button
                          onClick={handleSendNegotiationMessage}
                          disabled={isChatSending || !chatInput.trim()}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow"
                        >
                          <span>Send</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        <span className="text-slate-500">Quick prompts:</span>
                        <button
                          onClick={() => setChatInput('Can you optimize budget and give a discount?')}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        >
                          Request Discount
                        </button>
                        <button
                          onClick={() => setChatInput('How fast can you deliver all milestones?')}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        >
                          Ask Deadline
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Real-time Agent Logs & PayPal Webhooks Stream */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Binary className="h-4 w-4 text-amber-400" />
                      PayPal Ledger & Webhook Telemetry
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Webhooks Active
                    </span>
                  </div>

                  {/* Webhook trigger badge for judges */}
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Endpoint: /api/paypal/webhook</span>
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/paypal/webhook', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            event_type: 'PAYMENT.CAPTURE.COMPLETED',
                            resource: { id: contract?.paypalCaptureId || 'SIMULATED-CAP-992' },
                          }),
                        });
                        const data = await res.json();
                        setContract((prev) => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            agentLogs: [
                              {
                                id: `log-hook-${Date.now()}`,
                                timestamp: new Date().toLocaleTimeString(),
                                agentName: 'PayPal Webhook Engine',
                                agentColor: 'text-sky-300',
                                message: `ACK: [${data.eventType}] verified via cryptographic signature. ${data.actionLog}`,
                                type: 'info',
                              },
                              ...prev.agentLogs,
                            ],
                          };
                        });
                      }}
                      className="px-2 py-0.5 rounded bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 cursor-pointer text-[10px]"
                    >
                      Ping Webhook
                    </button>
                  </div>

                  <div className="h-72 overflow-y-auto pr-1 space-y-2 font-mono text-xs">
                    {contract.agentLogs.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-0.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className={`font-bold ${log.agentColor}`}>{log.agentName}</span>
                          <span className="text-slate-600">{log.timestamp}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{log.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>

        {/* Deliverable Code Viewer & Live Test Playground Modal */}
        {selectedMilestoneCode && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-sky-400" />
                  <h3 className="text-base font-bold text-white">{selectedMilestoneCode.title} (Code & Playground)</h3>
                </div>
                <button 
                  onClick={() => setSelectedMilestoneCode(null)}
                  className="text-slate-500 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Source code viewer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Author: {selectedMilestoneCode.assignedAgent}</span>
                  <span className="font-mono text-indigo-400">Verifiable Code Artifact</span>
                </div>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-56 whitespace-pre">
                  {selectedMilestoneCode.deliverableCode || '// No code artifact available'}
                </pre>
              </div>

              {/* Interactive Endpoint Test Runner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-amber-400" />
                    Interactive Deliverable Execution Playground
                  </span>

                  <button
                    onClick={() => handleExecuteInteractiveTest(selectedMilestoneCode)}
                    disabled={testRunning}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow"
                  >
                    {testRunning ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Executing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-current" />
                        <span>Run Live Inference</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Tx Amount ($)</label>
                    <input
                      type="number"
                      value={testingPayload.txAmount}
                      onChange={(e) => setTestingPayload({ ...testingPayload, txAmount: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Velocity (tx/hr)</label>
                    <input
                      type="number"
                      value={testingPayload.velocity}
                      onChange={(e) => setTestingPayload({ ...testingPayload, velocity: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Cross-Border</label>
                    <select
                      value={testingPayload.crossBorder ? 'true' : 'false'}
                      onChange={(e) => setTestingPayload({ ...testingPayload, crossBorder: e.target.value === 'true' })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    >
                      <option value="false">Domestic (False)</option>
                      <option value="true">International (True)</option>
                    </select>
                  </div>
                </div>

                {/* Test Result Output */}
                {testResult && (
                  <div className="mt-2 p-3 rounded-lg bg-slate-900 border border-emerald-900/60 font-mono text-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span>Live Response (Runtime: {testResult.runtimeMs}ms)</span>
                      <span>Action: {testResult.inferenceOutput?.recommendedAction || 'PASS'}</span>
                    </div>
                    <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre">
                      {JSON.stringify(testResult.inferenceOutput, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <button
                  onClick={() => setSelectedMilestoneCode(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close Playground
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settlement Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">PayPal Settlement Receipt</h3>
                </div>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="text-slate-500 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">STATUS:</span>
                  <span className={selectedReceipt.status === 'paid' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {selectedReceipt.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PAYEE:</span>
                  <span className="text-white">{selectedReceipt.assignedAgent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AMOUNT:</span>
                  <span className="text-white font-bold">${selectedReceipt.amount}.00 USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TRANSACTION ID:</span>
                  <span className="text-sky-400 break-all">{selectedReceipt.payoutTxId || selectedReceipt.refundTxId || 'SANDBOX-TX'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AI INSPECTION:</span>
                  <span className="text-indigo-400">{selectedReceipt.deliverable?.verificationScore}% Passed</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}

        {/* AP2 Cryptographic Mandate Modal */}
        {showMandateModal && contract?.ap2Mandate && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">AP2 Payment Mandate</h3>
                </div>
                <button 
                  onClick={() => setShowMandateModal(false)}
                  className="text-slate-500 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Agent Payments Protocol (AP2) verifiable cryptographic authorization issued by the client wallet.
              </p>

              <div className="space-y-2.5 font-mono text-xs bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300">
                <div><span className="text-slate-500">MANDATE_ID:</span> {contract.ap2Mandate.mandateId}</div>
                <div><span className="text-slate-500">PROTOCOL:</span> {contract.ap2Mandate.protocolVersion}</div>
                <div><span className="text-slate-500">MAX_ESCROW_CAP:</span> {contract.ap2Mandate.maxEscrowCap}</div>
                <div><span className="text-slate-500">SETTLEMENT_RULE:</span> {contract.ap2Mandate.settlementCondition}</div>
                <div><span className="text-slate-500">DISPUTE_POLICY:</span> {contract.ap2Mandate.disputeProtocol}</div>
                <div className="pt-2 border-t border-slate-800/80 break-all text-[11px] text-emerald-400">
                  <span className="text-slate-500 block">DIGITAL_SIGNATURE:</span>
                  {contract.ap2Mandate.cryptographicSignature}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowMandateModal(false)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close Mandate Inspector
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
          <p>Built for the PayPal AI Hackathon 2026 — Demonstrating Autonomous Agentic Commerce & Escrow Settlements.</p>
        </footer>
      </div>
    </PayPalScriptProvider>
  );
}
