import { Routes, Route } from 'react-router-dom';
import UserDashboard from './UserDashboard';

export default function UserRouter() {
  return (
    <Routes>
      <Route path="/" element={<UserDashboard />} />
    </Routes>
  );
}
