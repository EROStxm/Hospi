<?php
// app/Console/Commands/MqttListener.php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class MqttListener extends Command
{
    protected $signature = 'mqtt:listen';
    protected $description = 'Escucha mensajes MQTT del ESP32';

    public function handle()
    {
        $server = env('MQTT_HOST', '127.0.0.1');
        $port = env('MQTT_PORT', 1883);
        $topic = env('MQTT_TOPIC_HUELLAS', 'hospital/huellas');

        $this->info("🔄 Conectando a MQTT en {$server}:{$port}...");

        try {
            $client = new MqttClient($server, $port);
            $connectionSettings = (new ConnectionSettings())
                ->setConnectTimeout(5);
            
            $client->connect($connectionSettings);
            $this->info("✅ Conectado a MQTT correctamente");

            // Suscribirse al tópico
            $client->subscribe($topic, function ($topic, $message) {
                $this->procesarMensaje($message);
            }, 0);

            $this->info("📡 Escuchando en el tópico: {$topic}");
            $this->info("⏸️  Presiona Ctrl+C para detener\n");

            // Mantener el loop corriendo
            $client->loop(true);
            
        } catch (\Exception $e) {
            $this->error("❌ Error: " . $e->getMessage());
            $this->warn("Verifica que el broker Mosquitto esté corriendo");
            return 1;
        }
    }

    private function procesarMensaje($message)
    {
        $data = json_decode($message, true);
        
        if (!$data) {
            $this->warn("⚠️ Mensaje no JSON: " . substr($message, 0, 100));
            return;
        }

        $this->info("\n📨 Mensaje recibido: " . json_encode($data, JSON_PRETTY_PRINT));

        switch ($data['tipo'] ?? '') {
            case 'conexion':
                $this->info("  🟢 ESP32: " . ($data['estado'] ?? 'online'));
                break;
                
            case 'estado':
                $mensajes = [
                    1 => "👆 Esperando dedo...",
                    2 => "🗑️ Retirando dedo...",
                    3 => "👆 Colocar el MISMO dedo...",
                    4 => "✅ ¡Huella capturada!"
                ];
                $paso = $data['paso'] ?? 0;
                $this->info("  📍 Paso {$paso}: " . ($mensajes[$paso] ?? 'Procesando...'));
                break;
                
            case 'completado':
                if (isset($data['user_id']) && isset($data['template'])) {
                    $userId = $data['user_id'];
                    $template = $data['template'];
                    
                    // Buscar usuario
                    $user = User::find($userId);
                    if ($user) {
                        $user->update([
                            'huella' => $template,
                            'huella_registrada_en' => now()
                        ]);
                        $this->info("  ✅ HUELLA GUARDADA: {$user->nombre_completo} (ID: {$userId})");
                        
                        // Opcional: Notificar al frontend via WebSocket
                        // event(new HuellaRegistradaEvent($user));
                    } else {
                        $this->warn("  ⚠️ Usuario ID {$userId} no encontrado");
                    }
                }
                break;
                
            case 'verificacion':
                if ($data['exito'] ?? false) {
                    $userId = $data['user_id'] ?? '?';
                    $user = User::where('huella', $userId)->first();
                    $this->info("  🔓 ACCESO CONCEDIDO - Usuario: " . ($user->nombre_completo ?? 'Desconocido'));
                    $this->info("  ✅ Confianza: " . ($data['confianza'] ?? 'N/A'));
                } else {
                    $this->warn("  🔒 ACCESO DENEGADO - Huella no registrada");
                }
                break;
                
            case 'info':
                $this->info("  📀 Sensor: {$data['huellas_memoria']}/{$data['capacidad_maxima']} huellas");
                break;
                
            default:
                $this->info("  📦 Tipo desconocido: " . ($data['tipo'] ?? 'ninguno'));
                break;
        }
    }
}