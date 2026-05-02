// ==========================================
// 1. ระบบดึงข่าวสาร (News Section)
// ==========================================
async function fetchNews() {
    const box = document.getElementById('news-container');
    if (!box) return;
    try {
        const res = await fetch('news.json');
        const data = (await res.json()).reverse(); 
        
        box.innerHTML = data.map(n => `
            <div class="card">
                <img src="${n.img || 'https://via.placeholder.com/400x200'}" alt="News">
                <div class="card-body">
                    <p class="card-date">${n.date}</p>
                    <h3>${n.title}</h3>
                    <p>${n.desc ? n.desc.substring(0, 80) + '...' : ''}</p>
                    <a href="post.html?id=${n.id}" class="btn">อ่านรายละเอียดเพิ่มเติม →</a>
                </div>
            </div>
        `).join('');
    } catch (err) { console.error("News Load Error", err); }
}

// ==========================================
// 2. ระบบตรวจสอบเอกสาร (แบบ Card ตามรูปที่ 4)
// ==========================================
let allDocuments = [];

async function loadDocData() {
    try {
        const res = await fetch('documents.json');
        allDocuments = await res.json();
    } catch (e) {}
}

function renderResultCard(found) {
    const resultArea = document.getElementById('verify-result-area');
    if (!resultArea) return;

    // สร้าง Gallery รูปภาพ
    const imagesHtml = found.images.map((img, i) => `
        <div class="gallery-item">
            <img src="${img}" alt="Doc">
            <p style="text-align:center; font-size:0.7rem; color:#94a3b8; margin-top:5px;">เอกสารหน้าที่ ${i+1}</p>
        </div>
    `).join('');

    resultArea.innerHTML = `
        <div class="doc-result-card">
            <div class="res-header">
                <h2 style="font-size: 1.3rem;">${found.doc_type}</h2>
                <span class="status-tag status-ok">ตรวจสอบแล้ว - ถูกต้อง</span>
            </div>

            <p style="font-size:0.9rem; margin-bottom:20px;"><b>รหัสอ้างอิงเอกสาร:</b> ${found.doc_id}</p>

            <div class="info-grid">
                <div class="info-item">
                    <b>ระดับชั้น/ปี</b>
                    <span>${found.extra_info?.level || found.extra_info?.year || '-'}</span>
                </div>
                <div class="info-item">
                    <b>เกรดเฉลี่ย/ผลการเรียน</b>
                    <span>${found.extra_info?.grade || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <b>วันที่ออกเอกสาร</b>
                    <span>${found.extra_info?.issued_date || '-'}</span>
                </div>
            </div>

            <div class="image-gallery">
                ${imagesHtml}
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px;">
                <p style="font-size:0.9rem; color:#475569;"><b>รายละเอียดเพิ่มเติม:</b> ${found.detail}</p>
                <p style="font-size:0.9rem; color:#475569; margin-top:8px;">
                    <span style="color:var(--primary)">●</span> <b>ผู้ออกเอกสาร:</b> ${found.issuer}
                </p>
            </div>
        </div>
    `;
    
    // เลื่อนหน้าจอไปที่ผลลัพธ์
    resultArea.scrollIntoView({ behavior: 'smooth' });
}

// ฟังก์ชันเริ่มตรวจสอบ (ผูกกับปุ่มเดิม)
async function verifyDocument() {
    const user = document.getElementById('roblox-username').value.trim();
    const type = document.getElementById('doc-type-select').value;
    const overlay = document.getElementById('status-overlay');
    const loadBar = document.getElementById('load-bar');

    if (!user || !type) return;

    overlay.style.display = 'flex';
    loadBar.style.width = '0%';

    let p = 0;
    const inv = setInterval(() => {
        p += 20;
        loadBar.style.width = p + '%';
        if (p >= 100) {
            clearInterval(inv);
            overlay.style.display = 'none';
            const found = allDocuments.find(d => 
                d.roblox_username.toLowerCase() === user.toLowerCase() && 
                d.doc_type === type
            );
            if (found) renderResultCard(found);
            else alert("ไม่พบข้อมูล");
        }
    }, 200);
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    loadDocData();
});
