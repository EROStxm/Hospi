<?php
// database/migrations/2026_06_19_043502_add_firma_imagen_columns_to_solicitudes_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->string('firma_digital', 500)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->longText('firma_digital')->nullable()->change();
        });
    }
};