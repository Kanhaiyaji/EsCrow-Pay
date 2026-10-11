export interface ContractMilestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  assignedAgent: string;
  agentRole: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'verified' | 'paid' | 'disputed' | 'refunded';
  verificationCriteria: string;
  deliverableCode?: string;
  deliverable?: {
    content: string;
    submittedAt: string;
    verificationScore?: number;
    verificationNotes?: string;
  };
  payoutTxId?: string;
  refundTxId?: string;
}

export interface AP2Mandate {
  mandateId: string;
  protocolVersion: string;
  authorizedBy: string;
  maxEscrowCap: string;
  settlementCondition: string;
  disputeProtocol: string;
  cryptographicSignature: string;
}

export interface AgentChatMessage {
  sender: string;
  role: string;
  color: string;
  message: string;
  time: string;
}

export interface EscrowContract {
  id: string;
  title: string;
  description: string;
  clientName: string;
  clientEmail: string;
  totalBudget: number;
  currency: string;
  status: 'draft' | 'funded_in_escrow' | 'in_progress' | 'completed' | 'disputed' | 'refunded';
  paypalOrderId?: string;
  paypalCaptureId?: string;
  isSimulatedDemo?: boolean;
  createdAt: string;
  ap2Mandate?: AP2Mandate;
  negotiationChat?: AgentChatMessage[];
  milestones: ContractMilestone[];
  agentLogs: {
    id: string;
    timestamp: string;
    agentName: string;
    agentColor: string;
    message: string;
    type: 'info' | 'bidding' | 'execution' | 'verification' | 'payout' | 'dispute' | 'refund';
  }[];
}
