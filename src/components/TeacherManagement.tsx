import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Teacher {
  id: string;
  teacher_id: string;
  full_name: string;
  email: string | null;
  subject: string | null;
  phone: string | null;
  department: string | null;
  user_id: string | null;
  created_at: string;
}

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const { toast } = useToast();

  const [newTeacher, setNewTeacher] = useState({
    teacher_id: '',
    full_name: '',
    email: '',
    subject: '',
    phone: '',
    department: '',
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      });
    } else {
      setTeachers(data || []);
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.teacher_id || !newTeacher.full_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('teachers')
      .insert([newTeacher]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add teacher",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Teacher added successfully",
      });
      setNewTeacher({
        teacher_id: '',
        full_name: '',
        email: '',
        subject: '',
        phone: '',
        department: '',
      });
      setIsAddingTeacher(false);
      fetchTeachers();
    }
  };

  const handleUpdateTeacher = async () => {
    if (!editingTeacher) return;

    const { error } = await supabase
      .from('teachers')
      .update({
        full_name: editingTeacher.full_name,
        email: editingTeacher.email,
        subject: editingTeacher.subject,
        phone: editingTeacher.phone,
        department: editingTeacher.department,
      })
      .eq('id', editingTeacher.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update teacher",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Teacher updated successfully",
      });
      setEditingTeacher(null);
      fetchTeachers();
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', teacherId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete teacher",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Teacher removed successfully",
      });
      fetchTeachers();
    }
  };

  const resetForm = () => {
    setNewTeacher({
      teacher_id: '',
      full_name: '',
      email: '',
      subject: '',
      phone: '',
      department: '',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Teacher Management
            </CardTitle>
            <CardDescription>Add and manage teaching staff</CardDescription>
          </div>
          <Dialog open={isAddingTeacher} onOpenChange={setIsAddingTeacher}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>Enter teacher details</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teacherId">Teacher ID *</Label>
                    <Input
                      id="teacherId"
                      value={newTeacher.teacher_id}
                      onChange={(e) => setNewTeacher({ ...newTeacher, teacher_id: e.target.value })}
                      placeholder="TCH001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={newTeacher.full_name}
                      onChange={(e) => setNewTeacher({ ...newTeacher, full_name: e.target.value })}
                      placeholder="Teacher's name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                    placeholder="teacher@ewit.edu"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={newTeacher.subject} onValueChange={(value) => setNewTeacher({ ...newTeacher, subject: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50">
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={newTeacher.department} onValueChange={(value) => setNewTeacher({ ...newTeacher, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50">
                        <SelectItem value="Computer Science & Engineering">CSE</SelectItem>
                        <SelectItem value="Information Science & Engineering">ISE</SelectItem>
                        <SelectItem value="Electronics & Communication">ECE</SelectItem>
                        <SelectItem value="Mechanical Engineering">ME</SelectItem>
                        <SelectItem value="Civil Engineering">CE</SelectItem>
                        <SelectItem value="Electrical Engineering">EE</SelectItem>
                        <SelectItem value="Artificial Intelligence">AI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingTeacher(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTeacher}>Add Teacher</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No teachers found. Add your first teacher to get started.
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.teacher_id}</TableCell>
                    <TableCell>{teacher.full_name}</TableCell>
                    <TableCell>{teacher.subject || '-'}</TableCell>
                    <TableCell>{teacher.department || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {teacher.email && <div className="text-sm">{teacher.email}</div>}
                        {teacher.phone && <div className="text-sm text-muted-foreground">{teacher.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={teacher.user_id ? "default" : "secondary"}>
                        {teacher.user_id ? "Active" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTeacher(teacher)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTeacher(teacher.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Teacher Dialog */}
        <Dialog open={!!editingTeacher} onOpenChange={() => setEditingTeacher(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Teacher</DialogTitle>
              <DialogDescription>Update teacher information</DialogDescription>
            </DialogHeader>
            {editingTeacher && (
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingTeacher.full_name}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingTeacher.email || ''}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-subject">Subject</Label>
                  <Select value={editingTeacher.subject || ''} onValueChange={(value) => setEditingTeacher({ ...editingTeacher, subject: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-50">
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingTeacher.phone || ''}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingTeacher(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTeacher}>Update</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TeacherManagement;