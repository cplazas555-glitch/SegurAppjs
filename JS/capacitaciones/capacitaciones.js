(function () {
    "use strict";

    const BASE_KPI_PROXIMAS = 7;
    const BASE_CAP_INICIALES = 6;
    const LIMITE_RESUMEN = 4;

    let capacitaciones = [];
    let mesActual = 4; // Mayo (0-indexed: 4 = Mayo)
    let anioActual = 2025;
    let fechaSeleccionada = null; // e.g., "2025-05-09" cuando el usuario hace clic en un día
    let mostrarTodas = false;
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

    function actualizarKpiProximas() {
        const kpi = document.getElementById("kpiProximasCap");
        if (!kpi) return;
        kpi.textContent = Math.max(0, BASE_KPI_PROXIMAS + (capacitaciones.length - BASE_CAP_INICIALES));
    }

    function construirFechaISO(anio, mesZero, dia) {
        return anio + "-" + String(mesZero + 1).padStart(2, "0") + "-" + String(dia).padStart(2, "0");
    }

    function renderizarCalendario() {
        const cuerpo = document.getElementById("cuerpoCalendario");
        const tituloMes = document.getElementById("tituloMesCalendario");
        if (!cuerpo || !tituloMes || !window.SegurAppCapacitaciones) return;

        tituloMes.textContent = window.SegurAppCapacitaciones.MESES_LARGOS[mesActual] + " " + anioActual;
        cuerpo.innerHTML = "";

        const primerDia = new Date(anioActual, mesActual, 1);
        const offsetLunes = (primerDia.getDay() + 6) % 7; // 0 = Lun .. 6 = Dom
        const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
        const diasMesAnterior = new Date(anioActual, mesActual, 0).getDate();

        const eventosPorFecha = {};
        capacitaciones.forEach(function (cap) {
            if (!eventosPorFecha[cap.fecha]) {
                eventosPorFecha[cap.fecha] = [];
            }
            eventosPorFecha[cap.fecha].push(cap);
        });

        const totalCeldas = Math.ceil((offsetLunes + diasEnMes) / 7) * 7;
        let filaActual = null;

        for (let i = 0; i < totalCeldas; i++) {
            if (i % 7 === 0) {
                filaActual = document.createElement("tr");
                cuerpo.appendChild(filaActual);
            }

            const td = document.createElement("td");

            if (i < offsetLunes) {
                const diaPrev = diasMesAnterior - offsetLunes + i + 1;
                td.className = "text-secondary";
                td.textContent = String(diaPrev);
            } else if (i >= offsetLunes + diasEnMes) {
                const diaSig = i - (offsetLunes + diasEnMes) + 1;
                td.className = "text-secondary";
                td.textContent = String(diaSig);
            } else {
                const dia = i - offsetLunes + 1;
                const iso = construirFechaISO(anioActual, mesActual, dia);
                const eventosDia = eventosPorFecha[iso] || [];
                const estaSeleccionado = fechaSeleccionada === iso || (!fechaSeleccionada && iso === "2025-05-09");

                td.className = "celda-dia-calendario" + (eventosDia.length > 0 ? " dia-con-evento" : "");
                td.setAttribute("data-fecha", iso);

                const spanNum = document.createElement("span");
                spanNum.className = estaSeleccionado ? "dia-seleccionado" : "dia-calendario";
                spanNum.textContent = String(dia);
                td.appendChild(spanNum);

                if (eventosDia.length > 0) {
                    const estilo = window.SegurAppCapacitaciones.obtenerEstiloCategoria(eventosDia[0].categoria);
                    const punto = document.createElement("span");
                    punto.className = "punto-calendario " + estilo.punto;
                    punto.title = eventosDia.map(function (e) { return e.nombre; }).join(", ");
                    td.appendChild(punto);
                }

                td.addEventListener("click", function () {
                    fechaSeleccionada = iso;
                    mostrarTodas = false;
                    renderizarCalendario();
                    renderizarLista();
                });
            }

            filaActual.appendChild(td);
        }
    }

    function renderizarLista() {
        const contenedor = document.getElementById("listaProximasCapacitaciones");
        const titulo = document.getElementById("tituloPanelCapacitaciones");
        const btnVerTodas = document.getElementById("btnVerTodasCapacitaciones");
        const btnLimpiarDia = document.getElementById("btnLimpiarFiltroDia");
        const buscador = document.getElementById("buscarCapacitaciones");
        if (!contenedor || !window.SegurAppCapacitaciones) return;

        const textoBusqueda = (buscador?.value || "").toLowerCase().trim();

        const ordenadas = capacitaciones.slice().sort(function (a, b) {
            return (a.fecha + " " + a.hora).localeCompare(b.fecha + " " + b.hora);
        });

        let filtradas = ordenadas.filter(function (cap) {
            if (!textoBusqueda) return true;
            return cap.nombre.toLowerCase().includes(textoBusqueda) ||
                cap.categoria.toLowerCase().includes(textoBusqueda) ||
                cap.responsable.toLowerCase().includes(textoBusqueda);
        });

        if (fechaSeleccionada && !mostrarTodas) {
            filtradas = filtradas.filter(function (cap) {
                return cap.fecha === fechaSeleccionada;
            });
            const infoSel = window.SegurAppCapacitaciones.formatearFecha(fechaSeleccionada);
            if (titulo) titulo.textContent = "Capacitaciones del " + infoSel.completa;
            if (btnLimpiarDia) btnLimpiarDia.classList.remove("d-none");
        } else if (mostrarTodas) {
            if (titulo) titulo.textContent = "Todas las capacitaciones (" + filtradas.length + ")";
            if (btnLimpiarDia) btnLimpiarDia.classList.add("d-none");
        } else {
            if (titulo) titulo.textContent = "Próximas capacitaciones";
            if (btnLimpiarDia) btnLimpiarDia.classList.add("d-none");
        }

        const visibles = (mostrarTodas || fechaSeleccionada || textoBusqueda)
            ? filtradas
            : filtradas.slice(0, LIMITE_RESUMEN);

        contenedor.innerHTML = "";

        if (visibles.length === 0) {
            const vacio = document.createElement("p");
            vacio.className = "text-secondary small text-center py-4 mb-0";
            vacio.textContent = fechaSeleccionada
                ? "No hay capacitaciones programadas para esta fecha."
                : "No se encontraron capacitaciones.";
            contenedor.appendChild(vacio);
        } else {
            visibles.forEach(function (cap) {
                const infoFecha = window.SegurAppCapacitaciones.formatearFecha(cap.fecha);
                const rango = window.SegurAppCapacitaciones.formatearRangoHorario(cap.hora, cap.duracion);
                const estilo = window.SegurAppCapacitaciones.obtenerEstiloCategoria(cap.categoria);

                const item = document.createElement("div");
                item.className = "d-flex align-items-center gap-2 py-2 border-bottom";
                item.innerHTML = `
                    <div class="caja-fecha">
                        <strong class="cap-dia"></strong>
                        <small class="cap-mes"></small>
                    </div>
                    <div class="flex-grow-1">
                        <strong class="d-block small cap-nombre"></strong>
                        <small class="text-secondary cap-horario"></small>
                    </div>
                    <span class="badge ${estilo.badgeLista} cap-cat"></span>
                `;
                item.querySelector(".cap-dia").textContent = infoFecha.dia;
                item.querySelector(".cap-mes").textContent = infoFecha.mesCorto;
                item.querySelector(".cap-nombre").textContent = cap.nombre;
                item.querySelector(".cap-horario").textContent = rango;
                item.querySelector(".cap-cat").textContent = cap.categoria;

                contenedor.appendChild(item);
            });
        }

        if (btnVerTodas) {
            btnVerTodas.innerHTML = mostrarTodas
                ? '<i class="bi bi-arrow-left"></i> Ver solo próximas'
                : 'Ver todas las capacitaciones <i class="bi bi-arrow-right"></i>';
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

    function manejarSubmitCapacitacion(evento) {
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

        const nueva = {
            id: "cap-" + Date.now(),
            nombre: nombre,
            descripcion: descripcion,
            categoria: categoria,
            responsable: responsable,
            fecha: fecha,
            hora: hora,
            duracion: duracion,
            estado: "Programada"
        };

        capacitaciones.unshift(nueva);
        window.SegurAppCapacitaciones.guardar(capacitaciones);

        const partesFecha = fecha.split("-");
        anioActual = parseInt(partesFecha[0], 10);
        mesActual = parseInt(partesFecha[1], 10) - 1;
        fechaSeleccionada = null;
        mostrarTodas = true;

        actualizarKpiProximas();
        renderizarCalendario();
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
        actualizarKpiProximas();
        renderizarCalendario();
        renderizarLista();

        const btnAnterior = document.getElementById("btnMesAnterior");
        const btnSiguiente = document.getElementById("btnMesSiguiente");
        const btnVerTodas = document.getElementById("btnVerTodasCapacitaciones");
        const btnLimpiarDia = document.getElementById("btnLimpiarFiltroDia");
        const buscador = document.getElementById("buscarCapacitaciones");
        const form = document.getElementById("formCapacitacion");

        if (btnAnterior) {
            btnAnterior.addEventListener("click", function () {
                mesActual--;
                if (mesActual < 0) {
                    mesActual = 11;
                    anioActual--;
                }
                renderizarCalendario();
            });
        }

        if (btnSiguiente) {
            btnSiguiente.addEventListener("click", function () {
                mesActual++;
                if (mesActual > 11) {
                    mesActual = 0;
                    anioActual++;
                }
                renderizarCalendario();
            });
        }

        if (btnVerTodas) {
            btnVerTodas.addEventListener("click", function () {
                mostrarTodas = !mostrarTodas;
                if (mostrarTodas) {
                    fechaSeleccionada = null;
                }
                renderizarCalendario();
                renderizarLista();
            });
        }

        if (btnLimpiarDia) {
            btnLimpiarDia.addEventListener("click", function () {
                fechaSeleccionada = null;
                mostrarTodas = false;
                renderizarCalendario();
                renderizarLista();
            });
        }

        if (buscador) {
            buscador.closest("form")?.addEventListener("submit", function (e) {
                e.preventDefault();
            });
            buscador.addEventListener("input", renderizarLista);
        }

        if (form) {
            form.addEventListener("submit", manejarSubmitCapacitacion);
        }

        const modalEl = document.getElementById("nuevaCapacitacion");
        if (modalEl) {
            modalEl.addEventListener("show.bs.modal", function () {
                limpiarErrores();
            });
        }
    });
})();
