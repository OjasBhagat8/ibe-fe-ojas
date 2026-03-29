import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import styles from "./MyBookings.module.scss";

type MyBooking = {
  bookingId: string;
  confirmationToken: string;
  status: string;
  createdAt: string | null;
  propertyId: string | null;
  propertyName: string | null;
  roomTypeId: string | null;
  roomTypeName: string | null;
  roomImage: string | null;
  checkIn: string | null;
  checkOut: string | null;
  rooms: number | null;
  guestCount: number | null;
  dueNow: number;
  dueAtResort: number;
  totalForStay: number;
};

const BOOKINGS_PER_PAGE = 5;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (value: string | null) => {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const normalizeApiBaseUrl = () => {
  const configured = (import.meta.env.VITE_API_BASE_URL?.trim() || import.meta.env.VITE_GRAPHQL_URL?.trim() || "");
  return configured.endsWith("/api/graphql") ? configured.slice(0, -"/api/graphql".length) : configured;
};

const MyBookings = () => {
  const auth = useAuth();
  const { tenantName } = useParams<{ tenantName: string }>();
  const isLoggedIn = auth.isAuthenticated;
  const userName =
    auth.user?.profile.name ??
    auth.user?.profile.given_name ??
    auth.user?.profile.preferred_username ??
    auth.user?.profile.email ??
    auth.user?.profile.sub;

  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalBookings = bookings.length;
  const totalPages = Math.max(1, Math.ceil(totalBookings / BOOKINGS_PER_PAGE));
  const startIndex = (currentPage - 1) * BOOKINGS_PER_PAGE;
  const endIndex = Math.min(startIndex + BOOKINGS_PER_PAGE, totalBookings);
  const visibleBookings = bookings.slice(startIndex, endIndex);

  useEffect(() => {
    if (!auth.isAuthenticated || !tenantName) {
      return;
    }

    const accessToken = auth.user?.id_token ?? auth.user?.access_token;
    const apiBaseUrl = normalizeApiBaseUrl();

    if (!accessToken || !apiBaseUrl) {
      setError("My bookings API is not configured.");
      return;
    }

    let cancelled = false;

    const loadBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/api/customer-accounts/bookings/${encodeURIComponent(tenantName)}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const result = (await response.json().catch(() => null)) as { message?: string } | MyBooking[] | null;
        if (!response.ok) {
          throw new Error((result as { message?: string } | null)?.message ?? "Failed to load bookings");
        }

        if (!cancelled) {
          setBookings(Array.isArray(result) ? result : []);
          setCurrentPage(1);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load bookings");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, auth.user?.access_token, auth.user?.id_token, tenantName]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (auth.isLoading) {
    return <div className={styles.state}>Checking your session...</div>;
  }

  if (!isLoggedIn) {
    return (
      <section className={styles.page}>
        <h1>My Bookings</h1>
        <p>Sign in to view and manage your bookings.</p>
        <button
          type="button"
          className={styles.button}
          onClick={() => void auth.signinRedirect()}
        >
          Sign in
        </button>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div>
        <h1>My Bookings</h1>
        <p className={styles.lead}>Signed in as {userName}.</p>
      </div>

      {loading ? <div className={styles.state}>Loading your bookings...</div> : null}
      {error ? <div className={styles.state}>{error}</div> : null}

      {!loading && !error && bookings.length === 0 ? (
        <div className={styles.state}>No bookings were found for your account.</div>
      ) : null}

      {!loading && !error && bookings.length > 0 ? (
        <div className={styles.list}>
          {visibleBookings.map((booking) => (
            <article key={booking.bookingId} className={styles.card}>
              <div className={styles.imageWrap}>
                {booking.roomImage ? (
                  <img
                    src={booking.roomImage}
                    alt={booking.roomTypeName || booking.propertyName || "Booked room"}
                    className={styles.image}
                  />
                ) : null}
              </div>

              <div className={styles.content}>
                <div className={styles.topRow}>
                  <div>
                    <h2 className={styles.title}>{booking.propertyName || "Booking"}</h2>
                    <div>{booking.roomTypeName || "Room details unavailable"}</div>
                    <div>Reservation #{booking.confirmationToken}</div>
                  </div>
                  <span className={styles.status}>{booking.status}</span>
                </div>

                <div className={styles.meta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Check-in</span>
                    <span className={styles.metaValue}>{formatDate(booking.checkIn)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Check-out</span>
                    <span className={styles.metaValue}>{formatDate(booking.checkOut)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Rooms</span>
                    <span className={styles.metaValue}>{booking.rooms ?? "N/A"}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Guests</span>
                    <span className={styles.metaValue}>{booking.guestCount ?? "N/A"}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Total</span>
                    <span className={styles.metaValue}>{formatCurrency(booking.totalForStay ?? 0)}</span>
                  </div>
                </div>

                <div className={styles.actions}>
                  <Link
                    to={`/${tenantName}/confirmation?confirmationToken=${encodeURIComponent(booking.confirmationToken)}`}
                    className={styles.linkButton}
                  >
                    View Booking
                  </Link>
                </div>
              </div>
            </article>
          ))}

          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Showing {startIndex + 1}-{endIndex} of {totalBookings} bookings
            </div>

            <div className={styles.paginationButtons}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default MyBookings;
