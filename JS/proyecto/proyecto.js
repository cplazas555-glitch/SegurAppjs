(function () {
    "use strict";

    // Lógica de ingreso al sistema para el apartado Proyecto (Login)
    document.addEventListener("DOMContentLoaded", function () {
        const formularioIngreso = document.querySelector("form[action='Dashboard.html']");
        const campoCorreo = document.getElementById("correo");

        if (!formularioIngreso) return;

        formularioIngreso.addEventListener("submit", function (evento) {
            evento.preventDefault();

            const correo = campoCorreo ? campoCorreo.value.trim() : "";
            if (window.SegurAppSesion) {
                window.SegurAppSesion.iniciarSesion(correo);
            }

            window.location.href = "Dashboard.html";
        });
    });
})();
