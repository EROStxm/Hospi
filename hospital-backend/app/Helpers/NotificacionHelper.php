<?php

namespace App\Helpers;

use App\Models\Notificacion;
use App\Models\User;

class NotificacionHelper
{
    /**
     * Enviar notificación a un usuario específico
     */
    public static function enviar($usuarioId, $titulo, $mensaje, $tipo, $url = null, $solicitudId = null)
    {
        return Notificacion::create([
            'usuario_id' => $usuarioId,
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'tipo' => $tipo, // 'info', 'success', 'warning', 'danger'
            'url' => $url,
            'solicitud_id' => $solicitudId,
            'leida' => false,
            'creado_en' => now()
        ]);
    }
    
    /**
     * Enviar notificación a todos los usuarios de un rol
     */
    public static function enviarARol($rolId, $titulo, $mensaje, $tipo, $url = null, $solicitudId = null)
    {
        $usuarios = User::where('rol_id', $rolId)->get();
        
        foreach ($usuarios as $usuario) {
            self::enviar($usuario->id, $titulo, $mensaje, $tipo, $url, $solicitudId);
        }
    }
    
    /**
     * Enviar notificación a todos los técnicos
     */
    public static function enviarATecnicos($titulo, $mensaje, $tipo, $url = null, $solicitudId = null)
    {
        $tecnicos = User::whereHas('rol', function($query) {
            $query->where('nombre', 'soporte_tecnico');
        })->get();
        
        foreach ($tecnicos as $tecnico) {
            self::enviar($tecnico->id, $titulo, $mensaje, $tipo, $url, $solicitudId);
        }
    }
    
    /**
     * Enviar notificación al jefe de soporte
     */
    public static function enviarAJefeSoporte($titulo, $mensaje, $tipo, $url = null, $solicitudId = null)
    {
        $jefeSoporte = User::whereHas('rol', function($query) {
            $query->where('nombre', 'jefe_soporte');
        })->first();
        
        if ($jefeSoporte) {
            self::enviar($jefeSoporte->id, $titulo, $mensaje, $tipo, $url, $solicitudId);
        }
    }
    
    /**
     * Enviar notificación al jefe de servicio correspondiente
     */
    public static function enviarAJefeServicio($sectorId, $titulo, $mensaje, $tipo, $url = null, $solicitudId = null)
    {
        $jefeServicio = User::where('sector_id', $sectorId)
            ->whereHas('rol', function($query) {
                $query->where('nombre', 'jefe_servicio');
            })->first();
        
        if ($jefeServicio) {
            self::enviar($jefeServicio->id, $titulo, $mensaje, $tipo, $url, $solicitudId);
        }
    }
}