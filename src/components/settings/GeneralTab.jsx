import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button, Input } from "../index";
import { Sun, Shield, Trash2, Mail, LogOut, HelpCircle, ChevronRight, ExternalLink } from "lucide-react";
import appwriteService from "../../appwrite/config";
import authService from "../../appwrite/auth";
import toast from "react-hot-toast";

export default function GeneralTab({ userData, toggleTheme, themeMode, setModalConfig, onLogout, onDeleteAccount }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { isValid } } = useForm({ mode: "onChange" });

  const onUpdatePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) return toast.error("Passwords do not match!");
    setLoading(true);
    try {
      await authService.updatePassword({ newPassword: data.newPassword, oldPassword: data.oldPassword });
      toast.success("Password updated!");
      reset();
    } catch (e) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Profile Shortcut */}
      <div onClick={() => navigate("/profile")} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 flex items-center gap-4 cursor-pointer hover:border-primary-light/50 transition-all group shadow-sm hover:shadow-md">
        <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
             {userData?.prefs?.avatar ? (
                 <img src={appwriteService.getFilePreview(userData.prefs.avatar)} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl bg-gray-100 dark:bg-gray-800">
                    {userData?.name?.charAt(0).toUpperCase()}
                </div>
             )}
        </div>
        <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-light transition-colors truncate">{userData?.name}</h2>
            <p className="text-sm text-gray-500 truncate">Manage your personal details</p>
        </div>
        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 group-hover:text-primary-light group-hover:translate-x-1 transition-all"><ChevronRight size={20} /></div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 flex flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Sun size={20} className="text-orange-500" /> Appearance</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Switch between Light and Dark mode.</p>
        </div>
        <button onClick={toggleTheme} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${themeMode === "dark" ? "bg-primary-light" : "bg-gray-200"}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${themeMode === "dark" ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      {/* Help */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><HelpCircle size={20} className="text-purple-500" /> Help & Support</h2>
           <p className="text-xs sm:text-sm text-gray-500 mt-1">FAQ, Guides, and Customer Support.</p>
        </div>
        <Button onClick={() => navigate("/help")} bgColor="bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30" textColor="text-purple-700 dark:text-purple-300" className="w-full sm:w-auto border border-purple-100 dark:border-purple-800/50 flex items-center justify-center gap-2">
           <ExternalLink size={16} /> Open Help Center
        </Button>
      </div>

      {/* Email */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4"><Mail size={20} className="text-blue-500" /> Email Address</h2>
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <Mail size={16} className="text-gray-400 shrink-0" />
          <span className="text-gray-700 dark:text-gray-300 font-medium truncate text-sm sm:text-base">{userData?.email}</span>
          <span className="ml-auto text-[10px] sm:text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold shrink-0">Verified</span>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4"><Shield size={20} className="text-green-500" /> Change Password</h2>
        <form onSubmit={handleSubmit(onUpdatePassword)} className="space-y-4">
          <Input label="Old Password" type="password" placeholder="••••••••" {...register("oldPassword", { required: true })} className="bg-gray-50 dark:bg-gray-800" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="New Password" type="password" placeholder="Min 8 chars" {...register("newPassword", { required: true, minLength: 8 })} className="bg-gray-50 dark:bg-gray-800" />
            <Input label="Confirm Password" type="password" placeholder="Confirm New" {...register("confirmPassword", { required: true })} className="bg-gray-50 dark:bg-gray-800" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !isValid} bgColor="bg-primary-light" className="w-full sm:w-auto shadow-md">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between gap-4">
             <div><h2 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><LogOut size={20} /> Log Out</h2><p className="text-xs text-gray-500 mt-1">End your session.</p></div>
             <Button onClick={() => setModalConfig({ isOpen: true, type: "logout" })} bgColor="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800" textColor="text-gray-900 dark:text-white" className="w-full border border-gray-200 dark:border-gray-700">Log Out</Button>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/50 p-6 flex flex-col justify-between gap-4">
             <div><h2 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2"><Trash2 size={20} /> Delete Account</h2><p className="text-xs text-red-400 dark:text-red-300 mt-1  ">Permanently delete data.</p></div>
             <button onClick={onDeleteAccount} >
  Delete Account
</button>

          </div>
      </div>
    </div>
  );
}