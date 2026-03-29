import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from "@mui/material";
import PriceValue from "../PriceValue/PriceValue";

export type ConfirmationPageAccordianItem = {
  label: string;
  value: string;
  isTotal?: boolean;
  isPrice?: boolean;
};

type ConfirmationPageAccordianProps = {
  title: string;
  items: ConfirmationPageAccordianItem[];
  defaultExpanded?: boolean;
  showTopBorder?: boolean;
};

const ConfirmationPageAccordian = ({
  title,
  items,
  defaultExpanded = false,
  showTopBorder = false,
}: ConfirmationPageAccordianProps) => {
  return (
    <Accordion
      disableGutters
      defaultExpanded={defaultExpanded}
      elevation={0}
      sx={{
        borderTop: showTopBorder ? "1px solid #c1c2c2" : "none",
        borderBottom: "1px solid #c1c2c2",
        borderRadius: 0,
        "&::before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandLessIcon sx={{ color: "#2f2f2f", fontSize: 22 }} />}
        sx={{
          flexDirection: "row-reverse",          
          minHeight: "unset",
          px: 0,
          py: 1.5,
          "& .MuiAccordionSummary-content": {
            my: 0,
            alignItems: "center",
            gap: 1,
          },
          "& .MuiAccordionSummary-expandIconWrapper": {
            marginRight: 1,
            marginLeft: 0,
            transform: "rotate(180deg)",
          },
          "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
            transform: "rotate(0deg)",
          },
        }}
      >
        <Typography sx={{ fontSize: "18px", fontWeight: 600, color: "#2f2f2f" }}>{title}</Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 0, pt: 0, pb: 2.85 }}>
        <Stack spacing={1.2} sx={{ pl: 4 }}>
          {items.map((item) =>
            item.label === "__spacer__" ? (
              <Box key={`spacer-${title}-${item.value}`} sx={{ height: item.value ? Number(item.value) : 18 }} />
            ) : (
              <Box
                key={`${title}-${item.label}-${item.value}-${item.isTotal ? "total" : "normal"}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    color: "#5d5d5d",
                    lineHeight: 1.35,
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "16px",
                    color: "#2f2f2f",
                    whiteSpace: "nowrap",
                    lineHeight: 1.35,
  }}
                >
                  {item.isPrice ? <PriceValue value={item.value} /> : item.value}
                </Typography>
              </Box>
            )
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default ConfirmationPageAccordian;
