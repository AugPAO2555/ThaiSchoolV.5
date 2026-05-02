// ==========================================
// 1. ฟังก์ชันเสริม (Utilities)
// ==========================================

// เปลี่ยน URL เป็นปุ่มกดได้
function linkify(text) {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<br><a href="${url}" target="_blank" style="display:inline-block; background:var(--primary); color:white; padding:10px 20px; border-radius:8px; text-decoration:none; margin-top:10px;">🔗 คลิกเข้าสู่ลิงก์ภายนอก</a><br>`;
    });
}

// แสดงแจ้งเตือนบนหัวเว็บ
function showNotify(msg, type = 'success') {
    const banner = document.getElementById('top-notify');
    if(!banner) return;
    banner.innerText = (type === 'success' ? '✔️ ' : '❌ ') + msg;
    banner.className = `top-banner show ${type}`;
    setTimeout(() => { banner.classList.remove('show'); }, 3000);
}

// ==========================================
// 2. ระบบตรวจสอบเอกสาร (Archive System)
// ==========================================
let allDocuments = [];

async function loadDocData() {
    try {
        const res = await fetch('documents.json');
        allDocuments = await res.json();
    } catch (err) { console.error("Load Documents Error:", err); }
}

function updateDocTypes() {
    const agency = document.getElementById('agency-select').value;
    const typeSelect = document.getElementById('doc-type-select');
    if(!typeSelect) return;

    const docData = {
        school: ["ปพ.1บ - มัธยมศึกษาตอนต้น", "ปพ.1พ - มัธยมศึกษาตอนปลาย", "ปพ.2บ - ประกาศนียบัตร (ม.ต้น)", "ปพ.2พ - ประกาศนียบัตร (ม.ปลาย)", "ปพ.3", "ปพ.5", "ปพ.6", "ปพ.7ก", "ปพ.7ข"],
        military: ["ใบวิทยฐานะ - สำเร็จการฝึกวิชาทหาร", "สด.8", "สด.9", "สด.35", "สด.43"],
        police: ["ใบอนุญาตขับรถยนต์ส่วนบุคคลชั่วคราว", "ใบอนุญาตขับจักรยานยนต์ส่วนบุคคลชั่วคราว"]
    };

    typeSelect.innerHTML = '<option value="">-- เลือกประเภทเอกสาร --</option>';
    if (docData[agency]) {
        docData[agency].forEach(type => {
            typeSelect.innerHTML += `<option value="${type}">${type}</option>`;
        });
    }
}

async function verifyDocument() {
    const user = document.getElementById('roblox-username').value.trim();
    const type = document.getElementById('doc-type-select').value;
    const resultArea = document.getElementById('verify-result-area');
    const overlay = document.getElementById('status-overlay');
    const loadBar = document.getElementById('load-bar');

    if (!user || !type) { showNotify("กรุณากรอกชื่อผู้ใช้และประเภทเอกสาร", "error"); return; }

    resultArea.innerHTML = '';
    overlay.style.display = 'flex';
    loadBar.style.width = '0%';
    
    // จำลองการโหลด
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 100) progress = 100;
        loadBar.style.width = progress + '%';

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                overlay.style.display = 'none';
                const found = allDocuments.find(d => 
                    d.roblox_username.toLowerCase() === user.toLowerCase() && 
                    d.doc_type === type
                );

                if (found) {
                    showNotify("พบบันทึกข้อมูลสำเร็จ");
                    renderResultCard(found);
                } else {
                    showNotify("ไม่พบบันทึกข้อมูลในระบบ", "error");
                }
            }, 500);
        }
    }, 200);
}

function renderResultCard(data) {
    const resultArea = document.getElementById('verify-result-area');
    const imgs = data.images.map(i => `<img src="${i}" style="width:100%; border-radius:10px; margin-bottom:10px; border:1px solid #eee;">`).join('');

    resultArea.innerHTML = `
        <div class="doc-result-card">
            <span class="status-tag status-ok">✔️ ${data.status}</span>
            <h2 style="color:var(--primary); margin-bottom:15px;">${data.doc_type}</h2>
            <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin-bottom:20px;">
                <p><b>ชื่อผู้ถือครอง:</b> ${data.roblox_username}</p>
                <p><b>รหัสเอกสาร:</b> ${data.doc_id}</p>
                <p><b>หน่วยงาน:</b> ${data.issuer}</p>
            </div>
            <p><b>รายละเอียดเพิ่มเติม:</b><br>${data.detail}</p>
            ${data.note ? `<p style="color:#dc2626; margin-top:10px;"><b>หมายเหตุ:</b> ${data.note}</p>` : ''}
            <div style="margin-top:20px;">${imgs}</div>
        </div>`;
    resultArea.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// 3. ระบบบุคลากร & ข่าว (Personnel & News)
// ==========================================

async function fetchPersonnel() {
    const lists = {
        'founder-list': 'founder',
        'school-list': 'school',
        'police-list': 'police'
    };
    try {
        const res = await fetch('members.json');
        const data = await res.json();
        Object.keys(lists).forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = data.filter(m => m.category === lists[id]).map(m => `
                <div class="card p-card" onclick="openBio(${m.id})">
                    <img src="${m.img}">
                    <h4>${m.name}</h4>
                    <p style="color:#777; font-size:0.85rem;">${m.role}</p>
                </div>
            `).join('');
        });
    } catch (e) {}
}

function openBio(id) {
    fetch('members.json').then(r => r.json()).then(data => {
        const m = data.find(i => i.id === id);
        if(!m) return;
        document.getElementById('m-name').innerText = m.name;
        document.getElementById('m-role').innerText = m.role;
        document.getElementById('m-dept').innerText = m.dept;
        document.getElementById('m-bio').innerHTML = linkify(m.bio);
        document.getElementById('bio-modal').style.display = 'flex';
    });
}

function closeModal() {
    document.getElementById('bio-modal').style.display = 'none';
}

// ==========================================
// 4. เริ่มต้นระบบเมื่อโหลดหน้า (Init)
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    fetchPersonnel();
    loadDocData();
    // ถ้ามีฟังก์ชันข่าว (index.html) ก็ใส่ตรงนี้
});
