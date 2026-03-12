'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineBell, HiOutlineCheck, HiOutlineLockClosed, HiOutlineLogout, HiOutlineShieldCheck, HiOutlineUser } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';

const STORAGE_KEY = 'clubplatform-notification-prefs';

export default function SettingsPage() {
  const { user, loading, loggingOut, logout, updateProfile, sendPasswordReset } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin' || user?.role === 'club_admin';

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    department: '',
    year: '',
  });
  const [notifications, setNotifications] = useState({
    event_updates: true,
    announcements: true,
    reminders: false,
  });
  const [profileState, setProfileState] = useState({ saving: false, message: '', error: '' });
  const [securityState, setSecurityState] = useState({ sending: false, message: '', error: '' });
  const [notificationState, setNotificationState] = useState({ saving: false, message: '', error: '' });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      full_name: user.user_metadata?.full_name || user.full_name || user.name || '',
      phone: user.phone || '',
      department: user.department || '',
      year: user.year || '',
    });
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse notification preferences:', error);
      }
    }
  }, []);

  const isBusy = profileState.saving || securityState.sending || notificationState.saving || loggingOut;

  if (loading || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  const handleProfileSave = async () => {
    if (isBusy) return;

    setSecurityState((current) => ({ ...current, message: '', error: '' }));
    setNotificationState((current) => ({ ...current, message: '', error: '' }));
    setProfileState({ saving: true, message: '', error: '' });
    const result = await updateProfile(profileForm);

    if (result.success) {
      setProfileState({ saving: false, message: 'Profile updated successfully.', error: '' });
    } else {
      setProfileState({ saving: false, message: '', error: result.error });
    }
  };

  const handleNotificationSave = () => {
    if (isBusy) return;

    setProfileState((current) => ({ ...current, message: '', error: '' }));
    setSecurityState((current) => ({ ...current, message: '', error: '' }));
    setNotificationState({ saving: true, message: '', error: '' });

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }

    setNotificationState({
      saving: false,
      message: 'Notification preferences saved on this device.',
      error: '',
    });
  };

  const handlePasswordReset = async () => {
    if (isBusy) return;

    setProfileState((current) => ({ ...current, message: '', error: '' }));
    setNotificationState((current) => ({ ...current, message: '', error: '' }));
    setSecurityState({ sending: true, message: '', error: '' });
    const result = await sendPasswordReset();

    if (result.success) {
      setSecurityState({
        sending: false,
        message: 'Password reset instructions were sent to your email.',
        error: '',
      });
    } else {
      setSecurityState({
        sending: false,
        message: '',
        error: result.error,
      });
    }
  };

  const handleTabChange = (tabId) => {
    if (isBusy) return;

    setActiveTab(tabId);
  };

  const displayName = user.user_metadata?.full_name || user.full_name || user.name || user.email?.split('@')[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="surface-panel h-fit">
        <div className="border-b border-border px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Account Settings</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground">Profile & Preferences</h1>
        </div>

        <div className="space-y-1 p-4">
          <SidebarTab id="profile" label="Profile" icon={<HiOutlineUser className="h-5 w-5" />} active={activeTab === 'profile'} onClick={handleTabChange} disabled={isBusy} />
          <SidebarTab id="security" label="Security" icon={<HiOutlineShieldCheck className="h-5 w-5" />} active={activeTab === 'security'} onClick={handleTabChange} disabled={isBusy} />
          <SidebarTab id="notifications" label="Notifications" icon={<HiOutlineBell className="h-5 w-5" />} active={activeTab === 'notifications'} onClick={handleTabChange} disabled={isBusy} />
        </div>
      </aside>

      <section className="surface-panel p-6 sm:p-8">
        {isBusy && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-secondary">
            Processing your request. Other controls are temporarily disabled.
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 text-2xl font-black text-white">
                {displayName?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">{displayName}</h2>
                <p className="mt-1 text-sm text-secondary">{user.email}</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {isAdmin ? 'System Admin' : 'Member Account'}
                </p>
              </div>
            </div>

            {profileState.error && <div className="status-error">{profileState.error}</div>}
            {profileState.message && <div className="status-success">{profileState.message}</div>}

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Display Name">
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  disabled={isBusy}
                  className="input-field"
                />
              </Field>
              <Field label="Email Address">
                <input type="text" value={user.email} disabled className="input-field cursor-not-allowed bg-slate-50 text-slate-400" />
              </Field>
              <Field label="Phone Number">
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  disabled={isBusy}
                  className="input-field"
                  placeholder="9876543210"
                />
              </Field>
              {isAdmin ? (
                <>
                  <Field label="Workspace Role">
                    <input
                      type="text"
                      value="System Administrator"
                      disabled
                      className="input-field cursor-not-allowed bg-slate-50 text-slate-400"
                    />
                  </Field>
                  <div className="surface-panel-muted p-5 md:col-span-2">
                    <p className="text-sm font-bold text-foreground">Admin Profile</p>
                    <p className="mt-2 text-sm leading-6 text-secondary">
                      Admin settings focus on identity and access recovery. Academic profile fields are hidden here so
                      administrator accounts stay separate from student registration records.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Field label="Department">
                    <input
                      type="text"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      disabled={isBusy}
                      className="input-field"
                      placeholder="Computer Science"
                    />
                  </Field>
                  <Field label="Academic Year">
                    <input
                      type="text"
                      value={profileForm.year}
                      onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value })}
                      disabled={isBusy}
                      className="input-field"
                      placeholder="3rd Year"
                    />
                  </Field>
                </>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={async () => {
                  if (isBusy) {
                    return;
                  }
                  if (!window.confirm('Are you sure you want to sign out?')) {
                    return;
                  }
                  await logout();
                }}
                disabled={isBusy}
                className="inline-flex items-center gap-2 text-sm font-bold text-red-600 disabled:opacity-60"
              >
                <HiOutlineLogout className="h-5 w-5" />
                {loggingOut ? 'Signing Out...' : 'Sign Out'}
              </button>
              <button type="button" onClick={handleProfileSave} disabled={isBusy} className="btn-professional disabled:cursor-not-allowed disabled:opacity-60">
                <HiOutlineCheck className="h-5 w-5" />
                {profileState.saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground">Security Controls</h2>
              <p className="mt-2 text-sm leading-6 text-secondary">Use email-based recovery and review your current role assignment.</p>
            </div>

            {securityState.error && <div className="status-error">{securityState.error}</div>}
            {securityState.message && <div className="status-success">{securityState.message}</div>}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="surface-panel-muted p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3">
                    <HiOutlineLockClosed className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Password Reset</p>
                    <p className="text-sm text-secondary">Send a recovery link to {user.email}.</p>
                  </div>
                </div>
                <button type="button" onClick={handlePasswordReset} disabled={isBusy} className="btn-outline mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60">
                  {securityState.sending ? 'Sending...' : 'Email Reset Link'}
                </button>
              </div>

              <div className="surface-panel-muted p-5">
                <p className="text-sm font-bold text-foreground">Role & Access</p>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  Current access level: <span className="font-bold text-foreground">{user.role}</span>
                </p>
                <p className="mt-4 text-sm leading-6 text-secondary">
                  Admin access is controlled by approved account emails and profile role data.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground">Notification Preferences</h2>
              <p className="mt-2 text-sm leading-6 text-secondary">Choose which platform updates matter most for this device.</p>
            </div>

            {notificationState.error && <div className="status-error">{notificationState.error}</div>}
            {notificationState.message && <div className="status-success">{notificationState.message}</div>}

            <div className="space-y-4">
              <ToggleRow
                title="Event updates"
                description="New event launches, schedule changes, and registration status changes."
                checked={notifications.event_updates}
                disabled={isBusy}
                onChange={() => setNotifications((current) => ({ ...current, event_updates: !current.event_updates }))}
              />
              <ToggleRow
                title="Announcements"
                description="Official notices published by club leaders and admins."
                checked={notifications.announcements}
                disabled={isBusy}
                onChange={() => setNotifications((current) => ({ ...current, announcements: !current.announcements }))}
              />
              <ToggleRow
                title="Reminder prompts"
                description="Optional nudges for upcoming deadlines and attendance activity."
                checked={notifications.reminders}
                disabled={isBusy}
                onChange={() => setNotifications((current) => ({ ...current, reminders: !current.reminders }))}
              />
            </div>

            <div className="border-t border-border pt-6">
              <button type="button" onClick={handleNotificationSave} disabled={isBusy} className="btn-professional disabled:cursor-not-allowed disabled:opacity-60">
                {notificationState.saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function SidebarTab({ id, label, icon, active, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
        active ? 'bg-slate-900 text-white shadow-sm' : 'text-secondary hover:bg-slate-50 hover:text-foreground'
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange, disabled = false }) {
  return (
    <div className="surface-panel-muted flex items-start justify-between gap-4 p-5">
      <div>
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-6 text-secondary">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all ${
          checked ? 'bg-slate-900' : 'bg-slate-300'
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
