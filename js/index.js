let selecionModo = "";
// --- Variables de audio ---
const bgMusic   = new Audio('assets/audio/music.mp3');  //música de fondo
const clickSound = new Audio('assets/audio/click.wav');   //efecto de click o disparo

bgMusic.loop   = true;
bgMusic.volume = 0.4;  

// Reproduce la música de fondo cuando el usuario interactúe 
function initAudio() {
  bgMusic.play().catch(err => {
    // Si el navegador bloquea la reproducción automática, lo intentamos de nuevo tras un click
    console.warn('Reproducción bloqueada, espera interacción del usuario.', err);
  });
}
window.addEventListener('click', initAudio, { once: true });

function selectMode(modo) {
    selecionModo = modo;
    localStorage.setItem("modo", modo);
    console.log("Modo seleccionado:", modo);


    //Parar la música de menú antes de cambiar de página
    bgMusic.pause();
    bgMusic.currentTime = 0;

    window.location.href = "nombre.html";
}

function tablaPuntaje() {
  window.open("php/clasificacion.php", "_blank");
}
