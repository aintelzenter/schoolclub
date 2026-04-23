import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import clubs from '@/data/clubs.json'

const resend = new Resend(process.env.RESEND_API_KEY)

function normalizeYearGroup(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = parseInt(value.replace('Y', '').trim(), 10)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.name) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Support both single clubId and array clubIds
    const clubIdsRaw = body.clubIds || (body.clubId ? [body.clubId] : [])
    const clubIds = Array.from(
      new Set(
        (Array.isArray(clubIdsRaw) ? clubIdsRaw : [clubIdsRaw])
          .map((value) => String(value).trim())
          .filter(Boolean)
      )
    )

    if (!clubIds.length) {
      return NextResponse.json(
        { error: 'Missing clubIds' },
        { status: 400 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('year_group')
      .eq('id', session.user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile for eligibility check:', profileError)
      return NextResponse.json(
        { error: 'Failed to verify profile eligibility' },
        { status: 500 }
      )
    }

    const userYearGroup = normalizeYearGroup(profile?.year_group)
    if (!userYearGroup) {
      return NextResponse.json(
        { error: 'Profile year group is required before applying to clubs' },
        { status: 400 }
      )
    }

    const invalidClubIds = clubIds.filter((clubId) => !clubs.some((club) => club.id === clubId))
    if (invalidClubIds.length > 0) {
      return NextResponse.json(
        { error: 'Invalid clubIds provided', invalidClubIds },
        { status: 400 }
      )
    }

    const ineligibleClubIds = clubIds.filter((clubId) => {
      const club = clubs.find((item) => item.id === clubId)
      if (!club) return true
      const min = club.yearGroupMin ?? 7
      const max = club.yearGroupMax ?? 13
      return userYearGroup < min || userYearGroup > max
    })

    if (ineligibleClubIds.length > 0) {
      const ineligibleClubs = clubs
        .filter((club) => ineligibleClubIds.includes(club.id))
        .map((club) => ({
          id: club.id,
          name: club.name,
          yearGroupMin: club.yearGroupMin ?? 7,
          yearGroupMax: club.yearGroupMax ?? 13,
        }))

      return NextResponse.json(
        {
          error: 'One or more selected clubs are not available for your year group',
          userYearGroup,
          ineligibleClubs,
        },
        { status: 403 }
      )
    }

    const applications = []
    const appliedClubs = []

    for (const clubId of clubIds) {
      // Check if application already exists
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('club_id', clubId)
        .single()

      if (existing) {
        continue // Skip if already applied
      }

      // Create application
      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: session.user.id,
          club_id: clubId,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating application:', error)
        continue
      }

      applications.push(data)
      const club = clubs.find(c => c.id === clubId)
      if (club) {
        appliedClubs.push(club.name)
      }
    }

    // Send email notification if any applications were created
    if (appliedClubs.length > 0) {
      try {
        await resend.emails.send({
          from: 'ANSxtra <noreply@ansxtra.com>',
          to: 'chinthakag@amnuaysilpa.ac.th',
          subject: `New Club Application: ${session.user.name}`,
          html: `
            <h2>New Club Application Received</h2>
            <p><strong>Student Name:</strong> ${session.user.name}</p>
            <p><strong>Student Email:</strong> ${session.user.email}</p>
            <p><strong>Applied Clubs:</strong></p>
            <ul>
              ${appliedClubs.map(club => `<li>${club}</li>`).join('')}
            </ul>
            <p>Please review the application in the admin panel.</p>
          `,
        })
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(
      { success: true, applications },
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

