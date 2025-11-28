import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, GraduationCap, Settings, LogOut, School, BookOpen, Trash2, Edit, Plus, Save, FileText } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import { DashboardProvider, useDashboard } from './context/DashboardContext';

function App() {
  const [showOfflineAlert, setShowOfflineAlert] = useState(!navigator.onLine);

  useEffect(() => {
    let timer;
    const handleOnline = () => setShowOfflineAlert(false);
    const handleOffline = () => {
      setShowOfflineAlert(true);
      timer = setTimeout(() => setShowOfflineAlert(false), 1000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      timer = setTimeout(() => setShowOfflineAlert(false), 1000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div className="app-container">
      {showOfflineAlert && (
        <div style={{
          background: '#ef4444', color: 'white', textAlign: 'center', padding: '0.5rem',
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, fontSize: '0.875rem', fontWeight: '500'
        }}>
          You are currently offline. Some features may be limited.
        </div>
      )}
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/register" element={<Register />} /> */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/student-dashboard/*" element={<StudentDashboard />} />
      </Routes>
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      
      if (res.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data))
        if (data.role === 'student') {
          navigate('/student-dashboard')
        } else {
          navigate('/dashboard')
        }
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('Login failed')
    }
  }

  return (
    <div className="auth-split-layout">
      <div className="auth-left">
        <div className="auth-left-content">
          <h1>Welcome to Student Record System</h1>
          <p>Manage student records, grades, and academic performance efficiently with our comprehensive management system.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="login-box">
          <div className="auth-header" style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
            <div className="auth-logo" style={{ margin: '0 0 1.5rem 0' }}>
              <School size={28} />
            </div>
            <h2 className="auth-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Sign In</h2>
            <p className="auth-subtitle" style={{ fontSize: '1rem', marginTop: 0 }}>Please enter your credentials to continue.</p>
          </div>
          
          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          <form onSubmit={handleLogin} className="login-form" style={{ padding: 0, boxShadow: 'none', border: 'none', background: 'transparent', maxWidth: '100%' }}>
            <div>
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="email"
                style={{ background: '#f8fafc' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#4f46e5', textDecoration: 'none', fontWeight: '600' }}>Forgot password?</Link>
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                style={{ background: '#f8fafc' }}
              />
            </div>
            <button type="submit" style={{ marginTop: '1.5rem', padding: '1rem', fontSize: '1rem' }}>Sign In</button>
          </form>
        </div>
      </div>
    </div>
  )
}

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(data.message)
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('Request failed')
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <School size={28} />
          </div>
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle">Enter your email to receive a reset link</p>
        </div>
        {message && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{message}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} className="login-form" style={{ padding: 0, boxShadow: 'none', border: 'none', background: 'transparent' }}>
          <div>
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@example.com" />
          </div>
          <button type="submit">Send Reset Link</button>
        </form>
        <div className="auth-footer">
          <Link to="/">Back to Login</Link>
        </div>
      </div>
    </div>
  )
}

function ResetPassword() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { token } = useParams()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      
      if (res.ok) {
        alert('Password reset successful. Please login.') // Keep alert for redirect success or use a toast + delay
        navigate('/')
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('Reset failed')
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <School size={28} />
          </div>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Enter your new password below</p>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} className="login-form" style={{ padding: 0, boxShadow: 'none', border: 'none', background: 'transparent' }}>
          <div>
            <label>New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button type="submit">Update Password</button>
        </form>
      </div>
    </div>
  )
}

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'admin' }),
      })
      const data = await res.json()
      
      if (res.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data))
        alert('Admin Registered Successfully')
        navigate('/dashboard')
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Registration failed')
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <School size={28} />
          </div>
          <h2 className="auth-title">Admin Registration</h2>
          <p className="auth-subtitle">Create an account to manage the system</p>
        </div>
        <form onSubmit={handleRegister} className="login-form" style={{ padding: 0, boxShadow: 'none', border: 'none', background: 'transparent' }}>
          <div>
            <label>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />
          </div>
          <div>
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@example.com" />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button type="submit">Register</button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/">Login</Link>
        </div>
      </div>
    </div>
  )
}function Dashboard() {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <Link to="/">Go to Login</Link>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('userInfo')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="dashboard-layout">
      {/* Topbar - Now Full Width */}
      <header className="topbar">
        <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <School size={32} className="logo-icon" />
          <div className="logo-text">
            <span className="logo-title">Student Record</span>
            <span className="logo-subtitle">College Portal</span>
          </div>
        </div>
        <h1 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '600', margin: 0, letterSpacing: '-0.025em' }}>
          Welcome To Student Record Management System
        </h1>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </header>

      <div className="dashboard-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div className="nav-section">
              <span className="nav-label">Main Menu</span>
              <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/dashboard/students" className={`nav-item ${isActive('/dashboard/students') ? 'active' : ''}`}>
                <Users size={20} />
                <span>Students</span>
              </Link>
              <Link to="/dashboard/grades" className={`nav-item ${isActive('/dashboard/grades') ? 'active' : ''}`}>
                <GraduationCap size={20} />
                <span>Grades</span>
              </Link>
              <Link to="/dashboard/records" className={`nav-item ${isActive('/dashboard/records') ? 'active' : ''}`}>
                <FileText size={20} />
                <span>Student Records</span>
              </Link>
              <Link to="/dashboard/courses" className={`nav-item ${isActive('/dashboard/courses') ? 'active' : ''}`}>
                <BookOpen size={20} />
                <span>Courses</span>
              </Link>
            </div>

            <div className="nav-section">
              <span className="nav-label">System</span>
              <Link to="/dashboard/settings" className={`nav-item ${isActive('/dashboard/settings') ? 'active' : ''}`}>
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="user-mini-profile">
              <div className="avatar">{user.name.charAt(0)}</div>
              <div className="user-details">
                <span className="name">{user.name}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Wrapper */}
        <div className="main-wrapper">
          {/* Content Area */}
          <main className="content-area">
            <DashboardProvider>
              <Routes>
                <Route path="/" element={<DashboardHome />} />
                <Route path="students" element={<StudentsManagement />} />
                <Route path="grades" element={<MarksManagement />} />
                <Route path="records" element={<StudentRecords />} />
                <Route path="courses" element={<CoursesManagement />} />
                <Route path="settings" element={<SettingsPage />} />
              </Routes>
            </DashboardProvider>
          </main>
        </div>
      </div>
    </div>
  )
}

function DashboardHome() {
  const { stats, fetchStats, loadingStats } = useDashboard();

  const COLORS = ['#475569', '#0f172a']; // Slate 600 (Secondary) & Slate 900 (Primary)

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loadingStats && !stats) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading dashboard...</div>;
  }

  if (!stats) return null;

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className="card" style={{ 
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
    }}
    >
      <div style={{ 
        padding: '0.75rem', 
        borderRadius: '0.5rem', 
        background: bgColor,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={24} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>{title}</p>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.025em' }}>{value}</p>
      </div>
    </div>
  )

  const ChartCard = ({ title, children }) => (
    <div className="card" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      padding: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: '600', letterSpacing: '-0.01em' }}>{title}</h3>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {children}
      </div>
    </div>
  )

  return (
    <div className="dashboard-home" style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0.5rem' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.875rem', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.025em' }}>Dashboard Overview</h2>
          <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Welcome back, here's what's happening today.</p>
        </div>
        <div style={{ fontSize: '0.875rem', color: '#64748b', background: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', fontWeight: '500' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon={Users} 
          color="#475569" 
          bgColor="#f1f5f9" 
        />
        <StatCard 
          title="Total Courses" 
          value={stats.totalCourses} 
          icon={BookOpen} 
          color="#0ea5e9" 
          bgColor="#e0f2fe" 
        />
        <StatCard 
          title="Pass Rate" 
          value={stats.examPerformance.length > 0 
            ? Math.round((stats.examPerformance.find(p => p.name === 'Pass')?.value || 0) / stats.examPerformance.reduce((a, b) => a + b.value, 0) * 100) + '%'
            : 'N/A'} 
          icon={GraduationCap} 
          color="#10b981" 
          bgColor="#d1fae5" 
        />
        <StatCard 
          title="Active Batches" 
          value={stats.batchDistribution.length} 
          icon={School} 
          color="#f59e0b" 
          bgColor="#fef3c7" 
        />
      </div>

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 300px)', gap: '1rem', padding: '0.25rem' }}>
        <ChartCard title="Students per Course">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.studentsPerCourse}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '13px'}} />
              <Bar dataKey="count" fill="#475569" radius={[4, 4, 0, 0]} barSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Avg Marks per Course">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.avgMarksPerCourse}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '13px'}} />
              <Bar dataKey="avgMarks" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Batch Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.batchDistribution}>
              <defs>
                <linearGradient id="colorBatch" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#475569" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="batch" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '13px'}} />
              <Area type="monotone" dataKey="count" stroke="#475569" strokeWidth={3} fillOpacity={1} fill="url(#colorBatch)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Exam Distribution (Board vs Pre-Board)">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.examPerformance}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={5}
                dataKey="value"
              >
                {stats.examPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '13px'}} />
              <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{fontSize: '13px', color: '#64748b', fontWeight: 500}} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function StudentsManagement() {
  const [students, setStudents] = useState([])
  const { courses, fetchCourses } = useDashboard(); // Use context for courses
  const [showAddModal, setShowAddModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [notification, setNotification] = useState('')
  
  // Filter States
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('')
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('')

  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: '',
    course: '',
    batch: ''
  })

  useEffect(() => {
    fetchStudents()
    fetchCourses() // Ensure courses are loaded
  }, [fetchCourses])

  const fetchStudents = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo ? userInfo.token : null

      const query = new URLSearchParams()
      if (selectedCourseFilter) query.append('course', selectedCourseFilter)
      if (selectedBatchFilter) query.append('batch', selectedBatchFilter)

      const res = await fetch(`/api/students?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      setStudents(data)
    } catch (error) {
      console.error('Failed to fetch students')
    }
  }

  // Removed local fetchCourses

  const handleSaveStudent = async (e) => {
    e.preventDefault()
    try {
      let url = '/api/auth/register'
      let method = 'POST'
      
      // Auto-generate credentials for new students
      let studentData = { ...newStudent }
      if (!isEditing) {
        // Generate email: name (lowercase, no spaces) + @example.com
        const nameSlug = studentData.name.toLowerCase().replace(/\s+/g, '')
        studentData.email = `${nameSlug}@example.com`
        // Generate password: name (as is)
        studentData.password = studentData.name
      }
      
      let body = { ...studentData, role: 'student' }

      if (isEditing) {
        url = `/api/students/${editingId}`
        method = 'PUT'
        // For edit, we use the existing data
        body = { ...studentData }
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setShowAddModal(false)
        fetchStudents()
        resetForm()
        setNotification(isEditing ? 'Student Updated Successfully' : 'Student Registered Successfully')
        setTimeout(() => setNotification(''), 2000)
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to save student')
      }
    } catch (error) {
      alert('Error saving student')
    }
  }

  const handleDeleteStudent = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchStudents()
        setNotification('Student Deleted Successfully')
        setTimeout(() => setNotification(''), 2000)
      } else {
        alert('Failed to delete student')
      }
    } catch (error) {
      alert('Error deleting student')
    }
  }

  const openAddModal = () => {
    resetForm()
    setNewStudent(prev => ({
      ...prev,
      course: selectedCourseFilter || '',
      batch: selectedBatchFilter || new Date().getFullYear().toString()
    }))
    setIsEditing(false)
    setShowAddModal(true)
  }

  const openEditModal = (student) => {
    setNewStudent({
      name: student.name,
      email: student.email,
      password: '', // Don't show password
      course: student.course ? student.course._id : '',
      batch: student.batch
    })
    setEditingId(student._id)
    setIsEditing(true)
    setShowAddModal(true)
  }

  const resetForm = () => {
    setNewStudent({ 
      name: '', 
      email: '', 
      password: '', 
      course: selectedCourseFilter || '', 
      batch: selectedBatchFilter || new Date().getFullYear().toString()
    })
    setIsEditing(false)
    setEditingId(null)
  }

  // Filter Logic
  const filteredStudents = students.filter(student => {
    if (selectedCourseFilter && (!student.course || student.course._id !== selectedCourseFilter)) return false
    if (selectedBatchFilter && student.batch !== selectedBatchFilter) return false
    return true
  })

  // Get unique batches for filter
  const uniqueBatches = [...new Set(students.map(s => s.batch))].filter(Boolean).sort().reverse()

  return (
    <div className="card">
      {notification && <div style={{ padding: '10px', background: '#dcfce7', color: '#166534', borderRadius: '4px', marginBottom: '1rem' }}>{notification}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>Students Management</h2>
        <button onClick={openAddModal} className="btn-action" style={{ width: 'auto' }}>+ Add Student</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1 }}>
          <select 
            className="filter-select"
            style={{ width: '100%' }}
            value={selectedCourseFilter} 
            onChange={e => setSelectedCourseFilter(e.target.value)}
          >
            <option value="">All Courses</option>
            {(courses || []).map(c => (
              <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <select 
            className="filter-select"
            style={{ width: '100%' }}
            value={selectedBatchFilter} 
            onChange={e => setSelectedBatchFilter(e.target.value)}
          >
            <option value="">All Batches</option>
            {uniqueBatches.map(batch => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Course</th>
              <th>Batch</th>
              {/* <th>Sem</th> Removed */}
              <th style={{ textAlign: 'right', width: '80px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student._id} className="student-row">
                  <td>
                    <div style={{ fontWeight: '500', color: '#111827' }}>{student.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{student.email}</div>
                  </td>
                  <td>
                    <span style={{ 
                      background: '#e0e7ff', color: '#3730a3', 
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500' 
                    }}>
                      {student.course ? student.course.name : '-'}
                    </span>
                  </td>
                  <td>{student.batch}</td>
                  <td>
                    {/* Semester removed from display */}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => openEditModal(student)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                        title="Edit"
                        onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(student._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                        title="Delete"
                        onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                  No students found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.25rem', color: '#1f2937' }}>
              {isEditing ? 'Edit Student Details' : 'Register New Student'}
            </h3>
            <form onSubmit={handleSaveStudent}>
              
              {/* Academic Context - "The Filter" */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Academic Context</h4>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500' }}>Course</label>
                  <select 
                    value={newStudent.course} 
                    onChange={e => setNewStudent({...newStudent, course: e.target.value})} 
                    required 
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="">Select Course</option>
                    {(courses || []).map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500' }}>Batch</label>
                    <input 
                      type="text" 
                      placeholder="Year"
                      value={newStudent.batch} 
                      onChange={e => setNewStudent({...newStudent, batch: e.target.value})} 
                      required 
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>
                  {/* Semester removed from input */}
                </div>
              </div>

              {/* Personal Info */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Student Information</h4>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={newStudent.name} 
                    onChange={e => setNewStudent({...newStudent, name: e.target.value})} 
                    required 
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                {isEditing && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500' }}>Email Address</label>
                    <input 
                      type="email" 
                      value={newStudent.email} 
                      onChange={e => setNewStudent({...newStudent, email: e.target.value})} 
                      required 
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-action" style={{ padding: '8px 20px' }}>{isEditing ? 'Update Student' : 'Register Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function CoursesManagement() {
  const { courses, fetchCourses, loadingCourses, setCourses } = useDashboard();
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCourse, setNewCourse] = useState({ name: '', code: '', totalSemesters: 8 })
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [notification, setNotification] = useState('')

  // Fetch courses on load
  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handleAddCourse = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      })
      const data = await res.json()

      if (res.ok) {
        setShowAddModal(false)
        // Update context state
        setCourses(prev => [...(prev || []), data])
        setNewCourse({ name: '', code: '', totalSemesters: 8 })
        setNotification('Course Added Successfully')
        setTimeout(() => setNotification(''), 2000)
      } else {
        alert(data.message || 'Failed to add course')
      }
    } catch (error) {
      alert('Error adding course')
    }
  }

  const refreshSelectedCourse = async (updatedCourse) => {
    if (updatedCourse && updatedCourse._id) {
      setCourses(prev => prev.map(c => c._id === updatedCourse._id ? updatedCourse : c))
      setSelectedCourse(updatedCourse)
      return
    }

    if (!selectedCourse) return
    // Force refresh from server
    fetchCourses(true);
  }

  if (selectedCourse) {
    return <CourseDetails course={selectedCourse} onBack={() => { setSelectedCourse(null); }} onUpdate={refreshSelectedCourse} />
  }

  if (loadingCourses && !courses) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading courses...</div>
  }

  const displayCourses = courses || [];

  return (
    <div className="card">
      {notification && <div style={{ padding: '10px', background: '#dcfce7', color: '#166534', borderRadius: '4px', marginBottom: '1rem' }}>{notification}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Course Management</h2>
        <button onClick={() => setShowAddModal(true)} className="btn-action" style={{ width: 'auto' }}>+ Add Course</button>
      </div>

      <div className="stats-grid">
        {displayCourses.map(course => (
          <div key={course._id} className="stat-card" onClick={() => setSelectedCourse(course)} style={{ cursor: 'pointer' }}>
            <h3>{course.code}</h3>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '10px 0' }}>{course.name}</p>
            <p style={{ color: '#666' }}>{course.totalSemesters} Semesters</p>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h3>Add New Course</h3>
            <form onSubmit={handleAddCourse}>
              <div style={{ marginBottom: '10px' }}>
                <label>Course Name (e.g. Bachelor in Information Management):</label>
                <input 
                  type="text" 
                  value={newCourse.name} 
                  onChange={e => setNewCourse({...newCourse, name: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Course Code (e.g. BIM):</label>
                <input 
                  type="text" 
                  value={newCourse.code} 
                  onChange={e => setNewCourse({...newCourse, code: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label>Total Semesters:</label>
                <input 
                  type="number" 
                  value={newCourse.totalSemesters} 
                  onChange={e => setNewCourse({...newCourse, totalSemesters: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-action">Save</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function CourseDetails({ course, onBack, onUpdate }) {
  const [activeSemester, setActiveSemester] = useState(1)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [newSubject, setNewSubject] = useState({ name: '', code: '', creditHours: 3 })
  const [notification, setNotification] = useState('')

  // Helper to get subjects for current semester
  const currentSemesterData = course.curriculum.find(c => c.semester === activeSemester)
  const subjects = currentSemesterData ? currentSemesterData.subjects : []

  const handleAddSubject = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/courses/${course._id}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSubject, semester: activeSemester })
      })
      const data = await res.json()
      if (res.ok) {
        setNotification('Subject Added Successfully')
        setTimeout(() => {
          setNotification('')
          setShowAddSubject(false)
          setNewSubject({ name: '', code: '', creditHours: 3 })
          if (onUpdate) {
            onUpdate(data.course)
          } else {
            onBack()
          }
        }, 2000)
      } else {
        setNotification(data.message || 'Failed to add subject')
        setTimeout(() => setNotification(''), 3000)
      }
    } catch (error) {
      setNotification('Error adding subject')
      setTimeout(() => setNotification(''), 3000)
    }
  }

  return (
    <div className="card">
      <button onClick={onBack} className="btn-secondary" style={{ marginBottom: '20px' }}>&larr; Back to Courses</button>
      <h2>{course.name} ({course.code})</h2>
      
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0', overflowX: 'auto', paddingBottom: '10px' }}>
        {Array.from({ length: course.totalSemesters }, (_, i) => i + 1).map(sem => (
          <button 
            key={sem} 
            onClick={() => setActiveSemester(sem)}
            style={{ 
              background: activeSemester === sem ? '#0f172a' : '#f1f5f9',
              color: activeSemester === sem ? 'white' : '#333',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sem {sem}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Semester {activeSemester} Subjects</h3>
        <button onClick={() => setShowAddSubject(true)} className="btn-action" style={{ width: 'auto', fontSize: '0.9rem' }}>+ Add Subject</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Subject Name</th>
              <th>Credit Hours</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length > 0 ? (
              subjects.map((sub, idx) => (
                <tr key={idx}>
                  <td>{sub.code}</td>
                  <td>{sub.name}</td>
                  <td>{sub.creditHours}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                  No subjects added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddSubject && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h3>Add Subject to Semester {activeSemester}</h3>
            {notification && (
              <div style={{ 
                padding: '10px', marginBottom: '10px', borderRadius: '4px', 
                background: notification.toLowerCase().includes('success') ? '#dcfce7' : '#fee2e2', 
                color: notification.toLowerCase().includes('success') ? '#166534' : '#991b1b',
                textAlign: 'center'
              }}>
                {notification}
              </div>
            )}
            <form onSubmit={handleAddSubject}>
              <div style={{ marginBottom: '10px' }}>
                <label>Subject Name:</label>
                <input 
                  type="text" 
                  value={newSubject.name} 
                  onChange={e => setNewSubject({...newSubject, name: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Subject Code:</label>
                <input 
                  type="text" 
                  value={newSubject.code} 
                  onChange={e => setNewSubject({...newSubject, code: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label>Credit Hours:</label>
                <input 
                  type="number" 
                  value={newSubject.creditHours} 
                  onChange={e => setNewSubject({...newSubject, creditHours: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-action">Save</button>
                <button type="button" onClick={() => setShowAddSubject(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function MarksManagement() {
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [marks, setMarks] = useState({}) // { studentId: marks }
  
  // Filter States
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedExamType, setSelectedExamType] = useState('pre-board')
  const [selectedSubject, setSelectedSubject] = useState('')
  
  // Marks Meta
  const [fullMarks, setFullMarks] = useState(100)
  const [passMarks, setPassMarks] = useState(40)
  const [isLocked, setIsLocked] = useState(false)
  const [message, setMessage] = useState('')

  // Derived States
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [uniqueBatches, setUniqueBatches] = useState([])

  useEffect(() => {
    fetchCourses()
    fetchBatches()
  }, [])

  // When Course/Semester changes, update subjects
  useEffect(() => {
    if (selectedCourse && selectedSemester) {
      const course = courses.find(c => c._id === selectedCourse)
      if (course) {
        const semData = course.curriculum.find(s => s.semester === parseInt(selectedSemester))
        setAvailableSubjects(semData ? semData.subjects : [])
      }
    } else {
      setAvailableSubjects([])
    }
  }, [selectedCourse, selectedSemester, courses])

  // When Filters change, fetch students and existing marks
  useEffect(() => {
    if (selectedCourse && selectedBatch && selectedSemester) {
      fetchStudents()
    }
  }, [selectedCourse, selectedBatch, selectedSemester])

  // When Subject changes (and students loaded), fetch existing marks
  useEffect(() => {
    if (selectedCourse && selectedSemester && selectedExamType && selectedSubject) {
      fetchExistingMarks()
    }
  }, [selectedSubject, selectedExamType, students]) // Re-fetch if subject changes

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      setCourses(data)
    } catch (error) {
      console.error('Failed to fetch courses')
    }
  }

  const fetchBatches = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo ? userInfo.token : null
      
      const res = await fetch('/api/students/batches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      setUniqueBatches(data)
    } catch (error) {
      console.error('Failed to fetch batches')
    }
  }

  const fetchStudents = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo ? userInfo.token : null

      const query = new URLSearchParams()
      if (selectedCourse) query.append('course', selectedCourse)
      if (selectedBatch) query.append('batch', selectedBatch)
      // if (selectedSemester) query.append('semester', selectedSemester) // Don't filter students by semester

      const res = await fetch(`/api/students?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      setStudents(data)
    } catch (error) {
      console.error('Failed to fetch students')
    }
  }

  const fetchExistingMarks = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo ? userInfo.token : null

      const query = new URLSearchParams({
        courseId: selectedCourse,
        semester: selectedSemester,
        examType: selectedExamType,
        subjectName: selectedSubject
      })
      const res = await fetch(`/api/exams/subject-marks?${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      
      // Handle new response format { marks: {}, meta: {} }
      if (data.marks && Object.keys(data.marks).length > 0) {
        setMarks(data.marks)
        setFullMarks(data.meta.fullMarks)
        setPassMarks(data.meta.passMarks)
        setIsLocked(true)
      } else {
        setMarks({})
        setFullMarks(100)
        setPassMarks(40)
        setIsLocked(false)
      }
    } catch (error) {
      console.error('Failed to fetch marks')
    }
  }

  const handleMarkChange = (studentId, value) => {
    // Allow empty string to clear input
    if (value === '') {
      setMarks(prev => ({ ...prev, [studentId]: '' }))
      return
    }

    const numValue = parseFloat(value)
    
    // Validate number
    if (isNaN(numValue)) return

    // Validate range
    if (numValue < 0) return
    if (numValue > fullMarks) {
      alert(`Marks cannot exceed Full Marks (${fullMarks})`)
      return
    }

    setMarks(prev => ({
      ...prev,
      [studentId]: numValue
    }))
  }

  const handleSaveMarks = async () => {
    if (!selectedSubject) return alert('Please select a subject')
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = userInfo ? userInfo.token : null

    const marksData = students.map(s => ({
      studentId: s._id,
      marks: marks[s._id] || 0
    })).filter(item => marks[item.studentId] !== undefined) // Only send entered marks

    try {
      const res = await fetch('/api/exams/bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: selectedCourse,
          semester: selectedSemester,
          examType: selectedExamType,
          subjectName: selectedSubject,
          marksData,
          fullMarks,
          passMarks
        })
      })
      
      if (res.ok) {
        setMessage('Marks Saved Successfully')
        fetchExistingMarks() // Reload data and lock
        setTimeout(() => setMessage(''), 2000)
      } else {
        alert('Failed to save marks')
      }
    } catch (error) {
      alert('Error saving marks')
    }
  }

  return (
    <div className="card">
      {message && <div style={{ padding: '10px', background: '#dcfce7', color: '#166534', borderRadius: '4px', marginBottom: '1rem' }}>{message}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>Marks Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isLocked ? (
            <button onClick={() => setIsLocked(false)} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
              <Edit size={16} /> Edit Marks
            </button>
          ) : (
            <button onClick={handleSaveMarks} className="btn-action" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> Save Marks
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '500' }}>Course</label>
          <select className="filter-select" style={{ width: '100%' }} value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '500' }}>Batch</label>
          <select className="filter-select" style={{ width: '100%' }} value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
            <option value="">Select Batch</option>
            {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '500' }}>Semester</label>
          <select className="filter-select" style={{ width: '100%' }} value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
            <option value="">Select Sem</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '500' }}>Exam Type</label>
          <select className="filter-select" style={{ width: '100%' }} value={selectedExamType} onChange={e => setSelectedExamType(e.target.value)}>
            <option value="pre-board">Pre-Board</option>
            <option value="board">Board</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '500' }}>Subject</label>
          <select className="filter-select" style={{ width: '100%' }} value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!availableSubjects.length}>
            <option value="">Select Subject</option>
            {availableSubjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Marks Meta Inputs */}
      {selectedSubject && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '1.5rem', padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '500' }}>Full Marks</label>
            <input 
              type="number" 
              value={fullMarks} 
              onChange={e => setFullMarks(parseFloat(e.target.value) || 0)} 
              disabled={isLocked}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '500' }}>Pass Marks</label>
            <input 
              type="number" 
              value={passMarks} 
              onChange={e => setPassMarks(parseFloat(e.target.value) || 0)} 
              disabled={isLocked}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100px' }}
            />
          </div>
        </div>
      )}

      {/* Marks Table */}
      {students.length > 0 && selectedSubject ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll/Email</th>
                <th style={{ width: '150px' }}>Marks Obtained</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td style={{ color: '#666', fontSize: '0.8rem' }}>{student.email}</td>
                  <td>
                    <input 
                      type="number" 
                      min="0" 
                      max={fullMarks}
                      value={marks[student._id] || ''}
                      onChange={e => handleMarkChange(student._id, e.target.value)}
                      disabled={isLocked}
                      style={{ 
                        width: '100%', padding: '8px', borderRadius: '4px', 
                        border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold',
                        background: isLocked ? '#f3f4f6' : 'white'
                      }}
                      placeholder="-"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', background: '#f9fafb', borderRadius: '0.5rem' }}>
          {students.length === 0 ? 'Select filters to view students' : 'Select a subject to enter marks'}
        </div>
      )}
    </div>
  )
}

function StudentRecords() {
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentResults, setStudentResults] = useState([])
  const [viewMode, setViewMode] = useState('details') // 'details' or 'analytics'
  
  // Filter States
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')

  // Result View Filters
  const [resultSemesterFilter, setResultSemesterFilter] = useState('')
  const [resultExamTypeFilter, setResultExamTypeFilter] = useState('')
  
  // Derived States
  const [uniqueBatches, setUniqueBatches] = useState([])

  useEffect(() => {
    fetchCourses()
    fetchBatches()
  }, [])

  // When Filters change, fetch students
  useEffect(() => {
    fetchStudents()
  }, [selectedCourse, selectedBatch])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      setCourses(data)
    } catch (error) {
      console.error('Failed to fetch courses')
    }
  }

  const fetchBatches = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo ? userInfo.token : null

      const res = await fetch('/api/students/batches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      setUniqueBatches(data)
    } catch (error) {
      console.error('Failed to fetch batches')
    }
  }

  const fetchStudents = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo ? userInfo.token : null

      const query = new URLSearchParams()
      if (selectedCourse) query.append('course', selectedCourse)
      if (selectedBatch) query.append('batch', selectedBatch)
      // if (selectedSemester) query.append('semester', selectedSemester) // Don't filter students by semester

      const res = await fetch(`/api/students?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      setStudents(data)
    } catch (error) {
      console.error('Failed to fetch students')
    }
  }

  const fetchStudentResults = async (studentId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo ? userInfo.token : null

      const res = await fetch(`/api/exams/student/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      setStudentResults(data)
    } catch (error) {
      console.error('Failed to fetch results')
    }
  }

  const handleViewRecord = (student) => {
    setSelectedStudent(student)
    setViewMode('details')
    fetchStudentResults(student._id)
  }

  const handleViewAnalytics = (student) => {
    setSelectedStudent(student)
    setViewMode('analytics')
    fetchStudentResults(student._id)
  }

  // Analytics Helpers
  const calculateAverage = (type) => {
    const filtered = studentResults.filter(r => r.examType === type)
    if (filtered.length === 0) return "N/A"
    
    let totalMarks = 0
    let totalFullMarks = 0
    filtered.forEach(r => {
      r.results.forEach(sub => {
        totalMarks += sub.marksObtained
        totalFullMarks += sub.fullMarks
      })
    })
    if (totalFullMarks === 0) return "N/A"
    const percentage = (totalMarks / totalFullMarks) * 100
    return (percentage / 25).toFixed(2)
  }

  const chartData = studentResults.map(r => {
    const totalMarks = r.results.reduce((acc, curr) => acc + curr.marksObtained, 0)
    const totalFull = r.results.reduce((acc, curr) => acc + curr.fullMarks, 0)
    const avgMarks = r.results.length > 0 ? totalMarks / r.results.length : 0
    const percentage = totalFull > 0 ? (totalMarks / totalFull) * 100 : 0
    
    return {
      name: `Sem ${r.semester} (${r.examType === 'board' ? 'Board' : 'Pre'})`,
      shortName: `S${r.semester}-${r.examType === 'board' ? 'B' : 'P'}`,
      avgMarks: parseFloat(avgMarks.toFixed(2)),
      percentage: parseFloat(percentage.toFixed(2)),
      semester: r.semester,
      type: r.examType
    }
  }).sort((a, b) => {
      if (a.semester === b.semester) {
          return a.type === 'pre-board' ? -1 : 1
      }
      return a.semester - b.semester
  })

  if (selectedStudent) {
    return (
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => setSelectedStudent(null)} className="btn-secondary">&larr; Back to List</button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
                onClick={() => setViewMode('details')} 
                className={viewMode === 'details' ? 'btn-action' : 'btn-secondary'}
                style={{ opacity: viewMode === 'details' ? 1 : 0.7 }}
            >
                Record Details
            </button>
            <button 
                onClick={() => setViewMode('analytics')} 
                className={viewMode === 'analytics' ? 'btn-action' : 'btn-secondary'}
                style={{ opacity: viewMode === 'analytics' ? 1 : 0.7 }}
            >
                Performance Analytics
            </button>
          </div>
        </div>
        
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>{selectedStudent.name}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', color: '#4b5563' }}>
            <div><strong>Email:</strong> {selectedStudent.email}</div>
            <div><strong>Course:</strong> {selectedStudent.course ? selectedStudent.course.name : '-'}</div>
            <div><strong>Batch:</strong> {selectedStudent.batch}</div>
          </div>
        </div>

        {viewMode === 'details' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>Academic Record</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                   <select 
                    value={resultSemesterFilter} 
                    onChange={e => setResultSemesterFilter(e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                   >
                     <option value="">All Semesters</option>
                     {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                   </select>
                   <select 
                    value={resultExamTypeFilter} 
                    onChange={e => setResultExamTypeFilter(e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                   >
                     <option value="">All Exams</option>
                     <option value="pre-board">Pre-Board</option>
                     <option value="board">Board</option>
                   </select>
                </div>
            </div>

            {studentResults.filter(r => (!resultSemesterFilter || r.semester.toString() === resultSemesterFilter) && (!resultExamTypeFilter || r.examType === resultExamTypeFilter)).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {studentResults.filter(r => (!resultSemesterFilter || r.semester.toString() === resultSemesterFilter) && (!resultExamTypeFilter || r.examType === resultExamTypeFilter)).map((result) => (
                  <div key={result._id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ background: '#f1f5f9', padding: '10px 15px', fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Semester {result.semester} - {result.examType.toUpperCase()}</span>
                      <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{new Date(result.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#64748b' }}>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Subject</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Full Marks</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Pass Marks</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Obtained</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.results.map((subject, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px' }}>{subject.subject}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{subject.fullMarks}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{subject.passMarks}</td>
                            <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{subject.marksObtained}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <span style={{ 
                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500',
                                background: subject.status === 'pass' ? '#dcfce7' : '#fee2e2',
                                color: subject.status === 'pass' ? '#166534' : '#991b1b'
                              }}>
                                {subject.status.toUpperCase()}

                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', background: '#f9fafb', borderRadius: '0.5rem' }}>
                {studentResults.length === 0 ? 'No exam records found for this student.' : 'No records found matching filters.'}
              </div>
            )}
          </>
        ) : (
          <div className="analytics-view">
             {studentResults.length > 0 ? (
               <>
                 <div className="stats-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div className="stat-card">
                      <h3>Board CGPA</h3>
                      <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{calculateAverage('board')}</p>
                      <p style={{ color: '#64748b' }}>Cumulative Grade Point Average</p>
                    </div>
                    <div className="stat-card">
                      <h3>Pre-Board CGPA</h3>
                      <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{calculateAverage('pre-board')}</p>
                      <p style={{ color: '#64748b' }}>Cumulative Grade Point Average</p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Semesters</h3>
                      <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{studentResults.length}</p>
                      <p style={{ color: '#64748b' }}>Exams Appeared</p>
                    </div>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                    <div>
                      <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Recent Performance (Avg %)</h3>
                      <div className="card" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-45} textAnchor="end" height={60} />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Bar dataKey="percentage" fill="#0f172a" radius={[4, 4, 0, 0]} name="Avg %" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Performance Trend (%)</h3>
                      <div className="card" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-45} textAnchor="end" height={60} />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={2} activeDot={{ r: 8 }} name="Percentage" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                 </div>
               </>
             ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', background: '#f9fafb', borderRadius: '0.5rem' }}>
                  No analytics data available. Student has no exam records.
                </div>
             )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>Student Records</h2>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '500' }}>Course</label>
          <select className="filter-select" style={{ width: '100%' }} value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '500' }}>Batch</label>
          <select className="filter-select" style={{ width: '100%' }} value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
            <option value="">Select Batch</option>
            {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Student List */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((student) => (
                <tr key={student._id}>
                  <td style={{ fontWeight: '500' }}>{student.name}</td>
                  <td style={{ color: '#666' }}>{student.email}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleViewRecord(student)}
                      className="btn-action"
                      style={{ marginRight: '0.5rem' }}
                    >
                      View Record
                    </button>
                    <button 
                      onClick={() => handleViewAnalytics(student)}
                      className="btn-secondary"
                    >
                      Analytics
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                  No students found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SettingsPage() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // New Admin State
  const [newAdminName, setNewAdminName] = useState('')
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [adminMessage, setAdminMessage] = useState('')
  const [adminError, setAdminError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage(data.message)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setError(data.message || 'Failed to update password')
      }
    } catch (err) {
      setError('Something went wrong')
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    setAdminMessage('')
    setAdminError('')

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ name: newAdminName, email: newAdminEmail, password: newAdminPassword, role: 'admin' })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setAdminMessage('New Admin Created Successfully')
        setNewAdminName('')
        setNewAdminEmail('')
        setNewAdminPassword('')
      } else {
        setAdminError(data.message || 'Failed to create admin')
      }
    } catch (err) {
      setAdminError('Something went wrong')
    }
  }

  return (
    <div className="settings-page">
      <div className="card settings-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3>Change Password</h3>
          <p className="text-muted">Ensure your account is using a long, random password to stay secure.</p>
        </div>
        
        <div className="card-body">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter current password"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-action">Update Password</button>
            </div>
          </form>
        </div>
      </div>

      {userInfo?.role === 'admin' && (
      <div className="card settings-card">
        <div className="card-header">
          <h3>Create New Admin</h3>
          <p className="text-muted">Register a new administrator account for the system.</p>
        </div>
        
        <div className="card-body">
          {adminMessage && <div className="alert alert-success">{adminMessage}</div>}
          {adminError && <div className="alert alert-error">{adminError}</div>}
          
          <form onSubmit={handleCreateAdmin} className="settings-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                required
                placeholder="Admin Name"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                required
                placeholder="admin@example.com"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                required
                placeholder="Initial Password"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-action">Create Admin</button>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  )
}

function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  const navigate = useNavigate()
  const location = useLocation()

  if (!user || user.role !== 'student') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <Link to="/">Go to Login</Link>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('userInfo')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="dashboard-layout">
      {/* Topbar */}
      <header className="topbar">
        <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <School size={32} className="logo-icon" />
          <div className="logo-text">
            <span className="logo-title">Student Record</span>
            <span className="logo-subtitle">Student Portal</span>
          </div>
        </div>
        <h1 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '600', margin: 0, letterSpacing: '-0.025em' }}>
          Welcome, {user.name}
        </h1>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </header>

      <div className="dashboard-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div className="nav-section">
              <span className="nav-label">Main Menu</span>
              <Link to="/student-dashboard" className={`nav-item ${isActive('/student-dashboard') ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                <span>Overview</span>
              </Link>
              <Link to="/student-dashboard/results" className={`nav-item ${isActive('/student-dashboard/results') ? 'active' : ''}`}>
                <FileText size={20} />
                <span>My Results</span>
              </Link>
              <Link to="/student-dashboard/courses" className={`nav-item ${isActive('/student-dashboard/courses') ? 'active' : ''}`}>
                <BookOpen size={20} />
                <span>My Courses</span>
              </Link>
            </div>

            <div className="nav-section">
              <span className="nav-label">Account</span>
              <Link to="/student-dashboard/settings" className={`nav-item ${isActive('/student-dashboard/settings') ? 'active' : ''}`}>
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="user-mini-profile">
              <div className="avatar">{user.name.charAt(0)}</div>
              <div className="user-details">
                <span className="name">{user.name}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Wrapper */}
        <div className="main-wrapper">
          <main className="content-area">
            <Routes>
              <Route path="/" element={<StudentHome />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

function StudentHome() {
  const [student, setStudent] = useState(null)
  const [results, setResults] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      if (!userInfo) return

      try {
        // Fetch Student Details
        const resStudent = await fetch(`/api/students/${userInfo._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        })
        const studentData = await resStudent.json()
        setStudent(studentData)

        // Fetch Results
        const resResults = await fetch(`/api/exams/student/${userInfo._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        })
        const resultsData = await resResults.json()
        setResults(resultsData)
      } catch (error) {
        console.error('Error fetching student data', error)
      }
    }
    fetchData()
  }, [])

  if (!student) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading dashboard...</div>

  // Analytics Helpers
  const calculateAverage = (type) => {
    const filtered = results.filter(r => r.examType === type)
    if (filtered.length === 0) return "N/A"
    
    let totalMarks = 0
    let totalFullMarks = 0
    filtered.forEach(r => {
      r.results.forEach(sub => {
        totalMarks += sub.marksObtained
        totalFullMarks += sub.fullMarks
      })
    })
    if (totalFullMarks === 0) return "N/A"
    const percentage = (totalMarks / totalFullMarks) * 100
    return (percentage / 25).toFixed(2)
  }

  const chartData = results.map(r => {
    const totalMarks = r.results.reduce((acc, curr) => acc + curr.marksObtained, 0)
    const totalFull = r.results.reduce((acc, curr) => acc + curr.fullMarks, 0)
    const avgMarks = r.results.length > 0 ? totalMarks / r.results.length : 0
    const percentage = totalFull > 0 ? (totalMarks / totalFull) * 100 : 0
    
    return {
      name: `Sem ${r.semester} (${r.examType === 'board' ? 'Board' : 'Pre'})`,
      shortName: `S${r.semester}-${r.examType === 'board' ? 'B' : 'P'}`,
      avgMarks: parseFloat(avgMarks.toFixed(2)),
      percentage: parseFloat(percentage.toFixed(2)),
      semester: r.semester,
      type: r.examType
    }
  }).sort((a, b) => {
      if (a.semester === b.semester) {
          return a.type === 'pre-board' ? -1 : 1
      }
      return a.semester - b.semester
  })

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Dashboard Overview</h2>
      
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <h3>Batch</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{student.batch}</p>
          <p style={{ color: '#64748b' }}>Student Batch</p>
        </div>
        <div className="stat-card">
          <h3>Course</h3>
          <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a' }}>{student.course ? student.course.code : '-'}</p>
          <p style={{ color: '#64748b' }}>{student.course ? student.course.name : ''}</p>
        </div>
        <div className="stat-card">
          <h3>Board CGPA</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{calculateAverage('board')}</p>
          <p style={{ color: '#64748b' }}>Cumulative GPA</p>
        </div>
        <div className="stat-card">
          <h3>Pre-Board CGPA</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{calculateAverage('pre-board')}</p>
          <p style={{ color: '#64748b' }}>Cumulative GPA</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Recent Performance (Avg %)</h3>
          <div className="card" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="percentage" fill="#0f172a" radius={[4, 4, 0, 0]} name="Avg %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Performance Trend (%)</h3>
          <div className="card" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={2} activeDot={{ r: 8 }} name="Percentage" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function StudentResults() {
  const [results, setResults] = useState([])
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedExamType, setSelectedExamType] = useState('')

  useEffect(() => {
    const fetchResults = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      try {
        const res = await fetch(`/api/exams/student/${userInfo._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        })
        const data = await res.json()
        setResults(data)
      } catch (error) {
        console.error('Error fetching results')
      }
    }
    fetchResults()
  }, [])

  const filteredResults = results.filter(result => {
    if (selectedSemester && result.semester.toString() !== selectedSemester) return false
    if (selectedExamType && result.examType !== selectedExamType) return false
    return true
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#1f2937' }}>My Academic Results</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
           <select 
            value={selectedSemester} 
            onChange={e => setSelectedSemester(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
           >
             <option value="">All Semesters</option>
             {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
           </select>
           <select 
            value={selectedExamType} 
            onChange={e => setSelectedExamType(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
           >
             <option value="">All Exams</option>
             <option value="pre-board">Pre-Board</option>
             <option value="board">Board</option>
           </select>
        </div>
      </div>

      {filteredResults.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredResults.map((result) => {
            const totalObtained = result.results.reduce((acc, curr) => acc + curr.marksObtained, 0)
            const totalFull = result.results.reduce((acc, curr) => acc + curr.fullMarks, 0)
            const percentage = totalFull > 0 ? (totalObtained / totalFull) * 100 : 0
            const gpa = (percentage / 25).toFixed(2)

            return (
            <div key={result._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: '#f8fafc', padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Semester {result.semester} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal' }}>({result.examType.toUpperCase()})</span></h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Published: {new Date(result.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="table-container" style={{ margin: 0, border: 'none', boxShadow: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#64748b' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Subject</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Full Marks</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Pass Marks</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Obtained</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((subject, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px' }}>{subject.subject}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{subject.fullMarks}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{subject.passMarks}</td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{subject.marksObtained}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500',
                            background: subject.status === 'pass' ? '#dcfce7' : '#fee2e2',
                            color: subject.status === 'pass' ? '#166534' : '#991b1b'
                          }}>
                            {subject.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '15px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '30px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
                  <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '1.1rem' }}>{totalObtained} <span style={{fontSize: '0.9rem', color: '#94a3b8'}}>/ {totalFull}</span></span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Percentage</span>
                  <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '1.1rem' }}>{percentage.toFixed(2)}%</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GPA</span>
                  <span style={{ fontWeight: '700', color: '#2563eb', fontSize: '1.25rem' }}>{gpa}</span>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          {results.length === 0 ? 'No results published yet.' : 'No results found matching filters.'}
        </div>
      )}
    </div>
  )
}

function StudentCourses() {
  const [student, setStudent] = useState(null)

  useEffect(() => {
    const fetchStudent = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      try {
        const res = await fetch(`/api/students/${userInfo._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        })
        const data = await res.json()
        setStudent(data)
      } catch (error) {
        console.error('Error fetching student')
      }
    }
    fetchStudent()
  }, [])

  if (!student || !student.course) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading courses...</div>

  // Sort curriculum by semester
  const sortedCurriculum = [...student.course.curriculum].sort((a, b) => a.semester - b.semester)

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>My Courses</h2>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>{student.course.name} ({student.course.code})</h3>
        <p style={{ color: '#64748b' }}>Batch: {student.batch}</p>
      </div>

      {sortedCurriculum.map((sem, sIdx) => (
        <div key={sIdx} style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Semester {sem.semester}</h3>
          <div className="stats-grid">
            {sem.subjects.map((sub, idx) => (
              <div key={idx} className="stat-card">
                <h3>{sub.code}</h3>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', margin: '10px 0' }}>{sub.name}</p>
                <p style={{ color: '#64748b' }}>Credit Hours: {sub.creditHours}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default App
