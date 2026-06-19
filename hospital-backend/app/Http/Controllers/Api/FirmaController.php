<?php
// app/Http/Controllers/Api/FirmaController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FirmaController extends Controller
{
    /**
     * Obtener la firma del usuario autenticado
     * (para saber si ya tiene una guardada antes de pedirle que dibuje)
     */
    public function miFirma(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'tiene_firma' => $user->tieneFirma(),
            'firma_digital' => $user->firma_digital, // Ahora es una ruta: /storage/firmas/...
            'firma_registrada_en' => $user->firma_registrada_en,
        ]);
    }


    /**
     * Guardar (o reemplazar) la firma del usuario autenticado.
     * Recibe un PNG en base64 (data URI completo: data:image/png;base64,...)
     */
    public function guardar(Request $request)
    {
        $request->validate([
            'firma' => 'required|string',
        ]);

        // Validación básica de formato
        if (!preg_match('/^data:image\/(png|jpeg|jpg);base64,/', $request->firma)) {
            return response()->json([
                'success' => false,
                'message' => 'Formato de firma inválido'
            ], 422);
        }

        $user = $request->user();
        $user->guardarFirma($request->firma);

        return response()->json([
            'success' => true,
            'message' => 'Firma guardada correctamente',
            'firma_registrada_en' => $user->firma_registrada_en,
        ]);
    }

    /**
     * Eliminar la firma del usuario autenticado
     */
    public function eliminar(Request $request)
    {
        $request->user()->eliminarFirma();

        return response()->json([
            'success' => true,
            'message' => 'Firma eliminada. Puedes registrar una nueva.'
        ]);
    }
}