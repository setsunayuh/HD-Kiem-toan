import React, { useState } from 'react';
import { GoogleSheetConfig, AuditContract } from '../types/audit';
import {
  sendContractToSheetWebhook,
  GOOGLE_APPS_SCRIPT_CODE,
} from '../services/googleSheetsWebhook';
import {
  FileSpreadsheet,
  Link,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Code2,
  FolderSync,
  HelpCircle,
  X,
  Send,
} from 'lucide-react';

interface GoogleSheetSettingsModalProps {
  sheetConfig: GoogleSheetConfig | null;
  contracts: AuditContract[];
  onSaveConfig: (config: GoogleSheetConfig | null) => void;
  onClose: () => void;
  onMarkSyncedBatch: (ids: string[]) => void;
}

export const GoogleSheetSettingsModal: React.FC<GoogleSheetSettingsModalProps> = ({
  sheetConfig,
  contracts,
  onSaveConfig,
  onClose,
  onMarkSyncedBatch,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(sheetConfig?.webhookUrl || '');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(sheetConfig?.spreadsheetUrl || '');
  const [spreadsheetName, setSpreadsheetName] = useState(
    sheetConfig?.spreadsheetName || 'Quản Lý Hợp Đồng Kiểm Toán'
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleSave = () => {
    if (!webhookUrl.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng dán đường dẫn Webhook URL (Apps Script Web App) để hệ thống tự động ghi về file Google Sheet.',
      });
      return;
    }

    const newConfig: GoogleSheetConfig = {
      webhookUrl: webhookUrl.trim(),
      spreadsheetUrl: spreadsheetUrl.trim() || 'https://docs.google.com/spreadsheets',
      spreadsheetName: spreadsheetName.trim() || 'Hợp Đồng Kiểm Toán',
      contractSheetName: 'Hợp Đồng Kiểm Toán',
      teamSheetName: 'Chi Tiết Phân Công Nhân Sự',
      autoSync: true,
      lastSyncTime: new Date().toISOString(),
    };

    onSaveConfig(newConfig);
    setStatusMessage({
      type: 'success',
      text: 'Đã lưu cấu hình Google Sheet thành công! Giờ đây mỗi khi nhân viên bấm OK, dữ liệu sẽ tự động lưu về file này.',
    });
  };

  // Test send a test row
  const handleTestConnection = async () => {
    if (!webhookUrl.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng nhập Webhook URL trước khi thử nghiệm kết nối.',
      });
      return;
    }

    try {
      setIsTesting(true);
      setStatusMessage({ type: 'info', text: 'Đang gửi thử nghiệm một dòng dữ liệu về Google Sheet của bạn...' });

      const testContract: AuditContract = {
        id: 'test-' + Date.now(),
        customerCode: '00000',
        customerName: '[DÒNG KIỂM TRA KẾT NỐI] Công ty Thử Nghiệm Kết Nối Sheet',
        contractNumber: '000/2026',
        contractDate: new Date().toLocaleDateString('vi-VN'),
        service: 'Kiểm toán',
        reportPeriod: '31/12',
        reportNumber: 'TEST-000',
        reportDate: new Date().toLocaleDateString('vi-VN'),
        boardMember: 'Bùi Tuyết Vân',
        auditor: 'Nguyễn Ngọc Thùy Dung',
        auditOpinion: 'Chấp nhận toàn phần',
        additionalOpinions: {
          otherMatters: false,
          emphasisOfMatter: false,
          reason: 'Dòng thử nghiệm kết nối tự động từ ứng dụng',
        },
        teamMembers: [
          {
            id: 'tm-test',
            position: 'Nhóm trưởng',
            name: 'Thùy Dung',
            section: 'Báo cáo',
            percentage: 100,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await sendContractToSheetWebhook(webhookUrl.trim(), testContract);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: 'Kết nối thành công! Đã gửi thành công 1 dòng thử nghiệm về Google Sheet của bạn. Bạn hãy mở file Google Sheet để kiểm tra.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `Gửi thử nghiệm không thành công: ${res.error}`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Lỗi kết nối: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Sync all existing contracts
  const handleSyncAllContracts = async () => {
    if (!webhookUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Chưa có Webhook URL Google Sheet nào được cấu hình.' });
      return;
    }

    try {
      setIsSyncingAll(true);
      setStatusMessage({ type: 'info', text: `Đang gửi ${contracts.length} hợp đồng về Google Sheet của bạn...` });

      const syncedIds: string[] = [];
      for (const contract of contracts) {
        const res = await sendContractToSheetWebhook(webhookUrl.trim(), contract);
        if (res.success) {
          syncedIds.push(contract.id);
        }
      }

      onMarkSyncedBatch(syncedIds);
      setStatusMessage({
        type: 'success',
        text: `Đồng bộ hoàn tất! Đã gửi ${syncedIds.length}/${contracts.length} hợp đồng về file Google Sheet.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Lỗi khi đồng bộ.',
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
                Cài Đặt File Google Sheet Của Riêng Bạn
              </h3>
              <p className="text-xs text-slate-500">
                Nhân viên không cần đăng nhập Google • Dữ liệu tự động gửi thẳng về file của bạn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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
              <Send className="w-5 h-5 text-blue-600 flex-shrink-0 animate-bounce" />
            )}
            <div className="flex-1">{statusMessage.text}</div>
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              1. Webhook URL Tự Động Lưu (Google Apps Script Web App) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-mono text-slate-900"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Đường link triển khai Apps Script (Web App) từ file Google Sheet của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                2. Đường Link Xem File Google Sheet
              </label>
              <input
                type="text"
                value={spreadsheetUrl}
                onChange={(e) => setSpreadsheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tên Bảng Tính Hiển Thị
              </label>
              <input
                type="text"
                value={spreadsheetName}
                onChange={(e) => setSpreadsheetName(e.target.value)}
                placeholder="VD: Quản Lý Hợp Đồng Kiểm Toán 2026"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* How to get Webhook URL in 3 simple steps */}
        <div className="mt-5 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 uppercase">
              <Code2 className="w-4 h-4 text-indigo-600" />
              Cách Tạo Webhook Trong 1 Phút (Chỉ Cần Làm 1 Lần Duy Nhất)
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép mã Apps Script</span>
                </>
              )}
            </button>
          </div>

          <ol className="text-xs text-indigo-900 space-y-1 list-decimal list-inside leading-relaxed">
            <li>
              Mở file Google Sheet của bạn &rarr; Chọn menu <strong>Tiện ích mở rộng (Extensions)</strong> &rarr; <strong>Apps Script</strong>.
            </li>
            <li>
              Bấm nút <strong>Sao chép mã Apps Script</strong> ở trên &rarr; Xóa nội dung cũ trong Apps Script và <strong>Dán vào</strong> &rarr; Nhấn Lưu (Ctrl + S).
            </li>
            <li>
              Bấm <strong>Triển khai (Deploy)</strong> &rarr; <strong>Tùy chọn triển khai mới (New deployment)</strong> &rarr; Chọn <strong>Ứng dụng web (Web app)</strong> &rarr; Tại mục &quot;Ai có quyền truy cập&quot; chọn <strong>Bất kỳ ai (Anyone)</strong> &rarr; Bấm Triển khai &rarr; Copy đường dẫn Web App dán vào ô số 1 ở trên!
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isTesting ? 'Đang gửi test...' : 'Gửi Thử Nghiệm 1 Dòng'}</span>
            </button>

            {sheetConfig && (
              <button
                type="button"
                onClick={handleSyncAllContracts}
                disabled={isSyncingAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <FolderSync className="w-3.5 h-3.5 text-teal-600" />
                <span>{isSyncingAll ? 'Đang đồng bộ...' : 'Đồng Bộ Hết Lên Sheet'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-emerald-700 hover:underline"
              >
                <span>Mở Google Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Lưu Cấu Hình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
