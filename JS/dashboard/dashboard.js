(function () {
    "use strict";

    const BASE_EMPLEADOS_ACTIVOS = 28;
    const BASE_EMPLEADOS_TABLA = 4;
    const BASE_CAPACITACIONES = 12;
    const BASE_CAPACITACIONES_LISTA = 6;

    let timerToast = null;

    function mostrarToast(texto) {
        const toast = document.getElementById("toastDashboard");
        const mensaje = document.getElementById("mensajeToastDashboard");
        if (!toast || !mensaje) return;

        mensaje.textContent = texto;
        toast.classList.add("visible");
        clearTimeout(timerToast);
        timerToast = setTimeout(function () {
            toast.classList.remove("visible");
        }, 3000);
    }

    function leerListaLocal(clave) {
        try {
            const raw = localStorage.getItem(clave);
            const parsed = raw ? JSON.parse(raw) : null;
            return Array.isArray(parsed) ? parsed : null;
        } catch (error) {
            return null;
        }
    }

    function sincronizarIndicadores() {
        const kpiEmp = document.getElementById("kpiDashEmpleados");
        const kpiCap = document.getElementById("kpiDashCapacitaciones");

        const empleados = leerListaLocal("segurapp_empleados");
        if (kpiEmp && empleados) {
            const activos = empleados.filter(function (e) {
                return e.estado === "Activo";
            }).length;
            kpiEmp.textContent = Math.max(0, BASE_EMPLEADOS_ACTIVOS + (activos - BASE_EMPLEADOS_TABLA));
        }

        const capacitaciones = leerListaLocal("segurapp_capacitaciones");
        if (kpiCap && capacitaciones) {
            kpiCap.textContent = Math.max(0, BASE_CAPACITACIONES + (capacitaciones.length - BASE_CAPACITACIONES_LISTA));
        }
    }

    function filtrarActividades(termino) {
        const tarjetaActividades = document.querySelector(".tarjeta-actividades");
        const filas = document.querySelectorAll(".tabla-actividades tbody tr");
        const btnRestablecer = document.getElementById("btnRestablecerActividades");
        if (!tarjetaActividades || !filas.length) return;

        const filtro = (termino || "").toLowerCase().trim();
        let coincidencias = 0;

        filas.forEach(function (fila) {
            fila.classList.remove("fila-resaltada");
            const coincide = !filtro || fila.textContent.toLowerCase().includes(filtro);
            fila.style.display = coincide ? "" : "none";
            if (coincide && filtro) {
                fila.classList.add("fila-resaltada");
                coincidencias++;
            }
        });

        if (btnRestablecer) {
            btnRestablecer.classList.toggle("d-none", !filtro);
        }

        tarjetaActividades.scrollIntoView({ behavior: "smooth", block: "nearest" });

        if (filtro) {
            mostrarToast(
                coincidencias > 0
                    ? "Mostrando actividades relacionadas con " + termino
                    : "No hay actividades próximas para " + termino
            );
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (window.SegurAppSesion) {
            window.SegurAppSesion.obtenerSesion();
        }

        sincronizarIndicadores();

        const btnRestablecer = document.getElementById("btnRestablecerActividades");
        if (btnRestablecer) {
            btnRestablecer.addEventListener("click", function () {
                filtrarActividades("");
            });
        }

        document.querySelectorAll("[data-accion-tarjeta='actualizar']").forEach(function (boton) {
            boton.addEventListener("click", function () {
                const tarjeta = boton.getAttribute("data-tarjeta");
                sincronizarIndicadores();

                if (tarjeta === "empleados") {
                    const total = document.getElementById("kpiDashEmpleados")?.textContent || "28";
                    mostrarToast("Indicador actualizado: " + total + " empleados activos");
                } else if (tarjeta === "inspecciones") {
                    const total = document.getElementById("kpiDashInspecciones")?.textContent || "9";
                    mostrarToast("Indicador actualizado: " + total + " inspecciones registradas");
                } else if (tarjeta === "incidentes") {
                    const total = document.getElementById("kpiDashIncidentes")?.textContent || "5";
                    mostrarToast("Indicador actualizado: " + total + " incidentes abiertos");
                }
            });
        });

        document.querySelectorAll("[data-accion-tarjeta='filtrar-actividades']").forEach(function (boton) {
            boton.addEventListener("click", function () {
                const filtro = boton.getAttribute("data-filtro") || "";
                filtrarActividades(filtro);
            });
        });
    });
})();
