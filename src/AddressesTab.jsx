import { useState } from "react";
import axios from "axios";
import { useFlash } from "./FlashStore";

const emptyForm = { street: "", block: "", city: "", postal_code: "" };

export default function AddressesTab({ addresses, token, onChanged }) {
  const { showMessage } = useFlash();
  const [editingId, setEditingId] = useState(null); // null = list, "new" = adding, number = editing
  const [form, setForm] = useState(emptyForm);
  const headers = { Authorization: `Bearer ${token}` };

  function startAdd() {
    setForm(emptyForm);
    setEditingId("new");
  }

  function startEdit(a) {
    setForm({
      street: a.street,
      block: a.block,
      city: a.city,
      postal_code: a.postal_code,
    });
    setEditingId(a.address_id);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      let res;
      if (editingId === "new") {
        res = await axios.post("/api/users/addresses", form, { headers });
      } else {
        res = await axios.put(`/api/users/addresses/${editingId}`, form, { headers });
      }
      onChanged(res.data);
      setEditingId(null);
      showMessage("Address saved", "success");
    } catch (err) {
      showMessage(err.response?.data?.message || "Could not save address", "error");
    }
  }

  async function handleRemove(id) {
    if (!window.confirm("Remove this address?")) return;
    try {
      const res = await axios.delete(`/api/users/addresses/${id}`, { headers });
      onChanged(res.data);
      showMessage("Address removed", "success");
    } catch (err) {
      showMessage(err.response?.data?.message || "Could not remove address", "error");
    }
  }

  if (editingId !== null) {
    return (
      <form className="auth-form" onSubmit={handleSave}>
        <h3>{editingId === "new" ? "Add address" : "Edit address"}</h3>

        <label htmlFor="a-street">Street</label>
        <input id="a-street" name="street" value={form.street} onChange={handleChange} />

        <label htmlFor="a-block">Block / unit</label>
        <input id="a-block" name="block" value={form.block} onChange={handleChange} />

        <label htmlFor="a-city">City</label>
        <input id="a-city" name="city" value={form.city} onChange={handleChange} />

        <label htmlFor="a-postal">Postal code</label>
        <input id="a-postal" name="postal_code" value={form.postal_code} onChange={handleChange} />

        <div className="form-actions">
          <button className="btn" type="submit">Save</button>
          <button className="btn" type="button" onClick={() => setEditingId(null)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <h3>My addresses</h3>
      {addresses.length === 0 && <p>No saved addresses yet.</p>}

      {addresses.map((a) => (
        <div className="order-card" key={a.address_id}>
          <p>{a.street}</p>
          <p>{a.block}</p>
          <p>{a.city} {a.postal_code}</p>
          <div className="form-actions">
            <button className="btn" onClick={() => startEdit(a)}>Edit</button>
            <button className="btn" onClick={() => handleRemove(a.address_id)}>Remove</button>
          </div>
        </div>
      ))}

      <button className="btn" onClick={startAdd}>Add address</button>
    </div>
  );
}