import { useState, useEffect, useRef } from 'react'
import './App.css'

// SVGs for icons/images
const WalkIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#43e97b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 5.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M8.5 15.5l2-5 2 1 2 1.5-1.5 3.5"/><path d="M6.5 21.5l2-7 2-2.5"/><path d="M12.5 17.5l2 4 2-4.5"/></svg>
);
const HeroImage = () => (
  <svg width="100%" height="120" viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="120" rx="24" fill="url(#paint0_linear)"/><path d="M0 120C60 80 120 160 200 80C280 0 340 120 400 80V120H0Z" fill="#43e97b" fillOpacity="0.18"/><defs><linearGradient id="paint0_linear" x1="0" y1="0" x2="400" y2="120" gradientUnits="userSpaceOnUse"><stop stopColor="#38f9d7"/><stop offset="1" stopColor="#43e97b"/></linearGradient></defs></svg>
);

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-title">Step Tracker</div>
      <div className="navbar-profile">
        <img src="https://api.dicebear.com/7.x/personas/svg?seed=ashar" alt="profile" className="profile-img" />
      </div>
    </nav>
  );
}

function ProgressBar({ progress, goal, steps }) {
  return (
    <div className="progress-bar-outer">
      <div
        className="progress-bar-inner"
        style={{ width: `${progress}%` }}
      ></div>
      <div className="progress-bar-label">
        <WalkIcon />
        <span style={{ marginLeft: 8 }}>{steps} / {goal} steps</span>
      </div>
    </div>
  );
}

function StepsLineChart({ data }) {
  if (data.length < 2) return null;
  const width = 350;
  const height = 100;
  const maxSteps = Math.max(...data.map(d => d.steps), 1);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - 20) + 10;
    const y = height - 10 - ((d.steps / maxSteps) * (height - 20));
    return `${x},${y}`;
  }).join(' ');
  return (
    <div className="steps-line-chart">
      <svg width={width} height={height}>
        <polyline
          fill="none"
          stroke="#4caf50"
          strokeWidth="3"
          points={points}
        />
        {/* Draw circles for each point */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * (width - 20) + 10;
          const y = height - 10 - ((d.steps / maxSteps) * (height - 20));
          return <circle key={i} cx={x} cy={y} r={4} fill="#fff" stroke="#4caf50" strokeWidth={2} />;
        })}
      </svg>
      <div className="chart-label">Steps Over Time</div>
    </div>
  );
}

function StepCalculator() {
  const [height, setHeight] = useState('');
  const [minutes, setMinutes] = useState('');
  const [result, setResult] = useState(null);

  // Average step length in cm = height (cm) * 0.415
  // Steps = (distance in meters) / (step length in meters)
  // Average walking speed = 1.4 m/s
  // Distance = speed * time
  // Steps = (speed * time) / step length
  const calculateSteps = (e) => {
    e.preventDefault();
    const h = parseFloat(height);
    const min = parseFloat(minutes);
    if (!h || !min) {
      setResult(null);
      return;
    }
    const stepLength = h * 0.415 / 100; // in meters
    const speed = 1.4; // m/s
    const time = min * 60; // seconds
    const distance = speed * time; // meters
    const steps = Math.round(distance / stepLength);
    setResult(steps);
  };

  return (
    <div className="step-calculator">
      <div className="calc-header"><WalkIcon /> Step Calculator</div>
      <form onSubmit={calculateSteps}>
        <label>
          Height (cm):
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} required />
        </label>
        <label>
          Time (minutes):
          <input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} required />
        </label>
        <button type="submit">Calculate Steps</button>
      </form>
      {result !== null && (
        <div className="calc-result">Estimated Steps: <b>{result}</b></div>
      )}
    </div>
  );
}

function App() {
  const [goal, setGoal] = useState(10000)
  const [steps, setSteps] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isTracking, setIsTracking] = useState(false)
  const [timer, setTimer] = useState(null)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [stepHistory, setStepHistory] = useState([{ steps: 0 }]);

  const handleGoalChange = (e) => {
    setGoal(parseInt(e.target.value, 10))
  }

  const handleStepsChange = (e) => {
    const val = parseInt(e.target.value, 10)
    setSteps(val)
    setStepHistory(prev => [...prev, { steps: val }]);
  }

  const startTracking = () => {
    setIsTracking(true)
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1)
    }, 1000)
    setTimer(interval)
  }

  const stopTracking = () => {
    setIsTracking(false)
    clearInterval(timer)
  }

  const resetTracking = () => {
    setSteps(0)
    setDuration(0)
    clearInterval(timer)
    setIsTracking(false)
    setStepHistory([{ steps: 0 }]);
  }

  const progress = Math.min((steps / goal) * 100, 100)

  // Animate the progress bar
  useEffect(() => {
    let frame;
    const animate = () => {
      setAnimatedProgress(prev => {
        if (Math.abs(prev - progress) < 1) return progress;
        return prev + (progress - prev) * 0.1;
      });
      if (Math.abs(animatedProgress - progress) >= 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    animate();
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line
  }, [progress]);

  useEffect(() => {
    setAnimatedProgress(progress);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="main-bg">
      <Navbar />
      <div className="hero-img"><HeroImage /></div>
      <div className="tracker-card">
        <h1 className="tracker-title">Step Counter</h1>
        <div className="goal-input">
          <label>
            Goal Steps:
            <input type="number" value={goal} onChange={handleGoalChange} />
          </label>
        </div>
        <div className="meter-container">
          <ProgressBar progress={animatedProgress} goal={goal} steps={steps} />
        </div>
        <StepsLineChart data={stepHistory} />
        <div className="steps-input">
          <label>
            Current Steps:
            <input type="number" value={steps} onChange={handleStepsChange} />
          </label>
        </div>
        <div className="duration">
          Duration: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
        </div>
        <div className="controls">
          {!isTracking ? (
            <button onClick={startTracking}>Start Tracking</button>
          ) : (
            <button onClick={stopTracking}>Stop Tracking</button>
          )}
          <button onClick={resetTracking}>Reset</button>
        </div>
        <StepCalculator />
      </div>
    </div>
  )
}

export default App
