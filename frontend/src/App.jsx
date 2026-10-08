import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import VolunteerNavbar from './components/volunteer/VolunteerNavbar';
import AdminNavbar from './components/admin/AdminNavbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Assessment from './pages/student/Assessment';
import ClassDetails from './pages/student/ClassDetails';
import Classes from './pages/student/Classes';
import Dashboard from './pages/student/Dashboard';
import ModuleDetails from './pages/student/ModuleDetails';
import MyClasses from './pages/student/MyClasses';
import Profile from './pages/student/Profile';
import Progress from './pages/student/Progress';
import Recommendations from './pages/student/Recommendations';
import SkillDetails from './pages/student/SkillDetails';
import Skills from './pages/student/Skills';
import Certificate from './pages/student/Certificate';
import VolunteerLogin from './pages/volunteer/Login';
import VolunteerDashboard from './pages/volunteer/Dashboard';
import VolunteerStudents from './pages/volunteer/Students';
import VolunteerStudentDetails from './pages/volunteer/StudentDetails';
import ManageClasses from './pages/volunteer/ManageClasses';
import AddClass from './pages/volunteer/AddClass';
import EditClass from './pages/volunteer/EditClass';
import AddMaterial from './pages/volunteer/AddMaterial';
import ManageMaterials from './pages/volunteer/ManageMaterials';
import VolunteerRegister from './pages/volunteer/Register';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import VolunteerApprovals from './pages/admin/VolunteerApprovals';
import StudentList from './pages/admin/StudentList';
import AdminClasses from './pages/admin/Classes';
import InactiveStudents from './pages/admin/InactiveStudents';
import SkillQuiz from './pages/student/SkillQuiz';
import SkillQuizResult from './pages/student/SkillQuizResult';
import NotFound from './pages/NotFound';

function AppChrome({ children }) {
  const { role, isAuthenticated } = useAuth();
  const location = useLocation();
  const volunteerArea =
    location.pathname.startsWith('/volunteer') && location.pathname !== '/volunteer/login';

  const showVolunteerNav = volunteerArea && isAuthenticated && role === 'volunteer';
  const showAdminNav = location.pathname.startsWith('/admin') && isAuthenticated && role === 'admin';

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {showAdminNav ? <AdminNavbar /> : showVolunteerNav ? <VolunteerNavbar /> : <Navbar />}
      <main className="flex-1">{children}</main>
      {!showVolunteerNav && !showAdminNav && <Footer />}
    </div>
  );
}

function AppRoutes() {
  return (
    <AppChrome>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/volunteer/login" element={<VolunteerLogin />} />
        <Route path="/volunteer/register" element={<VolunteerRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute role="student">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assessment"
          element={
            <ProtectedRoute role="student">
              <Assessment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/recommendations"
          element={
            <ProtectedRoute role="student">
              <Recommendations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/skills"
          element={
            <ProtectedRoute role="student">
              <Skills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/skills/:skillId"
          element={
            <ProtectedRoute role="student">
              <SkillDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/skills/:skillId/certificate"
          element={
            <ProtectedRoute role="student">
              <Certificate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/skills/:skillId/module/:moduleId"
          element={
            <ProtectedRoute role="student">
              <ModuleDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/classes"
          element={
            <ProtectedRoute role="student">
              <Classes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/classes/my-registrations"
          element={
            <ProtectedRoute role="student">
              <MyClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/classes/:classId"
          element={
            <ProtectedRoute role="student">
              <ClassDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/progress"
          element={
            <ProtectedRoute role="student">
              <Progress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/skills/:skillId/quiz"
          element={
            <ProtectedRoute role="student">
              <SkillQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quiz/result/:resultId"
          element={
            <ProtectedRoute role="student">
              <SkillQuizResult />
            </ProtectedRoute>
          }
        />

        {/* Phase 9 — Volunteer */}
        <Route
          path="/volunteer/dashboard"
          element={
            <ProtectedRoute role="volunteer">
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/students"
          element={
            <ProtectedRoute role="volunteer">
              <VolunteerStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/students/:id"
          element={
            <ProtectedRoute role="volunteer">
              <VolunteerStudentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/classes"
          element={
            <ProtectedRoute role="volunteer">
              <ManageClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/classes/add"
          element={
            <ProtectedRoute role="volunteer">
              <AddClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/classes/:id/edit"
          element={
            <ProtectedRoute role="volunteer">
              <EditClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/materials"
          element={
            <ProtectedRoute role="volunteer">
              <ManageMaterials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/materials/add"
          element={
            <ProtectedRoute role="volunteer">
              <AddMaterial />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/volunteers"
          element={
            <ProtectedRoute role="admin">
              <VolunteerApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute role="admin">
              <StudentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inactive-students"
          element={
            <ProtectedRoute role="admin">
              <InactiveStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute role="admin">
              <AdminClasses />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppChrome>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
