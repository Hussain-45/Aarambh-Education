import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { CheckCircle, XCircle, Clock, Search, Filter, Inbox, IndianRupee } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Requests = () => {
  const { registrationRequests, approveRequest, rejectRequest, classes, addToast, fees, students, verifyUpiPayment } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [teacherClasses, setTeacherClasses] = useState({});
  const [activeTab, setActiveTab] = useState('registrations');
  const [notes, setNotes] = useState({});

  const handleApprove = async (id, role) => {
    if (role === 'teacher') {
      const assigned = teacherClasses[id] || [];
      await approveRequest(id, assigned);
    } else {
      await approveRequest(id);
    }
  };

  const handleReject = async (id) => {
    await rejectRequest(id);
  };

  const handleVerifyUpi = async (feeId, status) => {
    const noteText = notes[feeId] || '';
    const success = await verifyUpiPayment(feeId, status, noteText);
    if (success) {
      setNotes(prev => {
        const next = { ...prev };
        delete next[feeId];
        return next;
      });
    }
  };

  const filteredRequests = registrationRequests.filter(req => {
    const matchesSearch = (req.name || req.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || req.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const pendingUpiPayments = fees.filter(f => f.upiPaymentStatus === 'pending_verification');

  return (
    <>
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', background: 'var(--bg-main)', minHeight: '100vh' }}>
        <Header />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Approvals & Verification</h1>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('registrations')}
            style={{
              padding: '0.75rem 1.5rem', background: 'transparent', border: 'none',
              borderBottom: activeTab === 'registrations' ? '3px solid var(--primary-text)' : '3px solid transparent',
              color: activeTab === 'registrations' ? 'var(--primary-text)' : 'var(--text-muted)',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            Registrations ({registrationRequests.length})
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            style={{
              padding: '0.75rem 1.5rem', background: 'transparent', border: 'none',
              borderBottom: activeTab === 'payments' ? '3px solid var(--primary-text)' : '3px solid transparent',
              color: activeTab === 'payments' ? 'var(--primary-text)' : 'var(--text-muted)',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            UPI Payments ({pendingUpiPayments.length})
          </button>
        </div>

        {activeTab === 'registrations' ? (
          <div className="prof-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Clock size={20} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Pending Registrations</h2>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="prof-input"
                    style={{ paddingLeft: '2.2rem', paddingRight: '1rem', width: '200px' }}
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={16} color="var(--text-muted)" />
                  <select 
                    value={filterRole} 
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="prof-input"
                    style={{ width: '130px' }}
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Inbox size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <div style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-main)' }}>No Requests Found</div>
                <div style={{ marginTop: '0.5rem' }}>There are no pending registrations matching your criteria.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="prof-table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Name/Username</th>
                      <th>Contact/Class Batch Details</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(req => (
                      <tr key={req.id}>
                        <td style={{ padding: '1rem 0.5rem', textTransform: 'capitalize' }}>
                          <span style={{ 
                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500,
                            background: req.role === 'teacher' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: req.role === 'teacher' ? '#3b82f6' : '#10b981'
                          }}>
                            {req.role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{req.name || req.username}</div>
                            {req.fatherName === 'FIRST_LOGIN' && (
                              <span style={{ 
                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)'
                              }}>
                                First Connection
                              </span>
                            )}
                          </div>
                          {req.role === 'teacher' && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>@{req.username}</div>}
                        </td>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>
                          {req.fatherName === 'FIRST_LOGIN' ? (
                            <div>
                              <strong style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>First-Time Connection Request</strong>
                              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>User requires admin authorization to connect and log in.</div>
                              {req.className && <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>Class/Batch: {req.className}</div>}
                            </div>
                          ) : req.role === 'student' ? (
                            <>
                              <div>Class: {req.className}</div>
                              <div style={{ fontSize: '0.85rem' }}>Phone: {req.parentPhone}</div>
                            </>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-main)' }}>Assign Batches:</span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {classes.map(cls => (
                                  <label key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={teacherClasses[req.id]?.includes(cls.name) || false}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        setTeacherClasses(prev => {
                                          const current = prev[req.id] || [];
                                          const updated = checked 
                                            ? [...current, cls.name]
                                            : current.filter(name => name !== cls.name);
                                          return { ...prev, [req.id]: updated };
                                        });
                                      }}
                                      style={{ transform: 'scale(1.1)' }}
                                    />
                                    {cls.name}
                                  </label>
                                ))}
                              </div>
                              <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Phone: {req.parentPhone || 'N/A'}</div>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => handleApprove(req.id, req.role)}
                              style={{ 
                                background: 'var(--success)', color: 'white', border: 'none', padding: '0.5rem 1rem', 
                                borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 
                              }}>
                              <CheckCircle size={16} /> Approve
                            </button>
                            <button 
                              onClick={() => handleReject(req.id)}
                              style={{ 
                                background: 'var(--danger)', color: 'white', border: 'none', padding: '0.5rem 1rem', 
                                borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 
                              }}>
                              <XCircle size={16} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="prof-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <IndianRupee size={20} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Pending UPI Payments Verification</h2>
              </div>
            </div>

            {pendingUpiPayments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Inbox size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <div style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-main)' }}>No Pending Payments</div>
                <div style={{ marginTop: '0.5rem' }}>All student UPI payments have been verified.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="prof-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Class/Batch</th>
                      <th>Month</th>
                      <th>Amount</th>
                      <th>UPI Transaction ID</th>
                      <th>Rejection Note / Feedback</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUpiPayments.map(fee => {
                      const student = students.find(s => s.id === fee.studentId);
                      return (
                        <tr key={fee.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-main)', padding: '1rem 0.5rem' }}>
                            {student?.name || `Student ID: ${fee.studentId}`}
                          </td>
                          <td style={{ color: 'var(--text-muted)', padding: '1rem 0.5rem' }}>
                            {student?.className || 'N/A'}
                          </td>
                          <td style={{ fontWeight: 600, padding: '1rem 0.5rem' }}>
                            {fee.month}
                          </td>
                          <td style={{ fontWeight: 700, padding: '1rem 0.5rem' }}>
                            ₹{fee.total - fee.paid}
                          </td>
                          <td style={{ color: 'var(--primary-text)', fontFamily: 'monospace', fontWeight: 'bold', padding: '1rem 0.5rem', letterSpacing: '0.5px' }}>
                            {fee.upiTransactionId}
                          </td>
                          <td style={{ padding: '1rem 0.5rem' }}>
                            <input
                              type="text"
                              placeholder="Reason if rejecting..."
                              value={notes[fee.id] || ''}
                              onChange={(e) => setNotes(prev => ({ ...prev, [fee.id]: e.target.value }))}
                              className="prof-input"
                              style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                            />
                          </td>
                          <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => handleVerifyUpi(fee.id, 'verified')}
                                style={{ 
                                  background: 'var(--success)', color: 'white', border: 'none', padding: '0.5rem 1rem', 
                                  borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 
                                }}>
                                <CheckCircle size={16} /> Verify
                              </button>
                              <button 
                                onClick={() => handleVerifyUpi(fee.id, 'rejected')}
                                style={{ 
                                  background: 'var(--danger)', color: 'white', border: 'none', padding: '0.5rem 1rem', 
                                  borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 
                                }}>
                                <XCircle size={16} /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default Requests;
