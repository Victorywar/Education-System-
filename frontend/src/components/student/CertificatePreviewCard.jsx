import { Link } from 'react-router-dom';
import Button from '../Button';
import './CertificatePreviewCard.css';

function CertificateArtwork({ student, skill, progress }) {
  return (
    <div className="certificate-preview-artwork">
      <p className="certificate-brand">Smart Community Education System</p>
      <div className="certificate-rule" />
      <p className="certificate-kicker">Certificate of</p>
      <h3 className="certificate-title">Skill Mastery &amp; Excellence</h3>
      <p className="certificate-award">This certificate is proudly awarded to</p>
      <p className="certificate-name">{student?.name || 'Student Name'}</p>
      <p className="certificate-copy">for successfully completing all 10 levels of</p>
      <h4 className="certificate-course">{skill?.name || 'Course Name'}</h4>
      <div className="certificate-preview-footer">
        <div className="certificate-seal" aria-label="Certificate seal">
          <span>SCES</span>
          <small>EXCELLENCE</small>
        </div>
        <div className="certificate-preview-id">
          <span className="certificate-meta">Official Certificate ID</span>
          <strong>{progress?.certificateId || 'CERTIFICATE ID · UNLOCK AT 100%'}</strong>
        </div>
      </div>
    </div>
  );
}

export default function CertificatePreviewCard({ skill, progress, student }) {
  const percentage = Math.min(100, Math.max(0, progress?.percentage || 0));
  const blur = Math.max(0, 14 - percentage * 0.14);
  const currentLevel = Math.min(
    10,
    Math.max(0, Math.round((percentage / 100) * 10))
  );
  const unlocked = percentage === 100;
  const revealStyle = {
    '--certificate-reveal': `${percentage}%`,
    '--certificate-blur': `${blur}px`,
  };

  return (
    <section
      className="certificate-preview-section mt-10"
      aria-labelledby="certificate-preview-heading"
    >
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
          Your next achievement
        </p>
        <h2 id="certificate-preview-heading" className="mt-1 text-2xl font-bold text-stone-900">
          Certificate Preview
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Keep learning to reveal the certificate you’re working toward.
        </p>
      </div>

      <div
        className={`certificate-preview-frame ${unlocked ? 'is-unlocked' : ''}`}
        style={revealStyle}
      >
        <div className="certificate-preview-blurred" aria-hidden="true">
          <CertificateArtwork student={student} skill={skill} progress={progress} />
        </div>
        <div className="certificate-preview-revealed" aria-hidden="true">
          <CertificateArtwork student={student} skill={skill} progress={progress} />
        </div>

        {unlocked ? (
          <div className="certificate-preview-unlocked">
            <span className="certificate-preview-celebration">🎉 Certificate Unlocked!</span>
            <Link to={`/student/skills/${skill.id}/certificate`}>
              <Button>DOWNLOAD / PRINT CERTIFICATE</Button>
            </Link>
          </div>
        ) : (
          <div className="certificate-preview-lock">
            <span className="certificate-preview-lock-icon" aria-hidden="true">🔒</span>
            <h3 className="text-lg font-bold text-stone-900">
              Certificate Locked — {percentage}% Revealed
            </h3>
            <p className="mt-1 max-w-md text-sm text-stone-600">
              Complete all levels to unlock, reveal, and download your official certificate!
            </p>
            <div className="certificate-preview-progress">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                <span>Learning progress</span>
                <span>Level {currentLevel} / 10</span>
              </div>
              <div
                className="mt-2 h-2.5 overflow-hidden rounded-full bg-stone-200"
                role="progressbar"
                aria-label="Certificate reveal progress"
                aria-valuenow={percentage}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-700 to-amber-500 transition-all duration-700 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
