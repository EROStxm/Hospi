<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        $query = Material::query();
        
        // Filtro de búsqueda
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                ->orWhere('codigo', 'like', "%{$search}%")
                ->orWhere('descripcion', 'like', "%{$search}%")
                ->orWhere('categoria', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('categoria')) {
            $query->where('categoria', $request->categoria);
        }
        
        if ($request->has('stock_bajo')) {
            $query->whereRaw('stock <= stock_minimo');
        }
        
        if ($request->has('esta_activo')) {
            $query->where('esta_activo', $request->esta_activo);
        }
        
        $materiales = $query->orderBy('nombre')->paginate($request->per_page ?? 15);
        
        return response()->json([
            'success' => true,
            'data' => $materiales
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'codigo' => 'required|string|max:50|unique:materiales',
            'nombre' => 'required|string|max:255',
            'stock' => 'required|integer|min:0',
            'stock_minimo' => 'required|integer|min:1',
            'unidad' => 'required|string|max:50',
            'costo_unitario' => 'nullable|numeric|min:0',
        ]);

        $material = Material::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Material creado correctamente',
            'data' => $material
        ], 201);
    }

    public function show($id)
    {
        $material = Material::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $material->id,
                'codigo' => $material->codigo,
                'nombre' => $material->nombre,
                'descripcion' => $material->descripcion,
                'categoria' => $material->categoria,
                'stock' => $material->stock,
                'stock_minimo' => $material->stock_minimo,
                'unidad' => $material->unidad,
                'costo_unitario' => $material->costo_unitario,
                'esta_activo' => $material->esta_activo,
                'stock_bajo' => $material->stock <= $material->stock_minimo
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $material = Material::findOrFail($id);
        
        $request->validate([
            'codigo' => 'sometimes|string|max:50|unique:materiales,codigo,' . $id,
            'nombre' => 'sometimes|string|max:255',
            'stock' => 'sometimes|integer|min:0',
            'stock_minimo' => 'sometimes|integer|min:1',
        ]);

        $material->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Material actualizado correctamente',
            'data' => $material
        ]);
    }

    public function destroy($id)
    {
        $material = Material::findOrFail($id);
        
        // Verificar si tiene usos en solicitudes
        if ($material->solicitudes()->count() > 0) {
            // Desactivar en lugar de eliminar
            $material->update(['esta_activo' => false]);
            
            return response()->json([
                'success' => true,
                'message' => 'Material desactivado (tiene historial de uso)'
            ]);
        }
        
        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Material eliminado correctamente'
        ]);
    }

    // Ajustar stock
    public function ajustarStock(Request $request, $id)
    {
        $request->validate([
            'cantidad' => 'required|integer',
            'tipo' => 'required|in:entrada,salida',
            'notas' => 'nullable|string'
        ]);

        $material = Material::findOrFail($id);
        
        if ($request->tipo === 'entrada') {
            $material->increment('stock', $request->cantidad);
        } else {
            if ($material->stock < $request->cantidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock insuficiente'
                ], 400);
            }
            $material->decrement('stock', $request->cantidad);
        }

        return response()->json([
            'success' => true,
            'message' => 'Stock actualizado correctamente',
            'data' => $material->fresh()
        ]);
    }

    // Materiales con stock bajo
    public function stockBajo()
    {
        $materiales = Material::where('esta_activo', true)
                        ->whereRaw('stock <= stock_minimo')
                        ->get();
        
        return response()->json([
            'success' => true,
            'data' => $materiales
        ]);
    }
}