import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBuilderTheme } from '../../data/builderThemes';
import './CompletionCelebrationModal.css';

const themeContent = {
  skyscraper: {
    headline: '🏢 Your Skyscraper is Fully Constructed!',
    description:
      'From the deep concrete foundation to the crowning spire, your architectural mastery is complete. Every challenge has been solved!',
  },
  bicycle: {
    headline: '🚲 Your Precision Bicycle is Fully Assembled & Road-Ready!',
    description:
      'From the welded tubular frame to the calibrated gears and wheels, you crafted every single part through your learning journey!',
  },
  bridge: {
    headline: '🤝 The Bridge of Empathy is Complete!',
    description:
      'You have bridged the gap! The foundation, suspension cables, and timber deck are united in a powerful handshake of human connection.',
  },
};

function CelebrationArtwork({ theme }) {
  if (theme === 'bicycle') {
    return (
      <svg className="celebration-artwork" viewBox="0 0 900 360" role="img" aria-label="A fully assembled racing bicycle technical illustration">
        <defs>
          <radialGradient id="bikeGlow">
            <stop stopColor="#fef3c7" />
            <stop offset="1" stopColor="#fef3c7" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M0 300H900M70 320H830M145 45V320M755 45V320" stroke="#bcae91" strokeDasharray="4 8" />
        <g className="celebration-wheel-spin">
          <circle cx="310" cy="222" r="91" fill="none" stroke="#27221c" strokeWidth="5" />
          <circle cx="310" cy="222" r="6" fill="#b7791f" />
          {Array.from({ length: 12 }, (_, index) => {
            const angle = (Math.PI * 2 * index) / 12;
            return <line key={index} x1="310" y1="222" x2={310 + Math.cos(angle) * 86} y2={222 + Math.sin(angle) * 86} stroke="#897b65" strokeWidth="1" />;
          })}
        </g>
        <g className="celebration-wheel-spin celebration-wheel-spin-delayed">
          <circle cx="620" cy="222" r="91" fill="none" stroke="#27221c" strokeWidth="5" />
          <circle cx="620" cy="222" r="6" fill="#b7791f" />
          {Array.from({ length: 12 }, (_, index) => {
            const angle = (Math.PI * 2 * index) / 12;
            return <line key={index} x1="620" y1="222" x2={620 + Math.cos(angle) * 86} y2={222 + Math.sin(angle) * 86} stroke="#897b65" strokeWidth="1" />;
          })}
        </g>
        <path d="M310 222 411 112 514 222 310 222 450 222 411 112 565 105 620 222M411 112 390 92M370 92H418M565 105 585 85M575 83H625M514 222 535 200M502 196H552" fill="none" stroke="#27221c" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M411 112 423 222M415 105 565 105M530 222 514 235M596 222 620 222" fill="none" stroke="#b7791f" strokeWidth="4" />
        <circle className="celebration-wheel-particle" cx="310" cy="222" r="112" fill="url(#bikeGlow)" />
        <circle className="celebration-wheel-particle celebration-wheel-particle-delayed" cx="620" cy="222" r="112" fill="url(#bikeGlow)" />
        <text x="450" y="335" textAnchor="middle">ROAD-READY · PRECISION ASSEMBLY CERTIFIED</text>
      </svg>
    );
  }

  if (theme === 'bridge') {
    return (
      <svg className="celebration-artwork" viewBox="0 0 900 360" role="img" aria-label="A completed suspension bridge joining two riverbanks">
        <defs>
          <linearGradient id="bridgeWater" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#d8e1df" />
            <stop offset="1" stopColor="#f8f5ec" />
          </linearGradient>
        </defs>
        <path d="M0 220H160L210 190H690L740 220H900V360H0Z" fill="url(#bridgeWater)" />
        <path d="M0 220H160L210 190M690 190 740 220H900" fill="none" stroke="#554b3d" strokeWidth="4" />
        <path d="M100 213Q450 -8 800 213M210 190V300M690 190V300" fill="none" stroke="#27221c" strokeWidth="7" />
        <path d="M210 192V284H690V192M180 284H720" fill="none" stroke="#27221c" strokeWidth="5" />
        {Array.from({ length: 13 }, (_, index) => {
          const x = 235 + index * 35;
          const cableY = 48 + Math.abs(450 - x) * 0.44;
          return <line key={index} x1={x} y1={cableY} x2={x} y2="282" stroke="#8a6b35" strokeWidth="2" />;
        })}
        <path d="M420 265c-19-15-33-4-22 10l35 38c8 8 18 8 27 0l36-38c10-14-5-25-22-10l-25 18z" fill="#d7ad56" stroke="#72511b" strokeWidth="3" />
        <path d="M300 324q150-16 300 0M250 342q200-16 400 0" fill="none" stroke="#8a9c9b" strokeWidth="2" />
        <text x="450" y="350" textAnchor="middle">CONNECTED IN TRUST · HELPING HAND JOURNEY COMPLETE</text>
      </svg>
    );
  }

  return (
    <svg className="celebration-artwork" viewBox="0 0 900 360" role="img" aria-label="A completed illuminated skyscraper with a golden beacon">
      <defs>
        <linearGradient id="towerGold" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff6d6" />
          <stop offset="1" stopColor="#d5a442" />
        </linearGradient>
        <radialGradient id="towerBeacon">
          <stop stopColor="#fff7c2" stopOpacity=".95" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M0 300H900M90 320H810M190 55V320M710 55V320" stroke="#bcae91" strokeDasharray="4 8" />
      <path d="M335 300V94L365 74V44H535V74L565 94V300Z" fill="#292720" stroke="#171612" strokeWidth="5" />
      <path d="M365 94H535M365 130H535M365 166H535M365 202H535M365 238H535M365 274H535" stroke="#b7791f" strokeWidth="3" />
      <path d="M395 103V285M450 103V285M505 103V285" stroke="#d7bd83" strokeWidth="2" />
      {Array.from({ length: 30 }, (_, index) => (
        <rect key={index} x={380 + (index % 5) * 30} y={108 + Math.floor(index / 5) * 28} width="12" height="13" rx="1" fill={index % 4 === 0 ? 'url(#towerGold)' : '#b7791f'} opacity={index % 4 === 0 ? 1 : 0.7} />
      ))}
      <path d="M440 44V19L450 0 460 19V44" fill="url(#towerGold)" stroke="#8a5b12" strokeWidth="3" />
      <circle className="celebration-beacon-pulse" cx="450" cy="19" r="62" fill="url(#towerBeacon)" />
      <path d="M292 300H608M310 312H590" stroke="#27221c" strokeWidth="3" />
      <text x="450" y="344" textAnchor="middle">LEVEL 10 · MASTERY SPIRE ILLUMINATED</text>
    </svg>
  );
}

export default function CompletionCelebrationModal({
  open,
  skillId,
  skillName,
  studentName,
  theme = 'skyscraper',
  onClose,
}) {
  const selectedTheme = getBuilderTheme(theme).id;
  const content = themeContent[selectedTheme] || themeContent.skyscraper;

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const dismiss = () => {
    window.localStorage.setItem(`celebrated_level10_${skillId}`, 'true');
    onClose();
  };

  return (
    <div
      className="completion-celebration-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <section
        aria-labelledby="completion-celebration-title"
        aria-modal="true"
        className="completion-celebration-modal"
        role="dialog"
      >
        <div aria-hidden="true" className="celebration-confetti">
          {Array.from({ length: 34 }, (_, index) => (
            <span
              className="celebration-confetti-piece"
              key={index}
              style={{
                '--confetti-x': `${(index * 37) % 100}%`,
                '--confetti-delay': `${(index % 9) * 90}ms`,
                '--confetti-rotation': `${(index * 43) % 360}deg`,
                '--confetti-hue': (index * 47) % 360,
              }}
            />
          ))}
        </div>
        <div className="completion-celebration-inner">
          <p className="completion-celebration-eyebrow">Mastery milestone · Level 10 of 10</p>
          <h2 id="completion-celebration-title">{content.headline}</h2>
          <p className="completion-celebration-description">{content.description}</p>
          <CelebrationArtwork theme={selectedTheme} />
          <div className="completion-celebration-details">
            <span>Presented to <strong>{studentName || 'Student'}</strong></span>
            <span>Mastered <strong>{skillName}</strong></span>
          </div>
          <div className="completion-celebration-actions">
            <Link
              className="completion-claim-button"
              onClick={dismiss}
              to={`/student/skills/${skillId}/certificate`}
            >
              📜 CLAIM &amp; DOWNLOAD CERTIFICATE
            </Link>
            <Link className="completion-back-button" onClick={dismiss} to="/student/skills">
              ✕ Back to Skills Overview
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
