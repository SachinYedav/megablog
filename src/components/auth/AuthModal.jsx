import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  login as authLogin,
  closeAuthModal,
  toggleAuthMode,
} from "../../store/authSlice";
import authService from "../../appwrite/auth";
import appwriteService from "../../appwrite/config";
import { X, Mail, Lock, User, Loader2, ArrowRight, AtSign, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../index";
import useDebounce from "../../hooks/useDebounce";

export default function AuthModal() {
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  //  Username Logic States
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const { isAuthModalOpen, authMode } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // React Hook Form Setup 
  const { 
    register, 
    handleSubmit, 
    reset, 
    watch, 
    setError, 
    clearErrors, 
    setValue, 
    formState: { errors } 
  } = useForm();

  const usernameValue = watch("username");
  const nameValue = watch("name"); 
  const debouncedUsername = useDebounce(usernameValue, 500);

  //Random Username Generator 
  const generateRandomUsername = (name) => {
    const baseName = name || "user";
    const cleanName = baseName
      .toLowerCase() 
      .replace(/[^a-z0-9]/g, "") 
      .substring(0, 12);
    const randomNum = Math.floor(1000 + Math.random() * 9000); 
    return `${cleanName}${randomNum}`; 
  };

  // 1. Auto-Suggest Username 
  useEffect(() => {
    if (authMode === "signup" && nameValue && !watch("username")) {
        const suggested = generateRandomUsername(nameValue);
        setValue("username", suggested, { shouldValidate: true });
    }
  }, [nameValue, authMode, setValue, watch]);

  //  2. Check Username Availability
  useEffect(() => {
    const checkAvailability = async () => {
      if (!isAuthModalOpen || authMode !== "signup" || !debouncedUsername) return;

      const isValidRegex = /^[a-zA-Z0-9_.]+$/.test(debouncedUsername);
      
      if (!isValidRegex) {
          setUsernameAvailable(false);
          return;
      }

      setCheckingUsername(true);
      const isFree = await appwriteService.checkUsernameAvailability(debouncedUsername);
      setUsernameAvailable(isFree);
      setCheckingUsername(false);
    };

    if (debouncedUsername?.length > 3) checkAvailability();
    else setUsernameAvailable(null);

  }, [debouncedUsername, authMode, isAuthModalOpen]);

  //  Handle Submit
  const onSubmit = async (data) => {
    setGlobalError("");
    clearErrors();
    setLoading(true);

    // 1. Gmail Validation 
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (authMode === "signup" && !emailRegex.test(data.email)) {
      setLoading(false);
      setError("email", { type: "manual", message: "Only @gmail.com allowed" });
      return;
    }

    // 2. Username Validation
    if (authMode === "signup" && usernameAvailable === false) {
        setLoading(false);
        return;
    }

    try {
      try { await authService.logout(); } catch (e) {
         console.error("Logout failed:", e);
      }

      if (authMode === "signup") {
        // --- SIGNUP FLOW ---
        const session = await authService.createAccount(data);

        if (session) {
          // Trigger Welcome Email
          authService.triggerWelcomeEmail(data.email, data.name);

          const userData = await authService.getCurrentUser();
          if (userData) {
            try {
              await appwriteService.createUserProfile({
                userId: userData.$id,
                name: data.name,
                email: data.email,
                username: data.username 
              });
            } catch (dbError) {
              console.error("Profile creation failed:", dbError);
            }
          }
        }
      } else {
        // --- LOGIN FLOW ---
        const session = await authService.login(data);
        if (session) {
          // Trigger Login Security Alert
          authService.triggerLoginAlert(data.email);

          const userData = await authService.getCurrentUser();
          
          // 1. Fetch Profile
          let userProfile = null;
          try {
             userProfile = await appwriteService.getUserProfile(userData.$id);
          } catch (e) {
          }
          
          // 3. SELF-HEALING LOGIC 
          if (!userProfile) {
             try {
                const newUsername = generateRandomUsername(userData.name);
                
                userProfile = await appwriteService.createUserProfile({
                   userId: userData.$id,
                   name: userData.name,
                   email: userData.email,
                   username: newUsername
                });
             } catch (healError) {
                console.error("⚠️ Self-healing profile failed:", healError);
             }
          }
          
          const sessionUser = {
              ...userData,
              avatarId: userProfile?.avatarId || null,
              fullName: userProfile?.name || userData.name,
              username: userProfile?.username || userData.$id,
          };
          
          dispatch(authLogin({ userData: sessionUser }));
        }
      }

      if (authMode === "login") {
        dispatch(closeAuthModal());
      } else {
         window.location.reload();
      }

    } catch (err) {
      console.error("Auth Error:", err);
      const msg = err.message || "";
      
      // Smart Error Mapping
      if (msg.includes("user_already_exists") || err.code === 409) {
          setError("email", { type: "manual", message: "Account already exists. Try login." });
          if (authMode === "signup") {
              setTimeout(() => dispatch(toggleAuthMode()), 2000);
          }
      } 
      else if (msg.includes("Invalid credentials") || msg.includes("password")) {
          setError("password", { type: "manual", message: "Incorrect email or password." });
      } 
      else {
          setGlobalError(msg || "Something went wrong.");
      }

    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try { authService.googleLogin(); } catch (error) { setGlobalError("Google login failed"); }
  };

  const handleToggle = () => {
    setGlobalError("");
    clearErrors();
    reset();
    setUsernameAvailable(null);
    dispatch(toggleAuthMode());
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 scale-100 animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={() => dispatch(closeAuthModal())}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-2 text-center">
          <div className="flex justify-center mb-3">
            <Logo width="50px" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {authMode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {authMode === "login"
              ? "Login to continue to MegaBlog"
              : "Join the community of writers"}
          </p>
        </div>

        <div className="px-8 py-6">
          {/* Google Button with SVG */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm group"
          >
            {/*: Google SVG */}
            <svg viewBox="0 0 48 48" className="w-5 h-5 group-hover:scale-110 transition-transform">
               <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
               <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
               <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
               <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-400 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Global Error */}
            {globalError && (
               <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-2 rounded-lg justify-center">
                  <AlertCircle size={14} /> {globalError}
               </div>
            )}

            {authMode === "signup" && (
              <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("name", { required: true })}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-sm focus:border-primary-light transition-colors"
                        placeholder="Full Name"
                      />
                    </div>
                  </div>

                  {/* Username Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Username</label>
                    <div className="relative">
                      <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("username", { 
                            required: true, 
                            minLength: 4, 
                            pattern: /^[a-zA-Z0-9_.]+$/ 
                        })}
                        className={`w-full pl-9 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border outline-none text-sm transition-colors ${
                             usernameValue && !checkingUsername
                               ? usernameAvailable 
                                   ? "border-green-500 focus:border-green-500" 
                                   : "border-red-500 focus:border-red-500"
                               : "border-gray-200 dark:border-gray-700 focus:border-primary-light"
                        }`}
                        placeholder="unique_username"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {checkingUsername && <Loader2 size={16} className="animate-spin text-gray-400"/>}
                          {!checkingUsername && usernameValue?.length > 3 && (
                             usernameAvailable 
                                ? <span className="text-green-500 text-xs font-bold">✓</span>
                                : <span className="text-red-500 text-xs font-bold">✕</span>
                          )}
                      </div>
                    </div>
                    {usernameValue?.length > 0 && !usernameAvailable && !checkingUsername && (
                        <p className="text-[10px] text-red-500 ml-1 font-medium">Username taken or invalid</p>
                    )}
                  </div>
              </>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 ml-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  {...register("email", { required: true })}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border outline-none text-sm transition-colors ${
                    errors.email 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 dark:border-gray-700 focus:border-primary-light"
                  }`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-red-500 ml-1 font-medium flex items-center gap-1">
                   <AlertCircle size={10} /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-gray-500">Password</label>
                {authMode === "login" && (
                  <Link
                    to="/forgot-password"
                    onClick={() => dispatch(closeAuthModal())}
                    className="text-xs text-primary-light hover:underline"
                  >
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  {...register("password", { required: true, minLength: 8 })}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border outline-none text-sm transition-colors ${
                    errors.password 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 dark:border-gray-700 focus:border-primary-light"
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-500 ml-1 font-medium flex items-center gap-1">
                   <AlertCircle size={10} /> {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (authMode === "signup" && usernameAvailable === false)}
              className="w-full py-2.5 mt-2 rounded-xl bg-primary-light hover:bg-primary-dark text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {authMode === "login" ? "Sign In" : "Create Account"} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800/50 text-center border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {authMode === "login" ? "New to MegaBlog?" : "Already have an account?"}
            <button
              onClick={handleToggle}
              className="ml-1 font-bold text-primary-light hover:underline focus:outline-none"
            >
              {authMode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}