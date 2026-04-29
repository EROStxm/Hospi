<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class HuellaController extends Controller
{
    /**
     * REGISTRAR HUELLA - Guarda el template en BD
     * El ESP32 envía el template (512 bytes en Base64)
     */
    public function registrar(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:usuarios,id',
            'template' => 'required|string'
        ]);

        $user = User::findOrFail($request->user_id);
        
        // Guardar el template COMPLETO en la base de datos
        // El template puede ser Base64 o string
        $user->update([
            'huella' => $request->template,  // Guarda el template real
            'huella_registrada_en' => now()
        ]);
        
        Log::info("Huella registrada para usuario: {$user->nombre_completo} (ID: {$user->id})");
        
        return response()->json([
            'success' => true,
            'message' => 'Huella registrada exitosamente',
            'data' => [
                'user_id' => $user->id,
                'nombre' => $user->nombre_completo,
                'registrada_en' => $user->huella_registrada_en
            ]
        ]);
    }

    /**
     * VERIFICAR HUELLA - Compara con templates guardados
     */
    public function verificar(Request $request)
    {
        $request->validate([
            'template' => 'required|string',
            'device_id' => 'nullable|string'
        ]);

        $templateEnviado = $request->template;
        
        // Buscar usuarios con huella registrada
        $usuarios = User::whereNotNull('huella')
                        ->where('esta_activo', true)
                        ->get();
        
        Log::info("Verificando huella contra " . $usuarios->count() . " usuarios registrados");
        
        foreach ($usuarios as $usuario) {
            // Comparar templates (aquí iría la lógica de comparación)
            // Como el ESP32 no envía el template real, usamos el ID
            // Para comparación real, necesitarías una librería como libfprint
            
            // MÉTODO SIMPLIFICADO: Si el template enviado coincide con el guardado
            if ($this->compareTemplates($usuario->huella, $templateEnviado)) {
                
                // Actualizar último ingreso
                $usuario->update([
                    'ultimo_ingreso_en' => now(),
                    'ultimo_ingreso_ip' => $request->ip()
                ]);
                
                // Generar token de autenticación
                $token = $usuario->createToken('fingerprint_' . $usuario->id)->plainTextToken;
                
                Log::info("✅ Acceso concedido a: {$usuario->nombre_completo}");
                
                return response()->json([
                    'success' => true,
                    'message' => 'Huella verificada correctamente',
                    'token' => $token,
                    'user' => [
                        'id' => $usuario->id,
                        'nombre_completo' => $usuario->nombre_completo,
                        'codigo_militar' => $usuario->codigo_militar,
                        'grado' => $usuario->grado,
                        'rol' => $usuario->rol ? [
                            'id' => $usuario->rol->id,
                            'nombre' => $usuario->rol->nombre
                        ] : null,
                        'sector' => $usuario->sector ? [
                            'id' => $usuario->sector->id,
                            'nombre' => $usuario->sector->nombre
                        ] : null
                    ]
                ]);
            }
        }
        
        Log::warning("❌ Intento de acceso con huella no registrada");
        
        return response()->json([
            'success' => false,
            'message' => 'Huella no reconocida'
        ], 401);
    }

    /**
     * COMPARAR DOS TEMPLATES DE HUELLA
     * NOTA: Esta es una implementación simplificada
     * Para producción, usa una librería de matching de huellas
     */
    private function compareTemplates($template1, $template2)
    {
        // Método 1: Comparación exacta (para pruebas)
        if ($template1 === $template2) {
            return true;
        }
        
        // Método 2: Extraer ID del template (si guardaste solo el ID)
        // $id1 = preg_replace('/[^0-9]/', '', $template1);
        // $id2 = preg_replace('/[^0-9]/', '', $template2);
        // return $id1 === $id2;
        
        // Método 3: Similaridad (para templates reales - requiere librería externa)
        // $similarity = $this->calculateSimilarity($template1, $template2);
        // return $similarity > 0.7; // Umbral del 70%
        
        return false;
    }

    /**
     * ELIMINAR HUELLA
     */
    public function eliminar(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $user->update([
            'huella' => null,
            'huella_registrada_en' => null
        ]);
        
        Log::info("Huella eliminada para usuario: {$user->nombre_completo}");
        
        return response()->json([
            'success' => true,
            'message' => 'Huella eliminada correctamente'
        ]);
    }

    /**
     * LISTAR USUARIOS CON HUELLA
     */
    public function listarConHuella()
    {
        $users = User::whereNotNull('huella')
            ->select('id', 'codigo_militar', 'nombre_completo', 'grado', 'huella_registrada_en')
            ->with('rol:id,nombre')
            ->orderBy('huella_registrada_en', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $users,
            'total' => $users->count(),
            'max_capacity' => 127  // Capacidad máxima del sensor
        ]);
    }
    
    /**
     * ESTADÍSTICAS DE HUELLAS
     */
    public function estadisticas()
    {
        $totalUsuarios = User::count();
        $huellasRegistradas = User::whereNotNull('huella')->count();
        $sensoresActivos = 1; // Por ahora 1 sensor
        
        return response()->json([
            'success' => true,
            'data' => [
                'total_usuarios' => $totalUsuarios,
                'huellas_registradas' => $huellasRegistradas,
                'sensores_activos' => $sensoresActivos,
                'capacidad_sensor' => 127,
                'porcentaje_uso' => round(($huellasRegistradas / $totalUsuarios) * 100, 2)
            ]
        ]);
    }
}