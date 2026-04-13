import '../estilos/dashboard.css';

const Dashboard = ({ usuario }) => {
  const stats = {
    totalSolicitudes: 156,
    pendientes: 23,
    enProceso: 45,
    completadas: 88
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Resumen general del sistema</p>
      </div>

      <div className="welcome-card">
        <h2>¡Bienvenido, {usuario?.nombre_completo || 'Usuario'}!</h2>
        <p>{usuario?.rol?.nombre} - {usuario?.grado}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">📋</div>
            <span className="stat-title">Total Solicitudes</span>
          </div>
          <div className="stat-value">{stats.totalSolicitudes}</div>
          <div className="stat-change">↑ 12% este mes</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">⏳</div>
            <span className="stat-title">Pendientes</span>
          </div>
          <div className="stat-value">{stats.pendientes}</div>
          <div className="stat-change">Requieren atención</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">⚙️</div>
            <span className="stat-title">En Proceso</span>
          </div>
          <div className="stat-value">{stats.enProceso}</div>
          <div className="stat-change">En ejecución</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">✅</div>
            <span className="stat-title">Completadas</span>
          </div>
          <div className="stat-value">{stats.completadas}</div>
          <div className="stat-change">↑ 8% este mes</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;