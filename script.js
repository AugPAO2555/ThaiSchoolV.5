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
// ส่วนที่ 2: ระบบตรวจสอบเอกสาร (Dynamic Logic)
// ==========================================

let allDocuments = []; // เก็บข้อมูลจาก JSON เพื่อใช้สร้าง Dropdown

const docData = {
    school: [
        "ปพ.1บ - มัธยมศึกษาตอนต้น", "ปพ.1พ - มัธยมศึกษาตอนปลาย", 
        "ปพ.2บ - ประกาศนียบัตร (ม.ต้น)", "ปพ.2พ - ประกาศนียบัตร (ม.ปลาย)",
        "ปพ.3 - รายงานผู้สำเร็จการศึกษา", 
        "ปพ.5 - แบบบันทึกผลการพัฒนาคุณภาพผู้เรียน", 
        "ปพ.6 - แบบรายงานผลการพัฒนาคุณภาพผู้เรียนรายบุคคล", 
        "ปพ.7ก - ใบรับรองเฉพาะรายวิชา", "ปพ.7ข - ใบรับรองทุกรายวิชา"
    ],
    military: [
        "ใบวิทยฐานะ - สำเร็จการฝึกวิชาทหาร", 
        "สด.8 - สมุดประจำตัวทหารกองหนุนประเภทที่ 1", 
        "สด.9", "สด.35 - หมายเรียก", 
        "สด.43 - ใบรับรองผลการตรวจคัดเลือกทหารกองเกินฯ"
    ],
    police: [
        "ใบอนุญาตขับรถยนต์ส่วนบุคคลชั่วคราว", 
        "ใบอนุญาตขับจักรยานยนต์ส่วนบุคคลชั่วคราว"
    ]
};

async function loadDocData() {
    try {
        const res = await fetch('documents.json');
        allDocuments = await res.json();
    } catch (err) { console.error("โหลด documents.json ไม่สำเร็จ:", err); }
}

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

// สร้างช่องเลือกเสริม อ้างอิงจากข้อมูลที่มีจริงใน JSON
function showExtraFields() {
    const type = document.getElementById('doc-type-select').value;
    const area = document.getElementById('extra-inputs');
    if(!area || !type) return;
    area.innerHTML = ''; 

    let html = '';
    const style = `style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.85rem;"`;

    // กรองข้อมูลเฉพาะประเภทที่เลือก
    const filtered = allDocuments.filter(d => d.doc_type === type);

    // ดึงค่า Unique ต่างๆ จาก extra_info ใน JSON
    const years = [...new Set(filtered.map(d => d.extra_info?.year).filter(Boolean))].sort();
    const rooms = [...new Set(filtered.map(d => d.extra_info?.room).filter(Boolean))].sort();
    const subjects = [...new Set(filtered.map(d => d.extra_info?.subject).filter(Boolean))].sort();
    const terms = [...new Set(filtered.map(d => d.extra_info?.term).filter(Boolean))].sort();
    const rotcsLevels = [...new Set(filtered.map(d => d.extra_info?.level).filter(Boolean))].sort();

    // สร้าง HTML ตามข้อมูลที่มี
    if (years.length > 0) {
        html += `<div><small>ปีการศึกษา</small><select id="ex-year" ${style}>
                ${years.map(y => `<option value="${y}">${y}</option>`).join('')}</select></div>`;
    }
    if (rooms.length > 0) {
        html += `<div><small>ห้อง</small><select id="ex-room" ${style}>
                ${rooms.map(r => `<option value="${r}">${r}</option>`).join('')}</select></div>`;
    }
    if (subjects.length > 0) {
        html += `<div><small>รายวิชา</small><select id="ex-subject" ${style}>
                ${subjects.map(s => `<option value="${s}">${s}</option>`).join('')}</select></div>`;
    }
    if (terms.length > 0) {
        html += `<div><small>เทอม</small><select id="ex-term" ${style}>
                ${terms.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>`;
    }
    if (type.includes("วิทยฐานะ") && rotcsLevels.length > 0) {
        html += `<div><small>สำเร็จการฝึกชั้นปีที่</small><select id="ex-level-rotcs" ${style}>
                ${rotcsLevels.map(l => `<option value="${l}">${l}</option>`).join('')}</select></div>`;
    }

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

    let autoLevel = "";
    if (type.includes("มัธยมศึกษาตอนต้น")) autoLevel = "มัธยมศึกษาตอนต้น";
    else if (type.includes("มัธยมศึกษาตอนปลาย")) autoLevel = "มัธยมศึกษาตอนปลาย";

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
                let matchExtra = true;

                if (d.extra_info) {
                    const ex = d.extra_info;
                    const selYear = document.getElementById('ex-year')?.value;
                    const selRoom = document.getElementById('ex-room')?.value;
                    const selSub  = document.getElementById('ex-subject')?.value;
                    const selTerm = document.getElementById('ex-term')?.value;
                    const selRotcs = document.getElementById('ex-level-rotcs')?.value;

                    if (autoLevel && ex.level && ex.level !== autoLevel) matchExtra = false;
                    if (selYear && ex.year !== selYear) matchExtra = false;
                    if (selRoom && ex.room !== selRoom) matchExtra = false;
                    if (selSub  && ex.subject !== selSub) matchExtra = false;
                    if (selTerm && ex.term !== selTerm) matchExtra = false;
                    if (selRotcs && ex.level !== selRotcs) matchExtra = false;
                }
                return matchUser && matchType && matchExtra;
            });

            if (found) {
                showNotify("ตรวจสอบสำเร็จ!", "success");
                renderResultCard(found);
            } else {
                showNotify("ไม่พบข้อมูลที่ระบุ", "error");
            }
        }
    }, 300);
}

function renderResultCard(found) {
    const resultArea = document.getElementById('verify-result-area');

    let imagesHtml = found.images.map((img, index) => `
        <div style="flex: 1; min-width: 250px; max-width: 450px; text-align: center; background: #f1f5f9; padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; margin: 0 auto;">
            <img src="${img}" style="width:100%; height:auto; max-height:550px; object-fit:contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));">
            <p style="font-size:0.75rem; color:#64748b; margin-top:15px; font-weight:600;">เอกสารหน้าที่ ${index + 1}</p>
        </div>
    `).join('');

    let extraHtml = "";
    if(found.extra_info) {
        const ex = found.extra_info;
        const labels = { 
            level: 'ระดับชั้น/ปี', grade: 'เกรดเฉลี่ย', issued_date: 'วันที่ออก', 
            expiry_date: 'หมดอายุ', year: 'ปีการศึกษา', room: 'ห้อง', term: 'เทอม', subject: 'รายวิชา' 
        };
        extraHtml = `<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:12px; margin-top:15px;">` +
            Object.keys(labels).filter(key => ex[key]).map(key => `
                <div style="background:#f8fafc; padding:10px 15px; border-radius:10px; border:1px solid #edf2f7;">
                    <small style="display:block; color:#64748b; font-size:0.7rem; margin-bottom:2px; font-weight:700;">${labels[key]}</small>
                    <b style="color:#1e293b; font-size:0.95rem;">${ex[key]}</b>
                </div>`).join('') +
            `</div>`;
    }

    resultArea.innerHTML = `
        <div class="result-card-container" style="margin: 40px auto; max-width: 950px; animation: fadeIn 0.5s ease-out;">
            <div class="doc-detail-card" style="background: #fff; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 25px 35px; border-bottom: 1px solid #f1f5f9;">
                    <div>
                        <h5 style="margin: 0 0 5px 0; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight:700;">ข้อมูลการตรวจสอบ</h5>
                        <div style="font-weight: 800; font-size: 1.4rem; color: #0f172a;">${found.doc_type}</div>
                    </div>
                    <span style="background: #dcfce7; color: #15803d; padding: 8px 20px; border-radius: 99px; font-size: 0.85rem; font-weight: 700; border: 1px solid #bbf7d0;">
                        ${found.status}
                    </span>
                </div>
                <div style="padding: 35px;">
                    <div style="color: #64748b; font-size: 0.95rem; margin-bottom: 5px;">รหัสอ้างอิงเอกสาร: <span style="color: #0f172a; font-weight: 700;">${found.doc_id}</span></div>
                    ${extraHtml}
                    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 25px; margin: 35px 0;">${imagesHtml}</div>
                    <div style="background: #f8fafc; border-left: 5px solid #10b981; padding: 25px; border-radius: 4px 20px 20px 4px;">
                        <p style="margin: 0; font-size: 1rem; color: #334155; line-height: 1.6;"><b>รายละเอียดเพิ่มเติม:</b> ${found.detail}</p>
                        <div style="margin-top: 15px; display: flex; align-items: center; gap: 10px;">
                            <div style="width: 10px; height: 10px; background: #10b981; border-radius: 50%;"></div>
                            <p style="margin: 0; font-size: 0.9rem; color: #64748b;"><b>ผู้ออกเอกสาร:</b> ${found.issuer}</p>
                        </div>
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

window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    fetchPersonnel();
    loadDocData(); // สำคัญ: โหลด JSON ทันทีเพื่อเตรียมข้อมูล Dynamic
});
