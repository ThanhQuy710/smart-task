import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisuallyHiddenInput from "~/components/Form/VisuallyHiddenInput";
import { formatBytes } from "~/utils/formatters";

function CardAttachmentPicker({
  anchorEl,
  onClose,
  onUpload,
  onRemove,
  attachments = [],
  uploadingAttachments = [],
}) {
  const open = Boolean(anchorEl);
  const popoverId = open ? "card-attachment-popover" : undefined;
  const items = [...uploadingAttachments, ...attachments];

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onUpload?.(file);
    event.target.value = null;
  };

  return (
    <Popover
      id={popoverId}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Box
        sx={{
          p: 2,
          width: 380,
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.08))"
              : "linear-gradient(135deg, #f7fbff, #edf3ff)",
          borderRadius: 2,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <Typography sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
            Tệp đính kèm
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<CloudUploadIcon />}
            component="label"
            sx={{ borderRadius: 999 }}
          >
            Tải lên
            <VisuallyHiddenInput type="file" onChange={handleFileChange} />
          </Button>
        </Stack>

        <Stack spacing={1.2}>
          {items.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Chưa có tệp đính kèm.
            </Typography>
          )}

          {items.map((item) => (
            <Box
              key={item._id}
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.1,
                borderRadius: "12px",
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[2],
                border: `1px solid ${theme.palette.divider}`,
                transition: "all 150ms ease",
                "&:hover": {
                  boxShadow: theme.shadows[4],
                  transform: "translateY(-1px)",
                },
              })}
            >
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="center"
                sx={{ minWidth: 0 }}
              >
                <Box
                  sx={(theme) => ({
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
                    backgroundColor: theme.palette.action.hover,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  })}
                >
                  <InsertDriveFileOutlinedIcon fontSize="small" color="primary" />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    noWrap
                    component={item.url ? "a" : "p"}
                    href={item.url || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "text.primary",
                      textDecoration: item.url ? "underline" : "none",
                      fontWeight: 600,
                    }}
                  >
                    {item.fileName || item.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", lineHeight: 1.4 }}
                  >
                    {formatBytes(item.bytes)}
                  </Typography>
                </Box>
              </Stack>

              {item.isUploading ? (
                <CircularProgress size={18} thickness={6} />
              ) : (
                <IconButton
                  size="small"
                  onClick={() => onRemove?.(item._id)}
                  sx={{ "&:hover": { color: "error.main" } }}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}
        </Stack>
      </Box>
    </Popover>
  );
}

export default CardAttachmentPicker;
