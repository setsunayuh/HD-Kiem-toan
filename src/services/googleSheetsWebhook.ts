import { AuditContract, GoogleSheetConfig } from '../types/audit';

export const DEFAULT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbzuGtc7COTQk-rQ6JQ5i6qswVkafum5JMQ6GkCOWCYBM-ZMkLctt8NAxyjhKdGf9a4g/exec';

export const DEFAULT_SHEET_NAMES = {
  contracts: 'Hợp Đồng Kiểm Toán',
  team: 'Chi Tiết Phân Công Nhân Sự',
};

export const CONTRACT_HEADERS = [
  'Mã Khách Hàng',
  'Tên Khách Hàng',
  'Số Hợp Đồng',
  'Ngày Hợp Đồng',
  'Dịch Vụ',
  'Kỳ Báo Cáo',
  'Số Báo Cáo',
  'Ngày Báo Cáo',
  'Thành Viên BGĐ',
  'Kiểm Toán Viên',
  'Ý Kiến Kiểm Toán',
  'Thông Tin Bổ Sung',
  'Lý Do Bổ Sung',
  'Số Nhân Sự',
  'Tóm Tắt Phân Công',
  'Thời Gian Lưu',
];

export const TEAM_HEADERS = [
  'Số Hợp Đồng',
  'Tên Khách Hàng',
  'Mã Khách Hàng',
  'Vị Trí',
  'Tên Nhân Sự',
  'Phần Hành',
  'Tỷ Lệ Thực Hiện (%)',
  'Thời Gian Lưu',
];

/**
 * Clean, robust Google Apps Script code for the user's Sheet.
 * Handles both e.parameter and e.postData seamlessly!
 */
export const RECOMMENDED_APPS_SCRIPT_CODE = `/**
 * MÃ GOOGLE APPS SCRIPT CHUẨN - TỰ ĐỘNG LƯU ĐẦY ĐỦ THÔNG TIN HỢP ĐỒNG & NHÂN SỰ
 *
 * Hướng dẫn cập nhật trong file Google Sheet của bạn:
 * 1. Mở file Google Sheet của bạn
 * 2. Vào menu "Tiện ích mở rộng" (Extensions) -> "Apps Script"
 * 3. Xóa hết code cũ, dán toàn bộ mã này vào và nhấn Lưu (Ctrl + S)
 * 4. Bấm "Triển khai" (Deploy) -> "Quản lý tùy chọn triển khai" (Manage deployments)
 *    -> Bấm biểu tượng cây bút (Chỉnh sửa) -> Chọn Phiên bản: "Phiên bản mới" (New version)
 *    -> Đảm bảo "Ai có quyền truy cập" là "Bất kỳ ai" (Anyone) -> Bấm Triển khai!
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = {};
    
    // Đọc dữ liệu từ cả e.postData và e.parameter
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var nowStr = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");

    // Lấy thông tin từng trường
    var maKH = data.customerCode || data.maKhachHang || data["Mã Khách Hàng"] || "";
    var tenKH = data.customerName || data.tenKhachHang || data["Tên Khách Hàng"] || "";
    var soHD = data.contractNumber || data.soHopDong || data["Số Hợp Đồng"] || "";
    var ngayHD = data.contractDate || data.ngayHopDong || data["Ngày Hợp Đồng"] || "";
    var dichVu = data.service || data.dichVu || data["Dịch Vụ"] || "";
    var kyBC = data.reportPeriod || data.kyBaoCao || data["Kỳ Báo Cáo"] || "";
    var soBC = data.reportNumber || data.soBaoCao || data["Số Báo Cáo"] || "";
    var ngayBC = data.reportDate || data.ngayBaoCao || data["Ngày Báo Cáo"] || "";
    var bgd = data.boardMember || data.thanhVienBGD || data["Thành Viên BGĐ"] || "";
    var ktv = data.auditor || data.kiemToanVien || data["Kiểm Toán Viên"] || "";
    var yKien = data.auditOpinion || data.yKienKiemToan || data["Ý Kiến Kiểm Toán"] || "";
    var thongTinBoSung = data.additionalTypes || data.thongTinBoSung || data["Thông Tin Bổ Sung"] || "";
    var lyDo = data.opinionReason || data.reason || data.lyDoBoSung || data["Lý Do Bổ Sung"] || "";
    var soNhanSu = data.teamCount || (data.teamMembers ? data.teamMembers.length : 1);
    var tomTatNhanSu = data.teamSummary || data.tomTatPhanCong || "";

    // 1. Ghi vào Sheet "Hợp Đồng Kiểm Toán" (hoặc Sheet đầu tiên nếu chưa có)
    var sheetContracts = ss.getSheetByName("Hợp Đồng Kiểm Toán") || ss.getSheets()[0];
    
    // Nếu sheet còn trống hoàn toàn, tạo dòng tiêu đề
    if (sheetContracts.getLastRow() === 0) {
      sheetContracts.appendRow([
        "Mã Khách Hàng", "Tên Khách Hàng", "Số Hợp Đồng", "Ngày Hợp Đồng",
        "Dịch Vụ", "Kỳ Báo Cáo", "Số Báo Cáo", "Ngày Báo Cáo",
        "Thành Viên BGĐ", "Kiểm Toán Viên", "Ý Kiến Kiểm Toán",
        "Thông Tin Bổ Sung", "Lý Do Bổ Sung", "Số Nhân Sự",
        "Tóm Tắt Phân Công", "Thời Gian Lưu"
      ]);
      sheetContracts.getRange(1, 1, 1, 16).setFontWeight("bold").setBackground("#dbeafe");
      sheetContracts.setFrozenRows(1);
    }

    var contractRow = data.contractRow || [
      maKH, tenKH, soHD, ngayHD, dichVu, kyBC, soBC, ngayBC,
      bgd, ktv, yKien, thongTinBoSung, lyDo, soNhanSu, tomTatNhanSu, nowStr
    ];
    sheetContracts.appendRow(contractRow);

    // 2. Ghi chi tiết từng nhân sự vào Sheet "Chi Tiết Phân Công Nhân Sự"
    var sheetTeam = ss.getSheetByName("Chi Tiết Phân Công Nhân Sự");
    if (!sheetTeam && ss.getSheets().length > 1) {
      sheetTeam = ss.getSheets()[1];
    }
    if (!sheetTeam) {
      sheetTeam = ss.insertSheet("Chi Tiết Phân Công Nhân Sự");
      sheetTeam.appendRow([
        "Số Hợp Đồng", "Tên Khách Hàng", "Mã Khách Hàng", "Vị Trí",
        "Tên Nhân Sự", "Phần Hành", "Tỷ Lệ Thực Hiện (%)", "Thời Gian Lưu"
      ]);
      sheetTeam.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#e0e7ff");
      sheetTeam.setFrozenRows(1);
    }

    if (data.teamRows && data.teamRows.length > 0) {
      for (var i = 0; i < data.teamRows.length; i++) {
        sheetTeam.appendRow(data.teamRows[i]);
      }
    } else if (data.teamMembers && data.teamMembers.length > 0) {
      for (var j = 0; j < data.teamMembers.length; j++) {
        var m = data.teamMembers[j];
        sheetTeam.appendRow([
          soHD, tenKH, maKH, m.position, m.name, m.section, m.percentage + "%", nowStr
        ]);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Đã lưu thành công đầy đủ thông tin!" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return doPost(e);
}
`;

/**
 * Formats a contract into Google Sheets row array
 */
export function formatContractToRow(contract: AuditContract): (string | number)[] {
  const bgd =
    contract.boardMember === 'Khác' && contract.boardMemberOther
      ? `Khác: ${contract.boardMemberOther}`
      : contract.boardMember;

  const ktv =
    contract.auditor === 'Khác' && contract.auditorOther
      ? `Khác: ${contract.auditorOther}`
      : contract.auditor;

  const additionalTypes: string[] = [];
  if (contract.additionalOpinions.emphasisOfMatter) additionalTypes.push('Nhấn mạnh');
  if (contract.additionalOpinions.otherMatters) additionalTypes.push('Vấn đề khác');

  const teamSummary = contract.teamMembers
    .map((m) => `${m.position} - ${m.name} (${m.section}: ${m.percentage}%)`)
    .join('; ');

  const formattedNow = new Date().toLocaleString('vi-VN');

  return [
    contract.customerCode,
    contract.customerName,
    contract.contractNumber,
    contract.contractDate,
    contract.service === 'Khác' && contract.serviceOther
      ? `Khác: ${contract.serviceOther}`
      : contract.service,
    contract.reportPeriod,
    contract.reportNumber,
    contract.reportDate,
    bgd,
    ktv,
    contract.auditOpinion,
    additionalTypes.length > 0 ? additionalTypes.join(', ') : 'Không có',
    contract.additionalOpinions.reason || '',
    contract.teamMembers.length,
    teamSummary,
    formattedNow,
  ];
}

/**
 * Formats team members into rows for the team sheet
 */
export function formatTeamMembersToRows(contract: AuditContract): (string | number)[][] {
  const formattedNow = new Date().toLocaleString('vi-VN');
  return contract.teamMembers.map((member) => [
    contract.contractNumber,
    contract.customerName,
    contract.customerCode,
    member.position,
    member.name,
    member.section,
    `${member.percentage}%`,
    formattedNow,
  ]);
}

/**
 * Sends contract data directly to the owner's Google Apps Script Webhook.
 * Sends data via BOTH URL query parameters AND body payload
 * so that ANY Google Apps Script (whether it uses e.parameter or e.postData)
 * will receive 100% of the contract information!
 */
export async function sendContractToSheetWebhook(
  webhookUrl: string = DEFAULT_WEBHOOK_URL,
  contract: AuditContract
): Promise<{ success: boolean; error?: string }> {
  const targetBaseUrl = (webhookUrl || DEFAULT_WEBHOOK_URL).trim();
  if (!targetBaseUrl || !targetBaseUrl.startsWith('http')) {
    return {
      success: false,
      error: 'Chưa có Webhook URL hợp lệ.',
    };
  }

  const bgd =
    contract.boardMember === 'Khác' && contract.boardMemberOther
      ? `Khác: ${contract.boardMemberOther}`
      : contract.boardMember;

  const ktv =
    contract.auditor === 'Khác' && contract.auditorOther
      ? `Khác: ${contract.auditorOther}`
      : contract.auditor;

  const additionalTypes: string[] = [];
  if (contract.additionalOpinions.emphasisOfMatter) additionalTypes.push('Nhấn mạnh');
  if (contract.additionalOpinions.otherMatters) additionalTypes.push('Vấn đề khác');

  const teamSummary = contract.teamMembers
    .map((m) => `${m.position} - ${m.name} (${m.section}: ${m.percentage}%)`)
    .join('; ');

  const serviceVal =
    contract.service === 'Khác' && contract.serviceOther
      ? `Khác: ${contract.serviceOther}`
      : contract.service;

  const formattedNow = new Date().toLocaleString('vi-VN');
  const contractRow = formatContractToRow(contract);
  const teamRows = formatTeamMembersToRows(contract);

  // 1. Comprehensive multi-format payload
  const payload: Record<string, any> = {
    // Standard English keys
    customerCode: contract.customerCode,
    customerName: contract.customerName,
    contractNumber: contract.contractNumber,
    contractDate: contract.contractDate,
    service: serviceVal,
    reportPeriod: contract.reportPeriod,
    reportNumber: contract.reportNumber,
    reportDate: contract.reportDate,
    boardMember: bgd,
    auditor: ktv,
    auditOpinion: contract.auditOpinion,
    additionalTypes: additionalTypes.join(', '),
    opinionReason: contract.additionalOpinions.reason || '',
    reason: contract.additionalOpinions.reason || '',
    teamCount: contract.teamMembers.length,
    teamSummary: teamSummary,
    timestamp: formattedNow,

    // Vietnamese keys
    maKhachHang: contract.customerCode,
    tenKhachHang: contract.customerName,
    soHopDong: contract.contractNumber,
    ngayHopDong: contract.contractDate,
    dichVu: serviceVal,
    kyBaoCao: contract.reportPeriod,
    soBaoCao: contract.reportNumber,
    ngayBaoCao: contract.reportDate,
    thanhVienBGD: bgd,
    kiemToanVien: ktv,
    yKienKiemToan: contract.auditOpinion,
    thongTinBoSung: additionalTypes.join(', '),
    lyDoBoSung: contract.additionalOpinions.reason || '',
    soNhanSu: contract.teamMembers.length,
    tomTatPhanCong: teamSummary,
    thoiGianLuu: formattedNow,

    // Exact sheet column header keys
    'Mã Khách Hàng': contract.customerCode,
    'Tên Khách Hàng': contract.customerName,
    'Số Hợp Đồng': contract.contractNumber,
    'Ngày Hợp Đồng': contract.contractDate,
    'Dịch Vụ': serviceVal,
    'Kỳ Báo Cáo': contract.reportPeriod,
    'Số Báo Cáo': contract.reportNumber,
    'Ngày Báo Cáo': contract.reportDate,
    'Thành Viên BGĐ': bgd,
    'Kiểm Toán Viên': ktv,
    'Ý Kiến Kiểm Toán': contract.auditOpinion,
    'Thông Tin Bổ Sung': additionalTypes.join(', '),
    'Lý Do Bổ Sung': contract.additionalOpinions.reason || '',
    'Số Nhân Sự': contract.teamMembers.length,
    'Tóm Tắt Phân Công': teamSummary,
    'Thời Gian Lưu': formattedNow,

    // Array structures
    contractRow: contractRow,
    teamRows: teamRows,
    row: contractRow,
    values: contractRow,
    teamMembers: contract.teamMembers,
  };

  // 2. Build URL with query parameters so e.parameter is NEVER empty!
  const urlObj = new URL(targetBaseUrl);
  urlObj.searchParams.set('customerCode', contract.customerCode);
  urlObj.searchParams.set('customerName', contract.customerName);
  urlObj.searchParams.set('contractNumber', contract.contractNumber);
  urlObj.searchParams.set('contractDate', contract.contractDate);
  urlObj.searchParams.set('service', serviceVal);
  urlObj.searchParams.set('reportPeriod', contract.reportPeriod);
  urlObj.searchParams.set('reportNumber', contract.reportNumber);
  urlObj.searchParams.set('reportDate', contract.reportDate);
  urlObj.searchParams.set('boardMember', bgd);
  urlObj.searchParams.set('auditor', ktv);
  urlObj.searchParams.set('auditOpinion', contract.auditOpinion);
  urlObj.searchParams.set('thongTinBoSung', additionalTypes.join(', '));
  urlObj.searchParams.set('reason', contract.additionalOpinions.reason || '');
  urlObj.searchParams.set('teamSummary', teamSummary);
  urlObj.searchParams.set('timestamp', formattedNow);

  // Vietnamese aliases in query params
  urlObj.searchParams.set('maKhachHang', contract.customerCode);
  urlObj.searchParams.set('tenKhachHang', contract.customerName);
  urlObj.searchParams.set('soHopDong', contract.contractNumber);
  urlObj.searchParams.set('ngayHopDong', contract.contractDate);
  urlObj.searchParams.set('dichVu', serviceVal);
  urlObj.searchParams.set('kyBaoCao', contract.reportPeriod);
  urlObj.searchParams.set('soBaoCao', contract.reportNumber);
  urlObj.searchParams.set('ngayBaoCao', contract.reportDate);
  urlObj.searchParams.set('thanhVienBGD', bgd);
  urlObj.searchParams.set('kiemToanVien', ktv);
  urlObj.searchParams.set('yKienKiemToan', contract.auditOpinion);

  const fullUrl = urlObj.toString();

  try {
    // Send via POST with no-cors to handle Google Apps Script 302 redirect
    await fetch(fullUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Lỗi khi gửi webhook Google Sheet:', error);
    // Fallback: try GET with full URL params
    try {
      await fetch(fullUrl, { method: 'GET', mode: 'no-cors' });
      return { success: true };
    } catch (err2: any) {
      return {
        success: false,
        error: error.message || 'Lỗi khi gửi dữ liệu về Google Sheet.',
      };
    }
  }
}
