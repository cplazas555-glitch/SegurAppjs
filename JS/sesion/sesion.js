(function (window, document) {
    "use strict";

    const CLAVE_SESION = "segurapp_sesion";
    const CLAVES_ADICIONALES = ["segurapp_usuario", "usuarioActivo", "sesionActiva", "token"];

    /**
     * Guarda el estado de sesión del usuario autenticado.
     */
    function iniciarSesion(correo) {
        const datosSesion = {
            correo: (correo || "").trim(),
            autenticado: true,
            inicio: new Date().toISOString()
        };

        try {
            sessionStorage.setItem(CLAVE_SESION, JSON.stringify(datosSesion));
            localStorage.setItem(CLAVE_SESION, JSON.stringify(datosSesion));
        } catch (error) {
            // Ignora errores si el navegador restringe el almacenamiento local
        }

        return datosSesion;
    }

    /**
     * Obtiene la sesión actual almacenada, o null si no existe.
     */
    function obtenerSesion() {
        try {
            const raw = sessionStorage.getItem(CLAVE_SESION) || localStorage.getItem(CLAVE_SESION);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Limpia los datos de sesión y redirige al inicio del sistema.
     */
    function cerrarSesion(urlDestino) {
        const destino = urlDestino || "index.html";

        try {
            sessionStorage.removeItem(CLAVE_SESION);
            localStorage.removeItem(CLAVE_SESION);

            CLAVES_ADICIONALES.forEach(function (clave) {
                sessionStorage.removeItem(clave);
                localStorage.removeItem(clave);
            });
        } catch (error) {
            // Ignora errores si el navegador restringe el almacenamiento local
        }

        window.location.href = destino;
    }

    /**
     * Vincula el botón de confirmación del modal de cierre de sesión.
     */
    function inicializarCerrarSesion() {
        const modal = document.getElementById("modalCerrarSesion");

        if (modal) {
            const botonesConfirmar = modal.querySelectorAll(".boton-confirmar, [data-accion='confirmar-cerrar-sesion']");
            botonesConfirmar.forEach(function (boton) {
                boton.addEventListener("click", function (evento) {
                    evento.preventDefault();
                    const destino = boton.getAttribute("href") || "index.html";
                    cerrarSesion(destino);
                });
            });
        }

        document.querySelectorAll("[data-cerrar-sesion-directo]").forEach(function (enlace) {
            enlace.addEventListener("click", function (evento) {
                evento.preventDefault();
                const destino = enlace.getAttribute("href") || "index.html";
                cerrarSesion(destino);
            });
        });
    }

    window.SegurAppSesion = {
        iniciarSesion: iniciarSesion,
        obtenerSesion: obtenerSesion,
        cerrarSesion: cerrarSesion
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inicializarCerrarSesion);
    } else {
        inicializarCerrarSesion();
    }
})(window, document);
