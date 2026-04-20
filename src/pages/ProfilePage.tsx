import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setError('');
    setIsLoading(true);
    try {
      await updateProfile(name.trim(), email.trim());
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteAccount();
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err.message);
      setShowDeleteConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'GT';

  return (
    <div className="space-y-5">
      <p className="section-label">Profile</p>

      {/* Avatar + info */}
      <div className="vault-card p-6 text-center">
        <div className="w-16 h-16 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="font-display text-gold text-2xl font-medium">{initials}</span>
        </div>
        {!isEditing && (
          <>
            <h2 className="font-display text-2xl font-medium text-warm">{user?.name}</h2>
            <p className="text-muted text-sm mt-1">{user?.email}</p>
          </>
        )}
      </div>

      {/* Edit form */}
      {isEditing ? (
        <div className="vault-card p-5 space-y-4">
          <p className="section-label">Edit Profile</p>

          <div>
            <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="vault-input"
            />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="vault-input"
            />
          </div>

          {error && (
            <div className="bg-crimson-bg border border-crimson/20 rounded-lg px-4 py-3 text-crimson-light text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setName(user?.name || '');
                setEmail(user?.email || '');
                setError('');
              }}
              className="btn-ghost flex-1 py-2.5 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="btn-gold flex-1 py-2.5 rounded-lg text-sm"
            >
              {isLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="vault-card w-full flex items-center justify-between px-5 py-4 hover:bg-gold/[0.03] transition-colors group"
        >
          <span className="text-sm text-warm">Edit Profile</span>
          <ChevronRight size={15} className="text-faint group-hover:text-muted transition-colors" />
        </button>
      )}

      {/* Account actions */}
      <div className="vault-card divide-y divide-gold/[0.06]">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gold/[0.03] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <LogOut size={15} className="text-muted" strokeWidth={1.75} />
            <span className="text-sm text-warm">Sign Out</span>
          </div>
          <ChevronRight size={15} className="text-faint group-hover:text-muted transition-colors" />
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-crimson/[0.04] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Trash2 size={15} className="text-crimson/60" strokeWidth={1.75} />
            <span className="text-sm text-crimson-light/80">Delete Account</span>
          </div>
          <ChevronRight size={15} className="text-faint group-hover:text-crimson/40 transition-colors" />
        </button>
      </div>

      {/* Sign out modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/75 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="vault-card w-full max-w-sm p-6 shadow-xl shadow-black/50">
            <h3 className="font-display text-xl font-medium text-warm mb-1">Sign Out?</h3>
            <p className="text-muted text-sm mb-6">You'll need to sign in again to access your portfolio.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="btn-ghost flex-1 py-2.5 rounded-lg text-sm">Cancel</button>
              <button onClick={handleLogout} className="btn-gold flex-1 py-2.5 rounded-lg text-sm">Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/75 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="vault-card w-full max-w-sm p-6 shadow-xl shadow-black/50">
            <h3 className="font-display text-xl font-medium text-warm mb-1">Delete Account?</h3>
            <p className="text-muted text-sm mb-1">All your data will be permanently erased.</p>
            <p className="text-crimson-light text-sm font-medium mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-ghost flex-1 py-2.5 rounded-lg text-sm">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-crimson-light bg-crimson-bg border border-crimson/20 hover:bg-crimson/15 transition-colors disabled:opacity-40"
              >
                {isLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
