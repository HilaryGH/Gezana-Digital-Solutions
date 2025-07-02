import BookServiceWithPayment from "./BookServiceWithPayment";

const ServiceSeekerDashboard = () => {
  return (
    <>
      <section className="mt-12 text-orange-700 text-base sm:text-lg max-w-3xl mx-auto text-center">
        <p>
          Welcome to your dashboard! Here you can book services, check your
          bookings, and manage your profile.
        </p>
      </section>
      <main className="min-h-screen bg-gray-50 px-4 py-10 md:py-16 md:px-12">
        <div className="max-w-7xl mx-auto">
          <section className="max-w-4xl mx-auto">
            <BookServiceWithPayment />
          </section>
        </div>
      </main>
    </>
  );
};

export default ServiceSeekerDashboard;
