<?php
// php/clasificacion.php
$mysqli = new mysqli("localhost","root","","galatic_scape");
if ($mysqli->connect_errno) {
  die("Error BD: ".$mysqli->connect_error);
}

// Función para obtener top10 de un modo
function obtenerTop($mysqli, $modo) {
  $modoEsc = $mysqli->real_escape_string($modo);
  $sql = "SELECT nombre, puntaje, vidas, nivel, monedas
          FROM resultados
          WHERE modo='$modoEsc'
          ORDER BY puntaje DESC
          LIMIT 10";
  return $mysqli->query($sql);
}

$topTiempo = obtenerTop($mysqli, "tiempo");
$topSuper = obtenerTop($mysqli, "supervivencia");
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Clasificación</title>
  <style>
    body { font-family:sans-serif; background:#000; color:#fff; }
    table { width:90%; margin:20px auto; border-collapse: collapse; }
    th, td { padding:8px; border:1px solid #555; text-align:center; }
    th { background:#222; }
    h2 { text-align:center; }
  </style>
</head>
<body>
  <h2>🏁 Top 10 Modo Tiempo</h2>
  <table>
    <tr><th>#</th><th>Jugador</th><th>Puntaje</th><th>Vidas</th><th>Nivel</th><th>Total Monedas</th></tr>
    <?php
    $i=1;
    while($r = $topTiempo->fetch_assoc()) {
      echo "<tr>"
         . "<td>{$i}</td>"
         . "<td>{$r['nombre']}</td>"
         . "<td>{$r['puntaje']}</td>"
         . "<td>{$r['vidas']}</td>"
         . "<td>{$r['nivel']}</td>"
         . "<td>{$r['monedas']}</td>"
         . "</tr>";
      $i++;
    }
    ?>
  </table>

  <h2>🏆 Top 10 Modo Supervivencia</h2>
  <table>
    <tr><th>#</th><th>Jugador</th><th>Puntaje</th><th>Vidas</th><th>Nivel</th><th>Total Monedas</th></tr>
    <?php
    $i=1;
    while($r = $topSuper->fetch_assoc()) {
      echo "<tr>"
         . "<td>{$i}</td>"
         . "<td>{$r['nombre']}</td>"
         . "<td>{$r['puntaje']}</td>"
         . "<td>{$r['vidas']}</td>"
         . "<td>{$r['nivel']}</td>"
         . "<td>{$r['monedas']}</td>"
         . "</tr>";
      $i++;
    }
    ?>
  </table>
</body>
</html>
<?php $mysqli->close(); ?>
