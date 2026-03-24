import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, DollarSign, X, Grid, List } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import {
  getServices,
  getCatalog,
  mapCatalogAgentToService,
  type Service,
  type ServiceSearchParams,
  type CatalogAgentItem,
} from '../../api/services';
import { getPublicServiceRequests, mapPublicRequestToService } from '../../api/serviceRequests';
import { REGISTRATION_SERVICE_CATEGORIES } from '../../constants/registrationServiceCategories';
import axios from '../../api/axios';
import ServiceCard from '../ServiceCard';

type JwtPayload = { id?: string; role?: string; exp?: number };

/** What to show on All Services: merged provider listings vs agent-referred professionals. */
type ListingTypeFilter = 'all' | 'services' | 'professionals' | 'requests';

function listingTypeFromSearchParam(raw: string | null): ListingTypeFilter {
  if (raw === 'services' || raw === 'providers') return 'services';
  if (raw === 'professionals' || raw === 'agent') return 'professionals';
  if (raw === 'requests' || raw === 'requested') return 'requests';
  return 'all';
}

function listingTypeToSearchParam(v: ListingTypeFilter): string | null {
  if (v === 'services') return 'services';
  if (v === 'professionals') return 'professionals';
  if (v === 'requests') return 'requests';
  return null;
}

function agentListingMatchesFilters(
  s: Service,
  q: {
    searchQuery: string;
    selectedCategory: string;
    selectedSubcategory: string;
    minPrice: string;
    maxPrice: string;
    location: string;
  }
): boolean {
  const hay = `${s.title} ${s.providerName} ${s.description} ${s.category}`.toLowerCase();
  if (q.searchQuery.trim()) {
    const words = q.searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!words.every((w) => hay.includes(w))) return false;
  }
  if (q.selectedCategory) {
    const cat = q.selectedCategory.toLowerCase();
    if (!s.category.toLowerCase().includes(cat) && !s.title.toLowerCase().includes(cat)) {
      return false;
    }
  }
  if (q.selectedSubcategory) {
    const sub = q.selectedSubcategory.toLowerCase();
    if (
      !s.category.toLowerCase().includes(sub) &&
      !s.title.toLowerCase().includes(sub) &&
      !(s.subcategory || '').toLowerCase().includes(sub)
    ) {
      return false;
    }
  }
  if (q.minPrice !== '' || q.maxPrice !== '') {
    return false;
  }
  if (q.location.trim()) {
    const loc = q.location.toLowerCase();
    if (!s.location.toLowerCase().includes(loc)) return false;
  }
  return true;
}

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // If the logged-in user is an agent, show only services provided by
  // the professionals created via the Agent Dashboard.
  const [agentProviderIds, setAgentProviderIds] = useState<string[] | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [listingTypeFilter, setListingTypeFilter] = useState<ListingTypeFilter>(() =>
    listingTypeFromSearchParam(searchParams.get('listing'))
  );
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest'>('relevance');
  
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  });

  // Agents only: fetch verified providers list to optionally narrow the services view.
  // Non-agents must not call /agents/professionals (403 + noisy axios errors).
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAgentProviderIds(null);
      return;
    }

    let role: string | undefined;
    try {
      role = jwtDecode<JwtPayload>(token).role;
    } catch {
      setAgentProviderIds(null);
      return;
    }

    if (role !== 'agent') {
      setAgentProviderIds(null);
      return;
    }

    const run = async () => {
      try {
        const res = await axios.get<{ professionals: Array<{ _id: string }> }>('/agents/professionals');
        setAgentProviderIds((res.data?.professionals || []).map((p) => String(p._id)));
      } catch {
        setAgentProviderIds(null);
      }
    };

    void run();
  }, []);

  // Fetch services
  useEffect(() => {
    fetchServices();
  }, [
    listingTypeFilter,
    selectedCategory,
    selectedSubcategory,
    minPrice,
    maxPrice,
    location,
    searchQuery,
    sortBy,
    agentProviderIds
  ]);

  const fetchServices = async (page: number = 1) => {
    setLoading(true);
    try {
      const params: ServiceSearchParams = {
        query: searchQuery || undefined,
        category: selectedCategory || undefined,
        subcategory: selectedSubcategory || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        location: location || undefined,
        page,
        limit: 12
      };

      const [response, catalogRows, requestRows] = await Promise.all([
        getServices(params),
        getCatalog(),
        getPublicServiceRequests(),
      ]);

      let fetchedServices = response.services || [];

      // Filter by services offered by agent-added professionals.
      // If `agentProviderIds` is null, we assume the user isn't an agent (or endpoint failed),
      // so we show the full services list as before.
      if (agentProviderIds && agentProviderIds.length > 0) {
        fetchedServices = fetchedServices.filter((s) => agentProviderIds.includes(s.providerId));
      } else if (agentProviderIds && agentProviderIds.length === 0) {
        fetchedServices = [];
      }

      const filterQ = {
        searchQuery,
        selectedCategory,
        selectedSubcategory,
        minPrice,
        maxPrice,
        location,
      };

      const agentFromCatalog = (catalogRows || [])
        .filter((row): row is CatalogAgentItem => row.source === 'agent')
        .map(mapCatalogAgentToService)
        .filter((s) => agentListingMatchesFilters(s, filterQ));

      const requestListings = (requestRows || [])
        .map(mapPublicRequestToService)
        .filter((s) => agentListingMatchesFilters(s, filterQ));

      const isAgent = (s: Service) => s.catalogSource === 'agent';
      let merged =
        page === 1 ? [...fetchedServices, ...agentFromCatalog, ...requestListings] : [...fetchedServices];

      const sortMerged = (list: Service[]) => {
        const out = [...list];
        if (sortBy === 'price_low') {
          out.sort((a, b) => {
            const aPri = isAgent(a) ? Number.POSITIVE_INFINITY : (a.price || 0);
            const bPri = isAgent(b) ? Number.POSITIVE_INFINITY : (b.price || 0);
            return aPri - bPri;
          });
        } else if (sortBy === 'price_high') {
          out.sort((a, b) => {
            const aPri = isAgent(a) ? Number.NEGATIVE_INFINITY : (a.price || 0);
            const bPri = isAgent(b) ? Number.NEGATIVE_INFINITY : (b.price || 0);
            return bPri - aPri;
          });
        } else if (sortBy === 'rating') {
          out.sort((a, b) => {
            const ratingA = isAgent(a) ? -1 : (a.serviceRating || a.providerRating || 0);
            const ratingB = isAgent(b) ? -1 : (b.serviceRating || b.providerRating || 0);
            return ratingB - ratingA;
          });
        } else if (sortBy === 'newest') {
          out.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
        }
        return out;
      };

      merged = sortMerged(merged);

      if (listingTypeFilter === 'services') {
        merged = merged.filter((s) => s.catalogSource !== 'agent' && s.catalogSource !== 'request');
      } else if (listingTypeFilter === 'professionals') {
        merged = merged.filter((s) => s.catalogSource === 'agent');
      } else if (listingTypeFilter === 'requests') {
        merged = merged.filter((s) => s.catalogSource === 'request');
      }

      setServices(merged);
      setPagination({
        total: merged.length,
        page: response.page || page,
        totalPages: response.totalPages || 1
      });
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURLParams();
    fetchServices(1);
  };

  const handleFilterChange = () => {
    updateURLParams();
    fetchServices(1);
  };

  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    const listingParam = listingTypeToSearchParam(listingTypeFilter);
    if (listingParam) params.set('listing', listingParam);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (location) params.set('location', location);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setListingTypeFilter('all');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setSearchParams({});
    fetchServices(1);
  };

  const handleViewDetails = (service: Service) => {
    navigate(`/service/${service.id}`, {
      state: { service },
    });
  };

  const handleBookService = (service: Service) => {
    navigate(`/service/${service.id}`);
  };

  const getSubcategories = (): string[] => {
    if (!selectedCategory) return [];
    const found = REGISTRATION_SERVICE_CATEGORIES.find(
      (c) => c.name === selectedCategory
    );
    return found ? [...found.subcategories] : [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 pt-24">
      <div className="max-w-[min(100%,100rem)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            All <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-blue-600">Services</span>
          </h1>
          <p className="text-lg text-gray-600">
            Discover and book professional services from verified providers and agent-referred professionals
          </p>
      </div>
      
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Listing kind: provider services vs agent professionals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing type
                </label>
                <select
                  value={listingTypeFilter}
                  onChange={(e) => {
                    const next = e.target.value as ListingTypeFilter;
                    setListingTypeFilter(next);
                    const params = new URLSearchParams();
                    if (searchQuery) params.set('query', searchQuery);
                    const lp = listingTypeToSearchParam(next);
                    if (lp) params.set('listing', lp);
                    if (selectedCategory) params.set('category', selectedCategory);
                    if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
                    if (minPrice) params.set('minPrice', minPrice);
                    if (maxPrice) params.set('maxPrice', maxPrice);
                    if (location) params.set('location', location);
                    setSearchParams(params);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All (services and professionals)</option>
                  <option value="services">Services (verified providers)</option>
                  <option value="professionals">Professionals (agent-referred)</option>
                  <option value="requests">Requested services</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service type
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('');
                    handleFilterChange();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {REGISTRATION_SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                        </div>

              {/* Subcategory Filter */}
              {selectedCategory && getSubcategories().length > 0 && (
                        <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => {
                      setSelectedSubcategory(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">All Subcategories</option>
                    {getSubcategories().map((sub: string, idx: number) => (
                      <option key={`${selectedCategory}-${sub}-${idx}`} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                        </div>
              )}

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                      </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
              </div>
            </div>
          </div>
          
            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
              </button>
                {(searchQuery ||
                  listingTypeFilter !== 'all' ||
                  selectedCategory ||
                  selectedSubcategory ||
                  minPrice ||
                  maxPrice ||
                  location) && (
                  <span className="text-sm text-gray-500">
                    {services.length} listing{services.length !== 1 ? 's' : ''} found
                        </span>
                        )}
                      </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                    <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                  <List className="w-5 h-5" />
                    </button>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    fetchServices(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
                  </div>
                </div>
          </form>
        </div>

        {/* Services Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-7">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-3xl min-h-[22rem] animate-pulse" />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-7'
                : 'space-y-4'
            }
          >
            {services.map((service) => (
              <ServiceCard
                key={`${service.catalogSource || 'provider'}-${service.id}`}
                service={service}
                onViewDetails={handleViewDetails}
                onBookService={handleBookService}
                variant={viewMode === 'list' ? 'detailed' : 'default'}
                layoutDensity={viewMode === 'grid' ? 'spacious' : 'default'}
                enableInlineBooking={false}
                enableExpandableDetails={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Services Found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => fetchServices(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchServices(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default ServicesPage;
