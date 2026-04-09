<?php
// app/Http/Controllers/Api/SolicitudController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Solicitud;
use Illuminate\Http\Request;

class SolicitudController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Solicitud::with(['solicitante', 'sector', 'equipo']);

        // Si no es admin, filtrar por sector o rol
        if ($user->rol && !$user->rol->puede_ver_todas_solicitudes) {
            if (in_array($user->rol->nombre, ['soporte_tecnico', 'jefe_soporte'])) {
                $query->whereIn('estado', ['pendiente_soporte', 'asignado', 'en_proceso']);
            } else {
                $query->where('sector_id', $user->sector_id);
            }
        }

        $solicitudes = $query->orderBy('creado_en', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $solicitudes
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tipo_solicitud' => 'required|in:sin_material,con_material',
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'equipo_id' => 'nullable|exists:equipos,id',
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

    public function show($id)
    {
        $solicitud = Solicitud::with([
            'solicitante', 
            'sector', 
            'equipo', 
            'tecnicoAsignado',
            'materiales'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $solicitud
        ]);
    }

    public function firmar(Request $request, $id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Firma registrada (pendiente implementar lógica completa)'
        ]);
    }

    public function asignarTecnico(Request $request, $id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Técnico asignado (pendiente implementar lógica completa)'
        ]);
    }

    public function usarMaterial(Request $request, $id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Material registrado (pendiente implementar lógica completa)'
        ]);
    }
}