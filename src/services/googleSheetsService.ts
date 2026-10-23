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
  'Vấn Đề Khác / Nhấn Mạnh',
  'Lý Do Bổ Sung Ý Kiến',
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

export interface SheetCreationResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

/**
 * Creates a dedicated Google Spreadsheet formatted for Audit Contracts
 */
export async function createAuditSpreadsheet(
  accessToken: string,
  title: string = 'Quản Lý Hợp Đồng Kiểm Toán'
): Promise<SheetCreationResult> {
  const requestBody = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: DEFAULT_SHEET_NAMES.contracts,
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: DEFAULT_SHEET_NAMES.team,
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Không thể tạo Google Sheet (Mã lỗi ${response.status})`
    );
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write headers to both sheets
  await appendValuesToSheet(accessToken, spreadsheetId, DEFAULT_SHEET_NAMES.contracts, [
    CONTRACT_HEADERS,
  ]);
  await appendValuesToSheet(accessToken, spreadsheetId, DEFAULT_SHEET_NAMES.team, [
    TEAM_HEADERS,
  ]);

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
}

/**
 * Appends row values to a specific sheet range
 */
export async function appendValuesToSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  values: (string | number)[][]
): Promise<void> {
  const encodedTitle = encodeURIComponent(sheetTitle);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedTitle}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Không thể ghi dữ liệu vào Google Sheet (${response.status})`
    );
  }
}

/**
 * Formats a contract into Google Sheets row data
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
 * Appends a full contract and its team members to the Google Sheet
 */
export async function syncContractToGoogleSheet(
  accessToken: string,
  config: GoogleSheetConfig,
  contract: AuditContract
): Promise<{ success: boolean; error?: string }> {
  try {
    const contractRow = formatContractToRow(contract);
    const teamRows = formatTeamMembersToRows(contract);

    // Append to contracts sheet
    await appendValuesToSheet(
      accessToken,
      config.spreadsheetId,
      config.contractSheetName || DEFAULT_SHEET_NAMES.contracts,
      [contractRow]
    );

    // Append to team members sheet
    if (teamRows.length > 0) {
      await appendValuesToSheet(
        accessToken,
        config.spreadsheetId,
        config.teamSheetName || DEFAULT_SHEET_NAMES.team,
        teamRows
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error('Lỗi lưu Google Sheet:', error);
    return { success: false, error: error.message || 'Lỗi lưu Google Sheet' };
  }
}

/**
 * Validates access to an existing spreadsheet and fetches its title
 */
export async function verifySpreadsheetAccess(
  accessToken: string,
  spreadsheetId: string
): Promise<{ valid: boolean; title?: string; sheets?: string[]; error?: string }> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties.title`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        valid: false,
        error: err.error?.message || `Không có quyền truy cập hoặc file không tồn tại (${response.status})`,
      };
    }

    const data = await response.json();
    const sheetTitles = data.sheets?.map((s: any) => s.properties?.title as string) || [];

    return {
      valid: true,
      title: data.properties?.title,
      sheets: sheetTitles,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: err.message || 'Lỗi kết nối Google Sheets API',
    };
  }
}

/**
 * Extracts spreadsheet ID from Google Sheet URL or raw ID
 */
export function extractSpreadsheetId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Pattern: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // Pure ID
  if (/^[a-zA-Z0-9-_]{20,60}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}
