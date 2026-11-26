const buscarSuperior = document.getElementById("buscarSuperior");
const buscarTabla = document.getElementById("buscarTabla");
const filtroEstado = document.getElementById("filtroEstado");
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

function filtrar(textoOrigen) {
    if (textoOrigen !== undefined) {
        buscarSuperior.value = textoOrigen;
        buscarTabla.value = textoOrigen;
    }
    const texto = buscarTabla.value.toLowerCase().trim();
    const estado = filtroEstado.value;
    const filas = cuerpoTabla.querySelectorAll("tr");
    let visibles = 0;

    filas.forEach((fila) => {
        const coincideTexto = fila.textContent.toLowerCase().includes(texto);
        const coincideEstado = estado === "todos" || fila.getAttribute("data-estado") === estado;
        if (coincideTexto && coincideEstado) {
            fila.style.display = "";
            visibles++;
        } else {
            fila.style.display = "none";
        }
    });

    subtituloRegistros.textContent = visibles + " registros encontrados";
    contadorPie.textContent = "Mostrando " + (visibles ? "1 a " + visibles : "0") + " de " + filas.length + " registros";
}

buscarSuperior.addEventListener("input", () => filtrar(buscarSuperior.value));
buscarTabla.addEventListener("input", () => filtrar(buscarTabla.value));
filtroEstado.addEventListener("change", () => filtrar());

function actualizarKpis() {
    const filas = [...cuerpoTabla.querySelectorAll("tr")];
    const total = filas.length;
    const inc = filas.filter((f) => f.getAttribute("data-tipo") === "Incidente").length;
    const acc = filas.filter((f) => f.getAttribute("data-tipo") === "Accidente").length;
    document.getElementById("kpiTotal").textContent = total;
    document.getElementById("kpiIncidentes").textContent = inc;
    document.getElementById("kpiAccidentes").textContent = acc;
    document.getElementById("subIncidentes").textContent = Math.round((inc / total) * 100) + "% del total";
    document.getElementById("subAccidentes").textContent = Math.round((acc / total) * 100) + "% del total";
}

const mapaEstado = {
    "investigacion": { clase: "pill-amarillo", icono: "bi-search", texto: "Investigación" },
    "en-tratamiento": { clase: "pill-azul", icono: "bi-graph-up-arrow", texto: "En tratamiento" },
    "reportado": { clase: "pill-morado", icono: "bi-exclamation-circle", texto: "Reportado" },
    "cerrado": { clase: "pill-verde", icono: "bi-check-circle", texto: "Cerrado" }
};

const mapaSeveridad = {
    "Bajo": "pill-verde",
    "Medio": "pill-amarillo",
    "Alto": "pill-rojo"
};

document.getElementById("guardarCaso").addEventListener("click", () => {
    const tipo = document.getElementById("tipoCaso").value;
    const severidad = document.getElementById("severidadCaso").value;
    const titulo = document.getElementById("tituloCaso").value.trim();
    const area = document.getElementById("areaCaso").value;
    const reportado = document.getElementById("reportadoPor").value.trim();
    const estado = document.getElementById("estadoCaso").value;

    if (!titulo || !reportado) {
        alert("Por favor completa el título y el nombre de quien reporta.");
        return;
    }

    const num = cuerpoTabla.querySelectorAll("tr").length + 22;
    const prefijo = tipo === "Incidente" ? "INC-" : "ACC-";
    const id = prefijo + String(num).padStart(3, "0");
    const hoy = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    const infoEstado = mapaEstado[estado];
    const claseTipo = tipo === "Incidente" ? "pill-verde" : "pill-rojo";

    const tr = document.createElement("tr");
    tr.setAttribute("data-estado", estado);
    tr.setAttribute("data-tipo", tipo);
    tr.innerHTML = `
        <td><strong>${id}</strong></td>
        <td><span class="etiqueta-pill ${claseTipo}">${tipo}</span></td>
        <td><strong class="titulo-celda"></strong></td>
        <td>${area}</td>
        <td>${hoy}</td>
        <td class="reporta-celda"></td>
        <td><span class="etiqueta-pill ${infoEstado.clase}"><i class="bi ${infoEstado.icono}"></i> ${infoEstado.texto}</span></td>
        <td><span class="etiqueta-pill ${mapaSeveridad[severidad]}">${severidad}</span></td>
    `;
    tr.querySelector(".titulo-celda").textContent = titulo;
    tr.querySelector(".reporta-celda").textContent = reportado;
    cuerpoTabla.prepend(tr);

    document.getElementById("tituloCaso").value = "";
    document.getElementById("reportadoPor").value = "";
    bootstrap.Modal.getInstance(document.getElementById("modalNuevoReporte")).hide();

    actualizarKpis();
    filtrar();
    mostrarToast("Caso " + id + " registrado correctamente");
});
