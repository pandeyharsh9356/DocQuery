import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type ClerkUserPayload = {
  id: string;
  email_addresses?: Array<{ email_address?: string | null }>;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  image_url?: string | null;
};

type ClerkWebhookEvent = {
  type: string;
  data: ClerkUserPayload;
};

function normalizeName(firstName: string | null | undefined, lastName: string | null | undefined, username: string | null | undefined) {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  return fullName || username || null;
}

export async function POST(req: NextRequest) {
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 });
  }

  const payload = await req.text();
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 });
  }

  const wh = new Webhook(webhookSecret);

  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const clerkUserId = event.data?.id;

  if (!clerkUserId) {
    return NextResponse.json({ error: 'Malformed event payload' }, { status: 400 });
  }

  switch (event.type) {
    case 'user.created':
    case 'user.updated': {
      const email = event.data.email_addresses?.find((entry) => entry.email_address)?.email_address ?? null;
      const name = normalizeName(event.data.first_name, event.data.last_name, event.data.username);

      await prisma.user.upsert({
        where: { clerkUserId },
        create: {
          clerkUserId,
          email: email ?? `${clerkUserId}@local.invalid`,
          name,
          imageUrl: event.data.image_url ?? null,
        },
        update: {
          email: email ?? `${clerkUserId}@local.invalid`,
          name,
          imageUrl: event.data.image_url ?? null,
        },
      });
      break;
    }
    case 'user.deleted': {
      await prisma.user.deleteMany({
        where: { clerkUserId },
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ success: true });
}
