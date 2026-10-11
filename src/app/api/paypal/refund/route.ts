import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { orderId, captureId, amount, currency, reason } = await req.json();

    const hasKeys = !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET;

    if (!hasKeys) {
      // High fidelity PayPal Sandbox Refund simulation
      const mockRefundId = `SANDBOX-REFUND-${Date.now()}`;
      return NextResponse.json({
        id: mockRefundId,
        status: 'COMPLETED',
        amount: {
          value: amount ? Number(amount).toFixed(2) : '50.00',
          currency_code: currency || 'USD',
        },
        reason: reason || 'Dispute arbitration: milestone criteria not met by Agent.',
        isMock: true,
        message: 'Escrow deposit safely refunded back to buyer via PayPal Sandbox.',
      });
    }

    // Live PayPal refund call
    const baseUrl = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
    const { getPayPalAccessToken } = await import('@/lib/paypal');
    const token = await getPayPalAccessToken();

    const targetCaptureId = captureId || orderId;

    const res = await fetch(`${baseUrl}/v2/payments/captures/${targetCaptureId}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        note_to_payer: reason || 'AI Arbitration Escrow Refund',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Refund failed: ${err}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
