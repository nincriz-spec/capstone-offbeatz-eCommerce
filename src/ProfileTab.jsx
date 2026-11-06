import { useState } from "react";
import axios from "axios";
import { useFlash } from "./FlashStore";

export default function ProfileTab({ profile, token, onSaved }) {
  const { showMessage } = useFlash();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  if (!profile) return <p>Loading...</p>;

  function startEdit() {
    setName(profile.name);
    setPhone(profile.phone);
    setEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      const res = await axios.put(
        "/api/users/me",
        { name, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSaved(res.data);
      setEditing(false);
      showMessage("Profile updated", "success");
    } catch (err) {
      showMessage(err.response?.data?.message || "Could not update profile", "error");
    }
  }

  if (editing) {
    return (
      <form className="auth-form" onSubmit={handleSave}>
        <h3>Edit profile</h3>

        <label htmlFor="edit-name">Full name</label>
        <input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />

        <label htmlFor="edit-phone">Phone</label>
        <input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <div className="form-actions">
          <button className="btn" type="submit">Save</button>
          <button className="btn" type="button" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <h3>Profile details</h3>
      <div className="profile-row"><span>Name</span><span>{profile.name}</span></div>
      <div className="profile-row"><span>Email</span><span>{profile.email}</span></div>
      <div className="profile-row"><span>Phone</span><span>{profile.phone}</span></div>
      <button className="btn" onClick={startEdit}>Edit profile</button>
    </div>
  );
}