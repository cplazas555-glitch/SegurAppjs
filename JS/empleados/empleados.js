(function () {
    "use strict";

    const CLAVE_STORAGE = "segurapp_empleados";
    const BASE_KPI_ACTIVOS = 28;
    const BASE_KPI_HOMBRES = 24;
    const BASE_KPI_MUJERES = 4;
    const BASE_TABLA_ACTIVOS = 4;
    const BASE_TABLA_HOMBRES = 2;
    const BASE_TABLA_MUJERES = 2;

    const EMPLEADOS_INICIALES = [
        {
            id: "emp-1",
            nombre: "Juan Pérez",
            correo: "juan.perez@segurapp.com",
            documento: "1.001.234.567",
            cargo: "Analista SST",
            area: "Operaciones",
            genero: "Masculino",
            estado: "Activo"
        },
        {
            id: "emp-2",
            nombre: "María López",
            correo: "maria.lopez@segurapp.com",
            documento: "1.023.456.789",
            cargo: "Coordinadora SST",
            area: "Administración",
            genero: "Femenino",
            estado: "Activo"
        },
        {
            id: "emp-3",
            nombre: "Carlos Rodríguez",
            correo: "carlos.rodriguez@segurapp.com",
            documento: "1.098.765.432",
            cargo: "Supervisor",
            area: "Operaciones",
            genero: "Masculino",
            estado: "Activo"
        },
        {
            id: "emp-4",
            nombre: "Ana Gómez",
            correo: "ana.gomez@segurapp.com",
            documento: "1.076.543.210",
            cargo: "Profesional SST",
            area: "Recursos Humanos",
            genero: "Femenino",
            estado: "Activo"
        }
    ];

    let empleados = [];
    let empleadoPendienteEstadoId = null;
    let empleadoPendienteEliminarId = null;
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

    function obtenerIniciales(nombre) {
        const partes = (nombre || "").trim().split(/\s+/).filter(Boolean);
        if (partes.length === 0) return "EM";
        if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
        return (partes[0][0] + partes[1][0]).toUpperCase();
    }

    function cargarEmpleados() {
        try {
            const guardado = localStorage.getItem(CLAVE_STORAGE);
            if (guardado) {
                const parsed = JSON.parse(guardado);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (error) {
            // Si falla localStorage, continúa con los datos base en memoria
        }
        return EMPLEADOS_INICIALES.map(function (item) {
            return Object.assign({}, item);
        });
    }

    function guardarEmpleadosStorage() {
        try {
            localStorage.setItem(CLAVE_STORAGE, JSON.stringify(empleados));
        } catch (error) {
            // Ignora errores de almacenamiento local
        }
    }

    function actualizarKpis() {
        const activos = empleados.filter(function (e) { return e.estado === "Activo"; }).length;
        const hombres = empleados.filter(function (e) { return e.genero === "Masculino"; }).length;
        const mujeres = empleados.filter(function (e) { return e.genero === "Femenino"; }).length;

        const elActivos = document.getElementById("kpiEmpleadosActivos");
        const elHombres = document.getElementById("kpiEmpleadosHombres");
        const elMujeres = document.getElementById("kpiEmpleadosMujeres");

        if (elActivos) elActivos.textContent = Math.max(0, BASE_KPI_ACTIVOS + (activos - BASE_TABLA_ACTIVOS));
        if (elHombres) elHombres.textContent = Math.max(0, BASE_KPI_HOMBRES + (hombres - BASE_TABLA_HOMBRES));
        if (elMujeres) elMujeres.textContent = Math.max(0, BASE_KPI_MUJERES + (mujeres - BASE_TABLA_MUJERES));
    }

    function obtenerEmpleadosFiltrados() {
        const texto = (document.getElementById("buscarEmpleadoTabla")?.value || "").toLowerCase().trim();
        const area = document.getElementById("filtroAreaEmpleado")?.value || "todas";
        const estado = document.getElementById("filtroEstadoEmpleado")?.value || "todos";

        return empleados.filter(function (emp) {
            const coincideTexto = !texto ||
                emp.nombre.toLowerCase().includes(texto) ||
                emp.correo.toLowerCase().includes(texto) ||
                emp.documento.toLowerCase().includes(texto) ||
                emp.cargo.toLowerCase().includes(texto) ||
                emp.area.toLowerCase().includes(texto);
            const coincideArea = area === "todas" || emp.area === area;
            const coincideEstado = estado === "todos" || emp.estado === estado;
            return coincideTexto && coincideArea && coincideEstado;
        });
    }

    function renderizarTabla() {
        const tbody = document.getElementById("cuerpoTablaEmpleados");
        const contadorHeader = document.getElementById("contadorEmpleadosHeader");
        const contadorPie = document.getElementById("contadorEmpleadosPie");
        if (!tbody) return;

        const filtrados = obtenerEmpleadosFiltrados();
        tbody.innerHTML = "";

        if (filtrados.length === 0) {
            const trVacio = document.createElement("tr");
            trVacio.innerHTML = '<td colspan="6" class="text-center text-muted py-4">No se encontraron empleados con los criterios seleccionados.</td>';
            tbody.appendChild(trVacio);
        } else {
            filtrados.forEach(function (emp) {
                const tr = document.createElement("tr");
                tr.setAttribute("data-empleado-id", emp.id);

                const esActivo = emp.estado === "Activo";
                const claseEstado = esActivo ? "text-bg-success" : "text-bg-secondary";
                const textoToggle = esActivo ? "Desactivar empleado" : "Activar empleado";
                const iconoToggle = esActivo ? "bi-person-slash" : "bi-person-check";

                tr.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="bg-secondary-subtle rounded-circle p-2 fw-bold emp-iniciales"></div>
                            <div>
                                <strong class="d-block emp-nombre"></strong>
                                <small class="text-muted emp-correo"></small>
                            </div>
                        </div>
                    </td>
                    <td class="emp-documento"></td>
                    <td class="emp-cargo"></td>
                    <td><span class="badge text-bg-primary emp-area"></span></td>
                    <td><span class="badge ${claseEstado} emp-estado"></span></td>
                    <td>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-light" type="button" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}' aria-expanded="false" aria-label="Acciones de empleado">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <button type="button" class="dropdown-item" data-accion="ver" data-id="${emp.id}">
                                        <i class="bi bi-eye me-2"></i>Ver empleado
                                    </button>
                                </li>
                                <li>
                                    <button type="button" class="dropdown-item" data-accion="editar" data-id="${emp.id}">
                                        <i class="bi bi-pencil me-2"></i>Editar empleado
                                    </button>
                                </li>
                                <li>
                                    <button type="button" class="dropdown-item" data-accion="toggle-estado" data-id="${emp.id}">
                                        <i class="bi ${iconoToggle} me-2"></i>${textoToggle}
                                    </button>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <button type="button" class="dropdown-item text-danger" data-accion="eliminar" data-id="${emp.id}">
                                        <i class="bi bi-trash me-2"></i>Eliminar empleado
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </td>
                `;

                tr.querySelector(".emp-iniciales").textContent = obtenerIniciales(emp.nombre);
                tr.querySelector(".emp-nombre").textContent = emp.nombre;
                tr.querySelector(".emp-correo").textContent = emp.correo;
                tr.querySelector(".emp-documento").textContent = emp.documento;
                tr.querySelector(".emp-cargo").textContent = emp.cargo;
                tr.querySelector(".emp-area").textContent = emp.area;
                tr.querySelector(".emp-estado").textContent = emp.estado;

                tbody.appendChild(tr);
            });
        }

        if (contadorHeader) {
            contadorHeader.textContent = filtrados.length + (filtrados.length === 1 ? " registro encontrado" : " registros encontrados");
        }
        if (contadorPie) {
            contadorPie.textContent = filtrados.length === 0
                ? "Mostrando 0 de " + empleados.length + " empleados"
                : "Mostrando 1 a " + filtrados.length + " de " + empleados.length + " empleados";
        }
    }

    function limpiarErroresFormulario() {
        const alerta = document.getElementById("alertaErrorEmpleado");
        if (alerta) {
            alerta.textContent = "";
            alerta.classList.add("d-none");
        }
        ["empNombre", "empCorreo", "empDocumento", "empCargo", "empArea", "empGenero", "empEstado"].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.classList.remove("is-invalid");
        });
    }

    function mostrarErrorFormulario(mensaje, idsInvalidos) {
        const alerta = document.getElementById("alertaErrorEmpleado");
        if (alerta) {
            alerta.textContent = mensaje;
            alerta.classList.remove("d-none");
        }
        (idsInvalidos || []).forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.classList.add("is-invalid");
        });
    }

    function abrirModalAgregar() {
        limpiarErroresFormulario();
        document.getElementById("tituloModalEmpleado").textContent = "Agregar empleado";
        document.getElementById("btnGuardarEmpleado").textContent = "Guardar empleado";
        document.getElementById("empleadoIdEdit").value = "";
        document.getElementById("formEmpleado").reset();
        document.getElementById("empEstado").value = "Activo";

        bootstrap.Modal.getOrCreateInstance(document.getElementById("modalFormEmpleado")).show();
    }

    function abrirModalEditar(id) {
        const emp = empleados.find(function (item) { return item.id === id; });
        if (!emp) return;

        limpiarErroresFormulario();
        document.getElementById("tituloModalEmpleado").textContent = "Editar empleado";
        document.getElementById("btnGuardarEmpleado").textContent = "Guardar cambios";
        document.getElementById("empleadoIdEdit").value = emp.id;
        document.getElementById("empNombre").value = emp.nombre;
        document.getElementById("empCorreo").value = emp.correo;
        document.getElementById("empDocumento").value = emp.documento;
        document.getElementById("empCargo").value = emp.cargo;
        document.getElementById("empArea").value = emp.area;
        document.getElementById("empGenero").value = emp.genero;
        document.getElementById("empEstado").value = emp.estado;

        bootstrap.Modal.getOrCreateInstance(document.getElementById("modalFormEmpleado")).show();
    }

    function abrirModalVer(id) {
        const emp = empleados.find(function (item) { return item.id === id; });
        if (!emp) return;

        document.getElementById("verEmpIniciales").textContent = obtenerIniciales(emp.nombre);
        document.getElementById("verEmpNombre").textContent = emp.nombre;
        document.getElementById("verEmpCorreo").textContent = emp.correo;
        document.getElementById("verEmpDocumento").textContent = emp.documento;
        document.getElementById("verEmpCargo").textContent = emp.cargo;
        document.getElementById("verEmpArea").textContent = emp.area;

        const badgeEstado = document.getElementById("verEmpEstado");
        badgeEstado.textContent = emp.estado;
        badgeEstado.className = "badge " + (emp.estado === "Activo" ? "text-bg-success" : "text-bg-secondary");

        bootstrap.Modal.getOrCreateInstance(document.getElementById("modalVerEmpleado")).show();
    }

    function abrirModalToggleEstado(id) {
        const emp = empleados.find(function (item) { return item.id === id; });
        if (!emp) return;

        empleadoPendienteEstadoId = emp.id;
        const accion = emp.estado === "Activo" ? "desactivar" : "activar";
        document.getElementById("tituloModalEstadoEmpleado").textContent =
            emp.estado === "Activo" ? "Desactivar empleado" : "Activar empleado";

        const mensaje = document.getElementById("mensajeModalEstadoEmpleado");
        mensaje.innerHTML = "¿Está seguro de que desea " + accion + " a <strong></strong>?";
        mensaje.querySelector("strong").textContent = emp.nombre;

        const btnConfirmar = document.getElementById("btnConfirmarEstadoEmpleado");
        btnConfirmar.textContent = emp.estado === "Activo" ? "Desactivar" : "Activar";
        btnConfirmar.className = emp.estado === "Activo" ? "btn btn-warning" : "btn btn-success";

        bootstrap.Modal.getOrCreateInstance(document.getElementById("modalConfirmarEstadoEmpleado")).show();
    }

    function abrirModalEliminar(id) {
        const emp = empleados.find(function (item) { return item.id === id; });
        if (!emp) return;

        empleadoPendienteEliminarId = emp.id;
        const mensaje = document.getElementById("mensajeModalEliminarEmpleado");
        mensaje.innerHTML = "¿Está seguro de que desea eliminar a <strong></strong>? Esta acción no se puede deshacer.";
        mensaje.querySelector("strong").textContent = emp.nombre;

        bootstrap.Modal.getOrCreateInstance(document.getElementById("modalEliminarEmpleado")).show();
    }

    function manejarSubmitEmpleado(evento) {
        evento.preventDefault();
        limpiarErroresFormulario();

        const idEdit = document.getElementById("empleadoIdEdit").value.trim();
        const nombre = document.getElementById("empNombre").value.trim();
        const correo = document.getElementById("empCorreo").value.trim();
        const documento = document.getElementById("empDocumento").value.trim();
        const cargo = document.getElementById("empCargo").value.trim();
        const area = document.getElementById("empArea").value;
        const genero = document.getElementById("empGenero").value;
        const estado = document.getElementById("empEstado").value;

        const camposVacios = [];
        if (!nombre) camposVacios.push("empNombre");
        if (!correo) camposVacios.push("empCorreo");
        if (!documento) camposVacios.push("empDocumento");
        if (!cargo) camposVacios.push("empCargo");
        if (!area) camposVacios.push("empArea");
        if (!genero) camposVacios.push("empGenero");
        if (!estado) camposVacios.push("empEstado");

        if (camposVacios.length > 0) {
            mostrarErrorFormulario("Por favor completa todos los campos obligatorios marcados con *.", camposVacios);
            return;
        }

        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(correo)) {
            mostrarErrorFormulario("Ingresa un correo electrónico válido.", ["empCorreo"]);
            return;
        }

        const documentoDuplicado = empleados.some(function (emp) {
            return emp.documento.toLowerCase() === documento.toLowerCase() && emp.id !== idEdit;
        });
        if (documentoDuplicado) {
            mostrarErrorFormulario("Ya existe un empleado registrado con ese número de documento.", ["empDocumento"]);
            return;
        }

        if (idEdit) {
            const indice = empleados.findIndex(function (emp) { return emp.id === idEdit; });
            if (indice === -1) {
                mostrarErrorFormulario("No se encontró el empleado que intentas editar.", []);
                return;
            }
            empleados[indice] = {
                id: idEdit,
                nombre: nombre,
                correo: correo,
                documento: documento,
                cargo: cargo,
                area: area,
                genero: genero,
                estado: estado
            };
            mostrarToast("Empleado actualizado: " + nombre);
        } else {
            empleados.unshift({
                id: "emp-" + Date.now(),
                nombre: nombre,
                correo: correo,
                documento: documento,
                cargo: cargo,
                area: area,
                genero: genero,
                estado: estado
            });
            mostrarToast("Empleado agregado: " + nombre);
        }

        guardarEmpleadosStorage();
        actualizarKpis();
        renderizarTabla();
        bootstrap.Modal.getInstance(document.getElementById("modalFormEmpleado"))?.hide();
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (window.SegurAppSesion) {
            window.SegurAppSesion.obtenerSesion();
        }

        empleados = cargarEmpleados();
        actualizarKpis();
        renderizarTabla();

        const btnAgregar = document.getElementById("btnAgregarEmpleado");
        if (btnAgregar) {
            btnAgregar.addEventListener("click", abrirModalAgregar);
        }

        const formEmpleado = document.getElementById("formEmpleado");
        if (formEmpleado) {
            formEmpleado.addEventListener("submit", manejarSubmitEmpleado);
        }

        const buscadorNavbar = document.getElementById("buscadorNavbarEmpleado");
        const buscadorTabla = document.getElementById("buscarEmpleadoTabla");
        const filtroArea = document.getElementById("filtroAreaEmpleado");
        const filtroEstado = document.getElementById("filtroEstadoEmpleado");
        const formNavbar = document.getElementById("formBuscarNavbar");

        if (formNavbar) {
            formNavbar.addEventListener("submit", function (e) {
                e.preventDefault();
            });
        }
        if (buscadorNavbar && buscadorTabla) {
            buscadorNavbar.addEventListener("input", function () {
                buscadorTabla.value = buscadorNavbar.value;
                renderizarTabla();
            });
            buscadorTabla.addEventListener("input", function () {
                buscadorNavbar.value = buscadorTabla.value;
                renderizarTabla();
            });
        }
        if (filtroArea) filtroArea.addEventListener("change", renderizarTabla);
        if (filtroEstado) filtroEstado.addEventListener("change", renderizarTabla);

        const tbody = document.getElementById("cuerpoTablaEmpleados");
        if (tbody) {
            tbody.addEventListener("click", function (evento) {
                const boton = evento.target.closest("[data-accion]");
                if (!boton) return;

                const accion = boton.getAttribute("data-accion");
                const id = boton.getAttribute("data-id");

                if (accion === "ver") abrirModalVer(id);
                else if (accion === "editar") abrirModalEditar(id);
                else if (accion === "toggle-estado") abrirModalToggleEstado(id);
                else if (accion === "eliminar") abrirModalEliminar(id);
            });
        }

        const btnConfirmarEstado = document.getElementById("btnConfirmarEstadoEmpleado");
        if (btnConfirmarEstado) {
            btnConfirmarEstado.addEventListener("click", function () {
                if (!empleadoPendienteEstadoId) return;
                const emp = empleados.find(function (item) { return item.id === empleadoPendienteEstadoId; });
                if (emp) {
                    emp.estado = emp.estado === "Activo" ? "Inactivo" : "Activo";
                    guardarEmpleadosStorage();
                    actualizarKpis();
                    renderizarTabla();
                    mostrarToast(emp.nombre + " marcado como " + emp.estado);
                }
                empleadoPendienteEstadoId = null;
                bootstrap.Modal.getInstance(document.getElementById("modalConfirmarEstadoEmpleado"))?.hide();
            });
        }

        const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminarEmpleado");
        if (btnConfirmarEliminar) {
            btnConfirmarEliminar.addEventListener("click", function () {
                if (!empleadoPendienteEliminarId) return;
                const emp = empleados.find(function (item) { return item.id === empleadoPendienteEliminarId; });
                empleados = empleados.filter(function (item) { return item.id !== empleadoPendienteEliminarId; });
                guardarEmpleadosStorage();
                actualizarKpis();
                renderizarTabla();
                empleadoPendienteEliminarId = null;
                bootstrap.Modal.getInstance(document.getElementById("modalEliminarEmpleado"))?.hide();
                if (emp) {
                    mostrarToast("Empleado eliminado: " + emp.nombre);
                }
            });
        }

        if (window.location.hash === "#agregar") {
            abrirModalAgregar();
        }
    });
})();
