// ==========================================
// 1. ระบบข่าวสาร (News System)
// ==========================================

function linkify(text) {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<br><a href="${url}" target="_self" style="display: inline-block; background: #2563eb; color: white !important; padding: 12px 25px; border-radius: 10px; text-decoration: none !important; font-weight: bold; margin-top: 10px; box-shadow: 0 4px 12px rgba(37,99,235,0.2);">🔗 คลิกเพื่อเข้าสู่เว็บไซต์</a><br>`;
    });
}

async function fetchNews() {
    const box = document.getElementById('news-container');
    if (!box) return;
    try {
        const res = await fetch('news.json');
        const data = (await res.json()).reverse(); 
        box.innerHTML = data.map(n => `
            <div class="card">
                <img src="${n.img || 'https://via.placeholder.com/600x340?text=Thai+School'}">
                <div class="card-body">
                    <p class="card-date">${n.date}</p>
                    <h3>${n.title}</h3>
                    <a href="post.html?id=${n.id}" class="btn">อ่านต่อ</a>
                </div>
            </div>
        `).join('');
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
                <div style="padding: 20px; max-width: 850px; margin: 0 auto; animation: slideUp 0.5s ease;">
                    <h1 style="font-size: 2.2rem; color: #1a1a1a; margin-bottom: 10px;">${post.title}</h1>
                    <p style="color: #888; margin-bottom: 25px;">📅 ประกาศเมื่อ: ${post.date}</p>
                    ${post.img ? `<div style="border-radius:15px; overflow:hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin-bottom:30px;"><img src="${post.img}" style="width:100%; display:block;"></div>` : ''}
                    <div style="white-space: pre-line; line-height: 2; color: #333; font-size: 1.15rem;">${linkify(post.desc)}</div>
                    <div style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px;"><a href="index.html" style="color: #888; text-decoration: none; font-weight: bold;">← กลับหน้าแรก</a></div>
                </div>`;
        }
    });
}

// ==========================================
// 2. ระบบตรวจสอบเอกสาร (Archive System)
// ==========================================

let allDocuments = [];

async function loadDocData() {
    try {
        const res = await fetch('documents.json');
        allDocuments = await res.json();
    } catch (err) { console.error("โหลดเอกสารไม่สำเร็จ:", err); }
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
            const found = allDocuments.find(d => 
                d.roblox_username.toLowerCase() === user.toLowerCase() && 
                d.doc_type === type
            );
            if (found) { showNotify("ตรวจสอบสำเร็จ!", "success"); renderResultCard(found); }
            else { showNotify("ไม่พบข้อมูลเอกสารนี้", "error"); }
        }
    }, 250);
}

// *** คืนชีพดีไซน์ Grid และแก้บัค 0.00 / ซ่อนช่องว่าง ***
function renderResultCard(found) {
    const resultArea = document.getElementById('verify-result-area');
    if(!resultArea) return;

    // ดึงค่าจาก JSON (รองรับทั้ง grade/gpa และ issued_date)
    const gradeValue = found.extra_info?.grade || found.extra_info?.gpa || null;
    const levelValue = found.extra_info?.level || found.extra_info?.year || null;
    const dateValue = found.extra_info?.issued_date || found.date || '-';

    let imagesHtml = found.images.filter(img => img !== "").map((img, i) => `
        <div style="flex: 1; min-width: 280px; text-align: center; background:#f8fafc; padding:15px; border-radius:12px; border:1px solid #eee;">
            <img src="${img}" style="width:100%; border-radius:8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <p style="font-size:0.8rem; color:#888; margin-top:10px;">เอกสารหน้าที่ ${i+1}</p>
        </div>`).join('');

    // สร้าง Grid เฉพาะที่มีข้อมูล
    let gridHtml = `
        <div style="background:#f9f9f9; padding:15px; border-radius:10px;">
            <small style="color:#888; font-weight:bold;">ระดับชั้น/ปี/รุ่น</small>
            <p style="margin:5px 0 0 0; font-weight:bold;">${levelValue || '-'}</p>
        </div>
    `;

    // ถ้ามีเกรดค่อยโชว์ (แก้บัคเกรด 0.00)
    if (gradeValue) {
        gridHtml += `
            <div style="background:#f9f9f9; padding:15px; border-radius:10px;">
                <small style="color:#888; font-weight:bold;">เกรดเฉลี่ย</small>
                <p style="margin:5px 0 0 0; font-weight:bold; color:#00a859;">${gradeValue}</p>
            </div>
        `;
    }

    gridHtml += `
        <div style="background:#f9f9f9; padding:15px; border-radius:10px;">
            <small style="color:#888; font-weight:bold;">วันที่ออกเอกสาร</small>
            <p style="margin:5px 0 0 0; font-weight:bold;">${dateValue}</p>
        </div>
    `;

    resultArea.innerHTML = `
        <div style="margin-top: 40px; animation: slideUp 0.5s ease;">
            <div style="background:#ffffff; padding:40px; border-radius:20px; box-shadow: 0 20px 45px rgba(0,0,0,0.12); border: 1px solid #eee; position: relative;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
                    <div><h2 style="margin:0; color:#1a1a1a; font-size:1.6rem; font-weight:800;">${found.doc_type}</h2></div>
                    <span style="background:#e6f6ee; color:#00a859; padding:8px 20px; border-radius:50px; font-weight:800; font-size:0.85rem; border:1px solid #00a859;">● ${found.status}</span>
                </div>

                <p style="margin-bottom: 20px; color:#888;">รหัสอ้างอิงเอกสาร: <b>${found.doc_id}</b></p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    ${gridHtml}
                </div>

                <div style="display:flex; flex-wrap:wrap; gap:20px; margin-bottom:30px;">
                    ${imagesHtml}
                </div>

                <div style="background:#f9f9f9; padding:20px; border-radius:12px; border-left: 6px solid #00a859;">
                    <p style="margin:0;"><b>รายละเอียด:</b> ${found.detail}</p>
                    <p style="margin:5px 0 0 0; font-size:0.9rem; color:#888;"><b>ผู้ออกเอกสาร:</b> ${found.issuer}</p>
                    ${found.note ? `<p style="margin:10px 0 0 0; font-size:0.9rem; color:#dc2626;"><b>หมายเหตุ:</b> ${found.note}</p>` : ''}
                </div>
            </div>
        </div>`;
}

// ==========================================
// 3. ระบบบุคลากร & แจ้งเตือน
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
                    <img src="${m.img}">
                    <h4>${m.name}</h4>
                    <p style="color:#777; font-size:0.9rem;">${m.role}</p>
                </div>
            `).join('');
        };
        render('founder-list', 'founder');
        render('school-list', 'school');
        render('police-list', 'police');
    } catch (err) { console.error(err); }
}

function openBio(id) {
    fetch('members.json').then(res => res.json()).then(data => {
        const m = data.find(item => item.id === id);
        if (!m) return;
        document.getElementById('m-name').innerText = m.name;
        document.getElementById('m-role').innerText = m.role;
        document.getElementById('m-dept').innerText = m.dept;
        document.getElementById('m-bio').innerText = m.bio;
        document.getElementById('bio-modal').style.display = 'flex';
    });
}

function closeModal() { document.getElementById('bio-modal').style.display = 'none'; }

function showNotify(msg, type = 'success') {
    const banner = document.getElementById('top-notify');
    if(!banner) return;
    banner.innerText = (type === 'success' ? '✔️ ' : '❌ ') + msg;
    banner.className = `top-banner show ${type}`;
    setTimeout(() => { banner.classList.remove('show'); }, 2500);
}

const docData = {
    school: ["ปพ.1บ - มัธยมศึกษาตอนต้น", "ปพ.1พ - มัธยมศึกษาตอนปลาย", "ปพ.2บ - ประกาศนียบัตร (ม.ต้น)", "ปพ.2พ - ประกาศนียบัตร (ม.ปลาย)", "ปพ.3 - รายงานผู้สำเร็จการศึกษา", "ปพ.5 - แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน", "ปพ.6 - แบบรายงานผลการพัฒนาคุณภาพผู้เรียนรายบุคคล", "ปพ.7ก - ใบรับรองเฉพาะรายวิชา", "ปพ.7ข - ใบรับรองทุกรายวิชา"],
    military: ["ใบวิทยฐานะ - สำเร็จการฝึกวิชาทหาร", "สด.8 - สมุดประจำตัวทหารกองหนุนประเภทที่ 1", "สด.9 - ใบสำคัญ", "สด.35 - หมายเรียก", "สด.43 - ใบรับรองผลการตรวจคัดเลือกทหารกองเกินฯ"],
    police: ["ใบอนุญาตขับรถยนต์ส่วนบุคคลชั่วคราว", "ใบอนุญาตขับจักรยานยนต์ส่วนบุคคลชั่วคราว"]
};

function updateDocTypes() {
    const agency = document.getElementById('agency-select').value;
    const typeSelect = document.getElementById('doc-type-select');
    if(!typeSelect) return;
    typeSelect.innerHTML = '<option value="">-- เลือกประเภทเอกสาร --</option>';
    if (docData[agency]) {
        docData[agency].forEach(type => {
            typeSelect.innerHTML += `<option value="${type}">${type}</option>`;
        });
    }
}

// เริ่มต้นระบบ
window.addEventListener('DOMContentLoaded', () => { 
    fetchNews(); 
    fetchPersonnel(); 
    loadDocData(); 
    if (window.location.search.includes('id=')) {
        loadPostDetail();
    }
});
