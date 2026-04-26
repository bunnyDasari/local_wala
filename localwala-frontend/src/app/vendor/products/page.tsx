"use client";
import { useEffect, useState } from "react";
import { vendorApi } from "@/lib/api";
import type { VendorProduct } from "@/types";
import { Package, Loader2, Plus, Edit2, Trash2, X, Save, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

const EMPTY_FORM = { name: "", description: "", price: 0, original_price: 0, unit: "kg", stock: 0, image_url: "" };

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<VendorProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    vendorApi.getProducts()
      .then(setProducts)
      .catch(err => toast.error(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p: VendorProduct) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", price: p.price,
      original_price: p.original_price || 0, unit: p.unit, stock: p.stock, image_url: p.image_url || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || form.price <= 0) { toast.error("Fill in required fields"); return; }
    setSaving(true);
    try {
      if (editing) {
        const u = await vendorApi.updateProduct(editing.id, form);
        setProducts(products.map(p => p.id === u.id ? u : p));
        toast.success("Product updated!");
      } else {
        const c = await vendorApi.createProduct(form);
        setProducts([c, ...products]);
        toast.success("Product added! 🎉");
      }
      setShowModal(false);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    try {
      await vendorApi.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success("Deleted");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  };

  const toggleAvail = async (p: VendorProduct) => {
    try {
      const u = await vendorApi.updateProduct(p.id, { is_available: !p.is_available });
      setProducts(products.map(x => x.id === u.id ? u : x));
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand)" }} />
    </div>
  );

  return (
    <div className="space-y-5 pb-8 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: "var(--text)" }}>
            <Package className="w-6 h-6" style={{ color: "var(--brand)" }} /> Products
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>{products.length} products listed</p>
        </div>
        <button onClick={openAdd} className="btn-primary gap-2 text-sm py-3 px-5">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="card p-16 text-center">
          <Package className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--text-3)" }} />
          <p className="font-black text-lg mb-2" style={{ color: "var(--text)" }}>No products yet</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>Add your first product to start selling</p>
          <button onClick={openAdd} className="btn-primary px-8">Add Product</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="card overflow-hidden">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-5xl"
                  style={{ background: "var(--bg-input)" }}>🛍️</div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black truncate" style={{ color: "var(--text)" }}>{p.name}</h3>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-3)" }}>
                      {p.description || "No description"}
                    </p>
                  </div>
                  <button onClick={() => toggleAvail(p)}
                    className="ml-2 px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
                    style={{
                      background: p.is_available ? "rgba(34,197,94,0.15)" : "var(--bg-input)",
                      color: p.is_available ? "#22c55e" : "var(--text-3)",
                    }}>
                    {p.is_available ? "Active" : "Off"}
                  </button>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-black" style={{ color: "var(--brand)" }}>₹{p.price}</span>
                  {p.original_price && p.original_price > p.price && (
                    <span className="text-sm line-through" style={{ color: "var(--text-3)" }}>₹{p.original_price}</span>
                  )}
                  <span className="text-xs" style={{ color: "var(--text-3)" }}>/ {p.unit}</span>
                </div>

                <div className="flex items-center justify-between mb-4 text-xs" style={{ color: "var(--text-3)" }}>
                  <span>Stock: <span className="font-bold" style={{ color: "var(--text)" }}>{p.stock}</span></span>
                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition-all"
                    style={{ background: "rgba(249,115,22,0.15)", color: "var(--brand)" }}>
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    className="flex items-center justify-center px-4 py-2.5 rounded-2xl transition-all"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="sticky top-0 flex items-center justify-between p-6"
              style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-lg font-black" style={{ color: "var(--text)" }}>
                {editing ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "var(--bg-input)" }}>
                <X className="w-5 h-5" style={{ color: "var(--text-2)" }} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {[
                { label: "Product Name *", key: "name", type: "text", placeholder: "e.g., Fresh Tomatoes" },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <label className="text-sm font-bold" style={{ color: "var(--text-2)" }}>{f.label}</label>
                  <input className="input" type={f.type} placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}

              <div className="space-y-2">
                <label className="text-sm font-bold" style={{ color: "var(--text-2)" }}>Description</label>
                <textarea className="input resize-none" rows={3} placeholder="Describe your product"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-2)" }}>
                  <ImageIcon className="w-4 h-4" style={{ color: "var(--brand)" }} /> Image URL
                </label>
                <input className="input" type="url" placeholder="https://..."
                  value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                {form.image_url && (
                  <img src={form.image_url} alt="Preview" className="w-28 h-28 object-cover rounded-2xl"
                    style={{ border: "2px solid var(--border)" }} />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold" style={{ color: "var(--text-2)" }}>Price (₹) *</label>
                  <input className="input" type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold" style={{ color: "var(--text-2)" }}>Original Price (₹)</label>
                  <input className="input" type="number" min="0" step="0.01" value={form.original_price}
                    onChange={e => setForm({ ...form, original_price: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold" style={{ color: "var(--text-2)" }}>Unit *</label>
                  <select className="input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    {["kg","g","l","ml","pc","pack","dozen"].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold" style={{ color: "var(--text-2)" }}>Stock *</label>
                  <input className="input" type="number" min="0" value={form.stock}
                    onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 p-6"
              style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-sm"
                style={{ background: "var(--bg-input)", color: "var(--text-2)" }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 btn-primary gap-2 text-sm py-3">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  : <><Save className="w-4 h-4" /> {editing ? "Update" : "Add"} Product</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
