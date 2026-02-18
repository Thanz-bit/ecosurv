// ================= DATA =================

const faculties = [
  {
    name: "Faculty of Computing",
    image: "images/focs.jpg",
    badge: "Popular",
    groups: ["Information System", "Informatics"]
  },
  {
    name: "Faculty of Law",
    image: "images/law.jpg",
    badge: "New",
    groups: ["Criminal Law"]
  },
  {
    name: "Faculty of Engineering",
    image: "images/engineering.jpg",
    badge: "Trending",
    groups: [
      "Civil Engineering",
      "Electrical Engineering",
      "Environmental Engineering",
      "Industrial Engineering",
      "Mechanical Engineering"
    ]
  },
  {
    name: "Faculty of Business",
    image: "images/business.jpg",
    badge: "Popular",
    groups: [
      "Accounting",
      "Actuarial Science",
      "Agribusiness",
      "Business Administration",
      "Management"
    ]
  },
  {
    name: "Faculty of Social Science and Education",
    image: "images/fose.jpg",
    badge: "Recommended",
    groups: [
      "Communication",
      "Elementary Teacher Education",
      "International Relations"
    ]
  },
  {
    name: "Faculty of Art, Design, and Architecture",
    image: "images/fada.jpg",
    badge: "New",
    groups: [
      "Architecture",
      "Interior Design",
      "Visual Communication Design"
    ]
  },
  {
    name: "Faculty of Medicine",
    image: "images/medicine.jpg",
    badge: "New",
    groups: ["Medicine"]
  }
];


// ================= GLOBAL =================

const grid = document.getElementById("facultyGrid");


// ================= RENDER =================

function renderFaculties() {

  grid.innerHTML = "";

  faculties.forEach((fac, i) => {

    grid.innerHTML += `
      <div class="faculty-card" onclick="openFaculty(${i})">

        <div class="faculty-header"
          style="background-image:url('${fac.image}')">

          <span class="badge">${fac.badge}</span>
          <h3>${fac.name}</h3>

        </div>

        <div class="faculty-body">

          <p>${fac.groups.length} Groups</p>
          <span class="view">View Groups →</span>

        </div>

      </div>
    `;
  });

}


// ================= OPEN =================

function openFaculty(index) {

  const fac = faculties[index];

  localStorage.setItem("facultyName", fac.name);
  localStorage.setItem("groups", JSON.stringify(fac.groups));

  window.location.href = "chatcommunity.html";
}


// ================= INIT =================

renderFaculties();
