// Helper to get OAuth2 Access Token from PayPal Sandbox
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    // If user hasn't provided real sandbox keys yet, throw informative error
    throw new Error('MISSING_PAYPAL_CREDENTIALS');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`PayPal Auth Failed: ${res.status} - ${errorData}`);
  }

  const data = await res.json();
  return data.access_token;
}

// 1. Create Order to Authorize / Capture Escrow funds
export async function createPayPalEscrowOrder(amount: number, currency: string = 'USD') {
  const baseUrl = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
  const token = await getPayPalAccessToken();

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE', // Funds captured into Escrow custody
      purchase_units: [
        {
          reference_id: `ESCROW-${Date.now()}`,
          description: 'EscrowPay Agentic Contract Escrow Deposit',
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to create PayPal Order: ${err}`);
  }

  return await response.json();
}

// 2. Capture the Order once Client approves
export async function capturePayPalEscrowOrder(orderId: string) {
  const baseUrl = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
  const token = await getPayPalAccessToken();

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to capture PayPal Order: ${err}`);
  }

  return await response.json();
}

// 3. Automated Payout to Agent/Contractor upon AI Milestone Verification
export async function releaseAgentPayout(
  recipientEmail: string,
  amount: number,
  currency: string = 'USD',
  note: string = 'Milestone Verified & Paid by EscrowPay AI'
) {
  const baseUrl = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
  const token = await getPayPalAccessToken();

  const batchId = `PAYOUT-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const response = await fetch(`${baseUrl}/v1/payments/payouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: batchId,
        email_subject: 'You received a milestone payout via EscrowPay!',
        email_message: note,
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: amount.toFixed(2),
            currency: currency,
          },
          note: note,
          sender_item_id: `ITEM-${Date.now()}`,
          receiver: recipientEmail,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Payout failed: ${err}`);
  }

  return await response.json();
}
