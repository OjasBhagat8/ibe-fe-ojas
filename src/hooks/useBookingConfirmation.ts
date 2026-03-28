import { useEffect, useState } from "react";
import { apolloClient } from "../lib/apolloClient";
import { GET_BOOKING_CONFIRMATION } from "../features/confirmation/confirmationQueries";
import type { BookingConfirmationData, GetBookingConfirmationResponse } from "../types/bookingConfirmation";

type UseBookingConfirmationResult = {
  data: BookingConfirmationData | null;
  loading: boolean;
  error: string | null;
};

export const useBookingConfirmation = (confirmationToken: string | undefined): UseBookingConfirmationResult => {
  const [data, setData] = useState<BookingConfirmationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingConfirmation = async () => {
      if (!confirmationToken) {
        setError("No confirmation token provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apolloClient.query<GetBookingConfirmationResponse>({
          query: GET_BOOKING_CONFIRMATION,
          variables: { confirmationToken },
        });

        if (response.data?.getBookingConfirmation) {
          setData(response.data.getBookingConfirmation);
        } else {
          setError("No booking confirmation found");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch confirmation details";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingConfirmation();
  }, [confirmationToken]);

  return { data, loading, error };
};