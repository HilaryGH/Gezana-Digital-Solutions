import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Eye,
  MousePointerClick,
  Share2,
  Mail,
  MessageSquare,
  Target,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  RefreshCw,
  Image
} from "lucide-react";
import { getAllBookings, type BookingWithDetails } from "../../api/bookings";
import axios from "../../api/axios";

interface MarketingStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  conversionRate: number;
  averageBookingValue: number;
  bookingsThisMonth: number;
  bookingsLastMonth: number;
  growthRate: number;
  activeProviders: number;
  totalServices: number;
}

interface CategoryPerformance {
  category: string;
  bookings: number;
  revenue: number;
}

const MarketingDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MarketingStats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    conversionRate: 0,
    averageBookingValue: 0,
    bookingsThisMonth: 0,
    bookingsLastMonth: 0,
    growthRate: 0,
    activeProviders: 0,
    totalServices: 0,
  });
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
  const [userName, setUserName] = useState("Marketing Team");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        if (userData) {
          try {
            const user = JSON.parse(userData);
            setUserName(user.name || "Marketing Team");
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }

        // Fetch all bookings
        const bookingsData = await getAllBookings();
        setBookings(bookingsData);

        // Calculate revenue
        const totalRevenue = bookingsData
          .filter(b => b.status === "completed" || b.status === "confirmed")
          .reduce((sum, b) => sum + (b.service?.price || 0), 0);

        // Calculate monthly bookings
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const bookingsThisMonth = bookingsData.filter(
          b => new Date(b.createdAt) >= thisMonth
        ).length;

        const bookingsLastMonth = bookingsData.filter(
          b => new Date(b.createdAt) >= lastMonth && new Date(b.createdAt) <= lastMonthEnd
        ).length;

        const growthRate = bookingsLastMonth > 0
          ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100
          : bookingsThisMonth > 0 ? 100 : 0;

        // Calculate category performance
        const categoryMap = new Map<string, { bookings: number; revenue: number }>();
        bookingsData.forEach(booking => {
          const categoryName = typeof booking.category === 'string' 
            ? booking.category 
            : booking.category?.name || 'Unknown';
          
          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, { bookings: 0, revenue: 0 });
          }
          const cat = categoryMap.get(categoryName)!;
          cat.bookings++;
          if (booking.status === "completed" || booking.status === "confirmed") {
            cat.revenue += booking.service?.price || 0;
          }
        });

        const categoryPerf = Array.from(categoryMap.entries()).map(([category, data]) => ({
          category,
          bookings: data.bookings,
          revenue: data.revenue,
        })).sort((a, b) => b.revenue - a.revenue);

        setCategoryPerformance(categoryPerf);

        // Fetch user and service counts
        let totalUsers = 0;
        let activeProviders = 0;
        let totalServices = 0;

        try {
          const usersResponse = await axios.get("/user/all", {
            headers: { Authorization: `Bearer ${token}` }
          });
          totalUsers = usersResponse.data.length || 0;
          activeProviders = usersResponse.data.filter((u: any) => u.role === "provider").length || 0;
        } catch (e) {
          console.log("User count endpoint not available");
        }

        try {
          const servicesResponse = await axios.get("/services", {
            headers: { Authorization: `Bearer ${token}` }
          });
          totalServices = servicesResponse.data.length || servicesResponse.data.services?.length || 0;
        } catch (e) {
          console.log("Services endpoint not available");
        }

        const averageBookingValue = bookingsData.length > 0
          ? totalRevenue / bookingsData.filter(b => b.status === "completed" || b.status === "confirmed").length
          : 0;

        const conversionRate = totalUsers > 0
          ? (bookingsData.length / totalUsers) * 100
          : 0;

        setStats({
          totalUsers,
          totalBookings: bookingsData.length,
          totalRevenue,
          conversionRate,
          averageBookingValue,
          bookingsThisMonth,
          bookingsLastMonth,
          growthRate,
          activeProviders,
          totalServices,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return `${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)} ETB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {userName.substring(0, 2).toUpperCase() || "MK"}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Marketing Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {userName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export Report</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                stats.growthRate > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {stats.growthRate > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(stats.growthRate).toFixed(1)}%
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                stats.growthRate > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {stats.growthRate > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(stats.growthRate).toFixed(1)}%
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.bookingsThisMonth} this month</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-gray-500 mt-1">Avg: {formatCurrency(stats.averageBookingValue)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">User to booking</p>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Providers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProviders}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                <p className={`text-2xl font-bold ${
                  stats.growthRate > 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {stats.growthRate > 0 ? "+" : ""}{stats.growthRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Category Performance</h2>
                <p className="text-gray-600 mt-1">Top performing service categories</p>
              </div>
              <PieChart className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg p-4 animate-pulse h-16"></div>
                ))}
              </div>
            ) : categoryPerformance.length > 0 ? (
              <div className="space-y-4">
                {categoryPerformance.slice(0, 10).map((cat, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{cat.category}</h3>
                          <p className="text-sm text-gray-600">{cat.bookings} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">{formatCurrency(cat.revenue)}</p>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                        style={{
                          width: `${(cat.revenue / categoryPerformance[0].revenue) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No category data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Marketing Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Marketing Tools</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Email Campaigns</span>
                </div>
                <ArrowUp className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">SMS Marketing</span>
                </div>
                <ArrowUp className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Share2 className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Social Media</span>
                </div>
                <ArrowUp className="w-4 h-4 text-gray-400" />
              </button>
              <button 
                onClick={() => navigate("/admin/promotional-banners")}
                className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Image className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-gray-900">Promotional Banners</span>
                </div>
                <ArrowUp className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Best Performing Category</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {categoryPerformance[0]?.category || "N/A"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {formatCurrency(categoryPerformance[0]?.revenue || 0)} revenue
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Booking Value</span>
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(stats.averageBookingValue)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Per completed booking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg border border-purple-200 p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Marketing Performance Summary</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5" />
                <p className="text-purple-100 text-sm">Total Users</p>
              </div>
              <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5" />
                <p className="text-purple-100 text-sm">Total Bookings</p>
              </div>
              <p className="text-3xl font-bold">{stats.totalBookings.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5" />
                <p className="text-purple-100 text-sm">Total Revenue</p>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5" />
                <p className="text-purple-100 text-sm">Conversion</p>
              </div>
              <p className="text-3xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;











