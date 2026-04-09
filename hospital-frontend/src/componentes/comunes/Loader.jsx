const Loader = ({ mensaje = 'Cargando...' }) => {
  return (
    <div className="loading-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px'
    }}>
      <div className="spinner"></div>
      <p style={{ marginTop: '15px', color: '#666' }}>{mensaje}</p>
    </div>
  );
};

export default Loader;