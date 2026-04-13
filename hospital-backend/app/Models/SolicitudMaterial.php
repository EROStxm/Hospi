<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitudMaterial extends Model
{
    protected $table = 'solicitudes_materiales';
    public $timestamps = false;
    
    const CREATED_AT = 'creado_en';

    protected $fillable = [
        'solicitud_id',
        'material_id',
        'cantidad_usada',
        'registrado_por_id',
        'registrado_en',
        'notas',
    ];

    protected $casts = [
        'registrado_en' => 'datetime',
        'creado_en' => 'datetime',
    ];

    public function solicitud()
    {
        return $this->belongsTo(Solicitud::class, 'solicitud_id');
    }

    public function material()
    {
        return $this->belongsTo(Material::class, 'material_id');
    }

    public function registradoPor()
    {
        return $this->belongsTo(User::class, 'registrado_por_id');
    }
}