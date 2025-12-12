import { useState } from 'react'
import Popover from '@mui/material/Popover'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'

function CardTasksPopover({ anchorEl, onClose, onAddTask }) {
  const open = Boolean(anchorEl)
  const id = open ? 'card-tasks-popover' : undefined
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleClose = () => {
    setTitle('')
    setDescription('')
    onClose?.()
  }

  const handleSave = () => {
    if (!title.trim()) return
    onAddTask?.({ title: title.trim(), description: description.trim() })
    setTitle('')
    setDescription('')
  }

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Box sx={{ p: 2, width: 360 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Add Task</Typography>
        <Stack spacing={1.5}>
          <TextField
            size="small"
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <TextField
            size="small"
            label="Description"
            multiline
            minRows={2}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Divider />
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} disabled={!title.trim()}>
              Save
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Popover>
  )
}

export default CardTasksPopover
