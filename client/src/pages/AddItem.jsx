import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const AddItem = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: 'Other', contact: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const categories = ['Electronics', 'Stationery', 'Books', 'Lab Equipment', 'Furniture', 'Sports', 'Clothing', 'Other'];

  const handleChange = (e) => {
    if (e.target.name === 'categorySelect') {
      if (e.target.value === 'create_new') {
        setIsCustomCategory(true);
        setFormData({ ...formData, category: '' });
      } else {
        setIsCustomCategory(false);
        setFormData({ ...formData, category: e.target.value });
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    if (error) setError('');
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));
    if (imageFile) data.append('images', imageFile);

    try {
      await api.post('/listings', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.wrapper}>
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>List an Item</h2>
            <p style={s.cardSub}>Provide details about the item you want to sell.</p>
          </div>

          {error && (
            <div style={s.alert}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={s.form}>
            {/* Title */}
            <div style={s.inputGroup}>
              <label style={s.label}>Item Title</label>
              <input style={s.input} name="title" placeholder="What are you selling?" required onChange={handleChange} id="item-title" />
            </div>

            {/* Price + Category */}
            <div style={s.row}>
              <div style={s.inputGroup}>
                <label style={s.label}>Price (₹)</label>
                <input style={s.input} name="price" type="number" placeholder="0" required onChange={handleChange} id="item-price" />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Category</label>
                <select 
                  style={{...s.input, backgroundColor: '#1a2035'}} 
                  name="categorySelect" 
                  onChange={handleChange} 
                  id="item-category"
                  value={isCustomCategory ? 'create_new' : (categories.includes(formData.category) ? formData.category : formData.category)}
                >
                  {categories.map((c) => <option key={c} value={c} style={s.option}>{c}</option>)}
                  <option value="create_new" style={s.option}>+ Create new category</option>
                </select>
                {isCustomCategory && (
                  <input
                    style={{ ...s.input, marginTop: '0.5rem' }}
                    name="category"
                    placeholder="Enter custom category"
                    onChange={handleChange}
                    required
                  />
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div style={s.inputGroup}>
              <label style={s.label}>
                Upload Image <span style={s.optional}>(optional, max 5MB)</span>
              </label>
              <div
                style={{ ...s.dropZone, ...(dragActive ? s.dropZoneActive : {}) }}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div style={s.previewBox}>
                    <img src={imagePreview} alt="Preview" style={s.previewImg} />
                    <button
                      type="button"
                      style={s.removeImg}
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={s.dropContent}>
                    <span style={{ fontSize: '2rem' }}>📸</span>
                    <p style={{ color: '#9ca3af', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
                      Drag & drop an image, or <span style={{ color: '#6c63ff', fontWeight: '600' }}>click to browse</span>
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                />
              </div>
            </div>

            {/* Description */}
            <div style={s.inputGroup}>
              <label style={s.label}>Description</label>
              <textarea
                style={s.textarea}
                name="description"
                placeholder="Describe condition, features, usage history..."
                required
                onChange={handleChange}
                id="item-description"
              />
            </div>

            {/* Contact */}
            <div style={s.inputGroup}>
              <label style={s.label}>Contact Info</label>
              <input style={s.input} name="contact" placeholder="Phone or email" required onChange={handleChange} id="item-contact" />
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
              id="submit-listing"
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={s.btnSpinner} /> Uploading...
                </span>
              ) : (
                '📤 Post Listing'
              )}
            </button>

            <button type="button" onClick={() => navigate('/')} style={s.cancelBtn}>
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: { minHeight: '100vh', background: '#0b0f19' },
  wrapper: { padding: '2.5rem 1rem', display: 'flex', justifyContent: 'center' },
  card: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    width: '100%', maxWidth: '580px', padding: '2.5rem',
    borderRadius: '24px', boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
  },
  cardHeader: { marginBottom: '1.75rem' },
  cardTitle: { fontSize: '1.75rem', fontWeight: '800', color: '#f3f4f6', margin: '0 0 0.35rem', letterSpacing: '-0.02em' },
  cardSub: { fontSize: '0.9rem', color: '#6b7280', margin: 0 },
  alert: {
    padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444',
    borderRadius: '10px', fontSize: '0.88rem', fontWeight: '500', marginBottom: '1.25rem',
    border: '1px solid rgba(239,68,68,0.15)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#9ca3af' },
  optional: { fontSize: '0.75rem', color: '#4b5563', fontWeight: '400' },
  input: {
    padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
    color: '#f3f4f6', fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  textarea: {
    padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
    color: '#f3f4f6', fontSize: '0.9rem', outline: 'none',
    minHeight: '120px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  dropZone: {
    border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '14px',
    padding: '2rem', textAlign: 'center', cursor: 'pointer',
    transition: 'all 0.2s ease', background: 'rgba(255,255,255,0.02)',
  },
  dropZoneActive: {
    borderColor: '#6c63ff', background: 'rgba(108,99,255,0.05)',
  },
  dropContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' },
  previewBox: { position: 'relative', display: 'inline-block' },
  previewImg: { maxHeight: '200px', borderRadius: '10px', objectFit: 'cover' },
  removeImg: {
    position: 'absolute', top: '-8px', right: '-8px', width: '28px', height: '28px',
    borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none',
    fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  submitBtn: {
    padding: '0.9rem', background: 'linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)',
    color: '#fff', borderRadius: '12px', border: 'none', fontSize: '1rem',
    fontWeight: '700', cursor: 'pointer', marginTop: '0.5rem',
    boxShadow: '0 4px 16px rgba(108,99,255,0.25)', transition: 'all 0.15s ease',
  },
  cancelBtn: {
    padding: '0.75rem', background: 'none', color: '#6b7280',
    border: 'none', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer',
  },
  btnSpinner: {
    width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite',
    display: 'inline-block',
  },
  option: {
    background: '#1a2035',
    color: '#f3f4f6',
  },
};

export default AddItem;
