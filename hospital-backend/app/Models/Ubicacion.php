<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ubicacion extends Model
{
    protected $table = 'ubicaciones';
    public $timestamps = true;
    
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'sector_id', 'codigo', 'nombre', 'descripcion',
        'piso', 'numero_consultorio', 'es_critico', 'esta_activo'
    ];

    protected $casts = [
        'es_critico' => 'boolean',
        'esta_activo' => 'boolean',
    ];

    public function sector()
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }

    public function equipos()
    {
        return $this->hasMany(Equipo::class, 'ubicacion_id');
    }
}