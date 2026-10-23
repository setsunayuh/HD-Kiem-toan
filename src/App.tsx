/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ContractForm } from './components/ContractForm';
import { ContractList } from './components/ContractList';
import { StatsDashboard } from './components/StatsDashboard';
import { GoogleSheetSettingsModal } from './components/GoogleSheetSettingsModal';
import { ContractDetailModal } from './components/ContractDetailModal';
import { AuditContract, GoogleSheetConfig } from './types/audit';
import {
  getStoredContracts,
  saveContract,
  deleteContract,
  markContractSynced,
  getStoredSheetConfig,
  saveSheetConfig,
} from './services/storageService';
import { sendContractToSheetWebhook } from './services/googleSheetsWebhook';
import { AlertCircle, FileSpreadsheet, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'list' | 'stats' | 'settings'>('form');
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig | null>(null);
  const [contracts, setContracts] = useState<AuditContract[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedContract, setSelectedContract] = useState<AuditContract | null>(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  // Initialize stored contracts & sheet config
  useEffect(() => {
    const storedContracts = getStoredContracts();
    setContracts(storedContracts);

    const storedConfig = getStoredSheetConfig();
    setSheetConfig(storedConfig);
  }, []);

  // Show auto-dismiss notification
  const triggerNotification = (
    type: 'success' | 'warning' | 'error',
    message: string,
    durationMs: number = 4000
  ) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, durationMs);
  };

  // Save new or updated Contract & automatically send to Google Sheet webhook
  const handleSaveContract = async (
    contract: AuditContract
  ): Promise<{ success: boolean; sheetError?: string }> => {
    setIsSyncing(true);
    try {
      // 1. Save to local storage first
      const updatedList = saveContract(contract);
      setContracts(updatedList);

      let sheetSyncSucceeded = false;
      let sheetErrorMessage: string | undefined;

      // 2. Automatically send to Google Sheet webhook if configured (ZERO login needed!)
      if (sheetConfig && sheetConfig.webhookUrl) {
        const syncRes = await sendContractToSheetWebhook(
          sheetConfig.webhookUrl,
          contract
        );

        if (syncRes.success) {
          sheetSyncSucceeded = true;
          const syncedList = markContractSynced(contract.id, true);
          setContracts(syncedList);
          triggerNotification(
            'success',
            `Hợp đồng ${contract.contractNumber} đã được lưu và tự động cập nhật vào Google Sheet của bạn!`
          );
        } else {
          sheetErrorMessage = syncRes.error;
          triggerNotification(
            'warning',
            `Đã lưu trên máy. Chưa thể ghi về Sheet: ${syncRes.error}`
          );
        }
      } else {
        triggerNotification(
          'success',
          `Hợp đồng ${contract.contractNumber} đã lưu thành công! (Chưa cài đặt Webhook Google Sheet để đồng bộ đám mây)`
        );
      }

      return {
        success: sheetSyncSucceeded,
        sheetError: sheetErrorMessage,
      };
    } catch (err: any) {
      console.error('Lỗi lưu hợp đồng:', err);
      triggerNotification('error', `Lỗi lưu hợp đồng: ${err.message}`);
      return { success: false, sheetError: err.message };
    } finally {
      setIsSyncing(false);
    }
  };

  // Individual Sync action from ContractList
  const handleSyncSingleContract = async (
    contract: AuditContract
  ): Promise<{ success: boolean; error?: string }> => {
    if (!sheetConfig || !sheetConfig.webhookUrl) {
      setIsSheetModalOpen(true);
      return {
        success: false,
        error: 'Chưa cấu hình Webhook Google Sheet. Vui lòng dán link trong mục Cài Đặt Google Sheet.',
      };
    }

    try {
      const res = await sendContractToSheetWebhook(sheetConfig.webhookUrl, contract);
      if (res.success) {
        const updated = markContractSynced(contract.id, true);
        setContracts(updated);
        triggerNotification(
          'success',
          `Đã gửi thành công HĐ ${contract.contractNumber} về Google Sheet của bạn!`
        );
        return { success: true };
      } else {
        triggerNotification('error', `Lỗi đồng bộ: ${res.error}`);
        return { success: false, error: res.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Delete Contract
  const handleDeleteContract = (id: string) => {
    const updated = deleteContract(id);
    setContracts(updated);
    triggerNotification('success', 'Đã xóa hợp đồng khỏi danh sách.');
  };

  // Batch Mark Synced
  const handleMarkSyncedBatch = (syncedIds: string[]) => {
    let updated = contracts;
    syncedIds.forEach((id) => {
      updated = markContractSynced(id, true);
    });
    setContracts(updated);
  };

  // Save new Sheet Config
  const handleSaveSheetConfig = (newConfig: GoogleSheetConfig | null) => {
    saveSheetConfig(newConfig);
    setSheetConfig(newConfig);
    if (newConfig) {
      triggerNotification(
        'success',
        `Đã lưu cấu hình Google Sheet: "${newConfig.spreadsheetName}"`
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab === 'settings' ? 'settings' : activeTab}
        setActiveTab={(tab) => {
          if (tab === 'settings') {
            setIsSheetModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        sheetConfig={sheetConfig}
        contractsCount={contracts.length}
      />

      {/* Floating Notifications */}
      {notification && (
        <div className="fixed top-24 right-4 z-50 max-w-md animate-in slide-in-from-top-4 duration-200">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 ${
              notification.type === 'success'
                ? 'bg-slate-900 text-white border-emerald-500/50'
                : notification.type === 'warning'
                ? 'bg-amber-900 text-white border-amber-500/50'
                : 'bg-red-900 text-white border-red-500/50'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : notification.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm font-medium flex-1">{notification.message}</div>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {activeTab === 'form' && (
          <ContractForm
            onSaveContract={handleSaveContract}
            isSyncing={isSyncing}
            sheetConfigured={!!(sheetConfig && sheetConfig.webhookUrl)}
            onOpenSheetConfig={() => setIsSheetModalOpen(true)}
          />
        )}

        {activeTab === 'list' && (
          <ContractList
            contracts={contracts}
            sheetConfig={sheetConfig}
            onDeleteContract={handleDeleteContract}
            onSyncContract={handleSyncSingleContract}
            onSelectContract={(c) => setSelectedContract(c)}
            onNavigateToForm={() => setActiveTab('form')}
          />
        )}

        {activeTab === 'stats' && <StatsDashboard contracts={contracts} />}
      </main>

      {/* Contract Detail Modal (Printable) */}
      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          sheetConfig={sheetConfig}
          onClose={() => setSelectedContract(null)}
        />
      )}

      {/* Google Sheet Settings Modal (Zero-login webhook setup) */}
      {isSheetModalOpen && (
        <GoogleSheetSettingsModal
          sheetConfig={sheetConfig}
          contracts={contracts}
          onSaveConfig={handleSaveSheetConfig}
          onClose={() => setIsSheetModalOpen(false)}
          onMarkSyncedBatch={handleMarkSyncedBatch}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">QUẢN LÝ HỢP ĐỒNG KIỂM TOÁN</span>
            <span>•</span>
            <span>Phiên bản doanh nghiệp 2026</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Tự động lưu về Google Sheet riêng (Không cần đăng nhập)</span>
            <span>•</span>
            <span>Phân công nhóm tỷ lệ chuẩn 100%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
