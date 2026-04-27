// resources/views/pdf/solicitud.blade.php
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Solicitud de Mantenimiento #{{ $solicitud->id }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'DejaVu Sans', 'Helvetica', 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1e3a5f;
            padding-bottom: 15px;
        }
        .hospital-logo { font-size: 24px; font-weight: bold; color: #1e3a5f; }
        .hospital-name { font-size: 18px; color: #4b5563; }
        .title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            color: #1e3a5f;
        }
        .info-section { margin-bottom: 20px; page-break-inside: avoid; }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            background: #f3f4f6;
            padding: 8px 12px;
            margin-bottom: 10px;
            border-left: 4px solid #1e3a5f;
        }
        .info-grid { width: 100%; border-collapse: collapse; }
        .info-grid td { padding: 8px; border: 1px solid #e5e7eb; }
        .info-label { width: 30%; font-weight: bold; background: #f9fafb; }
        .qr-container {
            text-align: center;
            margin-top: 30px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 10px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            background: #d1fae5;
            color: #065f46;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="hospital-logo">🏥 HOSPITAL MILITAR</div>
        <div class="hospital-name">Dirección de Mantenimiento y Activos Fijos</div>
    </div>

    <div class="title">SOLICITUD DE MANTENIMIENTO N° {{ $solicitud->id }}</div>

    <div class="info-section">
        <div class="section-title">📋 INFORMACIÓN GENERAL</div>
        <table class="info-grid">
            <tr>
                <td class="info-label">Título:</td>
                <td>{{ $solicitud->titulo }}</td>
            </tr>
            <tr>
                <td class="info-label">Estado:</td>
                <td><span class="status-badge">{{ ucfirst(str_replace('_', ' ', $solicitud->estado)) }}</span></td>
            </tr>
            <tr>
                <td class="info-label">Tipo:</td>
                <td>{{ $solicitud->tipo_solicitud === 'sin_material' ? 'Sin Material' : 'Con Material' }}</td>
            </tr>
            <tr>
                <td class="info-label">Fecha de Creación:</td>
                <td>{{ \Carbon\Carbon::parse($solicitud->creado_en)->format('d/m/Y H:i') }}</td>
            </tr>
        </table>
    </div>

    <div class="info-section">
        <div class="section-title">👤 SOLICITANTE</div>
        <table class="info-grid">
            <tr>
                <td class="info-label">Nombre:</td>
                <td>{{ $solicitud->solicitante->nombre_completo }}</td>
            </tr>
            <tr>
                <td class="info-label">Grado:</td>
                <td>{{ $solicitud->solicitante->grado ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="info-label">Sector:</td>
                <td>{{ $solicitud->sector->nombre ?? 'N/A' }}</td>
            </tr>
        </table>
    </div>

    <div class="info-section">
        <div class="section-title">🔧 EQUIPO</div>
        <table class="info-grid">
            <tr>
                <td class="info-label">Equipo:</td>
                <td>{{ $solicitud->equipo->nombre ?? 'No especificado' }}</td>
            </tr>
            @if($solicitud->equipo)
            <tr>
                <td class="info-label">Código:</td>
                <td>{{ $solicitud->equipo->codigo_equipo ?? 'N/A' }}</td>
            </tr>
            @endif
        </table>
    </div>

    <div class="info-section">
        <div class="section-title">📝 DESCRIPCIÓN</div>
        <table class="info-grid">
            <tr>
                <td class="info-value">{{ $solicitud->descripcion }}</td>
            </tr>
        </table>
    </div>

    <div class="qr-container">
        <img src="data:image/png;base64,{{ $qrCode }}" style="width: 150px;">
        <p style="margin-top: 8px;">Escanea para ver detalles de la solicitud #{{ $solicitud->id }}</p>
    </div>

    <div class="footer">
        Documento generado electrónicamente el {{ $fechaGeneracion }}<br>
        Hospital Militar - Sistema de Gestión de Mantenimiento
    </div>
</body>
</html>