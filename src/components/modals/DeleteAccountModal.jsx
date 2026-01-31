import React, { useState } from "react";
import { AlertTriangle, X, Loader2, Eye, EyeOff, Trash2 } from "lucide-react";
import authService from "../../appwrite/auth";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, openAuthModal  } from "../../store/authSlice";
import toast from "react-hot-toast";

export default function DeleteAccountModal({ isOpen, onClose }) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userData = useSelector((state) => state.auth.userData);

    if (!isOpen) return null;

    const handleDelete = async (e) => {
        e.preventDefault();
        if (!password) return toast.error("Please enter your password to confirm.");

        setLoading(true);
        const toastId = toast.loading("Verifying credentials...");

        try {
            // 1. Verify Password 
            const isVerified = await authService.verifyPassword(userData.email, password);
            
            if (!isVerified) {
                toast.error("Incorrect password. Please try again.", { id: toastId });
                setLoading(false);
                return;
            }

            // 2. Add to Deletion Queue 
            toast.loading("Scheduling deletion...", { id: toastId });
            await authService.deleteAccount(); 
            
            // 3. Success & Clean Exit
            toast.success("Account deleted. We're sorry to see you go.", { id: toastId, duration: 4000 });
            
            // UI Cleanup
            onClose();
            dispatch(logout());
            navigate("/", { replace: true });
            dispatch(openAuthModal());

        } catch (error) {
            console.error("Delete Error:", error);
            toast.error("Something went wrong. Please try again.", { id: toastId });
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* 1. Backdrop  */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                onClick={!loading ? onClose : undefined}
            />

            {/* 2. Modal Content  */}
            <div className="relative w-full max-w-md bg-[#0b0f1a]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden">
                
                {/* Header Section */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Trash2 size={18} className="text-red-500" />
                        Delete Account
                    </h3>
                    <button 
                        onClick={onClose} 
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6">
                    {/* Warning Alert */}
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                        <div className="shrink-0 text-red-600 dark:text-red-400 mt-0.5">
                            <AlertTriangle size={20} />
                        </div>
                        <div className="text-sm">
                            <h4 className="font-semibold text-red-700 dark:text-red-400 mb-1">Permanent Action</h4>
                            <p className="text-red-600/80 dark:text-red-400/80 leading-relaxed">
                                This will immediately log you out and schedule your data for permanent deletion. This cannot be undone.
                            </p>
                        </div>
                    </div>

                    {/* Password Input */}
                    <form onSubmit={handleDelete}>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                            Confirm Password
                        </label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                placeholder="Enter your password"
                                className="w-full bg-white dark:bg-[#09090B] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:border-red-500 dark:focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-gray-400"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer / Actions */}
                <div className="px-6 py-4 bg-white/5 flex justify-end gap-3 border-t border-white/10">

                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading || !password}
                        className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm hover:shadow-red-500/20 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Delete Forever"
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}