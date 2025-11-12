import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, BookOpen, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Class {
  id: string;
  name: string;
  grade: string;
  section: string;
  subject: string;
  teacher_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  grade: string;
  section: string;
}

interface ClassStudent extends Student {
  enrollment_id: string;
}

const ClassManagement: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  
  // Student management states
  const [managingClass, setManagingClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  // Form states
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchAllStudents();
  }, []);

  useEffect(() => {
    if (managingClass) {
      fetchClassStudents(managingClass.id);
    }
  }, [managingClass]);

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('grade', { ascending: true })
      .order('section', { ascending: true });

    if (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive"
      });
    } else {
      setClasses(data || []);
    }
  };

  const fetchAllStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('full_name');

    if (error) {
      console.error('Error fetching students:', error);
    } else {
      setAllStudents(data || []);
    }
  };

  const fetchClassStudents = async (classId: string) => {
    const { data, error } = await supabase
      .from('student_classes')
      .select(`
        id,
        students (
          id,
          student_id,
          full_name,
          email,
          grade,
          section
        )
      `)
      .eq('class_id', classId);

    if (error) {
      console.error('Error fetching class students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    } else {
      const students = data?.map(item => ({
        ...item.students,
        enrollment_id: item.id
      })) as ClassStudent[];
      setClassStudents(students || []);
    }
  };

  const resetForm = () => {
    setName('');
    setGrade('');
    setSection('');
    setSubject('');
  };

  const handleAddClass = async () => {
    if (!name || !grade || !section) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('classes')
      .insert([{
        name,
        grade,
        section,
        subject: subject || null,
        teacher_id: null
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add class",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Class added successfully"
      });
      resetForm();
      setIsAddDialogOpen(false);
      fetchClasses();
    }
  };

  const handleEditClick = (cls: Class) => {
    setEditingClass(cls);
    setName(cls.name);
    setGrade(cls.grade);
    setSection(cls.section);
    setSubject(cls.subject || '');
  };

  const handleUpdateClass = async () => {
    if (!editingClass || !name || !grade || !section) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('classes')
      .update({
        name,
        grade,
        section,
        subject: subject || null
      })
      .eq('id', editingClass.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update class",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Class updated successfully"
      });
      resetForm();
      setEditingClass(null);
      fetchClasses();
    }
  };

  const handleDeleteClick = (cls: Class) => {
    setClassToDelete(cls);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!classToDelete) return;

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classToDelete.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Class deleted successfully"
      });
      setDeleteDialogOpen(false);
      setClassToDelete(null);
      fetchClasses();
    }
  };

  const handleManageStudents = (cls: Class) => {
    setManagingClass(cls);
  };

  const handleAddStudentToClass = async () => {
    if (!selectedStudentId || !managingClass) return;

    const { error } = await supabase
      .from('student_classes')
      .insert({
        student_id: selectedStudentId,
        class_id: managingClass.id
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add student to class",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Student added to class"
      });
      setSelectedStudentId('');
      fetchClassStudents(managingClass.id);
    }
  };

  const handleRemoveStudentFromClass = async (enrollmentId: string) => {
    const { error } = await supabase
      .from('student_classes')
      .delete()
      .eq('id', enrollmentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove student from class",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Student removed from class"
      });
      if (managingClass) {
        fetchClassStudents(managingClass.id);
      }
    }
  };

  const availableStudents = allStudents.filter(
    student => !classStudents.some(cs => cs.id === student.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Class Management
            </CardTitle>
            <CardDescription>Manage classes and sections</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
                <DialogDescription>Enter the class details below</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Class Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., V-AD"
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade *</Label>
                  <Input
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g., V"
                  />
                </div>
                <div>
                  <Label htmlFor="section">Section *</Label>
                  <Input
                    id="section"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g., AD"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <Button onClick={handleAddClass} className="w-full">
                  Add Class
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell className="font-medium">{cls.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{cls.grade}</Badge>
                </TableCell>
                <TableCell>{cls.section}</TableCell>
                <TableCell>{cls.subject || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageStudents(cls)}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(cls)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(cls)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {classes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No classes found. Click "Add Class" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={!!editingClass} onOpenChange={(open) => !open && setEditingClass(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>Update the class details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Class Name *</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-grade">Grade *</Label>
                <Input
                  id="edit-grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-section">Section *</Label>
                <Input
                  id="edit-section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-subject">Subject</Label>
                <Input
                  id="edit-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <Button onClick={handleUpdateClass} className="w-full">
                Update Class
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Class</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{classToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setClassToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Manage Students Dialog */}
        <Dialog open={!!managingClass} onOpenChange={(open) => !open && setManagingClass(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Students - {managingClass?.name}</DialogTitle>
              <DialogDescription>Add or remove students from this class</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Add Student Section */}
              <div className="flex gap-2">
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a student to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} ({student.student_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddStudentToClass}
                  disabled={!selectedStudentId}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Current Students List */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.student_id}</TableCell>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveStudentFromClass(student.enrollment_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {classStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No students enrolled in this class
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ClassManagement;
