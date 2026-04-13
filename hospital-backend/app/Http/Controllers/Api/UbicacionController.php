<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ubicacion;
use Illuminate\Http\Request;

class UbicacionController extends Controller
{
    public function index(Request $request)
    {
        $query = Ubicacion::with('sector');
        
        if ($request->has('sector_id')) {
            $query->where('sector_id', $request->sector_id);
        }
        
        if ($request->has('esta_activo')) {
            $query->where('esta_activo', $request->esta_activo);
        }
        
        $ubicaciones = $query->orderBy('sector_id')->orderBy('nombre')->get();
        
        return response()->json([
            'success' => true,
            'data' => $ubicaciones
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'sector_id' => 'required|exists:sectores,id',
            'codigo' => 'required|string|max:20',
            'nombre' => 'required|string|max:100',
        ]);

        $ubicacion = Ubicacion::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $ubicacion
        ], 201);
    }

    public function show($id)
    {
        $ubicacion = Ubicacion::with(['sector', 'equipos'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $ubicacion]);
    }

    public function update(Request $request, $id)
    {
        $ubicacion = Ubicacion::findOrFail($id);
        $ubicacion->update($request->all());
        return response()->json(['success' => true, 'data' => $ubicacion]);
    }

    public function destroy($id)
    {
        $ubicacion = Ubicacion::findOrFail($id);
        
        if ($ubicacion->equipos()->count() > 0) {
            $ubicacion->update(['esta_activo' => false]);
            return response()->json([
                'success' => true,
                'message' => 'Ubicación desactivada (tiene equipos asociados)'
            ]);
        }
        
        $ubicacion->delete();
        return response()->json(['success' => true, 'message' => 'Ubicación eliminada']);
    }

    // Obtener ubicaciones por sector
    public function porSector($sectorId)
    {
        $ubicaciones = Ubicacion::where('sector_id', $sectorId)
                        ->where('esta_activo', true)
                        ->orderBy('nombre')
                        ->get();
        
        return response()->json([
            'success' => true,
            'data' => $ubicaciones
        ]);
    }
}