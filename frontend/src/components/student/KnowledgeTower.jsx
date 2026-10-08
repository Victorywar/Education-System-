import { useState } from 'react';
import { Link } from 'react-router-dom';
import './KnowledgeTower.css';

const FLOOR_COUNT = 10;

function TowerFloor({ level, built, active }) {
  const isFoundation = level === 1;
  const isGlass = level >= 5 && level <= 7;
  const isCrown = level >= 8 && level <= 9;
  const isSpire = level === 10;

  return (
    <div
      className={`knowledge-tower-floor ${built ? 'is-built' : 'is-blueprint'} ${
        active ? 'is-active-floor' : ''
      } ${isFoundation ? 'foundation-floor' : ''} ${isGlass ? 'glass-floor' : ''} ${
        isCrown ? 'crown-floor' : ''
      } ${isSpire ? 'spire-floor' : ''}`}
      style={{ '--floor-index': level }}
      aria-label={`Level ${level}${built ? ' built' : ' blueprint'}`}
      title={`Level ${level}${built ? ' built' : ' blueprint'}`}
    >
      {isFoundation && (
        <>
          <span className="foundation-rebar rebar-one" />
          <span className="foundation-rebar rebar-two" />
          <span className="foundation-rebar rebar-three" />
        </>
      )}
      {level >= 2 && level <= 4 && (
        <>
          <span className="steel-beam beam-left" />
          <span className="steel-beam beam-right" />
          <span className="scaffold scaffold-left" />
          <span className="scaffold scaffold-right" />
          <span className="floor-bricks" />
        </>
      )}
      {isGlass && (
        <>
          <span className="glass-window window-left" />
          <span className="glass-window window-centre" />
          <span className="glass-window window-right" />
        </>
      )}
      {isCrown && (
        <>
          <span className="observation-deck" />
          {level === 8 && <span className="helipad">H</span>}
          <span className="searchlight searchlight-left" />
          <span className="searchlight searchlight-right" />
        </>
      )}
      {isSpire && (
        <>
          <span className="mastery-rod" />
          <span className="mastery-pulse" />
        </>
      )}
      <span className="tower-floor-number">{level}</span>
    </div>
  );
}

export default function KnowledgeTower({
  currentLevel = 0,
  totalLevels = FLOOR_COUNT,
  skillName = 'Your course',
  skillId,
  onCertificateClick,
}) {
  const [showCertificate, setShowCertificate] = useState(false);
  const completedFloors = Math.min(totalLevels, Math.max(0, Number(currentLevel) || 0));
  const complete = completedFloors >= totalLevels;

  const openCertificate = () => {
    if (onCertificateClick) {
      onCertificateClick();
    } else {
      setShowCertificate(true);
    }
  };

  return (
    <section className="knowledge-tower-panel mt-8 overflow-hidden rounded-2xl border border-cyan-900/50 bg-slate-950 p-5 text-white shadow-xl sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Skyscraper of Mastery
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">{skillName}</h2>
          <p className="mt-1 text-sm text-slate-300">
            Build your tower one passed level at a time.
          </p>
        </div>
        <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100">
          {completedFloors} / {totalLevels} floors
        </span>
      </div>

      <div className={`knowledge-tower-scene mt-5 ${complete ? 'tower-complete' : ''}`}>
        <div className="tower-skyline" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        {complete && (
          <div className="tower-confetti" aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => (
              <i key={index} style={{ '--particle-index': index }} />
            ))}
          </div>
        )}
        <div className="tower-construction">
          <div className="knowledge-tower">
            {[...Array(totalLevels)].map((_, index) => {
              const level = totalLevels - index;
              const built = level <= completedFloors;
              return (
                <TowerFloor
                  key={`${skillName}-${level}`}
                  level={level}
                  built={built}
                  active={built && level === completedFloors}
                />
              );
            })}
            <div className="tower-ground" />
          </div>
        </div>
      </div>

      {complete ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/50 bg-amber-300/10 p-4">
          <p className="font-bold tracking-wide text-amber-200">
            TOWER COMPLETED — CERTIFICATE UNLOCKED
          </p>
          <button
            type="button"
            className="tower-golden-seal"
            onClick={openCertificate}
            aria-label="Open certificate"
            title="Open certificate"
          >
            ★
          </button>
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-cyan-100">
          Pass Level {Math.min(completedFloors + 1, totalLevels)} to build your next floor.
        </p>
      )}

      {showCertificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="presentation"
          onClick={() => setShowCertificate(false)}
        >
          <div
            className="max-w-sm rounded-2xl border border-amber-300 bg-slate-900 p-6 text-center shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tower-certificate-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-4xl text-amber-300">★</p>
            <h3 id="tower-certificate-title" className="mt-2 text-xl font-bold text-white">
              Mastery achieved!
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Your {skillName} tower is complete. Your certificate is ready.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link to={`/student/skills/${skillId || skillNameToSlug(skillName)}/certificate`}>
                <span className="inline-flex bg-amber-400 px-4 py-2 font-bold text-slate-950">
                  View Certificate
                </span>
              </Link>
              <button
                type="button"
                className="border border-slate-500 px-4 py-2 text-sm text-white"
                onClick={() => setShowCertificate(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function skillNameToSlug(name) {
  return {
    'Logical Reasoning & Aptitude': 'logical-reasoning',
    'Coding & Computational Thinking': 'coding',
    'Communication & Spoken English': 'communication',
    'Abacus & Mental Math': 'abacus',
    'Financial Literacy': 'financial-literacy',
    'Digital & Computer Literacy': 'digital-literacy',
  }[name] || 'logical-reasoning';
}
