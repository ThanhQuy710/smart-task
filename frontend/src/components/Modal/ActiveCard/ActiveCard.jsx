import { useState } from "react";
import moment from "moment";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CancelIcon from "@mui/icons-material/Cancel";
import Grid from "@mui/material/Unstable_Grid2";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import AspectRatioOutlinedIcon from "@mui/icons-material/AspectRatioOutlined";
import AddToDriveOutlinedIcon from "@mui/icons-material/AddToDriveOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import SubjectRoundedIcon from "@mui/icons-material/SubjectRounded";
import DvrOutlinedIcon from "@mui/icons-material/DvrOutlined";

import ToggleFocusInput from "~/components/Form/ToggleFocusInput";
import VisuallyHiddenInput from "~/components/Form/VisuallyHiddenInput";
import {
  singleAttachmentValidator,
  singleFileValidator,
} from "~/utils/validators";
import { toast } from "react-toastify";
import CardUserGroup from "./CardUserGroup";
import CardDescriptionMdEditor from "./CardDescriptionMdEditor";
import CardActivitySection from "./CardActivitySection";
import CardLabelPicker from "./CardLabelPicker";
import CardDatesPicker from "./CardDatesPicker";
import CardAttachmentPicker from "./CardAttachmentPicker";
import CardTasksPopover from "./CardTasksPopover";
import CardTaskList from "./CardTaskList";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAndHideCurrentActiveCard,
  selectCurrentActiveCard,
  updateCurrentActiveCard,
  selectIsShowModalActiveCard,
} from "~/redux/activeCard/activeCardSlice";
import {
  updateCardDetailsAPI,
  createNewLabelAPI,
  updateLabelAPI,
  deleteLabelAPI,
} from "~/apis";
import {
  updateCardInBoard,
  selectCurrentActiveBoard,
  updateCurrentActiveBoard,
} from "~/redux/activeBoard/activeBoardSlice";
import { selectCurrentUser } from "~/redux/user/userSlice";
import { CARD_MEMBER_ACTIONS } from "~/utils/constants";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { styled } from "@mui/material/styles";
const SidebarItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  color: theme.palette.mode === "dark" ? "#90caf9" : "#172b4d",
  backgroundColor: theme.palette.mode === "dark" ? "#2f3542" : "#091e420f",
  padding: "10px",
  borderRadius: "4px",
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark" ? "#33485D" : theme.palette.grey[300],
    "&.active": {
      color: theme.palette.mode === "dark" ? "#000000de" : "#0c66e4",
      backgroundColor: theme.palette.mode === "dark" ? "#90caf9" : "#e9f2ff",
    },
  },
}));

/**
 * Note: Modal là một low-component mà bọn MUI sử dụng bên trong những thứ như Dialog, Drawer, Menu, Popover. Ở đây dĩ nhiên chúng ta có thể sử dụng Dialog cũng không thành vấn đề gì, nhưng sẽ sử dụng Modal để dễ linh hoạt tùy biến giao diện từ con số 0 cho phù hợp với mọi nhu cầu nhé.
 */
function ActiveCard() {
  const dispatch = useDispatch();
  const activeCard = useSelector(selectCurrentActiveCard);
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard);
  const currentUser = useSelector(selectCurrentUser);
  const board = useSelector(selectCurrentActiveBoard);
  const [labelPopoverAnchor, setLabelPopoverAnchor] = useState(null);
  const [datePopoverAnchor, setDatePopoverAnchor] = useState(null);
  const [attachmentPopoverAnchor, setAttachmentPopoverAnchor] = useState(null);
  const [taskPopoverAnchor, setTaskPopoverAnchor] = useState(null);
  const [uploadingAttachments, setUploadingAttachments] = useState([]);

  // Không dùng biến State để check đóng mở Modal nữa vì chúng ta sẽ check theo cái biến isShowModalActiveCard trong redux
  // const [isOpen, setIsOpen] = useState(true)
  // const handleOpenModal = () => setIsOpen(true)
  const handleCloseModal = () => {
    // setIsOpen(false)
    setLabelPopoverAnchor(null);
    setDatePopoverAnchor(null);
    setAttachmentPopoverAnchor(null);
    setTaskPopoverAnchor(null);
    setUploadingAttachments([]);
    dispatch(clearAndHideCurrentActiveCard());
  };

  // Func gọi API dùng chung cho các trường hợp update card title, description, cover, comment...vv
  const callApiUpdateCard = async (updateData) => {
    const updatedCard = await updateCardDetailsAPI(activeCard._id, updateData);

    // B1: Cập nhật lại cái card đang active trong modal hiện tại
    dispatch(updateCurrentActiveCard(updatedCard));

    // B2: Cập nhật lại cái bản ghi card trong cái activeBoard (nested data)
    dispatch(updateCardInBoard(updatedCard));

    return updatedCard;
  };

  const handleOpenLabelPopover = (event) => {
    setLabelPopoverAnchor(event.currentTarget);
  };

  const handleCloseLabelPopover = () => setLabelPopoverAnchor(null);

  const handleOpenDatePopover = (event) => {
    setDatePopoverAnchor(event.currentTarget);
  };

  const handleCloseDatePopover = () => setDatePopoverAnchor(null);

  const handleOpenTaskPopover = (event) =>
    setTaskPopoverAnchor(event.currentTarget);
  const handleCloseTaskPopover = () => setTaskPopoverAnchor(null);

  const handleOpenAttachmentPopover = (event) => {
    setAttachmentPopoverAnchor(event.currentTarget);
  };

  const handleCloseAttachmentPopover = () => setAttachmentPopoverAnchor(null);

  const formatDateDisplay = (value) => {
    if (!value) return "";
    const parsed = moment(value);
    return parsed.isValid() ? parsed.format("DD/MM/YYYY") : "";
  };

  const onUpdateCardLabels = (incomingLabelInfo) => {
    callApiUpdateCard({ incomingLabelInfo });
  };

  const onCreateNewLabel = async (newLabelData) => {
    if (!board) return null;
    const createdLabel = await createNewLabelAPI(newLabelData);
    dispatch(
      updateCurrentActiveBoard({
        ...board,
        labels: [...(board.labels || []), createdLabel],
      })
    );
    return createdLabel;
  };

  const onUpdateLabel = async (labelId, data) => {
    const updatedLabel = await updateLabelAPI(labelId, data);
    const existedLabel =
      (board.labels || []).find((label) => label._id === labelId) || {};
    const mergedLabel = updatedLabel
      ? { ...existedLabel, ...updatedLabel }
      : { ...existedLabel, ...data };
    const newBoard = {
      ...board,
      labels: (board.labels || []).map((label) =>
        label._id === labelId ? mergedLabel : label
      ),
    };
    dispatch(updateCurrentActiveBoard(newBoard));
  };

  const onDeleteLabel = async (labelId) => {
    await deleteLabelAPI(labelId);
    const newBoard = {
      ...board,
      labels: (board.labels || []).filter((l) => l._id !== labelId),
      columns: (board.columns || []).map((col) => ({
        ...col,
        cards: (col.cards || []).map((card) => ({
          ...card,
          labelIds: card.labelIds?.filter((id) => id !== labelId) || [],
        })),
      })),
    };
    dispatch(updateCurrentActiveBoard(newBoard));

    if (activeCard?.labelIds?.includes(labelId)) {
      const updatedCard = {
        ...activeCard,
        labelIds: activeCard.labelIds.filter((id) => id !== labelId),
      };
      dispatch(updateCurrentActiveCard(updatedCard));
      dispatch(updateCardInBoard(updatedCard));
    }
  };

  const onUpdateCardTitle = (newTitle) => {
    callApiUpdateCard({ title: newTitle.trim() });
  };

  const onUpdateCardDescription = (newDescription) => {
    callApiUpdateCard({ description: newDescription });
  };

  const normalizeDatesPayload = (datesObj) => {
    const payload = {};
    if (datesObj.startDate !== undefined) {
      payload.startDate = datesObj.startDate
        ? new Date(datesObj.startDate).getTime()
        : null;
    }
    if (datesObj.endDate !== undefined) {
      payload.endDate = datesObj.endDate
        ? new Date(datesObj.endDate).getTime()
        : null;
    }
    if (datesObj.totalDate !== undefined) {
      payload.totalDate = datesObj.totalDate;
    }
    return payload;
  };

  const onUpdateCardDates = (partialDates) => {
    const mergedDates = {
      startDate: activeCard?.dates?.startDate ?? null,
      endDate: activeCard?.dates?.endDate ?? null,
      totalDate: activeCard?.dates?.totalDate ?? null,
      ...partialDates,
    };
    const normalized = normalizeDatesPayload(mergedDates);
    callApiUpdateCard({ dates: normalized });
  };

  const onUploadCardCover = (event) => {
    // console.log(event.target?.files[0])
    const error = singleFileValidator(event.target?.files[0]);
    if (error) {
      toast.error(error);
      return;
    }
    let reqData = new FormData();
    reqData.append("cardCover", event.target?.files[0]);

    // Gọi API...
    toast.promise(
      callApiUpdateCard(reqData).finally(() => (event.target.value = "")),
      { pending: "Updating..." }
    );
  };

  const onUploadCardAttachment = async (file) => {
    const error = singleAttachmentValidator(file);
    if (error) {
      toast.error(error);
      return;
    }
    const tempId = `${Date.now()}-${Math.random()}`;
    setUploadingAttachments((prev) => [
      { _id: tempId, fileName: file.name, bytes: file.size, isUploading: true },
      ...prev,
    ]);

    const reqData = new FormData();
    reqData.append("cardAttachment", file);

    try {
      await callApiUpdateCard(reqData);
    } catch (err) {
      // Error toast handled globally via axios interceptors
    } finally {
      setUploadingAttachments((prev) =>
        prev.filter((item) => item._id !== tempId)
      );
    }
  };

  const onRemoveCardAttachment = async (attachmentId) => {
    if (!attachmentId) return;
    try {
      await callApiUpdateCard({ attachmentToRemove: attachmentId });
    } catch (err) {
      // Error toast handled globally via axios interceptors
    }
  };

  const onAddTask = async ({ title, description }) => {
    if (!title?.trim()) {
      toast.error("Task title is required");
      return;
    }
    await callApiUpdateCard({
      taskAction: {
        type: "ADD_TASK",
        payload: {
          title: title.trim(),
          description: description?.trim() || "",
        },
      },
    });
    handleCloseTaskPopover();
  };

  const onAddSubtask = async (taskId, title) => {
    if (!title?.trim()) return;
    await callApiUpdateCard({
      taskAction: {
        type: "ADD_SUBTASK",
        payload: { taskId, title: title.trim() },
      },
    });
  };

  const onToggleSubtask = async (taskId, subtaskId, isCompleted) => {
    await callApiUpdateCard({
      taskAction: {
        type: "TOGGLE_SUBTASK",
        payload: { taskId, subtaskId, isCompleted },
      },
    });
  };

  const onUpdateSubtask = async (taskId, subtaskId, title) => {
    if (!title?.trim()) return;
    await callApiUpdateCard({
      taskAction: {
        type: "UPDATE_SUBTASK",
        payload: { taskId, subtaskId, title: title.trim() },
      },
    });
  };

  const onDeleteSubtask = async (taskId, subtaskId) => {
    await callApiUpdateCard({
      taskAction: {
        type: "DELETE_SUBTASK",
        payload: { taskId, subtaskId },
      },
    });
  };

  const onUpdateTask = async (taskId, title, description) => {
    if (!title?.trim()) return;
    await callApiUpdateCard({
      taskAction: {
        type: "UPDATE_TASK",
        payload: { taskId, title: title.trim(), description },
      },
    });
  };

  const onDeleteTask = async (taskId) => {
    await callApiUpdateCard({
      taskAction: {
        type: "DELETE_TASK",
        payload: { taskId },
      },
    });
  };

  const onAssignSubtask = async (taskId, subtaskId, userId, remove = false) => {
    await callApiUpdateCard({
      taskAction: {
        type: "ASSIGN_SUBTASK",
        payload: { taskId, subtaskId, userId, remove },
      },
    });
  };

  const onReorderSubtasks = async (taskId, orderedIds) => {
    if (!Array.isArray(orderedIds) || !orderedIds.length) return;
    // Optimistically update UI
    const newTasks = (activeCard?.tasks || []).map((task) => {
      if (task._id !== taskId) return task;
      const subMap = (task.subtasks || []).reduce(
        (acc, sub) => ({ ...acc, [sub._id]: sub }),
        {}
      );
      return {
        ...task,
        subtasks: orderedIds.map((id) => subMap[id]).filter(Boolean),
      };
    });
    const optimisticCard = { ...activeCard, tasks: newTasks };
    dispatch(updateCurrentActiveCard(optimisticCard));
    dispatch(updateCardInBoard(optimisticCard));

    await callApiUpdateCard({
      taskAction: {
        type: "REORDER_SUBTASKS",
        payload: { taskId, orderedIds },
      },
    });
  };

  const onReorderTasks = async (orderedIds) => {
    if (!Array.isArray(orderedIds) || !orderedIds.length) return;
    const taskMap = (activeCard?.tasks || []).reduce(
      (acc, t) => ({ ...acc, [t._id]: t }),
      {}
    );
    const reorderedTasks = orderedIds.map((id) => taskMap[id]).filter(Boolean);
    const optimisticCard = { ...activeCard, tasks: reorderedTasks };
    dispatch(updateCurrentActiveCard(optimisticCard));
    dispatch(updateCardInBoard(optimisticCard));

    await callApiUpdateCard({
      taskAction: {
        type: "REORDER_TASKS",
        payload: { orderedIds },
      },
    });
  };

  const onCompleteAllSubtasks = async (taskId) => {
    await callApiUpdateCard({
      taskAction: {
        type: "COMPLETE_ALL_SUBTASKS",
        payload: { taskId },
      },
    });
  };

  // Dùng async await ở đây để component con CardActivitySection chờ và nếu thành công thì mới clear thẻ input comment
  const onAddCardComment = async (commentToAdd) => {
    await callApiUpdateCard({ commentToAdd });
  };

  const onUpdateCardMembers = (incomingMemberInfo) => {
    callApiUpdateCard({ incomingMemberInfo });
  };

  const startDateText = formatDateDisplay(activeCard?.dates?.startDate);
  const endDateText = formatDateDisplay(activeCard?.dates?.endDate);
  const hasDateRange = startDateText || endDateText;

  return (
    <Modal
      disableScrollLock
      open={isShowModalActiveCard}
      onClose={handleCloseModal} // Sử dụng onClose trong trường hợp muốn đóng Modal bằng nút ESC hoặc click ra ngoài Modal
      sx={{ overflowY: "auto" }}
    >
      <Box
        sx={{
          position: "relative",
          width: 900,
          maxWidth: 900,
          bgcolor: "white",
          boxShadow: 24,
          borderRadius: "8px",
          border: "none",
          outline: 0,
          padding: "40px 20px 20px",
          margin: "50px auto",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "#1A2027" : "#fff",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "12px",
            right: "10px",
            cursor: "pointer",
          }}
        >
          <CancelIcon
            color="error"
            sx={{ "&:hover": { color: "error.light" } }}
            onClick={handleCloseModal}
          />
        </Box>

        {activeCard?.cover && (
          <Box sx={{ mb: 4 }}>
            <img
              style={{
                width: "100%",
                height: "320px",
                borderRadius: "6px",
                objectFit: "cover",
              }}
              src={activeCard?.cover}
              alt="card-cover"
            />
          </Box>
        )}

        <Box
          sx={{
            mb: 1,
            mt: -3,
            pr: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CreditCardIcon />

          {/* Feature 01: Xử lý tiêu đề của Card */}
          <ToggleFocusInput
            inputFontSize="22px"
            value={activeCard?.title}
            onChangedValue={onUpdateCardTitle}
          />
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Left side */}
          <Grid xs={12} sm={9}>
            {hasDateRange && (
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                }}
              >
                <WatchLaterOutlinedIcon fontSize="small" />
                <Typography sx={{ fontWeight: 600 }}>
                  {[startDateText, endDateText].filter(Boolean).join(" - ")}
                </Typography>
              </Box>
            )}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{ fontWeight: "600", color: "primary.main", mb: 1 }}
              >
                Thành viên
              </Typography>

              {/* Feature 02: Xử lý các thành viên của Card */}
              <CardUserGroup
                cardMemberIds={activeCard?.memberIds}
                onUpdateCardMembers={onUpdateCardMembers}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{ fontWeight: "600", color: "primary.main", mb: 1 }}
              >
                Nhãn
              </Typography>
              <CardLabelPicker
                cardLabelIds={activeCard?.labelIds}
                anchorEl={labelPopoverAnchor}
                onOpenPopover={handleOpenLabelPopover}
                onClosePopover={handleCloseLabelPopover}
                onUpdateCardLabels={onUpdateCardLabels}
                onCreateLabel={onCreateNewLabel}
                onUpdateLabel={onUpdateLabel}
                onDeleteLabel={onDeleteLabel}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <SubjectRoundedIcon />
                <Typography
                  variant="span"
                  sx={{ fontWeight: "600", fontSize: "20px" }}
                >
                  Mô tả
                </Typography>
              </Box>

              {/* Feature 03: Xử lý mô tả của Card */}
              <CardDescriptionMdEditor
                cardDescriptionProp={activeCard?.description}
                handleUpdateCardDescription={onUpdateCardDescription}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <TaskAltOutlinedIcon />
                <Typography
                  variant="span"
                  sx={{ fontWeight: "600", fontSize: "20px" }}
                >
                  Công việc
                </Typography>
              </Box>
              <CardTaskList
                tasks={activeCard?.tasks || []}
                cardMembers={(board?.FE_allUsers || []).filter((u) =>
                  activeCard?.memberIds?.includes(u._id)
                )}
                onAddSubtask={onAddSubtask}
                onToggleSubtask={onToggleSubtask}
                onUpdateSubtask={onUpdateSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onAssignSubtask={onAssignSubtask}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onReorderSubtasks={onReorderSubtasks}
                onReorderTasks={onReorderTasks}
                onCompleteAllSubtasks={onCompleteAllSubtasks}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <DvrOutlinedIcon />
                <Typography
                  variant="span"
                  sx={{ fontWeight: "600", fontSize: "20px" }}
                >
                  Hoạt động
                </Typography>
              </Box>

              {/* Feature 04: Xử lý các hành động, ví dụ comment vào Card */}
              <CardActivitySection
                cardComments={activeCard?.comments}
                onAddCardComment={onAddCardComment}
              />
            </Box>
          </Grid>

          {/* Right side */}
          <Grid xs={12} sm={3}>
            <Typography
              sx={{ fontWeight: "600", color: "primary.main", mb: 1 }}
            >
              Thao tác với thẻ
            </Typography>
            <Stack direction="column" spacing={1}>
              {/* Feature 05: Xử lý hành động bản thân user tự join vào card */}
              {/* Nếu user hiện tại đang đăng nhập chưa thuộc mảng memberIds của card thì mới cho hiện nút Join và ngược lại */}
              {activeCard?.memberIds?.includes(currentUser._id) ? (
                <SidebarItem
                  sx={{
                    color: "error.light",
                    "&:hover": { color: "error.light" },
                  }}
                  onClick={() =>
                    onUpdateCardMembers({
                      userId: currentUser._id,
                      action: CARD_MEMBER_ACTIONS.REMOVE,
                    })
                  }
                >
                  <ExitToAppIcon fontSize="small" />
                  Rời thẻ
                </SidebarItem>
              ) : (
                <SidebarItem
                  className="active"
                  onClick={() =>
                    onUpdateCardMembers({
                      userId: currentUser._id,
                      action: CARD_MEMBER_ACTIONS.ADD,
                    })
                  }
                >
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <PersonOutlineOutlinedIcon fontSize="small" />
                      <span>Tham gia</span>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CheckCircleIcon
                        fontSize="small"
                        sx={{ color: "#27ae60" }}
                      />
                    </Box>
                  </Box>
                </SidebarItem>
              )}

              {/* Feature 06: Xử lý hành động cập nhật ảnh Cover của Card */}
              <SidebarItem className="active" component="label">
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <ImageOutlinedIcon fontSize="small" />
                    <span>Ảnh bìa</span>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CheckCircleIcon
                      fontSize="small"
                      sx={{ color: "#27ae60" }}
                    />
                  </Box>
                </Box>
                <VisuallyHiddenInput type="file" onChange={onUploadCardCover} />
              </SidebarItem>

              <SidebarItem
                className="active"
                onClick={handleOpenAttachmentPopover}
              >
                <AttachFileOutlinedIcon fontSize="small" />
                {`Đính kèm${
                  activeCard?.attachments?.length
                    ? ` (${activeCard.attachments.length})`
                    : ""
                }`}
              </SidebarItem>
              <SidebarItem className="active" onClick={handleOpenLabelPopover}>
                <LocalOfferOutlinedIcon fontSize="small" />
                Nhãn
              </SidebarItem>
              <SidebarItem className="active" onClick={handleOpenTaskPopover}>
                <TaskAltOutlinedIcon fontSize="small" />
                Danh sách kiểm
              </SidebarItem>
              <SidebarItem className="active" onClick={handleOpenDatePopover}>
                <WatchLaterOutlinedIcon fontSize="small" />
                Ngày
              </SidebarItem>
              <SidebarItem>
                <AutoFixHighOutlinedIcon fontSize="small" />
                Trường tùy chỉnh
              </SidebarItem>
            </Stack>
          </Grid>
        </Grid>
        <CardAttachmentPicker
          attachments={activeCard?.attachments || []}
          uploadingAttachments={uploadingAttachments}
          anchorEl={attachmentPopoverAnchor}
          onClose={handleCloseAttachmentPopover}
          onUpload={onUploadCardAttachment}
          onRemove={onRemoveCardAttachment}
        />
        <CardTasksPopover
          anchorEl={taskPopoverAnchor}
          onClose={handleCloseTaskPopover}
          onAddTask={onAddTask}
        />
        <CardDatesPicker
          dates={activeCard?.dates}
          anchorEl={datePopoverAnchor}
          onClose={handleCloseDatePopover}
          onUpdateDates={onUpdateCardDates}
        />
      </Box>
    </Modal>
  );
}

export default ActiveCard;
