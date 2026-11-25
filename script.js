"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const botonBienvenida = document.getElementById("btnBienvenida");
    const mensajeBienvenida = document.getElementById("mensajeBienvenida");
    const buscarRecurso = document.getElementById("buscarRecurso");
    const listaRecursos = document.getElementById("listaRecursos");
    const sinResultados = document.getElementById("sinResultados");
    const formulario = document.getElementById("formContacto");
    const resultadoFormulario = document.getElementById("resultadoFormulario");
    const estadoPagina = document.getElementById("estadoPagina");

    // Instancias de Modales de Bootstrap
    const modalElemento = document.getElementById("modalExito");
    const modalExito = modalElemento ? new bootstrap.Modal(modalElemento) : null;

    const modalLoginElemento = document.getElementById("modalLogin");
    const modalLogin = modalLoginElemento ? new bootstrap.Modal(modalLoginElemento) : null;

    // 1. Mensaje interactivo
    if (botonBienvenida) {
        botonBienvenida.addEventListener("click", () => {
            mensajeBienvenida.textContent = "¡Bienvenido a GamerTech! Explora el proyecto y sus recursos tecnológicos.";
        });
    }

    // 2. Buscador con persistencia en localStorage
    if (buscarRecurso && listaRecursos) {
        const busquedaGuardada = localStorage.getItem("gamertech_busqueda");
        if (busquedaGuardada) {
            buscarRecurso.value = busquedaGuardada;
            filtrarRecursos(busquedaGuardada);
        }

        buscarRecurso.addEventListener("input", (e) => {
            const busqueda = e.target.value;
            localStorage.setItem("gamertech_busqueda", busqueda);
            filtrarRecursos(busqueda);
        });
    }

    function filtrarRecursos(termino) {
        const busqueda = termino.trim().toLocaleLowerCase("es");
        const elementos = listaRecursos.querySelectorAll("li");
        let encontrados = 0;

        elementos.forEach((elemento) => {
            const coincide = elemento.textContent.toLocaleLowerCase("es").includes(busqueda);
            elemento.classList.toggle("d-none", !coincide);
            if (coincide) encontrados++;
        });

        if (sinResultados) {
            sinResultados.textContent = encontrados === 0 ? "No se encontraron recursos con ese nombre." : "";
        }
    }

    // 3. Persistencia de campos de formulario en LocalStorage
    const camposForm = ["nombre", "correo", "telefono", "motivo", "mensaje"];
    camposForm.forEach((idCampo) => {
        const campo = document.getElementById(idCampo);
        if (campo) {
            const valorGuardado = localStorage.getItem(`gamertech_form_${idCampo}`);
            if (valorGuardado) campo.value = valorGuardado;

            campo.addEventListener("input", () => {
                localStorage.setItem(`gamertech_form_${idCampo}`, campo.value);
            });
        }
    });

    // Función auxiliar para errores y accesibilidad
    function mostrarError(campo, idError, texto) {
        const elementoError = document.getElementById(idError);
        if (elementoError) elementoError.textContent = texto;
        campo.classList.toggle("invalido", Boolean(texto));
        campo.classList.toggle("valido", !texto && campo.value.trim() !== "");
        campo.setAttribute("aria-invalid", Boolean(texto));
    }

    // 4. Validación del formulario de contacto
    if (formulario) {
        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault();

            const nombre = document.getElementById("nombre");
            const correo = document.getElementById("correo");
            const telefono = document.getElementById("telefono");
            const motivo = document.getElementById("motivo");
            const mensaje = document.getElementById("mensaje");
            let correcto = true;

            if (nombre.value.trim().length < 3) {
                mostrarError(nombre, "errorNombre", "Escribe un nombre de al menos 3 caracteres.");
                correcto = false;
            } else {
                mostrarError(nombre, "errorNombre", "");
            }

            const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!patronCorreo.test(correo.value.trim())) {
                mostrarError(correo, "errorCorreo", "Introduce un correo válido.");
                correcto = false;
            } else {
                mostrarError(correo, "errorCorreo", "");
            }

            const digitosTelefono = telefono.value.replace(/\D/g, "");
            if (!/^\d{10}$/.test(digitosTelefono)) {
                mostrarError(telefono, "errorTelefono", "El teléfono debe contener exactamente 10 dígitos.");
                correcto = false;
            } else {
                mostrarError(telefono, "errorTelefono", "");
            }

            if (motivo.value === "") {
                mostrarError(motivo, "errorMotivo", "Selecciona el motivo del mensaje.");
                correcto = false;
            } else {
                mostrarError(motivo, "errorMotivo", "");
            }

            if (mensaje.value.trim().length < 10) {
                mostrarError(mensaje, "errorMensaje", "El mensaje debe tener al menos 10 caracteres.");
                correcto = false;
            } else {
                mostrarError(mensaje, "errorMensaje", "");
            }

            if (correcto) {
                resultadoFormulario.textContent = "¡Validación completada con éxito!";
                resultadoFormulario.style.color = "#86efac";
                if (modalExito) modalExito.show();
            } else {
                resultadoFormulario.textContent = "Revisa los campos señalados antes de continuar.";
                resultadoFormulario.style.color = "#fca5a5";
            }
        });

        formulario.addEventListener("reset", () => {
            window.setTimeout(() => {
                formulario.querySelectorAll(".error").forEach((el) => el.textContent = "");
                formulario.querySelectorAll("input, select, textarea").forEach((campo) => {
                    campo.classList.remove("invalido", "valido");
                    campo.removeAttribute("aria-invalid");
                });
                camposForm.forEach((idCampo) => localStorage.removeItem(`gamertech_form_${idCampo}`));
                if (resultadoFormulario) resultadoFormulario.textContent = "";
            }, 0);
        });
    }

    // 5. Sistema de Login de Usuarios
    const formLogin = document.getElementById("formLogin");
    const btnAbrirLogin = document.getElementById("btnAbrirLogin");
    const saludoUsuario = document.getElementById("saludoUsuario");
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");

    // Lista de usuarios autorizados con sus nombres para mostrar en pantalla
    const usuariosAutorizados = [
        { correo: "hairon@reyes.com", nombre: "Hairon Reyes" },
        { correo: "enjee@vargas.com", nombre: "Enjee De Vargas" },
        { correo: "joendy@genao.com", nombre: "Joendy Genao" }
    ];
    const claveMaestra = "GameT.11";

    // Verificar si existe una sesión activa guardada
    const sesionGuardada = localStorage.getItem("gamertech_usuario_activo");
    if (sesionGuardada) {
        activarSesionUI(sesionGuardada);
    }

    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            const inputCorreo = document.getElementById("loginCorreo");
            const inputPass = document.getElementById("loginPassword");
            const errorGlobal = document.getElementById("mensajeLoginGlobal");

            const correoIngresado = inputCorreo.value.trim().toLowerCase();
            const passIngresada = inputPass.value;

            if (correoIngresado === "" || passIngresada === "") {
                errorGlobal.textContent = "Por favor, completa todos los campos.";
                return;
            }

            // Buscar usuario coincidente
            const usuarioEncontrado = usuariosAutorizados.find(u => u.correo === correoIngresado);

            if (usuarioEncontrado && passIngresada === claveMaestra) {
                errorGlobal.textContent = "";
                localStorage.setItem("gamertech_usuario_activo", usuarioEncontrado.nombre);
                if (modalLogin) modalLogin.hide();
                activarSesionUI(usuarioEncontrado.nombre);
                formLogin.reset();
            } else {
                errorGlobal.textContent = "Correo o contraseña incorrectos.";
            }
        });
    }

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            localStorage.removeItem("gamertech_usuario_activo");
            desactivarSesionUI();
        });
    }

    function activarSesionUI(nombreUsuario) {
        if (btnAbrirLogin) btnAbrirLogin.classList.add("d-none");
        if (saludoUsuario) {
            saludoUsuario.textContent = `👤 ${nombreUsuario}`;
            saludoUsuario.classList.remove("d-none");
        }
        if (btnCerrarSesion) btnCerrarSesion.classList.remove("d-none");
    }

    function desactivarSesionUI() {
        if (btnAbrirLogin) btnAbrirLogin.classList.remove("d-none");
        if (saludoUsuario) {
            saludoUsuario.textContent = "";
            saludoUsuario.classList.add("d-none");
        }
        if (btnCerrarSesion) btnCerrarSesion.classList.add("d-none");
    }

    // Pie de página dinámico
    if (estadoPagina) {
        estadoPagina.textContent = "Página interactiva optimizada con Bootstrap 5 y JavaScript · Año: " + new Date().getFullYear();
    }
});