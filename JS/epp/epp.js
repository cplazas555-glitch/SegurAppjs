const buscarSuperior = document.getElementById("buscarSuperior");
const buscarElemento = document.getElementById("buscarElemento");
const filtroEstadoEpp = document.getElementById("filtroEstadoEpp");
const cuerpoInventario = document.getElementById("cuerpoInventario");
const contadorInventario = document.getElementById("contadorInventario");
const cuerpoEntregas = document.getElementById("cuerpoEntregas");
const toastModulo = document.getElementById("toastModulo");
const mensajeToast = document.getElementById("mensajeToast");
let timerToast = null;
let mostrandoTodas = false;

function mostrarToast(texto) {
    mensajeToast.textContent = texto;
    toastModulo.classList.add("visible");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => toastModulo.classList.remove("visible"), 3000);
}

function filtrarInventario(valor) {
    if (valor !== undefined) {
        buscarSuperior.value = valor;
        buscarElemento.value = valor;
    }
    const texto = buscarElemento.value.toLowerCase().trim();
    const estado = filtroEstadoEpp.value;
    const filas = cuerpoInventario.querySelectorAll("tr");
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
    contadorInventario.textContent = "Mostrando " + (visibles ? "1 a " + visibles : "0") + " de " + filas.length + " elementos";
}

buscarSuperior.addEventListener("input", () => filtrarInventario(buscarSuperior.value));
buscarElemento.addEventListener("input", () => filtrarInventario(buscarElemento.value));
filtroEstadoEpp.addEventListener("change", () => filtrarInventario());

function alternarEntregas(verTodas) {
    mostrandoTodas = verTodas;
    document.querySelectorAll(".entrega-extra").forEach((tr) => {
        tr.classList.toggle("d-none", !verTodas);
    });
    document.getElementById("seccionInventario").classList.toggle("d-none", verTodas);
    document.getElementById("enlaceTodasEntregas").classList.toggle("d-none", verTodas);
    document.getElementById("botonVerTodas").classList.toggle("d-none", !verTodas);

    const total = cuerpoEntregas.querySelectorAll("tr").length;
    const visibles = verTodas ? total : Math.min(2, total);
    document.getElementById("contadorEntregas").textContent = "Mostrando 1 a " + visibles + " de " + total + " entregas";
}

function limpiarErroresEntrega() {
    const alerta = document.getElementById("alertaErrorEntrega");
    if (alerta) {
        alerta.textContent = "";
        alerta.classList.add("d-none");
    }
    ["empleadoEntrega", "elementoEntrega", "responsableEntrega"].forEach((id) => {
        document.getElementById(id)?.classList.remove("is-invalid");
    });
}

const modalEntregaEl = document.getElementById("modalRegistrarEntrega");
if (modalEntregaEl) {
    modalEntregaEl.addEventListener("show.bs.modal", limpiarErroresEntrega);
}

document.getElementById("guardarEntrega").addEventListener("click", () => {
    limpiarErroresEntrega();

    const empleado = document.getElementById("empleadoEntrega").value.trim();
    const elemento = document.getElementById("elementoEntrega").value.trim();
    const responsable = document.getElementById("responsableEntrega").value.trim();
    const estado = document.getElementById("estadoEntrega").value;

    const invalidos = [];
    if (!empleado) invalidos.push("empleadoEntrega");
    if (!elemento) invalidos.push("elementoEntrega");
    if (!responsable) invalidos.push("responsableEntrega");

    if (invalidos.length > 0) {
        const alerta = document.getElementById("alertaErrorEntrega");
        if (alerta) {
            alerta.textContent = "Por favor completa el empleado, el elemento y quién realiza la entrega.";
            alerta.classList.remove("d-none");
        }
        invalidos.forEach((id) => {
            document.getElementById(id)?.classList.add("is-invalid");
        });
        return;
    }

    const iniciales = empleado.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "EM";
    const hoy = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    const claseEstado = estado === "Entregado" ? "pill-verde" : "pill-amarillo";

    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td><div class="celda-principal"><span class="iniciales-avatar-tabla bg-light text-secondary"></span><strong class="emp-nombre"></strong></div></td>
        <td class="elem-nombre"></td>
        <td>${hoy}</td>
        <td class="resp-nombre"></td>
        <td><span class="etiqueta-pill ${claseEstado}"></span></td>
    `;
    tr.querySelector(".iniciales-avatar-tabla").textContent = iniciales;
    tr.querySelector(".emp-nombre").textContent = empleado;
    tr.querySelector(".elem-nombre").textContent = elemento;
    tr.querySelector(".resp-nombre").textContent = responsable;
    tr.querySelector(".etiqueta-pill").textContent = estado;
    cuerpoEntregas.prepend(tr);

    if (estado === "Entregado") {
        const kpiE = document.getElementById("kpiEntregados");
        kpiE.textContent = Number(kpiE.textContent) + 1;
    } else {
        const kpiP = document.getElementById("kpiPendientes");
        kpiP.textContent = Number(kpiP.textContent) + 1;
    }

    document.getElementById("empleadoEntrega").value = "";
    document.getElementById("elementoEntrega").value = "";
    bootstrap.Modal.getInstance(document.getElementById("modalRegistrarEntrega")).hide();
    alternarEntregas(mostrandoTodas);
    mostrarToast("Entrega de " + elemento + " registrada para " + empleado);
});
