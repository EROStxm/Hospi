<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class HuellaController extends Controller
{
    // =============================================
    // MÉTODOS PÚBLICOS (ESP32 y Frontend)
    // =============================================

    /**
     * Registrar huella - Guarda el template en BD
     * Lo llama el ESP32 cuando completa el registro
     */
    public function registrar(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:usuarios,id',
            'template' => 'required|string'
        ]);

        $user = User::findOrFail($request->user_id);
        
        $user->update([
            'huella' => $request->template,
            'huella_registrada_en' => now()
        ]);
        
        Log::info("Huella registrada para: {$user->nombre_completo}");
        
        return response()->json([
            'success' => true,
            'message' => 'Huella registrada exitosamente'
        ]);
    }

    /**
     * Verificar huella - Login con huella
     */
    public function verificar(Request $request)
    {
        $request->validate([
            'template' => 'required|string'
        ]);

        $usuarios = User::whereNotNull('huella')
                        ->where('esta_activo', true)
                        ->get();
        
        foreach ($usuarios as $usuario) {
            if ($usuario->huella === $request->template) {
                $token = $usuario->createToken('fingerprint')->plainTextToken;
                
                return response()->json([
                    'success' => true,
                    'token' => $token,
                    'user' => [
                        'id' => $usuario->id,
                        'nombre_completo' => $usuario->nombre_completo,
                        'codigo_militar' => $usuario->codigo_militar,
                        'grado' => $usuario->grado,
                        'rol' => $usuario->rol
                    ]
                ]);
            }
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Huella no reconocida'
        ], 401);
    }

    /**
     * Eliminar huella de un usuario
     */
    public function eliminar($id)
    {
        $user = User::findOrFail($id);
        $user->update([
            'huella' => null,
            'huella_registrada_en' => null
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Huella eliminada'
        ]);
    }

    /**
     * Listar usuarios con huella
     */
    public function listarConHuella()
    {
        $users = User::select('id', 'codigo_militar', 'nombre_completo', 'grado', 'huella', 'huella_registrada_en')
            ->with('rol:id,nombre')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    // =============================================
    // MÉTODOS PARA COMUNICACIÓN ESP32 ↔ FRONTEND
    // =============================================

    /**
     * Iniciar registro - Lo llama el Frontend
     */
    public function iniciarRegistro(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:usuarios,id',
            'nombre' => 'required|string'
        ]);

        $userId = $request->user_id;
        
        Cache::put("fingerprint_{$userId}", [
            'user_id' => $userId,
            'nombre' => $request->nombre,
            'paso' => 1,
            'completado' => false,
            'error' => false,
            'template' => null
        ], 60);
        
        Log::info("Registro iniciado para usuario {$userId}");
        
        return response()->json([
            'success' => true,
            'message' => 'Registro iniciado. Coloca tu dedo en el sensor.'
        ]);
    }

    /**
     * Actualizar estado - Lo llama el ESP32
     */
    public function actualizarEstado(Request $request)
    {
        $request->validate([
            'user_id' => 'required',
            'paso' => 'required|integer'
        ]);
        
        $userId = $request->user_id;
        $key = "fingerprint_{$userId}";
        $estado = Cache::get($key, []);
        
        $estado['paso'] = $request->paso;
        $estado['completado'] = $request->completado ?? false;
        $estado['template'] = $request->template;
        $estado['error'] = $request->error ?? false;
        
        Cache::put($key, $estado, 60);
        
        // Si completó, guardar en BD automáticamente
        if ($estado['completado'] && $estado['template']) {
            $user = User::find($userId);
            if ($user) {
                $user->update([
                    'huella' => $estado['template'],
                    'huella_registrada_en' => now()
                ]);
                Log::info("Huella guardada para: {$user->nombre_completo}");
            }
        }
        
        return response()->json(['success' => true]);
    }

    /**
     * Consultar estado - Lo llama el Frontend (polling)
     */
    public function estadoRegistro($userId)
    {
        $key = "fingerprint_{$userId}";
        $estado = Cache::get($key);
        
        if (!$estado) {
            return response()->json([
                'paso' => 0,
                'completado' => false,
                'error' => true,
                'message' => 'No hay registro activo'
            ]);
        }
        
        return response()->json($estado);
    }
    /**
     * LIMPIAR MEMORIA DEL SENSOR AS608
     * El ESP32 llama a esto para eliminar todas las huellas de su memoria interna
     */
    public function limpiarSensor(Request $request)
    {
        // Esta ruta es para que el ESP32 limpie su memoria interna
        // El ESP32 debe ejecutar finger.emptyDatabase() o finger.deleteModel()
        
        return response()->json([
            'success' => true,
            'message' => 'Comando de limpieza enviado al ESP32'
        ]);
    }
}