import { NextRequest, NextResponse } from 'next/server';
import { createPayPalEscrowOrder, capturePayPalEscrowOrder } from '@/lib/paypal';

export async function POST(req: NextRequest) {
  try {
    const { action, amount, currency, orderId } = await req.json();

    if (action === 'create') {
      const order = await createPayPalEscrowOrder(Number(amount) || 50, currency || 'USD');
      console.log('Real PayPal Order Created:', order.id);
      return NextResponse.json(order);
    }

    if (action === 'capture') {
      if (!orderId) {
        return NextResponse.json({ error: 'Order ID required for capture' }, { status: 400 });
      }

      const captured = await capturePayPalEscrowOrder(orderId);
      console.log('Real PayPal Order Captured:', captured.id);
      return NextResponse.json(captured);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('PayPal Order API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
