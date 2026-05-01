// ==========================================
// 0. ระบบลิ้งค์วิเศษ (Linkify) - คืนชีพ!
// ==========================================
function linkify(text) {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<br><br><a href="${url}" target="_blank" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">🔗 คลิกเข้าสู่เว็บไซต์: ${url}</a><br>`;
    });
}

// ==========================================
// 1. ระบบข่าว (ดึงจาก news.json ใน Repo พี่)
// ==========================================
async function fetchNews() {
    const box = document.getElementById('news-container');
    if (!box) return;
    try {
        const res = await fetch('news.json');
        const data = (await res.json()).reverse(); 
        box.innerHTML = data.map(n => `
            <div class="card">
                <img src="${n.img || ''}" style="width:100%; height:200px; object-fit:cover;">
                <div class="card-body">
                    <p class="card-date">${n.date}</p>
                    <h3>${n.title}</h3>
                    <p class="card-desc-short">${n.desc ? n.desc.substring(0, 90) + '...' : ''}</p>
                    <a href="post.html?id=${n.id}" class="btn">อ่านต่อ</a>
                </div>
            </div>`).join('');
    } catch (err) { console.error("News Error:", err); }
}

// ฟังก์ชันโหลดรายละเอียดข่าว (ใช้ใน post.html)
function loadPostDetail() {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    const contentBox = document.getElementById('post-content'); 
    if (!postId || !contentBox) return;

    fetch('news.json').then(res => res.json()).then(data => {
        const post = data.find(n => n.id == postId);
        if (post) {
            contentBox.innerHTML = `
                <div class="post-container" style="max-width:800px; margin:0 auto; padding:20px;">
                    <h1 style="font-size:2.2rem; margin-bottom:10px;">${post.title}</h1>
                    <p style="color:#64748b; margin-bottom:20px;">วันที่ประกาศ: ${post.date}</p>
                    ${post.img ? `<img src="${post.img}" style="width:100%; border-radius:15px; margin-bottom:30px;">` : ''}
                    <div style="white-space: pre-line; line-height: 1.8; font-size:1.1rem; color:#334155;">
                        ${linkify(post.desc)} 
                    </div>
                </div>`;
        }
    });
}

// ==========================================
// 2. ระบบบุคลากร (ดึงจาก members.json ใน Repo พี่)
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
        // อ้างอิง ID ตามที่พี่เขียนใน HTML (founder-list, school-list, police-list)
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
        document.getElementById('m-dept').innerText = m.dept || "ฝ่ายบริหาร";
        document.getElementById('m-bio').innerText = m.bio || "ไม่มีข้อมูลวิสัยทัศน์";

        const edu = document.getElementById('m-edu-list');
        const exp = document.getElementById('m-exp-list');
        // ถ้าไม่มีประวัติ ให้ขึ้นบอก ไม่ให้หายไปเฉยๆ
        if(edu) edu.innerHTML = (m.education && m.education.length > 0) ? m.education.map(e => `<p>• ${e}</p>`).join('') : '<p style="color:#94a3b8;">ไม่มีประวัติการศึกษา</p>';
        if(exp) exp.innerHTML = (m.experience && m.experience.length > 0) ? m.experience.map(e => `<p>• ${e}</p>`).join('') : '<p style="color:#94a3b8;">ไม่มีประวัติการทำงาน</p>';
        
        const modal = document.getElementById('bio-modal');
        if(modal) modal.style.display = 'flex';
    });
}

function closeModal() { document.getElementById('bio-modal').style.display = 'none'; }

// ==========================================
// 3. ระบบตรวจสอบเอกสาร (เกรดสีดำ + แก้บัคเลือกหน่วยงาน)
// ==========================================
let allDocuments = [];
fetch('documents.json').then(res => res.json()).then(d => allDocuments = d);

const docMap = {
    school: ["ปพ.1บ", "ปพ.1พ", "ปพ.2", "ปพ.7"],
    military: ["ใบวิทยฐานะ", "สด.8", "สด.43"],
    police: ["ใบอนุญาตขับรถยนต์ส่วนบุคคล"]
};

function updateDocTypes() {
    const agency = document.getElementById('agency-select').value;
    const typeSelect = document.getElementById('doc-type-select');
    if(!typeSelect) return;
    typeSelect.innerHTML = '<option value="">-- เลือกประเภทเอกสาร --</option>';
    if (docMap[agency]) {
        docMap[agency].forEach(t => {
            typeSelect.innerHTML += `<option value="${t}">${t}</option>`;
        });
    }
}

function renderResultCard(found) {
    const resultArea = document.getElementById('verify-result-area');
    resultArea.innerHTML = `
        <div class="doc-result-card" style="background:#fff; border-radius:20px; padding:30px; border:1px solid #f1f5f9; margin-top:30px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="margin:0; font-size:1.3rem;">${found.doc_type}</h2>
                <span style="background:#e6f6ee; color:#10b981; padding:8px 18px; border-radius:50px; font-weight:bold; font-size:0.8rem;">ถูกต้อง</span>
            </div>
            
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; margin-bottom:25px;">
                <div style="background:#f8fafc; padding:15px; border-radius:12px; text-align:center;">
                    <small style="color:#94a3b8; font-size:0.75rem;">ระดับ/ชั้น</small><br>
                    <b style="color:#1e293b;">${found.extra_info?.level || "-"}</b>
                </div>
                <div style="background:#f8fafc; padding:15px; border-radius:12px; text-align:center;">
                    <small style="color:#94a3b8; font-size:0.75rem;">เกรดเฉลี่ย</small><br>
                    <b style="color:#1e293b; font-size:1.2rem;">${found.extra_info?.grade || "0.00"}</b> </div>
                <div style="background:#f8fafc; padding:15px; border-radius:12px; text-align:center;">
                    <small style="color:#94a3b8; font-size:0.75rem;">วันที่ออก</small><br>
                    <b style="color:#1e293b;">${found.extra_info?.issued_date || "-"}</b>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                ${found.images.map((img, i) => `<img src="${img}" style="width:100%; border-radius:10px; border:1px solid #eee;">`).join('')}
            </div>
        </div>`;
}

// ==========================================
// การเริ่มต้นระบบ (Init)
// ==========================================
window.addEventListener('DOMContentLoaded', () => { 
    fetchNews(); 
    fetchPersonnel();
    const ag = document.getElementById('agency-select');
    if(ag) ag.addEventListener('change', updateDocTypes);
    if (window.location.search.includes('id=')) loadPostDetail();
});
