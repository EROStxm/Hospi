<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    protected $table = 'roles';
    protected $primaryKey = 'id';
    public $timestamps = true;
    
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'nombre',
        'nivel',
        'descripcion',
        'puede_aprobar_material',
        'puede_asignar_tecnico',
        'puede_gestionar_inventario',
        'puede_ver_todas_solicitudes',
    ];

    protected $casts = [
        'nivel' => 'integer',
        'puede_aprobar_material' => 'boolean',
        'puede_asignar_tecnico' => 'boolean',
        'puede_gestionar_inventario' => 'boolean',
        'puede_ver_todas_solicitudes' => 'boolean',
    ];

    public function usuarios()
    {
        return $this->hasMany(User::class, 'rol_id');
    }
}