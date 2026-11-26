const buscador = document.getElementById("buscarInspeccion");
const filtroEstado = document.getElementById("filtroEstado");
const cuerpoTabla = document.getElementById("cuerpoTabla");
const textoRegistros = document.getElementById("textoRegistros");
const contadorRegistros = document.getElementById("contadorRegistros");
const totalMes = document.getElementById("totalMes");

function filtrarInspecciones() {
    const texto = buscador.value.toLowerCase().trim();
    const estado = filtroEstado.value;
    const filas = cuerpoTabla.querySelectorAll("tr");

    let visibles = 0;

    filas.forEach(function (fila) {
        const contenido = fila.textContent.toLowerCase();
        const elementoEstado = fila.querySelector(".estado");

        const coincideTexto = contenido.includes(texto);
        let coincideEstado = true;

        if (estado !== "todos") {
            coincideEstado = elementoEstado.classList.contains(estado);
        }

        if (coincideTexto && coincideEstado) {
            fila.style.display = "";
            visibles++;
        } else {
            fila.style.display = "none";
        }
    });

    textoRegistros.textContent = visibles + " inspecciones encontradas";
    contadorRegistros.textContent =
        "Mostrando " + visibles + " de " + filas.length + " registros";
}

buscador.addEventListener("input", filtrarInspecciones);
filtroEstado.addEventListener("change", filtrarInspecciones);

const botonGuardar = document.getElementById("guardarInspeccion");

botonGuardar.addEventListener("click", guardarInspeccion);

function guardarInspeccion() {
    const nombre = document.getElementById("nombreInspeccion").value.trim();
    const tipo = document.getElementById("tipoInspeccion").value;
    const fecha = document.getElementById("fechaInspeccion").value;
    const inspector = document.getElementById("inspectorInspeccion").value;
    const resultado = document.getElementById("resultadoInspeccion").value;

    if (
        nombre === "" ||
        tipo === "" ||
        fecha === "" ||
        inspector === "" ||
        resultado === ""
    ) {
        alert("Por favor completa todos los campos.");
        return;
    }

    const cantidad = cuerpoTabla.querySelectorAll("tr").length + 1;
    const id = "INS-" + String(cantidad).padStart(2, "0");
    const fechaObjeto = new Date(fecha + "T00:00:00");

    const fechaFormateada = fechaObjeto.toLocaleDateString(
        "es-ES",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

    let textoResultado;

    if (resultado === "cumple") {
        textoResultado = "Cumple";
    } else if (resultado === "no-cumple") {
        textoResultado = "No Cumple";
    } else if (resultado === "pendiente") {
        textoResultado = "Pendiente";
    } else {
        textoResultado = "En Proceso";
    }

    const fila = document.createElement("tr");

    fila.innerHTML = `
        <td class="id-inspeccion">
            ${id}
        </td>
        <td>
            <strong>
                ${nombre}
            </strong>
            <small>
                SST-Inspecciones
            </small>
        </td>
        <td>
            ${tipo}
        </td>
        <td>
            ${fechaFormateada}
        </td>
        <td>
            ${inspector}
        </td>
        <td>
            <span class="estado ${resultado}">
                <span></span>
                ${textoResultado}
            </span>
        </td>
    `;

    cuerpoTabla.appendChild(fila);

    const total = cuerpoTabla.querySelectorAll("tr").length;

    totalMes.textContent = total;
    textoRegistros.textContent = total + " inspecciones encontradas";
    contadorRegistros.textContent =
        "Mostrando 1 a " + total + " de " + total + " registros";

    document.getElementById("nombreInspeccion").value = "";
    document.getElementById("tipoInspeccion").value = "";
    document.getElementById("fechaInspeccion").value = "";
    document.getElementById("inspectorInspeccion").value = "";
    document.getElementById("resultadoInspeccion").value = "";

    const modal = bootstrap.Modal.getInstance(
        document.getElementById("modalNuevaInspeccion")
    );

    modal.hide();
}
