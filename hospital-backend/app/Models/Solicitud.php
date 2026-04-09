<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Solicitud extends Model
{
    protected $table = 'solicitudes';
    protected $primaryKey = 'id';
    public $timestamps = true;
    
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'tipo_solicitud',
        'titulo',
        'descripcion',
        'equipo_id',
        'rutas_fotos',
        'solicitante_id',
        'sector_id',
        'solicitante_firmo_en',
        'solicitante_ip',
        'solicitante_dispositivo',
        'jefe_seccion_firmo_en',
        'jefe_seccion_id',
        'jefe_seccion_ip',
        'jefe_activos_firmo_en',
        'jefe_activos_id',
        'jefe_activos_ip',
        'conformacion_firmo_en',
        'conformacion_id',
        'conformacion_ip',
        'conformacion_comentario',
        'jefe_mantenimiento_firmo_en',
        'jefe_mantenimiento_id',
        'jefe_mantenimiento_ip',
        'estado',
        'tecnico_asignado_id',
        'tecnico_asignado_en',
        'trabajo_terminado_en',
        'notas_tecnico',
        'pdf_generado_en',
        'pdf_ruta',
        'codigo_qr',
    ];

    protected $casts = [
        'rutas_fotos' => 'array',
        'solicitante_firmo_en' => 'datetime',
        'jefe_seccion_firmo_en' => 'datetime',
        'jefe_activos_firmo_en' => 'datetime',
        'conformacion_firmo_en' => 'datetime',
        'jefe_mantenimiento_firmo_en' => 'datetime',
        'tecnico_asignado_en' => 'datetime',
        'trabajo_terminado_en' => 'datetime',
        'pdf_generado_en' => 'datetime',
    ];

    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitante_id');
    }

    public function sector()
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }

    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    public function tecnicoAsignado()
    {
        return $this->belongsTo(User::class, 'tecnico_asignado_id');
    }

    public function jefeSeccion()
    {
        return $this->belongsTo(User::class, 'jefe_seccion_id');
    }

    public function materiales()
    {
        return $this->belongsToMany(Material::class, 'solicitudes_materiales', 'solicitud_id', 'material_id')
                    ->withPivot('cantidad_usada', 'registrado_por_id', 'notas');
    }
}