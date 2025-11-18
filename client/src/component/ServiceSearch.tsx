import React, { useState, useEffect } from 'react';
import { Search, Grid, List, MapPin, DollarSign } from 'lucide-react';
import { getServices, searchServices, type Service, type ServiceSearchParams } from '../api/services';
import ServiceCard from './ServiceCard';

interface ServiceSearchProps {
  onServiceSelect?: (service: Service) => void;
  category?: string;
  subcategory?: string;
  showFilters?: boolean;
  layout?: 'grid' | 'list';
  initialQuery?: string;
}

const ServiceSearch: React.FC<ServiceSearchProps> = ({
  onServiceSelect,
  category,
  subcategory,
  showFilters = true,
  layout = 'grid',
  initialQuery = ''
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<ServiceSearchParams>({
    category,
    subcategory,
    minPrice: undefined,
    maxPrice: undefined,
    location: '',
    page: 1,
    limit: 12
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(layout);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest'>('relevance');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  });

  // Fetch services
  const fetchServices = async (searchParams?: ServiceSearchParams) => {
    setLoading(true);
    try {
      const params = { ...filters, ...searchParams };
      console.log('Fetching services with params:', params);
      const response = await getServices(params);
      console.log('Services fetched successfully:', response);
      setServices(response.services || []);
      setPagination({
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 0
      });
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
      setPagination({
        total: 0,
        page: 1,
        totalPages: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Search services
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const response = await searchServices(query, filters);
        setServices(response.services || []);
        setPagination({
          total: response.total || 0,
          page: 1,
          totalPages: Math.ceil((response.total || 0) / (filters.limit || 12))
        });
      } catch (error) {
        console.error('Error searching services:', error);
        setServices([]);
        setPagination({
          total: 0,
          page: 1,
          totalPages: 0
        });
      }
    } else {
      fetchServices();
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ServiceSearchParams>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchServices(updatedFilters);
  };

  // Handle sort change
  const handleSortChange = (sort: typeof sortBy) => {
    setSortBy(sort);
    // Apply sorting logic here
    const sortedServices = [...services].sort((a, b) => {
      switch (sort) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return b.providerRating - a.providerRating;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
    setServices(sortedServices);
  };

  // Load services on component mount
  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      if (!isMounted) return;
      await fetchServices();
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update filters when category/subcategory props change
  useEffect(() => {
    if (category || subcategory) {
      handleFilterChange({ category, subcategory });
    }
  }, [category, subcategory]);

  // Handle initial query from URL parameters
  useEffect(() => {
    if (initialQuery && initialQuery !== searchQuery) {
      setSearchQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for services..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange({ location: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <DollarSign size={16} className="text-gray-500" />
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>
            </div>
          )}

          {/* View Controls */}
          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {loading ? 'Loading...' : `${pagination.total} services found`}
        </p>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              fetchServices();
            }}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Services Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (services && services.length > 0) ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'space-y-4'
        }>
          {(services || []).map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              variant={viewMode === 'list' ? 'detailed' : 'default'}
              onViewDetails={onServiceSelect}
              // onBookService is optional - ServiceCard will show booking modal if not provided
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? `No services match "${searchQuery}". Try adjusting your search terms.`
              : 'No services available in this category.'
            }
          </p>
          <div className="mt-4 text-sm text-gray-400">
            <p>Debug info: {services.length} services loaded</p>
            <p>Total available: {pagination.total}</p>
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                fetchServices();
              }}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              View All Services
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handleFilterChange({ page: pagination.page - 1 })}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => handleFilterChange({ page })}
                  className={`px-3 py-2 rounded-lg ${
                    pagination.page === page
                      ? 'bg-orange-500 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleFilterChange({ page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceSearch;
