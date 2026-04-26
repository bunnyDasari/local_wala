"use client";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { X, Loader2, Phone, ArrowLeft, ChevronRight, Eye, EyeOff, Mail, Lock, Store } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";

interface AuthModalProps { onClose: () => void; }
type Tab = "login" | "register";
type LoginMethod = "phone" | "email";
type PhoneStep = "phone" | "otp";

export default function AuthModal({ onClose }: AuthModalProps) {
  const router = useRouter();
  const { setUser, login, register } = useAuthStore();
  const [tab, setTab] = useState<Tab>("login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [emailLogin, setEmailLogin] = useState({ email: "", password: "" });
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", password: "", role: "user" });
  const [showRegPass, setShowRegPass] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const otpRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const postLogin = (role: string) => {
    toast.success("Welcome! 👋");
    onClose();
    if (role === "vendor") router.push("/vendor/dashboard");
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      await login(emailLogin.email, emailLogin.password);
      postLogin(useAuthStore.getState().role ?? "user");
    } catch (err: any) { toast.error(err.message || "Login failed"); }
    finally { setEmailLoading(false); }
  };

  const handleSendOtp = async () => {
    const c = phone.replace(/\D/g, "");
    if (c.length !== 10) { toast.error("Enter a valid 10-digit number"); return; }
    setPhoneLoading(true); setDevOtp(null);
    try {
      const res = await authApi.sendOtp(c);
      if ((res as any).dev_otp) setDevOtp((res as any).dev_otp);
      setPhoneStep("otp"); setTimer(30); setOtp(["","","","","",""]);
      toast.success(res.message);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err: any) { toast.error(err.message || "Failed to send OTP"); }
    finally { setPhoneLoading(false); }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) { toast.error("Enter the 6-digit OTP"); return; }
    setPhoneLoading(true);
    try {
      const res = await authApi.verifyOtp(phone.replace(/\D/g, ""), code);
      setUser(res); postLogin(res.role);
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
      setOtp(["","","","","",""]); setTimeout(() => otpRefs[0].current?.focus(), 50);
    } finally { setPhoneLoading(false); }
  };

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next);
    if (v && i < 5) otpRefs[i + 1].current?.focus();
    if (next.every(d => d !== "") && i === 5) setTimeout(handleVerifyOtp, 150);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setRegLoading(true);
    try {
      await register(regForm);
      toast.success("Account created! 🎉"); onClose();
      if (useAuthStore.getState().role === "vendor") router.push("/vendor/dashboard");
    } catch (err: any) { toast.error(err.message || "Registration failed"); }
    finally { setRegLoading(false); }
  };

  const resetLogin = () => { setPhoneStep("phone"); setOtp(["","","","","",""]); setDevOtp(null); };

  const inputStyle = { background: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-3xl w-full max-w-sm overflow-hidden animate-slide-up"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

        {/* Header */}
        <div className="relative px-7 pt-7 pb-8 text-white"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}>
            <X className="w-4 h-4" />
          </button>
          {tab === "login" && loginMethod === "phone" && phoneStep === "otp" && (
            <button onClick={resetLogin}
              className="absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: "rgba(255,255,255,0.2)" }}>🛵</div>
            <span className="text-xl font-black">LocalWala</span>
          </div>
          <h2 className="text-2xl font-black">
            {tab === "register" ? "Create Account"
              : loginMethod === "phone" && phoneStep === "otp" ? "Verify OTP"
              : "Welcome Back!"}
          </h2>
          <p className="text-sm mt-1 opacity-80">
            {tab === "register" ? "Fill in your details to get started"
              : loginMethod === "phone" && phoneStep === "otp" ? `OTP sent to +91 ${phone}`
              : loginMethod === "email" ? "Login with email & password"
              : "Login with your mobile number"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
          {(["login", "register"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); resetLogin(); }}
              className="flex-1 py-3.5 text-sm font-bold transition-colors"
              style={{
                color: tab === t ? "var(--brand)" : "var(--text-3)",
                borderBottom: tab === t ? "2px solid var(--brand)" : "2px solid transparent",
              }}>
              {t === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        {/* LOGIN */}
        {tab === "login" && (
          <div className="px-7 py-6 space-y-4">
            {/* Method toggle */}
            {phoneStep === "phone" && (
              <div className="flex rounded-2xl p-1 gap-1" style={{ background: "var(--bg-input)" }}>
                {(["phone", "email"] as const).map(m => (
                  <button key={m} onClick={() => setLoginMethod(m)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: loginMethod === m ? "var(--brand)" : "transparent",
                      color: loginMethod === m ? "white" : "var(--text-3)",
                      boxShadow: loginMethod === m ? "var(--shadow-brand)" : "none",
                    }}>
                    {m === "phone" ? <><Phone className="w-4 h-4" /> Phone</> : <><Mail className="w-4 h-4" /> Email</>}
                  </button>
                ))}
              </div>
            )}

            {/* Vendor hint */}
            {loginMethod === "email" && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
                style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)" }}>
                <Store className="w-4 h-4 shrink-0" style={{ color: "var(--brand)" }} />
                <p className="text-xs font-semibold" style={{ color: "var(--brand)" }}>
                  Shop owners — use email login for vendor dashboard
                </p>
              </div>
            )}

            {/* Email form */}
            {loginMethod === "email" && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-3)" }} />
                  <input type="email" value={emailLogin.email} required autoFocus
                    onChange={e => setEmailLogin(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@email.com" className="input pl-11" style={inputStyle} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-3)" }} />
                  <input type={showLoginPass ? "text" : "password"} value={emailLogin.password} required
                    onChange={e => setEmailLogin(f => ({ ...f, password: e.target.value }))}
                    placeholder="Your password" className="input pl-11 pr-11" style={inputStyle} />
                  <button type="button" onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }}>
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button type="submit" disabled={emailLoading} className="btn-primary w-full gap-2">
                  {emailLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</>
                    : <><span>Login</span><ChevronRight className="w-4 h-4" /></>}
                </button>
                <p className="text-xs text-center" style={{ color: "var(--text-3)" }}>
                  No account?{" "}
                  <button type="button" onClick={() => setTab("register")}
                    className="font-bold" style={{ color: "var(--brand)" }}>Register here</button>
                </p>
              </form>
            )}

            {/* Phone step 1 */}
            {loginMethod === "phone" && phoneStep === "phone" && (
              <>
                <div className="flex rounded-2xl overflow-hidden" style={{ border: "1.5px solid var(--border)" }}>
                  <div className="flex items-center gap-1.5 px-4 py-3.5 shrink-0"
                    style={{ background: "var(--bg-input)", borderRight: "1px solid var(--border)" }}>
                    <Phone className="w-4 h-4" style={{ color: "var(--brand)" }} />
                    <span className="text-sm font-bold" style={{ color: "var(--text-2)" }}>+91</span>
                  </div>
                  <input type="tel" value={phone} autoFocus
                    onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                    placeholder="10-digit number" className="flex-1 px-4 py-3.5 text-sm outline-none"
                    style={{ background: "transparent", color: "var(--text)" }} />
                </div>
                <button onClick={handleSendOtp} disabled={phoneLoading || phone.replace(/\D/g, "").length !== 10}
                  className="btn-primary w-full gap-2">
                  {phoneLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    : <><span>Send OTP</span><ChevronRight className="w-4 h-4" /></>}
                </button>
                <p className="text-xs text-center" style={{ color: "var(--text-3)" }}>
                  No account?{" "}
                  <button onClick={() => setTab("register")} className="font-bold" style={{ color: "var(--brand)" }}>
                    Register here
                  </button>
                </p>
              </>
            )}

            {/* Phone step 2 — OTP */}
            {loginMethod === "phone" && phoneStep === "otp" && (
              <>
                {devOtp && (
                  <div className="px-4 py-2.5 rounded-2xl text-xs text-center font-semibold"
                    style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)", color: "#facc15" }}>
                    🧪 Dev OTP:{" "}
                    <span className="font-mono font-black cursor-pointer underline"
                      onClick={() => setOtp(devOtp.split(""))}>{devOtp}</span> (click to fill)
                  </div>
                )}
                <div className="flex gap-2 justify-between">
                  {otp.map((d, i) => (
                    <input key={i} ref={otpRefs[i]} type="tel" inputMode="numeric" maxLength={1} value={d}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => e.key === "Backspace" && !d && i > 0 && otpRefs[i-1].current?.focus()}
                      className="w-11 h-12 text-center text-xl font-black rounded-2xl outline-none transition-all"
                      style={{
                        background: d ? "rgba(249,115,22,0.15)" : "var(--bg-input)",
                        border: `2px solid ${d ? "var(--brand)" : "var(--border)"}`,
                        color: d ? "var(--brand)" : "var(--text)",
                      }} />
                  ))}
                </div>
                <button onClick={handleVerifyOtp} disabled={phoneLoading || otp.join("").length < 6}
                  className="btn-primary w-full">
                  {phoneLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Verify & Login"}
                </button>
                <div className="text-center text-xs" style={{ color: "var(--text-3)" }}>
                  {timer > 0 ? <>Resend in <span className="font-bold" style={{ color: "var(--brand)" }}>{timer}s</span></>
                    : <button onClick={handleSendOtp} className="font-bold" style={{ color: "var(--brand)" }}>Resend OTP</button>}
                </div>
              </>
            )}
          </div>
        )}

        {/* REGISTER */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="px-7 py-6 space-y-4">
            {/* Role */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: "user", label: "🛒 Customer" },
                { role: "vendor", label: "🏪 Shop Owner" },
              ].map(r => (
                <button key={r.role} type="button" onClick={() => setRegForm(f => ({ ...f, role: r.role }))}
                  className="py-3 rounded-2xl text-sm font-bold transition-all"
                  style={{
                    background: regForm.role === r.role ? "rgba(249,115,22,0.15)" : "var(--bg-input)",
                    border: `2px solid ${regForm.role === r.role ? "var(--brand)" : "var(--border)"}`,
                    color: regForm.role === r.role ? "var(--brand)" : "var(--text-3)",
                  }}>
                  {r.label}
                </button>
              ))}
            </div>

            {[
              { key: "name",  type: "text",  placeholder: "Full Name" },
              { key: "email", type: "email", placeholder: "Email address" },
              { key: "phone", type: "tel",   placeholder: "Phone number" },
            ].map(f => (
              <input key={f.key} type={f.type} placeholder={f.placeholder} required className="input"
                style={inputStyle}
                value={(regForm as any)[f.key]}
                onChange={e => setRegForm(r => ({
                  ...r,
                  [f.key]: f.key === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value
                }))} />
            ))}

            <div className="relative">
              <input type={showRegPass ? "text" : "password"} placeholder="Password (min 6 chars)"
                required minLength={6} value={regForm.password} className="input pr-11" style={inputStyle}
                onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} />
              <button type="button" onClick={() => setShowRegPass(!showRegPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }}>
                {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button type="submit" disabled={regLoading} className="btn-primary w-full">
              {regLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Account 🎉"}
            </button>

            <p className="text-xs text-center" style={{ color: "var(--text-3)" }}>
              Already have an account?{" "}
              <button type="button" onClick={() => setTab("login")}
                className="font-bold" style={{ color: "var(--brand)" }}>Login here</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
