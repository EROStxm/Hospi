<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificacionController extends Controller
{
    /**
     * Obtener todas las notificaciones del usuario autenticado
     */
    public function index(Request $request)
    {
        $query = Notificacion::where('usuario_id', Auth::id())
            ->orderBy('creado_en', 'desc');
        
        // Filtrar por estado de lectura
        if ($request->has('leida')) {
            $query->where('leida', $request->leida === 'true');
        }
        
        $notificaciones = $query->paginate($request->get('per_page', 20));
        
        return response()->json([
            'success' => true,
            'data' => $notificaciones
        ]);
    }
    
    /**
     * Obtener conteo de notificaciones no leídas
     */
    public function conteoNoLeidas()
    {
        $conteo = Notificacion::where('usuario_id', Auth::id())
            ->where('leida', false)
            ->count();
        
        return response()->json([
            'success' => true,
            'no_leidas' => $conteo
        ]);
    }
    
    /**
     * Marcar una notificación como leída
     */
    public function marcarLeida($id)
    {
        $notificacion = Notificacion::where('usuario_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();
        
        $notificacion->update(['leida' => true]);
        
        return response()->json([
            'success' => true,
            'message' => 'Notificación marcada como leída'
        ]);
    }
    
    /**
     * Marcar todas las notificaciones como leídas
     */
    public function marcarTodasLeidas()
    {
        Notificacion::where('usuario_id', Auth::id())
            ->where('leida', false)
            ->update(['leida' => true]);
        
        return response()->json([
            'success' => true,
            'message' => 'Todas las notificaciones marcadas como leídas'
        ]);
    }
    
    /**
     * Eliminar una notificación
     */
    public function destroy($id)
    {
        $notificacion = Notificacion::where('usuario_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();
        
        $notificacion->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Notificación eliminada'
        ]);
    }
}