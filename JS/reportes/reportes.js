const buscador = document.getElementById("buscarReporte");
const filtroEstado = document.getElementById("filtroEstado");
const cuerpoTabla = document.getElementById("cuerpoTablaReportes");
const contadorReportes = document.getElementById("contadorReportes");
const kpiDescargas = document.getElementById("kpiDescargas");
const kpiGenerados = document.getElementById("kpiGenerados");
const kpiPersonalizados = document.getElementById("kpiPersonalizados");
const toastReporte = document.getElementById("toastReporte");
const mensajeToast = document.getElementById("mensajeToast");

let temporizadorToast = null;

function mostrarToast(texto) {
    mensajeToast.textContent = texto;
    toastReporte.classList.add("visible");
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(function () {
        toastReporte.classList.remove("visible");
    }, 3000);
}

function filtrarReportes() {
    const texto = buscador.value.toLowerCase().trim();
    const estado = filtroEstado.value;
    const filas = cuerpoTabla.querySelectorAll("tr");
    let visibles = 0;

    filas.forEach(function (fila) {
        const contenido = fila.textContent.toLowerCase();
        const estadoFila = fila.getAttribute("data-estado");
        const coincideTexto = contenido.includes(texto);
        const coincideEstado = estado === "todos" || estadoFila === estado;

        if (coincideTexto && coincideEstado) {
            fila.style.display = "";
            visibles++;
        } else {
            fila.style.display = "none";
        }
    });

    if (visibles === 0) {
        contadorReportes.textContent = "No se encontraron reportes con los filtros actuales";
    } else {
        contadorReportes.textContent =
            "Mostrando 1 a " + visibles + " de " + filas.length + " reportes";
    }
}

function filtrarPorEstado(estado) {
    mostrarVista("principal");
    filtroEstado.value = estado;
    filtrarReportes();
}

buscador.addEventListener("input", function () {
    mostrarVista("principal");
    filtrarReportes();
});

filtroEstado.addEventListener("change", filtrarReportes);

function descargarReporte(nombre, categoria, fecha, estado) {
    const contenidoCsv =
        "Nombre,Categoria,Fecha,Estado\n" +
        `"${nombre}","${categoria}","${fecha}","${estado}"\n`;

    const blob = new Blob([contenidoCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombre.toLowerCase().replace(/\s+/g, "-") + ".csv";
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);

    kpiDescargas.textContent = Number(kpiDescargas.textContent) + 1;
    mostrarToast("Descarga iniciada: " + nombre);
}

const configuracionVistas = {
    principal: {
        id: "vistaPrincipal",
        titulo: "Reportes",
        subtitulo: "Generación y consulta de reportes e indicadores del sistema.",
        miga: ""
    },
    capacitaciones: {
        id: "vistaCapacitaciones",
        titulo: "Resumen de capacitaciones",
        subtitulo: "Información general sobre las capacitaciones realizadas.",
        miga: "Resumen de capacitaciones"
    },
    incidentes: {
        id: "vistaIncidentes",
        titulo: "Incidentes del mes",
        subtitulo: "Resumen de incidentes reportados en el mes actual.",
        miga: "Incidentes del mes"
    },
    epp: {
        id: "vistaEpp",
        titulo: "Cumplimiento de EPP",
        subtitulo: "Estado de cumplimiento en el uso y entrega de EPP.",
        miga: "Cumplimiento de EPP"
    },
    riesgos: {
        id: "vistaRiesgos",
        titulo: "Riesgos por área",
        subtitulo: "Resumen de riesgos identificados y su nivel por área.",
        miga: "Riesgos por área"
    }
};

function mostrarVista(clave) {
    const vista = configuracionVistas[clave] || configuracionVistas.principal;

    Object.values(configuracionVistas).forEach(function (v) {
        document.getElementById(v.id).classList.add("d-none");
    });

    document.getElementById(vista.id).classList.remove("d-none");
    document.getElementById("tituloVista").textContent = vista.titulo;
    document.getElementById("subtituloVista").textContent = vista.subtitulo;

    const migaPan = document.getElementById("migaPan");
    if (vista.miga) {
        migaPan.classList.remove("d-none");
        document.getElementById("migaPanActual").textContent = vista.miga;
    } else {
        migaPan.classList.add("d-none");
    }
}

function verDetalle(titulo, texto) {
    document.getElementById("tituloModalDetalle").textContent = titulo;
    document.getElementById("cuerpoModalDetalle").textContent = texto;
    const modal = new bootstrap.Modal(document.getElementById("modalDetalleReporte"));
    modal.show();
}

const estilosCategoria = {
    Capacitaciones: { clase: "cat-capacitaciones", fondo: "kpi-verde", icono: "bi-people" },
    Incidentes: { clase: "cat-incidentes", fondo: "kpi-rojo", icono: "bi-exclamation-triangle" },
    Inspecciones: { clase: "cat-inspecciones", fondo: "kpi-morado", icono: "bi-shield" },
    EPP: { clase: "cat-epp", fondo: "kpi-amarillo", icono: "bi-shield-check" },
    Riesgos: { clase: "cat-riesgos", fondo: "kpi-azul", icono: "bi-activity" }
};

document.getElementById("guardarNuevoReporte").addEventListener("click", function () {
    const nombre = document.getElementById("nombreNuevoReporte").value.trim();
    const categoria = document.getElementById("categoriaNuevoReporte").value;
    const descripcion = document.getElementById("descripcionNuevoReporte").value.trim();
    const estado = document.getElementById("estadoNuevoReporte").value;

    if (!nombre || !categoria || !descripcion) {
        alert("Por favor completa todos los campos del reporte.");
        return;
    }

    const hoy = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    const estilo = estilosCategoria[categoria] || estilosCategoria.Capacitaciones;
    const textoEstado = estado === "generado" ? "Generado" : "Detenido";
    const claseEstado = estado === "generado" ? "estado-generado" : "estado-detenido";

    const fila = document.createElement("tr");
    fila.setAttribute("data-estado", estado);
    fila.innerHTML = `
        <td>
            <div class="celda-nombre-reporte">
                <div class="icono-fila ${estilo.fondo}">
                    <i class="bi ${estilo.icono}"></i>
                </div>
                <div class="textos-fila">
                    <strong></strong>
                    <small>Reporte personalizado</small>
                </div>
            </div>
        </td>
        <td><span class="categoria-texto ${estilo.clase}"></span></td>
        <td class="celda-descripcion"></td>
        <td>${hoy}</td>
        <td>
            <span class="estado-etiqueta ${claseEstado}">
                <span class="punto"></span> ${textoEstado}
            </span>
        </td>
        <td class="text-end">
            <button type="button" class="boton-descargar" title="Descargar reporte">
                <i class="bi bi-download"></i>
            </button>
        </td>
    `;

    fila.querySelector(".textos-fila strong").textContent = nombre;
    fila.querySelector(".categoria-texto").textContent = categoria;
    fila.querySelector(".celda-descripcion").textContent = descripcion;
    fila.querySelector(".boton-descargar").addEventListener("click", function () {
        descargarReporte(nombre, categoria, hoy, textoEstado);
    });

    cuerpoTabla.prepend(fila);

    kpiPersonalizados.textContent = Number(kpiPersonalizados.textContent) + 1;
    if (estado === "generado") {
        kpiGenerados.textContent = Number(kpiGenerados.textContent) + 1;
    }

    document.getElementById("nombreNuevoReporte").value = "";
    document.getElementById("categoriaNuevoReporte").value = "";
    document.getElementById("descripcionNuevoReporte").value = "";
    document.getElementById("estadoNuevoReporte").value = "generado";

    bootstrap.Modal.getInstance(document.getElementById("modalNuevoReporte")).hide();
    filtrarReportes();
    mostrarToast("Reporte creado: " + nombre);
});
