<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();
        
        if (!$user || !$user->rol) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado'
            ], 403);
        }

        // Verificar si el rol del usuario está en la lista permitida
        if (!in_array($user->rol->nombre, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para esta acción'
            ], 403);
        }

        return $next($request);
    }
}