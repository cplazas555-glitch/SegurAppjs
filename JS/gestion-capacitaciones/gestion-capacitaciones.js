(function () {
    "use strict";

    let capacitaciones = [];
    let capPendienteEliminarId = null;
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

    function obtenerClaseEstado(estado) {
        if (estado === "Completada") return "estado-completada";
        if (estado === "En curso") return "estado-en-curso";
        if (estado === "Cancelada") return "estado-cancelada";
        return "estado-programada";
    }

    function obtenerFiltradas() {
        const texto = (document.getElementById("buscarCapGestion")?.value || "").toLowerCase().trim();
        const categoria = document.getElementById("filtroCatGestion")?.value || "Todos";
        const estado = document.getElementById("filtroEstadoGestion")?.value || "Todos";

        return capacitaciones.filter(function (cap) {
            const coincideTexto = !texto ||
                cap.nombre.toLowerCase().includes(texto) ||
                cap.descripcion.toLowerCase().includes(texto) ||
                cap.responsable.toLowerCase().includes(texto);
            const coincideCat = categoria === "Todos" || cap.categoria === categoria;
            const coincideEstado = estado === "Todos" || cap.estado === estado;
            return coincideTexto && coincideCat && coincideEstado;
        });
    }

    function renderizarTabla() {
        const tbody = document.getElementById("cuerpoTablaCapGestion");
        const contador = document.getElementById("contadorCapGestion");
        if (!tbody || !window.SegurAppCapacitaciones) return;

        const filtradas = obtenerFiltradas();
        tbody.innerHTML = "";

        if (filtradas.length === 0) {
            const trVacio = document.createElement("tr");
            trVacio.innerHTML = '<td colspan="7" class="text-center text-secondary py-4">No se encontraron capacitaciones con los filtros actuales.</td>';
            tbody.appendChild(trVacio);
        } else {
            filtradas.forEach(function (cap) {
                const estiloCat = window.SegurAppCapacitaciones.obtenerEstiloCategoria(cap.categoria);
                const infoFecha = window.SegurAppCapacitaciones.formatearFecha(cap.fecha);
                const claseEstado = obtenerClaseEstado(cap.estado);

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="icono-tabla ${estiloCat.iconoFondo}">
                                <i class="bi ${estiloCat.icono}"></i>
                            </div>
                            <div>
                                <strong class="d-block cap-nombre"></strong>
                                <small class="text-secondary cap-desc"></small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="etiqueta-categoria ${estiloCat.etiquetaGestion} cap-cat"></span>
                    </td>
                    <td class="cap-fecha"></td>
                    <td class="cap-duracion"></td>
                    <td class="cap-responsable"></td>
                    <td>
                        <span class="estado ${claseEstado} cap-estado"></span>
                    </td>
                    <td>
                        <div class="dropdown">
                            <button class="btn btn-sm boton-accion" type="button" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}' aria-expanded="false">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <button type="button" class="dropdown-item" data-accion="ver" data-id="${cap.id}">
                                        <i class="bi bi-eye me-2"></i>Ver
                                    </button>
                                </li>
                                <li>
                                    <button type="button" class="dropdown-item" data-accion="editar" data-id="${cap.id}">
                                        <i class="bi bi-pencil me-2"></i>Editar
                                    </button>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <button type="button" class="dropdown-item text-danger" data-accion="eliminar" data-id="${cap.id}">
                                        <i class="bi bi-trash me-2"></i>Eliminar
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </td>
                `;

                tr.querySelector(".cap-nombre").textContent = cap.nombre;
                tr.querySelector(".cap-desc").textContent = cap.descripcion;
                tr.querySelector(".cap-cat").textContent = cap.categoria;
                tr.querySelector(".cap-fecha").textContent = infoFecha.completa;
                tr.querySelector(".cap-duracion").textContent = cap.duracion;
                tr.querySelector(".cap-responsable").textContent = cap.responsable;
                tr.querySelector(".cap-estado").textContent = cap.estado;

                tbody.appendChild(tr);
            });
        }

        if (contador) {
            contador.textContent = filtradas.length + (filtradas.length === 1 ? " capacitación registrada" : " capacitaciones registradas");
        }
    }

    function limpiarErrores() {
        const alerta = document.getElementById("alertaErrorCap");
        if (alerta) {
            alerta.textContent = "";
            alerta.classList.add("d-none");
        }
        ["capNombre", "capDescripcion", "capCategoria", "capResponsable", "capEstado", "capFecha", "capHora", "capDuracion"].forEach(function (id) {
            document.getElementById(id)?.classList.remove("is-invalid");
        });
    }

    function mostrarError(mensaje, ids) {
        const alerta = document.getElementById("alertaErrorCap");
        if (alerta) {
            alerta.textContent = mensaje;
            alerta.classList.remove("d-none");
        }
        (ids || []).forEach(function (id) {
            document.getElementById(id)?.classList.add("is-invalid");
        });
    }

    function abrirModalNueva() {
        limpiarErrores();
        document.getElementById("tituloModalCap").textContent = "Nueva Capacitación";
        document.getElementById("btnGuardarCap").textContent = "Guardar capacitación";
        document.getElementById("capIdEdit").value = "";
        document.getElementById("formCapacitacion").reset();
        document.getElementById("capEstado").value = "Programada";
    }

    function abrirModalVer(id) {
        const cap = capacitaciones.find(function (c) { return c.id === id; });
        if (!cap) return;

        const infoFecha = window.SegurAppCapacitaciones.formatearFecha(cap.fecha);
        const rango = window.SegurAppCapacitaciones.formatearRangoHorario(cap.hora, cap.duracion);

        document.getElementById("verCapTitulo").textContent = cap.nombre;
        document.getElementById("verCapDescripcion").textContent = cap.descripcion;
        document.getElementById("verCapCategoria").textContent = cap.categoria;
        document.getElementById("verCapEstado").textContent = cap.estado;
        document.getElementById("verCapFecha").textContent = infoFecha.completa + " (" + rango + ")";
        document.getElementById("verCapDuracion").textContent = cap.duracion;
        document.getElementById("verCapResponsable").textContent = cap.responsable;

        bootstrap.Modal.getOrCreateInstance(document.getElementById("modalVerCap")).show();
    }

    function abrirModalEditar(id) {
        const cap = capacitaciones.find(function (c) { return c.id === id; });
        if (!cap) return;

        limpiarErrores();
        document.getElementById("tituloModalCap").textContent = "Editar Capacitación";
        document.getElementById("btnGuardarCap").textContent = "Guardar cambios";
        document.getElementById("capIdEdit").value = cap.id;
        document.getElementById("capNombre").value = cap.nombre;
        document.getElementById("capDescripcion").value = cap.descripcion;
        document.getElementById("capCategoria").value = cap.categoria;
        document.getElementById("capResponsable").value = cap.responsable;
        document.getElementById("capEstado").value = cap.estado;
        document.getElementById("capFecha").value = cap.fecha;
        document.getElementById("capHora").value = cap.hora;
        document.getElementById("capDuracion").value = cap.duracion;

        bootstrap.Modal.getOrCreateInstance(document.getElementById("modalVerCap")).hide();
        bootstrap.Modal.getOrCreateInstance(document.getElementById("nuevaCapacitacion")).show();
    }

    function abrirModalEliminar(id) {
        const cap = capacitaciones.find(function (c) { return c.id === id; });
        if (!cap) return;

        capPendienteEliminarId = cap.id;
        const msg = document.getElementById("mensajeEliminarCap");
        msg.innerHTML = "¿Está seguro de que desea eliminar la capacitación <strong></strong>?";
        msg.querySelector("strong").textContent = cap.nombre;

        bootstrap.Modal.getOrCreateInstance(document.getElementById("modalEliminarCap")).show();
    }

    function manejarGuardar(evento) {
        evento.preventDefault();
        limpiarErrores();

        const idEdit = document.getElementById("capIdEdit").value.trim();
        const nombre = document.getElementById("capNombre").value.trim();
        const descripcion = document.getElementById("capDescripcion").value.trim();
        const categoria = document.getElementById("capCategoria").value;
        const responsable = document.getElementById("capResponsable").value;
        const estado = document.getElementById("capEstado").value;
        const fecha = document.getElementById("capFecha").value;
        const hora = document.getElementById("capHora").value;
        const duracion = document.getElementById("capDuracion").value;

        const invalidos = [];
        if (!nombre) invalidos.push("capNombre");
        if (!descripcion) invalidos.push("capDescripcion");
        if (!categoria) invalidos.push("capCategoria");
        if (!responsable) invalidos.push("capResponsable");
        if (!estado) invalidos.push("capEstado");
        if (!fecha) invalidos.push("capFecha");
        if (!hora) invalidos.push("capHora");
        if (!duracion) invalidos.push("capDuracion");

        if (invalidos.length > 0) {
            mostrarError("Por favor completa todos los campos obligatorios para guardar la capacitación.", invalidos);
            return;
        }

        const registro = {
            id: idEdit || "cap-" + Date.now(),
            nombre: nombre,
            descripcion: descripcion,
            categoria: categoria,
            responsable: responsable,
            fecha: fecha,
            hora: hora,
            duracion: duracion,
            estado: estado
        };

        if (idEdit) {
            const idx = capacitaciones.findIndex(function (c) { return c.id === idEdit; });
            if (idx !== -1) {
                capacitaciones[idx] = registro;
            }
            mostrarToast("Capacitación actualizada: " + nombre);
        } else {
            capacitaciones.unshift(registro);
            mostrarToast("Capacitación agregada: " + nombre);
        }

        window.SegurAppCapacitaciones.guardar(capacitaciones);
        renderizarTabla();
        bootstrap.Modal.getInstance(document.getElementById("nuevaCapacitacion"))?.hide();
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (window.SegurAppSesion) {
            window.SegurAppSesion.obtenerSesion();
        }
        if (!window.SegurAppCapacitaciones) return;

        capacitaciones = window.SegurAppCapacitaciones.cargar();
        renderizarTabla();

        const modalEl = document.getElementById("nuevaCapacitacion");
        if (modalEl) {
            modalEl.addEventListener("show.bs.modal", function (evento) {
                if (evento.relatedTarget) {
                    abrirModalNueva();
                }
            });
        }

        const form = document.getElementById("formCapacitacion");
        if (form) {
            form.addEventListener("submit", manejarGuardar);
        }

        const buscador = document.getElementById("buscarCapGestion");
        const filtroCat = document.getElementById("filtroCatGestion");
        const filtroEst = document.getElementById("filtroEstadoGestion");
        const btnReset = document.getElementById("btnResetFiltrosCap");

        if (buscador) buscador.addEventListener("input", renderizarTabla);
        if (filtroCat) filtroCat.addEventListener("change", renderizarTabla);
        if (filtroEst) filtroEst.addEventListener("change", renderizarTabla);
        if (btnReset) {
            btnReset.addEventListener("click", function () {
                if (buscador) buscador.value = "";
                if (filtroCat) filtroCat.value = "Todos";
                if (filtroEst) filtroEst.value = "Todos";
                renderizarTabla();
            });
        }

        const tbody = document.getElementById("cuerpoTablaCapGestion");
        if (tbody) {
            tbody.addEventListener("click", function (evento) {
                const boton = evento.target.closest("[data-accion]");
                if (!boton) return;

                const accion = boton.getAttribute("data-accion");
                const id = boton.getAttribute("data-id");

                if (accion === "ver") abrirModalVer(id);
                else if (accion === "editar") abrirModalEditar(id);
                else if (accion === "eliminar") abrirModalEliminar(id);
            });
        }

        const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminarCap");
        if (btnConfirmarEliminar) {
            btnConfirmarEliminar.addEventListener("click", function () {
                if (!capPendienteEliminarId) return;
                const cap = capacitaciones.find(function (c) { return c.id === capPendienteEliminarId; });
                capacitaciones = capacitaciones.filter(function (c) { return c.id !== capPendienteEliminarId; });
                window.SegurAppCapacitaciones.guardar(capacitaciones);
                renderizarTabla();
                capPendienteEliminarId = null;
                bootstrap.Modal.getInstance(document.getElementById("modalEliminarCap"))?.hide();
                if (cap) {
                    mostrarToast("Capacitación eliminada: " + cap.nombre);
                }
            });
        }

        if (window.location.hash === "#nueva" && modalEl) {
            abrirModalNueva();
            bootstrap.Modal.getOrCreateInstance(modalEl).show();
        }
    });
})();
