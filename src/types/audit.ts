export type ServiceType = 'Kiểm toán' | 'Soát xét' | 'Báo cáo vốn' | 'Khác';

export const SERVICE_OPTIONS: ServiceType[] = [
  'Kiểm toán',
  'Soát xét',
  'Báo cáo vốn',
  'Khác',
];

export const BOARD_MEMBERS = [
  'Bùi Tuyết Vân',
  'Nguyễn Ngọc Thùy Dung',
  'Trang Đắc Nha',
  'Đặng Thị Mỹ Vân',
  'Khác',
] as const;

export const AUDITOR_MEMBERS = [
  'Nguyễn Ngọc Thùy Dung',
  'Nguyễn Thị Thùy Trang',
  'Bùi Nhật Huy',
  'Nguyễn Đinh Minh Lai',
  'Khác',
] as const;

export type AuditOpinionType = 'Chấp nhận toàn phần' | 'Ngoại trừ' | 'Từ chối' | 'Trái ngược';

export const AUDIT_OPINIONS: AuditOpinionType[] = [
  'Chấp nhận toàn phần',
  'Ngoại trừ',
  'Từ chối',
  'Trái ngược',
];

export const TEAM_MEMBERS = [
  'Thùy Dung',
  'Thùy Trang',
  'Nhật Huy',
  'Trường Xuân',
  'Mỹ Hoa',
  'Minh Lai',
  'Hoàng Vy',
  'Ngọc Dung',
  'Hoàng Thái',
  'Hoài Thư',
  'Phương Linh',
  'Hà Phương',
  'Trung Kiên',
] as const;

export const AUDIT_SECTIONS = [
  'Báo cáo',
  'IFRS',
  'AP-AC',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'L',
  'P',
  'R',
  'S',
  'T',
] as const;

export interface TeamMemberExecution {
  id: string;
  position: string; // "Nhóm trưởng", "Trợ lý 1", "Trợ lý 2", "Trợ lý 3", etc.
  name: string; // from TEAM_MEMBERS or custom
  section: string; // from AUDIT_SECTIONS
  percentage: number; // e.g. 40 (meaning 40%)
}

export interface AuditContract {
  id: string;
  customerCode: string; // max 5 digits, e.g. 00123
  customerName: string; // Nhập vào
  contractNumber: string; // pattern "000/0000" (3 digits / 4 digits)
  contractDate: string; // dd/mm/yyyy
  service: ServiceType; // Kiểm toán, Soát xét, Báo cáo vốn, Khác
  serviceOther?: string; // If service is Khác
  reportPeriod: string; // dd/mm
  reportNumber: string; // Số báo cáo
  reportDate: string; // dd/mm/yyyy
  
  // Thành viên Ban Giám đốc
  boardMember: string; // Tên được chọn
  boardMemberOther?: string; // Nếu chọn "Khác"
  
  // Kiểm toán viên
  auditor: string; // Tên được chọn
  auditorOther?: string; // Nếu chọn "Khác"
  
  // Ý kiến kiểm toán
  auditOpinion: AuditOpinionType; // Chấp nhận toàn phần, Ngoại trừ, Từ chối, Trái ngược
  
  // Thông tin bổ sung ý kiến kiểm toán
  additionalOpinions: {
    otherMatters: boolean; // Vấn đề khác
    emphasisOfMatter: boolean; // Nhấn mạnh
    reason: string; // dòng trống để điền lý do bổ sung
  };
  
  // THÔNG TIN THỰC HIỆN HỢP ĐỒNG
  teamMembers: TeamMemberExecution[];
  
  createdAt: string;
  updatedAt: string;
  syncedToGoogleSheet?: boolean;
  syncedAt?: string;
  sheetRowIndex?: number;
}

export interface GoogleSheetConfig {
  webhookUrl: string; // Google Apps Script Web App URL (no login needed)
  spreadsheetUrl: string; // Link to view Google Sheet
  spreadsheetId?: string; // Optional raw ID
  spreadsheetName: string;
  contractSheetName: string;
  teamSheetName: string;
  autoSync: boolean;
  lastSyncTime?: string;
}
