import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin/products');
  }, [navigate]);

  return null;
};

export default AdminDashboard;
