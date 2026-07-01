import PersonaForm from '@/components/profile/PersonaForm';

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
      <p className="mt-1 text-gray-500">Manage your personal information and skills.</p>
      <div className="mt-6">
        <PersonaForm />
      </div>
    </div>
  );
}
