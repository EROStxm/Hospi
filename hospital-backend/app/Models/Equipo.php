<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipo extends Model
{
    protected $table = 'equipos';
    public $timestamps = true;
    
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'codigo_equipo', 
        'nombre', 
        'descripcion', 
        'categoria_id',
        'sector_id', 
        'marca', 
        'modelo', 
        'numero_serie', 
        'estado',
        'fecha_adquisicion',
        'ubicacion_id'
    ];

    protected $casts = [
        'fecha_adquisicion' => 'date',
        'creado_en' => 'datetime',
        'actualizado_en' => 'datetime',
    ];

    public function categoria()
    {
        return $this->belongsTo(CategoriaEquipo::class, 'categoria_id');
    }

    public function sector()
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }

    public function solicitudes()
    {
        return $this->hasMany(Solicitud::class, 'equipo_id');
    }
    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }
}