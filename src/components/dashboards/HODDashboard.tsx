import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, BookOpen, BarChart3, UserPlus, GraduationCap, ClipboardList } from 'lucide-react';
import TimetableDisplay from '@/components/TimetableDisplay';
import CalendarView from '@/components/CalendarView';

const HODDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450</div>
            <p className="text-xs text-muted-foreground">+15 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Active faculty</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91%</div>
            <p className="text-xs text-muted-foreground">+2% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Same Size */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your department efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              className="h-20 flex flex-col items-center justify-center gap-2 text-center"
              variant="outline"
              onClick={() => console.log('Add Students')}
            >
              <UserPlus className="h-6 w-6" />
              <div>
                <div className="font-medium">Add Students</div>
                <div className="text-xs text-muted-foreground">Register new students</div>
              </div>
            </Button>
            
            <Button 
              className="h-20 flex flex-col items-center justify-center gap-2 text-center"
              variant="outline"
              onClick={() => console.log('Add Teacher')}
            >
              <GraduationCap className="h-6 w-6" />
              <div>
                <div className="font-medium">Add Teacher</div>
                <div className="text-xs text-muted-foreground">Add faculty member</div>
              </div>
            </Button>
            
            <Button 
              className="h-20 flex flex-col items-center justify-center gap-2 text-center"
              variant="outline"
              onClick={() => console.log('View Time Table')}
            >
              <ClipboardList className="h-6 w-6" />
              <div>
                <div className="font-medium">View Time Table</div>
                <div className="text-xs text-muted-foreground">Manage schedules</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Department Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest department updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New teacher onboarded</p>
                  <p className="text-xs text-muted-foreground">Dr. Sarah Johnson joined Mathematics dept.</p>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Class schedule updated</p>
                  <p className="text-xs text-muted-foreground">Physics lab timings changed</p>
                </div>
                <span className="text-xs text-muted-foreground">5 hours ago</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Student enrollment</p>
                  <p className="text-xs text-muted-foreground">25 new students admitted</p>
                </div>
                <span className="text-xs text-muted-foreground">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Key metrics and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Attendance Rate</span>
                <span className="text-sm font-medium">91%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Faculty Utilization</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Student Satisfaction</span>
                <span className="text-sm font-medium">4.2/5</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Resource Utilization</span>
                <span className="text-sm font-medium">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Important dates and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Department Meeting</p>
                  <p className="text-xs text-muted-foreground">Monthly review and planning</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Parent-Teacher Conference</p>
                  <p className="text-xs text-muted-foreground">Grade 10 parents meeting</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Friday, 2:00 PM</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Curriculum Review</p>
                  <p className="text-xs text-muted-foreground">Annual curriculum assessment</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Next Week</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Department Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimetableDisplay />
        </CardContent>
      </Card>

      {/* Calendar Section */}
      <CalendarView />
    </div>
  );
};

export default HODDashboard;