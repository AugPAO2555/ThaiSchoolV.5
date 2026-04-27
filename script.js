// ฟังก์ชันโหลดข่าวสาร (ข่าวใหม่ขึ้นก่อน)
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
                    <a href="post.html?id=${n.id}" class="btn">อ่านต่อ</a>
                </div>
            </div>
        `).join('');
    } catch (err) { console.error("โหลดข่าวไม่สำเร็จ:", err); }
}

// ฟังก์ชันโหลดบุคลากร แยกตามหมวดหมู่
async function fetchPersonnel() {
    try {
        const res = await fetch('members.json');
        const data = await res.json();
        const render = (listId, cat) => {
            const el = document.getElementById(listId);
            if (!el) return;
            el.innerHTML = data.filter(m => m.category === cat).map(m => `
                <div class="card p-card" onclick="openBio(${m.id})">
                    <img src="${m.img}">
                    <h4>${m.name}</h4>
                    <p style="color:#777; font-size:0.9rem;">${m.role}</p>
                </div>
            `).join('');
        };
        render('founder-list', 'founder');
        render('school-list', 'school');
        render('police-list', 'police');
    } catch (err) { console.error("โหลดบุคลากรไม่สำเร็จ:", err); }
}

// ระบบเปิด Modal แสดงประวัติ (รองรับ ID)
function openBio(id) {
    fetch('members.json')
    .then(res => res.json())
    .then(data => {
        const m = data.find(item => item.id === id);
        if (!m) return;
        
        // ใส่ข้อมูลพื้นฐาน
        document.getElementById('m-name').innerText = m.name;
        document.getElementById('m-role').innerText = m.role;
        document.getElementById('m-dept').innerText = m.dept;
        document.getElementById('m-bio').innerText = m.bio;

        // จัดการประวัติการศึกษา (ถ้าไม่มีให้โชว์ว่าไม่มีข้อมูล)
        const eduBox = document.getElementById('m-edu-list');
        eduBox.innerHTML = (m.education && m.education.length > 0) ? m.education.map(e => `
            <div class="bio-item">
                <span>🎓</span> 
                <div><b>${e.level}</b><small>${e.place}</small></div>
            </div>
        `).join('') : '<p style="color:#999; font-size:0.8rem; margin-bottom:15px;">ไม่มีข้อมูลประวัติการศึกษา</p>';

        // จัดการประวัติการทำงาน (ถ้าไม่มีให้โชว์ว่าไม่มีข้อมูล)
        const expBox = document.getElementById('m-exp-list');
        expBox.innerHTML = (m.experience && m.experience.length > 0) ? m.experience.map(ex => `
            <div class="bio-item">
                <span>💼</span> 
                <div><b>ปี ${ex.year}</b><small>${ex.desc}</small></div>
            </div>
        `).join('') : '<p style="color:#999; font-size:0.8rem; margin-bottom:15px;">ไม่มีข้อมูลประวัติการทำงาน</p>';

        // แสดง Modal และสั่งให้เลื่อนกลับไปบนสุด
        const modal = document.getElementById('bio-modal');
        modal.style.display = 'flex';
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) modalContent.scrollTop = 0;
    });
}

// ฟังก์ชันปิด Modal
function closeModal() {
    const modal = document.getElementById('bio-modal');
    if (modal) modal.style.display = 'none';
}

// รันฟังก์ชันทั้งหมดเมื่อหน้าเว็บโหลดเสร็จ
window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    fetchPersonnel();
});
