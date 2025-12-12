import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import moment from "moment";

const formatInputDate = (value) => {
  if (!value) return "";
  const m = moment(value);
  return m.isValid() ? m.format("YYYY-MM-DD") : "";
};

function CardDatesPicker({ dates, anchorEl, onClose, onUpdateDates }) {
  const [isTotalFocused, setIsTotalFocused] = useState(false);
  const [totalDateValue, setTotalDateValue] = useState("");

  const popoverId = anchorEl ? "card-dates-popover" : undefined;

  const normalizedDates = useMemo(
    () => ({
      startDate: dates?.startDate || null,
      endDate: dates?.endDate || null,
      totalDate:
        dates?.totalDate === 0 ? 0 : dates?.totalDate ? dates.totalDate : "",
    }),
    [dates]
  );

  useEffect(() => {
    setTotalDateValue(
      normalizedDates.totalDate === null ? "" : normalizedDates.totalDate
    );
  }, [normalizedDates.totalDate]);

  const handleDateChange = (fieldName) => (event) => {
    const rawValue = event.target.value;
    const timestamp = rawValue ? new Date(rawValue).getTime() : null;
    onUpdateDates?.({ [fieldName]: timestamp });
  };

  const handleSaveTotalDate = () => {
    const numericValue =
      totalDateValue === "" || totalDateValue === null
        ? null
        : Number(totalDateValue);
    if (Number.isNaN(numericValue)) return;
    onUpdateDates?.({ totalDate: numericValue });
    setIsTotalFocused(false);
  };

  return (
    <Popover
      id={popoverId}
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={() => {
        setIsTotalFocused(false);
        onClose?.();
      }}
      anchorOrigin={{ vertical: "center", horizontal: "left" }}
      transformOrigin={{ vertical: "center", horizontal: "right" }}
    >
      <Box sx={{ p: 2, width: 340 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WatchLaterOutlinedIcon fontSize="small" />
            <Typography sx={{ fontWeight: 700 }}>Dates</Typography>
          </Box>
          <TextField
            label="Start date"
            type="date"
            value={formatInputDate(normalizedDates.startDate)}
            onChange={handleDateChange("startDate")}
            size="small"
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="End date"
            type="date"
            value={formatInputDate(normalizedDates.endDate)}
            onChange={handleDateChange("endDate")}
            size="small"
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Total date"
            type="number"
            value={totalDateValue}
            onChange={(e) => setTotalDateValue(e.target.value)}
            onFocus={() => setIsTotalFocused(true)}
            onBlur={() => setIsTotalFocused(false)}
            size="small"
            fullWidth
            InputProps={{
              endAdornment: isTotalFocused ? (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    size="small"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleSaveTotalDate}
                  >
                    <SaveOutlinedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Stack>
      </Box>
    </Popover>
  );
}

export default CardDatesPicker;
