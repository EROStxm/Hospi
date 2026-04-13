<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComentarioSolicitud extends Model
{
    protected $table = 'comentarios_solicitudes';
    public $timestamps = false; // Solo tiene creado_en
    
    const CREATED_AT = 'creado_en';

    protected $fillable = [
        'solicitud_id',
        'usuario_id',
        'comentario',
        'tipo_comentario',
    ];

    protected $casts = [
        'creado_en' => 'datetime',
    ];

    public function solicitud()
    {
        return $this->belongsTo(Solicitud::class, 'solicitud_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}