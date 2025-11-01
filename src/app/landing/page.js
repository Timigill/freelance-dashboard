// "use client";

// import { useEffect, useState } from "react";
// import { signOut, useSession } from "next-auth/react";
// import "./dashboard.css";

// export default function DashboardPage() {
//   const { data: session, status } = useSession();
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     if (session?.user) {
//       setUser({
//         name: session.user.name || "John Doe",
//         email: session.user.email || "john@example.com",
//       });
//     }
//   }, [session]);

//   if (status === "loading") {
//     return <p className="loading">Loading...</p>;
//   }

//   if (!session) {
//     return (
//       <p className="loading">
//         You must be logged in to access the dashboard.
//       </p>
//     );
//   }

//   const dummyStats = {
//     projects: 12,
//     tasks: 34,
//     messages: 7,
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="header">
//         <h2>Welcome, {user?.name}</h2>
//         <div className="actions">
//           <button
//             onClick={() => signOut({ callbackUrl: "/login" })}
//             className="logout-btn"
//           >
//             Logout
//           </button>
//         </div>
//       </div>

//       <div className="cards-container">
//         <div className="card">
//           <h3>Profile</h3>
//           <p>
//             <strong>Name:</strong> {user?.name}
//           </p>
//           <p>
//             <strong>Email:</strong> {user?.email}
//           </p>
//         </div>

//         <div className="card">
//           <h3>Projects</h3>
//           <p>Total Projects: {dummyStats.projects}</p>
//         </div>

//         <div className="card">
//           <h3>Tasks</h3>
//           <p>Pending Tasks: {dummyStats.tasks}</p>
//         </div>

//         <div className="card">
//           <h3>Messages</h3>
//           <p>Unread Messages: {dummyStats.messages}</p>
//         </div>
//       </div>
//     </div>
//   );
// }
