// --- 1. ฟังก์ชันโหลดข่าวสาร (หน้าแรก) ---
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

// --- 2. ฟังก์ชันโหลดบุคลากร ---
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
    } catch (err) { console.error("โหลดบุคลากรไม่สำเร็จ:", err); }
}

// --- 3. ระบบ Modal (แก้ปัญหาข้อมูลปลิ้น) ---
function openBio(id) {
    fetch('members.json').then(res => res.json()).then(data => {
        const m = data.find(item => item.id === id);
        if (!m) return;
        
        document.getElementById('m-name').innerText = m.name;
        document.getElementById('m-role').innerText = m.role;
        document.getElementById('m-dept').innerText = m.dept;
        document.getElementById('m-bio').innerText = m.bio;

        const eduBox = document.getElementById('m-edu-list');
        eduBox.innerHTML = (m.education && m.education.length > 0) 
            ? m.education.map(e => `<div class="bio-item"><span>🎓</span> <div><b>${e.level}</b><small>${e.place}</small></div></div>`).join('') 
            : '<p>ไม่มีข้อมูล</p>';

        const expBox = document.getElementById('m-exp-list');
        expBox.innerHTML = (m.experience && m.experience.length > 0) 
            ? m.experience.map(ex => `<div class="bio-item"><span>💼</span> <div><b>${ex.year === "ปัจจุบัน" ? "ปัจจุบัน" : "ปี " + ex.year}</b><small>${ex.desc}</small></div></div>`).join('') 
            : '<p>ไม่มีข้อมูล</p>';

        // ใช้ classList แทน .style.display เพื่อความนิ่ง
        document.getElementById('bio-modal').classList.add('active');
        document.querySelector('.modal-content').scrollTop = 0;
    });
}

function closeModal() { 
    document.getElementById('bio-modal').classList.remove('active'); 
}

// --- 4. ระบบตรวจสอบเอกสาร (Verify) ---
async function verifyDocument() {
    const username = document.getElementById('roblox-username').value.trim();
    const agency = document.getElementById('agency-select').value;
    const docType = document.getElementById('doc-type').value;
    
    const overlay = document.getElementById('status-overlay');
    const bar = document.getElementById('load-bar');
    const icon = document.getElementById('status-icon');
    const title = document.getElementById('status-title');
    const msg = document.getElementById('status-msg');
    const btn = document.getElementById('status-btn');
    const resultArea = document.getElementById('verify-result-area');

    if (!username) {
        showStatus(overlay, "❌", "พบข้อผิดพลาด", "กรุณากรอกชื่อผู้ใช้ Roblox", "bg-error");
        btn.style.display = "block";
        return;
    }

    // เริ่มการตรวจสอบ
    resultArea.innerHTML = "";
    overlay.classList.add('active');
    btn.style.display = "none";
    bar.className = "loading-bar bg-success";
    bar.style.width = "100%";
    icon.innerHTML = "🔍";
    title.innerText = "กำลังตรวจสอบ";
    msg.innerText = `กำลังค้นหาข้อมูล ${docType.toUpperCase()} ในฐานข้อมูล...`;

    try {
        const res = await fetch('documents.json');
        const data = await res.json();
        
        // ค้นหาข้อมูลที่ตรงทั้งชื่อ และ หน่วยงาน
        const record = data.find(item => 
            item.roblox_username.toLowerCase() === username.toLowerCase() && 
            item.agency_key === agency
        );

        setTimeout(() => {
            if (record) {
                icon.innerHTML = "✅";
                title.innerText = "พบเอกสาร";
                msg.innerHTML = "ตรวจสอบความถูกต้องเรียบร้อยแล้ว...";
                setTimeout(() => { 
                    overlay.classList.remove('active'); 
                    showVerifyResult(record); 
                }, 1500);
            } else {
                showStatus(overlay, "❌", "ไม่พบข้อมูล", "ไม่พบเอกสารที่ระบุในระบบกลาง", "bg-error");
                btn.style.display = "block";
            }
        }, 2000);
    } catch (err) { console.error(err); }
}

// --- 5. แสดงผลลัพธ์ (แก้ให้ Type/User อยู่ซ้าย ไม่ไส้ทะลัก) ---
function showVerifyResult(record) {
    const resultArea = document.getElementById('verify-result-area');
    const statusColor = record.status.includes("หมดอายุ") ? "#dc2626" : "#00a859";

    resultArea.innerHTML = `
        <div class="result-card-modern">
            <div style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 15px;">
                <h3 style="color: var(--primary);">📋 ข้อมูลเอกสารยืนยัน</h3>
                <span style="background: ${statusColor}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem;">${record.status}</span>
            </div>

            <div class="res-item">
                <span>ชื่อผู้ใช้ Roblox</span>
                <div style="display:flex; gap:5px;">
                    <input type="text" readonly value="${record.roblox_username}" id="copy-user" style="flex:1; border:1px solid #ddd; padding:5px; border-radius:8px; font-size:0.9rem;">
                    <button onclick="copyText('copy-user')" style="background:var(--primary); color:white; border:none; padding:5px 10px; border-radius:8px; cursor:pointer;">คัดลอก</button>
                </div>
            </div>

            <div class="res-item">
                <span>รหัสเอกสาร</span>
                <div style="display:flex; gap:5px;">
                    <input type="text" readonly value="${record.doc_id}" id="copy-id" style="flex:1; border:1px solid #ddd; padding:5px; border-radius:8px; font-size:0.9rem;">
                    <button onclick="copyText('copy-id')" style="background:var(--primary); color:white; border:none; padding:5px 10px; border-radius:8px; cursor:pointer;">คัดลอก</button>
                </div>
            </div>

            <div class="res-item"><span>ประเภท</span><b>${record.doc_type}</b></div>
            <div class="res-item"><span>ออกโดย</span><b>${record.issuer}</b></div>
            <div class="res-item"><span>วันที่ออก</span><b>${record.issue_date}</b></div>
            <div class="res-item"><span>วันที่หมดอายุ</span><b style="color:#dc2626">${record.expiry_date}</b></div>

            <div style="grid-column: 1 / -1; margin-top: 15px; background: #f9f9f9; padding: 15px; border-radius: 10px;">
                <span>รายละเอียดเพิ่มเติม:</span>
                <p style="font-size: 0.9rem; color: #444; margin-top:5px;">${record.detail}</p>
            </div>

            <div style="grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                <img src="${record.img_front || ''}" style="width:100%; border-radius:10px; cursor:zoom-in;" onclick="window.open(this.src)">
                <img src="${record.img_back || ''}" style="width:100%; border-radius:10px; cursor:zoom-in;" onclick="window.open(this.src)">
            </div>
        </div>
    `;
}

// ฟังก์ชันช่วยแสดงสถานะ
function showStatus(overlay, icon, title, msg, barClass) {
    overlay.classList.add('active');
    document.getElementById('status-icon').innerHTML = icon;
    document.getElementById('status-title').innerText = title;
    document.getElementById('status-msg').innerText = msg;
    document.getElementById('load-bar').className = `loading-bar ${barClass}`;
    document.getElementById('load-bar').style.width = "100%";
}

function copyText(id) {
    const input = document.getElementById(id);
    input.select();
    document.execCommand("copy");
    const btn = event.target;
    btn.innerText = "สำเร็จ!";
    setTimeout(() => { btn.innerText = "คัดลอก"; }, 2000);
}

function closeStatus() { 
    document.getElementById('status-overlay').classList.remove('active'); 
}

// โหลดข้อมูลเมื่อเปิดหน้า
window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    fetchPersonnel();
});
