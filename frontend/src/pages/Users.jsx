import { useState, useEffect } from "react";
import api from "../api/axios";
import UserModal from "../components/UserModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";

function Users() {
  const { user: currentUser } = useAuth();
  // Login stores the id as `id`; /auth/me returns `_id` — handle both.
  const myId = currentUser?._id || currentUser?.id;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // user pending delete
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  // Actually delete the user once confirmed in the dialog.
  const confirmDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/users/${confirmTarget._id}`);
      setConfirmTarget(null);
      fetchUsers();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add User
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    {u._id === myId ? (
                      <span className="text-gray-400 text-xs">You</span>
                    ) : (
                      <button
                        onClick={() => {
                          setConfirmTarget(u);
                          setDeleteError("");
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <UserModal onClose={() => setShowModal(false)} onSaved={fetchUsers} />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title="Delete user"
          message={`Delete user "${confirmTarget.name}"? This cannot be undone.`}
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}

export default Users;
