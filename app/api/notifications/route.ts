import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check for upcoming deadlines and create notifications if needed
    const today = new Date();
    const threeDaysOut = new Date(today);
    threeDaysOut.setDate(today.getDate() + 3);

    const { data: upcoming } = await supabase
      .from('applications')
      .select('id, company, role, deadline')
      .eq('user_id', user.id)
      .not('status', 'in', '("Offer","Rejected")')
      .gte('deadline', today.toISOString().split('T')[0])
      .lte('deadline', threeDaysOut.toISOString().split('T')[0]);

    if (upcoming?.length) {
      for (const app of upcoming) {
        const deadlineDate = new Date(app.deadline);
        const daysUntil = Math.ceil(
          (deadlineDate.getTime() - today.getTime()) / 86400000
        );

        // Check for existing notification for this application deadline
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'deadline')
          .eq('link', `/tracker/${app.id}`)
          .limit(1)
          .single();

        if (!existing) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            message: `Deadline in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}: ${app.company} — ${app.role}`,
            type: 'deadline',
            read: false,
            link: `/tracker/${app.id}`,
          });
        }
      }
    }

    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false });

    return NextResponse.json({ notifications: notifications ?? [] });
  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json({ notifications: [] });
  }
}
