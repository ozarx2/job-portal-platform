import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoleManagement = ({ token }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const [editRole, setEditRole] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const availablePermissions = [
    { id: 'user_management', name: 'User Management', description: 'Create, edit, and delete users' },
    { id: 'job_management', name: 'Job Management', description: 'Create, edit, and delete job postings' },
    { id: 'application_management', name: 'Application Management', description: 'View and manage job applications' },
    { id: 'lead_management', name: 'Lead Management', description: 'Manage CRM leads and prospects' },
    { id: 'analytics_view', name: 'Analytics View', description: 'Access to dashboard analytics and reports' },
    { id: 'admin_settings', name: 'Admin Settings', description: 'Access to system settings and configurations' },
    { id: 'candidate_access', name: 'Candidate Access', description: 'Access to candidate dashboard features' },
    { id: 'employer_access', name: 'Employer Access', description: 'Access to employer dashboard features' },
    { id: 'agent_access', name: 'Agent Access', description: 'Access to agent dashboard features' },
    { id: 'hr_access', name: 'HR Access', description: 'Access to HR dashboard features' }
  ];

  const predefinedRoles = [
    {
      name: 'admin',
      description: 'Full system access with all permissions',
      permissions: availablePermissions.map(p => p.id)
    },
    {
      name: 'employer',
      description: 'Can manage jobs and view applications',
      permissions: ['job_management', 'application_management', 'analytics_view', 'employer_access']
    },
    {
      name: 'candidate',
      description: 'Can apply for jobs and manage profile',
      permissions: ['candidate_access']
    },
    {
      name: 'agent',
      description: 'Can manage leads and prospects',
      permissions: ['lead_management', 'analytics_view', 'agent_access']
    },
    {
      name: 'hr',
      description: 'Can manage applications and candidates',
      permissions: ['application_management', 'analytics_view', 'hr_access']
    },
    {
      name: 'manager',
      description: 'Can view analytics and manage team',
      permissions: ['analytics_view', 'application_management', 'lead_management']
    }
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      // For now, we'll use predefined roles
      // In a real implementation, this would fetch from the API
      setRoles(predefinedRoles);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In a real implementation, this would make an API call
      const role = {
        ...newRole,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      setRoles([...roles, role]);
      setSuccess('Role created successfully');
      setShowCreateModal(false);
      setNewRole({ name: '', description: '', permissions: [] });
    } catch (err) {
      console.error('Error creating role:', err);
      setError('Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In a real implementation, this would make an API call
      setRoles(roles.map(role => 
        role.name === editingRole.name 
          ? { ...role, ...editRole }
          : role
      ));
      
      setSuccess('Role updated successfully');
      setShowEditModal(false);
      setEditingRole(null);
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleName) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    setLoading(true);
    try {
      // In a real implementation, this would make an API call
      setRoles(roles.filter(role => role.name !== roleName));
      setSuccess('Role deleted successfully');
    } catch (err) {
      console.error('Error deleting role:', err);
      setError('Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setEditRole({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setShowEditModal(true);
  };

  const togglePermission = (permissionId, isEdit = false) => {
    if (isEdit) {
      setEditRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permissionId)
          ? prev.permissions.filter(p => p !== permissionId)
          : [...prev.permissions, permissionId]
      }));
    } else {
      setNewRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permissionId)
          ? prev.permissions.filter(p => p !== permissionId)
          : [...prev.permissions, permissionId]
      }));
    }
  };

  const getPermissionName = (permissionId) => {
    const permission = availablePermissions.find(p => p.id === permissionId);
    return permission ? permission.name : permissionId;
  };

  const getPermissionDescription = (permissionId) => {
    const permission = availablePermissions.find(p => p.id === permissionId);
    return permission ? permission.description : '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
          <p className="text-gray-600">Define roles and their permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Role
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role, index) => (
          <div key={role.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 capitalize">{role.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(role)}
                  className="text-blue-600 hover:text-blue-900 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRole(role.name)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Permissions:</h4>
              <div className="flex flex-wrap gap-1">
                {role.permissions.map(permissionId => (
                  <span
                    key={permissionId}
                    className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {getPermissionName(permissionId)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Role</h3>
            <form onSubmit={handleCreateRole}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    required
                    value={newRole.name}
                    onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., supervisor, coordinator"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    value={newRole.description}
                    onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Describe the role's responsibilities..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {availablePermissions.map(permission => (
                      <label key={permission.id} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRole.permissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Role</h3>
            <form onSubmit={handleUpdateRole}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    required
                    value={editRole.name}
                    onChange={(e) => setEditRole({...editRole, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    value={editRole.description}
                    onChange={(e) => setEditRole({...editRole, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {availablePermissions.map(permission => (
                      <label key={permission.id} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editRole.permissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id, true)}
                          className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
