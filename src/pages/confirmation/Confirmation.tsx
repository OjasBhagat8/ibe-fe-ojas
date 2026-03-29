import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ConfirmationPageAccordian from "../../components/ConfirmationPageAccordian/ConfirmationPageAccordian";
import ReservationMainCard from "../../components/ReservationMainCard/ReservationMainCard";
import { useAppSelector } from "../../app/hooks";
import { useBookingConfirmation } from "../../hooks/useBookingConfirmation";

type CancelBookingResponse = {
  bookingId: string;
  confirmationToken: string;
  status: string;
  message: string;
  cancelledAt: string;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: { message?: string }[];
};

type OtpRequestResponse = {
  verificationId: string;
};

type OtpVerifyResponse = {
  verificationId: string;
};

const CANCEL_BOOKING_MUTATION = `
  mutation CancelBooking($input: CancelBookingInput!) {
    cancelBooking(input: $input) {
      bookingId
      confirmationToken
      status
      message
      cancelledAt
    }
  }
`;

const formatPrice = (amount: number, currency: string = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

const resolveGraphqlUrl = () =>
  import.meta.env.VITE_GRAPHQL_URL?.trim()
  || import.meta.env.VITE_API_BASE_URL?.trim()
  || "";

const isGraphqlEndpoint = (url: string) => /\/api\/graphql$/i.test(url);

const resolveGuestBookingApiUrl = (path: string) => {
  const configuredUrl = import.meta.env.VITE_BOOKING_API_URL?.trim() || resolveGraphqlUrl();
  if (!configuredUrl) {
    return "";
  }

  const trimmedPath = path.startsWith("/") ? path : `/${path}`;

  try {
    const parsed = new URL(configuredUrl, window.location.origin);
    const normalizedPath = parsed.pathname.replace(/\/api\/graphql$/i, "").replace(/\/$/, "");
    parsed.pathname = `${normalizedPath}/api/guest-bookings${trimmedPath}`;
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return configuredUrl.replace(/\/api\/graphql$/i, "").replace(/\/$/, "") + `/api/guest-bookings${trimmedPath}`;
  }
};

const Confirmation = () => {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const storedConfirmationToken = useAppSelector((state) => state.booking.confirmation?.confirmationToken);
  const confirmationToken = searchParams.get("confirmationToken") || storedConfirmationToken;
  const { data, loading, error } = useBookingConfirmation(confirmationToken);
  const [showGuestCancellation, setShowGuestCancellation] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestOtp, setGuestOtp] = useState("");
  const [guestVerificationId, setGuestVerificationId] = useState<string | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelResult, setCancelResult] = useState<CancelBookingResponse | null>(null);
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] = useState(false);

  const primaryGuest = useMemo(
    () => data?.guests.find((guest) => guest.isPrimary) || data?.guests[0] || null,
    [data]
  );
  const guestItems = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.guests.flatMap((guest, index) => {
      const guestName = `${guest.firstName} ${guest.lastName}`.trim() || "N/A";
      const items = [{ label: `Guest ${index + 1}`, value: guestName }];

      if (guest.isPrimary) {
        items.push(
          { label: "Email", value: guest.email || guest.maskedEmail || "N/A" },
          { label: "Phone", value: guest.phone || guest.maskedPhone || "N/A" }
        );
      }

      return items;
    });
  }, [data]);

  const authToken = auth.user?.id_token ?? auth.user?.access_token ?? "";
  const effectiveStatus = cancelResult?.status || data?.status || "";
  const fullName = primaryGuest ? `${primaryGuest.firstName} ${primaryGuest.lastName}`.trim() : "N/A";
  const streetAddress = data ? [data.billing.address1, data.billing.address2].filter(Boolean).join(", ") : "";
  const cityLine = data ? `${data.billing.city}, ${data.billing.state} ${data.billing.zip}` : "";
  const canCancel = Boolean(data && confirmationToken && effectiveStatus === "CONFIRMED");

  const clearCancellationFeedback = () => {
    setCancelError(null);
    setCancelResult(null);
  };

  const cancelBooking = async (verificationId?: string) => {
    const graphqlUrl = resolveGraphqlUrl();
    if (!graphqlUrl || !isGraphqlEndpoint(graphqlUrl) || !confirmationToken) {
      throw new Error("Cancellation endpoint is not configured");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (auth.isAuthenticated && authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(graphqlUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        operationName: "CancelBooking",
        query: CANCEL_BOOKING_MUTATION,
        variables: {
          input: {
            confirmationToken,
            verificationId: verificationId ?? null,
          },
        },
      }),
    });

    const result = (await response.json().catch(() => null)) as GraphqlResponse<{
      cancelBooking?: CancelBookingResponse;
    }> | null;

    if (!response.ok) {
      throw new Error(result?.errors?.[0]?.message ?? "Failed to cancel booking");
    }

    if (result?.errors?.length) {
      throw new Error(result.errors[0]?.message ?? "Failed to cancel booking");
    }

    const cancelledBooking = result?.data?.cancelBooking;
    if (!cancelledBooking) {
      throw new Error("Invalid backend response: missing cancellation details");
    }

    return cancelledBooking;
  };

  const handleDirectCancel = async () => {
    clearCancellationFeedback();
    setCancelLoading(true);

    try {
      const result = await cancelBooking();
      setCancelResult(result);
      setShowGuestCancellation(false);
    } catch (cancelErrorValue) {
      setCancelError(cancelErrorValue instanceof Error ? cancelErrorValue.message : "Failed to cancel booking");
    } finally {
      setCancelLoading(false);
      setShowCancelConfirmDialog(false);
    }
  };

  const handleRequestGuestOtp = async () => {
    clearCancellationFeedback();

    if (!confirmationToken) {
      setCancelError("Missing confirmation token");
      return;
    }

    if (!guestEmail.trim()) {
      setCancelError("Enter the booking email to receive an OTP.");
      return;
    }

    setRequestLoading(true);

    try {
      const endpoint = resolveGuestBookingApiUrl("/cancellation/otp/request");
      if (!endpoint) {
        throw new Error("Guest verification API is not configured");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmationToken,
          email: guestEmail.trim().toLowerCase(),
        }),
      });

      const result = (await response.json().catch(() => null)) as OtpRequestResponse & { message?: string };
      if (!response.ok || !result?.verificationId) {
        throw new Error(result?.message ?? "Failed to send email OTP");
      }

      setGuestVerificationId(result.verificationId);
      setGuestOtp("");
    } catch (requestError) {
      setCancelError(requestError instanceof Error ? requestError.message : "Failed to send email OTP");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleVerifyGuestOtpAndCancel = async () => {
    clearCancellationFeedback();

    if (!guestVerificationId) {
      setCancelError("Request an OTP first.");
      return;
    }

    if (!guestOtp.trim()) {
      setCancelError("Enter the email OTP.");
      return;
    }

    setVerifyLoading(true);

    try {
      const endpoint = resolveGuestBookingApiUrl("/otp/verify");
      if (!endpoint) {
        throw new Error("Guest verification API is not configured");
      }

      const verifyResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationId: guestVerificationId,
          channel: "EMAIL",
          otp: guestOtp.trim(),
        }),
      });

      const verifyResult = (await verifyResponse.json().catch(() => null)) as OtpVerifyResponse & { message?: string };
      if (!verifyResponse.ok || !verifyResult?.verificationId) {
        throw new Error(verifyResult?.message ?? "Failed to verify email OTP");
      }

      const result = await cancelBooking(guestVerificationId);
      setCancelResult(result);
      setShowGuestCancellation(false);
      setGuestOtp("");
      setGuestVerificationId(null);
    } catch (verifyErrorValue) {
      setCancelError(verifyErrorValue instanceof Error ? verifyErrorValue.message : "Failed to verify OTP");
    } finally {
      setVerifyLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          backgroundColor: "#fff",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ backgroundColor: "#fff", py: { xs: 1, md: 2 } }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: "1140px",
            mx: "auto",
            px: { xs: 2, md: 2.5 },
          }}
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || "Unable to load booking confirmation"}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#fff", py: { xs: 1, md: 2 } }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: "1140px",
          mx: "auto",
          px: { xs: 2, md: 2.5 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontSize: "24px",
                fontWeight: 600,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              Reservation #{data.reservationNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Status: {effectiveStatus}
            </Typography>
          </Box>

          {canCancel ? (
            auth.isAuthenticated ? (
              <Button
                variant="contained"
                color="error"
                onClick={() => setShowCancelConfirmDialog(true)}
                disabled={cancelLoading}
              >
                {cancelLoading ? "Cancelling..." : "Cancel Booking"}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  clearCancellationFeedback();
                  setShowGuestCancellation((current) => !current);
                }}
                disabled={requestLoading || verifyLoading || cancelLoading}
              >
                {showGuestCancellation ? "Hide Cancellation Form" : "Cancel Booking"}
              </Button>
            )
          ) : null}
        </Box>

        {cancelResult ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            {cancelResult.message}
          </Alert>
        ) : null}

        {cancelError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {cancelError}
          </Alert>
        ) : null}

        {!auth.isAuthenticated && showGuestCancellation && canCancel ? (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 3,
              mb: 3,
              backgroundColor: "transparent",
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              Verify Email To Cancel
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the booking email address, request the OTP, then verify it to cancel this reservation.
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Booking email"
                type="email"
                value={guestEmail}
                onChange={(event) => {
                  setGuestEmail(event.target.value);
                  setGuestVerificationId(null);
                  setGuestOtp("");
                }}
                fullWidth
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="outlined"
                  onClick={() => void handleRequestGuestOtp()}
                  disabled={requestLoading || verifyLoading || cancelLoading}
                  sx={{
                    minWidth: { xs: "100%", sm: 144 },
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {requestLoading ? "Sending OTP..." : guestVerificationId ? "Resend OTP" : "Send OTP"}
                </Button>

                <TextField
                  label="Email OTP"
                  value={guestOtp}
                  onChange={(event) => setGuestOtp(event.target.value)}
                  fullWidth
                />

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => void handleVerifyGuestOtpAndCancel()}
                  disabled={!guestVerificationId || requestLoading || verifyLoading || cancelLoading}
                >
                  {verifyLoading || cancelLoading ? "Processing..." : "Verify And Cancel"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        ) : null}

        <Dialog
          open={showCancelConfirmDialog}
          onClose={() => !cancelLoading && setShowCancelConfirmDialog(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Cancel booking</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to cancel this booking? A cancellation email will be sent after it is cancelled.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCancelConfirmDialog(false)} disabled={cancelLoading}>
              Keep Booking
            </Button>
            <Button color="error" variant="contained" onClick={() => void handleDirectCancel()} disabled={cancelLoading}>
              {cancelLoading ? "Cancelling..." : "Confirm Cancel"}
            </Button>
          </DialogActions>
        </Dialog>

        <Box
          sx={{
            minHeight: 560,
            border: "1px solid #c1c2c2",
            borderColor: "divider",
            borderRadius: "5px",
            backgroundColor: "common.white",
            p: { xs: 2, md: 3 },
          }}
        >
          <ReservationMainCard
            roomName={data.roomTypeName}
            guestTypes={data.guestTypes}
            imageUrl={data.roomImage}
            checkIn={data.checkIn}
            checkOut={data.checkOut}
            cancellationPolicy="Contact property for cancellation policy"
            totalAmount={data.totalForStay}
            currency="USD"
          />

          <ConfirmationPageAccordian
            title="Cost Summary"
            defaultExpanded
            showTopBorder
            items={[
              {
                label: "Subtotal",
                value: formatPrice(data.subtotal, "USD"),
                isPrice: true,
              },
              {
                label: "Taxes & Surcharges",
                value: formatPrice(data.taxesAndSurcharges, "USD"),
                isPrice: true,
              },
              {
                label: "Due at Resort",
                value: formatPrice(data.dueAtResort, "USD"),
                isPrice: true,
              },
              { label: "__spacer__", value: "2" },
              {
                label: "Total for Stay",
                value: formatPrice(data.totalForStay, "USD"),
                isPrice: true,
              },
            ]}
          />

          <ConfirmationPageAccordian
            title="Guest Information"
            items={guestItems}
          />

          <ConfirmationPageAccordian
            title="Billing Address"
            items={[
              { label: "Guest Name", value: fullName },
              { label: "Street Address", value: streetAddress },
              { label: "City / State / ZIP", value: cityLine },
              { label: "Country", value: data.billing.country },
            ]}
          />

          <ConfirmationPageAccordian
            title="Payment Information"
            items={[
              { label: "Payment Method", value: data.payment.paymentMethod },
              { label: "Card Number", value: data.payment.maskedCard || "N/A" },
              { label: "Cardholder Name", value: data.billing.nameOnBill },
            ]}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Confirmation;
