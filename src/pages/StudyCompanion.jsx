import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Send, Sparkles, GraduationCap, Compass, BookOpen, AlertCircle } from 'lucide-react';

const StudyCompanion = () => {
  const { authToken } = useContext(AppContext);
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];

  const promptsBySubject = {
    Mathematics: [
      'Explain the quadratic formula step-by-step.',
      'Give me a practice question on integration.',
      'How do I calculate compound interest?'
    ],
    Physics: [
      'Explain Newton\'s second law with an example.',
      'What is electromagnetic induction?',
      'Solve a simple velocity-acceleration problem.'
    ],
    Chemistry: [
      'What is the difference between covalent and ionic bonds?',
      'Explain the periodic table trends (electronegativity).',
      'Balance this equation: H2 + O2 -> H2O'
    ],
    Biology: [
      'Explain the process of photosynthesis.',
      'What is DNA replication?',
      'Briefly explain the human circulatory system.'
    ],
    English: [
      'Explain the difference between active and passive voice.',
      'Give me examples of metaphors vs. similes.',
      'When do I use "whose" vs. "who\'s"?'
    ],
    'Computer Science': [
      'Explain recursion simply with a code example.',
      'What is the difference between stacks and queues?',
      'How does binary search work?'
    ]
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  // Reset chat history when subject changes to avoid cross-subject confusion
  useEffect(() => {
    setChatHistory([
      {
        id: 'initial',
        sender: 'bot',
        text: `Hello! I am your Aarambh AI Study Tutor for **${selectedSubject}**.\n\nAsk me any questions, request concept explanations, or ask for a practice problem! I'll guide you step-by-step.`
      }
    ]);
  }, [selectedSubject]);

  const handleAsk = async (customQuestionText = '') => {
    const activeQuestion = customQuestionText || question;
    if (!activeQuestion.trim()) return;

    if (!customQuestionText) {
      setQuestion('');
    }

    const userMessage = { id: Date.now(), sender: 'user', text: activeQuestion };
    setChatHistory(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/study-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          subject: selectedSubject,
          question: activeQuestion,
          history: chatHistory.slice(1) // omit the initial prompt greeting to save history tokens
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: data.text }]);
      } else {
        const errData = await response.json();
        setChatHistory(prev => [...prev, { 
          id: Date.now() + 1, 
          sender: 'bot', 
          text: `⚠️ **Error:** ${errData.error || 'Failed to generate response. Please try again.'}` 
        }]);
      }
    } catch (e) {
      setChatHistory(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: `⚠️ **Connection Error:** Could not reach the AI server. Make sure the backend server is running.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary-text)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)'
          }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>AI Study Tutor</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Your personal step-by-step academic learning assistant.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem', flex: 1, alignItems: 'stretch' }}>
          
          {/* Left Column: Subject Selection & Shortcuts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Subject Card */}
            <div className="prof-card" style={{ padding: '1.2rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={16} /> Choose Subject
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {subjects.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    style={{
                      width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)',
                      background: selectedSubject === sub ? 'var(--primary-text)' : 'transparent',
                      color: selectedSubject === sub ? 'white' : 'var(--text-main)',
                      textAlign: 'left', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                      transition: 'all 0.2s', fontSize: '0.85rem'
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Shortcuts */}
            <div className="prof-card" style={{ padding: '1.2rem', flex: 1 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={16} /> Suggested Prompts
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {promptsBySubject[selectedSubject]?.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAsk(p)}
                    disabled={loading}
                    style={{
                      width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)',
                      background: 'var(--secondary)', color: 'var(--text-muted)', fontSize: '0.75rem',
                      textAlign: 'left', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                      lineHeight: '1.4', fontWeight: 500
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--primary-text)';
                      e.currentTarget.style.color = 'var(--text-main)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Chat interface */}
          <div className="prof-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            {/* Subject Title Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: 'var(--primary-text)' }} />
                <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{selectedSubject} AI Tutor Room</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} /> Step-by-Step Learning Mode
              </div>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem', minHeight: '350px', maxHeight: '55vh' }}>
              {chatHistory.map(msg => (
                <div key={msg.id} style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? 'var(--primary-text)' : 'var(--secondary)',
                  color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                  padding: '1rem 1.25rem', borderRadius: '12px',
                  borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                  borderBottomLeftRadius: msg.sender === 'bot' ? '2px' : '12px',
                  maxWidth: '85%', fontSize: '0.9rem', lineHeight: '1.5',
                  whiteSpace: 'pre-wrap', border: msg.sender === 'bot' ? '1px solid var(--border-color)' : 'none',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', background: 'var(--secondary)', color: 'var(--text-main)', padding: '1rem 1.25rem', borderRadius: '12px', borderBottomLeftRadius: '2px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                  <div style={{ width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.2s' }} />
                  <div style={{ width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.4s' }} />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={e => { e.preventDefault(); handleAsk(); }} style={{ padding: '1.2rem', borderTop: '1px solid var(--border-color)', background: 'var(--secondary)', display: 'flex', gap: '0.8rem' }}>
              <input
                type="text"
                placeholder={`Ask a question about ${selectedSubject}...`}
                value={question}
                onChange={e => setQuestion(e.target.value)}
                disabled={loading}
                className="prof-input"
                style={{ flex: 1, padding: '0.75rem 1.25rem', fontSize: '0.9rem', borderRadius: '30px' }}
              />
              <button 
                type="submit" 
                disabled={loading || !question.trim()}
                className="prof-btn"
                style={{ width: '45px', height: '45px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}
              >
                <Send size={18} style={{ marginLeft: '2px' }} />
              </button>
            </form>

          </div>

        </div>

      </main>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </>
  );
};

export default StudyCompanion;
