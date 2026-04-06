import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'
import clubs from '@/data/clubs.json'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Support both single clubId and array clubIds
    const clubIds = body.clubIds || (body.clubId ? [body.clubId] : [])

    if (!clubIds.length) {
      return NextResponse.json(
        { error: 'Missing clubIds' },
        { status: 400 }
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

