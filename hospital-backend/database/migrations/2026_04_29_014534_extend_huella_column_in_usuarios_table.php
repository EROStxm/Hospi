<?php

// Crear nueva migración
// php artisan make:migration extend_huella_column_in_usuarios_table

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ExtendHuellaColumnInUsuariosTable extends Migration
{
    public function up()
    {
        Schema::table('usuarios', function (Blueprint $table) {
            // Cambiar a TEXT para almacenar templates Base64 grandes
            $table->text('huella')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->string('huella', 255)->nullable()->change();
        });
    }
}