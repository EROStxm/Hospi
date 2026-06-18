<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificacionCreada implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $notificacion;
    public int $usuarioId;

    public function __construct(array $notificacion, int $usuarioId)
    {
        $this->notificacion = $notificacion;
        $this->usuarioId = $usuarioId;
    }

    /**
     * Canal privado por usuario: private-notificaciones.{usuario_id}
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("notificaciones.{$this->usuarioId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'nueva-notificacion';
    }

    public function broadcastWith(): array
    {
        return [
            'notificacion' => $this->notificacion,
        ];
    }
}