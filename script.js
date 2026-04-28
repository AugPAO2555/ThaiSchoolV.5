// ฟังก์ชันโหลดข่าวสาร
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

// ฟังก์ชันโหลดบุคลากร
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

// ระบบ Modal ประวัติบุคลากร
function openBio(id) {
    fetch('members.json').then(res => res.json()).then(data => {
        const m = data.find(item => item.id === id);
        if (!m) return;
        document.getElementById('m-name').innerText = m.name;
        document.getElementById('m-role').innerText = m.role;
        document.getElementById('m-dept').innerText = m.dept;
        document.getElementById('m-bio').innerText = m.bio;
        const eduBox = document.getElementById('m-edu-list');
        eduBox.innerHTML = (m.education && m.education.length > 0) ? m.education.map(e => `<div class="bio-item"><span>🎓</span> <div><b>${e.level}</b><small>${e.place}</small></div></div>`).join('') : '<p>ไม่มีข้อมูล</p>';
        const expBox = document.getElementById('m-exp-list');
        expBox.innerHTML = (m.experience && m.experience.length > 0) ? m.experience.map(ex => `<div class="bio-item"><span>💼</span> <div><b>${ex.year === "ปัจจุบัน" ? "ปัจจุบัน" : "ปี " + ex.year}</b><small>${ex.desc}</small></div></div>`).join('') : '<p>ไม่มีข้อมูล</p>';
        const modal = document.getElementById('bio-modal');
        modal.style.display = 'flex';
        const content = document.querySelector('.modal-content');
        if (content) content.scrollTop = 0;
    });
}

function closeModal() { document.getElementById('bio-modal').style.display = 'none'; }

// ระบบตรวจสอบเอกสาร
async function verifyDocument() {
    const username = document.getElementById('roblox-username').value.trim();
    const dept = document.getElementById('department-select').value;
    const overlay = document.getElementById('status-overlay');
    const bar = document.getElementById('load-bar');
    const icon = document.getElementById('status-icon');
    const title = document.getElementById('status-title');
    const msg = document.getElementById('status-msg');
    const btn = document.getElementById('status-btn');
    const resultDiv = document.getElementById('verify-result');

    if (!username) {
        overlay.style.display = "flex";
        bar.className = "loading-bar bg-error";
        bar.style.width = "100%";
        icon.innerHTML = "❌";
        title.innerText = "พบข้อผิดพลาด";
        msg.innerHTML = "กรุณาตรวจสอบ : ชื่อผู้ใช้บัญชีโรบอคไม่ถูกต้อง";
        btn.style.display = "inline-block";
        return;
    }

    resultDiv.innerHTML = "";
    overlay.style.display = "flex";
    btn.style.display = "none";
    bar.className = "loading-bar bg-success";
    bar.style.width = "100%";
    icon.innerHTML = "🔍";
    title.innerText = "กำลังตรวจสอบ";
    msg.innerText = "ระบบกำลังค้นหาข้อมูลในฐานข้อมูลกลาง...";
    setTimeout(() => { bar.style.width = "0%"; }, 100);

    try {
        const res = await fetch('documents.json');
        const data = await res.json();
        const record = data.find(item => item.roblox_username.toLowerCase() === username.toLowerCase() && item.dept_key === dept);

        setTimeout(() => {
            if (record) {
                icon.innerHTML = "✅";
                title.innerText = "พบเอกสาร";
                msg.innerHTML = "กำลังนำพาท่านไปยังข้อมูลเอกสาร...";
                setTimeout(() => { overlay.style.display = "none"; showVerifyResult(record); }, 1500);
            } else {
                bar.className = "loading-bar bg-error";
                icon.innerHTML = "❌";
                title.innerText = "ไม่พบเอกสาร";
                msg.innerHTML = "กรุณาตรวจสอบชื่อผู้ใช้และประเภทเอกสารอีกครั้ง";
                btn.style.display = "inline-block";
            }
        }, 2100);
    } catch (err) { console.error(err); }
}

function showVerifyResult(record) {
    const resultDiv = document.getElementById('verify-result');
    const statusColor = record.status.includes("ไม่") || record.status.includes("หมดอายุ") ? "#dc2626" : "#00a859";

    resultDiv.innerHTML = `
        <div style="background: white; border-radius: 15px; padding: 25px; border: 1px solid #eee; box-shadow: var(--shadow); text-align: left; margin-top:20px; animation: fadeIn 0.5s;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                <h3 style="color: var(--primary); margin: 0;">📋 รายละเอียดเอกสาร</h3>
                <span style="background: ${statusColor}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem;">${record.status}</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 15px; margin-bottom:20px;">
                <div class="copy-box" style="display: flex; flex-direction: column; gap: 5px; background:#f9f9f9; padding:10px; border-radius:8px;">
                    <b style="font-size:0.85rem; color:#555;">ชื่อผู้ใช้บัญชีโรบอค:</b>
                    <div style="display:flex; gap:5px;">
                        <input type="text" readonly value="${record.roblox_username}" id="copy-user" style="flex:1; border:1px solid #ddd; padding:5px; border-radius:5px; font-size:0.9rem;">
                        <button onclick="copyText('copy-user')" style="background:var(--primary); color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:0.8rem;">คัดลอก</button>
                    </div>
                </div>
                <div class="copy-box" style="display: flex; flex-direction: column; gap: 5px; background:#f9f9f9; padding:10px; border-radius:8px;">
                    <b style="font-size:0.85rem; color:#555;">รหัสเอกสาร:</b>
                    <div style="display:flex; gap:5px;">
                        <input type="text" readonly value="${record.doc_id}" id="copy-id" style="flex:1; border:1px solid #ddd; padding:5px; border-radius:5px; font-size:0.9rem;">
                        <button onclick="copyText('copy-id')" style="background:var(--primary); color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:0.8rem;">คัดลอก</button>
                    </div>
                </div>
            </div>

            <div style="padding: 10px; line-height: 1.8; font-size: 0.95rem;">
                <p><b>ประเภท:</b> ${record.doc_type}</p>
                <p><b>ออกเมื่อ:</b> ${record.issue_date} | <b>หมดอายุ:</b> <span style="color:${record.expiry_date.includes('ไม่') ? '#777' : '#dc2626'}">${record.expiry_date}</span></p>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                <p><b>รายละเอียด:</b> ${record.detail}</p>
                <p><b>ผู้ออกเอกสาร:</b> ${record.issuer}</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                <img src="${record.img_front || ''}" style="width:100%; border-radius:8px; border:1px solid #ddd; cursor:pointer;" onclick="window.open(this.src)">
                <img src="${record.img_back || ''}" style="width:100%; border-radius:8px; border:1px solid #ddd; cursor:pointer;" onclick="window.open(this.src)">
            </div>
        </div>
    `;
}

function copyText(id) {
    const input = document.getElementById(id);
    input.select();
    document.execCommand("copy");
    alert("คัดลอกแล้ว: " + input.value);
}

function closeStatus() { document.getElementById('status-overlay').style.display = "none"; }

window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    fetchPersonnel();
});
