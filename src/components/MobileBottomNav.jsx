import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, IndianRupee, CheckSquare, ClipboardList, Trophy, HelpCircle, Settings } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const MobileBottomNav = () => {
  const { isAuthenticated, userRole } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const currentPath = location.pathname;

  const adminNav = [
    { label: 'Home', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Batches', icon: BookOpen, path: '/classes' },
    { label: 'Students', icon: Users, path: '/students' },
    { label: 'Fees', icon: IndianRupee, path: '/fees' },
    { label: 'Settings', icon: Settings, path: '/settings' }
  ];

  const teacherNav = [
    { label: 'Home', icon: LayoutDashboard, path: '/teacher-dashboard' },
    { label: 'Batches', icon: BookOpen, path: '/classes' },
    { label: 'Attendance', icon: CheckSquare, path: '/attendance' },
    { label: 'Tasks', icon: ClipboardList, path: '/assignments' },
    { label: 'Settings', icon: Settings, path: '/settings' }
  ];

  const studentNav = [
    { label: 'Home', icon: LayoutDashboard, path: '/student-dashboard' },
    { label: 'Quizzes', icon: Trophy, path: '/quizzes' },
    { label: 'Syllabus', icon: BookOpen, path: '/syllabus' },
    { label: 'Doubts', icon: HelpCircle, path: '/tickets' },
    { label: 'Settings', icon: Settings, path: '/settings' }
  ];

  let items = studentNav;
  if (userRole === 'admin') items = adminNav;
  if (userRole === 'teacher') items = teacherNav;

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));

        return (
          <button
            key={item.label}
            className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            <div className="nav-icon-wrapper">
              <Icon size={20} />
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
