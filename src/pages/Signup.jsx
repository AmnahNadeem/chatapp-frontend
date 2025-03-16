import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User, Image } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        profile_picture: null,
    });
    const [isSigningUp, setIsSigningUp] = useState(false);
    const navigate = useNavigate();

    // ✅ Get Backend URL from Environment Variables
    const API_URL = process.env.REACT_APP_BACKEND_URL;

    const validateForm = () => {
        if (!formData.full_name.trim()) return toast.error("Full name is required");
        if (!formData.email.trim()) return toast.error("Email is required");
        if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
        if (!formData.password) return toast.error("Password is required");
        if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSigningUp(true);

        const formDataToSend = new FormData();
        formDataToSend.append("full_name", formData.full_name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
        if (formData.profile_picture) {
            formDataToSend.append("profile_picture", formData.profile_picture);
        }

        try {
            const response = await fetch(`${API_URL}/signup/`, { // ✅ Dynamic URL
                method: "POST",
                body: formDataToSend,
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Signup successful! Redirecting...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                // ✅ Show all errors instead of just one
                if (data.errors) {
                    Object.values(data.errors).forEach((error) => toast.error(error));
                } else {
                    toast.error(data.error || "Signup failed. Please try again.");
                }
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSigningUp(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left side */}
            <div className="flex flex-col justify-center items-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    {/* LOGO */}
                    <div className="text-center mb-8">
                        <div className="flex flex-col items-center gap-2 group">
                            <div
                                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
                            >
                                <MessageSquare className="size-6 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold mt-2">Create Account</h1>
                            <p className="text-base-content/60">Get started with your free account</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Full Name</span>
                            </label>
                            <div className="relative">
                                <User className="absolute inset-y-0 left-3 size-5 text-base-content/40" />
                                <input
                                    type="text"
                                    className="input input-bordered w-full pl-10"
                                    placeholder="John Doe"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Email</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute inset-y-0 left-3 size-5 text-base-content/40" />
                                <input
                                    type="email"
                                    className="input input-bordered w-full pl-10"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Password</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute inset-y-0 left-3 size-5 text-base-content/40" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input input-bordered w-full pl-10"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="size-5 text-base-content/40" /> : <Eye className="size-5 text-base-content/40" />}
                                </button>
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Profile Picture (Optional)</span>
                            </label>
                            <div className="relative">
                                <Image className="absolute inset-y-0 left-3 size-5 text-base-content/40" />
                                <input
                                    type="file"
                                    className="input input-bordered w-full pl-10"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, profile_picture: e.target.files[0] })}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
                            {isSigningUp ? (
                                <>
                                    <Loader2 className="size-5 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-base-content/60">
                            Already have an account?{" "}
                            <Link to="/login" className="link link-primary">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <AuthImagePattern title="Join our community" subtitle="Connect with friends, share moments, and stay in touch with your loved ones." />
        </div>
    );
};

export default Signup;
