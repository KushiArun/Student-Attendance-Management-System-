import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ExportAttendance = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);

  React.useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const { data } = await supabase
      .from('classes')
      .select('*')
      .order('grade');
    
    if (data) setClasses(data);
  };

  const exportToCSV = async () => {
    if (!selectedClass) {
      toast({
        title: "No Class Selected",
        description: "Please select a class to export",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select(`
          *,
          students (
            student_id,
            full_name,
            email
          )
        `)
        .eq('class_id', selectedClass)
        .order('date', { ascending: false });

      if (error) throw error;

      // Create CSV content
      const headers = ['Date', 'Student ID', 'Student Name', 'Email', 'Status', 'Notes'];
      const csvRows = [headers.join(',')];

      attendanceData?.forEach(record => {
        const row = [
          format(new Date(record.date), 'yyyy-MM-dd'),
          record.students?.student_id || '',
          record.students?.full_name || '',
          record.students?.email || '',
          record.status,
          record.notes || ''
        ];
        csvRows.push(row.map(cell => `"${cell}"`).join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();

      toast({
        title: "Success",
        description: "Attendance exported successfully"
      });
    } catch (error) {
      console.error('Error exporting:', error);
      toast({
        title: "Error",
        description: "Failed to export attendance",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!selectedClass) {
      toast({
        title: "No Class Selected",
        description: "Please select a class to export",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select(`
          *,
          students (
            student_id,
            full_name,
            email
          )
        `)
        .eq('class_id', selectedClass)
        .order('date', { ascending: false });

      if (error) throw error;

      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Attendance Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 28);

      // Prepare table data
      const tableData = attendanceData?.map(record => [
        format(new Date(record.date), 'yyyy-MM-dd'),
        record.students?.student_id || '',
        record.students?.full_name || '',
        record.students?.email || '',
        record.status,
        record.notes || ''
      ]) || [];

      // Add table
      autoTable(doc, {
        startY: 35,
        head: [['Date', 'Student ID', 'Student Name', 'Email', 'Status', 'Notes']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      });

      doc.save(`attendance_${format(new Date(), 'yyyy-MM-dd')}.pdf`);

      toast({
        title: "Success",
        description: "Attendance exported as PDF successfully"
      });
    } catch (error) {
      console.error('Error exporting:', error);
      toast({
        title: "Error",
        description: "Failed to export attendance as PDF",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToPDF();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Attendance
        </CardTitle>
        <CardDescription>
          Download attendance records in CSV or PDF format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Class</label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} - {cls.grade} {cls.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Export Format</label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={exportFormat === 'csv' ? 'default' : 'outline'}
              onClick={() => setExportFormat('csv')}
              className="justify-start"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel (CSV)
            </Button>
            <Button
              variant={exportFormat === 'pdf' ? 'default' : 'outline'}
              onClick={() => setExportFormat('pdf')}
              className="justify-start"
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={!selectedClass || loading}
          className="w-full"
        >
          {loading ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportAttendance;
