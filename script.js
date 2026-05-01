// ==========================================
// 1. ระบบดึงข่าวสาร (หน้าแรก)
// ==========================================
async function fetchNews() {
    const box = document.getElementById('news-container');
    if (!box) return;
    try {
        const res = await fetch('news.json');
        const data = (await res.json()).reverse();
        box.innerHTML = data.map(n => `
            <div class="card" style="animation: slideUp 0.5s ease;">
                <img src="${n.img}">
                <div class="card-body">
                    <p class="card-date">${n.date}</p>
                    <h3>${n.title}</h3>
                    <a href="post.html?id=${n.id}" class="btn" style="text-decoration:none; color:var(--primary); font-weight:800; margin-top:10px; display:inline-block;">อ่านต่อ →</a>
                </div>
            </div>`).join('');
    } catch (e) { console.error(e); }
}

// ==========================================
// 2. ระบบตรวจสอบเอกสาร (หน้า Archive)
// ==========================================
let allDocs = [];
fetch('documents.json').then(r => r.json()).then(d => allDocs = d);

function verifyDocument() {
    const user = document.getElementById('roblox-username').value.trim();
    const type = document.getElementById('doc-type-select').value;
    const resArea = document.getElementById('verify-result-area');
    if (!user || !type) return;

    const found = allDocs.find(d => d.roblox_username.toLowerCase() === user.toLowerCase() && d.doc_type === type);
    if (found) {
        const grade = found.extra_info?.grade || found.extra_info?.gpa || null;
        resArea.innerHTML = `
            <div class="verify-box" style="margin-top:40px; animation: slideUp 0.6s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                    <h2 style="font-size:1.6rem;">${found.doc_type}</h2>
                    <span style="background:#e6f6ee; color:var(--primary); padding:8px 20px; border-radius:50px; font-weight:800; font-size:0.85rem;">✔️ ${found.status}</span>
                </div>
                <div class="info-grid-3">
                    <div class="info-item"><small style="color:#64748b;">ระดับ/ปี</small><br><b>${found.extra_info?.level || '-'}</b></div>
                    <div class="info-item"><small style="color:#64748b;">เกรดเฉลี่ย</small><br><b style="color:var(--primary);">${grade || 'N/A'}</b></div>
                    <div class="info-item"><small style="color:#64748b;">วันที่ออก</small><br><b>${found.extra_info?.issued_date || '-'}</b></div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:25px;">
                    ${found.images.map(img => `<img src="${img}" style="width:100%; border-radius:12px; border:1px solid #eee;">`).join('')}
                </div>
                <div style="background:#f8fafc; padding:20px; border-radius:12px; border-left:5px solid var(--primary);">
                    <p><b>รายละเอียด:</b> ${found.detail}</p>
                    <p style="margin-top:10px; font-size:0.9rem; color:#64748b;"><b>ผู้ออกเอกสาร:</b> ${found.issuer}</p>
                </div>
            </div>`;
    } else { alert("ไม่พบข้อมูลที่ตรวจสอบ"); }
}

// ==========================================
// 3. ระบบบุคลากร (หน้า Personnel)
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

window.addEventListener('DOMContentLoaded', () => { fetchNews(); fetchPersonnel(); });
