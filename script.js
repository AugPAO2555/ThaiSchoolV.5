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
// ส่วนที่ 2: ระบบตรวจสอบเอกสาร (เน้น Layout เป๊ะ รูปไม่พัง)
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
                const res = await fetch('documents.json'); 
                const docs = await res.json();
                
                const found = docs.find(d => 
                    d.roblox_username.toLowerCase() === user.toLowerCase() &&
                    d.dept_key === agency &&
                    d.doc_type === type
                );

                overlay.style.display = 'none';

                if (found) {
                    showNotify("เข้าสู่ระบบสำเร็จ!", "success");
                    
                    resultArea.innerHTML = `
                        <div class="result-card-container" style="margin-top: 30px; animation: fadeIn 0.5s;">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <span style="font-size: 3rem;">✅</span>
                                <h3 style="font-weight: 800;">พบเอกสาร</h3>
                            </div>

                            <div class="doc-detail-card" style="background: #fff; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden;">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f0f0f0;">
                                    <h5 style="margin: 0; color: #444;">📋 รายละเอียดเอกสาร</h5>
                                    <span style="background: #e6f7ed; color: #00a859; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; border: 1px solid #00a859;">${found.status}</span>
                                </div>

                                <div style="padding: 20px;">
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                        <div>
                                            <small style="color: #999; font-size: 0.7rem;">ชื่อผู้ใช้ Roblox:</small>
                                            <div style="background: #f8f9fa; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 0.9rem;">${found.roblox_username}</div>
                                        </div>
                                        <div>
                                            <small style="color: #999; font-size: 0.7rem;">รหัสเอกสาร:</small>
                                            <div style="background: #f8f9fa; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 0.9rem;">${found.doc_id}</div>
                                        </div>
                                    </div>

                                    <div style="margin-bottom: 15px;">
                                        <small style="color: #999; font-size: 0.7rem;">ประเภทเอกสาร:</small>
                                        <div style="font-weight: 800; font-size: 1rem; color: #1a1a1a;">${found.doc_type}</div>
                                    </div>

                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                                        <div>
                                            <small style="color: #999; font-size: 0.7rem;">ออกเมื่อ:</small>
                                            <div style="font-size: 0.9rem; font-weight: 600;">${found.issue_date}</div>
                                        </div>
                                        <div>
                                            <small style="color: #999; font-size: 0.7rem;">หมดอายุ:</small>
                                            <div style="font-size: 0.9rem; font-weight: 600;">${found.expiry_date}</div>
                                        </div>
                                    </div>

                                    <div style="display: flex; gap: 12px; margin-bottom: 20px;">
                                        <div style="flex: 1; text-align: center;">
                                            <div style="width: 100%; height: 160px; background: #f5f5f5; border: 1px solid #eee; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                                <img src="${found.img_front}" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="Front">
                                            </div>
                                            <p style="font-size: 0.65rem; color: #bbb; margin-top: 5px;">ด้านหน้า</p>
                                        </div>
                                        <div style="flex: 1; text-align: center;">
                                            <div style="width: 100%; height: 160px; background: #f5f5f5; border: 1px solid #eee; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                                <img src="${found.img_back}" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="Back">
                                            </div>
                                            <p style="font-size: 0.65rem; color: #bbb; margin-top: 5px;">ด้านหลัง</p>
                                        </div>
                                    </div>

                                    <div style="background: #f9fbf9; border-left: 5px solid #00a859; padding: 15px; border-radius: 0 10px 10px 0;">
                                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.6; color: #333;"><b>รายละเอียด:</b> ${found.detail}</p>
                                        <p style="margin: 10px 0 0 0; font-size: 0.8rem; color: #666; font-style: italic;"><b>ผู้ออกเอกสาร:</b> ${found.issuer}</p>
                                    </div>
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
