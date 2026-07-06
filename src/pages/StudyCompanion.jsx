import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Send, Sparkles, GraduationCap, Compass, BookOpen, Clock, Play, Pause, RotateCcw, Sliders, Activity } from 'lucide-react';

const StudyCompanion = () => {
  const { authToken } = useContext(AppContext);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am your Aarambh AI Study Tutor. Ask me any question about Math, Science, English, or Computer Science! I will explain concepts step-by-step and provide check-for-understanding practice problems. Feel free to use the interactive simulation canvas on the left to visualize concepts!'
    }
  ]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Visualization Panel States
  const [activeTab, setActiveTab] = useState('simulators'); // 'simulators' | 'pomodoro'
  const [activeSim, setActiveSim] = useState('newton'); // 'newton' | 'induction' | 'plotter'

  // Newton Simulation States
  const [newtonForce, setNewtonForce] = useState(10); // N
  const [newtonMass, setNewtonMass] = useState(2); // kg
  const [newtonRunning, setNewtonRunning] = useState(false);
  const newtonX = useRef(50);
  const newtonV = useRef(0);
  const newtonCanvasRef = useRef(null);
  const newtonAnimFrame = useRef(null);

  // Induction Simulation States
  const [magnetX, setMagnetX] = useState(100);
  const [inducedCurrent, setInducedCurrent] = useState(0);
  const prevMagnetX = useRef(100);
  const inductionCanvasRef = useRef(null);
  const coilX = 220;

  // Plotter States
  const [plotFormula, setPlotFormula] = useState('x * x / 10'); // default quadratic curve
  const plotterCanvasRef = useRef(null);

  // Pomodoro States
  const [pomTime, setPomTime] = useState(25 * 60); // 25 minutes
  const [pomActive, setPomActive] = useState(false);
  const [pomMode, setPomMode] = useState('focus'); // 'focus' | 'break'
  const pomInterval = useRef(null);

  const suggestedPrompts = [
    'Explain Newton\'s second law with an example.',
    'What is electromagnetic induction?',
    'Give me a practice question on integration.',
    'Balance this equation: H2 + O2 -> H2O',
    'Explain recursion simply with a code example.',
    'What is the difference between active and passive voice?'
  ];

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ----------------------------------------
  // 1. Newton Simulation Engine (Canvas)
  // ----------------------------------------
  useEffect(() => {
    if (activeSim !== 'newton' || activeTab !== 'simulators') return;
    const canvas = newtonCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width;
    let height = canvas.height;

    const draw = () => {
      // Clear
      ctx.clearRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Floor
      ctx.strokeStyle = 'var(--border-color)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, height - 40);
      ctx.lineTo(width, height - 40);
      ctx.stroke();

      // Update position if running
      if (newtonRunning) {
        const acceleration = newtonForce / newtonMass;
        // dt = 0.05 seconds per frame
        const dt = 0.05;
        newtonV.current += acceleration * dt;
        newtonX.current += newtonV.current * dt;

        // Reset if box goes off screen
        if (newtonX.current > width - 80) {
          newtonX.current = 20;
          newtonV.current = 0;
        }
      }

      // Draw Box
      const boxSize = 50;
      const boxY = height - 40 - boxSize;
      const boxX = newtonX.current;

      // Box body
      ctx.fillStyle = 'var(--primary-text)';
      ctx.fillRect(boxX, boxY, boxSize, boxSize);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxSize, boxSize);

      // Mass label on box
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${newtonMass} kg`, boxX + boxSize / 2, boxY + boxSize / 2 + 5);

      // Force Vector Arrow (Green)
      if (newtonForce > 0) {
        ctx.strokeStyle = '#22c55e';
        ctx.fillStyle = '#22c55e';
        ctx.lineWidth = 3;
        const arrowStartX = boxX - newtonForce * 3 - 10;
        const arrowEndX = boxX - 5;
        const arrowY = boxY + boxSize / 2;

        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowY);
        ctx.lineTo(arrowEndX, arrowY);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(arrowEndX, arrowY);
        ctx.lineTo(arrowEndX - 8, arrowY - 5);
        ctx.lineTo(arrowEndX - 8, arrowY + 5);
        ctx.fill();

        // Label F
        ctx.font = '10px sans-serif';
        ctx.fillText(`F = ${newtonForce}N`, arrowStartX + (arrowEndX - arrowStartX) / 2, arrowY - 8);
      }

      // Acceleration & Velocity Vector (Blue)
      if (newtonRunning && newtonV.current > 0) {
        ctx.strokeStyle = '#3b82f6';
        ctx.fillStyle = '#3b82f6';
        ctx.lineWidth = 3;
        const vStartX = boxX + boxSize + 5;
        const vEndX = vStartX + Math.min(newtonV.current * 4, 80);
        const vY = boxY + boxSize / 2;

        ctx.beginPath();
        ctx.moveTo(vStartX, vY);
        ctx.lineTo(vEndX, vY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(vEndX, vY);
        ctx.lineTo(vEndX - 8, vY - 5);
        ctx.lineTo(vEndX - 8, vY + 5);
        ctx.fill();

        ctx.font = '10px sans-serif';
        ctx.fillText(`v = ${newtonV.current.toFixed(1)} m/s`, vStartX + (vEndX - vStartX) / 2, vY - 8);
      }

      newtonAnimFrame.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(newtonAnimFrame.current);
    };
  }, [activeSim, activeTab, newtonForce, newtonMass, newtonRunning]);

  // ----------------------------------------
  // 2. Induction Simulation Engine
  // ----------------------------------------
  useEffect(() => {
    if (activeSim !== 'induction' || activeTab !== 'simulators') return;
    const canvas = inductionCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width;
    let height = canvas.height;

    // Drawing coil & magnet
    const renderInduction = () => {
      ctx.clearRect(0, 0, width, height);

      // Grid background
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw Wire Coil (loops of orange circles)
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 4;
      const centerY = height / 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(coilX + i * 12, centerY, 15, 35, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Coil label
      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("Conductive Coil", coilX + 24, centerY - 45);

      // Galvanometer Deflection Dial
      const galvoX = width / 2;
      const galvoY = height - 55;
      ctx.strokeStyle = 'var(--border-color)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(galvoX, galvoY, 30, Math.PI, 2 * Math.PI);
      ctx.stroke();

      // Needle deflection based on induced current rate
      const maxDeflection = Math.PI / 4; // 45 degrees
      const angle = -Math.PI / 2 + Math.min(Math.max(inducedCurrent * 0.15, -maxDeflection), maxDeflection);
      const needleLength = 25;
      
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(galvoX, galvoY);
      ctx.lineTo(galvoX + Math.cos(angle) * needleLength, galvoY + Math.sin(angle) * needleLength);
      ctx.stroke();

      ctx.fillStyle = 'var(--text-main)';
      ctx.font = '10px sans-serif';
      ctx.fillText("G (Galvanometer)", galvoX, galvoY + 15);

      // Draw Bar Magnet (red N, blue S)
      const magWidth = 90;
      const magHeight = 35;
      const magY = centerY - magHeight / 2;

      // North Pole (Red)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(magnetX, magY, magWidth / 2, magHeight);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText("N", magnetX + magWidth / 4, magY + 22);

      // South Pole (Blue)
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(magnetX + magWidth / 2, magY, magWidth / 2, magHeight);
      ctx.fillStyle = 'white';
      ctx.fillText("S", magnetX + (3 * magWidth) / 4, magY + 22);

      // Magnet border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(magnetX, magY, magWidth, magHeight);

      // Draw LED Bulb at the top
      const bulbX = coilX + 24;
      const bulbY = 40;
      ctx.beginPath();
      ctx.arc(bulbX, bulbY, 15, 0, 2 * Math.PI);
      
      // Bulb brightness color based on current amplitude
      const brightness = Math.min(Math.abs(inducedCurrent) * 15, 255);
      ctx.fillStyle = brightness > 5 ? `rgba(234, 179, 8, ${brightness / 255})` : 'rgba(255,255,255,0.05)';
      ctx.fill();
      
      ctx.strokeStyle = brightness > 5 ? '#eab308' : 'var(--border-color)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'var(--text-main)';
      ctx.font = '10px sans-serif';
      ctx.fillText(brightness > 5 ? "Induced EMF!" : "No Movement = No EMF", bulbX, bulbY - 20);

      // Magnetic field lines (faint lines radiating from North pole)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(magnetX, centerY, 50, -Math.PI/3, Math.PI/3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(magnetX, centerY, 80, -Math.PI/4, Math.PI/4);
      ctx.stroke();
    };

    renderInduction();
  }, [activeSim, activeTab, magnetX, inducedCurrent]);

  const handleMagnetDrag = (e) => {
    if (activeSim !== 'induction') return;
    const canvas = inductionCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 45; // center offset
    const clampedX = Math.min(Math.max(x, 10), canvas.width - 100);

    // Speed of drag = dx / dt. Induced EMF is proportional to change in position (Faraday's Law)
    const dx = clampedX - prevMagnetX.current;
    
    setMagnetX(clampedX);
    setInducedCurrent(dx * 4); // Deflect needle based on speed
    prevMagnetX.current = clampedX;

    // Decay the deflection back to 0
    setTimeout(() => {
      setInducedCurrent(0);
    }, 150);
  };

  // ----------------------------------------
  // 3. Math Function Plotter Engine
  // ----------------------------------------
  useEffect(() => {
    if (activeSim !== 'plotter' || activeTab !== 'simulators') return;
    const canvas = plotterCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width;
    let height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw coordinate axes
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    // vertical grid lines
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    // horizontal grid lines
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Main Axes
    ctx.strokeStyle = 'var(--text-muted)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Plot User Function
    ctx.strokeStyle = 'var(--primary-text)';
    ctx.lineWidth = 3;
    ctx.beginPath();

    let first = true;
    for (let screenX = 0; screenX < width; screenX++) {
      // Map screenX coordinate to graph x value (-centerX to centerX)
      const graphX = screenX - centerX;
      
      try {
        // Use Function constructor instead of eval to prevent warnings and security issues
        const fn = new Function('x', 'return ' + plotFormula);
        const graphY = fn(graphX);
        
        // Map graphY value to screen coordinate
        const screenY = centerY - graphY;

        if (screenY >= 0 && screenY <= height) {
          if (first) {
            ctx.moveTo(screenX, screenY);
            first = false;
          } else {
            ctx.lineTo(screenX, screenY);
          }
        }
      } catch (err) {
        // Safe fail-silent if user formula syntax is partially typed
      }
    }
    ctx.stroke();
  }, [activeSim, activeTab, plotFormula]);

  // ----------------------------------------
  // 4. Pomodoro Clock Logic
  // ----------------------------------------
  useEffect(() => {
    if (pomActive) {
      pomInterval.current = setInterval(() => {
        setPomTime(prev => {
          if (prev <= 1) {
            clearInterval(pomInterval.current);
            setPomActive(false);
            // Toggle focus / break mode
            if (pomMode === 'focus') {
              setPomMode('break');
              setPomTime(5 * 60); // 5 min break
            } else {
              setPomMode('focus');
              setPomTime(25 * 60); // 25 min focus
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(pomInterval.current);
    }
    return () => clearInterval(pomInterval.current);
  }, [pomActive, pomMode]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleResetPom = () => {
    setPomActive(false);
    setPomTime(pomMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  // ----------------------------------------
  // 5. Send Question to Backend AI endpoint
  // ----------------------------------------
  const handleAsk = async (presetPrompt = null) => {
    const activeQuestion = presetPrompt || question;
    if (!activeQuestion.trim()) return;

    if (!presetPrompt) {
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
          question: activeQuestion,
          history: chatHistory.slice(1) // send context history to backend
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

  // ----------------------------------------
  // 6. Formatting Text Parser (No markdown asterisks)
  // ----------------------------------------
  const renderFormattedMessage = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
      // Acknowledge custom headers
      if (line.startsWith('### ')) {
        return <h3 key={lineIdx} style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={lineIdx} style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{line.replace('## ', '')}</h2>;
      }

      // Check for bullet list items
      let isBullet = false;
      let cleanLine = line;
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        isBullet = true;
        cleanLine = line.trim().substring(2);
      }

      // Parse inline styles: bold (**), italic (*), and inline code (`)
      const parts = [];
      const inlineRegex = /(\*\*([^*`]+)\*\*)|(\*([^*`]+)\*)|(`([^`]+)`)/g;
      let match;
      let lastIndex = 0;

      while ((match = inlineRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index));
        }

        if (match[1]) {
          // Bold text: **text**
          parts.push(<strong key={match.index} style={{ fontWeight: 700, color: 'var(--text-main)' }}>{match[2]}</strong>);
        } else if (match[3]) {
          // Italic text: *text*
          parts.push(<em key={match.index} style={{ fontStyle: 'italic' }}>{match[4]}</em>);
        } else if (match[5]) {
          // Inline code/highlight: `code`
          parts.push(
            <code 
              key={match.index} 
              style={{ 
                fontFamily: 'monospace', 
                background: 'rgba(255,255,255,0.06)', 
                color: 'var(--primary-text)', 
                padding: '0.15rem 0.35rem', 
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}
            >
              {match[6]}
            </code>
          );
        }

        lastIndex = inlineRegex.lastIndex;
      }

      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex));
      }

      if (isBullet) {
        return (
          <div key={lineIdx} style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--primary-text)', fontWeight: 'bold' }}>•</span>
            <div style={{ flex: 1 }}>{parts}</div>
          </div>
        );
      }

      return (
        <div key={lineIdx} style={{ minHeight: '1.2em', marginBottom: '0.5rem' }}>
          {parts}
        </div>
      );
    });
  };

  return (
    <>
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        {/* Dashboard Header */}
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
              Your interactive workspace featuring live simulations, study tools, and academic assistance.
            </p>
          </div>
        </div>

        {/* Main Split Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', flex: 1, alignItems: 'stretch' }}>
          
          {/* Left Column: Interactive Simulation & Study Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Tabs Selector Card */}
            <div className="prof-card" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', borderRadius: '14px' }}>
              <button
                onClick={() => setActiveTab('simulators')}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: activeTab === 'simulators' ? 'var(--primary-text)' : 'transparent',
                  color: activeTab === 'simulators' ? 'white' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Activity size={16} /> Concept Simulators
              </button>
              <button
                onClick={() => setActiveTab('pomodoro')}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: activeTab === 'pomodoro' ? 'var(--primary-text)' : 'transparent',
                  color: activeTab === 'pomodoro' ? 'white' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Clock size={16} /> Focus Timer
              </button>
            </div>

            {/* Tab Contents: Simulators */}
            {activeTab === 'simulators' && (
              <div className="prof-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                
                {/* Simulator Inner Tab Buttons */}
                <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--border-color)', pb: '0.75rem', marginBottom: '0.5rem' }}>
                  <button
                    onClick={() => setActiveSim('newton')}
                    style={{
                      padding: '0.5rem 0.8rem', border: 'none', background: 'transparent', cursor: 'pointer',
                      color: activeSim === 'newton' ? 'var(--primary-text)' : 'var(--text-muted)',
                      borderBottom: activeSim === 'newton' ? '2px solid var(--primary-text)' : 'none',
                      fontWeight: 700, fontSize: '0.75rem'
                    }}
                  >
                    Newton's 2nd Law
                  </button>
                  <button
                    onClick={() => setActiveSim('induction')}
                    style={{
                      padding: '0.5rem 0.8rem', border: 'none', background: 'transparent', cursor: 'pointer',
                      color: activeSim === 'induction' ? 'var(--primary-text)' : 'var(--text-muted)',
                      borderBottom: activeSim === 'induction' ? '2px solid var(--primary-text)' : 'none',
                      fontWeight: 700, fontSize: '0.75rem'
                    }}
                  >
                    Induction (Faraday)
                  </button>
                  <button
                    onClick={() => setActiveSim('plotter')}
                    style={{
                      padding: '0.5rem 0.8rem', border: 'none', background: 'transparent', cursor: 'pointer',
                      color: activeSim === 'plotter' ? 'var(--primary-text)' : 'var(--text-muted)',
                      borderBottom: activeSim === 'plotter' ? '2px solid var(--primary-text)' : 'none',
                      fontWeight: 700, fontSize: '0.75rem'
                    }}
                  >
                    Function Plotter
                  </button>
                </div>

                {/* Newton Simulator Layout */}
                {activeSim === 'newton' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    <div style={{ display: 'flex', justifyItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      <canvas 
                        ref={newtonCanvasRef} 
                        width={380} 
                        height={180} 
                        style={{ width: '100%', height: '180px', display: 'block' }}
                      />
                    </div>
                    
                    {/* Controls Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Mass: {newtonMass} kg</span>
                        <input
                          type="range" min="1" max="5" step="0.5"
                          value={newtonMass} onChange={e => setNewtonMass(parseFloat(e.target.value))}
                          style={{ accentColor: 'var(--primary-text)', cursor: 'pointer' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Force: {newtonForce} N</span>
                        <input
                          type="range" min="1" max="20" step="1"
                          value={newtonForce} onChange={e => setNewtonForce(parseInt(e.target.value))}
                          style={{ accentColor: 'var(--primary-text)', cursor: 'pointer' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderTop: '1px solid var(--border-color)', pt: '0.75rem', marginTop: 'auto' }}>
                      <button
                        onClick={() => {
                          if (newtonRunning) {
                            setNewtonRunning(false);
                          } else {
                            setNewtonRunning(true);
                          }
                        }}
                        className="prof-btn"
                        style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem' }}
                      >
                        {newtonRunning ? <Pause size={14} /> : <Play size={14} />}
                        {newtonRunning ? 'Pause Engine' : 'Run Simulator'}
                      </button>
                      <button
                        onClick={() => {
                          setNewtonRunning(false);
                          newtonX.current = 50;
                          newtonV.current = 0;
                        }}
                        style={{
                          background: 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer',
                          color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '8px', width: '38px', height: '34px'
                        }}
                      >
                        <RotateCcw size={15} />
                      </button>
                    </div>

                    <div style={{ background: 'var(--secondary)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', borderLeft: '3px solid var(--primary-text)' }}>
                      <strong>Formula Check:</strong> Acceleration (a) = Force (F) / Mass (m) = <span style={{ color: 'var(--primary-text)', fontWeight: 'bold' }}>{(newtonForce / newtonMass).toFixed(2)} m/s²</span>
                    </div>
                  </div>
                )}

                {/* Induction (Faraday) Simulator Layout */}
                {activeSim === 'induction' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    <div style={{ display: 'flex', justifyItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      <canvas 
                        ref={inductionCanvasRef} 
                        width={380} 
                        height={180} 
                        style={{ width: '100%', height: '180px', display: 'block', cursor: 'ew-resize' }}
                        onMouseMove={handleMagnetDrag}
                      />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--secondary)', padding: '0.5rem', borderRadius: '6px' }}>
                      💡 <strong>Interactive:</strong> Move your mouse cursor left & right inside the canvas to drag the magnet and induce electricity!
                    </div>
                    <div style={{ background: 'var(--secondary)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', borderLeft: '3px solid var(--primary-text)', marginTop: 'auto' }}>
                      <strong>Physics Concept:</strong> Moving magnetic fields change magnetic flux through a coil, inducing an Electromotive Force (EMF) which lights up the bulb!
                    </div>
                  </div>
                )}

                {/* Math Plotter Layout */}
                {activeSim === 'plotter' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    <div style={{ display: 'flex', justifyItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      <canvas 
                        ref={plotterCanvasRef} 
                        width={380} 
                        height={180} 
                        style={{ width: '100%', height: '180px', display: 'block' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Formula y = f(x)</label>
                      <input
                        type="text"
                        value={plotFormula}
                        onChange={e => setPlotFormula(e.target.value)}
                        className="prof-input"
                        placeholder="e.g. Math.sin(x/10) * 40"
                        style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                      />
                    </div>
                    <div style={{ background: 'var(--secondary)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', borderLeft: '3px solid var(--primary-text)' }}>
                      Supports JavaScript Math object terms, e.g. `x * x / 15` or `Math.sin(x / 10) * 40`.
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Tab Contents: Pomodoro Timer */}
            {activeTab === 'pomodoro' && (
              <div className="prof-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flex: 1 }}>
                
                {/* Circular Glass Display */}
                <div style={{
                  width: '180px', height: '180px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.02)', border: '6px solid var(--border-color)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: pomMode === 'focus' ? 'var(--primary-text)' : '#22c55e' }}>
                    {pomMode === 'focus' ? 'Study Focus' : 'Short Break'}
                  </span>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.2rem 0', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                    {formatTime(pomTime)}
                  </h2>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {pomActive ? 'Clock ticking...' : 'Timer paused'}
                  </span>
                </div>

                {/* Clock Controls */}
                <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '240px' }}>
                  <button
                    onClick={() => setPomActive(!pomActive)}
                    className="prof-btn"
                    style={{ flex: 2, padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}
                  >
                    {pomActive ? <Pause size={14} /> : <Play size={14} />}
                    {pomActive ? 'Pause' : 'Start Focus'}
                  </button>
                  <button
                    onClick={handleResetPom}
                    style={{
                      flex: 1, background: 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '8px', fontSize: '0.8rem', gap: '4px'
                    }}
                  >
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
                  Use the Pomodoro Technique to study for 25 minutes, then take a 5-minute break. Highly recommended for exam prep!
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Unified AI Tutor Chatroom */}
          <div className="prof-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}>
            
            {/* Room Header */}
            <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} style={{ color: 'var(--primary-text)' }} /> Unified AI Tutor Room
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ask questions about any school subject.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--primary-text)', background: 'rgba(124, 98, 243, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '20px', fontWeight: 700 }}>
                Online Study Assistant
              </div>
            </div>

            {/* Suggested Prompt Chips */}
            <div style={{ padding: '0.8rem 1.2rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', borderBottom: '1px solid var(--border-color)' }}>
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(p)}
                  disabled={loading}
                  style={{
                    whiteSpace: 'nowrap', padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)',
                    background: 'var(--secondary)', color: 'var(--text-muted)', fontSize: '0.7rem',
                    borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600
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
                  {p}
                </button>
              ))}
            </div>

            {/* Chat Messages Log */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem', minHeight: '350px', maxHeight: '55vh' }}>
              {chatHistory.map(msg => (
                <div key={msg.id} style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? 'var(--primary-text)' : 'var(--secondary)',
                  color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                  padding: '1rem 1.25rem', borderRadius: '12px',
                  borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                  borderBottomLeftRadius: msg.sender === 'bot' ? '2px' : '12px',
                  maxWidth: '85%', fontSize: '0.9rem', lineHeight: '1.55',
                  border: msg.sender === 'bot' ? '1px solid var(--border-color)' : 'none',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {msg.sender === 'bot' ? renderFormattedMessage(msg.text) : msg.text}
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

            {/* Chat Input form */}
            <form onSubmit={e => { e.preventDefault(); handleAsk(); }} style={{ padding: '1.2rem', borderTop: '1px solid var(--border-color)', background: 'var(--secondary)', display: 'flex', gap: '0.8rem' }}>
              <input
                type="text"
                placeholder="Ask a question about any subject..."
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
                style={{
                  borderRadius: '50%', width: '42px', height: '42px', padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--primary-text)', border: 'none', cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Send size={16} color="white" />
              </button>
            </form>

          </div>

        </div>

      </main>
    </>
  );
};

export default StudyCompanion;
