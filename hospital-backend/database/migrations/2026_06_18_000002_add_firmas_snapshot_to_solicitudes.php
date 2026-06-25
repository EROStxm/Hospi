<?php
// database/migrations/2026_06_18_000002_add_firmas_snapshot_to_solicitudes.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solicitudes', function (Blueprint $table) {
            // Snapshot de la firma (base64) usada en cada paso, por si el
            // usuario cambia su firma después no afecta solicitudes pasadas.
            $table->longText('solicitante_firma_imagen')->nullable()->after('solicitante_dispositivo');
            $table->longText('jefe_seccion_firma_imagen')->nullable()->after('jefe_seccion_ip');
            $table->longText('jefe_activos_firma_imagen')->nullable()->after('jefe_activos_ip');
            $table->longText('conformacion_firma_imagen')->nullable()->after('conformacion_comentario');
            $table->longText('jefe_mantenimiento_firma_imagen')->nullable()->after('jefe_mantenimiento_ip');
        });
    }

    public function down(): void
    {
        Schema::table('solicitudes', function (Blueprint $table) {
            $table->dropColumn([
                'solicitante_firma_imagen',
                'jefe_seccion_firma_imagen',
                'jefe_activos_firma_imagen',
                'conformacion_firma_imagen',
                'jefe_mantenimiento_firma_imagen',
            ]);
        });
    }
};