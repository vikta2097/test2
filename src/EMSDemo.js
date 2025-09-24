// BusinessDemoFull.js
import React, { useEffect, useState } from "react";

/*
  Full frontend-only e-commerce demo (localStorage)
  - Single file, inline styles
  - Roles: admin / customer
  - Data persisted under keys: demo_products, demo_users, demo_cart_{username}, demo_orders, demo_notifications, demo_bookings
*/

/* ---------- Utilities & Sample Data ---------- */
const LS = {
  get: (k, fallback) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  remove: (k) => localStorage.removeItem(k),
};

const SAMPLE_PRODUCTS = [
  { id: 1, name: "Smartphone", description: "Modern smartphone", price: 250, stock: 10, image: "https://via.placeholder.com/300?text=Smartphone" },
  { id: 2, name: "Headphones", description: "Noise-cancelling headphones", price: 50, stock: 20, image: "https://via.placeholder.com/300?text=Headphones" },
  { id: 3, name: "Laptop", description: "Lightweight laptop", price: 800, stock: 5, image: "https://via.placeholder.com/300?text=Laptop" },
];

const sampleUsers = [
  { username: "admin", role: "admin", name: "Admin User" },
  { username: "alice", role: "customer", name: "Alice Customer" },
];

/* ---------- Inline Styles ---------- */
const theme = {
  blue: "#005bb5",
  lightBlue: "#66b3ff",
  bg: "#f0f6fc",
  card: "#ffffff",
};

const S = {
  page: { minHeight: "100vh", fontFamily: "Inter, Arial, sans-serif", background: theme.bg, color: "#123" },
  centerWrap: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
  loginBox: { background: theme.card, padding: 20, borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.08)", width: 360 },
  btn: (bg = theme.blue, color = "#fff") => ({ background: bg, color, border: "none", padding: "10px 12px", borderRadius: 8, cursor: "pointer" }),
  appWrap: { display: "flex", minHeight: "100vh" },
  sidebar: { width: 260, background: theme.card, padding: 20, borderRight: "1px solid #e6eef9", display: "flex", flexDirection: "column" },
  navBtn: { padding: "10px 12px", marginBottom: 8, borderRadius: 8, border: "none", textAlign: "left", cursor: "pointer", background: "none", fontWeight: 600 },
  activeNav: { background: theme.blue, color: "#fff" },
  main: { flex: 1, padding: 24, overflowY: "auto" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 },
  card: { background: theme.card, borderRadius: 12, padding: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.06)" },
  img: { width: "100%", height: 150, objectFit: "cover", borderRadius: 8 },
  small: { fontSize: 13, color: "#556" },
  input: { padding: 8, borderRadius: 8, border: "1px solid #d4e6fb", width: "100%" },
  formRow: { marginBottom: 10 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: 8, borderBottom: "1px solid #eee" },
  td: { padding: 8, borderBottom: "1px solid #f5f7fb" },
  badge: (bg) => ({ display: "inline-block", padding: "4px 8px", borderRadius: 12, background: bg, color: "#fff", fontSize: 12 }),
};

/* ---------- Main Component ---------- */
export default function BusinessDemoFull() {
  /* ---------- persisted state keys ---------- */
  const PROD_KEY = "demo_products";
  const USER_KEY = "demo_users";
  const ORDERS_KEY = "demo_orders";
  const NOTIF_KEY = "demo_notifications";
  const BOOK_KEY = "demo_bookings";

  /* ---------- state ---------- */
  const [user, setUser] = useState(null); // { username, role, name }
  const [view, setView] = useState("shop"); // shop, admin, cart, orders, dashboard, bookings, notifications, profile
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [cart, setCart] = useState([]); // live cart for signed-in user
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [bookings, setBookings] = useState([]);

  /* ---------- initialize from localStorage ---------- */
  useEffect(() => {
    const p = LS.get(PROD_KEY, null);
    if (!p) LS.set(PROD_KEY, SAMPLE_PRODUCTS);
    setProducts(LS.get(PROD_KEY, SAMPLE_PRODUCTS));

    const us = LS.get(USER_KEY, null);
    if (!us) LS.set(USER_KEY, sampleUsers);
    // orders, notifications, bookings
    setOrders(LS.get(ORDERS_KEY, []));
    setNotifications(LS.get(NOTIF_KEY, []));
    setBookings(LS.get(BOOK_KEY, []));
  }, []);

  /* ---------- keep user-specific cart in localStorage key demo_cart_{username} ---------- */
  useEffect(() => {
    if (user) {
      const key = `demo_cart_${user.username}`;
      const saved = LS.get(key, []);
      setCart(saved);
    } else {
      setCart([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const key = `demo_cart_${user.username}`;
      LS.set(key, cart);
    }
  }, [cart, user]);

  /* ---------- helpers ---------- */
  const saveProducts = (next) => {
    LS.set(PROD_KEY, next);
    setProducts(next);
  };
  const saveOrders = (next) => {
    LS.set(ORDERS_KEY, next);
    setOrders(next);
  };
  const saveNotifs = (next) => {
    LS.set(NOTIF_KEY, next);
    setNotifications(next);
  };
  const saveBookings = (next) => {
    LS.set(BOOK_KEY, next);
    setBookings(next);
  };

  const login = (username) => {
    const users = LS.get(USER_KEY, sampleUsers);
    const found = users.find((u) => u.username === username);
    if (found) {
      setUser(found);
      setView(found.role === "admin" ? "admin" : "shop");
    } else {
      alert("User not found (demo). Try 'admin' or 'alice'.");
    }
  };

  const registerDemoUser = (username, name) => {
    const users = LS.get(USER_KEY, sampleUsers);
    if (users.find((u) => u.username === username)) {
      alert("Username exists. Choose another.");
      return;
    }
    const newU = { username, role: "customer", name };
    users.push(newU);
    LS.set(USER_KEY, users);
    setUser(newU);
    setView("shop");
  };

  const logout = () => {
    setUser(null);
    setView("shop");
  };

  /* ---------- product management (admin) ---------- */
  const addProduct = (prod) => {
    const next = [...products, prod];
    saveProducts(next);
  };
  const updateProduct = (id, patch) => {
    const next = products.map((p) => (p.id === id ? { ...p, ...patch } : p));
    saveProducts(next);
  };
  const deleteProduct = (id) => {
    if (!window.confirm("Delete product?")) return;
    const next = products.filter((p) => p.id !== id);
    saveProducts(next);
  };

  /* ---------- cart ---------- */
  const addToCart = (product, qty = 1) => {
    if (!user) return alert("Please login as a customer to add to cart.");
    // check stock
    const p = products.find((x) => x.id === product.id);
    if (p && p.stock < qty) {
      return alert("Not enough stock.");
    }
    const exists = cart.find((c) => c.id === product.id);
    let next;
    if (exists) {
      next = cart.map((c) => (c.id === product.id ? { ...c, qty: c.qty + qty } : c));
    } else {
      next = [...cart, { ...product, qty }];
    }
    setCart(next);
  };

  const updateCartQty = (id, qty) => {
    if (qty <= 0) {
      setCart(cart.filter((c) => c.id !== id));
      return;
    }
    setCart(cart.map((c) => (c.id === id ? { ...c, qty } : c)));
  };

  /* ---------- checkout (creates order) ---------- */
  const checkout = (customerDetails = {}) => {
    if (!user) return alert("Please login to checkout.");
    if (cart.length === 0) return alert("Cart is empty.");
    // validate stock
    for (const item of cart) {
      const prod = products.find((p) => p.id === item.id);
      if (!prod || prod.stock < item.qty) return alert(`Not enough stock for ${item.name}`);
    }
    // decrement stock
    const nextProducts = products.map((p) => {
      const cartItem = cart.find((c) => c.id === p.id);
      if (cartItem) return { ...p, stock: p.stock - cartItem.qty };
      return p;
    });
    saveProducts(nextProducts);

    const newOrder = {
      id: Date.now(),
      customer: user.username,
      customerName: user.name,
      items: cart.map((c) => ({ id: c.id, name: c.name, price: c.price, qty: c.qty })),
      total: cart.reduce((s, it) => s + it.price * it.qty, 0),
      status: "pending",
      createdAt: new Date().toISOString(),
      details: customerDetails,
    };
    const nextOrders = [newOrder, ...orders];
    saveOrders(nextOrders);

    // clear cart
    setCart([]);
    alert("✅ Order placed (demo).");
    setView("orders");
  };

  /* ---------- orders admin actions ---------- */
  const updateOrderStatus = (orderId, status) => {
    const next = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    saveOrders(next);
  };

  /* ---------- notifications ---------- */
  const postNotification = (title, message) => {
    const n = { id: Date.now(), title, message, postedAt: new Date().toISOString() };
    const next = [n, ...notifications];
    saveNotifs(next);
  };
  const removeNotification = (id) => {
    const next = notifications.filter((n) => n.id !== id);
    saveNotifs(next);
  };

  /* ---------- bookings ---------- */
  const createBooking = (booking) => {
    const b = { id: Date.now(), ...booking, status: "requested", createdAt: new Date().toISOString() };
    const next = [b, ...bookings];
    saveBookings(next);
  };
  const updateBookingStatus = (id, status) => {
    const next = bookings.map((b) => (b.id === id ? { ...b, status } : b));
    saveBookings(next);
  };

  /* ---------- filtering & derived ---------- */
  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (q && !(`${p.name} ${p.description}`.toLowerCase().includes(q))) return false;
    if (filter === "outofstock") return p.stock === 0;
    if (filter === "lowstock") return p.stock > 0 && p.stock <= 5;
    return true;
  });

  const totalCart = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalSales = orders.reduce((s, o) => s + (o.status !== "cancelled" ? o.total : 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;

  /* ---------- small UI subcomponents ---------- */
  const LoginView = () => {
    const [userIn, setUserIn] = useState("alice");
    const [registerName, setRegisterName] = useState("");
    const [registerUser, setRegisterUser] = useState("");
    return (
      <div style={{ ...S.centerWrap }}>
        <div style={S.loginBox}>
          <h2 style={{ marginTop: 0 }}>VictorLabs — Demo Store</h2>
          <p className="small">Login as a demo user</p>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <select value={userIn} onChange={(e) => setUserIn(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8 }}>
              <option value="admin">admin (admin)</option>
              <option value="alice">alice (customer)</option>
            </select>
            <button style={S.btn()} onClick={() => login(userIn)}>Login</button>
          </div>

          <hr style={{ margin: "14px 0" }} />

          <h4 style={{ marginBottom: 8 }}>Register (demo)</h4>
          <input placeholder="Full name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} style={{ ...S.input, marginBottom: 8 }} />
          <input placeholder="Username" value={registerUser} onChange={(e) => setRegisterUser(e.target.value)} style={{ ...S.input, marginBottom: 8 }} />
          <button style={S.btn(theme.lightBlue)} onClick={() => { if (!registerName || !registerUser) return alert("Fill both"); registerDemoUser(registerUser.trim(), registerName.trim()); }}>
            Register & Login
          </button>

          <p style={{ marginTop: 12, fontSize: 13 }} className="small">
            Demo store uses <b>localStorage</b>. You can register and try features — nothing is sent anywhere.
          </p>
        </div>
      </div>
    );
  };

  const Sidebar = () => (
    <div style={S.sidebar}>
      <h3 style={{ color: theme.blue }}>VictorLabs Demo</h3>
      <div style={{ marginTop: 8 }}>
        <button style={{ ...S.navBtn, ...(view === "dashboard" ? S.activeNav : {}) }} onClick={() => setView("dashboard")}>Dashboard</button>
        <button style={{ ...S.navBtn, ...(view === "shop" ? S.activeNav : {}) }} onClick={() => setView("shop")}>Shop</button>
        <button style={{ ...S.navBtn, ...(view === "cart" ? S.activeNav : {}) }} onClick={() => setView("cart")}>Cart ({cart.length})</button>
        <button style={{ ...S.navBtn, ...(view === "orders" ? S.activeNav : {}) }} onClick={() => setView("orders")}>Orders</button>
        <button style={{ ...S.navBtn, ...(view === "bookings" ? S.activeNav : {}) }} onClick={() => setView("bookings")}>Bookings</button>
        <button style={{ ...S.navBtn, ...(view === "notifications" ? S.activeNav : {}) }} onClick={() => setView("notifications")}>Notifications</button>
      </div>

      <div style={{ marginTop: "auto" }}>
        {user ? (
          <>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>{user.name}</div>
              <div style={{ fontSize: 13, color: "#556" }}>{user.role}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btn(theme.lightBlue)} onClick={() => setView("profile")}>Profile</button>
              <button style={S.btn("#e24b4b")} onClick={logout}>Logout</button>
            </div>
          </>
        ) : (
          <div>
            <button style={S.btn()} onClick={() => setView("login")}>Login / Register</button>
          </div>
        )}
      </div>
    </div>
  );

  /* ---------- admin product form modal (simple inline) ---------- */
  function AdminProductManager() {
    const empty = { id: null, name: "", description: "", price: 0, stock: 1, image: "" };
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);

    useEffect(() => {
      if (editing) {
        const prod = products.find((p) => p.id === editing);
        setForm(prod ? { ...prod } : empty);
      } else {
        setForm(empty);
      }
    }, [editing]);

    const startNew = () => { setEditing("new"); setForm({ ...empty, id: Date.now() }); };
    const save = () => {
      if (!form.name) return alert("Provide name");
      if (editing === "new") {
        addProduct(form);
      } else {
        updateProduct(form.id, form);
      }
      setEditing(null);
    };

    return (
      <div>
        <div style={S.headerRow}>
          <h2 style={{ margin: 0 }}>Product Management</h2>
          <div>
            <button style={S.btn()} onClick={startNew}>+ New Product</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
          <div>
            <div style={S.cardGrid}>
              {products.map((p) => (
                <div key={p.id} style={S.card}>
                  <img src={p.image} alt={p.name} style={S.img} />
                  <h3>{p.name}</h3>
                  <p style={S.small}>{p.description}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>${p.price}</div>
                      <div style={{ fontSize: 12, color: "#446" }}>Stock: {p.stock}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={S.btn()} onClick={() => setEditing(p.id)}>Edit</button>
                      <button style={S.btn("#e24b4b")} onClick={() => deleteProduct(p.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside style={{ ...S.card }}>
            <h3 style={{ marginTop: 0 }}>{editing ? (editing === "new" ? "New Product" : "Edit Product") : "Select a product"}</h3>
            <div style={S.formRow}>
              <label className="small">Name</label>
              <input style={S.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={S.formRow}>
              <label className="small">Description</label>
              <textarea style={{ ...S.input, height: 80 }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input type="number" style={{ ...S.input, width: "50%" }} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              <input type="number" style={{ ...S.input, width: "50%" }} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
            <div style={S.formRow}>
              <label className="small">Image URL</label>
              <input style={S.input} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.btn(theme.lightBlue)} onClick={save} disabled={!editing}>Save</button>
              <button style={S.btn("#888")} onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  /* ---------- Shop view ---------- */
  const ShopView = () => {
    return (
      <div>
        <div style={S.headerRow}>
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...S.input, flex: 1 }} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
              <option value="">All</option>
              <option value="lowstock">{`Low stock (<=5)`}</option>
              <option value="outofstock">Out of stock</option>
            </select>
            <button style={S.btn()} onClick={() => { setSearch(""); setFilter(""); }}>Clear</button>
          </div>
        </div>

        <div style={S.cardGrid}>
          {filteredProducts.map((p) => (
            <div key={p.id} style={S.card}>
              <img src={p.image} alt={p.name} style={S.img} />
              <h3>{p.name}</h3>
              <p style={S.small}>{p.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>${p.price}</div>
                  <div style={S.small}>Stock: {p.stock}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button style={S.btn()} onClick={() => addToCart(p, 1)} disabled={p.stock === 0}>Add</button>
                  <button style={{ ...S.btn("#999") }} onClick={() => { setView("shop"); alert("Preview only."); }}>Preview</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ---------- Cart view ---------- */
  const CartView = () => {
    return (
      <div>
        <div style={S.headerRow}>
          <h2>Cart</h2>
        </div>
        <div style={S.card}>
          {cart.length === 0 ? <p>Cart is empty</p> : (
            <>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Product</th>
                    <th style={S.th}>Price</th>
                    <th style={S.th}>Qty</th>
                    <th style={S.th}>Subtotal</th>
                    <th style={S.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((c) => (
                    <tr key={c.id}>
                      <td style={S.td}>{c.name}</td>
                      <td style={S.td}>${c.price}</td>
                      <td style={S.td}>
                        <input type="number" value={c.qty} min={1} style={{ width: 72 }} onChange={(e) => updateCartQty(c.id, Number(e.target.value))} />
                      </td>
                      <td style={S.td}>${(c.price * c.qty).toFixed(2)}</td>
                      <td style={S.td}><button style={{ ...S.btn("#e24b4b") }} onClick={() => updateCartQty(c.id, 0)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Total: ${totalCart.toFixed(2)}</div>
                  <div style={S.small}>Taxes and shipping are demo-only (not calculated)</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={S.btn()} onClick={() => setView("shop")}>Continue Shopping</button>
                  <button style={S.btn(theme.lightBlue)} onClick={() => {
                    // simple details prompt
                    const phone = prompt("Phone number (demo):", "");
                    checkout({ phone });
                  }}>Checkout (Demo)</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  /* ---------- Orders view (both customer & admin) ---------- */
  const OrdersView = () => {
    const my = user ? orders.filter((o) => (user.role === "admin" ? true : o.customer === user.username)) : [];
    return (
      <div>
        <div style={S.headerRow}>
          <h2>Orders {user && user.role !== "admin" ? `— ${user.username}` : ""}</h2>
          <div style={S.small}>Total orders: {totalOrders} • Sales total: ${totalSales.toFixed(2)}</div>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {my.length === 0 ? <div style={S.card}>No orders found.</div> : my.map((o) => (
            <div key={o.id} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 800 }}>Order #{o.id}</div>
                  <div style={S.small}>Placed: {new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ textAlign: "right" }}>
                    <div>Total: ${o.total.toFixed(2)}</div>
                    <div style={{ marginTop: 6 }}><span style={S.badge(o.status === "pending" ? "#f59e0b" : o.status === "shipped" ? "#3b82f6" : "#10b981")}>{o.status}</span></div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <table style={S.table}>
                  <thead><tr><th style={S.th}>Item</th><th style={S.th}>Qty</th><th style={S.th}>Price</th></tr></thead>
                  <tbody>
                    {o.items.map((it) => (<tr key={it.id}><td style={S.td}>{it.name}</td><td style={S.td}>{it.qty}</td><td style={S.td}>${it.price}</td></tr>))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                {user && user.role === "admin" && (
                  <>
                    <button style={S.btn()} onClick={() => updateOrderStatus(o.id, "shipped")}>Mark Shipped</button>
                    <button style={S.btn("#f97316")} onClick={() => updateOrderStatus(o.id, "delivered")}>Mark Delivered</button>
                    <button style={S.btn("#e24b4b")} onClick={() => updateOrderStatus(o.id, "cancelled")}>Cancel</button>
                  </>
                )}
                {user && user.role !== "admin" && o.status === "pending" && (
                  <button style={S.btn("#e24b4b")} onClick={() => { if (!window.confirm("Cancel order?")) return; updateOrderStatus(o.id, "cancelled"); }}>Cancel Order</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ---------- Notifications view ---------- */
  const NotificationsView = () => {
    const [title, setTitle] = useState("");
    const [msg, setMsg] = useState("");
    return (
      <div>
        <div style={S.headerRow}><h2>Notifications</h2></div>

        {user && user.role === "admin" && (
          <div style={{ ...S.card, marginBottom: 12 }}>
            <h4>Create Notification</h4>
            <input style={S.input} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea style={{ ...S.input, marginTop: 8 }} placeholder="Message" value={msg} onChange={(e) => setMsg(e.target.value)} />
            <div style={{ marginTop: 8 }}>
              <button style={S.btn(theme.lightBlue)} onClick={() => { if (!title || !msg) return alert("Fill both"); postNotification(title, msg); setTitle(""); setMsg(""); }}>Post</button>
            </div>
          </div>
        )}

        <div style={S.card}>
          {notifications.length === 0 ? <p>No notifications</p> : notifications.map((n) => (
            <div key={n.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{n.title}</div>
                  <div style={S.small}>{new Date(n.postedAt).toLocaleString()}</div>
                </div>
                {user && user.role === "admin" && <button style={S.btn("#e24b4b")} onClick={() => removeNotification(n.id)}>Delete</button>}
              </div>
              <div style={{ marginTop: 6 }}>{n.message}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ---------- Bookings view ---------- */
  const BookingsView = () => {
    const [service, setService] = useState("");
    const [date, setDate] = useState("");
    const submitBooking = () => {
      if (!user) return alert("Login to create booking.");
      if (!service || !date) return alert("Fill service and date.");
      createBooking({ service, date, customer: user.username, customerName: user.name });
      setService(""); setDate("");
      alert("Booking requested (demo).");
    };

    return (
      <div>
        <div style={S.headerRow}><h2>Bookings</h2></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
          <div>
            <div style={S.card}>
              <h4>Request Booking</h4>
              <div style={S.formRow}><input placeholder="Service (e.g., Consultation)" value={service} onChange={(e) => setService(e.target.value)} style={S.input} /></div>
              <div style={S.formRow}><input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} style={S.input} /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={S.btn()} onClick={submitBooking}>Request</button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <h4>Your bookings</h4>
              {bookings.filter(b => user ? (user.role === "admin" ? true : b.customer === user.username) : false).length === 0 ? <div style={S.card}>No bookings</div> :
                bookings.filter(b => user ? (user.role === "admin" ? true : b.customer === user.username) : false).map(b => (
                  <div key={b.id} style={{ ...S.card, marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{b.service}</div>
                        <div style={S.small}>{new Date(b.createdAt).toLocaleString()}</div>
                        <div style={S.small}>For: {new Date(b.date).toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={S.badge(b.status === "requested" ? "#f59e0b" : b.status === "confirmed" ? "#3b82f6" : "#10b981")}>{b.status}</div>
                      </div>
                    </div>
                    {user && user.role === "admin" && (
                      <div style={{ marginTop: 8 }}>
                        <button style={S.btn()} onClick={() => updateBookingStatus(b.id, "confirmed")}>Confirm</button>
                        <button style={S.btn("#e24b4b")} onClick={() => updateBookingStatus(b.id, "cancelled")}>Cancel</button>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          </div>

          <aside>
            <div style={S.card}>
              <h4>All Bookings (Admin)</h4>
              <div style={S.small}>Total: {bookings.length}</div>
            </div>
          </aside>
        </div>
      </div>
    );
  };

  /* ---------- Dashboard ---------- */
  const DashboardView = () => (
    <div>
      <div style={S.headerRow}>
        <h2>Dashboard</h2>
        <div style={S.small}>Role: {user ? user.role : "guest"}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
        <div style={S.card}>
          <div style={{ fontSize: 12 }} className="small">Products</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{totalProducts}</div>
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 12 }} className="small">Orders</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{totalOrders}</div>
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 12 }} className="small">Total Sales</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>${totalSales.toFixed(2)}</div>
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 12 }} className="small">Cart Items</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{cart.length}</div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Recent Orders</h3>
        <div>
          {orders.slice(0, 5).map(o => (
            <div key={o.id} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>#{o.id} • {o.customerName}</div>
                <div style={S.small}>{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ marginTop: 6 }}>
                <div style={S.small}>Total: ${o.total.toFixed(2)} • {o.items.length} items</div>
              </div>
            </div>
          ))}
          {orders.length === 0 && <div style={S.card}>No orders yet.</div>}
        </div>
      </div>
    </div>
  );

  /* ---------- profile ---------- */
  const ProfileView = () => (
    <div>
      <div style={S.headerRow}><h2>Profile</h2></div>
      <div style={S.card}>
        {user ? (
          <>
            <div><strong>Name:</strong> {user.name}</div>
            <div><strong>Username:</strong> {user.username}</div>
            <div><strong>Role:</strong> {user.role}</div>
          </>
        ) : <div>Not logged in.</div>}
      </div>
    </div>
  );

  /* ---------- main render ---------- */
  if (!user && view === "login") return <LoginView />;
  if (!user && view !== "login") {
    // show login prompt in sidebar or allow shop browse as guest
  }

  return (
    <div style={S.page}>
      {!user && view === "login" ? <LoginView /> : null}
      <div style={S.appWrap}>
        <Sidebar />
        <main style={S.main}>
          {/* top header */}
          <div style={S.headerRow}>
            <div>
              <h1 style={{ margin: 0, color: theme.blue }}>VictorLabs Demo Store</h1>
              <div style={S.small}>A complete frontend-only e-commerce demo (localStorage)</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={S.small}>{user ? `Signed in as ${user.username}` : "Guest"}</div>
              <button style={S.btn("#6b7280")} onClick={() => { LS.set(PROD_KEY, SAMPLE_PRODUCTS); setProducts(SAMPLE_PRODUCTS); alert("Products reset to sample."); }}>Reset Products</button>
            </div>
          </div>

          {/* content switch */}
          <div>
            {view === "login" && <LoginView />}
            {view === "dashboard" && <DashboardView />}
            {view === "shop" && <ShopView />}
            {view === "cart" && <CartView />}
            {view === "orders" && <OrdersView />}
            {view === "notifications" && <NotificationsView />}
            {view === "bookings" && <BookingsView />}
            {view === "profile" && <ProfileView />}
            {view === "admin" && user && user.role === "admin" && <AdminProductManager />}
            {!user && view !== "login" && user === null && (
              <div style={S.card}>
                <h3>Guest Mode</h3>
                <p className="small">You can browse products but please login/register to add to cart or checkout.</p>
                <button style={S.btn()} onClick={() => setView("login")}>Login / Register</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
