import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { restaurantApi } from '../../api/restaurantClient';

export const ManageFoodsPage = () => {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',
    isSignature: false,
  });
  const [error, setError] = useState(null);

  // Fetch foods on component mount
  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await restaurantApi.getMenuItems();
      setFoods(items);
    } catch (err) {
      console.error('Failed to fetch foods:', err);
      setError(err.message || 'Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setError(null);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      // Store file for upload
      setFormData({ ...formData, imageFile: file });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear image preview if URL is cleared
    if (name === 'image' && !value && !formData.imageFile) {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const itemData = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        category: formData.category,
        isSignature: formData.isSignature,
        image: formData.imageFile ? '' : formData.image, // Use URL only if no file
      };

      if (editingFood) {
        await restaurantApi.updateMenuItem(editingFood._id || editingFood.id, itemData, formData.imageFile);
      } else {
        await restaurantApi.createMenuItem(itemData, formData.imageFile);
      }

      // Reset form
      setShowForm(false);
      setEditingFood(null);
      setImagePreview(null);
      setFormData({
        name: '',
        price: '',
        description: '',
        category: '',
        image: '',
        isSignature: false,
        imageFile: null,
      });
      
      // Refresh foods list
      await fetchFoods();
    } catch (err) {
      console.error('Failed to save food:', err);
      setError(err.message || 'Failed to save food item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      price: food.price,
      description: food.description,
      category: food.category,
      image: food.image || '',
      isSignature: food.isSignature || false,
      imageFile: null,
    });
    // Set preview if image exists
    if (food.image) {
      if (food.image.startsWith('http') || food.image.startsWith('/uploads/')) {
        const fullImageUrl = food.image.startsWith('http') 
          ? food.image 
          : `http://localhost:3001${food.image}`;
        setImagePreview(fullImageUrl);
      } else {
        setImagePreview(food.image);
      }
    } else {
      setImagePreview(null);
    }
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) {
      return;
    }

    try {
      setError(null);
      await restaurantApi.deleteMenuItem(foodId);
      await fetchFoods();
    } catch (err) {
      console.error('Failed to delete food:', err);
      setError(err.message || 'Failed to delete food item');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingFood(null);
    setImagePreview(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      image: '',
      isSignature: false,
      imageFile: null,
    });
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Manage Menu" subtitle="Add, edit, or remove menu items" />
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
        >
          ➕ Add Menu Item
        </button>
      </div>

      {error && !showForm && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
          </h3>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Course, Appetizer"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Image (File or URL)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <p className="text-xs text-slate-500 mt-1">Or enter image URL below</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Image URL (alternative to file upload)
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            {imagePreview && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Image Preview
                </label>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-slate-200"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isSignature"
                name="isSignature"
                checked={formData.isSignature}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="isSignature" className="text-sm font-medium text-slate-700">
                Mark as signature dish
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : editingFood ? 'Update' : 'Create'} Food Item
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Loading foods...</p>
        </div>
      ) : foods.length === 0 ? (
        <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-12 text-center shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🍔</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No menu items yet</h3>
            <p className="text-slate-600 mb-6">Start building your menu by adding your first food item!</p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="rounded-lg bg-orange-500 px-8 py-3 text-base font-semibold text-white hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
            >
              ➕ Add Your First Menu Item
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {foods.map((food) => {
            const imageUrl = food.image 
              ? (food.image.startsWith('http') ? food.image : `http://localhost:3001${food.image}`)
              : null;
            return (
              <div key={food._id || food.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                {imageUrl && (
                  <img src={imageUrl} alt={food.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{food.name}</h3>
                      {food.isSignature && (
                        <span className="inline-block mt-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          Signature
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-slate-900">${food.price?.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{food.description}</p>
                  <p className="text-xs text-slate-500 mb-3">Category: {food.category}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(food)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(food._id || food.id)}
                      className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
