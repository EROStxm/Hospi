<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Solicitud;
use App\Models\Equipo;
use App\Models\Sector;
use App\Models\User;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\NotificacionHelper;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Color\Color;  // ← Cambiar ColorInterface por Color


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
     * Ver MIS solicitudes
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
            return response()->json([
                'success' => true,
                'data' => []
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

        // NOTIFICACIÓN: Confirmación al solicitante
        NotificacionHelper::enviar(
            $user->id,
            'Solicitud creada',
            "Tu solicitud #{$solicitud->id} ha sido creada exitosamente",
            'success',
            "/mis-solicitudes",
            $solicitud->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Solicitud creada correctamente',
            'data' => $solicitud
        ], 201);
    }

    /**
     * Ver detalle de solicitud
     */
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
        $nuevoEstado = '';
        
        switch ($solicitud->estado) {
            case 'pendiente_solicitante':
                // Solo el solicitante puede firmar
                if ($solicitud->solicitante_id !== $user->id) {
                    return response()->json(['message' => 'Solo el solicitante puede firmar'], 403);
                }
                
                $solicitud->update([
                    'solicitante_firmo_en' => now(),
                    'solicitante_ip' => $request->ip(),
                    'solicitante_dispositivo' => $request->header('User-Agent'),
                    'estado' => 'pendiente_jefe_seccion'
                ]);
                $nuevoEstado = 'pendiente_jefe_seccion';
                
                // NOTIFICACIÓN: Al jefe de servicio
                NotificacionHelper::enviarAJefeServicio(
                    $solicitud->sector_id,
                    'Nueva solicitud para firmar',
                    "La solicitud #{$solicitud->id} de {$solicitud->solicitante->nombre} requiere su firma como Jefe de Servicio",
                    'warning',
                    "/para-firmar",
                    $solicitud->id
                );
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
                $nuevoEstado = 'pendiente_jefe_activos';
                
                // NOTIFICACIÓN: Al jefe de soporte
                NotificacionHelper::enviarAJefeSoporte(
                    'Solicitud lista para autorizar',
                    "La solicitud #{$solicitud->id} de {$solicitud->solicitante->nombre} requiere autorización de Jefe de Soporte",
                    'info',
                    "/solicitudes-pendientes",
                    $solicitud->id
                );
                
                // NOTIFICACIÓN: Al solicitante
                NotificacionHelper::enviar(
                    $solicitud->solicitante_id,
                    'Solicitud aprobada por Jefe de Servicio',
                    "Tu solicitud #{$solicitud->id} ha sido aprobada por tu Jefe de Servicio y enviada a Soporte Técnico",
                    'success',
                    "/mis-solicitudes",
                    $solicitud->id
                );
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
                $nuevoEstado = 'pendiente_soporte';
                
                // NOTIFICACIÓN: A todos los técnicos
                NotificacionHelper::enviarATecnicos(
                    'Nueva solicitud disponible',
                    "La solicitud #{$solicitud->id} está lista para ser atendida por Soporte Técnico",
                    'info',
                    "/mis-trabajos",
                    $solicitud->id
                );
                
                // NOTIFICACIÓN: Al solicitante
                NotificacionHelper::enviar(
                    $solicitud->solicitante_id,
                    'Solicitud autorizada',
                    "Tu solicitud #{$solicitud->id} ha sido autorizada y está pendiente de asignación a un técnico",
                    'info',
                    "/mis-solicitudes",
                    $solicitud->id
                );
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
                $nuevoEstado = 'pendiente_jefe_mantenimiento';
                
                // NOTIFICACIÓN: Al jefe de soporte
                NotificacionHelper::enviarAJefeSoporte(
                    'Trabajo pendiente de cierre',
                    "La solicitud #{$solicitud->id} está pendiente de su firma para completar el proceso",
                    'warning',
                    "/solicitudes-pendientes",
                    $solicitud->id
                );
                
                // NOTIFICACIÓN: Al técnico asignado
                if ($solicitud->tecnico_asignado_id) {
                    NotificacionHelper::enviar(
                        $solicitud->tecnico_asignado_id,
                        'Trabajo conforme',
                        "El solicitante ha dado conformidad al trabajo realizado en la solicitud #{$solicitud->id}",
                        'success',
                        "/mis-trabajos",
                        $solicitud->id
                    );
                }
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
                $nuevoEstado = 'completado';
                
                // NOTIFICACIÓN: Al solicitante
                NotificacionHelper::enviar(
                    $solicitud->solicitante_id,
                    'Solicitud completada ✅',
                    "Tu solicitud #{$solicitud->id} ha sido completada exitosamente",
                    'success',
                    "/mis-solicitudes",
                    $solicitud->id
                );
                
                // NOTIFICACIÓN: Al técnico asignado
                if ($solicitud->tecnico_asignado_id) {
                    NotificacionHelper::enviar(
                        $solicitud->tecnico_asignado_id,
                        'Solicitud cerrada',
                        "La solicitud #{$solicitud->id} ha sido cerrada oficialmente. Buen trabajo! 🎉",
                        'success',
                        "/mis-trabajos",
                        $solicitud->id
                    );
                }
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

        // NOTIFICACIÓN: Al técnico asignado
        NotificacionHelper::enviar(
            $request->tecnico_id,
            'Nueva asignación de trabajo 🔧',
            "Se te ha asignado la solicitud #{$solicitud->id}: {$solicitud->titulo}",
            'info',
            "/mis-trabajos",
            $solicitud->id
        );
        
        // NOTIFICACIÓN: Al solicitante
        NotificacionHelper::enviar(
            $solicitud->solicitante_id,
            'Técnico asignado',
            "Se ha asignado un técnico a tu solicitud #{$solicitud->id}",
            'info',
            "/mis-solicitudes",
            $solicitud->id
        );

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

        // NOTIFICACIÓN: Al solicitante
        NotificacionHelper::enviar(
            $solicitud->solicitante_id,
            'Trabajo completado - Pendiente conformidad',
            "El técnico ha completado el trabajo en la solicitud #{$solicitud->id}. Por favor, da tu conformidad para cerrar el proceso.",
            'success',
            "/mis-solicitudes",
            $solicitud->id
        );
        
        // NOTIFICACIÓN: Al jefe de soporte
        NotificacionHelper::enviarAJefeSoporte(
            'Trabajo completado',
            "El técnico ha completado el trabajo en la solicitud #{$solicitud->id}. Pendiente conformidad del solicitante.",
            'info',
            "/solicitudes-pendientes",
            $solicitud->id
        );

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
        $request->validate([
            'materiales' => 'required|array',
            'materiales.*.material_id' => 'required|exists:materiales,id',
            'materiales.*.cantidad' => 'required|integer|min:1'
        ]);

        $solicitud = Solicitud::findOrFail($id);
        
        DB::beginTransaction();
        try {
            foreach ($request->materiales as $item) {
                $material = Material::find($item['material_id']);
                
                // Verificar stock
                if ($material->stock < $item['cantidad']) {
                    throw new \Exception("Stock insuficiente para {$material->nombre}");
                }
                
                // Reducir stock
                $material->decrement('stock', $item['cantidad']);
                
                // Registrar en solicitudes_materiales
                DB::table('solicitudes_materiales')->insert([
                    'solicitud_id' => $solicitud->id,
                    'material_id' => $item['material_id'],
                    'cantidad' => $item['cantidad'],
                    'creado_en' => now()
                ]);
            }
            
            DB::commit();
            
            // NOTIFICACIÓN: Al solicitante
            NotificacionHelper::enviar(
                $solicitud->solicitante_id,
                'Materiales utilizados',
                "Se han utilizado materiales en tu solicitud #{$solicitud->id}",
                'info',
                "/solicitudes/{$solicitud->id}",
                $solicitud->id
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Materiales registrados correctamente'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
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
        
        // Solicitudes por mes para gráficos
        $solicitudesPorMes = [];
        for ($i = 5; $i >= 0; $i--) {
            $mes = now()->subMonths($i);
            $count = (clone $query)->whereYear('creado_en', $mes->year)
                ->whereMonth('creado_en', $mes->month)
                ->count();
            $solicitudesPorMes[] = [
                'mes' => $mes->locale('es')->monthName,
                'total' => $count
            ];
        }
        
        // Distribución por estado
        $distribucionEstados = [
            'pendientes' => $pendientes,
            'en_proceso' => $enProceso,
            'completadas' => $completadas
        ];
        
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
                'solicitudes_por_mes' => $solicitudesPorMes,
                'distribucion_estados' => $distribucionEstados,
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

        // NOTIFICACIÓN: Al técnico (si está asignado) que hay nuevas imágenes
        if ($solicitud->tecnico_asignado_id) {
            NotificacionHelper::enviar(
                $solicitud->tecnico_asignado_id,
                'Nuevas imágenes subidas',
                "Se han subido nuevas imágenes a la solicitud #{$solicitud->id}",
                'info',
                "/solicitudes/{$solicitud->id}",
                $solicitud->id
            );
        }
        
        return response()->json([
            'success' => true,
            'message' => count($request->file('imagenes')) . ' imágenes subidas',
            'data' => ['rutas_fotos' => $rutas]
        ]);
    }

        
    /**
     * Generar PDF de la solicitud completada
     *//*
    public function generarPdf($id, Request $request)
    {
        $solicitud = Solicitud::with([
            'solicitante', 'sector', 'equipo', 'tecnicoAsignado',
            'jefeSeccion', 'jefeActivos', 'jefeMantenimiento', 'conformacion'
        ])->findOrFail($id);
        
        $user = $request->user();
        
        // Verificar permisos (solo admin, jefe soporte o solicitante)
        if (!in_array($user->rol->nombre, ['admin_sistema', 'jefe_soporte']) && 
            $solicitud->solicitante_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        
        // Generar QR con los datos de la solicitud
        $qrData = [
            'id' => $solicitud->id,
            'titulo' => $solicitud->titulo,
            'estado' => $solicitud->estado,
            'solicitante' => $solicitud->solicitante->nombre_completo,
            'fecha' => $solicitud->creado_en->format('d/m/Y H:i')
        ];
        
        $qrCode = base64_encode(QrCode::format('png')->size(200)->generate(json_encode($qrData)));
        
        // Datos para el PDF
        $data = [
            'solicitud' => $solicitud,
            'qrCode' => $qrCode,
            'fechaGeneracion' => now()->format('d/m/Y H:i:s')
        ];
        
        // Generar PDF
        $pdf = Pdf::loadView('pdf.solicitud', $data);
        $pdf->setPaper('a4', 'portrait');
        
        // Guardar PDF en storage
        $pdfPath = 'solicitudes/pdf/solicitud_' . $solicitud->id . '_' . time() . '.pdf';
        $pdfContent = $pdf->output();
        Storage::disk('public')->put($pdfPath, $pdfContent);
        
        // Actualizar en la base de datos
        $solicitud->update([
            'pdf_generado_en' => now(),
            'pdf_ruta' => '/storage/' . $pdfPath
        ]);
        
        // Devolver el PDF para descargar
        return $pdf->download("solicitud_{$solicitud->id}.pdf");
    }*/
    /**
     * Generar PDF de la solicitud (VERSIÓN DE PRUEBA)
     */
    /*
    Generar PDF de la solicitud (VERSIÓN DE PRUEBA)
    public function generarPdf($id, Request $request)
    {
        try {
            $solicitud = Solicitud::findOrFail($id);
            
            $user = $request->user();
            
            // Verificar permisos
            if (!in_array($user->rol->nombre, ['admin_sistema', 'jefe_soporte']) && 
                $solicitud->solicitante_id !== $user->id) {
                return response()->json(['message' => 'No autorizado'], 403);
            }
            
            // HTML simple para PDF
            $html = "
            <html>
            <head>
                <title>Solicitud #{$solicitud->id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #1e3a5f; }
                    .info { margin-bottom: 10px; }
                    .label { font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>HOSPITAL MILITAR</h1>
                <h2>Solicitud de Mantenimiento N° {$solicitud->id}</h2>
                <hr>
                <div class='info'><span class='label'>Título:</span> {$solicitud->titulo}</div>
                <div class='info'><span class='label'>Descripción:</span> {$solicitud->descripcion}</div>
                <div class='info'><span class='label'>Estado:</span> {$solicitud->estado}</div>
                <div class='info'><span class='label'>Solicitante:</span> {$solicitud->solicitante->nombre_completo}</div>
                <div class='info'><span class='label'>Fecha:</span> {$solicitud->creado_en}</div>
                <hr>
                <p>Documento generado el " . now()->format('d/m/Y H:i:s') . "</p>
            </body>
            </html>
            ";
            
            $pdf = Pdf::loadHTML($html);
            return $pdf->download("solicitud_{$solicitud->id}.pdf");
            
        } catch (\Exception $e) {
            Log::error('Error PDF: ' . $e->getMessage());
            Log::error('Line: ' . $e->getLine());
            return response()->json([
                'error' => 'Error al generar PDF: ' . $e->getMessage()
            ], 500);
        }
    }*/
    public function generarPdf($id, Request $request)
    {
        try {
            // ===== OBTENER DATOS =====
            $solicitud = Solicitud::with([
                'solicitante',
                'sector',
                'equipo',
                'tecnicoAsignado'
            ])->findOrFail($id);

            $user = $request->user();

            // ===== PERMISOS =====
            /*if (
                !in_array($user->rol->nombre, ['admin_sistema', 'jefe_soporte']) &&
                $solicitud->solicitante_id !== $user->id
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado'
                ], 403);
            }*/

            // ===== GENERAR QR =====
            $qrText = "Solicitud #{$solicitud->id}\n";
            $qrText .= "Título: {$solicitud->titulo}\n";
            $qrText .= "Estado: " . str_replace('_', ' ', $solicitud->estado) . "\n";
            $qrText .= "URL: " . url("/solicitudes/{$solicitud->id}");

            $qrCode = \Endroid\QrCode\QrCode::create($qrText)
                ->setSize(200)
                ->setMargin(10);

            $writer = new \Endroid\QrCode\Writer\PngWriter();
            $qrResult = $writer->write($qrCode);
            $qrBase64 = base64_encode($qrResult->getString());

            // ===== DATOS PARA VISTA =====
            $data = [
                'solicitud' => $solicitud,
                'qrCode' => $qrBase64,
                'fechaGeneracion' => now()->format('d/m/Y H:i')
            ];

            // ===== RENDER BLADE (CLAVE) =====
            $html = view('pdf.solicitud', $data)->render();

            // ===== GENERAR PDF =====
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'isHtml5ParserEnabled' => true,
                    'isRemoteEnabled' => true,
                    'defaultFont' => 'DejaVu Sans'
                ]);

            // ===== GUARDAR =====
            $pdfPath = 'solicitudes/pdf/solicitud_' . $solicitud->id . '_' . time() . '.pdf';

            \Illuminate\Support\Facades\Storage::disk('public')
                ->put($pdfPath, $pdf->output());

            $solicitud->update([
                'pdf_generado_en' => now(),
                'pdf_ruta' => '/storage/' . $pdfPath
            ]);

            // ===== DESCARGAR =====
            return $pdf->download("solicitud_{$solicitud->id}.pdf");

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error PDF: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al generar PDF'
            ], 500);
        }
    }


    /**
     * Obtener QR de la solicitud (Versión corregida)
     */
    public function obtenerQr($id, Request $request)
    {
        try {
            $solicitud = Solicitud::findOrFail($id);
            
            $user = $request->user();
            
            /*// Verificar permisos
            if (!in_array($user->rol->nombre, ['admin_sistema', 'jefe_soporte']) && 
                $solicitud->solicitante_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
            }*/
            
            // Generar URL pública para la solicitud
            $url = url("/solicitudes/{$solicitud->id}");
            
            // Texto completo del QR
            $qrText = "=== SOLICITUD DE MANTENIMIENTO ===\n";
            $qrText .= "URL: {$url}\n";
            $qrText .= "ID: {$solicitud->id}\n";
            $qrText .= "Título: {$solicitud->titulo}\n";
            $qrText .= "Estado: " . str_replace('_', ' ', $solicitud->estado) . "\n";
            $qrText .= "Solicitante: {$solicitud->solicitante->nombre_completo}\n";
            $qrText .= "Fecha: " . $solicitud->creado_en->format('d/m/Y H:i') . "\n";
            $qrText .= "\n--- Escanea para ver detalles ---";
            
            // Generar QR con colores correctos
            $qrCode = QrCode::create($qrText)
                ->setSize(350)
                ->setMargin(10)
                ->setForegroundColor(new Color(0, 0, 0))      // Negro
                ->setBackgroundColor(new Color(255, 255, 255)); // Blanco
            
            $writer = new PngWriter();
            $result = $writer->write($qrCode);
            $qrCodeBase64 = base64_encode($result->getString());
            
            return response()->json([
                'success' => true,
                'qr_code' => $qrCodeBase64,
                'solicitud_id' => $solicitud->id,
                'url' => $url
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error QR: ' . $e->getMessage());
            
            // Fallback: solo URL
            $url = url("/solicitudes/{$id}");
            return response()->json([
                'success' => true,
                'qr_code' => base64_encode($url),
                'solicitud_id' => $id,
                'warning' => 'QR simplificado'
            ]);
        }
    }
}