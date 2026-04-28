// --- 1. โหลดข่าว (หัวข้อดำ/ปุ่มเขียว) ---
async function fetchNews() {
    const box = document.getElementById('news-container');
    if (!box) return;
    try {
        const res = await fetch('news.json');
        const data = (await res.json()).reverse(); 
        box.innerHTML = data.map(n => `
            <div class="card">
                <img src="${n.img}">
                <div class="card-body">
                    <p class="card-date">${n.date}</p>
                    <h3>${n.title}</h3>
                    <a href="post.html?id=${n.id}" class="btn">อ่านต่อ →</a>
                </div>
            </div>
        `).join('');
    } catch (err) { console.error("News Load Error:", err); }
}

// --- 2. โหลดบุคลากร (ชื่อเขียว/ตำแหน่งดำ) ---
async function fetchPersonnel() {
    try {
        const res = await fetch('members.json');
        const data = await res.json();
        const render = (listId, cat) => {
            const el = document.getElementById(listId);
            if (!el) return;
            el.innerHTML = data.filter(m => m.category === cat).map(m => `
                <div class="p-card" onclick="openBio(${m.id})">
                    <img src="${m.img}">
                    <div class="p-card-body">
                        <h4>${m.name}</h4>
                        <p>${m.role}</p>
                    </div>
                </div>
            `).join('');
        };
        render('founder-list', 'founder');
        render('school-list', 'school');
        render('police-list', 'police');
    } catch (err) { console.error("Personnel Load Error:", err); }
}

// --- 3. ระบบ Modal (เปิดแบบเด้งกลางจอ) ---
function openBio(id) {
    fetch('members.json').then(res => res.json()).then(data => {
        const m = data.find(item => item.id === id);
        if (!m) return;
        
        document.getElementById('m-name').innerText = m.name;
        document.getElementById('m-role').innerText = m.role;
        document.getElementById('m-dept').innerText = m.dept;
        document.getElementById('m-bio').innerText = m.bio || "ไม่มีข้อมูล";

        const modal = document.getElementById('bio-modal');
        modal.style.display = "flex"; // เปิดหน้าต่าง
        document.querySelector('.modal-content').scrollTop = 0;
    });
}

function closeModal() {
    document.getElementById('bio-modal').style.display = "none";
}

// --- เริ่มทำงาน ---
window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    fetchPersonnel();
});
