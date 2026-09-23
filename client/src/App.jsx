import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./admin/AdminDashboard";
import TeacherDashboard from "./teacher/TeacherDashboard";
import StudentDashboard from "./student/StudentDashboard";
import ProtectedRoute from "./ProtectedRoute";
import MaterialsList from "./materials/MaterialsList";
import MaterialDetail from "./materials/MaterialDetail";
import ChangePassword from "./account/ChangePassword";
import { ToastProvider } from "./components/ToastContext";

function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={["Admin"]}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/teacher"
                        element={
                            <ProtectedRoute allowedRoles={["Teacher"]}>
                                <TeacherDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/student"
                        element={
                            <ProtectedRoute allowedRoles={["Student"]}>
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/materials"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "Admin",
                                    "Teacher",
                                    "Student",
                                ]}
                            >
                                <MaterialsList />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/materials/:id"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "Admin",
                                    "Teacher",
                                    "Student",
                                ]}
                            >
                                <MaterialDetail />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/change-password"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "Admin",
                                    "Teacher",
                                    "Student",
                                ]}
                            >
                                <ChangePassword />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                    />
                </Routes>
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;