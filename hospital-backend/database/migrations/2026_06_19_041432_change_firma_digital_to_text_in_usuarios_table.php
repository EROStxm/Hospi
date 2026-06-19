<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Cambiar de longText a varchar (solo guardaremos la ruta)
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