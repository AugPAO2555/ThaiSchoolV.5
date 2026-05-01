// ==========================================
// 1. ฟังก์ชันวิเศษ Linkify (เปลี่ยนลิงก์ในข่าวให้กดได้)
// ==========================================
function linkify(text) {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<br><br><a href="${url}" target="_blank" class="linkify-btn">🔗 คลิกเพื่อเข้าสู่เว็บไซต์: ${url}</a><br>`;
    });
}

// ==========================================
// 2. ระบบข่าวสาร (News System)
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
            </div>
        `).join('');
    } catch (err) { console.error("News Error:", err); }
}

// โหลดเนื้อหาข่าวในหน้า post.html
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
                    <p class="post-meta">วันที่ประกาศ: ${post.date}</p>
                    ${post.img ? `<img src="${post.img}" class="post-main-img">` : ''}
                    <div class="post-body-content">${linkify(post.desc)}</div>
                    <div style="margin-top: 40px;"><a href="index.html" class="back-link">← กลับไปที่หน้าข่าว</a></div>
                </div>`;
        }
    });
}

// ==========================================
// 3. ระบบบุคลากร (Personnel System)
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
    } catch (err) { console.error("Personnel Error:", err); }
}

function openBio(id) {
    fetch('members.json').then(res => res.json()).then(data => {
        const m = data.find(i => i.id === id);
        if (!m) return;
        document.getElementById('m-name').innerText = m.name;
        document.getElementById('m-role').innerText = m.role;
        document.getElementById('m-dept').innerText = m.dept;
        document.getElementById('m-bio').innerText = m.bio;
        
        const edu = document.getElementById('m-edu-list');
        const exp = document.getElementById('m-exp-list');
        if(edu) edu.innerHTML = m.education?.length ? m.education.map(e => `<p>• ${e}</p>`).join('') : '<p>-</p>';
        if(exp) exp.innerHTML = m.experience?.length ? m.experience.map(e => `<p>• ${e}</p>`).join('') : '<p>-</p>';

        document.getElementById('bio-modal').style.display = 'flex';
    });
}

function closeModal() { document.getElementById('bio-modal').style.display = 'none'; }

// ==========================================
// 4. ระบบตรวจสอบเอกสาร (Archive System - บูรณาการใหม่)
// ==========================================
let allDocuments = [];
fetch('documents.json').then(res => res.json()).then(d => allDocuments = d);

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
    const level = found.extra_info?.level || found.extra_info?.year || "-";

    resultArea.innerHTML = `
        <div class="doc-result-card">
            <div class="result-header">
                <div class="result-title-main">${found.doc_type}</div>
                <div class="status-badge">ตรวจสอบแล้ว - ถูกต้อง</div>
            </div>
            <div class="doc-ref-id">รหัสอ้างอิงเอกสาร: ${found.doc_id}</div>
            <div class="info-stat-grid">
                <div class="stat-item"><span class="stat-label">ระดับ/ชั้น/ปี</span><span class="stat-value">${level}</span></div>
                <div class="stat-item"><span class="stat-label">เกรดเฉลี่ย</span><span class="stat-value" style="color:var(--primary);">${grade}</span></div>
                <div class="stat-item"><span class="stat-label">วันที่ออก</span><span class="stat-value">${found.extra_info?.issued_date || "-"}</span></div>
            </div>
            <div class="doc-images-container">
                ${found.images.map((img, i) => `
                    <div class="doc-img-box">
                        <img src="${img}">
                        <div class="doc-img-label">เอกสารหน้าที่ ${i+1}</div>
                    </div>`).join('')}
            </div>
            <div class="doc-footer-info">
                <div class="detail-box">
                    <p><b>รายละเอียด:</b> ${found.detail}</p>
                    <p style="margin-top:5px; font-size:0.85rem; color:#64748b;"><b>ผู้ออกเอกสาร:</b> ${found.issuer}</p>
                    ${found.note ? `<p style="color:#ef4444; margin-top:5px;"><b>หมายเหตุ:</b> ${found.note}</p>` : ''}
                </div>
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
// Init: รันทุกอย่างเมื่อโหลดหน้าเสร็จ
// ==========================================
window.addEventListener('DOMContentLoaded', () => { 
    fetchNews(); 
    fetchPersonnel();
    if (window.location.search.includes('id=')) loadPostDetail();
});
