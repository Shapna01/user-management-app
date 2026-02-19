"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);   
  const [editUser, setEditUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [showUsers, setShowUsers] = useState(false);


  useEffect(() => {
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    if (!sessionUser) router.push("/");
    else setUser(sessionUser);
  }, [router]);

  useEffect(() => {
    if (!user) return;

    fetch("https://dummyjson.com/products")
      .then(res => res.json())
      .then(data => {
        if (user.role === "viewer") {
          const beautyProducts = data.products.filter(p =>
            p.category.toLowerCase().includes("beauty")
          );
          setProducts(beautyProducts);
        } else {
          setProducts(data.products);
        }
      });
  }, [user]);

  
  useEffect(() => {
    if (!showUsers) return;

    fetch("https://dummyjson.com/users")
      .then(res => res.json())
      .then(data => setUsers(data.users));
  }, [showUsers]);

  if (!user) return null;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300">

      
      <div className="flex justify-between items-center bg-white shadow-md px-8 py-4 rounded-xl mb-8">
        <h1 className="text-2xl font-bold text-blue-700">User Management</h1>

        <div className="flex items-center gap-6 font-medium text-gray-700">

          {user.role === "admin" && (
            <>
              <button onClick={() => setShowUsers(false)}>Products</button>
              <button onClick={() => setShowUsers(true)}>Users</button>
            </>
          )}

          {user.role === "user" && (
            <>
              <button onClick={() => setShowUsers(false)}>Products</button>
              <button onClick={() => setEditUser(user)}>Profile</button>
            </>
          )}

          {user.role === "viewer" && (
            <button onClick={() => setShowUsers(false)}>Products</button>
          )}

          <button
            onClick={() => {
              sessionStorage.removeItem("user");
              router.push("/");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      
      {user.role === "admin" && showUsers && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Users</h2>

          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Id</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Phone No</th>
                <th className="p-2 border">Edit</th>

              </tr>
            </thead>

            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="p-2 border">{u.id}</td>
                  <td className="p-2 border">{u.firstName}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.phone}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => setEditUser(u)}
                      className="bg-sky-700 text-white px-3 py-1 rounded"
                    >
                    🖉
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      
      {!showUsers && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Products</h2>

          <div className="grid grid-cols-4 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-xl shadow">
                <img src={p.thumbnail} className="h-40 w-full object-cover rounded mb-2" />
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-gray-500">{p.category}</p>
                <p className="text-green-600 font-bold">${p.price}</p>
              </div>
            ))}
          </div>
        </>
      )}

    
      {editUser && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40">
    <div className="bg-white p-6 rounded-xl shadow-xl w-[350px]">
      <h2 className="text-lg font-bold mb-3">Edit User</h2>

      <input
        value={editUser.firstName || ""}
        onChange={(e) =>
          setEditUser({ ...editUser, firstName: e.target.value })
        }
        className="border p-2 w-full mb-3 rounded"
        placeholder="Name"
      />

      <input
        value={editUser.email || ""}
        onChange={(e) =>
          setEditUser({ ...editUser, email: e.target.value })
        }
        className="border p-2 w-full mb-3 rounded"
        placeholder="Email"
      />

      <button
        onClick={() => {
          setUsers(prev =>
            prev.map(u => (u.id === editUser.id ? editUser : u))
          );

          if (user.id === editUser.id) {
            setUser(editUser);
            sessionStorage.setItem("user", JSON.stringify(editUser));
          }

          setEditUser(null);
        }}
        className="bg-purple-600 text-white px-4 py-2 rounded w-full mb-2"
      >
        Save
      </button>

      <button
        onClick={() => setEditUser(null)}
        className="bg-gray-500 text-white px-4 py-2 rounded w-full"
      >
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
}
