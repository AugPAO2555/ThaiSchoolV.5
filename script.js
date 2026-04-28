// --- ส่วนเดิมของพี่ (ข่าวสาร & บุคลากร) ---
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

function openBio(id) {
    fetch('members.json')
    .then(res => res.json())
    .then(data => {
        const m = data.find(item => item.id === id);
        if (!m) return;
        
        document.getElementById('m-name').innerText = m.name;
        document.getElementById('m-role').innerText = m.role;
        document.getElementById('m-dept').innerText = m.dept;
        document.getElementById('m-bio').innerText = m.bio;

        const eduBox = document.getElementById('m-edu-list');
        eduBox.innerHTML = (m.education && m.education.length > 0) ? m.education.map(e => `
            <div class="bio-item"><span>🎓</span> <div><b>${e.level}</b><small>${e.place}</small></div></div>
        `).join('') : '<p style="color:#999; font-size:0.8rem; margin-bottom:15px;">ไม่มีข้อมูลประวัติการศึกษา</p>';

        const expBox = document.getElementById('m-exp-list');
        expBox.innerHTML = (m.experience && m.experience.length > 0) ? m.experience.map(ex => `
            <div class="bio-item">
                <span>💼</span> 
                <div>
                    <b>${ex.year === "ปัจจุบัน" ? "ปัจจุบัน" : "ปี " + ex.year}</b>
                    <small>${ex.desc}</small>
                </div>
            </div>
        `).join('') : '<p style="color:#999; font-size:0.8rem; margin-bottom:15px;">ไม่มีข้อมูลประวัติการทำงาน</p>';

        const modal = document.getElementById('bio-modal');
        modal.style.display = 'flex';
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) modalContent.scrollTop = 0;
    });
}

function closeModal() {
    const modal = document.getElementById('bio-modal');
    if (modal) modal.style.display = 'none';
}

// --- ส่วนใหม่ (ตรวจสอบเอกสาร) ---
async function verifyDocument() {
    const user = document.getElementById('roblox-username').value.trim();
    const overlay = document.getElementById('status-overlay');
    const loadBar = document.getElementById('load-bar');
    const statusTitle = document.getElementById('status-title');
    const statusMsg = document.getElementById('status-msg');
    const statusBtn = document.getElementById('status-btn');
    const resultArea = document.getElementById('verify-result-area');

    if (!user) return alert("กรุณากรอก Username");

    overlay.style.display = 'flex';
    statusBtn.style.display = 'none';
    resultArea.innerHTML = '';
    
    let progress = 0;
    const interval = setInterval(async () => {
        progress += Math.random() * 30;
        if (progress > 100) progress = 100;
        loadBar.style.width = progress + '%';

        if (progress === 100) {
            clearInterval(interval);
            try {
                const res = await fetch('Documents.json'); //
                const docs = await res.json();
                const found = docs.find(d => d.roblox_username.toLowerCase() === user.toLowerCase());

                if (found) {
                    statusTitle.innerText = "ตรวจสอบพบข้อมูล";
                    statusMsg.innerText = "พบเอกสารในระบบ";
                    resultArea.innerHTML = `
                        <div class="doc-result-card" style="background:#fff; border:1px solid #eee; padding:25px; border-radius:15px; margin-top:30px;">
                            <span style="color:var(--primary); font-weight:bold;">● ${found.status}</span>
                            <h3 style="margin:10px 0;">${found.doc_type}</h3>
                            <p><b>เลขที่เอกสาร:</b> ${found.doc_id}</p>
                            <p><b>ผู้ถือครอง:</b> ${found.roblox_username}</p>
                            <p><b>วันที่ออก:</b> ${found.issue_date}</p>
                            <hr style="margin:15px 0; border:0; border-top:1px solid #eee;">
                            <p style="font-size:0.9rem; color:#666;">${found.detail}</p>
                        </div>
                    `;
                } else {
                    statusTitle.innerText = "ไม่พบข้อมูล";
                    statusMsg.innerText = "ไม่พบเอกสารของชื่อผู้ใช้นี้";
                }
                statusBtn.style.display = 'block';
            } catch (err) {
                statusTitle.innerText = "เกิดข้อผิดพลาด";
                statusMsg.innerText = "โหลดฐานข้อมูลไม่สำเร็จ";
                statusBtn.style.display = 'block';
            }
        }
    }, 400);
}

function closeStatus() {
    document.getElementById('status-overlay').style.display = 'none';
    document.getElementById('load-bar').style.width = '0%';
}

window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    fetchPersonnel();
});
