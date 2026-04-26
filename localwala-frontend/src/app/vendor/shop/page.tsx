"use client";
import { useEffect, useState } from "react";
import { vendorApi } from "@/lib/api";
import type { VendorShop } from "@/types";
import { Store, Loader2, Save, MapPin, Phone, Clock, DollarSign, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function VendorShopPage() {
  const [shop, setShop] = useState<VendorShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    phone: "",
    address: "",
    delivery_time_min: 30,
    delivery_fee: 0,
    min_order: 0,
    is_open: true,
  });

  useEffect(() => {
    loadShop();
  }, []);

  const loadShop = async () => {
    try {
      const data = await vendorApi.getShop();
      setShop(data);
      setFormData({
        name: data.name,
        description: data.description || "",
        image_url: data.image_url || "",
        phone: data.phone || "",
        address: data.address || "",
        delivery_time_min: data.delivery_time_min,
        delivery_fee: data.delivery_fee,
        min_order: data.min_order,
        is_open: data.is_open,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load shop");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await vendorApi.updateShop(formData);
      setShop(updated);
      toast.success("Shop updated successfully! 🎉");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update shop");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "var(--text)" }}>
            <Store className="w-8 h-8 text-brand-500" />
            My Shop
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-subtle)" }}>
            Manage your shop details and settings
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div
        className="rounded-2xl p-6 border space-y-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Shop Name */}
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
            <Store className="w-4 h-4" />
            Shop Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
            placeholder="Enter shop name"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
            placeholder="Describe your shop"
          />
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
            <ImageIcon className="w-4 h-4" />
            Shop Image URL
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
            placeholder="https://example.com/shop-image.jpg"
          />
          {formData.image_url && (
            <img
              src={formData.image_url}
              alt="Shop preview"
              className="w-32 h-32 object-cover rounded-xl border"
              style={{ borderColor: "var(--border)" }}
            />
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
            <Phone className="w-4 h-4" />
            Contact Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
            placeholder="9876543210"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
            <MapPin className="w-4 h-4" />
            Shop Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
            placeholder="Enter complete address"
          />
        </div>

        {/* Delivery Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
              <Clock className="w-4 h-4" />
              Delivery Time (min)
            </label>
            <input
              type="number"
              value={formData.delivery_time_min}
              onChange={(e) => setFormData({ ...formData, delivery_time_min: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
              <DollarSign className="w-4 h-4" />
              Delivery Fee (₹)
            </label>
            <input
              type="number"
              value={formData.delivery_fee}
              onChange={(e) => setFormData({ ...formData, delivery_fee: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
              <DollarSign className="w-4 h-4" />
              Min Order (₹)
            </label>
            <input
              type="number"
              value={formData.min_order}
              onChange={(e) => setFormData({ ...formData, min_order: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Shop Status */}
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--surface-3)" }}>
          <div>
            <p className="font-semibold" style={{ color: "var(--text)" }}>Shop Status</p>
            <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
              {formData.is_open ? "Currently accepting orders" : "Currently closed"}
            </p>
          </div>
          <button
            onClick={() => setFormData({ ...formData, is_open: !formData.is_open })}
            className={`px-6 py-2 rounded-xl font-semibold text-sm transition-colors ${
              formData.is_open
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            {formData.is_open ? "Open" : "Closed"}
          </button>
        </div>
      </div>

      {shop && (
        <div
          className="rounded-2xl p-6 border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)" }}>
            Shop Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm" style={{ color: "var(--text-subtle)" }}>Rating</p>
              <p className="text-xl font-bold" style={{ color: "var(--text)" }}>
                {shop.rating.toFixed(1)} ⭐
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--text-subtle)" }}>Reviews</p>
              <p className="text-xl font-bold" style={{ color: "var(--text)" }}>
                {shop.total_reviews}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--text-subtle)" }}>Category</p>
              <p className="text-xl font-bold" style={{ color: "var(--text)" }}>
                {shop.category.name}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--text-subtle)" }}>Status</p>
              <p className="text-xl font-bold" style={{ color: "var(--text)" }}>
                {shop.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
