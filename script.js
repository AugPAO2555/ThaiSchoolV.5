// --- 1. โหลดข่าว (หัวข้อดำ/ปุ่มเขียว) ---
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
                    <a href="post.html?id=${n.id}" class="btn">อ่านต่อ →</a>
                </div>
            </div>
        `).join('');
    } catch (err) { console.error("โหลดข่าวไม่สำเร็จ:", err); }
}

// --- 2. โหลดบุคลากร (ชื่อเขียว/ตำแหน่งดำ) ---
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

// --- 3. ระบบ Modal ประวัติ (กันปลิ้น) ---
function openBio(id) {
    fetch('members.json').then(res => res.json()).then(data => {
        const m = data.find(item => item.id === id);
        if (!m) return;
        document.getElementById('m-name').innerText = m.name;
        document.getElementById('m-role').innerText = m.role;
        document.getElementById('m-dept').innerText = m.dept;
        document.getElementById('m-bio').innerText = m.bio || "ไม่มีข้อมูลประวัติ";

        const modal = document.getElementById('bio-modal');
        modal.style.display = "flex"; 
        document.querySelector('.modal-content').scrollTop = 0; // ดีดขึ้นบนสุดทุกครั้ง
    });
}

function closeModal() { document.getElementById('bio-modal').style.display = "none"; }

// --- 4. ระบบตรวจสอบเอกสาร (ล้างค่าเก่าก่อนโหลด) ---
async function verifyDocument() {
    const username = document.getElementById('roblox-username').value.trim();
    const agency = document.getElementById('agency-select').value;
    const overlay = document.getElementById('status-overlay');
    const bar = document.getElementById('load-bar');
    const msg = document.getElementById('status-msg');

    if (!username) { alert("กรอกชื่อด้วยครับพี่"); return; }

    document.getElementById('verify-result-area').innerHTML = ""; // ล้างผลลัพธ์เก่า
    overlay.classList.add('active');
    bar.style.width = "0%";
    msg.innerText = "กำลังเชื่อมต่อระบบ...";

    setTimeout(() => { bar.style.width = "50%"; msg.innerText = "กำลังตรวจสอบฐานข้อมูล..."; }, 500);

    try {
        const res = await fetch('documents.json');
        const data = await res.json();
        const record = data.find(item => item.roblox_username.toLowerCase() === username.toLowerCase());

        setTimeout(() => {
            bar.style.width = "100%";
            if (record) {
                overlay.classList.remove('active');
                showVerifyResult(record);
            } else {
                document.getElementById('status-title').innerText = "ไม่พบข้อมูล";
                document.getElementById('status-btn').style.display = "block";
            }
        }, 1500);
    } catch (err) { console.error(err); }
}

// --- เริ่มทำงาน ---
window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    fetchPersonnel();
});
