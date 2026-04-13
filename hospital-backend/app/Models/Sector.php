<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sector extends Model
{
    protected $table = 'sectores';
    protected $primaryKey = 'id';
    public $timestamps = true;
    
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'codigo',
        'nombre',
        'piso',
        'telefono_extension',
        'es_critico',
        'esta_activo',
    ];

    protected $casts = [
        'es_critico' => 'boolean',
        'esta_activo' => 'boolean',
    ];

    public function usuarios()
    {
        return $this->hasMany(User::class, 'sector_id');
    }

    public function equipos()
    {
        return $this->hasMany(Equipo::class, 'sector_id');
    }

    public function solicitudes()
    {
        return $this->hasMany(Solicitud::class, 'sector_id');
    }
    public function ubicaciones()
    {
        return $this->hasMany(Ubicacion::class, 'sector_id');
    }
}