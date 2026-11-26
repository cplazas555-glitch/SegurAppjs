const buscarAlerta = document.getElementById("buscarAlerta");
const filtroEstado = document.getElementById("filtroEstado");
const cuerpoAlertas = document.getElementById("cuerpoAlertas");
const contadorPie = document.getElementById("contadorPie");
const subtituloAlertas = document.getElementById("subtituloAlertas");
const toastModulo = document.getElementById("toastModulo");
const mensajeToast = document.getElementById("mensajeToast");
let timerToast = null;

function mostrarToast(texto) {
    mensajeToast.textContent = texto;
    toastModulo.classList.add("visible");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => toastModulo.classList.remove("visible"), 3000);
}

function filtrar() {
    const texto = buscarAlerta.value.toLowerCase().trim();
    const estado = filtroEstado.value;
    const filas = cuerpoAlertas.querySelectorAll("tr");
    let visibles = 0;

    filas.forEach((fila) => {
        const ok = fila.textContent.toLowerCase().includes(texto) &&
            (estado === "todos" || fila.getAttribute("data-estado") === estado);
        fila.style.display = ok ? "" : "none";
        if (ok) visibles++;
    });

    contadorPie.textContent = "Mostrando " + (visibles ? "1 a " + visibles : "0") + " de " + filas.length + " alertas";
}

buscarAlerta.addEventListener("input", filtrar);
filtroEstado.addEventListener("change", filtrar);

function atenderAlerta(boton) {
    const fila = boton.closest("tr");
    if (fila.getAttribute("data-estado") === "Atendida") return;

    fila.setAttribute("data-estado", "Atendida");
    fila.querySelector(".celda-estado").innerHTML = '<span class="etiqueta-pill pill-gris"><span class="punto"></span> Atendida</span>';
    boton.disabled = true;
    boton.style.opacity = "0.4";

    const filas = [...cuerpoAlertas.querySelectorAll("tr")];
    const activas = filas.filter((f) => f.getAttribute("data-estado") === "Activo").length;
    const atendidas = filas.filter((f) => f.getAttribute("data-estado") === "Atendida").length;

    document.getElementById("kpiActivas").textContent = activas;
    document.getElementById("kpiAtendidas").textContent = atendidas;
    document.getElementById("totalDonut").textContent = activas;
    subtituloAlertas.textContent = activas + " alertas activas";

    filtrar();
    mostrarToast("Alerta marcada como atendida");
}
