/**
 * Classes management page
 * Allows teachers to manage classes and students
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Class, Student } from '@/types';
import { localSheetsService } from '@/services';
import { useInitialization } from '@/hooks/useInitialization';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Pencil, Trash2, Loader2 } from 'lucide-react';

export default function ClassesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { status: initStatus, isInitializing } = useInitialization();

  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Record<string, Student[]>>({});
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    grade_level: 5,
    school_year: '2025-2026',
  });

  /**
   * Load classes and students
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const loadedClasses = await localSheetsService.getClasses();
      setClasses(loadedClasses);

      // Load student counts for each class
      const studentsByClass: Record<string, Student[]> = {};
      for (const cls of loadedClasses) {
        const classStudents = await localSheetsService.getStudents(cls.id);
        studentsByClass[cls.id] = classStudents;
      }
      setStudents(studentsByClass);
    } catch (error) {
      console.error('Failed to load classes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load classes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initStatus?.isInitialized) {
      loadData();
    }
  }, [initStatus?.isInitialized]);

  /**
   * Handle form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClass) {
        // Update existing class
        await localSheetsService.updateClass(editingClass.id, formData);
        toast({
          title: 'Success',
          description: 'Class updated successfully',
        });
      } else {
        // Create new class
        await localSheetsService.createClass(formData);
        toast({
          title: 'Success',
          description: 'Class created successfully',
        });
      }

      // Reset form and close dialog
      setFormData({ name: '', grade_level: 5, school_year: '2025-2026' });
      setIsAddDialogOpen(false);
      setEditingClass(null);

      // Reload data
      loadData();
    } catch (error) {
      console.error('Failed to save class:', error);
      toast({
        title: 'Error',
        description: 'Failed to save class. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle delete class
   */
  const handleDelete = async (classId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this class? This will not delete students.'
      )
    ) {
      return;
    }

    try {
      await localSheetsService.deleteClass(classId);
      toast({
        title: 'Success',
        description: 'Class deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete class:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete class. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Open edit dialog
   */
  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      grade_level: cls.grade_level,
      school_year: cls.school_year,
    });
    setIsAddDialogOpen(true);
  };

  /**
   * Close dialog and reset
   */
  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingClass(null);
    setFormData({ name: '', grade_level: 5, school_year: '2025-2026' });
  };

  // Show loading or initialization status
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  if (!initStatus?.isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Workspace Not Initialized</h2>
          <p className="text-gray-600 mb-4">
            Please configure your Google Drive folder first.
          </p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Classes & Students</h1>
            <p className="text-gray-600">
              Manage your classes and students for the school year
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleCloseDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingClass ? 'Edit Class' : 'Add New Class'}
                </DialogTitle>
                <DialogDescription>
                  {editingClass
                    ? 'Update the class information'
                    : 'Create a new class for your school'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Class Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., 5A, 7B"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="grade_level">Grade Level</Label>
                  <Select
                    value={formData.grade_level.toString()}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        grade_level: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 6, 7, 8].map((grade) => (
                        <SelectItem key={grade} value={grade.toString()}>
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="school_year">School Year</Label>
                  <Input
                    id="school_year"
                    value={formData.school_year}
                    onChange={(e) =>
                      setFormData({ ...formData, school_year: e.target.value })
                    }
                    placeholder="e.g., 2025-2026"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingClass ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Classes List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first class to get started
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{cls.name}</h3>
                    <p className="text-sm text-gray-600">
                      Grade {cls.grade_level} · {cls.school_year}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(cls)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cls.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center text-gray-600 mb-4">
                  <Users className="h-4 w-4 mr-2" />
                  <span>
                    {students[cls.id]?.length || 0} student
                    {students[cls.id]?.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/classes/${cls.id}/students`)}
                >
                  Manage Students
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
