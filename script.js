// --- 1. โหลดข้อมูลพื้นฐาน (ข่าว & บุคลากร) ---
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
                <div class="p-card" onclick="openBio(${m.id})">
                    <img src="${m.img}">
                    <div class="p-card-body">
                        <h4>${m.name}</h4>
                        <p>${m.role}</p>
                    </div>
                </div>
            `).join('');
        };
        render('founder-list', 'founder');
        render('school-list', 'school');
        render('police-list', 'police');
    } catch (err) { console.error("โหลดบุคลากรไม่สำเร็จ:", err); }
}

// --- 2. ระบบ Modal ประวัติ (ป้องกันข้อมูลปลิ้น) ---
function openBio(id) {
    fetch('members.json').then(res => res.json()).then(data => {
        const m = data.find(item => item.id === id);
        if (!m) return;
        document.getElementById('m-name').innerText = m.name;
        document.getElementById('m-role').innerText = m.role;
        document.getElementById('m-dept').innerText = m.dept;
        document.getElementById('m-bio').innerText = m.bio;
        
        const eduBox = document.getElementById('m-edu-list');
        eduBox.innerHTML = (m.education && m.education.length > 0) 
            ? m.education.map(e => `<div class="bio-item"><span>🎓</span> <div><b>${e.level}</b><small>${e.place}</small></div></div>`).join('') 
            : '<p>ไม่มีข้อมูล</p>';

        document.getElementById('bio-modal').classList.add('active');
        document.querySelector('.modal-content').scrollTop = 0;
    });
}
function closeModal() { document.getElementById('bio-modal').classList.remove('active'); }

// --- 3. ระบบตรวจสอบเอกสาร (Verify System) ---

// ฟังก์ชันเปิด-ปิดช่องกรอกพิเศษ (ปี/เทอม/วิชา)
function toggleExtraFields() {
    const docType = document.getElementById('doc-type').value;
    const extraBox = document.getElementById('extra-fields');
    const fYear = document.getElementById('field-year');
    const fTerm = document.getElementById('field-term');
    const fSubject = document.getElementById('field-subject');

    if(!extraBox) return;
    extraBox.style.display = "none";
    fYear.style.display = "none"; fTerm.style.display = "none"; fSubject.style.display = "none";

    if (docType === "pp3") { extraBox.style.display = "block"; fYear.style.display = "block"; }
    if (docType === "pp5") { 
        extraBox.style.display = "block"; fYear.style.display = "block"; fTerm.style.display = "block"; fSubject.style.display = "block"; 
    }
    if (docType === "pp6") { extraBox.style.display = "block"; fYear.style.display = "block"; fTerm.style.display = "block"; }
}

async function verifyDocument() {
    const username = document.getElementById('roblox-username').value.trim();
    const agency = document.getElementById('agency-select').value;
    const docTypeSelect = document.getElementById('doc-type');
    const docTypeName = docTypeSelect.options[docTypeSelect.selectedIndex].text;

    const overlay = document.getElementById('status-overlay');
    const bar = document.getElementById('load-bar');
    const msg = document.getElementById('status-msg');
    const icon = document.getElementById('status-icon');
    const title = document.getElementById('status-title');
    const btn = document.getElementById('status-btn');
    const resultArea = document.getElementById('verify-result-area');

    if (!username) { alert("กรุณากรอก Username Roblox"); return; }

    // เริ่มต้นแอนิเมชั่นแถบโหลด
    resultArea.innerHTML = "";
    overlay.classList.add('active');
    btn.style.display = "none";
    icon.innerHTML = "🔍";
    bar.style.width = "0%";

    setTimeout(() => { bar.style.width = "35%"; msg.innerText = "กำลังเชื่อมต่อระบบฐานข้อมูลกลาง..."; }, 300);
    setTimeout(() => { bar.style.width = "75%"; msg.innerText = "กำลังตรวจสอบความถูกต้องของเอกสาร..."; }, 1000);

    try {
        const res = await fetch('documents.json');
        const data = await res.json();
        const record = data.find(item => 
            item.roblox_username.toLowerCase() === username.toLowerCase() && 
            item.dept_key === agency
        );

        setTimeout(() => {
            bar.style.width = "100%";
            if (record) {
                icon.innerHTML = "✅";
                title.innerText = "พบข้อมูลเอกสาร";
                msg.innerText = "ยืนยันความถูกต้องเรียบร้อย";
                setTimeout(() => { 
                    overlay.classList.remove('active'); 
                    showVerifyResult(record, docTypeName); 
                }, 1200);
            } else {
                icon.innerHTML = "❌";
                title.innerText = "ไม่พบข้อมูล";
                msg.innerText = "ไม่พบเอกสารนี้ในระบบ โปรดตรวจสอบชื่อและประเภท";
                btn.style.display = "inline-block";
            }
        }, 2200);
    } catch (err) { console.error("Verify Error:", err); }
}

// --- 4. ฟังก์ชันแสดงผลลัพธ์ (ข้อมูลที่พี่กรอกจะมาโชว์ที่นี่) ---
function showVerifyResult(record, selectedDocName) {
    const resultArea = document.getElementById('verify-result-area');
    const statusColor = record.status.includes("ไม่") ? "#dc2626" : "#00a859";
    
    // ดึงค่าจากช่องกรอกพิเศษ (ถ้ามี)
    const extraYear = document.getElementById('input-year').value || "-";
    const extraTerm = document.getElementById('input-term').value || "-";
    const extraSub = document.getElementById('input-subject').value || "-";

    resultArea.innerHTML = `
        <div class="result-card-modern">
            <div style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                <h3 style="color: var(--primary); margin:0;">📋 รายละเอียดเอกสาร</h3>
                <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem;">${record.status}</span>
            </div>

            <div class="res-item"><span>ชื่อผู้ใช้ Roblox</span><b>${record.roblox_username}</b></div>
            <div class="res-item"><span>รหัสเอกสาร</span><b>${record.doc_id}</b></div>
            <div class="res-item"><span>ประเภทเอกสารที่เลือก</span><b>${selectedDocName}</b></div>
            <div class="res-item"><span>ปีการศึกษาที่ระบุ</span><b>${extraYear}</b></div>
            
            ${selectedDocName.includes("ปพ.5") || selectedDocName.includes("ปพ.6") ? 
                `<div class="res-item"><span>เทอม</span><b>${extraTerm}</b></div>` : ''}
            ${selectedDocName.includes("ปพ.5") ? 
                `<div class="res-item"><span>รายวิชา</span><b>${extraSub}</b></div>` : ''}

            <div class="res-item"><span>ผู้ออกเอกสาร</span><b>${record.issuer}</b></div>
            <div class="res-item"><span>วันที่ออก</span><b>${record.issue_date}</b></div>

            <div style="grid-column: 1 / -1; background: #f9f9f9; padding: 15px; border-radius: 10px; margin-top:10px;">
                <span style="font-size:0.8rem; color:#888;">รายละเอียดในฐานข้อมูล:</span>
                <p style="margin-top:5px; font-size:0.95rem;">${record.detail}</p>
            </div>
            
            <div style="grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top:10px;">
                <img src="${record.img_front || ''}" style="width:100%; border-radius:8px; border:1px solid #ddd;" onclick="window.open(this.src)">
                <img src="${record.img_back || ''}" style="width:100%; border-radius:8px; border:1px solid #ddd;" onclick="window.open(this.src)">
            </div>
        </div>
    `;
}

function closeStatus() { document.getElementById('status-overlay').classList.remove('active'); }

window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    fetchPersonnel();
});
