const buscarSuperior = document.getElementById("buscarSuperior");
const buscarTabla = document.getElementById("buscarTabla");
const filtroArea = document.getElementById("filtroArea");
const filtroEstado = document.getElementById("filtroEstado");
const filtroNivel = document.getElementById("filtroNivel");
const cuerpoTabla = document.getElementById("cuerpoTabla");
const subtituloRegistros = document.getElementById("subtituloRegistros");
const contadorPie = document.getElementById("contadorPie");
const toastModulo = document.getElementById("toastModulo");
const mensajeToast = document.getElementById("mensajeToast");
let timerToast = null;

function mostrarToast(texto) {
    mensajeToast.textContent = texto;
    toastModulo.classList.add("visible");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => toastModulo.classList.remove("visible"), 3000);
}

function filtrar(valor) {
    if (valor !== undefined) {
        buscarSuperior.value = valor;
        buscarTabla.value = valor;
    }
    const texto = buscarTabla.value.toLowerCase().trim();
    const area = filtroArea.value;
    const estado = filtroEstado.value;
    const nivel = filtroNivel.value;
    const filas = cuerpoTabla.querySelectorAll("tr");
    let visibles = 0;

    filas.forEach((fila) => {
        const ok =
            fila.textContent.toLowerCase().includes(texto) &&
            (area === "todas" || fila.getAttribute("data-area") === area) &&
            (estado === "todos" || fila.getAttribute("data-estado") === estado) &&
            (nivel === "todos" || fila.getAttribute("data-nivel") === nivel);
        fila.style.display = ok ? "" : "none";
        if (ok) visibles++;
    });

    subtituloRegistros.textContent = visibles + " registros encontrados";
    contadorPie.textContent = "Mostrando " + (visibles ? "1 a " + visibles : "0") + " de " + filas.length + " registros";
}

buscarSuperior.addEventListener("input", () => filtrar(buscarSuperior.value));
buscarTabla.addEventListener("input", () => filtrar(buscarTabla.value));
[filtroArea, filtroEstado, filtroNivel].forEach((s) => s.addEventListener("change", () => filtrar()));

const claseNivel = { "Alto": "pill-rojo", "Medio": "pill-amarillo", "Bajo": "pill-verde" };

document.getElementById("guardarRiesgo").addEventListener("click", () => {
    const nombre = document.getElementById("nombreRiesgo").value.trim();
    const desc = document.getElementById("descripcionRiesgo").value.trim();
    const area = document.getElementById("areaRiesgo").value;
    const tipo = document.getElementById("tipoRiesgo").value;
    const nivel = document.getElementById("nivelRiesgo").value;

    if (!nombre || !desc) {
        alert("Por favor completa el nombre y la descripción del riesgo.");
        return;
    }

    const num = cuerpoTabla.querySelectorAll("tr").length + 26;
    const id = "RIES-" + String(num).padStart(3, "0");

    const tr = document.createElement("tr");
    tr.setAttribute("data-area", area);
    tr.setAttribute("data-estado", "Activo");
    tr.setAttribute("data-nivel", nivel);
    tr.innerHTML = `
        <td><strong>${id}</strong></td>
        <td><div class="textos-fila"><strong class="n-riesgo"></strong><small class="d-riesgo"></small></div></td>
        <td>${area}</td>
        <td>${tipo}</td>
        <td><span class="etiqueta-pill ${claseNivel[nivel]}">${nivel}</span></td>
        <td><span class="etiqueta-pill pill-verde">Activo</span></td>
    `;
    tr.querySelector(".n-riesgo").textContent = nombre;
    tr.querySelector(".d-riesgo").textContent = desc;
    cuerpoTabla.prepend(tr);

    const filas = [...cuerpoTabla.querySelectorAll("tr")];
    document.getElementById("kpiTotal").textContent = filas.length;
    document.getElementById("kpiAltos").textContent = filas.filter((f) => f.getAttribute("data-nivel") === "Alto").length;
    document.getElementById("kpiMedios").textContent = filas.filter((f) => f.getAttribute("data-nivel") === "Medio").length;
    document.getElementById("kpiBajos").textContent = filas.filter((f) => f.getAttribute("data-nivel") === "Bajo").length;

    document.getElementById("nombreRiesgo").value = "";
    document.getElementById("descripcionRiesgo").value = "";
    bootstrap.Modal.getInstance(document.getElementById("modalNuevoRiesgo")).hide();
    filtrar();
    mostrarToast("Riesgo " + id + " agregado");
});
