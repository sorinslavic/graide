/**
 * Students management page for a specific class
 * Allows teachers to add, edit, and remove students
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Class, Student } from '@/types';
import { localSheetsService } from '@/services';
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
import { useToast } from '@/hooks/use-toast';
import { Plus, ArrowLeft, Pencil, Trash2, Loader2, UserPlus } from 'lucide-react';

export default function StudentsPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    student_num: '',
  });

  /**
   * Load class info and students
   */
  const loadData = async () => {
    if (!classId) return;

    try {
      setLoading(true);

      // Load class info
      const cls = await localSheetsService.getClass(classId);
      if (!cls) {
        toast({
          title: 'Error',
          description: 'Class not found',
          variant: 'destructive',
        });
        navigate('/classes');
        return;
      }
      setClassInfo(cls);

      // Load students
      const loadedStudents = await localSheetsService.getStudents(classId);
      setStudents(loadedStudents);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [classId]);

  /**
   * Handle form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) return;

    try {
      if (editingStudent) {
        // Update existing student
        await localSheetsService.updateStudent(editingStudent.id, formData);
        toast({
          title: 'Success',
          description: 'Student updated successfully',
        });
      } else {
        // Create new student
        await localSheetsService.createStudent({
          class_id: classId,
          ...formData,
        });
        toast({
          title: 'Success',
          description: 'Student added successfully',
        });
      }

      // Reset form and close dialog
      setFormData({ name: '', student_num: '' });
      setIsAddDialogOpen(false);
      setEditingStudent(null);

      // Reload data
      loadData();
    } catch (error) {
      console.error('Failed to save student:', error);
      toast({
        title: 'Error',
        description: 'Failed to save student. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle delete student
   */
  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student from the class?')) {
      return;
    }

    try {
      await localSheetsService.deleteStudent(studentId);
      toast({
        title: 'Success',
        description: 'Student removed successfully',
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete student:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove student. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Open edit dialog
   */
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      student_num: student.student_num || '',
    });
    setIsAddDialogOpen(true);
  };

  /**
   * Close dialog and reset
   */
  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingStudent(null);
    setFormData({ name: '', student_num: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Class Not Found</h2>
          <Button onClick={() => navigate('/classes')}>Back to Classes</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/classes')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {classInfo.name} Students
              </h1>
              <p className="text-gray-600">
                Grade {classInfo.grade_level} · {classInfo.school_year} ·{' '}
                {students.length} student{students.length !== 1 ? 's' : ''}
              </p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleCloseDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingStudent ? 'Edit Student' : 'Add New Student'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingStudent
                      ? 'Update the student information'
                      : `Add a new student to ${classInfo.name}`}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Student Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Maria Popescu"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="student_num">
                      Student Number (Optional)
                    </Label>
                    <Input
                      id="student_num"
                      value={formData.student_num}
                      onChange={(e) =>
                        setFormData({ ...formData, student_num: e.target.value })
                      }
                      placeholder="e.g., 12345"
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
                      {editingStudent ? 'Update' : 'Add'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Students List */}
        {students.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No students yet</h3>
            <p className="text-gray-600 mb-4">
              Add your first student to {classInfo.name}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Number
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {student.student_num || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
