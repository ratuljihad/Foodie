import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { restaurantApi } from '../../api/restaurantClient';
import { ImageUpload } from '../../components/ImageUpload';
import { LogoUploader } from '../../components/LogoUploader';

export const RestaurantProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cuisine: '',
    country: '',
    description: '',
    image: '',
    thumbnail: '',
    gallery: [],
    logo: '',
    logoStatus: 'none',
    logoSettings: { width: 40, height: 40, x: 0, y: 0 },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await restaurantApi.getProfile();
        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          country: profile.country || '',
          description: profile.description || '',
          image: profile.image || '',
          thumbnail: profile.thumbnail || '',
          gallery: profile.gallery || [],
          logo: profile.logo || '',
          logoStatus: profile.logoStatus || 'none',
          logoSettings: profile.logoSettings || { width: 40, height: 40, x: 0, y: 0 },
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            country: user.country || '',
            description: user.description || '',
            image: user.image || '',
            thumbnail: user.thumbnail || '',
            gallery: user.gallery || [],
            logo: user.logo || '',
            logoStatus: user.logoStatus || 'none',
            logoSettings: user.logoSettings || { width: 40, height: 40, x: 0, y: 0 },
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleMainImageUpload = async (file) => {
    try {
      const { imagePath } = await restaurantApi.uploadImage(file);
      setFormData(prev => ({
        ...prev,
        image: imagePath,
        thumbnail: imagePath // For now use same as thumbnail
      }));
    } catch (error) {
      console.error('Main image upload failed:', error);
      throw error;
    }
  };

  const handleGalleryImageUpload = async (file) => {
    try {
      const { imagePath } = await restaurantApi.uploadImage(file);
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, imagePath]
      }));
    } catch (error) {
      console.error('Gallery image upload failed:', error);
      throw error;
    }
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const handleLogoUpload = async (file) => {
    try {
      const { logoPath } = await restaurantApi.uploadLogo(file);
      setFormData(prev => ({
        ...prev,
        logo: logoPath,
        logoStatus: 'pending' // Entering approval queue
      }));
    } catch (error) {
      console.error('Logo upload failed:', error);
      throw error;
    }
  };

  const handleLogoSettingsUpdate = (newSettings) => {
    setFormData(prev => ({ ...prev, logoSettings: newSettings }));
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: '', logoStatus: 'none' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await restaurantApi.updateProfile(formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profile" subtitle="Manage your restaurant information" />
        <p className="text-slate-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Manage your restaurant information" />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Restaurant Visuals</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <ImageUpload
                  label="Profile Image"
                  value={formData.image}
                  onUpload={handleMainImageUpload}
                />
                <p className="mt-2 text-xs text-slate-500">This will be featured on restaurant cards and search results.</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Gallery Images</label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {formData.gallery.map((img, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={img.startsWith('http') ? img : `http://localhost:3001${img}`}
                        alt={`Gallery ${index}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <ImageUpload
                    onUpload={handleGalleryImageUpload}
                    className="aspect-square"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">Add photos of your ambiance, dining area, or signature decorations.</p>
              </div>
            </div>
          </section>

          {/* Branding Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Branding</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <LogoUploader
                  value={formData.logo}
                  settings={formData.logoSettings}
                  status={formData.logoStatus}
                  onUpload={handleLogoUpload}
                  onUpdateSettings={handleLogoSettingsUpdate}
                  onRemove={removeLogo}
                />
              </div>
              <div className="flex flex-col justify-center space-y-3">
                <div className="rounded-lg bg-brand-50 p-4 border border-brand-100">
                  <h5 className="text-sm font-bold text-brand-900 mb-1">Logo Requirements</h5>
                  <ul className="text-xs text-brand-700 space-y-1">
                    <li>• Supported formats: <strong>PNG, JPG, SVG</strong></li>
                    <li>• Max file size: <strong>2MB</strong></li>
                    <li>• Recommendation: Use a transparent background for best integration.</li>
                    <li>• Note: Logos require admin approval before they appear publicly.</li>
                  </ul>
                </div>
                <p className="text-xs text-slate-500">
                  Adjust the size and position of your logo to fit perfectly in the website header.
                  The preview above shows how it will look on a white background.
                </p>
              </div>
            </div>
          </section>

          {/* Basic Info Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Basic Information</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cuisine Type
                </label>
                <input
                  type="text"
                  value={formData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                  placeholder="e.g., Italian, Indian, Asian"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="">Select Country</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="India">India</option>
                  <option value="Italy">Italy</option>
                  <option value="China">China</option>
                  <option value="Thailand">Thailand</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Mexico">Mexico</option>
                  <option value="Japan">Japan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Describe your restaurant..."
              />
            </div>
          </section>



          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div >
  );
};
