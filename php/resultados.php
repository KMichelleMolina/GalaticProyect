<?php
// php/guardar_resultado.php
// Evitamos que se cuelen warnings o <br>
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');
$mysqli = new mysqli("localhost","root","","galatic_scape");



if ($mysqli->connect_errno) {
  echo json_encode(["status"=>"error","error"=>$mysqli->connect_error]);
  exit;
}


// 1) Recogida y saneado de parámetros
$raw = [
  'idJugadores' => $_POST['idJugadores'] ?? '',
  'nombre'      => $_POST['nombre']      ?? 'invitado',
  'puntaje'     => $_POST['puntaje']     ?? 0,
  'vidas'       => $_POST['vidas']       ?? 0,
  'nivel'       => $_POST['nivel']       ?? 1,
  'modo'        => $_POST['modo']        ?? 'supervivencia',
  'monedas'     => $_POST['monedas']        ?? 0
];

$idJug  = intval($raw['idJugadores']);
$nombre = $mysqli->real_escape_string($raw['nombre']);
$puntaje= intval($raw['puntaje']);
$vidas  = intval($raw['vidas']);
$nivel  = intval($raw['nivel']);
$modo   = $mysqli->real_escape_string($raw['modo']);
$monedas   = intval($raw['monedas']);
// 2) Si no nos llega un id válido, buscamos por nombre
if ($idJug <= 0) {
    $stmtChk = $mysqli->prepare("SELECT idJugadores FROM jugadores WHERE nombre = ?");
    $stmtChk->bind_param("s", $nombre);
    $stmtChk->execute();
    $stmtChk->bind_result($foundId);
    if ($stmtChk->fetch()) {
        // existe, reutilizamos su ID
        $idJug = $foundId;
    }
    $stmtChk->close();

    // 3) Si tampoco existía por nombre, lo creamos
    if ($idJug <= 0) {
        $stmtIns = $mysqli->prepare("INSERT INTO jugadores (nombre) VALUES (?)");
        $stmtIns->bind_param("s", $nombre);
        $stmtIns->execute();
        $idJug = $mysqli->insert_id;
        $stmtIns->close();
    }
}

// 4) Ahora que tenemos un idJug válido, insertamos en resultados
$stmt = $mysqli->prepare("
    INSERT INTO resultados
      (idJugadores, nombre, puntaje, vidas, nivel, modo, monedas)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");
$stmt->bind_param(
    "isiiisi",
    $idJug,
    $nombre,
    $puntaje,
    $vidas,
    $nivel,
    $modo,
    $monedas
);
$stmt->execute();

// 5) Devolvemos JSON limpio
echo json_encode([
  "status"      => "ok",
  "idJugadores" => $idJug
]);

$stmt->close();
$mysqli->close();

