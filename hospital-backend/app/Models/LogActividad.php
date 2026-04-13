<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogActividad extends Model
{
    protected $table = 'logs_actividad';
    public $timestamps = false;
    
    const CREATED_AT = 'creado_en';

    protected $fillable = [
        'usuario_id',
        'accion',
        'entidad_tipo',
        'entidad_id',
        'datos_anteriores',
        'datos_nuevos',
        'direccion_ip',
        'agente_usuario',
    ];

    protected $casts = [
        'datos_anteriores' => 'array',
        'datos_nuevos' => 'array',
        'creado_en' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}