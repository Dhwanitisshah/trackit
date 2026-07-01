import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/ui/Sidebar';
import MobileNav from '@/components/ui/MobileNav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar userEmail={user.email} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
