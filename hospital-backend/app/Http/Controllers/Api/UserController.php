<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Rol;
use App\Models\Sector;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['rol', 'sector']);
        
        // Filtro de búsqueda
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre_completo', 'like', "%{$search}%")
                ->orWhere('codigo_militar', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('grado', 'like', "%{$search}%")
                ->orWhere('especialidad', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('rol_id')) {
            $query->where('rol_id', $request->rol_id);
        }
        
        if ($request->has('sector_id')) {
            $query->where('sector_id', $request->sector_id);
        }
        
        if ($request->has('esta_activo')) {
            $query->where('esta_activo', $request->esta_activo);
        }
        
        $usuarios = $query->orderBy('nombre_completo')->paginate($request->per_page ?? 15);
        
        return response()->json([
            'success' => true,
            'data' => $usuarios
        ]);
    }

    public function tecnicos()
    {
        $tecnicos = User::whereHas('rol', function($q) {
                        $q->where('nombre', 'soporte_tecnico');
                    })
                    ->where('esta_activo', true)
                    ->get(['id', 'codigo_militar', 'nombre_completo', 'grado', 'especialidad']);
        
        return response()->json([
            'success' => true,
            'data' => $tecnicos
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'codigo_militar' => 'required|string|max:20|unique:usuarios',
            'nombre_completo' => 'required|string|max:255',
            'contrasena' => 'required|string|min:6',
            'rol_id' => 'required|exists:roles,id',
            'email' => 'nullable|email|unique:usuarios',
        ]);

        $user = User::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Usuario creado correctamente',
            'data' => $user
        ], 201);
    }

    public function show($id)
    {
        $user = User::with(['rol', 'sector', 'solicitudes'])
                    ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'codigo_militar' => 'sometimes|string|max:20|unique:usuarios,codigo_militar,' . $id,
            'nombre_completo' => 'sometimes|string|max:255',
            'email' => 'nullable|email|unique:usuarios,email,' . $id,
        ]);

        // No actualizar contraseña si viene vacía
        $data = $request->all();
        if (empty($data['contrasena'])) {
            unset($data['contrasena']);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado correctamente',
            'data' => $user
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Verificar si tiene solicitudes
        if ($user->solicitudes()->count() > 0) {
            $user->update(['esta_activo' => false]);
            
            return response()->json([
                'success' => true,
                'message' => 'Usuario desactivado (tiene solicitudes asociadas)'
            ]);
        }
        
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado correctamente'
        ]);
    }

    // Cambiar contraseña
    public function cambiarPassword(Request $request, $id)
    {
        $request->validate([
            'contrasena' => 'required|string|min:6'
        ]);

        $user = User::findOrFail($id);
        $user->update(['contrasena' => $request->contrasena]);

        return response()->json([
            'success' => true,
            'message' => 'Contraseña actualizada correctamente'
        ]);
    }
}