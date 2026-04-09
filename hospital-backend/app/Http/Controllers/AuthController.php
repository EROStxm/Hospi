<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Login SIN hash (temporal)
    public function login(Request $request)
    {
        $request->validate([
            'codigo_militar' => 'required',
            'contrasena' => 'required',
        ]);

        $user = User::where('codigo_militar', $request->codigo_militar)
                    ->where('esta_activo', true)
                    ->first();

        // Temporal: comparación directa SIN hash
        if (!$user || $user->contrasena !== $request->contrasena) {
            return response()->json([
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        // Actualizar último ingreso
        $user->update([
            'ultimo_ingreso_en' => now(),
            'ultimo_ingreso_ip' => $request->ip(),
        ]);

        // Crear token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'codigo_militar' => $user->codigo_militar,
                'nombre_completo' => $user->nombre_completo,
                'email' => $user->email,
                'rol' => $user->rol ? $user->rol->nombre : null,
                'sector' => $user->sector ? $user->sector->nombre : null,
                'permisos' => [
                    'puede_aprobar_material' => $user->puedeAprobarMaterial(),
                    'puede_asignar_tecnico' => $user->puedeAsignarTecnico(),
                    'puede_gestionar_inventario' => $user->rol->puede_gestionar_inventario ?? false,
                    'puede_ver_todas_solicitudes' => $user->rol->puede_ver_todas_solicitudes ?? false,
                ]
            ]
        ]);
    }

    // Registro de huella digital
    public function registrarHuella(Request $request)
    {
        $request->validate([
            'huella' => 'required|string',
        ]);

        $user = $request->user();
        $user->update([
            'huella' => $request->huella,
            'huella_registrada_en' => now(),
        ]);

        return response()->json([
            'message' => 'Huella registrada correctamente'
        ]);
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    // Perfil del usuario
    public function perfil(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
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
                ] : null,
                'sector' => $user->sector,
                'tiene_huella' => !is_null($user->huella),
            ]
        ]);
    }
}