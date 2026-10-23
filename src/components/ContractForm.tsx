import React, { useState } from 'react';
import {
  AuditContract,
  SERVICE_OPTIONS,
  BOARD_MEMBERS,
  AUDITOR_MEMBERS,
  AUDIT_OPINIONS,
  TEAM_MEMBERS,
  AUDIT_SECTIONS,
  TeamMemberExecution,
  ServiceType,
  AuditOpinionType,
} from '../types/audit';
import {
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Building2,
  Calendar,
  FileSpreadsheet,
  ShieldCheck,
  UserCheck,
  Percent,
} from 'lucide-react';

interface ContractFormProps {
  onSaveContract: (contract: AuditContract) => Promise<{ success: boolean; sheetError?: string }>;
  isSyncing: boolean;
  sheetConfigured: boolean;
  onOpenSheetConfig: () => void;
}

export const ContractForm: React.FC<ContractFormProps> = ({
  onSaveContract,
  isSyncing,
  sheetConfigured,
  onOpenSheetConfig,
}) => {
  // Form State
  const [customerCode, setCustomerCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [contractDate, setContractDate] = useState('');
  const [service, setService] = useState<ServiceType>('Kiểm toán');
  const [serviceOther, setServiceOther] = useState('');
  const [reportPeriod, setReportPeriod] = useState('31/12');
  const [reportNumber, setReportNumber] = useState('');
  const [reportDate, setReportDate] = useState('');

  // Sign-off personnel
  const [boardMember, setBoardMember] = useState<string>('Bùi Tuyết Vân');
  const [boardMemberOther, setBoardMemberOther] = useState('');

  const [auditor, setAuditor] = useState<string>('Nguyễn Ngọc Thùy Dung');
  const [auditorOther, setAuditorOther] = useState('');

  // Opinion & additions
  const [auditOpinion, setAuditOpinion] = useState<AuditOpinionType>('Chấp nhận toàn phần');
  const [emphasisOfMatter, setEmphasisOfMatter] = useState(false);
  const [otherMatters, setOtherMatters] = useState(false);
  const [opinionReason, setOpinionReason] = useState('');

  // Team Table (THÔNG TIN THỰC HIỆN HỢP ĐỒNG)
  const [teamMembers, setTeamMembers] = useState<TeamMemberExecution[]>([
    {
      id: 'row-1',
      position: 'Nhóm trưởng',
      name: 'Thùy Dung',
      section: 'Báo cáo',
      percentage: 40,
    },
    {
      id: 'row-2',
      position: 'Trợ lý 1',
      name: 'Thùy Trang',
      section: 'A',
      percentage: 30,
    },
    {
      id: 'row-3',
      position: 'Trợ lý 2',
      name: 'Nhật Huy',
      section: 'B',
      percentage: 30,
    },
  ]);

  // Validation errors
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [saveSuccessContract, setSaveSuccessContract] = useState<AuditContract | null>(null);
  const [sheetSyncResult, setSheetSyncResult] = useState<{ success: boolean; message?: string } | null>(null);

  // Calculate current sum of percentages
  const totalPercentage = teamMembers.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0);

  // Formatting helper for Customer Code (max 5 digits)
  const handleCustomerCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 5);
    setCustomerCode(val);
  };

  const padCustomerCode = () => {
    if (!customerCode) {
      setCustomerCode('00001');
    } else {
      setCustomerCode(customerCode.padStart(5, '0'));
    }
  };

  // Helper for contract number formatting "000/0000"
  const handleContractNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d/]/g, '');
    if (/^\d{4,}$/.test(val) && !val.includes('/')) {
      val = val.slice(0, 3) + '/' + val.slice(3, 7);
    }
    if (val.length > 8) val = val.slice(0, 8);
    setContractNumber(val);
  };

  // Date mask helper for dd/mm/yyyy
  const handleDateInput = (val: string, setter: (s: string) => void) => {
    let cleaned = val.replace(/[^\d/]/g, '');
    if (cleaned.length === 2 && !cleaned.includes('/')) {
      cleaned = cleaned + '/';
    } else if (cleaned.length === 5 && cleaned.split('/').length === 2) {
      cleaned = cleaned + '/';
    }
    if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);
    setter(cleaned);
  };

  // Period mask helper for dd/mm
  const handlePeriodInput = (val: string) => {
    let cleaned = val.replace(/[^\d/]/g, '');
    if (cleaned.length === 2 && !cleaned.includes('/')) {
      cleaned = cleaned + '/';
    }
    if (cleaned.length > 5) cleaned = cleaned.slice(0, 5);
    setReportPeriod(cleaned);
  };

  // Set today date helper
  const setToday = (setter: (s: string) => void) => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    setter(`${d}/${m}/${y}`);
  };

  // Team row operations
  const handleAddTeamRow = () => {
    const nextIdx = teamMembers.length;
    let defaultPos = 'Trợ lý ' + nextIdx;
    if (nextIdx === 0) defaultPos = 'Nhóm trưởng';
    else if (nextIdx === 1) defaultPos = 'Trợ lý 1';

    const remaining = Math.max(0, 100 - totalPercentage);

    const newRow: TeamMemberExecution = {
      id: 'row-' + Date.now() + Math.random(),
      position: defaultPos,
      name: TEAM_MEMBERS[Math.min(nextIdx, TEAM_MEMBERS.length - 1)],
      section: AUDIT_SECTIONS[Math.min(nextIdx, AUDIT_SECTIONS.length - 1)],
      percentage: remaining > 0 ? remaining : 10,
    };
    setTeamMembers([...teamMembers, newRow]);
  };

  const handleRemoveTeamRow = (id: string) => {
    if (teamMembers.length <= 1) {
      alert('Nhóm thực hiện phải có ít nhất 1 thành viên.');
      return;
    }
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
  };

  const handleUpdateTeamRow = (id: string, field: keyof TeamMemberExecution, value: any) => {
    setTeamMembers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Auto balance remaining percentage
  const handleAutoBalance = () => {
    if (teamMembers.length === 0) return;
    const count = teamMembers.length;
    const base = Math.floor(100 / count);
    const remainder = 100 - base * count;

    setTeamMembers((prev) =>
      prev.map((item, idx) => ({
        ...item,
        percentage: idx === 0 ? base + remainder : base,
      }))
    );
  };

  // Reset form to blank template
  const handleResetForm = () => {
    setCustomerCode('');
    setCustomerName('');
    setContractNumber('');
    setContractDate('');
    setService('Kiểm toán');
    setServiceOther('');
    setReportPeriod('31/12');
    setReportNumber('');
    setReportDate('');
    setBoardMember('Bùi Tuyết Vân');
    setBoardMemberOther('');
    setAuditor('Nguyễn Ngọc Thùy Dung');
    setAuditorOther('');
    setAuditOpinion('Chấp nhận toàn phần');
    setEmphasisOfMatter(false);
    setOtherMatters(false);
    setOpinionReason('');
    setTeamMembers([
      {
        id: 'row-1',
        position: 'Nhóm trưởng',
        name: 'Thùy Dung',
        section: 'Báo cáo',
        percentage: 50,
      },
      {
        id: 'row-2',
        position: 'Trợ lý 1',
        name: 'Thùy Trang',
        section: 'A',
        percentage: 50,
      },
    ]);
    setErrors([]);
    setSaveSuccessContract(null);
  };

  // Comprehensive Validation
  const validateForm = (): string[] => {
    const errs: string[] = [];

    // 1. Mã khách hàng: tối đa 5 chữ số
    if (!customerCode.trim()) {
      errs.push('Mã khách hàng: Chưa nhập (tối đa 5 chữ số, ví dụ 00128).');
    } else if (!/^\d{1,5}$/.test(customerCode.trim())) {
      errs.push('Mã khách hàng: Phải là dạng số, tối đa 5 chữ số.');
    }

    // 2. Tên khách hàng
    if (!customerName.trim()) {
      errs.push('Tên khách hàng: Chưa nhập.');
    }

    // 3. Số hợp đồng: mẫu "000/0000"
    if (!contractNumber.trim()) {
      errs.push('Số hợp đồng: Chưa nhập.');
    } else if (!/^\d{3}\/\d{4}$/.test(contractNumber.trim())) {
      errs.push('Số hợp đồng: Sai định dạng! Bắt buộc phải theo mẫu "000/0000" (ví dụ: 086/2026).');
    }

    // 4. Ngày hợp đồng: dd/mm/yyyy
    if (!contractDate.trim()) {
      errs.push('Ngày hợp đồng: Chưa nhập (theo mẫu dd/mm/yyyy).');
    } else if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(contractDate.trim())) {
      errs.push('Ngày hợp đồng: Sai định dạng ngày (phải là dd/mm/yyyy, ví dụ: 15/01/2026).');
    }

    // 5. Dịch vụ
    if (!service) {
      errs.push('Dịch vụ: Chưa chọn loại dịch vụ.');
    } else if (service === 'Khác' && !serviceOther.trim()) {
      errs.push('Dịch vụ: Đang chọn "Khác" nhưng chưa điền chi tiết loại dịch vụ.');
    }

    // 6. Kỳ báo cáo: dd/mm
    if (!reportPeriod.trim()) {
      errs.push('Kỳ báo cáo: Chưa nhập (theo mẫu dd/mm).');
    } else if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/.test(reportPeriod.trim())) {
      errs.push('Kỳ báo cáo: Sai định dạng! Phải theo mẫu dd/mm (ví dụ: 31/12 hoặc 30/06).');
    }

    // 7. Số báo cáo
    if (!reportNumber.trim()) {
      errs.push('Số báo cáo: Chưa nhập.');
    }

    // 8. Ngày báo cáo: dd/mm/yyyy
    if (!reportDate.trim()) {
      errs.push('Ngày báo cáo: Chưa nhập (theo mẫu dd/mm/yyyy).');
    } else if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(reportDate.trim())) {
      errs.push('Ngày báo cáo: Sai định dạng ngày báo cáo (phải là dd/mm/yyyy, ví dụ: 25/03/2026).');
    }

    // 9. Thành viên Ban Giám đốc
    if (!boardMember) {
      errs.push('Thành viên Ban Giám đốc: Chưa tích chọn.');
    } else if (boardMember === 'Khác' && !boardMemberOther.trim()) {
      errs.push('Thành viên Ban Giám đốc: Đang chọn "Khác", vui lòng điền họ tên.');
    }

    // 10. Kiểm toán viên
    if (!auditor) {
      errs.push('Kiểm toán viên: Chưa tích chọn.');
    } else if (auditor === 'Khác' && !auditorOther.trim()) {
      errs.push('Kiểm toán viên: Đang chọn "Khác", vui lòng điền họ tên.');
    }

    // 11. Ý kiến kiểm toán
    if (!auditOpinion) {
      errs.push('Ý kiến kiểm toán: Chưa chọn ý kiến kiểm toán.');
    }

    // 12. Thông tin bổ sung ý kiến kiểm toán
    if ((emphasisOfMatter || otherMatters) && !opinionReason.trim()) {
      errs.push('Thông tin bổ sung ý kiến: Đã tích chọn Vấn đề khác / Nhấn mạnh thì phải nhập lý do bổ sung.');
    }

    // 13. THÔNG TIN THỰC HIỆN HỢP ĐỒNG (Bảng nhóm)
    if (!teamMembers || teamMembers.length === 0) {
      errs.push('Thông tin thực hiện hợp đồng: Bảng phân công nhóm kiểm toán không được để trống.');
    } else {
      teamMembers.forEach((member, index) => {
        const rowNo = index + 1;
        if (!member.position.trim()) {
          errs.push(`Dòng ${rowNo}: Vị trí thực hiện chưa nhập.`);
        }
        if (!member.name) {
          errs.push(`Dòng ${rowNo}: Tên nhân sự chưa chọn.`);
        }
        if (!member.section) {
          errs.push(`Dòng ${rowNo}: Phần hành kiểm toán chưa chọn.`);
        }
        const pct = Number(member.percentage);
        if (isNaN(pct) || pct <= 0) {
          errs.push(`Dòng ${rowNo}: Tỷ lệ thực hiện (%) phải lớn hơn 0%.`);
        }
      });

      // Bắt buộc tổng % bằng 100%
      if (totalPercentage !== 100) {
        errs.push(
          `Tỷ lệ thực hiện: Tổng % của nhóm hiện tại là ${totalPercentage}%. Yêu cầu bắt buộc tổng % phải đúng bằng 100% (đang ${
            totalPercentage < 100 ? `thiếu ${100 - totalPercentage}%` : `vượt ${totalPercentage - 100}%`
          }).`
        );
      }
    }

    return errs;
  };

  // OK Button Click Handler
  const handleOkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setShowErrorModal(true);
      return;
    }

    setErrors([]);

    const newContract: AuditContract = {
      id: 'contract-' + Date.now(),
      customerCode: customerCode.trim(),
      customerName: customerName.trim(),
      contractNumber: contractNumber.trim(),
      contractDate: contractDate.trim(),
      service,
      serviceOther: service === 'Khác' ? serviceOther.trim() : undefined,
      reportPeriod: reportPeriod.trim(),
      reportNumber: reportNumber.trim(),
      reportDate: reportDate.trim(),
      boardMember,
      boardMemberOther: boardMember === 'Khác' ? boardMemberOther.trim() : undefined,
      auditor,
      auditorOther: auditor === 'Khác' ? auditorOther.trim() : undefined,
      auditOpinion,
      additionalOpinions: {
        otherMatters,
        emphasisOfMatter,
        reason: opinionReason.trim(),
      },
      teamMembers: teamMembers.map((m) => ({
        ...m,
        percentage: Number(m.percentage),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const res = await onSaveContract(newContract);
    setSaveSuccessContract(newContract);
    setSheetSyncResult({
      success: res.success,
      message: res.sheetError,
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Banner / Guide */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <ShieldCheck className="w-4 h-4" />
              Tự Động Lưu Về Google Sheet Riêng • Không Cần Đăng Nhập
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Biểu Mẫu Nhập Hợp Đồng & Phân Công Nhóm
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Nhân viên chỉ cần mở trang web, nhập đầy đủ thông tin hợp đồng và phân bổ tỷ lệ nhóm (tổng 100%), bấm OK sẽ tự động gửi thẳng về file Google Sheet của bạn.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sheetConfigured ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-medium">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Google Sheet Đã Kết Nối</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenSheetConfig}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Cài Đặt Link Google Sheet</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleOkSubmit} className="space-y-8">
        {/* SECTION 1: THÔNG TIN KHÁCH HÀNG & HỢP ĐỒNG */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Thông Tin Khách Hàng & Hợp Đồng
              </h3>
              <p className="text-xs text-slate-500">
                Nhập mã khách hàng (tối đa 5 số), tên khách hàng, số và ngày ký hợp đồng
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Mã khách hàng */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  Mã khách hàng <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-slate-400">(tối đa 5 chữ số)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${
                      customerCode.length === 5 ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {customerCode.length}/5 số
                  </span>
                  <button
                    type="button"
                    onClick={padCustomerCode}
                    className="text-[11px] text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                    title="Đệm số 0 vào trước cho đủ 5 số"
                  >
                    Đệm 5 số
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={customerCode}
                onChange={handleCustomerCodeChange}
                placeholder="VD: 00128 hoặc 12345"
                maxLength={5}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 text-sm font-mono tracking-wider transition-all"
              />
            </div>

            {/* Tên khách hàng */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tên khách hàng <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="VD: Công ty Cổ phần Thép Miền Đông"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 text-sm transition-all"
                />
              </div>
            </div>

            {/* Số hợp đồng */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  Số hợp đồng <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-mono">
                  Mẫu: 000/0000
                </span>
              </div>
              <input
                type="text"
                value={contractNumber}
                onChange={handleContractNumberChange}
                placeholder="VD: 086/2026 (3 số đầu / 4 số năm)"
                maxLength={8}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 text-sm font-mono tracking-wider transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                3 số đầu là số hợp đồng, 4 số sau dấu &quot;/&quot; là năm phát hành.
              </p>
            </div>

            {/* Ngày hợp đồng */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  Ngày hợp đồng <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-slate-400">(dd/mm/yyyy)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setToday(setContractDate)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  Hôm nay
                </button>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={contractDate}
                  onChange={(e) => handleDateInput(e.target.value, setContractDate)}
                  placeholder="VD: 15/01/2026"
                  maxLength={10}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 text-sm font-mono transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: DỊCH VỤ & BÁO CÁO KIỂM TOÁN */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Dịch Vụ & Kỳ Báo Cáo
              </h3>
              <p className="text-xs text-slate-500">
                Phân loại dịch vụ, kỳ kế toán và số liệu báo cáo phát hành
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Dịch vụ */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Dịch vụ <span className="text-red-500">*</span>
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as ServiceType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 text-sm transition-all bg-white"
              >
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              {/* Nếu chọn Khác */}
              {service === 'Khác' && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={serviceOther}
                    onChange={(e) => setServiceOther(e.target.value)}
                    placeholder="Nhập tên dịch vụ khác..."
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 text-slate-900 text-sm bg-amber-50/50"
                  />
                </div>
              )}
            </div>

            {/* Kỳ báo cáo: dd/mm */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  Kỳ báo cáo <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-slate-400">(mẫu dd/mm)</span>
                </label>
                <div className="flex items-center gap-1">
                  {['31/12', '30/06', '31/03', '30/09'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setReportPeriod(preset)}
                      className="text-[11px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={reportPeriod}
                onChange={(e) => handlePeriodInput(e.target.value)}
                placeholder="VD: 31/12 hoặc 30/06"
                maxLength={5}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 text-sm font-mono tracking-wider transition-all"
              />
            </div>

            {/* Số báo cáo */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Số báo cáo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={reportNumber}
                onChange={(e) => setReportNumber(e.target.value)}
                placeholder="VD: BCKT-086/2026 hoặc 086/BCKT"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 text-sm transition-all"
              />
            </div>

            {/* Ngày báo cáo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  Ngày báo cáo <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-slate-400">(dd/mm/yyyy)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setToday(setReportDate)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                >
                  Hôm nay
                </button>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={reportDate}
                  onChange={(e) => handleDateInput(e.target.value, setReportDate)}
                  placeholder="VD: 25/03/2026"
                  maxLength={10}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 text-sm font-mono transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: NHÂN SỰ KÝ DUYỆT & Ý KIẾN KIỂM TOÁN */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Thành Viên BGĐ, Kiểm Toán Viên & Ý Kiến Kiểm Toán
              </h3>
              <p className="text-xs text-slate-500">
                Tích chọn người ký báo cáo và nội dung ý kiến kiểm toán
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thành viên Ban Giám đốc */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
              <label className="block text-sm font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-600" />
                Thành viên Ban Giám đốc <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {BOARD_MEMBERS.map((name) => (
                  <label
                    key={name}
                    className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                      boardMember === name
                        ? 'bg-teal-50/80 border-teal-300 text-teal-900 font-medium'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="boardMember"
                      value={name}
                      checked={boardMember === name}
                      onChange={() => setBoardMember(name)}
                      className="text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm">{name}</span>
                  </label>
                ))}
              </div>

              {boardMember === 'Khác' && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Điền tên Thành viên Ban Giám đốc khác:
                  </label>
                  <input
                    type="text"
                    value={boardMemberOther}
                    onChange={(e) => setBoardMemberOther(e.target.value)}
                    placeholder="Nhập họ và tên Thành viên BGĐ..."
                    className="w-full px-3.5 py-2 rounded-lg border border-teal-300 focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                  />
                </div>
              )}
            </div>

            {/* Kiểm toán viên */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
              <label className="block text-sm font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Kiểm toán viên <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {AUDITOR_MEMBERS.map((name) => (
                  <label
                    key={name}
                    className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                      auditor === name
                        ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-medium'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="auditor"
                      value={name}
                      checked={auditor === name}
                      onChange={() => setAuditor(name)}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm">{name}</span>
                  </label>
                ))}
              </div>

              {auditor === 'Khác' && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Điền tên Kiểm toán viên khác:
                  </label>
                  <input
                    type="text"
                    value={auditorOther}
                    onChange={(e) => setAuditorOther(e.target.value)}
                    placeholder="Nhập họ và tên Kiểm toán viên..."
                    className="w-full px-3.5 py-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Ý kiến kiểm toán */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <label className="block text-sm font-bold text-slate-800 mb-2.5">
              Ý kiến kiểm toán <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AUDIT_OPINIONS.map((opinion) => (
                <label
                  key={opinion}
                  className={`flex items-center gap-2.5 p-3 rounded-xl cursor-pointer border text-center transition-all ${
                    auditOpinion === opinion
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold ring-2 ring-indigo-200'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="auditOpinion"
                    value={opinion}
                    checked={auditOpinion === opinion}
                    onChange={() => setAuditOpinion(opinion)}
                    className="text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-left">{opinion}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Thông tin bổ sung ý kiến kiểm toán */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Thông tin bổ sung ý kiến kiểm toán:
            </label>
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={otherMatters}
                  onChange={(e) => setOtherMatters(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700">Vấn đề khác</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={emphasisOfMatter}
                  onChange={(e) => setEmphasisOfMatter(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700">Nhấn mạnh</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Dòng trống điền lý do bổ sung {(emphasisOfMatter || otherMatters) && <span className="text-red-500">*</span>}:
              </label>
              <textarea
                rows={2}
                value={opinionReason}
                onChange={(e) => setOpinionReason(e.target.value)}
                placeholder="Nhập chi tiết nội dung vấn đề khác hoặc vấn đề cần nhấn mạnh trong báo cáo..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: THÔNG TIN THỰC HIỆN HỢP ĐỒNG (BẢNG NHÂN SỰ & TỶ LỆ) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  Thông Tin Thực Hiện Hợp Đồng
                </h3>
                <p className="text-xs text-slate-500">
                  Kẻ bảng phân công Vị trí, Tên, Phần hành và Tỷ lệ thực hiện (%)
                </p>
              </div>
            </div>

            {/* Total Percentage Indicator */}
            <div className="flex items-center gap-2">
              {totalPercentage === 100 ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-xl font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tổng tỷ lệ: 100% (Đạt chuẩn)</span>
                </div>
              ) : totalPercentage < 100 ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 border border-amber-300 text-amber-700 rounded-xl font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Tổng: {totalPercentage}% (Thiếu {100 - totalPercentage}%)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 border border-red-300 text-red-700 rounded-xl font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Tổng: {totalPercentage}% (Vượt {totalPercentage - 100}%)</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleAutoBalance}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors cursor-pointer"
                title="Tự động chia đều cho các thành viên để tổng đủ 100%"
              >
                Cân đối 100%
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-3 min-w-[150px]">Vị trí</th>
                  <th className="py-3 px-3 min-w-[160px]">Tên</th>
                  <th className="py-3 px-3 min-w-[140px]">Phần hành</th>
                  <th className="py-3 px-3 min-w-[140px]">Tỷ lệ thực hiện</th>
                  <th className="py-3 px-3 w-12 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {teamMembers.map((member, index) => (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-xs">
                      {index + 1}
                    </td>

                    {/* Vị trí */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={member.position}
                        onChange={(e) =>
                          handleUpdateTeamRow(member.id, 'position', e.target.value)
                        }
                        placeholder="Nhóm trưởng, Trợ lý..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 text-sm"
                      />
                    </td>

                    {/* Tên (Sổ xuống) */}
                    <td className="py-2.5 px-3">
                      <select
                        value={member.name}
                        onChange={(e) =>
                          handleUpdateTeamRow(member.id, 'name', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 text-sm bg-white"
                      >
                        {TEAM_MEMBERS.map((tm) => (
                          <option key={tm} value={tm}>
                            {tm}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Phần hành (Sổ xuống) */}
                    <td className="py-2.5 px-3">
                      <select
                        value={member.section}
                        onChange={(e) =>
                          handleUpdateTeamRow(member.id, 'section', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 text-sm bg-white"
                      >
                        {AUDIT_SECTIONS.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Tỷ lệ thực hiện */}
                    <td className="py-2.5 px-3">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={member.percentage}
                          onChange={(e) =>
                            handleUpdateTeamRow(
                              member.id,
                              'percentage',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full pl-3 pr-8 py-1.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 text-sm font-semibold text-slate-800"
                        />
                        <span className="absolute right-2.5 top-2 text-xs font-bold text-slate-400">
                          %
                        </span>
                      </div>
                    </td>

                    {/* Xóa dòng */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveTeamRow(member.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa thành viên này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900 text-sm">
                  <td colSpan={4} className="py-3 px-4 text-right">
                    Tổng Tỷ Lệ Thực Hiện:
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-base font-extrabold ${
                        totalPercentage === 100
                          ? 'text-emerald-600'
                          : totalPercentage < 100
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {totalPercentage}%
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Add Row Button & Helpers */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleAddTeamRow}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Thành Viên Vào Nhóm</span>
            </button>

            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-indigo-500" />
              <span>Lưu ý: Bắt buộc tổng tỷ lệ thực hiện của cả nhóm phải đúng bằng 100%.</span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR WITH THE PROMINENT 'OK' BUTTON */}
        <div className="sticky bottom-4 z-30 bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-800 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left w-full sm:w-auto">
            <div className="text-xs text-slate-400">
              Kiểm tra toàn bộ thông tin hợp đồng & nhóm kiểm toán trước khi bấm OK
            </div>
            <div className="text-sm font-semibold text-slate-200 flex items-center gap-2 mt-0.5">
              <span>Trạng thái:</span>
              {totalPercentage === 100 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Đầy đủ tỷ lệ 100%
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Tỷ lệ chưa bằng 100% (Hiện tại {totalPercentage}%)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer"
            >
              Làm mới biểu mẫu
            </button>

            {/* NÚT OK BẮT BUỘC THEO YÊU CẦU */}
            <button
              type="submit"
              disabled={isSyncing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-400 hover:via-teal-400 hover:to-blue-500 text-white font-extrabold text-base tracking-wide shadow-xl shadow-teal-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>ĐANG LƯU & GỬI VỀ GOOGLE SHEET...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span style={{ fontStyle: 'italic', fontWeight: 'normal', fontSize: '16px' }}>OK</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-red-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-4 pb-3 border-b border-red-100">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Thông Tin Chưa Đầy Đủ Hoặc Chưa Hợp Lệ!
                </h3>
                <p className="text-xs text-red-600">
                  Vui lòng hoàn thiện các mục sau trước khi bấm OK:
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {errors.map((err, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50/70 border border-red-200/80 text-xs text-red-800"
                >
                  <span className="font-bold text-red-600 min-w-[20px]">{idx + 1}.</span>
                  <span>{err}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowErrorModal(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Đã hiểu, quay lại chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {saveSuccessContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-emerald-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-emerald-600 mb-4 pb-3 border-b border-emerald-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Lưu Hợp Đồng Thành Công!
                </h3>
                <p className="text-xs text-emerald-600 font-medium">
                  Số HĐ: {saveSuccessContract.contractNumber} • {saveSuccessContract.customerName}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Mã KH:</span>
                <span className="font-mono font-bold">{saveSuccessContract.customerCode}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Dịch vụ:</span>
                <span className="font-semibold">{saveSuccessContract.service}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Nhân sự ký:</span>
                <span>BGĐ: {saveSuccessContract.boardMember} | KTV: {saveSuccessContract.auditor}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Nhóm thực hiện:</span>
                <span className="font-bold text-teal-700">
                  {saveSuccessContract.teamMembers.length} thành viên (Tổng 100%)
                </span>
              </div>

              {/* Sheet sync feedback */}
              <div className="pt-2 border-t border-slate-200 mt-2">
                {sheetSyncResult?.success ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Đã tự động gửi dữ liệu về file Google Sheet của bạn!</span>
                  </div>
                ) : sheetConfigured ? (
                  <div className="text-xs text-amber-700">
                    {sheetSyncResult?.message ||
                      'Hợp đồng đã lưu trên máy. Kiểm tra đường link Google Sheet trong phần Cài Đặt.'}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                    <span>Hợp đồng đã lưu trên hệ thống. Hãy dán link Google Sheet để đồng bộ về file riêng của bạn.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSaveSuccessContract(null);
                  handleResetForm();
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Nhập Hợp Đồng Tiếp Theo
              </button>
              <button
                type="button"
                onClick={() => setSaveSuccessContract(null)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Xem Hợp Đồng Vừa Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
