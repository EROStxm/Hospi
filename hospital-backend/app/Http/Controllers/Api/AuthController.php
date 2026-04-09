<?php
// app/Http/Controllers/Api/AuthController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'codigo_militar' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('codigo_militar', $request->codigo_militar)
                    ->where('esta_activo', true)
                    ->first();

        // Verificación directa sin hash (temporal)
        if (!$user || $user->contrasena !== $request->password) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        // Actualizar último ingreso
        $user->update([
            'ultimo_ingreso_en' => now(),
            'ultimo_ingreso_ip' => $request->ip(),
        ]);

        // Eliminar tokens anteriores
        $user->tokens()->delete();

        // Crear nuevo token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'codigo_militar' => $user->codigo_militar,
                'nombre_completo' => $user->nombre_completo,
                'email' => $user->email,
                'grado' => $user->grado,
                'rol' => $user->rol ? [
                    'id' => $user->rol->id,
                    'nombre' => $user->rol->nombre,
                    'nivel' => $user->rol->nivel,
                    'permisos' => [
                        'aprobar_material' => (bool)$user->rol->puede_aprobar_material,
                        'asignar_tecnico' => (bool)$user->rol->puede_asignar_tecnico,
                        'gestionar_inventario' => (bool)$user->rol->puede_gestionar_inventario,
                        'ver_todas_solicitudes' => (bool)$user->rol->puede_ver_todas_solicitudes,
                    ]
                ] : null,
                'sector' => $user->sector,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'codigo_militar' => $user->codigo_militar,
                'nombre_completo' => $user->nombre_completo,
                'email' => $user->email,
                'grado' => $user->grado,
                'especialidad' => $user->especialidad,
                'telefono' => $user->telefono,
                'rol' => $user->rol ? [
                    'id' => $user->rol->id,
                    'nombre' => $user->rol->nombre,
                    'nivel' => $user->rol->nivel,
                    'permisos' => [
                        'aprobar_material' => (bool)$user->rol->puede_aprobar_material,
                        'asignar_tecnico' => (bool)$user->rol->puede_asignar_tecnico,
                        'gestionar_inventario' => (bool)$user->rol->puede_gestionar_inventario,
                        'ver_todas_solicitudes' => (bool)$user->rol->puede_ver_todas_solicitudes,
                    ]
                ] : null,
                'sector' => $user->sector,
                'tiene_huella' => !is_null($user->huella),
            ]
        ]);
    }
}