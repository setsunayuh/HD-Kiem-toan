import React from 'react';
import {
  FileCheck2,
  PlusCircle,
  TableProperties,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { MusicPlayer } from './MusicPlayer';

interface NavbarProps {
  activeTab: 'form' | 'list' | 'stats';
  setActiveTab: (tab: 'form' | 'list' | 'stats') => void;
  contractsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  contractsCount,
}) => {
  return (
    <header className="bg-slate-950/95 backdrop-blur-md text-white border-b border-orange-500/20 sticky top-0 z-40 shadow-xl shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-purple-600 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <FileCheck2 className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white uppercase sm:text-2xl bg-gradient-to-r from-orange-200 via-white to-purple-200 bg-clip-text text-transparent">
                  Quản Lý Hợp Đồng Kiểm Toán
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-950/80 text-orange-300 border border-orange-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                  Tự Động Lưu Sheet
                </span>
              </div>
            </div>
          </div>

          {/* Right Section: Background Music Player */}
          <div className="flex items-center gap-2 sm:gap-3">
            <MusicPlayer videoId="DCmLhoK3j0Y" />
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto pb-2.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'form'
                ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-purple-700 text-white shadow-lg shadow-orange-500/25 border border-orange-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-orange-400" />
            <span>Nhập Hợp Đồng Mới</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'list'
                ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-purple-700 text-white shadow-lg shadow-orange-500/25 border border-orange-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <TableProperties className="w-4 h-4 text-purple-400" />
            <span>Danh Sách Hợp Đồng</span>
            <span
              className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'list'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-900 text-orange-300 border border-orange-500/30'
              }`}
            >
              {contractsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-purple-700 text-white shadow-lg shadow-orange-500/25 border border-orange-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Thống Kê Nhóm & Tỷ Lệ</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
