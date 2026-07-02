import React, { useContext, useState, useEffect, useRef } from 'react';
import { Bell, Search, UserCircle, Sun, Moon } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { theme, setTheme, students, classes, logout, userRole } = useContext(AppContext);
  const [searchVal, setSearchVal] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchVal('');
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const filteredStudentsRaw = searchVal.trim() === '' ? [] : students.filter(s => s && (s.name || '').toLowerCase().includes(searchVal.toLowerCase()));
  const filteredClassesRaw = searchVal.trim() === '' ? [] : classes.filter(c => c && (c.name || '').toLowerCase().includes(searchVal.toLowerCase()));

  // Deduplicate by ID to prevent duplicate items from showing in the search list
  const filteredStudents = Array.from(new Map(filteredStudentsRaw.filter(s => s && s.id).map(s => [s.id, s])).values());
  const filteredClasses = Array.from(new Map(filteredClassesRaw.filter(c => c && c.id).map(c => [c.id, c])).values());

  return (
    <header className="flex-between" style={{ marginBottom: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Overview</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{currentDate}</p>
      </div>

      <div className="flex-center gap-3">
        <div ref={searchRef} style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search students, classes..." 
            className="prof-input"
            style={{ paddingLeft: '1rem', borderRadius: '20px', width: '250px' }}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          
          {searchVal && (
            <div className="prof-card" style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              width: '300px',
              maxHeight: '350px',
              overflowY: 'auto',
              zIndex: 1000,
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-glass)',
              borderRadius: '12px'
            }}>
              {filteredStudents.length === 0 && filteredClasses.length === 0 ? (
                <div style={{ padding: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No results found</div>
              ) : (
                <>
                  {filteredClasses.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.5rem 0.8rem 0.2rem 0.8rem' }}>Classes</div>
                      {filteredClasses.map(c => (
                        <div 
                          key={c.id} 
                          className="search-item" 
                          style={{ padding: '0.6rem 0.8rem', cursor: 'pointer', transition: 'background 0.2s', fontSize: '0.9rem', borderRadius: '6px' }}
                          onClick={() => {
                            navigate(`/classes/${c.id}`);
                            setSearchVal('');
                          }}
                        >
                          <strong>{c.name}</strong> <span style={{ float: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.grade}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredStudents.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.5rem 0.8rem 0.2rem 0.8rem' }}>Students</div>
                      {filteredStudents.map(s => {
                        const sClass = classes.find(c => c.name === s.class);
                        return (
                          <div 
                            key={s.id} 
                            className="search-item" 
                            style={{ padding: '0.6rem 0.8rem', cursor: 'pointer', transition: 'background 0.2s', fontSize: '0.9rem', borderRadius: '6px' }}
                            onClick={() => {
                              if (sClass) {
                                navigate(`/classes/${sClass.id}`);
                              } else {
                                navigate('/students');
                              }
                              setSearchVal('');
                            }}
                          >
                            <strong>{s.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.class || 'No Class'}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Theme Switcher Button */}
        <div onClick={toggleTheme} title="Toggle Theme" style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          {theme === 'light' ? <Moon size={18} color="var(--text-main)" /> : <Sun size={18} color="var(--text-main)" />}
        </div>

        {/* Notifications Icon and Dropdown */}
        <div ref={notifRef} style={{ position: 'relative', cursor: 'pointer' }} className="flex-center" onClick={() => setShowNotifications(!showNotifications)} title="Notifications">
          <Bell size={20} color="var(--text-main)" />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: 'var(--danger)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            border: '2px solid var(--bg-main)'
          }}></span>

          {showNotifications && (
            <div className="prof-card" style={{
              position: 'absolute',
              top: '130%',
              right: 0,
              width: '280px',
              zIndex: 1000,
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-glass)',
              borderRadius: '12px',
              padding: '0.5rem'
            }}>
              <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.9rem' }}>Recent Notifications</div>
              <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', cursor: 'default' }}>
                <strong style={{ color: 'var(--primary-text)' }}>Attendance sheet alert</strong>
                <div style={{ color: 'var(--text-muted)', marginTop: '0.1rem' }}>Today's attendance has been marked.</div>
              </div>
              <div style={{ padding: '0.6rem 0.8rem', fontSize: '0.8rem', cursor: 'default' }}>
                <strong style={{ color: 'var(--primary-text)' }}>System alert</strong>
                <div style={{ color: 'var(--text-muted)', marginTop: '0.1rem' }}>Local dev database version 1.0.7 verified.</div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Details and Dropdown */}
        <div ref={profileRef} className="flex-center gap-1" style={{ position: 'relative', cursor: 'pointer', marginLeft: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }} onClick={() => setShowProfileMenu(!showProfileMenu)} title="Account Settings">
          <UserCircle size={32} color="var(--primary-text)" style={{ opacity: 0.8 }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>{userRole}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Online</span>
          </div>

          {showProfileMenu && (
            <div className="prof-card" style={{
              position: 'absolute',
              top: '120%',
              right: 0,
              width: '180px',
              zIndex: 1000,
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-glass)',
              borderRadius: '12px',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}>
              <div 
                className="search-item" 
                style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                onClick={() => navigate('/settings')}
              >
                Settings Panel
              </div>
              <div 
                className="search-item" 
                style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem', borderRadius: '6px', cursor: 'pointer', color: 'var(--danger)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                onClick={logout}
              >
                Logout / Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
