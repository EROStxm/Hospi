<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    protected $table = 'notificaciones';
    public $timestamps = false;
    
    protected $fillable = [
        'usuario_id',
        'tipo',
        'titulo',
        'mensaje',
        'solicitud_id',
        'leido_en',
        'enviado_via',
        'id_externo',
        'creado_en'
    ];

    protected $casts = [
        'leido_en' => 'datetime',
        'creado_en' => 'datetime'
    ];

    // Accessor para saber si está leída
    public function getLeidaAttribute()
    {
        return !is_null($this->leido_en);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function solicitud()
    {
        return $this->belongsTo(Solicitud::class, 'solicitud_id');
    }
}