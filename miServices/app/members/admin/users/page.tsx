'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { FiLogOut, FiArrowLeft, FiEdit2, FiTrash2, FiMail, FiUsers, FiUserPlus, FiUpload, FiDownload, FiFilter, FiSend, FiX, FiChevronDown } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: 'franchise' | 'admin' | 'superadmin';
  companyName: string | null;
  postCodes: string | null;
  territory: string | null;
  townsCities: string | null;
  contractLink: string | null;
  jobDescription: string | null;
  jobDescriptionLink: string | null;
  profilePicture: string | null;
  tags: string[] | null;
  isActive: string;
  createdAt: string;
}

type FormMode = 'add-franchise' | 'add-admin' | 'add-superadmin' | 'edit' | null;
type RoleFilter = 'all' | 'franchise' | 'admin' | 'superadmin';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [showBatchMenu, setShowBatchMenu] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    postCodes: '',
    territory: '',
    townsCities: '',
    contractLink: '',
    jobDescriptionLink: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user.role !== 'admin' && session?.user.role !== 'superadmin') {
      router.push('/members/login');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
      postCodes: '',
      territory: '',
      townsCities: '',
      contractLink: '',
      jobDescriptionLink: '',
    });
    setFormMode(null);
    setSelectedUser(null);
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
    return null;
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      companyName: user.companyName || '',
      postCodes: user.postCodes || '',
      territory: user.territory || '',
      townsCities: user.townsCities || '',
      contractLink: user.contractLink || '',
      jobDescriptionLink: user.jobDescriptionLink || '',
    });
    setProfilePicturePreview(user.profilePicture);
    setFormMode('edit');
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    setSubmitting(true);
    setMessage(null);

    try {
      let profilePictureUrl = selectedUser.profilePicture;
      
      if (profilePictureFile) {
        const uploadedUrl = await uploadProfilePicture(profilePictureFile);
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl;
        }
      }

      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profilePicture: profilePictureUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'User updated successfully!' });
        fetchUsers();
        resetForm();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating the user' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddUser = async (role: 'franchise' | 'admin' | 'superadmin') => {
    setSubmitting(true);
    setMessage(null);

    try {
      let profilePictureUrl = null;
      
      if (profilePictureFile) {
        profilePictureUrl = await uploadProfilePicture(profilePictureFile);
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role,
          profilePicture: profilePictureUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `User created successfully! Temporary password: ${data.temporaryPassword}` });
        fetchUsers();
        resetForm();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while creating the user' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendCredentials = async (userId: number, resetPassword: boolean = false) => {
    try {
      const response = await fetch('/api/admin/send-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, resetPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: resetPassword 
            ? `Password reset email sent! New password: ${data.temporaryPassword}` 
            : 'Credentials email sent successfully!' 
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while sending the email' });
    }
  };

  const handleBatchPasswordReset = async () => {
    if (selectedUserIds.size === 0) return;

    const confirmed = confirm(`Send password reset emails to ${selectedUserIds.size} selected user(s)?`);
    if (!confirmed) return;

    setSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    for (const userId of Array.from(selectedUserIds)) {
      try {
        const response = await fetch('/api/admin/send-credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, resetPassword: true }),
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    setMessage({ 
      type: successCount > 0 ? 'success' : 'error', 
      text: `Password resets: ${successCount} successful, ${failCount} failed` 
    });
    setSelectedUserIds(new Set());
    setSubmitting(false);
    setShowBatchMenu(false);
  };

  const handleBatchDelete = async () => {
    if (selectedUserIds.size === 0) return;

    const confirmed = confirm(`Are you sure you want to delete ${selectedUserIds.size} selected user(s)? This action cannot be undone.`);
    if (!confirmed) return;

    setSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    for (const userId of Array.from(selectedUserIds)) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    setMessage({ 
      type: successCount > 0 ? 'success' : 'error', 
      text: `Deleted ${successCount} user(s), ${failCount} failed` 
    });
    setSelectedUserIds(new Set());
    fetchUsers();
    setSubmitting(false);
    setShowBatchMenu(false);
  };

  const handleBatchEmail = () => {
    if (selectedUserIds.size === 0) {
      setMessage({ type: 'error', text: 'Please select at least one user' });
      return;
    }
    setShowEmailComposer(true);
    setShowBatchMenu(false);
  };

  const sendBatchEmail = async () => {
    if (!emailSubject || !emailBody) {
      setMessage({ type: 'error', text: 'Please enter both subject and message' });
      return;
    }

    setSubmitting(true);
    const selectedUsers = users.filter(u => selectedUserIds.has(u.id));

    try {
      const response = await fetch('/api/admin/send-bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: selectedUsers.map(u => ({
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
          })),
          subject: emailSubject,
          body: emailBody,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Email sent to ${selectedUserIds.size} user(s) successfully!` });
        setShowEmailComposer(false);
        setEmailSubject('');
        setEmailBody('');
        setSelectedUserIds(new Set());
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to send emails' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while sending emails' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'User deleted successfully' });
        fetchUsers();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while deleting the user' });
    }
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const requiredHeaders = ['firstname', 'lastname', 'email', 'role'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          setMessage({ type: 'error', text: `Missing required columns: ${missingHeaders.join(', ')}` });
          return;
        }

        let successCount = 0;
        let failCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const userData: any = {};
          
          headers.forEach((header, index) => {
            const value = values[index] || '';
            userData[header] = value;
          });

          const role = userData.role?.toLowerCase();
          if (!['franchise', 'admin', 'superadmin'].includes(role)) {
            failCount++;
            continue;
          }

          try {
            const response = await fetch('/api/admin/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firstName: userData.firstname,
                lastName: userData.lastname,
                email: userData.email,
                phone: userData.phone || '',
                companyName: userData.companyname || '',
                postCodes: userData.postcodes || '',
                territory: userData.territory || '',
                townsCities: userData.townscities || '',
                contractLink: userData.contractlink || '',
                jobDescriptionLink: userData.jobdescriptionlink || '',
                role: role,
              }),
            });

            if (response.ok) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (error) {
            failCount++;
          }
        }

        setMessage({ 
          type: successCount > 0 ? 'success' : 'error', 
          text: `CSV Import: ${successCount} users created, ${failCount} failed` 
        });
        fetchUsers();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to parse CSV file' });
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadCSVTemplate = () => {
    const template = 'firstName,lastName,email,phone,role,companyName,postCodes,territory,townsCities,contractLink,jobDescriptionLink\nJohn,Doe,john@example.com,07123456789,franchise,miServices London,SW1,London,"Westminster, Camden",https://...,\nJane,Smith,jane@example.com,07987654321,admin,,,,,https://...,https://...';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleUserSelection = (userId: number) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const toggleAllUsers = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const insertPersonalization = (tag: string) => {
    setEmailBody(emailBody + tag);
  };

  const filteredUsers = roleFilter === 'all' 
    ? users 
    : users.filter(u => u.role === roleFilter);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark-blue"></div>
      </div>
    );
  }

  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/members/admin/dashboard"
                className="flex items-center gap-2 text-brand-light-blue hover:text-white mb-2 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
              <h1 className="text-3xl font-bold font-helvetica">User Management</h1>
              <p className="mt-1 text-brand-light-blue">Manage franchisees and administrators</p>
            </div>
            <button
              onClick={async () => {
                await signOut({ redirect: false });
                router.push('/members/login');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Email Composer Modal */}
      {showEmailComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="miServices" width={120} height={40} />
                <h2 className="text-2xl font-bold text-brand-dark-blue font-helvetica">Send Email</h2>
              </div>
              <button
                onClick={() => setShowEmailComposer(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Sending to {selectedUserIds.size} selected user(s)
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                  placeholder="Email subject..."
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Message *</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => insertPersonalization('{{firstName}}')}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      + First Name
                    </button>
                    <button
                      onClick={() => insertPersonalization('{{lastName}}')}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      + Last Name
                    </button>
                    <button
                      onClick={() => insertPersonalization('{{fullName}}')}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      + Full Name
                    </button>
                  </div>
                </div>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                  placeholder="Dear {{firstName}},&#10;&#10;Your email message here...&#10;&#10;Best regards,&#10;miServices Team"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use {'{{firstName}}'}, {'{{lastName}}'}, or {'{{fullName}}'} for personalization
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEmailComposer(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={sendBatchEmail}
                  disabled={submitting || !emailSubject || !emailBody}
                  className="flex items-center gap-2 px-6 py-2 bg-brand-light-blue text-white rounded-md hover:bg-brand-dark-blue transition-colors disabled:opacity-50"
                >
                  <FiSend />
                  <span>{submitting ? 'Sending...' : 'Send Email'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-brand-dark-blue hover:text-brand-light-blue mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back</span>
        </button>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {!formMode && (
          <>
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => setFormMode('add-franchise')}
                className="flex items-center gap-2 px-6 py-3 bg-brand-light-blue text-white rounded-md hover:bg-brand-dark-blue transition-colors"
              >
                <FiUserPlus />
                <span>Add Franchisee</span>
              </button>
              <button
                onClick={() => setFormMode('add-admin')}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FiUserPlus />
                <span>Add Admin</span>
              </button>
              <button
                onClick={() => setFormMode('add-superadmin')}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <FiUserPlus />
                <span>Add Superadmin</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <FiUpload />
                <span>Import CSV</span>
              </button>
              <button
                onClick={downloadCSVTemplate}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <FiDownload />
                <span>Download Template</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="hidden"
              />
            </div>

            {selectedUserIds.size > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
                <p className="text-blue-800 font-medium">{selectedUserIds.size} user(s) selected</p>
                <div className="relative">
                  <button
                    onClick={() => setShowBatchMenu(!showBatchMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <span>Batch Actions</span>
                    <FiChevronDown />
                  </button>
                  {showBatchMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <button
                        onClick={handleBatchPasswordReset}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                      >
                        <FiMail className="text-blue-600" />
                        <span>Send Password Reset</span>
                      </button>
                      <button
                        onClick={handleBatchEmail}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                      >
                        <FiSend className="text-green-600" />
                        <span>Send Custom Email</span>
                      </button>
                      <button
                        onClick={handleBatchDelete}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-red-600"
                      >
                        <FiTrash2 />
                        <span>Delete Selected</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiUsers className="w-6 h-6 text-brand-light-blue" />
                    <h2 className="text-xl font-helvetica font-bold text-brand-dark-blue">
                      All Users ({filteredUsers.length})
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiFilter className="w-5 h-5 text-gray-500" />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                    >
                      <option value="all">All Roles</option>
                      <option value="franchise">Franchisees</option>
                      <option value="admin">Admins</option>
                      <option value="superadmin">Superadmins</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                          onChange={toggleAllUsers}
                          className="w-4 h-4 text-brand-light-blue border-gray-300 rounded focus:ring-brand-light-blue"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post Codes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => {
                      const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
                      return (
                        <tr key={user.id} className={selectedUserIds.has(user.id) ? 'bg-blue-50' : ''}>
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.has(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="w-4 h-4 text-brand-light-blue border-gray-300 rounded focus:ring-brand-light-blue"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.profilePicture ? (
                                <div className="relative h-10 w-10 rounded-full mr-3">
                                  <Image
                                    src={user.profilePicture}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    fill
                                    className="rounded-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-brand-light-blue flex items-center justify-center mr-3">
                                  <span className="text-white font-bold text-sm">{initials}</span>
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                {user.companyName && (
                                  <div className="text-sm text-gray-500">{user.companyName}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'franchise' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {user.role === 'franchise' ? (user.postCodes || '-') : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-brand-light-blue hover:text-brand-dark-blue"
                                title="Edit User"
                              >
                                <FiEdit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleSendCredentials(user.id, true)}
                                className="text-green-600 hover:text-green-900"
                                title="Send Password Reset"
                              >
                                <FiMail className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete User"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {(formMode === 'add-franchise' || formMode === 'add-admin' || formMode === 'add-superadmin' || formMode === 'edit') && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-helvetica font-bold text-brand-dark-blue mb-6">
              {formMode === 'edit' 
                ? `Edit ${selectedUser?.role === 'franchise' ? 'Franchisee' : selectedUser?.role === 'superadmin' ? 'Superadmin' : 'Admin'}` 
                : `Add New ${formMode === 'add-franchise' ? 'Franchisee' : formMode === 'add-superadmin' ? 'Superadmin' : 'Admin'}`
              }
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
              <div className="flex items-center gap-4">
                {profilePicturePreview ? (
                  <div className="relative h-24 w-24 rounded-full overflow-hidden">
                    <Image
                      src={profilePicturePreview}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <FiUserPlus className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div>
                  <button
                    type="button"
                    onClick={() => profilePictureInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Choose Image
                  </button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max 5MB)</p>
                </div>
                <input
                  ref={profilePictureInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                  required
                  disabled={formMode === 'edit'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                />
              </div>

              {(formMode === 'add-franchise' || (formMode === 'edit' && selectedUser?.role === 'franchise')) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Post Codes</label>
                    <input
                      type="text"
                      value={formData.postCodes}
                      onChange={(e) => setFormData({...formData, postCodes: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                      placeholder="e.g., SW1A, W1A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                    <input
                      type="text"
                      value={formData.territory}
                      onChange={(e) => setFormData({...formData, territory: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                      placeholder="e.g., miServices Chester"
                    />
                    <p className="mt-1 text-xs text-gray-500">Note: Franchisees with the same territory name will share the same profile page</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Towns/Cities</label>
                    <input
                      type="text"
                      value={formData.townsCities}
                      onChange={(e) => setFormData({...formData, townsCities: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                      placeholder="e.g., Westminster, Camden"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Contract Link (URL)</label>
                <input
                  type="url"
                  value={formData.contractLink}
                  onChange={(e) => setFormData({...formData, contractLink: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              {formMode === 'edit' ? (
                <button
                  onClick={handleUpdateUser}
                  disabled={submitting || !formData.firstName || !formData.lastName || !formData.email}
                  className="px-6 py-3 bg-brand-light-blue text-white rounded-md hover:bg-brand-dark-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Updating...' : 'Update User'}
                </button>
              ) : (
                <button
                  onClick={() => handleAddUser(
                    formMode === 'add-franchise' ? 'franchise' : 
                    formMode === 'add-superadmin' ? 'superadmin' : 'admin'
                  )}
                  disabled={submitting || !formData.firstName || !formData.lastName || !formData.email}
                  className="px-6 py-3 bg-brand-light-blue text-white rounded-md hover:bg-brand-dark-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : `Create ${formMode === 'add-franchise' ? 'Franchisee' : formMode === 'add-superadmin' ? 'Superadmin' : 'Admin'}`}
                </button>
              )}
              <button
                onClick={resetForm}
                disabled={submitting}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
