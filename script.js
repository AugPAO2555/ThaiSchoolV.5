// ฟังก์ชันโหลดข่าวสาร (ฉบับแก้ไขให้ข่าวใหม่ขึ้นก่อน)
async function fetchNews() {
    const box = document.getElementById('news-container');
    if (!box) return;

    try {
        const res = await fetch('news.json');
        // แก้บรรทัดนี้: เติม .reverse() เพื่อให้ ID ล่าสุด (ข่าวใหม่) อยู่ข้างหน้าเสมอ
        const data = (await res.json()).reverse(); 

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
    } catch (err) {
        console.error("โหลดข่าวไม่สำเร็จ:", err);
    }
}

// ฟังก์ชันโหลดบุคลากร
async function fetchPersonnel() {
    try {
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
    } catch (err) {
        console.error("โหลดบุคลากรไม่สำเร็จ:", err);
    }
}

// ระบบ Modal
function openBio(name, role, dept, bio) {
    const modalName = document.getElementById('m-name');
    if(modalName) {
        document.getElementById('m-name').innerText = name;
        document.getElementById('m-role').innerText = role;
        document.getElementById('m-dept').innerText = dept;
        document.getElementById('m-bio').innerText = bio;
        document.getElementById('bio-modal').style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('bio-modal');
    if(modal) modal.style.display = 'none';
}

// เริ่มทำงานเมื่อโหลดหน้าเว็บ
window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    fetchPersonnel();
});
