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
  DollarSign,
  GitPullRequest,
  Layers,
  ExternalLink,
  UploadCloud
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
  const [activeTab, setActiveTab] = useState<'topology' | 'chat' | 'ledger'>('topology');

  // Modals
  const [showMandateModal, setShowMandateModal] = useState(false);
  const [selectedMilestoneCode, setSelectedMilestoneCode] = useState<ContractMilestone | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ContractMilestone | null>(null);
  const [showMcpModal, setShowMcpModal] = useState(false);
  const [selectedAuditCert, setSelectedAuditCert] = useState<ContractMilestone | null>(null);
  const [submittingMilestone, setSubmittingMilestone] = useState<ContractMilestone | null>(null);
  const [submittedCodeInput, setSubmittedCodeInput] = useState('');
  const [submittedPrUrl, setSubmittedPrUrl] = useState('');

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
          milestones: contract.milestones,
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
  const handleRunMilestone = async (m: ContractMilestone, overrideDeliverable?: string) => {
    if (!contract) return;
    setExecutingMilestone(m.id);

    try {
      const isSimulateFail = testScenario === 'failure';
      const sampleDeliverable = overrideDeliverable
        ? overrideDeliverable
        : isSimulateFail
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
      <div className="min-h-screen bg-[#f5f7fa] text-slate-900 flex flex-col font-sans selection:bg-[#0070e0] selection:text-white bg-fintech-grid">
        
        {/* Top Navbar */}
        <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl sticky top-0 z-50 transition-all shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <EcpLogo className="h-11 w-11 shadow-md shadow-blue-500/10" />
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl font-black tracking-tight text-slate-950 flex items-center">
                    EsCrow <span className="text-[#0070e0] ml-1">Pay</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0070e0]/10 border border-[#0070e0]/25 text-[#002991] text-[10px] font-bold tracking-wide uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0070e0] animate-pulse" />
                    Agentic Commerce
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium tracking-normal hidden sm:block">
                  Autonomous Escrow & AP2 Settlement Protocol Powered by PayPal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-sm">
              {/* Instant Demo Sandbox Button */}
              <button
                onClick={() => handleNegotiate(true)}
                className="fintech-pill-btn flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs shadow-xs cursor-pointer"
                title="Launch Instant High-Fidelity Simulation"
              >
                <PlayCircle className="h-4 w-4 text-emerald-600" />
                <span className="font-bold">Instant Sandbox Demo</span>
              </button>

              {/* WebMCP Protocol Button for Judges */}
              <button
                onClick={() => setShowMcpModal(true)}
                className="fintech-pill-btn hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-mono cursor-pointer"
              >
                <Cpu className="h-3.5 w-3.5 text-slate-500" />
                <span>WebMCP</span>
              </button>

              {contract?.ap2Mandate && (
                <button
                  onClick={() => setShowMandateModal(true)}
                  className="fintech-pill-btn hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#002991] text-xs font-mono cursor-pointer"
                >
                  <Fingerprint className="h-3.5 w-3.5 text-[#0070e0]" />
                  <span>AP2 Mandate</span>
                </button>
              )}

              {contract && (
                <button
                  onClick={handleDownloadContract}
                  className="fintech-pill-btn hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span>Export</span>
                </button>
              )}

              <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-mono shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] text-slate-500">Sandbox:</span>
                <span className="text-emerald-700 font-bold text-[11px]">Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Hero Section */}
          <div className="fintech-card relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm bg-white">
            {/* Ambient Background Subtle Light */}
            <div className="absolute top-0 right-1/4 -mt-16 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-3xl space-y-3.5 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0070e0]/10 border border-[#0070e0]/20 text-[#002991] text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5 text-[#0070e0]" /> Autonomous Agent Commerce & Escrow Settlement
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 leading-[1.15]">
                The Economic Operating System for <span className="text-[#002991]">Autonomous AI Agents</span> Powered by PayPal.
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Specialized agents negotiate reverse-auction bids and sign AP2 payment mandates. Funds are secured in PayPal Escrow custody, code deliverables are inspected & executed dynamically, and payouts or refunds settle with zero human friction.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs relative z-10">
              <span className="text-slate-500 font-bold text-xs">Quick Demo Presets:</span>
              <button
                onClick={() => handleSelectTemplate('Build an AI-Powered Fraud Detection Microservice with REST APIs', 75)}
                className="fintech-pill-btn px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-[#0070e0] text-slate-800 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>🛡️ AI Fraud Detection ($75)</span>
              </button>
              <button
                onClick={() => handleSelectTemplate('Develop High-Speed Autonomous Web Scraper & Data Pipeline', 45)}
                className="fintech-pill-btn px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-[#0070e0] text-slate-800 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>🕷️ Web Scraper Pipeline ($45)</span>
              </button>
              <button
                onClick={() => handleSelectTemplate('Build Smart Contract Security Auditor & Fuzz Tester', 110)}
                className="fintech-pill-btn px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-[#0070e0] text-slate-800 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>🔐 Smart Contract Auditor ($110)</span>
              </button>
            </div>

            {/* Goal Input & Test Control */}
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-8 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Project Goal or Deliverable Scope</label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Build an AI-Powered Fraud Detection Microservice with REST APIs..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070e0]/20 focus:border-[#0070e0] transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Budget ($)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-500 font-mono text-sm">$</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-8 pr-3 py-3.5 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070e0]/20 focus:border-[#0070e0] transition-all"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <button
                    onClick={() => handleNegotiate(false)}
                    disabled={isNegotiating || !goal}
                    className="fintech-pill-btn w-full h-[48px] bg-black hover:bg-[#002991] disabled:opacity-50 text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
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
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <Sliders className="h-4 w-4 text-[#0070e0]" />
                    <span>Judges Interactive Testing Console:</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scenario"
                        checked={testScenario === 'normal'}
                        onChange={() => setTestScenario('normal')}
                        className="accent-[#0070e0] h-4 w-4"
                      />
                      <span className="text-emerald-700 font-bold">Standard Pass (Auto-Payout)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scenario"
                        checked={testScenario === 'failure'}
                        onChange={() => setTestScenario('failure')}
                        className="accent-rose-600 h-4 w-4"
                      />
                      <span className="text-rose-700 font-bold">Simulate Failure (Auto-Refund Dispute)</span>
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
                <div className="fintech-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 space-y-5 shadow-sm bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                          CONTRACT ID: {contract.id}
                        </span>
                        {contract.isSimulatedDemo && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold">
                            INSTANT DEMO ACTIVE
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-black text-slate-950 mt-1.5 tracking-tight">{contract.title}</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {contract.status === 'draft' && (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-xs">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Awaiting PayPal Escrow Deposit
                        </span>
                      )}
                      {contract.status === 'funded_in_escrow' && (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-[#002991] border border-blue-200 flex items-center gap-1.5 shadow-xs">
                          <Lock className="h-3.5 w-3.5 text-[#0070e0]" /> Secured in PayPal Escrow
                        </span>
                      )}
                      {contract.status === 'in_progress' && (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1.5 shadow-xs">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" /> Autonomous Execution
                        </span>
                      )}
                      {contract.status === 'completed' && (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 100% Settled
                        </span>
                      )}
                      {contract.status === 'disputed' && (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1.5 shadow-xs">
                          <Undo2 className="h-3.5 w-3.5 text-rose-600" /> Dispute Resolved (Refunded)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* REAL PAYPAL BUTTONS CONTAINER */}
                  {contract.status === 'draft' && (
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#002991] via-[#001c64] to-[#00144d] border border-[#002991] space-y-4 shadow-xl text-white">
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-[#ffd140]" />
                          Lock ${contract.totalBudget} USD in Official PayPal Escrow Custody
                        </p>
                        <p className="text-xs text-blue-100 mt-1">Authorize funds securely through PayPal sandbox. Funds remain protected until code deliverables pass automated AST inspection.</p>
                      </div>

                      <div className="max-w-md pt-1">
                        <PayPalButtons
                          style={{ layout: 'horizontal', color: 'gold', shape: 'pill', label: 'paypal' }}
                          createOrder={createOrder}
                          onApprove={onApproveOrder}
                        />
                      </div>

                      <div className="pt-2.5 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
                        <span>Don't have a PayPal Sandbox login handy?</span>
                        <button
                          onClick={() => {
                            setContract(prev => prev ? ({ ...prev, status: 'funded_in_escrow', paypalOrderId: `MOCK-SKIP-${Date.now()}`, isSimulatedDemo: true }) : null);
                          }}
                          className="fintech-pill-btn px-4 py-1.5 bg-[#ffd140] hover:bg-[#ffc439] text-black font-extrabold cursor-pointer flex items-center gap-1.5 transition-all text-xs shadow-md"
                        >
                          <PlayCircle className="h-3.5 w-3.5 fill-current" />
                          <span>1-Click Sandbox Bypass</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {contract.paypalOrderId && (
                    <div className="px-4 py-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-mono text-[#002991] flex items-center justify-between">
                      <div>
                        <div>PayPal Order ID: <span className="text-slate-900 font-bold">{contract.paypalOrderId}</span></div>
                        {contract.paypalCaptureId && <div className="text-[11px] text-slate-500 mt-0.5">Capture ID: {contract.paypalCaptureId}</div>}
                      </div>
                      <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Live Custody Active
                      </span>
                    </div>
                  )}
                </div>

                {/* Milestones Header & Custom Creator Toggle */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-950 flex items-center gap-2 tracking-tight">
                      <Cpu className="h-5 w-5 text-[#0070e0]" />
                      Decomposed Milestones & Agent Contracts ({contract.milestones.length})
                    </h3>

                    <button
                      onClick={() => setShowAddMilestone(!showAddMilestone)}
                      className="fintech-pill-btn px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#002991] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>{showAddMilestone ? 'Cancel' : 'Add Custom Milestone'}</span>
                    </button>
                  </div>

                  {/* Custom Milestone Creator Form */}
                  {showAddMilestone && (
                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#002991]">Add Custom Deliverable</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6">
                          <input
                            type="text"
                            placeholder="Milestone title (e.g. Documentation & Deployment Runbook)"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0070e0]/20 focus:border-[#0070e0]"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <select
                            value={customAgent}
                            onChange={(e) => setCustomAgent(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-2xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0070e0]"
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
                            className="w-24 bg-white border border-slate-300 rounded-2xl px-3 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#0070e0]"
                          />
                          <button
                            onClick={handleAddCustomMilestone}
                            className="fintech-pill-btn flex-1 bg-[#002991] hover:bg-[#0070e0] text-white rounded-full text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-500/20"
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
                      className={`fintech-card p-6 rounded-3xl border transition-all ${
                        m.status === 'paid' 
                          ? 'bg-emerald-50/20 border-emerald-300 shadow-xs ring-1 ring-emerald-400/20' 
                          : m.status === 'disputed'
                          ? 'bg-rose-50/20 border-rose-300 shadow-xs ring-1 ring-rose-400/20' 
                          : 'bg-white border-slate-200/90 hover:border-[#0070e0] shadow-xs'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
                              Milestone #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-[#002991] bg-blue-50 border border-blue-200 px-3 py-0.5 rounded-full">
                              {m.assignedAgent} ({m.agentRole})
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-slate-950 tracking-tight">{m.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            <div className="text-xl font-mono font-bold text-slate-950">${m.amount} {contract.currency}</div>
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${
                              m.status === 'paid' 
                                ? 'text-emerald-700' 
                                : m.status === 'disputed'
                                ? 'text-rose-700'
                                : 'text-slate-500'
                            }`}>
                              {m.status === 'paid' ? 'Paid via PayPal' : m.status === 'disputed' ? 'Disputed & Refunded' : 'Pending Verification'}
                            </span>
                          </div>

                          {/* Delete milestone if still draft */}
                          {contract.status === 'draft' && contract.milestones.length > 1 && (
                            <button
                              onClick={() => handleDeleteMilestone(m.id)}
                              className="text-slate-400 hover:text-rose-600 p-2 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove milestone"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Criteria & Action Bar */}
                      <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="text-slate-500 font-medium">Inspection:</span>
                          <span className="text-slate-700 font-medium truncate max-w-xs">{m.verificationCriteria}</span>
                          
                          {/* Deliverable Code View Button */}
                          {m.deliverableCode && (
                            <button
                              onClick={() => {
                                setSelectedMilestoneCode(m);
                                setTestResult(null);
                              }}
                              className="fintech-pill-btn px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Code2 className="h-3.5 w-3.5 text-[#0070e0]" /> View & Run Code
                            </button>
                          )}
                        </div>

                        {contract.status !== 'draft' && (
                          <div className="flex items-center gap-2">
                            {m.status === 'pending' || m.status === 'in_progress' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSubmittingMilestone(m);
                                    setSubmittedCodeInput(m.deliverableCode || '');
                                    setSubmittedPrUrl(`https://github.com/developer/fraud-detection-service/pull/${idx + 1}`);
                                  }}
                                  className="fintech-pill-btn px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-[#0070e0] text-[#002991] font-bold rounded-full text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                  title="Submit custom code deliverable or GitHub Pull Request for AST audit"
                                >
                                  <GitPullRequest className="h-3.5 w-3.5 text-[#0070e0]" />
                                  <span>Submit Work / PR</span>
                                </button>
                                <button
                                  onClick={() => handleRunMilestone(m)}
                                  disabled={executingMilestone === m.id}
                                  className="fintech-pill-btn px-5 py-2 bg-[#002991] hover:bg-[#0070e0] disabled:opacity-50 text-white font-bold rounded-full text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/20"
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
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedAuditCert(m)}
                                  className="fintech-pill-btn px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#002991] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <ShieldCheck className="h-3.5 w-3.5 text-[#0070e0]" />
                                  <span>Audit Cert</span>
                                </button>
                                <button
                                  onClick={() => setSelectedReceipt(m)}
                                  className="fintech-pill-btn px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                                  <span>Receipt</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Deliverable & AI Audit Card */}
                      {m.deliverable && (
                        <div className={`mt-4 p-4 rounded-2xl border text-xs space-y-1.5 ${
                          m.status === 'paid' 
                            ? 'bg-emerald-50 border-emerald-200' 
                            : 'bg-rose-50 border-rose-200'
                        }`}>
                          <div className={`flex items-center justify-between font-bold ${
                            m.status === 'paid' ? 'text-emerald-800' : 'text-rose-800'
                          }`}>
                            <span>AI Inspector Score: {m.deliverable.verificationScore}%</span>
                            <span className="font-mono text-[11px] text-slate-600">{m.deliverable.submittedAt}</span>
                          </div>
                          <p className="text-slate-700 text-xs leading-relaxed">{m.deliverable.verificationNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Visual Mesh / Agent Chat & Realtime Logs */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Switchable Tabs: Topology vs Negotiation Room vs Settlement Ledger */}
                <div className="fintech-card rounded-3xl p-6 border border-slate-200/90 space-y-5 shadow-sm bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="p-1 rounded-full bg-slate-100 border border-slate-200 inline-flex items-center gap-1">
                      <button
                        onClick={() => setActiveTab('topology')}
                        className={`fintech-pill-btn px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeTab === 'topology'
                            ? 'bg-white text-slate-950 font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-950 font-semibold'
                        }`}
                      >
                        <Bot className="h-3.5 w-3.5 text-[#0070e0]" />
                        <span>Mesh Topology</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('chat')}
                        className={`fintech-pill-btn px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeTab === 'chat'
                            ? 'bg-white text-slate-950 font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-950 font-semibold'
                        }`}
                      >
                        <MessagesSquare className="h-3.5 w-3.5 text-[#0070e0]" />
                        <span>Negotiation</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('ledger')}
                        className={`fintech-pill-btn px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeTab === 'ledger'
                            ? 'bg-white text-slate-950 font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-950 font-semibold'
                        }`}
                      >
                        <Layers className="h-3.5 w-3.5 text-[#0070e0]" />
                        <span>Ledger</span>
                      </button>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-700 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live Mesh
                    </span>
                  </div>

                  {/* Tab 1: Topology */}
                  {activeTab === 'topology' && (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 text-xs shadow-xs">
                        <span className="font-bold text-slate-900 flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5 text-[#0070e0]" />
                          Client Escrow Vault
                        </span>
                        <span className="font-mono text-[#002991] font-bold">${contract.totalBudget} USD Locked</span>
                      </div>

                      <div className="flex justify-center text-slate-400">
                        <ChevronRight className="h-4 w-4 rotate-90" />
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 text-center text-[11px]">
                        <div className="p-3 rounded-2xl bg-white border border-blue-200 text-[#002991] shadow-xs">
                          <div className="font-bold">Architect</div>
                          <div className="font-mono text-slate-950 font-black mt-1">${contract.milestones[0]?.amount}</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-white border border-amber-200 text-amber-800 shadow-xs">
                          <div className="font-bold">Builder</div>
                          <div className="font-mono text-slate-950 font-black mt-1">${contract.milestones[1]?.amount}</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-white border border-emerald-200 text-emerald-800 shadow-xs">
                          <div className="font-bold">Sentinel</div>
                          <div className="font-mono text-slate-950 font-black mt-1">${contract.milestones[2]?.amount}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Interactive Real-Time Negotiation Room */}
                  {activeTab === 'chat' && (
                    <div className="space-y-4">
                      <div className="h-80 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono">
                        {(contract.negotiationChat || []).map((msg, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={`font-bold ${msg.color}`}>{msg.sender} ({msg.role})</span>
                              <span className="text-slate-500">{msg.time}</span>
                            </div>
                            <p className="text-slate-800 bg-white p-3 rounded-2xl border border-slate-200 leading-relaxed text-xs shadow-2xs">
                              {msg.message}
                            </p>
                          </div>
                        ))}
                        {isChatSending && (
                          <div className="text-xs text-[#0070e0] font-mono animate-pulse flex items-center gap-2 p-2">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
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
                          className="flex-1 bg-white border border-slate-300 rounded-full px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0070e0]/20 focus:border-[#0070e0] placeholder:text-slate-400 transition-all"
                        />
                        <button
                          onClick={handleSendNegotiationMessage}
                          disabled={isChatSending || !chatInput.trim()}
                          className="fintech-pill-btn px-5 py-2.5 bg-[#002991] hover:bg-[#0070e0] disabled:opacity-50 text-white rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-blue-500/20"
                        >
                          <span>Send</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <span className="text-slate-500 self-center font-medium">Quick prompts:</span>
                        <button
                          onClick={() => setChatInput('Can you optimize budget and give a discount?')}
                          className="fintech-pill-btn px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 cursor-pointer text-xs"
                        >
                          Request Discount
                        </button>
                        <button
                          onClick={() => setChatInput('How fast can you deliver all milestones?')}
                          className="fintech-pill-btn px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 cursor-pointer text-xs"
                        >
                          Ask Deadline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Settlement Ledger & Double-Entry Accounting */}
                  {activeTab === 'ledger' && (
                    <div className="space-y-4">
                      {/* Accounting Summary Grid */}
                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Escrow Deposited</span>
                          <span className="text-base font-bold font-mono text-slate-950 mt-0.5 block">${contract.totalBudget}.00 USD</span>
                          <span className="text-[10px] text-[#0070e0] block mt-1 font-mono truncate">PayPal: {contract.paypalOrderId ? contract.paypalOrderId.slice(0, 14) + '...' : 'Draft'}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Disbursed (Paid)</span>
                          <span className="text-base font-bold font-mono text-emerald-700 mt-0.5 block">
                            ${contract.milestones.filter(m => m.status === 'paid').reduce((acc, m) => acc + m.amount, 0)}.00 USD
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-1">Batch Payouts</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200">
                          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Refunded (Disputes)</span>
                          <span className="text-base font-bold font-mono text-rose-700 mt-0.5 block">
                            ${contract.milestones.filter(m => m.status === 'disputed').reduce((acc, m) => acc + m.amount, 0)}.00 USD
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-1">Instant Reversal</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200">
                          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">In Escrow Custody</span>
                          <span className="text-base font-bold font-mono text-[#002991] mt-0.5 block">
                            ${contract.totalBudget - contract.milestones.filter(m => m.status === 'paid' || m.status === 'disputed').reduce((acc, m) => acc + m.amount, 0)}.00 USD
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-1">Pending Inspection</span>
                        </div>
                      </div>

                      {/* Line-item Ledger Table */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 border-b border-slate-200 pb-2.5">
                          <span>Milestone & Agent</span>
                          <span>Settlement Ref</span>
                        </div>

                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {contract.milestones.map((m, idx) => (
                            <div key={m.id} className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between text-xs shadow-2xs">
                              <div>
                                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                  <span>#{idx + 1} {m.title}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                                    m.status === 'paid' 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                                      : m.status === 'disputed'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-300' 
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}>
                                    {m.status.toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                  {m.assignedAgent} • ${m.amount}.00 USD
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="font-mono text-[10px] text-slate-500 block truncate max-w-[130px]">
                                  {m.payoutTxId || m.refundTxId || 'PENDING_RELEASE'}
                                </span>
                                {(m.status === 'paid' || m.status === 'disputed') && (
                                  <button
                                    onClick={() => setSelectedReceipt(m)}
                                    className="text-[11px] text-[#0070e0] hover:text-[#002991] font-bold underline cursor-pointer mt-0.5 block"
                                  >
                                    View Receipt
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Real-time Agent Logs & PayPal Webhooks Stream */}
                <div className="fintech-card rounded-3xl p-6 border border-slate-200/90 space-y-4 shadow-sm bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                      <Binary className="h-4 w-4 text-amber-500" />
                      PayPal Ledger & Webhook Telemetry
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1.5 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Webhooks Active
                    </span>
                  </div>

                  {/* Webhook trigger badge for judges */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600">Endpoint: /api/paypal/webhook</span>
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
                                agentColor: 'text-[#0070e0]',
                                message: `ACK: [${data.eventType}] verified via cryptographic signature. ${data.actionLog}`,
                                type: 'info',
                              },
                              ...prev.agentLogs,
                            ],
                          };
                        });
                      }}
                      className="fintech-pill-btn px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#002991] font-bold cursor-pointer text-xs"
                    >
                      Ping Webhook
                    </button>
                  </div>

                  <div className="h-72 overflow-y-auto pr-1 space-y-2.5 font-mono text-xs">
                    {contract.agentLogs.map((log) => (
                      <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className={`font-bold ${log.agentColor}`}>{log.agentName}</span>
                          <span className="text-slate-400">{log.timestamp}</span>
                        </div>
                        <p className="text-slate-700 text-xs leading-relaxed">{log.message}</p>
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
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fintech-card bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-7 space-y-5 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <Code2 className="h-5 w-5 text-[#0070e0]" />
                  <h3 className="text-lg font-black text-slate-950 tracking-tight">{selectedMilestoneCode.title} (Code & Playground)</h3>
                </div>
                <button 
                  onClick={() => setSelectedMilestoneCode(null)}
                  className="text-slate-400 hover:text-slate-950 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Source code viewer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Author: <strong className="text-slate-900">{selectedMilestoneCode.assignedAgent}</strong></span>
                  <span className="font-mono text-[#0070e0] font-bold">Verifiable Code Artifact</span>
                </div>
                <pre className="bg-[#001c64] p-4 rounded-2xl border border-[#002991] text-xs font-mono text-emerald-300 overflow-x-auto max-h-56 whitespace-pre leading-relaxed shadow-inner">
                  {selectedMilestoneCode.deliverableCode || '// No code artifact available'}
                </pre>
              </div>

              {/* Interactive Endpoint Test Runner */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-amber-500" />
                    Interactive Deliverable Execution Playground
                  </span>

                  <button
                    onClick={() => handleExecuteInteractiveTest(selectedMilestoneCode)}
                    disabled={testRunning}
                    className="fintech-pill-btn px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-full text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    {testRunning ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Executing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Run Live Inference</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Tx Amount ($)</label>
                    <input
                      type="number"
                      value={testingPayload.txAmount}
                      onChange={(e) => setTestingPayload({ ...testingPayload, txAmount: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-[#0070e0]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Velocity (tx/hr)</label>
                    <input
                      type="number"
                      value={testingPayload.velocity}
                      onChange={(e) => setTestingPayload({ ...testingPayload, velocity: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-[#0070e0]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Cross-Border</label>
                    <select
                      value={testingPayload.crossBorder ? 'true' : 'false'}
                      onChange={(e) => setTestingPayload({ ...testingPayload, crossBorder: e.target.value === 'true' })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-[#0070e0]"
                    >
                      <option value="false">Domestic (False)</option>
                      <option value="true">International (True)</option>
                    </select>
                  </div>
                </div>

                {/* Test Result Output */}
                {testResult && (
                  <div className="mt-2.5 p-3.5 rounded-2xl bg-white border border-emerald-300 font-mono text-xs space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-emerald-700 font-bold">
                      <span>Live Response (Runtime: {testResult.runtimeMs}ms)</span>
                      <span>Action: {testResult.inferenceOutput?.recommendedAction || 'PASS'}</span>
                    </div>
                    <pre className="text-slate-800 text-[11px] overflow-x-auto whitespace-pre">
                      {JSON.stringify(testResult.inferenceOutput, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <button
                  onClick={() => setSelectedMilestoneCode(null)}
                  className="fintech-pill-btn w-full py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-full text-xs font-bold cursor-pointer transition-all"
                >
                  Close Playground
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settlement Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fintech-card bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-black text-slate-950 tracking-tight">PayPal Settlement Receipt</h3>
                </div>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="text-slate-400 hover:text-slate-950 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">STATUS:</span>
                  <span className={selectedReceipt.status === 'paid' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {selectedReceipt.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PAYEE:</span>
                  <span className="text-slate-900 font-semibold">{selectedReceipt.assignedAgent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AMOUNT:</span>
                  <span className="text-slate-950 font-bold">${selectedReceipt.amount}.00 USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TRANSACTION ID:</span>
                  <span className="text-[#0070e0] font-bold break-all">{selectedReceipt.payoutTxId || selectedReceipt.refundTxId || 'SANDBOX-TX'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AI INSPECTION:</span>
                  <span className="text-[#002991] font-bold">{selectedReceipt.deliverable?.verificationScore}% Passed</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="fintech-pill-btn w-full py-3 bg-[#002991] hover:bg-[#0070e0] text-white rounded-full text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-500/20"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}

        {/* AP2 Cryptographic Mandate Modal */}
        {showMandateModal && contract?.ap2Mandate && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fintech-card bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <Fingerprint className="h-5 w-5 text-[#0070e0]" />
                  <h3 className="text-lg font-black text-slate-950 tracking-tight">AP2 Payment Mandate</h3>
                </div>
                <button 
                  onClick={() => setShowMandateModal(false)}
                  className="text-slate-400 hover:text-slate-950 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Agent Payments Protocol (AP2) verifiable cryptographic authorization issued by the client wallet.
              </p>

              <div className="space-y-2.5 font-mono text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200 text-slate-700">
                <div><span className="text-slate-500">MANDATE_ID:</span> {contract.ap2Mandate.mandateId}</div>
                <div><span className="text-slate-500">PROTOCOL:</span> {contract.ap2Mandate.protocolVersion}</div>
                <div><span className="text-slate-500">MAX_ESCROW_CAP:</span> {contract.ap2Mandate.maxEscrowCap}</div>
                <div><span className="text-slate-500">SETTLEMENT_RULE:</span> {contract.ap2Mandate.settlementCondition}</div>
                <div><span className="text-slate-500">DISPUTE_POLICY:</span> {contract.ap2Mandate.disputeProtocol}</div>
                <div className="pt-2.5 border-t border-slate-200 break-all text-[11px] text-emerald-700 font-bold">
                  <span className="text-slate-500 block">DIGITAL_SIGNATURE:</span>
                  {contract.ap2Mandate.cryptographicSignature}
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => setShowMandateModal(false)}
                  className="fintech-pill-btn w-full py-3 bg-[#002991] hover:bg-[#0070e0] text-white rounded-full text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-500/20"
                >
                  Close Mandate Inspector
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Escrow & Settlement Metrics Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl fintech-card border border-slate-200/90 text-center shadow-sm bg-white">
            <div className="space-y-1 border-r border-slate-200 last:border-none">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Custody Protocol</span>
              <div className="text-xl font-mono font-bold text-[#002991]">PayPal Vault</div>
              <p className="text-[11px] text-slate-400">Zero counterparty risk</p>
            </div>
            <div className="space-y-1 border-r border-slate-200 last:border-none">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Settlement Latency</span>
              <div className="text-xl font-mono font-bold text-emerald-600">14 ms</div>
              <p className="text-[11px] text-slate-400">Autonomous API dispatch</p>
            </div>
            <div className="space-y-1 border-r border-slate-200 last:border-none">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Standard Compliance</span>
              <div className="text-xl font-mono font-bold text-indigo-600">AP2 + WebMCP</div>
              <p className="text-[11px] text-slate-400">Claude & Cursor ready</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Arbitration SLA</span>
              <div className="text-xl font-mono font-bold text-amber-600">100% Guaranteed</div>
              <p className="text-[11px] text-slate-400">Auto-refund on failure</p>
            </div>
          </div>
        </div>

        {/* WebMCP Server Inspector Modal */}
        {showMcpModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fintech-card bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <Cpu className="h-5 w-5 text-[#0070e0]" />
                  <h3 className="text-lg font-black text-slate-950 tracking-tight">PayPal WebMCP Server Protocol</h3>
                </div>
                <button
                  onClick={() => setShowMcpModal(false)}
                  className="text-slate-400 hover:text-slate-950 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Official Model Context Protocol (MCP) JSON-RPC 2.0 server exposed at <code className="text-[#002991] font-bold">/api/mcp</code> for autonomous LLM agents (Claude, Cursor, GPT-4).
              </p>

              <div className="space-y-2.5 font-mono text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="text-slate-500 font-bold mb-1 tracking-wider uppercase text-[10px]">Available Agent Tools:</div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[#002991] font-bold">1. create_paypal_escrow</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Locks budget into PayPal Escrow Custody with AP2 signed mandate.</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-emerald-700 font-bold">2. inspect_and_settle_milestone</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Runs AST code evaluation & triggers PayPal Batch Payout on pass.</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-rose-700 font-bold">3. arbitrate_dispute_refund</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Instant automatic refund back to buyer on security constraint breach.</p>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => setShowMcpModal(false)}
                  className="fintech-pill-btn w-full py-3 bg-[#002991] hover:bg-[#0070e0] text-white rounded-full text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-500/20"
                >
                  Close WebMCP Inspector
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cryptographic Security Audit Certificate Modal */}
        {selectedAuditCert && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fintech-card bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-black text-slate-950 tracking-tight">Cryptographic Security Audit Certificate</h3>
                </div>
                <button
                  onClick={() => setSelectedAuditCert(null)}
                  className="text-slate-400 hover:text-slate-950 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">CERTIFICATE ID:</span>
                  <span className="text-[#0070e0] font-bold">CERT-{selectedAuditCert.id.toUpperCase()}-2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DELIVERABLE TARGET:</span>
                  <span className="text-slate-900 font-bold">{selectedAuditCert.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">INSPECTION RESULT:</span>
                  <span className="text-emerald-700 font-bold">PASSED (Score: {selectedAuditCert.deliverable?.verificationScore || 98}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AST STATIC ANALYSIS:</span>
                  <span className="text-slate-900">0 Critical Vulnerabilities</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PAYPAL SETTLEMENT HASH:</span>
                  <span className="text-[#002991] break-all font-bold">{selectedAuditCert.payoutTxId || 'SANDBOX-TX-HASH'}</span>
                </div>
                <div className="pt-2.5 border-t border-slate-200 text-[10px] text-slate-500 break-all">
                  SHA256 CHECKSUM: 0x9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => setSelectedAuditCert(null)}
                  className="fintech-pill-btn w-full py-3 bg-[#002991] hover:bg-[#0070e0] text-white rounded-full text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-500/20"
                >
                  Close Audit Certificate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Developer Work Deliverable Submission & PR Portal Modal */}
        {submittingMilestone && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fintech-card bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-4 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <GitPullRequest className="h-5 w-5 text-[#0070e0]" />
                  <div>
                    <h3 className="text-lg font-black text-slate-950 tracking-tight">Developer Deliverable Submission & Pull Request</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Submit code deliverable to trigger AST static audit and autonomous PayPal escrow settlement.</p>
                  </div>
                </div>
                <button
                  onClick={() => setSubmittingMilestone(null)}
                  className="text-slate-400 hover:text-slate-950 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Target Milestone Metadata */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-500">TARGET:</span>
                  <span className="text-slate-900 font-bold ml-2">{submittingMilestone.title}</span>
                </div>
                <div>
                  <span className="text-slate-500">ALLOCATION:</span>
                  <span className="text-emerald-700 font-bold ml-2">${submittingMilestone.amount} USD</span>
                </div>
              </div>

              {/* GitHub Pull Request URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <GitPullRequest className="h-3.5 w-3.5 text-slate-400" />
                  GitHub Pull Request URL
                </label>
                <input
                  type="text"
                  value={submittedPrUrl}
                  onChange={(e) => setSubmittedPrUrl(e.target.value)}
                  placeholder="https://github.com/organization/repo/pull/42"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070e0]/20 focus:border-[#0070e0]"
                />
              </div>

              {/* Quick Preset Buttons for Hackathon Judges */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Deliverable Source Code / Diff</label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500 text-xs font-medium">Test Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedCodeInput(
`import numpy as np
from sklearn.ensemble import IsolationForest

class ProductionEngine:
    def __init__(self):
        self.model = IsolationForest(contamination=0.01, random_state=42)
    
    def evaluate_risk(self, amount: float, velocity: int, cross_border: bool) -> dict:
        base = 0.05
        if amount > 5000: base += 0.50
        if velocity > 10: base += 0.30
        return {"risk_score": round(base, 2), "flagged": base > 0.60}`
                        );
                      }}
                      className="fintech-pill-btn px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 cursor-pointer font-mono text-[11px]"
                    >
                      Safe Code (Pass)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedCodeInput(
`import sqlite3

def get_user_records(user_input: str):
    # CRITICAL CWE-89: Unescaped string concatenation triggers SQL injection
    query = "SELECT * FROM transactions WHERE account_id = '" + user_input + "'"
    conn = sqlite3.connect('vault.db')
    return conn.cursor().execute(query).fetchall()`
                        );
                      }}
                      className="fintech-pill-btn px-3 py-1 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 cursor-pointer font-mono text-[11px]"
                    >
                      Vulnerable Code (Dispute)
                    </button>
                  </div>
                </div>

                <textarea
                  value={submittedCodeInput}
                  onChange={(e) => setSubmittedCodeInput(e.target.value)}
                  rows={8}
                  className="w-full bg-[#001c64] border border-[#002991] rounded-2xl p-4 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-2 focus:ring-[#0070e0]/20 focus:border-[#0070e0] leading-relaxed shadow-inner"
                  placeholder="// Paste complete deliverable source code or PR diff here..."
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#002991] leading-relaxed">
                <span className="font-bold">Autonomous Verification Pipeline:</span> AST analysis evaluates cyclomatic complexity, CWE-89 SQL injection, and hardcoded secrets. Upon passing (&gt;=80%), PayPal Batch Payout releases <span className="font-bold text-slate-900">${submittingMilestone.amount} USD</span>. On failure, PayPal dispute refund triggers automatically.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingMilestone(null)}
                  className="fintech-pill-btn flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-full text-xs font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = submittingMilestone;
                    const code = submittedCodeInput;
                    setSubmittingMilestone(null);
                    handleRunMilestone(target, code);
                  }}
                  className="fintech-pill-btn flex-1 py-3 bg-[#002991] hover:bg-[#0070e0] text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 transition-all"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Run AI AST Inspection & Settle</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-200 py-10 text-center text-xs text-slate-500 bg-white mt-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <EcpLogo className="h-6 w-6" />
              <span className="font-black text-slate-950 text-sm">EsCrow Pay</span>
              <span className="text-slate-400">© 2026 — Built for the PayPal AI Hackathon</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <a href="https://escrow-pay.onrender.com/" target="_blank" rel="noopener noreferrer" className="text-[#0070e0] hover:text-[#002991] transition-colors">Render Live</a>
              <a href="https://github.com/Kanhaiyaji/EsCrow-Pay" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors">GitHub Repository</a>
              <button onClick={() => setShowMcpModal(true)} className="text-[#002991] hover:text-[#0070e0] transition-colors cursor-pointer">WebMCP Protocol</button>
            </div>
          </div>
        </footer>
      </div>
    </PayPalScriptProvider>
  );
}
