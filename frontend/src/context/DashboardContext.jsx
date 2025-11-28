import { createContext, useContext, useState, useCallback } from 'react';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState(null);
  
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const fetchStats = useCallback(async (force = false) => {
    if (stats && !force) return;
    setLoadingStats(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return;
      
      const res = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoadingStats(false);
    }
  }, [stats]);

  const fetchCourses = useCallback(async (force = false) => {
    if (courses && !force) return;
    setLoadingCourses(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return;

      const res = await fetch('/api/courses', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Failed to fetch courses');
    } finally {
      setLoadingCourses(false);
    }
  }, [courses]);

  return (
    <DashboardContext.Provider value={{
      stats, fetchStats, loadingStats,
      courses, fetchCourses, loadingCourses,
      setCourses // Expose setter to update courses locally after add/edit
    }}>
      {children}
    </DashboardContext.Provider>
  );
};
