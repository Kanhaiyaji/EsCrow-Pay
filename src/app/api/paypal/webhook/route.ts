import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body?.event_type || 'PAYMENT.CAPTURE.COMPLETED';
    const resource = body?.resource || {};

    console.log(`[PayPal Webhook Received]: ${eventType}`, resource.id);

    // Map webhook event to autonomous escrow state
    let actionLog = '';
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      actionLog = `Autonomous Webhook Confirmed: Capture ${resource.id} settled in PayPal Custody Vault.`;
    } else if (eventType === 'PAYMENT.CAPTURE.REFUNDED') {
      actionLog = `Autonomous Webhook Confirmed: Capture ${resource.id} refunded back to buyer.`;
    } else if (eventType === 'PAYMENT.PAYOUTS-ITEM.SUCCEEDED') {
      actionLog = `Autonomous Webhook Confirmed: Micro-payout item ${resource.payout_item_id} successfully delivered to Agent.`;
    } else {
      actionLog = `Webhook Event Processed: ${eventType}`;
    }

    return NextResponse.json({
      received: true,
      eventType,
      resourceId: resource.id,
      actionLog,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
