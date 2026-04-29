// ==========================================
// ส่วนที่ 1: ระบบข่าวสาร & บุคลากร (ของเดิม)
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
// ส่วนที่ 2: ระบบตรวจสอบเอกสาร (แก้ไขชื่อ ปพ. ให้ถูกต้อง)
// ==========================================

const docData = {
    school: [
        "ปพ.1บ - มัธยมศึกษาตอนต้น", 
        "ปพ.1พ - มัธยมศึกษาตอนปลาย", 
        "ปพ.2 - ประกาศนียบัตร", 
        "ปพ.3 - รายงานผู้สำเร็จการศึกษา", 
        "ปพ.5 - แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน", 
        "ปพ.6 - แบบรายงานผลการพัฒนาคุณภาพผู้เรียนรายบุคคล", 
        "ปพ.7ก - ใบรับรองเฉพาะรายวิชา", 
        "ปพ.7ข - ใบรับรองทุกรายวิชา"
    ],
    military: ["สด.8", "สด.9", "สด.43"],
    police: ["ใบอนุญาตขับขี่รถยนต์", "ใบอนุญาตขับขี่รถจักรยานยนต์"]
};

function updateDocTypes() {
    const agency = document.getElementById('agency-select').value;
    const typeSelect = document.getElementById('doc-type-select');
    const extraArea = document.getElementById('extra-inputs');
    if(!typeSelect) return;
    
    typeSelect.innerHTML = '<option value="">-- เลือกประเภทเอกสาร --</option>';
    if(extraArea) extraArea.innerHTML = ''; 

    if (docData[agency]) {
        docData[agency].forEach(type => {
            typeSelect.innerHTML += `<option value="${type}">${type}</option>`;
        });
    }
}

function showExtraFields() {
    const type = document.getElementById('doc-type-select').value;
    const area = document.getElementById('extra-inputs');
    if(!area) return;
    area.innerHTML = ''; 

    let html = '';
    const style = `style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.85rem;"`;

    // เช็กเงื่อนไขการโชว์ช่องกรอก (ตามชื่อใหม่)
    if (type.includes("ปพ.1") || type.includes("ปพ.2") || type.includes("ปพ.5") || type.includes("ปพ.6")) 
        html += `<input type="text" id="ex-level" placeholder="ระดับชั้น" ${style}>`;
    if (type.includes("ปพ.3") || type.includes("ปพ.5") || type.includes("ปพ.6")) 
        html += `<input type="text" id="ex-year" placeholder="ปีการศึกษา" ${style}>`;
    if (type.includes("ปพ.5") || type.includes("ปพ.6")) 
        html += `<input type="text" id="ex-room" placeholder="ห้อง" ${style}>`;
    if (type.includes("ปพ.5") || type.includes("ปพ.7ก")) 
        html += `<input type="text" id="ex-subject" placeholder="รายวิชา" ${style}>`;
    if (type.includes("ปพ.6")) 
        html += `<input type="text" id="ex-term" placeholder="เทอม" ${style}>`;

    area.innerHTML = html;
}

async function verifyDocument() {
    const user = document.getElementById('roblox-username').value.trim();
    const type = document.getElementById('doc-type-select').value;
    const resultArea = document.getElementById('verify-result-area');
    const overlay = document.getElementById('status-overlay');
    const loadBar = document.getElementById('load-bar');

    if (!user || !type) {
        showNotify("กรุณากรอกข้อมูลให้ครบถ้วน", "error");
        return;
    }

    resultArea.innerHTML = '';
    overlay.style.display = 'flex';
    loadBar.style.width = '0%';

    let progress = 0;
    const interval = setInterval(async () => {
        progress += 25;
        loadBar.style.width = progress + '%';

        if (progress >= 100) {
            clearInterval(interval);
            try {
                const res = await fetch('documents.json');
                const docs = await res.json();
                
                // ค้นหาข้อมูล (ต้องตรงกับ docData ด้านบน)
                const found = docs.find(d => 
                    d.roblox_username.toLowerCase() === user.toLowerCase() && 
                    d.doc_type === type
                );

                overlay.style.display = 'none';

                if (found) {
                    showNotify("ตรวจสอบสำเร็จ!", "success");
                    let extraHtml = "";
                    if(found.extra_info) {
                        const ex = found.extra_info;
                        const labels = { level: 'ระดับชั้น', room: 'ห้อง', year: 'ปีการศึกษา', term: 'เทอม', subject: 'รายวิชา' };
                        const activeFields = Object.keys(labels)
                            .filter(key => ex[key])
                            .map(key => `<div style="background:#f0f4f8; padding:5px 10px; border-radius:5px;"><b>${labels[key]}:</b> ${ex[key]}</div>`)
                            .join('');
                        if(activeFields) extraHtml = `<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; font-size:0.8rem;">${activeFields}</div>`;
                    }

                    resultArea.innerHTML = `
                        <div class="result-card-container" style="margin-top: 30px; animation: fadeIn 0.5s;">
                            <div class="doc-detail-card" style="background: #fff; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden;">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f0f0f0; background: #fafafa;">
                                    <h5 style="margin: 0; color: #444;">📋 รายละเอียดเอกสาร</h5>
                                    <span style="background: #e6f7ed; color: #00a859; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; border: 1px solid #00a859;">${found.status}</span>
                                </div>
                                <div style="padding: 20px;">
                                    <div style="font-weight: 800; font-size: 1.1rem; color: #1a1a1a;">${found.doc_type}</div>
                                    ${extraHtml}
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                                        <div><small style="color: #999;">ชื่อผู้ใช้:</small><div style="font-weight: bold;">${found.roblox_username}</div></div>
                                        <div><small style="color: #999;">รหัสเอกสาร:</small><div style="font-weight: bold;">${found.doc_id}</div></div>
                                    </div>
                                    <div style="display: flex; gap: 12px; margin: 20px 0;">
                                        <div style="flex: 1; text-align: center;">
                                            <div style="width: 100%; height: 160px; background: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #eee;">
                                                <img src="${found.img_front}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                                            </div>
                                            <p style="font-size: 0.6rem; color: #bbb; margin-top: 5px;">ด้านหน้า (1-2.jpg)</p>
                                        </div>
                                        <div style="flex: 1; text-align: center;">
                                            <div style="width: 100%; height: 160px; background: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #eee;">
                                                <img src="${found.img_back}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                                            </div>
                                            <p style="font-size: 0.6rem; color: #bbb; margin-top: 5px;">ด้านหลัง (1.jpg)</p>
                                        </div>
                                    </div>
                                    <div style="background: #f9fbf9; border-left: 5px solid #00a859; padding: 15px; border-radius: 0 10px 10px 0;">
                                        <p style="margin: 0; font-size: 0.85rem; color: #333;"><b>รายละเอียด:</b> ${found.detail}</p>
                                        <p style="margin: 8px 0 0 0; font-size: 0.8rem; color: #666;"><b>ผู้ออกเอกสาร:</b> ${found.issuer}</p>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                } else {
                    overlay.style.display = 'none';
                    showNotify("ไม่พบข้อมูลเอกสารในระบบ", "error");
                }
            } catch (err) {
                overlay.style.display = 'none';
                showNotify("เกิดข้อผิดพลาดในการโหลดข้อมูล", "error");
            }
        }
    }, 300);
}

function showNotify(msg, type = 'success') {
    const banner = document.getElementById('top-notify');
    if(!banner) return;
    banner.innerText = (type === 'success' ? '✔️ ' : '❌ ') + msg;
    banner.className = `top-banner show ${type}`;
    setTimeout(() => { banner.classList.remove('show'); }, 2500);
}

function closeStatus() {
    const overlay = document.getElementById('status-overlay');
    if(overlay) overlay.style.display = 'none';
}

// เริ่มโหลดข้อมูลเมื่อเข้าหน้าเว็ป
window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    fetchPersonnel();
});
