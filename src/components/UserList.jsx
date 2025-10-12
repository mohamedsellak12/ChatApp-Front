import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { socket } from "../utils/socket";

export default function UserList() {
  const { user, setUser } = useAuth();
  const [users, setUsers] = useState([]);

  // fetch initial users
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("http://localhost:5000/api/users/all", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, [user.token]);

  // listen real-time status changes
  useEffect(() => {
    socket.on("userStatusChange", (data) => {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === data.userId ? { ...u, status: data.status } : u
        )
      );

      // si c'est ton propre status, update context aussi
      if (data.userId === user.user._id) {
        setUser((prev) => ({
          ...prev,
          user: { ...prev.user, status: data.status },
        }));
      }
    });

    return () => {
      socket.off("userStatusChange");
    };
  }, [user, setUser]);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <ul className="space-y-3">
        {users.map((u) => (
          <li
            key={u._id}
            className="p-2 border rounded flex items-center gap-3"
          >
            <img
              src={u.avatar?`http://localhost:5000${u.avatar}`:"/image.png"}
              alt={u.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{u.username}</p>
              <p
                className={
                  u.status === "online"
                    ? "text-green-600 text-sm"
                    : "text-gray-400 text-sm"
                }
              >
                {u.status}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
