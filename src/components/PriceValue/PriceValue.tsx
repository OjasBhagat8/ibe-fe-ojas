import { Box } from "@mui/material";

type PriceValueProps = {
  value: string;
  majorFontSize?: string;
  minorFontSize?: string;
  color?: string;
  fontWeight?: number;
};

const pricePattern = /^([^\d-]*)(-?[\d,]+)(\.\d+)?$/;

const PriceValue = ({
  value,
  majorFontSize = "20px",
  minorFontSize = "15px",
  color = "#2f2f2f",
  fontWeight = 500,
}: PriceValueProps) => {
  const match = pricePattern.exec(value.trim());

  if (!match) {
    return (
      <Box component="span" sx={{ fontSize: "16px", color, lineHeight: 1.35, whiteSpace: "nowrap" }}>
        {value}
      </Box>
    );
  }

  const prefix = match[1] || "";
  const whole = match[2];
  const decimal = match[3] || "";

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 0.25,
        color,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <Box component="span" sx={{ fontSize: majorFontSize, fontWeight, lineHeight: 1 }}>
        {prefix}
        {whole}
      </Box>
      {decimal && (
        <Box component="span" sx={{ fontSize: minorFontSize, fontWeight,lineHeight: 1 }}>
          {decimal}
        </Box>
      )}
    </Box>
  );
};

export default PriceValue;
