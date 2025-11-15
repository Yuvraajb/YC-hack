import { storage } from "./storage";
import type { TransactionType } from "@shared/schema";

export class PaymentLedger {
  async createEscrow(
    fromAgentId: string,
    toAgentId: string,
    amount: number,
    jobId: string
  ): Promise<string> {
    const escrowId = `esc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Deduct from coordinator wallet
    const fromAgent = await storage.getAgent(fromAgentId);
    if (!fromAgent) {
      throw new Error(`Agent ${fromAgentId} not found`);
    }

    const currentBalance = parseFloat(fromAgent.walletBalance);
    if (currentBalance < amount) {
      throw new Error(`Insufficient balance: ${currentBalance} < ${amount}`);
    }

    const newBalance = (currentBalance - amount).toFixed(2);
    await storage.updateAgentBalance(fromAgentId, newBalance);

    // Create escrow transaction
    await storage.createTransaction({
      type: "escrow_create",
      fromWallet: fromAgentId,
      toWallet: toAgentId,
      amount: amount.toFixed(2),
      jobId,
      escrowId,
    });

    console.log(
      `[LEDGER] Escrow created: ${escrowId} | ${fromAgentId} → ${toAgentId} | $${amount} | Job: ${jobId}`
    );

    return escrowId;
  }

  async releaseEscrow(escrowId: string, toAgentId: string, amount: number, jobId: string): Promise<void> {
    // Add to agent wallet
    const toAgent = await storage.getAgent(toAgentId);
    if (!toAgent) {
      throw new Error(`Agent ${toAgentId} not found`);
    }

    const currentBalance = parseFloat(toAgent.walletBalance);
    const newBalance = (currentBalance + amount).toFixed(2);
    await storage.updateAgentBalance(toAgentId, newBalance);

    // Update agent stats
    await storage.incrementAgentStats(toAgentId, amount.toFixed(2));

    // Find original transaction to get fromWallet
    const allTransactions = await storage.getAllTransactions();
    const escrowTxn = allTransactions.find(
      (t) => t.escrowId === escrowId && t.type === "escrow_create"
    );

    // Create release transaction
    await storage.createTransaction({
      type: "escrow_release",
      fromWallet: "escrow",
      toWallet: toAgentId,
      amount: amount.toFixed(2),
      jobId,
      escrowId,
    });

    console.log(
      `[LEDGER] Escrow released: ${escrowId} → ${toAgentId} | $${amount} | Job: ${jobId}`
    );
  }

  async cancelEscrow(
    escrowId: string,
    fromAgentId: string,
    amount: number,
    jobId: string
  ): Promise<void> {
    // Return to coordinator wallet
    const fromAgent = await storage.getAgent(fromAgentId);
    if (!fromAgent) {
      throw new Error(`Agent ${fromAgentId} not found`);
    }

    const currentBalance = parseFloat(fromAgent.walletBalance);
    const newBalance = (currentBalance + amount).toFixed(2);
    await storage.updateAgentBalance(fromAgentId, newBalance);

    // Create cancel transaction
    await storage.createTransaction({
      type: "escrow_cancel",
      fromWallet: "escrow",
      toWallet: fromAgentId,
      amount: amount.toFixed(2),
      jobId,
      escrowId,
    });

    console.log(
      `[LEDGER] Escrow cancelled: ${escrowId} → ${fromAgentId} | $${amount} | Job: ${jobId}`
    );
  }

  async getWalletBalance(agentId: string): Promise<number> {
    const agent = await storage.getAgent(agentId);
    return agent ? parseFloat(agent.walletBalance) : 0;
  }

  async getEscrowBalance(): Promise<number> {
    const balance = await storage.getEscrowBalance();
    return parseFloat(balance);
  }
}

export const ledger = new PaymentLedger();
