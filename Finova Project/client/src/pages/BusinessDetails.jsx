import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Edit2, Upload, Building2, Phone, MapPin, Hash, Lock } from 'lucide-react';
import { businessAPI } from '../services/api';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BusinessDetails = () => {
  const [businessDetails, setBusinessDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isEditMode, setIsEditMode] = useState(true);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const logoFile = watch('businessLogo');

  // Fetch business details on component mount
  useEffect(() => {
    fetchBusinessDetails();
  }, []);

  const fetchBusinessDetails = async () => {
    try {
      const response = await businessAPI.getDetails();
      const data = response.data.businessDetails;

      if (data) {
        setBusinessDetails(data);  // Always set businessDetails
        setIsEditMode(false);

        // Populate form fields
        Object.keys(data).forEach(key => {
          if (!['id', 'userId', 'createdAt', 'updatedAt'].includes(key)) {
            setValue(key, data[key]);
          }
        });

        // Set logo preview if it exists
        if (data.businessLogo) {
          const logoUrl = data.businessLogo.startsWith('http') ? data.businessLogo : `${API_BASE}${data.businessLogo}`;
          setLogoPreview(logoUrl);
        }
      }
    } catch (err) {
      console.error('Error fetching business details:', err);
      toast.error('Failed to fetch business details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const formData = new FormData();

      Object.keys(data).forEach(key => {
        if (key === 'businessLogo' && data[key]?.[0]) {
          formData.append('businessLogo', data[key][0]);
        } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });

      const response = await businessAPI.createOrUpdate(formData);
      const updatedDetails = response.data.businessDetails;

      setBusinessDetails(updatedDetails);

      // Update logo preview
      if (updatedDetails.businessLogo) {
        const logoUrl = updatedDetails.businessLogo.startsWith('http') ? updatedDetails.businessLogo : `${API_BASE}${updatedDetails.businessLogo}`;
        setLogoPreview(logoUrl);
      }

      toast.success('Business details saved successfully!');
      setIsEditMode(false);
    } catch (err) {
      console.error('Error saving business details:', err);
      toast.error('Failed to save business details');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center">
          <Building2 className="mr-2" size={24} />
          Business Details
        </h1>
        {!isEditMode && (
          <button onClick={() => setIsEditMode(true)} className="btn btn-secondary flex items-center">
            <Edit2 size={16} className="mr-2" /> Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Logo */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Business Logo</h3>
          </div>
          <div className="card-content flex items-center space-x-4">
            {logoPreview && (
              <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden">
                <img src={logoPreview} alt="Business Logo" className="w-full h-full object-cover" />
              </div>
            )}
            {isEditMode && (
              <label className="btn btn-secondary flex items-center">
                <Upload size={16} className="mr-2" /> Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register('businessLogo')}
                  onChange={handleLogoChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>
          <div className="card-content space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Name *</label>
                <input
                  {...register('businessName', { required: 'Business name is required' })}
                  type="text"
                  className={`input ${errors.businessName ? 'border-red-500' : ''}`}
                  disabled={!isEditMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Business Category</label>
                <input
                  {...register('businessCategory')}
                  type="text"
                  className="input"
                  disabled={!isEditMode}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <MapPin size={16} className="mr-1" /> Business Address
              </label>
              <textarea
                {...register('businessAddress')}
                rows={3}
                className="input resize-none"
                disabled={!isEditMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <Phone size={16} className="mr-1" /> Phone Number
              </label>
              <input
                {...register('phoneNumber')}
                type="tel"
                className="input"
                disabled={!isEditMode}
              />
            </div>
          </div>
        </div>

        {/* Tax Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Tax Information</h3>
          </div>
          <div className="card-content space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <Hash size={16} className="mr-1" /> GSTIN Number
                </label>
                <input
                  {...register('gstinNumber')}
                  type="text"
                  className="input"
                  maxLength={15}
                  disabled={!isEditMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GST Slab</label>
                <select {...register('gstSlab')} className="input" disabled={!isEditMode}>
                  <option value="">Select GST Slab</option>
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* FSSAI */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">FSSAI Information</h3>
          </div>
          <div className="card-content">
            <input
              {...register('fssaiNumber')}
              type="text"
              className="input"
              disabled={!isEditMode}
            />
          </div>
        </div>

       

        {/* Save Button */}
        {isEditMode && (
          <div>
            <button type="submit" className="btn btn-primary flex items-center" disabled={isSaving}>
              <Save size={16} className="mr-2" /> {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default BusinessDetails;
