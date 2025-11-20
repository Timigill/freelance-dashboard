"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import "./settings.css"; // import the CSS file

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    const userId = session.user?.id;
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Failed to fetch profile");
          return;
        }

        setForm((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
        }));
        setPreview(data.profilePic || null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch profile");
      }
    };

    fetchUser();
  }, [status, session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePic(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Password validation (if changing password)
      if (form.newPassword) {
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=~`[\]{}|:;"'<>,.?/]).{8,}$/;

        if (!passwordRegex.test(form.newPassword)) {
          toast.error(
            "New password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
          );
          setLoading(false);
          return;
        }

        if (form.newPassword !== form.confirmPassword) {
          toast.error("New passwords do not match");
          setLoading(false);
          return;
        }

        if (!form.oldPassword) {
          toast.error("Please enter your old password to change it");
          setLoading(false);
          return;
        }
      }

      const payload = {
        name: form.name,
        bio: form.bio,
        phone: form.phone,
      };

      if (form.oldPassword && form.newPassword) {
        payload.oldPassword = form.oldPassword;
        payload.newPassword = form.newPassword;
      }

      if (profilePic) {
        const reader = new FileReader();
        reader.readAsDataURL(profilePic);
        await new Promise((resolve) => {
          reader.onloadend = () => {
            payload.profilePic = reader.result;
            resolve();
          };
        });
      }

      const res = await fetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      toast.success("Profile updated successfully!");
      if (data.user?.profilePic) setPreview(data.user.profilePic);

      setForm((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      toast.error(err.message || "Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <p>Loading session...</p>;
  if (status === "unauthenticated")
    return <p>Please login to update your profile.</p>;

  return (
    <div className="settings-container">
      <h2 className="settings-title">Settings</h2>

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Top Section */}
        <div className="settings-top">
          {/* Profile Photo */}
          <div className="settings-photo">
            <div className="profile-pic-container">
              <img
                src={preview || "/default-avatar.png"}
                alt="Profile"
                className="profile-pic"
              />
            </div>
            <label className="upload-btn">
              Change Photo
              <input type="file" onChange={handleFileChange} hidden />
            </label>
          </div>

          {/* User Info */}
          <div className="settings-info">
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} readOnly />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Bio</label>
              <textarea
                name="bio"
                rows={3}
                value={form.bio}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="password-section">
          <h4>Change Password</h4>
          <div className="password-grid">
            {["oldPassword", "newPassword", "confirmPassword"].map(
              (field, i) => (
                <div key={i} className="password-input-group">
                  <input
                    type={form[`show${field}`] ? "text" : "password"}
                    name={field}
                    placeholder={
                      field === "oldPassword"
                        ? "Old Password"
                        : field === "newPassword"
                        ? "New Password"
                        : "Confirm Password"
                    }
                    value={form[field]}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(field)}
                    onBlur={() => setFocusedField(null)}
                  />
                  <span
                    className="toggle-password"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        [`show${field}`]: !prev[`show${field}`],
                      }))
                    }
                  >
                    {form[`show${field}`] ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="button-group">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Cancel
          </button>
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
