import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  GoogleSheetConfig,
  AuditContract,
} from '../types/audit';
import {
  createAuditSpreadsheet,
  verifySpreadsheetAccess,
  extractSpreadsheetId,
  syncContractToGoogleSheet,
  DEFAULT_SHEET_NAMES,
} from '../services/googleSheetsService';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  FileSpreadsheet,
  PlusCircle,
  Link,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  FolderSync,
  HelpCircle,
  X,
  FileCheck2,
} from 'lucide-react';

interface GoogleSheetSettingsModalProps {
  user: User | null;
  accessToken: string | null;
  sheetConfig: GoogleSheetConfig | null;
  contracts: AuditContract[];
  onSaveConfig: (config: GoogleSheetConfig | null) => void;
  onLogin: () => void;
  onClose: () => void;
  isLoggingIn: boolean;
  onMarkSyncedBatch: (ids: string[]) => void;
}

export const GoogleSheetSettingsModal: React.FC<GoogleSheetSettingsModalProps> = ({
  user,
  accessToken,
  sheetConfig,
  contracts,
  onSaveConfig,
  onLogin,
  onClose,
  isLoggingIn,
  onMarkSyncedBatch,
}) => {
  const [sheetInput, setSheetInput] = useState(sheetConfig?.spreadsheetUrl || '');
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Create brand new Google Sheet
  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng bấm nút "Đăng nhập bằng Google" trước khi tạo file Google Sheet.',
      });
      return;
    }

    try {
      setIsCreatingSheet(true);
      setStatusMessage({ type: 'info', text: 'Đang tạo bảng tính Google Sheet mới...' });

      const result = await createAuditSpreadsheet(
        accessToken,
        'QUẢN LÝ HỢP ĐỒNG KIỂM TOÁN - HỆ THỐNG NỘI BỘ'
      );

      const newConfig: GoogleSheetConfig = {
        spreadsheetId: result.spreadsheetId,
        spreadsheetName: result.title,
        spreadsheetUrl: result.spreadsheetUrl,
        contractSheetName: DEFAULT_SHEET_NAMES.contracts,
        teamSheetName: DEFAULT_SHEET_NAMES.team,
        autoSync: true,
        lastSyncTime: new Date().toISOString(),
      };

      onSaveConfig(newConfig);
      setSheetInput(result.spreadsheetUrl);
      setStatusMessage({
        type: 'success',
        text: `Đã tạo thành công file Google Sheet mới! Các hợp đồng kiểm toán sẽ được tự động đồng bộ vào file này.`,
      });
    } catch (err: any) {
      console.error('Lỗi tạo Google Sheet:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Không thể tạo Google Sheet. Vui lòng kiểm tra quyền đăng nhập Google.',
      });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Link existing Google Sheet
  const handleLinkExistingSheet = async () => {
    const rawId = extractSpreadsheetId(sheetInput);
    if (!rawId) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng dán đúng đường link Google Sheet (ví dụ: https://docs.google.com/spreadsheets/d/...) hoặc ID bảng tính.',
      });
      return;
    }

    if (!accessToken) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng đăng nhập Google để cấp quyền kết nối bảng tính này.',
      });
      return;
    }

    try {
      setIsVerifying(true);
      setStatusMessage({ type: 'info', text: 'Đang kiểm tra kết nối bảng tính...' });

      const check = await verifySpreadsheetAccess(accessToken, rawId);
      if (!check.valid) {
        setStatusMessage({
          type: 'error',
          text: `Không thể truy cập Google Sheet: ${check.error || 'Quyền truy cập bị từ chối'}`,
        });
        return;
      }

      const newConfig: GoogleSheetConfig = {
        spreadsheetId: rawId,
        spreadsheetName: check.title || 'Google Sheet Hợp Đồng Kiểm Toán',
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${rawId}/edit`,
        contractSheetName: check.sheets?.includes(DEFAULT_SHEET_NAMES.contracts)
          ? DEFAULT_SHEET_NAMES.contracts
          : check.sheets?.[0] || DEFAULT_SHEET_NAMES.contracts,
        teamSheetName: check.sheets?.includes(DEFAULT_SHEET_NAMES.team)
          ? DEFAULT_SHEET_NAMES.team
          : check.sheets?.[1] || DEFAULT_SHEET_NAMES.team,
        autoSync: true,
        lastSyncTime: new Date().toISOString(),
      };

      onSaveConfig(newConfig);
      setStatusMessage({
        type: 'success',
        text: `Đã liên kết thành công với Google Sheet: "${check.title}"`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Lỗi khi kiểm tra Google Sheet.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Sync all local contracts to sheet
  const handleSyncAllContracts = async () => {
    if (!sheetConfig) {
      setStatusMessage({ type: 'error', text: 'Chưa có file Google Sheet nào được cấu hình.' });
      return;
    }
    if (!accessToken) {
      setStatusMessage({
        type: 'error',
        text: 'Phiên làm việc hết hạn. Vui lòng đăng nhập Google lại để đồng bộ.',
      });
      return;
    }

    try {
      setIsSyncingAll(true);
      setStatusMessage({ type: 'info', text: `Đang đồng bộ ${contracts.length} hợp đồng...` });

      const syncedIds: string[] = [];
      for (const contract of contracts) {
        const res = await syncContractToGoogleSheet(accessToken, sheetConfig, contract);
        if (res.success) {
          syncedIds.push(contract.id);
        }
      }

      onMarkSyncedBatch(syncedIds);
      setStatusMessage({
        type: 'success',
        text: `Đồng bộ hoàn tất! Đã ghi ${syncedIds.length}/${contracts.length} hợp đồng vào Google Sheet.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Lỗi trong quá trình đồng bộ toàn bộ hợp đồng.',
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Cài Đặt Đồng Bộ Google Sheets
              </h3>
              <p className="text-xs text-slate-500">
                Tự động lưu trữ hợp đồng và phân công nhân sự vào file Google Sheet của bạn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert if any */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : statusMessage.type === 'error'
                ? 'bg-red-50 border-red-300 text-red-800'
                : 'bg-blue-50 border-blue-300 text-blue-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            ) : (
              <RefreshCw className="w-5 h-5 text-blue-600 flex-shrink-0 animate-spin" />
            )}
            <div className="flex-1">{statusMessage.text}</div>
          </div>
        )}

        {/* Step 1: Google Account Authentication */}
        <div className="mb-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>1. Tài Khoản Google Được Cấp Quyền</span>
                {user ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đã kết nối
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Chưa đăng nhập
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {user
                  ? `Đang đăng nhập với: ${user.email} (${user.displayName || 'Người dùng'})`
                  : 'Cần đăng nhập Google để ứng dụng có quyền ghi vào Google Sheets của bạn.'}
              </p>
            </div>

            {!user && (
              <GoogleSignInButton
                onClick={onLogin}
                loading={isLoggingIn}
                text="Đăng nhập Google"
              />
            )}
          </div>
        </div>

        {/* Step 2: Choose Google Sheet Option */}
        <div className="space-y-5">
          <h4 className="text-sm font-bold text-slate-900">
            2. Lựa Chọn File Google Sheet Lưu Trữ
          </h4>

          {/* Option A: 1-Click Auto Creation */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                Cách 1: Tự Động Tạo File Google Sheet Mới
              </div>
              <p className="text-xs text-indigo-700/80 mt-0.5">
                Hệ thống tự động tạo file mẫu chuẩn với đầy đủ 2 Sheet và các cột tiêu đề kiểm toán.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateNewSheet}
              disabled={isCreatingSheet}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 whitespace-nowrap"
            >
              {isCreatingSheet ? 'Đang tạo...' : 'Tạo File Mới Ngay'}
            </button>
          </div>

          {/* Option B: Connect Existing Sheet URL */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Link className="w-4 h-4 text-slate-600" />
                Cách 2: Sử Dụng File Google Sheet Có Sẵn Của Bạn
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dán đường link bảng tính Google Sheet của bạn vào ô dưới đây:
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={sheetInput}
                onChange={(e) => setSheetInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleLinkExistingSheet}
                disabled={isVerifying}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {isVerifying ? 'Đang kiểm tra...' : 'Liên Kết'}
              </button>
            </div>
          </div>
        </div>

        {/* Current Active Sheet Information */}
        {sheetConfig && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm">File Google Sheet Hiện Tại:</span>
              </div>
              <a
                href={sheetConfig.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold underline"
              >
                <span>Mở trong tab mới</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="mt-2 text-xs space-y-1">
              <div>
                <strong>Tên file:</strong> {sheetConfig.spreadsheetName}
              </div>
              <div>
                <strong>Tab lưu hợp đồng:</strong> {sheetConfig.contractSheetName}
              </div>
              <div>
                <strong>Tab phân công nhân sự:</strong> {sheetConfig.teamSheetName}
              </div>
              <div>
                <strong>Trạng thái tự động:</strong> Mỗi khi bạn nhấn &quot;OK&quot; ở form hợp đồng, dữ liệu sẽ tự động ghi vào file này!
              </div>
            </div>

            {/* Sync all button */}
            <div className="mt-4 pt-3 border-t border-emerald-200 flex justify-between items-center">
              <span className="text-xs text-emerald-800">
                Hiện có {contracts.length} hợp đồng trên hệ thống
              </span>
              <button
                type="button"
                onClick={handleSyncAllContracts}
                disabled={isSyncingAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                <FolderSync className="w-3.5 h-3.5" />
                <span>{isSyncingAll ? 'Đang đẩy dữ liệu...' : 'Đồng Bộ Toàn Bộ Danh Sách Lên Sheet'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
