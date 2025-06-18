import { useAuth } from '../auth/AuthContext';

const UserProfile = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h5>No autenticado</h5>
          <p>Debes iniciar sesión para ver tu perfil.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h5>Error</h5>
          <p>No se pudieron cargar los datos del usuario.</p>
        </div>
      </div>
    );
  }

  // 🎯 MOSTRAR TODOS LOS DATOS DEL USUARIO EN CONSOLA
  console.log('👤 ==========================================');
  console.log('👤 DATOS DEL USUARIO EN COMPONENTE:');
  console.log('👤 ==========================================');
  console.log(user);
  console.log('👤 ==========================================');

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Perfil de Usuario
              </h4>
            </div>
            <div className="card-body">
              
              {/* Información básica */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="text-muted">Información Personal</h6>
                  <div className="border-start border-primary border-3 ps-3">
                    {user.nombre && (
                      <p className="mb-1">
                        <strong>Nombre:</strong> {user.nombre}
                      </p>
                    )}
                    {user.apellido && (
                      <p className="mb-1">
                        <strong>Apellido:</strong> {user.apellido}
                      </p>
                    )}
                    {user.email && (
                      <p className="mb-1">
                        <strong>Email:</strong> {user.email}
                      </p>
                    )}
                    {user.username && (
                      <p className="mb-1">
                        <strong>Usuario:</strong> {user.username}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="col-md-6">
                  <h6 className="text-muted">Información Académica</h6>
                  <div className="border-start border-success border-3 ps-3">
                    {user.codigo && (
                      <p className="mb-1">
                        <strong>Código:</strong> {user.codigo}
                      </p>
                    )}
                    {user.facultad && (
                      <p className="mb-1">
                        <strong>Facultad:</strong> {user.facultad}
                      </p>
                    )}
                    {user.carrera && (
                      <p className="mb-1">
                        <strong>Carrera:</strong> {user.carrera}
                      </p>
                    )}
                    {user.semestre && (
                      <p className="mb-1">
                        <strong>Semestre:</strong> {user.semestre}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* JSON completo para debug */}
              <div className="mt-4">
                <h6 className="text-muted">
                  <i className="bi bi-code-square me-2"></i>
                  Datos Completos (Debug)
                </h6>
                <details className="mb-3">
                  <summary className="btn btn-outline-secondary btn-sm">
                    Ver JSON completo
                  </summary>
                  <div className="mt-2">
                    <pre className="bg-light p-3 border rounded" style={{ fontSize: '0.875rem', maxHeight: '300px', overflow: 'auto' }}>
                      {JSON.stringify(user, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>

              {/* Botones de acción */}
              <div className="d-flex gap-2 mt-4">
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    console.log('👤 DATOS ACTUALES DEL USUARIO:', user);
                    alert('Datos del usuario mostrados en consola');
                  }}
                >
                  <i className="bi bi-terminal me-2"></i>
                  Mostrar en Consola
                </button>
                
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => window.location.reload()}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Recargar Datos
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;