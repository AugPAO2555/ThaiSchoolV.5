// ==========================================
// ส่วนที่ 1: ระบบข่าวสาร & บุคลากร (คงเดิม)
// ==========================================
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
// ส่วนที่ 2: ระบบตรวจสอบเอกสาร (ดีไซน์แบบเก่า)
// ==========================================

const docData = {
    school: ["ปพ.1 - ระเบียนแสดงผลการเรียน", "ปพ.2 - ประกาศนียบัตร", "ปพ.7 - ใบรับรองสถานภาพ"],
    military: ["สด.8", "สด.9", "สด.43", "ใบวิทยฐานะ รด. ปี 3"],
    police: ["ใบอนุญาตขับขี่รถยนต์ส่วนบุคคล", "ใบอนุญาตขับขี่รถจักรยานยนต์"]
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
    } else {
        typeSelect.innerHTML = '<option value="">-- โปรดเลือกหน่วยงานก่อน --</option>';
    }
}

function showNotify(msg, type = 'success') {
    const banner = document.getElementById('top-notify');
    if(!banner) return;
    banner.innerText = (type === 'success' ? '✔️ ' : '❌ ') + msg;
    banner.className = `top-banner show ${type}`;
    setTimeout(() => { banner.classList.remove('show'); }, 2500);
}

async function verifyDocument() {
    const user = document.getElementById('roblox-username').value.trim();
    const agency = document.getElementById('agency-select').value;
    const type = document.getElementById('doc-type-select').value;

    if (!user || !agency || !type) {
        showNotify("กรุณากรอกข้อมูลให้ครบถ้วน", "error");
        return;
    }

    const overlay = document.getElementById('status-overlay');
    const loadBar = document.getElementById('load-bar');
    const resultArea = document.getElementById('verify-result-area');

    // ล้างสถานะเก่าทิ้งก่อนเริ่ม
    resultArea.innerHTML = '';
    loadBar.style.width = '0%';
    overlay.style.display = 'flex';

    let progress = 0;
    const interval = setInterval(async () => {
        progress += Math.random() * 30;
        if (progress > 100) progress = 100;
        loadBar.style.width = progress + '%';

        if (progress === 100) {
            clearInterval(interval);
            try {
                // ดึงข้อมูลจากไฟล์ตัวพิมพ์เล็ก
                const res = await fetch('documents.json'); 
                if (!res.ok) throw new Error();
                const docs = await res.json();
                
                const found = docs.find(d => 
                    d.roblox_username.toLowerCase() === user.toLowerCase() &&
                    d.dept_key === agency &&
                    d.doc_type === type
                );

                overlay.style.display = 'none';

                if (found) {
                    showNotify("เข้าสู่ระบบสำเร็จ!", "success"); //
                    
                    // แสดง Card รายละเอียดแบบหน้าเก่าที่พี่ชอบ
                    resultArea.innerHTML = `
                        <div class="result-card-container" style="margin-top: 30px; animation: fadeIn 0.5s;">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <span style="font-size: 3rem;">✅</span>
                                <h3 style="font-weight: 800;">พบเอกสาร</h3>
                            </div>

                            <div class="doc-detail-card" style="background: #fff; border-radius: 15px; border-top: 6px solid #00a859; box-shadow: 0 5px 20px rgba(0,0,0,0.1); padding: 25px; color: #333;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                    <h4 style="margin: 0; display: flex; align-items: center; gap: 8px;">📋 รายละเอียดเอกสาร</h4>
                                    <span style="background: #e6f7ed; color: #00a859; padding: 6px 15px; border-radius: 25px; font-size: 0.85rem; font-weight: bold; border: 1px solid #00a859;">${found.status}</span>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                                    <div>
                                        <small style="color: #666; font-size: 0.8rem;">ชื่อผู้ใช้ Roblox:</small>
                                        <div style="background: #f1f3f5; padding: 10px; border-radius: 8px; font-weight: bold; margin-top: 5px;">${found.roblox_username}</div>
                                    </div>
                                    <div>
                                        <small style="color: #666; font-size: 0.8rem;">รหัสเอกสาร:</small>
                                        <div style="background: #f1f3f5; padding: 10px; border-radius: 8px; font-weight: bold; margin-top: 5px;">${found.doc_id}</div>
                                    </div>
                                </div>

                                <div style="margin-bottom: 20px;">
                                    <small style="color: #666; font-size: 0.8rem;">ประเภทเอกสาร:</small>
                                    <div style="font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 5px;">${found.doc_type}</div>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                                    <div>
                                        <small style="color: #666;">ออกเมื่อ:</small>
                                        <div style="font-size: 0.95rem;">${found.issue_date}</div>
                                    </div>
                                    <div>
                                        <small style="color: #666;">วันหมดอายุ:</small>
                                        <div style="font-size: 0.95rem;">${found.expiry_date || 'ไม่มีวันหมดอายุ'}</div>
                                    </div>
                                </div>

                                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                                    <div style="flex: 1; text-align: center;">
                                        <img src="${found.img_front}" style="width: 100%; border-radius: 8px; border: 1px solid #ddd; height: 120px; object-fit: cover;" alt="ด้านหน้า">
                                        <small style="color: #999;">ด้านหน้า</small>
                                    </div>
                                    <div style="flex: 1; text-align: center;">
                                        <img src="${found.img_back}" style="width: 100%; border-radius: 8px; border: 1px solid #ddd; height: 120px; object-fit: cover;" alt="ด้านหลัง">
                                        <small style="color: #999;">ด้านหลัง</small>
                                    </div>
                                </div>

                                <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; border-left: 4px solid #00a859;">
                                    <p style="margin: 0; font-size: 0.9rem; line-height: 1.5;"><b>รายละเอียด:</b> ${found.detail}</p>
                                    <p style="margin: 10px 0 0 0; font-size: 0.85rem; color: #666; font-style: italic;"><b>ผู้ออกเอกสาร:</b> ${found.issuer}</p>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    overlay.style.display = 'none';
                    showNotify("ไม่พบข้อมูลเอกสาร", "error");
                }
            } catch (err) {
                overlay.style.display = 'none';
                showNotify("โหลดฐานข้อมูลไม่สำเร็จ", "error");
            }
        }
    }, 400);
}

function closeStatus() {
    const overlay = document.getElementById('status-overlay');
    if(overlay) overlay.style.display = 'none';
}

window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    fetchPersonnel();
});
