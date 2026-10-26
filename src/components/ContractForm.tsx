import React, { useState } from 'react';
import {
  AuditContract,
  SERVICE_OPTIONS,
  REPORT_TYPE_OPTIONS,
  RELEASE_STATUS_OPTIONS,
  BOARD_MEMBERS,
  AUDITOR_MEMBERS,
  AUDIT_OPINIONS,
  TEAM_MEMBERS,
  TeamMemberExecution,
  ServiceType,
  ReportType,
  ReleaseStatus,
  AuditOpinionType,
} from '../types/audit';
import {
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Building2,
  Calendar,
  UserCheck,
  Percent,
  Sparkles,
  Flame,
  Layers,
  Ghost,
  Send,
  Info,
} from 'lucide-react';
import { SectionMultiSelect } from './SectionMultiSelect';

interface ContractFormProps {
  onSaveContract: (contract: AuditContract) => Promise<{ success: boolean; sheetError?: string }>;
  isSyncing: boolean;
}

export const ContractForm: React.FC<ContractFormProps> = ({
  onSaveContract,
  isSyncing,
}) => {
  // Form State
  const [customerCode, setCustomerCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [contractDate, setContractDate] = useState('');
  const [service, setService] = useState<ServiceType>('Kiểm toán');
  const [serviceOther, setServiceOther] = useState('');

  // Loại báo cáo (Riêng, Hợp nhất, Khác)
  const [reportType, setReportType] = useState<ReportType>('Riêng');
  const [reportTypeOther, setReportTypeOther] = useState('');

  // Phát hành (Đã phát hành, Chưa phát hành)
  const [releaseStatus, setReleaseStatus] = useState<ReleaseStatus>('Chưa phát hành');

  // Kỳ báo cáo theo mẫu dd/mm/yyyy (ví dụ: 31/12/2025)
  const currentYear = new Date().getFullYear();
  const [reportPeriod, setReportPeriod] = useState(`31/12/${currentYear - 1}`);
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
      section: 'Báo cáo, IFRS',
      percentage: 40,
    },
    {
      id: 'row-2',
      position: 'Trợ lý 1',
      name: 'Thùy Trang',
      section: 'A, B',
      percentage: 30,
    },
    {
      id: 'row-3',
      position: 'Trợ lý 2',
      name: 'Nhật Huy',
      section: 'F tiền, F vay',
      percentage: 30,
    },
  ]);

  // Validation errors & modals
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [saveSuccessContract, setSaveSuccessContract] = useState<AuditContract | null>(null);

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
      name: TEAM_MEMBERS[Math.min(nextIdx, Math.max(0, TEAM_MEMBERS.length - 2))],
      section: nextIdx % 2 === 0 ? 'F tiền, Q' : 'A',
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
    setReportType('Riêng');
    setReportTypeOther('');
    setReleaseStatus('Chưa phát hành');
    setReportPeriod(`31/12/${currentYear - 1}`);
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
        section: 'Báo cáo, IFRS',
        percentage: 50,
      },
      {
        id: 'row-2',
        position: 'Trợ lý 1',
        name: 'Thùy Trang',
        section: 'A, B',
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

    // 6. Loại báo cáo
    if (!reportType) {
      errs.push('Loại báo cáo: Chưa chọn loại báo cáo (Riêng, Hợp nhất, Tổng hợp, Khác).');
    } else if (reportType === 'Khác' && !reportTypeOther.trim()) {
      errs.push('Loại báo cáo: Đang chọn "Khác" nhưng chưa điền chi tiết loại báo cáo.');
    }

    // 7. Phát hành
    if (!releaseStatus) {
      errs.push('Phát hành: Chưa chọn tình trạng phát hành (Đã phát hành / Chưa phát hành).');
    }

    // 8. Kỳ báo cáo: dd/mm/yyyy
    if (!reportPeriod.trim()) {
      errs.push('Kỳ báo cáo: Chưa nhập (theo mẫu dd/mm/yyyy, ví dụ: 31/12/2025).');
    } else if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(reportPeriod.trim())) {
      errs.push('Kỳ báo cáo: Sai định dạng! Phải theo mẫu đầy đủ dd/mm/yyyy (ví dụ: 31/12/2025 hoặc 30/06/2026).');
    }

    // 9. Số báo cáo
    if (!reportNumber.trim()) {
      errs.push('Số báo cáo: Chưa nhập đầy đủ. Lưu ý lấy thông tin theo ý kiến kiểm toán (Ví dụ: 251/2026/BCKT-HCM.00070).');
    }

    // 10. Ngày báo cáo: dd/mm/yyyy
    if (!reportDate.trim()) {
      errs.push('Ngày báo cáo: Chưa nhập (theo mẫu dd/mm/yyyy).');
    } else if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(reportDate.trim())) {
      errs.push('Ngày báo cáo: Sai định dạng ngày báo cáo (phải là dd/mm/yyyy, ví dụ: 25/03/2026).');
    }

    // 11. Thành viên Ban Giám đốc
    if (!boardMember) {
      errs.push('Thành viên Ban Giám đốc: Chưa tích chọn.');
    } else if (boardMember === 'Khác' && !boardMemberOther.trim()) {
      errs.push('Thành viên Ban Giám đốc: Đang chọn "Khác", vui lòng điền họ tên.');
    }

    // 12. Kiểm toán viên
    if (!auditor) {
      errs.push('Kiểm toán viên: Chưa tích chọn.');
    } else if (auditor === 'Khác' && !auditorOther.trim()) {
      errs.push('Kiểm toán viên: Đang chọn "Khác", vui lòng điền họ tên.');
    }

    // 13. Ý kiến kiểm toán
    if (!auditOpinion) {
      errs.push('Ý kiến kiểm toán: Chưa chọn ý kiến kiểm toán.');
    } else if (
      (auditOpinion === 'Ngoại trừ' || auditOpinion === 'Từ chối' || auditOpinion === 'Trái ngược') &&
      !opinionReason.trim()
    ) {
      errs.push(`Ý kiến kiểm toán: Khi tích chọn "${auditOpinion}", bắt buộc phải điền lý do vào ô thông tin bổ sung.`);
    }

    // 14. Thông tin bổ sung ý kiến kiểm toán
    if ((emphasisOfMatter || otherMatters) && !opinionReason.trim()) {
      errs.push('Thông tin bổ sung ý kiến: Đã tích chọn Vấn đề khác / Nhấn mạnh thì phải nhập lý do bổ sung.');
    }

    // 15. THÔNG TIN THỰC HIỆN HỢP ĐỒNG (Bảng nhóm)
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
        } else if (member.name === 'Khác' && (!member.customName || !member.customName.trim())) {
          errs.push(`Dòng ${rowNo}: Đang chọn nhân sự "Khác", vui lòng điền họ tên nhân sự.`);
        }
        if (!member.section || !member.section.trim()) {
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
      reportType,
      reportTypeOther: reportType === 'Khác' ? reportTypeOther.trim() : undefined,
      releaseStatus,
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
      teamMembers: teamMembers.map((m) => {
        const resolvedName =
          m.name === 'Khác' && m.customName?.trim() ? m.customName.trim() : m.name;
        return {
          ...m,
          name: resolvedName,
          customName: m.name === 'Khác' ? m.customName?.trim() : undefined,
          percentage: Number(m.percentage),
        };
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await onSaveContract(newContract);
    setSaveSuccessContract(newContract);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Banner Halloween on White Background: Crisp White with Vibrant Pumpkin Orange, Amethyst Purple, and Spooky Emoticons */}
      <div className="mb-6 relative rounded-3xl overflow-hidden p-6 sm:p-7 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-purple-500/10 border-2 border-orange-300 shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-orange-500 text-white shadow-xs">
                <Flame className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                🎃 Halloween Audit Season 🦇
              </span>
              <span className="text-xs text-purple-700 font-bold bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                👻 Mùa Kiểm Toán 2026 🍬
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span>Biểu Mẫu Nhập Hợp Đồng & Phân Công Nhóm</span>
              <span className="text-xl">🕯️</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-2xl bg-white border border-orange-300 text-orange-700 shadow-sm">
            <Ghost className="w-4 h-4 text-orange-500" />
            <span>Tự Động Lưu Sheet 🕸️</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleOkSubmit} className="space-y-7">
        {/* SECTION 1: THÔNG TIN KHÁCH HÀNG & HỢP ĐỒNG */}
        <div className="bg-white rounded-3xl border border-orange-200 shadow-md p-6 sm:p-7 transition-all hover:border-orange-400">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-orange-100">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-base shadow-sm shadow-orange-500/30">
              1
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-wide flex items-center gap-1.5">
                <span>Thông Tin Khách Hàng & Hợp Đồng</span>
                <span>🎃</span>
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
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1">
                  Mã khách hàng <span className="text-orange-600">*</span>
                  <span className="text-xs font-normal text-slate-500">(tối đa 5 chữ số)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold ${
                      customerCode.length === 5 ? 'text-orange-600' : 'text-slate-500'
                    }`}
                  >
                    {customerCode.length}/5 số
                  </span>
                  <button
                    type="button"
                    onClick={padCustomerCode}
                    className="text-[11px] text-orange-600 hover:text-orange-700 underline font-semibold cursor-pointer"
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
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-mono tracking-wider transition-all"
              />
            </div>

            {/* Tên khách hàng */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Tên khách hàng <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="VD: Công ty Cổ phần Thép Miền Đông"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Số hợp đồng */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1">
                  Số hợp đồng <span className="text-orange-600">*</span>
                </label>
                <span className="text-xs text-orange-700 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-md font-mono font-bold">
                  Mẫu: 000/0000
                </span>
              </div>
              <input
                type="text"
                value={contractNumber}
                onChange={handleContractNumberChange}
                placeholder="VD: 086/2026 (3 số đầu / 4 số năm)"
                maxLength={8}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-mono tracking-wider transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                3 số đầu là số hợp đồng, 4 số sau dấu &quot;/&quot; là năm phát hành.
              </p>
            </div>

            {/* Ngày hợp đồng */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1">
                  Ngày hợp đồng <span className="text-orange-600">*</span>
                  <span className="text-xs font-normal text-slate-500">(dd/mm/yyyy)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setToday(setContractDate)}
                  className="text-[11px] text-orange-600 hover:text-orange-700 font-bold cursor-pointer"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-mono transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: DỊCH VỤ, LOẠI BÁO CÁO, PHÁT HÀNH & KỲ BÁO CÁO */}
        <div className="bg-white rounded-3xl border border-purple-200 shadow-md p-6 sm:p-7 transition-all hover:border-purple-400">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-purple-100">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-black text-base shadow-sm shadow-purple-600/30">
              2
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-wide flex items-center gap-1.5">
                <span>Dịch Vụ, Loại Báo Cáo, Phát Hành & Kỳ Báo Cáo</span>
                <span>🦇</span>
              </h3>
              <p className="text-xs text-slate-500">
                Lựa chọn dịch vụ, loại báo cáo, tình trạng phát hành và kỳ kế toán theo mẫu dd/mm/yyyy
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Hàng 1: Dịch vụ & Loại báo cáo (Cân đối 2 cột đều nhau) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Dịch vụ */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Dịch vụ <span className="text-orange-600">*</span>
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value as ServiceType)}
                    className="w-full h-11 px-4 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium transition-all shadow-2xs"
                  >
                    {SERVICE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  {service === 'Khác' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={serviceOther}
                        onChange={(e) => setServiceOther(e.target.value)}
                        placeholder="Nhập tên dịch vụ khác..."
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-orange-400 text-slate-900 placeholder-slate-400 text-sm focus:ring-2 focus:ring-orange-500 font-medium shadow-2xs"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Loại báo cáo */}
              <div className="bg-purple-50/40 p-4 rounded-2xl border border-purple-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-purple-600" />
                      Loại báo cáo <span className="text-orange-600">*</span>
                    </label>
                    <span className="text-[11px] text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full font-bold border border-purple-200">
                      Riêng / Hợp nhất / Tổng hợp
                    </span>
                  </div>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                    className="w-full h-11 px-4 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all font-semibold shadow-2xs"
                  >
                    {REPORT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  {reportType === 'Khác' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={reportTypeOther}
                        onChange={(e) => setReportTypeOther(e.target.value)}
                        placeholder="Nhập loại báo cáo khác..."
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-purple-400 text-slate-900 placeholder-slate-400 text-sm focus:ring-2 focus:ring-purple-500 font-medium shadow-2xs"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hàng 2: Phát hành & Kỳ báo cáo (Cân đối 2 cột đều nhau) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
              {/* 3. Phát hành */}
              <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-200 flex flex-col justify-between">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Tình trạng phát hành <span className="text-orange-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setReleaseStatus('Chưa phát hành')}
                      className={`h-11 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                        releaseStatus === 'Chưa phát hành'
                          ? 'bg-slate-800 border-slate-900 text-white shadow-sm ring-2 ring-slate-400'
                          : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-sm">⏳</span>
                      <span>Chưa phát hành</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReleaseStatus('Đã phát hành')}
                      className={`h-11 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                        releaseStatus === 'Đã phát hành'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-600 shadow-md shadow-orange-500/30 ring-2 ring-orange-300'
                          : 'bg-white border-slate-300 text-slate-600 hover:bg-orange-50'
                      }`}
                    >
                      <span className="text-sm">🎃</span>
                      <span>Đã phát hành</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Kỳ báo cáo */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1">
                      Kỳ báo cáo <span className="text-orange-600">*</span>
                      <span className="text-xs font-normal text-slate-500">(dd/mm/yyyy)</span>
                    </label>
                    <div className="flex items-center gap-1">
                      {[`31/12/${currentYear - 1}`].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setReportPeriod(preset)}
                          className="text-[10px] px-2 py-0.5 bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-300 rounded-md cursor-pointer font-bold"
                          title="Chọn nhanh kỳ báo cáo kết thúc năm"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={reportPeriod}
                      onChange={(e) => handleDateInput(e.target.value, setReportPeriod)}
                      placeholder={`VD: 31/12/${currentYear - 1}`}
                      maxLength={10}
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-mono tracking-wider transition-all shadow-2xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lưu ý khi tích Đã phát hành */}
            {releaseStatus === 'Đã phát hành' && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
                <span className="text-2xl flex-shrink-0 mt-0.5">⚠️</span>
                <div className="flex-1 text-xs sm:text-sm">
                  <strong className="font-extrabold text-amber-950 block text-sm mb-0.5">
                    Lưu ý quan trọng: Nhớ kiểm tra lại ngày báo cáo! 🎃📝
                  </strong>
                  <span className="text-amber-800 text-xs">
                    Hợp đồng đang đánh dấu là <b>&quot;Đã phát hành&quot;</b>. Vui lòng rà soát chính xác <b>Số báo cáo</b> và <b>Ngày báo cáo ({reportDate || 'chưa điền'})</b> trước khi lưu để dữ liệu đồng bộ lên Google Sheet chính xác 100%.
                  </span>
                </div>
              </div>
            )}

            {/* Hàng 3: Số báo cáo & Ngày báo cáo */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-3">
              {/* Số báo cáo (Chiếm 8 cột) */}
              <div className="md:col-span-8 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-1">
                    Số báo cáo <span className="text-orange-600">*</span>
                    <span className="text-xs font-normal text-slate-500">(nhập đầy đủ theo ý kiến kiểm toán)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const num = contractNumber ? contractNumber.split('/')[0] : '251';
                      const yr = contractNumber && contractNumber.includes('/') ? contractNumber.split('/')[1] : currentYear;
                      const code = customerCode ? customerCode.padStart(5, '0') : '00070';
                      setReportNumber(`${num}/${yr}/BCKT-HCM.${code}`);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 font-extrabold transition-colors cursor-pointer"
                    title="Gợi ý số báo cáo chuẩn theo ý kiến kiểm toán"
                  >
                    ⚡ Gợi ý: {contractNumber ? contractNumber.split('/')[0] : '251'}/{contractNumber && contractNumber.includes('/') ? contractNumber.split('/')[1] : currentYear}/BCKT-HCM.{customerCode ? customerCode.padStart(5, '0') : '00070'}
                  </button>
                </div>
                <input
                  type="text"
                  value={reportNumber}
                  onChange={(e) => setReportNumber(e.target.value)}
                  placeholder="Ví dụ: 251/2026/BCKT-HCM.00070"
                  className="w-full h-11 px-4 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-mono tracking-wide transition-all font-bold shadow-2xs"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span>
                    Lưu ý: Lấy thông tin theo ý kiến kiểm toán. Ví dụ: <strong className="text-slate-800 font-mono">251/2026/BCKT-HCM.00070</strong>
                  </span>
                </p>
              </div>

              {/* Ngày báo cáo (Chiếm 4 cột) */}
              <div className="md:col-span-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1">
                      Ngày báo cáo <span className="text-orange-600">*</span>
                      <span className="text-xs font-normal text-slate-500">(dd/mm/yyyy)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setToday(setReportDate)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-200 font-bold cursor-pointer"
                    >
                      Hôm nay
                    </button>
                  </div>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={reportDate}
                      onChange={(e) => handleDateInput(e.target.value, setReportDate)}
                      placeholder="VD: 25/03/2026"
                      maxLength={10}
                      className={`w-full h-11 pl-10 pr-4 rounded-xl border text-slate-900 placeholder-slate-400 text-sm font-mono transition-all shadow-2xs font-semibold ${
                        releaseStatus === 'Đã phát hành'
                          ? 'bg-amber-50/70 border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-500'
                          : 'bg-white border-slate-300 focus:ring-2 focus:ring-purple-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: NHÂN SỰ KÝ DUYỆT & Ý KIẾN KIỂM TOÁN */}
        <div className="bg-white rounded-3xl border border-orange-200 shadow-md p-6 sm:p-7 transition-all hover:border-orange-400">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-orange-100">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-base shadow-sm shadow-orange-500/30">
              3
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-wide flex items-center gap-1.5">
                <span>Thành Viên BGĐ, Kiểm Toán Viên & Ý Kiến Kiểm Toán</span>
                <span>🧙</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tích chọn người ký báo cáo và nội dung ý kiến kiểm toán
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thành viên Ban Giám đốc */}
            <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-200">
              <label className="block text-sm font-black text-orange-900 mb-3 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-orange-600" />
                Thành viên Ban Giám đốc <span className="text-orange-600">*</span>
              </label>
              <div className="space-y-2">
                {BOARD_MEMBERS.map((name) => (
                  <label
                    key={name}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                      boardMember === name
                        ? 'bg-white border-orange-500 text-orange-950 font-bold shadow-xs'
                        : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="boardMember"
                      value={name}
                      checked={boardMember === name}
                      onChange={() => setBoardMember(name)}
                      className="text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer accent-orange-500"
                    />
                    <span className="text-sm">{name}</span>
                  </label>
                ))}
              </div>

              {boardMember === 'Khác' && (
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Điền tên Thành viên Ban Giám đốc khác:
                  </label>
                  <input
                    type="text"
                    value={boardMemberOther}
                    onChange={(e) => setBoardMemberOther(e.target.value)}
                    placeholder="Nhập họ và tên Thành viên BGĐ..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-orange-400 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
              )}
            </div>

            {/* Kiểm toán viên */}
            <div className="bg-purple-50/40 p-4 rounded-2xl border border-purple-200">
              <label className="block text-sm font-black text-purple-900 mb-3 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-purple-600" />
                Kiểm toán viên <span className="text-orange-600">*</span>
              </label>
              <div className="space-y-2">
                {AUDITOR_MEMBERS.map((name) => (
                  <label
                    key={name}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                      auditor === name
                        ? 'bg-white border-purple-500 text-purple-950 font-bold shadow-xs'
                        : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="auditor"
                      value={name}
                      checked={auditor === name}
                      onChange={() => setAuditor(name)}
                      className="text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer accent-purple-600"
                    />
                    <span className="text-sm">{name}</span>
                  </label>
                ))}
              </div>

              {auditor === 'Khác' && (
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Điền tên Kiểm toán viên khác:
                  </label>
                  <input
                    type="text"
                    value={auditorOther}
                    onChange={(e) => setAuditorOther(e.target.value)}
                    placeholder="Nhập họ và tên Kiểm toán viên..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-purple-400 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Ý kiến kiểm toán */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <label className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <span>Ý kiến kiểm toán</span> <span className="text-orange-600">*</span>
              </label>
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                ⚠️ Lưu ý: Tích chọn Ngoại trừ, Từ chối, Trái ngược phải điền lý do
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AUDIT_OPINIONS.map((opinion) => (
                <label
                  key={opinion}
                  className={`flex items-center gap-2.5 p-3.5 rounded-2xl cursor-pointer border text-center transition-all ${
                    auditOpinion === opinion
                      ? 'bg-orange-50 border-orange-500 text-orange-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="auditOpinion"
                    value={opinion}
                    checked={auditOpinion === opinion}
                    onChange={() => setAuditOpinion(opinion)}
                    className="text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer accent-orange-500"
                  />
                  <span className="text-xs sm:text-sm text-left">{opinion}</span>
                </label>
              ))}
            </div>

            {/* Cảnh báo khi chọn Ngoại trừ, Từ chối, Trái ngược */}
            {(auditOpinion === 'Ngoại trừ' || auditOpinion === 'Từ chối' || auditOpinion === 'Trái ngược') && (
              <div className="mt-3 p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs flex items-center gap-2.5 animate-in fade-in duration-200 shadow-xs">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <span className="font-medium">
                  <strong className="text-amber-950 font-black">Lưu ý quan trọng:</strong> Bạn đang chọn ý kiến <strong>&quot;{auditOpinion}&quot;</strong>. Bắt buộc phải điền chi tiết lý do vào ô thông tin bổ sung bên dưới!
                </span>
              </div>
            )}
          </div>

          {/* Thông tin bổ sung ý kiến kiểm toán */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <label className="block text-sm font-bold text-slate-800 mb-2.5">
              Thông tin bổ sung ý kiến kiểm toán:
            </label>
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <input
                  type="checkbox"
                  checked={otherMatters}
                  onChange={(e) => setOtherMatters(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer accent-orange-500"
                />
                <span className="text-sm font-semibold text-slate-800">Vấn đề khác</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <input
                  type="checkbox"
                  checked={emphasisOfMatter}
                  onChange={(e) => setEmphasisOfMatter(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer accent-orange-500"
                />
                <span className="text-sm font-semibold text-slate-800">Nhấn mạnh</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span>
                  Lý do bổ sung ý kiến kiểm toán{' '}
                  {(auditOpinion === 'Ngoại trừ' || auditOpinion === 'Từ chối' || auditOpinion === 'Trái ngược' || emphasisOfMatter || otherMatters) && (
                    <span className="text-orange-600 font-extrabold">* (Bắt buộc điền)</span>
                  )}:
                </span>
                {(auditOpinion === 'Ngoại trừ' || auditOpinion === 'Từ chối' || auditOpinion === 'Trái ngược') && (
                  <span className="text-[11px] text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                    ⚠️ Tích chọn &quot;{auditOpinion}&quot; phải điền lý do
                  </span>
                )}
              </label>
              <textarea
                rows={3}
                value={opinionReason}
                onChange={(e) => setOpinionReason(e.target.value)}
                placeholder="Nhập lý do Ngoại trừ, Từ chối, Trái ngược. Nội dung vấn đề khác hoặc vấn đề cần nhấn mạnh trong báo cáo."
                className={`w-full px-4 py-2.5 rounded-xl border text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500 text-sm transition-all shadow-2xs ${
                  (auditOpinion === 'Ngoại trừ' || auditOpinion === 'Từ chối' || auditOpinion === 'Trái ngược') && !opinionReason.trim()
                    ? 'bg-amber-50/60 border-amber-400'
                    : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: THÔNG TIN THỰC HIỆN HỢP ĐỒNG (BẢNG NHÂN SỰ & TỶ LỆ) */}
        <div className="bg-white rounded-3xl border border-purple-200 shadow-md p-6 sm:p-7 transition-all hover:border-purple-400">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-purple-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center font-black text-base shadow-sm shadow-purple-500/30">
                4
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Thông Tin Thực Hiện Hợp Đồng</span>
                  <span>🔮</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Phân công Vị trí, Tên, Phần hành (chọn nhiều: Q, F tiền, F vay...) và Tỷ lệ thực hiện (%)
                </p>
              </div>
            </div>

            {/* Total Percentage Indicator */}
            <div className="flex items-center gap-2">
              {totalPercentage === 100 ? (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-black text-sm shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tổng tỷ lệ: 100% (Đạt chuẩn)</span>
                </div>
              ) : totalPercentage < 100 ? (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl font-black text-sm shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Tổng: {totalPercentage}% (Thiếu {100 - totalPercentage}%)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 border border-red-300 text-red-800 rounded-xl font-black text-sm shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Tổng: {totalPercentage}% (Vượt {totalPercentage - 100}%)</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleAutoBalance}
                className="px-3.5 py-2 text-xs bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl font-bold transition-all cursor-pointer"
                title="Tự động chia đều cho các thành viên để tổng đủ 100%"
              >
                Cân đối 100%
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-xs uppercase font-black tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-3 w-12 text-center">STT</th>
                  <th className="py-3.5 px-3 min-w-[140px]">Vị trí</th>
                  <th className="py-3.5 px-3 min-w-[160px]">Tên</th>
                  <th className="py-3.5 px-3 min-w-[240px]">Phần hành (chọn nhiều)</th>
                  <th className="py-3.5 px-3 min-w-[120px] text-right">Tỷ lệ thực hiện (%)</th>
                  <th className="py-3.5 px-3 w-12 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {teamMembers.map((member, index) => (
                  <tr key={member.id} className="hover:bg-orange-50/20 transition-colors">
                    {/* STT */}
                    <td className="py-3 px-3 text-center text-slate-500 font-bold font-mono">
                      {index + 1}
                    </td>

                    {/* Vị trí */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={member.position}
                        onChange={(e) => handleUpdateTeamRow(member.id, 'position', e.target.value)}
                        placeholder="VD: Nhóm trưởng, Trợ lý 1..."
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-purple-500 text-xs font-semibold"
                      />
                    </td>

                    {/* Tên */}
                    <td className="py-3 px-3">
                      <div className="space-y-1.5 min-w-[150px]">
                        <select
                          value={member.name}
                          onChange={(e) => handleUpdateTeamRow(member.id, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-purple-500 text-xs font-bold shadow-2xs"
                        >
                          {TEAM_MEMBERS.map((memberName) => (
                            <option key={memberName} value={memberName}>
                              {memberName === 'Khác' ? '✍️ Khác (Tự điền tên...)' : memberName}
                            </option>
                          ))}
                        </select>

                        {member.name === 'Khác' && (
                          <input
                            type="text"
                            value={member.customName || ''}
                            onChange={(e) =>
                              handleUpdateTeamRow(member.id, 'customName', e.target.value)
                            }
                            placeholder="Nhập họ và tên..."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-400 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500 text-xs font-semibold shadow-2xs animate-in fade-in duration-150"
                            autoFocus
                          />
                        )}
                      </div>
                    </td>

                    {/* Phần hành */}
                    <td className="py-3 px-3">
                      <SectionMultiSelect
                        value={member.section}
                        onChange={(val) => handleUpdateTeamRow(member.id, 'section', val)}
                        placeholder="Chọn phần hành (Q, F tiền, F vay...)"
                      />
                    </td>

                    {/* Tỷ lệ thực hiện */}
                    <td className="py-3 px-3 text-right">
                      <div className="relative inline-block w-28">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={member.percentage || ''}
                          onChange={(e) =>
                            handleUpdateTeamRow(member.id, 'percentage', Number(e.target.value))
                          }
                          className="w-full px-3 py-1.5 pr-7 text-right rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-orange-500 text-xs"
                        />
                        <span className="absolute right-2.5 top-2 text-slate-400 font-bold text-xs pointer-events-none">
                          %
                        </span>
                      </div>
                    </td>

                    {/* Xóa dòng */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveTeamRow(member.id)}
                        disabled={teamMembers.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Xóa thành viên này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-300 font-black text-xs text-slate-900">
                  <td colSpan={4} className="py-3 px-3 text-right uppercase tracking-wider">
                    Tổng Tỷ Lệ Thực Hiện:
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`text-sm font-black font-mono ${
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

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleAddTeamRow}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Thành Viên Nhóm (Trợ lý...)</span>
            </button>

            <span className="text-xs text-slate-500 italic">
              * Lưu ý: Tổng phần trăm tất cả các dòng bắt buộc phải bằng 100%
            </span>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="bg-white rounded-3xl border border-orange-200 shadow-lg p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">
              Kiểm tra toàn bộ thông tin hợp đồng & phân công nhóm kiểm toán
            </div>
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2 mt-0.5">
              <span>Trạng thái:</span>
              {totalPercentage === 100 ? (
                <span className="text-emerald-600 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Đầy đủ tỷ lệ 100% 🎃
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-4 h-4" /> Tỷ lệ chưa bằng 100% (Hiện tại {totalPercentage}%)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
            >
              Làm mới biểu mẫu
            </button>

            {/* NÚT OK CHỮ OK THEO YÊU CẦU: font-style: italic; font-weight: normal; font-size: 16px */}
            <button
              type="submit"
              disabled={isSyncing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:from-amber-600 hover:via-orange-600 hover:to-purple-700 text-white font-extrabold text-base tracking-wider shadow-lg shadow-orange-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span style={{ fontStyle: 'italic', fontWeight: 'normal', fontSize: '16px' }}>Đang lưu...</span>
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-red-300 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-4 pb-3 border-b border-red-100">
              <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Thông Tin Chưa Đầy Đủ Hoặc Chưa Hợp Lệ!
                </h3>
                <p className="text-xs text-red-600">
                  Vui lòng hoàn thiện các mục sau trước khi bấm OK:
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              {errors.map((err, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800"
                >
                  <span className="font-bold text-red-600 min-w-[20px]">{idx + 1}.</span>
                  <span>{err}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowErrorModal(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-sm"
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-orange-300 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-emerald-600 mb-4 pb-3 border-b border-orange-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                  <span>Lưu Hợp Đồng Thành Công!</span>
                  <span>🎃</span>
                </h3>
                <p className="text-xs text-orange-700 font-bold">
                  Số HĐ: {saveSuccessContract.contractNumber} • {saveSuccessContract.customerName}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-sm text-slate-700 bg-orange-50/40 p-4 rounded-2xl border border-orange-200">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Mã KH:</span>
                <span className="font-mono font-bold text-slate-900">{saveSuccessContract.customerCode}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Dịch vụ:</span>
                <span className="font-semibold text-orange-800">{saveSuccessContract.service}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Loại báo cáo:</span>
                <span className="font-semibold text-purple-800">{saveSuccessContract.reportType}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Tình trạng phát hành:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    saveSuccessContract.releaseStatus === 'Đã phát hành'
                      ? 'bg-orange-100 text-orange-800 border border-orange-300'
                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  {saveSuccessContract.releaseStatus}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Kỳ báo cáo:</span>
                <span className="font-mono text-slate-900">{saveSuccessContract.reportPeriod}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Ngày báo cáo:</span>
                <span className="font-mono text-slate-900">{saveSuccessContract.reportDate}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Nhân sự ký:</span>
                <span>BGĐ: {saveSuccessContract.boardMember} | KTV: {saveSuccessContract.auditor}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Nhóm thực hiện:</span>
                <span className="font-bold text-orange-700">
                  {saveSuccessContract.teamMembers.length} thành viên (Tổng 100%)
                </span>
              </div>

              {/* Sheet sync feedback */}
              <div className="pt-2.5 border-t border-orange-200 mt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã tự động gửi dữ liệu về file Google Sheet của bạn! 🎃</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSaveSuccessContract(null);
                  handleResetForm();
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Nhập Hợp Đồng Tiếp Theo
              </button>
              <button
                type="button"
                onClick={() => setSaveSuccessContract(null)}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
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
