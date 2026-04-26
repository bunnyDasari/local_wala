"use client";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { X, Loader2, Bike, Phone, ArrowLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { clsx } from "clsx";

interface AuthModalProps {
  onClose: () => void;
}

type LoginStep = "phone" | "otp";

export default function AuthModal({ onClose }: AuthModalProps) {
  const { setUser, register } = useAuthStore();
  const [tab, setTab] = useState<"login" | "register">("login");

  // ── Login state ────────────────────────────────────────────────────────────
  const [loginStep, setLoginStep] = useState<LoginStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [loginLoading, setLoginLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const otpRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  // ── Register state ─────────────────────────────────────────────────────────
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", password: "", role: "user" });
  const [showPass, setShowPass] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const setReg = (k: keyof typeof regForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setRegForm((f) => ({ ...f, [k]: e.target.value }));

  // ── Send OTP ───────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) { toast.error("Enter a valid 10-digit number"); return; }
    setLoginLoading(true);
    setDevOtp(null);
    try {
      const res = await authApi.sendOtp(cleaned);
      if ((res as any).dev_otp) setDevOtp((res as any).dev_otp);
      setLoginStep("otp");
      setTimer(30);
      setOtp(["", "", "", "", "", ""]);
      toast.success(res.message);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) { toast.error("Enter the 6-digit OTP"); return; }
    setLoginLoading(true);
    try {
      const res = await authApi.verifyOtp(phone.replace(/\D/g, ""), code);
      setUser(res);
      toast.success("Welcome back! 👋");
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs[0].current?.focus(), 50);
    } finally {
      setLoginLoading(false);
    }
  };

  // ── OTP input ──────────────────────────────────────────────────────────────
  const handleOtpChange = (i: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[i] = value.slice(-1);
    setOtp(next);
    if (value && i < 5) otpRefs[i + 1].current?.focus();
    if (next.every((d) => d !== "") && i === 5) setTimeout(handleVerifyOtp, 150);
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs[i - 1].current?.focus();
  };

  // ── Register submit ────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      await register(regForm);
      toast.success("Account created! 🎉");
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 px-8 pt-8 pb-10 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
          {tab === "login" && loginStep === "otp" && (
            <button
              onClick={() => { setLoginStep("phone"); setOtp(["", "", "", "", "", ""]); }}
              className="absolute top-4 left-4 p-1.5 rounded-xl hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Bike className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">LocalWala</span>
          </div>

          <h2 className="text-2xl font-bold">
            {tab === "register" ? "Create Account" :
              loginStep === "phone" ? "Welcome Back!" : "Verify OTP"}
          </h2>
          <p className="text-brand-100 text-sm mt-1">
            {tab === "register" ? "Fill in your details to get started" :
              loginStep === "phone" ? "Login with your registered mobile number" :
                `OTP sent to +91 ${phone}`}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setLoginStep("phone"); }}
              className={clsx(
                "flex-1 py-3.5 text-sm font-semibold transition-colors",
                tab === t
                  ? "text-brand-600 border-b-2 border-brand-500"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {t === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        {/* ══ LOGIN TAB ══════════════════════════════════════════════════════ */}
        {tab === "login" && (
          <div className="px-8 py-6 space-y-5">

            {/* Step 1 — Phone */}
            {loginStep === "phone" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Mobile Number
                  </label>
                  <div className="flex items-center border-2 border-gray-200 rounded-2xl overflow-hidden focus-within:border-brand-400 transition-colors">
                    <div className="flex items-center gap-1.5 px-3 py-3.5 bg-gray-50 border-r border-gray-200 shrink-0">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold text-gray-600">+91</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      placeholder="Enter 10-digit number"
                      className="flex-1 px-4 py-3.5 text-sm focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loginLoading || phone.replace(/\D/g, "").length !== 10}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-60"
                >
                  {loginLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
                    : <><span>Send OTP</span><ChevronRight className="w-4 h-4" /></>
                  }
                </button>

                <p className="text-xs text-center text-gray-400">
                  Don't have an account?{" "}
                  <button onClick={() => setTab("register")} className="text-brand-600 font-semibold hover:underline">
                    Register here
                  </button>
                </p>
              </>
            )}

            {/* Step 2 — OTP */}
            {loginStep === "otp" && (
              <>
                {/* Dev OTP hint */}
                {devOtp && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700 font-medium text-center">
                    🧪 Dev mode OTP:{" "}
                    <span
                      className="font-mono font-bold text-amber-900 cursor-pointer underline"
                      onClick={() => {
                        const digits = devOtp.split("");
                        setOtp(digits);
                      }}
                    >
                      {devOtp}
                    </span>{" "}
                    (click to fill)
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Enter 6-digit OTP
                  </label>
                  <div className="flex gap-2 justify-between">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={otpRefs[i]}
                        type="tel"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={clsx(
                          "w-11 h-12 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all",
                          digit
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-gray-200 focus:border-brand-400"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loginLoading || otp.join("").length < 6}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-60"
                >
                  {loginLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                    : "Verify & Login"
                  }
                </button>

                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-xs text-gray-400">
                      Resend OTP in <span className="font-bold text-brand-600">{timer}s</span>
                    </p>
                  ) : (
                    <button onClick={handleSendOtp} className="text-xs text-brand-600 font-semibold hover:underline">
                      Resend OTP
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ REGISTER TAB ═══════════════════════════════════════════════════ */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="px-8 py-6 space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegForm(f => ({ ...f, role: "user" }))}
                  className={clsx(
                    "px-4 py-3 rounded-xl text-sm font-semibold transition-all border-2",
                    regForm.role === "user"
                      ? "bg-brand-50 border-brand-500 text-brand-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  🛒 Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRegForm(f => ({ ...f, role: "vendor" }))}
                  className={clsx(
                    "px-4 py-3 rounded-xl text-sm font-semibold transition-all border-2",
                    regForm.role === "vendor"
                      ? "bg-brand-50 border-brand-500 text-brand-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  🏪 Shop Owner
                </button>
              </div>
            </div>

            <Field label="Full Name" type="text" value={regForm.name} onChange={setReg("name")} placeholder="Ravi Kumar" required />
            <Field label="Email" type="email" value={regForm.email} onChange={setReg("email")} placeholder="you@email.com" required />
            <Field label="Phone Number" type="tel" value={regForm.phone} onChange={(e) => setRegForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="9876543210" required />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={regForm.password}
                  onChange={setReg("password")}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full pr-10 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={regLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-1 disabled:opacity-70"
            >
              {regLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                : "Create Account 🎉"
              }
            </button>

            <p className="text-xs text-center text-gray-400">
              Already have an account?{" "}
              <button type="button" onClick={() => setTab("login")} className="text-brand-600 font-semibold hover:underline">
                Login here
              </button>
            </p>
          </form>
        )}

      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition"
      />
    </div>
  );
}