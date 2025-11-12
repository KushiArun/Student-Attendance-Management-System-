import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Users, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BulkImport = () => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
    }
  };

  const parseStudentData = (text: string) => {
    // Simple parser - expects format: Name, ID, Email, Grade, Section, Parent Contact
    const lines = text.split('\n').filter(line => line.trim());
    const students = [];

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 6) {
        students.push({
          full_name: parts[0],
          student_id: parts[1],
          email: parts[2],
          grade: parts[3],
          section: parts[4],
          parent_contact: parts[5]
        });
      }
    }

    return students;
  };

  const parseTeacherData = (text: string) => {
    // Simple parser - expects format: Name, ID, Email, Subject, Phone, Department
    const lines = text.split('\n').filter(line => line.trim());
    const teachers = [];

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 6) {
        teachers.push({
          full_name: parts[0],
          teacher_id: parts[1],
          email: parts[2],
          subject: parts[3],
          phone: parts[4],
          department: parts[5]
        });
      }
    }

    return teachers;
  };

  const handleStudentImport = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file to import",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Read PDF using FileReader
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // For now, using a simple text extraction
          // In production, you'd want to use a library like pdf.js
          const text = e.target?.result as string;
          const students = parseStudentData(text);

          if (students.length === 0) {
            toast({
              title: "No Data Found",
              description: "Could not extract student data from PDF",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }

          const { error } = await supabase
            .from('students')
            .insert(students);

          if (error) throw error;

          toast({
            title: "Success",
            description: `Imported ${students.length} students successfully`
          });

          setFile(null);
        } catch (error) {
          console.error('Error parsing PDF:', error);
          toast({
            title: "Import Failed",
            description: "Failed to parse PDF data. Ensure correct format.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing students:', error);
      toast({
        title: "Error",
        description: "Failed to import students",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleTeacherImport = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file to import",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const teachers = parseTeacherData(text);

          if (teachers.length === 0) {
            toast({
              title: "No Data Found",
              description: "Could not extract teacher data from PDF",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }

          const { error } = await supabase
            .from('teachers')
            .insert(teachers);

          if (error) throw error;

          toast({
            title: "Success",
            description: `Imported ${teachers.length} teachers successfully`
          });

          setFile(null);
        } catch (error) {
          console.error('Error parsing PDF:', error);
          toast({
            title: "Import Failed",
            description: "Failed to parse PDF data. Ensure correct format.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing teachers:', error);
      toast({
        title: "Error",
        description: "Failed to import teachers",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Import
        </CardTitle>
        <CardDescription>
          Upload PDF files to import students or teachers in bulk
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="students">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students">
              <Users className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="teachers">
              <UserPlus className="h-4 w-4 mr-2" />
              Teachers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <label htmlFor="student-file" className="cursor-pointer">
                  <div className="text-sm font-medium">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-muted-foreground">
                    PDF format: Name, ID, Email, Grade, Section, Parent Contact
                  </div>
                  <input
                    id="student-file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {file && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Selected: {file.name}
                  </div>
                )}
              </div>
            </div>
            <Button 
              onClick={handleStudentImport} 
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? 'Importing...' : 'Import Students'}
            </Button>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <label htmlFor="teacher-file" className="cursor-pointer">
                  <div className="text-sm font-medium">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-muted-foreground">
                    PDF format: Name, ID, Email, Subject, Phone, Department
                  </div>
                  <input
                    id="teacher-file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {file && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Selected: {file.name}
                  </div>
                )}
              </div>
            </div>
            <Button 
              onClick={handleTeacherImport} 
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? 'Importing...' : 'Import Teachers'}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Format Guidelines:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Each line should contain comma-separated values</li>
            <li>• Student format: Name, ID, Email, Grade, Section, Parent Contact</li>
            <li>• Teacher format: Name, ID, Email, Subject, Phone, Department</li>
            <li>• Ensure no blank lines between entries</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkImport;
