import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AuthGuard from './components/auth/AuthGuard'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ConfirmEmail from './pages/ConfirmEmail'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import MyList from './pages/MyList'
import Discover from './pages/Discover'
import MediaDetail from './pages/MediaDetail'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

export default function App() {
    return (
        <Routes>
            {/* public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />

            {/* protected */}
            <Route element={<AuthGuard><Layout /></AuthGuard>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/search" element={<Search />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/list" element={<MyList />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/:type/:id" element={<MediaDetail />} />
                <Route path="/admin/*" element={<Admin />} />
            </Route>

            {/* 404 — replaces the old Navigate to "/" wildcard */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}