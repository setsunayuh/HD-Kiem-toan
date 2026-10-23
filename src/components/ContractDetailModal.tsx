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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 print:m-0 print:p-0 print:border-none print:shadow-none">
        {/* Modal Controls (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Phiếu Ghi Nhận Hợp Đồng Kiểm Toán
              </h3>
              <p className="text-xs text-slate-500">Mã hợp đồng: {contract.contractNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In phiếu</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="space-y-6 text-slate-800">
          {/* Header on Paper */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900">
              Phiếu Quản Lý Hợp Đồng Kiểm Toán
            </h2>
            <p className="text-xs text-slate-500 mt-1 italic">
              (Hệ thống kiểm soát chất lượng & phân công nhóm kiểm toán)
            </p>
          </div>

          {/* Section 1: Customer & Contract */}
          <div>
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 bg-indigo-50/70 p-1.5 px-3 rounded-lg">
              I. Thông Tin Khách Hàng & Hợp Đồng
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm p-2">
              <div>
                <span className="text-xs text-slate-500 block">Mã khách hàng:</span>
                <span className="font-mono font-bold text-slate-900">{contract.customerCode}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-slate-500 block">Tên khách hàng:</span>
                <span className="font-bold text-slate-900">{contract.customerName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Số hợp đồng:</span>
                <span className="font-mono font-bold text-indigo-700">{contract.contractNumber}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Ngày hợp đồng:</span>
                <span className="font-medium text-slate-800">{contract.contractDate}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Dịch vụ:</span>
                <span className="font-semibold text-slate-900">
                  {contract.service === 'Khác' ? `Khác (${contract.serviceOther})` : contract.service}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Audit Report & Opinions */}
          <div>
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 bg-indigo-50/70 p-1.5 px-3 rounded-lg">
              II. Báo Cáo Kiểm Toán & Nhân Sự Ký Duyệt
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm p-2">
              <div>
                <span className="text-xs text-slate-500 block">Kỳ báo cáo:</span>
                <span className="font-medium text-slate-800">{contract.reportPeriod}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Số báo cáo:</span>
                <span className="font-semibold text-slate-800">{contract.reportNumber}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Ngày báo cáo:</span>
                <span className="font-medium text-slate-800">{contract.reportDate}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Ý kiến kiểm toán:</span>
                <span className="font-bold text-emerald-700">{contract.auditOpinion}</span>
              </div>

              <div className="col-span-2">
                <span className="text-xs text-slate-500 block">Thành viên Ban Giám đốc:</span>
                <span className="font-bold text-slate-900">
                  {contract.boardMember === 'Khác'
                    ? `Khác: ${contract.boardMemberOther}`
                    : contract.boardMember}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-xs text-slate-500 block">Kiểm toán viên:</span>
                <span className="font-bold text-slate-900">
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
              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700">Thông tin bổ sung ý kiến: </span>
                {contract.additionalOpinions.emphasisOfMatter && (
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold mr-1.5">
                    Nhấn mạnh
                  </span>
                )}
                {contract.additionalOpinions.otherMatters && (
                  <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold mr-1.5">
                    Vấn đề khác
                  </span>
                )}
                <p className="mt-1.5 text-slate-700 italic">
                  &ldquo;{contract.additionalOpinions.reason}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Team Breakdown Table */}
          <div>
            <div className="flex items-center justify-between mb-2 bg-indigo-50/70 p-1.5 px-3 rounded-lg">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                III. Thông Tin Thực Hiện Hợp Đồng
              </h4>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Tổng: 100%
              </span>
            </div>

            <table className="w-full text-left text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="py-2 px-3 border-r border-slate-300 w-12 text-center">STT</th>
                  <th className="py-2 px-3 border-r border-slate-300">Vị trí</th>
                  <th className="py-2 px-3 border-r border-slate-300">Tên nhân sự</th>
                  <th className="py-2 px-3 border-r border-slate-300">Phần hành</th>
                  <th className="py-2 px-3 text-right">Tỷ lệ thực hiện</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {contract.teamMembers.map((tm, idx) => (
                  <tr key={tm.id || idx}>
                    <td className="py-2 px-3 border-r border-slate-200 text-center">{idx + 1}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-medium">{tm.position}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                      {tm.name}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200">{tm.section}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {tm.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900">
                  <td colSpan={4} className="py-2 px-3 text-right">
                    Tổng cộng:
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-700 font-extrabold text-sm">
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures on Paper */}
          <div className="pt-8 grid grid-cols-2 text-center text-xs">
            <div>
              <p className="font-bold text-slate-700">NHÓM TRƯỞNG KIỂM TOÁN</p>
              <p className="italic text-slate-400 mt-1">(Ký và ghi rõ họ tên)</p>
              <div className="h-16" />
              <p className="font-bold text-slate-900">
                {contract.teamMembers.find((m) => m.position.includes('Nhóm trưởng'))?.name ||
                  contract.auditor}
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-700">THÀNH VIÊN BAN GIÁM ĐỐC</p>
              <p className="italic text-slate-400 mt-1">(Ký và ghi rõ họ tên)</p>
              <div className="h-16" />
              <p className="font-bold text-slate-900">
                {contract.boardMember === 'Khác' ? contract.boardMemberOther : contract.boardMember}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center print:hidden">
          {sheetConfig && contract.syncedToGoogleSheet && (
            <a
              href={sheetConfig.spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 font-medium"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Xem dòng dữ liệu trên Google Sheet ↗</span>
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
