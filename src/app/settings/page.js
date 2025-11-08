"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Always run hooks, only fetch data when session exists
  useEffect(() => {
    if (status !== "authenticated") return;

    const userId = session.user?.id;
    if (!userId) {
      console.log("Session user ID not found:", session);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Failed to fetch profile");
          return;
        }

        setName(data.name || "");
        setEmail(data.email || "");
        setBio(data.bio || "");
        setPreview(data.profilePic || null);
      } catch (err) {
        toast.error("Failed to fetch profile");
        console.error(err);
      }
    };

    fetchUser();
  }, [status, session]);

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
      const payload = { name, bio };

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
    } catch (err) {
      toast.error(err.message || "Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Settings</h2>

      {status === "loading" && <p>Loading session...</p>}
      {status === "unauthenticated" && (
        <p>Please login to update your profile.</p>
      )}

      {status === "authenticated" && (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Bio</label>
            <textarea
              className="form-control"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Profile Picture</label>
            {preview && (
              <div className="mb-2">
                <img
                  src={preview}
                  alt="Preview"
                  width={120}
                  height={120}
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />
              </div>
            )}
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setName(session.user?.name || "");
                setEmail(session.user?.email || "");
                setBio("");
                setProfilePic(null);
                setPreview(null);

                window.location.href = "/dashboard";
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
