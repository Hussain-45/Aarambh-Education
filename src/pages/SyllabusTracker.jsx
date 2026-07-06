import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Plus, Trash2, CheckCircle2, Circle, HelpCircle, BookOpen, Layers } from 'lucide-react';

const SyllabusTracker = () => {
  const { userRole, syllabus, addSyllabusTopic, updateSyllabusTopicStatus, deleteSyllabusTopic, classes } = useContext(AppContext);
  const [selectedBatch, setSelectedBatch] = useState(classes[0]?.name || 'All');
  const [newTopicName, setNewTopicName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newClass, setNewClass] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Subjects list we want to support by default or user-defined
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];

  // Filter syllabus by target class/batch
  const filteredSyllabus = syllabus.filter(item => 
    selectedBatch === 'All' || item.class_name === selectedBatch || item.class_name === 'All'
  );

  // Group syllabus items by subject
  const syllabusBySubject = filteredSyllabus.reduce((acc, item) => {
    if (!acc[item.subject]) {
      acc[item.subject] = [];
    }
    acc[item.subject].push(item);
    return acc;
  }, {});

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName || !newSubject || !newClass) {
      alert('Please fill out all fields.');
      return;
    }
    const success = await addSyllabusTopic(newClass, newSubject, newTopicName);
    if (success) {
      setNewTopicName('');
      setNewSubject('');
      setNewClass('');
      setShowAddForm(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return 'badge-success';
      case 'In Progress': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />;
      case 'In Progress': return <Circle size={16} style={{ color: 'var(--warning)' }} />;
      default: return <HelpCircle size={16} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <>
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', background: 'var(--bg-main)', minHeight: '100vh' }}>
        <Header />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Syllabus & Lesson Progress</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
              Track the learning roadmap, check completion metrics, and manage lecture status.
            </p>
          </div>
          {userRole !== 'student' && (
            <button onClick={() => setShowAddForm(!showAddForm)} className="prof-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={16} /> Add Lesson Topic
            </button>
          )}
        </div>

        {/* Add Topic Form */}
        {showAddForm && (
          <div className="prof-card" style={{ marginBottom: '2rem', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1.2rem 0' }}>Add Syllabus Lesson Item</h3>
            <form onSubmit={handleAddTopic} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Class / Batch Name:</label>
                  <select
                    value={newClass}
                    onChange={e => setNewClass(e.target.value)}
                    className="prof-input"
                    required
                  >
                    <option value="">Select Batch</option>
                    <option value="All">All Batches</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Subject:</label>
                  <select
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="prof-input"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Topic Name / Lesson Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4: Quadratic Equations"
                  value={newTopicName}
                  onChange={e => setNewTopicName(e.target.value)}
                  className="prof-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddForm(false)} className="prof-btn prof-btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  Cancel
                </button>
                <button type="submit" className="prof-btn" style={{ padding: '0.5rem 1.5rem' }}>
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Batch Bar */}
        <div className="prof-card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: 'var(--primary-text)' }} />
            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>Select Batch Tracker:</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setSelectedBatch('All')}
              className="prof-btn"
              style={{
                background: selectedBatch === 'All' ? 'var(--primary-text)' : 'transparent',
                color: selectedBatch === 'All' ? 'white' : 'var(--text-main)',
                border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem', fontSize: '0.85rem'
              }}
            >
              All Batches
            </button>
            {classes.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedBatch(c.name)}
                className="prof-btn"
                style={{
                  background: selectedBatch === c.name ? 'var(--primary-text)' : 'transparent',
                  color: selectedBatch === c.name ? 'white' : 'var(--text-main)',
                  border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem', fontSize: '0.85rem'
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Syllabus Roadmap Render */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.keys(syllabusBySubject).map(subj => {
            const items = syllabusBySubject[subj];
            const completedCount = items.filter(i => i.status === 'Completed').length;
            const pct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

            return (
              <div key={subj} className="prof-card" style={{ padding: '1.5rem' }}>
                
                {/* Subject Header + Progress Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '8px', background: 'var(--secondary)', color: 'var(--primary-text)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{subj}</h2>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{completedCount} of {items.length} lessons completed</span>
                    </div>
                  </div>

                  {/* Custom Progress Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', width: '240px' }}>
                    <div style={{ flex: 1, height: '10px', background: 'var(--secondary)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '5px', transition: 'width 0.5s ease-in-out' }} />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)' }}>{pct}%</span>
                  </div>
                </div>

                {/* Topics Table List */}
                <div style={{ overflowX: 'auto' }}>
                  <table className="prof-table">
                    <thead>
                      <tr>
                        <th style={{ width: '45%' }}>Topic Name / Chapter</th>
                        <th>Status</th>
                        <th>Target Batch</th>
                        <th>Last Updated</th>
                        {userRole !== 'student' && <th style={{ textAlign: 'right' }}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {getStatusIcon(item.status)}
                            <span>{item.topic_name}</span>
                          </td>
                          <td>
                            {userRole === 'student' ? (
                              <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                                {item.status}
                              </span>
                            ) : (
                              <select
                                value={item.status}
                                onChange={e => updateSyllabusTopicStatus(item.id, e.target.value)}
                                className={`badge ${getStatusBadgeClass(item.status)}`}
                                style={{
                                  border: 'none', padding: '0.3rem 0.5rem', cursor: 'pointer', outline: 'none',
                                  fontSize: '0.8rem', fontWeight: 700, borderRadius: '4px', webkitAppearance: 'none'
                                }}
                              >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-primary">{item.class_name}</span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(item.updated_at).toLocaleDateString()}
                          </td>
                          {userRole !== 'student' && (
                            <td style={{ textAlign: 'right' }}>
                              <button 
                                onClick={() => { if(window.confirm('Delete this lesson topic?')) deleteSyllabusTopic(item.id); }} 
                                className="prof-btn prof-btn-secondary" 
                                style={{ padding: '0.3rem 0.5rem', color: 'var(--danger)', border: 'none' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            );
          })}

          {Object.keys(syllabusBySubject).length === 0 && (
            <div className="prof-card" style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
              <Layers size={48} style={{ opacity: 0.5, marginBottom: '1.5rem' }} />
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>No Lesson Tracker Roadmaps</h3>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>
                There are no syllabus items configured for the selected batch.
              </p>
            </div>
          )}
        </div>

      </main>
    </>
  );
};

export default SyllabusTracker;
