import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../Card';
import { getMyMaterials, getVolunteerClasses } from '../../services/volunteerService';
import './CommunityBuilderTower.css';

const contributionLabel = (item) => item.title || item.name || 'Community contribution';

export default function CommunityBuilderTower({ totalRegisteredStudents = 0 }) {
  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [craneArriving, setCraneArriving] = useState(false);
  const previousCounts = useRef(null);
  const animationTimer = useRef(null);

  const refreshContributions = useCallback(async () => {
    try {
      const [materialsResponse, classesResponse] = await Promise.all([
        getMyMaterials(),
        getVolunteerClasses(),
      ]);
      const nextMaterials = materialsResponse.data.materials || [];
      const nextClasses = classesResponse.data.classes || [];
      const nextCounts = [nextMaterials.length, nextClasses.length];
      const hadNewContribution =
        previousCounts.current &&
        (nextCounts[0] > previousCounts.current[0] || nextCounts[1] > previousCounts.current[1]);

      setMaterials(nextMaterials);
      setClasses(nextClasses);
      setError('');
      if (hadNewContribution || (!previousCounts.current && nextCounts.some(Boolean))) {
        setCraneArriving(true);
        window.clearTimeout(animationTimer.current);
        animationTimer.current = window.setTimeout(() => setCraneArriving(false), 1800);
      }
      previousCounts.current = nextCounts;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load community contributions. Please refresh to try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshContributions();
    const refreshOnFocus = () => refreshContributions();
    window.addEventListener('focus', refreshOnFocus);
    window.addEventListener('pageshow', refreshOnFocus);
    return () => {
      window.removeEventListener('focus', refreshOnFocus);
      window.removeEventListener('pageshow', refreshOnFocus);
      window.clearTimeout(animationTimer.current);
    };
  }, [refreshContributions]);

  const materialsCount = materials.length;
  const contributionItems = [
    ...materials.map((item) => ({ ...item, contributionType: 'Study material' })),
    ...classes.map((item) => ({ ...item, contributionType: 'Scheduled class' })),
  ];
  const floors = [];
  for (let index = 0; index < contributionItems.length; index += 4) {
    floors.push(contributionItems.slice(index, index + 4));
  }
  const visibleFloors = floors.slice(-5).reverse();

  return (
    <Card className="community-builder-card mt-8 overflow-hidden rounded-2xl bg-slate-950 p-0 text-white">
      <div className="community-builder-heading flex flex-wrap items-start justify-between gap-3 p-5 sm:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            Community Center Construction
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">Your Community Builder Tower</h2>
          <p className="mt-1 text-sm text-slate-300">
            Every class and learning resource helps the community hub grow.
          </p>
        </div>
        <span className="community-hub-status">
          <i aria-hidden="true" />
          Hub Active
        </span>
      </div>

      <div className={`community-building-site ${craneArriving ? 'crane-arriving' : ''}`}>
        <svg
          className="community-crane"
          viewBox="0 0 260 185"
          role="img"
          aria-label="Animated construction crane with dangling hook"
        >
          <g className="crane-swing">
            <path d="M33 169h26L51 45H38z" fill="#f59e0b" stroke="#fde68a" strokeWidth="3" />
            <path d="M45 49 222 27l-2 11L47 61z" fill="#fbbf24" stroke="#fde68a" strokeWidth="3" />
            <path d="m53 51 68-9-51 33m-13-23 72 12m-68 39 33-49m44-17 48 18m-68-5 59 32"
              fill="none" stroke="#fde68a" strokeWidth="2" />
            <path d="M213 35v70" fill="none" stroke="#f8fafc" strokeWidth="2" />
            <path d="M205 105v14a9 9 0 0 0 18 0v-4" fill="none" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
            <circle cx="213" cy="104" r="5" fill="#f8fafc" />
            <path d="m27 170 36 0m-45 8h54" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" />
          </g>
        </svg>

        <div className="community-building">
          <div className="community-building-sign">COMMUNITY HUB</div>
          {visibleFloors.length ? (
            visibleFloors.map((floor, index) => (
              <div className="community-floor" key={`floor-${index}`}>
                {floor.map((item, brickIndex) => (
                  <button
                    className={`community-brick brick-${brickIndex + 1} ${
                      selected === item ? 'selected-brick' : ''
                    }`}
                    type="button"
                    key={`${item.contributionType}-${item._id || item.id || contributionLabel(item)}`}
                    onClick={() => setSelected(item)}
                    title={`${item.contributionType}: ${contributionLabel(item)}`}
                  >
                    <span>{brickIndex + 1}</span>
                  </button>
                ))}
              </div>
            ))
          ) : (
            <>
              <div className="community-floor empty-floor"><span>+</span><span>+</span><span>+</span><span>+</span></div>
              <div className="community-floor empty-floor"><span>+</span><span>+</span><span>+</span><span>+</span></div>
            </>
          )}
          <div className="community-building-foundation" />
        </div>
      </div>

      <div className="community-builder-stats grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
        <div className="community-stat">
          <span>Floors Built</span>
          <strong>{loading ? '…' : materialsCount}</strong>
          <small>study materials uploaded</small>
        </div>
        <div className="community-stat">
          <span>Students Housed</span>
          <strong>{Number(totalRegisteredStudents) || 0}</strong>
          <small>registered in your classes</small>
        </div>
        <div className="community-stat">
          <span>Community Hub Status</span>
          <strong className="hub-active-stat">Active &amp; Glowing</strong>
          <small>{classes.length} scheduled classes</small>
        </div>
      </div>

      {selected && (
        <div className="mx-5 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-700/50 bg-slate-900 px-4 py-3 sm:mx-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
              {selected.contributionType}
            </p>
            <p className="mt-1 font-semibold text-white">{contributionLabel(selected)}</p>
          </div>
          <button
            type="button"
            className="text-sm text-slate-300 underline"
            onClick={() => setSelected(null)}
          >
            Close
          </button>
        </div>
      )}

      {error && (
        <p className="mx-5 mb-4 text-sm text-rose-300 sm:mx-6" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-slate-700 p-5 sm:px-6">
        <Link to="/volunteer/materials/add" className="community-action">
          Add Learning Material
        </Link>
        <Link to="/volunteer/classes/add" className="community-action secondary-action">
          Schedule a Class
        </Link>
      </div>
    </Card>
  );
}
