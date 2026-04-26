"use client";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import {
  X, Loader2, Bike, Phone, ArrowLeft, ChevronRight,
  Eye, EyeOff, Mail, Lock, Store,
} from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { clsx } from "clsx";

interface AuthModalProps {
  onClose: () => void;
}

type Tab = "login" | "register";
type LoginMethod = "phone" | "email";
type PhoneStep = "phone" | "otp";

export default function AuthModal({ onClose }: AuthModalProps) {
  const router = useRouter();
  const { setUser, login, register } = useAuthStore();
  const [tab, setTab] = useState<Tab>("login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone");

  // ── Phone OTP state ────────────────────────────────────────────────────────
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const otpRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  // ── Email login state ──────────────────────────────────────────────────────
  const [emailLogin, setEmailLogin] = useState({ email: "", password: "" });
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [emailLoginLoading, setEmailLoginLoading] = useState(false);

  // ── Register state ─────────────────────────────────────────────────────────
  const [regForm, setRegForm] = useState({
    name: "", email: "", phone: "", password: "", role: "user",
  });
  const [showRegPass, setShowRegPass] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const setReg = (k: keyof typeof regForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setRegForm((f) => ({ ...f, [k]: e.target.value }));

  // ── After login: redirect vendors ─────────────────────────────────────────
  const handlePostLogin = (role: string) => {
    toast.success("Welcome back! 👋");
    onClose();
    if (role === "vendor") {
      router.push("/vendor/dashboard");
    }
  };

  // ── Email/password login ───────────────────────────────────────────────────
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailLogin.email || !emailLogin.password) {
      toast.error("Enter your email and password");
      return;
    }
    setEmailLoginLoading(true);
    try {
      await login(emailLogin.email, emailLogin.password);
      const role = useAuthStore.getState().role ?? "user";
      handlePostLogin(role);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setEmailLoginLoading(false);
    }
  };

  // ── Send OTP ───────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) { toast.error("Enter a valid 10-digit number"); return; }
    setPhoneLoading(true);
    setDevOtp(null);
    try {
      const res = await authApi.sendOtp(cleaned);
      if ((res as any).dev_otp) setDevOtp((res as any).dev_otp);
      setPhoneStep("otp");
      setTimer(30);
      setOtp(["", "", "", "", "", ""]);
      toast.success(res.message);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setPhoneLoading(false);
    }
  };

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) { toast.error("Enter the 6-digit OTP"); return; }
    setPhoneLoading(true);
    try {
      const res = await authApi.verifyOtp(phone.replace(/\D/g, ""), code);
      setUser(res);
      handlePostLogin(res.role);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs[0].current?.focus(), 50);
    } finally {
      setPhoneLoading(false);
    }
  };

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

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      await register(regForm);
      const role = useAuthStore.getState().role ?? "user";
      toast.success("Account created! 🎉");
      onClose();
      if (role === "vendor") router.push("/vendor/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  const resetLogin = () => {
    setPhoneStep("phone");
    setOtp(["", "", "", "", "", ""]);
    setDevOtp(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        style={{ background: "var(--surface)" }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 px-8 pt-8 pb-10 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Back button for OTP step */}
          {tab === "login" && loginMethod === "phone" && phoneStep === "otp" && (
            <button
              onClick={resetLogin}
              className="absolute top-4 left-4 p-1.5 rounded-xl hover:bg-white/20 transition-colors"
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
            {tab === "register"
              ? "Create Account"
              : loginMethod === "phone" && phoneStep === "otp"
              ? "Verify OTP"
              : "Welcome Back!"}
          </h2>
          <p className="text-brand-100 text-sm mt-1">
            {tab === "register"
              ? "Fill in your details to get started"
              : loginMethod === "phone" && phoneStep === "otp"
              ? `OTP sent to +91 ${phone}`
              : loginMethod === "email"
              ? "Login with your email and password"
              : "Login with your mobile number"}
          </p>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div
          className="flex border-b"
          style={{ borderColor: "var(--border-soft)" }}
        >
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); resetLogin(); }}
              className={clsx(
                "flex-1 py-3.5 text-sm font-semibold transition-colors",
                tab === t
                  ? "text-brand-600 border-b-2 border-brand-500"
                  : "hover:opacity-80"
              )}
              style={tab !== t ? { color: "var(--text-subtle)" } : {}}
            >
              {t === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        {/* ══ LOGIN TAB ═══════════════════════════════════════════════════════ */}
        {tab === "login" && (
          <div className="px-8 py-6 space-y-5">

            {/* Login method toggle */}
            {phoneStep === "phone" && (
              <div
                className="flex rounded-xl p-1 gap-1"
                style={{ background: "var(--surface-3)" }}
              >
                <button
                  onClick={() => setLoginMethod("phone")}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all",
                    loginMethod === "phone"
                      ? "bg-white shadow text-brand-600"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Phone className="w-4 h-4" /> Phone OTP
                </button>
                <button
                  onClick={() => setLoginMethod("email")}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all",
                    loginMethod === "email"
                      ? "bg-white shadow text-brand-600"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
              </div>
            )}

            {/* ── Vendor hint ── */}
            {loginMethod === "email" && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-200">
                <Store className="w-4 h-4 text-orange-500 shrink-0" />
                <p className="text-xs text-orange-700 font-medium">
                  Shop owners — use email login to access your vendor dashboard
                </p>
              </div>
            )}

            {/* ── Email + Password form ── */}
            {loginMethod === "email" && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={emailLogin.email}
                      onChange={(e) => setEmailLogin((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@email.com"
                      required
                      autoFocus
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition"
                      style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showLoginPass ? "text" : "password"}
                      value={emailLogin.password}
                      onChange={(e) => setEmailLogin((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Your password"
                      required
                      className="w-full pl-9 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition"
                      style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={emailLoginLoading}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-60"
                >
                  {emailLoginLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</>
                    : <><span>Login</span><ChevronRight className="w-4 h-4" /></>
                  }
                </button>

                <p className="text-xs text-center text-gray-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("register")}
                    className="text-brand-600 font-semibold hover:underline"
                  >
                    Register here
                  </button>
                </p>
              </form>
            )}

            {/* ── Phone OTP — Step 1 ── */}
            {loginMethod === "phone" && phoneStep === "phone" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Mobile Number
                  </label>
                  <div
                    className="flex items-center border-2 rounded-2xl overflow-hidden focus-within:border-brand-400 transition-colors"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div
                      className="flex items-center gap-1.5 px-3 py-3.5 border-r shrink-0"
                      style={{ background: "var(--surface-3)", borderColor: "var(--border)" }}
                    >
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
                      style={{ background: "transparent", color: "var(--text)" }}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={phoneLoading || phone.replace(/\D/g, "").length !== 10}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-60"
                >
                  {phoneLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
                    : <><span>Send OTP</span><ChevronRight className="w-4 h-4" /></>
                  }
                </button>

                <p className="text-xs text-center text-gray-400">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setTab("register")}
                    className="text-brand-600 font-semibold hover:underline"
                  >
                    Register here
                  </button>
                </p>
              </>
            )}

            {/* ── Phone OTP — Step 2 ── */}
            {loginMethod === "phone" && phoneStep === "otp" && (
              <>
                {devOtp && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700 font-medium text-center">
                    🧪 Dev OTP:{" "}
                    <span
                      className="font-mono font-bold text-amber-900 cursor-pointer underline"
                      onClick={() => setOtp(devOtp.split(""))}
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
                  disabled={phoneLoading || otp.join("").length < 6}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-60"
                >
                  {phoneLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                    : "Verify & Login"
                  }
                </button>

                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-xs text-gray-400">
                      Resend in <span className="font-bold text-brand-600">{timer}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleSendOtp}
                      className="text-xs text-brand-600 font-semibold hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ REGISTER TAB ════════════════════════════════════════════════════ */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="px-8 py-6 space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegForm((f) => ({ ...f, role: "user" }))}
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
                  onClick={() => setRegForm((f) => ({ ...f, role: "vendor" }))}
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

            <Field
              label="Full Name"
              type="text"
              value={regForm.name}
              onChange={setReg("name")}
              placeholder="Ravi Kumar"
              required
            />
            <Field
              label="Email"
              type="email"
              value={regForm.email}
              onChange={setReg("email")}
              placeholder="you@email.com"
              required
            />
            <Field
              label="Phone Number"
              type="tel"
              value={regForm.phone}
              onChange={(e) =>
                setRegForm((f) => ({
                  ...f,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                }))
              }
              placeholder="9876543210"
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showRegPass ? "text" : "password"}
                  value={regForm.password}
                  onChange={setReg("password")}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full pr-10 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition"
                  style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPass(!showRegPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              <button
                type="button"
                onClick={() => setTab("login")}
                className="text-brand-600 font-semibold hover:underline"
              >
                Login here
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition"
        style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
      />
    </div>
  );
}
