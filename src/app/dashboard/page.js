"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import IncomeChart from "@/components/IncomeChart";
import PieChart from "@/components/PieChart";
import { BsPlusLg, BsCalendar3 } from "react-icons/bs";

import MonthPickerIcon from "@/components/MonthPickerIcon";

export default function HomePage() {
  // ----------------- AUTHENTICATION -----------------
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);

  // ----------------- STATES -----------------
  // inside HomePage component
  const [showClientModal, setShowClientModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [incomeSources, setIncomeSources] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
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
  const [monthlySeries, setMonthlySeries] = useState({
    labels: [],
    values: [],
  });

  // ----------------- EFFECTS -----------------
  useEffect(() => {
    if (session?.user) {
      setUser({
        name: session.user.name || "John Doe",
        email: session.user.email || "john@example.com",
      });
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchIncomeSources();
      fetchTasks();
      fetchClients();
    }
  }, [status, selectedMonth, selectedYear]);

  // ----------------- FUNCTIONS -----------------
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const computeLastSixMonths = () => {
    const labelsArr = [];
    const valuesArr = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      labelsArr.push(`${months[month].slice(0, 3)} ${String(year).slice(-2)}`);

      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      let total = 0;

      incomeSources.forEach((src) => {
        if (src.payments?.length) {
          src.payments.forEach((p) => {
            const pd = new Date(p.date);
            if (pd >= startOfMonth && pd <= endOfMonth) total += p.amount || 0;
          });
        } else {
          const freq = src.frequency || "Monthly";
          const amt = Number(src.amount || 0);
          if (freq === "Monthly") total += amt;
          else if (freq === "Weekly") total += amt * 4;
          else if (freq === "Yearly") total += amt / 12;
          else if (freq === "One-time") {
            const sd = src.startDate ? new Date(src.startDate) : null;
            if (sd && sd >= startOfMonth && sd <= endOfMonth) total += amt;
          }
        }
      });

      tasks.forEach((task) => {
        const td = task.dueDate ? new Date(task.dueDate) : null;
        if (td && td >= startOfMonth && td <= endOfMonth) {
          if (task.status === "Completed" || task.paymentStatus === "Paid") {
            total += Number(task.amount || 0);
          }
          task.payments?.forEach((p) => {
            const pd = new Date(p.date);
            if (pd >= startOfMonth && pd <= endOfMonth) total += p.amount || 0;
          });
        }
      });

      valuesArr.push(Math.round(total));
    }

    setMonthlySeries({ labels: labelsArr, values: valuesArr });
  };

  useEffect(() => {
    computeLastSixMonths();
  }, [incomeSources, tasks, selectedMonth, selectedYear]);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data); // save in state
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  // function to compute total paid income per client
  const getPieChartData = () => {
    const clientMap = {};

    incomeSources.forEach((src) => {
      const client = src.clientName || "Unknown";
      const totalPaid =
        src.payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

      if (!clientMap[client]) clientMap[client] = 0;
      clientMap[client] += totalPaid;
    });

    return {
      labels: Object.keys(clientMap),
      values: Object.values(clientMap),
    };
  };

  const fetchIncomeSources = async () => {
    try {
      const res = await fetch(
        `/api/income?month=${selectedMonth}&year=${selectedYear}`
      );
      const data = await res.json();
      setIncomeSources(data);
      calculateMonthlyIncome(data);
    } catch (error) {
      console.error("Error fetching income sources:", error);
    }
  };

  const fetchTasks = async () => {
    const sampleTasks = [
      {
        id: 1,
        name: "API Integration",
        status: "Completed",
        amount: 15000,
        dueDate: new Date(),
        paymentStatus: "Paid",
      },
      {
        id: 2,
        name: "UI Development",
        status: "Completed",
        amount: 12000,
        dueDate: new Date(),
        paymentStatus: "Paid",
      },
      {
        id: 3,
        name: "Database Design",
        status: "In Progress",
        amount: 8000,
        dueDate: new Date(),
        paymentStatus: "Unpaid",
      },
      {
        id: 4,
        name: "Testing",
        status: "Pending",
        amount: 5000,
        dueDate: new Date(),
        paymentStatus: "Unpaid",
      },
    ];
    setTasks(sampleTasks);
    calculateTaskStats(sampleTasks);
  };

  const calculateMonthlyIncome = (sources) => {
    const stats = {
      totalIncome: 0,
      fixedIncome: 0,
      taskBasedIncome: 0,
      freelanceIncome: 0,
    };

    sources.forEach((source) => {
      if (source.isActive) {
        const monthlyAmount = source.amount;
        stats.totalIncome += monthlyAmount;

        switch (source.type) {
          case "Fixed":
            stats.fixedIncome += monthlyAmount;
            break;
          case "Task-Based":
            stats.taskBasedIncome += monthlyAmount;
            break;
          case "Freelance":
            stats.freelanceIncome += monthlyAmount;
            break;
        }
      }
    });

    setMonthlyStats((prev) => ({
      ...prev,
      ...stats,
    }));
  };

  const calculateTaskStats = (taskList) => {
    const stats = {
      pendingAmount: 0,
      completedTasks: 0,
      pendingTasks: 0,
    };

    const startOfMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);

    taskList.forEach((task) => {
      const taskDate = new Date(task.dueDate);
      if (taskDate >= startOfMonth && taskDate <= endOfMonth) {
        if (task.status === "Completed") stats.completedTasks++;
        else {
          stats.pendingTasks++;
          if (task.paymentStatus === "Unpaid")
            stats.pendingAmount += task.amount;
        }
      }
    });

    setMonthlyStats((prev) => ({
      ...prev,
      ...stats,
    }));
  };

  const overviewData = [
    {
      title: "Total Monthly Income",
      value: monthlyStats.totalIncome,
      color: "primary",
    },
    {
      title: "Pending Payments",
      value: monthlyStats.pendingAmount,
      color: "warning",
    },
    {
      title: "Tasks Completed",
      value: monthlyStats.completedTasks,
      suffix: " tasks",
      color: "success",
    },
    {
      title: "Pending Tasks",
      value: monthlyStats.pendingTasks,
      suffix: " tasks",
      color: "info",
    },
  ];

  // ----------------- RENDER -----------------

  if (status === "loading") {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2 fw-semibold">Loading your dashboard...</span>
      </div>
    );
  }

  if (!session || status !== "authenticated") {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div
          className="card p-4 text-center"
          style={{
            maxWidth: "400px",
            borderRadius: "12px",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
            transition: "transform 0.3s, box-shadow 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 35px rgba(0, 0, 0, 0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
          }}
        >
          <h4 className="mb-3" style={{ color: "var(--bs-primary)" }}>
            Access Denied
          </h4>
          <p className="text-muted mb-4 " style={{ fontSize: "18px" }}>
            You must be logged in to access the dashboard.
          </p>
          <a
            href="/login"
            className="btn btn-primary px-4 py-2"
            style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page container-fluid py-3 px-2">
      <div
        className="hero-card d-flex justify-content-between align-items-center"
        style={{
          background: "linear-gradient(135deg, var(--bs-primary), #241b36)",
          color: "#fff",
        }}
      >
        <div>
          <div className="hero-label">This Month</div>
          <div className="hero-amount">
            {monthlyStats.totalIncome.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            })}
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link
            href="/clients?openModal=true"
            className="btn btn-primary btn-sm"
          >
            New Clients
          </Link>
          <Link
            href="/tasks?openModal=true"
            className="btn btn-outline-primary btn-sm"
          >
            New Task
          </Link>
        </div>
      </div>

      <div className="d-flex justify-content-between mt-2 pt-2 align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-0 fs-5">Lancer Dashboard</h2>
          <p className="text-muted small mb-0">
            Financial overview for {months[selectedMonth]} {selectedYear}
          </p>
        </div>
        <MonthPickerIcon
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChange={(m, y) => {
            setSelectedMonth(m);
            setSelectedYear(y);
          }}
        />
      </div>

      <div className="row g-3 mb-4">
        {overviewData.map((card, index) => (
          <div key={index} className="col-6 col-md-6">
            <div
              className={`card border-0 shadow-sm bg-${card.color} text-white h-100`}
            >
              <div className="card-body text-center">
                <h3 className="mb-1">
                  {card.value.toLocaleString("en-US", {
                    style: card.suffix ? "decimal" : "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  })}
                  {card.suffix || ""}
                </h3>
                <h6 className="mb-0 text-white">{card.title}</h6>
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
              <div
                className="chart-container flex-fill d-flex align-items-center"
                style={{ minHeight: 150 }}
              >
                <IncomeChart monthlyData={monthlySeries} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Income by Client</h5>
              <PieChart data={getPieChartData()} />
            </div>
          </div>
        </div>
      </div>

      <button className="fab" aria-label="Quick add">
        <BsPlusLg />
      </button>
    </div>
  );
}
