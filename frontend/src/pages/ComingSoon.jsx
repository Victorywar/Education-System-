import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

/**
 * Minimal placeholder for routes that belong to later phases.
 * No fake assessment / recommendation / class / progress logic.
 */
export default function ComingSoon({ title = 'Coming Soon', phaseHint = 'a later phase' }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card className="rounded-xl text-center" title={title}>
        <p className="text-sm text-stone-600">
          This feature will be available in {phaseHint}.
        </p>
        <div className="mt-6">
          <Link to="/student/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
