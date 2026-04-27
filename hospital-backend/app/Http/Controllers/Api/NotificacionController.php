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
        
        // Filtrar por estado de lectura (usando leido_en)
        if ($request->has('leida')) {
            if ($request->leida === 'true') {
                $query->whereNotNull('leido_en');
            } elseif ($request->leida === 'false') {
                $query->whereNull('leido_en');
            }
        }
        
        $notificaciones = $query->paginate($request->get('per_page', 20));
        
        // Transformar para agregar campo 'leida' virtual
        $notificaciones->getCollection()->transform(function ($item) {
            $item->leida = !is_null($item->leido_en);
            return $item;
        });
        
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
            ->whereNull('leido_en')
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
        
        $notificacion->update(['leido_en' => now()]);
        
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
            ->whereNull('leido_en')
            ->update(['leido_en' => now()]);
        
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