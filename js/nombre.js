document.addEventListener("DOMContentLoaded", function () {
    const modo = localStorage.getItem("modo");
    const modoTexto = document.getElementById("modoTexto");

    if (modo && modoTexto) {
        modoTexto.textContent = `¡Modo ${modo}!`;
    } else {
        modoTexto.textContent = "¡Modo no definido!";
    }
});

function continuar() {
    const nombre = document.getElementById("nombre").value.trim();

    if (nombre === "") {
        alert("Por favor ingresa tu nombre.");
        return;
    }

    localStorage.setItem("nombre", nombre);
    window.location.href = "juego.html";
}
