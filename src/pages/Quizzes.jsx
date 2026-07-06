import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Timer, BookOpen, Plus, Trash2, Award, CheckCircle, Inbox, AlertCircle, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';

const Quizzes = () => {
  const { userRole, loggedInUser, quizzes, quizAttempts, createQuiz, submitQuizAnswers, deleteQuiz, classes } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState(userRole === 'student' ? 'available' : 'quizzes'); // 'available' / 'attempts' or 'quizzes' / 'results'

  // Quiz creation form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('');
  const [quizClass, setQuizClass] = useState('');
  const [quizDuration, setQuizDuration] = useState(30);
  const [questions, setQuestions] = useState([
    { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }
  ]);

  // Active quiz taking state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // Load questions for active quiz
  const startQuiz = async (quiz) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/quizzes/${quiz.id}/questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          alert('This quiz has no questions.');
          return;
        }
        setActiveQuestions(data);
        setActiveQuiz(quiz);
        setCurrentQuestionIdx(0);
        setStudentAnswers({});
        setTimeLeft(quiz.duration_minutes * 60);
      } else {
        alert('Failed to load quiz questions.');
      }
    } catch (e) {
      alert('Error connecting to server.');
    }
  };

  // Timer countdown
  useEffect(() => {
    if (activeQuiz && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (activeQuiz && timeLeft === 0) {
      // Auto-submit when time is up
      alert("Time is up! Your answers are being submitted automatically.");
      handleQuizSubmit(true);
    }
    return () => clearTimeout(timerRef.current);
  }, [activeQuiz, timeLeft]);

  const handleSelectOption = (questionId, option) => {
    setStudentAnswers(prev => ({
      ...prev,
      [questionId.toString()]: option
    }));
  };

  const handleQuizSubmit = async (forced = false) => {
    if (!forced) {
      const confirmSubmit = window.confirm('Are you sure you want to submit your answers?');
      if (!confirmSubmit) return;
    }
    clearTimeout(timerRef.current);
    const result = await submitQuizAnswers(activeQuiz.id, studentAnswers);
    if (result) {
      setActiveQuiz(null);
      setActiveQuestions([]);
      setActiveTab('attempts');
    }
  };

  const handleAddQuestionField = () => {
    setQuestions(prev => [
      ...prev,
      { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }
    ]);
  };

  const handleRemoveQuestionField = (idx) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const handleCreateQuizSubmit = async (e) => {
    e.preventDefault();
    if (!quizTitle || !quizSubject || !quizClass || !quizDuration) {
      alert('Please fill out all fields.');
      return;
    }

    // Basic questions validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.optionA || !q.optionB || !q.optionC || !q.optionD) {
        alert(`Please fill out all options for question #${i + 1}`);
        return;
      }
    }

    const payload = {
      title: quizTitle,
      subject: quizSubject,
      className: quizClass,
      durationMinutes: parseInt(quizDuration),
      questions
    };

    const success = await createQuiz(payload);
    if (success) {
      setShowCreateModal(false);
      setQuizTitle('');
      setQuizSubject('');
      setQuizClass('');
      setQuizDuration(30);
      setQuestions([{ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }]);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter available quizzes (student hasn't attempted these yet)
  const studentAttemptsIds = quizAttempts.map(a => a.quizId);
  const studentClass = loggedInUser?.class || 'General';
  const availableQuizzes = quizzes.filter(q => 
    (q.class_name === studentClass || q.class_name === 'All') &&
    !studentAttemptsIds.includes(q.id)
  );

  return (
    <>
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', background: 'var(--bg-main)', minHeight: '100vh' }}>
        <Header />

        {activeQuiz ? (
          /* Active Quiz Environment Screen */
          <div className="prof-card" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>{activeQuiz.subject}</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.4rem 0 0 0', color: 'var(--text-main)' }}>{activeQuiz.title}</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.1)' : 'var(--secondary)', padding: '0.6rem 1.2rem', borderRadius: '30px', color: timeLeft < 60 ? 'var(--danger)' : 'var(--text-main)', border: timeLeft < 60 ? '1px solid var(--danger)' : '1px solid var(--border-color)', fontWeight: 700 }}>
                <Timer size={18} />
                <span style={{ fontSize: '1.1rem', fontFamily: 'monospace' }}>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Question Card */}
            <div style={{ minHeight: '260px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Question {currentQuestionIdx + 1} of {activeQuestions.length}</span>
              </div>
              
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '1.5rem', lineHeight: '1.5' }}>
                {activeQuestions[currentQuestionIdx]?.questionText}
              </h3>

              {/* Options list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['A', 'B', 'C', 'D'].map(opt => {
                  const optText = activeQuestions[currentQuestionIdx]?.[`option${opt}`];
                  const qId = activeQuestions[currentQuestionIdx]?.id;
                  const isSelected = studentAnswers[qId?.toString()] === opt;

                  return (
                    <label 
                      key={opt}
                      onClick={() => handleSelectOption(qId, opt)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                        background: isSelected ? 'var(--secondary)' : 'transparent',
                        border: isSelected ? '1px solid var(--primary-text)' : '1px solid var(--border-color)',
                        borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                        color: isSelected ? 'var(--primary-text)' : 'var(--text-main)', fontWeight: isSelected ? 600 : 500
                      }}
                    >
                      <input 
                        type="radio" 
                        name={`question-${qId}`}
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ display: 'none' }}
                      />
                      <div style={{ 
                        width: '24px', height: '24px', borderRadius: '50%', border: isSelected ? '6px solid var(--primary-text)' : '2px solid var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0, transition: 'all 0.2s'
                      }} />
                      <span>{optText}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button 
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                className="prof-btn prof-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem' }}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {currentQuestionIdx < activeQuestions.length - 1 ? (
                <button 
                  onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                  className="prof-btn prof-btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={() => handleQuizSubmit(false)}
                  className="prof-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1.5rem', background: 'var(--success)', border: 'none' }}
                >
                  Submit Exam
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Normal Quiz List Dashboard Screen */
          <div style={{ width: '100%' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Online Quizzes & Exams</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                  Test your skills, practice mock exams, and review your performance history.
                </p>
              </div>
              {userRole !== 'student' && (
                <button onClick={() => setShowCreateModal(true)} className="prof-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={16} /> Create Mock Quiz
                </button>
              )}
            </div>

            {/* Student tabs vs. teacher tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              {userRole === 'student' ? (
                <>
                  <button 
                    onClick={() => setActiveTab('available')}
                    className={`prof-tab-btn ${activeTab === 'available' ? 'active' : ''}`}
                    style={{
                      padding: '0.75rem 1.5rem', background: 'transparent', border: 'none',
                      borderBottom: activeTab === 'available' ? '3px solid var(--primary-text)' : '3px solid transparent',
                      color: activeTab === 'available' ? 'var(--primary-text)' : 'var(--text-muted)',
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s'
                    }}
                  >
                    Available Tests ({availableQuizzes.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('attempts')}
                    style={{
                      padding: '0.75rem 1.5rem', background: 'transparent', border: 'none',
                      borderBottom: activeTab === 'attempts' ? '3px solid var(--primary-text)' : '3px solid transparent',
                      color: activeTab === 'attempts' ? 'var(--primary-text)' : 'var(--text-muted)',
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s'
                    }}
                  >
                    Attempt History ({quizAttempts.length})
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setActiveTab('quizzes')}
                    style={{
                      padding: '0.75rem 1.5rem', background: 'transparent', border: 'none',
                      borderBottom: activeTab === 'quizzes' ? '3px solid var(--primary-text)' : '3px solid transparent',
                      color: activeTab === 'quizzes' ? 'var(--primary-text)' : 'var(--text-muted)',
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s'
                    }}
                  >
                    Manage Quizzes ({quizzes.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('results')}
                    style={{
                      padding: '0.75rem 1.5rem', background: 'transparent', border: 'none',
                      borderBottom: activeTab === 'results' ? '3px solid var(--primary-text)' : '3px solid transparent',
                      color: activeTab === 'results' ? 'var(--primary-text)' : 'var(--text-muted)',
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s'
                    }}
                  >
                    Student Results ({quizAttempts.length})
                  </button>
                </>
              )}
            </div>

            {/* Tab content */}
            {activeTab === 'available' && (
              <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {availableQuizzes.map(q => (
                  <div key={q.id} className="prof-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px' }}>
                    <div>
                      <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                        <span className="badge badge-primary">{q.subject}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Timer size={14} /> {q.duration_minutes} mins
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--text-main)' }}>{q.title}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
                        <Calendar size={12} /> Assigned for: {q.class_name}
                      </div>
                    </div>
                    <button onClick={() => startQuiz(q)} className="prof-btn" style={{ width: '100%', marginTop: '1.2rem', padding: '0.5rem' }}>
                      Start Mock Test
                    </button>
                  </div>
                ))}
                {availableQuizzes.length === 0 && (
                  <div className="prof-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                    <Inbox size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>All caught up!</h3>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>No pending quizzes assigned to your batch.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'attempts' && (
              <div className="prof-card">
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} style={{ color: 'var(--primary-text)' }} /> My Attempts history
                </h2>
                <div style={{ overflowX: 'auto' }}>
                  <table className="prof-table">
                    <thead>
                      <tr>
                        <th>Quiz Name</th>
                        <th>Subject</th>
                        <th>Attempt Date</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizAttempts.map(qa => {
                        const pct = Math.round((qa.score / qa.totalQuestions) * 100);
                        const passed = pct >= 40;
                        return (
                          <tr key={qa.id}>
                            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{qa.quizTitle}</td>
                            <td>{qa.quizSubject}</td>
                            <td>{new Date(qa.attemptDate).toLocaleDateString()}</td>
                            <td style={{ fontWeight: 700 }}>{qa.score} / {qa.totalQuestions}</td>
                            <td style={{ fontWeight: 700, color: passed ? 'var(--success)' : 'var(--danger)' }}>{pct}%</td>
                            <td>
                              <span className={`badge badge-${passed ? 'success' : 'danger'}`}>
                                {passed ? 'Passed' : 'Failed'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {quizAttempts.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                            You have not attempted any quizzes yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div className="prof-card">
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1.5rem 0' }}>Manage Created Quizzes</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table className="prof-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Subject</th>
                        <th>Target Batch</th>
                        <th>Duration</th>
                        <th>Created At</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizzes.map(q => (
                        <tr key={q.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{q.title}</td>
                          <td>{q.subject}</td>
                          <td>
                            <span className="badge badge-primary">{q.class_name}</span>
                          </td>
                          <td>{q.duration_minutes} mins</td>
                          <td>{new Date(q.created_at).toLocaleDateString()}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button onClick={() => { if(window.confirm('Delete this quiz?')) deleteQuiz(q.id); }} className="prof-btn prof-btn-secondary" style={{ padding: '0.35rem 0.6rem', color: 'var(--danger)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {quizzes.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                            No quizzes created yet. Click "Create Mock Quiz" to build one!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="prof-card">
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1.5rem 0' }}>Student Mock Test Performance Reports</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table className="prof-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Batch</th>
                        <th>Quiz Name</th>
                        <th>Subject</th>
                        <th>Attempt Date</th>
                        <th>Score</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizAttempts.map(qa => {
                        const pct = Math.round((qa.score / qa.totalQuestions) * 100);
                        return (
                          <tr key={qa.id}>
                            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{qa.studentName || `Student ID: ${qa.studentId}`}</td>
                            <td>{qa.studentClass || 'N/A'}</td>
                            <td>{qa.quizTitle}</td>
                            <td>{qa.quizSubject}</td>
                            <td>{new Date(qa.attemptDate).toLocaleDateString()}</td>
                            <td style={{ fontWeight: 700 }}>{qa.score} / {qa.totalQuestions}</td>
                            <td style={{ fontWeight: 700, color: pct >= 40 ? 'var(--success)' : 'var(--danger)' }}>{pct}%</td>
                          </tr>
                        );
                      })}
                      {quizAttempts.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                            No student test attempt submissions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Create Quiz Modal Form */}
        {showCreateModal && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, overflowY: 'auto', padding: '2rem 1rem' }}>
            <div className="prof-card" style={{ maxWidth: '700px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Create Mock Quiz</h2>
                <button onClick={() => setShowCreateModal(false)} className="prof-btn prof-btn-secondary" style={{ padding: '0.2rem 0.6rem' }}>X</button>
              </div>

              <form onSubmit={handleCreateQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quiz Title:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Algebra Mock Test"
                      value={quizTitle}
                      onChange={e => setQuizTitle(e.target.value)}
                      className="prof-input"
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Subject:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mathematics"
                      value={quizSubject}
                      onChange={e => setQuizSubject(e.target.value)}
                      className="prof-input"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Class/Batch:</label>
                    <select
                      value={quizClass}
                      onChange={e => setQuizClass(e.target.value)}
                      className="prof-input"
                      required
                    >
                      <option value="">Select Target Batch</option>
                      <option value="All">All Batches</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Duration (minutes):</label>
                    <input 
                      type="number" 
                      min="1"
                      value={quizDuration}
                      onChange={e => setQuizDuration(e.target.value)}
                      className="prof-input"
                      required
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                  <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Questions & Answers List</h3>
                    <button type="button" onClick={handleAddQuestionField} className="prof-btn prof-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      + Add Question
                    </button>
                  </div>

                  {questions.map((q, idx) => (
                    <div key={idx} style={{ background: 'var(--secondary)', padding: '1.2rem', borderRadius: '8px', marginBottom: '1.2rem', border: '1px solid var(--border-color)', position: 'relative' }}>
                      {questions.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveQuestionField(idx)}
                          style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.8rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Question #{idx + 1} Text:</label>
                        <input 
                          type="text" 
                          placeholder="What is the value of x in..."
                          value={q.questionText}
                          onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)}
                          className="prof-input"
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                        <input 
                          type="text" 
                          placeholder="Option A"
                          value={q.optionA}
                          onChange={e => handleQuestionChange(idx, 'optionA', e.target.value)}
                          className="prof-input"
                          style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="Option B"
                          value={q.optionB}
                          onChange={e => handleQuestionChange(idx, 'optionB', e.target.value)}
                          className="prof-input"
                          style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                        <input 
                          type="text" 
                          placeholder="Option C"
                          value={q.optionC}
                          onChange={e => handleQuestionChange(idx, 'optionC', e.target.value)}
                          className="prof-input"
                          style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="Option D"
                          value={q.optionD}
                          onChange={e => handleQuestionChange(idx, 'optionD', e.target.value)}
                          className="prof-input"
                          style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.6rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Correct Option Key:</label>
                        <select
                          value={q.correctOption}
                          onChange={e => handleQuestionChange(idx, 'correctOption', e.target.value)}
                          className="prof-input"
                          style={{ width: '80px', padding: '0.3rem' }}
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="prof-btn prof-btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="prof-btn">
                    Publish Quiz
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

export default Quizzes;
