export const ProfilePage = () => {
  const { user } = useAppState();

  if (!user) return <p className="text-slate-600">Loading profile...</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="View your profile details." />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-brand-700 uppercase tracking-wide">Member</p>
        <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
        <p className="text-sm text-slate-600">Tier: {user.tier}</p>
      </div>
    </div>
  );
};

