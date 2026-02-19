function openChat(name) {
    document.getElementById('chat-title').innerText = "Contact with " + name;
    document.getElementById('chat-display').innerHTML = `
        <div style="text-align: center; color: #999;">
            Chat session with ${name} is now active.
        </div>
    `;
}

document.getElementById('send-btn').addEventListener('click', () => {
    const input = document.getElementById('msg-input');
    if(input.value) {
        alert("Sending message to HTS Contact: " + input.value);
        input.value = "";
    }
});