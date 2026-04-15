import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard.tsx';
import FaydaliBilgiler from './pages/FaydalıBilgiler/FaydalıBilgiler.tsx';
import KarbonAyakIzi from './pages/KarbonAyakIzi/KarbonAyakIzi.tsx';

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
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="faydali-bilgiler" element={<FaydaliBilgiler />} />
          <Route path="karbon-ayak-izi" element={<KarbonAyakIzi />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
