import { useEffect, useState } from 'react';
export default function OverviewCards() {
  const data = [
    { label: 'Total Clients', value: 42, icon: '👥' },
    { label: 'Open Invoices', value: 8, icon: '🧾' },
    { label: 'Upcoming Projects', value: 3, icon: '🚀' },
    { label: 'Conversion Rate', value: '28%', icon: '📈' }
  ];
function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = typeof value === 'number' ? value : parseInt(value.replace('%', ''));
    const duration = 1000;
    const increment = end / (duration / 16);

    const step = () => {
      start += increment;
      if (start < end) {
        setCount(Math.floor(start));
        requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    }

    requestAnimationFrame(step);
  }, [value]);

  return <>{typeof value === 'string' && value.includes('%') ? `${count}%` : count}</>;
}
  return (
    <div className="row">
      {data.map((item, idx) => (
        <div key={idx} className="col-md-3 mb-2">
          <div className="card shadow-sm border-0 " style={{ height: '50px' }}>
            <div className="card-body d-flex flex-row justify-content-between align-items-center" style={{ height: '50px' }}>
              <div className="d-flex align-items-center  gap-2 text-muted mb-2">
                <span className="fs-5">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              
              <h4 className="fw-bold">
  <AnimatedCounter value={item.value} />
</h4>

            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
