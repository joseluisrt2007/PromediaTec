// --- CONFIGURACIÓN DE MATERIAS ESTÁNDAR POR DEFAULT (18 créditos totales) ---
const materiasDefault = [
    { id: 101, nombre: "Materia Optativa", tipo: "optativa", creditos: 3, calificacion: 0, esPendiente: true },
    { id: 102, nombre: "Bloque 1", tipo: "bloque", creditos: 3, calificacion: 0, esPendiente: true },
    { id: 103, nombre: "Bloque 2", tipo: "bloque", creditos: 3, calificacion: 0, esPendiente: true },
    { id: 104, nombre: "Bloque 3", tipo: "bloque", creditos: 3, calificacion: 0, esPendiente: true },
    { id: 105, nombre: "Materia 10 Semanas", tipo: "semana10", creditos: 2, calificacion: 0, esPendiente: true },
    { id: 106, nombre: "Materia 5 Semanas W1", tipo: "semana5", creditos: 1, calificacion: 0, esPendiente: true },
    { id: 107, nombre: "Materia 5 Semanas W2", tipo: "semana5", creditos: 1, calificacion: 0, esPendiente: true },
    { id: 108, nombre: "Materia 5 Semanas W3", tipo: "semana5", creditos: 1, calificacion: 0, esPendiente: true },
    { id: 109, nombre: "Materia 5 Semanas W4", tipo: "semana5", creditos: 1, calificacion: 0, esPendiente: true }
];

let materias = JSON.parse(localStorage.getItem('materiasTec21'));
if (!materias || materias.length === 0) {
    materias = [...materiasDefault];
    localStorage.setItem('materiasTec21', JSON.stringify(materias));
}

const creditosPorTipo = { optativa: 3, bloque: 3, semana5: 1, semana10: 2 };

const modal = document.getElementById('modal-formulario');
const btnAbrirModal = document.getElementById('btn-abrir-modal');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');
const form = document.getElementById('materia-form');
const btnResetear = document.getElementById('btn-resetear');

const vacioState = document.getElementById('vacio-state');
const workspaceMaterias = document.getElementById('workspace-materias');
const gridMaterias = document.getElementById('lista-materias-cards');
const countMateriasBadge = document.getElementById('count-materias-badge');

const totalCreditosTxt = document.getElementById('total-creditos');
const barraFill = document.getElementById('barra-fill');
const countBloqueTxt = document.getElementById('count-bloque');
const countOptativaTxt = document.getElementById('count-optativa');

const panelCalculo = document.getElementById('panel-calculo');
const btnCalcular = document.getElementById('btn-calcular');
const contenedorResultado = document.getElementById('contenedor-resultado');
const promedioFinalTxt = document.getElementById('promedio-final');

const panelPredicciones = document.getElementById('panel-predicciones');
const btnPredecir = document.getElementById('btn-predecir');
const resultadoPrediccion = document.getElementById('resultado-prediccion');
const metaPromedioInput = document.getElementById('meta-promedio');

btnAbrirModal.addEventListener('click', () => modal.style.display = 'flex');
btnCerrarModal.addEventListener('click', () => { modal.style.display = 'none'; form.reset(); });

function guardarEnLocalStorage() {
    localStorage.setItem('materiasTec21', JSON.stringify(materias));
}

btnResetear.addEventListener('click', () => {
    const confirmar = confirm("¿Estás seguro de que quieres restablecer el simulador? Se borrarán las materias personalizadas y regresará el horario predeterminado.");
    if (confirmar) {
        localStorage.removeItem('materiasTec21');
        materias = [...materiasDefault];
        guardarEnLocalStorage();
        contenedorResultado.style.display = 'none';
        resultadoPrediccion.innerHTML = '';
        actualizarPantalla();
    }
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const tipo = document.getElementById('tipo').value;
    const creditos = creditosPorTipo[tipo];

    const actualesBloques = materias.filter(m => m.tipo === 'bloque').length;
    const actualesOptativas = materias.filter(m => m.tipo === 'optativa').length;
    const actualesCreditos = materias.reduce((sum, m) => sum + m.creditos, 0);

    if (tipo === 'optativa' && actualesOptativas >= 1) return alert('Límite alcanzado: Máximo 1 optativa por semestre.');
    if (tipo === 'bloque' && actualesBloques >= 3) return alert('Límite alcanzado: Máximo 3 bloques por semestre.');
    if (actualesCreditos + creditos > 18) return alert(`Has alcanzado el límite de 18 créditos. Créditos actuales: ${actualesCreditos}`);

    const nuevaMateria = { id: Date.now(), nombre, tipo, creditos, calificacion: 0, esPendiente: true };
    materias.push(nuevaMateria);
    guardarEnLocalStorage();
    modal.style.display = 'none';
    form.reset();
    contenedorResultado.style.display = 'none';
    resultadoPrediccion.innerHTML = '';
    actualizarPantalla();
});

function eliminarMateria(id) {
    materias = materias.filter(m => m.id !== id);
    guardarEnLocalStorage();
    contenedorResultado.style.display = 'none';
    resultadoPrediccion.innerHTML = '';
    actualizarPantalla();
}

function actualizarPantalla() {
    if (materias.length === 0) {
        vacioState.style.display = 'block';
        workspaceMaterias.style.display = 'none';
        panelCalculo.style.display = 'none';
        panelPredicciones.style.display = 'none';
        return;
    }

    vacioState.style.display = 'none';
    workspaceMaterias.style.display = 'block';
    panelCalculo.style.display = 'block';
    panelPredicciones.style.display = 'block';
    gridMaterias.innerHTML = '';

    // Badge contador
    if (countMateriasBadge) countMateriasBadge.textContent = `${materias.length} materia${materias.length !== 1 ? 's' : ''}`;

    materias.forEach(materia => {
        const card = document.createElement('div');
        card.className = 'materia-card';

        let tipoTxt = materia.tipo === 'semana5' ? '5 Semanas' :
                      materia.tipo === 'semana10' ? '10 Semanas' :
                      materia.tipo.charAt(0).toUpperCase() + materia.tipo.slice(1);

        card.innerHTML = `
            <div class="materia-header">
                <input type="text" value="${materia.nombre}" class="materia-title-input" data-id="${materia.id}">
                <span class="materia-badge">${tipoTxt} &bull; ${materia.creditos} u.c.</span>
            </div>
            <div class="materia-control">
                <div class="slider-container">
                    <input type="range" min="0" max="100" step="1" value="${materia.calificacion}" class="slider-calif" data-id="${materia.id}">
                    <input type="number" min="0" max="100" value="${materia.calificacion}" class="input-calif" data-id="${materia.id}">
                </div>
                <label class="chk-pendiente-label">
                    <input type="checkbox" class="chk-pendiente" data-id="${materia.id}" ${materia.esPendiente ? 'checked' : ''}>
                    Considerar como "Pendiente"
                </label>
            </div>
            <button class="btn-delete-materia" onclick="eliminarMateria(${materia.id})">Eliminar materia</button>
        `;
        gridMaterias.appendChild(card);
    });

    document.querySelectorAll('.materia-title-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const mat = materias.find(m => m.id == e.target.dataset.id);
            if (mat) { mat.nombre = e.target.value; guardarEnLocalStorage(); }
        });
    });
    document.querySelectorAll('.slider-calif').forEach(slider => {
        slider.addEventListener('input', (e) => sincronizarValores(e.target.dataset.id, e.target.value));
    });
    document.querySelectorAll('.input-calif').forEach(input => {
        input.addEventListener('input', (e) => {
            let val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
            sincronizarValores(e.target.dataset.id, val);
        });
    });
    document.querySelectorAll('.chk-pendiente').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const mat = materias.find(m => m.id == e.target.dataset.id);
            if (mat) { mat.esPendiente = e.target.checked; guardarEnLocalStorage(); }
        });
    });

    const totales = materias.reduce((acc, m) => {
        acc.creditos += m.creditos;
        if (m.tipo === 'bloque') acc.bloques++;
        if (m.tipo === 'optativa') acc.optativas++;
        return acc;
    }, { creditos: 0, bloques: 0, optativas: 0 });

    totalCreditosTxt.textContent = totales.creditos;
    countBloqueTxt.textContent = totales.bloques;
    countOptativaTxt.textContent = totales.optativas;

    // Barra de progreso
    if (barraFill) barraFill.style.width = `${Math.min(100, (totales.creditos / 18) * 100)}%`;
}

function sincronizarValores(id, valor) {
    const mat = materias.find(m => m.id == id);
    if (mat) { mat.calificacion = parseFloat(valor); guardarEnLocalStorage(); }
    document.querySelectorAll(`.slider-calif[data-id="${id}"]`).forEach(el => el.value = valor);
    document.querySelectorAll(`.input-calif[data-id="${id}"]`).forEach(el => el.value = valor);
    if (contenedorResultado.style.display === 'block') calcularPromedio();
}

function calcularPromedio() {
    const sumaPonderada = materias.reduce((sum, m) => sum + (m.calificacion * m.creditos), 0);
    const totalCreditos = materias.reduce((sum, m) => sum + m.creditos, 0);
    const promedio = sumaPonderada / totalCreditos;
    promedioFinalTxt.textContent = promedio.toFixed(2);
}

btnCalcular.addEventListener('click', () => { calcularPromedio(); contenedorResultado.style.display = 'block'; });

btnPredecir.addEventListener('click', () => {
    const meta = parseFloat(metaPromedioInput.value);
    if (isNaN(meta) || meta < 0 || meta > 100) {
        resultadoPrediccion.innerHTML = `<span class="alerta-prediccion">Ingresa una meta válida entre 0 y 100.</span>`;
        return;
    }
    const totalCreditosSemestre = materias.reduce((sum, m) => sum + m.creditos, 0);
    const materiasFijas = materias.filter(m => !m.esPendiente);
    const materiasPendientes = materias.filter(m => m.esPendiente);

    if (materiasPendientes.length === 0) {
        resultadoPrediccion.innerHTML = `<span class="alerta-prediccion">No tienes materias marcadas como "Pendiente".</span>`;
        return;
    }

    const puntosAsegurados = materiasFijas.reduce((sum, m) => sum + (m.calificacion * m.creditos), 0);
    const puntosRequeridosTotales = meta * totalCreditosSemestre;
    const puntosFaltantes = puntosRequeridosTotales - puntosAsegurados;
    const creditosPendientesTotales = materiasPendientes.reduce((sum, m) => sum + m.creditos, 0);
    const notaNecesaria = puntosFaltantes / creditosPendientesTotales;

    if (notaNecesaria > 100) {
        resultadoPrediccion.innerHTML = `<span class="alerta-prediccion">Matemáticamente imposible. Necesitarías un promedio de <strong>${notaNecesaria.toFixed(1)}</strong> en tus materias pendientes para alcanzar la meta de ${meta}.</span>`;
    } else if (notaNecesaria < 70) {
        resultadoPrediccion.innerHTML = `
            <div class="exito-prediccion" style="margin-bottom:6px;">Escenario muy favorable</div>
            Solo necesitas <strong>aprobar</strong> tus ${materiasPendientes.length} materias pendientes con la calificación mínima reglamentaria (<strong>70</strong>) para superar tu meta de ${meta}.
        `;
    } else {
        resultadoPrediccion.innerHTML = `
            <div class="exito-prediccion" style="margin-bottom:6px;">Escenario alcanzable</div>
            Para promediar <strong>${meta}</strong>, necesitas obtener al menos <strong style="font-size:15px;">${notaNecesaria.toFixed(1)}</strong> en promedio en tus materias pendientes.
        `;
    }
});

actualizarPantalla();