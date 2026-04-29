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
    fetch('members.json')
    .then(res => res.json())
    .then(data => {
        const m = data.find(item => item.id === id);
        if (!m) return;
        document.getElementById('m-name').innerText = m.name;
        document.getElementById('m-role').innerText = m.role;
        document.getElementById('m-dept').innerText = m.dept;
        document.getElementById('m-bio').innerText = m.bio;
        const eduBox = document.getElementById('m-edu-list');
        eduBox.innerHTML = (m.education && m.education.length > 0) ? m.education.map(e => `
            <div class="bio-item"><span>🎓</span> <div><b>${e.level}</b><small>${e.place}</small></div></div>
        `).join('') : '<p style="color:#999; font-size:0.8rem; margin-bottom:15px;">ไม่มีข้อมูลประวัติการศึกษา</p>';
        const expBox = document.getElementById('m-exp-list');
        expBox.innerHTML = (m.experience && m.experience.length > 0) ? m.experience.map(ex => `
            <div class="bio-item"><span>💼</span> <div><b>${ex.year === "ปัจจุบัน" ? "ปัจจุบัน" : "ปี " + ex.year}</b><small>${ex.desc}</small></div></div>
        `).join('') : '<p style="color:#999; font-size:0.8rem; margin-bottom:15px;">ไม่มีข้อมูลประวัติการทำงาน</p>';
        const modal = document.getElementById('bio-modal');
        modal.style.display = 'flex';
    });
}

function closeModal() {
    const modal = document.getElementById('bio-modal');
    if (modal) modal.style.display = 'none';
}

// ==========================================
// ส่วนที่ 2: ระบบตรวจสอบเอกสาร (อัปเกรดใหม่)
// ==========================================

// 1. ข้อมูลประเภทเอกสารแยกตามหน่วยงาน
const docData = {
    school: ["ปพ.1 - ระเบียนแสดงผลการเรียน", "ปพ.2 - ประกาศนียบัตร", "ปพ.7 - ใบรับรองสถานภาพ"],
    military: ["สด.8", "สด.9", "สด.43", "ใบวิทยฐานะ รด. ปี 3"],
    police: ["ใบอนุญาตขับขี่รถยนต์ส่วนบุคคล", "ใบอนุญาตขับขี่รถจักรยานยนต์"]
};

// 2. ฟังก์ชันอัปเดตประเภทเอกสารตามหน่วยงาน
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

// 3. ระบบแจ้งเตือนด่วนด้านบน (Top Notification)
function showNotify(msg, type = 'success') {
    const banner = document.getElementById('top-notify');
    if(!banner) return;
    
    banner.innerText = (type === 'success' ? '✔️ ' : '❌ ') + msg;
    banner.className = `top-banner show ${type}`;
    
    // แสดง 2.5 วินาทีแล้วซ่อน
    setTimeout(() => { banner.classList.remove('show'); }, 2500);
}

// 4. ฟังก์ชันตรวจสอบหลัก (Reset ค่าทุกครั้งที่กด)
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

    // ล้างสถานะเก่าทิ้งก่อนเริ่ม (ป้องกันอาการค้าง)
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
                // ดึงไฟล์แบบตัวพิมพ์เล็กตามที่พี่แจ้ง
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
                    resultArea.innerHTML = `
                        <div class="result-card">
                            <span class="result-icon">✅</span>
                            <div class="result-title">พบเอกสาร</div>
                            <div class="result-subtitle" style="color:gray;">กรุณารอสักครู่ : ระบบกำลังนำพาท่านสู่หน้าเอกสาร</div>
                        </div>
                    `;
                } else {
                    showNotify("ไม่พบข้อมูลเอกสาร", "error"); //
                    resultArea.innerHTML = `
                        <div class="result-card">
                            <span class="result-icon" style="color:#dc2626;">❌</span>
                            <div class="result-title">ไม่พบเอกสาร</div>
                            <div class="result-subtitle" style="color:gray;">โปรดตรวจสอบ : ชื่อผู้ใช้บัญชีโรบอคอีกครั้ง</div>
                        </div>
                    `;
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

// เริ่มทำงานเมื่อเปิดหน้าเว็บ
window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    fetchPersonnel();
});
