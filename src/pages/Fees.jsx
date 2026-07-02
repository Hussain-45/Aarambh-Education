import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';

const Fees = () => {
  const { userRole, loggedInUser, classes, students, sendFeeReminders } = useContext(AppContext);
  const navigate = useNavigate();

  const displayClasses = userRole === 'teacher' 
    ? classes.filter(c => loggedInUser.assignedClasses?.includes(c.name))
    : classes;

  return (
    <>
      <Sidebar />
      <main className="main-content">
        <Header />
        
        <div style={{ flex: 1 }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Select Batch for Fees</h2>
            {userRole === 'admin' && (
              <button 
                onClick={sendFeeReminders} 
                className="prof-btn" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                🔔 Auto-Send Pending Fee Reminders
              </button>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {displayClasses.map((cls) => {
              const enrolled = students.filter(s => s.class === cls.name).length;
              return (
                <div key={cls.id} className="prof-card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }} onClick={() => navigate(`/classes/${cls.id}`, { state: { activeTab: 'fees' } })}>
                  <div className="flex-between">
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{cls.name}</h3>
                    <span className="badge badge-warning">{cls.grade}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} /> {enrolled} Students Enrolled
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="prof-btn prof-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                      Manage Fees <ChevronRight size={14} style={{ marginLeft: '4px' }}/>
                    </button>
                  </div>
                </div>
              );
            })}
            {displayClasses.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No classes available.</p>}
          </div>
        </div>
      </main>
    </>
  );
};

export default Fees;
