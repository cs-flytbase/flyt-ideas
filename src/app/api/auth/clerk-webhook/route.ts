import { Webhook } from 'svix';
import { NextRequest } from 'next/server';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers directly from the request
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the event
  const eventType = evt.type;

  // Handle based on event type
  switch (eventType) {
    case 'user.created':
      // Handle user creation
      console.log('User created:', evt.data);
      break;
    case 'user.updated':
      // Handle user update
      console.log('User updated:', evt.data);
      break;
    case 'session.created':
      // Handle session creation
      console.log('Session created:', evt.data);
      break;
    // Add more cases as needed
    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  return new Response('Webhook received', {
    status: 200,
  });
}
