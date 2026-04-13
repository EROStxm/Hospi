<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoriaEquipo extends Model
{
    protected $table = 'categorias_equipos';
    public $timestamps = true;
    
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    public function equipos()
    {
        return $this->hasMany(Equipo::class, 'categoria_id');
    }
}