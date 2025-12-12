import { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VpnLockIcon from "@mui/icons-material/VpnLock";
import PaletteIcon from "@mui/icons-material/Palette";
import { Tooltip } from "@mui/material";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { capitalizeFirstLetter } from "~/utils/formatters";
import BoardUserGroup from "./BoardUserGroup";
import InviteBoardUser from "./InviteBoardUser";
import {
  BOARD_TEMPLATE_TYPES,
  DEFAULT_BOARD_COLORS,
  DEFAULT_BOARD_IMAGES,
} from "~/utils/boardTemplates";
import { updateBoardDetailsAPI } from "~/apis";
import { updateCurrentActiveBoard } from "~/redux/activeBoard/activeBoardSlice";
import { singleFileValidator } from "~/utils/validators";
import BackgroundTemplatePicker from "./BackgroundTemplatePicker";

const MENU_STYLES = {
  color: "white",
  bgcolor: "rgba(255,255,255,0.14)",
  border: "1px solid rgba(255,255,255,0.22)",
  paddingX: "8px",
  borderRadius: "12px",
  backdropFilter: "blur(8px)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
  ".MuiSvgIcon-root": {
    color: "white",
  },
  "&:hover": {
    bgcolor: "rgba(255,255,255,0.22)",
    boxShadow: "0 14px 36px rgba(0,0,0,0.28)",
  },
};

const BOARD_TYPE_LABELS = {
  public: "Công khai",
  private: "Riêng tư",
};

function BoardBar({ board }) {
  const dispatch = useDispatch();
  const [pickerAnchor, setPickerAnchor] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const safeBackgrounds = board?.backgrounds || [];

  const handleOpenPicker = (event) => setPickerAnchor(event.currentTarget);
  const handleClosePicker = () => setPickerAnchor(null);

  const handleTemplateChange = async (template) => {
    if (!board?._id || isSavingTemplate) return;
    setIsSavingTemplate(true);
    try {
      const response = await updateBoardDetailsAPI(board._id, { template });
      const updated = response?.value || response || {};
      const updatedTemplate = updated.template || template;
      const updatedBackgrounds = updated.backgrounds ?? safeBackgrounds;

      dispatch(
        updateCurrentActiveBoard({
          ...board,
          template: updatedTemplate,
          backgrounds: updatedBackgrounds,
        })
      );
    } catch (error) {
      // Error handled globally by interceptor
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleUploadBackground = async (file) => {
    const error = singleFileValidator(file);
    if (error) {
      toast.error(error);
      return;
    }
    if (!board?._id) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("background", file);
      const response = await updateBoardDetailsAPI(board._id, formData);
      const updated = response?.value || response || {};
      const updatedBackgrounds = updated.backgrounds ?? safeBackgrounds;
      const latestBackground =
        updatedBackgrounds[updatedBackgrounds.length - 1];

      dispatch(
        updateCurrentActiveBoard({
          ...board,
          backgrounds: updatedBackgrounds,
          template: updated.template || {
            type: BOARD_TEMPLATE_TYPES.CUSTOM,
            value: latestBackground?.imageUrl || board?.template?.value,
          },
        })
      );
    } catch (error) {
      // Error handled globally by interceptor
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Box
        sx={(theme) => ({
          width: "100%",
          height: theme.trello.boardBarHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          paddingX: 2.4,
          overflowX: "auto",
          color: "white",
          background:
            "linear-gradient(110deg, rgba(0,0,0,0.35), rgba(0,0,0,0.15))",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 18px 45px rgba(0,0,0,0.28)",
        })}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title={board?.description}>
            <Chip
              sx={MENU_STYLES}
              icon={<DashboardIcon />}
              label={board?.title}
              clickable
            />
          </Tooltip>
          <Chip
            sx={MENU_STYLES}
            icon={<VpnLockIcon />}
            label={BOARD_TYPE_LABELS[board?.type] || capitalizeFirstLetter(board?.type)}
            clickable
          />
          <Chip
            sx={{
              ...MENU_STYLES,
              opacity: isSavingTemplate || isUploading ? 0.7 : 1,
            }}
            icon={<PaletteIcon />}
            label={
              isSavingTemplate || isUploading ? "Đang cập nhật nền..." : "Nền board"
            }
            clickable
            onClick={handleOpenPicker}
            disabled={isSavingTemplate || isUploading}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <InviteBoardUser boardId={board._id} />

          <BoardUserGroup boardUsers={board?.FE_allUsers} />
        </Box>
      </Box>

      <BackgroundTemplatePicker
        anchorEl={pickerAnchor}
        onClose={handleClosePicker}
        template={board?.template}
        backgrounds={safeBackgrounds}
        defaultColors={DEFAULT_BOARD_COLORS}
        defaultImages={DEFAULT_BOARD_IMAGES}
        onSelectTemplate={handleTemplateChange}
        onUploadBackground={handleUploadBackground}
        uploading={isUploading}
      />
    </>
  );
}

export default BoardBar;
