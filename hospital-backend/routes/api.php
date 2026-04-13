<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RolController;
use App\Http\Controllers\Api\SolicitudController;
use App\Http\Controllers\Api\EquipoController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\SectorController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PingController;
use Illuminate\Support\Facades\Route;

// Rutas públicas
Route::get('/ping', [PingController::class, 'ping']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas por Sanctum
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // =============================================
    // SOLICITUDES - Todos los usuarios autenticados
    // =============================================
    
    // Crear solicitud - Cualquier usuario puede crear
    Route::post('/solicitudes', [SolicitudController::class, 'store']);
    
    // Ver mis solicitudes - El usuario ve solo las suyas
    Route::get('/mis-solicitudes', [SolicitudController::class, 'misSolicitudes']);
    
    // Ver detalle de una solicitud propia
    Route::get('/solicitudes/{id}', [SolicitudController::class, 'show'])
        ->middleware('can:ver,solicitud');
    
    // Firmar solicitud - Según el rol que corresponda
    Route::post('/solicitudes/{id}/firmar', [SolicitudController::class, 'firmar']);
    
    // =============================================
    // RUTAS PARA SOPORTE TÉCNICO Y JEFE SOPORTE
    // =============================================
    Route::middleware('role:soporte_tecnico,jefe_soporte,admin_sistema')->group(function () {
        
        // Ver todas las solicitudes pendientes para soporte
        Route::get('/solicitudes-pendientes', [SolicitudController::class, 'pendientesSoporte']);
        
        // Asignar técnico a solicitud
        Route::post('/solicitudes/{id}/asignar-tecnico', [SolicitudController::class, 'asignarTecnico']);
        
        // Marcar trabajo como completado
        Route::post('/solicitudes/{id}/completar-trabajo', [SolicitudController::class, 'completarTrabajo']);
        
        // Registrar uso de materiales
        Route::post('/solicitudes/{id}/usar-material', [SolicitudController::class, 'usarMaterial']);
        
    });
    
    // =============================================
    // RUTAS PARA JEFES DE SERVICIO
    // =============================================
    Route::middleware('role:jefe_servicio,admin_sistema')->group(function () {
        
        // Ver solicitudes de su sector que requieren su firma
        Route::get('/solicitudes-para-firmar', [SolicitudController::class, 'paraFirmarJefe']);
        
        // Ver todas las solicitudes de su sector
        Route::get('/solicitudes-sector', [SolicitudController::class, 'porSector']);
        
    });
    
    // =============================================
    // RUTAS SOLO PARA ADMIN
    // =============================================
    Route::middleware('role:admin_sistema')->group(function () {
        
        // Ver TODAS las solicitudes
        Route::get('/solicitudes', [SolicitudController::class, 'index']);
        
        // CRUD de Roles
        Route::apiResource('roles', RolController::class);
        
        // CRUD de Equipos
        Route::apiResource('equipos', EquipoController::class)->except(['index', 'show']);
        
        // CRUD de Materiales
        Route::apiResource('materiales', MaterialController::class);
        
        // CRUD de Usuarios
        Route::apiResource('usuarios', UserController::class);
        
        // CRUD de Sectores
        Route::apiResource('sectores', SectorController::class);
        
    });
    
    // =============================================
    // RUTAS DE LECTURA (varios roles)
    // =============================================
    Route::middleware('role:admin_sistema,jefe_soporte,soporte_tecnico,jefe_servicio')->group(function () {
        Route::get('/equipos', [EquipoController::class, 'index']);
        Route::get('/equipos/{id}', [EquipoController::class, 'show']);
        Route::get('/materiales', [MaterialController::class, 'index']);
        Route::get('/sectores', [SectorController::class, 'index']);
        Route::get('/tecnicos', [UserController::class, 'tecnicos']);
    });

    // Rutas adicionales para Equipos
    Route::get('/equipos/sector/{sectorId}', [EquipoController::class, 'porSector']);
    Route::get('/equipos/categoria/{categoriaId}', [EquipoController::class, 'porCategoria']);

    // Rutas adicionales para Materiales
    Route::post('/materiales/{id}/ajustar-stock', [MaterialController::class, 'ajustarStock']);
    Route::get('/materiales-stock-bajo', [MaterialController::class, 'stockBajo']);

    // Cambiar contraseña de usuario
    Route::post('/usuarios/{id}/cambiar-password', [UserController::class, 'cambiarPassword']);
    
});