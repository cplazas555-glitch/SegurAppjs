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

// ==================== PLANTILLAS DE DOCUMENTOS ====================

const pillFormato = {
    "PDF": "pill-rojo",
    "DOCX": "pill-azul",
    "CSV": "pill-verde",
    "TXT": "pill-morado"
};

const plantillas = [
    {
        id: "tpl-extintores",
        nombre: "Acta de Inspección de Extintores",
        descripcion: "Formato estándar mensual",
        formato: "PDF",
        categoria: "Inspecciones",
        fecha: "11/05/2026",
        hora: "08:30 a. m.",
        contenido: [
            "SISTEMA DE GESTION DE SEGURIDAD Y SALUD EN EL TRABAJO (SG-SST)",
            "ACTA DE INSPECCION MENSUAL DE EXTINTORES",
            "Empresa: SegurApp | Area: ______________________ | Fecha: ____/____/______",
            "Inspector responsable: _________________________",
            "",
            "1. Codigo del extintor: ________   Ubicacion: ________________________",
            "2. Tipo de agente (ABC / CO2 / Agua): ________   Capacidad: ________",
            "3. Manometro en zona verde: [ ] Si  [ ] No",
            "4. Sello de seguridad y pasador intactos: [ ] Si  [ ] No",
            "5. Manguera y boquilla sin obstrucciones: [ ] Si  [ ] No",
            "6. Senalizacion visible y acceso despejado: [ ] Si  [ ] No",
            "7. Fecha proxima recarga: ____/____/______",
            "",
            "Observaciones y acciones correctivas:",
            "____________________________________________________________________",
            "Firma Inspector: ___________________   Vo.Bo. SST: ___________________"
        ].join("\n")
    },
    {
        id: "tpl-epp",
        nombre: "Formato de Entrega de EPP",
        descripcion: "Control de dotación por empleado",
        formato: "DOCX",
        categoria: "EPP",
        fecha: "09/05/2026",
        hora: "02:15 p. m.",
        contenido: [
            "SEGURAPP SG-SST - FORMATO DE ENTREGA DE ELEMENTOS DE PROTECCION PERSONAL",
            "Fecha de entrega: ____/____/______",
            "Empleado: _____________________________  Documento: ___________________",
            "Cargo / Area: ________________________________________________________",
            "",
            "Detalle de elementos entregados:",
            "- Elemento 1: _________________________  Cantidad: ____  Estado: Nuevo",
            "- Elemento 2: _________________________  Cantidad: ____  Estado: Nuevo",
            "- Elemento 3: _________________________  Cantidad: ____  Estado: Nuevo",
            "",
            "Compromiso del trabajador:",
            "Declaro haber recibido los EPP descritos en buen estado y me comprometo a usarlos y conservarlos adecuadamente durante la jornada laboral.",
            "",
            "Firma del trabajador: _____________________   Entregado por: _____________________"
        ].join("\n")
    },
    {
        id: "tpl-incidentes",
        nombre: "Reporte de Investigación de Incidentes",
        descripcion: "Registro de causas y acciones",
        formato: "PDF",
        categoria: "Incidentes",
        fecha: "04/05/2026",
        hora: "11:10 a. m.",
        contenido: [
            "SEGURAPP SG-SST - REPORTE DE INVESTIGACION DE INCIDENTES Y ACCIDENTES",
            "Codigo del caso: __________   Tipo: [ ] Incidente   [ ] Accidente",
            "Fecha del evento: ____/____/______   Hora: ______   Area: ________________",
            "Trabajador involucrado: _______________________________________________",
            "",
            "1. Descripcion detallada de los hechos:",
            "____________________________________________________________________",
            "2. Causas inmediatas (actos y condiciones inseguras):",
            "____________________________________________________________________",
            "3. Causas basicas (factores personales y del trabajo):",
            "____________________________________________________________________",
            "4. Plan de accion preventivo y correctivo:",
            "Accion: _______________________  Responsable: __________  Fecha: ______",
            "",
            "Investigado por: _____________________   Aprobado por: _____________________"
        ].join("\n")
    },
    {
        id: "tpl-matriz-riesgos",
        nombre: "Matriz de Identificación de Peligros y Riesgos",
        descripcion: "Evaluación de peligros por área (IPVR)",
        formato: "CSV",
        categoria: "Riesgos",
        fecha: "02/05/2026",
        hora: "09:00 a. m.",
        contenido: [
            "Area,Proceso,Peligro Identificado,Tipo de Riesgo,Nivel (Alto/Medio/Bajo),Controles Existentes,Medida de Intervencion,Responsable",
            "Produccion,Operacion de maquinaria,Caidas al mismo nivel,Seguridad,Alto,Senalizacion basica,Piso antideslizante y orden diario,Coordinador SST",
            "Almacen,Carga y descarga,Manipulacion manual de cargas,Ergonomico,Medio,Faja y capacitacion,Ayudas mecanicas y pausas activas,Supervisor de Almacen"
        ].join("\n")
    },
    {
        id: "tpl-capacitacion",
        nombre: "Lista de Asistencia a Capacitación SST",
        descripcion: "Control de participantes y firmas",
        formato: "TXT",
        categoria: "Capacitaciones",
        fecha: "28/04/2026",
        hora: "04:45 p. m.",
        contenido: [
            "======================================================================",
            "SEGURAPP SG-SST - CONTROL DE ASISTENCIA A CAPACITACION",
            "======================================================================",
            "Tema: ________________________________________________________________",
            "Facilitador: _________________________  Fecha: ____/____/______",
            "Duracion (horas): ____                  Area: ________________________",
            "",
            "No. | Nombre Completo               | Documento       | Area         | Firma",
            "----+-------------------------------+-----------------+--------------+----------",
            "01  |                               |                 |              |",
            "02  |                               |                 |              |",
            "03  |                               |                 |              |",
            "04  |                               |                 |              |",
            "05  |                               |                 |              |",
            "",
            "Observaciones: _______________________________________________________"
        ].join("\n")
    }
];

function sanitizarNombreArchivo(nombre) {
    return (nombre || "plantilla")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "plantilla";
}

function textoABytesWinAnsi(texto) {
    const limpio = String(texto || "").replace(/\r\n/g, "\n");
    const bytes = [];
    for (let i = 0; i < limpio.length; i++) {
        const code = limpio.charCodeAt(i);
        bytes.push(code <= 255 ? code : 63);
    }
    return bytes;
}

function envolverLineas(texto, maxChars) {
    const resultado = [];
    String(texto || "").replace(/\r\n/g, "\n").split("\n").forEach((linea) => {
        if (linea.length <= maxChars) {
            resultado.push(linea);
            return;
        }
        const palabras = linea.split(" ");
        let actual = "";
        palabras.forEach((palabra) => {
            if (!actual) {
                actual = palabra;
            } else if (actual.length + 1 + palabra.length <= maxChars) {
                actual += " " + palabra;
            } else {
                resultado.push(actual);
                actual = palabra;
            }
        });
        if (actual) resultado.push(actual);
    });
    return resultado;
}

function escaparPdfBytes(texto) {
    const bytes = textoABytesWinAnsi(texto);
    let out = "";
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if (b === 40 || b === 41 || b === 92) {
            out += "\\" + String.fromCharCode(b);
        } else {
            out += String.fromCharCode(b);
        }
    }
    return out;
}

function generarPdfBlob(plantilla) {
    const cabecera = [
        plantilla.nombre,
        `Categoria: ${plantilla.categoria} | Actualizacion: ${plantilla.fecha}`,
        plantilla.descripcion,
        "--------------------------------------------------------------------------------",
        ""
    ];
    const lineas = cabecera.concat(envolverLineas(plantilla.contenido, 82)).slice(0, 46);

    const ops = ["BT", "/F1 10 Tf", "50 760 Td", "14 TL"];
    lineas.forEach((linea, idx) => {
        const escaped = escaparPdfBytes(linea);
        if (idx === 0) ops.push(`(${escaped}) Tj`);
        else ops.push(`T* (${escaped}) Tj`);
    });
    ops.push("ET");
    const streamData = ops.join("\n");

    const objetos = [
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
        "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n",
        `5 0 obj\n<< /Length ${streamData.length} >>\nstream\n${streamData}\nendstream\nendobj\n`
    ];

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objetos.forEach((obj) => {
        offsets.push(pdf.length);
        pdf += obj;
    });

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objetos.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    for (let i = 1; i <= objetos.length; i++) {
        pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    }
    pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i++) {
        bytes[i] = pdf.charCodeAt(i) & 0xff;
    }
    return new Blob([bytes], { type: "application/pdf" });
}

function escaparXml(texto) {
    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

const crcTabla = (() => {
    const tabla = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        tabla[n] = c >>> 0;
    }
    return tabla;
})();

function crc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
        crc = crcTabla[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function crearZipStore(archivos) {
    const encoder = new TextEncoder();
    const partesLocales = [];
    const partesCentrales = [];
    let offset = 0;

    archivos.forEach((archivo) => {
        const nombreBytes = encoder.encode(archivo.nombre);
        const datosBytes = encoder.encode(archivo.contenido);
        const crc = crc32(datosBytes);

        const localHeader = new Uint8Array(30 + nombreBytes.length);
        const lv = new DataView(localHeader.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint16(8, 0, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, datosBytes.length, true);
        lv.setUint32(22, datosBytes.length, true);
        lv.setUint16(26, nombreBytes.length, true);
        localHeader.set(nombreBytes, 30);

        partesLocales.push(localHeader, datosBytes);

        const centralHeader = new Uint8Array(46 + nombreBytes.length);
        const cv = new DataView(centralHeader.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(10, 0, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, datosBytes.length, true);
        cv.setUint32(24, datosBytes.length, true);
        cv.setUint16(28, nombreBytes.length, true);
        cv.setUint32(42, offset, true);
        centralHeader.set(nombreBytes, 46);

        partesCentrales.push(centralHeader);
        offset += localHeader.length + datosBytes.length;
    });

    const tamCentral = partesCentrales.reduce((acc, p) => acc + p.length, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, archivos.length, true);
    ev.setUint16(10, archivos.length, true);
    ev.setUint32(12, tamCentral, true);
    ev.setUint32(16, offset, true);

    return new Blob([...partesLocales, ...partesCentrales, eocd], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
}

function generarDocxBlob(plantilla) {
    const parrafos = [
        plantilla.nombre,
        `Categoría: ${plantilla.categoria} | Actualización: ${plantilla.fecha}`,
        plantilla.descripcion,
        ""
    ].concat(String(plantilla.contenido || "").replace(/\r\n/g, "\n").split("\n"));

    const xmlParrafos = parrafos
        .map((linea) => `<w:p><w:r><w:t xml:space="preserve">${escaparXml(linea)}</w:t></w:r></w:p>`)
        .join("");

    const documentXml =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
        `<w:body>${xmlParrafos}<w:sectPr/></w:body></w:document>`;

    const contentTypesXml =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
        '</Types>';

    const relsXml =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
        '</Relationships>';

    return crearZipStore([
        { nombre: "[Content_Types].xml", contenido: contentTypesXml },
        { nombre: "_rels/.rels", contenido: relsXml },
        { nombre: "word/document.xml", contenido: documentXml }
    ]);
}

function descargarPlantilla(id) {
    const plantilla = plantillas.find((p) => p.id === id);
    if (!plantilla) return;

    const formato = plantilla.formato.toUpperCase();
    let blob;
    let extension;

    if (formato === "PDF") {
        blob = generarPdfBlob(plantilla);
        extension = "pdf";
    } else if (formato === "DOCX") {
        blob = generarDocxBlob(plantilla);
        extension = "docx";
    } else if (formato === "CSV") {
        blob = new Blob(["\uFEFF" + plantilla.contenido + "\n"], { type: "text/csv;charset=utf-8;" });
        extension = "csv";
    } else {
        const texto = `${plantilla.nombre}\nCategoría: ${plantilla.categoria}\nDescripción: ${plantilla.descripcion}\nActualización: ${plantilla.fecha}\n\n${plantilla.contenido}\n`;
        blob = new Blob([texto], { type: "text/plain;charset=utf-8;" });
        extension = "txt";
    }

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = sanitizarNombreArchivo(plantilla.nombre) + "." + extension;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);

    mostrarToast("Descargando plantilla " + formato + ": " + plantilla.nombre);
}

function renderizarPlantillas() {
    const tbody = document.getElementById("tablaPlantillas");
    if (!tbody) return;
    tbody.innerHTML = "";

    plantillas.forEach((tpl) => {
        const tr = document.createElement("tr");
        const clasePill = pillFormato[tpl.formato] || "pill-azul";

        tr.innerHTML = `
            <td>
                <div class="celda-principal">
                    <span class="etiqueta-pill ${clasePill} tpl-fmt"></span>
                    <div class="textos-fila">
                        <strong class="tpl-nombre"></strong>
                        <small class="tpl-desc"></small>
                    </div>
                </div>
            </td>
            <td class="tpl-fecha"></td>
            <td class="text-end">
                <button type="button" class="boton-icono" title="Descargar plantilla">
                    <i class="bi bi-download"></i>
                </button>
            </td>
        `;

        tr.querySelector(".tpl-fmt").textContent = tpl.formato;
        tr.querySelector(".tpl-nombre").textContent = tpl.nombre;
        tr.querySelector(".tpl-desc").textContent = tpl.descripcion;

        const tdFecha = tr.querySelector(".tpl-fecha");
        tdFecha.textContent = tpl.fecha;
        tdFecha.appendChild(document.createElement("br"));
        const smallHora = document.createElement("small");
        smallHora.textContent = tpl.hora;
        tdFecha.appendChild(smallHora);

        tr.querySelector(".boton-icono").addEventListener("click", () => descargarPlantilla(tpl.id));
        tbody.appendChild(tr);
    });
}

function limpiarErroresPlantilla() {
    const alerta = document.getElementById("alertaErrorPlantilla");
    if (alerta) {
        alerta.textContent = "";
        alerta.classList.add("d-none");
    }
    ["nombrePlantilla", "descripcionPlantilla", "formatoPlantilla", "categoriaPlantilla", "contenidoPlantilla"].forEach((id) => {
        document.getElementById(id)?.classList.remove("is-invalid");
    });
}

function mostrarErrorPlantilla(mensaje, idsInvalidos) {
    const alerta = document.getElementById("alertaErrorPlantilla");
    if (alerta) {
        alerta.textContent = mensaje;
        alerta.classList.remove("d-none");
    }
    (idsInvalidos || []).forEach((id) => {
        document.getElementById(id)?.classList.add("is-invalid");
    });
}

const modalNuevaPlantillaEl = document.getElementById("modalNuevaPlantilla");
if (modalNuevaPlantillaEl) {
    modalNuevaPlantillaEl.addEventListener("show.bs.modal", limpiarErroresPlantilla);
}

const btnGuardarPlantilla = document.getElementById("guardarPlantilla");
if (btnGuardarPlantilla) {
    btnGuardarPlantilla.addEventListener("click", () => {
        limpiarErroresPlantilla();

        const nombre = document.getElementById("nombrePlantilla").value.trim();
        const descripcion = document.getElementById("descripcionPlantilla").value.trim();
        const formato = document.getElementById("formatoPlantilla").value;
        const categoria = document.getElementById("categoriaPlantilla").value;
        const contenido = document.getElementById("contenidoPlantilla").value.trim();

        const invalidos = [];
        if (!nombre) invalidos.push("nombrePlantilla");
        if (!descripcion) invalidos.push("descripcionPlantilla");
        if (!formato) invalidos.push("formatoPlantilla");
        if (!categoria) invalidos.push("categoriaPlantilla");
        if (!contenido) invalidos.push("contenidoPlantilla");

        if (invalidos.length > 0) {
            mostrarErrorPlantilla("Por favor completa todos los campos obligatorios marcados con *.", invalidos);
            return;
        }

        if (nombre.length < 3) {
            mostrarErrorPlantilla("El nombre de la plantilla debe tener al menos 3 caracteres.", ["nombrePlantilla"]);
            return;
        }

        if (contenido.length < 10) {
            mostrarErrorPlantilla("El contenido de la plantilla debe tener al menos 10 caracteres.", ["contenidoPlantilla"]);
            return;
        }

        const ahora = new Date();
        const fecha = ahora.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
        const hora = ahora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

        plantillas.unshift({
            id: "tpl-" + Date.now(),
            nombre,
            descripcion,
            formato,
            categoria,
            fecha,
            hora,
            contenido
        });

        renderizarPlantillas();
        registrarActividad("Se creó una nueva plantilla", `${nombre} (${formato})`, "kpi-morado", "bi-file-earmark-text");

        document.getElementById("nombrePlantilla").value = "";
        document.getElementById("descripcionPlantilla").value = "";
        document.getElementById("contenidoPlantilla").value = "";
        document.getElementById("formatoPlantilla").value = "PDF";

        bootstrap.Modal.getInstance(document.getElementById("modalNuevaPlantilla")).hide();
        mostrarToast("Plantilla creada: " + nombre);
    });
}

renderizarPlantillas();

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
