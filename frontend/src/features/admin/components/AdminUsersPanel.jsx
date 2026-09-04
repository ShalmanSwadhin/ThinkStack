import Button from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

export default function AdminUsersPanel({ users, onUpdateUser, isSaving }) {
  if (!users?.length) {
    return <p className="text-sm text-slate-500">No users found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white dark:border-slate-700 dark:bg-slate-900">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/80">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">XP</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b last:border-b-0 dark:border-slate-800">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900 dark:text-white">{user.username}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </td>
              <td className="px-4 py-3 capitalize">{user.role}</td>
              <td className="px-4 py-3">{user.xp}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    user.isSuspended
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  )}
                >
                  {user.isSuspended ? 'Suspended' : 'Active'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={isSaving}
                    onClick={() =>
                      onUpdateUser(user.id, {
                        role: user.role === 'admin' ? 'student' : 'admin',
                      })
                    }
                  >
                    Make {user.role === 'admin' ? 'student' : 'admin'}
                  </Button>
                  <Button
                    size="sm"
                    variant={user.isSuspended ? 'primary' : 'secondary'}
                    disabled={isSaving}
                    onClick={() =>
                      onUpdateUser(user.id, { isSuspended: !user.isSuspended })
                    }
                  >
                    {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
