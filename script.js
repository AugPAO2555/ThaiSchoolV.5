// ==========================================
// 1. ระบบดึงข่าวสาร (News)
// ==========================================
async function fetchNews() {
    const box = document.getElementById('news-container');
    if (!box) return;
    try {
        const res = await fetch('news.json');
        const data = (await res.json()).reverse();
        box.innerHTML = data.map(n => `
            <div class="card">
                <img src="${n.img || 'https://via.placeholder.com/600x340'}">
                <div class="card-body">
                    <p style="color:#888; font-size:0.8rem;">${n.date}</p>
                    <h3 style="font-size:1.1rem; color:var(--dark);">${n.title}</h3>
                    <a href="post.html?id=${n.id}" style="color:var(--primary); text-decoration:none; font-weight:bold; margin-top:auto;">อ่านต่อ →</a>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error("News Error:", e); }
}

// ==========================================
// 2. ระบบตรวจสอบเอกสาร (Archive)
// ==========================================
let allDocs = [];
async function loadDocs() { fetch('documents.json').then(r => r.json()).then(d => allDocs = d); }

function verifyDocument() {
    const user = document.getElementById('roblox-username').value.trim();
    const type = document.getElementById('doc-type-select').value;
    const resArea = document.getElementById('verify-result-area');

    if (!user || !type) return;

    const found = allDocs.find(d => d.roblox_username.toLowerCase() === user.toLowerCase() && d.doc_type === type);
    if (found) {
        const grade = found.extra_info?.grade || found.extra_info?.gpa || null;
        resArea.innerHTML = `
            <div class="verify-box" style="margin-top:30px; animation: slideUp 0.5s ease;">
                <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                    <h2 style="font-size:1.4rem;">${found.doc_type}</h2>
                    <span style="color:var(--primary); font-weight:bold;">● ${found.status}</span>
                </div>
                <div class="info-grid-3">
                    <div class="info-item"><small>ระดับ/ปี</small><br><b>${found.extra_info?.level || found.extra_info?.year || '-'}</b></div>
                    ${grade ? `<div class="info-item"><small>เกรด</small><br><b style="color:var(--primary);">${grade}</b></div>` : ''}
                    <div class="info-item"><small>วันที่ออก</small><br><b>${found.extra_info?.issued_date || '-'}</b></div>
                </div>
                <div style="display:flex; gap:10px; margin-bottom:20px;">
                    ${found.images.map(img => `<img src="${img}" style="width:100%; border-radius:12px;">`).join('')}
                </div>
                <p><b>รายละเอียด:</b> ${found.detail}</p>
            </div>`;
    } else { alert("ไม่พบข้อมูล"); }
}

// ==========================================
// 3. ระบบบุคลากร (Personnel)
// ==========================================
async function fetchPersonnel() {
    try {
        const res = await fetch('members.json');
        const data = await res.json();
        const render = (id, cat) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = data.filter(m => m.category === cat).map(m => `
                <div class="p-card" onclick="openBio(${m.id})">
                    <img src="${m.img}">
                    <h4>${m.name}</h4>
                    <p>${m.role}</p>
                </div>`).join('');
        };
        render('founder-list', 'founder');
        render('school-list', 'school');
        render('police-list', 'police');
    } catch (e) { console.error(e); }
}

function openBio(id) {
    fetch('members.json').then(r => r.json()).then(data => {
        const m = data.find(i => i.id === id);
        if (!m) return;
        document.getElementById('m-name').innerText = m.name;
        document.getElementById('m-role').innerText = m.role;
        document.getElementById('m-dept').innerText = m.dept;
        document.getElementById('m-bio').innerText = m.bio;
        document.getElementById('bio-modal').style.display = 'flex';
    });
}

function closeModal() { document.getElementById('bio-modal').style.display = 'none'; }

// Init
window.addEventListener('DOMContentLoaded', () => { fetchNews(); fetchPersonnel(); loadDocs(); });
