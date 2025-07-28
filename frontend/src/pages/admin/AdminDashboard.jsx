import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CogIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    technicians: 0,
    regularUsers: 0,
    activeUsers: 0,
    pendingRequests: 0,
    totalOrders: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        console.log('Fetching users with token:', token);
        
        const response = await axios.get('http://127.0.0.1:5000/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Users response:', response.data);

        if (response.data && response.data.users) {
          setUsers(response.data.users);
          setFilteredUsers(response.data.users);
          updateDashboardStats(response.data.users);
        } else if (Array.isArray(response.data)) {
          setUsers(response.data);
          setFilteredUsers(response.data);
          updateDashboardStats(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchAdminStats();
  }, []);

  const updateDashboardStats = (userData) => {
    setDashboardStats({
      totalUsers: userData.length,
      technicians: userData.filter(u => u.role === 'technician').length,
      regularUsers: userData.filter(u => u.role === 'user').length,
      activeUsers: userData.filter(u => u.status === 'active').length
    });
  };
  const fetchAdminStats = async () => {
  try {
    const res = await axios.get("http://127.0.0.1:5000/admin/stats",{
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`
      }
    });
    const data = res.data;
    setDashboardStats(prev => ({
      ...prev,
      pendingRequests: data.pending_requests,
      totalOrders: data.total_orders,
      totalProducts: data.total_products,
      totalServices: data.total_services
    }));
  } catch (error) {
    console.error("Failed to fetch stats", error);
  }
}
  useEffect(() => {
    let filtered = users;

    if (filter !== 'all') {
      filtered = filtered.filter(user => user.role === filter);
    }

    if (search) {
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(search.toLowerCase()) ||
        user.phone?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [filter, search, users]);

  const handleEdit = (userId) => {
    navigate(`users/${userId}`);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:5000/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(users.filter(user => user.id !== userId));
      updateDashboardStats(users.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <GlassCard className="text-center p-8 max-w-md mx-auto">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Data</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <AnimatedButton
            variant="primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </AnimatedButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-300 mt-2">Manage users, services, and system settings</p>
            </div>
            <div className="flex items-center gap-4">
              
            </div>
          </div>
        </GlassCard>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { 
              label: 'Total Users', 
              value: dashboardStats.totalUsers, 
              color: 'blue',
              icon: UsersIcon,
              description: 'All registered users'
            },
            { 
              label: 'Technicians', 
              value: dashboardStats.technicians, 
              color: 'emerald',
              icon: CogIcon,
              description: 'Active technicians'
            },
            { 
              label: 'Regular Users', 
              value: dashboardStats.regularUsers, 
              color: 'purple',
              icon: UsersIcon,
              description: 'Customer accounts'
            },
            { 
              label: 'Active Users', 
              value: dashboardStats.activeUsers, 
              color: 'emerald',
              icon: CheckCircleIcon,
              description: 'Currently active'
            },
            { 
              label: 'Pending Requests', 
              value: dashboardStats.pendingRequests, 
              color: 'yellow',
              icon: DocumentTextIcon,
              description: 'Awaiting approval'
            },
            { 
              label: 'Total Orders', 
              value: dashboardStats.totalOrders, 
              color: 'orange',
              icon: BuildingStorefrontIcon,
              description: 'Processed orders'
            },
          ].map((stat) => (
            <div key={stat.label} className={`p-6 text-center bg-${stat.color}-500/10 rounded-xl border border-${stat.color}-500/30`}>
              <stat.icon className={`w-8 h-8 mx-auto mb-3 text-${stat.color}-400`} />
              <h3 className={`text-3xl font-bold text-${stat.color}-400 mb-1`}>{stat.value}</h3>
              <p className="text-white font-medium">{stat.label}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Quick Access */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6 text-blue-400" />
            Quick Access
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { 
                label: 'Manage Store', 
                path: '/admin/store',
                color: 'blue',
                icon: BuildingStorefrontIcon,
                description: 'Manage products and inventory'
              },
              { 
                label: 'Manage Services', 
                path: '/admin/services',
                color: 'emerald',
                icon: ShieldCheckIcon,
                description: 'Configure service offerings'
              },
              { 
                label: 'View Reports', 
                path: '/admin/reports',
                color: 'purple',
                icon: ChartBarIcon,
                description: 'Business analytics and insights'
              },
              { 
                label: 'Leave Management', 
                path: '/admin/leave-management',
                color: 'orange',
                icon: CalendarDaysIcon,
                description: 'Manage technician leaves'
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`p-6 bg-${item.color}-500/10 rounded-xl border border-${item.color}-500/30 hover:bg-${item.color}-500/20 transition-all duration-300 cursor-pointer h-full`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className={`w-10 h-10 text-${item.color}-400 mb-4`} />
                <h3 className="text-xl font-bold text-white mb-2">{item.label}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Filters and Users Table */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-blue-400" />
            User Management
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username, email, or phone..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all" className="bg-gray-800">All Roles</option>
                <option value="user" className="bg-gray-800">Users</option>
                <option value="technician" className="bg-gray-800">Technicians</option>
                <option value="admin" className="bg-gray-800">Admins</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center bg-white/5">
                <UsersIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
                <p className="text-gray-400">
                  {users.length === 0 ? 'No users in the system yet' : 'No users match your search criteria'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <AnimatePresence>
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                {(user.username || user.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">{user.username || 'N/A'}</div>
                                <div className="text-sm text-gray-400">{user.name || 'No name'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">{user.email || 'No email'}</div>
                            <div className="text-sm text-gray-400">{user.phone || 'No phone'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : user.role === 'technician' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role || 'user'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {(user.status || 'active') === 'active' ? (
                                <CheckCircleIcon className="w-5 h-5 text-emerald-400 mr-2" />
                              ) : (
                                <XCircleIcon className="w-5 h-5 text-red-400 mr-2" />
                              )}
                              <span className={`text-sm ${(user.status || 'active') === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {user.status || 'active'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <AnimatedButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(user.id)}
                                icon={<EyeIcon className="w-4 h-4" />}
                              >
                                View
                              </AnimatedButton>
                              <AnimatedButton
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(user.id)}
                                icon={<TrashIcon className="w-4 h-4" />}
                              >
                                Delete
                              </AnimatedButton>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminDashboard;