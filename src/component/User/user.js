import React, { useState, useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./style.css";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {type === "success" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24"
            height="24"
          >
            <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24"
            height="24"
          >
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.5 5h3v10h-3v-10zm1.5 15.25c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" />
          </svg>
        )}
      </div>
      <div className="toast-message">{message}</div>
    </div>
  );
};

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="dialog-overlay">
    <div className="confirm-dialog">
      <div className="confirm-title">Confirm Action</div>
      <div className="confirm-message">{message}</div>
      <div className="confirm-actions">
        <button className="button button-outline" onClick={onCancel}>
          Cancel
        </button>
        <button className="button button-danger" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    </div>
  </div>
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({ id: "", name: "" });
  const [editUser, setEditUser] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/getusers");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      showToast("Failed to fetch users", "error");
    }
  };

  const addUser = async () => {
    if (!user.id || !user.name) {
      showToast("Please fill in all fields", "error");
      return;
    }
    try {
      await fetch("http://localhost:8080/api/v1/adduser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      fetchUsers();
      setUser({ id: "", name: "" });
      showToast("User added successfully");
    } catch (error) {
      showToast("Failed to add user", "error");
    }
  };

  const deleteUser = async (id) => {
    setConfirmDialog({
      message: "Are you sure you want to delete this user?",
      onConfirm: async () => {
        try {
          await fetch("http://localhost:8080/api/v1/deleteuser", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          fetchUsers();
          showToast("User deleted successfully");
        } catch (error) {
          showToast("Failed to delete user", "error");
        }
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const saveEditUser = async () => {
    if (!editUser.name) {
      showToast("Please fill in all fields", "error");
      return;
    }
    try {
      await fetch("http://localhost:8080/api/v1/updateuser", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUser),
      });
      fetchUsers();
      setDialogVisible(false);
      showToast("User updated successfully");
    } catch (error) {
      showToast("Failed to update user", "error");
    }
  };
  return (
    <div className="container">
      <div className="card">
        <h2 className="title">User Management</h2>

        <div className="form-group">
          <input
            type="text"
            className="input-field"
            placeholder="ID"
            value={user.id}
            onChange={(e) => setUser({ ...user, id: e.target.value })}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
          />
          <button className="button button-primary" onClick={addUser}>
            Add User
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <TransitionGroup component={null}>
                {users.map((user) => (
                  <CSSTransition key={user.id} timeout={300} classNames="row">
                    <tr>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="button button-outline"
                            onClick={() => {
                              setEditUser(user);
                              setDialogVisible(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="button button-danger"
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  </CSSTransition>
                ))}
              </TransitionGroup>
            </tbody>
          </table>
        </div>
      </div>

      {dialogVisible && (
        <div className="dialog-overlay" onClick={() => setDialogVisible(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="dialog-title">Edit User</h3>
            <div className="dialog-form">
              <div>
                <label className="label">ID</label>
                <input
                  type="text"
                  className="input-field"
                  value={editUser?.id || ""}
                  disabled
                />
              </div>
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={editUser?.name || ""}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                />
              </div>
              <button className="button button-primary" onClick={saveEditUser}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="toast-container">
        <TransitionGroup>
          {toasts.map((toast) => (
            <CSSTransition key={toast.id} timeout={300} classNames="toast">
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </div>
  );
};

export default UserManagement;
