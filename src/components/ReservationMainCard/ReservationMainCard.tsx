import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { Box, Stack, Typography } from "@mui/material";
import { format } from "date-fns";
import fallbackRoomImage from "../../assets/download (2).jpeg";
import type { GuestTypeItem } from "../../types/bookingConfirmation";

type ReservationMainCardProps = {
  roomName: string;
  guestTypes: GuestTypeItem[];
  imageUrl?: string;
  checkIn: string;
  checkOut: string;
  cancellationPolicy: string;
  totalAmount: number;
  currency: string;
};

const formatGuestSummary = (guestTypes: GuestTypeItem[]): string =>
  guestTypes
    .map(({ guestType, count }) => {
      const label = guestType.charAt(0) + guestType.slice(1).toLowerCase();
      return `${count} ${label}${count === 1 ? "" : "s"}`;
    })
    .join(", ");

const formatMonthYear = (value: string) => format(new Date(value), "MMMM yyyy");

const formatDay = (value: string) => format(new Date(value), "d");

const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

const getPriceParts = (amount: number, currency: string) => {
  const formattedPrice = formatPrice(amount, currency);
  const pricePattern = /^([^\d-]*)(-?[\d,]+)(\.\d+)?$/;
  const match = pricePattern.exec(formattedPrice);

  if (!match) {
    return {
      prefix: "",
      whole: formattedPrice,
      decimal: "",
    };
  }

  return {
    prefix: match[1] || "",
    whole: match[2],
    decimal: match[3] || "",
  };
};

const StayInfoCard = ({ label, value }: { label: string; value: string }) => {
  return (
    <Box
      sx={{
        width: { xs: 96, sm: 105 },
        minWidth: { xs: 96, sm: 105 },
        height: { xs: 96, sm: 106 },
        border: "1px solid #a8a8a8",
        borderRadius: "4px",
        px: { xs: 1, sm: 1.5 },
        py: { xs: 1, sm: 1.25 },
        textAlign: "center",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography sx={{ fontSize: { xs: "12px", sm: "14px" }, color: "#8a8a8a", mb: { xs: 0.5, sm: 0.75 } }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: "14px", sm: "16px" },
          lineHeight: 1,
          fontWeight: 700,
          color: "#2f2f2f",
          mb: { xs: 0.5, sm: 0.75 },
        }}
      >
        {formatDay(value)}
      </Typography>
      <Typography sx={{ fontSize: { xs: "14px", sm: "16px" }, color: "#2f2f2f" }}>
        {formatMonthYear(value)}
      </Typography>
    </Box>
  );
};

const ReservationMainCard = ({
  roomName,
  guestTypes,
  imageUrl,
  checkIn,
  checkOut,
  cancellationPolicy,
  totalAmount,
  currency,
}: ReservationMainCardProps) => {
  const roomImage = imageUrl || fallbackRoomImage;
  const priceParts = getPriceParts(totalAmount, currency);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
        <Typography sx={{ fontSize: "24px", fontWeight: 600, color: "#2f2f2f", lineHeight: 1.2 }}>
          {roomName}
        </Typography>

        <Stack direction="row" spacing={0.75} alignItems="center">
          <PersonOutlineOutlinedIcon sx={{ fontSize: 18, color: "#8a8a8a" }} />
          <Typography sx={{ fontSize: "14px", color: "#6f6f6f" }}>
            {formatGuestSummary(guestTypes)}
          </Typography>
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
        <Box
          component="img"
          src={roomImage}
          alt={roomName}
          sx={{
            width: { xs: "100%", md: 442 },
            minWidth: { md: 442 },
            height: { xs: 240, md: 234 },
            objectFit: "cover",
            flexShrink: 0,
          }}
        />

        <Stack sx={{ flex: 1, minWidth: 0, pt: { md: 1 } }} spacing={3} justifyContent="space-between">
          <Stack
            direction="row"
            spacing={{ xs: 1.5, sm: 2 }}
            sx={{ width: "fit-content", maxWidth: "100%", justifyContent: "flex-start" }}
          >
            <StayInfoCard label="Check in" value={checkIn} />
            <StayInfoCard label="Check Out" value={checkOut} />
          </Stack>

          <Stack spacing={3} sx={{ minHeight: { md: 150 } }}>
            <Typography sx={{ fontSize: "16px", lineHeight: 1.4, color: "#5d5d5d", maxWidth: 430 }}>
              Your booking has been confirmed. We're excited to host you. Wishing you a comfortable and enjoyable stay.
            </Typography>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-end", md: "flex-end" }}
              sx={{ pb: { xs: 1, md: 0 } }}
            >
              <Typography sx={{ fontSize: "16px", fontStyle: "italic", color: "#5d5d5d", maxWidth: 320 }}>
                {cancellationPolicy}
              </Typography>

              <Typography
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: 0.25,
                  color: "#2f2f2f",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                }}
              >
                <Box component="span" sx={{ fontSize: "20px", fontWeight: 500, lineHeight: 1 }}>
                  {priceParts.prefix}
                  {priceParts.whole}
                </Box>
                {priceParts.decimal && (
                  <Box component="span" sx={{ fontSize: "15px",fontWeight:500, lineHeight: 1 }}>
                    {priceParts.decimal}
                  </Box>
                )}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>

    </Stack>
  );
};

export default ReservationMainCard;
