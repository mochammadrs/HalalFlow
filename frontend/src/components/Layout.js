import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import TransactionModal from './TransactionModal';
import transactionService from '../services/transactionService';

const Layout = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleCreateTransaction = async (data) => {
    await transactionService.createTransaction(
      data.date,
      data.amount,
      data.type,
      data.category_id,
      data.description
    );
    // Trigger window event so active pages (Dashboard / Transactions / Planner) can refresh their data
    window.dispatchEvent(new CustomEvent('halalflow:transaction-updated'));
  };

  return (
    <div className="app-root-layout">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
        onOpenAddTransaction={() => setIsAddModalOpen(true)}
      />

      {/* Main Area */}
      <div className="app-main-wrapper">
        <TopHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenAddTransaction={() => setIsAddModalOpen(true)}
        />

        <main className="app-page-content">
          {children}
        </main>
      </div>

      {/* Global Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTransaction}
      />
    </div>
  );
};

export default Layout;
