import React from 'react';
import {
  AuditContract,
  TEAM_MEMBERS,
  SERVICE_OPTIONS,
  REPORT_TYPE_OPTIONS,
  AUDIT_OPINIONS,
} from '../types/audit';
import {
  BarChart3,
  Users,
  FileCheck2,
  PieChart,
  ShieldCheck,
  Award,
  TrendingUp,
  Percent,
  Layers,
  Sparkles,
  Flame,
} from 'lucide-react';

interface StatsDashboardProps {
  contracts: AuditContract[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ contracts }) => {
  // Service breakdown
  const serviceStats = SERVICE_OPTIONS.map((svc) => {
    const count = contracts.filter((c) => c.service === svc).length;
    const percentage = contracts.length > 0 ? Math.round((count / contracts.length) * 100) : 0;
    return { name: svc, count, percentage };
  });

  // Report Type breakdown (Riêng, Hợp nhất, Khác)
  const reportTypeStats = REPORT_TYPE_OPTIONS.map((rtype) => {
    const count = contracts.filter((c) => (c.reportType || 'Riêng') === rtype).length;
    const percentage = contracts.length > 0 ? Math.round((count / contracts.length) * 100) : 0;
    return { name: rtype, count, percentage };
  });

  // Opinion breakdown
  const opinionStats = AUDIT_OPINIONS.map((op) => {
    const count = contracts.filter((c) => c.auditOpinion === op).length;
    const percentage = contracts.length > 0 ? Math.round((count / contracts.length) * 100) : 0;
    return { name: op, count, percentage };
  });

  // Team member workload calculation
  const memberWorkload = TEAM_MEMBERS.map((memberName) => {
    let contractCount = 0;
    let totalPercentageAssigned = 0;
    const positions: string[] = [];

    contracts.forEach((c) => {
      const match = c.teamMembers.find((m) => m.name === memberName);
      if (match) {
        contractCount += 1;
        totalPercentageAssigned += match.percentage;
        if (!positions.includes(match.position)) {
          positions.push(match.position);
        }
      }
    });

    const averagePct = contractCount > 0 ? Math.round(totalPercentageAssigned / contractCount) : 0;

    return {
      name: memberName,
      contractCount,
      totalPercentageAssigned,
      averagePct,
      positions,
    };
  }).sort((a, b) => b.totalPercentageAssigned - a.totalPercentageAssigned);

  // Board Member workload
  const boardStats: Record<string, number> = {};
  contracts.forEach((c) => {
    const name = c.boardMember === 'Khác' ? c.boardMemberOther || 'Khác' : c.boardMember;
    boardStats[name] = (boardStats[name] || 0) + 1;
  });

  // Auditor workload
  const auditorStats: Record<string, number> = {};
  contracts.forEach((c) => {
    const name = c.auditor === 'Khác' ? c.auditorOther || 'Khác' : c.auditor;
    auditorStats[name] = (auditorStats[name] || 0) + 1;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
          <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
          <span>Thống Kê Khối Lượng & Phân Bổ Nhóm Kiểm Toán</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Theo dõi tổng thể cơ cấu hợp đồng, loại báo cáo (Riêng/Hợp nhất) và mức độ tham gia của từng nhân sự
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contracts */}
        <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 hover:border-orange-500/40 shadow-lg shadow-black/20 flex items-center justify-between transition-all">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tổng Hợp Đồng
            </p>
            <h3 className="text-3xl font-black text-white mt-1">{contracts.length}</h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Chuẩn 100% tỷ lệ nhóm
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        {/* Audit Service */}
        <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 shadow-lg shadow-black/20 flex items-center justify-between transition-all">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Dịch Vụ Kiểm Toán
            </p>
            <h3 className="text-3xl font-black text-purple-400 mt-1">
              {contracts.filter((c) => c.service === 'Kiểm toán').length}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Hợp đồng kiểm toán độc lập</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Clean Opinion */}
        <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 shadow-lg shadow-black/20 flex items-center justify-between transition-all">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Chấp Nhận Toàn Phần
            </p>
            <h3 className="text-3xl font-black text-emerald-400 mt-1">
              {contracts.filter((c) => c.auditOpinion === 'Chấp nhận toàn phần').length}
            </h3>
            <p className="text-[11px] text-emerald-400 mt-1 font-medium">Báo cáo chuẩn mực</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <PieChart className="w-6 h-6" />
          </div>
        </div>

        {/* Active Team Members */}
        <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 shadow-lg shadow-black/20 flex items-center justify-between transition-all">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Nhân Sự Đang Tham Gia
            </p>
            <h3 className="text-3xl font-black text-amber-400 mt-1">
              {memberWorkload.filter((m) => m.contractCount > 0).length}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Trong 13 kiểm toán viên</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Grid: Services, Report Types, Opinions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Service Breakdown */}
        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            Cơ Cấu Theo Dịch Vụ
          </h3>

          <div className="space-y-4">
            {serviceStats.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{item.name}</span>
                  <span className="text-orange-300 font-bold">
                    {item.count} HĐ ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MỤC MỚI: Report Type Breakdown (Riêng, Hợp nhất, Khác) */}
        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Phân Loại Theo Loại Báo Cáo
          </h3>

          <div className="space-y-4">
            {reportTypeStats.map((item) => {
              let barGrad = 'from-purple-500 to-indigo-600';
              if (item.name === 'Riêng') barGrad = 'from-orange-500 to-amber-500';
              if (item.name === 'Khác') barGrad = 'from-pink-500 to-rose-500';

              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{item.name}</span>
                    <span className="text-purple-300 font-bold">
                      {item.count} HĐ ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full bg-gradient-to-r ${barGrad} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Opinion Breakdown */}
        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-teal-400" />
            Phân Loại Ý Kiến Kiểm Toán
          </h3>

          <div className="space-y-4">
            {opinionStats.map((item) => {
              let barColor = 'from-emerald-500 to-teal-500';
              if (item.name === 'Ngoại trừ') barColor = 'from-amber-400 to-amber-600';
              if (item.name === 'Từ chối') barColor = 'from-red-500 to-red-600';
              if (item.name === 'Trái ngược') barColor = 'from-rose-500 to-rose-700';

              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{item.name}</span>
                    <span className="text-teal-300 font-bold">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Member Workload Allocation Table */}
      <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              Thống Kê Khối Lượng & Tỷ Lệ Thực Hiện Của 13 Nhân Sự
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tổng hợp từ bảng phân công tỷ lệ hoàn thành trong từng hợp đồng
            </p>
          </div>
          <span className="text-xs text-orange-300 bg-orange-950/60 border border-orange-500/30 px-3 py-1.5 rounded-xl font-bold">
            Sắp xếp theo % khối lượng tích lũy
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 font-bold border-b border-slate-800">
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-3">Tên Nhân Sự</th>
                <th className="py-3 px-3 text-center">Số HĐ Tham Gia</th>
                <th className="py-3 px-3">Vị Trí Đảm Nhận Thường Xuyên</th>
                <th className="py-3 px-3 text-right">Tỷ Lệ TB / HĐ</th>
                <th className="py-3 px-3 text-right">Tổng Tỷ Lệ Tích Lũy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {memberWorkload.map((m, idx) => (
                <tr key={m.name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 flex items-center justify-center font-bold text-[10px]">
                      {m.name.charAt(0)}
                    </div>
                    <span>{m.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold ${
                        m.contractCount > 0
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {m.contractCount}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {m.positions.length > 0 ? m.positions.join(', ') : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-300">
                    {m.contractCount > 0 ? `${m.averagePct}%` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`font-black font-mono text-sm ${
                        m.totalPercentageAssigned > 0 ? 'text-orange-400' : 'text-slate-500'
                      }`}
                    >
                      {m.totalPercentageAssigned}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leadership Signoff Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Board Members */}
        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl">
          <h4 className="text-sm font-bold text-white mb-3">
            Hợp Đồng Theo Thành Viên Ban Giám Đốc
          </h4>
          <div className="space-y-2">
            {Object.entries(boardStats).map(([name, count]) => (
              <div
                key={name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
              >
                <span className="font-semibold text-slate-300">{name}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold">
                  {count} hợp đồng
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Auditors */}
        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl">
          <h4 className="text-sm font-bold text-white mb-3">
            Hợp Đồng Theo Kiểm Toán Viên Ký Báo Cáo
          </h4>
          <div className="space-y-2">
            {Object.entries(auditorStats).map(([name, count]) => (
              <div
                key={name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
              >
                <span className="font-semibold text-slate-300">{name}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  {count} hợp đồng
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
