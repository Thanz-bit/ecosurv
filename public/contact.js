/**
 * HTS Community Chat — app.js
 * ============================================================  
 * MODIFIED: Using Ollama local API instead of Anthropic
 * Fix: API call to http://localhost:11434/api/chat
 * ============================================================
 */

// ─── Constants & State ──────────────────────────────────────
const ME = { name: 'You', initials: 'ME', cls: 'av-blue' };

// Configuration for Ollama
const OLLAMA_CONFIG = {
    baseUrl: 'http://localhost:11434',
    model: 'llama3.2:1b', // Ganti dengan model yang Anda download
    // Opsi model tambahan (optional)
    options: {
        temperature: 0.7,
        top_p: 0.9,
        num_ctx: 4096 // Context window size
    }
};

let contacts = [
  {
    id: 'q1', name: '???', initials: 'US', cls: 'av-dark',
    statusDot: 'online', status: 'League of Legends',
    handle: 'unknown_summoner', bio: 'fraghead. main mid. 3000 hours deep.',
    since: 'Sep 17, 2018', groups: 4, friends: 2,
    banner: 'linear-gradient(135deg,#1a1d2e,#3d4270)',
    unread: 0, isFriend: true, isBlocked: false, messages: [],
    mutualGroups: [
      { icon: '🎮', name: 'MOBA Masters', members: 128 },
      { icon: '⚔️', name: 'Rank Grinders', members: 56 },
      { icon: '🏆', name: 'Diamond Club', members: 34 },
      { icon: '🌙', name: 'Night Owls', members: 212 },
    ],
    prompt: "You're a mysterious gamer on HTS. You love League of Legends. Reply very casually like texting — 1-3 sentences max. Use gamer lingo. Don't reveal you're AI."
  },
  {
    id: 'c4', name: 'c4sure', initials: 'C4', cls: 'av-pink',
    statusDot: 'online', status: 'Online',
    handle: 'c4sure_gg', bio: 'just vibing & fragging 🎯 cs2 main. valorant on weekends.',
    since: 'Mar 4, 2020', groups: 6, friends: 5,
    banner: 'linear-gradient(135deg,#ff6b9d,#c44dff)',
    unread: 2, isFriend: true, isBlocked: false,
    messages: [
      { id: 'p1', role: 'assistant', content: 'yo bro you online?', date: '19 February 2026', ts: '22:50', grouped: false },
      { id: 'p2', role: 'assistant', content: 'tryna rank up, need one more 👀', date: '19 February 2026', ts: '22:50', grouped: true },
    ],
    mutualGroups: [
      { icon: '🔫', name: 'CS2 Community', members: 540 },
      { icon: '🎯', name: 'Aim Trainers', members: 88 },
      { icon: '🏅', name: 'Rank Grinders', members: 56 },
      { icon: '🎮', name: 'FPS Hub', members: 320 },
      { icon: '💬', name: 'Chill Lobby', members: 145 },
      { icon: '🌟', name: 'Pro Watchers', members: 67 },
    ],
    prompt: "You're 'c4sure', a competitive gamer on HTS. Love FPS (CS2, Valorant). Reply casually 1-3 sentences like real texting. Use gaming slang."
  },
  {
    id: 'pc', name: 'ProCoach', initials: 'PC', cls: 'av-orange',
    statusDot: 'away', status: 'In a game',
    handle: 'procoach_hts', bio: 'Diamond coach | MOBA & FPS specialist | DM for sessions',
    since: 'Jan 12, 2019', groups: 3, friends: 1,
    banner: 'linear-gradient(135deg,#f7971e,#ffd200)',
    unread: 0, isFriend: true, isBlocked: false, messages: [],
    mutualGroups: [
      { icon: '📚', name: 'Coaching Hub', members: 234 },
      { icon: '🏆', name: 'Diamond Club', members: 34 },
      { icon: '🎮', name: 'MOBA Masters', members: 128 },
    ],
    prompt: "You're 'ProCoach', a pro gaming coach on HTS. Specialise in MOBAs and FPS. Give specific actionable advice in 2-4 sentences."
  },
];

let friendRequests = [
  {
    id: 'fr1', name: 'NightRaider', initials: 'NR', cls: 'av-teal',
    status: '3 mutual friends', since: 'Jan 2023', bio: 'midnight grinder 🌙',
    groups: 2, friends: 3, handle: 'nightraider99',
    banner: 'linear-gradient(135deg,#11998e,#38ef7d)',
    mutualGroups: [{ icon: '🌙', name: 'Night Owls', members: 212 }, { icon: '🎮', name: 'MOBA Masters', members: 128 }],
  },
  {
    id: 'fr2', name: 'PixelQueen', initials: 'PQ', cls: 'av-red',
    status: '5 mutual friends', since: 'Aug 2021', bio: 'art + games = life 🎨',
    groups: 5, friends: 8, handle: 'pixelqueen_gg',
    banner: 'linear-gradient(135deg,#e84343,#ff6b6b)',
    mutualGroups: [
      { icon: '🎨', name: 'Creative Hub', members: 180 },
      { icon: '🎮', name: 'Indie Games', members: 95 },
      { icon: '🌟', name: 'Art & Play', members: 72 },
      { icon: '💎', name: 'Diamond Club', members: 34 },
      { icon: '💬', name: 'Chill Lobby', members: 145 },
    ],
  },
];

let active        = null;
let streaming     = false;
let profileOpen   = true;
let currentTab    = 'friends';
let callInterval  = null;
let callSeconds   = 0;
let pendingImages = [];
let currentEpCat       = 'smileys';
let currentStickerPack = 'gaming';
let incomingShown = false;

// ─── Emoji / Sticker / GIF / Gift Data ──────────────────────
const EMOJIS = {
  smileys:    ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕'],
  gestures:   ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🙏','✍️','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🫀','🫁','🧠','🦷','🦴','👀','👁️','👅','👄'],
  hearts:     ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☯️','🕎','🔯','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'],
  animals:    ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀'],
  food:       ['🍕','🍔','🌮','🌯','🥙','🧆','🥚','🍳','🥘','🍲','🥣','🥗','🍿','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍼','🥛','☕','🫖','🍵','🧃','🥤','🧋'],
  activities: ['⚽','🏀','🏈','⚾','🥎','🏐','🏉','🥏','🎾','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🎣','🤿','🎽','🎿','🛷','🥌','🎯','🪀','🪆','🎱','🔮','🎮','🕹️','🎲','♟️','🎭','🎨','🖼️','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🪗','🎸','🪕','🎻'],
  travel:     ['✈️','🚀','🛸','🚁','🛶','⛵','🚤','🛥️','🛳️','⛴️','🚢','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🛻','🚚','🚛','🚜','🏎️','🏍️','🛵','🦽','🦼','🛺','🚲','🛴','🛹','🛼'],
  objects:    ['💡','🔦','🕯️','🪔','💰','💴','💵','💶','💷','💸','💳','🪙','💹','📈','📉','📊','📋','📌','📍','📎','🖇️','📏','📐','✂️','🗃️','🗄️','🗑️','🔒','🔓','🔏','🔐','🔑','🗝️','🔨','🪓','⛏️','⚒️','🛠️','🗡️','⚔️','🛡️','🪚','🔧','🪛','🔩','⚙️','🗜️','🔗','⛓️'],
  symbols:    ['🔥','💥','✨','🌟','⭐','🌈','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','💧','💦','🌊','🌀','🌁','🌈','🎆','🎇','🧨','✨','🎉','🎊','🎈','🎋','🎍','🎎','🎏','🎐','🧧','🎀','🎁','🎗️','🎟️','🎫'],
};

const STICKERS = {
  gaming:   ['🎮','🕹️','👾','🏆','🥇','🎯','⚔️','🛡️','🔫','💣','🧨','🃏','🎲','🧩','🎰','🏅','🎖️','🏴‍☠️','💀','🦾'],
  emotions: ['😭','😤','🥹','😍','🥲','😂','🤣','😱','🤯','🥳','😎','🤔','😴','🤡','👻','💯','🙏','🫶','💪','🤝'],
  animals:  ['🐶','🐱','🐸','🐺','🦊','🐼','🐨','🦁','🐯','🐻','🦄','🐙','🐬','🦋','🦎','🐢','🐧','🐳'],
  food:     ['🍕','🍔','🌮','🍜','🍣','🍩','🎂','🍺','🧋','☕','🍦','🍭','🥗','🍗','🥐','🧁','🍰','🥤','🍿','🥓'],
};

const GIFTS = [
  { emoji: '🌹', name: 'Rose',       price: 'Free'    },
  { emoji: '💎', name: 'Diamond',    price: '⭐ 500'  },
  { emoji: '🎁', name: 'Gift Box',   price: '⭐ 100'  },
  { emoji: '🏆', name: 'Trophy',     price: '⭐ 300'  },
  { emoji: '👑', name: 'Crown',      price: '⭐ 1000' },
  { emoji: '🎵', name: 'Music',      price: 'Free'    },
  { emoji: '🧸', name: 'Teddy',      price: '⭐ 50'   },
  { emoji: '🍰', name: 'Cake',       price: 'Free'    },
  { emoji: '🚀', name: 'Rocket',     price: '⭐ 200'  },
  { emoji: '⚡', name: 'Lightning',  price: '⭐ 75'   },
  { emoji: '🌟', name: 'Star',       price: '⭐ 150'  },
  { emoji: '🎮', name: 'Controller', price: '⭐ 80'   },
];

const GIFS = [
  { url: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif', label: 'GG'   },
  { url: 'https://media.giphy.com/media/RrVzUOXldFe8M/giphy.gif',      label: 'Epic' },
  { url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',  label: 'Win'  },
  { url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',  label: 'Hype' },
  { url: 'https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif', label: 'LOL'  },
  { url: 'https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif',     label: 'OMG'  },
  { url: 'https://media.giphy.com/media/GETdOD3wlYD7W/giphy.gif',      label: 'GG'   },
  { url: 'https://media.giphy.com/media/ZqlvCTNHpqrio/giphy.gif',      label: 'GGWP' },
];

// ─── Utility ────────────────────────────────────────────────
function ts()       { return new Date().toTimeString().slice(0, 5); }
function todayStr() { return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
function esc(t)     { return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>'); }
function scrollBot(){ const w = document.getElementById('messages-wrap'); setTimeout(() => w.scrollTop = w.scrollHeight, 30); }

// ─── SVG Icons (function definitions sama persis dengan kode asli) ─────
function svgMsg()     { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`; }
function svgPhone()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.08 10.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.36 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-.51a2 2 0 012.11.45c.907.34 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`; }
function svgVideo()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`; }
function svgProfile() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`; }
function svgRemove()  { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" y1="18" x2="16" y2="18"/></svg>`; }
function svgBlock()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`; }
function svgScreen()  { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`; }
function svgFullscreen(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>`; }
function svgEndCall() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`; }
function svgMicOn()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`; }
function svgMicOff()  { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`; }
function svgCamOn()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`; }
function svgCamOff()  { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 001.73-1"/><polygon points="16 11 23 7 23 17"/></svg>`; }
function svgSpeaker() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>`; }
function svgPhoneSmall()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.08 10.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.36 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-.51a2 2 0 012.11.45c.907.34 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`; }
function svgEndCallSmall() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`; }

// ─── Toast ───────────────────────────────────────────────────
function toast(msg, type = '') {
  const wrap = document.getElementById('toast-wrap');
  const t = document.createElement('div');
  t.className = 'toast' + (type === 'green' ? ' toast-green' : type === 'red' ? ' toast-red' : '');
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 2500);
}

// ─── Tab Switching ───────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-friends').className  = 'stab' + (tab === 'friends'  ? ' active' : '');
  document.getElementById('tab-requests').className = 'stab' + (tab === 'requests' ? ' active' : '');
  renderList();
}

function renderList() {
  const list  = document.getElementById('contacts-list');
  const label = document.getElementById('section-label');
  list.innerHTML = '';

  if (currentTab === 'friends') {
    const online = contacts.filter(c => c.statusDot !== 'offline');
    label.innerHTML = `Online — <span id="online-count">${online.length}</span>`;
    contacts.forEach(c => {
      const el = document.createElement('div');
      el.className = 'contact-item' + (active?.id === c.id ? ' active' : '');
      el.innerHTML = `
        <div class="avatar ${c.cls}">${c.initials}<span class="dot-status dot-${c.statusDot}"></span></div>
        <div class="contact-info">
          <div class="contact-name">${c.name}</div>
          <div class="contact-status">${c.status}</div>
        </div>
        ${c.unread > 0 ? `<div class="unread-badge">${c.unread}</div>` : ''}`;
      el.onclick = () => openChat(c);
      el.oncontextmenu = (e) => { e.preventDefault(); showCtxMenu(e, c); };
      list.appendChild(el);
    });
  } else {
    label.textContent = `Pending — ${friendRequests.length}`;
    if (friendRequests.length === 0) {
      list.innerHTML = `<div style="text-align:center;color:var(--muted);font-size:.82rem;padding:20px">No pending requests</div>`;
      return;
    }
    friendRequests.forEach(fr => {
      const el = document.createElement('div');
      el.className = 'req-item';
      el.innerHTML = `
        <div class="req-top">
          <div class="avatar ${fr.cls}" style="width:38px;height:38px">${fr.initials}</div>
          <div class="req-info"><div class="req-name">${fr.name}</div><div class="req-sub">${fr.status}</div></div>
        </div>
        <div class="req-actions">
          <button class="req-btn req-accept"  onclick="acceptRequest('${fr.id}')">Accept</button>
          <button class="req-btn req-decline" onclick="declineRequest('${fr.id}')">Decline</button>
        </div>`;
      list.appendChild(el);
    });
    document.getElementById('req-badge').textContent = friendRequests.length;
  }
}

// ─── Friend Requests ─────────────────────────────────────────
function acceptRequest(id) {
  const fr = friendRequests.find(r => r.id === id);
  if (!fr) return;
  friendRequests = friendRequests.filter(r => r.id !== id);
  contacts.push({
    ...fr,
    statusDot: 'online', isFriend: true, isBlocked: false, unread: 1,
    messages: [{
      id: 'm' + Date.now(), role: 'assistant',
      content: "hey! glad we're friends now 😄 what games do you play?",
      date: todayStr(), ts: ts(), grouped: false
    }],
    prompt: `You're '${fr.name}', a gamer on HTS. Reply casually and friendly, 1-3 sentences.`
  });
  const badge = document.getElementById('req-badge');
  badge.textContent = friendRequests.length || '';
  if (friendRequests.length === 0) badge.style.display = 'none';
  toast(`You are now friends with ${fr.name}! 🎉`, 'green');
  renderList();
}

function declineRequest(id) {
  const fr = friendRequests.find(r => r.id === id);
  friendRequests = friendRequests.filter(r => r.id !== id);
  document.getElementById('req-badge').textContent = friendRequests.length || '';
  toast(`Declined ${fr?.name}'s request`);
  renderList();
}

// ─── Context Menu ────────────────────────────────────────────
function showCtxMenu(e, c) {
  removeCtxMenu();
  const menu = document.createElement('div');
  menu.className = 'ctx-menu'; menu.id = 'ctx-menu';
  menu.style.left = e.clientX + 'px'; menu.style.top = e.clientY + 'px';
  const items = [
    { icon: svgMsg(),     label: 'Message',     action: () => openChat(c) },
    { icon: svgPhone(),   label: 'Voice Call',  action: () => { openChat(c); setTimeout(() => startCall('audio'), 100); } },
    { icon: svgVideo(),   label: 'Video Call',  action: () => { openChat(c); setTimeout(() => startCall('video'), 100); } },
    { sep: true },
    { icon: svgProfile(), label: 'View Profile', action: () => { openChat(c); setTimeout(() => openViewProfile(), 100); } },
    { sep: true },
    { icon: svgRemove(),  label: 'Remove Friend', action: () => removeFriend(c), danger: true },
    { icon: svgBlock(),   label: c.isBlocked ? 'Unblock' : 'Block', action: () => toggleBlock(c), danger: true },
  ];
  items.forEach(item => {
    if (item.sep) { const s = document.createElement('div'); s.className = 'ctx-sep'; menu.appendChild(s); return; }
    const el = document.createElement('div');
    el.className = 'ctx-item' + (item.danger ? ' danger' : '');
    el.innerHTML = item.icon + `<span>${item.label}</span>`;
    el.onclick = () => { item.action(); removeCtxMenu(); };
    menu.appendChild(el);
  });
  document.body.appendChild(menu);
  const rect = menu.getBoundingClientRect();
  if (rect.right  > window.innerWidth)  menu.style.left = (e.clientX - rect.width)  + 'px';
  if (rect.bottom > window.innerHeight) menu.style.top  = (e.clientY - rect.height) + 'px';
  setTimeout(() => document.addEventListener('click', removeCtxMenu, { once: true }), 10);
}
function removeCtxMenu() { document.getElementById('ctx-menu')?.remove(); }

// ─── Remove / Block ──────────────────────────────────────────
function removeFriend(c) {
  if (!c) c = active;
  if (!c) return;
  showConfirm(
    `Remove ${c.name}?`,
    `Are you sure you want to remove <strong>${c.name}</strong> from your friends list?`,
    'Remove Friend', 'accent2',
    () => {
      contacts = contacts.filter(x => x.id !== c.id);
      if (active?.id === c.id) {
        active = null;
        document.getElementById('chat-topbar').style.display   = 'none';
        document.getElementById('input-bar').style.display     = 'none';
        document.getElementById('profile-panel').style.display = 'none';
        profileOpen = false;
        document.getElementById('messages-wrap').innerHTML =
          `<div class="empty-state"><div class="icon">💬</div><p>Select a friend to start chatting</p></div>`;
      }
      toast(`${c.name} removed from friends`, 'red');
      renderList();
    }
  );
}

function showConfirm(title, body, confirmLabel, confirmColor, onConfirm) {
  document.getElementById('confirm-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay'; overlay.id = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:360px">
      <div class="modal-title">${title}</div>
      <div class="modal-sub" style="margin-bottom:0">${body}</div>
      <div class="modal-actions" style="margin-top:20px">
        <button class="modal-btn modal-cancel" id="confirm-cancel">Cancel</button>
        <button class="modal-btn" id="confirm-ok" style="background:var(--${confirmColor});color:#fff">${confirmLabel}</button>
      </div>
    </div>`;
  overlay.querySelector('#confirm-cancel').onclick = () => overlay.remove();
  overlay.querySelector('#confirm-ok').onclick     = () => { overlay.remove(); onConfirm(); };
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

function toggleBlock(c) {
  c.isBlocked = !c.isBlocked;
  toast(c.isBlocked ? `${c.name} has been blocked` : `${c.name} has been unblocked`);
  renderList();
  if (active?.id === c.id) renderProfileActions(c);
}

// ─── Open Chat ───────────────────────────────────────────────
function openChat(c) {
  active = c; c.unread = 0;
  renderList();
  document.getElementById('chat-topbar').style.display = 'flex';
  document.getElementById('input-bar').style.display   = 'flex';
  if (profileOpen) showProfile(c);
  document.getElementById('topbar-name').textContent   = c.name;
  document.getElementById('search-ph').textContent     = `Search @${c.handle}`;
  document.getElementById('msg-input').placeholder     = `Message @${c.handle}`;
  document.getElementById('typing-lbl').textContent    = c.name;
  renderMessages(c);
  document.getElementById('msg-input').focus();
}

// ─── Profile Panel ───────────────────────────────────────────
function showProfile(c) {
  document.getElementById('profile-panel').style.display = 'flex';
  profileOpen = true;
  document.getElementById('p-name').textContent    = c.name;
  document.getElementById('p-handle').textContent  = '@' + c.handle;
  document.getElementById('p-bio').textContent     = c.bio;
  document.getElementById('p-since').textContent   = c.since;
  document.getElementById('p-servers').textContent = c.groups || 0;
  document.getElementById('p-friends').textContent = c.friends;
  document.getElementById('p-banner').style.background = c.banner;
  const pav = document.getElementById('p-av');
  pav.className = `p-av ${c.cls}`;
  pav.innerHTML = c.initials + '<span class="p-online-dot"></span>';
  renderProfileActions(c);
}

function renderProfileActions(c) {
  const el = document.getElementById('p-actions');
  el.innerHTML = '';
  const callBtn = document.createElement('button');
  callBtn.className = 'p-action-btn p-action-call';
  callBtn.innerHTML = svgPhone() + '<span>Voice Call</span>';
  callBtn.onclick   = () => startCall('audio');
  el.appendChild(callBtn);
  const videoBtn = document.createElement('button');
  videoBtn.className = 'p-action-btn p-action-video';
  videoBtn.innerHTML = svgVideo() + '<span>Video Call</span>';
  videoBtn.onclick   = () => startCall('video');
  el.appendChild(videoBtn);
  if (c.isFriend) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'p-action-btn p-action-remove';
    removeBtn.innerHTML = svgRemove() + '<span>Remove Friend</span>';
    removeBtn.onclick   = () => removeFriend(c);
    el.appendChild(removeBtn);
  } else {
    const addBtn = document.createElement('button');
    addBtn.className = 'p-action-btn p-action-add';
    addBtn.innerHTML = '<span>Add Friend</span>';
    addBtn.onclick   = () => toast('Friend request sent! 🎉', 'green');
    el.appendChild(addBtn);
  }
  const blockBtn = document.createElement('button');
  blockBtn.className = 'p-action-btn p-action-block';
  blockBtn.innerHTML = svgBlock() + '<span>' + (c.isBlocked ? 'Unblock' : 'Block') + '</span>';
  blockBtn.onclick   = () => toggleBlock(c);
  el.appendChild(blockBtn);
}

document.getElementById('toggle-profile-btn').addEventListener('click', () => {
  profileOpen = !profileOpen;
  document.getElementById('profile-panel').style.display = profileOpen ? 'flex' : 'none';
  if (profileOpen && active) showProfile(active);
});

// ─── View Full Profile Modal ─────────────────────────────────
function openViewProfile() {
  const c = active;
  if (!c) return;

  const overlay = document.getElementById('vp-overlay');
  overlay.style.display = 'flex';

  // Banner + avatar
  document.getElementById('vp-banner').style.background = c.banner;
  const vpAv = document.getElementById('vp-av');
  vpAv.className = `vp-av ${c.cls}`;
  vpAv.textContent = c.initials;

  // Status dot
  const dot = document.getElementById('vp-online-dot');
  dot.style.background = c.statusDot === 'online' ? 'var(--green)' : c.statusDot === 'away' ? 'var(--yellow)' : 'var(--muted)';

  // Name / handle
  document.getElementById('vp-name').textContent       = c.name;
  document.getElementById('vp-handle-txt').textContent = '@' + c.handle;

  // Status pill
  const pill = document.getElementById('vp-status-pill');
  if (c.statusDot === 'online') {
    pill.textContent = '🟢 Online'; pill.className = 'vp-status-pill';
  } else if (c.statusDot === 'away') {
    pill.textContent = '🟡 Away';   pill.className = 'vp-status-pill away';
  } else {
    pill.textContent = '⚫ Offline'; pill.className = 'vp-status-pill offline';
  }

  // Bio / stats
  document.getElementById('vp-bio').textContent        = c.bio || '—';
  document.getElementById('vp-groups-num').textContent = c.groups || 0;
  document.getElementById('vp-friends-num').textContent = c.friends || 0;
  document.getElementById('vp-since-num').textContent  = c.since ? c.since.split(' ').slice(-1)[0] : '—';
  document.getElementById('vp-activity').textContent   = c.status || '—';

  // Mutual groups list
  const groupsList = document.getElementById('vp-groups-list');
  const groups     = c.mutualGroups || [];
  if (groups.length === 0) {
    groupsList.innerHTML = '<div style="font-size:.82rem;color:var(--muted)">No mutual groups</div>';
  } else {
    groupsList.innerHTML = groups.map(g => `
      <div class="vp-group-item">
        <div class="vp-group-icon">${g.icon}</div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:.84rem">${g.name}</div>
          <div style="font-size:.72rem;color:var(--muted)">${g.members} members</div>
        </div>
      </div>`).join('');
  }

  // Action buttons
  const btnRow = document.getElementById('vp-btn-row');
  btnRow.innerHTML = '';
  const msgBtn = document.createElement('button');
  msgBtn.className = 'vp-btn vp-btn-msg';
  msgBtn.innerHTML = svgMsg() + '<span>Message</span>';
  msgBtn.onclick   = () => { closeViewProfile(); };
  btnRow.appendChild(msgBtn);
  const callBtn2 = document.createElement('button');
  callBtn2.className = 'vp-btn vp-btn-call';
  callBtn2.innerHTML = svgPhone() + '<span>Call</span>';
  callBtn2.onclick   = () => { closeViewProfile(); startCall('audio'); };
  btnRow.appendChild(callBtn2);
  if (c.isFriend) {
    const removeBtn2 = document.createElement('button');
    removeBtn2.className = 'vp-btn vp-btn-remove';
    removeBtn2.innerHTML = svgRemove() + '<span>Remove</span>';
    removeBtn2.onclick   = () => { closeViewProfile(); removeFriend(c); };
    btnRow.appendChild(removeBtn2);
  }
}

function closeViewProfile(event) {
  if (event && event.target !== document.getElementById('vp-overlay')) return;
  document.getElementById('vp-overlay').style.display = 'none';
}

// ─── Messages ────────────────────────────────────────────────
function renderMessages(c) {
  const wrap = document.getElementById('messages-wrap');
  wrap.innerHTML = '';
  const byDate = {};
  c.messages.forEach(m => { const d = m.date || todayStr(); (byDate[d] = byDate[d] || []).push(m); });
  Object.entries(byDate).forEach(([date, msgs]) => {
    addSep(date, wrap);
    msgs.forEach(m => addMsg(m, wrap, false));
  });
  scrollBot();
}

function addSep(label, container) {
  const el = document.createElement('div');
  el.className = 'date-sep';
  el.innerHTML = `<span>${label}</span>`;
  container.appendChild(el);
}

function addMsg(msg, container, animate) {
  const isMe  = msg.role === 'user';
  const c     = active;
  const group = document.createElement('div');
  group.className = `msg-group${msg.grouped ? ' group-cont' : ' group-start'}${isMe ? ' from-me' : ''}`;
  const avHtml   = isMe
    ? `<div class="msg-av ${ME.cls}">${ME.initials}</div>`
    : `<div class="msg-av ${c.cls}">${c.initials}</div>`;
  const nameHtml = !msg.grouped
    ? `<div class="msg-header"><span class="msg-uname">${isMe ? ME.name : c.name}</span><span class="msg-ts">Today at ${msg.ts}</span></div>`
    : '';
  const hovTs = msg.grouped ? `<span class="hover-ts">${msg.ts}</span>` : '';
  if (isMe) {
    group.innerHTML = `<div class="msg-row"><div class="msg-av-col">${msg.grouped ? hovTs : avHtml}</div><div class="msg-content">${nameHtml}<div class="msg-bubble-me" id="bub-${msg.id}">${esc(msg.content)}</div></div></div>`;
  } else {
    group.innerHTML = `<div class="msg-row"><div class="msg-av-col">${msg.grouped ? hovTs : avHtml}</div><div class="msg-content">${nameHtml}<div class="msg-text" id="bub-${msg.id}">${esc(msg.content)}</div></div></div>`;
  }
  container.appendChild(group);
  if (animate) scrollBot();
  return group;
}

/**
 * Send message to Ollama local API
 * ============================================================
 * UPDATED: Using Ollama API instead of Anthropic
 * Endpoint: http://localhost:11434/api/chat
 * Format: OpenAI-compatible messages array
 * ============================================================
 */
async function send() {
  if (!active || streaming) return;

  // Flush pending images first
  if (pendingImages.length > 0) {
    const imgs = [...pendingImages];
    pendingImages = [];
    renderImagePreviews();
    imgs.forEach(img => sendImageMessage(img.dataUrl));
  }

  const input = document.getElementById('msg-input');
  const text  = input.value.trim();
  if (!text) return;

  input.value = '';
  streaming   = true;
  document.getElementById('send-btn').disabled = true;

  const wrap  = document.getElementById('messages-wrap');
  const today = todayStr();
  const seps  = [...wrap.querySelectorAll('.date-sep span')];
  if (!seps.some(s => s.textContent === today)) addSep(today, wrap);

  const lastMsg = active.messages[active.messages.length - 1];
  const grouped = lastMsg && lastMsg.role === 'user' && lastMsg.date === today;
  const userMsg = { id: 'u' + Date.now(), role: 'user', content: text, date: today, ts: ts(), grouped };
  active.messages.push(userMsg);
  addMsg(userMsg, wrap, true);

  document.getElementById('typing-bar').style.visibility = 'visible';
  scrollBot();

  // Prepare messages for Ollama API (OpenAI-compatible format)
  const apiMessages = [
    { role: 'system', content: active.prompt },
    ...active.messages.slice(-10).map(m => ({ 
      role: m.role === 'user' ? 'user' : 'assistant', 
      content: m.content || (m.sticker ? m.sticker : '') 
    }))
  ];

  try {
    // ── Using Ollama local API ──
    // No API key required, runs on localhost:11434
    const response = await fetch(`${OLLAMA_CONFIG.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OLLAMA_CONFIG.model,
        messages: apiMessages,
        stream: true,
        options: OLLAMA_CONFIG.options
      })
    });

    document.getElementById('typing-bar').style.visibility = 'hidden';

    if (!response.ok) {
      const errText = await response.text().catch(() => response.status);
      throw new Error(`Ollama HTTP ${response.status}: ${errText}`);
    }

    const lastAi    = active.messages[active.messages.length - 1];
    const aiGrouped = lastAi && lastAi.role === 'assistant' && lastAi.date === today;
    const aiMsg     = { id: 'a' + Date.now(), role: 'assistant', content: '', date: today, ts: ts(), grouped: aiGrouped };
    active.messages.push(aiMsg);

    const c     = active;
    const group = document.createElement('div');
    group.className = `msg-group${aiGrouped ? ' group-cont' : ' group-start'}`;
    const avHtml   = `<div class="msg-av ${c.cls}">${c.initials}</div>`;
    const hovTs    = aiGrouped ? `<span class="hover-ts">${aiMsg.ts}</span>` : '';
    const nameHtml = !aiGrouped
      ? `<div class="msg-header"><span class="msg-uname">${c.name}</span><span class="msg-ts">Today at ${aiMsg.ts}</span></div>`
      : '';
    group.innerHTML = `<div class="msg-row"><div class="msg-av-col">${aiGrouped ? hovTs : avHtml}</div><div class="msg-content">${nameHtml}<div class="msg-text" id="bub-${aiMsg.id}"><span class="cursor-blink"></span></div></div></div>`;
    wrap.appendChild(group);
    scrollBot();

    const bubble = document.getElementById(`bub-${aiMsg.id}`);
    const reader = response.body.getReader();
    const dec    = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += dec.decode(value, { stream: true });
      
      // Ollama streaming format: each line is a JSON object
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          const json = JSON.parse(line);
          
          // Ollama streaming response format [citation:10]
          if (json.message?.content) {
            aiMsg.content += json.message.content;
            bubble.innerHTML = esc(aiMsg.content) + '<span class="cursor-blink"></span>';
            scrollBot();
          }
          
          if (json.done) break;
        } catch (e) {
          console.warn('Failed to parse Ollama response line:', line, e);
        }
      }
    }
    
    // Remove cursor and finalize
    bubble.innerHTML = esc(aiMsg.content);

  } catch (err) {
    document.getElementById('typing-bar').style.visibility = 'hidden';
    console.error('[HTS Chat] Ollama API error:', err);
    
    // Check if Ollama is running
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      toast('⚠️ Ollama server is not running. Make sure Ollama is installed and running.', 'red');
    } else {
      toast(`Error: ${err.message}`, 'red');
    }
    
    // Show friendly fallback message from the "contact"
    const fallbacks = [
      "yo my wifi is cooked rn 😭 brb",
      "lmaooo literally dc'd, one sec",
      "oof something went wrong on my end, retry?",
      "bruh my internet is throwing up 💀",
    ];
    const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    const errMsg = {
      id: 'e' + Date.now(), role: 'assistant',
      content: fallback,
      date: today, ts: ts(), grouped: false
    };
    active.messages.push(errMsg);
    addMsg(errMsg, wrap, true);
  }

  streaming = false;
  document.getElementById('send-btn').disabled = false;
  input.focus();
}

document.getElementById('send-btn').addEventListener('click', send);
document.getElementById('msg-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
});

// ─── Calls ───────────────────────────────────────────────────
function startCall(type) {
  if (!active) return;
  type === 'video' ? showVideoCall() : showVoiceCall();
}

function showVideoCall() {
  removeAllOverlays();
  const c = active;
  const overlay = document.createElement('div');
  overlay.className = 'vcall-overlay'; overlay.id = 'vcall-overlay';
  callSeconds = 0;
  overlay.innerHTML = `
    <div class="vcall-box">
      <div class="vcall-header">
        <div class="vcall-title">📹 Video Call — ${c.name}</div>
        <div class="vcall-dur" id="vc-dur">00:00</div>
      </div>
      <div class="vcall-body">
        <div class="vcall-main">
          <div class="vcall-remote-wrap">
            <div class="vcall-remote-av ${c.cls}">${c.initials}</div>
            <div class="vcall-remote-name">${c.name}</div>
          </div>
        </div>
        <div class="vcall-self">
          <div class="vcall-self-av ${ME.cls}">${ME.initials}</div>
          <div class="vcall-self-name">You</div>
          <div class="vcall-self-badge">Live</div>
        </div>
      </div>
      <div class="vcall-footer">
        <button class="vc-btn vc-btn-default" id="vc-mic" onclick="vcToggle('mic')">${svgMicOn()}<span class="tooltip">Mute</span></button>
        <button class="vc-btn vc-btn-default" id="vc-cam" onclick="vcToggle('cam')">${svgCamOn()}<span class="tooltip">Camera</span></button>
        <button class="vc-btn vc-btn-default" id="vc-screen" onclick="vcToggle('screen')">${svgScreen()}<span class="tooltip">Share Screen</span></button>
        <button class="vc-btn vc-btn-default" onclick="vcToggle('fullscreen')">${svgFullscreen()}<span class="tooltip">Fullscreen</span></button>
        <button class="vc-btn vc-btn-end" onclick="endCall()">${svgEndCall()}<span class="tooltip">End Call</span></button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  startCallTimer('vc-dur');
}

function showVoiceCall() {
  removeAllOverlays();
  const c = active;
  const overlay = document.createElement('div');
  overlay.className = 'acall-overlay'; overlay.id = 'acall-overlay';
  callSeconds = 0;
  overlay.innerHTML = `
    <div class="acall-box">
      <div class="acall-av ${c.cls}">${c.initials}</div>
      <div class="acall-name">${c.name}</div>
      <div class="acall-status" id="ac-status">Calling...</div>
      <div class="acall-btns">
        <button class="vc-btn vc-btn-default" id="ac-mic" onclick="vcToggle('mic',true)">${svgMicOn()}<span class="tooltip">Mute</span></button>
        <button class="vc-btn vc-btn-default" onclick="vcToggle('speaker')">${svgSpeaker()}<span class="tooltip">Speaker</span></button>
        <button class="vc-btn vc-btn-end" onclick="endCall()">${svgEndCall()}<span class="tooltip">End</span></button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => {
    const st = document.getElementById('ac-status');
    if (st) { st.textContent = '00:00'; startCallTimer('ac-status'); }
    showIncomingCall();
  }, 2000);
}

function vcToggle(type, isAudio = false) {
  const mic = document.getElementById(isAudio ? 'ac-mic' : 'vc-mic');
  const cam = document.getElementById('vc-cam');
  const scr = document.getElementById('vc-screen');
  if (type === 'mic' && mic) {
    const muted = mic.classList.toggle('vc-btn-active');
    mic.innerHTML = (muted ? svgMicOff() : svgMicOn()) + `<span class="tooltip">${muted ? 'Unmute' : 'Mute'}</span>`;
    toast(muted ? 'Microphone muted' : 'Microphone on');
  } else if (type === 'cam' && cam) {
    const off = cam.classList.toggle('vc-btn-active');
    cam.innerHTML = (off ? svgCamOff() : svgCamOn()) + `<span class="tooltip">${off ? 'Camera off' : 'Camera on'}</span>`;
    toast(off ? 'Camera off' : 'Camera on');
  } else if (type === 'screen' && scr) {
    const on = scr.classList.toggle('vc-btn-green');
    toast(on ? 'Screen sharing started' : 'Screen sharing stopped');
  } else if (type === 'fullscreen') {
    const box = document.querySelector('.vcall-box');
    if (box) box.style.width = box.style.width === '100vw' ? '840px' : '100vw';
  } else if (type === 'speaker') {
    toast('Speaker toggled');
  }
}

function startCallTimer(elId) {
  clearInterval(callInterval);
  callInterval = setInterval(() => {
    callSeconds++;
    const m  = String(Math.floor(callSeconds / 60)).padStart(2, '0');
    const s  = String(callSeconds % 60).padStart(2, '0');
    const el = document.getElementById(elId);
    if (el) el.textContent = `${m}:${s}`;
    else    clearInterval(callInterval);
  }, 1000);
}

function endCall() { clearInterval(callInterval); removeAllOverlays(); toast('Call ended'); }
function removeAllOverlays() {
  document.getElementById('vcall-overlay')?.remove();
  document.getElementById('acall-overlay')?.remove();
  document.getElementById('incall-banner')?.remove();
}

function showIncomingCall() {
  if (incomingShown) return;
  incomingShown = true;
  setTimeout(() => {
    if (document.getElementById('vcall-overlay') || document.getElementById('acall-overlay')) return;
    const banner = document.createElement('div');
    banner.className = 'incall-banner'; banner.id = 'incall-banner';
    const caller = contacts[0];
    banner.innerHTML = `
      <div class="avatar ${caller.cls}" style="width:36px;height:36px;font-size:.75rem">${caller.initials}</div>
      <div class="incall-info">
        <div class="incall-title">Incoming call</div>
        <div class="incall-sub">${caller.name} is calling you...</div>
      </div>
      <div class="incall-btns">
        <button class="incall-btn incall-accept" onclick="acceptIncoming('${caller.id}')">${svgPhoneSmall()}</button>
        <button class="incall-btn incall-decline" onclick="document.getElementById('incall-banner')?.remove();toast('Call declined')">${svgEndCallSmall()}</button>
      </div>`;
    document.body.appendChild(banner);
    setTimeout(() => banner?.remove(), 12000);
  }, 8000);
}

function acceptIncoming(id) {
  document.getElementById('incall-banner')?.remove();
  const c = contacts.find(x => x.id === id) || active;
  if (c) { active = c; openChat(c); startCall('audio'); }
}

// ─── Add Friend Modal ────────────────────────────────────────
function openAddFriend() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay'; overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-title">Add Friend</div>
      <div class="modal-sub">Send a friend request by entering their username or handle.</div>
      <input class="modal-input" id="modal-input" placeholder="Enter username (e.g. nightraider99)" autofocus>
      <div class="modal-result" id="modal-result"></div>
      <div class="modal-actions">
        <button class="modal-btn modal-cancel" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-submit" onclick="submitFriendReq()">Send Request</button>
      </div>
    </div>`;
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById('modal-input')?.focus(), 100);
  document.getElementById('modal-input').addEventListener('keydown', e => { if (e.key === 'Enter') submitFriendReq(); });
}

function closeModal() { document.getElementById('modal-overlay')?.remove(); }

function submitFriendReq() {
  const val = (document.getElementById('modal-input')?.value || '').trim();
  const res = document.getElementById('modal-result');
  if (!val) { res.className = 'modal-result error'; res.textContent = 'Please enter a username.'; return; }
  const exists = contacts.find(c => c.handle.toLowerCase() === val.toLowerCase() || c.name.toLowerCase() === val.toLowerCase());
  if (exists) { res.className = 'modal-result error'; res.textContent = `You're already friends with ${exists.name}!`; return; }
  res.className = 'modal-result success';
  res.textContent = `Friend request sent to @${val}! 🎉`;
  setTimeout(() => closeModal(), 1800);
}

// ─── Emoji Picker ────────────────────────────────────────────
function renderEmojiGrid(filter = '') {
  const grid     = document.getElementById('ep-grid');
  const emojis   = EMOJIS[currentEpCat] || [];
  const filtered = filter ? Object.values(EMOJIS).flat().filter(e => e.includes(filter)) : emojis;
  grid.innerHTML  = filtered.map(e => `<div class="ep-emoji" onclick="insertEmoji('${e}')">${e}</div>`).join('');
}
function switchEpCat(tab, cat) {
  document.querySelectorAll('.ep-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active'); currentEpCat = cat;
  document.getElementById('ep-search').value = '';
  renderEmojiGrid();
}
function insertEmoji(e) {
  const input = document.getElementById('msg-input');
  const pos   = input.selectionStart;
  input.value = input.value.slice(0, pos) + e + input.value.slice(pos);
  input.focus(); input.setSelectionRange(pos + e.length, pos + e.length);
}
document.getElementById('ep-search').addEventListener('input', function () { renderEmojiGrid(this.value); });

// ─── Sticker Picker ──────────────────────────────────────────
function renderStickerGrid() {
  const grid = document.getElementById('sticker-grid');
  const stickers = STICKERS[currentStickerPack] || [];
  grid.innerHTML = stickers.map(s => `<div class="sticker-item" onclick="sendSticker('${s}')">${s}</div>`).join('');
}
function switchStickerPack(tab, pack) {
  document.querySelectorAll('.sticker-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active'); currentStickerPack = pack; renderStickerGrid();
}
function sendSticker(sticker) {
  if (!active) return; closeAllPickers();
  const wrap  = document.getElementById('messages-wrap'), today = todayStr();
  const seps  = [...wrap.querySelectorAll('.date-sep span')];
  if (!seps.some(s => s.textContent === today)) addSep(today, wrap);
  const lastMsg = active.messages[active.messages.length - 1];
  const grouped = lastMsg && lastMsg.role === 'user' && lastMsg.date === today;
  const msg = { id: 'u' + Date.now(), role: 'user', content: '', sticker, date: today, ts: ts(), grouped };
  active.messages.push(msg);
  const group = document.createElement('div');
  group.className = `msg-group${grouped ? ' group-cont' : ' group-start'} from-me`;
  const avHtml   = `<div class="msg-av ${ME.cls}">${ME.initials}</div>`;
  const hovTs    = grouped ? `<span class="hover-ts">${msg.ts}</span>` : '';
  const nameHtml = !grouped ? `<div class="msg-header"><span class="msg-uname">${ME.name}</span><span class="msg-ts">Today at ${msg.ts}</span></div>` : '';
  group.innerHTML = `<div class="msg-row"><div class="msg-av-col">${grouped ? hovTs : avHtml}</div><div class="msg-content">${nameHtml}<span class="msg-sticker">${sticker}</span></div></div>`;
  wrap.appendChild(group); scrollBot();
}

// ─── GIF Picker ──────────────────────────────────────────────
function renderGifGrid(filter = '') {
  const grid  = document.getElementById('gif-grid');
  const items = filter ? GIFS.filter(g => g.label.toLowerCase().includes(filter.toLowerCase())) : GIFS;
  grid.innerHTML = items.map(g => `
    <div class="gif-item" onclick="sendGif('${g.url}','${g.label}')">
      <img src="${g.url}" alt="${g.label}" loading="lazy" onerror="this.parentElement.innerHTML='<span style=font-size:2rem>🎬</span>'">
      <span class="gif-label">${g.label}</span>
    </div>`).join('');
}
function filterGifs(val) { renderGifGrid(val); }
function sendGif(url, label) { if (!active) return; closeAllPickers(); sendImageMessage(url, label + ' (GIF)'); }

// ─── Gift Picker ─────────────────────────────────────────────
function renderGiftGrid() {
  const grid = document.getElementById('gift-grid');
  grid.innerHTML = GIFTS.map(g => `
    <div class="gift-item" onclick="sendGift('${g.emoji}','${g.name}')">
      <span class="g-emoji">${g.emoji}</span>
      <div class="g-name">${g.name}</div>
      <div class="g-price">${g.price}</div>
    </div>`).join('');
}

function sendGift(emoji, name) {
  closeAllPickers(); if (!active) return;
  const wrap  = document.getElementById('messages-wrap'), today = todayStr();
  const seps  = [...wrap.querySelectorAll('.date-sep span')];
  if (!seps.some(s => s.textContent === today)) addSep(today, wrap);
  const content = `${emoji} Sent a gift: **${name}**`;
  const msg = { id: 'u' + Date.now(), role: 'user', content, date: today, ts: ts(), grouped: false };
  active.messages.push(msg);
  const group = document.createElement('div');
  group.className = 'msg-group group-start from-me';
  const avHtml   = `<div class="msg-av ${ME.cls}">${ME.initials}</div>`;
  const nameHtml = `<div class="msg-header"><span class="msg-uname">${ME.name}</span><span class="msg-ts">Today at ${msg.ts}</span></div>`;
  group.innerHTML = `<div class="msg-row"><div class="msg-av-col">${avHtml}</div><div class="msg-content">${nameHtml}<div class="msg-bubble-me" style="background:linear-gradient(135deg,#f7971e,#ffd200);color:#1a1d2e;font-size:.95rem">${emoji} Sent a gift: <strong>${name}</strong></div></div></div>`;
  wrap.appendChild(group); scrollBot();
  toast(`Gift sent: ${emoji} ${name}`, 'green');
}

// ─── Photo Upload ────────────────────────────────────────────
function openPhotoUpload() { document.getElementById('photo-input').click(); }
document.getElementById('photo-input').addEventListener('change', function () {
  [...this.files].forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => { pendingImages.push({ file, dataUrl: e.target.result }); renderImagePreviews(); };
    reader.readAsDataURL(file);
  });
  this.value = '';
});
function renderImagePreviews() {
  const bar = document.getElementById('img-preview-bar');
  if (pendingImages.length === 0) { bar.style.display = 'none'; bar.innerHTML = ''; return; }
  bar.style.display = 'flex';
  bar.innerHTML = pendingImages.map((img, i) => `
    <div class="img-thumb">
      <img src="${img.dataUrl}" alt="preview">
      <button class="img-thumb-remove" onclick="removePreviewImage(${i})">×</button>
    </div>`).join('');
}
function removePreviewImage(i) { pendingImages.splice(i, 1); renderImagePreviews(); }

function sendImageMessage(src, altText) {
  if (!active) return;
  const wrap  = document.getElementById('messages-wrap'), today = todayStr();
  const seps  = [...wrap.querySelectorAll('.date-sep span')];
  if (!seps.some(s => s.textContent === today)) addSep(today, wrap);
  const lastMsg = active.messages[active.messages.length - 1];
  const grouped = lastMsg && lastMsg.role === 'user' && lastMsg.date === today;
  const msg = { id: 'u' + Date.now(), role: 'user', content: '[Image]', imgSrc: src, date: today, ts: ts(), grouped };
  active.messages.push(msg);
  const group = document.createElement('div');
  group.className = `msg-group${grouped ? ' group-cont' : ' group-start'} from-me`;
  const avHtml   = `<div class="msg-av ${ME.cls}">${ME.initials}</div>`;
  const hovTs    = grouped ? `<span class="hover-ts">${msg.ts}</span>` : '';
  const nameHtml = !grouped ? `<div class="msg-header"><span class="msg-uname">${ME.name}</span><span class="msg-ts">Today at ${msg.ts}</span></div>` : '';
  group.innerHTML = `<div class="msg-row"><div class="msg-av-col">${grouped ? hovTs : avHtml}</div><div class="msg-content">${nameHtml}<img class="msg-img" src="${src}" alt="${altText || 'Image'}" onclick="openLightbox('${src}')"></div></div>`;
  wrap.appendChild(group); scrollBot();
}

// ─── Lightbox ────────────────────────────────────────────────
function openLightbox(src) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `<button class="lightbox-close" onclick="this.parentElement.remove()">✕</button><img src="${src}">`;
  lb.onclick = (e) => { if (e.target === lb) lb.remove(); };
  document.body.appendChild(lb);
}

// ─── Picker Toggle / Close ───────────────────────────────────
function closeAllPickers() {
  ['emoji-picker','gif-picker','sticker-picker','gift-picker'].forEach(id => {
    document.getElementById(id).classList.remove('open');
  });
}
function togglePicker(pickerId) {
  const picker = document.getElementById(pickerId);
  const isOpen = picker.classList.contains('open');
  closeAllPickers();
  if (!isOpen) picker.classList.add('open');
}

document.getElementById('btn-attach').addEventListener('click',  (e) => { e.stopPropagation(); closeAllPickers(); openPhotoUpload(); });
document.getElementById('btn-emoji').addEventListener('click',   (e) => { e.stopPropagation(); togglePicker('emoji-picker');   renderEmojiGrid(); });
document.getElementById('btn-gif').addEventListener('click',     (e) => { e.stopPropagation(); togglePicker('gif-picker');     renderGifGrid();   });
document.getElementById('btn-sticker').addEventListener('click', (e) => { e.stopPropagation(); togglePicker('sticker-picker'); renderStickerGrid(); });
document.getElementById('btn-gift').addEventListener('click',    (e) => { e.stopPropagation(); togglePicker('gift-picker');    renderGiftGrid();  });

document.addEventListener('click', (e) => {
  const pickerIds = ['emoji-picker','gif-picker','sticker-picker','gift-picker'];
  const btnIds    = ['btn-emoji','btn-gif','btn-sticker','btn-gift','btn-attach'];
  const clickedPicker = pickerIds.some(id => document.getElementById(id)?.contains(e.target));
  const clickedBtn    = btnIds.some(id    => document.getElementById(id)?.contains(e.target));
  if (!clickedPicker && !clickedBtn) closeAllPickers();
});

// ─── Sidebar Search ───────────────────────────────────────────
document.getElementById('search-input').addEventListener('input', function () {
  const q = this.value.toLowerCase();
  if (currentTab === 'friends') {
    document.querySelectorAll('.contact-item').forEach((el, i) => {
      el.style.display = contacts[i]?.name.toLowerCase().includes(q) ? '' : 'none';
    });
  }
});

// ─── Init ────────────────────────────────────────────────────
renderList();
setTimeout(showIncomingCall, 15000);

// ─── Make functions available globally ───────────────────────
window.switchTab = switchTab;
window.acceptRequest = acceptRequest;
window.declineRequest = declineRequest;
window.openAddFriend = openAddFriend;
window.closeModal = closeModal;
window.submitFriendReq = submitFriendReq;
window.startCall = startCall;
window.endCall = endCall;
window.vcToggle = vcToggle;
window.acceptIncoming = acceptIncoming;
window.openViewProfile = openViewProfile;
window.closeViewProfile = closeViewProfile;
window.sendSticker = sendSticker;
window.sendGif = sendGif;
window.sendGift = sendGift;
window.insertEmoji = insertEmoji;
window.switchEpCat = switchEpCat;
window.switchStickerPack = switchStickerPack;
window.filterGifs = filterGifs;
window.removePreviewImage = removePreviewImage;
window.openLightbox = openLightbox;