import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../Button';
import { builderThemes, getBuilderTheme } from '../../data/builderThemes';
import './StoryBuilderCanvas.css';

function Phase({ theme, level, currentLevel, children }) {
  const complete = level <= currentLevel;
  const phaseName = theme.phases[level - 1];
  return (
    <g
      className={`story-phase ${complete ? 'phase-complete' : 'phase-blueprint'}`}
      style={{ '--phase-index': level }}
      tabIndex="0"
      role="img"
      aria-label={`Phase ${level}: ${phaseName} (${complete ? 'Completed' : 'Blueprint'})`}
    >
      <title>{`Phase ${level}: ${phaseName} (${complete ? 'Completed' : 'Blueprint'})`}</title>
      {children}
    </g>
  );
}

function Dimension({ x1, y1, x2, y2, label, labelX, labelY }) {
  return (
    <g className="draft-dimension">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <line x1={x1 - 5} y1={y1 - 5} x2={x1 + 5} y2={y1 + 5} />
      <line x1={x2 - 5} y1={y2 - 5} x2={x2 + 5} y2={y2 + 5} />
      <text x={labelX} y={labelY}>{label}</text>
    </g>
  );
}

function SkyscraperDrawing({ theme, currentLevel }) {
  return (
    <>
      <path className="draft-ground" d="M90 389H710M135 402H665" />
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
        const y = 372 - (level - 1) * 31;
        return (
          <Phase theme={theme} level={level} currentLevel={currentLevel} key={level}>
            {level === 1 && (
              <g>
                <path d="M275 370H525V388H275zM294 388v24m30-24v24m30-24v24m30-24v24m30-24v24m30-24v24m30-24v24" />
                <path d="M285 379H515M306 367v21m40-21v21m40-21v21m40-21v21m40-21v21" />
              </g>
            )}
            {level === 2 && (
              <g>
                <path d={`M275 ${y}H525V${y + 8}H275z`} />
                {[285, 305, 325, 345, 365, 385, 405, 425, 445, 465, 485, 505, 520].map((x) => (
                  <line key={x} x1={x} y1={y - 7} x2={x} y2={y + 10} />
                ))}
                <path d={`M275 ${y - 5}H525M275 ${y + 13}H525`} />
              </g>
            )}
            {level === 3 && (
              <g>
                <path d={`M290 ${y + 8}V${y - 85}m45 93V${y - 85}m45 93V${y - 85}m45 93V${y - 85}m45 93V${y - 85}`} />
                <path d={`M290 ${y - 25}H470M290 ${y - 55}H470M290 ${y - 85}H470`} />
                <path d={`M291 ${y - 25}l43-30m-43 0 43 30m2-30 43-30m-43 0 43 30m2-30 43-30`} />
              </g>
            )}
            {level === 4 && (
              <g>
                <path d={`M275 ${y}H525M275 ${y - 31}H525M275 ${y - 62}H525`} />
                <path d={`M415 ${y}V${y - 124}h46v124m-46-93h46m-46 31h46m-46 31h46`} />
                <path d={`M275 ${y - 31}H525M275 ${y - 62}H525M275 ${y - 93}H525`} />
              </g>
            )}
            {level === 5 && (
              <g>
                <path d={`M280 ${y - 2}H520v-27H280z`} />
                <path d={`M294 ${y - 4}v-23m34 23v-23m34 23v-23m34 23v-23m34 23v-23m34 23v-23`} />
                <path d={`M285 ${y - 11}h230m-230-9h230`} strokeDasharray="5 4" />
              </g>
            )}
            {level === 6 && (
              <g>
                <path d={`M280 ${y - 2}H520V${y - 29}H280z`} />
                {[292, 326, 360, 394, 428, 462, 496].map((x) => (
                  <path key={x} d={`M${x} ${y - 3}V${y - 28}m4 0v25`} />
                ))}
                <path d={`M280 ${y - 30}H520`} />
              </g>
            )}
            {level === 7 && (
              <g>
                <path d={`M280 ${y - 2}H520v-26H280z`} />
                {[300, 345, 390, 435, 480].map((x) => (
                  <g key={x}>
                    <path d={`M${x} ${y - 5}v-5`} />
                    <circle cx={x} cy={y - 14} r="3" />
                  </g>
                ))}
                <path d={`M283 ${y - 30}H517`} strokeDasharray="7 3" />
              </g>
            )}
            {level === 8 && (
              <g>
                <path d={`M265 ${y - 2}H535V${y - 11}H265z`} />
                <rect x="295" y={y - 30} width="30" height="18" />
                <rect x="337" y={y - 36} width="30" height="24" />
                <rect x="379" y={y - 26} width="30" height="14" />
                <rect x="421" y={y - 34} width="30" height="22" />
                <path d={`M295 ${y - 32}h30m12-8h30m12 12h30m12-8h30`} />
              </g>
            )}
            {level === 9 && (
              <g>
                <path d={`M280 ${y - 2}H520V${y - 17}H280zM295 ${y - 17}l15-18 15 18m30 0 15-18 15 18m30 0 15-18 15 18`} />
                <path d={`M400 ${y - 17}v-38m-10 0h20m-10-9v9`} />
              </g>
            )}
            {level === 10 && (
              <g>
                <path d="M400 32v105m-9-1 9-14 9 14m-9-31-8-10m8 10 9-10" />
                <circle cx="400" cy="30" r="8" />
                <path d="M400 18V9m-10 5 5 3m15-3-5 3" />
                <path d="M282 63h32v21h-32zM486 63h32v21h-32z" />
                <path d="M288 70h20m-20 6h15m189-6h20m-20 6h15" />
              </g>
            )}
          </Phase>
        );
      })}
      <Dimension x1="245" y1="78" x2="245" y2="377" label="10 STOREYS" labelX="170" labelY="225" />
      <Dimension x1="275" y1="425" x2="525" y2="425" label="TOWER GRID / 01" labelX="350" labelY="442" />
      <path className="draft-guide" d="M245 66h310M245 380h310M550 66v314M250 66v-15h300v15" />
    </>
  );
}

function BicycleDrawing({ theme, currentLevel }) {
  return (
    <>
      <path className="draft-ground" d="M95 370H705M110 382H690" />
      <g className="bicycle-wheel-guides">
        <circle cx="245" cy="315" r="75" />
        <circle cx="555" cy="315" r="75" />
      </g>
      {Array.from({ length: 10 }, (_, index) => {
        const level = index + 1;
        return (
          <Phase theme={theme} level={level} currentLevel={currentLevel} key={level}>
            {level === 1 && (
              <g>
                <path d="M245 315 355 215 430 315H245l75-100 50 100" />
                <circle cx="355" cy="215" r="8" />
                <path d="M345 207h20m-10-10v18m30 100h40" />
                <path d="M320 215h35" strokeWidth="5" />
              </g>
            )}
            {level === 2 && (
              <g>
                <circle cx="355" cy="315" r="13" />
                <path d="M355 315l34-13m-34 13-30 19m64-32 10 25m-74 7-10-24" />
                <circle cx="389" cy="302" r="5" />
                <circle cx="325" cy="334" r="5" />
              </g>
            )}
            {level === 3 && (
              <g>
                <path d="M430 315 455 212l28-5m-30 8h45m-48 7h45m-53-10h-20" />
                <circle cx="455" cy="212" r="7" />
                <path d="M454 205l11-14h24m-6 0h16" />
              </g>
            )}
            {level === 4 && (
              <g>
                <circle cx="245" cy="315" r="75" />
                <circle cx="555" cy="315" r="75" />
                {[0, 45, 90, 135].map((angle) => (
                  <g key={angle} transform={`rotate(${angle} 245 315)`}>
                    <path d="M170 315H320M245 240V390" />
                  </g>
                ))}
                {[0, 45, 90, 135].map((angle) => (
                  <g key={angle} transform={`rotate(${angle} 555 315)`}>
                    <path d="M480 315H630M555 240V390" />
                  </g>
                ))}
                <circle cx="245" cy="315" r="8" />
                <circle cx="555" cy="315" r="8" />
              </g>
            )}
            {level === 5 && (
              <g>
                <circle cx="245" cy="315" r="80" strokeWidth="4" />
                <circle cx="555" cy="315" r="80" strokeWidth="4" />
                <path d="M170 315h150m160 0h150" strokeDasharray="4 6" />
              </g>
            )}
            {level === 6 && (
              <g>
                <path d="M310 213c30 22 56 38 72 65m-5 35 30-11m-21 1 9 20m-40-45 21 18" />
                <circle cx="381" cy="300" r="12" />
                <path d="M386 288l8-15 24 9m-43 7-14-12m31 22 25 7" />
              </g>
            )}
            {level === 7 && (
              <g>
                <path d="M327 212 320 224l19 8m93 72 17 7 8-12m-132-85-5 20m106 59 19 9" />
                <path d="M333 218 245 315m90-92 100 75m-100-75 120 92" strokeDasharray="2 5" />
              </g>
            )}
            {level === 8 && (
              <g>
                <path d="M455 207l-7-24m-5 1h32m-10 0 25-16h20m-9 0h16m-36 16 8 8" />
                <path d="M464 184q8-10 16 0m-21 0q12-17 24 0" />
              </g>
            )}
            {level === 9 && (
              <g>
                <path d="M355 215v-44m-24 0h48m-42 0-8-8m49 8 8-8" />
                <path d="M479 200q17-22 34 0m-26 0h19m-10-4v8" />
                <circle cx="488" cy="197" r="3" fill="currentColor" />
              </g>
            )}
            {level === 10 && (
              <g>
                <path d="M185 230q60-55 120 0m190 0q60-55 120 0" strokeDasharray="7 5" />
                <path d="M362 329h38m-30 0-8 12m30-12 9 12" />
                <path d="M380 327q-7-10-15-1m22 1q7-10 15-1" />
                <path d="M380 329v-12m7 12v-12" />
              </g>
            )}
          </Phase>
        );
      })}
      <Dimension x1="170" y1="410" x2="630" y2="410" label="WHEELBASE / 01" labelX="355" labelY="430" />
      <Dimension x1="245" y1="215" x2="455" y2="215" label="FRAME DATUM" labelX="305" labelY="198" />
      <path className="draft-guide" d="M245 220V410m310-190v190M160 315h480" />
    </>
  );
}

function BridgeDrawing({ theme, currentLevel }) {
  return (
    <>
      <path className="bridge-water" d="M75 342q24-13 48 0t48 0 48 0 48 0 48 0 48 0 48 0 48 0 48 0 48 0 48 0 48 0 48 0 48 0 48 0 48 0V400H75z" />
      <path className="draft-ground" d="M70 335h160m340 0h160M80 400h640" />
      {Array.from({ length: 10 }, (_, index) => {
        const level = index + 1;
        return (
          <Phase theme={theme} level={level} currentLevel={currentLevel} key={level}>
            {level === 1 && (
              <g>
                <path d="M170 333v-23h25v23m410 0v-23h25v23" />
                <path d="M155 309h55m395 0h55M165 300h35m395 0h35" strokeDasharray="5 5" />
                <path d="M182 298v-20m410 20v-20" />
              </g>
            )}
            {level === 2 && (
              <g>
                <path d="M166 335v-62h34v62m400 0v-62h34v62" />
                <path d="M158 335h50m384 0h50M173 273v61m14-61v61m400-61v61m14-61v61" />
                <path d="M168 350v-16m30 16v-16m400 16v-16m30 16v-16" />
              </g>
            )}
            {level === 3 && (
              <g>
                <path d="M151 273h64l-10-15h-44zm400 0h64l-10-15h-44z" />
                <path d="M162 258v-12m42 12v-12m400 12v-12m42 12v-12" />
                <path d="M152 247h62m400 0h62" />
              </g>
            )}
            {level === 4 && (
              <g>
                <path d="M182 246q42 71 83 81m-83-81q95 50 190 81m-190-81q145 38 290 81m-290-81q196 37 390 81" />
                <path d="M592 246q-42 71-83 81m83-81q-95 50-190 81m190-81q-145 38-290 81m290-81q-196 37-390 81" />
                <circle cx="182" cy="246" r="5" /><circle cx="592" cy="246" r="5" />
              </g>
            )}
            {level === 5 && (
              <g>
                {[240, 290, 340, 390, 440, 490, 540].map((x) => (
                  <path key={x} d={`M${x} 327v13`} />
                ))}
                <path d="M215 327h345m-345 8h345m-330-14v17m315-17v17" />
              </g>
            )}
            {level === 6 && (
              <g>
                <path d="M215 321h345v11H215z" />
                {[225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550].map((x) => (
                  <path key={x} d={`M${x} 321v11`} />
                ))}
                <path d="M215 319h345" />
              </g>
            )}
            {level === 7 && (
              <g>
                <path d="M215 309v12m345-12v12M215 310h345m-345 5h345" />
                {[225, 260, 295, 330, 365, 400, 435, 470, 505, 540].map((x) => (
                  <path key={x} d={`M${x} 310v-8`} />
                ))}
              </g>
            )}
            {level === 8 && (
              <g>
                {[250, 350, 450, 525].map((x) => (
                  <g key={x}>
                    <path d={`M${x} 308v-34`} />
                    <path d={`M${x - 7} 274h14l-3 7h-8z`} />
                    <circle cx={x} cy="277" r="3" />
                  </g>
                ))}
              </g>
            )}
            {level === 9 && (
              <g>
                <circle cx="378" cy="292" r="7" />
                <path d="M378 299v23m-14-12h28m-14 11-11 17m11-17 12 17" />
                <circle cx="430" cy="292" r="7" />
                <path d="M430 299v23m-12-13 12-4 11 6m-11 11-10 16m10-16 12 16" />
                <path d="M385 302q15-12 29 0m-29 0-8 5m37-5 8 5" />
              </g>
            )}
            {level === 10 && (
              <g>
                <path d="M380 302q8-12 16 0m-16 0q-5 11-12 4m28-4q5 11 12 4" />
                <path d="M392 299v-7m-4 3h8m-25 12 6-4m34 4-6-4" />
                <path d="M386 300h12" strokeWidth="4" />
                <path d="M360 281l-12-12m77 12 12-12" strokeDasharray="2 4" />
              </g>
            )}
          </Phase>
        );
      })}
      <Dimension x1="135" y1="228" x2="635" y2="228" label="MAIN SPAN / 01" labelX="340" labelY="215" />
      <Dimension x1="135" y1="260" x2="135" y2="335" label="PYLON" labelX="90" labelY="303" />
      <path className="draft-guide" d="M135 236v105m500-105v105M135 335H635" />
    </>
  );
}

export default function StoryBuilderCanvas({
  currentLevel = 0,
  totalLevels = 10,
  skillName = 'Your course',
  skillId,
}) {
  const themeKey = `student_craft_theme_${skillId || skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const [selectedTheme, setSelectedTheme] = useState(() => {
    if (typeof window === 'undefined') return builderThemes[0].id;
    return getBuilderTheme(window.localStorage.getItem(themeKey)).id;
  });
  const [activePhase, setActivePhase] = useState(null);
  const level = Math.min(totalLevels, Math.max(0, Number(currentLevel) || 0));
  const theme = useMemo(() => getBuilderTheme(selectedTheme), [selectedTheme]);
  const completed = level >= totalLevels;
  const drawingProps = { theme, currentLevel: level };

  useEffect(() => {
    const levelStorageKey = `${themeKey}_last_level`;
    const storedLevel = window.localStorage.getItem(levelStorageKey);
    const lastLevel = storedLevel === null ? level : Number(storedLevel);
    const storedTheme = window.localStorage.getItem(themeKey);
    if (storedTheme && builderThemes.some((item) => item.id === storedTheme)) {
      setSelectedTheme(storedTheme);
    }
    if (level > lastLevel && lastLevel > 0) {
      setActivePhase(level);
      const timeout = window.setTimeout(() => setActivePhase(null), 1000);
      window.localStorage.setItem(levelStorageKey, String(level));
      return () => window.clearTimeout(timeout);
    }
    window.localStorage.setItem(levelStorageKey, String(level));
    return undefined;
  }, [level, themeKey]);

  const chooseTheme = (themeId) => {
    window.localStorage.setItem(themeKey, themeId);
    setSelectedTheme(themeId);
    setActivePhase(level || 1);
    window.setTimeout(() => setActivePhase(null), 850);
  };

  return (
    <section className="story-builder mt-8" aria-labelledby="story-builder-heading">
      <header className="story-builder-header">
        <div>
          <p className="story-builder-eyebrow">Your learning, built into a story</p>
          <h2 id="story-builder-heading">Story-Based Construction Canvas</h2>
          <p className="story-builder-subtitle">
            Every passed challenge adds a completed stage to your technical drawing.
          </p>
        </div>
        <span className="story-builder-counter">PHASE {level} / {totalLevels}</span>
      </header>

      <div className="story-theme-selector" role="radiogroup" aria-label="Choose a construction story">
        {builderThemes.map((item) => (
          <button
            className={`story-theme-option ${selectedTheme === item.id ? 'selected' : ''}`}
            type="button"
            role="radio"
            aria-checked={selectedTheme === item.id}
            key={item.id}
            onClick={() => chooseTheme(item.id)}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="story-canvas" key={selectedTheme}>
        <div className="story-canvas-title">
          <span>PROJECT / {theme.id.toUpperCase()}-10</span>
          <strong>{theme.title}</strong>
          <span>TECHNICAL DEVELOPMENT DRAWING</span>
        </div>
        <svg
          viewBox="0 0 800 460"
          className="story-technical-drawing"
          role="img"
          aria-label={`${theme.title}, phase ${level} of ${totalLevels} complete`}
          onMouseLeave={() => setActivePhase(null)}
          onFocus={(event) => {
            const phaseGroup = event.target.closest('.story-phase');
            if (phaseGroup) setActivePhase(Number(phaseGroup.style.getPropertyValue('--phase-index')));
          }}
          onBlur={() => setActivePhase(null)}
        >
          <defs>
            <pattern id={`draft-grid-${theme.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" className="draft-grid-line" fill="none" />
            </pattern>
            <pattern id={`draft-grid-major-${theme.id}`} width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill={`url(#draft-grid-${theme.id})`} />
              <path d="M 100 0 L 0 0 0 100" className="draft-grid-major-line" fill="none" />
            </pattern>
          </defs>
          <rect width="800" height="460" fill={`url(#draft-grid-major-${theme.id})`} />
          <path className="draft-border" d="M25 25h750v410H25z" />
          {selectedTheme === 'skyscraper' && <SkyscraperDrawing {...drawingProps} />}
          {selectedTheme === 'bicycle' && <BicycleDrawing {...drawingProps} />}
          {selectedTheme === 'bridge' && <BridgeDrawing {...drawingProps} />}
          <g className="draft-title-block">
            <path d="M595 390h165v35H595zM595 407h165M675 390v35" />
            <text x="602" y="402">SCES / LEARNING SERIES</text>
            <text x="602" y="419">PHASE {String(level).padStart(2, '0')} · REV A</text>
            <text x="685" y="419">SCALE NTS</text>
          </g>
        </svg>
        <div className="story-drawing-tooltip" aria-live="polite">
          {activePhase
            ? `Phase ${activePhase}: ${theme.phases[activePhase - 1]} ${
                activePhase <= level ? '(Completed)' : '(Blueprint)'
              }`
            : 'Focus or hover over a drawing stage for its engineering note.'}
        </div>
        <div className="story-phase-index" aria-label="Construction phases">
          {theme.phases.map((phase, index) => {
            const phaseNumber = index + 1;
            const done = phaseNumber <= level;
            return (
              <button
                type="button"
                key={phase}
                className={`${done ? 'phase-index-complete' : 'phase-index-blueprint'} ${
                  activePhase === phaseNumber ? 'phase-index-active' : ''
                }`}
                aria-label={`Phase ${phaseNumber}: ${phase} (${done ? 'Completed' : 'Blueprint'})`}
                title={`Phase ${phaseNumber}: ${phase} (${done ? 'Completed' : 'Blueprint'})`}
                onMouseEnter={() => setActivePhase(phaseNumber)}
                onFocus={() => setActivePhase(phaseNumber)}
                onBlur={() => setActivePhase(null)}
              >
                {String(phaseNumber).padStart(2, '0')}
              </button>
            );
          })}
        </div>
      </div>

      <div className="story-builder-footer">
        {completed ? (
          <>
            <p className="story-certified-stamp">CONSTRUCTION CERTIFIED — LEVEL 10 ACHIEVED</p>
            <Link to={`/student/skills/${skillId}/certificate`}>
              <Button>Download Certificate</Button>
            </Link>
          </>
        ) : (
          <p>{theme.phases[level] ? `Next: ${theme.phases[level]}` : 'Begin with the first phase.'}</p>
        )}
      </div>
    </section>
  );
}
