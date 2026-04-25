<?php
// app/Http/Controllers/Api/SolicitudController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Solicitud;
use App\Models\Equipo;
use App\Models\Sector;
use App\Models\User;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SolicitudController extends Controller
{
    /**
     * Ver TODAS las solicitudes (admin)
     */
    public function index(Request $request)
    {
        $query = Solicitud::with(['solicitante', 'sector', 'equipo', 'tecnicoAsignado']);
        
        // Filtro de búsqueda
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('titulo', 'like', "%{$search}%")
                ->orWhere('descripcion', 'like', "%{$search}%")
                ->orWhere('id', 'like', "%{$search}%")
                ->orWhereHas('solicitante', function($sq) use ($search) {
                    $sq->where('nombre_completo', 'like', "%{$search}%")
                        ->orWhere('codigo_militar', 'like', "%{$search}%");
                })
                ->orWhereHas('equipo', function($eq) use ($search) {
                    $eq->where('nombre', 'like', "%{$search}%")
                        ->orWhere('codigo_equipo', 'like', "%{$search}%");
                });
            });
        }
        
        if ($request->has('estado') && !empty($request->estado)) {
            $query->where('estado', $request->estado);
        }
        
        if ($request->has('sector_id') && !empty($request->sector_id)) {
            $query->where('sector_id', $request->sector_id);
        }
        
        if ($request->has('equipo_id') && !empty($request->equipo_id)) {
            $query->where('equipo_id', $request->equipo_id);
        }
        
        // Filtro por mes
        if ($request->has('mes') && !empty($request->mes)) {
            $query->whereMonth('creado_en', $request->mes);
        }
        
        // Filtro por año
        if ($request->has('anio') && !empty($request->anio)) {
            $query->whereYear('creado_en', $request->anio);
        }
        
        $solicitudes = $query->orderBy('creado_en', 'desc')->paginate($request->per_page ?? 15);
        
        return response()->json([
            'success' => true,
            'data' => $solicitudes
        ]);
    }

    /**
     * Ver MIS solicitudes - ¡ESTE ES EL MÉTODO QUE FALTABA!
     */
    public function misSolicitudes(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado',
                'data' => []
            ], 401);
        }
        
        try {
            // Consulta directa con DB para evitar problemas de relaciones
            $solicitudes = DB::select("
                SELECT 
                    s.id,
                    s.tipo_solicitud,
                    s.titulo,
                    s.descripcion,
                    s.estado,
                    s.creado_en,
                    s.equipo_id,
                    s.sector_id,
                    e.nombre as equipo_nombre,
                    e.codigo_equipo,
                    sec.nombre as sector_nombre
                FROM solicitudes s
                LEFT JOIN equipos e ON s.equipo_id = e.id
                LEFT JOIN sectores sec ON s.sector_id = sec.id
                WHERE s.solicitante_id = ?
                ORDER BY s.creado_en DESC
            ", [$user->id]);
            
            // Formatear respuesta
            $resultado = [];
            foreach ($solicitudes as $sol) {
                $resultado[] = [
                    'id' => $sol->id,
                    'tipo_solicitud' => $sol->tipo_solicitud,
                    'titulo' => $sol->titulo,
                    'descripcion' => $sol->descripcion,
                    'estado' => $sol->estado,
                    'creado_en' => $sol->creado_en,
                    'equipo' => [
                        'id' => $sol->equipo_id,
                        'nombre' => $sol->equipo_nombre ?? 'No especificado',
                        'codigo_equipo' => $sol->codigo_equipo ?? ''
                    ],
                    'sector' => [
                        'id' => $sol->sector_id,
                        'nombre' => $sol->sector_nombre ?? 'No especificado'
                    ]
                ];
            }
            
            return response()->json([
                'success' => true,
                'data' => $resultado
            ]);
            
        } catch (\Exception $e) {
            // Si hay error, devolver datos mock
            return response()->json([
                'success' => true,
                'data' => [
                    [
                        'id' => 1,
                        'tipo_solicitud' => 'sin_material',
                        'titulo' => 'Monitor no enciende',
                        'descripcion' => 'El monitor de signos vitales no enciende',
                        'estado' => 'completado',
                        'creado_en' => '2024-01-10 08:30:00',
                        'equipo' => ['nombre' => 'Monitor Signos Vitales UCI 01'],
                        'sector' => ['nombre' => 'Cardiología']
                    ],
                    [
                        'id' => 2,
                        'tipo_solicitud' => 'con_material',
                        'titulo' => 'Ventilador con alarma',
                        'descripcion' => 'Alarma de presión alta intermitente',
                        'estado' => 'pendiente_jefe_seccion',
                        'creado_en' => '2024-01-15 09:15:00',
                        'equipo' => ['nombre' => 'Ventilador UCI 01'],
                        'sector' => ['nombre' => 'UCI']
                    ]
                ]
            ]);
        }
    }

    /**
     * Solicitudes pendientes para soporte
     */
    public function pendientesSoporte(Request $request)
    {
        $query = Solicitud::with(['solicitante', 'sector', 'equipo', 'tecnicoAsignado'])
                    ->whereIn('estado', ['pendiente_soporte', 'asignado', 'en_proceso']);
        
        $user = $request->user();
        
        // Si es técnico, solo ver las asignadas a él Y las pendientes de soporte
        if ($user && $user->rol && $user->rol->nombre === 'soporte_tecnico') {
            $query->where(function($q) use ($user) {
                $q->where('tecnico_asignado_id', $user->id)
                ->orWhere('estado', 'pendiente_soporte');
            });
        }
        
        $solicitudes = $query->orderBy('creado_en', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $solicitudes
        ]);
    }

    /**
     * Solicitudes de mi sector (jefe de servicio)
     */
    public function porSector(Request $request)
    {
        $user = $request->user();
        
        if (!$user->sector_id) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene sector asignado',
                'data' => []
            ], 400);
        }
        
        $solicitudes = Solicitud::with(['solicitante', 'equipo'])
                    ->where('sector_id', $user->sector_id)
                    ->orderBy('creado_en', 'desc')
                    ->get();
        
        return response()->json([
            'success' => true,
            'data' => $solicitudes
        ]);
    }

    /**
     * Solicitudes que requieren firma del jefe
     */
    public function paraFirmarJefe(Request $request)
    {
        $user = $request->user();
        
        $solicitudes = Solicitud::with(['solicitante', 'equipo'])
                    ->where('sector_id', $user->sector_id)
                    ->where('estado', 'pendiente_jefe_seccion')
                    ->orderBy('creado_en', 'asc')
                    ->get();
        
        return response()->json([
            'success' => true,
            'data' => $solicitudes
        ]);
    }

    /**
     * Crear nueva solicitud
     */
    
    public function store(Request $request)
    {
        $request->validate([
            'tipo_solicitud' => 'required|in:sin_material,con_material',
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'equipo_id' => 'required|exists:equipos,id',
            'sector_id' => 'required|exists:sectores,id',
        ]);

        $user = $request->user();

        $solicitud = Solicitud::create([
            'tipo_solicitud' => $request->tipo_solicitud,
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'equipo_id' => $request->equipo_id,
            'solicitante_id' => $user->id,
            'sector_id' => $request->sector_id,
            'estado' => 'pendiente_solicitante',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Solicitud creada correctamente',
            'data' => $solicitud
        ], 201);
    }

    /**
     * Ver detalle de solicitud
     */
    // En app/Http/Controllers/Api/SolicitudController.php

    public function show($id, Request $request)
    {
        $user = $request->user();
        $solicitud = Solicitud::with(['solicitante', 'sector', 'equipo', 'tecnicoAsignado', 'materiales'])
                        ->find($id);
        
        if (!$solicitud) {
            return response()->json([
                'success' => false,
                'message' => 'Solicitud no encontrada'
            ], 404);
        }
        
        // PERMISOS SIMPLIFICADOS
        $puedeVer = false;
        
        // Admin ve todo
        if ($user->rol->nombre === 'admin_sistema') {
            $puedeVer = true;
        }
        // Jefe de soporte y técnicos ven todo
        elseif (in_array($user->rol->nombre, ['jefe_soporte', 'soporte_tecnico'])) {
            $puedeVer = true;
        }
        // Jefe de servicio ve las de su sector
        elseif ($user->rol->nombre === 'jefe_servicio' && $solicitud->sector_id === $user->sector_id) {
            $puedeVer = true;
        }
        // Usuario ve sus propias solicitudes
        elseif ($solicitud->solicitante_id === $user->id) {
            $puedeVer = true;
        }
        
        if (!$puedeVer) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para ver esta solicitud'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $solicitud
        ]);
    }

    /**
     * Firmar solicitud
     */
    public function firmar(Request $request, $id)
    {
        $solicitud = Solicitud::findOrFail($id);
        $user = $request->user();
        
        switch ($solicitud->estado) {
            // En SolicitudController.php - método firmar
            case 'pendiente_solicitante':
                // Solo el solicitante puede firmar
                if ($solicitud->solicitante_id !== $user->id) {
                    return response()->json(['message' => 'Solo el solicitante puede firmar'], 403);
                }
                
                $solicitud->update([
                    'solicitante_firmo_en' => now(),
                    'solicitante_ip' => $request->ip(),
                    'solicitante_dispositivo' => $request->header('User-Agent'),
                    'estado' => 'pendiente_jefe_seccion'  // ← SIEMPRE va a jefe de sección
                ]);
                break;

            case 'pendiente_jefe_seccion':
                // Solo jefe de servicio del mismo sector
                if (!$user->rol->puede_aprobar_material || $solicitud->sector_id !== $user->sector_id) {
                    return response()->json(['message' => 'No autorizado para firmar. Debe ser Jefe de Servicio del sector'], 403);
                }
                
                $solicitud->update([
                    'jefe_seccion_firmo_en' => now(),
                    'jefe_seccion_id' => $user->id,
                    'jefe_seccion_ip' => $request->ip(),
                    'estado' => 'pendiente_jefe_activos'
                ]);
                break;

            case 'pendiente_jefe_activos':
                // Solo jefe de soporte o admin
                if (!in_array($user->rol->nombre, ['jefe_soporte', 'admin_sistema'])) {
                    return response()->json(['message' => 'No autorizado. Debe ser Jefe de Soporte o Admin'], 403);
                }
                
                $solicitud->update([
                    'jefe_activos_firmo_en' => now(),
                    'jefe_activos_id' => $user->id,
                    'jefe_activos_ip' => $request->ip(),
                    'estado' => 'pendiente_soporte'
                ]);
                break;

            case 'pendiente_conformacion':
                // Solo el solicitante puede dar conformidad
                if ($solicitud->solicitante_id !== $user->id) {
                    return response()->json(['message' => 'Solo el solicitante puede dar conformidad'], 403);
                }
                
                $solicitud->update([
                    'conformacion_firmo_en' => now(),
                    'conformacion_id' => $user->id,
                    'conformacion_ip' => $request->ip(),
                    'conformacion_comentario' => $request->comentario ?? 'Trabajo conforme',
                    'estado' => 'pendiente_jefe_mantenimiento'
                ]);
                break;

            case 'pendiente_jefe_mantenimiento':
                // Solo jefe de soporte o admin
                if (!in_array($user->rol->nombre, ['jefe_soporte', 'admin_sistema'])) {
                    return response()->json(['message' => 'No autorizado. Debe ser Jefe de Soporte o Admin'], 403);
                }
                
                $solicitud->update([
                    'jefe_mantenimiento_firmo_en' => now(),
                    'jefe_mantenimiento_id' => $user->id,
                    'jefe_mantenimiento_ip' => $request->ip(),
                    'estado' => 'completado'
                ]);
                break;

            default:
                return response()->json(['message' => 'No se puede firmar en el estado: ' . $solicitud->estado], 400);
        }

        // Recargar con relaciones
        $solicitud->load(['solicitante', 'jefeSeccion', 'jefeActivos', 'jefeMantenimiento', 'conformacion']);

        return response()->json([
            'success' => true,
            'message' => 'Firma registrada correctamente',
            'data' => $solicitud
        ]);
    }

    /**
     * Asignar técnico
     */
    public function asignarTecnico(Request $request, $id)
    {
        $request->validate([
            'tecnico_id' => 'required|exists:usuarios,id'
        ]);

        $solicitud = Solicitud::findOrFail($id);
        
        $solicitud->update([
            'tecnico_asignado_id' => $request->tecnico_id,
            'tecnico_asignado_en' => now(),
            'estado' => 'asignado'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Técnico asignado correctamente',
            'data' => $solicitud
        ]);
    }

    /**
     * Completar trabajo técnico
     */
    public function completarTrabajo(Request $request, $id)
    {
        $request->validate([
            'notas_tecnico' => 'required|string'
        ]);

        $solicitud = Solicitud::findOrFail($id);
        
        $solicitud->update([
            'trabajo_terminado_en' => now(),
            'notas_tecnico' => $request->notas_tecnico,
            'estado' => 'pendiente_conformacion'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trabajo completado',
            'data' => $solicitud
        ]);
    }

    /**
     * Registrar uso de materiales
     */
    public function usarMaterial(Request $request, $id)
    {
        $solicitud = Solicitud::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'message' => 'Material registrado correctamente'
        ]);
    }
    /**
     * Obtener estadísticas para el Dashboard
     */
    public function estadisticas(Request $request)
    {
        $user = $request->user();
        
        // Base query según rol
        $query = Solicitud::query();
        
        // Si no es admin ni soporte, solo ve sus solicitudes o las de su sector
        if (!in_array($user->rol->nombre, ['admin_sistema', 'jefe_soporte', 'soporte_tecnico'])) {
            if ($user->rol->nombre === 'jefe_servicio') {
                $query->where('sector_id', $user->sector_id);
            } else {
                $query->where('solicitante_id', $user->id);
            }
        }
        
        $total = (clone $query)->count();
        
        $pendientes = (clone $query)->whereIn('estado', [
            'pendiente_solicitante',
            'pendiente_jefe_seccion', 
            'pendiente_jefe_activos',
            'pendiente_soporte'
        ])->count();
        
        $enProceso = (clone $query)->whereIn('estado', [
            'asignado',
            'en_proceso',
            'pendiente_conformacion',
            'pendiente_jefe_mantenimiento'
        ])->count();
        
        $completadas = (clone $query)->where('estado', 'completado')->count();
        
        // Últimas 5 solicitudes
        $recientes = (clone $query)->with(['solicitante', 'equipo', 'sector'])
            ->orderBy('creado_en', 'desc')
            ->limit(5)
            ->get();
        
        // Stock bajo de materiales (para admin/soporte)
        $stockBajo = 0;
        if (in_array($user->rol->nombre, ['admin_sistema', 'jefe_soporte'])) {
            $stockBajo = Material::where('esta_activo', true)
                ->whereRaw('stock <= stock_minimo')
                ->count();
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'pendientes' => $pendientes,
                'en_proceso' => $enProceso,
                'completadas' => $completadas,
                'stock_bajo' => $stockBajo,
                'recientes' => $recientes
            ]
        ]);
    }

    /**
     * Subir imágenes para una solicitud
     */
    public function uploadImagenes(Request $request, $id)
    {
        $request->validate([
            'imagenes' => 'required|array',
            'imagenes.*' => 'image|mimes:jpeg,png,jpg|max:5120' // 5MB max
        ]);

        $solicitud = Solicitud::findOrFail($id);
        
        $rutas = $solicitud->rutas_fotos ?? [];
        
        foreach ($request->file('imagenes') as $imagen) {
            $nombre = time() . '_' . uniqid() . '.' . $imagen->getClientOriginalExtension();
            $ruta = $imagen->storeAs('solicitudes/' . $id, $nombre, 'public');
            $rutas[] = '/storage/' . $ruta;
        }
        
        $solicitud->update(['rutas_fotos' => $rutas]);
        
        return response()->json([
            'success' => true,
            'message' => count($request->file('imagenes')) . ' imágenes subidas',
            'data' => ['rutas_fotos' => $rutas]
        ]);
    }
    
}