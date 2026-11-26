(function (window) {
    "use strict";

    const CLAVE_STORAGE = "segurapp_capacitaciones";

    const MESES_CORTOS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    const MESES_LARGOS = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const CAPACITACIONES_INICIALES = [
        {
            id: "cap-1",
            nombre: "Prevención de riesgos laborales",
            descripcion: "Seguridad laboral",
            categoria: "Seguridad",
            responsable: "Carlos Rodríguez",
            fecha: "2025-05-09",
            hora: "09:00",
            duracion: "2 horas",
            estado: "Programada"
        },
        {
            id: "cap-2",
            nombre: "Uso correcto de EPP",
            descripcion: "Elementos de protección personal",
            categoria: "Seguridad",
            responsable: "Ana Martínez",
            fecha: "2025-05-12",
            hora: "14:00",
            duracion: "2 horas",
            estado: "Programada"
        },
        {
            id: "cap-3",
            nombre: "Primeros auxilios básicos",
            descripcion: "Atención y respuesta",
            categoria: "Salud",
            responsable: "Carlos Rodríguez",
            fecha: "2025-05-14",
            hora: "09:00",
            duracion: "3 horas",
            estado: "Programada"
        },
        {
            id: "cap-4",
            nombre: "Investigación de incidentes",
            descripcion: "Investigación y análisis",
            categoria: "Técnico",
            responsable: "Juan Pérez",
            fecha: "2025-05-16",
            hora: "10:00",
            duracion: "2 horas",
            estado: "Programada"
        },
        {
            id: "cap-5",
            nombre: "Trabajo seguro en alturas",
            descripcion: "Protocolos de seguridad en alturas",
            categoria: "Seguridad",
            responsable: "Carlos Rodríguez",
            fecha: "2025-05-18",
            hora: "07:00",
            duracion: "4 horas",
            estado: "Programada"
        },
        {
            id: "cap-6",
            nombre: "Manejo y almacenamiento de sustancias químicas",
            descripcion: "Control y manipulación segura",
            categoria: "Técnico",
            responsable: "Ana Martínez",
            fecha: "2025-05-26",
            hora: "11:00",
            duracion: "4 horas",
            estado: "Programada"
        }
    ];

    function cargarCapacitaciones() {
        try {
            const raw = localStorage.getItem(CLAVE_STORAGE);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (error) {
            // Continúa con los datos base si localStorage falla
        }

        return CAPACITACIONES_INICIALES.map(function (item) {
            return Object.assign({}, item);
        });
    }

    function guardarCapacitaciones(lista) {
        try {
            localStorage.setItem(CLAVE_STORAGE, JSON.stringify(lista));
        } catch (error) {
            // Ignora errores de almacenamiento
        }
    }

    function formatearHora12(horaStr) {
        if (!horaStr || !horaStr.includes(":")) return "09:00 AM";
        const partes = horaStr.split(":");
        let h = parseInt(partes[0], 10);
        const m = partes[1] || "00";
        const sufijo = h >= 12 ? "PM" : "AM";
        h = h % 12;
        if (h === 0) h = 12;
        return String(h).padStart(2, "0") + ":" + m + " " + sufijo;
    }

    function formatearRangoHorario(horaStr, duracionStr) {
        if (!horaStr || !horaStr.includes(":")) return "09:00 AM - 11:00 AM";
        const partes = horaStr.split(":");
        const horas = parseInt(partes[0], 10);
        const minutos = parseInt(partes[1], 10) || 0;
        const matchDur = (duracionStr || "2 horas").match(/\d+/);
        const durHoras = matchDur ? parseInt(matchDur[0], 10) : 2;

        const finTotalMin = (horas * 60 + minutos + durHoras * 60) % (24 * 60);
        const finH = String(Math.floor(finTotalMin / 60)).padStart(2, "0");
        const finM = String(finTotalMin % 60).padStart(2, "0");

        return formatearHora12(horaStr) + " - " + formatearHora12(finH + ":" + finM);
    }

    function formatearFecha(fechaISO) {
        if (!fechaISO || !/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) {
            return { dia: "01", mesCorto: "MAY", mesLargo: "Mayo", anio: 2025, completa: "01 Mayo 2025" };
        }
        const partes = fechaISO.split("-");
        const anio = parseInt(partes[0], 10);
        const mesIdx = parseInt(partes[1], 10) - 1;
        const dia = partes[2];
        const mesCorto = MESES_CORTOS[mesIdx] || "ENE";
        const mesLargo = MESES_LARGOS[mesIdx] || "Enero";

        return {
            dia: dia,
            mesCorto: mesCorto,
            mesLargo: mesLargo,
            anio: anio,
            completa: dia + " " + mesLargo + " " + anio
        };
    }

    function obtenerEstiloCategoria(categoria) {
        const mapa = {
            "Seguridad": {
                badgeLista: "text-bg-primary",
                etiquetaGestion: "categoria-seguridad",
                claseLista: "seguridad",
                fechaLista: "fecha-azul",
                punto: "punto-azul",
                iconoFondo: "icono-azul",
                icono: "bi-shield-check"
            },
            "Salud": {
                badgeLista: "text-bg-success",
                etiquetaGestion: "categoria-salud",
                claseLista: "salud",
                fechaLista: "fecha-verde",
                punto: "punto-verde",
                iconoFondo: "icono-verde",
                icono: "bi-heart-pulse"
            },
            "Administrativo": {
                badgeLista: "text-bg-warning",
                etiquetaGestion: "categoria-administrativo",
                claseLista: "administrativo",
                fechaLista: "fecha-naranja",
                punto: "punto-naranja",
                iconoFondo: "icono-naranja",
                icono: "bi-clipboard-data"
            },
            "Técnico": {
                badgeLista: "text-bg-secondary",
                etiquetaGestion: "categoria-tecnico",
                claseLista: "tecnico",
                fechaLista: "fecha-morado",
                punto: "punto-morado",
                iconoFondo: "icono-morado",
                icono: "bi-search"
            }
        };

        return mapa[categoria] || mapa["Seguridad"];
    }

    window.SegurAppCapacitaciones = {
        MESES_LARGOS: MESES_LARGOS,
        cargar: cargarCapacitaciones,
        guardar: guardarCapacitaciones,
        formatearRangoHorario: formatearRangoHorario,
        formatearFecha: formatearFecha,
        obtenerEstiloCategoria: obtenerEstiloCategoria
    };
})(window);
