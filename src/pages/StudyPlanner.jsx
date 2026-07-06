import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Calendar, Plus, Sparkles, CheckCircle2, Circle, Trash2, Clock, BookOpen, AlertCircle } from 'lucide-react';

const StudyPlanner = () => {
  const { authToken } = useContext(AppContext);
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(45);
  const [subject, setSubject] = useState('Mathematics');
  const [loading, setLoading] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    fetchPlanner();
  }, []);

  const fetchPlanner = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/study-planner', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    try {
      const response = await fetch('http://localhost:5000/api/study-planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title,
          date,
          time,
          duration_minutes: parseInt(duration),
          subject
        })
      });

      if (response.ok) {
        setTitle('');
        setDate('');
        setTime('');
        setAddingTask(false);
        fetchPlanner();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComplete = async (event) => {
    const nextStatus = event.completed === 1 ? 0 : 1;
    try {
      const response = await fetch(`http://localhost:5000/api/study-planner/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ completed: nextStatus })
      });
      if (response.ok) {
        fetchPlanner();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (eventId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this event?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/study-planner/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        fetchPlanner();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiAutoSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/study-planner/generate-ai', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        fetchPlanner();
        alert("🎉 Gemini has successfully generated a visual study schedule based on your syllabus progress! +50 XP");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group events by date for a premium visual list/calendar
  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <>
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', background: 'var(--bg-main)', minHeight: '100vh' }}>
        <Header />

        {/* Page Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary-text)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>AI Study Planner</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Plan your milestones manually or trigger Gemini to create a weekly routine.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={handleAiAutoSchedule}
              disabled={loading}
              className="prof-btn"
              style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c62f3, #3b82f6)' }}
            >
              <Sparkles size={16} /> {loading ? 'Planning...' : 'AI Auto-Schedule'}
            </button>
            <button 
              onClick={() => setAddingTask(true)} 
              className="prof-btn" 
              style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', background: 'var(--secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              <Plus size={16} /> Add Task
            </button>
          </div>
        </div>

        {/* Content Layout Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem', alignItems: 'stretch' }}>
          
          {/* Left Column: Visual Calendar Roster */}
          <div className="prof-card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', minHeight: '400px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={18} style={{ color: 'var(--primary-text)' }} /> Calendar Schedule
            </h3>

            {sortedDates.map(dateKey => (
              <div key={dateKey} style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-text)', background: 'rgba(124,98,243,0.08)', padding: '0.35rem 0.75rem', borderRadius: '8px', display: 'inline-block', marginBottom: '0.75rem' }}>
                  {new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {groupedEvents[dateKey].map(event => (
                    <div 
                      key={event.id}
                      onClick={() => handleToggleComplete(event)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '1rem 1.25rem', 
                        borderRadius: '14px', 
                        border: '1px solid var(--border-color)',
                        background: event.completed === 1 ? 'rgba(34,197,94,0.02)' : 'rgba(255,255,255,0.01)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: event.completed === 1 ? 0.7 : 1
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--primary-text)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.background = event.completed === 1 ? 'rgba(34,197,94,0.02)' : 'rgba(255,255,255,0.01)';
                      }}
                    >
                      {/* Complete Checkbox */}
                      <div style={{ marginRight: '1rem', color: event.completed === 1 ? '#22c55e' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        {event.completed === 1 ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </div>

                      {/* Event Details */}
                      <div style={{ flex: 1 }}>
                        <span style={{ 
                          fontSize: '0.9rem', 
                          fontWeight: 700, 
                          color: 'var(--text-main)',
                          textDecoration: event.completed === 1 ? 'line-through' : 'none'
                        }}>
                          {event.title}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {event.time || 'All Day'} ({event.duration_minutes} min)
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <BookOpen size={12} /> {event.subject || 'General'}
                          </span>
                          {event.created_by === 'ai' && (
                            <span style={{ color: 'var(--primary-text)', background: 'rgba(124,98,243,0.1)', padding: '0 0.35rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                              AI Scheduled
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Trash action */}
                      <button
                        onClick={(e) => handleDeleteTask(event.id, e)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: 'var(--text-muted)', textAlign: 'center' }}>
                <AlertCircle size={36} style={{ strokeWidth: 1.5, marginBottom: '0.75rem', color: 'var(--text-muted)' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>Schedule Empty</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Add a task manually or click the **AI Auto-Schedule** button to have Gemini set up your week.</p>
              </div>
            )}
          </div>

          {/* Right Column: Planner Metrics & Task checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* XP and Badges Summary */}
            <div className="prof-card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 1rem 0' }}>Planner Progress</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tasks Completed</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                    {events.filter(e => e.completed === 1).length} / {events.length}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Schedule Completion</span>
                  <span style={{ color: '#22c55e', fontWeight: 800 }}>
                    {events.length > 0 ? `${Math.round((events.filter(e => e.completed === 1).length / events.length) * 100)}%` : '0%'}
                  </span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reward rate</span>
                  <span style={{ color: 'var(--primary-text)', fontWeight: 700 }}>
                    +30 XP per task!
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist Box */}
            <div className="prof-card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 1rem 0' }}>Active To-Dos</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', maxHeight: '250px' }}>
                {events.filter(e => e.completed === 0).map(todo => (
                  <div 
                    key={todo.id}
                    onClick={() => handleToggleComplete(todo)}
                    style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Circle size={15} style={{ marginRight: '0.5rem', color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {todo.title}
                    </span>
                  </div>
                ))}

                {events.filter(e => e.completed === 0).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    No pending tasks!
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Add Task Modal */}
        {addingTask && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="prof-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)', background: 'var(--bg-main)', animation: 'slideUp 0.3s' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 1.25rem 0' }}>Add Study Event</h3>
              
              <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Event Title</label>
                  <input
                    type="text" required placeholder="e.g. Read Mechanics chapter"
                    value={title} onChange={e => setTitle(e.target.value)}
                    className="prof-input" style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Date</label>
                    <input
                      type="date" required
                      value={date} onChange={e => setDate(e.target.value)}
                      className="prof-input" style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', color: 'var(--text-main)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Time</label>
                    <input
                      type="time"
                      value={time} onChange={e => setTime(e.target.value)}
                      className="prof-input" style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Subject</label>
                    <select
                      value={subject} onChange={e => setSubject(e.target.value)}
                      className="prof-input" style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', color: 'var(--text-main)', background: 'var(--secondary)' }}
                    >
                      <option>Mathematics</option>
                      <option>Physics</option>
                      <option>Chemistry</option>
                      <option>Biology</option>
                      <option>English</option>
                      <option>Computer Science</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Duration (min)</label>
                    <input
                      type="number" required min="5" max="240"
                      value={duration} onChange={e => setDuration(parseInt(e.target.value))}
                      className="prof-input" style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setAddingTask(false)}
                    style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="prof-btn"
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', fontSize: '0.8rem' }}
                  >
                    Add Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </>
  );
};

export default StudyPlanner;
