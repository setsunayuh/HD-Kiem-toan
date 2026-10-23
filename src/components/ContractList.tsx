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
      c.boardMember.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService = selectedService === 'ALL' || c.service === selectedService;
    const matchesOpinion = selectedOpinion === 'ALL' || c.auditOpinion === selectedOpinion;

    return matchesSearch && matchesService && matchesOpinion;
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
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Ngoại trừ':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Từ chối':
        return 'bg-red-50 text-red-700 border-red-300';
      case 'Trái ngược':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            Danh Sách Hợp Đồng Kiểm Toán
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {filteredContracts.length}/{contracts.length} hợp đồng
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tra cứu, xem phân công nhân sự từng hợp đồng và đồng bộ lên Google Sheet của bạn
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => exportContractsToCSV(filteredContracts)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất file Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToForm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <span>+ Nhập Hợp Đồng Mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="my-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên KH, mã KH (VD: 00128), số HĐ (086/2026), nhân sự..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả dịch vụ</option>
            <option value="Kiểm toán">Kiểm toán</option>
            <option value="Soát xét">Soát xét</option>
            <option value="Báo cáo vốn">Báo cáo vốn</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedOpinion}
            onChange={(e) => setSelectedOpinion(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
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
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy hợp đồng phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc bấm &quot;Nhập Hợp Đồng Mới&quot; để bổ sung vào hệ thống.
          </p>
          <button
            type="button"
            onClick={onNavigateToForm}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
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
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Card Row */}
                <div className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs border border-blue-200">
                        Mã: {contract.customerCode}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs">
                        HĐ: {contract.contractNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                        {contract.service}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${getOpinionBadge(
                          contract.auditOpinion
                        )}`}
                      >
                        {contract.auditOpinion}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {contract.customerName}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Ngày HĐ: <strong className="text-slate-700">{contract.contractDate}</strong>
                      </span>
                      <span>
                        Kỳ BC: <strong className="text-slate-700">{contract.reportPeriod}</strong>
                      </span>
                      <span>
                        Số BC: <strong className="text-slate-700">{contract.reportNumber}</strong>
                      </span>
                      <span>
                        Ngày BC: <strong className="text-slate-700">{contract.reportDate}</strong>
                      </span>
                      <span>
                        BGĐ: <strong className="text-slate-700">{contract.boardMember}</strong>
                      </span>
                      <span>
                        KTV: <strong className="text-slate-700">{contract.auditor}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* View details */}
                    <button
                      type="button"
                      onClick={() => onSelectContract(contract)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Xem chi tiết & in phiếu"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Google Sheet Sync */}
                    <button
                      type="button"
                      onClick={() => handleSync(contract)}
                      disabled={isSyncingThis}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        contract.syncedToGoogleSheet
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                      title={
                        contract.syncedToGoogleSheet
                          ? `Đã đồng bộ lên Sheet lúc ${contract.syncedAt || ''}`
                          : 'Đồng bộ dòng này lên Google Sheet'
                      }
                    >
                      {isSyncingThis ? (
                        <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FileSpreadsheet
                          className={`w-3.5 h-3.5 ${
                            contract.syncedToGoogleSheet ? 'text-emerald-600' : 'text-slate-500'
                          }`}
                        />
                      )}
                      <span>{contract.syncedToGoogleSheet ? 'Đã lên Sheet' : 'Đồng bộ Sheet'}</span>
                    </button>

                    {/* Toggle breakdown table */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(contract.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
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
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Xóa hợp đồng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Team Table */}
                {isExpanded && (
                  <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Phân Công Nhóm Thực Hiện & Tỷ Lệ Hoàn Thành
                      </h4>
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Tổng: 100%
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                            <th className="py-2 px-3 w-10 text-center">#</th>
                            <th className="py-2 px-3">Vị trí</th>
                            <th className="py-2 px-3">Tên nhân sự</th>
                            <th className="py-2 px-3">Phần hành</th>
                            <th className="py-2 px-3 text-right">Tỷ lệ thực hiện</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {contract.teamMembers.map((tm, idx) => (
                            <tr key={tm.id || idx}>
                              <td className="py-2 px-3 text-center text-slate-400">{idx + 1}</td>
                              <td className="py-2 px-3 font-medium text-slate-800">{tm.position}</td>
                              <td className="py-2 px-3 font-semibold text-indigo-700">{tm.name}</td>
                              <td className="py-2 px-3 text-slate-600">{tm.section}</td>
                              <td className="py-2 px-3 text-right font-bold text-slate-900">
                                {tm.percentage}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Note on additional opinion if present */}
                    {(contract.additionalOpinions.emphasisOfMatter ||
                      contract.additionalOpinions.otherMatters ||
                      contract.additionalOpinions.reason) && (
                      <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-slate-700">Thông tin bổ sung ý kiến: </span>
                        {contract.additionalOpinions.emphasisOfMatter && (
                          <span className="text-blue-600 font-medium mr-2">[Nhấn mạnh]</span>
                        )}
                        {contract.additionalOpinions.otherMatters && (
                          <span className="text-purple-600 font-medium mr-2">[Vấn đề khác]</span>
                        )}
                        <span className="text-slate-600">{contract.additionalOpinions.reason}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal (compliant with safe operations) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác Nhận Xóa Hợp Đồng?</h3>
                <p className="text-xs text-slate-500">
                  Hành động này sẽ xóa dữ liệu hợp đồng khỏi danh sách lưu trữ trên máy.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteContract(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
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
