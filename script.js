document.addEventListener('DOMContentLoaded', () => {

    const todosLosRamos = document.querySelectorAll('.ramo');
    const RAMOS_APROBADOS_KEY = 'ramosAprobados';

    // --- Funciones Principales ---

    /**
     * Inicializa la malla, cargando el estado guardado y aplicando los estados iniciales.
     */
    function inicializarMalla() {
        const ramosAprobados = cargarRamosAprobados();
        const nombresAprobados = new Set(ramosAprobados);

        todosLosRamos.forEach(ramo => {
            const nombreRamo = ramo.dataset.ramo;
            if (nombresAprobados.has(nombreRamo)) {
                ramo.classList.add('approved');
            }
        });
        actualizarEstadoDeRamos();
    }

    /**
     * Actualiza el estado de todos los ramos (bloqueado, desbloqueado) basado en los aprobados.
     */
    function actualizarEstadoDeRamos() {
        const nombresAprobados = obtenerNombresDeRamosAprobados();

        todosLosRamos.forEach(ramo => {
            if (ramo.classList.contains('approved')) {
                // Si ya está aprobado, no necesita más cambios de estado
                ramo.classList.remove('locked', 'unlocked');
                return;
            }

            const requisitos = obtenerRequisitos(ramo);
            const cumpleRequisitos = verificarRequisitos(requisitos, nombresAprobados);

            if (cumpleRequisitos) {
                ramo.classList.add('unlocked');
                ramo.classList.remove('locked');
            } else {
                ramo.classList.add('locked');
                ramo.classList.remove('unlocked');
            }
        });
    }

    /**
     * Maneja el evento de clic en un ramo.
     * @param {Event} event - El objeto del evento de clic.
     */
    function manejarClickEnRamo(event) {
        const ramoClickeado = event.target.closest('.ramo');
        if (!ramoClickeado) return; // Salir si el clic no fue en un ramo

        // Permite aprobar si está desbloqueado o desaprobar si ya está aprobado
        if (ramoClickeado.classList.contains('unlocked') || ramoClickeado.classList.contains('approved')) {
            ramoClickeado.classList.toggle('approved');
            ramoClickeado.classList.remove('unlocked'); // Asegurarse que no tenga ambas clases

            guardarRamosAprobados();
            actualizarEstadoDeRamos();
        }
    }


    // --- Funciones Auxiliares ---

    /**
     * Obtiene los nombres de todos los ramos actualmente marcados como 'approved'.
     * @returns {Set<string>} Un conjunto con los nombres de los ramos aprobados.
     */
    function obtenerNombresDeRamosAprobados() {
        const aprobados = document.querySelectorAll('.ramo.approved');
        const nombres = new Set();
        aprobados.forEach(ramo => nombres.add(ramo.dataset.ramo));
        return nombres;
    }

    /**
     * Obtiene la lista de prerrequisitos de un ramo desde su atributo data.
     * @param {HTMLElement} ramo - El elemento del ramo.
     * @returns {string[]} Un array con los nombres de los prerrequisitos.
     */
    function obtenerRequisitos(ramo) {
        const requisitosAttr = ramo.dataset.requisito;
        return requisitosAttr ? requisitosAttr.split(',').map(r => r.trim()) : [];
    }

    /**
     * Verifica si todos los prerrequisitos de un ramo están en la lista de aprobados.
     * @param {string[]} requisitos - Array de nombres de prerrequisitos.
     * @param {Set<string>} nombresAprobados - Conjunto de nombres de ramos aprobados.
     * @returns {boolean} - True si todos los requisitos se cumplen, false de lo contrario.
     */
    function verificarRequisitos(requisitos, nombresAprobados) {
        if (requisitos.length === 0) {
            return true; // No tiene requisitos, está desbloqueado por defecto.
        }
        return requisitos.every(req => nombresAprobados.has(req));
    }


    // --- Local Storage ---

    /**
     * Guarda la lista de ramos aprobados en el almacenamiento local del navegador.
     */
    function guardarRamosAprobados() {
        const nombresAprobados = Array.from(obtenerNombresDeRamosAprobados());
        localStorage.setItem(RAMOS_APROBADOS_KEY, JSON.stringify(nombresAprobados));
    }

    /**
     * Carga la lista de ramos aprobados desde el almacenamiento local.
     * @returns {string[]} Un array con los nombres de los ramos guardados.
     */
    function cargarRamosAprobados() {
        const guardados = localStorage.getItem(RAMOS_APROBADOS_KEY);
        return guardados ? JSON.parse(guardados) : [];
    }


    // --- Inicialización y Event Listeners ---

    const mallaContainer = document.querySelector('.malla-container');
    mallaContainer.addEventListener('click', manejarClickEnRamo);

    // Iniciar la aplicación
    inicializarMalla();
});
