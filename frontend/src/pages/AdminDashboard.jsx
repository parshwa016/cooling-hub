import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Users, Wrench, ShieldCheck, DollarSign, 
  Package, AlertTriangle, RefreshCw, CheckCircle2, Award, UserCheck,
  Plus, Edit3, Trash2, Image, Upload, Eye, X, Check, Search, Filter,
  Phone, MapPin, Calendar, Clock, ArrowRight, ChevronRight, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { usePopup } from '../context/PopupContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import LuxurySelect from '../components/LuxurySelect';

export default function AdminDashboard({ setActiveTab }) {
  const { showToast, showModal } = usePopup();
  const [activeSubTab, setActiveSubTab] = useState('products'); // 'products', 'services', 'amc', 'bookings', 'analytics'
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [productSearch, setProductSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [imageMode, setImageMode] = useState('url'); // 'url' or 'upload'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const initialProductForm = {
    title: '',
    brand: 'Daikin',
    model: '',
    ac_type: 'Split',
    tonnage: 1.5,
    star_rating: 5,
    is_inverter: true,
    price: 45000,
    original_price: 58000,
    discount_percent: 22,
    noise_level_db: 32,
    cooling_capacity_w: 5200,
    iseer_rating: 4.8,
    annual_power_kwh: 790,
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80',
    features: 'Copper Condenser, Anti-Bacterial Filter, Turbo Cooling, 3D Airflow',
    description: 'High efficiency modern inverter AC with intelligent cooling and ultra-low noise operation.',
    stock: 50,
    rating: 4.8,
    reviews_count: 24,
    is_featured: false,
    badge: 'Best Seller'
  };
  const [productForm, setProductForm] = useState(initialProductForm);

  // AC Services Management State
  const [services, setServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceImageMode, setServiceImageMode] = useState('url');
  const [uploadingServiceImage, setUploadingServiceImage] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [deletingService, setDeletingService] = useState(null);

  const initialServiceForm = {
    title: '',
    category: 'Cleaning',
    description: 'High pressure foam and jet cleaning for complete indoor and outdoor AC units.',
    price: 1199,
    estimated_time: '1-2 Hours',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    includes: 'Indoor Unit Jet Foam Wash, Condenser Coil Flush, Drain Pipe Clearing, Operating Pressure Check'
  };
  const [serviceForm, setServiceForm] = useState(initialServiceForm);

  // AMC Plans Management State
  const [amcPlans, setAmcPlans] = useState([]);
  const [amcSearch, setAmcSearch] = useState('');
  const [amcTierFilter, setAmcTierFilter] = useState('All');
  const [isAMCModalOpen, setIsAMCModalOpen] = useState(false);
  const [editingAMCId, setEditingAMCId] = useState(null);
  const [isSavingAMC, setIsSavingAMC] = useState(false);
  const [deletingAMC, setDeletingAMC] = useState(null);

  const initialAMCForm = {
    name: '',
    tier: 'standard',
    price_per_year: 4499,
    covered_visits: 3,
    free_gas_charging: true,
    priority_service: true,
    discount_parts_percent: 15,
    description: 'Comprehensive coverage with scheduled routine visits, priority doorstep response, and discounted spares.'
  };
  const [amcForm, setAmcForm] = useState(initialAMCForm);

  // Service Booking Assignment & View Modals
  const [assigningComplaint, setAssigningComplaint] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [viewingComplaint, setViewingComplaint] = useState(null);

  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const fetchAdminData = (isSilent = false) => {
    if (!isSilent) setLoading(true);
    Promise.all([
      api.getAdminAnalytics(),
      api.getAdminBookings(),
      api.getAdminTechnicians(),
      api.getAdminProducts(),
      api.getAdminServices(),
      api.getAdminAMCPlans()
    ]).then(([ana, bks, techs, prods, srvs, amcs]) => {
      setAnalytics(ana);
      setBookings(bks || []);
      setTechnicians(techs || []);
      setProducts(prods || []);
      setServices(srvs || []);
      setAmcPlans(amcs || []);
      setLastSyncTime(new Date());
      if (techs && techs.length > 0 && !selectedTechId) {
        setSelectedTechId(techs[0].id);
      }
    }).catch(console.error).finally(() => {
      if (!isSilent) setLoading(false);
    });
  };

  useEffect(() => {
    fetchAdminData();
    // Auto-polling every 3 seconds so second and subsequent requests always show up in real-time
    const interval = setInterval(() => {
      fetchAdminData(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ----------------- PRODUCT ACTIONS -----------------
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm(initialProductForm);
    setImageMode('url');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setProductForm({
      title: prod.title || '',
      brand: prod.brand || 'Daikin',
      model: prod.model || '',
      ac_type: prod.ac_type || 'Split',
      tonnage: prod.tonnage || 1.5,
      star_rating: prod.star_rating || 5,
      is_inverter: prod.is_inverter !== undefined ? prod.is_inverter : true,
      price: prod.price || 40000,
      original_price: prod.original_price || 50000,
      discount_percent: prod.discount_percent || 20,
      noise_level_db: prod.noise_level_db || 32,
      cooling_capacity_w: prod.cooling_capacity_w || 5200,
      iseer_rating: prod.iseer_rating || 4.8,
      annual_power_kwh: prod.annual_power_kwh || 800,
      image: prod.image || '',
      features: prod.features || '',
      description: prod.description || '',
      stock: prod.stock !== undefined ? prod.stock : 50,
      rating: prod.rating || 4.5,
      reviews_count: prod.reviews_count || 12,
      is_featured: !!prod.is_featured,
      badge: prod.badge || ''
    });
    setImageMode('url');
    setIsProductModalOpen(true);
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await api.uploadProductImage(file);
      setProductForm(prev => ({ ...prev, image: res.url }));
      showToast({
        type: 'success',
        title: 'Image Uploaded',
        message: 'Product image successfully uploaded and preview ready.'
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.message
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProductFormSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price || !productForm.image) {
      showToast({
        type: 'warning',
        title: 'Incomplete Fields',
        message: 'Please fill in product title, price, and image.'
      });
      return;
    }

    setIsSavingProduct(true);
    try {
      if (editingProductId) {
        await api.updateProduct(editingProductId, productForm);
        showToast({
          type: 'success',
          title: 'Product Updated',
          message: `"${productForm.title}" has been updated.`
        });
      } else {
        await api.createProduct(productForm);
        showToast({
          type: 'success',
          title: 'Product Added',
          message: `"${productForm.title}" added to store catalog.`
        });
      }
      setIsProductModalOpen(false);
      fetchAdminData();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message
      });
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProductConfirm = async () => {
    if (!deletingProduct) return;
    try {
      await api.deleteProduct(deletingProduct.id);
      showToast({
        type: 'info',
        title: 'Product Removed',
        message: `"${deletingProduct.title}" has been deleted.`
      });
      setDeletingProduct(null);
      fetchAdminData();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message
      });
    }
  };

  // ----------------- AC SERVICES ACTIONS -----------------
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceForm(initialServiceForm);
    setServiceImageMode('url');
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (srv) => {
    setEditingServiceId(srv.id);
    setServiceForm({
      title: srv.title || '',
      category: srv.category || 'Cleaning',
      description: srv.description || '',
      price: srv.price || 999,
      estimated_time: srv.estimated_time || '1-2 Hours',
      image: srv.image || '',
      includes: srv.includes || ''
    });
    setServiceImageMode('url');
    setIsServiceModalOpen(true);
  };

  const handleServiceImageFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingServiceImage(true);
    try {
      const res = await api.uploadProductImage(file);
      setServiceForm(prev => ({ ...prev, image: res.url }));
      showToast({
        type: 'success',
        title: 'Image Uploaded',
        message: 'Service image uploaded and preview ready.'
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.message
      });
    } finally {
      setUploadingServiceImage(false);
    }
  };

  const handleServiceFormSubmit = async (e) => {
    e.preventDefault();
    if (!serviceForm.title || !serviceForm.price || !serviceForm.image) {
      showToast({
        type: 'warning',
        title: 'Incomplete Fields',
        message: 'Please provide service title, price, and image.'
      });
      return;
    }

    setIsSavingService(true);
    try {
      if (editingServiceId) {
        await api.updateService(editingServiceId, serviceForm);
        showToast({
          type: 'success',
          title: 'Service Updated',
          message: `"${serviceForm.title}" package has been updated.`
        });
      } else {
        await api.createService(serviceForm);
        showToast({
          type: 'success',
          title: 'Service Created',
          message: `"${serviceForm.title}" added to service offerings.`
        });
      }
      setIsServiceModalOpen(false);
      fetchAdminData(true);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message
      });
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteServiceConfirm = async () => {
    if (!deletingService) return;
    try {
      await api.deleteService(deletingService.id);
      showToast({
        type: 'info',
        title: 'Service Removed',
        message: `"${deletingService.title}" has been deleted.`
      });
      setDeletingService(null);
      fetchAdminData(true);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message
      });
    }
  };

  // ----------------- AMC PLAN ACTIONS -----------------
  const handleOpenAddAMC = () => {
    setEditingAMCId(null);
    setAmcForm(initialAMCForm);
    setIsAMCModalOpen(true);
  };

  const handleOpenEditAMC = (plan) => {
    setEditingAMCId(plan.id);
    setAmcForm({
      name: plan.name || '',
      tier: plan.tier || 'standard',
      price_per_year: plan.price_per_year || 4499,
      covered_visits: plan.covered_visits || 3,
      free_gas_charging: plan.free_gas_charging !== undefined ? plan.free_gas_charging : true,
      priority_service: plan.priority_service !== undefined ? plan.priority_service : true,
      discount_parts_percent: plan.discount_parts_percent !== undefined ? plan.discount_parts_percent : 15,
      description: plan.description || ''
    });
    setIsAMCModalOpen(true);
  };

  const handleAMCFormSubmit = async (e) => {
    e.preventDefault();
    if (!amcForm.name || !amcForm.price_per_year) {
      showToast({
        type: 'warning',
        title: 'Incomplete Fields',
        message: 'Please provide AMC plan name and price.'
      });
      return;
    }

    setIsSavingAMC(true);
    try {
      if (editingAMCId) {
        await api.updateAMCPlan(editingAMCId, amcForm);
        showToast({
          type: 'success',
          title: 'AMC Plan Updated',
          message: `"${amcForm.name}" has been updated.`
        });
      } else {
        await api.createAMCPlan(amcForm);
        showToast({
          type: 'success',
          title: 'AMC Plan Created',
          message: `"${amcForm.name}" added to AMC plans.`
        });
      }
      setIsAMCModalOpen(false);
      fetchAdminData(true);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message
      });
    } finally {
      setIsSavingAMC(false);
    }
  };

  const handleDeleteAMCConfirm = async () => {
    if (!deletingAMC) return;
    try {
      await api.deleteAMCPlan(deletingAMC.id);
      showToast({
        type: 'info',
        title: 'Plan Removed',
        message: `"${deletingAMC.name}" has been deleted.`
      });
      setDeletingAMC(null);
      fetchAdminData(true);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message
      });
    }
  };

  // ----------------- SERVICE & COMPLAINT ACCEPTANCE & ASSIGNMENT ACTIONS -----------------
  // ----------------- SERVICE BOOKING ACTIONS -----------------
  const handleAcceptRequest = async (item) => {
    try {
      await api.acceptBooking(item.id);
      showToast({
        type: 'success',
        title: 'Service Booking Confirmed',
        message: `Booking #${item.display_id || item.booking_number} accepted. You can now assign a technician.`
      });
      fetchAdminData(true);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Acceptance Failed',
        message: err.message
      });
    }
  };

  const handleRejectRequest = async (item) => {
    const confirmed = await showModal({
      type: 'confirm',
      title: 'Reject Service Booking?',
      badge: 'Admin Rejection',
      message: `Are you sure you want to reject service booking #${item.display_id || item.booking_number} for customer ${item.customer_name}?`,
      details: {
        'Booking #': item.display_id || item.booking_number,
        'Customer': item.customer_name,
        'Service': item.service_title || item.title_display,
        'Action': 'Rejection notification will be sent to customer'
      },
      showCancel: true,
      confirmText: 'Yes, Reject Booking',
      cancelText: 'Keep Booking'
    });
    if (!confirmed) return;

    try {
      await api.rejectBooking(item.id);
      showToast({
        type: 'info',
        title: 'Booking Rejected',
        message: `Booking #${item.display_id || item.booking_number} marked as Rejected.`
      });
      fetchAdminData(true);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Failed to Reject',
        message: err.message
      });
    }
  };

  const handleAssignClick = (item) => {
    if (item.status === 'Pending') {
      showToast({
        type: 'warning',
        title: 'Confirmation Required',
        message: 'Please accept and confirm the service booking first before assigning a service man.'
      });
      return;
    }
    setAssigningComplaint(item);
    if (technicians.length > 0) {
      setSelectedTechId(technicians[0].id);
    }
  };

  const handleConfirmAssignment = async () => {
    if (!assigningComplaint || !selectedTechId) return;
    setIsAssigning(true);
    try {
      await api.assignTechnicianToBooking(assigningComplaint.id, selectedTechId);
      const assignedTech = technicians.find(t => t.id === selectedTechId);
      showToast({
        type: 'success',
        title: 'Technician Assigned!',
        message: `Service Man ${assignedTech?.name || ''} assigned to #${assigningComplaint.display_id || assigningComplaint.booking_number}. Status updated to 'Assigned'.`
      });
      setAssigningComplaint(null);
      fetchAdminData(true);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Assignment Failed',
        message: err.message
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchSearch = productSearch === '' || 
      p.title.toLowerCase().includes(productSearch.toLowerCase()) || 
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.model && p.model.toLowerCase().includes(productSearch.toLowerCase()));
    const matchBrand = brandFilter === 'All' || p.brand === brandFilter;
    return matchSearch && matchBrand;
  });

  // Filtered AC Services
  const allServiceCategories = ['All', 'Cleaning', 'Installation', 'Repair', 'Gas Charging', 'Maintenance'];
  const filteredServices = services.filter(s => {
    const searchLower = (serviceSearch || '').toLowerCase();
    const matchSearch = serviceSearch === '' ||
      (s.title || '').toLowerCase().includes(searchLower) ||
      (s.category || '').toLowerCase().includes(searchLower) ||
      (s.description || '').toLowerCase().includes(searchLower) ||
      (s.includes || '').toLowerCase().includes(searchLower);
    const matchCategory = serviceCategoryFilter === 'All' || s.category === serviceCategoryFilter;
    return matchSearch && matchCategory;
  });

  // Filtered AMC Plans
  const allAMCTiers = ['All', 'basic', 'standard', 'premium'];
  const filteredAMCPlans = amcPlans.filter(p => {
    const searchLower = (amcSearch || '').toLowerCase();
    const matchSearch = amcSearch === '' ||
      (p.name || '').toLowerCase().includes(searchLower) ||
      (p.tier || '').toLowerCase().includes(searchLower) ||
      (p.description || '').toLowerCase().includes(searchLower);
    const matchTier = amcTierFilter === 'All' || p.tier?.toLowerCase() === amcTierFilter.toLowerCase();
    return matchSearch && matchTier;
  });

  // Filtered Bookings for Service Bookings
  const filteredBookings = bookings.filter(b => {
    const searchLower = (bookingSearch || '').toLowerCase();
    const matchSearch = bookingSearch === '' ||
      (b.booking_number || '').toLowerCase().includes(searchLower) ||
      (b.customer_name || '').toLowerCase().includes(searchLower) ||
      (b.service_title || '').toLowerCase().includes(searchLower) ||
      (b.customer_phone || '').toLowerCase().includes(searchLower) ||
      (b.pincode || '').toLowerCase().includes(searchLower) ||
      (b.address || '').toLowerCase().includes(searchLower);
    const matchStatus = bookingStatusFilter === 'All' || b.status === bookingStatusFilter;
    return matchSearch && matchStatus;
  });

  const allBrands = ['All', 'Daikin', 'LG', 'Voltas', 'Blue Star', 'Panasonic', 'Lloyd', 'Mitsubishi'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700';
      case 'Confirmed':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700';
      case 'Assigned':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700';
      case 'In Progress':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700 animate-pulse';
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700';
      case 'Closed':
        return 'bg-[#111111]/10 text-[#555555] dark:text-[#858585] border-[#E2E0DB] dark:border-[#292929]';
      default:
        return 'bg-[#FAF7F0] text-[#111111] border-[#E2E0DB]';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-[#111111] text-white p-5 sm:p-6 rounded-2xl border border-[#292929] shadow-sm space-y-2.5">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 bg-[#C8A96B] text-[#111111] text-[11px] font-black rounded-full uppercase tracking-wider">
            ADMINISTRATIVE CONTROL SYSTEM
          </span>
          <span className="text-[11px] text-[#858585] font-semibold">Cooling Hub Central Admin</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">🧑‍💼 Admin Control Dashboard</h1>
        <p className="text-xs text-[#858585] max-w-3xl font-normal leading-relaxed">
          Manage the AC Store catalog, configure AC service packages, manage AMC maintenance plans, oversee doorstep service bookings, and review revenue analytics.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E0DB] dark:border-[#292929] pb-3">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => { setActiveSubTab('products'); fetchAdminData(true); }}
            className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeSubTab === 'products'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-[#555555] dark:text-[#858585] hover:bg-white dark:hover:bg-[#1A1A1A] hover:text-[#111111]'
            }`}
          >
            <Package className="w-4 h-4 text-[#C8A96B]" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('services'); fetchAdminData(true); }}
            className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeSubTab === 'services'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-[#555555] dark:text-[#858585] hover:bg-white dark:hover:bg-[#1A1A1A] hover:text-[#111111]'
            }`}
          >
            <Wrench className="w-4 h-4 text-[#C8A96B]" />
            <span>AC Services ({services.length})</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('amc'); fetchAdminData(true); }}
            className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeSubTab === 'amc'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-[#555555] dark:text-[#858585] hover:bg-white dark:hover:bg-[#1A1A1A] hover:text-[#111111]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#C8A96B]" />
            <span>AMC Plans ({amcPlans.length})</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('bookings'); fetchAdminData(true); }}
            className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeSubTab === 'bookings'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-[#555555] dark:text-[#858585] hover:bg-white dark:hover:bg-[#1A1A1A] hover:text-[#111111]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#C8A96B]" />
            <span>Service Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('analytics'); fetchAdminData(true); }}
            className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
              activeSubTab === 'analytics'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-[#555555] dark:text-[#858585] hover:bg-white dark:hover:bg-[#1A1A1A] hover:text-[#111111]'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-[#C8A96B]" />
            <span>Analytics & Revenue</span>
          </button>
        </div>

        {/* Live Auto-Sync Status & Manual Refresh Button */}
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Auto-Sync (Every 3s)</span>
          </span>

          <button
            onClick={() => fetchAdminData(false)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333] hover:border-[#C8A96B] text-xs font-bold text-[#111111] dark:text-white transition"
            title="Force refresh all admin data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C8A96B] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Now</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-[#858585] space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#C8A96B]" />
          <span>Loading admin database records...</span>
        </div>
      ) : (
        <>
          {/* ============================================================ */}
          {/* 1. PRODUCT MANAGEMENT TAB */}
          {/* ============================================================ */}
          {activeSubTab === 'products' && (
            <div className="space-y-6">
              
              {/* Product Control Bar */}
              <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#858585] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products by title, brand, or model..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl text-xs sm:text-sm text-[#111111] dark:text-white placeholder-[#858585] focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
                    />
                  </div>

                  <div className="w-full sm:w-52">
                    <LuxurySelect
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      options={allBrands.map(b => ({ value: b, label: b === 'All' ? 'All Brands' : b }))}
                      size="md"
                    />
                  </div>
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="btn-emerald-primary px-5 py-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add AC Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead className="bg-[#F7F6F2] dark:bg-[#252525] text-[#111111] dark:text-white font-bold border-b border-[#E2E0DB] dark:border-[#292929]">
                      <tr>
                        <th className="p-4">Photo</th>
                        <th className="p-4">Product Name & Model</th>
                        <th className="p-4">Brand / Type</th>
                        <th className="p-4">Capacity</th>
                        <th className="p-4">Price / MRP</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Badges</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E0DB] dark:divide-[#292929]">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-[#858585]">
                            No products found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-[#FAF7F0] dark:hover:bg-[#202020] transition-colors">
                            {/* Image */}
                            <td className="p-4">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] flex-shrink-0">
                                <img
                                  src={p.image}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>

                            {/* Name & Model */}
                            <td className="p-4">
                              <div className="font-bold text-[#111111] dark:text-white line-clamp-1 max-w-xs">{p.title}</div>
                              <div className="text-xs text-[#858585] mt-0.5 font-mono">
                                Model: {p.model || 'N/A'}
                              </div>
                            </td>

                            {/* Brand & Type */}
                            <td className="p-4">
                              <span className="font-extrabold text-[#111111] dark:text-white">{p.brand}</span>
                              <span className="block text-[11px] text-[#858585]">{p.ac_type} AC ({p.is_inverter ? 'Inverter' : 'Fixed'})</span>
                            </td>

                            {/* Tonnage */}
                            <td className="p-4">
                              <span className="px-2 py-1 bg-[#FAF7F0] dark:bg-[#252525] rounded-md font-bold text-xs border border-[#E2E0DB] dark:border-[#292929]">
                                {p.tonnage} Ton
                              </span>
                              <span className="block text-[10px] text-[#C8A96B] font-bold mt-1">★ {p.star_rating} Star</span>
                            </td>

                            {/* Price */}
                            <td className="p-4">
                              <div className="font-black text-[#111111] dark:text-[#C8A96B]">₹{p.price?.toLocaleString()}</div>
                              {p.original_price && p.original_price > p.price && (
                                <div className="text-[11px] text-[#858585] line-through">
                                  ₹{p.original_price?.toLocaleString()}
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">({p.discount_percent}% off)</span>
                                </div>
                              )}
                            </td>

                            {/* Stock */}
                            <td className="p-4">
                              {p.stock > 10 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  {p.stock} in stock
                                </span>
                              ) : p.stock > 0 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                  Low: {p.stock} left
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600">
                                  Out of Stock
                                </span>
                              )}
                            </td>

                            {/* Badges */}
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {p.badge && (
                                  <span className="px-2 py-0.5 bg-[#111111] text-[#C8A96B] font-bold text-[10px] rounded-md">
                                    {p.badge}
                                  </span>
                                )}
                                {p.is_featured && (
                                  <span className="px-2 py-0.5 bg-[#C8A96B] text-[#111111] font-black text-[10px] rounded-md">
                                    FEATURED
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-2 rounded-xl bg-[#FAF7F0] dark:bg-[#252525] text-[#111111] dark:text-[#C8A96B] hover:bg-[#111111] hover:text-white transition"
                                  title="Edit Product"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeletingProduct(p)}
                                  className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* 2. AC SERVICES MANAGEMENT TAB */}
          {/* ============================================================ */}
          {activeSubTab === 'services' && (
            <div className="space-y-6">
              
              {/* Service Control Bar */}
              <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#858585] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      placeholder="Search AC services by title, category, or tasks..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl text-xs sm:text-sm text-[#111111] dark:text-white placeholder-[#858585] focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
                    />
                  </div>

                  <div className="w-full sm:w-52">
                    <LuxurySelect
                      value={serviceCategoryFilter}
                      onChange={(e) => setServiceCategoryFilter(e.target.value)}
                      options={allServiceCategories.map(c => ({ value: c, label: c === 'All' ? 'All Categories' : c }))}
                      size="md"
                    />
                  </div>
                </div>

                <button
                  onClick={handleOpenAddService}
                  className="btn-emerald-primary px-5 py-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add AC Service</span>
                </button>
              </div>

              {/* Services Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.length === 0 ? (
                  <div className="col-span-full bg-white dark:bg-[#1A1A1A] p-12 text-center rounded-3xl border border-[#E2E0DB] dark:border-[#292929] text-[#858585]">
                    No AC service packages found matching your search.
                  </div>
                ) : (
                  filteredServices.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white dark:bg-[#1A1A1A] rounded-3xl border border-[#E2E0DB] dark:border-[#292929] overflow-hidden shadow-sm hover:border-[#C8A96B] transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Service Image banner */}
                        <div className="relative h-44 w-full bg-[#F7F6F2] dark:bg-[#252525] overflow-hidden">
                          <img
                            src={s.image}
                            alt={s.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#111111]/90 text-[#C8A96B] backdrop-blur-sm border border-[#C8A96B]/30">
                              {s.category}
                            </span>
                          </div>
                          <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/80 text-white rounded-xl text-xs font-black backdrop-blur-sm border border-white/10">
                            ₹{s.price?.toLocaleString()}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-base text-[#111111] dark:text-white line-clamp-1">{s.title}</h3>
                            <span className="text-[11px] text-[#858585] font-semibold shrink-0">
                              ⏱️ {s.estimated_time || '1-2 Hours'}
                            </span>
                          </div>

                          <p className="text-xs text-[#666666] dark:text-[#888888] line-clamp-2 leading-relaxed">
                            {s.description}
                          </p>

                          {/* Included tasks tags */}
                          {s.includes && (
                            <div className="pt-2 border-t border-[#E2E0DB]/60 dark:border-[#2E2E2E]">
                              <span className="text-[10px] font-bold text-[#858585] uppercase tracking-wider block mb-1.5">Includes:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {s.includes.split(',').map((inc, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-[#FAF7F0] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333] text-[10px] font-medium text-[#111111] dark:text-[#E2E0DB]">
                                    ✓ {inc.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 bg-[#FAF7F0] dark:bg-[#222222] border-t border-[#E2E0DB] dark:border-[#292929] flex items-center justify-between">
                        <span className="text-[11px] text-[#858585] font-mono">Service ID: #{s.id}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenEditService(s)}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#333333] text-xs font-bold text-[#111111] dark:text-[#C8A96B] hover:border-[#C8A96B] transition flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setDeletingService(s)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition text-xs font-bold flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* 3. AMC PLANS MANAGEMENT TAB */}
          {/* ============================================================ */}
          {activeSubTab === 'amc' && (
            <div className="space-y-6">
              
              {/* AMC Control Bar */}
              <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#858585] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={amcSearch}
                      onChange={(e) => setAmcSearch(e.target.value)}
                      placeholder="Search AMC plans by name, tier, or benefits..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl text-xs sm:text-sm text-[#111111] dark:text-white placeholder-[#858585] focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
                    />
                  </div>

                  <div className="w-full sm:w-52">
                    <LuxurySelect
                      value={amcTierFilter}
                      onChange={(e) => setAmcTierFilter(e.target.value)}
                      options={allAMCTiers.map(t => ({ value: t, label: t === 'All' ? 'All Tiers' : t.toUpperCase() }))}
                      size="md"
                    />
                  </div>
                </div>

                <button
                  onClick={handleOpenAddAMC}
                  className="btn-emerald-primary px-5 py-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add AMC Plan</span>
                </button>
              </div>

              {/* AMC Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAMCPlans.length === 0 ? (
                  <div className="col-span-full bg-white dark:bg-[#1A1A1A] p-12 text-center rounded-3xl border border-[#E2E0DB] dark:border-[#292929] text-[#858585]">
                    No AMC plans found matching your search.
                  </div>
                ) : (
                  filteredAMCPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-white dark:bg-[#1A1A1A] rounded-3xl border border-[#E2E0DB] dark:border-[#292929] overflow-hidden shadow-sm hover:border-[#C8A96B] transition flex flex-col justify-between"
                    >
                      <div className="p-6 space-y-4">
                        {/* Header: Tier & Badge */}
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            plan.tier === 'premium'
                              ? 'bg-[#C8A96B]/15 text-[#C8A96B] border-[#C8A96B]/40'
                              : plan.tier === 'standard'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                          }`}>
                            {plan.tier} Plan
                          </span>
                          <span className="text-[11px] text-[#858585] font-mono">Plan ID: #{plan.id}</span>
                        </div>

                        {/* Title & Price */}
                        <div>
                          <h3 className="font-extrabold text-lg text-[#111111] dark:text-white tracking-tight">{plan.name}</h3>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-[#111111] dark:text-[#C8A96B]">₹{plan.price_per_year?.toLocaleString()}</span>
                            <span className="text-xs text-[#858585]">/ year</span>
                          </div>
                        </div>

                        <p className="text-xs text-[#666666] dark:text-[#888888] leading-relaxed">
                          {plan.description}
                        </p>

                        {/* Benefit Breakdown */}
                        <div className="p-4 bg-[#FAF7F0] dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[#858585]">Scheduled Visits:</span>
                            <strong className="text-[#111111] dark:text-white font-bold">{plan.covered_visits} Visits / Year</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#858585]">Free Gas Charging:</span>
                            <span className={`font-bold ${plan.free_gas_charging ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#858585]'}`}>
                              {plan.free_gas_charging ? '✓ 100% Covered' : '✕ Not Included'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#858585]">Priority Response:</span>
                            <span className={`font-bold ${plan.priority_service ? 'text-[#C8A96B]' : 'text-[#858585]'}`}>
                              {plan.priority_service ? '⚡ 24hr Fast-Track' : 'Standard Queue'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#858585]">Spare Parts Discount:</span>
                            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{plan.discount_parts_percent}% Off</strong>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 bg-[#FAF7F0] dark:bg-[#222222] border-t border-[#E2E0DB] dark:border-[#292929] flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditAMC(plan)}
                          className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#333333] text-xs font-bold text-[#111111] dark:text-[#C8A96B] hover:border-[#C8A96B] transition flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Plan</span>
                        </button>
                        <button
                          onClick={() => setDeletingAMC(plan)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition text-xs font-bold flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* 4. SERVICE BOOKINGS TAB */}
          {/* ============================================================ */}
          {activeSubTab === 'bookings' && (
            <div className="space-y-4">
              {/* Filter Controls Header */}
              <div className="bg-white dark:bg-[#1A1A1A] p-4 sm:p-5 rounded-2xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                    <Calendar className="w-5 h-5 text-[#C8A96B]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base sm:text-lg font-black text-[#111111] dark:text-white">Service Bookings Management</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {bookings.length} Total
                      </span>
                      {bookings.filter(b => b.status === 'Pending').length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-600 border border-amber-300 animate-pulse">
                          {bookings.filter(b => b.status === 'Pending').length} Needs Confirmation
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#858585]">Accept doorstep bookings, assign certified field technicians, and track progress.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#858585] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      placeholder="Search bookings by #, customer, service, pincode..."
                      className="w-full pl-9 pr-3 py-2 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl text-xs text-[#111111] dark:text-white placeholder-[#858585] focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
                    />
                  </div>
                  <div className="w-full sm:w-44">
                    <LuxurySelect
                      value={bookingStatusFilter}
                      onChange={(e) => setBookingStatusFilter(e.target.value)}
                      options={[
                        { value: 'All', label: 'All Statuses' },
                        { value: 'Pending', label: 'Pending' },
                        { value: 'Confirmed', label: 'Confirmed' },
                        { value: 'Assigned', label: 'Assigned' },
                        { value: 'In Progress', label: 'In Progress' },
                        { value: 'Completed', label: 'Completed' },
                        { value: 'Rejected', label: 'Rejected' }
                      ]}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead className="bg-[#F7F6F2] dark:bg-[#252525] text-[#111111] dark:text-white font-bold border-b border-[#E2E0DB] dark:border-[#292929]">
                      <tr>
                        <th className="p-4">Booking #</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Service</th>
                        <th className="p-4">Date & Slot</th>
                        <th className="p-4">Pincode</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Assigned Tech</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E0DB] dark:divide-[#292929]">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="p-8 text-center text-[#858585]">
                            No service bookings matching this filter.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => {
                          const item = {
                            ...b,
                            request_type: 'booking',
                            display_id: b.booking_number,
                            title_display: b.service_title,
                            sub_display: `Pincode: ${b.pincode} • Fee: ₹${b.price}`,
                            customer_name: b.customer_name || 'Customer',
                            customer_phone: b.customer_phone || 'N/A',
                            customer_address: b.customer_address || b.address || `Pincode: ${b.pincode}`,
                            slot_display: `${b.date || ''} (${b.slot || ''})`,
                            priority_display: 'Standard',
                            raw_date: b.created_at
                          };
                          return (
                            <tr key={b.id} className="hover:bg-[#FAF7F0] dark:hover:bg-[#202020] transition-colors">
                              <td className="p-4 font-bold font-mono text-[#111111] dark:text-[#C8A96B]">{b.booking_number}</td>
                              <td className="p-4 text-[#111111] dark:text-white font-medium">
                                <div>{b.customer_name}</div>
                                {b.customer_phone && (
                                  <div className="text-xs text-[#858585] flex items-center space-x-1 mt-0.5">
                                    <Phone className="w-3 h-3 text-[#C8A96B]" />
                                    <span>{b.customer_phone}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-4 font-semibold text-[#111111] dark:text-white">{b.service_title}</td>
                              <td className="p-4 text-xs text-[#555555] dark:text-[#858585]">{b.date} ({b.slot})</td>
                              <td className="p-4 font-mono text-xs">{b.pincode}</td>
                              <td className="p-4 font-bold text-[#111111] dark:text-[#C8A96B]">₹{b.price}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full font-bold text-xs border ${getStatusBadge(b.status)}`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="p-4">
                                {b.status === 'Pending' ? (
                                  <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">⏳ Awaiting Approval</span>
                                ) : b.status === 'Confirmed' ? (
                                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">⚠️ Needs Assignment</span>
                                ) : b.technician_name && b.technician_name !== 'Unassigned' ? (
                                  <span className="font-bold text-[#111111] dark:text-white flex items-center space-x-1">
                                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>{b.technician_name}</span>
                                  </span>
                                ) : (
                                  <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">⚠️ Not Assigned</span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  {b.status === 'Pending' && (
                                    <>
                                      <button
                                        onClick={() => handleAcceptRequest(item)}
                                        className="btn-emerald-primary px-3 py-1.5 text-xs font-bold whitespace-nowrap"
                                        title="Accept booking"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => handleRejectRequest(item)}
                                        className="px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-700 rounded-xl hover:bg-rose-50 whitespace-nowrap"
                                        title="Reject booking"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {b.status === 'Confirmed' && (
                                    <button
                                      onClick={() => handleAssignClick(item)}
                                      className="btn-emerald-primary px-3.5 py-1.5 text-xs font-bold whitespace-nowrap"
                                      title="Assign technician"
                                    >
                                      Assign Service Man
                                    </button>
                                  )}
                                  {b.status === 'Assigned' && (
                                    <button
                                      onClick={() => handleAssignClick(item)}
                                      className="px-3 py-1.5 text-xs font-bold bg-[#FAF7F0] dark:bg-[#252525] text-[#111111] dark:text-white border border-[#E2E0DB] dark:border-[#333333] rounded-xl hover:border-[#C8A96B] whitespace-nowrap"
                                      title="Reassign technician"
                                    >
                                      Reassign
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setViewingComplaint(item)}
                                    className="p-1.5 rounded-lg bg-[#FAF7F0] dark:bg-[#252525] text-[#111111] dark:text-white hover:bg-[#111111] hover:text-white transition"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. ANALYTICS TAB */}
          {/* ============================================================ */}
          {activeSubTab === 'analytics' && analytics && (
            <div className="space-y-8">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div className="bg-white dark:bg-[#1A1A1A] p-4 sm:p-5 rounded-2xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#858585]">Total Sales Revenue</span>
                  <h3 className="text-lg sm:text-xl font-black text-[#111111] dark:text-white mt-1">₹{analytics.kpis.total_sales_revenue.toLocaleString()}</h3>
                  <p className="text-xs text-[#C8A96B] font-bold mt-1">🛒 {analytics.kpis.total_orders} Orders</p>
                </div>

                <div className="bg-white dark:bg-[#1A1A1A] p-4 sm:p-5 rounded-2xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#858585]">Service Revenue</span>
                  <h3 className="text-lg sm:text-xl font-black text-[#111111] dark:text-white mt-1">₹{analytics.kpis.total_service_revenue.toLocaleString()}</h3>
                  <p className="text-xs text-[#C8A96B] font-bold mt-1">🔧 {analytics.kpis.total_bookings} Service Bookings</p>
                </div>

                <div className="bg-white dark:bg-[#1A1A1A] p-4 sm:p-5 rounded-2xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#858585]">AMC Revenue</span>
                  <h3 className="text-lg sm:text-xl font-black text-[#111111] dark:text-white mt-1">₹{analytics.kpis.total_amc_revenue.toLocaleString()}</h3>
                  <p className="text-xs text-[#C8A96B] font-bold mt-1">📅 {analytics.kpis.active_amc_subscriptions} Active AMCs</p>
                </div>

                <div className="bg-[#111111] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-[#C8A96B]/30">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C8A96B]">Grand Total Revenue</span>
                  <h3 className="text-lg sm:text-xl font-black mt-1 text-white">₹{analytics.kpis.grand_total_revenue.toLocaleString()}</h3>
                  <p className="text-xs font-bold text-[#C8A96B] mt-1">✨ Sales + Service + AMC</p>
                </div>
              </div>

              {/* Revenue Trend Chart */}
              <div className="bg-white dark:bg-[#1A1A1A] p-6 sm:p-8 rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm space-y-4">
                <h2 className="text-xl font-black text-[#111111] dark:text-white">Monthly Revenue Trends (Sales vs Services vs AMC)</h2>
                <div className="h-80 lg:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.monthly_revenue_trend}>
                      <XAxis dataKey="month" stroke="#858585" />
                      <YAxis stroke="#858585" />
                      <Tooltip 
                        formatter={(val) => `₹${val.toLocaleString()}`}
                        contentStyle={{ backgroundColor: '#111111', borderColor: '#292929', borderRadius: '0.75rem', color: '#FFFFFF' }}
                      />
                      <Area type="monotone" dataKey="sales" stackId="1" stroke="#111111" fill="#111111" fillOpacity={0.8} />
                      <Area type="monotone" dataKey="service" stackId="1" stroke="#C8A96B" fill="#C8A96B" fillOpacity={0.8} />
                      <Area type="monotone" dataKey="amc" stackId="1" stroke="#858585" fill="#858585" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD / EDIT AC PRODUCT */}
      {/* ============================================================ */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-3xl rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#111111] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-[#C8A96B]" />
                <h3 className="font-bold text-base sm:text-lg">
                  {editingProductId ? 'Edit AC Product' : 'Add New AC Product'}
                </h3>
              </div>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-[#858585] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleProductFormSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              
              {/* Image Upload & Live Preview Section */}
              <div className="p-4 bg-[#F7F6F2] dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#292929] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#111111] dark:text-white flex items-center space-x-2">
                    <Image className="w-4 h-4 text-[#C8A96B]" />
                    <span>Product Image & Live Preview</span>
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                        imageMode === 'url' ? 'bg-[#111111] text-white' : 'bg-white dark:bg-[#1A1A1A] text-[#858585]'
                      }`}
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                        imageMode === 'upload' ? 'bg-[#111111] text-white' : 'bg-white dark:bg-[#1A1A1A] text-[#858585]'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Current Preview Box */}
                  <div className="w-32 h-32 rounded-xl overflow-hidden bg-white dark:bg-[#1A1A1A] border-2 border-dashed border-[#C8A96B]/50 flex-shrink-0 flex items-center justify-center relative shadow-sm">
                    {productForm.image ? (
                      <img 
                        src={productForm.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400'; }}
                      />
                    ) : (
                      <span className="text-[10px] text-[#858585] text-center p-2">No image loaded</span>
                    )}
                  </div>

                  {/* Input Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    {imageMode === 'url' ? (
                      <div>
                        <span className="text-[11px] text-[#858585] font-semibold block mb-1">Enter Public Image URL:</span>
                        <input
                          type="url"
                          value={productForm.image}
                          onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#292929] rounded-xl text-xs font-mono"
                        />
                      </div>
                    ) : (
                      <div>
                        <span className="text-[11px] text-[#858585] font-semibold block mb-1">Select Image From Computer:</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          disabled={uploadingImage}
                          className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#111111] file:text-white hover:file:bg-[#C8A96B] hover:file:text-[#111111] cursor-pointer"
                        />
                        {uploadingImage && <span className="text-xs text-[#C8A96B] mt-1 block">Uploading to server...</span>}
                      </div>
                    )}
                    <p className="text-[11px] text-[#858585]">
                      Realistic e-commerce product photos of split or window air conditioners display best.
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g. Daikin 1.5 Ton 5 Star Inverter Split AC"
                    className="w-full px-3 py-2 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Brand</label>
                  <LuxurySelect
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    options={['Daikin', 'LG', 'Voltas', 'Blue Star', 'Panasonic', 'Lloyd', 'Mitsubishi', 'O General', 'Carrier']}
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Model Code</label>
                  <input
                    type="text"
                    value={productForm.model}
                    onChange={(e) => setProductForm({ ...productForm, model: e.target.value })}
                    placeholder="e.g. FTKM50U"
                    className="w-full px-3 py-2 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">AC Type</label>
                  <LuxurySelect
                    value={productForm.ac_type}
                    onChange={(e) => setProductForm({ ...productForm, ac_type: e.target.value })}
                    options={[
                      { value: 'Split', label: 'Split AC' },
                      { value: 'Window', label: 'Window AC' },
                      { value: 'Cassette', label: 'Cassette AC' },
                      { value: 'Tower', label: 'Tower AC' }
                    ]}
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Capacity (Tonnage)</label>
                  <LuxurySelect
                    value={productForm.tonnage}
                    onChange={(e) => setProductForm({ ...productForm, tonnage: parseFloat(e.target.value) })}
                    options={[
                      { value: 1.0, label: '1.0 Ton' },
                      { value: 1.5, label: '1.5 Ton' },
                      { value: 2.0, label: '2.0 Ton' }
                    ]}
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Star Rating</label>
                  <LuxurySelect
                    value={productForm.star_rating}
                    onChange={(e) => setProductForm({ ...productForm, star_rating: parseInt(e.target.value) })}
                    options={[
                      { value: 3, label: '3 Star ★★★' },
                      { value: 4, label: '4 Star ★★★★' },
                      { value: 5, label: '5 Star ★★★★★' }
                    ]}
                    size="sm"
                  />
                </div>

              </div>

              {/* Pricing & Stock Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#FAF7F0] dark:bg-[#202020] rounded-2xl border border-[#E2E0DB] dark:border-[#292929]">
                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#292929] rounded-xl font-bold text-[#111111] dark:text-[#C8A96B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={productForm.original_price}
                    onChange={(e) => setProductForm({ ...productForm, original_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#292929] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Stock Availability</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#292929] rounded-xl"
                  />
                </div>
              </div>

              {/* Badges & Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Product Badge Tag</label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="e.g. Best Seller, New Launch, Hot Offer, On Sale"
                    className="w-full px-3 py-2 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl"
                  />
                </div>

                <div className="flex items-center space-x-6 pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.is_featured}
                      onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C8A96B] focus:ring-[#C8A96B]"
                    />
                    <span className="font-bold text-xs text-[#111111] dark:text-white">Mark as Featured</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.is_inverter}
                      onChange={(e) => setProductForm({ ...productForm, is_inverter: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C8A96B] focus:ring-[#C8A96B]"
                    />
                    <span className="font-bold text-xs text-[#111111] dark:text-white">Inverter AC</span>
                  </label>
                </div>
              </div>

              {/* Features & Description */}
              <div>
                <label className="block font-bold text-[#111111] dark:text-white mb-1">Key Features (comma-separated)</label>
                <input
                  type="text"
                  value={productForm.features}
                  onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                  placeholder="e.g. 100% Copper, PM2.5 Filter, 3D Airflow, 52°C Ambient Cooling"
                  className="w-full px-3 py-2 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] dark:text-white mb-1">Description</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#E2E0DB] dark:border-[#292929]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn-emerald-secondary px-5 py-2.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="btn-emerald-primary px-6 py-2.5 text-xs font-bold"
                >
                  {isSavingProduct ? 'Saving Product...' : editingProductId ? 'Update Product' : 'Add Product to Store'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ASSIGN SERVICE MAN */}
      {/* ============================================================ */}
      {assigningComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-xl rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-2xl p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-[#C8A96B]" />
                <h3 className="font-bold text-lg text-[#111111] dark:text-white">Assign Service Man</h3>
              </div>
              <button 
                onClick={() => setAssigningComplaint(null)}
                className="p-1 rounded-lg text-[#858585] hover:text-[#111111]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Service Booking Summary */}
            <div className="p-4 bg-[#FAF7F0] dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#292929] text-xs space-y-2">
              <div className="flex justify-between items-center font-bold">
                <span className="text-[#111111] dark:text-white">
                  Service Booking #{assigningComplaint.booking_number || assigningComplaint.display_id}
                </span>
                <span className="text-[#C8A96B]">Doorstep Service</span>
              </div>
              <p className="text-[#555555] dark:text-[#858585]">
                <strong>Customer:</strong> {assigningComplaint.customer_name} ({assigningComplaint.customer_phone || 'N/A'})
              </p>
              <p className="text-[#555555] dark:text-[#858585]">
                <strong>Address:</strong> {assigningComplaint.customer_address || assigningComplaint.address || `Pincode: ${assigningComplaint.pincode}`}
              </p>
              <p className="text-[#555555] dark:text-[#858585]">
                <strong>Service Package:</strong> {assigningComplaint.service_title || assigningComplaint.title_display}
              </p>
            </div>

            {/* Service Men Selection List */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#111111] dark:text-white">
                Select Available Service Man:
              </label>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {technicians.map((t) => {
                  const isSelected = selectedTechId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTechId(t.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#C8A96B] bg-[#FAF7F0] dark:bg-[#252525] shadow-sm'
                          : 'border-[#E2E0DB] dark:border-[#292929] bg-white dark:bg-[#1A1A1A] hover:border-[#C8A96B]/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
                          isSelected ? 'bg-[#111111] text-[#C8A96B]' : 'bg-[#F7F6F2] dark:bg-[#252525] text-[#111111] dark:text-white'
                        }`}>
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#111111] dark:text-white">{t.name}</h4>
                          <p className="text-[11px] text-[#858585]">{t.phone} • {t.specialization}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.availability === 'Available'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {t.availability}
                        </span>
                        <span className="block text-[10px] text-[#858585] mt-1 font-semibold">
                          Active Jobs: {t.active_complaints}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-[#E2E0DB] dark:border-[#292929]">
              <button
                type="button"
                onClick={() => setAssigningComplaint(null)}
                className="btn-emerald-secondary px-5 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                disabled={isAssigning}
                className="btn-emerald-primary px-6 py-2.5 text-xs font-bold"
              >
                {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DELETE PRODUCT CONFIRMATION */}
      {/* ============================================================ */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-md rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-2xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-[#111111] dark:text-white">Delete Product?</h3>
              <p className="text-xs text-[#858585]">
                Are you sure you want to delete <strong className="text-[#111111] dark:text-white">"{deletingProduct.title}"</strong>? This product will be immediately removed from the customer AC store.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                className="btn-emerald-secondary flex-1 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProductConfirm}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition flex-1"
              >
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: VIEW FULL SERVICE BOOKING DETAILS */}
      {/* ============================================================ */}
      {viewingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-xl rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E0DB] dark:border-[#292929] pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#C8A96B]">
                  {viewingComplaint.booking_number || viewingComplaint.display_id}
                </span>
                <h3 className="font-bold text-lg text-[#111111] dark:text-white">
                  Service Booking Details
                </h3>
              </div>
              <button 
                onClick={() => setViewingComplaint(null)}
                className="p-1 rounded-lg text-[#858585] hover:text-[#111111]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF7F0] dark:bg-[#252525] rounded-xl border border-[#E2E0DB] dark:border-[#292929]">
                <div>
                  <span className="text-[#858585] block text-[11px]">Customer Name</span>
                  <span className="font-bold text-[#111111] dark:text-white">{viewingComplaint.customer_name}</span>
                </div>
                <div>
                  <span className="text-[#858585] block text-[11px]">Contact Number</span>
                  <span className="font-bold text-[#111111] dark:text-white">{viewingComplaint.customer_phone || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#858585] block text-[11px]">Doorstep Service Address</span>
                  <span className="font-bold text-[#111111] dark:text-white">{viewingComplaint.customer_address || viewingComplaint.address || `Pincode: ${viewingComplaint.pincode}`}</span>
                </div>
              </div>

              <div className="p-3 bg-[#F7F6F2] dark:bg-[#202020] rounded-xl border border-[#E2E0DB] dark:border-[#292929] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#858585]">Service Package:</span>
                  <strong className="text-[#111111] dark:text-white">{viewingComplaint.service_title || viewingComplaint.title_display}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#858585]">Scheduled Slot:</span>
                  <strong className="text-[#111111] dark:text-white">{viewingComplaint.slot_display || `${viewingComplaint.date} (${viewingComplaint.slot})`}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#858585]">Service Fee:</span>
                  <strong className="text-[#C8A96B]">₹{viewingComplaint.price}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#858585]">Current Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(viewingComplaint.status)}`}>
                    {viewingComplaint.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#858585]">Assigned Service Man:</span>
                  <strong className="text-[#111111] dark:text-[#C8A96B]">{viewingComplaint.technician_name || 'Unassigned'}</strong>
                </div>
              </div>

              {viewingComplaint.notes && (
                <div>
                  <span className="text-[#858585] block text-xs font-bold mb-1">Customer Instructions:</span>
                  <p className="p-3 bg-[#FAF7F0] dark:bg-[#252525] rounded-xl text-xs text-[#555555] dark:text-[#F7F6F2] italic">
                    "{viewingComplaint.notes}"
                  </p>
                </div>
              )}

              {viewingComplaint.service_notes && (
                <div>
                  <span className="text-[#858585] block text-xs font-bold mb-1">Technician Service Notes:</span>
                  <p className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    {viewingComplaint.service_notes}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD / EDIT AC SERVICE */}
      {/* ============================================================ */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            
            <div className="flex items-center justify-between border-b border-[#E2E0DB] dark:border-[#292929] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#C8A96B] flex items-center justify-center font-black">
                  <Wrench className="w-5 h-5 text-[#C8A96B]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#111111] dark:text-white">
                    {editingServiceId ? 'Edit AC Service Package' : 'Add New AC Service Package'}
                  </h3>
                  <p className="text-xs text-[#858585]">
                    Configure pricing, duration, included tasks, and customer booking specifics.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1.5 rounded-xl text-[#858585] hover:text-[#111111] dark:hover:text-white hover:bg-[#FAF7F0] dark:hover:bg-[#252525]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleServiceFormSubmit} className="space-y-4 text-xs">
              
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    placeholder="e.g. AC Foam & Jet Deep Cleaning"
                    className="w-full px-3.5 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl text-[#111111] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Category *</label>
                  <LuxurySelect
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    options={[
                      { value: 'Cleaning', label: 'Cleaning' },
                      { value: 'Installation', label: 'Installation' },
                      { value: 'Repair', label: 'Repair' },
                      { value: 'Gas Charging', label: 'Gas Charging' },
                      { value: 'Maintenance', label: 'Maintenance' }
                    ]}
                    size="md"
                  />
                </div>
              </div>

              {/* Pricing & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#FAF7F0] dark:bg-[#202020] rounded-2xl border border-[#E2E0DB] dark:border-[#292929]">
                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Service Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#292929] rounded-xl font-bold text-[#111111] dark:text-[#C8A96B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    value={serviceForm.estimated_time}
                    onChange={(e) => setServiceForm({ ...serviceForm, estimated_time: e.target.value })}
                    placeholder="e.g. 1-2 Hours, 45 - 60 Mins"
                    className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#292929] rounded-xl text-[#111111] dark:text-white"
                  />
                </div>
              </div>

              {/* Image Mode Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-[#111111] dark:text-white">Service Imagery *</label>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setServiceImageMode('url')}
                      className={`px-2.5 py-0.5 rounded-md font-bold transition ${
                        serviceImageMode === 'url' ? 'bg-[#C8A96B] text-[#111111]' : 'text-[#858585] hover:text-[#111111]'
                      }`}
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceImageMode('upload')}
                      className={`px-2.5 py-0.5 rounded-md font-bold transition ${
                        serviceImageMode === 'upload' ? 'bg-[#C8A96B] text-[#111111]' : 'text-[#858585] hover:text-[#111111]'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {serviceImageMode === 'url' ? (
                  <input
                    type="url"
                    required
                    value={serviceForm.image}
                    onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl text-[#111111] dark:text-white"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-dashed border-[#C8A96B] rounded-xl cursor-pointer hover:bg-[#FAF7F0] transition">
                      <Upload className="w-4 h-4 text-[#C8A96B]" />
                      <span className="font-bold text-[#111111] dark:text-white">
                        {uploadingServiceImage ? 'Uploading Image...' : 'Choose Service Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleServiceImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {serviceForm.image && (
                  <div className="mt-2 flex items-center space-x-3 p-2 bg-[#FAF7F0] dark:bg-[#252525] rounded-xl border border-[#E2E0DB] dark:border-[#333333]">
                    <img src={serviceForm.image} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                    <span className="text-[11px] text-[#858585] truncate flex-1">{serviceForm.image}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs shrink-0">✓ Ready</span>
                  </div>
                )}
              </div>

              {/* Included Tasks */}
              <div>
                <label className="block font-bold text-[#111111] dark:text-white mb-1">Included Tasks (comma-separated)</label>
                <input
                  type="text"
                  value={serviceForm.includes}
                  onChange={(e) => setServiceForm({ ...serviceForm, includes: e.target.value })}
                  placeholder="e.g. Jet Foam Wash, Drain Pipe Clearing, Filter Sanitization, Gas Pressure Check"
                  className="w-full px-3.5 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl text-[#111111] dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-[#111111] dark:text-white mb-1">Service Description</label>
                <textarea
                  rows="3"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl text-[#111111] dark:text-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#E2E0DB] dark:border-[#292929]">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="btn-emerald-secondary px-5 py-2.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingService}
                  className="btn-emerald-primary px-6 py-2.5 text-xs font-bold"
                >
                  {isSavingService ? 'Saving Service...' : editingServiceId ? 'Update AC Service' : 'Add AC Service'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DELETE SERVICE CONFIRMATION */}
      {/* ============================================================ */}
      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-md rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-2xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-[#111111] dark:text-white">Delete Service Package?</h3>
              <p className="text-xs text-[#858585]">
                Are you sure you want to delete <strong className="text-[#111111] dark:text-white">"{deletingService.title}"</strong>? This service will no longer be bookable on the Services page.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingService(null)}
                className="btn-emerald-secondary flex-1 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteServiceConfirm}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition flex-1"
              >
                Yes, Delete Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD / EDIT AMC PLAN */}
      {/* ============================================================ */}
      {isAMCModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            
            <div className="flex items-center justify-between border-b border-[#E2E0DB] dark:border-[#292929] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#C8A96B] flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5 text-[#C8A96B]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#111111] dark:text-white">
                    {editingAMCId ? 'Edit AMC Protection Plan' : 'Add New AMC Protection Plan'}
                  </h3>
                  <p className="text-xs text-[#858585]">
                    Configure maintenance tiers, scheduled visits quota, and parts discount benefits.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAMCModalOpen(false)}
                className="p-1.5 rounded-xl text-[#858585] hover:text-[#111111] dark:hover:text-white hover:bg-[#FAF7F0] dark:hover:bg-[#252525]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAMCFormSubmit} className="space-y-4 text-xs">
              
              {/* Name & Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={amcForm.name}
                    onChange={(e) => setAmcForm({ ...amcForm, name: e.target.value })}
                    placeholder="e.g. Standard Gold AMC"
                    className="w-full px-3.5 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl text-[#111111] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Tier *</label>
                  <LuxurySelect
                    value={amcForm.tier}
                    onChange={(e) => setAmcForm({ ...amcForm, tier: e.target.value })}
                    options={[
                      { value: 'basic', label: 'Basic' },
                      { value: 'standard', label: 'Standard' },
                      { value: 'premium', label: 'Premium' }
                    ]}
                    size="md"
                  />
                </div>
              </div>

              {/* Price, Visits & Parts Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#FAF7F0] dark:bg-[#202020] rounded-2xl border border-[#E2E0DB] dark:border-[#292929]">
                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Price / Year (₹) *</label>
                  <input
                    type="number"
                    required
                    value={amcForm.price_per_year}
                    onChange={(e) => setAmcForm({ ...amcForm, price_per_year: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#292929] rounded-xl font-bold text-[#111111] dark:text-[#C8A96B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Covered Visits / Year</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={amcForm.covered_visits}
                    onChange={(e) => setAmcForm({ ...amcForm, covered_visits: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#292929] rounded-xl text-[#111111] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Parts Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={amcForm.discount_parts_percent}
                    onChange={(e) => setAmcForm({ ...amcForm, discount_parts_percent: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#292929] rounded-xl text-[#111111] dark:text-white"
                  />
                </div>
              </div>

              {/* Toggles: Gas Charging & Priority Dispatch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <label className="flex items-center space-x-3 p-3 bg-[#FAF7F0] dark:bg-[#252525] rounded-xl border border-[#E2E0DB] dark:border-[#333333] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amcForm.free_gas_charging}
                    onChange={(e) => setAmcForm({ ...amcForm, free_gas_charging: e.target.checked })}
                    className="w-4 h-4 rounded text-[#C8A96B] focus:ring-[#C8A96B]"
                  />
                  <div>
                    <span className="font-bold text-[#111111] dark:text-white block">Free Gas Charging</span>
                    <span className="text-[10px] text-[#858585]">Covers 100% refrigerant top-up during contract</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 bg-[#FAF7F0] dark:bg-[#252525] rounded-xl border border-[#E2E0DB] dark:border-[#333333] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amcForm.priority_service}
                    onChange={(e) => setAmcForm({ ...amcForm, priority_service: e.target.checked })}
                    className="w-4 h-4 rounded text-[#C8A96B] focus:ring-[#C8A96B]"
                  />
                  <div>
                    <span className="font-bold text-[#111111] dark:text-white block">Priority Dispatch (24h)</span>
                    <span className="text-[10px] text-[#858585]">Guaranteed 24-hour technician doorstep response</span>
                  </div>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-[#111111] dark:text-white mb-1">Plan Description</label>
                <textarea
                  rows="3"
                  value={amcForm.description}
                  onChange={(e) => setAmcForm({ ...amcForm, description: e.target.value })}
                  placeholder="Describe tier coverage, included services, and customer perks..."
                  className="w-full px-3.5 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl text-[#111111] dark:text-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#E2E0DB] dark:border-[#292929]">
                <button
                  type="button"
                  onClick={() => setIsAMCModalOpen(false)}
                  className="btn-emerald-secondary px-5 py-2.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAMC}
                  className="btn-emerald-primary px-6 py-2.5 text-xs font-bold"
                >
                  {isSavingAMC ? 'Saving Plan...' : editingAMCId ? 'Update AMC Plan' : 'Add AMC Plan'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DELETE AMC PLAN CONFIRMATION */}
      {/* ============================================================ */}
      {deletingAMC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-md rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-2xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-[#111111] dark:text-white">Delete AMC Plan?</h3>
              <p className="text-xs text-[#858585]">
                Are you sure you want to delete <strong className="text-[#111111] dark:text-white">"{deletingAMC.name}"</strong>? Customers will no longer be able to subscribe to this plan.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingAMC(null)}
                className="btn-emerald-secondary flex-1 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAMCConfirm}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition flex-1"
              >
                Yes, Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
