import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const yearGroup = Number(body.year_group);
  if (!yearGroup || yearGroup < 7 || yearGroup > 13) {
    return NextResponse.json({ error: 'Invalid year group' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: session.user.id, year_group: yearGroup }, { onConflict: 'id' });

  if (error) {
    console.error('Profile upsert failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
