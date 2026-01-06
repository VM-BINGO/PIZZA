// ===== STATE =====
let valgtPizza = null;
let chili = false;
let dressing = false;
let hvidlog = false;
let bestillinger = [];
const gemte = localStorage.getItem("pizzaBestillinger");
if (gemte) {
  bestillinger = JSON.parse(gemte);
}


// ===== DOM =====
const valgtDiv = document.getElementById("valgtPizza");
const pizzaListe = document.getElementById("pizzaListe");
const chiliBtn = document.getElementById("chiliBtn");
const dressingBtn = document.getElementById("dressingBtn");
const hvidlogBtn = document.getElementById("hvidlogBtn");
const navnInput = document.getElementById("navnInput");
const bestillingerDiv = document.getElementById("bestillinger");
const samletListeDiv = document.getElementById("samletListe");
const kommentarInput = document.getElementById("kommentarInput");


// slå tilvalg fra ved start
chiliBtn.disabled = true;
dressingBtn.disabled = true;
hvidlogBtn.disabled = true;


// ===== HENT PIZZAER =====
fetch("pizzaer.json")
  .then(r => r.json())
  .then(pizzaer => {

    // ryd listen
    pizzaListe.innerHTML = "";

    // grupper: 1–10, 11–20, 21–30 ...
    const grupper = {};

    pizzaer.forEach(pizza => {
      const start = Math.floor((pizza.nr - 1) / 10) * 10 + 1;
      const slut = start + 8;
      const key = `${start}-${slut}`;

      if (!grupper[key]) {
        grupper[key] = [];
      }
      grupper[key].push(pizza);
    });

    // opret hver gruppe lodret
    Object.entries(grupper).forEach(([gruppeNavn, gruppePizzaer]) => {

      // 🔽 sortering
      gruppePizzaer.sort((a, b) => a.nr - b.nr);

      const gruppeDiv = document.createElement("div");
      gruppeDiv.className = "pizza-gruppe";

      const header = document.createElement("div");
      header.className = "gruppe-header";
      header.textContent = gruppeNavn.replace("-", " – ");
      gruppeDiv.appendChild(header);

      const grid = document.createElement("div");
grid.className = "pizza-grid";

// lav 3 kolonner
const cols = [
  document.createElement("div"),
  document.createElement("div"),
  document.createElement("div")
];
cols.forEach(col => col.className = "pizza-col");

// beregn hvor mange pr kolonne (lodret fyld)
const rows = Math.ceil(gruppePizzaer.length / 3);

gruppePizzaer.forEach((pizza, index) => {
  const colIndex = Math.floor(index / rows);

  const btn = document.createElement("button");
  btn.className = "pizza-knap";
  btn.textContent = `${pizza.nr} – ${pizza.navn}`;

  btn.onclick = () => {
    valgtPizza = pizza;

    document.querySelectorAll(".pizza-knap")
      .forEach(b => b.classList.remove("valgt"));
    btn.classList.add("valgt");

    // nulstil tilvalg
    chili = false;
    dressing = false;
    hvidlog = false;

    chiliBtn.classList.remove("valgt");
    dressingBtn.classList.remove("valgt");
    hvidlogBtn.classList.remove("valgt");

    // aktiver tilvalg
    chiliBtn.disabled = false;
    dressingBtn.disabled = false;
    hvidlogBtn.disabled = false;

    valgtDiv.textContent =
      `Valgt: ${pizza.nr} – ${pizza.navn} (${pizza.pris} kr)`;
  };

  cols[colIndex].appendChild(btn);
});

// saml kolonnerne i grid
cols.forEach(col => {
  if (col.children.length > 0) {
    grid.appendChild(col);
  }
});


      gruppeDiv.appendChild(grid);
      pizzaListe.appendChild(gruppeDiv);
    });
  })
  .catch(err => {
    console.error("Fejl ved indlæsning af pizzaer:", err);
  });


// ===== TILVALG =====


chiliBtn.onclick = () => {
  if (!valgtPizza) return;
  chili = !chili;
  chiliBtn.classList.toggle("valgt", chili);
};

dressingBtn.onclick = () => {
  if (!valgtPizza) return;
  dressing = !dressing;
  dressingBtn.classList.toggle("valgt", dressing);
};

hvidlogBtn.onclick = () => {
  if (!valgtPizza) return;
  hvidlog = !hvidlog;
  hvidlogBtn.classList.toggle("valgt", hvidlog);
};

// ===== TILFØJ BESTILLING =====


document.getElementById("tilføjBtn").onclick = () => {
  if (!valgtPizza) {
    alert("Vælg en pizza");
    return;
  }
  if (!navnInput.value.trim()) {
    alert("Indtast navn");
    return;
  }

  bestillinger.push({
  navn: navnInput.value.trim(),
  pizza: valgtPizza,
  chili,
  dressing,
  hvidlog,
  kommentar: kommentarInput.value.trim()
});

gemBestillinger();

chili = false;
dressing = false;
hvidlog = false;

chiliBtn.classList.remove("valgt");
dressingBtn.classList.remove("valgt");
hvidlogBtn.classList.remove("valgt");

kommentarInput.value = "";

  navnInput.value = "";
  visBestillinger();
  visSamletListe();
  
};


// ===== VIS BESTILLINGER =====
function visBestillinger() {
  bestillingerDiv.innerHTML = "";

  // SORTÉR ALTID ved visning (dansk alfabet)
  const sorterede = [...bestillinger].sort((a, b) =>
    a.navn.localeCompare(b.navn, "da", { sensitivity: "base" })
  );

  sorterede.forEach((b, index) => {
    const div = document.createElement("div");
    div.className = "bestilling";

    let tekst = `${b.navn}: ${b.pizza.nr} ${b.pizza.navn}`;

    const tilvalg = [];
    if (b.chili) tilvalg.push("chili");
    if (b.dressing) tilvalg.push("dressing");
    if (b.hvidlog) tilvalg.push("hvidløg");

    if (tilvalg.length > 0) {
      tekst += " + " + tilvalg.join(" og ");
    }

    if (b.kommentar) {
      tekst += ` (${b.kommentar})`;
    }

    const tekstSpan = document.createElement("span");
    tekstSpan.textContent = tekst;

    const sletBtn = document.createElement("button");
    sletBtn.textContent = "✖";
    sletBtn.className = "slet-knap";

    // find korrekt index i ORIGINAL array
    sletBtn.onclick = () => {
      if (!confirm("Slet denne bestilling?")) return;

      const realIndex = bestillinger.indexOf(b);
      bestillinger.splice(realIndex, 1);

      gemBestillinger();
      visBestillinger();
      visSamletListe();
    };

    div.appendChild(tekstSpan);
    div.appendChild(sletBtn);
    bestillingerDiv.appendChild(div);
  });
}


// ===== Vis Samlet Liste =====

function visSamletListe() {
  samletListeDiv.innerHTML = "";

  const samlet = {};

  bestillinger.forEach(b => {
    const nr = b.pizza.nr;

    if (!samlet[nr]) {
      samlet[nr] = {
        navn: b.pizza.navn,
        total: 0,

        // tællere for kombinationer UDEN kommentar
        counts: {},

        // individuelle med kommentar
        special: []
      };
    }

    samlet[nr].total++;

    // byg tilvalg-nøgle (samme logik overalt)
    const tilvalg = [];
    if (b.chili) tilvalg.push("chili");
    if (b.dressing) tilvalg.push("dressing");
    if (b.hvidlog) tilvalg.push("hvidløg");

    const key = tilvalg.length ? tilvalg.join(" + ") : "uden";

    // hvis kommentar → egen linje
    if (b.kommentar) {
      samlet[nr].special.push({ ...b, key });
      return;
    }

    // ellers samles
    if (!samlet[nr].counts[key]) {
      samlet[nr].counts[key] = 0;
    }
    samlet[nr].counts[key]++;
  });

  // visning
  Object.values(samlet).forEach(data => {
    const div = document.createElement("div");
    div.className = "bestilling";

    let html = `<strong>${data.total} stk ${data.navn}</strong><br>`;

    // samlede linjer (uden kommentar)
    Object.entries(data.counts).forEach(([key, antal]) => {
      if (key === "uden") {
        html += `• ${antal} stk ${data.navn}<br>`;
      } else {
        html += `• ${antal} stk ${data.navn} med ${key.replaceAll(" + ", " og ")}<br>`;
      }
    });

    // individuelle med kommentar
    data.special.forEach(b => {
      if (b.key === "uden") {
        html += `• 1 stk ${data.navn} : OBS (${b.kommentar})<br>`;
      } else {
        html += `• 1 stk ${data.navn} med ${b.key.replaceAll(" + ", " og ")} : OBS (${b.kommentar})<br>`;
      }
    });

    div.innerHTML = html;
    samletListeDiv.appendChild(div);
  });
}


// ===== NULSTIL =====
document.getElementById("nulstilBtn").onclick = () => {
  if (!confirm("Nulstil alle bestillinger?")) return;

  bestillinger = [];
  localStorage.removeItem("pizzaBestillinger");

  visBestillinger();
  visSamletListe();
};


// ===== GEM LOKALT =====

function gemBestillinger() {
  localStorage.setItem("pizzaBestillinger", JSON.stringify(bestillinger));
}
