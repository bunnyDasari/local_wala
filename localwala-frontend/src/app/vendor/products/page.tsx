"use client";
import { useEffect, useState } from "react";
import { vendorApi } from "@/lib/api";
import type { VendorProduct } from "@/types";
import { Package, Loader2, Plus, Edit2, Trash2, X, Save, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    original_price: 0,
    unit: "kg",
    stock: 0,
    image_url: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await vendorApi.getProducts();
      setProducts(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      original_price: 0,
      unit: "kg",
      stock: 0,
      image_url: "",
    });
    setShowModal(true);
  };

  const openEditModal = (product: VendorProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      original_price: product.original_price || 0,
      unit: product.unit,
      stock: product.stock,
      image_url: product.image_url || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || formData.price <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      if (editingProduct) {
        const updated = await vendorApi.updateProduct(editingProduct.id, formData);
        setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Product updated successfully!");
      } else {
        const created = await vendorApi.createProduct(formData);
        setProducts([created, ...products]);
        toast.success("Product added successfully! 🎉");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await vendorApi.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const toggleAvailability = async (product: VendorProduct) => {
    try {
      const updated = await vendorApi.updateProduct(product.id, {
        is_available: !product.is_available,
      });
      setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
      toast.success(`Product ${updated.is_available ? "enabled" : "disabled"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update product");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "var(--text)" }}>
            <Package className="w-8 h-8 text-brand-500" />
            Products
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-subtle)" }}>
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <Package className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--text-subtle)" }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
            No products yet
          </h3>
          <p className="mb-6" style={{ color: "var(--text-subtle)" }}>
            Start by adding your first product
          </p>
          <button onClick={openAddModal} className="btn-primary px-6 py-3">
            Add Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl p-4 border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-xl mb-3"
                />
              )}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate" style={{ color: "var(--text)" }}>
                    {product.name}
                  </h3>
                  <p className="text-sm truncate" style={{ color: "var(--text-subtle)" }}>
                    {product.description || "No description"}
                  </p>
                </div>
                <button
                  onClick={() => toggleAvailability(product)}
                  className={clsx(
                    "px-3 py-1 rounded-lg text-xs font-semibold ml-2 shrink-0",
                    product.is_available
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {product.is_available ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xl font-bold text-brand-600">
                  ₹{product.price}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm line-through" style={{ color: "var(--text-subtle)" }}>
                    ₹{product.original_price}
                  </span>
                )}
                <span className="text-sm" style={{ color: "var(--text-subtle)" }}>
                  / {product.unit}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm" style={{ color: "var(--text-subtle)" }}>
                  Stock: <span className="font-bold" style={{ color: "var(--text)" }}>{product.stock}</span>
                </span>
                <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
                  Added {new Date(product.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(product)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div
            className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--surface)" }}
          >
            <div className="sticky top-0 flex items-center justify-between p-6 border-b" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                  style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
                  placeholder="e.g., Fresh Tomatoes"
                />
              </div>

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
                  placeholder="Describe your product"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
                  <ImageIcon className="w-4 h-4" />
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                  style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
                  placeholder="https://example.com/product.jpg"
                />
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl border"
                    style={{ borderColor: "var(--border)" }}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    Unit *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                    <option value="pc">pc</option>
                    <option value="pack">pack</option>
                    <option value="dozen">dozen</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text)" }}
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 p-6 border-t" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 rounded-xl border font-semibold hover:bg-gray-50 transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 btn-primary flex items-center justify-center gap-2 px-6 py-3 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingProduct ? "Update" : "Add"} Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
