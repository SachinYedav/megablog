import React, { useState, useEffect } from "react";
import authService from "../appwrite/auth";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Logo, SEO } from "../components";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Mail,
  Lock,
  ShieldCheck,
  Timer,
  RefreshCw,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

function ForgotPassword() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue, 
    formState: { errors },
  } = useForm();

  // --- States ---
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [timeLeft, setTimeLeft] = useState(0);

  const [confirmedEmail, setConfirmedEmail] = useState("");

  // Captcha State
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, ans: 0 });
  const [captchaInput, setCaptchaInput] = useState("");

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10);
    const n2 = Math.floor(Math.random() * 10);
    setCaptcha({ num1: n1, num2: n2, ans: n1 + n2 });
    setCaptchaInput("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft]);

  // ==========================================
  // STEP 1: SEND OTP
  // ==========================================
  const handleSendOtp = async (data) => {
    if (parseInt(captchaInput) !== captcha.ans) {
      toast.error("Incorrect Captcha Answer!");
      generateCaptcha();
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Sending secure code...");

    try {
      const cleanEmail = data.email.trim().toLowerCase();

      const response = await authService.sendPasswordResetOTP(cleanEmail);

      if (response.success) {
        toast.success("OTP sent to your email!", { id: toastId });

        setConfirmedEmail(cleanEmail);

        setStep(2);
        setTimeLeft(60);
      }
    } catch (err) {
      toast.error(err.message || "Failed to send OTP", { id: toastId });
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP 2: VERIFY OTP & RESET PASSWORD
  // ==========================================
  const handleResetPassword = async (data) => {
    setLoading(true);
    const toastId = toast.loading("Verifying & Resetting...");

    try {
      const response = await authService.verifyOtpAndReset({
        email: confirmedEmail,
        otp: data.otp.toString().trim(),
        newPassword: data.newPassword,
      });

      if (response.success) {
        toast.success("Password Changed! Please Login.", { id: toastId });

        setLoading(false);
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
      }
    } catch (err) {
      console.error("Reset Error:", err);
      toast.error(err.message || "Invalid OTP", { id: toastId });
      setLoading(false);
    }
  };

  // --- Resend Handler ---
  const handleResend = async () => {
    if (timeLeft === 0 && confirmedEmail) {
      setLoading(true);
      const toastId = toast.loading("Resending code...");
      try {
        await authService.sendPasswordResetOTP(confirmedEmail);
        toast.success("New OTP sent!", { id: toastId });
        setTimeLeft(60);
      } catch (err) {
        toast.error(err.message, { id: toastId });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 transition-colors duration-300">
      <SEO 
        title="Reset Password" 
        description="Securely reset your MegaBlog password using our encrypted OTP system."
        url={`${window.location.origin}/forgot-password`}
      />
      <div className="w-full max-w-md">
        {/* BRANDING */}
        <div className="flex justify-center mb-8">
          <Logo width="70px" />
        </div>

        {/* MAIN CARD */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4 text-primary-light">
              {step === 1 ? <Lock size={28} /> : <KeyRound size={28} />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {step === 1 ? "Forgot Password?" : "Set New Password"}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {step === 1 ? (
                "Enter your email to receive a recovery code."
              ) : (
                <span className="flex items-center justify-center gap-1">
                  Code sent to{" "}
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {confirmedEmail || watch("email")}
                  </span>
                </span>
              )}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(
              step === 1 ? handleSendOtp : handleResetPassword
            )}
            className="space-y-6"
          >
            {/* --- STEP 1 FIELDS --- */}
            <div className={step === 1 ? "block space-y-5" : "hidden"}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                  />
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    className="w-full pl-10 bg-gray-50 dark:bg-gray-800"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                        message: "Invalid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs ml-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Math Captcha */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-3">
                  <ShieldCheck size={14} /> Security Check
                </label>
                <div className="flex items-center gap-3">
                  <div className="font-mono text-lg font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 select-none shadow-sm">
                    {captcha.num1} + {captcha.num2} = ?
                  </div>
                  <input
                    type="number"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Ans"
                    className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 focus:ring-2 focus:ring-primary-light outline-none text-center font-bold"
                  />
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-2 text-gray-400 hover:text-primary-light transition-colors"
                    title="Refresh Captcha"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* --- STEP 2 FIELDS (OTP + Password) --- */}
            {step === 2 && (
              <div className="space-y-5 animate-in slide-in-from-right-8 duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Enter 6-Digit Code
                  </label>
                  <Input
                    placeholder="123456"
                    className="text-center tracking-[0.5em] font-mono text-xl py-3 font-bold bg-gray-50 dark:bg-gray-800"
                    maxLength={6}
                    {...register("otp", { required: "OTP is required" })}
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                      New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Min 8 characters"
                      className="bg-gray-50 dark:bg-gray-800"
                      {...register("newPassword", {
                        required: "Password is required",
                        minLength: { value: 8, message: "Min 8 chars" },
                      })}
                    />
                    {errors.newPassword && (
                      <p className="text-red-500 text-xs ml-1">
                        {errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Re-enter password"
                      className="bg-gray-50 dark:bg-gray-800"
                      {...register("confirmPassword", {
                        required: true,
                        validate: (val) => {
                          if (watch("newPassword") !== val)
                            return "Passwords do not match";
                        },
                      })}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs ml-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Timer & Resend */}
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100 dark:border-gray-800 mt-4">
                  <span
                    className={`flex items-center gap-1.5 font-medium ${
                      timeLeft > 0 ? "text-gray-500" : "text-red-500"
                    }`}
                  >
                    <Timer size={14} />{" "}
                    {timeLeft > 0 ? `Resend in ${timeLeft}s` : "Code Expired"}
                  </span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={timeLeft > 0}
                    className={`font-bold text-sm transition-colors ${
                      timeLeft > 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-primary-light hover:text-primary-dark hover:underline"
                    }`}
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3.5 text-base font-bold shadow-lg shadow-primary-light/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
              disabled={loading}
              bgColor={
                step === 1
                  ? "bg-primary-light"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={18} className="animate-spin" /> Processing...
                </span>
              ) : step === 1 ? (
                "Send Verification Code"
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Reset & Login <CheckCircle2 size={18} />
                </span>
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-800 pt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium group"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />{" "}
              Back to Home
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          &copy; 2026 MegaBlog. Secure & Encrypted.
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
