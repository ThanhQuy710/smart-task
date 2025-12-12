import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import CircularProgress from "@mui/material/CircularProgress";
import PaletteIcon from "@mui/icons-material/Palette";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisuallyHiddenInput from "~/components/Form/VisuallyHiddenInput";
import {
  BOARD_TEMPLATE_TYPES,
  DEFAULT_BOARD_TEMPLATE,
} from "~/utils/boardTemplates";

const OptionTile = ({ value, type, isSelected, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      position: "relative",
      height: 110,
      borderRadius: "14px",
      overflow: "hidden",
      cursor: "pointer",
      border: isSelected
        ? "2px solid rgba(255,255,255,0.9)"
        : "1px solid rgba(255,255,255,0.2)",
      boxShadow: isSelected
        ? "0 12px 30px rgba(0,0,0,0.28)"
        : "0 4px 16px rgba(0,0,0,0.16)",
      transition: "all 150ms ease",
      backgroundColor:
        type === BOARD_TEMPLATE_TYPES.COLOR ? value : "rgba(0,0,0,0.08)",
      backgroundImage:
        type !== BOARD_TEMPLATE_TYPES.COLOR ? `url(${value})` : "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
      "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        background:
          type === BOARD_TEMPLATE_TYPES.COLOR
            ? "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.12))"
            : "linear-gradient(160deg, rgba(0,0,0,0.25), rgba(0,0,0,0.05))",
        pointerEvents: "none",
      },
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 12px 26px rgba(0,0,0,0.22)",
      },
    }}
  >
    {isSelected && (
      <CheckCircleIcon
        fontSize="small"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          color: "#66d9ff",
          filter: "drop-shadow(0 0 4px rgba(0,0,0,0.45))",
        }}
      />
    )}
  </Box>
);

const UploadTile = ({ onUpload, uploading }) => {
  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onUpload?.(file);
    event.target.value = null;
  };

  return (
    <Box
      component="label"
      sx={(theme) => ({
        height: 110,
        borderRadius: "14px",
        border: `1px dashed ${theme.palette.divider}`,
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.text.secondary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        gap: 1,
        transition: "all 120ms ease",
        "&:hover": {
          backgroundColor: theme.palette.action.selected,
          color: theme.palette.text.primary,
        },
      })}
    >
      {uploading ? (
        <CircularProgress size={22} />
      ) : (
        <>
          <AddIcon fontSize="medium" />
          <Typography variant="body2" fontWeight={600}>
            Thêm
          </Typography>
        </>
      )}
      <VisuallyHiddenInput type="file" onChange={handleChange} />
    </Box>
  );
};

const OptionCard = ({ icon, title, description, onClick }) => (
  <Box
    onClick={onClick}
    sx={(theme) => ({
      flex: 1,
      p: 2,
      borderRadius: "12px",
      border: `1px solid ${theme.palette.divider}`,
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      cursor: "pointer",
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.04)"
          : "rgba(0,0,0,0.02)",
      transition: "all 150ms ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: theme.shadows[4],
      },
    })}
  >
    <Box
      sx={(theme) => ({
        width: 40,
        height: 40,
        borderRadius: "12px",
        display: "grid",
        placeItems: "center",
        background: theme.palette.primary.main,
        color: "#fff",
        flexShrink: 0,
      })}
    >
      {icon}
    </Box>
    <Box>
      <Typography fontWeight={700}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  </Box>
);

function BackgroundTemplatePicker({
  anchorEl,
  onClose,
  template,
  backgrounds = [],
  defaultImages = [],
  defaultColors = [],
  onSelectTemplate,
  onUploadBackground,
  uploading,
}) {
  const open = Boolean(anchorEl);
  const popoverId = open ? "board-template-picker" : undefined;
  const [tab, setTab] = useState(null);

  const activeTemplate = useMemo(
    () => (template?.type ? template : DEFAULT_BOARD_TEMPLATE),
    [template]
  );

  const isSelected = (type, value) => {
    if (!activeTemplate) return false;
    return activeTemplate.type === type && activeTemplate.value === value;
  };

  const handleSelect = (type, value) => {
    onSelectTemplate?.({ type, value });
  };

  useEffect(() => {
    if (open) setTab(null);
  }, [open]);

  return (
    <Popover
      id={popoverId}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
    >
      <Box
        sx={(theme) => ({
          width: 440,
          p: 2.4,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.14))"
              : "linear-gradient(140deg, #f7fbff, #e9f1ff)",
          borderRadius: "16px",
          boxShadow: "0 22px 70px rgba(0,0,0,0.24)",
          border: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <Typography fontWeight={800}>Tùy chỉnh nền board</Typography>
          {tab && (
            <Button
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => setTab(null)}
            >
              Quay lại
            </Button>
          )}
        </Stack>

        {!tab && (
          <Stack direction="row" spacing={1.4} sx={{ mb: 2 }}>
            <OptionCard
              icon={<PaletteIcon fontSize="small" />}
              title="Màu"
              description="Chọn màu đơn sắc để giữ mọi thứ tối giản"
              onClick={() => setTab(BOARD_TEMPLATE_TYPES.COLOR)}
            />
            <OptionCard
              icon={<PhotoLibraryIcon fontSize="small" />}
              title="Hình ảnh"
              description="Chọn hình từ thư viện được tuyển sẵn"
              onClick={() => setTab(BOARD_TEMPLATE_TYPES.IMAGE)}
            />
          </Stack>
        )}

        {tab === BOARD_TEMPLATE_TYPES.IMAGE && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 1.2,
              mb: 1.5,
            }}
          >
            {defaultImages.map((url) => (
              <OptionTile
                key={url}
                value={url}
                type={BOARD_TEMPLATE_TYPES.IMAGE}
                isSelected={isSelected(BOARD_TEMPLATE_TYPES.IMAGE, url)}
                onClick={() => handleSelect(BOARD_TEMPLATE_TYPES.IMAGE, url)}
              />
            ))}
          </Box>
        )}

        {tab === BOARD_TEMPLATE_TYPES.COLOR && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
              gap: 1,
              mb: 1.5,
            }}
          >
            {defaultColors.map((color) => (
              <OptionTile
                key={color}
                value={color}
                type={BOARD_TEMPLATE_TYPES.COLOR}
                isSelected={isSelected(BOARD_TEMPLATE_TYPES.COLOR, color)}
                onClick={() => handleSelect(BOARD_TEMPLATE_TYPES.COLOR, color)}
              />
            ))}
          </Box>
        )}

        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Hình đã tải lên
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 1.2,
            }}
          >
            {backgrounds.map((bg) => (
              <OptionTile
                key={bg.id}
                value={bg.imageUrl}
                type={BOARD_TEMPLATE_TYPES.CUSTOM}
                isSelected={isSelected(
                  BOARD_TEMPLATE_TYPES.CUSTOM,
                  bg.imageUrl
                )}
                onClick={() =>
                  handleSelect(BOARD_TEMPLATE_TYPES.CUSTOM, bg.imageUrl)
                }
              />
            ))}
            <UploadTile onUpload={onUploadBackground} uploading={uploading} />
          </Box>
        </Box>
      </Box>
    </Popover>
  );
}

export default BackgroundTemplatePicker;
