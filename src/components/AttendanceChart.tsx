import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AttendanceChartProps {
  data: {
    date: string;
    present: number;
    absent: number;
    late: number;
  }[];
  type?: 'bar' | 'line';
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ data, type = 'bar' }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="hsl(var(--chart-1))" name="Present" />
              <Bar dataKey="late" fill="hsl(var(--chart-2))" name="Late" />
              <Bar dataKey="absent" fill="hsl(var(--chart-3))" name="Absent" />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="hsl(var(--chart-1))" name="Present" />
              <Line type="monotone" dataKey="late" stroke="hsl(var(--chart-2))" name="Late" />
              <Line type="monotone" dataKey="absent" stroke="hsl(var(--chart-3))" name="Absent" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;
