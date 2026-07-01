import SettingsClient from './SettingsClient';

export default function SettingsPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <div className="mt-8 space-y-8">
        <SettingsClient />
      </div>
    </div>
  );
}
