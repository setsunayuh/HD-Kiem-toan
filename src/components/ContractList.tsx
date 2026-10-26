import React, { useState } from 'react';
import { AuditContract, GoogleSheetConfig } from '../types/audit';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  Users,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
} from 'lucide-react';
import { exportContractsToCSV } from '../services/storageService';

interface ContractListProps {
  contracts: AuditContract[];
  sheetConfig: GoogleSheetConfig | null;
  onDeleteContract: (id: string) => void;
  onSyncContract: (contract: AuditContract) => Promise<{ success: boolean; error?: string }>;
  onSelectContract: (contract: AuditContract) => void;
  onNavigateToForm: () => void;
}

export const ContractList: React.FC<ContractListProps> = ({
  contracts,
  sheetConfig,
  onDeleteContract,
  onSyncContract,
  onSelectContract,
  onNavigateToForm,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [selectedReportType, setSelectedReportType] = useState<string>('ALL');
  const [selectedOpinion, setSelectedOpinion] = useState<string>('ALL');
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered contracts
  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.auditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.boardMember.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.reportType && c.reportType.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesService = selectedService === 'ALL' || c.service === selectedService;
    const matchesReportType =
      selectedReportType === 'ALL' || (c.reportType || 'Riêng') === selectedReportType;
    const matchesOpinion = selectedOpinion === 'ALL' || c.auditOpinion === selectedOpinion;

    return matchesSearch && matchesService && matchesReportType && matchesOpinion;
  });

  const handleSync = async (contract: AuditContract) => {
    setSyncingId(contract.id);
    await onSyncContract(contract);
    setSyncingId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedContractId(expandedContractId === id ? null : id);
  };

  const getOpinionBadge = (opinion: string) => {
    switch (opinion) {
      case 'Chấp nhận toàn phần':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';
      case 'Ngoại trừ':
        return 'bg-amber-950/70 text-amber-300 border-amber-500/40';
      case 'Từ chối':
        return 'bg-red-950/70 text-red-300 border-red-500/40';
      case 'Trái ngược':
        return 'bg-rose-950/70 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getReportTypeBadge = (type?: string) => {
    switch (type) {
      case 'Hợp nhất':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/40';
      case 'Khác':
        return 'bg-pink-950/80 text-pink-300 border-pink-500/40';
      case 'Riêng':
      default:
        return 'bg-orange-950/80 text-orange-300 border-orange-500/40';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <span>Danh Sách Hợp Đồng Kiểm Toán</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
              {filteredContracts.length}/{contracts.length} hợp đồng
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tra cứu, kiểm tra phân bổ tỷ lệ nhóm thực hiện và kiểm soát đồng bộ Google Sheet
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => exportContractsToCSV(filteredContracts)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 hover:border-orange-500/40 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-orange-400" />
            <span>Xuất file Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black transition-all shadow-lg shadow-orange-500/25 cursor-pointer"
          >
            <span>+ Nhập Hợp Đồng Mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="my-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm mã KH (00128), tên KH, số HĐ (086/2026), KTV..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Filter: Service */}
        <div className="sm:col-span-2">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-200 focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="ALL">Tất cả dịch vụ</option>
            <option value="Kiểm toán">Kiểm toán</option>
            <option value="Soát xét">Soát xét</option>
            <option value="Báo cáo vốn">Báo cáo vốn</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        {/* Filter: Loại báo cáo */}
        <div className="sm:col-span-2">
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-purple-300 focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="ALL">Tất cả loại BC</option>
            <option value="Riêng">Báo cáo Riêng</option>
            <option value="Hợp nhất">Báo cáo Hợp nhất</option>
            <option value="Khác">Loại báo cáo Khác</option>
          </select>
        </div>

        {/* Filter: Opinion */}
        <div className="sm:col-span-3">
          <select
            value={selectedOpinion}
            onChange={(e) => setSelectedOpinion(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-200 focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="ALL">Tất cả ý kiến kiểm toán</option>
            <option value="Chấp nhận toàn phần">Chấp nhận toàn phần</option>
            <option value="Ngoại trừ">Ngoại trừ</option>
            <option value="Từ chối">Từ chối</option>
            <option value="Trái ngược">Trái ngược</option>
          </select>
        </div>
      </div>

      {/* Table or Cards */}
      {filteredContracts.length === 0 ? (
        <div className="bg-slate-900/70 rounded-3xl border border-slate-800 p-12 text-center my-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">Không tìm thấy hợp đồng phù hợp</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc bấm &quot;Nhập Hợp Đồng Mới&quot; để bổ sung vào hệ thống.
          </p>
          <button
            type="button"
            onClick={onNavigateToForm}
            className="mt-4 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 cursor-pointer"
          >
            Nhập Hợp Đồng Ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => {
            const isExpanded = expandedContractId === contract.id;
            const isSyncingThis = syncingId === contract.id;

            return (
              <div
                key={contract.id}
                className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 hover:border-orange-500/40 shadow-lg shadow-black/20 hover:shadow-orange-950/20 transition-all overflow-hidden"
              >
                {/* Main Card Row */}
                <div className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-orange-500/15 text-orange-300 font-mono font-bold text-xs border border-orange-500/30">
                        Mã: {contract.customerCode}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-950 text-white font-mono font-bold text-xs border border-slate-700">
                        HĐ: {contract.contractNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-950/70 text-purple-300 text-xs font-semibold border border-purple-500/30">
                        {contract.service}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border flex items-center gap-1 ${getReportTypeBadge(
                          contract.reportType
                        )}`}
                      >
                        <Layers className="w-3 h-3" />
                        Loại BC: {contract.reportType || 'Riêng'}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getOpinionBadge(
                          contract.auditOpinion
                        )}`}
                      >
                        {contract.auditOpinion}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {contract.customerName}
                    </h3>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-orange-400" />
                        Ngày HĐ: <strong className="text-slate-200">{contract.contractDate}</strong>
                      </span>
                      <span>
                        Kỳ BC (dd/mm/yyyy):{' '}
                        <strong className="text-orange-300 font-mono">{contract.reportPeriod}</strong>
                      </span>
                      <span>
                        Số BC: <strong className="text-slate-200">{contract.reportNumber}</strong>
                      </span>
                      <span>
                        Ngày BC: <strong className="text-slate-200">{contract.reportDate}</strong>
                      </span>
                      <span>
                        BGĐ: <strong className="text-slate-200">{contract.boardMember}</strong>
                      </span>
                      <span>
                        KTV: <strong className="text-slate-200">{contract.auditor}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    {/* View details */}
                    <button
                      type="button"
                      onClick={() => onSelectContract(contract)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Xem chi tiết & in phiếu"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Google Sheet Sync */}
                    <button
                      type="button"
                      onClick={() => handleSync(contract)}
                      disabled={isSyncingThis}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        contract.syncedToGoogleSheet
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/80'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                      title={
                        contract.syncedToGoogleSheet
                          ? `Đã đồng bộ lên Sheet lúc ${contract.syncedAt || ''}`
                          : 'Đồng bộ dòng này lên Google Sheet'
                      }
                    >
                      {isSyncingThis ? (
                        <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FileSpreadsheet
                          className={`w-3.5 h-3.5 ${
                            contract.syncedToGoogleSheet ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        />
                      )}
                      <span>{contract.syncedToGoogleSheet ? 'Đã lên Sheet' : 'Đồng bộ Sheet'}</span>
                    </button>

                    {/* Toggle breakdown table */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(contract.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900/70 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>{contract.teamMembers.length} Nhân sự</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      )}
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(contract.id)}
                      className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-500/30 rounded-xl transition-colors cursor-pointer"
                      title="Xóa hợp đồng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Team Table */}
                {isExpanded && (
                  <div className="bg-slate-950/70 px-6 py-4 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-orange-300 uppercase tracking-wider flex items-center gap-2">
                        <span>Phân Công Nhóm Thực Hiện & Tỷ Lệ Hoàn Thành</span>
                      </h4>
                      <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full">
                        Tổng: 100%
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-inner">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-950/90 text-slate-300 font-bold border-b border-slate-800">
                            <th className="py-2.5 px-3 w-10 text-center">#</th>
                            <th className="py-2.5 px-3">Vị trí</th>
                            <th className="py-2.5 px-3">Tên nhân sự</th>
                            <th className="py-2.5 px-3">Phần hành (chọn nhiều)</th>
                            <th className="py-2.5 px-3 text-right">Tỷ lệ thực hiện</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {contract.teamMembers.map((tm, idx) => {
                            const sections = tm.section
                              ? tm.section.split(',').map((s) => s.trim()).filter(Boolean)
                              : [];

                            return (
                              <tr key={tm.id || idx} className="hover:bg-slate-800/40 transition-colors">
                                <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                                <td className="py-2.5 px-3 font-medium text-slate-200">{tm.position}</td>
                                <td className="py-2.5 px-3 font-bold text-orange-300">{tm.name}</td>
                                <td className="py-2.5 px-3">
                                  <div className="flex flex-wrap gap-1">
                                    {sections.map((sec, sIdx) => (
                                      <span
                                        key={sIdx}
                                        className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-purple-300 font-mono text-[11px]"
                                      >
                                        {sec}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-right font-black font-mono text-emerald-400">
                                  {tm.percentage}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Note on additional opinion if present */}
                    {(contract.additionalOpinions.emphasisOfMatter ||
                      contract.additionalOpinions.otherMatters ||
                      contract.additionalOpinions.reason) && (
                      <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                        <span className="font-bold text-slate-300">Thông tin bổ sung ý kiến: </span>
                        {contract.additionalOpinions.emphasisOfMatter && (
                          <span className="text-orange-400 font-semibold mr-2">[Nhấn mạnh]</span>
                        )}
                        {contract.additionalOpinions.otherMatters && (
                          <span className="text-purple-400 font-semibold mr-2">[Vấn đề khác]</span>
                        )}
                        <span className="text-slate-400 italic">
                          &ldquo;{contract.additionalOpinions.reason}&rdquo;
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-500/40 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-400 mb-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Xác Nhận Xóa Hợp Đồng?</h3>
                <p className="text-xs text-slate-400">
                  Hành động này sẽ xóa dữ liệu hợp đồng khỏi danh sách lưu trữ trên máy.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteContract(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
              >
                Đồng Ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
