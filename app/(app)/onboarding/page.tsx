import OnboardingForm from '@/components/onboarding/OnboardingForm';

export default function OnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Set up your profile</h1>
      <p className="mt-1 text-gray-500">Help us personalise your experience. You can update this anytime.</p>
      <div className="mt-6">
        <OnboardingForm />
      </div>
    </div>
  );
}
