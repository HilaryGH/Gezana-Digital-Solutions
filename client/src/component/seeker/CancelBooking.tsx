import { useState } from "react";

const CancelBooking = () => {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      service: "Bathroom Cleaning",
      date: "2025-06-28",
      time: "10:00 AM",
      status: "Confirmed",
      cancellable: true,
    },
    {
      id: 2,
      service: "AC Repair",
      date: "2025-06-30",
      time: "2:00 PM",
      status: "Completed",
      cancellable: false,
    },
  ]);

  const handleCancel = (id: number) => {
    const confirm = window.confirm(
      "Are you sure you want to cancel this booking?"
    );
    if (confirm) {
      setBookings(bookings.filter((booking) => booking.id !== id));
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-orange mb-6 text-center">
          My Bookings
        </h2>

        {bookings.length === 0 ? (
          <p className="text-center text-gray-600">
            You have no active bookings.
          </p>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-200 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center"
              >
                <div className="mb-2 md:mb-0">
                  <h4 className="font-semibold">{booking.service}</h4>
                  <p className="text-sm text-gray-600">
                    {booking.date} at {booking.time}
                  </p>
                  <span
                    className={`text-xs font-semibold ${
                      booking.status === "Completed"
                        ? "text-green-600"
                        : booking.status === "Confirmed"
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                {booking.cancellable ? (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Cancel
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">Not cancellable</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CancelBooking;
