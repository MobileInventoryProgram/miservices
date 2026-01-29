'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiLogOut, FiArrowLeft, FiEdit2, FiTrash2, FiPlus, FiBook, FiSave, FiX, FiMove } from 'react-icons/fi';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProcessDoc {
  id: number;
  title: string;
  ghostSlug: string;
  audience: 'franchise' | 'admin';
  section: string;
  displayOrder: number;
  isActive: string;
  createdAt: string;
  updatedAt: string;
}

type FormMode = 'add' | 'edit' | null;

function SortableDocRow({ doc, onEdit, onDelete }: { 
  doc: ProcessDoc; 
  onEdit: (doc: ProcessDoc) => void; 
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: doc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? 'bg-gray-100' : ''}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            title="Drag to reorder within section"
          >
            <FiMove className="w-5 h-5" />
          </button>
          <div className="text-sm font-medium text-gray-900">{doc.title}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {doc.ghostSlug}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          doc.audience === 'franchise' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {doc.audience.charAt(0).toUpperCase() + doc.audience.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {doc.section}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(doc)}
            className="text-brand-light-blue hover:text-brand-dark-blue"
            title="Edit Doc"
          >
            <FiEdit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(doc.id)}
            className="text-red-600 hover:text-red-900"
            title="Delete Doc"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminProcessDocsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [docs, setDocs] = useState<ProcessDoc[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedDoc, setSelectedDoc] = useState<ProcessDoc | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    ghostSlug: '',
    audience: 'franchise' as 'franchise' | 'admin',
    section: '',
    newSection: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (status === 'authenticated' && session?.user.role !== 'admin' && session?.user.role !== 'superadmin') {
      router.push('/members/login');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDocs();
      fetchSections();
    }
  }, [status]);

  const fetchDocs = async () => {
    try {
      const response = await fetch('/api/admin/process-docs');
      if (response.ok) {
        const data = await response.json();
        setDocs(data);
      }
    } catch (error) {
      console.error('Error fetching process docs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/process-docs/sections');
      if (response.ok) {
        const data = await response.json();
        setSections(data);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      ghostSlug: '',
      audience: 'franchise',
      section: '',
      newSection: '',
    });
    setFormMode(null);
    setSelectedDoc(null);
  };

  const handleEdit = (doc: ProcessDoc) => {
    setSelectedDoc(doc);
    setFormData({
      title: doc.title,
      ghostSlug: doc.ghostSlug,
      audience: doc.audience,
      section: doc.section,
      newSection: '',
    });
    setFormMode('edit');
  };

  const handleAddDoc = async () => {
    setSubmitting(true);
    setMessage(null);

    const sectionToUse = formData.newSection.trim() || formData.section;

    if (!sectionToUse) {
      setMessage({ type: 'error', text: 'Please select or enter a section' });
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/process-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          ghostSlug: formData.ghostSlug,
          audience: formData.audience,
          section: sectionToUse,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Process doc created successfully!' });
        fetchDocs();
        fetchSections();
        resetForm();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create process doc' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while creating the process doc' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDoc = async () => {
    if (!selectedDoc) return;
    
    setSubmitting(true);
    setMessage(null);

    const sectionToUse = formData.newSection.trim() || formData.section;

    if (!sectionToUse) {
      setMessage({ type: 'error', text: 'Please select or enter a section' });
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/process-docs/${selectedDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          ghostSlug: formData.ghostSlug,
          audience: formData.audience,
          section: sectionToUse,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Process doc updated successfully!' });
        fetchDocs();
        fetchSections();
        resetForm();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update process doc' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating the process doc' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoc = async (docId: number) => {
    if (!confirm('Are you sure you want to delete this process doc?')) return;

    try {
      const response = await fetch(`/api/admin/process-docs/${docId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Process doc deleted successfully' });
        fetchDocs();
        fetchSections();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete process doc' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while deleting the process doc' });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeDoc = docs.find(d => d.id === active.id);
    const overDoc = docs.find(d => d.id === over.id);

    if (!activeDoc || !overDoc || activeDoc.section !== overDoc.section) {
      setMessage({ type: 'error', text: 'Can only reorder within the same section' });
      return;
    }

    const section = activeDoc.section;
    const sectionDocs = docs.filter(d => d.section === section).sort((a, b) => a.displayOrder - b.displayOrder);
    
    const oldIndex = sectionDocs.findIndex((doc) => doc.id === active.id);
    const newIndex = sectionDocs.findIndex((doc) => doc.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedDocs = arrayMove(sectionDocs, oldIndex, newIndex);
    
    const updates = reorderedDocs.map((doc, index) => ({
      id: doc.id,
      displayOrder: index,
    }));

    const updatedDocs = docs.map(doc => {
      const update = updates.find(u => u.id === doc.id);
      return update ? { ...doc, displayOrder: update.displayOrder } : doc;
    });

    setDocs(updatedDocs);

    try {
      const response = await fetch('/api/admin/process-docs/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, updates }),
      });

      if (!response.ok) {
        setMessage({ type: 'error', text: 'Failed to save new order' });
        fetchDocs();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while reordering' });
      fetchDocs();
    }
  };

  const sortedDocs = [...docs].sort((a, b) => {
    if (a.section !== b.section) {
      return a.section.localeCompare(b.section);
    }
    return a.displayOrder - b.displayOrder;
  });

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
              <h1 className="text-3xl font-bold font-helvetica">Process Documentation</h1>
              <p className="mt-1 text-brand-light-blue">Manage process guides - drag to reorder within each section</p>
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
            <div className="mb-6">
              <button
                onClick={() => setFormMode('add')}
                className="flex items-center gap-2 px-6 py-3 bg-brand-light-blue text-white rounded-md hover:bg-brand-dark-blue transition-colors"
              >
                <FiPlus />
                <span>Add Process Doc</span>
              </button>
            </div>

            {sortedDocs.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghost Slug</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <SortableContext
                        items={sortedDocs.map(doc => doc.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortedDocs.map((doc) => (
                            <SortableDocRow
                              key={doc.id}
                              doc={doc}
                              onEdit={handleEdit}
                              onDelete={handleDeleteDoc}
                            />
                          ))}
                        </tbody>
                      </SortableContext>
                    </table>
                  </DndContext>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FiBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No process docs yet</h3>
                <p className="text-gray-500 mb-6">Get started by adding your first process documentation link.</p>
                <button
                  onClick={() => setFormMode('add')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-light-blue text-white rounded-md hover:bg-brand-dark-blue transition-colors"
                >
                  <FiPlus />
                  <span>Add Process Doc</span>
                </button>
              </div>
            )}
          </>
        )}

        {(formMode === 'add' || formMode === 'edit') && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-helvetica font-bold text-brand-dark-blue mb-6">
              {formMode === 'edit' ? 'Edit Process Doc' : 'Add New Process Doc'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                  placeholder="e.g., Daily Operating Procedures"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ghost CMS Page Slug *</label>
                <input
                  type="text"
                  value={formData.ghostSlug}
                  onChange={(e) => setFormData({...formData, ghostSlug: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                  placeholder="e.g., daily-operating-procedures"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">The slug from your Ghost CMS page URL</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Audience *</label>
                <select
                  value={formData.audience}
                  onChange={(e) => setFormData({...formData, audience: e.target.value as 'franchise' | 'admin'})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                >
                  <option value="franchise">Franchisee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value, newSection: ''})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                >
                  <option value="">Select existing section...</option>
                  {sections.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Or Create New Section</label>
                <input
                  type="text"
                  value={formData.newSection}
                  onChange={(e) => setFormData({...formData, newSection: e.target.value, section: ''})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-light-blue focus:border-brand-light-blue"
                  placeholder="e.g., Operating Procedures"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              {formMode === 'edit' ? (
                <button
                  onClick={handleUpdateDoc}
                  disabled={submitting || !formData.title || !formData.ghostSlug || (!formData.section && !formData.newSection)}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-light-blue text-white rounded-md hover:bg-brand-dark-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSave />
                  <span>{submitting ? 'Updating...' : 'Update Doc'}</span>
                </button>
              ) : (
                <button
                  onClick={handleAddDoc}
                  disabled={submitting || !formData.title || !formData.ghostSlug || (!formData.section && !formData.newSection)}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-light-blue text-white rounded-md hover:bg-brand-dark-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiPlus />
                  <span>{submitting ? 'Creating...' : 'Create Doc'}</span>
                </button>
              )}
              <button
                onClick={resetForm}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                <FiX />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
