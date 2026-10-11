# EscrowPay: Autonomous Agentic Commerce & Escrow Settlement

> **Built for the PayPal AI Hackathon**  
> Targeting: **Top Overall Winner ($12,000)** & **Best Use of Agentic Commerce ($5,000)**

---

## 💡 Overview & Problem
As AI agents evolve from conversational tools to autonomous economic actors, they face a critical barrier: **How do agents transact safely without counterparty risk or blind spending authorization?**

Traditional payment gateways assume human interaction (clicking checkout buttons). Traditional freelance contracts suffer from friction: clients fear paying upfront, and autonomous workers risk non-payment.

**EscrowPay** bridges this divide by delivering an **autonomous escrow and micro-settlement protocol powered by PayPal and Agent Payments Protocol (AP2)**.

---

## ⚡ Core Innovations

1. **AP2 (Agent Payments Protocol) Cryptographic Mandates:**
   - Buyers issue a cryptographically signed payment mandate that locks funds into PayPal Sandbox Escrow Custody with strict release criteria.
2. **Autonomous Multi-Agent Reverse-Auction:**
   - Specialized agents (`Agent-Architect`, `Agent-Builder`, `Agent-Sentinel`) bid dynamically on decomposed project milestones based on reputation scores.
3. **AI Quality Inspector & Real-time Inspection:**
   - AI evaluates deliverables against verifiable technical criteria (linting, vulnerability scan, test coverage) prior to financial release.
4. **Conditional PayPal Settlement:**
   - **On Pass (>= 80% Quality Score):** Automated PayPal Batch Payouts release micro-payments directly to agent accounts.
   - **On Failure / Security Violation (< 80%):** Automated Dispute Arbitration triggers instant **PayPal Sandbox Refund** back to the buyer wallet.
5. **Judges Interactive Test Console:**
   - Built-in live toggle allowing hackathon judges to verify both the happy path (Automated Payout) and the defensive security path (Automated Refund Dispute).

---

## 🛠️ Technology Stack
- **PayPal Developer Platform:** Orders API (v2), Captures, Batch Payouts (v1), Captures Refund (v2), Sandbox Environment.
- **AI Engine:** Multi-Agent State Machine & Automated Code Verification Inspector.
- **Frontend & Fullstack:** Next.js (App Router, Turbopack), TypeScript, Tailwind CSS, Lucide Icons.

---

## 🚀 Quickstart

### 1. Install & Run
```bash
cd escrow-pay
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Environment Variables (`.env.local`)
To run against real PayPal Sandbox keys:
```env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
```
*(If keys are not provided, EscrowPay automatically runs in High-Fidelity Sandbox Simulation mode so anyone can evaluate the full workflow instantly.)*

---

## 🏆 Devpost Video Demo Walkthrough (Under 3 mins)
1. **0:00 - 0:30:** Introduce the problem of agentic finance & why AI agents need PayPal Escrow.
2. **0:30 - 1:15:** Enter goal, show multi-agent reverse bidding & AP2 mandate cryptographic generation.
3. **1:15 - 1:45:** Deposit funds into PayPal Sandbox Escrow custody.
4. **1:45 - 2:30:** Demonstrate live milestone inspection: show automated PayPal Payout on pass, and flip the Judge Console to show automated PayPal Refund on failure.
5. **2:30 - 3:00:** Explain real-world commercial impact for gig economy and autonomous agent networks.
