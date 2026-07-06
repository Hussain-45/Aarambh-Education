import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { BookOpen, Sparkles, Plus, Trash2, ArrowLeft, CheckCircle2, AlertTriangle, ArrowRight, Brain } from 'lucide-react';

const Flashcards = () => {
  const { authToken } = useContext(AppContext);
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Spaced repetition counters
  const [reviewsDone, setReviewsDone] = useState(0);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/flashcards/decks', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDecks(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectDeck = async (deck) => {
    try {
      const response = await fetch(`http://localhost:5000/api/flashcards/decks/${deck.id}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCards(data);
        setSelectedDeck(deck);
        setCurrentCardIdx(0);
        setIsFlipped(false);
        setReviewsDone(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateDeck = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/flashcards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ topic: newTopic })
      });

      if (response.ok) {
        const data = await response.json();
        setNewTopic('');
        setShowCreateModal(false);
        fetchDecks();
        // Automatically load the newly created deck
        if (data.deckId) {
          handleSelectDeck({ id: data.deckId, title: newTopic });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeck = async (deckId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this deck?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/flashcards/decks/${deckId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        fetchDecks();
        if (selectedDeck && selectedDeck.id === deckId) {
          setSelectedDeck(null);
          setCards([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewCard = async (rating) => {
    if (cards.length === 0) return;
    const card = cards[currentCardIdx];

    try {
      const response = await fetch(`http://localhost:5000/api/flashcards/${card.id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ rating })
      });

      if (response.ok) {
        setReviewsDone(prev => prev + 1);
        setIsFlipped(false);
        setTimeout(() => {
          if (currentCardIdx < cards.length - 1) {
            setCurrentCardIdx(prev => prev + 1);
          } else {
            // Completed all cards in this review round
            alert(`🎉 Nice job! You reviewed all cards in this deck. +${reviewsDone * 15} XP!`);
            setSelectedDeck(null);
            setCards([]);
            fetchDecks();
          }
        }, 150);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', background: 'var(--bg-main)', minHeight: '100vh' }}>
        <Header />

        {/* 3D Flip Card Style rules injected dynamically */}
        <style dangerouslySetInnerHTML={{ __html: `
          .flip-card-container {
            perspective: 1000px;
            width: 100%;
            max-width: 480px;
            height: 280px;
            cursor: pointer;
            margin: 2rem auto;
          }
          .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            transform-style: preserve-3d;
          }
          .flip-card-container.flipped .flip-card-inner {
            transform: rotateY(180deg);
          }
          .flip-card-front, .flip-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            border-radius: 20px;
            border: 1px solid var(--border-color);
            box-shadow: var(--shadow-lg);
          }
          .flip-card-front {
            background: linear-gradient(135deg, rgba(124, 98, 243, 0.08), rgba(59, 130, 246, 0.08));
            color: var(--text-main);
          }
          .flip-card-back {
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
            color: var(--text-main);
            transform: rotateY(180deg);
          }
        ` }} />

        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary-text)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
              <Brain size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>AI Flashcards</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Boost your memory using smart spaced-repetition cards powered by Gemini.</p>
            </div>
          </div>
          {!selectedDeck && (
            <button onClick={() => setShowCreateModal(true)} className="prof-btn" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}>
              <Plus size={16} /> Generate AI Deck
            </button>
          )}
        </div>

        {/* Mode: Card Review Session */}
        {selectedDeck ? (
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* Back to Decks Header */}
            <div style={{ display: 'flex', width: '100%', justifyItems: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <button 
                onClick={() => { setSelectedDeck(null); setCards([]); fetchDecks(); }}
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <ArrowLeft size={16} />
              </button>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Reviewing: <span style={{ color: 'var(--primary-text)' }}>{selectedDeck.title}</span>
              </h3>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Card {currentCardIdx + 1} of {cards.length}
              </span>
            </div>

            {/* Review Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'var(--secondary)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ width: `${((currentCardIdx) / cards.length) * 100}%`, height: '100%', background: 'var(--primary-text)', transition: 'width 0.3s' }} />
            </div>

            {/* 3D Flip Card Container */}
            {cards.length > 0 ? (
              <div 
                className={`flip-card-container ${isFlipped ? 'flipped' : ''}`} 
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="flip-card-inner">
                  
                  {/* Front Side (Question) */}
                  <div className="flip-card-front">
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--primary-text)', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Brain size={12} /> Question
                    </span>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.5' }}>
                      {cards[currentCardIdx].front}
                    </h2>
                    <span style={{ marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Click Card to Reveal Answer <ArrowRight size={12} />
                    </span>
                  </div>

                  {/* Back Side (Answer) */}
                  <div className="flip-card-back">
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', tracking: '0.05em', color: '#22c55e', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Explanation
                    </span>
                    <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.6', overflowY: 'auto', maxHeight: '160px' }}>
                      {cards[currentCardIdx].back}
                    </p>
                    <span style={{ marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Rate difficulty to reschedule
                    </span>
                  </div>

                </div>
              </div>
            ) : (
              <div className="prof-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No cards in this deck.
              </div>
            )}

            {/* Spaced Repetition Rating Panel */}
            {isFlipped && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '100%', animation: 'fadeIn 0.3s' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>How well did you recall this card?</span>
                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                  <button 
                    onClick={() => handleReviewCard(1)} 
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                  >
                    😟 Hard
                  </button>
                  <button 
                    onClick={() => handleReviewCard(3)} 
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--primary-text)', background: 'rgba(124, 98, 243, 0.05)', color: 'var(--primary-text)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(124, 98, 243, 0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(124, 98, 243, 0.05)'}
                  >
                    😐 Good
                  </button>
                  <button 
                    onClick={() => handleReviewCard(5)} 
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #22c55e', background: 'rgba(34, 197, 94, 0.05)', color: '#22c55e', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.05)'}
                  >
                    😊 Easy
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          // Mode: Decks List Dashboard
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            
            {/* Generate card grid */}
            {decks.map(deck => (
              <div 
                key={deck.id}
                onClick={() => handleSelectDeck(deck)}
                className="prof-card"
                style={{ 
                  padding: '1.5rem', 
                  borderRadius: '16px', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s',
                  position: 'relative',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  background: 'rgba(255,255,255,0.01)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--primary-text)';
                  e.currentTarget.style.background = 'rgba(124, 98, 243, 0.03)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                }}
              >
                {/* Trash deck button */}
                <button
                  onClick={(e) => handleDeleteDeck(deck.id, e)}
                  style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    background: 'transparent', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={16} />
                </button>

                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(124, 98, 243, 0.1)', color: 'var(--primary-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0', wordBreak: 'break-word', paddingRight: '1.5rem' }}>{deck.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{deck.card_count} flashcards</span>
                </div>
                
                <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: 'var(--primary-text)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Start Review <ArrowRight size={12} />
                </div>
              </div>
            ))}

            {decks.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem', border: '2px dashed var(--border-color)', borderRadius: '20px', color: 'var(--text-muted)' }}>
                <Brain size={48} style={{ strokeWidth: 1.5, marginBottom: '1rem', color: 'var(--text-muted)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>No Decks Created Yet</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1.5rem 0' }}>Write an academic topic and let Gemini generate a smart flashcard deck for you!</p>
                <button onClick={() => setShowCreateModal(true)} className="prof-btn" style={{ padding: '0.5rem 1.2rem', borderRadius: '10px' }}>
                  Create First Deck
                </button>
              </div>
            )}

          </div>
        )}

        {/* AI Creator Modal */}
        {showCreateModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="prof-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)', background: 'var(--bg-main)', animation: 'slideUp 0.3s' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={18} style={{ color: 'var(--primary-text)' }} /> Generate Flashcard Deck
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
                Gemini will research the topic and create a custom Q&A deck using the SM2 spaced repetition interval model.
              </p>

              <form onSubmit={handleGenerateDeck} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Academic Topic</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chemical Bonding, Cell Division, Quadratic equations"
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                    className="prof-input"
                    disabled={loading}
                    style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowCreateModal(false)} 
                    disabled={loading}
                    style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading || !newTopic.trim()}
                    className="prof-btn"
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    {loading ? 'Generating...' : 'Create Deck'}
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

export default Flashcards;
