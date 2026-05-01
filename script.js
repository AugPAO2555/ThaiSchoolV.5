// ==========================================
// ส่วนที่ 0: ฟังก์ชันวิเศษเปลี่ยนข้อความเป็นลิงก์ (Linkify)
// ==========================================
function linkify(text) {
    if (!text) return "";
    // สแกนหา https:// หรือ http:// ในข้อความ
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        // เปลี่ยนข้อความให้กลายเป็นแท็ก <a> เพื่อให้กดแล้ว "เข้าปายยย" ได้จริง
        return `<br><br><a href="${url}" target="_blank" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 10px;">🔗 คลิกเพื่อเข้าสู่เว็บไซต์: ${url}</a><br>`;
    });
}

// ==========================================
// ส่วนที่ 1: ระบบข่าวสาร (หน้าแรก)
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
                </div>
            `;
        }).join('');
    } catch (err) { console.error("โหลดข่าวไม่สำเร็จ:", err); }
}

// *** ส่วนที่พี่ต้องใช้: โหลดเนื้อหาข่าวและทำให้ลิงก์กดได้ ***
function loadPostDetail() {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    const contentBox = document.getElementById('post-content'); 
    
    if (!postId || !contentBox) return;

    fetch('news.json').then(res => res.json()).then(data => {
        const post = data.find(n => n.id == postId);
        if (post) {
            // ใช้ฟังก์ชัน linkify ครอบ post.desc เพื่อทำให้ลิงก์กดได้จริง
            contentBox.innerHTML = `
                <div class="post-container" style="max-width: 800px; margin: 0 auto; padding: 20px;">
                    <h1 style="font-size: 2rem; color: #0f172a; margin-bottom: 10px;">${post.title}</h1>
                    <p style="color: #64748b; margin-bottom: 25px;">วันที่ประกาศ: ${post.date}</p>
                    
                    ${post.img ? `<img src="${post.img}" style="width:100%; border-radius:15px; margin-bottom:30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">` : ''}
                    
                    <div style="white-space: pre-line; line-height: 1.8; color: #334155; font-size: 1.1rem; background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0;">
                        ${linkify(post.desc)}
                    </div>

                    <div style="margin-top: 40px;">
                        <a href="index.html" style="color: #64748b; text-decoration: none; font-weight: 600;">← กลับไปที่หน้าข่าว</a>
                    </div>
                </div>
            `;
        }
    }).catch(err => console.error("โหลดเนื้อหาข่าวล้มเหลว:", err));
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
// ส่วนที่ 3: ระบบตรวจสอบเอกสาร (พร้อมหมายเหตุ)
// ==========================================
let allDocuments = [];

async function loadDocData() {
    try {
        const res = await fetch('documents.json');
        allDocuments = await res.json();
    } catch (err) { console.error("โหลดข้อมูลเอกสารล้มเหลว:", err); }
}

const docData = {
    school: ["ปพ.1บ - มัธยมศึกษาตอนต้น", "ปพ.1พ - มัธยมศึกษาตอนปลาย", "ปพ.2บ - ประกาศนียบัตร (ม.ต้น)", "ปพ.2พ - ประกาศนียบัตร (ม.ปลาย)", "ปพ.3", "ปพ.5", "ปพ.6", "ปพ.7ก", "ปพ.7ข"],
    military: ["ใบวิทยฐานะ - สำเร็จการฝึกวิชาทหาร", "สด.8", "สด.9", "สด.35", "สด.43"],
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

function showExtraFields() {
    const type = document.getElementById('doc-type-select').value;
    const area = document.getElementById('extra-inputs');
    if(!area || !type) return;
    area.innerHTML = ''; 
    let html = '';
    const style = `style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-top: 5px;"`;
    const filtered = allDocuments.filter(d => d.doc_type === type);
    const years = [...new Set(filtered.map(d => d.extra_info?.year).filter(Boolean))].sort();
    if (years.length > 0) html += `<div><small>ปีการศึกษา</small><select id="ex-year" ${style}>${years.map(y => `<option value="${y}">${y}</option>`).join('')}</select></div>`;
    area.innerHTML = html;
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
            const found = allDocuments.find(d => {
                const matchUser = d.roblox_username.toLowerCase() === user.toLowerCase();
                const matchType = d.doc_type === type;
                const selYear = document.getElementById('ex-year')?.value;
                let matchYear = true;
                if (selYear && d.extra_info?.year !== selYear) matchYear = false;
                return matchUser && matchType && matchYear;
            });

            if (found) { showNotify("ตรวจสอบสำเร็จ!", "success"); renderResultCard(found); }
            else { showNotify("ไม่พบข้อมูลที่ระบุ", "error"); }
        }
    }, 300);
}

function renderResultCard(found) {
    const resultArea = document.getElementById('verify-result-area');
    let imagesHtml = found.images.filter(img => img !== "").map((img, i) => `
        <div style="flex: 1; min-width: 280px; text-align: center;">
            <img src="${img}" style="width:100%; border-radius:10px; border: 1px solid #eee;">
            <p style="font-size:0.8rem; color:#666;">เอกสารหน้าที่ ${i+1}</p>
        </div>`).join('');

    resultArea.innerHTML = `
        <div style="background:#fff; padding:30px; border-radius:20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #f1f5f9; margin-top:30px;">
            <h2 style="margin-top:0; color:#10b981;">${found.doc_type}</h2>
            <p><b>สถานะ:</b> <span style="color:#10b981; font-weight: bold;">${found.status}</span></p>
            <p><b>รหัสเอกสาร:</b> ${found.doc_id}</p>
            <div style="display:flex; flex-wrap:wrap; gap:20px; margin: 25px 0;">${imagesHtml}</div>
            <div style="background:#f8fafc; padding:20px; border-radius:12px; border-left: 4px solid #10b981;">
                <p><b>รายละเอียด:</b> ${found.detail}</p>
                <p><b>ผู้ออกเอกสาร:</b> ${found.issuer}</p>
                ${found.note ? `<p style="color:#ef4444; margin-top:10px;"><b>หมายเหตุ:</b> ${found.note}</p>` : ''}
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

// ตัวจัดการการทำงานเมื่อโหลดหน้าเสร็จ
window.addEventListener('DOMContentLoaded', () => { 
    fetchNews(); 
    fetchPersonnel(); 
    loadDocData(); 
    
    // ตรวจสอบว่าถ้าหน้าปัจจุบันคือ post.html ให้รันฟังก์ชันโหลดข่าวทันที
    if (window.location.pathname.includes('post.html') || window.location.search.includes('id=')) {
        loadPostDetail();
    }
});