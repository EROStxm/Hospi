<?php
// database/migrations/2026_06_19_043502_add_firma_imagen_columns_to_solicitudes_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solicitudes', function (Blueprint $table) {
            // Solo añadir si no existen
            if (!Schema::hasColumn('solicitudes', 'solicitante_firma_imagen')) {
                $table->string('solicitante_firma_imagen', 500)->nullable()->after('solicitante_dispositivo');
            }
            if (!Schema::hasColumn('solicitudes', 'jefe_seccion_firma_imagen')) {
                $table->string('jefe_seccion_firma_imagen', 500)->nullable()->after('jefe_seccion_ip');
            }
            if (!Schema::hasColumn('solicitudes', 'jefe_activos_firma_imagen')) {
                $table->string('jefe_activos_firma_imagen', 500)->nullable()->after('jefe_activos_ip');
            }
            if (!Schema::hasColumn('solicitudes', 'conformacion_firma_imagen')) {
                $table->string('conformacion_firma_imagen', 500)->nullable()->after('conformacion_ip');
            }
            if (!Schema::hasColumn('solicitudes', 'jefe_mantenimiento_firma_imagen')) {
                $table->string('jefe_mantenimiento_firma_imagen', 500)->nullable()->after('jefe_mantenimiento_ip');
            }
        });
    }

    public function down(): void
    {
        Schema::table('solicitudes', function (Blueprint $table) {
            $columns = [
                'solicitante_firma_imagen',
                'jefe_seccion_firma_imagen',
                'jefe_activos_firma_imagen',
                'conformacion_firma_imagen',
                'jefe_mantenimiento_firma_imagen',
            ];
            
            foreach ($columns as $col) {
                if (Schema::hasColumn('solicitudes', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};