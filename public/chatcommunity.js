// ================= DATA =================

const groups = JSON.parse(localStorage.getItem("groups")) || [];
const facultyName = localStorage.getItem("facultyName") || "Community";

let activeGroup = null;
let joined = false;


// ================= ELEMENT =================

const list = document.getElementById("groupList");
const title = document.getElementById("facultyTitle");

const header = document.getElementById("chatHeader");
const body = document.getElementById("chatBody");

const input = document.getElementById("messageInput");
const send = document.getElementById("sendBtn");

const back = document.getElementById("backBtn");
const newGroup = document.getElementById("newGroupBtn");

const search = document.getElementById("searchBox");


// ================= INIT =================

title.innerText = facultyName;

renderGroups();

disableChat();

showWelcome();


// ================= GROUP =================

function renderGroups() {

  list.innerHTML = "";

  groups.forEach(name => {

    const div = document.createElement("div");

    div.className = "group-item";
    div.innerText = name;

    div.onclick = () => selectGroup(name, div);

    list.appendChild(div);

  });

}


// ================= SELECT =================

function selectGroup(name, el) {

  document
    .querySelectorAll(".group-item")
    .forEach(i => i.classList.remove("active"));

  el.classList.add("active");

  activeGroup = name;
  joined = false;

  header.innerText = name;

  showJoin();

}


// ================= JOIN =================

function showJoin() {

  body.innerHTML = `
    <div class="join-box">

      <h2>${activeGroup}</h2>

      <p>Join this group to start chatting</p>

      <button onclick="joinGroup()">Join Group</button>

    </div>
  `;

  disableChat();

}


function joinGroup() {

  joined = true;

  body.innerHTML = "";

  enableChat();

  systemMsg("You joined the group");

}


// ================= CHAT =================

send.onclick = sendMsg;

input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMsg();
});


function sendMsg() {

  if (!joined) return;

  const text = input.value.trim();

  if (!text) return;


  const msg = document.createElement("div");

  msg.className = "message me";
  msg.innerText = text;

  body.appendChild(msg);

  input.value = "";

  body.scrollTop = body.scrollHeight;

}


function systemMsg(t) {

  const m = document.createElement("div");

  m.className = "message system";
  m.innerText = t;

  body.appendChild(m);

}


// ================= UI =================

function disableChat() {

  input.disabled = true;
  send.disabled = true;

}


function enableChat() {

  input.disabled = false;
  send.disabled = false;

  input.focus();

}


function showWelcome() {

  body.innerHTML = `
    <div class="join-box">

      <h2>${facultyName}</h2>

      <p>Select group to start</p>

    </div>
  `;

}


// ================= SEARCH =================

search.oninput = () => {

  const key = search.value.toLowerCase();

  document
    .querySelectorAll(".group-item")
    .forEach(item => {

      if (
        item.innerText.toLowerCase().includes(key)
      ) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }

    });

};


// ================= BUTTON =================

back.onclick = () => {
  location.href = "community.html";
};

newGroup.onclick = () => {
  document.getElementById("newGroupModal").style.display = "flex";
};
function closeModal() {
  document.getElementById("newGroupModal").style.display = "none";
}

function createGroup() {

  const input = document.getElementById("newGroupInput");
  const groupName = input.value.trim();

  if(groupName === "") {
    alert("Group name cannot be empty");
    return;
  }

  groups.push(groupName);
  localStorage.setItem("groups", JSON.stringify(groups));

  renderGroups();

  input.value = "";
  closeModal();
}