<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

<style>
body {
    font-family: DejaVu Sans, Arial;
    font-size: 12px;
    color: #333;
}

.header {
    text-align: center;
    border-bottom: 2px solid #000;
    margin-bottom: 10px;
    padding-bottom: 5px;
}

.title {
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    margin: 10px 0;
}

.section-title {
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 5px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
}

td {
    border: 1px solid #000;
    padding: 6px;
}

.label {
    width: 30%;
    font-weight: bold;
    background: #eee;
}

.qr {
    text-align: center;
    margin-top: 15px;
}

.footer {
    text-align: center;
    font-size: 10px;
    margin-top: 20px;
}
</style>
</head>

<body>

<div class="header">
    <strong>HOSPITAL MILITAR</strong><br>
    Sistema de Mantenimiento
</div>

<div class="title">
    SOLICITUD N° {{ $solicitud->id }}
</div>

<div class="section-title">INFORMACION GENERAL</div>
<table>
<tr>
    <td class="label">Titulo</td>
    <td>{{ $solicitud->titulo }}</td>
</tr>
<tr>
    <td class="label">Estado</td>
    <td>{{ ucfirst(str_replace('_',' ', $solicitud->estado)) }}</td>
</tr>
<tr>
    <td class="label">Tipo</td>
    <td>{{ $solicitud->tipo_solicitud == 'sin_material' ? 'Sin Material' : 'Con Material' }}</td>
</tr>
<tr>
    <td class="label">Fecha</td>
    <td>{{ $solicitud->creado_en ? $solicitud->creado_en->format('d/m/Y H:i') : 'N/A' }}</td>
</tr>
</table>

<div class="section-title">SOLICITANTE</div>
<table>
<tr>
    <td class="label">Nombre</td>
    <td>{{ $solicitud->solicitante->nombre_completo ?? 'N/A' }}</td>
</tr>
<tr>
    <td class="label">Grado</td>
    <td>{{ $solicitud->solicitante->grado ?? 'N/A' }}</td>
</tr>
<tr>
    <td class="label">Sector</td>
    <td>{{ $solicitud->sector->nombre ?? 'N/A' }}</td>
</tr>
</table>

<div class="section-title">EQUIPO</div>
<table>
<tr>
    <td class="label">Nombre</td>
    <td>{{ $solicitud->equipo->nombre ?? 'No especificado' }}</td>
</tr>
<tr>
    <td class="label">Codigo</td>
    <td>{{ $solicitud->equipo->codigo_equipo ?? 'N/A' }}</td>
</tr>
</table>

<div class="section-title">DESCRIPCION</div>
<table>
<tr>
    <td>{{ $solicitud->descripcion }}</td>
</tr>
</table>

<div class="qr">
    <img src="data:image/png;base64,{{ $qrCode }}" width="120">
</div>

<div class="footer">
    Generado: {{ $fechaGeneracion }}
</div>

</body>
</html>
