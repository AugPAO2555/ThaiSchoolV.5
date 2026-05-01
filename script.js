// ==========================================
// 0. ฟังก์ชันวิเศษ Linkify (สำหรับหน้า Post ข่าว)
// ==========================================
function linkify(text) {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<br><br><a href="${url}" target="_blank" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 10px;">🔗 คลิกเพื่อเข้าสู่เว็บไซต์: ${url}</a><br>`;
    });
}

// ==========================================
// 1. ระบบข่าวสาร (หน้าแรก & อ่านข่าว)
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
                    <p class="card-date">${n.date}</p>
                    <h3>${n.title}</h3>
                    <p class="card-desc-short">${n.desc || ""}</p>
                    <a href="post.html?id=${n.id}" class="btn">อ่านต่อ</a>
                </div>
            </div>`).join('');
    } catch (err) { console.error("News Error:", err); }
}

function loadPostDetail() {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    const contentBox = document.getElementById('post-content'); 
    if (!postId || !contentBox) return;

    fetch('news.json').then(res => res.json()).then(data => {
        const post = data.find(n => n.id == postId);
        if (post) {
            contentBox.innerHTML = `
                <div class="post-container">
                    <h1>${post.title}</h1>
                    <p>วันที่ประกาศ: ${post.date}</p>
                    ${post.img ? `<img src="${post.img}" style="width:100%; border-radius:15px; margin-bottom:20px;">` : ''}
                    <div class="post-body">${linkify(post.desc)}</div>
                    <div style="margin-top:30px;"><a href="index.html">← กลับไปที่หน้าข่าว</a></div>
                </div>`;
        }
    });
}

// ==========================================
// 2. ระบบบุคลากร (Bio Modal)
// ==========================================
async function fetchPersonnel() {
    try {
        const res = await fetch('members.json');
        const data = await res.json();
        const render = (id, cat) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = data.filter(m => m.category === cat).map(m => `
                <div class="p-card" onclick="openBio(${m.id})">
                    <img src="${m.img}">
                    <h4>${m.name}</h4>
                    <p>${m.role}</p>
                </div>`).join('');
        };
        render('founder-list', 'founder');
        render('school-list', 'school');
        render('police-list', 'police');
    } catch (err) { console.error("Personnel Error:", err); }
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

// ==========================================
// 3. ระบบตรวจสอบเอกสาร (เกรดสีเขียว + Grid ตามรูป)
// ==========================================
let allDocuments = [];
fetch('documents.json').then(res => res.json()).then(d => allDocuments = d);

const docCategories = {
    school: ["ปพ.1บ - มัธยมศึกษาตอนต้น", "ปพ.1พ - มัธยมศึกษาตอนปลาย", "ปพ.2บ", "ปพ.2พ", "ปพ.7"],
    military: ["ใบวิทยฐานะ", "สด.8", "สด.43"],
    police: ["ใบอนุญาตขับรถยนต์"]
};

function updateDocTypes() {
    const agency = document.getElementById('agency-select').value;
    const typeSelect = document.getElementById('doc-type-select');
    if(!typeSelect) return;
    typeSelect.innerHTML = '<option value="">-- เลือกประเภทเอกสาร --</option>';
    if (docCategories[agency]) {
        docCategories[agency].forEach(t => typeSelect.innerHTML += `<option value="${t}">${t}</option>`);
    }
}

async function verifyDocument() {
    const user = document.getElementById('roblox-username').value.trim();
    const type = document.getElementById('doc-type-select').value;
    const resultArea = document.getElementById('verify-result-area');
    const overlay = document.getElementById('status-overlay');
    const loadBar = document.getElementById('load-bar');

    if (!user || !type) { showNotify("กรุณากรอกข้อมูลให้ครบถ้วน", "error"); return; }

    resultArea.innerHTML = '';
    overlay.style.display = 'flex';
    loadBar.style.width = '0%';

    let progress = 0;
    const interval = setInterval(() => {
        progress += 25;
        loadBar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(interval);
            overlay.style.display = 'none';
            const found = allDocuments.find(d => d.roblox_username.toLowerCase() === user.toLowerCase() && d.doc_type === type);
            if (found) { showNotify("ตรวจสอบสำเร็จ!", "success"); renderResultCard(found); }
            else { showNotify("ไม่พบข้อมูล", "error"); }
        }
    }, 300);
}

function renderResultCard(found) {
    const resultArea = document.getElementById('verify-result-area');
    const gradeValue = found.extra_info?.grade || found.extra_info?.gpa || "0.00";

    resultArea.innerHTML = `
        <div class="doc-result-card" style="background:#fff; border-radius:20px; padding:30px; border:1px solid #f1f5f9; box-shadow:0 10px 30px rgba(0,0,0,0.05); margin-top:30px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="margin:0; font-size:1.3rem;">${found.doc_type}</h2>
                <span style="background:#e6f6ee; color:#10b981; padding:8px 18px; border-radius:50px; font-weight:bold; font-size:0.8rem;">ตรวจสอบแล้ว - ถูกต้อง</span>
            </div>
            <p style="color:#64748b; font-size:0.85rem; margin-bottom:20px;">รหัสอ้างอิงเอกสาร: ${found.doc_id}</p>

            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; margin-bottom:25px;">
                <div style="background:#f8fafc; padding:15px; border-radius:12px; text-align:center;">
                    <small style="color:#94a3b8; display:block; font-size:0.7rem;">ระดับ/ชั้น/ปี</small>
                    <b style="font-size:0.95rem;">${found.extra_info?.level || "-"}</b>
                </div>
                <div style="background:#f8fafc; padding:15px; border-radius:12px; text-align:center;">
                    <small style="color:#94a3b8; display:block; font-size:0.7rem;">เกรดเฉลี่ย</small>
                    <b style="font-size:1.1rem; color:#10b981;">${gradeValue}</b>
                </div>
                <div style="background:#f8fafc; padding:15px; border-radius:12px; text-align:center;">
                    <small style="color:#94a3b8; display:block; font-size:0.7rem;">วันที่ออก</small>
                    <b style="font-size:0.95rem;">${found.extra_info?.issued_date || "-"}</b>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:25px;">
                ${found.images.map((img, i) => `
                    <div style="text-align:center;">
                        <img src="${img}" style="width:100%; border-radius:12px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.02);">
                        <p style="color:#94a3b8; font-size:0.7rem; margin-top:8px;">เอกสารหน้าที่ ${i+1}</p>
                    </div>`).join('')}
            </div>

            <div style="background:#f8fafc; padding:20px; border-radius:12px; border-left:4px solid #10b981;">
                <p style="margin:0; font-size:0.95rem;"><b>รายละเอียดเพิ่มเติม:</b> ${found.detail}</p>
                <p style="margin-top:10px; font-size:0.85rem; color:#64748b;"><b>ผู้ออกเอกสาร:</b> ${found.issuer}</p>
            </div>
        </div>`;
}

function showNotify(msg, type) {
    const banner = document.getElementById('top-notify');
    if(!banner) return;
    banner.innerText = (type === 'success' ? '✔️ ' : '❌ ') + msg;
    banner.className = `top-banner show ${type}`;
    setTimeout(() => banner.classList.remove('show'), 2500);
}

// ==========================================
// 4. ส่วนเริ่มต้น (Init)
// ==========================================
window.addEventListener('DOMContentLoaded', () => { 
    fetchNews(); fetchPersonnel();
    const ag = document.getElementById('agency-select');
    if(ag) ag.addEventListener('change', updateDocTypes);
    if (window.location.search.includes('id=')) loadPostDetail();
});
