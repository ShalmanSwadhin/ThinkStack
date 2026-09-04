import { useCallback, useEffect, useState } from 'react';
import adminApi from '../adminService';
import integrationsApi from '../../integrations/integrationsService';
import Button from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

function IntegrationStatusBadge({ configured }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        configured
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
      )}
    >
      {configured ? 'Configured' : 'Coming Soon'}
    </span>
  );
}

export default function AdminSettingsPanel({ isSaving, runMutation }) {
  const [settings, setSettings] = useState(null);
  const [integrations, setIntegrations] = useState(null);

  const load = useCallback(async () => {
    const [settingsData, integrationData] = await Promise.all([
      adminApi.getPlatformSettings(),
      integrationsApi.getStatus(),
    ]);
    setSettings(settingsData);
    setIntegrations(integrationData);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!settings) return <div className="skeleton h-64 rounded-2xl" />;

  return (
    <div className="space-y-6">
      <section className="card-base">
        <h3 className="mb-4 font-semibold">Integration Status</h3>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Status reflects environment variables on the server. Add API keys and restart to enable
          services automatically.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-medium text-slate-900 dark:text-white">Gemini</p>
              <IntegrationStatusBadge configured={integrations?.gemini?.configured} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powers AI Tutor and chat features via <code className="font-mono">GEMINI_API_KEY</code>
              .
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-medium text-slate-900 dark:text-white">Judge0</p>
              <IntegrationStatusBadge configured={integrations?.judge0?.configured} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powers online code execution via <code className="font-mono">JUDGE0_API_KEY</code>.
            </p>
          </div>
        </div>
      </section>

      <section className="card-base">
        <h3 className="mb-4 font-semibold">XP Rules</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(settings.xpRules ?? {}).map(([key, value]) => (
            <label key={key} className="block text-sm">
              <span className="text-slate-500">{key}</span>
              <input
                type="number"
                value={value}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    xpRules: { ...settings.xpRules, [key]: Number(e.target.value) },
                  })
                }
                className="input-field mt-1"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="card-base">
        <h3 className="mb-4 font-semibold">Leaderboard Settings</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={settings.leaderboardSettings?.defaultPeriod ?? 'all-time'}
            onChange={(e) =>
              setSettings({
                ...settings,
                leaderboardSettings: {
                  ...settings.leaderboardSettings,
                  defaultPeriod: e.target.value,
                },
              })
            }
            className="input-field"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all-time">All time</option>
          </select>
          <input
            type="number"
            placeholder="Min XP to appear"
            value={settings.leaderboardSettings?.minXpToAppear ?? 0}
            onChange={(e) =>
              setSettings({
                ...settings,
                leaderboardSettings: {
                  ...settings.leaderboardSettings,
                  minXpToAppear: Number(e.target.value),
                },
              })
            }
            className="input-field"
          />
        </div>
      </section>

      <Button
        size="sm"
        disabled={isSaving}
        onClick={() =>
          runMutation(async () => {
            await adminApi.updatePlatformSettings(settings);
            await load();
          })
        }
      >
        Save settings
      </Button>
    </div>
  );
}
