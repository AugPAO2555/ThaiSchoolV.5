// ==========================================
// 0. ฟังก์ชัน Linkify (สำหรับหน้าอ่านข่าว)
// ==========================================
function linkify(text) {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<br><br><a href="${url}" target="_blank" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 10px;">🔗 คลิกเพื่อเข้าสู่เว็บไซต์: ${url}</a><br>`;
    });
}

// ==========================================
// 1. ระบบข่าวสาร (ย่อเนื้อหาหน้าแรกให้คลีน)
// ==========================================
async function fetchNews() {
    const box = document.getElementById('news-container');
    if (!box) return;
    try {
        const res = await fetch('news.json');
        const data = (await res.json()).reverse(); 
        box.innerHTML = data.map(n => {
            // ย่อเนื้อหาข่าวให้เหลือ 100 ตัวอักษร ไม่ให้รกหน้าแรก
            const shortDesc = n.desc ? (n.desc.substring(0, 100) + "...") : "ไม่มีรายละเอียด";
            return `
                <div class="card">
                    <img src="${n.img || ''}">
                    <div class="card-body">
                        <p class="card-date">${n.date}</p>
                        <h3>${n.title}</h3>
                        <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 15px;">${shortDesc}</p>
                        <a href="post.html?id=${n.id}" class="btn">อ่านต่อ</a>
                    </div>
                </div>`;
        }).join('');
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
                <div class="post-container" style="max-width: 800px; margin: 0 auto; padding: 20px;">
                    <h1>${post.title}</h1>
                    <p style="color: #64748b; margin-bottom: 25px;">วันที่ประกาศ: ${post.date}</p>
                    ${post.img ? `<img src="${post.img}" style="width:100%; border-radius:15px; margin-bottom:30px;">` : ''}
                    <div style="white-space: pre-line; line-height: 1.8; color: #334155;">${linkify(post.desc)}</div>
                    <div style="margin-top: 40px;"><a href="index.html">← กลับไปที่หน้าข่าว</a></div>
                </div>`;
        }
    });
}

// ==========================================
// 2. ระบบบุคลากร (เช็คประวัติ ถ้าไม่มีให้ขึ้นบอก)
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
        render('founder-list', 'founder'); render('school-list', 'school'); render('police-list', 'police');
    } catch (err) { console.error("Personnel Error:", err); }
}

function openBio(id) {
    fetch('members.json').then(r => r.json()).then(data => {
        const m = data.find(i => i.id === id);
        if (!m) return;
        document.getElementById('m-name').innerText = m.name;
        document.getElementById('m-role').innerText = m.role;
        document.getElementById('m-dept').innerText = m.dept;
        document.getElementById('m-bio').innerText = m.bio || "ไม่มีข้อมูลวิสัยทัศน์";

        const edu = document.getElementById('m-edu-list');
        const exp = document.getElementById('m-exp-list');
        if(edu) edu.innerHTML = (m.education && m.education.length > 0) ? m.education.map(e => `<p>• ${e}</p>`).join('') : '<p style="color:#94a3b8;">ไม่มีข้อมูลประวัติการศึกษา</p>';
        if(exp) exp.innerHTML = (m.experience && m.experience.length > 0) ? m.experience.map(e => `<p>• ${e}</p>`).join('') : '<p style="color:#94a3b8;">ไม่มีข้อมูลประวัติการทำงาน</p>';

        document.getElementById('bio-modal').style.display = 'flex';
    });
}

function closeModal() { document.getElementById('bio-modal').style.display = 'none'; }

// ==========================================
// 3. ระบบตรวจสอบเอกสาร (เกรดสีดำ + แก้บัคเลือกหน่วยงาน)
// ==========================================
let allDocuments = [];
fetch('documents.json').then(res => res.json()).then(d => allDocuments = d);

const docCategories = {
    school: ["ปพ.1บ - มัธยมศึกษาตอนต้น", "ปพ.1พ - มัธยมศึกษาตอนปลาย", "ปพ.2", "ปพ.7"],
    military: ["ใบวิทยฐานะ", "สด.8", "สด.43"],
    police: ["ใบอนุญาตขับรถยนต์"]
};

function updateDocTypes() {
    const agency = document.getElementById('agency-select').value;
    const typeSelect = document.getElementById('doc-type-select');
    if(!typeSelect) return;
    typeSelect.innerHTML = '<option value="">-- เลือกประเภทเอกสาร --</option>';
    if (docCategories[agency]) {
        docCategories[agency].forEach(t => {
            const opt = document.createElement('option');
            opt.value = t; opt.textContent = t;
            typeSelect.appendChild(opt);
        });
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
            
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; margin-bottom:25px;">
                <div style="background:#f8fafc; padding:15px; border-radius:12px; text-align:center;">
                    <small style="color:#94a3b8; display:block; font-size:0.75rem;">ระดับ/ชั้น/ปี</small>
                    <b style="color:#1e293b;">${found.extra_info?.level || "-"}</b>
                </div>
                <div style="background:#f8fafc; padding:15px; border-radius:12px; text-align:center;">
                    <small style="color:#94a3b8; display:block; font-size:0.75rem;">เกรดเฉลี่ย</small>
                    <b style="color:#1e293b; font-size:1.1rem;">${gradeValue}</b> </div>
                <div style="background:#f8fafc; padding:15px; border-radius:12px; text-align:center;">
                    <small style="color:#94a3b8; display:block; font-size:0.75rem;">วันที่ออก</small>
                    <b style="color:#1e293b;">${found.extra_info?.issued_date || "-"}</b>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:25px;">
                ${found.images.map((img, i) => `
                    <div style="text-align:center;">
                        <img src="${img}" style="width:100%; border-radius:12px; border:1px solid #eee;">
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
// Init
// ==========================================
window.addEventListener('DOMContentLoaded', () => { 
    fetchNews(); fetchPersonnel();
    const ag = document.getElementById('agency-select');
    if(ag) ag.addEventListener('change', updateDocTypes);
    if (window.location.search.includes('id=')) loadPostDetail();
});
