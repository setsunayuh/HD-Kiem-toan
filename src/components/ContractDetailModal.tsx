import React from 'react';
import { AuditContract, GoogleSheetConfig } from '../types/audit';
import {
  X,
  Printer,
  FileCheck2,
  FileSpreadsheet,
  Building2,
  Calendar,
  Users,
  ShieldAlert,
  Percent,
  Layers,
} from 'lucide-react';

interface ContractDetailModalProps {
  contract: AuditContract | null;
  sheetConfig: GoogleSheetConfig | null;
  onClose: () => void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
  contract,
  sheetConfig,
  onClose,
}) => {
  if (!contract) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-orange-500/30 relative my-8 print:m-0 print:p-6 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Controls (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-white">
                Phiếu Ghi Nhận Hợp Đồng Kiểm Toán
              </h3>
              <p className="text-xs text-orange-300 font-mono">
                Số HĐ: {contract.contractNumber} • Kỳ BC: {contract.reportPeriod}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-orange-400" />
              <span>In phiếu</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="space-y-6 text-slate-200 print:text-black">
          {/* Header on Paper */}
          <div className="text-center pb-4 border-b-2 border-orange-500/50 print:border-black">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white print:text-black">
              Phiếu Quản Lý Hợp Đồng Kiểm Toán
            </h2>
            <p className="text-xs text-orange-300 print:text-slate-600 mt-1 italic">
              (Hệ thống kiểm soát chất lượng & phân công nhóm kiểm toán)
            </p>
          </div>

          {/* Section 1: Customer & Contract */}
          <div>
            <h4 className="text-xs font-black text-orange-400 print:text-black uppercase tracking-wider mb-2 bg-orange-500/10 print:bg-slate-100 p-2 px-3 rounded-xl border border-orange-500/20 print:border-slate-300">
              I. Thông Tin Khách Hàng & Hợp Đồng
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm p-2">
              <div>
                <span className="text-xs text-slate-400 print:text-slate-600 block">Mã khách hàng:</span>
                <span className="font-mono font-bold text-white print:text-black">{contract.customerCode}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-slate-400 print:text-slate-600 block">Tên khách hàng:</span>
                <span className="font-bold text-white print:text-black">{contract.customerName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 print:text-slate-600 block">Số hợp đồng:</span>
                <span className="font-mono font-bold text-orange-400 print:text-black">{contract.contractNumber}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 print:text-slate-600 block">Ngày hợp đồng:</span>
                <span className="font-medium text-slate-200 print:text-black">{contract.contractDate}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 print:text-slate-600 block">Dịch vụ:</span>
                <span className="font-semibold text-purple-300 print:text-black">
                  {contract.service === 'Khác' ? `Khác (${contract.serviceOther})` : contract.service}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Audit Report & Opinions */}
          <div>
            <h4 className="text-xs font-black text-purple-400 print:text-black uppercase tracking-wider mb-2 bg-purple-500/10 print:bg-slate-100 p-2 px-3 rounded-xl border border-purple-500/20 print:border-slate-300">
              II. Báo Cáo Kiểm Toán & Nhân Sự Ký Duyệt
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm p-2">
              <div>
                <span className="text-xs text-slate-400 print:text-slate-600 block">Loại báo cáo:</span>
                <span className="font-bold text-purple-300 print:text-black">
                  {contract.reportType === 'Khác'
                    ? `Khác: ${contract.reportTypeOther}`
                    : contract.reportType || 'Riêng'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 print:text-slate-600 block">Kỳ báo cáo (dd/mm/yyyy):</span>
                <span className="font-mono font-medium text-slate-200 print:text-black">{contract.reportPeriod}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 print:text-slate-600 block">Số báo cáo:</span>
                <span className="font-semibold text-slate-200 print:text-black">{contract.reportNumber}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 print:text-slate-600 block">Ngày báo cáo:</span>
                <span className="font-medium text-slate-200 print:text-black">{contract.reportDate}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 print:text-slate-600 block">Ý kiến kiểm toán:</span>
                <span className="font-bold text-emerald-400 print:text-black">{contract.auditOpinion}</span>
              </div>

              <div className="col-span-2">
                <span className="text-xs text-slate-400 print:text-slate-600 block">Thành viên Ban Giám đốc:</span>
                <span className="font-bold text-white print:text-black">
                  {contract.boardMember === 'Khác'
                    ? `Khác: ${contract.boardMemberOther}`
                    : contract.boardMember}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 print:text-slate-600 block">Kiểm toán viên:</span>
                <span className="font-bold text-white print:text-black">
                  {contract.auditor === 'Khác'
                    ? `Khác: ${contract.auditorOther}`
                    : contract.auditor}
                </span>
              </div>
            </div>

            {/* Additional opinion details */}
            {(contract.additionalOpinions.emphasisOfMatter ||
              contract.additionalOpinions.otherMatters ||
              contract.additionalOpinions.reason) && (
              <div className="mt-2 p-3 bg-slate-950/60 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-300 text-xs">
                <span className="font-bold text-slate-300 print:text-black">Thông tin bổ sung ý kiến: </span>
                {contract.additionalOpinions.emphasisOfMatter && (
                  <span className="inline-block px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded font-semibold mr-1.5">
                    Nhấn mạnh
                  </span>
                )}
                {contract.additionalOpinions.otherMatters && (
                  <span className="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded font-semibold mr-1.5">
                    Vấn đề khác
                  </span>
                )}
                <p className="mt-1.5 text-slate-300 print:text-slate-800 italic">
                  &ldquo;{contract.additionalOpinions.reason}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Team Breakdown Table */}
          <div>
            <div className="flex items-center justify-between mb-2 bg-orange-500/10 print:bg-slate-100 p-2 px-3 rounded-xl border border-orange-500/20 print:border-slate-300">
              <h4 className="text-xs font-black text-orange-400 print:text-black uppercase tracking-wider">
                III. Thông Tin Thực Hiện Hợp Đồng
              </h4>
              <span className="text-xs font-black text-emerald-400 print:text-black bg-emerald-950/80 print:bg-slate-200 px-2.5 py-0.5 rounded-full border border-emerald-500/40 print:border-slate-400">
                Tổng: 100%
              </span>
            </div>

            <table className="w-full text-left text-xs border border-slate-800 print:border-black">
              <thead>
                <tr className="bg-slate-950/90 print:bg-slate-100 text-slate-300 print:text-black font-bold border-b border-slate-800 print:border-black">
                  <th className="py-2.5 px-3 border-r border-slate-800 print:border-black w-12 text-center">STT</th>
                  <th className="py-2.5 px-3 border-r border-slate-800 print:border-black">Vị trí</th>
                  <th className="py-2.5 px-3 border-r border-slate-800 print:border-black">Tên nhân sự</th>
                  <th className="py-2.5 px-3 border-r border-slate-800 print:border-black">Phần hành</th>
                  <th className="py-2.5 px-3 text-right">Tỷ lệ thực hiện</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-black">
                {contract.teamMembers.map((tm, idx) => (
                  <tr key={tm.id || idx}>
                    <td className="py-2.5 px-3 border-r border-slate-800 print:border-black text-center text-slate-400 print:text-black">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-800 print:border-black font-medium text-slate-200 print:text-black">
                      {tm.position}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-800 print:border-black font-bold text-orange-300 print:text-black">
                      {tm.name}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-800 print:border-black text-purple-300 print:text-black">
                      {tm.section}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 print:text-black">
                      {tm.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-950 font-bold border-t-2 border-slate-700 print:border-black text-white print:text-black">
                  <td colSpan={4} className="py-2.5 px-3 text-right">
                    Tổng cộng:
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 print:text-black font-extrabold text-sm">
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures on Paper */}
          <div className="pt-8 grid grid-cols-2 text-center text-xs">
            <div>
              <p className="font-bold text-slate-300 print:text-black">NHÓM TRƯỞNG KIỂM TOÁN</p>
              <p className="italic text-slate-500 print:text-slate-600 mt-1">(Ký và ghi rõ họ tên)</p>
              <div className="h-16" />
              <p className="font-bold text-white print:text-black">
                {contract.teamMembers.find((m) => m.position.includes('Nhóm trưởng'))?.name ||
                  contract.auditor}
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-300 print:text-black">THÀNH VIÊN BAN GIÁM ĐỐC</p>
              <p className="italic text-slate-500 print:text-slate-600 mt-1">(Ký và ghi rõ họ tên)</p>
              <div className="h-16" />
              <p className="font-bold text-white print:text-black">
                {contract.boardMember === 'Khác' ? contract.boardMemberOther : contract.boardMember}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center print:hidden">
          <div className="text-xs text-orange-400 flex items-center gap-1.5 font-medium">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Tự động cập nhật về Google Sheet riêng của bạn</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
