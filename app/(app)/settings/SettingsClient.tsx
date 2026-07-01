'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

export default function SettingsClient() {
  const router = useRouter();

  // Public profile state
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSaved, setUsernameSaved] = useState(false);
  const [bioSaved, setBioSaved] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Reset profile state
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('username, bio, is_public')
        .eq('id', user.id)
        .single();
      if (data) {
        setUsername(data.username ?? '');
        setBio(data.bio ?? '');
        setIsPublic(data.is_public ?? false);
      }
      setProfileLoaded(true);
    }
    loadProfile();
  }, []);

  function validateUsername(value: string) {
    if (!value) return '';
    if (!/^[a-z0-9-]+$/.test(value)) return 'Only lowercase letters, numbers, and hyphens';
    if (value.length > 30) return 'Max 30 characters';
    return '';
  }

  async function saveUsername() {
    const err = validateUsername(username);
    if (err) { setUsernameError(err); return; }
    setUsernameError('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ username: username.toLowerCase() })
      .eq('id', user.id);
    if (error?.message?.includes('unique')) {
      setUsernameError('Username already taken');
    } else {
      setUsernameSaved(true);
      setTimeout(() => setUsernameSaved(false), 2000);
    }
  }

  async function saveBio() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ bio }).eq('id', user.id);
    setBioSaved(true);
    setTimeout(() => setBioSaved(false), 2000);
  }

  async function togglePublic(value: boolean) {
    setIsPublic(value);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ is_public: value }).eq('id', user.id);
  }

  async function handleResetProfile() {
    setResetting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({
      full_name: null, college: null, year: null,
      discipline: null, location: null,
      github_url: null, linkedin_url: null, portfolio_url: null,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    await supabase.from('profile_skills').delete().eq('profile_id', user.id);
    setResetting(false);
    router.push('/onboarding');
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/settings/delete-account', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/login?deleted=true');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleting(false);
    }
  }

  if (!profileLoaded) return null;

  return (
    <>
      {/* Section 0 — Public profile */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Public profile</h2>
        <p className="mt-1 text-sm text-gray-500">Share your skills and projects publicly.</p>

        <div className="mt-4 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Your public profile username
            </label>
            <div className="flex gap-2">
              <input
                value={username}
                onChange={e => {
                  setUsername(e.target.value.toLowerCase());
                  setUsernameError(validateUsername(e.target.value));
                }}
                placeholder="e.g. dhwanit"
                maxLength={30}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
              <Button variant="secondary" size="md" onClick={saveUsername}>
                {usernameSaved ? 'Saved!' : 'Save'}
              </Button>
            </div>
            {usernameError && <p className="mt-1 text-xs text-red-600">{usernameError}</p>}
            {username && !usernameError && (
              <p className="mt-1 text-xs text-gray-400">
                Preview: <span className="text-indigo-600">/u/{username}</span>
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Short bio <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value.slice(0, 160))}
              rows={3}
              placeholder="A quick intro about yourself..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">{bio.length}/160</span>
              <button onClick={saveBio} className="text-xs text-indigo-600 hover:text-indigo-800">
                {bioSaved ? 'Saved!' : 'Save bio'}
              </button>
            </div>
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Make profile public</p>
              {isPublic && username && (
                <p className="text-xs text-green-600 mt-0.5">
                  Share: /u/{username}
                </p>
              )}
            </div>
            <button
              role="switch"
              aria-checked={isPublic}
              onClick={() => togglePublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                isPublic ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Section 1 — Profile reset */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Profile</h2>
        <p className="mt-1 text-sm text-gray-500">
          Reset your profile info and skills. Your applications will not be affected.
        </p>
        <Button variant="secondary" size="md" className="mt-4" onClick={() => setShowResetDialog(true)}>
          Reset profile
        </Button>
      </section>

      {/* Section 2 — Delete account */}
      <section className="rounded-xl border border-red-200 bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-base font-semibold text-red-700">Account</h2>
        <p className="mt-1 text-sm text-gray-500">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
        >
          Delete account
        </button>
      </section>

      {showResetDialog && (
        <Dialog onClose={() => setShowResetDialog(false)}>
          <h3 className="text-base font-semibold text-gray-900">Reset profile?</h3>
          <p className="mt-2 text-sm text-gray-600">
            This will clear your profile info and skills. Your applications will not be affected. Continue?
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowResetDialog(false)}>Cancel</Button>
            <Button variant="primary" disabled={resetting} onClick={handleResetProfile}>
              {resetting ? 'Resetting...' : 'Yes, reset'}
            </Button>
          </div>
        </Dialog>
      )}

      {showDeleteDialog && (
        <Dialog onClose={() => { setShowDeleteDialog(false); setDeleteConfirmText(''); setDeleteError(''); }}>
          <h3 className="text-base font-semibold text-red-700">Delete account?</h3>
          <p className="mt-2 text-sm text-gray-600">
            This will permanently delete your account and ALL your data including applications, resume, and emails.
            <strong className="block mt-1 text-gray-800">This cannot be undone.</strong>
          </p>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </label>
            <input
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText(''); }}>Cancel</Button>
            <button
              disabled={deleteConfirmText !== 'DELETE' || deleting}
              onClick={handleDeleteAccount}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {deleting ? 'Deleting...' : 'Delete my account'}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}

function Dialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}
