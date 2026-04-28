// --- 1. ฟังก์ชันโหลดข่าวสาร (หน้าแรก) ---
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

// --- 2. ฟังก์ชันโหลดบุคลากร ---
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

// --- 3. ระบบ Modal (แก้ปัญหาข้อมูลปลิ้น) ---
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

        const expBox = document.getElementById('m-exp-list');
        expBox.innerHTML = (m.experience && m.experience.length > 0) 
            ? m.experience.map(ex => `<div class="bio-item"><span>💼</span> <div><b>${ex.year === "ปัจจุบัน" ? "ปัจจุบัน" : "ปี " + ex.year}</b><small>${ex.desc}</small></div></div>`).join('') 
            : '<p>ไม่มีข้อมูล</p>';

        // ใช้ classList แทน .style.display เพื่อความนิ่ง
        document.getElementById('bio-modal').classList.add('active');
        document.querySelector('.modal-content').scrollTop = 0;
    });
}

function closeModal() { 
    document.getElementById('bio-modal').classList.remove('active'); 
}

// --- แก้ไขเฉพาะส่วนตรวจสอบเอกสาร ---
async function verifyDocument() {
    const username = document.getElementById('roblox-username').value.trim();
    const agency = document.getElementById('agency-select').value;
    const overlay = document.getElementById('status-overlay');
    const bar = document.getElementById('load-bar');
    const icon = document.getElementById('status-icon');
    const title = document.getElementById('status-title');
    const msg = document.getElementById('status-msg');
    const btn = document.getElementById('status-btn');
    const resultArea = document.getElementById('verify-result-area');

    if (!username) {
        showStatus(overlay, "❌", "พบข้อผิดพลาด", "กรุณากรอกชื่อผู้ใช้ Roblox", "bg-error");
        btn.style.display = "inline-block"; // ปุ่มตกลงจะโชว์ขนาดปกติ
        return;
    }

    resultArea.innerHTML = "";
    overlay.classList.add('active'); // เปิด Overlay
    btn.style.display = "none";
    bar.className = "loading-bar bg-success";
    bar.style.width = "100%";
    icon.innerHTML = "🔍";
    title.innerText = "กำลังตรวจสอบ";
    msg.innerText = "กำลังตรวจสอบฐานข้อมูลกลาง...";

    try {
        const res = await fetch('documents.json');
        const data = await res.json();
        
        // แก้ให้ตรงกับ JSON (dept_key)
        const record = data.find(item => 
            item.roblox_username.toLowerCase() === username.toLowerCase() && 
            item.dept_key === agency
        );

        setTimeout(() => {
            if (record) {
                icon.innerHTML = "✅";
                title.innerText = "พบเอกสาร";
                msg.innerHTML = "ตรวจสอบข้อมูลเรียบร้อยแล้ว";
                setTimeout(() => { 
                    overlay.classList.remove('active'); 
                    showVerifyResult(record); 
                }, 1500);
            } else {
                showStatus(overlay, "❌", "ไม่พบข้อมูล", "ไม่พบเอกสารในระบบ (โปรดเช็คชื่อ/หน่วยงาน)", "bg-error");
                btn.style.display = "inline-block";
            }
        }, 2000);
    } catch (err) { console.error(err); }
}

function closeStatus() { 
    document.getElementById('status-overlay').classList.remove('active'); 
}

// โค้ดแสดงผลลัพธ์ (ก็อปจากอันเดิมได้เลย แต่ Class ต้องตรงกับ CSS ด้านบน)
