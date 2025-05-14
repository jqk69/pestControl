import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function AdminUserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState({});
  const [roles, setRoles] = useState(['user', 'admin', 'technician']);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:5000/admin/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUser(response.data.user);  // Assuming API returns { user: {...} }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      }
    };

    fetchUser();
  }, [userId]);

  const handleRoleChange = (e) => {
    setUser((prevUser) => ({
      ...prevUser,
      role: e.target.value
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value
    }));
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden h-full">
        {error && <div className="text-red-500 p-4">{error}</div>}

        {/* Header Section */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">User Profile Management</h2>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {user.status?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          <p className="text-md text-gray-500 mt-2">User ID: {user.id}</p>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 pb-2 border-b border-gray-200">
                Personal Information
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={user.name || ''}
                    onChange={handleChange}
                    name="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={user.username || ''}
                    onChange={handleChange}
                    name="username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user.email || ''}
                    onChange={handleChange}
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={user.phone || ''}
                    onChange={handleChange}
                    name="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 pb-2 border-b border-gray-200">
                Account Information
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                  <select
                    value={user.role || ''}
                    onChange={handleRoleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Changing roles affects system permissions immediately
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                  <input
                    type="text"
                    value={user.joinDate || ''}
                    onChange={handleChange}
                    name="joinDate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Active</label>
                  <input
                    type="text"
                    value={user.lastLogin || ''}
                    onChange={handleChange}
                    name="lastLogin"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      value={user.status || ''}
                      onChange={handleChange}
                      name="status"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-700"
                    />
                    <button
                      onClick={() => setUser({ ...user, status: 'inactive' })} // Example for status change
                      className="px-4 py-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 pt-6 border-t border-gray-200 flex justify-end space-x-4">
            <button className="px-6 py-3 border border-gray-300 rounded-md text-md font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Reset Password
            </button>
            <button
              onClick={async () => {
                try {
                  const token = sessionStorage.getItem('token');
                  await axios.patch(`http://127.0.0.1:5000/admin/users/${user.id}`, user, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  alert('User updated successfully!');
                } catch (err) {
                  alert('Failed to update user!');
                }
              }}
              className="px-6 py-3 bg-indigo-600 rounded-md text-md font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
