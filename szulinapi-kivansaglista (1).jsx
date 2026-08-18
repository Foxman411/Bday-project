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

function ItemCard({ item, ownerView, reservedByMe, reservedByOther, onEdit, onDelete, onToggleReserve }) {
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
                🔗 Link
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
          ✓ {reservedByMe ? 'Te foglaltad le' : reservedByOther ? 'Már lefoglalva' : 'Lefoglalom, hogy megveszem'}
        </button>
      )}
    </div>
  );
}

function HomeView({ currentUser, others, wishlists, onSelectUser, initialLoading }) {
  const myDays = daysUntilBirthday(currentUser.birthday);
  return (
    <div className="space-y-4">
      {myDays !== null && myDays <= 60 && (
        <div className="bg-rose-500 text-white rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🎂</span>
          <p className="text-sm font-medium">
            {myDays === 0 ? 'Ma van a szülinapod! 🎉' : `A szülinapod ${myDays} nap múlva van!`}
          </p>
        </div>
      )}
      <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide px-1">Felhasználók</h2>
      {initialLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size={28} />
        </div>
      ) : others.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-stone-500 text-sm">
            Még senki más nem regisztrált.<br />Hívd meg a családod vagy barátaidat, hogy ők is csatlakozzanak!
          </p>
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
                  <p className="text-xs text-stone-400">{itemCount} kívánság a listáján</p>
                </div>
                {days !== null && days <= 30 && (
                  <div className="ribbon-tag bg-rose-50 text-rose-700 text-xs font-medium pl-2.5 py-1 flex items-center gap-1 flex-shrink-0">
                    🎂 {days === 0 ? 'Ma!' : `${days} nap`}
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

function MyListView({ items, onAdd, onEdit, onDelete, initialLoading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Kívánságlistám</h2>
        <button onClick={onAdd} className="bg-amber-500 hover:bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition">+</button>
      </div>
      {initialLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size={28} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="text-4xl mb-3">🎁</div>
          <p className="text-stone-500 text-sm mb-4">Még nincs semmi a listádon.</p>
          <button onClick={onAdd} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            Kívánság hozzáadása
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} ownerView onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function UserWishlistView({ profile, items, currentUser, onBack, onToggleReserve }) {
  const days = daysUntilBirthday(profile.birthday);
  return (
    <div>
      <button onClick={onBack} className="text-stone-500 hover:text-stone-800 text-sm font-medium mb-3 flex items-center gap-1 transition">
        ← Vissza
      </button>
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={profile.displayName} size={48} />
        <div>
          <h2 className="font-display font-semibold text-lg text-stone-800">{profile.displayName}</h2>
          {days !== null && (
            <p className="text-xs text-stone-400">
              {days === 0 ? 'Ma van a szülinapja! 🎉' : `${days} nap múlva van a szülinapja`}
            </p>
          )}
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-center text-stone-400 text-sm py-10">Ennek a felhasználónak még nincs kívánsága a listáján.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const reservedByMe = item.reservedBy === currentUser.uid;
            const reservedByOther = !!item.reservedBy && !reservedByMe;
            return (
              <ItemCard
                key={item.id}
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
      <p className="text-xs text-stone-400 text-center mt-4">
        A lefoglalást {profile.displayName} nem látja, így meglepetés marad! 🤫
      </p>
    </div>
  );
}

function ItemFormModal({ editing, title, setTitle, desc, setDesc, url, setUrl, price, setPrice, image, setImage, onSave, onClose }) {
  return (
    <div className="fixed inset-0 bg-stone-900 bg-opacity-60 flex items-end justify-center z-20" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full max-w-sm p-5 overflow-y-auto"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-800">{editing ? 'Kívánság szerkesztése' : 'Új kívánság'}</h3>
          <button onClick={onClose} className="text-stone-400 text-lg leading-none">✕</button>
        </div>
        <form onSubmit={onSave} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Mit szeretnél? *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
          <textarea
            placeholder="Leírás (opcionális)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm resize-none"
          />
          <input
            type="text"
            placeholder="Kb. ár (opcionális)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
          <input
            type="url"
            placeholder="Link a termékhez (opcionális)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
          <input
            type="url"
            placeholder="Kép URL (opcionális)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-medium text-sm transition">
            {editing ? 'Mentés' : 'Hozzáadás'}
          </button>
        </form>
      </div>
    </div>
  );
}

function BirthdayWishlistApp() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formBirthday, setFormBirthday] = useState('');

  const [users, setUsers] = useState([]);
  const [view, setView] = useState('home');
  const [selectedUser, setSelectedUser] = useState(null);
  const [wishlists, setWishlists] = useState({});
  const [dataLoadedOnce, setDataLoadedOnce] = useState(false);

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState('');

  // ---- Auth state listener ----
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const doc = await firebase.firestore().collection('users').doc(user.uid).get();
          if (doc.exists) {
            setCurrentUser(doc.data());
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

  // ---- Real-time data listeners (only once authenticated) ----
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
    setFormPassword('');
    setFormDisplayName('');
    setFormBirthday('');
  }

  async function handleRegister(e) {
    e.preventDefault();
    setAuthError('');
    const uname = sanitizeUsername(formUsername);
    if (!uname) {
      setAuthError('Adj meg egy érvényes felhasználónevet (csak betűk, számok, - és _).');
      return;
    }
    if (formPassword.length < 6) {
      setAuthError('A jelszó legyen legalább 6 karakter.');
      return;
    }
    if (!formDisplayName.trim()) {
      setAuthError('Add meg a neved.');
      return;
    }
    if (!formBirthday) {
      setAuthError('A születésnap megadása kötelező.');
      return;
    }
    setAuthLoading(true);
    try {
      const email = usernameToEmail(uname);
      const cred = await firebase.auth().createUserWithEmailAndPassword(email, formPassword);
      const uid = cred.user.uid;
      const profile = {
        uid,
        username: uname,
        displayName: formDisplayName.trim(),
        birthday: formBirthday,
        createdAt: new Date().toISOString(),
      };
      await firebase.firestore().collection('users').doc(uid).set(profile);
      await firebase.firestore().collection('wishlists').doc(uid).set({ uid, username: uname, items: [] });
      setCurrentUser(profile);
      resetAuthForm();
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        setAuthError('Ez a felhasználónév már foglalt.');
      } else if (e.code === 'auth/weak-password') {
        setAuthError('A jelszó túl gyenge, legyen legalább 6 karakter.');
      } else {
        setAuthError('Hiba történt a regisztráció során. Próbáld újra.');
      }
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    const uname = sanitizeUsername(formUsername);
    if (!uname || !formPassword) {
      setAuthError('Add meg a felhasználóneved és jelszavad.');
      return;
    }
    setAuthLoading(true);
    try {
      const email = usernameToEmail(uname);
      await firebase.auth().signInWithEmailAndPassword(email, formPassword);
      resetAuthForm();
    } catch (e) {
      setAuthError('Hibás felhasználónév vagy jelszó.');
    } finally {
      setAuthLoading(false);
    }
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
          <div className="flex flex-col items-center mb-6">
            <div className="bg-stone-800 p-3 rounded-2xl mb-3 text-2xl">🎂</div>
            <h1 className="font-display text-2xl font-semibold text-stone-800">Szülinapi Kívánságlista</h1>
            <p className="text-sm text-stone-500 mt-1">Oszd meg, mit szeretnél kapni</p>
          </div>

          <div className="flex bg-stone-100 rounded-xl p-1 mb-5">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${authMode === 'login' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400'}`}
            >
              Bejelentkezés
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${authMode === 'register' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400'}`}
            >
              Regisztráció
            </button>
          </div>

          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Felhasználónév"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
              {authMode === 'register' && (
                <p className="text-xs text-stone-400 mt-1 ml-1">Csak kisbetűk, számok, - és _ karakterek</p>
              )}
            </div>
            {authMode === 'register' && (
              <>
                <input
                  type="text"
                  placeholder="Megjelenített név"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
                <div>
                  <label className="text-xs text-stone-500 ml-1">Születésnap *</label>
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
              placeholder="Jelszó (min. 6 karakter)"
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
              {authLoading && <Spinner size={16} className="border-white" />}
              {authMode === 'login' ? 'Bejelentkezés' : 'Fiók létrehozása'}
            </button>
          </form>
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
            <span className="font-display font-semibold text-stone-800 text-sm">Szülinapi Kívánságlista</span>
          </div>
          <button onClick={handleLogout} className="text-stone-400 hover:text-red-500 transition text-sm font-medium">
            Kilépés
          </button>
        </div>

        <div className="px-4 py-4 max-w-md mx-auto">
          {selectedUser ? (
            <UserWishlistView
              profile={selectedUser}
              items={wishlists[selectedUser.username] || []}
              currentUser={currentUser}
              onBack={() => setSelectedUser(null)}
              onToggleReserve={(itemId) => toggleReserve(selectedUser.uid, itemId)}
            />
          ) : view === 'home' ? (
            <HomeView currentUser={currentUser} others={others} wishlists={wishlists} onSelectUser={setSelectedUser} initialLoading={!dataLoadedOnce} />
          ) : (
            <MyListView
              items={wishlists[currentUser.username] || []}
              onAdd={openAddItem}
              onEdit={openEditItem}
              onDelete={deleteItem}
              initialLoading={!dataLoadedOnce}
            />
          )}
        </div>

        {!selectedUser && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-center gap-2 py-2">
            <button
              onClick={() => setView('home')}
              className={`flex flex-col items-center gap-0.5 px-8 py-1.5 rounded-xl transition ${view === 'home' ? 'text-stone-800' : 'text-stone-400'}`}
            >
              <span className="text-lg leading-none">👥</span>
              <span className="text-xs font-medium">Mindenki</span>
            </button>
            <button
              onClick={() => setView('mylist')}
              className={`flex flex-col items-center gap-0.5 px-8 py-1.5 rounded-xl transition ${view === 'mylist' ? 'text-stone-800' : 'text-stone-400'}`}
            >
              <span className="text-lg leading-none">🎁</span>
              <span className="text-xs font-medium">Listám</span>
            </button>
          </div>
        )}

        {showItemForm && (
          <ItemFormModal
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
