import { useEffect, useState, type FormEvent } from "react";
import { UserRound, Mail, LockKeyhole, Save, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AdminSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [userId, setUserId] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  useEffect(() => {
    async function loadAdmin() {
      if (!supabase) {
        setError("Supabase is not configured.");
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        setError("Please log in again.");
        setLoading(false);
        return;
      }

      const user = authData.user;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "teacher") {
        setError("Access denied. Teacher account required.");
        setLoading(false);
        return;
      }

      setUserId(user.id);
      setName(profile.full_name || "");
      setEmail(user.email || "");
      setOriginalEmail(user.email || "");
      setLoading(false);
    }

    void loadAdmin();
  }, []);

  async function updateName(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!supabase || !userId) return;

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: name.trim() })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Your name has been updated successfully!");
    }

    setSaving(false);
  }

  async function updateEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!supabase || !userId) return;

    const newEmail = email.trim().toLowerCase();

    if (!newEmail) {
      setError("Please enter an email address.");
      return;
    }

    if (newEmail === originalEmail.toLowerCase()) {
      setMessage("Your email address is already up to date.");
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage(
        "Email change requested. Check your inbox and follow the confirmation instructions."
      );
    }

    setSaving(false);
  }

  async function updatePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!supabase || !userId) return;

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setSaving(true);

    // Verify the current password before requesting a password change.
    const { data: authData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !authData.user?.email) {
      setError("Unable to verify your account. Please log in again.");
      setSaving(false);
      return;
    }

    const { error: verifyError } =
      await supabase.auth.signInWithPassword({
        email: authData.user.email,
        password: currentPassword,
      });

    if (verifyError) {
      setError("Current password is incorrect.");
      setSaving(false);
      return;
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (passwordError) {
      setError(passwordError.message);
    } else {
      setMessage("Your password has been changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setSaving(false);
  }

  if (loading) {
    return <div className="center">Loading account settings...</div>;
  }

  if (!userId) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <h2>Account Settings</h2>
        <p role="alert">{error || "Account unavailable."}</p>
      </div>
    );
  }

  return (
    <main className="page">
      <span className="eyebrow">
        <ShieldCheck size={16} /> ADMIN ACCOUNT
      </span>

      <h1>Account Settings ⚙️</h1>

      <p className="lead">
        Manage your personal account information and security.
      </p>

      {message && (
        <div className="notice" role="status">
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: 24,
          maxWidth: 750,
          marginTop: 30,
        }}
      >
        {/* FULL NAME */}
        <form className="card form-card" onSubmit={updateName}>
          <h2>
            <UserRound size={22} /> Personal Information
          </h2>

          <p className="muted">Update your display name.</p>

          <label>
            Full Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </label>

          <button className="btn" type="submit" disabled={saving}>
            <Save size={17} />
            {saving ? "Saving..." : "Save Name"}
          </button>
        </form>

        {/* EMAIL */}
        <form className="card form-card" onSubmit={updateEmail}>
          <h2>
            <Mail size={22} /> Email Address
          </h2>

          <p className="muted">
            Change the email address used to sign in.
          </p>

          <label>
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </label>

          <button className="btn" type="submit" disabled={saving}>
            <Save size={17} />
            {saving ? "Updating..." : "Update Email"}
          </button>

          <small>
            You may need to confirm the new email address before the
            change takes effect.
          </small>
        </form>

        {/* PASSWORD */}
        <form className="card form-card" onSubmit={updatePassword}>
          <h2>
            <LockKeyhole size={22} /> Change Password
          </h2>

          <p className="muted">
            Choose a strong password to protect your account.
          </p>

          <label>
            Current Password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <label>
            New Password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <label>
            Confirm New Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <button className="btn" type="submit" disabled={saving}>
            <LockKeyhole size={17} />
            {saving ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </main>
  );
}