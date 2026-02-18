// 1. Data Source (Simulasi Database)
const teachers = [
    {
        id: 1,
        name: "Rosalina",
        role: "Web Progamming, Discreate,",
        lang: "English",
        flag: "🇺🇸",
        rating: 4.9,
        reviews: 120,
        price: 15,
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        mode: "Online"
    },
    {
        id: 2,
        name: "Carlos Rodriguez",
        role: "Native Spanish Speaker",
        lang: "Spanish",
        flag: "🇪🇸",
        rating: 5.0,
        reviews: 85,
        price: 12,
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        mode: "Online & Offline"
    },
    {
        id: 3,
        name: "Amelie Poulain",
        role: "French Literature Major",
        lang: "French",
        flag: "🇫🇷",
        rating: 4.8,
        reviews: 210,
        price: 25,
        image: "https://randomuser.me/api/portraits/women/65.jpg",
        mode: "Online"
    },
    {
        id: 4,
        name: "Kenji Tanaka",
        role: "Japanese Conversation",
        lang: "Japanese",
        flag: "🇯🇵",
        rating: 4.9,
        reviews: 45,
        price: 18,
        image: "https://randomuser.me/api/portraits/men/11.jpg",
        mode: "Online"
    },
    {
        id: 5,
        name: "David Smith",
        role: "Business English Expert",
        lang: "English",
        flag: "🇬🇧",
        rating: 4.7,
        reviews: 310,
        price: 22,
        image: "https://randomuser.me/api/portraits/men/85.jpg",
        mode: "Offline"
    },
    {
        id: 6,
        name: "Maria Garcia",
        role: "Spanish for Kids",
        lang: "Spanish",
        flag: "🇲🇽",
        rating: 5.0,
        reviews: 60,
        price: 10,
        image: "https://randomuser.me/api/portraits/women/22.jpg",
        mode: "Online"
    }
];

// 2. Function to Render Teachers to HTML
const grid = document.getElementById('teacherGrid');

function renderTeachers(data) {
    // Kosongkan grid sebelum mengisi data baru
    grid.innerHTML = ""; 

    if(data.length === 0) {
        grid.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>No teachers found for this language.</p>";
        return;
    }

    data.forEach(teacher => {
        const card = `
            <div class="teacher-card">
                <div class="card-header">
                    <img src="${teacher.image}" alt="${teacher.name}" class="teacher-img">
                </div>
                <div class="card-body">
                    <div class="teacher-name">
                        ${teacher.name} <span class="flag">${teacher.flag}</span>
                    </div>
                    <div class="teacher-role">${teacher.role}</div>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

// 3. Filter Functionality (Button Click)
function filterByLang(language, btnElement) {
    // Update visual tombol aktif
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    // Update logika filter data
    if (language === 'all') {
        renderTeachers(teachers);
    } else {
        const filtered = teachers.filter(t => t.lang === language);
        renderTeachers(filtered);
    }
}

// 4. Search Bar Functionality
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        const val = e.target.value.toLowerCase();
        const filtered = teachers.filter(t => 
            t.lang.toLowerCase().includes(val) || 
            t.name.toLowerCase().includes(val)
        );
        renderTeachers(filtered);
    });
}


// Render data saat pertama kali halaman dibuka
renderTeachers(teachers);