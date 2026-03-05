// ============================================================
//  HTS COMMUNITY — chatcommunity.js
//  All application logic: state, rendering, events
// ============================================================

// ============================================================
//  INITIAL DATA — built dynamically from localStorage
// ============================================================
const ICONS = ["🌟","📚","💡","🔥","🎯","🏆","🚀","🎓","⚡","💻","🎨","🎵"];

// Icon mapping per group name
const GROUP_ICONS = {
  "informatics": "⚡", "information system": "💻",
  "criminal law": "⚖️", "law": "⚖️",
  "civil engineering": "🏗️", "electrical engineering": "🔌",
  "environmental engineering": "🌱", "industrial engineering": "🏭",
  "mechanical engineering": "⚙️",
  "accounting": "📊", "actuarial science": "📈",
  "agribusiness": "🌾", "business administration": "💼",
  "management": "🏢",
  "communication": "📡", "elementary teacher education": "📝",
  "international relations": "🌍",
  "architecture": "🏛️", "interior design": "🎨",
  "visual communication design": "🖌️",
  "medicine": "🩺",
};

const GROUP_DESCS = {
  "informatics": "Programming, algorithms, software engineering",
  "information-system": "Database, networking, enterprise systems",
  "criminal-law": "Criminal law, litigation, and justice studies",
  "civil-engineering": "Structures, construction, and infrastructure",
  "electrical-engineering": "Circuits, power systems, and electronics",
  "environmental-engineering": "Sustainability and environmental solutions",
  "industrial-engineering": "Process optimization and manufacturing",
  "mechanical-engineering": "Mechanics, thermodynamics, and design",
  "accounting": "Financial reporting and auditing",
  "actuarial-science": "Risk analysis and financial mathematics",
  "agribusiness": "Agricultural business management",
  "business-administration": "Enterprise management and strategy",
  "management": "Organizational leadership and strategy",
  "communication": "Media, journalism, and public relations",
  "elementary-teacher-education": "Teaching methods and curriculum",
  "international-relations": "Global politics and diplomacy",
  "architecture": "Building design and urban planning",
  "interior-design": "Space design and aesthetics",
  "visual-communication-design": "Graphic design and branding",
  "medicine": "Medical science and clinical practice",
};

const FACULTY_MEMBER_POOL = {
  "Faculty of Computing": {
    online:  [{ name:"Rizky", av:"R", color:"#4f46e5" }, { name:"Dewi", av:"D", color:"#f59e0b" }, { name:"Eko", av:"E", color:"#10b981" }],
    offline: [{ name:"Budi",  av:"B", color:"#6b7280" }, { name:"Sinta", av:"S", color:"#6b7280" }],
  },
  "Faculty of Law": {
    online:  [{ name:"Ahmad", av:"A", color:"#dc2626" }, { name:"Sari", av:"S", color:"#7c3aed" }],
    offline: [{ name:"Hendra", av:"H", color:"#6b7280" }],
  },
  "Faculty of Engineering": {
    online:  [{ name:"Bimo",  av:"B", color:"#ea580c" }, { name:"Citra", av:"C", color:"#0891b2" }, { name:"Dian", av:"D", color:"#16a34a" }],
    offline: [{ name:"Fandi", av:"F", color:"#6b7280" }],
  },
  "Faculty of Business": {
    online:  [{ name:"Grace", av:"G", color:"#db2777" }, { name:"Hadi", av:"H", color:"#d97706" }],
    offline: [{ name:"Irma",  av:"I", color:"#6b7280" }, { name:"Joko", av:"J", color:"#6b7280" }],
  },
  "Faculty of Social Science and Education": {
    online:  [{ name:"Kevin", av:"K", color:"#7c3aed" }, { name:"Laras", av:"L", color:"#0891b2" }],
    offline: [{ name:"Mira",  av:"M", color:"#6b7280" }],
  },
  "Faculty of Art, Design, and Architecture": {
    online:  [{ name:"Nanda", av:"N", color:"#e11d48" }, { name:"Oscar", av:"O", color:"#7c3aed" }],
    offline: [{ name:"Putri", av:"P", color:"#6b7280" }],
  },
  "Faculty of Medicine": {
    online:  [{ name:"Queen", av:"Q", color:"#059669" }, { name:"Rudi", av:"R", color:"#dc2626" }],
    offline: [{ name:"Salma", av:"S", color:"#6b7280" }],
  },
};

// ---- Helpers ----
function makeKey(str) { return str.toLowerCase().replace(/\s+/g, "-"); }
function getGroupIcon(name) { return GROUP_ICONS[name.toLowerCase()] || "📚"; }
function fakeMemberCount(name) {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return 30 + (h % 170);
}

// ---- Read from localStorage (set by community.js) ----
const _facultyName = localStorage.getItem("facultyName") || "Faculty of Computing";
const _groupNames  = JSON.parse(localStorage.getItem("groups") || '["Information System","Informatics"]');

// ---- Build SERVERS, SERVER_MEMBERS, DEFAULT_GROUPS dynamically ----
const SERVERS = {};
const SERVER_MEMBERS = {};
const DEFAULT_GROUPS = [];

const _pool = FACULTY_MEMBER_POOL[_facultyName] || { online: [], offline: [] };
const ACCENT_COLORS = ["#f59e0b","#10b981","#4f46e5","#dc2626","#7c3aed","#0891b2","#ea580c","#db2777"];

_groupNames.forEach((groupName, idx) => {
  const key = makeKey(groupName);
  const icon = getGroupIcon(groupName);
  const adminColor = ACCENT_COLORS[idx % ACCENT_COLORS.length];

  SERVERS[key] = {
    name: groupName,
    icon,
    categories: {
      "general": { name: "General", channels: {
        "general":       { name: "general",       type: "text", messages: [
          { id:1, user: groupName.split(" ")[0] + "_Admin",
            av: groupName[0].toUpperCase(), color: adminColor,
            content: `Welcome to ${groupName}! 👋`, time:"8:00 AM", sys:false }
        ]},
        "announcements": { name: "announcements", type: "text", messages: [] },
        "assignments":   { name: "assignments",   type: "text", messages: [] },
      }},
      "voice": { name: "Voice Rooms", channels: {
        "study-room": { name: "Study Room", type: "voice", members: [] },
        "chill-room": { name: "Chill Room", type: "voice", members: [] },
      }},
    }
  };

  SERVER_MEMBERS[key] = {
    online:  _pool.online.map(m => ({...m})),
    offline: _pool.offline.map(m => ({...m})),
  };

  DEFAULT_GROUPS.push({
    id:      key,
    name:    groupName,
    icon,
    desc:    GROUP_DESCS[key] || `${groupName} community group`,
    members: fakeMemberCount(groupName),
  });
});

// ============================================================
//  APP STATE
// ============================================================
const state = {
  view:           "community",
  joinedGroups:   JSON.parse(localStorage.getItem("joinedGroups") || "[]"),
  extraGroups:    [],           // custom created groups
  servers:        SERVERS,
  activeServer:   null,
  activeChannel:  null,
  pendingJoin:    null,         // group object waiting for confirmation
  selectedIcon:   "🌟",
  selectedChType: "text",
  pendingCatKey:  null,         // category key for add-channel modal
  micOn:          true,
  soundOn:        true,
  inVoice:        null,         // channel key
  collapsedCats:  {},
  friends:        ["Rizky"],    // friend usernames
};

// ============================================================
//  VIEW SWITCHING
// ============================================================
function switchView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  const el = document.getElementById("view-" + name);
  if (el) el.classList.add("active");
  state.view = name;
}

// ============================================================
//  COMMUNITY VIEW
// ============================================================
function renderGroups(filter = "") {
  const grid = document.getElementById("groups-grid");
  const all = [...DEFAULT_GROUPS, ...state.extraGroups];
  const filtered = filter
    ? all.filter(g => g.name.toLowerCase().includes(filter.toLowerCase()))
    : all;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">No groups found. Create one!</div>`;
    return;
  }

  grid.innerHTML = filtered.map(g => {
    const isJoined = state.joinedGroups.includes(g.id);
    return `
      <div class="group-card">
        <div class="group-card-top">
          <div class="group-card-icon">${g.icon}</div>
          <div>
            <div class="group-card-title">${g.name}</div>
            <div class="group-card-members">👥 ${g.members} members</div>
          </div>
        </div>
        <div class="group-card-desc">${g.desc}</div>
        ${isJoined
          ? `<button class="btn-open" onclick="handleGroupClick('${g.id}')">Open Group →</button>`
          : `<button class="btn-join" onclick="handleGroupClick('${g.id}')">Join Group</button>`
        }
      </div>
    `;
  }).join("");
}

function filterGroups(val) { renderGroups(val); }

function handleGroupClick(id) {
  const all = [...DEFAULT_GROUPS, ...state.extraGroups];
  const group = all.find(g => g.id === id);
  if (!group) return;
  if (state.joinedGroups.includes(id)) {
    openDiscord(id);
  } else {
    state.pendingJoin = group;
    showJoinView(group);
  }
}

// ============================================================
//  JOIN VIEW
// ============================================================
function showJoinView(group) {
  document.getElementById("join-icon").textContent = group.icon;
  document.getElementById("join-name").textContent = group.name;
  document.getElementById("join-meta").textContent = `${_facultyName} · ${group.members} members`;
  switchView("join");
}

function confirmJoin() {
  const group = state.pendingJoin;
  if (!group) return;

  // Add system message to first text channel
  const server = state.servers[group.id];
  if (server) {
    for (const cat of Object.values(server.categories)) {
      for (const ch of Object.values(cat.channels)) {
        if (ch.type === "text") {
          ch.messages.push({
            id: Date.now(), user: "System", av: "S", color: "#10b981",
            content: `👋 You joined ${group.name}!`,
            time: now(), sys: true
          });
          break;
        }
      }
      break;
    }
  }

  state.joinedGroups.push(group.id);
  localStorage.setItem("joinedGroups", JSON.stringify(state.joinedGroups));
  state.pendingJoin = null;
  openDiscord(group.id);
}

// ============================================================
//  OPEN DISCORD VIEW
// ============================================================
function openDiscord(serverId) {
  state.activeServer = serverId;
  state.inVoice = null;

  const server = state.servers[serverId];
  // Set first text channel active
  outer: for (const cat of Object.values(server.categories)) {
    for (const chKey of Object.keys(cat.channels)) {
      state.activeChannel = chKey;
      break outer;
    }
  }

  renderDiscord();
  switchView("discord");
}

// ============================================================
//  RENDER DISCORD
// ============================================================
function renderDiscord() {
  const server = state.servers[state.activeServer];
  if (!server) return;

  // Server header
  document.getElementById("server-icon").textContent = server.icon;
  document.getElementById("server-name").textContent = server.name;

  renderChannelList();
  renderChatArea();
  renderMembersSidebar();
  updateYouPanel();
}

// ---- Channel List ----
function renderChannelList() {
  const server = state.servers[state.activeServer];
  const list = document.getElementById("channel-list");
  let html = "";

  for (const [catKey, cat] of Object.entries(server.categories)) {
    const collapsed = state.collapsedCats[catKey];
    html += `
      <div>
        <div class="cat-header" onclick="toggleCat('${catKey}')">
          <span class="cat-label">${collapsed ? "▶" : "▼"} ${cat.name}</span>
          <button class="cat-add-btn" onclick="event.stopPropagation(); openAddChModal('${catKey}')">+</button>
        </div>
    `;
    if (!collapsed) {
      for (const [chKey, ch] of Object.entries(cat.channels)) {
        const isActive = state.activeChannel === chKey;
        const isInVoice = state.inVoice === chKey;
        const voiceCount = ch.type === "voice" && ch.members && ch.members.length > 0;
        html += `
          <div class="channel-item ${isActive ? "active" : ""}" onclick="selectChannel('${chKey}')">
            <span class="ch-emoji">${ch.type === "text" ? "💬" : "🔊"}</span>
            <span class="ch-label">${ch.name}</span>
            ${voiceCount ? `<span class="ch-voice-count">${ch.members.length}</span>` : ""}
            ${isInVoice ? `<span class="in-voice-dot"></span>` : ""}
          </div>
        `;
        // Show voice sub-members
        if (ch.type === "voice" && ch.members && ch.members.length > 0) {
          html += `<div class="voice-sub-members">`;
          for (const m of ch.members) {
            const isMe = m === "You";
            html += `
              <div class="voice-sub-member">
                <div class="voice-sub-av ${isMe ? "me" : ""}">${m[0]}</div>
                ${m}${isMe ? `<span class="voice-online-dot">●</span>` : ""}
              </div>
            `;
          }
          html += `</div>`;
        }
      }
    }
    html += `</div>`;
  }

  list.innerHTML = html;
}

// ---- Chat Area ----
function renderChatArea() {
  const server = state.servers[state.activeServer];
  const chKey = state.activeChannel;
  let ch = null;
  for (const cat of Object.values(server.categories)) {
    if (cat.channels[chKey]) { ch = cat.channels[chKey]; break; }
  }
  if (!ch) return;

  // Update header
  document.getElementById("chat-ch-icon").textContent = ch.type === "text" ? "💬" : "🔊";
  document.getElementById("chat-ch-name").textContent = ch.name;
  const badge = document.getElementById("voice-badge");
  if (state.inVoice === chKey) { badge.classList.remove("hidden"); } else { badge.classList.add("hidden"); }

  if (ch.type === "text") {
    document.getElementById("text-area").classList.remove("hidden");
    document.getElementById("voice-area").classList.add("hidden");
    document.getElementById("chat-input-bar").classList.remove("hidden");
    document.getElementById("msg-input").placeholder = `Message #${ch.name}`;
    renderMessages(ch.messages);
  } else {
    document.getElementById("text-area").classList.add("hidden");
    document.getElementById("voice-area").classList.remove("hidden");
    document.getElementById("chat-input-bar").classList.add("hidden");
    renderVoiceArea(chKey, ch);
  }
}

function renderMessages(messages) {
  const list = document.getElementById("messages-list");
  if (!messages || messages.length === 0) {
    list.innerHTML = `
      <div class="empty-chat">
        <div class="empty-chat-emoji">👋</div>
        <div class="empty-chat-title">Welcome to #${state.activeChannel}!</div>
        <div class="empty-chat-sub">Start the conversation...</div>
      </div>
    `;
    return;
  }
  list.innerHTML = messages.map(msg => {
    const isMe = msg.user === "You";
    const isSys = msg.sys;

    const rowStyle = `display:flex; gap:12px; margin-bottom:16px; align-items:flex-end; ${isMe ? "flex-direction:row-reverse;" : ""}`;
    const bodyStyle = `display:flex; flex-direction:column; max-width:70%; ${isMe ? "align-items:flex-end;" : "align-items:flex-start;"}`;
    const metaStyle = `display:flex; align-items:baseline; gap:8px; margin-bottom:3px; ${isMe ? "flex-direction:row-reverse;" : ""}`;
    const bubbleBase = `display:inline-block; font-size:14px; line-height:1.6; padding:8px 14px; max-width:100%; word-wrap:break-word;`;
    const bubbleStyle = isMe
      ? `${bubbleBase} background:#4f46e5; color:#fff; border-radius:18px 4px 18px 18px;`
      : isSys
        ? `${bubbleBase} background:#f0fdf4; color:#065f46; border-left:3px solid #10b981; border-radius:4px 18px 18px 18px;`
        : `${bubbleBase} background:#fff; color:#1e1b4b; border-radius:4px 18px 18px 18px; box-shadow:0 1px 3px rgba(0,0,0,0.06);`;

    const avatarStyle = `width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:13px; flex-shrink:0;`;
    const avatarBg = isSys ? "#10b981" : isMe ? "#4f46e5" : msg.color;

    return `
    <div style="${rowStyle}">
      <div style="${avatarStyle} background:${avatarBg};">${isMe ? "Y" : msg.av}</div>
      <div style="${bodyStyle}">
        <div style="${metaStyle}">
          ${!isMe ? `<span style="font-weight:700; font-size:13px; color:${isSys ? '#10b981' : '#1e1b4b'};">${msg.user}</span>` : ""}
          <span style="font-size:11px; color:#6b7280;">${msg.time}</span>
          ${isSys ? `<span style="font-size:10px;background:rgba(16,185,129,0.15);color:#10b981;border-radius:6px;padding:1px 6px;font-weight:700;">SYSTEM</span>` : ""}
        </div>
        <div style="${bubbleStyle}">${escHtml(msg.content)}</div>
      </div>
    </div>
  `;
  }).join("");
  document.getElementById("msg-end").scrollIntoView({ behavior: "smooth" });
}

function renderVoiceArea(chKey, ch) {
  const isConnected = state.inVoice === chKey;
  const icon = document.getElementById("voice-room-icon");
  icon.textContent = "🔊";
  icon.className = "voice-room-icon" + (isConnected ? " connected" : "");
  document.getElementById("voice-room-name").textContent = ch.name;

  const membersEl = document.getElementById("voice-members");
  if (!ch.members || ch.members.length === 0) {
    membersEl.innerHTML = `<div style="color:var(--subtext);font-size:14px">No one here yet — be the first!</div>`;
  } else {
    membersEl.innerHTML = ch.members.map(m => {
      const isMe = m === "You";
      return `
        <div class="voice-member-card">
          <div class="voice-member-av ${isMe ? "me" : ""}">${m[0]}</div>
          <div class="voice-member-name">${m}</div>
          ${isMe ? `<div class="voice-member-mic ${state.micOn ? "live" : ""}">${state.micOn ? "🎙️ Live" : "🔇 Muted"}</div>` : ""}
        </div>
      `;
    }).join("");
  }

  const btn = document.getElementById("btn-join-voice");
  if (isConnected) {
    btn.textContent = "🔴 Leave Voice";
    btn.classList.add("leave");
  } else {
    btn.textContent = "🟢 Join Voice";
    btn.classList.remove("leave");
  }
}

// ---- Members Sidebar ----
function renderMembersSidebar() {
  const serverId = state.activeServer;
  const memberData = SERVER_MEMBERS[serverId] || { online: [], offline: [] };

  // Online members (+ You always online)
  const onlineList = document.getElementById("members-online");
  const allOnline = [{ name: "You", av: "Y", color: "#4f46e5" }, ...memberData.online];
  onlineList.innerHTML = allOnline.map(m => {
    const isFriend = state.friends.includes(m.name);
    return `
      <div class="member-item">
        <div class="member-av" style="background:${m.color}">
          ${m.av}
          <div class="member-av-dot online"></div>
        </div>
        <span class="member-name">${m.name}${isFriend ? ` <span class="friend-badge">Friend</span>` : ""}</span>
        ${m.name !== "You" ? `
          <div class="member-actions">
            ${isFriend
              ? `<button class="member-action-btn remove" onclick="removeFriend('${m.name}', event)">Remove</button>`
              : `<button class="member-action-btn add" onclick="addFriendDirect('${m.name}', event)">+ Friend</button>`
            }
            <button class="member-action-btn msg" onclick="showToast('DM to ${m.name} coming soon!', event)">DM</button>
          </div>
        ` : ""}
      </div>
    `;
  }).join("");

  // Offline members
  const offlineList = document.getElementById("members-offline");
  offlineList.innerHTML = memberData.offline.map(m => {
    const isFriend = state.friends.includes(m.name);
    return `
      <div class="member-item">
        <div class="member-av" style="background:#9ca3af">
          ${m.av}
          <div class="member-av-dot offline"></div>
        </div>
        <span class="member-name offline">${m.name}</span>
        <div class="member-actions">
          ${isFriend
            ? `<button class="member-action-btn remove" onclick="removeFriend('${m.name}', event)">Remove</button>`
            : `<button class="member-action-btn add" onclick="addFriendDirect('${m.name}', event)">+ Friend</button>`
          }
        </div>
      </div>
    `;
  }).join("");

  // Friends list
  renderFriendsList();
}

function renderFriendsList() {
  const serverId = state.activeServer;
  const memberData = SERVER_MEMBERS[serverId] || { online: [], offline: [] };
  const allMembers = [...memberData.online, ...memberData.offline];
  const friendsList = document.getElementById("friends-list");

  if (state.friends.length === 0) {
    friendsList.innerHTML = `<div style="font-size:12px;color:var(--subtext);padding:6px 8px">No friends yet. Add some!</div>`;
    return;
  }
  friendsList.innerHTML = state.friends.map(name => {
    const m = allMembers.find(x => x.name === name);
    const isOnline = m ? memberData.online.some(x => x.name === name) : false;
    const color = m ? m.color : "#6b7280";
    const av = m ? m.av : name[0];
    return `
      <div class="friend-item">
        <div class="member-av" style="background:${color}">
          ${av}
          <div class="member-av-dot ${isOnline ? "online" : "offline"}"></div>
        </div>
        <span class="member-name">${name}</span>
        <div class="member-actions">
          <button class="member-action-btn remove" onclick="removeFriend('${name}', event)">Remove</button>
          <button class="member-action-btn msg" onclick="showToast('DM feature coming soon!', event)">DM</button>
        </div>
      </div>
    `;
  }).join("");
}

// ---- You Panel ----
function updateYouPanel() {
  const statusEl = document.getElementById("you-status");
  if (state.inVoice) {
    statusEl.textContent = "🔊 In voice";
    statusEl.classList.add("in-voice");
  } else {
    statusEl.textContent = "Online";
    statusEl.classList.remove("in-voice");
  }

  const micBtn = document.getElementById("btn-mic");
  micBtn.textContent = state.micOn ? "🎙️" : "🔇";
  micBtn.className = "ctrl-btn" + (state.micOn ? " active" : " muted");

  const soundBtn = document.getElementById("btn-sound");
  soundBtn.textContent = state.soundOn ? "🔊" : "🔕";
  soundBtn.className = "ctrl-btn" + (state.soundOn ? " active" : " muted");
}

// ============================================================
//  ACTIONS
// ============================================================

// Select channel
function selectChannel(chKey) {
  state.activeChannel = chKey;
  renderChannelList();
  renderChatArea();
}

// Toggle category collapse
function toggleCat(catKey) {
  state.collapsedCats[catKey] = !state.collapsedCats[catKey];
  renderChannelList();
}

// Send message
function sendMessage() {
  const input = document.getElementById("msg-input");
  const content = input.value.trim();
  if (!content) return;

  const server = state.servers[state.activeServer];
  for (const cat of Object.values(server.categories)) {
    const ch = cat.channels[state.activeChannel];
    if (ch && ch.type === "text") {
      ch.messages.push({ id: Date.now(), user: "You", av: "Y", color: "#4f46e5", content, time: now(), sys: false });
      break;
    }
  }

  input.value = "";
  renderMessages(getActiveMsgs());
}

function handleMsgKey(e) { if (e.key === "Enter") sendMessage(); }

function getActiveMsgs() {
  const server = state.servers[state.activeServer];
  if (!server) return [];
  for (const cat of Object.values(server.categories)) {
    const ch = cat.channels[state.activeChannel];
    if (ch && ch.type === "text") return ch.messages;
  }
  return [];
}

// Toggle join voice
function toggleJoinVoice() {
  const chKey = state.activeChannel;
  const server = state.servers[state.activeServer];

  // Leave current voice if any
  if (state.inVoice && state.inVoice !== chKey) {
    for (const cat of Object.values(server.categories)) {
      const prevCh = cat.channels[state.inVoice];
      if (prevCh && prevCh.type === "voice") {
        prevCh.members = prevCh.members.filter(m => m !== "You");
        break;
      }
    }
  }

  if (state.inVoice === chKey) {
    // Leave
    for (const cat of Object.values(server.categories)) {
      const ch = cat.channels[chKey];
      if (ch && ch.type === "voice") { ch.members = ch.members.filter(m => m !== "You"); break; }
    }
    state.inVoice = null;
    showToast("Left voice channel");
  } else {
    // Join
    for (const cat of Object.values(server.categories)) {
      const ch = cat.channels[chKey];
      if (ch && ch.type === "voice") { if (!ch.members.includes("You")) ch.members.push("You"); break; }
    }
    state.inVoice = chKey;
    showToast("Joined voice channel 🔊");
  }

  renderChannelList();
  renderChatArea();
  updateYouPanel();
}

// Mic toggle
function toggleMic() {
  state.micOn = !state.micOn;
  updateYouPanel();
  if (state.inVoice) renderChatArea(); // refresh voice member mic status
  showToast(state.micOn ? "🎙️ Microphone on" : "🔇 Microphone muted");
}

// Sound toggle
function toggleSound() {
  state.soundOn = !state.soundOn;
  updateYouPanel();
  showToast(state.soundOn ? "🔊 Sound on" : "🔕 Sound off");
}

// Friend actions
function addFriendDirect(name, e) {
  e.stopPropagation();
  if (!state.friends.includes(name)) {
    state.friends.push(name);
    renderMembersSidebar();
    showToast(`✅ ${name} added as friend!`);
  }
}

function removeFriend(name, e) {
  e.stopPropagation();
  state.friends = state.friends.filter(f => f !== name);
  renderMembersSidebar();
  showToast(`❌ ${name} removed from friends`);
}

// ============================================================
//  MODALS — Create Group
// ============================================================
let selectedIcon = "🌟";

function openCreateModal() {
  selectedIcon = "🌟";
  document.getElementById("new-group-name").value = "";
  document.getElementById("new-group-desc").value = "";

  const picker = document.getElementById("icon-picker");
  picker.innerHTML = ICONS.map(e => `
    <div class="icon-opt ${e === selectedIcon ? "selected" : ""}" onclick="selectIcon('${e}', this)">${e}</div>
  `).join("");

  openModal("modal-create");
}

function selectIcon(icon, el) {
  selectedIcon = icon;
  document.querySelectorAll(".icon-opt").forEach(o => o.classList.remove("selected"));
  el.classList.add("selected");
}

function createGroup() {
  const name = document.getElementById("new-group-name").value.trim();
  const desc = document.getElementById("new-group-desc").value.trim();
  if (!name) { showToast("Please enter a group name"); return; }

  const key = name.toLowerCase().replace(/\s+/g, "-");

  state.servers[key] = {
    name, icon: selectedIcon,
    categories: {
      "general": { name: "General", channels: {
        "general": { name: "general", type: "text", messages: [
          { id:1, user:"You", av:"Y", color:"#4f46e5", content:`${name} has been created! 🎉`, time:now(), sys:true }
        ]},
      }},
      "voice": { name: "Voice Rooms", channels: {
        "general-voice": { name: "General Voice", type: "voice", members: [] },
      }},
    }
  };

  SERVER_MEMBERS[key] = { online: [], offline: [] };

  state.extraGroups.push({ id: key, name, icon: selectedIcon, desc: desc || "Community group", members: 1 });
  state.joinedGroups.push(key);
  localStorage.setItem("joinedGroups", JSON.stringify(state.joinedGroups));

  closeModal("modal-create");
  renderGroups();
  openDiscord(key);
  showToast(`🎉 Group "${name}" created!`);
}

// ============================================================
//  MODALS — Add Channel
// ============================================================
let pendingCatKey = null;
let selectedChType = "text";

function openAddChModal(catKey) {
  pendingCatKey = catKey;
  selectedChType = "text";
  const server = state.servers[state.activeServer];
  document.getElementById("add-ch-in").textContent = `in ${server.categories[catKey]?.name || catKey}`;
  document.getElementById("new-ch-name").value = "";
  selectChType("text");
  openModal("modal-add-ch");
}

function selectChType(type) {
  selectedChType = type;
  document.getElementById("type-text").className = "type-opt" + (type === "text"  ? " active" : "");
  document.getElementById("type-voice").className = "type-opt" + (type === "voice" ? " active" : "");
}

function addChannel() {
  const name = document.getElementById("new-ch-name").value.trim();
  if (!name || !pendingCatKey) return;

  const key = name.toLowerCase().replace(/\s+/g, "-");
  const server = state.servers[state.activeServer];
  server.categories[pendingCatKey].channels[key] = {
    name,
    type: selectedChType,
    messages: selectedChType === "text" ? [] : undefined,
    members:  selectedChType === "voice" ? [] : undefined,
  };

  closeModal("modal-add-ch");
  renderChannelList();
  showToast(`✅ Channel #${name} created`);
}

// ============================================================
//  MODALS — Add Category
// ============================================================
function openAddCatModal() {
  document.getElementById("new-cat-name").value = "";
  openModal("modal-add-cat");
}

function addCategory() {
  const name = document.getElementById("new-cat-name").value.trim();
  if (!name) return;

  const key = name.toLowerCase().replace(/\s+/g, "-");
  state.servers[state.activeServer].categories[key] = { name, channels: {} };

  closeModal("modal-add-cat");
  renderChannelList();
  showToast(`✅ Category "${name}" added`);
}

// ============================================================
//  MODALS — Add Friend
// ============================================================
function openAddFriendModal() {
  document.getElementById("friend-username").value = "";
  openModal("modal-add-friend");
}

function addFriend() {
  const name = document.getElementById("friend-username").value.trim();
  if (!name) return;
  if (name === "You") { showToast("You can't add yourself!"); return; }
  if (state.friends.includes(name)) { showToast(`${name} is already your friend`); return; }

  state.friends.push(name);

  // If not in SERVER_MEMBERS, add as offline
  const serverId = state.activeServer;
  if (serverId && SERVER_MEMBERS[serverId]) {
    const allNames = [
      ...SERVER_MEMBERS[serverId].online.map(m => m.name),
      ...SERVER_MEMBERS[serverId].offline.map(m => m.name),
    ];
    if (!allNames.includes(name)) {
      SERVER_MEMBERS[serverId].offline.push({ name, av: name[0].toUpperCase(), color: "#6b7280" });
    }
  }

  closeModal("modal-add-friend");
  renderMembersSidebar();
  showToast(`✅ Friend request sent to ${name}!`);
}

// ============================================================
//  MODAL HELPERS
// ============================================================
function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}
function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

// Close modals on overlay click
document.querySelectorAll(".modal-overlay").forEach(overlay => {
  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.classList.add("hidden");
  });
});

// ============================================================
//  TOAST
// ============================================================
let toastTimer = null;
function showToast(msg, e) {
  if (e) e.stopPropagation();
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 2500);
}

// ============================================================
//  UTILITIES
// ============================================================
function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function escHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ============================================================
//  INIT
// ============================================================

// Set faculty title and subtitle dynamically from localStorage
const _titleEl = document.getElementById("page-faculty-title");
if (_titleEl) _titleEl.textContent = _facultyName;

const _subEl = document.querySelector(".community-header p");
if (_subEl) _subEl.textContent = `${_groupNames.length} group${_groupNames.length > 1 ? "s" : ""} available in this faculty`;

renderGroups();