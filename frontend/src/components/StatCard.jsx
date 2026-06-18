const StatCard = ({ number, label, color }) => {
  return (
    <div className={`stat-card stat-${color}`}>
      <h3>{number}</h3>
      <p>{label}</p>
    </div>
  )
}

export default StatCard