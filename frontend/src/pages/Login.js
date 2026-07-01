import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function validatePassword(password, email) {
  const errors = [];
  if (password.length < 8) errors.push("Must be at least 8 characters");
  if (email && password.toLowerCase().includes(email.split("@")[0].toLowerCase()))
    errors.push("Does not contain your email address");
  return errors;
}

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [company, setCompany] = useState("");
  const [accepted, setAccepted] = useState(false);

  const passwordErrors = validatePassword(password, email);

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      localStorage.setItem("token", res.data.access_token);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (passwordErrors.length > 0) return;
    if (!accepted) {
      setError("You must accept the Privacy Policy and Terms of Service");
      return;
    }
    try {
      await API.post("/auth/register", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        company,
      });
      setIsRegister(false);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Cannot connect to server");
    }
  };

  if (isRegister) {
    return (
      <div className="min-h-screen bg-[#202123] flex items-center justify-center py-10">
        <div className="w-full max-w-md px-8">
          <h1 className="text-white text-3xl font-bold mb-1">Create your account</h1>
          <p className="text-gray-400 text-sm mb-6">
            Have an account?{" "}
            <span
              onClick={() => { setIsRegister(false); setError(""); }}
              className="text-[#10a37f] cursor-pointer hover:underline"
            >
              Log in now
            </span>
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label htmlFor="reg-email" className="text-gray-300 text-sm font-medium">Email Address</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#2a2b32] border border-gray-600 focus:border-[#10a37f] text-white rounded-lg px-4 py-3 outline-none placeholder-gray-600 transition text-sm"
                required
              />
              <p className="text-gray-500 text-xs">We recommend using your work email</p>
            </div>

            {/* First + Last Name */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="reg-firstname" className="text-gray-300 text-sm font-medium">First Name</label>
                <input
                  id="reg-firstname"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-[#2a2b32] border border-gray-600 focus:border-[#10a37f] text-white rounded-lg px-4 py-3 outline-none placeholder-gray-600 transition text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="reg-lastname" className="text-gray-300 text-sm font-medium">Last Name</label>
                <input
                  id="reg-lastname"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-[#2a2b32] border border-gray-600 focus:border-[#10a37f] text-white rounded-lg px-4 py-3 outline-none placeholder-gray-600 transition text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="reg-password" className="text-gray-300 text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#2a2b32] border border-gray-600 focus:border-[#10a37f] text-white rounded-lg px-4 py-3 outline-none placeholder-gray-600 transition text-sm pr-16"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs hover:text-white transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="flex flex-col gap-0.5 mt-1">
                {["Must be at least 8 characters", "Does not contain your email address"].map((rule) => {
                  const passing = !passwordErrors.includes(rule) && password.length > 0;
                  return (
                    <p key={rule} className={`text-xs flex items-center gap-1 ${passing ? "text-[#10a37f]" : "text-gray-500"}`}>
                      <span>{passing ? "✓" : "○"}</span> {rule}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-1">
              <label htmlFor="reg-company" className="text-gray-300 text-sm font-medium">
                Company Name <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                id="reg-company"
                name="company"
                type="text"
                autoComplete="organization"
                placeholder="Acme Inc."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="bg-[#2a2b32] border border-gray-600 focus:border-[#10a37f] text-white rounded-lg px-4 py-3 outline-none placeholder-gray-600 transition text-sm"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 accent-[#10a37f]"
              />
              <span className="text-gray-400 text-xs">
                I accept the{" "}
                <span className="text-[#10a37f] hover:underline cursor-pointer">Privacy Policy</span>
                {" "}and the{" "}
                <span className="text-[#10a37f] hover:underline cursor-pointer">Terms of Service</span>
              </span>
            </label>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={passwordErrors.length > 0 || !accepted}
              className="bg-[#10a37f] hover:bg-[#0e8f6f] disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition mt-1"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#343541] flex items-center justify-center">
      <div className="bg-[#40414f] p-8 rounded-xl w-full max-w-sm shadow-lg">
        <h1 className="text-white text-2xl font-bold mb-2 text-center">Welcome Back</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Sign in to continue</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="bg-[#202123] text-white rounded-lg px-4 py-3 outline-none placeholder-gray-500 text-sm"
            required
          />
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="bg-[#202123] text-white rounded-lg px-4 py-3 outline-none placeholder-gray-500 text-sm"
            required
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#10a37f] hover:bg-[#0e8f6f] disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing in...
              </>
            ) : "Sign In"}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Don't have an account?{" "}
          <span
            onClick={() => { setIsRegister(true); setError(""); }}
            className="text-[#10a37f] cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
