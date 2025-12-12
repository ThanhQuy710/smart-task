import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { toast } from "react-toastify";

import { selectCurrentActiveBoard } from "~/redux/activeBoard/activeBoardSlice";
import { CARD_LABEL_ACTIONS, LABEL_COLORS } from "~/utils/constants";

function CardLabelPicker({
  cardLabelIds = [],
  anchorEl,
  onOpenPopover,
  onClosePopover,
  onUpdateCardLabels,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel,
}) {
  const board = useSelector(selectCurrentActiveBoard);
  const boardLabels = board?.labels || [];

  const [newLabelTitle, setNewLabelTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0]);
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);

  const popoverId = anchorEl ? "card-labels-popover" : undefined;
  const activeLabels = useMemo(
    () => boardLabels.filter((label) => cardLabelIds?.includes(label._id)),
    [boardLabels, cardLabelIds]
  );

  const handleToggleLabel = (label) => {
    const isSelected = cardLabelIds?.includes(label._id);
    onUpdateCardLabels({
      labelId: label._id,
      action: isSelected ? CARD_LABEL_ACTIONS.REMOVE : CARD_LABEL_ACTIONS.ADD,
    });
  };

  const resetDialog = () => {
    setNewLabelTitle("");
    setSelectedColor(LABEL_COLORS[0]);
    setEditingLabelId(null);
  };

  const handleCreateLabel = async () => {
    if (!newLabelTitle.trim()) {
      toast.error("Label title is required");
      return;
    }

    if (!board?._id) {
      toast.error("Board is not ready");
      return;
    }

    const createdLabel = await onCreateLabel({
      boardId: board._id,
      title: newLabelTitle.trim(),
      color: selectedColor,
    });

    if (createdLabel?._id) {
      resetDialog();
      setIsLabelDialogOpen(false);
      // Auto assign the newly created label to current card
      if (!cardLabelIds?.includes(createdLabel._id)) {
        onUpdateCardLabels({
          labelId: createdLabel._id,
          action: CARD_LABEL_ACTIONS.ADD,
        });
      }
    }
  };

  const handleUpdateLabel = async () => {
    const currentLabel = boardLabels.find((l) => l._id === editingLabelId);
    const titleToUse = newLabelTitle.trim() || currentLabel?.title || "";
    if (!titleToUse) {
      toast.error("Label title is required");
      return;
    }
    if (editingLabelId) {
      await onUpdateLabel?.(editingLabelId, {
        title: titleToUse,
        color: selectedColor,
      });
      resetDialog();
      setIsLabelDialogOpen(false);
    }
  };

  const openAddDialog = () => {
    resetDialog();
    setIsLabelDialogOpen(true);
  };

  const openEditDialog = (label) => {
    setEditingLabelId(label._id);
    setNewLabelTitle(label.title);
    setSelectedColor(label.color);
    setIsLabelDialogOpen(true);
  };

  const renderLabelChip = (label) => (
    <Chip
      key={label._id}
      size="small"
      label={label.title}
      sx={{
        bgcolor: label.color,
        color: "#fff",
        fontWeight: "700",
        textTransform: "capitalize",
        borderRadius: "4px",
        "&:hover": { opacity: 0.9 },
      }}
    />
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 0.5,
          mb: 1,
        }}
      >
        <IconButton
          size="small"
          color="primary"
          onClick={onOpenPopover}
          sx={{
            border: "1px dashed",
            borderColor: "primary.main",
            borderRadius: "6px",
            height: 28,
            width: 28,
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
        {activeLabels.map(renderLabelChip)}
      </Box>

      <Popover
        id={popoverId}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClosePopover}
        anchorOrigin={{ vertical: "center", horizontal: "left" }}
        transformOrigin={{ vertical: "center", horizontal: "right" }}
      >
        <Box sx={{ p: 2, width: 320 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Board labels</Typography>
          <Stack spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                openAddDialog();
              }}
              sx={{ justifyContent: "flex-start" }}
            >
              Add label
            </Button>
            {boardLabels.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No labels yet.
              </Typography>
            )}
            {boardLabels.map((label) => {
              const isSelected = cardLabelIds?.includes(label._id);
              return (
                <Box
                  key={label._id}
                  onClick={() => handleToggleLabel(label)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: "8px",
                    border: (theme) =>
                      `1px solid ${
                        isSelected
                          ? theme.palette.primary.main
                          : theme.palette.divider
                      }`,
                    p: 1,
                    cursor: "pointer",
                    bgcolor: isSelected ? "action.hover" : "transparent",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={(theme) => ({
                        width: 20,
                        height: 20,
                        borderRadius: "4px",
                        border: `1px solid ${
                          isSelected
                            ? theme.palette.primary.main
                            : theme.palette.divider
                        }`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: isSelected ? "primary.main" : "transparent",
                        color: isSelected
                          ? "#fff"
                          : theme.palette.text.secondary,
                        transition: "all 0.1s ease-in-out",
                      })}
                    >
                      {isSelected && <CheckIcon fontSize="small" />}
                    </Box>
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "4px",
                        bgcolor: label.color,
                      }}
                    />
                    <Typography sx={{ fontWeight: 600 }}>
                      {label.title}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(label);
                      }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await onDeleteLabel?.(label._id);
                        if (editingLabelId === label._id) {
                          setEditingLabelId(null);
                          setNewLabelTitle("");
                          setSelectedColor(LABEL_COLORS[0]);
                        }
                      }}
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Popover>

      <Dialog
        open={isLabelDialogOpen}
        onClose={() => {
          setIsLabelDialogOpen(false);
          resetDialog();
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {editingLabelId ? "Update label" : "Add label"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Label title"
            fullWidth
            size="small"
            value={newLabelTitle}
            onChange={(e) => setNewLabelTitle(e.target.value)}
          />
          <Typography sx={{ mt: 2, mb: 1, fontWeight: 600 }}>Color</Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 1,
            }}
          >
            {LABEL_COLORS.map((color) => {
              const isActive = color === selectedColor;
              return (
                <Box
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  sx={{
                    height: 26,
                    borderRadius: "6px",
                    cursor: "pointer",
                    bgcolor: color,
                    border: isActive
                      ? "2px solid #fff"
                      : "2px solid transparent",
                    boxShadow: isActive ? "0 0 0 2px #2c3e50" : "none",
                  }}
                />
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsLabelDialogOpen(false);
              resetDialog();
            }}
          >
            Cancel
          </Button>
          {editingLabelId ? (
            <Button variant="contained" onClick={handleUpdateLabel}>
              Save
            </Button>
          ) : (
            <Button variant="contained" onClick={handleCreateLabel}>
              Add
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CardLabelPicker;
