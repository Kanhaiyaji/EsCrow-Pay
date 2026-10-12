# EsCrow Pay: Autonomous Agentic Commerce & Escrow Settlement

> **Built for the PayPal AI Hackathon 2026**  
> 🌐 **Live Render Deployment:** [https://escrow-pay.onrender.com/](https://escrow-pay.onrender.com/)  
> 🎯 **Target Prize Categories:**
> - 🥇 **Top Overall Winner ($12,000)**
> - 🤖 **Best Use of Agentic Commerce ($5,000)**
> - 🚀 **Best Use of Render ($2,000)**

---

## 💡 Overview & Problem Statement
As AI agents evolve from passive conversational chat interfaces into autonomous economic actors, they face a fundamental barrier: **How do autonomous agents transact, contract, and exchange value safely without counterparty risk or blind spending authority?**

Traditional payment gateways assume human interaction (manual checkout flows, clicking 3DS confirmation prompts). Meanwhile, existing freelance platforms suffer from high friction: buyers fear paying upfront before seeing verified work, while autonomous developers risk non-payment or delayed arbitration.

**EsCrow Pay** solves this with an **autonomous escrow and micro-settlement protocol powered by the PayPal Developer Platform, Model Context Protocol (MCP), and the Agent Payments Protocol (AP2)**.

---

## ⚡ Key Architectural Innovations

### 1. Cryptographic AP2 Mandates & Spending Caps
- Clients authorize autonomous milestones governed by an **AP2 (Agent Payments Protocol)** digital mandate.
- Cryptographically signs spending limits, arbitration rules, and verifiable acceptance criteria before funds leave the client's wallet.

### 2. Multi-Agent Reverse-Auction & Decomposition
- Complex project mandates (e.g. *"Build an AI-Powered Fraud Detection Microservice"*) are automatically decomposed into verifiable technical milestones.
- Specialized autonomous agents (`Agent-Architect`, `Agent-Builder`, `Agent-Sentinel`) bid dynamically in reverse-auction based on SLA commitments and verified on-chain reputation scores.

### 3. Context-Aware Negotiation Room
- Real-time bilateral chat room where clients and autonomous agents negotiate budget constraints, delivery deadlines, and technical boundaries.
- Project-aware agent mesh tracks active milestone progress, discounts allocations upon request, and signs revised contract terms.

### 4. Official Model Context Protocol (WebMCP) JSON-RPC 2.0 Server
- Exposed at `/api/mcp` for agentic frameworks (Claude, Cursor, LangChain, AutoGen).
- Exposes 3 standard MCP tools:
  - `create_paypal_escrow`: Locks budget into PayPal Sandbox Custody.
  - `inspect_and_settle_milestone`: Runs deterministic AST static analysis and triggers automated PayPal Batch Payouts.
  - `arbitrate_dispute_refund`: Autonomous arbitration engine that reverses funds to the buyer on security breaches.

### 5. Deterministic AST Static Code Inspector & Security Guardrail
- Deliverables undergo automated Abstract Syntax Tree (AST) inspection, cyclomatic complexity calculations, and security auditing.
- Flags CWE-89 (SQL Injection) and CWE-798 (Hardcoded Credentials) vulnerabilities before financial release.

### 6. Conditional PayPal Sandbox Settlement Engine
- **On Verification Pass (Score ≥ 80%):** Automated **PayPal Batch Payouts (v1)** releases micro-payments directly to the verified agent's PayPal Sandbox account with cryptographic audit certificates.
- **On Security Failure (< 80%):** Automated **PayPal Captures Refund (v2)** initiates dispute resolution and instantly refunds custody balance back to the buyer wallet.

### 7. Developer Deliverable Submission & Pull Request Portal
- Allows human developers and autonomous agents to submit work deliverables via GitHub Pull Request URLs or raw source code.
- Includes quick-test presets for hackathon judges to verify both the passing payout flow and the defensive dispute-refund flow.

### 8. Real-time Double-Entry Settlement Ledger
- Instant accounting telemetry tracking:
  - Escrow Deposited
  - Disbursed Payouts
  - Refunded Disputes
  - Remaining Custody Balance
  - PayPal Transaction IDs & Verification SHA-256 Checksums

### 9. Event-Driven PayPal Webhooks Telemetry
- Real-time webhook listener at `/api/paypal/webhook` processing `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.REFUNDED`, and `PAYMENT.PAYOUTS-ITEM.SUCCEEDED`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Payments & Escrow** | PayPal Developer Platform (Orders v2, Captures v2, Batch Payouts v1, Captures Refund v2, Webhooks v1) |
| **Agent Protocols** | Agent Payments Protocol (AP2/1.0), Model Context Protocol (WebMCP JSON-RPC 2.0) |
| **AI & Inspection** | AST Static Code Analysis, Cyclomatic Complexity, OWASP Vulnerability Scanner, Context-Aware Agent Mesh |
| **Full-Stack Web** | Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS, Lucide Icons |
| **Cloud Hosting** | Render (Node.js 20 production runtime with zero-downtime continuous deployment) |

---

## 🚀 Getting Started

### Local Setup
```bash
git clone https://github.com/Kanhaiyaji/EsCrow-Pay.git
cd EsCrow-Pay
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Configuration (`.env.local`)
```env
PAYPAL_CLIENT_ID=BAAmBsUf3aIIoRcL-D5RcunYSC6jf2eFkdbyRezRQNH2xrhpncxM3_5H6m6tqmRc4jqIXbG7VbZyivIzhw
PAYPAL_CLIENT_SECRET=ELLKGNGHdmBB8MPvyxGcmNvoANVc4lQmtP3R3N0ZtWtbnlXq6MLbHxSX5WqGBi9Buo3iAqVcMe4pKHfm
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
NEXT_PUBLIC_PAYPAL_CLIENT_ID=BAAmBsUf3aIIoRcL-D5RcunYSC6jf2eFkdbyRezRQNH2xrhpncxM3_5H6m6tqmRc4jqIXbG7VbZyivIzhw
```
*(EsCrow Pay includes 1-click Sandbox Bypass for instant judge evaluation without logging in).*

---

## 🏆 Devpost Demo Pitch & Video Walkthrough (Under 3 Minutes)

1. **0:00 - 0:35 | The Problem:**
   Explain why autonomous agentic commerce cannot function with manual human checkouts, and why agents need conditional escrow guarantees.
2. **0:35 - 1:10 | Reverse-Auction & AP2 Mandate:**
   Enter project goal, witness multi-agent bidding and cryptographic AP2 mandate generation.
3. **1:10 - 1:40 | PayPal Sandbox Custody Lock:**
   Demonstrate fund locking via official PayPal SDK buttons with live transaction telemetry.
4. **1:40 - 2:15 | Developer Submission & AST Code Inspection:**
   Open the Developer Submission Portal, submit code, run AST inspection, and show automated PayPal Batch Payout release with official receipt and audit certificate.
5. **2:15 - 2:40 | Defensive Security & Automated Refund:**
   Submit code with a simulated SQL injection vulnerability; demonstrate immediate dispute trigger and automated PayPal refund back to buyer.
6. **2:40 - 3:00 | WebMCP & Settlement Ledger:**
   Show WebMCP tools (`/api/mcp`) for autonomous agent connectivity and review the double-entry accounting Settlement Ledger.

---

## 📜 License
MIT © 2026 EsCrow Pay Contributors. Built for the PayPal AI Hackathon.
