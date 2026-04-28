// ส่วนฟังก์ชันอื่นๆ (fetchNews, fetchPersonnel, openBio) เหมือนเดิมครับ
// แก้ไขเฉพาะฟังก์ชันแสดงผลตรวจสอบด้านล่างนี้:

function showVerifyResult(record) {
    const resultDiv = document.getElementById('verify-result');
    const statusColor = record.status.includes("ไม่") || record.status.includes("หมดอายุ") ? "#dc2626" : "#00a859";

    resultDiv.innerHTML = `
        <div style="background: white; border-radius: 15px; padding: 25px; border: 1px solid #eee; box-shadow: var(--shadow); text-align: left; margin-top:20px; animation: fadeIn 0.5s;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                <h3 style="color: var(--primary); margin: 0;">📋 รายละเอียดเอกสาร</h3>
                <span style="background: ${statusColor}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem;">${record.status}</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 15px; margin-bottom:20px;">
                <div class="copy-box" style="display: flex; flex-direction: column; gap: 5px;">
                    <b>ชื่อผู้ใช้บัญชีโรบอค:</b>
                    <div style="display:flex; gap:5px;">
                        <input type="text" readonly value="${record.roblox_username}" id="copy-user" style="flex:1; border:1px solid #ddd; padding:5px; border-radius:5px; font-size:0.9rem;">
                        <button onclick="copyText('copy-user')" style="background:var(--primary); color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:0.8rem;">คัดลอก</button>
                    </div>
                </div>
                <div class="copy-box" style="display: flex; flex-direction: column; gap: 5px;">
                    <b>รหัสเอกสาร:</b>
                    <div style="display:flex; gap:5px;">
                        <input type="text" readonly value="${record.doc_id}" id="copy-id" style="flex:1; border:1px solid #ddd; padding:5px; border-radius:5px; font-size:0.9rem;">
                        <button onclick="copyText('copy-id')" style="background:var(--primary); color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:0.8rem;">คัดลอก</button>
                    </div>
                </div>
            </div>

            <div style="padding: 10px; line-height: 1.8; font-size: 0.95rem;">
                <p><b>ประเภท:</b> ${record.doc_type}</p>
                <p><b>ออกเมื่อ:</b> ${record.issue_date} | <b>หมดอายุ:</b> <span style="color:${record.expiry_date.includes('ไม่') ? '#777' : '#dc2626'}">${record.expiry_date}</span></p>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                <p><b>รายละเอียด:</b> ${record.detail}</p>
                <p><b>ผู้ออกเอกสาร:</b> ${record.issuer}</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                <img src="${record.img_front || ''}" style="width:100%; border-radius:8px; border:1px solid #ddd; cursor:pointer;" onclick="window.open(this.src)">
                <img src="${record.img_back || ''}" style="width:100%; border-radius:8px; border:1px solid #ddd; cursor:pointer;" onclick="window.open(this.src)">
            </div>
        </div>
    `;
}
