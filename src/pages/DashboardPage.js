import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTasks, updateTask, createTask, deleteTask } from "../services/api";
import { setTasks, setError } from "../features/taskSlice";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Fade,
  Chip,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import axios from "axios";
import { logout } from "../features/authSlice";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { tasks, loading, error } = useSelector((state) => state.tasks);

  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "pending",
  });
  const [editTask, setEditTask] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom styles
  const styles = {
    headerContainer: {
      backgroundColor: "#f8f9fa",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "24px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    headerTitle: {
      display: "flex",
      alignItems: "center",
      gap: 2,
      color: "#1a237e",
    },
    buttonGroup: {
      display: "flex",
      gap: "12px",
    },
    actionButton: {
      borderRadius: "8px",
      textTransform: "none",
      padding: "8px 16px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    dataGridContainer: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    },
    dialog: {
      "& .MuiDialog-paper": {
        borderRadius: "12px",
      },
    },
    dialogTitle: {
      backgroundColor: "#f8f9fa",
      padding: "16px 24px",
    },
    dialogContent: {
      padding: "24px",
    },
    dialogActions: {
      padding: "16px 24px",
    },
  };

  // Status configuration
  const getStatusChipProps = (status) => {
    const configs = {
      pending: {
        color: "default",
        backgroundColor: "#e0e0e0",
        label: "PENDING",
      },
      "in-progress": {
        color: "primary",
        backgroundColor: "#bbdefb",
        label: "IN PROGRESS",
      },
      completed: {
        color: "success",
        backgroundColor: "#c8e6c9",
        label: "COMPLETED",
      },
    };
    return configs[status] || configs.pending;
  };

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else {
      const fetchTasks = async () => {
        try {
          const data = await getTasks(userInfo.token, page + 1, pageSize);
          const tasksWithId = data.tasks.map((task) => ({
            ...task,
            id: task._id,
          }));
          dispatch(setTasks(tasksWithId));
          setTotalPages(data.totalPages);
          setCurrentPage(data.currentPage);
          setTotalTasks(data.totalTasks);
        } catch (err) {
          dispatch(setError(err.message));
        }
      };
      fetchTasks();

      const fetchUsers = async () => {
        try {
          const response = await axios.get(
            "https://task-management-backend-jxvg.onrender.com/api/users",
            {
              headers: { Authorization: `Bearer ${userInfo.token}` },
            }
          );
          setUsers(response.data);
        } catch (err) {
          console.error("Failed to fetch users", err);
        }
      };
      fetchUsers();
    }
  }, [dispatch, userInfo, navigate, page, pageSize]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading

    const newTask = {
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.assignedTo,
      createdBy: userInfo._id,
      status: taskData.status,
    };

    try {
      await createTask(newTask, userInfo.token);
      const data = await getTasks(userInfo.token, page + 1, pageSize);
      const tasksWithId = data.tasks.map((task) => ({
        ...task,
        id: task._id,
      }));
      dispatch(setTasks(tasksWithId));
      setTotalPages(data.totalPages);
      setTotalTasks(data.totalTasks);
      setCurrentPage(data.currentPage);

      setOpenDialog(false);
      setTaskData({
        title: "",
        description: "",
        assignedTo: "",
        status: "pending",
      });

      setSnackbarMessage("Task Created Successfully");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (err) {
      dispatch(setError(err.message));
      setSnackbarMessage("Error Creating Task");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false); // End loading regardless of outcome
    }
  };

  // Update handleUpdateTask to include loading state
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading

    const updatedTask = {
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.assignedTo,
      status: taskData.status,
      createdBy: editTask.createdBy,
    };

    try {
      const updatedTaskResponse = await updateTask(
        editTask._id,
        updatedTask,
        userInfo.token
      );
      dispatch(
        setTasks(
          tasks.map((task) =>
            task._id === updatedTaskResponse._id ? updatedTaskResponse : task
          )
        )
      );
      setOpenDialog(false);
      setEditTask(null);

      setSnackbarMessage("Task Updated Successfully");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (err) {
      dispatch(setError(err.message));
      setSnackbarMessage("Error Updating Task");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false); // End loading regardless of outcome
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId, userInfo.token);
      dispatch(setTasks(tasks.filter((task) => task._id !== taskId)));
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
      setTotalTasks((prevTotalTasks) => prevTotalTasks - 1);

      setSnackbarMessage("Task Deleted Successfully");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (err) {
      dispatch(setError(err.message));
      setSnackbarMessage("Error Deleting Task");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleEditClick = (task) => {
    setTaskData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo ? task.assignedTo._id : "",
      status: task.status,
    });
    setEditTask(task);
    setOpenDialog(true);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setSnackbarMessage("Logged Out Successfully");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
  };

  const columns = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1.5,
      minWidth: 300,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {params.value}
        </Typography>
      ),
    },
    ...(userInfo?.role === "admin"
      ? [
          {
            field: "assignedTo",
            headerName: "Assigned To",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => {
              const assignedUserId = params.value?._id || params.value;
              const assignedUser = users.find(
                (user) => user._id === assignedUserId
              );
              return (
                <Chip
                  icon={<PersonIcon sx={{ fontSize: 16 }} />}
                  label={assignedUser ? assignedUser.name : "Not Assigned"}
                  size="small"
                  variant="outlined"
                />
              );
            },
          },
        ]
      : []),
    {
      field: "status",
      headerName: "Status",
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => {
        const statusConfig = getStatusChipProps(params.value);
        return (
          <Chip
            label={statusConfig.label}
            size="small"
            sx={{
              backgroundColor: statusConfig.backgroundColor,
              color: "text.primary",
              fontWeight: "medium",
            }}
          />
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {new Date(params.value).toLocaleString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            })}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit Task" arrow>
            <IconButton
              size="small"
              onClick={() => handleEditClick(params.row)}
              sx={{
                color: "primary.main",
                "&:hover": { backgroundColor: "primary.lighter" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {userInfo?.role === "admin" && (
            <Tooltip title="Delete Task" arrow>
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(params.row)}
                sx={{
                  color: "error.main",
                  "&:hover": { backgroundColor: "error.lighter" },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Paper elevation={0} sx={styles.headerContainer}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={styles.headerTitle}>
              <DashboardIcon sx={{ fontSize: 32, mr: 2 }} />
              <Typography variant="h4" component="h1" fontWeight="medium">
                Task Dashboard
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              {userInfo?.role === "admin" && (
                <>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={styles.actionButton}
                  >
                    Create Task
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PersonIcon />}
                    onClick={() => navigate("/register")}
                    sx={styles.actionButton}
                  >
                    Add User
                  </Button>
                </>
              )}
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={styles.actionButton}
              >
                Logout
              </Button>
            </Stack>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Paper sx={styles.dataGridContainer}>
            <Box sx={{ position: "relative" }}>
              <DataGrid
                rows={tasks}
                columns={columns}
                pageSize={pageSize}
                rowsPerPageOptions={[5, 10, 20]}
                page={page}
                pagination
                paginationMode="server"
                rowCount={totalTasks}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newPageSize) => {
                  setPageSize(newPageSize);
                  setPage(0);
                }}
                loading={loading}
                getRowId={(row) => row._id}
                disableRowSelectionOnClick
                paginationModel={{ page, pageSize }}
                onPaginationModelChange={(newModel) => {
                  setPage(newModel.page);
                  setPageSize(newModel.pageSize);
                }}
                sx={{
                  height: 600,
                  border: "none",
                  '& .MuiDataGrid-cell': {
                    borderColor: '#f0f0f0',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f8f9fa',
                    borderBottom: 'none',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    backgroundColor: '#ffffff',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: 'none',
                    backgroundColor: '#f8f9fa',
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              />
              {loading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
            </Box>
          </Paper>
        </Paper>
      </Box>

      {/* Enhanced Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '& .MuiAlert-icon': {
              fontSize: '24px',
            },
          }}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Enhanced Create/Edit Task Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={styles.dialog}
      >
        <DialogTitle sx={styles.dialogTitle}>
          <Stack direction="row" alignItems="center" spacing={2}>
            {editTask ? <EditIcon /> : <AddIcon />}
            <Typography variant="h6">
              {editTask ? "Edit Task" : "Create New Task"}
            </Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={styles.dialogContent}>
          <Stack spacing={3}>
            <TextField
              label="Title"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              fullWidth
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="Description"
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            {userInfo?.role === "admin" && (
              <FormControl fullWidth variant="outlined">
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={taskData.assignedTo}
                  onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })}
                  label="Assigned To"
                  sx={{ borderRadius: '8px' }}
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonIcon sx={{ fontSize: 20 }} />
                        <Typography>{user.name}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={taskData.status}
                onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
                label="Status"
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={styles.dialogActions}>
      <Button
        onClick={() => setOpenDialog(false)}
        color="inherit"
        disabled={isSubmitting}
        sx={{
          textTransform: 'none',
          borderRadius: '8px',
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={editTask ? handleUpdateTask : handleCreateTask}
        variant="contained"
        disabled={isSubmitting}
        sx={{
          textTransform: 'none',
          borderRadius: '8px',
          px: 3,
          position: 'relative',
        }}
      >
        {isSubmitting ? (
          <>
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                left: '50%',
                marginLeft: '-12px',
              }}
            />
            <span style={{ visibility: 'hidden' }}>
              {editTask ? "Update Task" : "Create Task"}
            </span>
          </>
        ) : (
          editTask ? "Update Task" : "Create Task"
        )}
      </Button>
    </DialogActions>
      </Dialog>

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        sx={styles.dialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={styles.dialogTitle}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <DeleteIcon color="error" />
            <Typography variant="h6">Confirm Delete</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={styles.dialogContent}>
          <Typography>
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={styles.dialogActions}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            color="inherit"
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteTask(taskToDelete?._id)}
            color="error"
            variant="contained"
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
            }}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage;