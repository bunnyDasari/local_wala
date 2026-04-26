"use client";
import { useEffect, useState } from "react";
import { vendorApi } from "@/lib/api";
import type { VendorShop } from "@/types";
import { Store, Loader2, Save, MapPin, Phone, Clock, IndianRupee, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function VendorShopPage() {
  const [shop, setShop] = useState<VendorShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", image_url: "", phone: "",
    address: "", delivery_time_min: 30, delivery_fee: 0, min_order: 0, is_open: true,
  });

  useEffect(() => {
    vendorApi.getShop().then(data => {
      setShop(data);
      setForm({
        name: data.name, description: data.description || "",
        image_url: data.image_url || "", phone: data.phone || "",
        address: data.address || "", delivery_time_min: data.delivery_time_min,
        delivery_fee: data.delivery_fee, min_order: data.min_order, is_open: data.is_open,
      });
    }).catch(err => toast.error(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await vendorApi.updateShop(form);
      setShop(updated);
      toast.success("Shop updated! 🎉");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand)" }} />
    </div>
  );

  const Field = ({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) => (
    <div className="space-y-2">
      <label className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-2)" }}>
        {Icon && <Icon className="w-4 h-4" style={{ color: "var(--brand)" }} />}
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="max-w-3xl space-y-5 pb-8 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: "var(--text)" }}>
            <Store className="w-6 h-6" style={{ color: "var(--brand)" }} /> My Shop
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>Manage your shop details</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary gap-2 text-sm py-3 px-5">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
        </button>
      </div>

      <div className="card p-6 space-y-5">
        <Field label="Shop Name" icon={Store}>
          <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Shop name" />
        </Field>

        <Field label="Description">
          <textarea className="input resize-none" rows={3} value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your shop" />
        </Field>

        <Field label="Shop Image URL" icon={ImageIcon}>
          <input className="input" type="url" value={form.image_url}
            onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
          {form.image_url && (
            <img src={form.image_url} alt="Preview" className="w-28 h-28 object-cover rounded-2xl mt-2"
              style={{ border: "2px solid var(--border)" }} />
          )}
        </Field>

        <Field label="Contact Phone" icon={Phone}>
          <input className="input" type="tel" value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
        </Field>

        <Field label="Shop Address" icon={MapPin}>
          <textarea className="input resize-none" rows={2} value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Delivery Time (min)" icon={Clock}>
            <input className="input" type="number" min="0" value={form.delivery_time_min}
              onChange={e => setForm({ ...form, delivery_time_min: parseInt(e.target.value) || 0 })} />
          </Field>
          <Field label="Delivery Fee (₹)" icon={IndianRupee}>
            <input className="input" type="number" min="0" step="0.01" value={form.delivery_fee}
              onChange={e => setForm({ ...form, delivery_fee: parseFloat(e.target.value) || 0 })} />
          </Field>
          <Field label="Min Order (₹)" icon={IndianRupee}>
            <input className="input" type="number" min="0" step="0.01" value={form.min_order}
              onChange={e => setForm({ ...form, min_order: parseFloat(e.target.value) || 0 })} />
          </Field>
        </div>

        {/* Open/Closed toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: "var(--bg-input)" }}>
          <div>
            <p className="font-bold" style={{ color: "var(--text)" }}>Shop Status</p>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              {form.is_open ? "Currently accepting orders" : "Currently closed"}
            </p>
          </div>
          <button onClick={() => setForm({ ...form, is_open: !form.is_open })}
            className="px-5 py-2 rounded-2xl font-bold text-sm transition-all"
            style={{
              background: form.is_open ? "#22c55e" : "var(--bg-card)",
              color: form.is_open ? "white" : "var(--text-3)",
              border: form.is_open ? "none" : "1px solid var(--border)",
            }}>
            {form.is_open ? "● Open" : "● Closed"}
          </button>
        </div>
      </div>

      {shop && (
        <div className="card p-6">
          <h2 className="font-black mb-4" style={{ color: "var(--text)" }}>Shop Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Rating",   value: `${shop.rating.toFixed(1)} ⭐` },
              { label: "Reviews",  value: shop.total_reviews },
              { label: "Category", value: shop.category.name },
              { label: "Status",   value: shop.is_active ? "Active" : "Inactive" },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-2xl text-center" style={{ background: "var(--bg-input)" }}>
                <p className="text-lg font-black" style={{ color: "var(--brand)" }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
