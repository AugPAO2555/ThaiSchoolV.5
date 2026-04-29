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
// ส่วนที่ 2: ระบบตรวจสอบเอกสาร (Strict Logic)
// ==========================================

const docData = {
    school: [
        "ปพ.1บ - มัธยมศึกษาตอนต้น", "ปพ.1พ - มัธยมศึกษาตอนปลาย", 
        "ปพ.2 - ประกาศนียบัตร", "ปพ.3 - รายงานผู้สำเร็จการศึกษา", 
        "ปพ.5 - แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน", 
        "ปพ.6 - แบบรายงานผลการพัฒนาคุณภาพผู้เรียนรายบุคคล", 
        "ปพ.7ก - ใบรับรองเฉพาะรายวิชา", "ปพ.7ข - ใบรับรองทุกรายวิชา"
    ],
    military: ["สด.8", "สด.9", "สด.43"],
    police: ["ใบอนุญาตขับขี่รถยนต์", "ใบอนุญาตขับขี่รถจักรยานยนต์"]
};

// 1. อัปเดตประเภทเอกสาร
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

// 2. แสดง Option เสริม (Dropdown ทั้งหมด)
function showExtraFields() {
    const type = document.getElementById('doc-type-select').value;
    const area = document.getElementById('extra-inputs');
    if(!area) return;
    area.innerHTML = ''; 

    let html = '';
    const style = `style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.85rem;"`;

    // ปีการศึกษา (ปพ.3, 5, 6)
    if (type.includes("ปพ.3") || type.includes("ปพ.5") || type.includes("ปพ.6")) {
        html += `<div><small>ปีการศึกษา</small><select id="ex-year" ${style}>
                <option value="2568">2568</option><option value="2567">2567</option><option value="2566">2566</option></select></div>`;
    }

    // ห้อง (ปพ.5, 6)
    if (type.includes("ปพ.5") || type.includes("ปพ.6")) {
        html += `<div><small>ห้อง</small><select id="ex-room" ${style}>
                ${[1,2,3,4,5,6,7,8,9,10].map(i => `<option value="${i}">${i}</option>`).join('')}</select></div>`;
    }

    // เทอม (ปพ.6)
    if (type.includes("ปพ.6")) {
        html += `<div><small>ภาคเรียน</small><select id="ex-term" ${style}>
                <option value="1">1</option><option value="2">2</option></select></div>`;
    }

    // รายวิชา (ปพ.5)
    if (type.includes("ปพ.5")) {
        html += `<div><small>รายวิชา</small><select id="ex-subject" ${style}>
                <option value="คณิตศาสตร์">คณิตศาสตร์</option>
                <option value="ภาษาไทย">ภาษาไทย</option>
                <option value="ภาษาอังกฤษ">ภาษาอังกฤษ</option>
                <option value="วิทยาศาสตร์">วิทยาศาสตร์</option></select></div>`;
    }

    area.innerHTML = html;
}

// 3. เริ่มการตรวจสอบ (เช็กละเอียดยิบ)
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
                
                // --- Strict Logic: ค้นหาข้อมูลที่ตรงทุกระเบียบนิ้ว ---
                const found = docs.find(d => {
                    const matchUser = d.roblox_username.toLowerCase() === user.toLowerCase();
                    const matchType = d.doc_type === type;
                    
                    let matchExtra = true;
                    if (d.extra_info) {
                        const selYear = document.getElementById('ex-year')?.value;
                        const selRoom = document.getElementById('ex-room')?.value;
                        const selTerm = document.getElementById('ex-term')?.value;
                        const selSub  = document.getElementById('ex-subject')?.value;

                        // ถ้ามีช่องให้เลือกในหน้าเว็บ ต้องตรงกับใน JSON
                        if (selYear && d.extra_info.year !== selYear) matchExtra = false;
                        if (selRoom && d.extra_info.room !== selRoom) matchExtra = false;
                        if (selTerm && d.extra_info.term !== selTerm) matchExtra = false;
                        if (selSub  && d.extra_info.subject !== selSub) matchExtra = false;
                    }
                    
                    return matchUser && matchType && matchExtra;
                });

                overlay.style.display = 'none';

                if (found) {
                    showNotify("ตรวจสอบสำเร็จ!", "success");
                    renderResultCard(found);
                } else {
                    showNotify("ไม่พบข้อมูล หรือข้อมูลเสริมไม่ตรงตามฐานข้อมูล", "error");
                }
            } catch (err) {
                overlay.style.display = 'none';
                showNotify("โหลดฐานข้อมูลไม่สำเร็จ", "error");
            }
        }
    }, 300);
}

// 4. แสดงผล Card เอกสาร
function renderResultCard(found) {
    const resultArea = document.getElementById('verify-result-area');
    let extraHtml = "";
    if(found.extra_info) {
        const ex = found.extra_info;
        const labels = { level: 'ระดับชั้น', room: 'ห้อง', year: 'ปีการศึกษา', term: 'เทอม', subject: 'รายวิชา' };
        extraHtml = `<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; font-size:0.8rem;">` +
            Object.keys(labels).filter(key => ex[key]).map(key => `<div style="background:#f0f4f8; padding:5px 10px; border-radius:5px;"><b>${labels[key]}:</b> ${ex[key]}</div>`).join('') +
            `</div>`;
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
                            <img src="${found.img_front}" style="width:100%; height:160px; object-fit:contain; border-radius:8px; border:1px solid #eee;">
                            <p style="font-size:0.6rem; color:#bbb; margin-top:5px;">ด้านหน้า (1-2.jpg)</p>
                        </div>
                        <div style="flex: 1; text-align: center;">
                            <img src="${found.img_back}" style="width:100%; height:160px; object-fit:contain; border-radius:8px; border:1px solid #eee;">
                            <p style="font-size:0.6rem; color:#bbb; margin-top:5px;">ด้านหลัง (1.jpg)</p>
                        </div>
                    </div>
                    <div style="background: #f9fbf9; border-left: 5px solid #00a859; padding: 15px; border-radius: 0 10px 10px 0;">
                        <p style="margin: 0; font-size: 0.85rem; color: #333;"><b>รายละเอียด:</b> ${found.detail}</p>
                        <p style="margin: 8px 0 0 0; font-size: 0.8rem; color: #666;"><b>ผู้ออกเอกสาร:</b> ${found.issuer}</p>
                    </div>
                </div>
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

function closeStatus() {
    const overlay = document.getElementById('status-overlay');
    if(overlay) overlay.style.display = 'none';
}

window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    fetchPersonnel();
});
