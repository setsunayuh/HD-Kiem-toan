import React from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  FileCheck2,
  PlusCircle,
  TableProperties,
  BarChart3,
  ExternalLink,
  LogOut,
  Settings,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { GoogleSheetConfig } from '../types/audit';
import { GoogleSignInButton } from './GoogleSignInButton';

interface NavbarProps {
  activeTab: 'form' | 'list' | 'stats' | 'settings';
  setActiveTab: (tab: 'form' | 'list' | 'stats' | 'settings') => void;
  user: User | null;
  sheetConfig: GoogleSheetConfig | null;
  contractsCount: number;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  sheetConfig,
  contractsCount,
  onLogin,
  onLogout,
  isLoggingIn,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
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
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                  Bản Chuẩn 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Kiểm soát hợp đồng • Phân công nhóm • Đồng bộ Google Sheets tự động
              </p>
            </div>
          </div>

          {/* Right Actions: Google Account & Sheet status */}
          <div className="flex items-center gap-3">
            {sheetConfig ? (
              <a
                href={sheetConfig.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-medium hover:bg-emerald-900/80 transition-colors"
                title="Mở file Google Sheet đang liên kết"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="max-w-[140px] truncate">{sheetConfig.spreadsheetName}</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-700/50 text-amber-300 text-xs hover:bg-amber-900/60 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Chưa nối Google Sheet</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-teal-400/50 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left pr-1">
                  <div className="text-xs font-medium text-slate-200 max-w-[120px] truncate">
                    {user.displayName || 'Google User'}
                  </div>
                  <div className="text-[10px] text-teal-400 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Đã đăng nhập
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  title="Đăng xuất"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <GoogleSignInButton
                onClick={onLogin}
                loading={isLoggingIn}
                text="Kết nối Google"
                className="!py-1.5 !px-3 !text-xs !bg-slate-800 !hover:bg-slate-700 !text-white !border-slate-700"
              />
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cài Đặt Google Sheets</span>
            {sheetConfig && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
