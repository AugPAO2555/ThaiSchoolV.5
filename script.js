// ==========================================
// ส่วนที่ 0: ฟังก์ชันวิเศษเปลี่ยนข้อความเป็นลิงก์ (Linkify)
// ==========================================
function linkify(text) {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<br><br><a href="${url}" target="_blank" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 10px;">🔗 คลิกเพื่อเข้าสู่เว็บไซต์: ${url}</a><br>`;
    });
}

// ==========================================
// ส่วนที่ 1: ระบบข่าวสาร (หน้าแรก & หน้าเนื้อหา)
// ==========================================
async function fetchNews() {
    const box = document.getElementById('news-container');
    if (!box) return;
    try {
        const res = await fetch('news.json');
        const data = (await res.json()).reverse(); 
        box.innerHTML = data.map(n => {
            const displayImg = n.img && n.img.trim() !== "" ? n.img : "https://via.placeholder.com/600x340?text=Thai+School+News";
            return `
                <div class="card">
                    <img src="${displayImg}">
                    <div class="card-body">
                        <p class="card-date">${n.date}</p>
                        <h3>${n.title}</h3>
                        <p style="font-size: 0.85rem; color: #666; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 15px;">
                            ${n.desc || ""}
                        </p>
                        <a href="post.html?id=${n.id}" class="btn">อ่านต่อ</a>
                    </div>
                </div>`;
        }).join('');
    } catch (err) { console.error("โหลดข่าวไม่สำเร็จ:", err); }
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
                    <h1 style="font-size: 2rem; color: #0f172a; margin-bottom: 10px;">${post.title}</h1>
                    <p style="color: #64748b; margin-bottom: 25px;">วันที่ประกาศ: ${post.date}</p>
                    ${post.img ? `<img src="${post.img}" style="width:100%; border-radius:15px; margin-bottom:30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">` : ''}
                    <div style="white-space: pre-line; line-height: 1.8; color: #334155; font-size: 1.1rem; background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0;">
                        ${linkify(post.desc)}
                    </div>
                    <div style="margin-top: 40px;"><a href="index.html" style="color: #64748b; text-decoration: none; font-weight: 600;">← กลับไปที่หน้าข่าว</a></div>
                </div>`;
        }
    });
}

// ==========================================
// ส่วนที่ 2: ระบบบุคลากร
// ==========================================
async function fetchPersonnel() {
    try {
        const res = await fetch('members.json');
        const data = await res.json();
        const render = (listId, cat) => {
            const el = document.getElementById(listId);
            if (!el) return;
            el.innerHTML = data.filter(m => m.category === cat).map(m => `
                <div class="card p-card" onclick="openBio(${m.id})">
                    <img src="${m.img}" style="width: 120px; height: 160px; object-fit: contain; background: #f4f4f4; border-radius: 8px; margin-bottom: 15px;">
                    <h4>${m.name}</h4>
                    <p style="color:#777; font-size:0.9rem;">${m.role}</p>
                </div>`).join('');
        };
        render('founder-list', 'founder');
        render('school-list', 'school');
        render('police-list', 'police');
    } catch (err) { console.error("โหลดบุคลากรไม่สำเร็จ:", err); }
}

function openBio(id) {
    fetch('members.json').then(res => res.json()).then(data => {
        const m = data.find(item => item.id === id);
        if (!m) return;
        document.getElementById('m-name').innerText = m.name;
        document.getElementById('m-role').innerText = m.role;
        document.getElementById('m-dept').innerText = m.dept;
        document.getElementById('m-bio').innerText = m.bio;
        const modal = document.getElementById('bio-modal');
        if (modal) modal.style.display = 'flex';
    });
}

function closeModal() {
    const modal = document.getElementById('bio-modal');
    if (modal) modal.style.display = 'none';
}

// ==========================================
// ส่วนที่ 3: ระบบตรวจสอบเอกสาร (บูรณาการ Layout ใหม่)
// ==========================================
let allDocuments = [];
async function loadDocData() {
    try {
        const res = await fetch('documents.json');
        allDocuments = await res.json();
    } catch (err) { console.error("โหลดข้อมูลเอกสารล้มเหลว:", err); }
}

const docData = {
    school: ["ปพ.1บ - มัธยมศึกษาตอนต้น", "ปพ.1พ - มัธยมศึกษาตอนปลาย", "ปพ.2บ", "ปพ.2พ", "ปพ.3", "ปพ.5", "ปพ.6", "ปพ.7ก", "ปพ.7ข"],
    military: ["ใบวิทยฐานะ", "สด.8", "สด.9", "สด.35", "สด.43"],
    police: ["ใบอนุญาตขับรถยนต์ส่วนบุคคลชั่วคราว", "ใบอนุญาตขับจักรยานยนต์ส่วนบุคคลชั่วคราว"]
};

function updateDocTypes() {
    const agency = document.getElementById('agency-select').value;
    const typeSelect = document.getElementById('doc-type-select');
    if(!typeSelect) return;
    typeSelect.innerHTML = '<option value="">-- เลือกประเภทเอกสาร --</option>';
    if (docData[agency]) {
        docData[agency].forEach(type => { typeSelect.innerHTML += `<option value="${type}">${type}</option>`; });
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
            else { showNotify("ไม่พบข้อมูลที่ระบุ", "error"); }
        }
    }, 300);
}

function renderResultCard(found) {
    const resultArea = document.getElementById('verify-result-area');
    const grade = found.extra_info?.grade || found.extra_info?.gpa || "-";
    const level = found.extra_info?.level || "-";

    resultArea.innerHTML = `
        <div class="doc-result-card" style="background:#fff; padding:30px; border-radius:20px; border: 1px solid #f1f5f9; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-top:30px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="margin:0; font-size:1.4rem;">${found.doc_type}</h2>
                <span style="background:#e6f6ee; color:#00a859; padding:8px 18px; border-radius:50px; font-weight:bold; font-size:0.85rem;">ตรวจสอบแล้ว - ถูกต้อง</span>
            </div>
            <p style="color:#64748b; font-size:0.9rem; margin-bottom:20px;">รหัสอ้างอิงเอกสาร: ${found.doc_id}</p>
            
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; margin-bottom:25px;">
                <div style="background:#f8fafc; padding:15px; border-radius:12px; text-align:center;">
                    <small style="color:#94a3b8; display:block; margin-bottom:4px;">ระดับ/ชั้น/ปี</small><b>${level}</b>
                </div>
                <div style="background:#f8fafc; padding:15px; border-radius:12px; text-align:center;">
                    <small style="color:#94a3b8; display:block; margin-bottom:4px;">เกรดเฉลี่ย</small><b style="color:#00a859;">${grade}</b>
                </div>
                <div style="background:#f8fafc; padding:15px; border-radius:12px; text-align:center;">
                    <small style="color:#94a3b8; display:block; margin-bottom:4px;">วันที่ออก</small><b>${found.extra_info?.issued_date || "-"}</b>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:25px;">
                ${found.images.filter(img => img !== "").map((img, i) => `
                    <div style="text-align:center;">
                        <img src="${img}" style="width:100%; border-radius:12px; border:1px solid #eee;">
                        <p style="font-size:0.75rem; color:#94a3b8; margin-top:8px;">เอกสารหน้าที่ ${i+1}</p>
                    </div>`).join('')}
            </div>

            <div style="background:#f8fafc; padding:20px; border-radius:12px; border-left:4px solid #00a859;">
                <p style="margin:0;"><b>รายละเอียดเพิ่มเติม:</b> ${found.detail}</p>
                <p style="margin-top:10px; font-size:0.85rem; color:#64748b;"><b>ผู้ออกเอกสาร:</b> ${found.issuer}</p>
            </div>
        </div>`;
}

function showNotify(msg, type = 'success') {
    const banner = document.getElementById('top-notify');
    if(!banner) return;
    banner.innerText = (type === 'success' ? '✔️ ' : '❌ ') + msg;
    banner.className = `top-banner show ${type}`;
    setTimeout(() => { banner.classList.remove('show'); }, 2500);
}

// ==========================================
// ส่วนที่ 4: การรันคำสั่งเมื่อโหลดหน้า
// ==========================================
window.addEventListener('DOMContentLoaded', () => { 
    fetchNews(); 
    fetchPersonnel(); 
    loadDocData(); 
    
    const agencySelect = document.getElementById('agency-select');
    if(agencySelect) agencySelect.addEventListener('change', updateDocTypes);

    if (window.location.pathname.includes('post.html') || window.location.search.includes('id=')) {
        loadPostDetail();
    }
});
