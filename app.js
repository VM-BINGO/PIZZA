// ===== STATE =====
let valgtPizza = null;
let chili = false;
let dressing = false;
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
const navnInput = document.getElementById("navnInput");
const bestillingerDiv = document.getElementById("bestillinger");
const samletListeDiv = document.getElementById("samletListe");
const kommentarInput = document.getElementById("kommentarInput");


// slå tilvalg fra ved start
chiliBtn.disabled = true;
dressingBtn.disabled = true;

// ===== HENT PIZZAER =====
fetch("pizzaer.json")
  .then(r => r.json())
  .then(pizzaer => {

    // ryd listen
    pizzaListe.innerHTML = "";

    // grupper: 1–9, 10–19, 20–29 ...
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

      const gruppeDiv = document.createElement("div");
      gruppeDiv.className = "pizza-gruppe";

      const header = document.createElement("div");
      header.className = "gruppe-header";
      header.textContent = gruppeNavn.replace("-", " – ");
      gruppeDiv.appendChild(header);

      const grid = document.createElement("div");
      grid.className = "pizza-grid";

      gruppePizzaer.forEach(pizza => {
        const btn = document.createElement("button");
        btn.className = "pizza-knap";
        btn.textContent = `${pizza.nr} – ${pizza.navn}`;

        btn.onclick = () => {
          valgtPizza = pizza;

          document.querySelectorAll(".pizza-knap")
            .forEach(b => b.classList.remove("valgt"));
          btn.classList.add("valgt");

          chili = false;
          dressing = false;
          chiliBtn.classList.remove("valgt");
          dressingBtn.classList.remove("valgt");

          chiliBtn.disabled = false;
          dressingBtn.disabled = false;

          valgtDiv.textContent =
            `Valgt: ${pizza.nr} – ${pizza.navn} (${pizza.pris} kr)`;
        };

        grid.appendChild(btn);
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
  kommentar: kommentarInput.value.trim()
});

gemBestillinger();

kommentarInput.value = "";

  navnInput.value = "";
  visBestillinger();
  visSamletListe();
  
};


// ===== VIS BESTILLINGER =====


function visBestillinger() {
  bestillingerDiv.innerHTML = "";

  bestillinger.forEach((b, index) => {
    const div = document.createElement("div");
    div.className = "bestilling";

    let tekst = `${b.navn}: ${b.pizza.nr} ${b.pizza.navn}`;

    if (b.chili && b.dressing) {
      tekst += " + chili og dressing";
    } else if (b.chili) {
      tekst += " + chili";
    } else if (b.dressing) {
      tekst += " + dressing";
    } else {
      tekst += " uden";
    }

    if (b.kommentar) {
      tekst += ` (${b.kommentar})`;
    }

    // tekst
    const tekstSpan = document.createElement("span");
    tekstSpan.textContent = tekst;

    // slet-knap
    const sletBtn = document.createElement("button");
    sletBtn.textContent = "✖";
    sletBtn.className = "slet-knap";

    sletBtn.onclick = () => {
      if (!confirm("Slet denne bestilling?")) return;

      bestillinger.splice(index, 1);
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

        // samlede uden kommentar
        uden: 0,
        chili: 0,
        dressing: 0,
        chiliDressing: 0,

        // individuelle med kommentar
        special: []
      };
    }

    samlet[nr].total++;

    if (b.kommentar) {
      // altid egen linje
      samlet[nr].special.push(b);
      return;
    }

    if (b.chili && b.dressing) {
      samlet[nr].chiliDressing++;
    } else if (b.chili) {
      samlet[nr].chili++;
    } else if (b.dressing) {
      samlet[nr].dressing++;
    } else {
      samlet[nr].uden++;
    }
  });

  Object.entries(samlet).forEach(([nr, data]) => {
    const div = document.createElement("div");
    div.className = "bestilling";

    let html = `
      <strong>${data.total} stk ${data.navn}</strong><br>
    `;

    if (data.chiliDressing > 0) {
      html += `• ${data.chiliDressing} stk ${data.navn} med chili og dressing<br>`;
    }
    if (data.chili > 0) {
      html += `• ${data.chili} stk ${data.navn} med chili<br>`;
    }
    if (data.dressing > 0) {
      html += `• ${data.dressing} stk ${data.navn} med dressing<br>`;
    }
    if (data.uden > 0) {
      html += `• ${data.uden} stk ${data.navn} uden<br>`;
    }

    // individuelle med kommentar
    data.special.forEach(b => {
      let tilvalg = "uden";
      if (b.chili && b.dressing) {
        tilvalg = "med chili og dressing";
      } else if (b.chili) {
        tilvalg = "med chili";
      } else if (b.dressing) {
        tilvalg = "med dressing";
      }

      html += `• 1 stk ${data.navn} ${tilvalg} : OBS (${b.kommentar})<br>`;
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
