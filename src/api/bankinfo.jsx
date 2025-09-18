import React, { useState, useEffect } from "react";
import getBankInfo from "./path/to/getBankInfo"; // นำเข้า getBankInfo ฟังก์ชัน

const PaymentSlip = () => {
  const [bankInfo, setBankInfo] = useState({
    bankName: "ไม่มีข้อมูล",
    accountNumber: "ไม่มีข้อมูล",
    accountName: "ไม่มีข้อมูล",
    qrCodeImage: "",
    bankLogo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ฟังก์ชันเพื่อดึงข้อมูลธนาคาร
  const fetchBankInfo = async () => {
    setLoading(true);
    try {
      const token = 1;  // ตรวจสอบว่าคุณมี token ที่ถูกต้องหรือไม่
      const data = await getBankInfo(token); // ใช้ฟังก์ชันที่สร้างขึ้น
      setBankInfo(data);
    } catch (err) {
      setError("ไม่สามารถดึงข้อมูลธนาคารได้");
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลเมื่อ component ถูกโหลดครั้งแรก
  useEffect(() => {
    fetchBankInfo();
  }, []);

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h3>ข้อมูลบัญชีธนาคาร</h3>
      <p><strong>ธนาคาร:</strong> {bankInfo.bankName || "ไม่มีข้อมูล"}</p>
      <p><strong>ชื่อบัญชี:</strong> {bankInfo.accountName || "ไม่มีข้อมูล"}</p>
      <p><strong>เลขที่บัญชี:</strong> {bankInfo.accountNumber || "ไม่มีข้อมูล"}</p>
      {bankInfo.qrCodeImage && (
        <div>
          <strong>QR Code:</strong>
          <img src={bankInfo.qrCodeImage} alt="QR Code" />
        </div>
      )}
      {bankInfo.bankLogo && (
        <div>
          <strong>โลโก้ธนาคาร:</strong>
          <img src={bankInfo.bankLogo} alt="Bank Logo" />
        </div>
      )}
    </div>
  );
};

export default PaymentSlip;
