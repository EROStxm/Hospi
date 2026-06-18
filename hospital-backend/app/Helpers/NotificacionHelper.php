<?php

namespace App\Helpers;

use App\Models\Notificacion;
use App\Models\User;
use App\Events\NotificacionCreada;
use Illuminate\Support\Facades\Log;

class NotificacionHelper
{
    /**
     * Enviar notificación a un usuario específico
     */
    public static function enviar(
        int $usuarioId,
        string $titulo,
        string $mensaje,
        string $tipo = 'info',
        string $url = null,
        int $solicitudId = null
    ): ?Notificacion {
        try {
            $notificacion = Notificacion::create([
                'usuario_id'   => $usuarioId,
                'tipo'         => $tipo,
                'titulo'       => $titulo,
                'mensaje'      => $mensaje,
                'solicitud_id' => $solicitudId,
                'enviado_via'  => 'web',
                'creado_en'    => now(),
            ]);

            // 🔴 BROADCAST via Reverb al canal privado del usuario
            $data = [
                'id'           => $notificacion->id,
                'tipo'         => $tipo,
                'titulo'       => $titulo,
                'mensaje'      => $mensaje,
                'solicitud_id' => $solicitudId,
                'url'          => $url,
                'leido_en'     => null,
                'creado_en'    => $notificacion->creado_en->toISOString(),
            ];

            broadcast(new NotificacionCreada($data, $usuarioId))->toOthers();

            return $notificacion;

        } catch (\Exception $e) {
            Log::error('Error al enviar notificación: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Enviar a todos los técnicos (rol soporte_tecnico)
     */
    public static function enviarATecnicos(
        string $titulo,
        string $mensaje,
        string $tipo = 'info',
        string $url = null,
        int $solicitudId = null
    ): void {
        $tecnicos = User::whereHas('rol', function ($q) {
            $q->where('nombre', 'soporte_tecnico');
        })->where('esta_activo', true)->get();

        foreach ($tecnicos as $tecnico) {
            self::enviar($tecnico->id, $titulo, $mensaje, $tipo, $url, $solicitudId);
        }
    }

    /**
     * Enviar al jefe de soporte
     */
    public static function enviarAJefeSoporte(
        string $titulo,
        string $mensaje,
        string $tipo = 'info',
        string $url = null,
        int $solicitudId = null
    ): void {
        $jefes = User::whereHas('rol', function ($q) {
            $q->where('nombre', 'jefe_soporte');
        })->where('esta_activo', true)->get();

        foreach ($jefes as $jefe) {
            self::enviar($jefe->id, $titulo, $mensaje, $tipo, $url, $solicitudId);
        }
    }

    /**
     * Enviar al jefe de servicio del sector indicado
     */
    public static function enviarAJefeServicio(
        int $sectorId,
        string $titulo,
        string $mensaje,
        string $tipo = 'info',
        string $url = null,
        int $solicitudId = null
    ): void {
        $jefes = User::whereHas('rol', function ($q) {
            $q->where('nombre', 'jefe_servicio');
        })
        ->where('sector_id', $sectorId)
        ->where('esta_activo', true)
        ->get();

        foreach ($jefes as $jefe) {
            self::enviar($jefe->id, $titulo, $mensaje, $tipo, $url, $solicitudId);
        }
    }
}