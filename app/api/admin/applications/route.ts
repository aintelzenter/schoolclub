import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { authOptions } from '@/lib/auth';
import { getAdminEmails, isAdminEmail } from '@/lib/admin';
import { Resend } from 'resend';
import clubs from '@/data/clubs.json';

export const dynamic = 'force-dynamic';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type UpdatePayload = {
  id?: string;
  ids?: string[];
  status?: 'approved' | 'rejected';
  notes?: string;
};

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function toTitleCase(value: string): string {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

async function sendStatusNotifications(params: {
  userId: string;
  clubId: string;
  status: 'approved' | 'rejected';
  notes: string | null;
  reviewedByEmail: string;
}) {
  if (!resend) return;

  const supabase = getAdminClient();
  const clubName = clubs.find((club) => club.id === params.clubId)?.name ?? toTitleCase(params.clubId);
  const statusLabel = params.status === 'approved' ? 'Approved' : 'Rejected';

  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(params.userId);
  if (userError) {
    console.error('Failed to fetch user email for notification:', userError);
  }

  const userEmail = userData?.user?.email;
  const adminRecipients = getAdminEmails();

  const userEmailPromise = userEmail
    ? resend.emails.send({
        from: 'ANSxtra <noreply@ansxtra.com>',
        to: userEmail,
        subject: `ANSxtra Application ${statusLabel}: ${clubName}`,
        html: `
          <h2>Your Club Application Has Been ${statusLabel}</h2>
          <p><strong>Club:</strong> ${clubName}</p>
          <p><strong>Status:</strong> ${statusLabel}</p>
          ${params.notes ? `<p><strong>Notes:</strong> ${params.notes}</p>` : ''}
          <p>You can review this in your My Applications page.</p>
        `,
      })
    : Promise.resolve(null);

  const adminEmailPromise = adminRecipients.length
    ? resend.emails.send({
        from: 'ANSxtra <noreply@ansxtra.com>',
        to: adminRecipients,
        subject: `Application ${statusLabel}: ${clubName}`,
        html: `
          <h2>Application Review Completed</h2>
          <p><strong>Club:</strong> ${clubName}</p>
          <p><strong>Status:</strong> ${statusLabel}</p>
          <p><strong>User ID:</strong> ${params.userId}</p>
          <p><strong>Reviewed by:</strong> ${params.reviewedByEmail}</p>
          ${params.notes ? `<p><strong>Notes:</strong> ${params.notes}</p>` : ''}
        `,
      })
    : Promise.resolve(null);

  const results = await Promise.allSettled([userEmailPromise, adminEmailPromise]);
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Status notification email failed:', result.reason);
    }
  }
}

async function authorizeAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (!isAdminEmail(session.user.email)) {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { ok: true as const, session };
}

export async function GET() {
  const auth = await authorizeAdmin();
  if (!auth.ok) return auth.response;

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('applications')
    .select('id,user_id,club_id,status,applied_at,reviewed_at,notes')
    .eq('status', 'pending')
    .order('applied_at', { ascending: true });

  if (error) {
    console.error('Admin applications GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch pending applications' }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function PATCH(request: NextRequest) {
  const auth = await authorizeAdmin();
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as UpdatePayload;
  const ids = Array.from(
    new Set((body.ids ?? []).map((value) => String(value).trim()).filter(Boolean))
  );
  const id = body.id?.trim();
  const status = body.status;
  const notes = body.notes?.trim() ?? null;

  if ((!id && ids.length === 0) || !status || (status !== 'approved' && status !== 'rejected')) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  const targetIds = ids.length > 0 ? ids : [id!];
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('applications')
    .update({
      status,
      notes,
      reviewed_at: new Date().toISOString(),
    })
    .in('id', targetIds)
    .select('id,user_id,club_id,status,applied_at,reviewed_at,notes')


  if (error) {
    console.error('Admin applications PATCH failed:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }

  const updatedRows = data ?? [];
  if (updatedRows.length === 0) {
    return NextResponse.json({ error: 'No applications were updated' }, { status: 404 });
  }

  await Promise.all(
    updatedRows.map((row) =>
      sendStatusNotifications({
        userId: row.user_id,
        clubId: row.club_id,
        status: row.status,
        notes: row.notes,
        reviewedByEmail: auth.session.user.email,
      })
    )
  );

  if (ids.length > 0) {
    return NextResponse.json({
      success: true,
      updatedCount: updatedRows.length,
      applications: updatedRows,
    });
  }

  return NextResponse.json(updatedRows[0]);
}
