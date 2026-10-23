import React from 'react';
import {
  FileSpreadsheet,
  FileCheck2,
  PlusCircle,
  TableProperties,
  BarChart3,
  ExternalLink,
  Settings,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { GoogleSheetConfig } from '../types/audit';
import { MusicPlayer } from './MusicPlayer';

interface NavbarProps {
  activeTab: 'form' | 'list' | 'stats' | 'settings';
  setActiveTab: (tab: 'form' | 'list' | 'stats' | 'settings') => void;
  sheetConfig: GoogleSheetConfig | null;
  contractsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  sheetConfig,
  contractsCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-teal-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <FileCheck2 className="w-6 h-6 text-teal-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white uppercase sm:text-2xl">
                  Quản Lý Hợp Đồng Kiểm Toán
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                  Tự Động Lưu Sheet
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Nhập liệu trực tiếp • Không cần đăng nhập • Tự động lưu về Google Sheet của bạn
              </p>
            </div>
          </div>

          {/* Right Section: Music Player & Google Sheet Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Background Music Player */}
            <MusicPlayer videoId="DCmLhoK3j0Y" />

            {/* Google Sheet Direct Status */}
            {sheetConfig && sheetConfig.spreadsheetUrl ? (
              <a
                href={sheetConfig.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-600/60 text-emerald-300 text-xs font-medium hover:bg-emerald-900 transition-colors shadow-sm"
                title="Mở trực tiếp file Google Sheet của bạn"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="max-w-[130px] truncate">{sheetConfig.spreadsheetName || 'Google Sheet'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs transition-colors"
                title="Cấu hình đường link Google Sheet lưu trữ"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                <span>Nối Google Sheet</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto pb-2.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'form'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nhập Hợp Đồng Mới</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'list'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>Danh Sách Hợp Đồng</span>
            <span
              className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'list'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {contractsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Thống Kê Nhóm & Tỷ Lệ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cài Đặt Google Sheet Riêng</span>
            {sheetConfig && sheetConfig.webhookUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
