<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Solicitud;
use App\Models\User;
use App\Models\Material;
use App\Models\Equipo;
use App\Models\Sector;
use Illuminate\Http\Request;

class SolicitudController extends Controller
{
    /**
     * Ver TODAS las solicitudes (solo admin)
     */
    public function index(Request $request)
    {
        $query = Solicitud::with(['solicitante', 'sector', 'equipo', 'tecnicoAsignado']);
        
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }
        
        if ($request->has('sector_id')) {
            $query->where('sector_id', $request->sector_id);
        }
        
        if ($request->has('fecha_desde')) {
            $query->whereDate('creado_en', '>=', $request->fecha_desde);
        }
        
        $solicitudes = $query->orderBy('creado_en', 'desc')->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $solicitudes
        ]);
    }

    /**
     * Ver MIS solicitudes (cualquier usuario)
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
        
        // Consulta simple
        $solicitudes = Solicitud::where('solicitante_id', $user->id)
                        ->orderBy('creado_en', 'desc')
                        ->get();
        
        // Cargar relaciones manualmente
        foreach ($solicitudes as $solicitud) {
            $solicitud->equipo = Equipo::find($solicitud->equipo_id);
            $solicitud->sector = Sector::find($solicitud->sector_id);
        }
        
        return response()->json([
            'success' => true,
            'data' => $solicitudes
        ]);
    }

    /**
     * Solicitudes pendientes para soporte técnico
     */
    public function pendientesSoporte(Request $request)
    {
        $query = Solicitud::with(['solicitante', 'sector', 'equipo'])
                    ->whereIn('estado', ['pendiente_soporte', 'asignado', 'en_proceso']);
        
        $user = $request->user();
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
                'message' => 'No tiene sector asignado'
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
            'rutas_fotos' => 'nullable|array',
        ]);

        $user = $request->user();

        $solicitud = Solicitud::create([
            'tipo_solicitud' => $request->tipo_solicitud,
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'equipo_id' => $request->equipo_id,
            'solicitante_id' => $user->id,
            'sector_id' => $request->sector_id,
            'rutas_fotos' => $request->rutas_fotos,
            'estado' => 'pendiente_solicitante',
        ]);

        $solicitud->equipo = Equipo::find($solicitud->equipo_id);
        $solicitud->sector = Sector::find($solicitud->sector_id);

        return response()->json([
            'success' => true,
            'message' => 'Solicitud creada correctamente',
            'data' => $solicitud
        ], 201);
    }

    /**
     * Ver detalle de una solicitud
     */
    public function show($id, Request $request)
    {
        $user = $request->user();
        $solicitud = Solicitud::findOrFail($id);
        
        // Cargar relaciones manualmente
        $solicitud->solicitante = User::find($solicitud->solicitante_id);
        $solicitud->sector = Sector::find($solicitud->sector_id);
        $solicitud->equipo = Equipo::find($solicitud->equipo_id);
        $solicitud->tecnicoAsignado = User::find($solicitud->tecnico_asignado_id);

        // Verificar permisos
        $puedeVer = false;
        
        if ($user->rol->nombre === 'admin_sistema') {
            $puedeVer = true;
        } elseif (in_array($user->rol->nombre, ['jefe_soporte', 'soporte_tecnico'])) {
            $puedeVer = true;
        } elseif ($user->rol->nombre === 'jefe_servicio' && $solicitud->sector_id === $user->sector_id) {
            $puedeVer = true;
        } elseif ($solicitud->solicitante_id === $user->id) {
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
            case 'pendiente_solicitante':
                if ($solicitud->solicitante_id !== $user->id) {
                    return response()->json(['message' => 'Solo el solicitante puede firmar'], 403);
                }
                
                $solicitud->update([
                    'solicitante_firmo_en' => now(),
                    'solicitante_ip' => $request->ip(),
                    'solicitante_dispositivo' => $request->header('User-Agent'),
                    'estado' => $solicitud->tipo_solicitud === 'con_material' 
                        ? 'pendiente_jefe_seccion' 
                        : 'pendiente_soporte'
                ]);
                break;

            case 'pendiente_jefe_seccion':
                if (!$user->rol->puede_aprobar_material || $solicitud->sector_id !== $user->sector_id) {
                    return response()->json(['message' => 'No autorizado para firmar'], 403);
                }
                
                $solicitud->update([
                    'jefe_seccion_firmo_en' => now(),
                    'jefe_seccion_id' => $user->id,
                    'jefe_seccion_ip' => $request->ip(),
                    'estado' => 'pendiente_jefe_activos'
                ]);
                break;

            case 'pendiente_jefe_activos':
                if (!in_array($user->rol->nombre, ['jefe_soporte', 'admin_sistema'])) {
                    return response()->json(['message' => 'No autorizado para firmar'], 403);
                }
                
                $solicitud->update([
                    'jefe_activos_firmo_en' => now(),
                    'jefe_activos_id' => $user->id,
                    'jefe_activos_ip' => $request->ip(),
                    'estado' => 'pendiente_soporte'
                ]);
                break;

            case 'pendiente_conformacion':
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
                if (!in_array($user->rol->nombre, ['jefe_soporte', 'admin_sistema'])) {
                    return response()->json(['message' => 'No autorizado para firmar'], 403);
                }
                
                $solicitud->update([
                    'jefe_mantenimiento_firmo_en' => now(),
                    'jefe_mantenimiento_id' => $user->id,
                    'jefe_mantenimiento_ip' => $request->ip(),
                    'estado' => 'completado'
                ]);
                break;

            default:
                return response()->json(['message' => 'No se puede firmar en este estado'], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Firma registrada correctamente',
            'data' => $solicitud->fresh()
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
        
        if ($solicitud->estado !== 'pendiente_soporte') {
            return response()->json(['message' => 'La solicitud no está pendiente de asignación'], 400);
        }

        $tecnico = User::find($request->tecnico_id);
        if ($tecnico->rol->nombre !== 'soporte_tecnico') {
            return response()->json(['message' => 'El usuario seleccionado no es técnico'], 400);
        }

        $solicitud->update([
            'tecnico_asignado_id' => $request->tecnico_id,
            'tecnico_asignado_en' => now(),
            'estado' => 'asignado'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Técnico asignado correctamente',
            'data' => $solicitud->fresh()
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

        $user = $request->user();
        $solicitud = Solicitud::findOrFail($id);
        
        if ($solicitud->tecnico_asignado_id !== $user->id) {
            return response()->json(['message' => 'Solo el técnico asignado puede completar el trabajo'], 403);
        }

        $solicitud->update([
            'trabajo_terminado_en' => now(),
            'notas_tecnico' => $request->notas_tecnico,
            'estado' => 'pendiente_conformacion'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trabajo completado, esperando conformación',
            'data' => $solicitud->fresh()
        ]);
    }

    /**
     * Registrar uso de materiales
     */
    public function usarMaterial(Request $request, $id)
    {
        $request->validate([
            'materiales' => 'required|array',
            'materiales.*.id' => 'required|exists:materiales,id',
            'materiales.*.cantidad' => 'required|integer|min:1',
        ]);

        $solicitud = Solicitud::findOrFail($id);
        $user = $request->user();

        foreach ($request->materiales as $item) {
            $material = Material::find($item['id']);
            
            if ($material->stock < $item['cantidad']) {
                return response()->json([
                    'message' => "Stock insuficiente para {$material->nombre}"
                ], 400);
            }

            $solicitud->materiales()->attach($material->id, [
                'cantidad_usada' => $item['cantidad'],
                'registrado_por_id' => $user->id,
                'registrado_en' => now(),
                'notas' => $item['notas'] ?? null,
            ]);

            $material->decrement('stock', $item['cantidad']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Materiales registrados correctamente'
        ]);
    }
}