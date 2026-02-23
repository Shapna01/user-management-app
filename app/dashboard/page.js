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

  const [showRegister, setShowRegister] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [productPage, setProductPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));

    if (!sessionUser) router.push("/");
    else setUser(sessionUser);
  }, [router]);

  const USER_API = process.env.NEXT_PUBLIC_API_URL;
  const PRODUCT_API = process.env.NEXT_PUBLIC_PRODUCT_API;

  useEffect(() => {
    if (!user) return;

    fetch(PRODUCT_API + "/products")    
      .then((res) => res.json())
      .then((data) => {
        if (user.role === "viewer") {
          const beautyProducts = data.products.filter((p) =>
            p.category.toLowerCase().includes("beauty")
          );
          setProducts(beautyProducts);
        } else setProducts(data.products);
      });
  }, [user]);

  useEffect(() => {
    if (!showUsers) return;

    fetch(USER_API + "/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, [showUsers]);

  const filteredProducts = products.filter((p) => {
    const text = search.toLowerCase();

    const matchSearch =
      p.title.toLowerCase().includes(text) ||
      p.category.toLowerCase().includes(text);

    const matchCategory = category === "all" || p.category === category;

    return matchSearch && matchCategory;
  });

  const productStart = (productPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    productStart,
    productStart + itemsPerPage
  );

  const userStart = (userPage - 1) * itemsPerPage;
  const paginatedUsers = users.slice(userStart, userStart + itemsPerPage);

  const totalProductPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const totalUserPages = Math.ceil(users.length / itemsPerPage);

  const handleRegister = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("All fields required");
      return;
    }

    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful!");
        setNewUser({ name: "", email: "", password: "", role: "user" });
        setShowRegister(false);
        setShowUsers(true);
        setUserPage(1);
      } else alert(data.error || "Registration failed");
    } catch {
      alert("Something went wrong");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300">
      
      <div className="flex justify-between items-center bg-white shadow-md px-8 py-4 rounded-xl mb-8">
        <h1 className="text-2xl font-bold text-blue-700">User Management</h1>

        <div className="flex items-center gap-6 font-medium text-gray-700">
          {user.role === "admin" && (
            <>
              <button onClick={() => setShowRegister(true)}>Register</button>
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
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Edit</th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.map((u) => (
                <tr key={u.id}>
                  <td className="p-2 border">{u.id}</td>
                  <td className="p-2 border">{u.name}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.role}</td>
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

          <div className="flex justify-center mt-6 gap-4">
            <button
              disabled={userPage === 1}
              onClick={() => setUserPage(userPage - 1)}
              className="px-4 py-1 bg-gray-300 rounded"
            >
              Prev
            </button>

            <span className="font-bold">
              {userPage} / {totalUserPages}
            </span>

            <button
              disabled={userPage === totalUserPages}
              onClick={() => setUserPage(userPage + 1)}
              className="px-4 py-1 bg-gray-300 rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {!showUsers && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-indigo-800">Products</h2>

          <div className="flex gap-8 mb-9">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setProductPage(1);
              }}
              className="border px-2 py-2 rounded w-1/2 border-violet-800"
            />

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setProductPage(1);
              }}
              className="border px-4 py-2 rounded border-violet-800 bg-violet-300"
            >
              <option value="all">All</option>
              <option value="beauty">Beauty</option>
              <option value="fragrances">Fragrances</option>
              <option value="groceries">Groceries</option>
              <option value="furniture">Furniture</option>
            </select>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {paginatedProducts.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-xl shadow">
                <img
                  src={p.thumbnail}
                  className="h-40 w-full object-cover rounded mb-2"
                  alt={p.title}
                />
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-gray-500">{p.category}</p>
                <p className="text-green-600 font-bold">${p.price}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6 gap-4">
            <button
              disabled={productPage === 1}
              onClick={() => setProductPage(productPage - 1)}
              className="px-4 py-1 bg-gray-300 rounded"
            >
              Prev
            </button>

            <span className="font-bold">
              {productPage} / {totalProductPages}
            </span>

            <button
              disabled={productPage === totalProductPages}
              onClick={() => setProductPage(productPage + 1)}
              className="px-4 py-1 bg-gray-300 rounded"
            >
              Next
            </button>
          </div>
        </>
      )}

      {editUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[350px]">
            <h2 className="text-lg font-bold mb-3">Edit User</h2>

            <input
              value={editUser.name || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, name: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded"
            />

            <input
              value={editUser.email || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded"
            />

            <button
              onClick={() => {
                setUsers((prev) =>
                  prev.map((u) => (u.id === editUser.id ? editUser : u))
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

      {showRegister && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[350px]">
            <h2 className="text-2xl font-bold mb-4 text-center text-fuchsia-700">
              Create New User
            </h2>

            <input
              placeholder="Name"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({ ...newUser, name: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded"
            />

            <input
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded"
            />

            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded"
            />

            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="viewer">Viewer</option>
            </select>

            <button
              onClick={handleRegister}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded w-full mb-2"
            >
              Register
            </button>

            <button
              onClick={() => setShowRegister(false)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}