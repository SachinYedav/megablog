import React from "react";
import { useDispatch } from "react-redux";
import authService from "../../appwrite/auth";
import { logout } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";

function LogoutBtn({ className = "" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => {
    const promise = authService.logout().then(() => {
      dispatch(logout()); 
      navigate("/login");
    });

    toast.promise(promise, {
      loading: "Logging out...",
      success: "Logged out successfully",
      error: "Logout failed",
    });
  };

  return (
    <button
      className={`inline-flex items-center gap-2 px-4 py-2 duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600 rounded-full font-medium transition-all ${className}`}
      onClick={logoutHandler}
    >
      <LogOut size={18} />
      Logout
    </button>
  );
}

export default LogoutBtn;