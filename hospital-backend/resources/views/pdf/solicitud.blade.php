<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Solicitud #{{ $solicitud->id }}</title>

<style>
    @page {
        margin: 15mm 12mm 15mm 12mm;
    }
    
    body {
        font-family: DejaVu Sans, Arial, sans-serif;
        font-size: 11px;
        color: #1a1a2e;
        line-height: 1.5;
    }

    .header {
        background: linear-gradient(135deg, #0a1628 0%, #1a3a5c 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px 8px 0 0;
        margin-bottom: 0;
    }
    
    .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid rgba(255,255,255,0.3);
        padding-bottom: 10px;
        margin-bottom: 8px;
    }
    
    .hospital-info h2 { margin: 0; font-size: 18px; letter-spacing: 1px; }
    .hospital-info p { margin: 2px 0 0 0; font-size: 10px; opacity: 0.85; }
    
    .solicitud-num {
        text-align: right; font-size: 12px;
        background: rgba(255,255,255,0.15);
        padding: 8px 14px; border-radius: 6px;
    }
    .solicitud-num .nro { font-size: 24px; font-weight: bold; display: block; line-height: 1; }

    .section {
        border: 1px solid #c5d5e8; margin-bottom: 10px;
        border-radius: 6px; overflow: hidden; page-break-inside: avoid;
    }
    
    .section-title {
        background: #1a3a5c; color: white; padding: 6px 12px;
        font-size: 11px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;
    }
    .section-body { padding: 10px 12px; background: white; }

    table { width: 100%; border-collapse: collapse; }
    .info-table td {
        padding: 5px 8px; border-bottom: 1px solid #e8eef4; font-size: 10.5px;
    }
    .info-table .label {
        width: 28%; color: #1a3a5c; font-weight: bold;
        background: #f0f4fa; border-right: 2px solid #c5d5e8;
    }
    .info-table .value { color: #333; }

    .descripcion-box {
        background: #f8fafd; border-left: 4px solid #1a3a5c;
        padding: 10px 12px; border-radius: 0 4px 4px 0;
        font-size: 10.5px; color: #444; min-height: 40px;
    }

    /* ===== TÍTULO FIRMAS ===== */
    .firmas-titulo {
        background: #1a3a5c; color: white; padding: 8px 14px;
        font-size: 12px; font-weight: bold; letter-spacing: 0.5px;
        text-transform: uppercase; border-radius: 6px 6px 0 0; margin-top: 15px;
    }

    /* ===== FIRMAS 2 COLUMNAS ===== */
    .firmas-grid {
        border: 1px solid #c5d5e8; border-top: none;
        border-radius: 0 0 6px 6px; page-break-inside: avoid;
    }
    
    .firma-row {
        display: flex; width: 100%;
        border-bottom: 1px solid #e8eef4;
    }
    .firma-row:last-child { border-bottom: none; }
    
    .firma-box {
        flex: 1; width: 50%; text-align: center;
        padding: 14px 10px; border-right: 1px solid #e8eef4;
        min-height: 130px;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        background: #fafbfd;
    }
    .firma-box:last-child { border-right: none; }
    
    .firma-box .firma-imagen {
        height: 65px; display: flex; align-items: center;
        justify-content: center; margin-bottom: 8px; width: 100%;
    }
    .firma-box .firma-imagen img {
        max-height: 60px; max-width: 85%;
    }
    
    .firma-box .firma-nombre {
        font-weight: bold; font-size: 10px; color: #1a3a5c;
        margin-bottom: 2px; border-top: 1px solid #c5d5e8;
        padding-top: 8px; width: 100%;
    }
    .firma-box .firma-cargo {
        font-size: 8px; color: #666; font-style: italic; line-height: 1.3;
    }
    .firma-box .firma-fecha {
        font-size: 7px; color: #999; margin-top: 3px;
    }
    
    /* Pendiente */
    .firma-box.pendiente { opacity: 0.5; }
    .firma-box.pendiente .firma-imagen::after {
        content: "PENDIENTE"; color: #b0b0b0; font-size: 10px;
        font-style: italic; font-weight: bold;
        border: 1px dashed #d0d0d0; padding: 4px 10px; border-radius: 4px;
    }
    .firma-box.pendiente .firma-nombre { color: #999; }

    /* Realizada */
    .firma-box.realizada { background: #f0faf0; }

    /* ===== QR Y FOOTER ===== */
    .qr-footer {
        display: flex; justify-content: space-between; align-items: flex-end;
        margin-top: 15px; padding-top: 10px;
        border-top: 2px solid #1a3a5c; page-break-inside: avoid;
    }
    .qr-box { text-align: center; }
    .qr-box img { width: 90px; height: 90px; }
    .qr-box p { font-size: 8px; color: #888; margin: 3px 0 0 0; }
    .footer-info { text-align: right; font-size: 9px; color: #888; }
    .footer-info .sistema { font-weight: bold; color: #1a3a5c; }

    .badge-estado {
        display: inline-block; padding: 4px 12px; border-radius: 12px;
        font-size: 10px; font-weight: bold; text-transform: uppercase;
        background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9;
    }

    .watermark {
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%) rotate(-30deg);
        font-size: 80px; color: rgba(26, 58, 92, 0.03);
        pointer-events: none; z-index: -1; white-space: nowrap;
    }
</style>
</head>

<body>

<div class="watermark">HOSPITAL MILITAR</div>

<!-- ========== ENCABEZADO ========== -->
<div class="header">
    <div class="header-top">
        <div class="hospital-info">
            <h2>🏥 HOSPITAL MILITAR</h2>
            <p>Sistema Integrado de Gestión de Mantenimiento</p>
        </div>
        <div class="solicitud-num">
            SOLICITUD N°
            <span class="nro">{{ str_pad($solicitud->id, 4, '0', STR_PAD_LEFT) }}</span>
        </div>
    </div>
    <div style="text-align:center;">
        <span class="badge-estado">
            {{ strtoupper(str_replace('_', ' ', $solicitud->estado)) }}
        </span>
    </div>
</div>

<!-- ========== INFORMACIÓN GENERAL ========== -->
<div class="section">
    <div class="section-title">📋 INFORMACIÓN GENERAL</div>
    <div class="section-body">
        <table class="info-table">
            <tr><td class="label">Título</td><td class="value">{{ $solicitud->titulo }}</td></tr>
            <tr><td class="label">Tipo</td><td class="value">{{ $solicitud->tipo_solicitud == 'sin_material' ? '🔧 Sin Material' : '📦 Con Material' }}</td></tr>
            <tr><td class="label">Fecha Creación</td><td class="value">{{ $solicitud->creado_en ? $solicitud->creado_en->format('d/m/Y H:i') : 'N/A' }}</td></tr>
            <tr><td class="label">Última Actualización</td><td class="value">{{ $solicitud->actualizado_en ? $solicitud->actualizado_en->format('d/m/Y H:i') : 'N/A' }}</td></tr>
        </table>
    </div>
</div>

<!-- ========== SOLICITANTE ========== -->
<div class="section">
    <div class="section-title">👤 SOLICITANTE</div>
    <div class="section-body">
        <table class="info-table">
            <tr><td class="label">Nombre</td><td class="value">{{ $solicitud->solicitante->nombre_completo ?? 'N/A' }}</td></tr>
            <tr><td class="label">Código Militar</td><td class="value">{{ $solicitud->solicitante->codigo_militar ?? 'N/A' }}</td></tr>
            <tr><td class="label">Grado</td><td class="value">{{ $solicitud->solicitante->grado ?? 'N/A' }}</td></tr>
            <tr><td class="label">Sector</td><td class="value">{{ $solicitud->sector->nombre ?? 'N/A' }}</td></tr>
        </table>
    </div>
</div>

<!-- ========== EQUIPO ========== -->
<div class="section">
    <div class="section-title">🖥️ EQUIPO</div>
    <div class="section-body">
        <table class="info-table">
            <tr><td class="label">Nombre</td><td class="value">{{ $solicitud->equipo->nombre ?? 'No especificado' }}</td></tr>
            <tr><td class="label">Código</td><td class="value">{{ $solicitud->equipo->codigo_equipo ?? 'N/A' }}</td></tr>
            @if($solicitud->tecnicoAsignado)
            <tr><td class="label">Técnico</td><td class="value">{{ $solicitud->tecnicoAsignado->grado ?? '' }} {{ $solicitud->tecnicoAsignado->nombre_completo ?? '' }}</td></tr>
            @endif
        </table>
    </div>
</div>

<!-- ========== DESCRIPCIÓN ========== -->
<div class="section">
    <div class="section-title">📝 DESCRIPCIÓN DEL PROBLEMA</div>
    <div class="section-body">
        <div class="descripcion-box">{{ $solicitud->descripcion ?: 'Sin descripción' }}</div>
    </div>
</div>

<!-- ========== FIRMAS (3 filas x 2 columnas) ========== -->
<div class="firmas-titulo">✍️ FIRMAS DE AUTORIZACIÓN</div>
<div class="firmas-grid">
    
    <!-- FILA 1: Solicitante | Jefe Servicio -->
    <div class="firma-row">
        <!-- SOLICITANTE -->
        <div class="firma-box {{ $solicitud->solicitante_firma_imagen ? 'realizada' : 'pendiente' }}">
            <div class="firma-imagen">
                @if($solicitud->solicitante_firma_imagen)
                    @php
                        $firmaPath = str_replace('/storage/', '', $solicitud->solicitante_firma_imagen);
                        $firmaExiste = Storage::disk('public')->exists($firmaPath);
                    @endphp
                    @if($firmaExiste)
                        <img src="data:image/png;base64,{{ base64_encode(Storage::disk('public')->get($firmaPath)) }}" alt="Firma">
                    @endif
                @endif
            </div>
            <div class="firma-nombre">{{ $solicitud->solicitante->nombre_completo ?? 'Pendiente' }}</div>
            <div class="firma-cargo">{{ $solicitud->solicitante->grado ?? '' }}<br><strong>SOLICITANTE</strong></div>
            @if($solicitud->solicitante_firmo_en)
                <div class="firma-fecha">📅 {{ $solicitud->solicitante_firmo_en->format('d/m/Y H:i') }}</div>
            @endif
        </div>

        <!-- JEFE DE SERVICIO -->
        <div class="firma-box {{ $solicitud->jefe_seccion_firma_imagen ? 'realizada' : 'pendiente' }}">
            <div class="firma-imagen">
                @if($solicitud->jefe_seccion_firma_imagen)
                    @php
                        $firmaPath = str_replace('/storage/', '', $solicitud->jefe_seccion_firma_imagen);
                        $firmaExiste = Storage::disk('public')->exists($firmaPath);
                    @endphp
                    @if($firmaExiste)
                        <img src="data:image/png;base64,{{ base64_encode(Storage::disk('public')->get($firmaPath)) }}" alt="Firma">
                    @endif
                @endif
            </div>
            <div class="firma-nombre">{{ $solicitud->jefeSeccion->nombre_completo ?? 'Pendiente' }}</div>
            <div class="firma-cargo">{{ $solicitud->jefeSeccion->grado ?? '' }}<br><strong>JEFE DE SERVICIO</strong></div>
            @if($solicitud->jefe_seccion_firmo_en)
                <div class="firma-fecha">📅 {{ $solicitud->jefe_seccion_firmo_en->format('d/m/Y H:i') }}</div>
            @endif
        </div>
    </div>

    <!-- FILA 2: Jefe Activos | Técnico -->
    <div class="firma-row">
        <!-- JEFE DE ACTIVOS -->
        <div class="firma-box {{ $solicitud->jefe_activos_firma_imagen ? 'realizada' : 'pendiente' }}">
            <div class="firma-imagen">
                @if($solicitud->jefe_activos_firma_imagen)
                    @php
                        $firmaPath = str_replace('/storage/', '', $solicitud->jefe_activos_firma_imagen);
                        $firmaExiste = Storage::disk('public')->exists($firmaPath);
                    @endphp
                    @if($firmaExiste)
                        <img src="data:image/png;base64,{{ base64_encode(Storage::disk('public')->get($firmaPath)) }}" alt="Firma">
                    @endif
                @endif
            </div>
            <div class="firma-nombre">{{ $solicitud->jefeActivos->nombre_completo ?? 'Pendiente' }}</div>
            <div class="firma-cargo">{{ $solicitud->jefeActivos->grado ?? '' }}<br><strong>JEFE DE ACTIVOS FIJOS</strong></div>
            @if($solicitud->jefe_activos_firmo_en)
                <div class="firma-fecha">📅 {{ $solicitud->jefe_activos_firmo_en->format('d/m/Y H:i') }}</div>
            @endif
        </div>

        <!-- TÉCNICO -->
        <div class="firma-box {{ $solicitud->trabajo_terminado_en ? 'realizada' : 'pendiente' }}">
            <div class="firma-imagen">
                @if($solicitud->tecnicoAsignado && $solicitud->tecnicoAsignado->firma_digital)
                    @php
                        $firmaPath = str_replace('/storage/', '', $solicitud->tecnicoAsignado->firma_digital);
                        $firmaExiste = Storage::disk('public')->exists($firmaPath);
                    @endphp
                    @if($firmaExiste)
                        <img src="data:image/png;base64,{{ base64_encode(Storage::disk('public')->get($firmaPath)) }}" alt="Firma">
                    @endif
                @endif
            </div>
            <div class="firma-nombre">{{ $solicitud->tecnicoAsignado->nombre_completo ?? 'Por asignar' }}</div>
            <div class="firma-cargo">{{ $solicitud->tecnicoAsignado->grado ?? '' }}<br><strong>TÉCNICO RESPONSABLE</strong></div>
            @if($solicitud->trabajo_terminado_en)
                <div class="firma-fecha">📅 {{ $solicitud->trabajo_terminado_en->format('d/m/Y H:i') }}</div>
            @endif
        </div>
    </div>

    <!-- FILA 3: Conformidad | Jefe Mantenimiento -->
    <div class="firma-row">
        <!-- CONFORMIDAD -->
        <div class="firma-box {{ $solicitud->conformacion_firma_imagen ? 'realizada' : 'pendiente' }}">
            <div class="firma-imagen">
                @if($solicitud->conformacion_firma_imagen)
                    @php
                        $firmaPath = str_replace('/storage/', '', $solicitud->conformacion_firma_imagen);
                        $firmaExiste = Storage::disk('public')->exists($firmaPath);
                    @endphp
                    @if($firmaExiste)
                        <img src="data:image/png;base64,{{ base64_encode(Storage::disk('public')->get($firmaPath)) }}" alt="Firma">
                    @endif
                @endif
            </div>
            <div class="firma-nombre">{{ $solicitud->conformacion->nombre_completo ?? $solicitud->solicitante->nombre_completo ?? 'Pendiente' }}</div>
            <div class="firma-cargo">{{ $solicitud->conformacion->grado ?? $solicitud->solicitante->grado ?? '' }}<br><strong>CONFORMIDAD</strong></div>
            @if($solicitud->conformacion_firmo_en)
                <div class="firma-fecha">📅 {{ $solicitud->conformacion_firmo_en->format('d/m/Y H:i') }}</div>
            @endif
        </div>

        <!-- JEFE DE MANTENIMIENTO -->
        <div class="firma-box {{ $solicitud->jefe_mantenimiento_firma_imagen ? 'realizada' : 'pendiente' }}">
            <div class="firma-imagen">
                @if($solicitud->jefe_mantenimiento_firma_imagen)
                    @php
                        $firmaPath = str_replace('/storage/', '', $solicitud->jefe_mantenimiento_firma_imagen);
                        $firmaExiste = Storage::disk('public')->exists($firmaPath);
                    @endphp
                    @if($firmaExiste)
                        <img src="data:image/png;base64,{{ base64_encode(Storage::disk('public')->get($firmaPath)) }}" alt="Firma">
                    @endif
                @endif
            </div>
            <div class="firma-nombre">{{ $solicitud->jefeMantenimiento->nombre_completo ?? 'Pendiente' }}</div>
            <div class="firma-cargo">{{ $solicitud->jefeMantenimiento->grado ?? '' }}<br><strong>JEFE DE MANTENIMIENTO</strong></div>
            @if($solicitud->jefe_mantenimiento_firmo_en)
                <div class="firma-fecha">📅 {{ $solicitud->jefe_mantenimiento_firmo_en->format('d/m/Y H:i') }}</div>
            @endif
        </div>
    </div>

</div>

<!-- ========== QR Y FOOTER ========== -->
<div class="qr-footer">
    <div class="qr-box">
        <img src="data:image/png;base64,{{ $qrCode }}" alt="QR">
        <p>Escanear para verificar</p>
    </div>
    <div class="footer-info">
        <span class="sistema">SIGMA v1.0</span><br>
        Generado: {{ $fechaGeneracion }}<br>
        Documento Oficial - Hospital Militar
    </div>
</div>

</body>
</html>