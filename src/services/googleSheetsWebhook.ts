import { AuditContract, GoogleSheetConfig } from '../types/audit';

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
 * Clean Google Apps Script template for the Sheet Owner.
 * Works seamlessly with zero-login for all employees!
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT - TỰ ĐỘNG LƯU HỢP ĐỒNG KIỂM TOÁN VÀO GOOGLE SHEET CỦA BẠN
 * Hướng dẫn 3 bước:
 * 1. Mở file Google Sheet của bạn -> Chọn menu "Tiện ích mở rộng" (Extensions) -> "Apps Script"
 * 2. Dán toàn bộ mã này vào và nhấn Lưu (Ctrl+S)
 * 3. Bấm "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment)
 *    - Chọn loại: "Ứng dụng web" (Web app)
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)
 *    -> Bấm Triển khai và copy đường link URL dán vào ứng dụng web!
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);

    // 1. Ghi vào Sheet "Hợp Đồng Kiểm Toán"
    var sheetContracts = ss.getSheetByName("Hợp Đồng Kiểm Toán");
    if (!sheetContracts) {
      sheetContracts = ss.insertSheet("Hợp Đồng Kiểm Toán");
      sheetContracts.appendRow([
        "Mã Khách Hàng", "Tên Khách Hàng", "Số Hợp Đồng", "Ngày Hợp Đồng",
        "Dịch Vụ", "Kỳ Báo Cáo", "Số Báo Cáo", "Ngày Báo Cáo",
        "Thành Viên BGĐ", "Kiểm Toán Viên", "Ý Kiến Kiểm Toán",
        "Thông Tin Bổ Sung", "Lý Do Bổ Sung", "Số Nhân Sự",
        "Tóm Tắt Phân Công", "Thời Gian Lưu"
      ]);
      sheetContracts.getRange(1, 1, 1, 16).setFontWeight("bold").setBackground("#e2e8f0");
      sheetContracts.setFrozenRows(1);
    }

    if (data.contractRow) {
      sheetContracts.appendRow(data.contractRow);
    }

    // 2. Ghi vào Sheet "Chi Tiết Phân Công Nhân Sự"
    var sheetTeam = ss.getSheetByName("Chi Tiết Phân Công Nhân Sự");
    if (!sheetTeam) {
      sheetTeam = ss.insertSheet("Chi Tiết Phân Công Nhân Sự");
      sheetTeam.appendRow([
        "Số Hợp Đồng", "Tên Khách Hàng", "Mã Khách Hàng", "Vị Trí",
        "Tên Nhân Sự", "Phần Hành", "Tỷ Lệ Thực Hiện (%)", "Thời Gian Lưu"
      ]);
      sheetTeam.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#e2e8f0");
      sheetTeam.setFrozenRows(1);
    }

    if (data.teamRows && data.teamRows.length > 0) {
      for (var i = 0; i < data.teamRows.length; i++) {
        sheetTeam.appendRow(data.teamRows[i]);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Đã lưu thành công" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "ready", message: "Apps Script Web App đang hoạt động tốt!" }))
    .setMimeType(ContentService.MimeType.JSON);
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
 * Sends contract data directly to the owner's Google Apps Script Webhook
 * Without requiring any Google login from the employee!
 */
export async function sendContractToSheetWebhook(
  webhookUrl: string,
  contract: AuditContract
): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl || !webhookUrl.trim().startsWith('http')) {
    return {
      success: false,
      error: 'Chưa cấu hình URL kết nối Google Sheet. Vui lòng thiết lập trong Cài Đặt Google Sheets.',
    };
  }

  const payload = {
    action: 'saveContract',
    contractNumber: contract.contractNumber,
    customerName: contract.customerName,
    contractRow: formatContractToRow(contract),
    teamRows: formatTeamMembersToRows(contract),
    timestamp: new Date().toISOString(),
  };

  try {
    // Send to Google Apps Script Web App
    // Note: text/plain avoids CORS preflight OPTIONS which Google Apps Script doesn't handle,
    // and mode 'no-cors' guarantees submission even through 302 redirects.
    await fetch(webhookUrl.trim(), {
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
    return {
      success: false,
      error: error.message || 'Lỗi khi gửi dữ liệu về Google Sheet.',
    };
  }
}
