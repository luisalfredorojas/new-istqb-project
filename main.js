document.addEventListener("DOMContentLoaded", () => {
    fetch("examenes.json")
        .then((response) => response.json())
        .then((data) => mostrarExamenes(data));
});

function mostrarExamenes(examenes) {
    const grid = document.getElementById("examenes-grid");
    grid.innerHTML = "";

    examenes.forEach((examen, index) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
      <h3>${examen.titulo}</h3>
      <p>${examen.descripcion}</p>
      <button onclick="comenzarExamen(${index})">Comenzar</button>
    `;
        grid.appendChild(card);
    });
}

function comenzarExamen(index) {
    localStorage.setItem("examenActual", index);
    window.location.href = "examen.html";
}
