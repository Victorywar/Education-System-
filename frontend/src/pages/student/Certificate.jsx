import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import CertificatePreviewCard from '../../components/student/CertificatePreviewCard';
import { useAuth } from '../../context/AuthContext';
import { getSkillById } from '../../data/skills';
import { getSkillProgress } from '../../services/progressService';
import { getStudentProfile } from '../../services/studentService';
import './Certificate.css';

export default function Certificate() {
  const { skillId } = useParams();
  const skill = getSkillById(skillId);
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [generatedCertificateId] = useState(
    () => `CERT-${skillId.toUpperCase()}-${Date.now().toString().slice(-6)}`
  );

  useEffect(() => {
    if (!skill) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    Promise.all([getSkillProgress(skill.id), getStudentProfile()])
      .then(([progressResponse, profileResponse]) => {
        if (!active) return;
        setProgress(progressResponse.data);
        setStudent(profileResponse.data.student);
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.message || 'Unable to load your certificate.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [skill]);

  const qrPattern = useMemo(() => {
    const value = progress?.certificateId || '';
    return Array.from({ length: 49 }, (_, index) => {
      const code = value.charCodeAt(index % Math.max(value.length, 1)) || index;
      return ((code + index * 17) % 3) === 0;
    });
  }, [progress?.certificateId]);

  if (!skill) {
    return <div className="mx-auto max-w-2xl px-4 py-10"><Card>Course not found.</Card></div>;
  }
  if (loading) return <Loading text="Preparing your certificate..." />;

  const percentage = progress?.percentage || 0;
  const completed = percentage === 100;
  const name = student?.name || user?.name || 'Student';
  const issuedDate = progress?.certificateIssuedAt
    ? new Date(progress.certificateIssuedAt)
    : new Date();
  const averageScore = progress?.completedLevels?.length
    ? Math.round(
        progress.completedLevels.reduce((sum, level) => sum + level.score, 0) /
          progress.completedLevels.length
      )
    : 0;

  return (
    <div className="certificate-page mx-auto max-w-5xl px-4 py-8">
      <ErrorMessage message={error} />
      {!completed ? (
        <div>
          <CertificatePreviewCard skill={skill} progress={progress} student={student || user} />
          <div className="no-print mt-6 flex justify-center">
            <Link to={`/student/skills/${skill.id}`}>
              <Button>Continue Learning Modules</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <article className="certificate-sheet">
            <div className="certificate-inner">
              <p className="certificate-brand">Smart Community Education System</p>
              <div className="certificate-rule" />
              <p className="certificate-kicker">Certificate of</p>
              <h1 className="certificate-title">Skill Mastery &amp; Excellence</h1>
              <p className="certificate-award">This certificate is proudly awarded to</p>
              <p className="certificate-name">{name}</p>
              <p className="certificate-copy">
                for successfully completing all 10 levels of
              </p>
              <h2 className="certificate-course">{skill.name}</h2>
              <p className="certificate-copy">
                demonstrating dedication, curiosity, and commitment to lifelong learning.
              </p>

              <div className="certificate-stats">
                <div>
                  <span>Performance</span>
                  <strong>{averageScore}% · {averageScore >= 90 ? 'Excellent' : averageScore >= 80 ? 'Very Good' : 'Achieved'}</strong>
                </div>
                <div>
                  <span>Total XP</span>
                  <strong>{progress.totalXp}</strong>
                </div>
              </div>

              <div className="certificate-footer">
                <div>
                  <span className="certificate-signature">SCES Learning Team</span>
                  <span className="certificate-meta">Authorized Program</span>
                </div>
                <div className="certificate-seal" aria-label="Verified certificate seal">
                  <span>SCES</span>
                  <small>VERIFIED</small>
                </div>
                <div className="certificate-date">
                  <span className="certificate-signature">
                    {issuedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="certificate-meta">Issue Date</span>
                </div>
              </div>
              <div className="certificate-verification">
                <div className="certificate-qr" aria-hidden="true">
                  {qrPattern.map((filled, index) => (
                    <span className={filled ? 'filled' : ''} key={index} />
                  ))}
                </div>
                <div>
                  <span className="certificate-meta">Certificate ID</span>
                  <strong>{progress.certificateId || generatedCertificateId}</strong>
                  <span className="certificate-meta">
                    {progress.certificateId
                      ? 'Keep this ID to verify your achievement.'
                      : 'Certificate verification ID'}
                  </span>
                </div>
              </div>
            </div>
          </article>
          <div className="no-print mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={() => window.print()}>Download PDF / Print</Button>
            <Link to={`/student/skills/${skill.id}`}><Button variant="outline">Back to Course</Button></Link>
          </div>
        </>
      )}
    </div>
  );
}
