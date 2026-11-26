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

function filtrar(valor) {
    if (valor !== undefined) {
        buscarSuperior.value = valor;
        buscarTabla.value = valor;
    }
    const texto = buscarTabla.value.toLowerCase().trim();
    const estado = filtroEstado.value;
    const filas = cuerpoTabla.querySelectorAll("tr");
    let visibles = 0;

    filas.forEach((fila) => {
        const ok = fila.textContent.toLowerCase().includes(texto) &&
            (estado === "todos" || fila.getAttribute("data-estado") === estado);
        fila.style.display = ok ? "" : "none";
        if (ok) visibles++;
    });

    subtituloRegistros.textContent = visibles + " registros encontrados";
    contadorPie.textContent = "Mostrando " + (visibles ? "1 a " + visibles : "0") + " de " + filas.length + " registros";
}

buscarSuperior.addEventListener("input", () => filtrar(buscarSuperior.value));
buscarTabla.addEventListener("input", () => filtrar(buscarTabla.value));
filtroEstado.addEventListener("change", () => filtrar());

function descargarDoc(nombre, categoria, version, estado) {
    const txt = `Documento: ${nombre}\nCategoría: ${categoria}\nVersión: ${version}\nEstado: ${estado}\nSistema: SegurApp SG-SST\n`;
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre.toLowerCase().replace(/\s+/g, "-") + "-v" + version + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarToast("Descargando: " + nombre);
}

const pillEstado = {
    "Aprobado": "pill-verde",
    "Pendiente": "pill-amarillo",
    "Archivado": "pill-morado"
};

document.getElementById("guardarDoc").addEventListener("click", () => {
    const nombre = document.getElementById("nombreDoc").value.trim();
    const categoria = document.getElementById("categoriaDoc").value;
    const version = document.getElementById("versionDoc").value.trim() || "1.0";
    const estado = document.getElementById("estadoDoc").value;

    if (!nombre) {
        alert("Por favor ingresa el nombre del documento.");
        return;
    }

    const hoy = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    const tr = document.createElement("tr");
    tr.setAttribute("data-estado", estado);
    tr.innerHTML = `
        <td><div class="celda-principal"><div class="icono-fila kpi-azul"><i class="bi bi-file-earmark-text"></i></div><strong class="n-doc"></strong></div></td>
        <td>${categoria}</td>
        <td class="v-doc"></td>
        <td>${hoy}</td>
        <td><span class="etiqueta-pill ${pillEstado[estado]}"><span class="punto"></span> ${estado}</span></td>
        <td class="text-end"><button type="button" class="boton-icono" title="Descargar"><i class="bi bi-download"></i></button></td>
    `;
    tr.querySelector(".n-doc").textContent = nombre;
    tr.querySelector(".v-doc").textContent = version;
    tr.querySelector(".boton-icono").addEventListener("click", () => descargarDoc(nombre, categoria, version, estado));
    cuerpoTabla.prepend(tr);

    const filas = [...cuerpoTabla.querySelectorAll("tr")];
    document.getElementById("kpiTotal").textContent = filas.length;
    document.getElementById("kpiAprobados").textContent = filas.filter((f) => f.getAttribute("data-estado") === "Aprobado").length;
    document.getElementById("kpiPendientes").textContent = filas.filter((f) => f.getAttribute("data-estado") === "Pendiente").length;
    document.getElementById("kpiArchivados").textContent = filas.filter((f) => f.getAttribute("data-estado") === "Archivado").length;

    document.getElementById("nombreDoc").value = "";
    bootstrap.Modal.getInstance(document.getElementById("modalNuevoDocumento")).hide();
    filtrar();
    mostrarToast("Documento agregado: " + nombre);
});
