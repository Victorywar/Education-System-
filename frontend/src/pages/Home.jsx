import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

export default function Home() {
  const features = [
    {
      title: 'Personalized Learning',
      text: 'Discover interests through a simple assessment tailored for every student.',
    },
    {
      title: 'Skill Development',
      text: 'Get content-based skill recommendations matched to your strengths.',
    },
    {
      title: 'Weekend Learning',
      text: 'Attend skill classes on Saturdays, Sundays, and holidays.',
    },
    {
      title: 'Community Support',
      text: 'Learn with teachers and volunteers at local community centres.',
    },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-stone-200">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(15,118,110,0.25) 0%, transparent 50%), linear-gradient(225deg, rgba(63,98,18,0.2) 0%, transparent 45%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 mb-3">
            For Every Student
          </p>
          <h1 className="max-w-3xl text-4xl md:text-6xl font-extrabold leading-tight text-stone-900">
            SMART COMMUNITY EDUCATION
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-teal-900 font-semibold">
            Personalized Skill Development for Every Student
          </p>
          <p className="mt-4 max-w-2xl text-stone-700 text-base md:text-lg leading-relaxed">
            Helping students discover their interests and access skill-development opportunities
            during weekends and holidays through community-based learning.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register"><Button>GET STARTED</Button></Link>
            <Link to="/login"><Button variant="outline">STUDENT LOGIN</Button></Link>
            <Link to="/volunteer/login"><Button variant="secondary">VOLUNTEER LOGIN</Button></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} title={f.title}>
              <p className="text-sm text-stone-600 leading-relaxed">{f.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="border border-teal-200 bg-teal-50/80 px-6 py-8">
          <h2 className="text-2xl font-bold text-teal-900">ACCESSIBILITY</h2>
          <p className="mt-3 max-w-3xl text-stone-700 leading-relaxed">
            The system is designed to be accessed through shared devices at community centres when
            students do not have personal devices. Teachers and volunteers can help students
            register, complete the interest assessment, and join weekend or holiday classes.
          </p>
        </div>
      </section>
    </div>
  );
}
