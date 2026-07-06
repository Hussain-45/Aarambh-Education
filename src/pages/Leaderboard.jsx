import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Trophy, Award, Lock, Sparkles, User, GraduationCap, Zap } from 'lucide-react';

const Leaderboard = () => {
  const { authToken, loggedInUser } = useContext(AppContext);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userProfile, setUserProfile] = useState({ xp: 0, badges: [] });

  useEffect(() => {
    fetchLeaderboard();
    fetchUserProfile();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leaderboard', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/gamification/profile', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper calculations for leveling
  const currentXP = userProfile.xp || 0;
  const level = Math.floor(currentXP / 500) + 1;
  const xpInCurrentLevel = currentXP % 500;
  const xpNeededForNextLevel = 500;
  const progressPercent = Math.min((xpInCurrentLevel / xpNeededForNextLevel) * 100, 100);

  // Available achievements dictionary
  const availableBadges = [
    {
      name: 'Perfect Score',
      desc: 'Achieve 100% on any mock test or timed quiz.',
      icon: '🎯',
      color: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    {
      name: 'Flashcard Scholar',
      desc: 'Generate 3 or more spaced-repetition AI decks.',
      icon: '🧠',
      color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    },
    {
      name: 'Organized Learner',
      desc: 'Complete 5 visual study planner schedules.',
      icon: '📅',
      color: 'linear-gradient(135deg, #10b981, #047857)'
    },
    {
      name: 'Simulation Master',
      desc: 'Interact with visual concepts inside the tutor workspace.',
      icon: '⚡',
      color: 'linear-gradient(135deg, #7c62f3, #5b21b6)'
    }
  ];

  // Helper to check if student has unlocked a badge
  const isBadgeUnlocked = (badgeName) => {
    const list = userProfile.badges || [];
    return list.some(b => b.badge_name === badgeName || badgeName === 'Simulation Master'); // Simulation Master granted automatically for playing with widgets
  };

  // Top 3 pedestal ranks
  const topThree = leaderboard.slice(0, 3);
  const remainingRanks = leaderboard.slice(3);

  return (
    <>
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', background: 'var(--bg-main)', minHeight: '100vh' }}>
        <Header />

        {/* Page Title */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary-text)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
            <Trophy size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Gamified Leaderboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Earn XP points and unlock achievement badges by studying, reviewing, and scoring.</p>
          </div>
        </div>

        {/* Level Progression Profile Bar */}
        <div className="prof-card" style={{ padding: '1.75rem', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(124,98,243,0.05) 0%, rgba(255,255,255,0.01) 100%)', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-text)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', border: '4px solid rgba(124, 98, 243, 0.2)', boxShadow: 'var(--shadow-md)' }}>
              {level}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Level {level}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.25rem' }}>
                <Zap size={12} style={{ color: 'var(--primary-text)' }} /> Total XP: <strong>{currentXP} pts</strong>
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <span>Progress to Level {level + 1}</span>
              <span>{xpInCurrentLevel} / {xpNeededForNextLevel} XP</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--secondary)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-text) 0%, #3b82f6 100%)', borderRadius: '10px' }} />
            </div>
          </div>
        </div>

        {/* Badges Grid Panel */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={18} style={{ color: 'var(--primary-text)' }} /> Achievement Badges
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {availableBadges.map((badge, idx) => {
            const unlocked = isBadgeUnlocked(badge.name);
            return (
              <div 
                key={idx} 
                className="prof-card" 
                style={{ 
                  padding: '1.25rem', 
                  borderRadius: '16px', 
                  border: '1px solid var(--border-color)',
                  opacity: unlocked ? 1 : 0.65,
                  background: unlocked ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.75rem',
                  position: 'relative'
                }}
              >
                {!unlocked && (
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--text-muted)' }}>
                    <Lock size={12} />
                  </div>
                )}
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '50%',
                  background: unlocked ? badge.color : '#475569',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', boxShadow: unlocked ? 'var(--shadow-md)' : 'none',
                  filter: unlocked ? 'none' : 'grayscale(1)'
                }}>
                  {badge.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.2rem 0' }}>{badge.name}</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.3' }}>{badge.desc}</p>
                </div>
                {unlocked && (
                  <span style={{ fontSize: '0.6rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '10px', fontWeight: 700 }}>
                    Unlocked
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Ranks Pedestal & Roster */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Trophy size={18} style={{ color: 'var(--primary-text)' }} /> Academic Leaderboard
        </h3>

        {/* Podium Display for Top 3 */}
        {leaderboard.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1.5rem', margin: '2rem 0 3rem 0', flexWrap: 'wrap' }}>
            
            {/* Rank 2 (Silver) */}
            {topThree[1] && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#94a3b8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', fontWeight: 800, border: '3px solid white', boxShadow: 'var(--shadow-md)' }}>
                  2
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.5rem' }}>{topThree[1].name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{topThree[1].xp} XP</div>
                <div style={{ width: '80px', height: '80px', background: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)', borderRadius: '8px 8px 0 0', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  🥈
                </div>
              </div>
            )}

            {/* Rank 1 (Gold) */}
            {topThree[0] && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fbbf24', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, border: '4px solid white', boxShadow: 'var(--shadow-lg)' }}>
                  1
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>{topThree[0].name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary-text)', fontWeight: 700 }}>{topThree[0].xp} XP</div>
                <div style={{ width: '90px', height: '110px', background: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)', borderRadius: '8px 8px 0 0', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.8rem', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(251, 191, 36, 0.2)' }}>
                  👑
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {topThree[2] && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#b45309', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, border: '3px solid white', boxShadow: 'var(--shadow-md)' }}>
                  3
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.5rem' }}>{topThree[2].name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{topThree[2].xp} XP</div>
                <div style={{ width: '80px', height: '60px', background: 'linear-gradient(180deg, #cd7f32 0%, #b45309 100%)', borderRadius: '8px 8px 0 0', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  🥉
                </div>
              </div>
            )}

          </div>
        )}

        {/* Scrollable Rank Roster List */}
        <div className="prof-card" style={{ padding: 0, borderRadius: '20px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          {leaderboard.map((student, index) => {
            const isCurrentUser = student.id === loggedInUser?.id;
            return (
              <div 
                key={student.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1rem 1.5rem', 
                  borderBottom: index < leaderboard.length - 1 ? '1px solid var(--border-color)' : 'none',
                  background: isCurrentUser ? 'rgba(124, 98, 243, 0.05)' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                <span style={{ width: '40px', fontSize: '0.9rem', fontWeight: 800, color: index < 3 ? 'var(--primary-text)' : 'var(--text-muted)' }}>
                  #{index + 1}
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1 }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', border: '1px solid var(--border-color)'
                  }}>
                    <User size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {student.name} {isCurrentUser && <span style={{ fontSize: '0.7rem', color: 'var(--primary-text)', background: 'rgba(124, 98, 243, 0.1)', padding: '0.15rem 0.35rem', borderRadius: '4px', marginLeft: '6px', fontWeight: 700 }}>You</span>}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      Class: {student.className || 'General'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', marginRight: '2rem' }}>
                  {student.badges && student.badges.map((b, bIdx) => (
                    <span 
                      key={bIdx} 
                      title={b}
                      style={{ 
                        fontSize: '0.9rem',
                        cursor: 'default'
                      }}
                    >
                      {b === 'Perfect Score' ? '🎯' : b === 'Flashcard Scholar' ? '🧠' : b === 'Organized Learner' ? '📅' : '⚡'}
                    </span>
                  ))}
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {student.xp} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>XP</span>
                </div>
              </div>
            );
          })}

          {leaderboard.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No rankings available yet.
            </div>
          )}
        </div>

      </main>
    </>
  );
};

export default Leaderboard;
