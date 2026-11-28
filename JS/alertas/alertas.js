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

function actualizarResumenAlertas() {
    const filas = [...cuerpoAlertas.querySelectorAll("tr")];
    const activas = filas.filter((f) => f.getAttribute("data-estado") === "Activo");
    const atendidas = filas.filter((f) => f.getAttribute("data-estado") === "Atendida");
    const proximas = activas.filter((f) => f.getAttribute("data-proxima") === "true").length;

    const kpiActivas = document.getElementById("kpiActivas");
    const kpiAtendidas = document.getElementById("kpiAtendidas");
    const kpiTotal = document.getElementById("kpiTotalAlertas");
    const kpiProximas = document.getElementById("kpiProximas");
    const totalDonut = document.getElementById("totalDonut");

    if (kpiActivas) kpiActivas.textContent = activas.length;
    if (kpiAtendidas) kpiAtendidas.textContent = atendidas.length;
    if (kpiTotal) kpiTotal.textContent = filas.length;
    if (kpiProximas) kpiProximas.textContent = proximas;
    if (totalDonut) totalDonut.textContent = activas.length;
    subtituloAlertas.textContent = activas.length + (activas.length === 1 ? " alerta activa" : " alertas activas");

    const totalActivas = activas.length;
    const alta = activas.filter((f) => f.getAttribute("data-prioridad") === "Alta").length;
    const media = activas.filter((f) => f.getAttribute("data-prioridad") === "Media").length;
    const baja = activas.filter((f) => f.getAttribute("data-prioridad") === "Baja").length;

    const pctAlta = totalActivas ? Math.round((alta / totalActivas) * 100) : 0;
    const pctMedia = totalActivas ? Math.round((media / totalActivas) * 100) : 0;
    const pctBaja = totalActivas ? Math.round((baja / totalActivas) * 100) : 0;

    const leyendaAlta = document.getElementById("leyendaAlertaAlta");
    const leyendaMedia = document.getElementById("leyendaAlertaMedia");
    const leyendaBaja = document.getElementById("leyendaAlertaBaja");
    const anillo = document.getElementById("anilloDonutAlertas");

    if (leyendaAlta) leyendaAlta.textContent = `${alta} (${pctAlta}%)`;
    if (leyendaMedia) leyendaMedia.textContent = `${media} (${pctMedia}%)`;
    if (leyendaBaja) leyendaBaja.textContent = `${baja} (${pctBaja}%)`;

    if (anillo) {
        if (totalActivas === 0) {
            anillo.style.background = "conic-gradient(#e2e8f0 0% 100%)";
        } else {
            const stopAlta = (alta / totalActivas) * 100;
            const stopMedia = stopAlta + (media / totalActivas) * 100;
            anillo.style.background =
                `conic-gradient(#ef4444 0% ${stopAlta.toFixed(2)}%, #ea580c ${stopAlta.toFixed(2)}% ${stopMedia.toFixed(2)}%, #2fb344 ${stopMedia.toFixed(2)}% 100%)`;
        }
    }
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

    actualizarResumenAlertas();
    filtrar();
    mostrarToast("Alerta marcada como atendida");
}

function limpiarErroresAlerta() {
    const alerta = document.getElementById("alertaErrorAlerta");
    if (alerta) {
        alerta.textContent = "";
        alerta.classList.add("d-none");
    }
    ["tituloAlerta", "detalleAlerta", "categoriaAlerta", "fechaAlerta", "prioridadAlerta", "estadoAlerta"].forEach((id) => {
        document.getElementById(id)?.classList.remove("is-invalid");
    });
}

function mostrarErrorAlerta(mensaje, idsInvalidos) {
    const alerta = document.getElementById("alertaErrorAlerta");
    if (alerta) {
        alerta.textContent = mensaje;
        alerta.classList.remove("d-none");
    }
    (idsInvalidos || []).forEach((id) => {
        document.getElementById(id)?.classList.add("is-invalid");
    });
}

const modalNuevaAlertaEl = document.getElementById("modalNuevaAlerta");
if (modalNuevaAlertaEl) {
    modalNuevaAlertaEl.addEventListener("show.bs.modal", limpiarErroresAlerta);
}

const claseCategoriaAlerta = {
    "Capacitación": "pill-rojo",
    "Inspección": "pill-amarillo",
    "EPP": "pill-azul",
    "Riesgo": "pill-amarillo",
    "Documento": "pill-azul"
};

const claseIconoPrioridad = {
    "Alta": "kpi-rojo",
    "Media": "kpi-amarillo",
    "Baja": "kpi-azul"
};

const clasePillPrioridad = {
    "Alta": "pill-rojo",
    "Media": "pill-amarillo",
    "Baja": "pill-verde"
};

function calcularInfoFecha(fechaIso) {
    const fechaObj = new Date(fechaIso + "T00:00:00");
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diffDias = Math.round((fechaObj - hoy) / (1000 * 60 * 60 * 24));
    const fechaFormateada = fechaObj.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    let textoDias;
    let claseDias = "texto-amarillo";
    if (diffDias < 0) {
        const diasVencidos = Math.abs(diffDias);
        textoDias = "Vencida hace " + diasVencidos + (diasVencidos === 1 ? " día" : " días");
        claseDias = "texto-rojo";
    } else if (diffDias === 0) {
        textoDias = "Vence hoy";
        claseDias = "texto-rojo";
    } else if (diffDias === 1) {
        textoDias = "1 día restante";
    } else {
        textoDias = diffDias + " días restantes";
    }

    return {
        fechaFormateada,
        textoDias,
        claseDias,
        esProxima: diffDias >= 0 && diffDias <= 30
    };
}

document.getElementById("guardarAlerta").addEventListener("click", () => {
    limpiarErroresAlerta();

    const titulo = document.getElementById("tituloAlerta").value.trim();
    const detalle = document.getElementById("detalleAlerta").value.trim();
    const categoria = document.getElementById("categoriaAlerta").value;
    const fecha = document.getElementById("fechaAlerta").value;
    const prioridad = document.getElementById("prioridadAlerta").value;
    const estado = document.getElementById("estadoAlerta").value;

    const invalidos = [];
    if (!titulo) invalidos.push("tituloAlerta");
    if (!detalle) invalidos.push("detalleAlerta");
    if (!categoria) invalidos.push("categoriaAlerta");
    if (!fecha) invalidos.push("fechaAlerta");
    if (!prioridad) invalidos.push("prioridadAlerta");
    if (!estado) invalidos.push("estadoAlerta");

    if (invalidos.length > 0) {
        mostrarErrorAlerta("Por favor completa todos los campos obligatorios marcados con *.", invalidos);
        return;
    }

    if (titulo.length < 3) {
        mostrarErrorAlerta("El título de la alerta debe tener al menos 3 caracteres.", ["tituloAlerta"]);
        return;
    }

    const fechaObj = new Date(fecha + "T00:00:00");
    if (isNaN(fechaObj.getTime())) {
        mostrarErrorAlerta("Ingresa una fecha límite válida.", ["fechaAlerta"]);
        return;
    }

    const infoFecha = calcularInfoFecha(fecha);
    const tr = document.createElement("tr");
    tr.setAttribute("data-estado", estado);
    tr.setAttribute("data-prioridad", prioridad);
    if (infoFecha.esProxima) {
        tr.setAttribute("data-proxima", "true");
    }

    const esAtendida = estado === "Atendida";
    const htmlEstado = esAtendida
        ? '<span class="etiqueta-pill pill-gris"><span class="punto"></span> Atendida</span>'
        : '<span class="etiqueta-pill pill-verde"><span class="punto"></span> Activo</span>';

    tr.innerHTML = `
        <td>
            <div class="celda-principal">
                <div class="icono-fila ${claseIconoPrioridad[prioridad] || "kpi-azul"}"><i class="bi bi-bell"></i></div>
                <div class="textos-fila">
                    <strong class="alerta-titulo"></strong>
                    <small class="alerta-detalle"></small>
                </div>
            </div>
        </td>
        <td><span class="etiqueta-pill ${claseCategoriaAlerta[categoria] || "pill-azul"} alerta-cat"></span></td>
        <td>
            <div class="textos-fila">
                <strong class="alerta-fecha"></strong>
                <small class="${infoFecha.claseDias} alerta-dias"></small>
            </div>
        </td>
        <td><span class="etiqueta-pill ${clasePillPrioridad[prioridad] || "pill-azul"} alerta-prio"></span></td>
        <td class="celda-estado">${htmlEstado}</td>
        <td class="text-end">
            <button type="button" class="boton-icono" title="Marcar como atendida" onclick="atenderAlerta(this)" ${esAtendida ? 'disabled style="opacity:0.4;"' : ""}>
                <i class="bi bi-check2"></i>
            </button>
        </td>
    `;

    tr.querySelector(".alerta-titulo").textContent = titulo;
    tr.querySelector(".alerta-detalle").textContent = detalle;
    tr.querySelector(".alerta-cat").textContent = categoria;
    tr.querySelector(".alerta-fecha").textContent = infoFecha.fechaFormateada;
    tr.querySelector(".alerta-dias").textContent = infoFecha.textoDias;
    tr.querySelector(".alerta-prio").textContent = prioridad;

    cuerpoAlertas.prepend(tr);
    actualizarResumenAlertas();
    filtrar();

    document.getElementById("tituloAlerta").value = "";
    document.getElementById("detalleAlerta").value = "";
    document.getElementById("fechaAlerta").value = "";
    document.getElementById("estadoAlerta").value = "Activo";

    bootstrap.Modal.getInstance(document.getElementById("modalNuevaAlerta")).hide();
    mostrarToast("Alerta agregada: " + titulo);
});

actualizarResumenAlertas();
filtrar();
