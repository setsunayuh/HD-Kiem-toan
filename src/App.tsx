/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ContractForm } from './components/ContractForm';
import { ContractList } from './components/ContractList';
import { StatsDashboard } from './components/StatsDashboard';
import { ContractDetailModal } from './components/ContractDetailModal';
import { AuditContract } from './types/audit';
import {
  getStoredContracts,
  saveContract,
  deleteContract,
  markContractSynced,
} from './services/storageService';
import {
  sendContractToSheetWebhook,
  DEFAULT_WEBHOOK_URL,
} from './services/googleSheetsWebhook';
import { AlertCircle, FileSpreadsheet, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'list' | 'stats'>('form');
  const [contracts, setContracts] = useState<AuditContract[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedContract, setSelectedContract] = useState<AuditContract | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  // Initialize stored contracts
  useEffect(() => {
    const storedContracts = getStoredContracts();
    setContracts(storedContracts);
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

  // Save new or updated Contract & automatically send to embedded Google Sheet webhook
  const handleSaveContract = async (
    contract: AuditContract
  ): Promise<{ success: boolean; sheetError?: string }> => {
    setIsSyncing(true);
    try {
      // 1. Save to local storage first
      const updatedList = saveContract(contract);
      setContracts(updatedList);

      // 2. Automatically send to the embedded Google Sheet Webhook URL
      const syncRes = await sendContractToSheetWebhook(DEFAULT_WEBHOOK_URL, contract);

      if (syncRes.success) {
        const syncedList = markContractSynced(contract.id, true);
        setContracts(syncedList);
        triggerNotification(
          'success',
          `Hợp đồng ${contract.contractNumber} đã được lưu và tự động cập nhật vào Google Sheet của bạn!`
        );
        return { success: true };
      } else {
        triggerNotification(
          'warning',
          `Đã lưu trên máy. Chưa thể ghi về Sheet: ${syncRes.error}`
        );
        return { success: false, sheetError: syncRes.error };
      }
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
    try {
      const res = await sendContractToSheetWebhook(DEFAULT_WEBHOOK_URL, contract);
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

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-slate-800 selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        contractsCount={contracts.length}
      />

      {/* Floating Notifications */}
      {notification && (
        <div className="fixed top-24 right-4 z-50 max-w-md animate-in slide-in-from-top-4 duration-200">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 ${
              notification.type === 'success'
                ? 'bg-white text-slate-800 border-emerald-300 shadow-emerald-100'
                : notification.type === 'warning'
                ? 'bg-white text-slate-800 border-amber-300 shadow-amber-100'
                : 'bg-white text-slate-800 border-red-300 shadow-red-100'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : notification.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm font-semibold flex-1">{notification.message}</div>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 pb-16 bg-white">
        {activeTab === 'form' && (
          <ContractForm
            onSaveContract={handleSaveContract}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === 'list' && (
          <ContractList
            contracts={contracts}
            sheetConfig={null}
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
          sheetConfig={null}
          onClose={() => setSelectedContract(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-50 text-slate-600 text-xs py-6 border-t border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-orange-700">QUẢN LÝ HỢP ĐỒNG KIỂM TOÁN</span>
            <span>•</span>
            <span className="font-medium">Mùa Kiểm Toán 2026 🎃🦇</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>Tự động lưu về Google Sheet riêng của bạn 👻</span>
            <span>•</span>
            <span>Phân công nhóm tỷ lệ chuẩn 100% 🍬</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
