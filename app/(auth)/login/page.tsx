import { Suspense } from 'react';
import { Target } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import DeletedBanner from './DeletedBanner';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <Suspense>
          <DeletedBanner />
        </Suspense>
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Target className="h-7 w-7 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">TrackIt</span>
          </div>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
