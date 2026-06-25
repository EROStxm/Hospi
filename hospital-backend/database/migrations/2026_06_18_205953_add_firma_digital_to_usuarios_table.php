<?php
// database/migrations/2026_06_18_205953_add_firma_digital_to_usuarios_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            if (!Schema::hasColumn('usuarios', 'firma_digital')) {
                $table->longText('firma_digital')->nullable()->after('huella_registrada_en');
            }
            if (!Schema::hasColumn('usuarios', 'firma_registrada_en')) {
                $table->timestamp('firma_registrada_en')->nullable()->after('firma_digital');
            }
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            if (Schema::hasColumn('usuarios', 'firma_digital')) {
                $table->dropColumn('firma_digital');
            }
            if (Schema::hasColumn('usuarios', 'firma_registrada_en')) {
                $table->dropColumn('firma_registrada_en');
            }
        });
    }
};