# EWIT Attendance Management System

A comprehensive web-based attendance management system built for educational institutions. This system supports multiple user roles including Students, Teachers, HODs, Parents, and Administrators.

## 🎯 Features

### Multi-Role Dashboard
- **Admin Dashboard**: Complete control over classes, teachers, students, and system settings
- **Teacher Dashboard**: Mark attendance, view class schedules, manage student records
- **HOD Dashboard**: Department-level oversight and analytics
- **Student Dashboard**: View personal attendance records and timetables
- **Parent Dashboard**: Monitor child's attendance and receive notifications

### Core Functionality
- ✅ **Attendance Marking**: Easy-to-use interface for marking daily attendance
- 📊 **Analytics & Reports**: Visual charts and detailed attendance statistics
- 📅 **Timetable Management**: Create and manage class schedules
- 📧 **Parent Notifications**: Automated alerts for attendance updates
- 📥 **Bulk Import**: Import student/teacher data via CSV
- 📤 **Export Reports**: Export attendance data to PDF/Excel
- 🔐 **Role-Based Access Control**: Secure access based on user roles

### Calendar & Events
- Academic calendar management
- Holiday scheduling
- Event tracking

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: TanStack React Query
- **Backend**: Supabase (PostgreSQL, Authentication, Edge Functions)
- **Charts**: Recharts
- **PDF Generation**: jsPDF with AutoTable

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or bun package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:8080`

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboards/        # Role-specific dashboard components
│   ├── ui/                # Reusable UI components (shadcn)
│   ├── AttendanceMarking.tsx
│   ├── AttendanceChart.tsx
│   ├── ClassManagement.tsx
│   ├── TeacherManagement.tsx
│   ├── TimetableManagement.tsx
│   └── ...
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── pages/
│   ├── Auth.tsx           # Login/Signup page
│   ├── Dashboard.tsx      # Main dashboard
│   ├── Classes.tsx        # Class management
│   ├── Students.tsx       # Student management
│   └── ...
├── integrations/
│   └── supabase/          # Supabase client & types
└── hooks/                 # Custom React hooks
```

## 🗄️ Database Schema

### Tables
- **profiles**: User profiles with roles
- **students**: Student information
- **teachers**: Teacher information
- **classes**: Class/course details
- **attendance**: Daily attendance records
- **timetable**: Class schedules
- **calendar_events**: Academic calendar events
- **parent_notifications**: Notification logs

### User Roles
- `ADMIN` - Full system access
- `PRINCIPAL` - Institution-level access
- `HOD` - Department head access
- `TEACHER` - Class and attendance management
- `STUDENT` - View own records
- `PARENT` - View child's records




## 🔒 Security

- Row Level Security (RLS) policies on all database tables
- Role-based access control
- Secure authentication via Supabase Auth

## 📄 License

This project is proprietary software developed for EWIT.

