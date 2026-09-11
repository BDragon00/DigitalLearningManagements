import { useState } from "react";
import AdminDashboard from "../admin/adminDashboard";

function Login() {
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

            setError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                },
                    body: JSON.stringify({
                        Email,
                        Password,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setError(data.message || "Đăng nhập thất bại");
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.RoleName === "Admin") {
            setIsLoggedIn(true);
            return;
        }

        console.log("Login successful:", data);
        console.log("ROLE:", data.user.RoleName);
    } catch (error) {
        console.error("Login failed:", error);
        setError("Không thể kết nối đến Server");
    }
};

if (isLoggedIn) {
    return <AdminDashboard />;
}

    return (
        <div>
            <h1>Đăng nhập</h1>

            <form onSubmit={handleLogin}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={Email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email"
                        required
                    />
                </div>

                <div>
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        value={Password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        required
                    />
                </div>

                {error && <p>{error}</p>}

                <button type="submit">
                    Đăng nhập
                </button>
            </form>
        </div>
    );
}

export default Login;