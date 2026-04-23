import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import clubs from '@/data/clubs.json';

export const dynamic = 'force-dynamic';

type AppRow = {
  id: string;
  user_id: string;
  club_id: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  reviewed_at: string | null;
  notes: string | null;
};

type ProfileRow = {
  id: string;
  year_group: number | null;
};

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function csvEscape(value: unknown): string {
  const raw = value == null ? '' : String(value);
  if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function toTitleCase(value: string): string {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function fileSafe(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
}

async function getUserEmailMap(supabase: ReturnType<typeof getAdminClient>) {
  const emailByUserId = new Map<string, string>();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      console.error('Failed to list users for CSV export:', error);
      break;
    }

    const users = data?.users ?? [];
    for (const user of users) {
      if (user.id && user.email) {
        emailByUserId.set(user.id, user.email);
      }
    }

    if (users.length < 1000) break;
    page += 1;
  }

  return emailByUserId;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const groupBy = request.nextUrl.searchParams.get('groupBy');
  const yearGroupValue = request.nextUrl.searchParams.get('yearGroup')?.trim();
  const clubId = request.nextUrl.searchParams.get('clubId')?.trim();
  const statusScope = request.nextUrl.searchParams.get('statusScope')?.trim() ?? 'pending';

  if (groupBy !== 'year' && groupBy !== 'club') {
    return NextResponse.json({ error: 'groupBy must be either year or club' }, { status: 400 });
  }

  if (statusScope !== 'pending' && statusScope !== 'all') {
    return NextResponse.json({ error: 'statusScope must be either pending or all' }, { status: 400 });
  }

  if (groupBy === 'year' && !yearGroupValue) {
    return NextResponse.json({ error: 'yearGroup is required for year export' }, { status: 400 });
  }

  if (groupBy === 'club' && !clubId) {
    return NextResponse.json({ error: 'clubId is required for club export' }, { status: 400 });
  }

  const yearGroup = yearGroupValue ? parseInt(yearGroupValue, 10) : null;
  if (groupBy === 'year' && (yearGroup == null || Number.isNaN(yearGroup))) {
    return NextResponse.json({ error: 'Invalid yearGroup' }, { status: 400 });
  }

  const supabase = getAdminClient();

  let query = supabase
    .from('applications')
    .select('id,user_id,club_id,status,applied_at,reviewed_at,notes')
    .order('applied_at', { ascending: true });

  if (statusScope === 'pending') {
    query = query.eq('status', 'pending');
  }

  if (groupBy === 'club' && clubId) {
    query = query.eq('club_id', clubId);
  }

  const { data: appRows, error: appError } = await query;
  if (appError) {
    console.error('Failed to fetch applications for CSV export:', appError);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }

  const applications = (appRows ?? []) as AppRow[];

  const userIds = Array.from(new Set(applications.map((row) => row.user_id)));
  let profileByUserId = new Map<string, number | null>();

  if (userIds.length > 0) {
    const { data: profileRows, error: profileError } = await supabase
      .from('profiles')
      .select('id,year_group')
      .in('id', userIds);

    if (profileError) {
      console.error('Failed to fetch profiles for CSV export:', profileError);
      return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 });
    }

    profileByUserId = new Map((profileRows as ProfileRow[]).map((row) => [row.id, row.year_group]));
  }

  const emailByUserId = await getUserEmailMap(supabase);

  const filtered = applications.filter((row) => {
    if (groupBy === 'year') {
      return profileByUserId.get(row.user_id) === yearGroup;
    }
    return true;
  });

  const csvHeader = [
    'application_id',
    'user_id',
    'user_email',
    'year_group',
    'club_id',
    'club_name',
    'status',
    'applied_at',
    'reviewed_at',
    'notes',
  ];

  const rows = filtered.map((row) => {
    const clubName = clubs.find((club) => club.id === row.club_id)?.name ?? toTitleCase(row.club_id);
    const year = profileByUserId.get(row.user_id) ?? '';
    return [
      row.id,
      row.user_id,
      emailByUserId.get(row.user_id) ?? '',
      year,
      row.club_id,
      clubName,
      row.status,
      row.applied_at,
      row.reviewed_at ?? '',
      row.notes ?? '',
    ];
  });

  const csv = [csvHeader, ...rows]
    .map((line) => line.map(csvEscape).join(','))
    .join('\n');

  const date = new Date().toISOString().slice(0, 10);
  const filename = groupBy === 'year'
    ? `applications-year-${yearGroup}-${statusScope}-${date}.csv`
    : `applications-club-${fileSafe(clubId!)}-${statusScope}-${date}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
