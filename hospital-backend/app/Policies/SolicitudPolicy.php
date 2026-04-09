<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Solicitud;

class SolicitudPolicy
{
    public function ver(User $user, Solicitud $solicitud)
    {
        // Admin ve todo
        if ($user->rol->nombre === 'admin_sistema') {
            return true;
        }
        
        // Soporte ve todo
        if (in_array($user->rol->nombre, ['jefe_soporte', 'soporte_tecnico'])) {
            return true;
        }
        
        // Jefe de servicio ve las de su sector
        if ($user->rol->nombre === 'jefe_servicio' && $solicitud->sector_id === $user->sector_id) {
            return true;
        }
        
        // Usuario ve sus propias solicitudes
        if ($solicitud->solicitante_id === $user->id) {
            return true;
        }
        
        return false;
    }

    public function firmar(User $user, Solicitud $solicitud)
    {
        // Lógica de firmas según estado y rol
        switch ($solicitud->estado) {
            case 'pendiente_solicitante':
                return $solicitud->solicitante_id === $user->id;
                
            case 'pendiente_jefe_seccion':
                return $user->rol->puede_aprobar_material && $solicitud->sector_id === $user->sector_id;
                
            case 'pendiente_jefe_activos':
            case 'pendiente_jefe_mantenimiento':
                return in_array($user->rol->nombre, ['jefe_soporte', 'admin_sistema']);
                
            case 'pendiente_conformacion':
                return $solicitud->solicitante_id === $user->id;
                
            default:
                return false;
        }
    }
}