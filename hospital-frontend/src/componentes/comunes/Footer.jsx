import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>🏥 Hospital Militar</h3>
          <p>Sistema de Gestión de Mantenimiento</p>
          <p>Excelencia en servicio médico</p>
        </div>
        
        <div className="footer-section">
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/mis-solicitudes">Mis Solicitudes</a></li>
            <li><a href="/nueva-solicitud">Nueva Solicitud</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Soporte Técnico</h4>
          <p>📞 Extensión: 1234</p>
          <p>📧 soporte@hospitalmilitar.mil</p>
          <p>📍 Edificio Central, Piso 3</p>
        </div>
        
        <div className="footer-section">
          <h4>Horario de Atención</h4>
          <p>Lunes - Viernes: 08:00 - 20:00</p>
          <p>Sábados: 08:00 - 14:00</p>
          <p>Emergencias: 24/7</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Hospital Militar - Todos los derechos reservados</p>
        <p className="footer-version">v1.0.0</p>
      </div>
    </footer>
  );
};

export default Footer;