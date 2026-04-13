<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado'
            ], 401);
        }
        
        // Cargar el rol si no está cargado
        if (!$user->relationLoaded('rol')) {
            $user->load('rol');
        }
        
        if (!$user->rol) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario sin rol asignado'
            ], 403);
        }

        if (!in_array($user->rol->nombre, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para esta acción'
            ], 403);
        }

        return $next($request);
    }
}