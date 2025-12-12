import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CloseIcon from '@mui/icons-material/Close'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import CheckIcon from '@mui/icons-material/Check'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function CardTaskList({
  tasks = [],
  cardMembers = [],
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onAssignSubtask,
  onUpdateTask,
  onDeleteTask,
  onReorderSubtasks,
  onReorderTasks,
  onCompleteAllSubtasks
}) {
  const [taskMenu, setTaskMenu] = useState({ taskId: null, anchorEl: null })
  const [editTask, setEditTask] = useState(null)
  const [newSubtaskTitles, setNewSubtaskTitles] = useState({})
  const [editingSubtask, setEditingSubtask] = useState({ taskId: null, subtaskId: null, value: '' })
  const [assignMenu, setAssignMenu] = useState({ taskId: null, subtaskId: null, anchorEl: null })

  const handleOpenMenu = (event, taskId) => setTaskMenu({ taskId, anchorEl: event.currentTarget })
  const handleCloseMenu = () => setTaskMenu({ taskId: null, anchorEl: null })

  const handleAddSubtask = (taskId) => {
    const title = (newSubtaskTitles[taskId] || '').trim()
    if (!title) return
    onAddSubtask?.(taskId, title)
    setNewSubtaskTitles((prev) => ({ ...prev, [taskId]: '' }))
  }

  const handleToggleSubtask = (taskId, subtaskId, isCompleted) => {
    onToggleSubtask?.(taskId, subtaskId, isCompleted)
  }

  const startEditSubtask = (taskId, subtask) => {
    setEditingSubtask({ taskId, subtaskId: subtask._id, value: subtask.title })
  }

  const commitEditSubtask = () => {
    const { taskId, subtaskId, value } = editingSubtask
    if (taskId && subtaskId && value.trim()) {
      onUpdateSubtask?.(taskId, subtaskId, value.trim())
    }
    setEditingSubtask({ taskId: null, subtaskId: null, value: '' })
  }

  const completedCount = useMemo(() => {
    const countMap = {}
    tasks.forEach(task => {
      const total = task.subtasks?.length || 0
      const done = (task.subtasks || []).filter(s => s.isCompleted).length
      countMap[task._id] = { done, total }
    })
    return countMap
  }, [tasks])

  const handleReorder = (taskId, currentSubs, activeId, overId) => {
    if (activeId === overId) return
    const oldIndex = currentSubs.findIndex(s => s._id === activeId)
    const newIndex = currentSubs.findIndex(s => s._id === overId)
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = arrayMove(currentSubs, oldIndex, newIndex).map(s => s._id)
    onReorderSubtasks?.(taskId, newOrder)
  }

  return (
    <>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event
          if (!over) return
          const activeId = active.id
          const overId = over.id
          if (activeId === overId) return
          const orderedIds = arrayMove(tasks, tasks.findIndex(t => t._id === activeId), tasks.findIndex(t => t._id === overId)).map(t => t._id)
          onReorderTasks?.(orderedIds)
        }}
      >
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          <Stack spacing={1.5}>
            {tasks.map((task) => (
              <SortableTaskCard
                key={task._id}
                task={task}
                completedCount={completedCount[task._id] || { done: 0, total: 0 }}
                cardMembers={cardMembers}
                taskMenu={taskMenu}
                handleOpenMenu={handleOpenMenu}
                onAddSubtask={onAddSubtask}
                onToggleSubtask={onToggleSubtask}
                onUpdateSubtask={onUpdateSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onAssignSubtask={onAssignSubtask}
                onReorderSubtasks={onReorderSubtasks}
                startEditSubtask={startEditSubtask}
                commitEditSubtask={commitEditSubtask}
                editingSubtask={editingSubtask}
                setEditingSubtask={setEditingSubtask}
                handleReorder={handleReorder}
                assignMenu={assignMenu}
                setAssignMenu={setAssignMenu}
                newSubtaskTitles={newSubtaskTitles}
                setNewSubtaskTitles={setNewSubtaskTitles}
              />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>

      <Menu
        anchorEl={taskMenu.anchorEl}
        open={Boolean(taskMenu.anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          const target = tasks.find(t => t._id === taskMenu.taskId)
          setEditTask(target || null)
          handleCloseMenu()
        }}>Update</MenuItem>
        <MenuItem onClick={() => { onCompleteAllSubtasks?.(taskMenu.taskId); handleCloseMenu() }}>
          Mark all completed
        </MenuItem>
        <MenuItem onClick={() => { onDeleteTask?.(taskMenu.taskId); handleCloseMenu() }}>
          Delete
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={assignMenu.anchorEl}
        open={Boolean(assignMenu.anchorEl)}
        onClose={() => setAssignMenu({ taskId: null, subtaskId: null, anchorEl: null })}
      >
        {cardMembers.map(member => {
          const currentSubtask = tasks.find(t => t._id === assignMenu.taskId)?.subtasks?.find(s => s._id === assignMenu.subtaskId)
          const isAssigned = currentSubtask?.assigneeIds?.includes(member._id)
          return (
            <MenuItem
              key={member._id}
              onClick={() => {
                onAssignSubtask?.(assignMenu.taskId, assignMenu.subtaskId, member._id, isAssigned)
                setAssignMenu({ taskId: null, subtaskId: null, anchorEl: null })
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                <Avatar sx={{ width: 26, height: 26, fontSize: 12 }}>{member.displayName?.[0]?.toUpperCase()}</Avatar>
                <Typography sx={{ flex: 1 }}>{member.displayName || member.email}</Typography>
                {isAssigned && <CheckIcon fontSize="small" color="success" />}
              </Stack>
            </MenuItem>
          )
        })}
      </Menu>

      <Dialog open={Boolean(editTask)} onClose={() => setEditTask(null)} fullWidth maxWidth="sm">
        <DialogTitle>Update Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              size="small"
              value={editTask?.title || ''}
              onChange={(e) => setEditTask((prev) => ({ ...prev, title: e.target.value }))}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              size="small"
              value={editTask?.description || ''}
              onChange={(e) => setEditTask((prev) => ({ ...prev, description: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTask(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!editTask?.title?.trim()) return
              onUpdateTask?.(editTask._id, editTask.title.trim(), editTask.description || '')
              setEditTask(null)
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CardTaskList

function SortableTaskCard({
  task,
  completedCount,
  cardMembers,
  taskMenu,
  handleOpenMenu,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onAssignSubtask,
  onReorderSubtasks,
  startEditSubtask,
  commitEditSubtask,
  editingSubtask,
  setEditingSubtask,
  handleReorder,
  assignMenu,
  setAssignMenu,
  newSubtaskTitles,
  setNewSubtaskTitles
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: task._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <Box
      ref={setNodeRef}
      sx={{
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: '10px',
        p: 1.25,
        bgcolor: (theme) => theme.palette.action.hover
      }}
      style={style}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton {...attributes} {...listeners} size="small" sx={{ cursor: 'grab' }}>
            <DragIndicatorIcon fontSize="small" />
          </IconButton>
          <ListAltOutlinedIcon fontSize="small" color="primary" />
          <Box>
            <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>{task.title}</Typography>
            {task.description && (
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                {task.description}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {completedCount.done || 0}/{completedCount.total || 0} done
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={(e) => handleOpenMenu(e, task._id)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack spacing={0.5} sx={{ mt: 1 }}>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            const { active, over } = event
            if (!over) return
            handleReorder(task._id, task.subtasks || [], active.id, over.id)
          }}
        >
          <SortableContext
            items={(task.subtasks || []).map(s => s._id)}
            strategy={verticalListSortingStrategy}
          >
            {(task.subtasks || []).map((subtask) => {
              const isEditing = editingSubtask.subtaskId === subtask._id
              return (
                <SortableSubtaskRow
                  key={subtask._id}
                  subtask={subtask}
                  cardMembers={cardMembers}
                  isEditing={isEditing}
                  editingValue={editingSubtask.value}
                  onChangeEditingValue={(value) => setEditingSubtask({ ...editingSubtask, value })}
                  onCommitEdit={commitEditSubtask}
                  onStartEdit={() => startEditSubtask(task._id, subtask)}
                  onToggle={(checked) => onToggleSubtask(task._id, subtask._id, checked)}
                  onAssignClick={(e) => setAssignMenu({ taskId: task._id, subtaskId: subtask._id, anchorEl: e.currentTarget })}
                  onClearAssign={(userId) => onAssignSubtask?.(task._id, subtask._id, userId, true)}
                  onDelete={() => onDeleteSubtask?.(task._id, subtask._id)}
                />
              )
            })}
          </SortableContext>
        </DndContext>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Add a subtask"
          value={newSubtaskTitles[task._id] || ''}
          onChange={(e) => setNewSubtaskTitles((prev) => ({ ...prev, [task._id]: e.target.value }))}
          onKeyDown={(e) => { if (e.key === 'Enter') onAddSubtask(task._id) }}
        />
        <Button
          variant="outlined"
          size="small"
          startIcon={<PlaylistAddIcon />}
          onClick={() => onAddSubtask(task._id)}
        >
          Add
        </Button>
      </Stack>
    </Box>
  )
}

function SortableSubtaskRow({
  subtask,
  cardMembers,
  isEditing,
  editingValue,
  onChangeEditingValue,
  onCommitEdit,
  onStartEdit,
  onToggle,
  onAssignClick,
  onClearAssign,
  onDelete
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: subtask._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <Box
      ref={setNodeRef}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 0.75,
        borderRadius: '8px',
        bgcolor: (theme) => theme.palette.background.paper,
        boxShadow: (theme) => theme.shadows[1]
      }}
      style={style}
    >
      <IconButton {...attributes} {...listeners} size="small" sx={{ cursor: 'grab' }}>
        <DragIndicatorIcon fontSize="small" />
      </IconButton>
      <Checkbox
        size="small"
        checked={!!subtask.isCompleted}
        onChange={(e) => onToggle(e.target.checked)}
      />
      {isEditing ? (
        <TextField
          size="small"
          fullWidth
          value={editingValue}
          onChange={(e) => onChangeEditingValue(e.target.value)}
          onBlur={onCommitEdit}
          onKeyDown={(e) => { if (e.key === 'Enter') onCommitEdit() }}
          autoFocus
        />
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              textDecoration: subtask.isCompleted ? 'line-through' : 'none',
              color: subtask.isCompleted ? 'text.secondary' : 'text.primary',
              cursor: 'pointer'
            }}
            onClick={onStartEdit}
          >
            {subtask.title}
          </Typography>
          {(subtask.assigneeIds || (subtask.assigneeId ? [subtask.assigneeId] : [])).map(userId => {
            const member = cardMembers.find(m => m._id === userId)
            const display = member?.displayName || member?.email || 'User'
            return (
              <Box key={userId} sx={{ position: 'relative', display: 'inline-flex' }}>
                <Tooltip title={display}>
                  <Avatar
                    sx={{ width: 24, height: 24, fontSize: 11 }}
                  >
                    {display?.[0]?.toUpperCase() || 'A'}
                  </Avatar>
                </Tooltip>
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 16,
                    height: 16,
                    bgcolor: 'background.paper',
                    borderRadius: '50%',
                    boxShadow: (theme) => theme.shadows[1],
                    '&:hover': { bgcolor: 'error.light', color: 'white' }
                  }}
                  onClick={() => onClearAssign(userId)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              </Box>
            )
          })}
        </Box>
      )}
      <Tooltip title="Assign subtask">
        <IconButton
          size="small"
          onClick={onAssignClick}
        >
          <PersonAddAltIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete subtask">
        <IconButton size="small" onClick={onDelete}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
