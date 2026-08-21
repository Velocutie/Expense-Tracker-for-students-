'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { User, Mail, LogOut, Trash2, Shield, Smartphone, Sun, Moon, Monitor, Pencil, Key, Download, Wallet, Check, X, ImagePlus, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/lib/theme';

export default function ProfilePage() {
  const { user, signOut, updateName, updateEmail, updatePassword, updateAvatar } = useAuth();
  const store = useStore();
  const router = useRouter();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { theme, setTheme } = useTheme();

  // Edit name state
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || '');
  const [nameMsg, setNameMsg] = useState('');

  // Edit email state
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState(user?.email || '');
  const [emailMsg, setEmailMsg] = useState('');

  // Change password state
  const [editingPassword, setEditingPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Monthly allowance state
  const [editingAllowance, setEditingAllowance] = useState(false);
  const [allowanceValue, setAllowanceValue] = useState(store.settings.monthlyAllowance.toString());
  const [allowanceMsg, setAllowanceMsg] = useState('');

  // Export state
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState('');

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarMsg('Please choose an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAvatarMsg('Please choose an image under 8 MB.');
      return;
    }

    setAvatarLoading(true);
    setAvatarMsg('');
    try {
      const avatarUrl = await compressAvatar(file);
      const result = await updateAvatar(avatarUrl);
      if (result.error) setAvatarMsg(result.error);
      else setAvatarMsg('Profile image updated');
    } catch {
      setAvatarMsg('Could not process that image. Please try another one.');
    } finally {
      setAvatarLoading(false);
      setTimeout(() => setAvatarMsg(''), 3000);
    }
  };

  function compressAvatar(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Unable to read image'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('Unable to decode image'));
        image.onload = () => {
          const size = 320;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext('2d');
          if (!context) return reject(new Error('Canvas unavailable'));
          const scale = Math.max(size / image.width, size / image.height);
          const width = image.width * scale;
          const height = image.height * scale;
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = 'high';
          context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
          resolve(canvas.toDataURL('image/webp', 0.82));
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  const handleClearData = () => {
    localStorage.removeItem('expensewise-data');
    localStorage.removeItem('expense-tracker-data');
    window.location.reload();
  };

  // ---- Edit Name ----
  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    const result = await updateName(nameValue.trim());
    if (result.error) { setNameMsg(result.error); return; }
    setNameMsg('Saved!');
    setEditingName(false);
    setTimeout(() => setNameMsg(''), 2000);
  };

  // ---- Edit Email ----
  const handleSaveEmail = async () => {
    if (!emailValue.trim() || !emailValue.includes('@')) return;
    const result = await updateEmail(emailValue.trim());
    if (result.error) { setEmailMsg(result.error); return; }
    setEmailMsg('Confirmation link sent to new email');
    setEditingEmail(false);
    setTimeout(() => setEmailMsg(''), 3000);
  };

  // ---- Change Password ----
  const handleSavePassword = async () => {
    if (passwordValue.length < 6) { setPasswordMsg('Must be at least 6 characters'); return; }
    const result = await updatePassword(passwordValue);
    if (result.error) { setPasswordMsg(result.error); return; }
    setPasswordMsg('Password updated!');
    setEditingPassword(false);
    setPasswordValue('');
    setTimeout(() => setPasswordMsg(''), 2000);
  };

  // ---- Monthly Allowance ----
  const handleSaveAllowance = () => {
    const amt = parseFloat(allowanceValue);
    if (!amt || amt <= 0) return;
    store.updateSettings({ monthlyAllowance: amt });
    setAllowanceMsg('Saved!');
    setEditingAllowance(false);
    setTimeout(() => setAllowanceMsg(''), 2000);
  };

  // ---- Export Data ----
  const handleExport = () => {
    if (exportFormat === 'json') {
      const data = {
        exportDate: new Date().toISOString(),
        expenses: store.expenses,
        moneyReceived: store.moneyReceived,
        budgets: store.budgets,
        savedMoneyEntries: store.savedMoneyEntries,
        savingsGoals: store.savingsGoals,
        recurringExpenses: store.recurringExpenses,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `expensewise-export-${new Date().toISOString().slice(0, 10)}.json`);
    } else {
      const rows = [
        ['Type', 'Date', 'Amount', 'Category/Source', 'Description/Note', 'Frequency'],
        ...store.expenses.map(e => ['Expense', e.date, e.amount.toString(), e.category, e.description, '']),
        ...store.moneyReceived.map(m => ['Money Received', m.date, m.amount.toString(), m.source, m.note, '']),
        ...store.savedMoneyEntries.map(s => [`Saved (${s.type})`, s.date, (s.type === 'add' ? s.amount : -s.amount).toString(), '', s.note, '']),
        ...store.recurringExpenses.map(r => ['Recurring', '', r.amount.toString(), r.category, r.name, r.frequency]),
      ];
      const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadBlob(blob, `expensewise-export-${new Date().toISOString().slice(0, 10)}.csv`);
    }
  };

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalExpenses = store.expenses.length;
  const totalReceived = store.moneyReceived.length;
  const totalBudgets = store.budgets.length;
  const totalGoals = store.savingsGoals.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-[1.35rem] overflow-hidden bg-gradient-to-br from-purple-200 via-fuchsia-100 to-blue-100 dark:from-purple-900/70 dark:via-fuchsia-900/40 dark:to-blue-900/40 flex items-center justify-center ring-4 ring-purple-100/70 dark:ring-purple-400/10 shadow-[0_12px_24px_-14px_rgba(124,58,237,0.8)]">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={`${user.name || 'User'} profile`} className="h-full w-full object-cover" />
              ) : (
                <User size={30} className="text-purple-600 dark:text-purple-300" />
              )}
            </div>
            <label htmlFor="profile-image" className="absolute -right-2 -bottom-2 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-2 border-white bg-purple-600 text-white shadow-lg shadow-purple-600/30 transition-all hover:-translate-y-0.5 hover:bg-purple-700 active:scale-90 dark:border-[#171126]" title="Add profile image">
              {avatarLoading ? <LoaderCircle size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              <span className="sr-only">Add profile image</span>
            </label>
            <input id="profile-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} className="sr-only" disabled={avatarLoading} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</h2>
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm truncate">
              <Mail size={14} className="shrink-0" />
              <span className="truncate">{user?.email || 'No email'}</span>
            </div>
            <p className="mt-2 text-xs text-purple-700/75 dark:text-purple-200/70">Add an image to make your finance space feel like yours.</p>
            {avatarMsg && <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">{avatarMsg}</p>}
          </div>
        </div>
      </div>

      {/* Edit Name */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <User size={18} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Display Name</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.name || 'User'}</p>
            </div>
          </div>
          {!editingName ? (
            <button onClick={() => { setEditingName(true); setNameValue(user?.name || ''); }} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-all active:scale-90"><Pencil size={14} /></button>
          ) : (
            <div className="flex items-center gap-2">
              <input type="text" value={nameValue} onChange={e => setNameValue(e.target.value)} className="w-40 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" autoFocus onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }} />
              <button onClick={handleSaveName} className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all active:scale-90"><Check size={14} /></button>
              <button onClick={() => setEditingName(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-90"><X size={14} /></button>
            </div>
          )}
        </div>
        {nameMsg && <p className="px-6 pb-3 text-xs text-green-600 dark:text-green-400">{nameMsg}</p>}
      </div>

      {/* Edit Email */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'No email'}</p>
            </div>
          </div>
          {!editingEmail ? (
            <button onClick={() => { setEditingEmail(true); setEmailValue(user?.email || ''); }} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-all active:scale-90"><Pencil size={14} /></button>
          ) : (
            <div className="flex items-center gap-2">
              <input type="email" value={emailValue} onChange={e => setEmailValue(e.target.value)} className="w-48 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" autoFocus onKeyDown={e => { if (e.key === 'Enter') handleSaveEmail(); if (e.key === 'Escape') setEditingEmail(false); }} />
              <button onClick={handleSaveEmail} className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all active:scale-90"><Check size={14} /></button>
              <button onClick={() => setEditingEmail(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-90"><X size={14} /></button>
            </div>
          )}
        </div>
        {emailMsg && <p className="px-6 pb-3 text-xs text-green-600 dark:text-green-400">{emailMsg}</p>}
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Key size={18} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Password</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update your password</p>
            </div>
          </div>
          {!editingPassword ? (
            <button onClick={() => { setEditingPassword(true); setPasswordValue(''); }} className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all active:scale-95">Change</button>
          ) : (
            <div className="flex items-center gap-2">
              <input type="password" value={passwordValue} onChange={e => setPasswordValue(e.target.value)} placeholder="New password" className="w-40 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" autoFocus onKeyDown={e => { if (e.key === 'Enter') handleSavePassword(); if (e.key === 'Escape') setEditingPassword(false); }} />
              <button onClick={handleSavePassword} className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all active:scale-90"><Check size={14} /></button>
              <button onClick={() => setEditingPassword(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-90"><X size={14} /></button>
            </div>
          )}
        </div>
        {passwordMsg && <p className="px-6 pb-3 text-xs text-green-600 dark:text-green-400">{passwordMsg}</p>}
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Your Activity</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalExpenses}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Expenses tracked</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalReceived}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Money entries</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalBudgets}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Budgets set</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalGoals}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Savings goals</p>
          </div>
        </div>
      </div>

      {/* Monthly Allowance */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Wallet size={18} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Monthly Allowance</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Used for budget reference</p>
            </div>
          </div>
          {!editingAllowance ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{'\u20B9'}{store.settings.monthlyAllowance.toLocaleString('en-IN')}</span>
              <button onClick={() => { setEditingAllowance(true); setAllowanceValue(store.settings.monthlyAllowance.toString()); }} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-all active:scale-90"><Pencil size={14} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input type="number" step="100" min="1" value={allowanceValue} onChange={e => setAllowanceValue(e.target.value)} className="w-28 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" autoFocus onKeyDown={e => { if (e.key === 'Enter') handleSaveAllowance(); if (e.key === 'Escape') setEditingAllowance(false); }} />
              <button onClick={handleSaveAllowance} className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all active:scale-90"><Check size={14} /></button>
              <button onClick={() => setEditingAllowance(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-90"><X size={14} /></button>
            </div>
          )}
        </div>
        {allowanceMsg && <p className="px-6 pb-3 text-xs text-green-600 dark:text-green-400">{allowanceMsg}</p>}
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'light' as const, icon: Sun, label: 'Light' },
            { value: 'dark' as const, icon: Moon, label: 'Dark' },
            { value: 'system' as const, icon: Monitor, label: 'System' },
          ].map(opt => {
            const Icon = opt.icon;
            return (
              <button key={opt.value} onClick={() => setTheme(opt.value)} className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-medium transition-all active:scale-95 ${theme === opt.value ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                <Icon size={18} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Data */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Download size={18} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Export Data</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Download your data as a file</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
              <button onClick={() => setExportFormat('csv')} className={`px-4 py-2 text-xs font-medium transition-all active:scale-95 ${exportFormat === 'csv' ? 'bg-indigo-500 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>CSV</button>
              <button onClick={() => setExportFormat('json')} className={`px-4 py-2 text-xs font-medium transition-all active:scale-95 ${exportFormat === 'json' ? 'bg-indigo-500 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>JSON</button>
            </div>
            <button onClick={handleExport} className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-sm shadow-indigo-600/20">
              Download {exportFormat.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white px-6 pt-6 pb-2">Settings</h3>
        
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          <div className="flex items-center gap-3 px-6 py-4">
            <Smartphone size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Local Backup</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Data also saved to browser localStorage</p>
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-lg">Active</span>
          </div>

          <div className="flex items-center gap-3 px-6 py-4">
            <Shield size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Cloud Sync</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Data synced across devices with Supabase</p>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg">Active</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-500/20 shadow-sm overflow-hidden">
        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 px-6 pt-6 pb-2">Danger Zone</h3>
        
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {!showClearConfirm ? (
            <button onClick={() => setShowClearConfirm(true)} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all text-left active:scale-[0.99]">
              <Trash2 size={18} className="text-red-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Clear All Data</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Delete all expenses, budgets, and goals</p>
              </div>
            </button>
          ) : (
            <div className="px-6 py-4 bg-red-50 dark:bg-red-500/5">
              <p className="text-sm text-red-700 dark:text-red-400 mb-3">Are you sure? This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 active:scale-95 transition-all">Cancel</button>
                <button onClick={handleClearData} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 active:scale-95 transition-all">Yes, clear everything</button>
              </div>
            </div>
          )}

          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-100/80 dark:hover:bg-white/[0.03] transition-colors text-left active:scale-[0.99]">
            <LogOut size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Sign Out</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>

      {/* Version */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400 dark:text-gray-500">ExpenseWise v1.0.1</p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Made for college students 💜</p>
      </div>
    </div>
  );
}
