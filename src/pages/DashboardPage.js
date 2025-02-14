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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExitToApp as LogoutIcon,
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

  // Snackbar state variables
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // "success", "error"

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
          const response = await axios.get("http://localhost:5000/api/users", {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          });
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

    const newTask = {
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.assignedTo,
      createdBy: userInfo._id,
      status: taskData.status,
    };

    try {
      await createTask(newTask, userInfo.token);

      // Fetch updated tasks immediately after creating a task
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

      // Show Snackbar with success message
      setSnackbarMessage("Task Created Successfully");
      setSnackbarSeverity("success");
      setOpenSnackbar(true); // Open Snackbar
    } catch (err) {
      dispatch(setError(err.message));
      setSnackbarMessage("Error Creating Task");
      setSnackbarSeverity("error");
      setOpenSnackbar(true); // Open Snackbar
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();

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

      // Show Snackbar with success message
      setSnackbarMessage("Task Updated Successfully");
      setSnackbarSeverity("success");
      setOpenSnackbar(true); // Open Snackbar
    } catch (err) {
      dispatch(setError(err.message));
      setSnackbarMessage("Error Updating Task");
      setSnackbarSeverity("error");
      setOpenSnackbar(true); // Open Snackbar
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId, userInfo.token);
      dispatch(setTasks(tasks.filter((task) => task._id !== taskId)));
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);

      setTotalTasks((prevTotalTasks) => prevTotalTasks - 1);

      // Show Snackbar with success message
      setSnackbarMessage("Task Deleted Successfully");
      setSnackbarSeverity("success");
      setOpenSnackbar(true); // Open Snackbar
    } catch (err) {
      dispatch(setError(err.message));
      setSnackbarMessage("Error Deleting Task");
      setSnackbarSeverity("error");
      setOpenSnackbar(true); // Open Snackbar
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

    // Show Snackbar with success message
    setSnackbarMessage("Logged Out Successfully");
    setSnackbarSeverity("success");
    setOpenSnackbar(true); // Open Snackbar
  };

  const columns = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1.5,
      minWidth: 300,
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
              return assignedUser ? assignedUser.name : "Not Assigned";
            },
          },
        ]
      : []),
    {
      field: "status",
      headerName: "Status",
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor:
              params.value === "completed"
                ? "success.light"
                : params.value === "in-progress"
                ? "warning.light"
                : "info.light",
            color: "text.primary",
            px: 2,
            py: 0.5,
            borderRadius: 1,
            width: "100%",
            textAlign: "center",
          }}
        >
          {params.value.toUpperCase()}
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      renderCell: (params) =>
        new Date(params.value).toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        }),
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
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          {userInfo?.role === "admin" && (
            <Tooltip title="Delete Task" arrow>
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(params.row)}
                color="error"
              >
                <DeleteIcon />
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
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: "medium" }}
            >
              Task Dashboard
            </Typography>
            {userInfo?.role === "admin" && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
              >
                Create Task
              </Button>
            )}
            {userInfo?.role === "admin" && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/register")}
                sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
              >
                Add User
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
            >
              Logout
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Paper
            elevation={1}
            sx={{
              height: 600,
              width: "100%",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <DataGrid
              rows={tasks}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[5, 10, 20]}
              page={page}
              pagination
              paginationMode="server"
              rowCount={totalTasks}
              onPageChange={(newPage) => {
                setPage(newPage);
              }}
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
                "& .MuiDataGrid-cell": {
                  backgroundColor: "#f5f5f5", // Optional: change the background color for the cells
                },
              }}
            />
          </Paper>
        </Paper>
      </Box>

      {/* Snackbar for displaying messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%", backgroundColor: "green", color: "white" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Create/Edit Task Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editTask ? "Edit Task" : "Create New Task"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={taskData.title}
              onChange={(e) =>
                setTaskData({ ...taskData, title: e.target.value })
              }
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Description"
              value={taskData.description}
              onChange={(e) =>
                setTaskData({ ...taskData, description: e.target.value })
              }
              fullWidth
              multiline
              rows={4}
              variant="outlined"
            />
            {userInfo?.role === "admin" && (
              <FormControl fullWidth variant="outlined">
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={taskData.assignedTo}
                  onChange={(e) =>
                    setTaskData({ ...taskData, assignedTo: e.target.value })
                  }
                  label="Assigned To"
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={taskData.status}
                onChange={(e) =>
                  setTaskData({ ...taskData, status: e.target.value })
                }
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={editTask ? handleUpdateTask : handleCreateTask}
            variant="contained"
            sx={{ textTransform: "none", px: 3 }}
          >
            {editTask ? "Update Task" : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this task? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteTask(taskToDelete?._id)}
            color="error"
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage;
