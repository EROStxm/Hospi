<?php
// app/Http/Controllers/Api/RolController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rol;
use Illuminate\Http\Request;

class RolController extends Controller
{
    // GET - Funciona ✅
    public function index()
    {
        $roles = Rol::orderBy('nivel', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }

    // POST - Simplificado para prueba
    public function store(Request $request)
    {
        // Sin validación para prueba
        $rol = Rol::create([
            'nombre' => $request->nombre ?? 'test_' . time(),
            'nivel' => $request->nivel ?? 1,
            'descripcion' => $request->descripcion ?? 'Rol de prueba',
            'puede_aprobar_material' => $request->puede_aprobar_material ?? false,
            'puede_asignar_tecnico' => $request->puede_asignar_tecnico ?? false,
            'puede_gestionar_inventario' => $request->puede_gestionar_inventario ?? false,
            'puede_ver_todas_solicitudes' => $request->puede_ver_todas_solicitudes ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rol creado',
            'data' => $rol
        ], 201);
    }

    // GET by ID
    public function show($id)
    {
        $rol = Rol::find($id);
        if (!$rol) {
            return response()->json(['success' => false, 'message' => 'No encontrado'], 404);
        }
        return response()->json(['success' => true, 'data' => $rol]);
    }

    // PUT - Simplificado
    public function update(Request $request, $id)
    {
        $rol = Rol::find($id);
        if (!$rol) {
            return response()->json(['success' => false, 'message' => 'No encontrado'], 404);
        }

        $rol->update($request->only([
            'nombre', 'nivel', 'descripcion', 
            'puede_aprobar_material', 'puede_asignar_tecnico',
            'puede_gestionar_inventario', 'puede_ver_todas_solicitudes'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Rol actualizado',
            'data' => $rol
        ]);
    }

    // DELETE
    public function destroy($id)
    {
        $rol = Rol::find($id);
        if (!$rol) {
            return response()->json(['success' => false, 'message' => 'No encontrado'], 404);
        }

        $rol->delete();
        return response()->json(['success' => true, 'message' => 'Rol eliminado']);
    }
}