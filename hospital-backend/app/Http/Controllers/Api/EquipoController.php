<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipo;
use App\Models\CategoriaEquipo;
use App\Models\Sector;
use Illuminate\Http\Request;

class EquipoController extends Controller
{
    /*
    public function index()
    {
        $equipos = Equipo::with(['categoria', 'sector'])
                    ->orderBy('creado_en', 'desc')
                    ->get();
        
        return response()->json([
            'success' => true,
            'data' => $equipos
        ]);
    }*/
    // En EquipoController.php - index()
    public function index(Request $request)
    {
        $query = Equipo::with(['categoria', 'sector']);
        
        // Filtro de búsqueda
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                ->orWhere('codigo_equipo', 'like', "%{$search}%")
                ->orWhere('marca', 'like', "%{$search}%")
                ->orWhere('modelo', 'like', "%{$search}%")
                ->orWhere('numero_serie', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('sector_id')) {
            $query->where('sector_id', $request->sector_id);
        }
        
        if ($request->has('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }
        
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }
        
        $equipos = $query->orderBy('creado_en', 'desc')->paginate($request->per_page ?? 15);
        
        return response()->json([
            'success' => true,
            'data' => $equipos
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'codigo_equipo' => 'required|string|max:50|unique:equipos',
            'nombre' => 'required|string|max:255',
            'categoria_id' => 'required|exists:categorias_equipos,id',
            'sector_id' => 'required|exists:sectores,id',
        ]);

        $equipo = Equipo::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Equipo creado correctamente',
            'data' => $equipo
        ], 201);
    }

    public function show($id)
    {
        $equipo = Equipo::with(['categoria', 'sector', 'solicitudes'])
                    ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $equipo
        ]);
    }

    public function update(Request $request, $id)
    {
        $equipo = Equipo::findOrFail($id);
        
        $request->validate([
            'codigo_equipo' => 'sometimes|string|max:50|unique:equipos,codigo_equipo,' . $id,
            'nombre' => 'sometimes|string|max:255',
        ]);

        $equipo->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Equipo actualizado correctamente',
            'data' => $equipo
        ]);
    }

    public function destroy($id)
    {
        $equipo = Equipo::findOrFail($id);
        
        // Verificar si tiene solicitudes asociadas
        if ($equipo->solicitudes()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar: tiene solicitudes asociadas'
            ], 400);
        }
        
        $equipo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Equipo eliminado correctamente'
        ]);
    }

    // Obtener equipos por sector
    public function porSector($sectorId)
    {
        $equipos = Equipo::where('sector_id', $sectorId)
                    ->where('estado', 'operativo')
                    ->get();
        
        return response()->json([
            'success' => true,
            'data' => $equipos
        ]);
    }

    // Obtener equipos por categoría
    public function porCategoria($categoriaId)
    {
        $equipos = Equipo::with('sector')
                    ->where('categoria_id', $categoriaId)
                    ->get();
        
        return response()->json([
            'success' => true,
            'data' => $equipos
        ]);
    }
}