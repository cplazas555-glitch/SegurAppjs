const toastModulo = document.getElementById("toastModulo");
const mensajeToast = document.getElementById("mensajeToast");
let timerToast = null;

function mostrarToast(texto) {
    mensajeToast.textContent = texto;
    toastModulo.classList.add("visible");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => toastModulo.classList.remove("visible"), 3000);
}

const titulosSeccion = {
    empresa: { t: "Configuración general", s: "", card: "cardEmpresa" },
    usuarios: { t: "Usuarios y roles", s: "Gestiona los usuarios del sistema y asigna roles y permisos.", card: "cardUsuarios" },
    notificaciones: { t: "Configuración general", s: "", card: "cardNotificaciones" },
    plantillas: { t: "Configuración general", s: "", card: "cardPlantillas" },
    copias: { t: "Configuración general", s: "", card: null },
    registros: { t: "Configuración general", s: "", card: null }
};

function cambiarSeccion(sec) {
    document.querySelectorAll(".panel-config").forEach((p) => p.classList.add("d-none"));
    document.getElementById("panel-" + sec).classList.remove("d-none");

    document.querySelectorAll(".boton-config").forEach((b) => {
        b.classList.toggle("activo", b.getAttribute("data-sec") === sec);
    });

    document.querySelectorAll(".tarjeta-kpi.interactiva").forEach((c) => c.classList.remove("seleccionada"));
    const info = titulosSeccion[sec];
    if (info && info.card) {
        document.getElementById(info.card).classList.add("seleccionada");
    }
    document.getElementById("tituloSeccionConfig").textContent = info.t;
    document.getElementById("subtituloSeccionConfig").textContent = info.s;
}

function registrarActividad(titulo, detalle, colorClase, icono) {
    const lista = document.getElementById("listaActividad");
    const item = document.createElement("div");
    item.className = "item-mini";
    item.innerHTML = `
        <div class="item-mini-izq">
            <div class="icono-fila ${colorClase}"><i class="bi ${icono}"></i></div>
            <div><strong class="act-t"></strong><small class="act-d"></small><small>Ahora</small></div>
        </div>
    `;
    item.querySelector(".act-t").textContent = titulo;
    item.querySelector(".act-d").textContent = detalle;
    lista.prepend(item);
}

function guardarEmpresa() {
    const nombre = document.getElementById("nombreEmpresa").value.trim();
    if (!nombre) {
        alert("El nombre de la empresa es obligatorio.");
        return;
    }
    registrarActividad("Se actualizó la información de la empresa.", "Empresa: " + nombre, "kpi-azul", "bi-building");
    mostrarToast("Información de la empresa guardada");
}

function crearCopia() {
    const ahora = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const hoy = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${hoy} - ${ahora}</td><td>Manual</td><td>5.26 GB</td><td><span class="etiqueta-pill pill-verde">Exitosa</span></td>`;
    document.getElementById("tablaCopias").prepend(tr);

    const t = document.getElementById("totalCopias");
    const e = document.getElementById("copiasExitosas");
    t.textContent = Number(t.textContent) + 1;
    e.textContent = Number(e.textContent) + 1;

    registrarActividad("Copia de seguridad manual creada", "Tamaño: 5.26 GB", "kpi-verde", "bi-database");
    mostrarToast("Copia de seguridad creada con éxito");
}

// Filtro usuarios
function filtrarUsuarios() {
    const txt = document.getElementById("buscarUsuario").value.toLowerCase().trim();
    const rol = document.getElementById("filtroRol").value;
    document.querySelectorAll("#tablaUsuarios tr").forEach((tr) => {
        const ok = tr.textContent.toLowerCase().includes(txt) &&
            (rol === "todos" || tr.getAttribute("data-rol") === rol);
        tr.style.display = ok ? "" : "none";
    });
}
document.getElementById("buscarUsuario").addEventListener("input", filtrarUsuarios);
document.getElementById("filtroRol").addEventListener("change", filtrarUsuarios);

// Buscador superior de configuracion
document.getElementById("buscarConfig").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return;
    if (q.includes("rol") || q.includes("usu")) cambiarSeccion("usuarios");
    else if (q.includes("noti")) cambiarSeccion("notificaciones");
    else if (q.includes("plan")) cambiarSeccion("plantillas");
    else if (q.includes("copi") || q.includes("back")) cambiarSeccion("copias");
    else if (q.includes("reg") || q.includes("log")) cambiarSeccion("registros");
    else if (q.includes("emp")) cambiarSeccion("empresa");
});
