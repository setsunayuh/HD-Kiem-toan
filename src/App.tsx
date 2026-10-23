/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { ContractForm } from './components/ContractForm';
import { ContractList } from './components/ContractList';
import { StatsDashboard } from './components/StatsDashboard';
import { GoogleSheetSettingsModal } from './components/GoogleSheetSettingsModal';
import { ContractDetailModal } from './components/ContractDetailModal';
import { AuditContract, GoogleSheetConfig } from './types/audit';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setCachedAccessToken,
} from './services/firebaseAuth';
import {
  getStoredContracts,
  saveContract,
  deleteContract,
  markContractSynced,
  getStoredSheetConfig,
  saveSheetConfig,
} from './services/storageService';
import { syncContractToGoogleSheet } from './services/googleSheetsService';
import { AlertCircle, FileSpreadsheet, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'list' | 'stats' | 'settings'>('form');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig | null>(null);
  const [contracts, setContracts] = useState<AuditContract[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedContract, setSelectedContract] = useState<AuditContract | null>(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  // Initialize Auth & stored state
  useEffect(() => {
    // Load local contracts
    const storedContracts = getStoredContracts();
    setContracts(storedContracts);

    // Load local sheet config
    const storedConfig = getStoredSheetConfig();
    setSheetConfig(storedConfig);

    // Listen to Firebase Auth state
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        if (token) {
          setAccessToken(token);
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );

    return () => unsubscribe();
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

  // Google Sign-In
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        triggerNotification(
          'success',
          `Đăng nhập Google thành công: ${result.user.displayName || result.user.email}`
        );
      }
    } catch (err: any) {
      console.error('Lỗi đăng nhập:', err);
      triggerNotification('error', `Đăng nhập không thành công: ${err.message || 'Lỗi cửa sổ đăng nhập'}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
      triggerNotification('success', 'Đã đăng xuất tài khoản Google.');
    } catch (err: any) {
      console.error('Lỗi đăng xuất:', err);
    }
  };

  // Save new or updated Contract
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

      // 2. Check if Google Sheet is configured
      if (sheetConfig && sheetConfig.spreadsheetId) {
        let currentToken = accessToken;
        if (!currentToken) {
          currentToken = await getAccessToken();
        }

        if (currentToken) {
          const syncRes = await syncContractToGoogleSheet(
            currentToken,
            sheetConfig,
            contract
          );

          if (syncRes.success) {
            sheetSyncSucceeded = true;
            const syncedList = markContractSynced(contract.id, true);
            setContracts(syncedList);
            triggerNotification(
              'success',
              `Hợp đồng ${contract.contractNumber} đã được lưu và tự động cập nhật vào Google Sheet!`
            );
          } else {
            sheetErrorMessage = syncRes.error;
            triggerNotification(
              'warning',
              `Đã lưu trên máy, nhưng chưa thể ghi Google Sheet: ${syncRes.error}`
            );
          }
        } else {
          sheetErrorMessage = 'Chưa đăng nhập Google để tự động cập nhật bảng tính.';
          triggerNotification(
            'warning',
            `Đã lưu trên máy. Hãy bấm "Kết nối Google" để tự động đồng bộ vào Google Sheet.`
          );
        }
      } else {
        triggerNotification(
          'success',
          `Hợp đồng ${contract.contractNumber} đã lưu thành công trên máy tính.`
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
    if (!sheetConfig) {
      setIsSheetModalOpen(true);
      return { success: false, error: 'Chưa cấu hình file Google Sheet.' };
    }

    let currentToken = accessToken;
    if (!currentToken) {
      currentToken = await getAccessToken();
    }

    if (!currentToken) {
      setIsSheetModalOpen(true);
      return { success: false, error: 'Vui lòng đăng nhập Google để đồng bộ.' };
    }

    try {
      const res = await syncContractToGoogleSheet(currentToken, sheetConfig, contract);
      if (res.success) {
        const updated = markContractSynced(contract.id, true);
        setContracts(updated);
        triggerNotification('success', `Đã đồng bộ HĐ ${contract.contractNumber} lên Google Sheet!`);
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
    triggerNotification('success', 'Đã xóa hợp đồng khỏi hệ thống.');
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
        user={user}
        sheetConfig={sheetConfig}
        contractsCount={contracts.length}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
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
            sheetConfigured={!!sheetConfig}
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

      {/* Google Sheet Settings Modal */}
      {isSheetModalOpen && (
        <GoogleSheetSettingsModal
          user={user}
          accessToken={accessToken}
          sheetConfig={sheetConfig}
          contracts={contracts}
          onSaveConfig={handleSaveSheetConfig}
          onLogin={handleLogin}
          onClose={() => setIsSheetModalOpen(false)}
          isLoggingIn={isLoggingIn}
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
            <span>Hệ thống phân công & kiểm soát tỷ lệ nhóm 100%</span>
            <span>•</span>
            <span>Tự động đồng bộ Google Sheets</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
