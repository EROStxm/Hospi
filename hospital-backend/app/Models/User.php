<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $table = 'usuarios';
    protected $primaryKey = 'id';
    public $timestamps = true;

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
        'firma_digital',
        'firma_registrada_en',
        'esta_activo',
        'ultimo_ingreso_en',
        'ultimo_ingreso_ip',
    ];

    // 🔴 BUG CORREGIDO: 'huella' estaba oculta por completo, por eso
    // nunca llegaba al frontend aunque existiera en la BD. Ya no se
    // oculta el campo en sí — en su lugar, cada endpoint que sirve
    // listas de usuarios decide explícitamente qué exponer
    // (ver UserController::index / HuellaController::listarConHuella).
    // 'contrasena' SIEMPRE debe permanecer oculta por seguridad.
    protected $hidden = [
        'contrasena',
    ];

    protected $casts = [
        'esta_activo' => 'boolean',
        'huella_registrada_en' => 'datetime',
        'firma_registrada_en' => 'datetime',
        'ultimo_ingreso_en' => 'datetime',
    ];

    // Accesor de conveniencia: ¿tiene huella? (booleano, sin exponer el dato crudo)
    public function getTieneHuellaAttribute()
    {
        return !is_null($this->huella);
    }

    // Accesor de conveniencia: ¿tiene firma? (booleano)
    public function getTieneFirmaAttribute()
    {
        return !is_null($this->firma_digital);
    }

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
        return $this->rol ? (bool) $this->rol->puede_aprobar_material : false;
    }

    public function puedeAsignarTecnico()
    {
        return $this->rol ? (bool) $this->rol->puede_asignar_tecnico : false;
    }

    public function puedeGestionarInventario()
    {
        return $this->rol ? (bool) $this->rol->puede_gestionar_inventario : false;
    }

    public function puedeVerTodasSolicitudes()
    {
        return $this->rol ? (bool) $this->rol->puede_ver_todas_solicitudes : false;
    }

    public function esJefeServicio()
    {
        return $this->rol && $this->rol->nombre === 'jefe_servicio';
    }

    public function esJefeSoporte()
    {
        return $this->rol && $this->rol->nombre === 'jefe_soporte';
    }

    public function esAdmin()
    {
        return $this->rol && $this->rol->nombre === 'admin_sistema';
    }

    public function esTecnico()
    {
        return $this->rol && $this->rol->nombre === 'soporte_tecnico';
    }

    public function getRolNombreAttribute()
    {
        return $this->rol ? $this->rol->nombre : null;
    }

    public function hasHuella()
    {
        return !is_null($this->huella);
    }

    public function registrarHuella($templateData)
    {
        $this->update([
            'huella' => $templateData,
            'huella_registrada_en' => now()
        ]);
    }

    public function eliminarHuella()
    {
        $this->update([
            'huella' => null,
            'huella_registrada_en' => null
        ]);
    }

    // ── Firma digital ──────────────────────────────────────────────
    public function tieneFirma()
    {
        return !is_null($this->firma_digital);
    }

    // En App/Models/User.php

    public function guardarFirma(string $imagenBase64)
    {
        // Extraer los datos de la imagen
        if (preg_match('/^data:image\/(png|jpeg|jpg);base64,/', $imagenBase64, $matches)) {
            $extension = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
            $imagenData = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $imagenBase64));
            
            // Generar nombre único
            $nombreArchivo = 'firma_' . $this->id . '_' . time() . '.' . $extension;
            $ruta = 'firmas/' . $nombreArchivo;
            
            // Guardar archivo
            Storage::disk('public')->put($ruta, $imagenData);
            
            // Eliminar firma anterior si existe
            if ($this->firma_digital) {
                $rutaAnterior = str_replace('/storage/', '', $this->firma_digital);
                if (Storage::disk('public')->exists($rutaAnterior)) {
                    Storage::disk('public')->delete($rutaAnterior);
                }
            }
            
            // Guardar ruta en BD
            $this->update([
                'firma_digital' => '/storage/' . $ruta,
                'firma_registrada_en' => now(),
            ]);
        }
    }

    public function eliminarFirma()
    {
        // Eliminar archivo físico
        if ($this->firma_digital) {
            $ruta = str_replace('/storage/', '', $this->firma_digital);
            if (Storage::disk('public')->exists($ruta)) {
                Storage::disk('public')->delete($ruta);
            }
        }
        
        $this->update([
            'firma_digital' => null,
            'firma_registrada_en' => null,
        ]);
    }
}