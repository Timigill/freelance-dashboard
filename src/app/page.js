"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { FiFolder, FiUsers, FiCreditCard, FiBarChart2 } from "react-icons/fi"; // React icons

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <FiFolder size={36} color="#241b36" />,
      title: "Project Management",
      desc: "Organize your workflow and deadlines effortlessly.",
    },
    
    {
      icon: <FiCreditCard size={36} color="#241b36" />,
      title: "Invoicing & Payments",
      desc: "Bill clients and track payments with confidence.",
    },
    {
      icon: <FiBarChart2 size={36} color="#241b36" />,
      title: "Income Analytics",
      desc: "Understand your financial growth through smart analytics.",
    },{
      icon: <FiUsers size={36} color="#241b36" />,
      title: "Client CRM",
      desc: "Maintain strong client relationships in one place.",
    },
  ];

  return (
    <div className="container-fluid p-0" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Navbar */}
      <header
        className="d-flex justify-content-center align-items-center border-bottom bg-white sticky-top py-3"
        style={{ zIndex: 100 }}
      >
        <Image src="/Lancer.png" alt="Lancer Logo" width={120} height={40} priority />
      </header>

      {/* Hero Section */}
      <motion.section
        className="container-fluid py-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          background: "linear-gradient(135deg, var(--bs-primary), #241b36)",
          color: "#fff",
        }}
      >
        <div className="container d-flex flex-column flex-lg-row align-items-center justify-content-between">
          <div className="text-center text-lg-start mb-5 pt-4 mb-lg-0" style={{ maxWidth: "550px" }}>
            <h1 className="fw-bold mb-3" style={{ fontSize: "2.3rem", lineHeight: "1.3" }}>
            Elevate and Simplify <br />
              <span style={{ color: "#eaf2ff" }}>Your Freelancing</span>
            </h1>
            <p className="lead mb-4" style={{ color: "rgba(255,255,255,0.85)" , fontSize: "1.1rem"}}>
              Lancer helps freelancers streamline projects, clients, and income tracking in one dashboard.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
              <button
                className="btn btn-light px-4 py-2 fw-semibold"
                style={{
                  color: "var(--bs-primary)",
                  borderRadius: "8px",
                  boxShadow: "0 3px 10px rgba(255,255,255,0.25)",
                }}
                onClick={() => router.push("/signup")}
              >
                Get Started Free
              </button>
              <button
                className="btn btn-outline-light px-3 py-2 "
                style={{ borderRadius: "8px" }}
                onClick={() => router.push("/login")}
              >
                Already have an Account?
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-center"
          >
            <Image
              src="/Overview.webp"
              alt="Dashboard preview"
              width={650}
              height={480}
              className="img-fluid rounded shadow-lg"
              style={{ border: "2px solid rgba(255,255,255,0.2)" }}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
    <section className="py-5 bg-light text-center">
      <div className="container">
        <h2 className="fw-bold mb-4">Everything You Need to Succeed</h2>
        <div className="row g-3 justify-content-center">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="col-6 col-md-6 col-lg-6 col-xl-5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div
                className="p-4 bg-white rounded-4 shadow-sm h-100 mx-auto"
                style={{
                  maxWidth: "100%",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                }}
              >
                <div className="mb-2">{feature.icon}</div>
                <h6 className="fw-semibold mt-2 mb-1">{feature.title}</h6>
                <p className="text-muted small  mb-0" style={{fontSize:"0.7rem"}}>{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <MonthPickerIcon
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y) }}
        />
      </div>
    </section>


      {/* CTA Section */}
      <section
        className="py-5 text-center text-white"
        style={{
          background: "linear-gradient(135deg, #241b36b9, #241b36)",
          paddingTop: "5rem",
          paddingBottom: "5rem",
        }}
      >
        <div className="container" style={{ maxWidth: "700px" }}>
          <motion.h2
            className="fw-bold mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{fontSize:"1.5rem!important"}}
          >
            Ready to elevate your freelance career?
          </motion.h2>
          <p
            className="mb-4"
            style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem" }}
          >
            Join professionals who use Lancer to take control of their business, track income, and grow faster.
          </p>
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
            <button
              className="btn btn-light fw-semibold px-4 py-2"
              style={{ color: "#241b36", borderRadius: "8px" }}
              onClick={() => router.push("/signup")}
            >
              Create Free Account
            </button>
           
          </div>
        </div>
      </section>
    </div>
  );
}
