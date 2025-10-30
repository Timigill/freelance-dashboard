"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import "./landing.css";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="landing-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">FreelanceFlow</div>
        <div className="nav-buttons">
          <button onClick={() => router.push("/login")}>Login</button>
          <button className="signup" onClick={() => router.push("/signup")}>
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <motion.main
        className="hero section"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <h1>
            Manage Your <span>Freelance</span> Journey Smarter
          </h1>
          <p>
            FreelanceFlow helps freelancers organize clients, track payments,
            and grow their business — all from one simple dashboard.
          </p>
          <div className="hero-buttons">
            <button onClick={() => router.push("/signup")}>Get Started</button>
            <button className="secondary" onClick={() => router.push("/login")}>
              Login
            </button>
          </div>
        </div>

        <motion.div
          className="hero-image"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
        >
          <img src="/dashboard-preview.jpg" alt="Dashboard preview" />
        </motion.div>
      </motion.main>

      {/* Features Section */}
      <section className="features section">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Why FreelanceFlow?
        </motion.h2>

        <div className="feature-grid">
          {[
            {
              title: "Project Tracking",
              desc: "Stay on top of deadlines and deliverables with smart project tracking tools.",
              icon: "📁",
            },
            {
              title: "Client Management",
              desc: "Keep all client info organized and accessible whenever you need it.",
              icon: "🤝",
            },
            {
              title: "Income Insights",
              desc: "Visualize your monthly earnings and manage invoices effortlessly.",
              icon: "💰",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
            >
              <div className="icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works section">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          How It Works
        </motion.h2>

        <div className="steps">
          {[
            {
              step: "1",
              title: "Create Your Account",
              desc: "Sign up in seconds and set up your freelancer profile.",
            },
            {
              step: "2",
              title: "Add Your Clients & Projects",
              desc: "Organize all your clients, deadlines, and invoices in one place.",
            },
            {
              step: "3",
              title: "Track & Grow",
              desc: "View progress, get insights, and grow your freelance business with ease.",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="step-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
            >
              <div className="step-number">{s.step}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials section">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Loved by Freelancers Everywhere
        </motion.h2>

        <div className="testimonial-grid">
          {[
            {
              name: "Aisha Malik",
              text: "FreelanceFlow keeps my projects organized and clients happy. I’ve doubled my productivity.",
            },
            {
              name: "Daniel Khan",
              text: "The income insights feature changed how I track earnings — super helpful for taxes.",
            },
            {
              name: "Sara Ahmed",
              text: "Finally, a dashboard made for freelancers. Clean, simple, and everything in one place.",
            },
          ].map((t, i) => (
            <motion.div
              key={i}
              className="testimonial-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
            >
              <p>“{t.text}”</p>
              <h4>- {t.name}</h4>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq section">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="faq-list">
          {[
            {
              q: "Is FreelanceFlow free to use?",
              a: "Yes! You can start for free and upgrade later if you need advanced features.",
            },
            {
              q: "Can I manage multiple clients?",
              a: "Absolutely. FreelanceFlow is built for freelancers handling multiple clients or projects at once.",
            },
            {
              q: "Is my data secure?",
              a: "We use industry-standard encryption and never share your data with third parties.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="faq-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <h4>{f.q}</h4>
              <p>{f.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="cta section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2>Start managing your freelance work smarter today.</h2>
        <div className="cta-buttons">
          <button onClick={() => router.push("/signup")}>Join Now</button>
          <button className="secondary" onClick={() => router.push("/login")}>
            Login
          </button>
        </div>
      </motion.section>
    </div>
  );
}
