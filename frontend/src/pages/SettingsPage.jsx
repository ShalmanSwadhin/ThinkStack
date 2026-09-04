import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useSettings } from '../features/settings/useSettings';

function FieldLabel({ children }) {
  return <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{children}</label>;
}

function TextInput({ value, onChange, type = 'text', placeholder, disabled }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="box-border w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-brand-500 focus:ring-2 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
    />
  );
}

export default function SettingsPage() {
  const {
    settings,
    isLoading,
    error,
    message,
    isSaving,
    passwordForm,
    deleteForm,
    setPasswordForm,
    setDeleteForm,
    savePreferences,
    saveProfile,
    submitPasswordChange,
    submitAccountDeletion,
  } = useSettings();

  const [profileDraft, setProfileDraft] = useState(null);

  useEffect(() => {
    if (settings?.profile) {
      setProfileDraft(settings.profile);
    }
  }, [settings?.profile]);

  if (isLoading) {
    return (
      <div className="page-container py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!settings || !profileDraft) {
    return (
      <div className="page-container py-8">
        <p className="text-sm text-red-600">{error || 'Unable to load settings'}</p>
      </div>
    );
  }

  const { preferences, account } = settings;

  return (
    <div className="page-container max-w-3xl py-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="page-heading">Settings</h1>
          <p className="page-subheading">
            Theme, editor preferences, profile, and account management.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            {message}
          </div>
        ) : null}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Theme is saved to your account and synced across devices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <FieldLabel>Theme</FieldLabel>
                <select
                  value={preferences.theme}
                  onChange={(event) => savePreferences({ theme: event.target.value })}
                  disabled={isSaving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Code editor</CardTitle>
              <CardDescription>Defaults for playground, problems, and contest editors.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Font size</FieldLabel>
                <select
                  value={preferences.editorFontSize}
                  onChange={(event) =>
                    savePreferences({ editorFontSize: Number(event.target.value) })
                  }
                  disabled={isSaving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {[10, 12, 14, 16, 18, 20, 22, 24].map((size) => (
                    <option key={size} value={size}>
                      {size}px
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Tab size</FieldLabel>
                <select
                  value={preferences.editorTabSize}
                  onChange={(event) =>
                    savePreferences({ editorTabSize: Number(event.target.value) })
                  }
                  disabled={isSaving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {[2, 4, 8].map((size) => (
                    <option key={size} value={size}>
                      {size} spaces
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Control email notification preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(event) =>
                    savePreferences({ emailNotifications: event.target.checked })
                  }
                  disabled={isSaving}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Email me about important account updates
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Public profile details shown on leaderboards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <FieldLabel>Display name</FieldLabel>
                <TextInput
                  value={profileDraft.displayName}
                  onChange={(event) =>
                    setProfileDraft((current) => ({ ...current, displayName: event.target.value }))
                  }
                />
              </div>
              <div>
                <FieldLabel>Bio</FieldLabel>
                <textarea
                  value={profileDraft.bio}
                  onChange={(event) =>
                    setProfileDraft((current) => ({ ...current, bio: event.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>GitHub</FieldLabel>
                  <TextInput
                    value={profileDraft.github}
                    onChange={(event) =>
                      setProfileDraft((current) => ({ ...current, github: event.target.value }))
                    }
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <FieldLabel>LinkedIn</FieldLabel>
                  <TextInput
                    value={profileDraft.linkedin}
                    onChange={(event) =>
                      setProfileDraft((current) => ({ ...current, linkedin: event.target.value }))
                    }
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
              <Button
                disabled={isSaving}
                onClick={() =>
                  saveProfile({
                    displayName: profileDraft.displayName,
                    bio: profileDraft.bio,
                    github: profileDraft.github,
                    linkedin: profileDraft.linkedin,
                  })
                }
              >
                Save profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Username and email are read-only in this version.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>
                <span className="font-medium text-slate-800 dark:text-slate-200">Username:</span>{' '}
                {account.username}
              </p>
              <p>
                <span className="font-medium text-slate-800 dark:text-slate-200">Email:</span>{' '}
                {account.email}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <FieldLabel>Current password</FieldLabel>
                <TextInput
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>New password</FieldLabel>
                  <TextInput
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        newPassword: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <FieldLabel>Confirm new password</FieldLabel>
                  <TextInput
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <Button disabled={isSaving} onClick={submitPasswordChange}>
                Update password
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-300">Delete account</CardTitle>
              <CardDescription>
                Permanently remove your profile, notes, and notifications. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <FieldLabel>Password</FieldLabel>
                <TextInput
                  type="password"
                  value={deleteForm.password}
                  onChange={(event) =>
                    setDeleteForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
              </div>
              <div>
                <FieldLabel>Type DELETE to confirm</FieldLabel>
                <TextInput
                  value={deleteForm.confirmation}
                  onChange={(event) =>
                    setDeleteForm((current) => ({ ...current, confirmation: event.target.value }))
                  }
                  placeholder="DELETE"
                />
              </div>
              <Button variant="danger" disabled={isSaving} onClick={submitAccountDeletion}>
                Delete my account
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
