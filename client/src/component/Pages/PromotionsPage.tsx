import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPromotionalBanners, type PromotionalBanner } from "../../api/promotionalBanners";

const PromotionsPage = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getPromotionalBanners();
        if (!cancelled) setBanners(data);
      } catch {
        if (!cancelled) setBanners([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-blue-50/40 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <header className="mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Promotions <span className="text-orange-600">& events</span>
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-xl mx-auto sm:mx-0">
            Limited-time promotions and seasonal discounts from Homehub.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : banners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {banners.map((banner) => {
              const gradientClasses =
                banner.backgroundColor || "from-blue-500 via-blue-600 to-blue-700";
              const textColorClass = banner.textColor || "text-white";
              return (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => navigate(banner.buttonLink || "/services")}
                  className="relative w-full overflow-hidden rounded-2xl shadow-md border border-white/20 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses}`} />
                  <div className={`relative p-4 sm:p-5 ${textColorClass}`}>
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className="w-9 h-9 shrink-0 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-lg leading-none">{banner.icon || "✨"}</span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold leading-snug line-clamp-2 pt-0.5">
                        {banner.title}
                      </h2>
                    </div>
                    {banner.subtitle && (
                      <p className={`text-xs sm:text-sm mb-2 line-clamp-2 opacity-90`}>
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.description && (
                      <p className={`text-xs mb-3 line-clamp-3 opacity-75`}>{banner.description}</p>
                    )}
                    <span className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold">
                      {banner.buttonText || "Learn more"} →
                    </span>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8 pointer-events-none" />
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center sm:text-left py-8">
            No promotional offers are live right now. Check back soon.
          </p>
        )}
      </div>
    </div>
  );
};

export default PromotionsPage;
