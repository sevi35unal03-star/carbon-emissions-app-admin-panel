import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import AdminLayout from './layouts/AdminLayout';
import FaydaliBilgiler from './pages/FaydalıBilgiler/FaydalıBilgiler';
import KarbonAyakIzi from './pages/KarbonAyakIzi/KarbonAyakIzi';
import DailyAnswers from './pages/DailyAnswers/DailyAnswers';
import AuditLogs from './pages/AuditLogs/AuditLogs';
import ActivityQuestions from './pages/ActivityQuestions/ActivityQuestions';
import Polls from './pages/Polls/Polls';
import Dashboard from './pages/Dashboard/Dashboard';
import Definitions from './pages/Definitions/Definitions';

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace /> } />
          <Route path="useful-informations" element={<FaydaliBilgiler />} />
          <Route path="carbon-footprint" element={<KarbonAyakIzi />} />
          <Route path="daily-answers" element={<DailyAnswers />} />
          <Route path="audit-logs" element={<AuditLogs />} />
         <Route path="definitions" element={<Definitions />} />
          <Route path="activity-questions" element={<ActivityQuestions />} />
          <Route path="polls" element={<Polls />} />
           <Route path="dashboard" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}