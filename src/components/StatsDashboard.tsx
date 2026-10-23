import React from 'react';
import { AuditContract, TEAM_MEMBERS, SERVICE_OPTIONS, AUDIT_OPINIONS } from '../types/audit';
import {
  BarChart3,
  Users,
  FileCheck2,
  PieChart,
  ShieldCheck,
  Award,
  TrendingUp,
  Percent,
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
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng Hợp Đồng
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{contracts.length}</h3>
            <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Đã kiểm soát 100% tỷ lệ
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dịch Vụ Kiểm Toán
            </p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">
              {contracts.filter((c) => c.service === 'Kiểm toán').length}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Hợp đồng kiểm toán chính</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ý Kiến Chấp Nhận Toàn Phần
            </p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {contracts.filter((c) => c.auditOpinion === 'Chấp nhận toàn phần').length}
            </h3>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium">Báo cáo chuẩn mực</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PieChart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Nhân Sự Đang Tham Gia
            </p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">
              {memberWorkload.filter((m) => m.contractCount > 0).length}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Trong tổng 13 kiểm toán viên</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Grid: Services and Audit Opinions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Cơ Cấu Theo Dịch Vụ
          </h3>

          <div className="space-y-4">
            {serviceStats.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-slate-900 font-bold">
                    {item.count} hợp đồng ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Opinion Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-teal-600" />
            Phân Loại Ý Kiến Kiểm Toán
          </h3>

          <div className="space-y-4">
            {opinionStats.map((item) => {
              let barColor = 'from-emerald-500 to-teal-600';
              if (item.name === 'Ngoại trừ') barColor = 'from-amber-400 to-amber-600';
              if (item.name === 'Từ chối') barColor = 'from-red-400 to-red-600';
              if (item.name === 'Trái ngược') barColor = 'from-rose-500 to-rose-700';

              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="text-slate-900 font-bold">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Thống Kê Khối Lượng & Tỷ Lệ Thực Hiện Của Từng Nhân Sự
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tổng hợp từ các bảng phân công tỷ lệ hoàn thành trong từng hợp đồng
            </p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
            Sắp xếp theo tổng % khối lượng tích lũy
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-3">Tên Nhân Sự</th>
                <th className="py-3 px-3 text-center">Số Hợp Đồng Tham Gia</th>
                <th className="py-3 px-3">Vị Trí Đảm Nhận Thường Xuyên</th>
                <th className="py-3 px-3 text-right">Tỷ Lệ TB / Hợp Đồng</th>
                <th className="py-3 px-3 text-right">Tổng Tỷ Lệ Tích Lũy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {memberWorkload.map((m, idx) => (
                <tr key={m.name} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                      {m.name.charAt(0)}
                    </div>
                    <span>{m.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold ${
                        m.contractCount > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {m.contractCount}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {m.positions.length > 0 ? m.positions.join(', ') : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                    {m.contractCount > 0 ? `${m.averagePct}%` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`font-black font-mono text-sm ${
                        m.totalPercentageAssigned > 0 ? 'text-indigo-600' : 'text-slate-400'
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 mb-3">
            Hợp Đồng Theo Thành Viên Ban Giám Đốc
          </h4>
          <div className="space-y-2">
            {Object.entries(boardStats).map(([name, count]) => (
              <div
                key={name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <span className="font-semibold text-slate-800">{name}</span>
                <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                  {count} hợp đồng
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Auditors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 mb-3">
            Hợp Đồng Theo Kiểm Toán Viên Ký Báo Cáo
          </h4>
          <div className="space-y-2">
            {Object.entries(auditorStats).map(([name, count]) => (
              <div
                key={name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <span className="font-semibold text-slate-800">{name}</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
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
