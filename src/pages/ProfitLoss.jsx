import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const ProfitLoss = () => {
  const { userRole } = useContext(AppContext);

  if (userRole !== 'admin') {
    return (
      <>
        <Sidebar />
        <main className="main-content">
          <Header />
          <div className="prof-card">
            <h3>Access Denied</h3>
            <p>Only administrators can view financial records.</p>
          </div>
        </main>
      </>
    );
  }

  // Transaction Ledger Data matching the screenshot
  const transactions = [
    { id: 1, category: 'Student Fees', desc: 'Course fee collected dynamically', amount: 70000, type: 'Income', date: '2026-07-02' },
    { id: 2, category: 'Infrastructure Rent', desc: 'Monthly facility rent allocation', amount: -8000, type: 'Expense', date: '2026-07-01' },
    { id: 3, category: 'Faculty Payroll', desc: 'Monthly core teacher payout allocation', amount: -5000, type: 'Expense', date: '2026-07-01' },
    { id: 4, category: 'Software Server Cloud', desc: 'Database cloud server host billing', amount: -2000, type: 'Expense', date: '2026-06-30' },
  ];

  // Dynamic Calculations
  const grossRevenue = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const operatingCosts = Math.abs(
    transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const netIncome = grossRevenue - operatingCosts;
  const profitMargin = ((netIncome / grossRevenue) * 100).toFixed(1);

  // Format currency helper
  const formatCurrency = (val) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  return (
    <>
      <Sidebar />
      <main className="main-content">
        <Header />
        
        {/* Page Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Profit & Loss</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.25rem', letterSpacing: '0.05em' }}>
            Thursday, July 2, 2026
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="dashboard-grid" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          {/* Card 1: Gross Revenue */}
          <div className="prof-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.75rem 2rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Gross Revenue
            </span>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', lineHeight: '1.2' }}>
              {formatCurrency(grossRevenue)}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Fees Received
            </span>
          </div>

          {/* Card 2: Operating Costs */}
          <div className="prof-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.75rem 2rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Operating Costs
            </span>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ef4444', lineHeight: '1.2' }}>
              {formatCurrency(operatingCosts)}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Rent, Faculty, Infrastructure
            </span>
          </div>

          {/* Card 3: Net Income */}
          <div className="prof-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.75rem 2rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Net Income
            </span>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#3b82f6', lineHeight: '1.2' }}>
              {formatCurrency(netIncome)}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Profit Margin: {profitMargin}%
            </span>
          </div>

        </div>

        {/* Financial Ledger Section */}
        <div className="prof-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, marginBottom: '2rem', color: 'var(--text-main)' }}>
            Financial Ledger
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="prof-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>Description</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>Amount</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>Type</th>
                  <th style={{ textAlign: 'right', padding: '1rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(item => {
                  const isPositive = item.amount > 0;
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {/* Category */}
                      <td style={{ padding: '1.25rem 1rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.category}
                      </td>
                      {/* Description */}
                      <td style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {item.desc}
                      </td>
                      {/* Amount */}
                      <td style={{ 
                        padding: '1.25rem 1rem', 
                        fontSize: '0.9rem', 
                        fontWeight: 700, 
                        textAlign: 'center',
                        color: isPositive ? '#10b981' : '#ef4444' 
                      }}>
                        {isPositive ? '+ ' : '- '}
                        {formatCurrency(Math.abs(item.amount))}
                      </td>
                      {/* Type Badge */}
                      <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: isPositive ? '#10b981' : '#ef4444',
                          background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          border: `1px solid ${isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                          {item.type}
                        </span>
                      </td>
                      {/* Date */}
                      <td style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right', fontWeight: 600 }}>
                        {item.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </>
  );
};

export default ProfitLoss;
