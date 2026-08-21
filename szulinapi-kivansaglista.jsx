const { useState, useEffect, useCallback } = React;

function usernameToEmail(username) {
  return `${username}@bdayapp.local`;
}

function sanitizeUsername(u) {
  return u.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

function isSafeUrl(u) {
  return typeof u === 'string' && /^https?:\/\//i.test(u.trim());
}

function isValidEmail(e) {
  return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

function daysUntilBirthday(birthday) {
  if (!birthday) return null;
  const parts = birthday.split('-').map(Number);
  if (parts.length !== 3) return null;
  const [, m, d] = parts;
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let next = new Date(today.getFullYear(), m - 1, d);
  if (next < todayMidnight) {
    next = new Date(today.getFullYear() + 1, m - 1, d);
  }
  return Math.round((next - todayMidnight) / (1000 * 60 * 60 * 24));
}

const AVATAR_COLORS = ['bg-stone-800', 'bg-amber-600', 'bg-rose-500', 'bg-teal-600'];
function avatarColor(name) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

const LANGUAGES = [
  { code: 'hu', label: 'HU' },
  { code: 'en', label: 'EN' },
  { code: 'it', label: 'IT' },
];

function LanguageSwitcher({ language, onChange, compact }) {
  return (
    <div className={`flex gap-1 ${compact ? '' : 'justify-center'}`}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
            language === l.code ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function Spinner({ size = 24, className = '' }) {
  return (
    <div
      className={`spinner ${className}`}
      style={{ width: size, height: size, borderWidth: Math.max(2, size / 10) }}
    />
  );
}

function Avatar({ name, size = 44 }) {
  const safeName = name || '?';
  const initials = safeName.trim().slice(0, 2).toUpperCase();
  return (
    <div
      className={`${avatarColor(safeName)} text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </div>
  );
}

function ItemCard({ t, item, ownerView, reservedByMe, reservedByOther, onEdit, onDelete, onToggleReserve }) {
  return (
    <div className={`bg-white border border-stone-200 rounded-2xl p-4 shadow-sm ${reservedByOther ? 'opacity-60' : ''}`}>
      <div className="flex gap-3">
        {isSafeUrl(item.imageUrl) && (
          <img
            src={item.imageUrl}
            alt=""
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-stone-100"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-stone-800 ${reservedByOther ? 'line-through' : ''}`}>{item.title}</p>
          {item.description && <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {item.price && (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{item.price}</span>
            )}
            {isSafeUrl(item.url) && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-700 flex items-center gap-0.5">
                🔗 {t('linkLabel')}
              </a>
            )}
          </div>
        </div>
        {ownerView && (
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button onClick={() => onEdit(item)} className="text-stone-300 hover:text-amber-600 transition text-base leading-none">✎</button>
            <button onClick={() => onDelete(item.id)} className="text-stone-300 hover:text-red-500 transition text-base leading-none">✕</button>
          </div>
        )}
      </div>
      {!ownerView && (
        <button
          onClick={onToggleReserve}
          disabled={reservedByOther}
          className={`mt-3 w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition ${
            reservedByMe ? 'bg-emerald-50 text-emerald-700' : reservedByOther ? 'bg-stone-100 text-stone-400' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          ✓ {reservedByMe ? t('reservedByMe') : reservedByOther ? t('reservedByOther') : t('reserveAvailable')}
        </button>
      )}
    </div>
  );
}

function HomeView({ t, currentUser, others, wishlists, onSelectUser, initialLoading }) {
  const myDays = daysUntilBirthday(currentUser.birthday);
  return (
    <div className="space-y-4">
      {myDays !== null && myDays <= 60 && (
        <div className="bg-rose-500 text-white rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🎂</span>
          <p className="text-sm font-medium">
            {myDays === 0 ? t('birthdaySoonSelfToday') : t('birthdaySoonSelf', { n: myDays })}
          </p>
        </div>
      )}
      <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide px-1">{t('usersHeading')}</h2>
      {initialLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size={28} />
        </div>
      ) : others.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-stone-500 text-sm">{t('noOtherUsers')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {others.map((u) => {
            const days = daysUntilBirthday(u.birthday);
            const itemCount = (wishlists[u.username] || []).length;
            return (
              <button
                key={u.username}
                onClick={() => onSelectUser(u)}
                className="w-full bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition text-left"
              >
                <Avatar name={u.displayName} />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-stone-800 truncate text-base">{u.displayName}</p>
                  <p className="text-xs text-stone-400">{t('itemsOnList', { n: itemCount })}</p>
                </div>
                {days !== null && days <= 30 && (
                  <div className="ribbon-tag bg-rose-50 text-rose-700 text-xs font-medium pl-2.5 py-1 flex items-center gap-1 flex-shrink-0">
                    🎂 {days === 0 ? t('badgeToday') : t('badgeDays', { n: days })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MyListView({ t, items, onAdd, onEdit, onDelete, initialLoading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">{t('myListHeading')}</h2>
        <button onClick={onAdd} className="bg-amber-500 hover:bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition">+</button>
      </div>
      {initialLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size={28} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="text-4xl mb-3">🎁</div>
          <p className="text-stone-500 text-sm mb-4">{t('noItemsYet')}</p>
          <button onClick={onAdd} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            {t('addItemButton')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ItemCard key={item.id} t={t} item={item} ownerView onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function UserWishlistView({ t, profile, items, currentUser, onBack, onToggleReserve }) {
  const days = daysUntilBirthday(profile.birthday);
  return (
    <div>
      <button onClick={onBack} className="text-stone-500 hover:text-stone-800 text-sm font-medium mb-3 flex items-center gap-1 transition">
        {t('backButton')}
      </button>
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={profile.displayName} size={48} />
        <div>
          <h2 className="font-display font-semibold text-lg text-stone-800">{profile.displayName}</h2>
          {days !== null && (
            <p className="text-xs text-stone-400">{days === 0 ? t('birthdayTodayOther') : t('birthdaySoonOther', { n: days })}</p>
          )}
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-center text-stone-400 text-sm py-10">{t('noItemsOnTheirList')}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const reservedByMe = item.reservedBy === currentUser.uid;
            const reservedByOther = !!item.reservedBy && !reservedByMe;
            return (
              <ItemCard
                key={item.id}
                t={t}
                item={item}
                ownerView={false}
                reservedByMe={reservedByMe}
                reservedByOther={reservedByOther}
                onToggleReserve={() => onToggleReserve(item.id)}
              />
            );
          })}
        </div>
      )}
      <p className="text-xs text-stone-400 text-center mt-4">{t('reserveSurpriseNote', { name: profile.displayName })}</p>
    </div>
  );
}

function ItemFormModal({ t, editing, title, setTitle, desc, setDesc, url, setUrl, price, setPrice, image, setImage, onSave, onClose }) {
  return (
    <div className="fixed inset-0 bg-stone-900 bg-opacity-60 flex items-end justify-center z-20" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full max-w-sm p-5 overflow-y-auto"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-800">{editing ? t('itemFormTitleEdit') : t('itemFormTitleNew')}</h3>
          <button onClick={onClose} className="text-stone-400 text-lg leading-none">✕</button>
        </div>
        <form onSubmit={onSave} className="space-y-3">
          <input
            type="text"
            required
            placeholder={t('itemTitlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
          <textarea
            placeholder={t('itemDescPlaceholder')}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm resize-none"
          />
          <input
            type="text"
            placeholder={t('itemPricePlaceholder')}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
          <input
            type="url"
            placeholder={t('itemUrlPlaceholder')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
          <input
            type="url"
            placeholder={t('itemImagePlaceholder')}
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-medium text-sm transition">
            {editing ? t('saveButton') : t('addButton')}
          </button>
        </form>
      </div>
    </div>
  );
}

function SettingsView({
  t, currentUser, language, onChangeLanguage, onBack,
  displayNameInput, setDisplayNameInput, onSaveDisplayName,
  usernameInput, setUsernameInput, onSaveUsername,
  newEmailInput, setNewEmailInput, emailPasswordInput, setEmailPasswordInput, onChangeEmail,
  currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, onChangePassword,
  settingsError, settingsSuccess, settingsLoading,
  showDeleteConfirm, setShowDeleteConfirm, deleteAccountPassword, setDeleteAccountPassword, onDeleteAccount,
}) {
  return (
    <div>
      <button onClick={onBack} className="text-stone-500 hover:text-stone-800 text-sm font-medium mb-3 flex items-center gap-1 transition">
        {t('backButton')}
      </button>
      <h2 className="font-display font-semibold text-lg text-stone-800 mb-4">{t('settingsTitle')}</h2>

      {settingsError && <p className="text-red-500 text-xs mb-3 bg-red-50 rounded-lg px-3 py-2">{settingsError}</p>}
      {settingsSuccess && <p className="text-emerald-700 text-xs mb-3 bg-emerald-50 rounded-lg px-3 py-2">{settingsSuccess}</p>}

      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-3">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{t('settingsLanguageLabel')}</label>
        <div className="mt-2">
          <LanguageSwitcher language={language} onChange={onChangeLanguage} compact />
        </div>
      </div>

      <form onSubmit={onSaveDisplayName} className="bg-white border border-stone-200 rounded-2xl p-4 mb-3 space-y-2">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{t('settingsDisplayNameLabel')}</label>
        <input
          type="text"
          value={displayNameInput}
          onChange={(e) => setDisplayNameInput(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
        />
        <button type="submit" disabled={settingsLoading} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50">
          {t('settingsSaveButton')}
        </button>
      </form>

      <form onSubmit={onSaveUsername} className="bg-white border border-stone-200 rounded-2xl p-4 mb-3 space-y-2">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{t('settingsUsernameLabel')}</label>
        <input
          type="text"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
        />
        <p className="text-xs text-stone-400">{t('usernameHint')}</p>
        <button type="submit" disabled={settingsLoading} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50">
          {t('settingsSaveButton')}
        </button>
      </form>

      <form onSubmit={onChangeEmail} className="bg-white border border-stone-200 rounded-2xl p-4 mb-3 space-y-2">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{t('emailLabel')}</label>
        <p className="text-xs text-stone-400">{t('settingsCurrentEmailLabel')}: {currentUser.email}</p>
        <input
          type="email"
          placeholder={t('settingsNewEmailPlaceholder')}
          value={newEmailInput}
          onChange={(e) => setNewEmailInput(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
        />
        <input
          type="password"
          placeholder={t('settingsCurrentPassword')}
          value={emailPasswordInput}
          onChange={(e) => setEmailPasswordInput(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
        />
        <button type="submit" disabled={settingsLoading} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50">
          {t('settingsChangeEmailButton')}
        </button>
      </form>

      <form onSubmit={onChangePassword} className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{t('settingsPasswordSection')}</label>
        <input
          type="password"
          placeholder={t('settingsCurrentPassword')}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
        />
        <input
          type="password"
          placeholder={t('settingsNewPassword')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
        />
        <input
          type="password"
          placeholder={t('settingsConfirmPassword')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
        />
        <button type="submit" disabled={settingsLoading} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50">
          {t('settingsChangePasswordButton')}
        </button>
      </form>

      <div className="bg-white border-2 border-red-200 rounded-2xl p-4 mt-3">
        <label className="text-xs font-semibold text-red-500 uppercase tracking-wide">{t('settingsDangerZone')}</label>
        {!showDeleteConfirm ? (
          <div className="mt-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              {t('settingsDeleteAccountButton')}
            </button>
          </div>
        ) : (
          <form onSubmit={onDeleteAccount} className="mt-2 space-y-2">
            <p className="text-xs text-red-500">{t('settingsDeleteWarning')}</p>
            <input
              type="password"
              placeholder={t('settingsDeleteConfirmPassword')}
              value={deleteAccountPassword}
              onChange={(e) => setDeleteAccountPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={settingsLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {settingsLoading && <Spinner size={14} />}
                {t('settingsDeleteConfirmButton')}
              </button>
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeleteAccountPassword(''); }}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 py-2 rounded-xl text-sm font-medium transition"
              >
                {t('settingsDeleteCancelButton')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function BirthdayWishlistApp() {
  const [language, setLanguage] = useState(detectLanguage());
  const t = makeTranslator(language);

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formBirthday, setFormBirthday] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const [users, setUsers] = useState([]);
  const [view, setView] = useState('home');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [wishlists, setWishlists] = useState({});
  const [dataLoadedOnce, setDataLoadedOnce] = useState(false);

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState('');

  const [settingsDisplayName, setSettingsDisplayName] = useState('');
  const [settingsUsername, setSettingsUsername] = useState('');
  const [settingsCurrentPassword, setSettingsCurrentPassword] = useState('');
  const [settingsNewEmail, setSettingsNewEmail] = useState('');
  const [settingsEmailPassword, setSettingsEmailPassword] = useState('');
  const [settingsNewPassword, setSettingsNewPassword] = useState('');
  const [settingsConfirmPassword, setSettingsConfirmPassword] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const doc = await firebase.firestore().collection('users').doc(user.uid).get();
          if (doc.exists) {
            let profile = doc.data();
            if (user.email && profile.email !== user.email) {
              try {
                await firebase.firestore().collection('users').doc(user.uid).update({ email: user.email });
                profile = { ...profile, email: user.email };
              } catch (syncErr) {
                // non-fatal
              }
            }
            setCurrentUser(profile);
            setSettingsDisplayName(profile.displayName || '');
            setSettingsUsername(profile.username || '');
            if (profile.language) setLanguage(profile.language);
          } else {
            setCurrentUser(null);
          }
        } catch (e) {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const unsubUsers = firebase.firestore().collection('users').onSnapshot(
      (snap) => {
        setUsers(snap.docs.map((d) => d.data()));
        setDataLoadedOnce(true);
      },
      () => setDataLoadedOnce(true)
    );
    const unsubWishlists = firebase.firestore().collection('wishlists').onSnapshot(
      (snap) => {
        const wl = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.username) wl[data.username] = data.items || [];
        });
        setWishlists(wl);
      },
      () => {}
    );
    return () => {
      unsubUsers();
      unsubWishlists();
    };
  }, [currentUser]);

  function resetAuthForm() {
    setFormUsername('');
    setFormEmail('');
    setFormPassword('');
    setFormDisplayName('');
    setFormBirthday('');
  }

  async function handleRegister(e) {
    e.preventDefault();
    setAuthError('');
    const uname = sanitizeUsername(formUsername);
    const emailTrimmed = formEmail.trim().toLowerCase();
    if (!uname) { setAuthError(t('err_invalidUsername')); return; }
    if (!isValidEmail(emailTrimmed)) { setAuthError(t('err_invalidEmail')); return; }
    if (formPassword.length < 6) { setAuthError(t('err_passwordTooShort')); return; }
    if (!formDisplayName.trim()) { setAuthError(t('err_nameRequired')); return; }
    if (!formBirthday) { setAuthError(t('err_birthdayRequired')); return; }
    setAuthLoading(true);
    try {
      const existingUsername = await firebase.firestore().collection('usernameIndex').doc(uname).get();
      if (existingUsername.exists) { setAuthError(t('err_usernameTaken')); setAuthLoading(false); return; }
      const cred = await firebase.auth().createUserWithEmailAndPassword(emailTrimmed, formPassword);
      const uid = cred.user.uid;
      const profile = {
        uid,
        username: uname,
        displayName: formDisplayName.trim(),
        birthday: formBirthday,
        email: emailTrimmed,
        createdAt: new Date().toISOString(),
        language,
      };
      await firebase.firestore().collection('users').doc(uid).set(profile);
      await firebase.firestore().collection('wishlists').doc(uid).set({ uid, username: uname, items: [] });
      await firebase.firestore().collection('usernameIndex').doc(uname).set({ email: emailTrimmed });
      setCurrentUser(profile);
      setSettingsDisplayName(profile.displayName);
      setSettingsUsername(profile.username);
      resetAuthForm();
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') setAuthError(t('err_emailTaken'));
      else if (e.code === 'auth/weak-password') setAuthError(t('err_weakPassword'));
      else if (e.code === 'auth/invalid-email') setAuthError(t('err_invalidEmail'));
      else setAuthError(t('err_genericRegister'));
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    const uname = sanitizeUsername(formUsername);
    if (!uname || !formPassword) { setAuthError(t('err_missingCredentials')); return; }
    setAuthLoading(true);
    try {
      const idxDoc = await firebase.firestore().collection('usernameIndex').doc(uname).get();
      const isLegacy = !idxDoc.exists;
      const email = isLegacy ? usernameToEmail(uname) : idxDoc.data().email;
      const cred = await firebase.auth().signInWithEmailAndPassword(email, formPassword);
      if (isLegacy) {
        // Account predates the real-email requirement: heal the missing
        // usernameIndex entry and backfill the email field so future logins
        // and account-settings actions (password change, deletion) work normally.
        try {
          const uid = cred.user.uid;
          await firebase.firestore().collection('usernameIndex').doc(uname).set({ email });
          await firebase.firestore().collection('users').doc(uid).update({ email });
          const freshDoc = await firebase.firestore().collection('users').doc(uid).get();
          if (freshDoc.exists) setCurrentUser(freshDoc.data());
        } catch (healErr) {
          // Non-fatal: login already succeeded even if healing didn't fully complete.
        }
      }
      resetAuthForm();
    } catch (e) {
      setAuthError(t('err_wrongCredentials'));
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess(false);
    const emailTrimmed = forgotEmail.trim().toLowerCase();
    if (!isValidEmail(emailTrimmed)) { setForgotError(t('err_invalidEmail')); return; }
    setForgotLoading(true);
    try {
      await firebase.auth().sendPasswordResetEmail(emailTrimmed);
    } catch (e) {
      if (e.code === 'auth/invalid-email') {
        setForgotLoading(false);
        setForgotError(t('err_invalidEmail'));
        return;
      }
    }
    setForgotSuccess(true);
    setForgotLoading(false);
  }

  async function handleLogout() {
    try {
      await firebase.auth().signOut();
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    setUsers([]);
    setWishlists({});
    setSelectedUser(null);
    setShowSettings(false);
    setView('home');
    setDataLoadedOnce(false);
  }

  function openAddItem() {
    setEditingItem(null);
    setItemTitle('');
    setItemDesc('');
    setItemUrl('');
    setItemPrice('');
    setItemImage('');
    setShowItemForm(true);
  }

  function openEditItem(item) {
    setEditingItem(item);
    setItemTitle(item.title);
    setItemDesc(item.description || '');
    setItemUrl(item.url || '');
    setItemPrice(item.price || '');
    setItemImage(item.imageUrl || '');
    setShowItemForm(true);
  }

  async function saveItem(e) {
    e.preventDefault();
    if (!itemTitle.trim() || !currentUser) return;
    const myList = wishlists[currentUser.username] || [];
    let newList;
    if (editingItem) {
      newList = myList.map((it) =>
        it.id === editingItem.id
          ? { ...it, title: itemTitle.trim(), description: itemDesc.trim(), url: itemUrl.trim(), price: itemPrice.trim(), imageUrl: itemImage.trim() }
          : it
      );
    } else {
      const newItem = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        title: itemTitle.trim(),
        description: itemDesc.trim(),
        url: itemUrl.trim(),
        price: itemPrice.trim(),
        imageUrl: itemImage.trim(),
        reservedBy: null,
      };
      newList = [...myList, newItem];
    }
    setShowItemForm(false);
    try {
      await firebase.firestore().collection('wishlists').doc(currentUser.uid).set({
        uid: currentUser.uid,
        username: currentUser.username,
        items: newList,
      });
    } catch (e) {
      // best effort
    }
  }

  async function deleteItem(itemId) {
    if (!currentUser) return;
    const myList = wishlists[currentUser.username] || [];
    const newList = myList.filter((it) => it.id !== itemId);
    try {
      await firebase.firestore().collection('wishlists').doc(currentUser.uid).set({
        uid: currentUser.uid,
        username: currentUser.username,
        items: newList,
      });
    } catch (e) {
      // best effort
    }
  }

  async function toggleReserve(ownerUid, itemId) {
    if (!currentUser) return;
    const ref = firebase.firestore().collection('wishlists').doc(ownerUid);
    try {
      await firebase.firestore().runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) return;
        const data = snap.data();
        const items = data.items || [];
        const newItems = items.map((it) => {
          if (it.id !== itemId) return it;
          if (it.reservedBy === currentUser.uid) return { ...it, reservedBy: null };
          if (it.reservedBy) return it;
          return { ...it, reservedBy: currentUser.uid };
        });
        tx.update(ref, { items: newItems });
      });
    } catch (e) {
      // best effort
    }
  }

  async function handleChangeLanguage(lang) {
    setLanguage(lang);
    if (currentUser) {
      try {
        await firebase.firestore().collection('users').doc(currentUser.uid).update({ language: lang });
        setCurrentUser((prev) => (prev ? { ...prev, language: lang } : prev));
      } catch (e) {
        // best effort
      }
    }
  }

  async function handleSaveDisplayName(e) {
    e.preventDefault();
    if (!settingsDisplayName.trim() || !currentUser) return;
    setSettingsError('');
    setSettingsSuccess('');
    setSettingsLoading(true);
    try {
      await firebase.firestore().collection('users').doc(currentUser.uid).update({ displayName: settingsDisplayName.trim() });
      setCurrentUser((prev) => (prev ? { ...prev, displayName: settingsDisplayName.trim() } : prev));
      setSettingsSuccess(t('settings_displayNameChanged'));
    } catch (e) {
      setSettingsError(t('err_genericError'));
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleSaveUsername(e) {
    e.preventDefault();
    if (!currentUser) return;
    setSettingsError('');
    setSettingsSuccess('');
    const newUname = sanitizeUsername(settingsUsername);
    if (!newUname) { setSettingsError(t('err_invalidUsername')); return; }
    if (newUname === currentUser.username) return;
    setSettingsLoading(true);
    try {
      const existing = await firebase.firestore().collection('usernameIndex').doc(newUname).get();
      if (existing.exists) { setSettingsError(t('err_usernameTaken')); setSettingsLoading(false); return; }
      await firebase.firestore().collection('usernameIndex').doc(newUname).set({ email: currentUser.email });
      await firebase.firestore().collection('usernameIndex').doc(currentUser.username).delete();
      await firebase.firestore().collection('users').doc(currentUser.uid).update({ username: newUname });
      await firebase.firestore().collection('wishlists').doc(currentUser.uid).update({ username: newUname });
      setCurrentUser((prev) => (prev ? { ...prev, username: newUname } : prev));
      setSettingsSuccess(t('settings_usernameChanged'));
    } catch (e) {
      setSettingsError(t('err_genericError'));
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleChangeEmail(e) {
    e.preventDefault();
    if (!currentUser) return;
    setSettingsError('');
    setSettingsSuccess('');
    const newEmailTrimmed = settingsNewEmail.trim().toLowerCase();
    if (!isValidEmail(newEmailTrimmed)) { setSettingsError(t('err_invalidEmail')); return; }
    setSettingsLoading(true);
    try {
      const user = firebase.auth().currentUser;
      const cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, settingsEmailPassword);
      await user.reauthenticateWithCredential(cred);
      await user.verifyBeforeUpdateEmail(newEmailTrimmed);
      setSettingsSuccess(t('settings_emailChangeSent', { email: newEmailTrimmed }));
      setSettingsNewEmail('');
      setSettingsEmailPassword('');
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setSettingsError(t('err_wrongCurrentPassword'));
      } else if (e.code === 'auth/email-already-in-use') {
        setSettingsError(t('err_emailTaken'));
      } else {
        setSettingsError(t('err_genericError'));
      }
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!currentUser) return;
    setSettingsError('');
    setSettingsSuccess('');
    if (settingsNewPassword.length < 6) { setSettingsError(t('err_passwordTooShort')); return; }
    if (settingsNewPassword !== settingsConfirmPassword) { setSettingsError(t('err_passwordsDontMatch')); return; }
    setSettingsLoading(true);
    try {
      const user = firebase.auth().currentUser;
      const cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, settingsCurrentPassword);
      await user.reauthenticateWithCredential(cred);
      await user.updatePassword(settingsNewPassword);
      setSettingsSuccess(t('settings_passwordChanged'));
      setSettingsCurrentPassword('');
      setSettingsNewPassword('');
      setSettingsConfirmPassword('');
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setSettingsError(t('err_wrongCurrentPassword'));
      } else {
        setSettingsError(t('err_genericError'));
      }
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleDeleteAccount(e) {
    e.preventDefault();
    if (!currentUser) return;
    setSettingsError('');
    setSettingsLoading(true);
    try {
      const user = firebase.auth().currentUser;
      const cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, deleteAccountPassword);
      await user.reauthenticateWithCredential(cred);
      await firebase.firestore().collection('usernameIndex').doc(currentUser.username).delete();
      await firebase.firestore().collection('wishlists').doc(currentUser.uid).delete();
      await firebase.firestore().collection('users').doc(currentUser.uid).delete();
      await user.delete();
      // onAuthStateChanged will fire with null and reset the rest of the app state
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setSettingsError(t('err_wrongCurrentPassword'));
      } else {
        setSettingsError(t('err_genericError'));
      }
      setSettingsLoading(false);
    }
  }

  function openSettings() {
    if (currentUser) {
      setSettingsDisplayName(currentUser.displayName || '');
      setSettingsUsername(currentUser.username || '');
    }
    setSettingsError('');
    setSettingsSuccess('');
    setShowSettings(true);
  }

  let content;
  if (loading) {
    content = (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <Spinner size={32} />
      </div>
    );
  } else if (!currentUser) {
    content = (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white border border-stone-200 rounded-2xl shadow-xl p-6">
          <div className="flex justify-end mb-2">
            <LanguageSwitcher language={language} onChange={setLanguage} compact />
          </div>
          <div className="flex flex-col items-center mb-6">
            <div className="bg-stone-800 p-3 rounded-2xl mb-3 text-2xl">🎂</div>
            <h1 className="font-display text-2xl font-semibold text-stone-800">{t('appTitle')}</h1>
            <p className="text-sm text-stone-500 mt-1">{t('appSubtitle')}</p>
          </div>

          {authMode === 'forgot' ? (
            <div>
              <h3 className="font-semibold text-stone-800 mb-1">{t('forgotTitle')}</h3>
              <p className="text-xs text-stone-500 mb-4">{t('forgotDescription')}</p>
              {forgotSuccess ? (
                <p className="text-emerald-700 text-sm bg-emerald-50 rounded-xl p-3 mb-3">{t('forgotSuccessMessage')}</p>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <input
                    type="email"
                    placeholder={t('emailLabel')}
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                  />
                  {forgotError && <p className="text-red-500 text-xs">{forgotError}</p>}
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading && <Spinner size={16} />}
                    {t('forgotSubmitButton')}
                  </button>
                </form>
              )}
              <button
                onClick={() => { setAuthMode('login'); setForgotError(''); setForgotSuccess(false); setForgotEmail(''); }}
                className="text-stone-500 hover:text-stone-800 text-sm font-medium mt-4 transition"
              >
                {t('backToLogin')}
              </button>
            </div>
          ) : (
            <>
              <div className="flex bg-stone-100 rounded-xl p-1 mb-5">
                <button
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${authMode === 'login' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400'}`}
                >
                  {t('loginTab')}
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${authMode === 'register' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400'}`}
                >
                  {t('registerTab')}
                </button>
              </div>

              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder={t('usernameLabel')}
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                  />
                  {authMode === 'register' && <p className="text-xs text-stone-400 mt-1 ml-1">{t('usernameHint')}</p>}
                </div>
                {authMode === 'register' && (
                  <>
                    <input
                      type="email"
                      placeholder={t('emailLabel')}
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                    />
                    <input
                      type="text"
                      placeholder={t('displayNameLabel')}
                      value={formDisplayName}
                      onChange={(e) => setFormDisplayName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                    />
                    <div>
                      <label className="text-xs text-stone-500 ml-1">{t('birthdayLabel')}</label>
                      <input
                        type="date"
                        required
                        value={formBirthday}
                        onChange={(e) => setFormBirthday(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm mt-1"
                      />
                    </div>
                  </>
                )}
                <input
                  type="password"
                  placeholder={t('passwordLabel')}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
                {authError && <p className="text-red-500 text-xs">{authError}</p>}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {authLoading && <Spinner size={16} />}
                  {authMode === 'login' ? t('loginButton') : t('registerButton')}
                </button>
              </form>
              {authMode === 'login' && (
                <button
                  onClick={() => { setAuthMode('forgot'); setAuthError(''); }}
                  className="text-stone-500 hover:text-stone-800 text-xs font-medium mt-3 block mx-auto transition"
                >
                  {t('forgotPasswordLink')}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  } else {
    const others = users.filter((u) => u.username !== currentUser.username);
    content = (
      <div className="min-h-screen bg-stone-100 pb-24">
        <div className="bg-white sticky top-0 z-10 border-b border-stone-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-stone-800 p-1.5 rounded-lg text-base leading-none">🎂</div>
            <span className="font-display font-semibold text-stone-800 text-sm">{t('appTitle')}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={openSettings} className="text-stone-400 hover:text-stone-700 transition text-base leading-none">⚙</button>
            <button onClick={handleLogout} className="text-stone-400 hover:text-red-500 transition text-sm font-medium">
              {t('logoutButton')}
            </button>
          </div>
        </div>

        <div className="px-4 py-4 max-w-md mx-auto">
          {showSettings ? (
            <SettingsView
              t={t}
              currentUser={currentUser}
              language={language}
              onChangeLanguage={handleChangeLanguage}
              onBack={() => setShowSettings(false)}
              displayNameInput={settingsDisplayName}
              setDisplayNameInput={setSettingsDisplayName}
              onSaveDisplayName={handleSaveDisplayName}
              usernameInput={settingsUsername}
              setUsernameInput={setSettingsUsername}
              onSaveUsername={handleSaveUsername}
              newEmailInput={settingsNewEmail}
              setNewEmailInput={setSettingsNewEmail}
              emailPasswordInput={settingsEmailPassword}
              setEmailPasswordInput={setSettingsEmailPassword}
              onChangeEmail={handleChangeEmail}
              currentPassword={settingsCurrentPassword}
              setCurrentPassword={setSettingsCurrentPassword}
              newPassword={settingsNewPassword}
              setNewPassword={setSettingsNewPassword}
              confirmPassword={settingsConfirmPassword}
              setConfirmPassword={setSettingsConfirmPassword}
              onChangePassword={handleChangePassword}
              settingsError={settingsError}
              settingsSuccess={settingsSuccess}
              settingsLoading={settingsLoading}
              showDeleteConfirm={showDeleteConfirm}
              setShowDeleteConfirm={setShowDeleteConfirm}
              deleteAccountPassword={deleteAccountPassword}
              setDeleteAccountPassword={setDeleteAccountPassword}
              onDeleteAccount={handleDeleteAccount}
            />
          ) : selectedUser ? (
            <UserWishlistView
              t={t}
              profile={selectedUser}
              items={wishlists[selectedUser.username] || []}
              currentUser={currentUser}
              onBack={() => setSelectedUser(null)}
              onToggleReserve={(itemId) => toggleReserve(selectedUser.uid, itemId)}
            />
          ) : view === 'home' ? (
            <HomeView t={t} currentUser={currentUser} others={others} wishlists={wishlists} onSelectUser={setSelectedUser} initialLoading={!dataLoadedOnce} />
          ) : (
            <MyListView
              t={t}
              items={wishlists[currentUser.username] || []}
              onAdd={openAddItem}
              onEdit={openEditItem}
              onDelete={deleteItem}
              initialLoading={!dataLoadedOnce}
            />
          )}
        </div>

        {!showSettings && !selectedUser && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-center gap-2 py-2">
            <button
              onClick={() => setView('home')}
              className={`flex flex-col items-center gap-0.5 px-8 py-1.5 rounded-xl transition ${view === 'home' ? 'text-stone-800' : 'text-stone-400'}`}
            >
              <span className="text-lg leading-none">👥</span>
              <span className="text-xs font-medium">{t('navEveryone')}</span>
            </button>
            <button
              onClick={() => setView('mylist')}
              className={`flex flex-col items-center gap-0.5 px-8 py-1.5 rounded-xl transition ${view === 'mylist' ? 'text-stone-800' : 'text-stone-400'}`}
            >
              <span className="text-lg leading-none">🎁</span>
              <span className="text-xs font-medium">{t('navMyList')}</span>
            </button>
          </div>
        )}

        {showItemForm && (
          <ItemFormModal
            t={t}
            editing={!!editingItem}
            title={itemTitle}
            setTitle={setItemTitle}
            desc={itemDesc}
            setDesc={setItemDesc}
            url={itemUrl}
            setUrl={setItemUrl}
            price={itemPrice}
            setPrice={setItemPrice}
            image={itemImage}
            setImage={setItemImage}
            onSave={saveItem}
            onClose={() => setShowItemForm(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="wishlist-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .wishlist-app { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .wishlist-app .font-display { font-family: 'Fraunces', Georgia, serif; }
        .wishlist-app .ribbon-tag { clip-path: polygon(0% 0%, 82% 0%, 100% 50%, 82% 100%, 0% 100%); padding-right: 1.2rem; }
        .wishlist-app .spinner { border: 3px solid #e7e5e4; border-top-color: #78716c; border-radius: 9999px; animation: wishlist-spin 0.8s linear infinite; display: inline-block; }
        @keyframes wishlist-spin { to { transform: rotate(360deg); } }
      `}</style>
      {content}
    </div>
  );
}

const rootEl = document.getElementById('root');
const root = ReactDOM.createRoot(rootEl);
root.render(<BirthdayWishlistApp />);
