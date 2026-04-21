// ฟังก์ชันโหลดข่าวสาร
async function fetchNews() {
    const box = document.getElementById('news-container');
    if (!box) return;

    const res = await fetch('news.json');
    const data = await res.json();

    box.innerHTML = data.map(n => `
        <div class="card">
            <img src="${n.img}">
            <div class="card-body">
                <p class="card-date">${n.date}</p>
                <h3>${n.title}</h3>
                <a href="post.html?id=${n.id}" class="btn">อ่านต่อ</a>
            </div>
        </div>
    `).join('');
}

// ฟังก์ชันโหลดบุคลากร
async function fetchPersonnel() {
    const res = await fetch('members.json');
    const data = await res.json();

    const render = (listId, cat) => {
        const el = document.getElementById(listId);
        if (!el) return;
        el.innerHTML = data.filter(m => m.category === cat).map(m => `
            <div class="card p-card" onclick="openBio('${m.name}', '${m.role}', '${m.dept}', '${m.bio}')">
                <img src="${m.img}">
                <h4>${m.name}</h4>
                <p style="color:#777; font-size:0.9rem;">${m.role}</p>
            </div>
        `).join('');
    };

    render('founder-list', 'founder');
    render('school-list', 'school');
    render('police-list', 'police');
}

// ระบบ Modal
function openBio(name, role, dept, bio) {
    document.getElementById('m-name').innerText = name;
    document.getElementById('m-role').innerText = role;
    document.getElementById('m-dept').innerText = dept;
    document.getElementById('m-bio').innerText = bio;
    document.getElementById('bio-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('bio-modal').style.display = 'none';
}

// เริ่มทำงาน
window.onload = () => {
    fetchNews();
    fetchPersonnel();
};
