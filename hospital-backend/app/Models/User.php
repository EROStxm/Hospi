<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $table = 'usuarios';
    protected $primaryKey = 'id';
    public $timestamps = true;
    
    // IMPORTANTE: Especificar los nombres de las columnas de timestamps
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'codigo_militar',
        'nombre_completo',
        'email',
        'contrasena',
        'grado',
        'especialidad',
        'telefono',
        'rol_id',
        'sector_id',
        'huella',
        'huella_registrada_en',
        'esta_activo',
        'ultimo_ingreso_en',
        'ultimo_ingreso_ip',
    ];

    protected $hidden = [
        'contrasena',
        'huella',
    ];

    protected $casts = [
        'esta_activo' => 'boolean',
        'huella_registrada_en' => 'datetime',
        'ultimo_ingreso_en' => 'datetime',
    ];

    // IMPORTANTE: Especificar el nombre del campo de contraseña
    public function getAuthPassword()
    {
        return $this->contrasena;
    }

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    public function sector()
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }

    public function puedeAprobarMaterial()
    {
        return $this->rol && $this->rol->puede_aprobar_material;
    }

    public function puedeAsignarTecnico()
    {
        return $this->rol && $this->rol->puede_asignar_tecnico;
    }
}