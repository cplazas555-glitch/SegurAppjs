(function () {
    "use strict";

    const BASE_KPI_PROXIMAS = 7;
    const BASE_CAP_INICIALES = 6;

    let capacitaciones = [];
    let timerToast = null;

    function mostrarToast(texto) {
        const toast = document.getElementById("toastModulo");
        const mensaje = document.getElementById("mensajeToast");
        if (!toast || !mensaje) return;

        mensaje.textContent = texto;
        toast.classList.add("visible");
        clearTimeout(timerToast);
        timerToast = setTimeout(function () {
            toast.classList.remove("visible");
        }, 3000);
    }

    function renderizarLista() {
        const contenedor = document.getElementById("listaCapacitacionesCompleta");
        const contador = document.getElementById("contadorListaCap");
        const kpi = document.getElementById("kpiProximasListaCap");
        const buscador = document.getElementById("buscarListaCap");
        if (!contenedor || !window.SegurAppCapacitaciones) return;

        const texto = (buscador?.value || "").toLowerCase().trim();
        const ordenadas = capacitaciones.slice().sort(function (a, b) {
            return (a.fecha + " " + a.hora).localeCompare(b.fecha + " " + b.hora);
        });

        const filtradas = ordenadas.filter(function (cap) {
            if (!texto) return true;
            return cap.nombre.toLowerCase().includes(texto) ||
                cap.categoria.toLowerCase().includes(texto) ||
                cap.responsable.toLowerCase().includes(texto);
        });

        contenedor.innerHTML = "";

        if (filtradas.length === 0) {
            const vacio = document.createElement("p");
            vacio.className = "text-secondary small text-center py-4 mb-0";
            vacio.textContent = "No se encontraron capacitaciones.";
            contenedor.appendChild(vacio);
        } else {
            filtradas.forEach(function (cap) {
                const infoFecha = window.SegurAppCapacitaciones.formatearFecha(cap.fecha);
                const rango = window.SegurAppCapacitaciones.formatearRangoHorario(cap.hora, cap.duracion);
                const estilo = window.SegurAppCapacitaciones.obtenerEstiloCategoria(cap.categoria);

                const item = document.createElement("div");
                item.className = "capacitacion";
                item.innerHTML = `
                    <div class="fecha ${estilo.fechaLista}">
                        <strong class="cap-dia"></strong>
                        <span class="cap-mes"></span>
                    </div>
                    <div class="datos-capacitacion">
                        <strong class="cap-nombre"></strong>
                        <span class="cap-horario"></span>
                    </div>
                    <span class="categoria ${estilo.claseLista} cap-cat"></span>
                `;
                item.querySelector(".cap-dia").textContent = infoFecha.dia;
                item.querySelector(".cap-mes").textContent = infoFecha.mesCorto;
                item.querySelector(".cap-nombre").textContent = cap.nombre;
                item.querySelector(".cap-horario").textContent = rango;
                item.querySelector(".cap-cat").textContent = cap.categoria;

                contenedor.appendChild(item);
            });
        }

        if (contador) {
            contador.textContent = filtradas.length + (filtradas.length === 1 ? " capacitación" : " capacitaciones");
        }
        if (kpi) {
            kpi.textContent = Math.max(0, BASE_KPI_PROXIMAS + (capacitaciones.length - BASE_CAP_INICIALES));
        }
    }

    function limpiarErrores() {
        const alerta = document.getElementById("alertaErrorCap");
        if (alerta) {
            alerta.textContent = "";
            alerta.classList.add("d-none");
        }
        ["capNombre", "capDescripcion", "capCategoria", "capResponsable", "capFecha", "capHora", "capDuracion"].forEach(function (id) {
            document.getElementById(id)?.classList.remove("is-invalid");
        });
    }

    function manejarSubmit(evento) {
        evento.preventDefault();
        limpiarErrores();

        const nombre = document.getElementById("capNombre").value.trim();
        const descripcion = document.getElementById("capDescripcion").value.trim();
        const categoria = document.getElementById("capCategoria").value;
        const responsable = document.getElementById("capResponsable").value;
        const fecha = document.getElementById("capFecha").value;
        const hora = document.getElementById("capHora").value;
        const duracion = document.getElementById("capDuracion").value;

        const invalidos = [];
        if (!nombre) invalidos.push("capNombre");
        if (!descripcion) invalidos.push("capDescripcion");
        if (!categoria) invalidos.push("capCategoria");
        if (!responsable) invalidos.push("capResponsable");
        if (!fecha) invalidos.push("capFecha");
        if (!hora) invalidos.push("capHora");
        if (!duracion) invalidos.push("capDuracion");

        if (invalidos.length > 0) {
            const alerta = document.getElementById("alertaErrorCap");
            if (alerta) {
                alerta.textContent = "Por favor completa todos los campos obligatorios para guardar la capacitación.";
                alerta.classList.remove("d-none");
            }
            invalidos.forEach(function (id) {
                document.getElementById(id)?.classList.add("is-invalid");
            });
            return;
        }

        capacitaciones.unshift({
            id: "cap-" + Date.now(),
            nombre: nombre,
            descripcion: descripcion,
            categoria: categoria,
            responsable: responsable,
            fecha: fecha,
            hora: hora,
            duracion: duracion,
            estado: "Programada"
        });

        window.SegurAppCapacitaciones.guardar(capacitaciones);
        renderizarLista();

        document.getElementById("formCapacitacion").reset();
        bootstrap.Modal.getInstance(document.getElementById("nuevaCapacitacion"))?.hide();
        mostrarToast("Capacitación agregada: " + nombre);
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (window.SegurAppSesion) {
            window.SegurAppSesion.obtenerSesion();
        }
        if (!window.SegurAppCapacitaciones) return;

        capacitaciones = window.SegurAppCapacitaciones.cargar();
        renderizarLista();

        const buscador = document.getElementById("buscarListaCap");
        if (buscador) {
            buscador.addEventListener("input", renderizarLista);
        }

        const form = document.getElementById("formCapacitacion");
        if (form) {
            form.addEventListener("submit", manejarSubmit);
        }

        const modalEl = document.getElementById("nuevaCapacitacion");
        if (modalEl) {
            modalEl.addEventListener("show.bs.modal", limpiarErrores);
        }
    });
})();
