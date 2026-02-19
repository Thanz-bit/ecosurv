const consultants = [
    {
        id: 1,
        name: "Rosalina",
        role: "Computer Science",
        image: "https://randomuser.me/api/portraits/women/12.jpg",
        email: "iyangdump2676@gmail.com"
    },
    {
        id: 2,
        name: "Abdul Ghofir",
        role: "Computer Science",
        image: "https://randomuser.me/api/portraits/men/45.jpg",
        email: "iyangdump2676@gmail.com"
    },
    {
        id: 3,
        name: "Rikip Ginanjar",
        role: "Computer Science",
        image: "https://randomuser.me/api/portraits/women/30.jpg",
        email: "iyangdump2676@gmail.com"
    },
    {
        id: 4,
        name: "Genta Sahuri",
        role: "Computer Science",
        image: "https://randomuser.me/api/portraits/women/30.jpg",
        email: "iyangdump2676@gmail.com"
    },
    {
        id: 5,
        name: "Williem",
        role: "Computer Science",
        image: "https://randomuser.me/api/portraits/women/30.jpg",
        email: "iyangdump2676@gmail.com"
    },
    {
        id: 6,
        name: "Hendra Jayanto",
        role: "Computer Science",
        image: "https://randomuser.me/api/portraits/women/30.jpg",
        email: "iyangdump2676@gmail.com"
    },
    {
        id: 7,
        name: "RB Wahyu",
        role: "Computer Science",
        image: "https://randomuser.me/api/portraits/women/30.jpg",
        email: "iyangdump2676@gmail.com"
    },
    {
        id: 8,
        name: "Stainly",
        role: "Computer Science",
        image: "https://randomuser.me/api/portraits/women/30.jpg",
        email: "iyangdump2676@gmail.com"
    }
];

const grid = document.getElementById("consultantGrid");

function renderConsultants(data) {
    grid.innerHTML = "";

    data.forEach(c => {
        const card = `
            <div class="consultant-card">
                <img src="${c.image}" class="profile-img">
                <div class="consultant-name">${c.name}</div>
                <div class="consultant-role">${c.role}</div>
                <button class="btn-book" onclick="contactConsultant('${c.email}', '${c.name}')">
                    Contact Here
                </button>
            </div>
        `;
        grid.innerHTML += card;
    });
}

function contactConsultant(email, name) {

    const subject = encodeURIComponent(`Consultation Request with ${name}`);
    const body = encodeURIComponent(
        `Hello ${name},

I would like to schedule a consultation session with you.

Thank you.`
    );

    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;

    window.open(gmailURL, "_blank");
}

renderConsultants(consultants);