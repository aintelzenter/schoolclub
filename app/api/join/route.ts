import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.clubId) {
      return NextResponse.json(
        { error: 'Missing clubId' },
        { status: 400 }
      )
    }

    // Check if application already exists
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('club_id', body.clubId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already applied to this club' },
        { status: 400 }
      )
    }

    // Create application
    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: session.user.id,
        club_id: body.clubId,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating application:', error)
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, application: data },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing join request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

