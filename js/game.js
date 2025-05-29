const canvas = document.getElementById("juegoCanvas");
const ctx = canvas.getContext("2d");



// --- Audio para el juego ---
const bgMusicGame = new Audio('assets/audio/music.mp3');
bgMusicGame.loop = true;
bgMusicGame.volume = 0.4;

const shootSound = new Audio('assets/audio/piuw.mp3');
shootSound.volume = 0.6;

// Iniciar música tras primer input del usuario
function initGameAudio() {
  bgMusicGame.play().catch(err => {
    console.warn('No se pudo reproducir música automáticamente.', err);
  });
}
window.addEventListener('keydown', initGameAudio, { once: true });



// ——— CONSTANTES Y VARIABLES GLOBALES ———
let ancho, alto;
let estrellas = [];
const numEstrellas = 100;
const nave = new Image();
nave.src = "img/spaceship.png";
const meteorito = new Image();
meteorito.src = "img/asteroid.png";
const  enemigoImg = new Image();
enemigoImg.src = "img/alien.png";
const monedaImg = new Image();
monedaImg.src = "img/coin.png"; 

let naveX, naveY;
const UMBRALES = [0, 500, 1500, 3000, 5000]; 
const naveAncho = 80;
const naveAlto = 80;
let tiempoRestante = 60; // segundos
let temporizador; // identificador del setInterval
let velocidadNave = 5;
let teclas = {};
let meteoritos = [];
let enemigos = [];
let disparos = [];
let monedas = [];
let totalMonedas = localStorage.getItem("totalMonedas") || 0; // Inicializar desde localStorage
let modo = localStorage.getItem("modo"); 
let vidas = 3;
let nombre = localStorage.getItem("nombre") || "invitado"; 
let puntaje = 0;
let nivel = 1;
let mejorRecord = localStorage.getItem("mejorRecord") || 0;
let juegoTerminado = false;

// ——— CARGA DE PLANETAS ———
const planetImgs = [];
['tierra.png','marte.png','planeta3.png', 'planeta4'].forEach(src => {
  const img = new Image();
  img.src = `img/${src}`;     
  planetImgs.push(img);
});

class Planet {
  constructor(img, x, y, speed, size) {
    this.img   = img;
    this.x     = x;
    this.y     = y;
    this.speed = speed;  // velocidad vertical
    this.size  = size;   // ancho=alto en px
  }
  update() {
    // sólo Y (cae hacia abajo)
    this.y += this.speed;
    // si sobrepasa el fondo, reaparece arriba
    if (this.y - this.size > alto) {
      this.y = -this.size;
      this.x = Math.random() * ancho;
    }
  }
  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.size, this.size);
  }
}

let planets = [];
planetImgs.forEach(img => {
  img.onload = () => {
    // creamos varias instancias de cada planeta
    for (let i = 0; i < 2; i++) {
      const size  = 90 + Math.random() * 100;     
      const speed = 0.5 + Math.random() * 1.5;   // velocidad vertical
      const x     = Math.random() * ancho;
      const y     = Math.random() * alto;
      planets.push(new Planet(img, x, y, speed, size));
    }
  };
});


function redimensionarCanvas() {
  ancho  = window.innerWidth;
  alto   = window.innerHeight;
  canvas.width  = ancho;
  canvas.height = alto;
  generarEstrellas();
  naveX = ancho/2; 
  naveY = alto - 100;
}

function generarEstrellas() {
  estrellas = [];
  for (let i = 0; i < numEstrellas; i++) {
    estrellas.push({
      x: Math.random() * ancho,
      y: Math.random() * alto,
      velocidad: 0.5 + Math.random(),
      tamaño: Math.random() * 2
    });
  }
}

function dibujarEstrellas() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ancho, alto);

  ctx.fillStyle = "white";
  estrellas.forEach(estrella => {
    ctx.beginPath();
    ctx.arc(estrella.x, estrella.y, estrella.tamaño, 0, Math.PI * 2);
    ctx.fill();
  });
}

function moverEstrellas() {
  estrellas.forEach(estrella => {
    estrella.y += estrella.velocidad;
    if (estrella.y > alto) {
      estrella.y = 0;
      estrella.x = Math.random() * ancho;
    }
  });
}

// ===== Touch / Responsive Controls =====
document.addEventListener("DOMContentLoaded", () => {
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const alwaysShow = window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches;
  if (isTouch || alwaysShow) {
    const c = document.getElementById("touch-controls");
    c.classList.remove("hidden");
    // Mover Izq
    document.getElementById("btn-left").addEventListener("touchstart", e => { e.preventDefault(); teclas["ArrowLeft"] = true; });
    document.getElementById("btn-left").addEventListener("touchend",   e => { e.preventDefault(); teclas["ArrowLeft"] = false; });
    // Mover Der
    document.getElementById("btn-right").addEventListener("touchstart", e => { e.preventDefault(); teclas["ArrowRight"] = true; });
    document.getElementById("btn-right").addEventListener("touchend",   e => { e.preventDefault(); teclas["ArrowRight"] = false; });
    // Arriba
    document.getElementById("btn-up").addEventListener("touchstart", e => { e.preventDefault(); teclas["ArrowUp"] = true; });
    document.getElementById("btn-up").addEventListener("touchend",   e => { e.preventDefault(); teclas["ArrowUp"] = false; });

    // Abajo
   document.getElementById("btn-down").addEventListener("touchstart", e => { e.preventDefault(); teclas["ArrowDown"] = true; });
   document.getElementById("btn-down").addEventListener("touchend",   e => { e.preventDefault(); teclas["ArrowDown"] = false; });
    // Disparo
    document.getElementById("btn-fire").addEventListener("touchstart", e => {
      e.preventDefault();
      shootSound.cloneNode().play();
      disparos.push({ x: naveX + naveAncho/2 -5, y: naveY, velocidad:7, ancho:10, alto:20 });
    });
  }
});

// ===== Teclado normal =====
window.addEventListener("keydown", e => {
  teclas[e.key] = true;
  if (e.key === " ") {
    shootSound.cloneNode().play();
    disparos.push({ x: naveX + naveAncho/2 -5, y: naveY, velocidad:7, ancho:10, alto:20 });
  }
});


window.addEventListener("keyup", e => {
  teclas[e.key] = false;
});

function dibujarNave() {
  if (teclas["ArrowLeft"] || teclas["a"]) {
    naveX -= velocidadNave;
    if (naveX < 0) naveX = 0;
  }

  if (teclas["ArrowRight"] || teclas["d"]) {
    naveX += velocidadNave;
    if (naveX + naveAncho > canvas.width) naveX = canvas.width - naveAncho;
  }
  // Movimiento vertical
    if (teclas["ArrowUp"] || teclas["w"]) {
        naveY -= velocidadNave;
        if (naveY < 0) naveY = 0;
    }

    if (teclas["ArrowDown"] || teclas["s"]) {
        naveY += velocidadNave;
        if (naveY + naveAlto > canvas.height) naveY = canvas.height - naveAlto;
    }

  ctx.drawImage(nave, naveX, naveY, naveAncho, naveAlto);
}

function checkLevelUp() {
  
  
  for (let i = UMBRALES.length - 1; i >= 0; i--) {
    if (puntaje >= UMBRALES[i] && nivel < i+1) {
      nivel = i+1;
      console.log(` ¡Subes al nivel ${nivel}!`);
      onLevelUp();
      break;
    }
  }
  
}

//Generar monedas
function generarMonedas(x, y, cantidad = 3) {
  for (let i = 0; i < cantidad; i++) {
    monedas.push({
      x: x + (Math.random() * 40 - 20),
      y: y + (Math.random() * 40 - 20),
      velocidad: 2 + Math.random(),  // caen hacia abajo
      ancho: 20,
      alto: 20
    });
  }
}

function dibujarMonedas() {
  monedas.forEach(m => {
    ctx.drawImage(monedaImg, m.x, m.y, m.ancho, m.alto);
  });
}

function moverMonedas() {
  monedas.forEach((m, i) => {
    m.y += m.velocidad;
    // si se salen de pantalla, las eliminas
    if (m.y > alto) monedas.splice(i, 1);
  });
}

function detectarRecogerMonedas() {
  const naveCol = { x: naveX, y: naveY, ancho: naveAncho, alto: naveAlto };
  monedas.forEach((m, i) => {
    if (
      naveCol.x < m.x + m.ancho &&
      naveCol.x + naveCol.ancho > m.x &&
      naveCol.y < m.y + m.alto &&
      naveCol.y + naveCol.alto > m.y
    ) {
      totalMonedas++;
      monedas.splice(i, 1);
      
    }
  });
}

// Generar meteoritos cada 2 segundos
function generarMeteoritos() {
  const x = Math.random() * (canvas.width - 40);
  meteoritos.push({
    x,
    y: -50,
    velocidad: 2 + Math.random() * 2,
    ancho: 40,
    alto: 40
  });
}

function generarEnemigos() {
  const x = Math.random() * (canvas.width - 50);
  enemigos.push({
    x,
    y: -60,
    velocidad: 1.5 + Math.random(),
    ancho: 50,
    alto: 50
  });
}
setInterval(generarMeteoritos, 1000);
setInterval(generarEnemigos, 2000);

function dibujarMeteoritos() {
  meteoritos.forEach(m => {
    m.y += m.velocidad;
    ctx.drawImage(meteorito, m.x, m.y, m.ancho, m.alto);
    });
    meteoritos = meteoritos.filter(m => m.y < canvas.height);
}

function dibujarEnemigos() {
  enemigos.forEach(e => {
    e.y += e.velocidad;
    ctx.drawImage(enemigoImg, e.x, e.y, e.ancho, e.alto);
  });
  enemigos = enemigos.filter(e => e.y < canvas.height);
}

function dibujarDisparos() {
    ctx.fillStyle = "red";

    disparos.forEach((d, i)=>{
        d.y -= d.velocidad;
        ctx.fillRect(d.x, d.y, d.ancho, d.alto);

        //Eliminar disparos que salgan de la pantalla
        if (d.y < 0) {
            disparos.splice(i, 1);
        }
    })
}

function onLevelUp() {
  velocidadNave += 0.5;              // la nave se mueve un poco más rápido
  meteoritos.forEach(m => m.velocidad += 0.2);
  enemigos.forEach(e => e.velocidad += 0.2);
  
}

function tiempoTerminado(){
  if (modo === "tiempo") {
  tiempoRestante = 60; // o cualquier duración que se coloque
  temporizador = setInterval(() => {
    tiempoRestante--;
    if (tiempoRestante <= 0) {
      tiempoRestante = 0;
      clearInterval(temporizador);
      terminarJuego(); // Finaliza el juego automáticamente
    }
  }, 1000);
  }
}

function dibujarHUD(){
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.fillText(`Jugador: ${nombre}`, 10, 30); 
    ctx.fillText(`Vidas: ${vidas}`, 10, 60);
    ctx.fillText(`Puntaje: ${puntaje}`, 10, 90);
    ctx.fillText(`Nivel: ${nivel}`, 10, 120);
    ctx.fillText(`Modo: ${modo}`, 10, 210);
    ctx.fillText(`Mejor récord: ${mejorRecord}`, 10, 150);
    ctx.fillText(`Monedas: ${totalMonedas}`, 10, 180);
    if (modo === "tiempo") {
        ctx.fillText(`Tiempo restante: ${tiempoRestante}s`, 10, 240);
    }
    
    
}
// Colisiones

function colisiones(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.ancho &&
    obj1.x + obj1.ancho > obj2.x &&
    obj1.y < obj2.y + obj2.alto &&
    obj1.y + obj1.alto > obj2.y
  );
}

function detectarColisiones() { 
    // Colisión con meteoritos
  meteoritos.forEach((m, i) => {
    if (
      naveX < m.x + m.ancho &&
      naveX + naveAncho > m.x &&
      naveY < m.y + m.alto &&
      naveY + naveAlto > m.y
    ) {
      vidas--;
      meteoritos.splice(i, 1); // Eliminar el meteorito
    }
  });

  // Colisión con enemigos
  enemigos.forEach((e, i) => {
    if (
      naveX < e.x + e.ancho &&
      naveX + naveAncho > e.x &&
      naveY < e.y + e.alto &&
      naveY + naveAlto > e.y
    ) {
      vidas--;
      enemigos.splice(i, 1); // Eliminar el enemigo
    }
  });

  // Verificar si se acabaron las vidas
  if (vidas <= 0) {
    vidas = 0;
    terminarJuego();
  }
}

function terminarJuego() {

  
    juegoTerminado = true;   
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, ancho, alto);
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.textAlign = "start"; // restaurar alineación por defecto si hace falta

    if (puntaje > mejorRecord) {
        localStorage.setItem("mejorRecord", puntaje);
    }
    
    mostrarPantallaGameOver(); 
    //enviar puntuacion a la base de datos
    localStorage.setItem("nombre", nombre);
    localStorage.setItem("modo", modo);

    enviarPuntuacion(nombre, puntaje, vidas, nivel, modo, totalMonedas);

} 

function mostrarPantallaGameOver() {
  const overlay = document.getElementById("gameOverScreen");
  const vidasTxt = document.getElementById("vidasPerdidasText");
  const tiempoTxt = document.getElementById("tiempoRestanteText");
  if (!overlay || !vidasTxt || !tiempoTxt) {
    console.warn("Faltan elementos de Game Over en el DOM");
    return;
  }

  if (modo === "tiempo") {
    tiempoTxt.textContent    = "¡El tiempo se ha acabado!";
    vidasTxt.textContent     = "";
  } else {
    vidasTxt.textContent     = `Perdiste ${3 - vidas} vidas.`;
    tiempoTxt.textContent    = "";
  }

  overlay.style.display = "flex";
}



function enviarPuntuacion(nombre, puntaje, vidasRestantes, nivel, modo, totalMonedas) {
  
  const idJug = localStorage.getItem("idJugadores") || 0;
  console.log("📤 Enviando resultado para idJug:", idJug);

  const body = 
    `idJugadores=${encodeURIComponent(idJug)}` +
    `&nombre=${encodeURIComponent(nombre)}` +
    `&puntaje=${encodeURIComponent(puntaje)}` +
    `&vidas=${encodeURIComponent(vidasRestantes)}` +
    `&nivel=${encodeURIComponent(nivel)}` +
    `&modo=${encodeURIComponent(modo)}` +
    `&monedas=${encodeURIComponent(totalMonedas || 0)}`; // Añadir totalMonedas si es necesario

  fetch("php/resultados.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "ok") {
      console.log("Resultado guardado");
    } else {
      console.error("Error guardando:", data.error);
    }
  })
  .catch(err => console.error("Fetch error:", err));
}

function animarFondo() {

  if (juegoTerminado) return;

  dibujarEstrellas();
  moverEstrellas();

  planets.forEach(p => {
   p.update();
   p.draw(ctx);
  });

  dibujarDisparos();
  dibujarMeteoritos();
  dibujarEnemigos();
  dibujarNave();
  dibujarHUD();
  detectarColisiones();

  
  moverMonedas();
  dibujarMonedas();
  detectarRecogerMonedas();
  
    const naveColision = {
        x: naveX,
        y: naveY,
        ancho: naveAncho,
        alto: naveAlto
    };

    // Comprobar colisiones con meteoritos
    meteoritos.forEach((m, i) => {
        if (colisiones(naveColision, m)) {
            console.log("Colisión con meteorito");
            meteoritos.splice(i, 1); // Eliminar meteorito
            
        }
    });

    // Comprobar colisiones con enemigos
    enemigos.forEach((e, i) => {
        if (colisiones(naveColision, e)) {
            console.log("Colisión con enemigo");
            enemigos.splice(i, 1); // Eliminar enemigo
            
        }
    });

    // Comprobar colisiones con disparos
    disparos.forEach((d, i) =>{
        enemigos.forEach((e, j) => {
            if (colisiones(d, e)) {
                disparos.splice(i, 1);
                const ex = e.x + e.ancho/2;
                const ey = e.y + e.alto/2;
                enemigos.splice(j, 1);
                puntaje += 100;
                 generarMonedas(ex, ey, 3);

                checkLevelUp();
                
            }
        });
    })

    // Comprobar colisiones con disparos y meteoritos
    disparos.forEach((d, i) =>{
        meteoritos.forEach((m, j) => {
            if (colisiones(d, m)) {
                console.log("Colisión con meteorito");
                disparos.splice(i, 1); // Eliminar disparo
                meteoritos.splice(j, 1); // Eliminar meteorito
                puntaje += 100;
                checkLevelUp();

            }
        });
    });

    
  requestAnimationFrame(animarFondo);
}



// Inicializar
window.addEventListener("resize", redimensionarCanvas);
redimensionarCanvas();
nombre = localStorage.getItem("nombre");

// Esperar a que la nave cargue
nave.onload = () => {
  if(modo === "tiempo") {
    tiempoTerminado();
  }
  animarFondo();
};

function reiniciarJuego() {
  location.reload(); // Recarga la página
}

function volverAlMenu() {
  window.location.href = "index.html"; // Cambia al archivo que sea tu menú principal
}

