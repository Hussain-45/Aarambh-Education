import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Messages = () => {
  const { messages, students, classes, sendMessage } = useContext(AppContext);
  const [sendType, setSendType] = useState('student'); // 'student', 'batch', 'manual'
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('SMS');

  const handleManualSend = (e) => {
    e.preventDefault();
    if (!content) return;

    if (sendType === 'student') {
      const student = students.find(s => s.id === parseInt(selectedStudent));
      if (student && student.parentPhone) {
        sendMessage(student.parentPhone, channel, content);
      }
    } else if (sendType === 'batch') {
      const batchClass = classes.find(c => c.id === parseInt(selectedBatch));
      if (batchClass) {
        const batchStudents = students.filter(s => s.class === batchClass.name);
        if (batchStudents.length === 0) {
          alert('No students found in this batch.');
          return;
        }
        batchStudents.forEach(student => {
          if (student.parentPhone) {
            sendMessage(student.parentPhone, channel, content);
          }
        });
      }
    } else {
      if (manualPhone) {
        sendMessage(manualPhone, channel, content);
      }
    }

    // Reset fields
    setSelectedStudent('');
    setSelectedBatch('');
    setManualPhone('');
    setContent('');
  };

  return (
    <>
      <Sidebar />
      <main className="main-content">
        <Header />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          <div className="prof-card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', marginTop: 0 }}>Compose Message</h2>
            <form onSubmit={handleManualSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label className="prof-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Send To</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input type="radio" checked={sendType === 'student'} onChange={() => setSendType('student')} />
                    Student
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input type="radio" checked={sendType === 'batch'} onChange={() => setSendType('batch')} />
                    Batch
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input type="radio" checked={sendType === 'manual'} onChange={() => setSendType('manual')} />
                    Manual Number
                  </label>
                </div>
              </div>

              {sendType === 'student' && (
                <div>
                  <label className="prof-label">Select Student</label>
                  <select 
                    value={selectedStudent} 
                    onChange={e => setSelectedStudent(e.target.value)}
                    className="prof-input"
                    required
                  >
                    <option value="">-- Select Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.class || 'No Class'}) - {s.parentPhone}</option>
                    ))}
                  </select>
                </div>
              )}

              {sendType === 'batch' && (
                <div>
                  <label className="prof-label">Select Batch</label>
                  <select 
                    value={selectedBatch} 
                    onChange={e => setSelectedBatch(e.target.value)}
                    className="prof-input"
                    required
                  >
                    <option value="">-- Select Batch --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>
                    ))}
                  </select>
                </div>
              )}

              {sendType === 'manual' && (
                <div>
                  <label className="prof-label">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="Recipient Phone Number (e.g. 9876543210)" 
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    required
                    className="prof-input"
                  />
                </div>
              )}

              <div>
                <label className="prof-label">Messaging Service</label>
                <select 
                  value={channel} 
                  onChange={e => setChannel(e.target.value)}
                  className="prof-input"
                  required
                >
                  <option value="SMS">Cellular SMS (Twilio/TextBelt)</option>
                  <option value="Auto-WhatsApp">Auto-WhatsApp Robot</option>
                </select>
              </div>

              <div>
                <label className="prof-label">Message Content</label>
                <textarea 
                  placeholder="Type your message here..." 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows="5"
                  className="prof-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="prof-btn" style={{ alignSelf: 'flex-start' }}>Send Message</button>
            </form>
          </div>

          <div className="prof-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '600px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', marginTop: 0 }}>Message Logs</h2>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
              {messages.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No messages sent yet.</p>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} style={{ 
                    padding: '1rem', background: 'var(--bg-main)', 
                    border: '1px solid var(--border-color)', borderRadius: '8px',
                    borderLeft: '4px solid var(--primary)'
                  }}>
                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>To: {msg.recipient}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{msg.date}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>{msg.content}</p>
                    
                    <div className="flex-between" style={{ marginTop: '0.8rem' }}>
                      <div style={{ fontSize: '0.8rem', color: msg.status === 'Failed' ? 'var(--danger)' : 'var(--success)', fontWeight: 500 }}>
                        Status: {msg.status}
                        {msg.previewUrl && (
                          <a href={msg.previewUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '10px', color: 'var(--primary)', textDecoration: 'underline' }}>
                            View Delivered Message
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Messages;
