<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use Illuminate\Http\Request;

class SectorController extends Controller
{
    public function index(Request $request)
    {
        $query = Sector::query();
        
        // Filtro de búsqueda
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                ->orWhere('codigo', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('esta_activo')) {
            $query->where('esta_activo', $request->esta_activo);
        }
        
        if ($request->has('es_critico')) {
            $query->where('es_critico', $request->es_critico);
        }
        
        $sectores = $query->orderBy('nombre')->paginate($request->per_page ?? 15);
        
        return response()->json([
            'success' => true,
            'data' => $sectores
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'codigo' => 'required|string|max:20|unique:sectores',
            'nombre' => 'required|string|max:100',
            'piso' => 'nullable|integer',
            'telefono_extension' => 'nullable|string|max:20',
        ]);

        $sector = Sector::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Sector creado correctamente',
            'data' => $sector
        ], 201);
    }

    public function show($id)
    {
        $sector = Sector::with(['equipos', 'usuarios'])
                    ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $sector
        ]);
    }

    public function update(Request $request, $id)
    {
        $sector = Sector::findOrFail($id);
        
        $request->validate([
            'codigo' => 'sometimes|string|max:20|unique:sectores,codigo,' . $id,
            'nombre' => 'sometimes|string|max:100',
        ]);

        $sector->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Sector actualizado correctamente',
            'data' => $sector
        ]);
    }

    public function destroy($id)
    {
        $sector = Sector::findOrFail($id);
        
        // Verificar si tiene dependencias
        if ($sector->usuarios()->count() > 0 || $sector->equipos()->count() > 0) {
            $sector->update(['esta_activo' => false]);
            
            return response()->json([
                'success' => true,
                'message' => 'Sector desactivado (tiene dependencias)'
            ]);
        }
        
        $sector->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sector eliminado correctamente'
        ]);
    }
}