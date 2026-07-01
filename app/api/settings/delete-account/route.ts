import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error: rpcError } = await supabase.rpc('delete_user_account');
    if (rpcError) throw rpcError;

    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete account';
    console.error('Delete account error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
