"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import IncomeChart from "@/components/IncomeChart";
import PieChart from "@/components/PieChart";
import FloatingActionButton from "@/components/FloatingIcon";
import MonthPickerIcon from "@/components/MonthPickerIcon";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [loadingData, setLoadingData] = useState(true);

  const [clients, setClients] = useState([]);
  const [incomeSources, setIncomeSources] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [monthlyStats, setMonthlyStats] = useState({
    totalIncome: 0,
    fixedIncome: 0,
    taskBasedIncome: 0,
    freelanceIncome: 0,
    pendingAmount: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });

  const [monthlySeries, setMonthlySeries] = useState({ labels: [], values: [] });

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  // ----------------- FETCH DATA -----------------
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchAllData = async () => {
      setLoadingData(true);
      try {
        const [clientsRes, incomeRes, tasksRes] = await Promise.all([
          fetch("/api/clients"),
          fetch(`/api/income?month=${selectedMonth + 1}&year=${selectedYear}`),
          fetch(`/api/tasks?month=${selectedMonth + 1}&year=${selectedYear}`),
        ]);

        const [clientsData, incomeData, taskData] = await Promise.all([
          clientsRes.json(),
          incomeRes.json(),
          tasksRes.json(),
        ]);

        setClients(clientsData || []);
        setIncomeSources(incomeData || []);
        setTasks(taskData || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAllData();
  }, [status, selectedMonth, selectedYear]);

  // ----------------- COMPUTE STATS -----------------
  useEffect(() => {
    if (loadingData) return;

    const computeStats = () => {
      let totalIncome = 0, fixedIncome = 0, taskBasedIncome = 0, freelanceIncome = 0;
      let pendingAmount = 0, completedTasks = 0, pendingTasks = 0;

      const startOfMonth = new Date(selectedYear, selectedMonth, 1);
      const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

      // Map clientId -> clientName
      const clientMap = {};
      clients.forEach(c => clientMap[c._id] = c.company ? `${c.company} — ${c.name}` : c.name);

      // ----- Income Sources -----
      incomeSources.forEach(src => {
        if (!src.isActive) return;
        const amount = Number(src.amount || 0);

        // Categorize type
        switch (src.type) {
          case "Fixed Salary": fixedIncome += amount; break;
          case "Task Based Salary": taskBasedIncome += amount; break;
          case "Freelance": freelanceIncome += amount; break;
        }

        totalIncome += amount;
      });

      // ----- Tasks -----
      tasks.forEach(task => {
        if (!task.dueDate) return;
        const date = new Date(task.dueDate);
        if (date < startOfMonth || date > endOfMonth) return;

        const status = (task.status || "").toLowerCase();
        const payment = (task.paymentStatus || "").toLowerCase();

        if (status === "completed") completedTasks++; else pendingTasks++;
        if (payment !== "paid") pendingAmount += Number(task.amount || 0);
        if (payment === "paid") totalIncome += Number(task.amount || 0);
      });

      setMonthlyStats({
        totalIncome, fixedIncome, taskBasedIncome, freelanceIncome,
        pendingAmount, completedTasks, pendingTasks,
      });

      // ----- Half-year series -----
      const labels = [];
      const values = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(selectedYear, selectedMonth - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth();
        labels.push(`${months[month].slice(0, 3)} ${String(year).slice(-2)}`);

        let total = 0;
        incomeSources.forEach(src => total += Number(src.amount || 0));
        tasks.forEach(task => {
          const td = new Date(task.dueDate);
          if (td && td.getMonth() === month && td.getFullYear() === year && (task.paymentStatus || "").toLowerCase() === "paid") {
            total += Number(task.amount || 0);
          }
        });
        values.push(Math.round(total));
      }
      setMonthlySeries({ labels, values });
    };

    computeStats();
  }, [incomeSources, tasks, clients, selectedMonth, selectedYear, loadingData]);

  // ----------------- PIE CHART -----------------
  const pieChartData = useMemo(() => {
    const map = {};
    incomeSources.forEach(src => {
      const clientName = src.clientName || (clients.find(c => c._id === src.clientId)?.name || "Unknown");
      const paymentTotal = Array.isArray(src.payments) ? src.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0) : 0;
      const total = paymentTotal > 0 ? paymentTotal : Number(src.amount || 0);
      if (!map[clientName]) map[clientName] = 0;
      map[clientName] += total;
    });
    const labels = [], values = [];
    Object.entries(map).forEach(([k, v]) => { if (v > 0) { labels.push(k); values.push(Math.round(v)); }});
    return { labels, values };
  }, [incomeSources, clients]);

  // ----------------- RENDER -----------------
  if (status === "loading" || loadingData) {
  return <div style={{
    textAlign:"center",
    padding:"15rem 0",
    fontWeight:"bold",
    fontSize:"1.5rem",
    color:"#252235ff"
  }}>Loading dashboard...</div>;
}

  const overviewData = [
    { title: "Total Monthly Income", value: monthlyStats.totalIncome, color: "primary" },
    { title: "Pending Payments", value: monthlyStats.pendingAmount, color: "warning" },
    { title: "Tasks Completed", value: monthlyStats.completedTasks, suffix: " tasks", color: "success" },
    { title: "Pending Tasks", value: monthlyStats.pendingTasks, suffix: " tasks", color: "info" },
  ];

  return (
    <div className="dashboard-page container-fluid py-3 px-2">
      <div className="hero-card d-flex justify-content-between align-items-center" style={{ background: "linear-gradient(135deg, var(--bs-primary), #241b36)", color: "#fff" }}>
        <div>
          <div className="hero-label">This Month</div>
          <div className="hero-amount">
            {monthlyStats.totalIncome.toLocaleString("en-US", { style: "currency", currency: "pkr", maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link href="/clients?openModal=true" className="btn btn-primary btn-sm">New Clients</Link>
          <Link href="/tasks?openModal=true" className="btn btn-outline-primary btn-sm">New Task</Link>
        </div>
      </div>

      <div className="d-flex justify-content-between mt-2 pt-2 align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-0 fs-5">Laancer Dashboard</h2>
          <p className="text-muted small mb-0">Financial overview for {months[selectedMonth]} {selectedYear}</p>
        </div>
        <MonthPickerIcon selectedMonth={selectedMonth} selectedYear={selectedYear} onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }} />
      </div>

      <div className="row g-3 mb-4">
        {overviewData.map((card, idx) => (
          <div key={idx} className="col-6 col-md-6">
            <div className={`card border-0 shadow-sm bg-${card.color} text-white h-100`}>
              <div className="card-body text-center">
                <h3 className="mb-1 fw-bold">
                  {card.value.toLocaleString("en-US", { style: card.suffix ? "decimal" : "currency", currency: "pkr", maximumFractionDigits: 0 })}{card.suffix || ""}
                </h3>
                <h6 className="mb-0" style={{ color: "#352359", opacity: 0.9, fontWeight: 500 }}>{card.title}</h6>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column px-3">
              <h5 className="card-title">Half Yearly Income Distribution</h5>
              <div className="chart-container flex-fill d-flex align-items-center" style={{ minHeight: 150 }}>
                <IncomeChart monthlyData={monthlySeries} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Income by Client</h5>
              <PieChart data={pieChartData} />
            </div>
          </div>
        </div>
      </div>

      <div className="d-md-none">
        <FloatingActionButton />
      </div>
    </div>
  );
}
