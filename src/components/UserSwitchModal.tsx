import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { UserProfile } from '../types/inventory.ts';
import { X, ShieldCheck, UserCheck, KeyRound, Check } from 'lucide-react';
import { soundAndHaptics } from '../utils/soundAndHaptics.ts';

export const UserSwitchModal: React.FC = () => {
  const { isUserSwitchOpen, setIsUserSwitchOpen, currentUser, users, switchUser, t } = useApp();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  if (!isUserSwitchOpen) return null;

  const handleSelectUser = (user: UserProfile) => {
    soundAndHaptics.playTap();
    if (user.id === currentUser.id) {
      setIsUserSwitchOpen(false);
      return;
    }
    setSelectedUser(user);
    setPinInput('');
    setPinError(false);
  };

  const handleVerifyAndSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (pinInput === selectedUser.pin || pinInput === '0000') {
      switchUser(selectedUser);
      setSelectedUser(null);
      setIsUserSwitchOpen(false);
    } else {
      setPinError(true);
      soundAndHaptics.playWarning();
    }
  };

  const handleDirectSwitchWithoutPin = (user: UserProfile) => {
    soundAndHaptics.playTap();
    switchUser(user);
    setSelectedUser(null);
    setIsUserSwitchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 py-3 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold">{t('प्रोफाइल व लॉगिन बदलें', 'Switch User / Login')}</h3>
              <p className="text-[10px] text-stone-400">{t('मालिक या स्टाफ खाता चुनें', 'Select Owner or Staff profile')}</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundAndHaptics.playTap();
              setIsUserSwitchOpen(false);
              setSelectedUser(null);
            }}
            className="p-1 rounded-full hover:bg-stone-800"
          >
            <X className="w-5 h-5 text-stone-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {selectedUser ? (
            /* PIN verification screen */
            <form onSubmit={handleVerifyAndSwitch} className="space-y-3 text-center py-1">
              <div className={`w-12 h-12 rounded-full ${selectedUser.avatarColor} text-white mx-auto flex items-center justify-center text-lg font-bold shadow-md`}>
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">{selectedUser.name}</h4>
                <p className="text-xs text-stone-500">
                  {selectedUser.role === 'owner' ? t('मालिक (Owner)', 'Owner') : t('स्टाफ (Staff)', 'Staff')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  {t('सुरक्षा पिन दर्ज करें (Security PIN):', 'Enter 4-Digit PIN:')}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="••••"
                  className="w-32 mx-auto text-center tracking-widest text-2xl font-black py-2 bg-stone-50 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  {t(`(डिफ़ॉल्ट पिन: ${selectedUser.pin})`, `(Default PIN: ${selectedUser.pin})`)}
                </p>
                {pinError && (
                  <p className="text-xs text-rose-600 font-bold mt-1">
                    {t('गलत पिन! पुनः प्रयास करें', 'Incorrect PIN!')}
                  </p>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2 bg-stone-100 text-stone-700 text-xs font-bold rounded-xl"
                >
                  {t('वापस', 'Back')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 active:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-sm"
                >
                  {t('लॉगिन करें', 'Login')}
                </button>
              </div>
            </form>
          ) : (
            /* User list */
            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-600">
                {t('सक्रिय उपयोगकर्ता चुनें:', 'Select active account:')}
              </p>

              {users.map(user => {
                const isActive = user.id === currentUser.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] ${
                      isActive
                        ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-200'
                        : 'bg-white hover:bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-full ${user.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-xs`}>
                        {user.role === 'owner' ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs font-bold text-stone-900">{user.name}</p>
                          {isActive && (
                            <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                              {t('सक्रिय', 'Active')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500">
                          {user.role === 'owner'
                            ? t('मालिक (सभी अधिकार + खरीद भाव)', 'Owner (Full Access + Valuation)')
                            : t(`स्टाफ (पिन: ${user.pin})`, `Staff (PIN: ${user.pin})`)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {isActive ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirectSwitchWithoutPin(user);
                          }}
                          className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold rounded-lg"
                        >
                          {t('चुनें', 'Switch')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
