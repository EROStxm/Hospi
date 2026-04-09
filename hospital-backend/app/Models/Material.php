
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $table = 'materiales';
    public $timestamps = true;
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'codigo', 'nombre', 'descripcion', 'categoria', 'stock',
        'stock_minimo', 'unidad', 'costo_unitario', 'esta_activo'
    ];

    protected $casts = [
        'stock' => 'integer',
        'stock_minimo' => 'integer',
        'costo_unitario' => 'decimal:2',
        'esta_activo' => 'boolean',
    ];

    public function solicitudes()
    {
        return $this->belongsToMany(Solicitud::class, 'solicitudes_materiales', 'material_id', 'solicitud_id')
                    ->withPivot('cantidad_usada', 'registrado_por_id', 'notas');
    }

    public function getStockBajoAttribute()
    {
        return $this->stock <= $this->stock_minimo;
    }
}