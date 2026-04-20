import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Edit3, LogOut, Trash2, Save, X } from 'lucide-react';
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
    <div className="sm:pl-52 space-y-4">
      <h1 className="text-xl font-bold text-white">Profile</h1>

      {/* Avatar */}
      <div className="glass rounded-2xl p-6 text-center">
        <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-gold/30">
          <span className="text-black font-bold text-2xl">{initials}</span>
        </div>
        {!isEditing && (
          <>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
          </>
        )}
      </div>

      {/* Edit Form */}
      {isEditing ? (
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-white">Edit Profile</h3>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-surface-light border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface-light border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { setIsEditing(false); setName(user?.name || ''); setEmail(user?.email || ''); setError(''); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface-light rounded-xl text-gray-300 hover:text-white transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 gold-gradient text-black font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Save size={16} />
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl p-4">
          <button
            onClick={() => setIsEditing(true)}
            className="w-full flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
          >
            <div className="w-9 h-9 bg-surface-light rounded-xl flex items-center justify-center">
              <Edit3 size={16} className="text-gold" />
            </div>
            <span>Edit Profile</span>
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="glass rounded-xl divide-y divide-white/5">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center gap-3 p-4 text-gray-300 hover:text-white transition-colors"
        >
          <div className="w-9 h-9 bg-surface-light rounded-xl flex items-center justify-center">
            <LogOut size={16} className="text-gold" />
          </div>
          <span>Logout</span>
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center gap-3 p-4 text-red-400 hover:text-red-300 transition-colors"
        >
          <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center">
            <Trash2 size={16} />
          </div>
          <span>Delete Account</span>
        </button>
      </div>

      {/* Logout confirm */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">Logout?</h3>
            <p className="text-gray-400 text-sm mb-6">You'll need to login again to access your data.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2.5 bg-surface-light rounded-xl text-gray-300">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-2.5 gold-gradient text-black font-semibold rounded-xl">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">Delete Account?</h3>
            <p className="text-gray-400 text-sm mb-1">This is a permanent action. All your data will be deleted.</p>
            <p className="text-red-400 text-sm mb-6 font-medium">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 bg-surface-light rounded-xl text-gray-300">Cancel</button>
              <button onClick={handleDelete} disabled={isLoading} className="flex-1 py-2.5 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 disabled:opacity-50">
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
