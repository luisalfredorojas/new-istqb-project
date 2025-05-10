const resumen = document.getElementById("resumen");
const detalle = document.getElementById("detalle");

const respuestas = JSON.parse(localStorage.getItem("respuestas"));
const examen = JSON.parse(localStorage.getItem("examenData"));

let correctas = 0;
let incorrectas = 0;

function arraysIguales(arr1, arr2) {
    if (!Array.isArray(arr1)) arr1 = [arr1];
    if (!Array.isArray(arr2)) arr2 = [arr2];
    if (arr1.length !== arr2.length) return false;
    const s1 = [...arr1].sort().join(',');
    const s2 = [...arr2].sort().join(',');
    return s1 === s2;
}

examen.forEach((preg, i) => {
    const correcta = preg.respuesta_correcta;
    const usuario = respuestas[i];
    if (arraysIguales(correcta, usuario)) {
        correctas++;
    } else {
        incorrectas++;
    }
});

const total = examen.length;
const porcentaje = Math.round((correctas / total) * 100);

let minimo = 65; // valor por defecto
let feedback = "";

if (examen[0].minimo_aprobacion) minimo = examen[0].minimo_aprobacion;
if (examen[0].retroalimentacion) {
    const mensajes = examen[0].retroalimentacion;
    for (let i = 0; i < mensajes.length; i++) {
        if (porcentaje >= mensajes[i].umbral) {
            feedback = mensajes[i].mensaje;
            break;
        }
    }
}

resumen.innerHTML = `
  <p>Respuestas correctas: <strong>${correctas}</strong></p>
  <p>Respuestas incorrectas: <strong>${incorrectas}</strong></p>
  <p>Porcentaje de aciertos: <strong>${porcentaje}%</strong></p>
  <p>Resultado: <strong>${porcentaje >= minimo ? "Aprobado" : "Reprobado"}</strong></p>
  <p>${feedback}</p>
`;

detalle.innerHTML = "";

examen.forEach((preg, i) => {
    const div = document.createElement("div");
    div.classList.add("resultado-pregunta");

    const userResp = respuestas[i];
    const correcta = preg.respuesta_correcta;

    div.innerHTML = `<h3>${preg.numero}. ${preg.pregunta}</h3>`;

    preg.opciones.forEach((opcion, idx) => {
        let clase = "";
        const esCorrecta = Array.isArray(correcta) ? correcta.includes(idx) : correcta === idx;
        const fueSeleccionada = Array.isArray(userResp) ? userResp.includes(idx) : userResp === idx;

        if (esCorrecta) clase = "correcta";
        if (fueSeleccionada && !esCorrecta) clase = "incorrecta";

        div.innerHTML += `<p class="${clase}">${opcion}</p>`;
    });

    detalle.appendChild(div);
});
