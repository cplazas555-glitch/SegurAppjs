const buscarSuperior = document.getElementById("buscarSuperior");
const buscarTabla = document.getElementById("buscarTabla");
const filtroArea = document.getElementById("filtroArea");
const filtroEstado = document.getElementById("filtroEstado");
const filtroNivel = document.getElementById("filtroNivel");
const cuerpoTabla = document.getElementById("cuerpoTabla");
const subtituloRegistros = document.getElementById("subtituloRegistros");
const contadorPie = document.getElementById("contadorPie");
const controlesPaginacion = document.getElementById("controlesPaginacion");
const btnVerTodosRiesgos = document.getElementById("btnVerTodosRiesgos");
const btnVolverResumenRiesgos = document.getElementById("btnVolverResumenRiesgos");
const badgeVistaCompleta = document.getElementById("badgeVistaCompleta");
const seccionListadoRiesgos = document.getElementById("seccionListadoRiesgos");
const toastModulo = document.getElementById("toastModulo");
const mensajeToast = document.getElementById("mensajeToast");

const LIMITE_RESUMEN = 5;
let vistaCompleta = false;
let paginaActual = 1;
let timerToast = null;

function mostrarToast(texto) {
    mensajeToast.textContent = texto;
    toastModulo.classList.add("visible");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => toastModulo.classList.remove("visible"), 3000);
}

function actualizarResumenRiesgos() {
    const filas = [...cuerpoTabla.querySelectorAll("tr")];
    const total = filas.length;
    const altos = filas.filter((f) => f.getAttribute("data-nivel") === "Alto").length;
    const medios = filas.filter((f) => f.getAttribute("data-nivel") === "Medio").length;
    const bajos = filas.filter((f) => f.getAttribute("data-nivel") === "Bajo").length;

    const pctAlto = total ? Math.round((altos / total) * 100) : 0;
    const pctMedio = total ? Math.round((medios / total) * 100) : 0;
    const pctBajo = total ? Math.round((bajos / total) * 100) : 0;

    document.getElementById("kpiTotal").textContent = total;
    document.getElementById("kpiAltos").textContent = altos;
    document.getElementById("kpiMedios").textContent = medios;
    document.getElementById("kpiBajos").textContent = bajos;

    const subAltos = document.getElementById("subKpiAltos");
    const subMedios = document.getElementById("subKpiMedios");
    const subBajos = document.getElementById("subKpiBajos");
    if (subAltos) subAltos.textContent = pctAlto + "% del total";
    if (subMedios) subMedios.textContent = pctMedio + "% del total";
    if (subBajos) subBajos.textContent = pctBajo + "% del total";

    const totalDonut = document.getElementById("totalDonutRiesgos");
    const anilloDonut = document.getElementById("anilloDonutRiesgos");
    const leyendaAlto = document.getElementById("porcentajeRiesgoAlto");
    const leyendaMedio = document.getElementById("porcentajeRiesgoMedio");
    const leyendaBajo = document.getElementById("porcentajeRiesgoBajo");

    if (totalDonut) totalDonut.textContent = total;
    if (leyendaAlto) leyendaAlto.textContent = "(" + pctAlto + "%)";
    if (leyendaMedio) leyendaMedio.textContent = "(" + pctMedio + "%)";
    if (leyendaBajo) leyendaBajo.textContent = "(" + pctBajo + "%)";

    if (anilloDonut) {
        if (total === 0) {
            anilloDonut.style.background = "conic-gradient(#e2e8f0 0% 100%)";
        } else {
            const stopAlto = (altos / total) * 100;
            const stopMedio = stopAlto + (medios / total) * 100;
            anilloDonut.style.background =
                `conic-gradient(#ef4444 0% ${stopAlto.toFixed(2)}%, #ffb719 ${stopAlto.toFixed(2)}% ${stopMedio.toFixed(2)}%, #2fb344 ${stopMedio.toFixed(2)}% 100%)`;
        }
    }
}

function renderizarPaginacion(totalCoincidencias) {
    if (!controlesPaginacion) return;
    controlesPaginacion.innerHTML = "";

    if (vistaCompleta || totalCoincidencias <= LIMITE_RESUMEN) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "boton-pagina actual";
        btn.textContent = "1";
        controlesPaginacion.appendChild(btn);
        return;
    }

    const totalPaginas = Math.ceil(totalCoincidencias / LIMITE_RESUMEN);
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "boton-pagina" + (i === paginaActual ? " actual" : "");
        btn.textContent = String(i);
        btn.addEventListener("click", () => {
            paginaActual = i;
            filtrar();
        });
        controlesPaginacion.appendChild(btn);
    }
}

function filtrar(valor) {
    if (valor !== undefined) {
        buscarSuperior.value = valor;
        buscarTabla.value = valor;
        paginaActual = 1;
    }

    const texto = buscarTabla.value.toLowerCase().trim();
    const area = filtroArea.value;
    const estado = filtroEstado.value;
    const nivel = filtroNivel.value;
    const filas = [...cuerpoTabla.querySelectorAll("tr")];

    const coincidentes = filas.filter((fila) => {
        return (
            fila.textContent.toLowerCase().includes(texto) &&
            (area === "todas" || fila.getAttribute("data-area") === area) &&
            (estado === "todos" || fila.getAttribute("data-estado") === estado) &&
            (nivel === "todos" || fila.getAttribute("data-nivel") === nivel)
        );
    });

    const totalPaginas = vistaCompleta ? 1 : Math.max(1, Math.ceil(coincidentes.length / LIMITE_RESUMEN));
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;

    const inicio = vistaCompleta ? 0 : (paginaActual - 1) * LIMITE_RESUMEN;
    const fin = vistaCompleta ? coincidentes.length : inicio + LIMITE_RESUMEN;
    const visiblesSet = new Set(coincidentes.slice(inicio, fin));

    filas.forEach((fila) => {
        fila.style.display = visiblesSet.has(fila) ? "" : "none";
    });

    const cantidadCoincidentes = coincidentes.length;
    subtituloRegistros.textContent =
        cantidadCoincidentes + (cantidadCoincidentes === 1 ? " registro encontrado" : " registros encontrados");

    if (cantidadCoincidentes === 0) {
        contadorPie.textContent = "Mostrando 0 de " + filas.length + " registros";
    } else if (vistaCompleta) {
        contadorPie.textContent = "Mostrando todos (" + cantidadCoincidentes + " de " + filas.length + " registros)";
    } else {
        const desde = inicio + 1;
        const hasta = Math.min(fin, cantidadCoincidentes);
        contadorPie.textContent = "Mostrando " + desde + " a " + hasta + " de " + cantidadCoincidentes + " registros";
    }

    renderizarPaginacion(cantidadCoincidentes);
}

function alternarVistaCompleta(activar) {
    vistaCompleta = activar;
    paginaActual = 1;

    if (activar) {
        buscarSuperior.value = "";
        buscarTabla.value = "";
        filtroArea.value = "todas";
        filtroEstado.value = "todos";
        filtroNivel.value = "todos";
    }

    if (btnVerTodosRiesgos) {
        btnVerTodosRiesgos.setAttribute("aria-expanded", activar ? "true" : "false");
        btnVerTodosRiesgos.textContent = activar ? "Viendo todos" : "Ver todos";
    }
    if (badgeVistaCompleta) {
        badgeVistaCompleta.classList.toggle("d-none", !activar);
    }
    if (btnVolverResumenRiesgos) {
        btnVolverResumenRiesgos.classList.toggle("d-none", !activar);
    }

    filtrar();

    if (activar) {
        seccionListadoRiesgos?.scrollIntoView({ behavior: "smooth", block: "start" });
        const total = cuerpoTabla.querySelectorAll("tr").length;
        mostrarToast("Mostrando todos los riesgos (" + total + ")");
    }
}

if (btnVerTodosRiesgos) {
    btnVerTodosRiesgos.addEventListener("click", () => {
        alternarVistaCompleta(!vistaCompleta);
    });
}

if (btnVolverResumenRiesgos) {
    btnVolverResumenRiesgos.addEventListener("click", () => {
        alternarVistaCompleta(false);
    });
}

buscarSuperior.addEventListener("input", () => filtrar(buscarSuperior.value));
buscarTabla.addEventListener("input", () => filtrar(buscarTabla.value));
[filtroArea, filtroEstado, filtroNivel].forEach((s) =>
    s.addEventListener("change", () => {
        paginaActual = 1;
        filtrar();
    })
);

function limpiarErroresRiesgo() {
    const alerta = document.getElementById("alertaErrorRiesgo");
    if (alerta) {
        alerta.textContent = "";
        alerta.classList.add("d-none");
    }
    ["nombreRiesgo", "descripcionRiesgo", "areaRiesgo", "tipoRiesgo", "nivelRiesgo", "estadoRiesgo"].forEach((id) => {
        document.getElementById(id)?.classList.remove("is-invalid");
    });
}

function mostrarErrorRiesgo(mensaje, idsInvalidos) {
    const alerta = document.getElementById("alertaErrorRiesgo");
    if (alerta) {
        alerta.textContent = mensaje;
        alerta.classList.remove("d-none");
    }
    (idsInvalidos || []).forEach((id) => {
        document.getElementById(id)?.classList.add("is-invalid");
    });
}

const modalNuevoRiesgoEl = document.getElementById("modalNuevoRiesgo");
if (modalNuevoRiesgoEl) {
    modalNuevoRiesgoEl.addEventListener("show.bs.modal", limpiarErroresRiesgo);
}

const claseNivel = { "Alto": "pill-rojo", "Medio": "pill-amarillo", "Bajo": "pill-verde" };
const claseEstado = { "Activo": "pill-verde", "Mitigado": "pill-azul" };

document.getElementById("guardarRiesgo").addEventListener("click", () => {
    limpiarErroresRiesgo();

    const nombre = document.getElementById("nombreRiesgo").value.trim();
    const desc = document.getElementById("descripcionRiesgo").value.trim();
    const area = document.getElementById("areaRiesgo").value;
    const tipo = document.getElementById("tipoRiesgo").value;
    const nivel = document.getElementById("nivelRiesgo").value;
    const estado = document.getElementById("estadoRiesgo")?.value || "Activo";

    const invalidos = [];
    if (!nombre) invalidos.push("nombreRiesgo");
    if (!desc) invalidos.push("descripcionRiesgo");
    if (!area) invalidos.push("areaRiesgo");
    if (!tipo) invalidos.push("tipoRiesgo");
    if (!nivel) invalidos.push("nivelRiesgo");

    if (invalidos.length > 0) {
        mostrarErrorRiesgo("Por favor completa todos los campos obligatorios marcados con *.", invalidos);
        return;
    }

    if (nombre.length < 3) {
        mostrarErrorRiesgo("El nombre del riesgo debe tener al menos 3 caracteres.", ["nombreRiesgo"]);
        return;
    }

    const num = cuerpoTabla.querySelectorAll("tr").length + 26;
    const id = "RIES-" + String(num).padStart(3, "0");

    const tr = document.createElement("tr");
    tr.setAttribute("data-area", area);
    tr.setAttribute("data-estado", estado);
    tr.setAttribute("data-nivel", nivel);
    tr.innerHTML = `
        <td><strong>${id}</strong></td>
        <td><div class="textos-fila"><strong class="n-riesgo"></strong><small class="d-riesgo"></small></div></td>
        <td>${area}</td>
        <td>${tipo}</td>
        <td><span class="etiqueta-pill ${claseNivel[nivel]}">${nivel}</span></td>
        <td><span class="etiqueta-pill ${claseEstado[estado] || "pill-verde"}">${estado}</span></td>
    `;
    tr.querySelector(".n-riesgo").textContent = nombre;
    tr.querySelector(".d-riesgo").textContent = desc;
    cuerpoTabla.prepend(tr);

    paginaActual = 1;
    actualizarResumenRiesgos();
    filtrar();

    document.getElementById("nombreRiesgo").value = "";
    document.getElementById("descripcionRiesgo").value = "";
    if (document.getElementById("estadoRiesgo")) {
        document.getElementById("estadoRiesgo").value = "Activo";
    }
    bootstrap.Modal.getInstance(document.getElementById("modalNuevoRiesgo")).hide();
    mostrarToast("Riesgo " + id + " agregado");
});

actualizarResumenRiesgos();
filtrar();
