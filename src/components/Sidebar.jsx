import React, { useContext } from 'react';
import { LayoutDashboard, Users, BookOpen, CheckSquare, Settings, LogOut, IndianRupee, MessageSquare, Calendar, ClipboardList, Clock, Trophy, GraduationCap, Sparkles, UserPlus, LifeBuoy, Award } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/aarambh_logo.png';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex',
    alignItems: 'center',
    padding: '0.8rem 1.5rem',
    cursor: 'pointer',
    color: active ? 'var(--primary-text)' : 'var(--text-muted)',
    background: active ? 'var(--secondary)' : 'transparent',
    borderLeft: active ? '4px solid var(--primary-text)' : '4px solid transparent',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontWeight: active ? 600 : 500,
    fontSize: '0.9rem',
    gap: '0.5rem'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateX(6px)';
    if (!active) {
      e.currentTarget.style.color = 'var(--text-main)';
      e.currentTarget.style.background = 'var(--primary)';
    }
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateX(0)';
    if (!active) {
      e.currentTarget.style.color = 'var(--text-muted)';
      e.currentTarget.style.background = 'transparent';
    }
  }}>
    <Icon size={18} style={{ marginRight: '0.5rem', transition: 'transform 0.3s ease' }} />
    <span>{label}</span>
  </div>
);

const Sidebar = () => {
  const { logout, userRole, sidebarCollapsed, setSidebarCollapsed } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;

  const handleNav = (targetPath) => {
    navigate(targetPath);
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ 
          width: '36px', height: '36px', borderRadius: '50%', 
          overflow: 'hidden', background: 'white', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <img src={logoImg} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.05em' }}>AARAMBH</h2>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '0.1rem' }}>EDUCATION</div>
        </div>
      </div>
      
      <div style={{ flex: 1, marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        <div style={{ padding: '0 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Menu</div>
        
        {/* Admin Links */}
        {userRole === 'admin' && (
          <>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={path === '/dashboard'} onClick={() => handleNav('/dashboard')} />
            <SidebarItem icon={Users} label="Teachers" active={path === '/teachers'} onClick={() => handleNav('/teachers')} />
            <SidebarItem icon={Users} label="Students" active={path === '/students'} onClick={() => handleNav('/students')} />
            <SidebarItem icon={BookOpen} label="Batches" active={path === '/classes'} onClick={() => handleNav('/classes')} />
            <SidebarItem icon={IndianRupee} label="Expenses" active={path === '/profit-loss'} onClick={() => handleNav('/profit-loss')} />
            <SidebarItem icon={Trophy} label="Quizzes & Exams" active={path === '/quizzes'} onClick={() => handleNav('/quizzes')} />
            <SidebarItem icon={GraduationCap} label="Syllabus Tracker" active={path === '/syllabus'} onClick={() => handleNav('/syllabus')} />
            <SidebarItem icon={MessageSquare} label="Announcements" active={path === '/messages'} onClick={() => handleNav('/messages')} />
            <SidebarItem icon={Calendar} label="Events" active={path === '/calendar'} onClick={() => handleNav('/calendar')} />
            <SidebarItem icon={ClipboardList} label="Requests" active={path === '/requests'} onClick={() => handleNav('/requests')} />
            <SidebarItem icon={UserPlus} label="Admissions CRM" active={path === '/admissions-crm'} onClick={() => handleNav('/admissions-crm')} />
            <SidebarItem icon={LifeBuoy} label="Support Desk" active={path === '/tickets'} onClick={() => handleNav('/tickets')} />
            <SidebarItem icon={Award} label="Credentials Gen" active={path === '/certificates'} onClick={() => handleNav('/certificates')} />
            <SidebarItem icon={Clock} label="System History" active={path === '/history'} onClick={() => handleNav('/history')} />
          </>
        )}

        {/* Teacher Links */}
        {userRole === 'teacher' && (
          <>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={path === '/teacher-dashboard'} onClick={() => handleNav('/teacher-dashboard')} />
            <SidebarItem icon={Trophy} label="Quizzes & Exams" active={path === '/quizzes'} onClick={() => handleNav('/quizzes')} />
            <SidebarItem icon={MessageSquare} label="Batch Chat" active={path === '/batch-chat'} onClick={() => handleNav('/batch-chat')} />
            <SidebarItem icon={UserPlus} label="Admissions CRM" active={path === '/admissions-crm'} onClick={() => handleNav('/admissions-crm')} />
            <SidebarItem icon={LifeBuoy} label="Support Desk" active={path === '/tickets'} onClick={() => handleNav('/tickets')} />
            <SidebarItem icon={Award} label="Credentials Gen" active={path === '/certificates'} onClick={() => handleNav('/certificates')} />
            <SidebarItem icon={GraduationCap} label="Syllabus Tracker" active={path === '/syllabus'} onClick={() => handleNav('/syllabus')} />
            <SidebarItem icon={MessageSquare} label="Announcements" active={path === '/messages'} onClick={() => handleNav('/messages')} />
            <SidebarItem icon={BookOpen} label="My Batches" active={path === '/classes'} onClick={() => handleNav('/classes')} />
            <SidebarItem icon={Calendar} label="Events" active={path === '/calendar'} onClick={() => handleNav('/calendar')} />
          </>
        )}

        {/* Student Links */}
        {userRole === 'student' && (
          <>
            <SidebarItem icon={LayoutDashboard} label="My Dashboard" active={path === '/student-dashboard'} onClick={() => handleNav('/student-dashboard')} />
            <SidebarItem icon={CheckSquare} label="My Attendance" active={path === '/student-attendance'} onClick={() => handleNav('/student-attendance')} />
            <SidebarItem icon={IndianRupee} label="My Receipts" active={path === '/student-receipts'} onClick={() => handleNav('/student-receipts')} />
            <SidebarItem icon={BookOpen} label="My Assignments" active={path === '/assignments'} onClick={() => handleNav('/assignments')} />
            <SidebarItem icon={Trophy} label="Quizzes & Exams" active={path === '/quizzes'} onClick={() => handleNav('/quizzes')} />
            <SidebarItem icon={MessageSquare} label="Batch Chat" active={path === '/batch-chat'} onClick={() => handleNav('/batch-chat')} />
            <SidebarItem icon={BookOpen} label="AI Flashcards" active={path === '/flashcards'} onClick={() => handleNav('/flashcards')} />
            <SidebarItem icon={Trophy} label="Leaderboard" active={path === '/leaderboard'} onClick={() => handleNav('/leaderboard')} />
            <SidebarItem icon={Clock} label="AI Study Planner" active={path === '/study-planner'} onClick={() => handleNav('/study-planner')} />
            <SidebarItem icon={GraduationCap} label="Syllabus Progress" active={path === '/syllabus'} onClick={() => handleNav('/syllabus')} />
            <SidebarItem icon={Calendar} label="Events" active={path === '/calendar'} onClick={() => handleNav('/calendar')} />
            <SidebarItem icon={BookOpen} label="Study Material" active={path === '/library'} onClick={() => handleNav('/library')} />
            <SidebarItem icon={LifeBuoy} label="Support Desk" active={path === '/tickets'} onClick={() => handleNav('/tickets')} />
          </>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <SidebarItem icon={Settings} label="Settings" active={path === '/settings'} onClick={() => handleNav('/settings')} />
        <SidebarItem icon={LogOut} label="Logout" onClick={logout} />
      </div>
    </div>
  );
};

export default Sidebar;