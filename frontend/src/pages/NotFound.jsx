import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card className="rounded-xl text-center">
        <h1 className="text-3xl font-bold text-stone-900">Page Not Found</h1>
        <p className="mt-3 text-stone-600">
          The page you requested does not exist or may have moved.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>GO TO HOME</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
