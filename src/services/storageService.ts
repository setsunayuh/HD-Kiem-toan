import { AuditContract, GoogleSheetConfig } from '../types/audit';
import { DEFAULT_SHEET_NAMES } from './googleSheetsWebhook';

const CONTRACTS_STORAGE_KEY = 'audit_contracts_v1';
const SHEET_CONFIG_STORAGE_KEY = 'audit_google_sheet_config_v1';

const INITIAL_SAMPLE_CONTRACTS: AuditContract[] = [
  {
    id: 'sample-001',
    customerCode: '00128',
    customerName: 'Công ty Cổ phần Công nghệ & Dịch vụ Tân Phú',
    contractNumber: '086/2026',
    contractDate: '15/01/2026',
    service: 'Kiểm toán',
    reportType: 'Riêng',
    releaseStatus: 'Đã phát hành',
    reportPeriod: '31/12/2025',
    reportNumber: 'BCKT-086/2026',
    reportDate: '15/03/2026',
    boardMember: 'Bùi Tuyết Vân',
    auditor: 'Nguyễn Ngọc Thùy Dung',
    auditOpinion: 'Chấp nhận toàn phần',
    additionalOpinions: {
      otherMatters: false,
      emphasisOfMatter: true,
      reason: 'Lưu ý thuyết minh số 24 về việc thay đổi chính sách khấu hao tài sản cố định từ ngày 01/01/2026 theo quyết định HĐQT.',
    },
    teamMembers: [
      {
        id: 'tm-1',
        position: 'Nhóm trưởng',
        name: 'Thùy Dung',
        section: 'Báo cáo, IFRS',
        percentage: 35,
      },
      {
        id: 'tm-2',
        position: 'Trợ lý 1',
        name: 'Thùy Trang',
        section: 'A, B',
        percentage: 25,
      },
      {
        id: 'tm-3',
        position: 'Trợ lý 2',
        name: 'Nhật Huy',
        section: 'F tiền, F vay',
        percentage: 20,
      },
      {
        id: 'tm-4',
        position: 'Trợ lý 3',
        name: 'Trường Xuân',
        section: 'Q, R',
        percentage: 20,
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    syncedToGoogleSheet: false,
  },
  {
    id: 'sample-002',
    customerCode: '04592',
    customerName: 'Tập đoàn Xuất Nhập Khẩu Rồng Á Đông',
    contractNumber: '112/2026',
    contractDate: '20/02/2026',
    service: 'Soát xét',
    reportType: 'Hợp nhất',
    releaseStatus: 'Chưa phát hành',
    reportPeriod: '30/06/2026',
    reportNumber: 'SX-112/2026',
    reportDate: '25/08/2026',
    boardMember: 'Trang Đắc Nha',
    auditor: 'Bùi Nhật Huy',
    auditOpinion: 'Chấp nhận toàn phần',
    additionalOpinions: {
      otherMatters: false,
      emphasisOfMatter: false,
      reason: '',
    },
    teamMembers: [
      {
        id: 'tm-5',
        position: 'Nhóm trưởng',
        name: 'Nhật Huy',
        section: 'Báo cáo, IFRS',
        percentage: 40,
      },
      {
        id: 'tm-6',
        position: 'Trợ lý 1',
        name: 'Minh Lai',
        section: 'F tiền, Q',
        percentage: 30,
      },
      {
        id: 'tm-7',
        position: 'Trợ lý 2',
        name: 'Mỹ Hoa',
        section: 'AP-AC, C',
        percentage: 30,
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    syncedToGoogleSheet: false,
  },
];

export function getStoredContracts(): AuditContract[] {
  try {
    const raw = localStorage.getItem(CONTRACTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_CONTRACTS));
      return INITIAL_SAMPLE_CONTRACTS;
    }
    const parsed: AuditContract[] = JSON.parse(raw);
    // Ensure all records have reportType and releaseStatus
    return parsed.map((c) => ({
      ...c,
      reportType: c.reportType || 'Riêng',
      releaseStatus: c.releaseStatus || 'Chưa phát hành',
    }));
  } catch (err) {
    console.error('Lỗi đọc danh sách hợp đồng:', err);
    return INITIAL_SAMPLE_CONTRACTS;
  }
}

export function saveContract(contract: AuditContract): AuditContract[] {
  const current = getStoredContracts();
  const existingIndex = current.findIndex((c) => c.id === contract.id);
  let updated: AuditContract[];

  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = { ...contract, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...contract, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
  }

  localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteContract(id: string): AuditContract[] {
  const current = getStoredContracts();
  const updated = current.filter((c) => c.id !== id);
  localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function markContractSynced(id: string, synced: boolean = true): AuditContract[] {
  const current = getStoredContracts();
  const updated = current.map((c) =>
    c.id === id
      ? { ...c, syncedToGoogleSheet: synced, syncedAt: new Date().toISOString() }
      : c
  );
  localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function getStoredSheetConfig(): GoogleSheetConfig | null {
  try {
    const raw = localStorage.getItem(SHEET_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSheetConfig(config: GoogleSheetConfig | null): void {
  if (!config) {
    localStorage.removeItem(SHEET_CONFIG_STORAGE_KEY);
  } else {
    localStorage.setItem(SHEET_CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
}

export function exportContractsToCSV(contracts: AuditContract[]): void {
  const headers = [
    'Mã Khách Hàng',
    'Tên Khách Hàng',
    'Số Hợp Đồng',
    'Ngày Hợp Đồng',
    'Dịch Vụ',
    'Loại Báo Cáo',
    'Phát Hành',
    'Kỳ Báo Cáo',
    'Số Báo Cáo',
    'Ngày Báo Cáo',
    'Thành Viên BGĐ',
    'Kiểm Toán Viên',
    'Ý Kiến Kiểm Toán',
    'Thông Tin Bổ Sung',
    'Lý Do Bổ Sung',
    'Phân Công Nhân Sự',
    'Ngày Lưu',
  ];

  const rows = contracts.map((c) => {
    const bgd = c.boardMember === 'Khác' ? `Khác: ${c.boardMemberOther || ''}` : c.boardMember;
    const ktv = c.auditor === 'Khác' ? `Khác: ${c.auditorOther || ''}` : c.auditor;
    const reportTypeVal = c.reportType === 'Khác' ? `Khác: ${c.reportTypeOther || ''}` : (c.reportType || 'Riêng');
    const additional: string[] = [];
    if (c.additionalOpinions.emphasisOfMatter) additional.push('Nhấn mạnh');
    if (c.additionalOpinions.otherMatters) additional.push('Vấn đề khác');

    const team = c.teamMembers
      .map((m) => `${m.position} - ${m.name} (${m.section}: ${m.percentage}%)`)
      .join('; ');

    return [
      `"${c.customerCode}"`,
      `"${c.customerName.replace(/"/g, '""')}"`,
      `"${c.contractNumber}"`,
      `"${c.contractDate}"`,
      `"${c.service === 'Khác' ? c.serviceOther || 'Khác' : c.service}"`,
      `"${reportTypeVal}"`,
      `"${c.releaseStatus || 'Chưa phát hành'}"`,
      `"${c.reportPeriod}"`,
      `"${c.reportNumber.replace(/"/g, '""')}"`,
      `"${c.reportDate}"`,
      `"${bgd.replace(/"/g, '""')}"`,
      `"${ktv.replace(/"/g, '""')}"`,
      `"${c.auditOpinion}"`,
      `"${additional.join(', ')}"`,
      `"${(c.additionalOpinions.reason || '').replace(/"/g, '""')}"`,
      `"${team.replace(/"/g, '""')}"`,
      `"${c.createdAt}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Danh_sach_hop_dong_kiem_toan_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
