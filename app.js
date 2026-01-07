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
//const valgtDiv = document.getElementById("valgtPizza");
const pizzaListe = document.getElementById("pizzaGrupper");
const chiliBtn = document.getElementById("chiliBtn");
const dressingBtn = document.getElementById("dressingBtn");
const hvidlogBtn = document.getElementById("hvidlogBtn");
const navnInput = document.getElementById("navnInput");
const bestillingerDiv = document.getElementById("bestillinger");
const samletListeDiv = document.getElementById("samletListe");
const kommentarInput = document.getElementById("kommentarInput");
const TILVALG_PRISER = {
  chili: 0,
  dressing: 0,
  hvidlog: 0
};

chiliBtn.textContent = `🌶️ Chili (+${TILVALG_PRISER.chili} kr)`;
dressingBtn.textContent = `🥫 Dressing (+${TILVALG_PRISER.dressing} kr)`;
hvidlogBtn.textContent = `🧄 Hvidløg (+${TILVALG_PRISER.hvidlog} kr)`;


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

    // grupper: 1–9, 10–19, 20–29 ...
    const grupper = {};

    pizzaer.forEach(pizza => {
      const start = Math.floor(pizza.nr / 10) * 10;
      const groupStart = start === 0 ? 1 : start;
      const groupEnd = groupStart === 1 ? 9 : groupStart + 9;
      const key = `${groupStart}-${groupEnd}`;


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
   btn.className = "pizza-btn";
  btn.innerHTML = `
  <div class="pizza-title">${pizza.nr} – ${pizza.navn}</div>
  <div class="pizza-price">${pizza.pris} kr</div>
  <span class="pizza-info-icon">i</span>
`;

const infoIcon = btn.querySelector(".pizza-info-icon");
infoIcon.addEventListener("click", e => {
  e.stopPropagation();
  åbnInfoPopup(pizza);
});



  btn.onclick = () => {
    valgtPizza = pizza;

    document.querySelectorAll(".pizza-btn")
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


// ===== Beregn priser =====

function beregnPris(pizza, tilvalg) {
  let total = pizza.pris;

  if (tilvalg.chili) total += TILVALG_PRISER.chili;
  if (tilvalg.dressing) total += TILVALG_PRISER.dressing;
  if (tilvalg.hvidlog) total += TILVALG_PRISER.hvidlog;

  return total;
}

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
const totalPris = beregnPris(valgtPizza, {
  chili,
  dressing,
  hvidlog
});

  bestillinger.push({
  navn: navnInput.value.trim(),
  pizza: valgtPizza,
  chili,
  dressing,
  hvidlog,
  kommentar: kommentarInput.value.trim(),
  pris: totalPris   // 👈 NY
});


gemBestillinger();
visTakPopup(totalPris);


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
  opdaterTotalAntal();
  
};


// ===== VIS BESTILLINGER =====
function visBestillinger() {
  bestillingerDiv.innerHTML = "";

  // SORTÉR ALTID ved visning (dansk alfabet)
  const sorterede = [...bestillinger].sort((a, b) =>
    a.navn.localeCompare(b.navn, "da", { sensitivity: "base" })
  );

  sorterede.forEach(b => {
    const div = document.createElement("div");
    div.className = "bestilling";

    // ===== PRIS (fallback for gamle data)
    const pris =
      typeof b.pris === "number"
        ? b.pris
        : beregnPris(b.pizza, {
            chili: b.chili,
            dressing: b.dressing,
            hvidlog: b.hvidlog
          });

    // ===== TEKST TIL SKÆRM (uændret)
    let tekst = `${b.navn}: ${b.pizza.nr} ${b.pizza.navn}`;

    const tilvalg = [];
    if (b.chili) tilvalg.push("chili");
    if (b.dressing) tilvalg.push("dressing");
    if (b.hvidlog) tilvalg.push("hvidløg");

    if (tilvalg.length > 0) {
      tekst += " + " + tilvalg.join(" og ");
    }

    tekst += ` (${pris} kr.)`;

    if (b.kommentar) {
      tekst += ` (${b.kommentar})`;
    }

    const tekstSpan = document.createElement("span");
    tekstSpan.textContent = tekst;

    // ===== EKSTRA MARKUP TIL PRINT (skjult på skærm)
    const printNavn = document.createElement("span");
    printNavn.className = "print-navn";
    printNavn.textContent = b.navn.toUpperCase();

    const printBestilling = document.createElement("span");
    printBestilling.className = "print-bestilling";

    let bestilTekst = `${b.pizza.nr} ${b.pizza.navn}`;
    if (b.chili) bestilTekst += " + Chili";
    if (b.dressing) bestilTekst += " + Dressing";
    if (b.hvidlog) bestilTekst += " + Hvidløg";
    bestilTekst += ` (${pris} kr.)`;

    printBestilling.textContent = bestilTekst;

    // container til print (bruges kun af print-CSS)
    const printContainer = document.createElement("span");
    printContainer.className = "print-row";
    printContainer.appendChild(printNavn);
    printContainer.appendChild(printBestilling);

    div.appendChild(tekstSpan);
    div.appendChild(printContainer);

    // ===== SLET-KNAP
    const sletBtn = document.createElement("button");
    sletBtn.textContent = "✖";
    sletBtn.className = "slet-knap";

    sletBtn.onclick = () => {
      if (!confirm("Slet denne bestilling?")) return;

      const realIndex = bestillinger.indexOf(b);
      bestillinger.splice(realIndex, 1);

      gemBestillinger();
      visBestillinger();
      visSamletListe();
      opdaterTotalAntal();
    };

    div.appendChild(sletBtn);
    bestillingerDiv.appendChild(div);
  });
}

// ===== Vis Samlet Liste =====

function opdaterTotalAntal() {
  const totalDiv = document.getElementById("totalAntal");
  if (!totalDiv) return;

  let totalPizzaer = 0;
  let totalPris = 0;

  bestillinger.forEach(b => {
    totalPizzaer += 1;

    const pris =
      typeof b.pris === "number"
        ? b.pris
        : beregnPris(b.pizza, {
            chili: b.chili,
            dressing: b.dressing,
            hvidlog: b.hvidlog
          });

    totalPris += pris;
  });

  totalDiv.textContent = `${totalPizzaer} pizzaer i alt – ${totalPris} kr`;
}



function visSamletListe() {
  samletListeDiv.innerHTML = "";

  const samlet = {};

  bestillinger.forEach(b => {
    const nr = b.pizza.nr;

    if (!samlet[nr]) {
      samlet[nr] = {
        navn: b.pizza.navn,
        total: 0,
        counts: {},
        special: []
      };
    }

    samlet[nr].total++;

    const tilvalg = [];
    if (b.chili) tilvalg.push("chili");
    if (b.dressing) tilvalg.push("dressing");
    if (b.hvidlog) tilvalg.push("hvidløg");

    const key = tilvalg.length ? tilvalg.join(" + ") : "uden";

    if (b.kommentar) {
      samlet[nr].special.push({ key, kommentar: b.kommentar });
      return;
    }

    if (!samlet[nr].counts[key]) {
      samlet[nr].counts[key] = 0;
    }
    samlet[nr].counts[key]++;
  });

  Object.values(samlet).forEach(data => {
    const div = document.createElement("div");
    div.className = "bestilling";

    const title = document.createElement("div");
    title.className = "bestilling-title";
    title.innerHTML = `
  <span class="antal-linje">
    ${data.total} x ${data.navn}
  </span>
`;


    const ul = document.createElement("ul");
    ul.className = "bestilling-detaljer";

    Object.entries(data.counts).forEach(([key, antal]) => {
      const li = document.createElement("li");
      li.textContent =
        key === "uden"
          ? `${antal} stk ${data.navn}`
          : `${antal} stk ${data.navn} med ${key.replaceAll(" + ", " og ")}`;
      ul.appendChild(li);
    });

    data.special.forEach(s => {
      const li = document.createElement("li");
      li.textContent =
        s.key === "uden"
          ? `1 stk ${data.navn} – OBS (${s.kommentar})`
          : `1 stk ${data.navn} med ${s.key.replaceAll(" + ", " og ")} – OBS (${s.kommentar})`;
      ul.appendChild(li);
    });

    div.appendChild(title);
    div.appendChild(ul);
    samletListeDiv.appendChild(div);
  });
}


// =========================
// INFO POPUP
// =========================
function åbnInfoPopup(pizza) {
  document.getElementById("modalTitle").textContent =
    `${pizza.nr} – ${pizza.navn}`;

  document.getElementById("modalText").textContent =
    pizza.beskrivelse || "Ingen beskrivelse";

  document.getElementById("infoModal").classList.remove("hidden");
}

function lukInfoPopup() {
  document.getElementById("infoModal").classList.add("hidden");
}


// ===== NULSTIL =====
document.getElementById("nulstilBtn").onclick = () => {
  if (!confirm("Nulstil alle bestillinger?")) return;

  bestillinger = [];
  localStorage.removeItem("pizzaBestillinger");

  visBestillinger();
  visSamletListe();
  opdaterTotalAntal();
};


// ===== GEM LOKALT =====

function gemBestillinger() {
  localStorage.setItem("pizzaBestillinger", JSON.stringify(bestillinger));
}

// ===== opdater listevisning ved reload =====
document.addEventListener("DOMContentLoaded", () => {
  visBestillinger();
  visSamletListe();
  opdaterTotalAntal();
});


// =========================
// POPUP EVENTS (DOM READY)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("modalClose")
    .addEventListener("click", lukInfoPopup);

  document
    .querySelector("#infoModal .modal-backdrop")
    .addEventListener("click", lukInfoPopup);
});

function visTakPopup(beløb) {
  const mpBox = document.querySelector(".mobilepay-box");

  const mpNavn = mpBox?.dataset.mobilepayName || "";
  const mpNummer = mpBox?.dataset.mobilepayBox || "";

  document.getElementById("modalTitle").textContent =
    "Tak for din bestilling";

  document.getElementById("modalText").textContent =
  `Husk at overføre ${beløb},- kr. med MobilePay til\n(BOX ${mpNummer}) ${mpNavn} `;


  document.getElementById("infoModal").classList.remove("hidden");
}


// =========================
// PRINT + MAIL (Formspree)
// =========================
document.getElementById("klarBtn").onclick = () => {
  if (bestillinger.length === 0) {
    alert("Der er ingen bestillinger at printe.");
    return;
  }

  const ok = confirm(
    "Er du helt sikker på, at du vil printe og afslutte ordren?\n\n" +
    "Når du fortsætter, bør ordren ikke ændres."
  );

  if (!ok) {
    return; // brugeren fortrød
  }

  // ===== BEREGN TOTALER
  let totalPizzaer = 0;
  let totalPris = 0;

  bestillinger.forEach(b => {
    totalPizzaer += 1;

    const pris =
      typeof b.pris === "number"
        ? b.pris
        : beregnPris(b.pizza, {
            chili: b.chili,
            dressing: b.dressing,
            hvidlog: b.hvidlog
          });

    totalPris += pris;
  });

  // ===== SEND MAIL (KUN EFTER OK)
  fetch("https://formspree.io/f/xnjneddp", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message:
        `Pizzaordre afsluttet\n` +
        `Antal pizzaer: ${totalPizzaer}\n` +
        `Samlet beløb: ${totalPris} kr.`,
      tidspunkt: new Date().toLocaleString("da-DK")
    })
  });

  // ===== PRINT (din eksisterende print-kode fortsætter her)
  const printWindow = window.open("", "", "width=900,height=700");

  const pizzariaHTML = samletListeDiv.innerHTML;
  const internHTML = bestillingerDiv.innerHTML;

  // 👇 her indsætter du dit printWindow.document.write(...)

  // ===== PRINT
  printWindow.document.write(`
    <html>
      <head>
        <title>Pizzabestilling</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 10mm;
            color: #000;
          }

          h2 {
            margin: 0 0 10px 0;
            border-bottom: 2px solid #000;
            padding-bottom: 6px;
          }

          .print-section {
            display: block;
          }

          .page-after {
            page-break-after: always;
          }

          .slet-knap {
            display: none;
          }

          .bestilling {
            margin-bottom: 14px;
          }

          .bestilling > span:first-child {
            display: none;
          }

          .print-row {
            display: grid;
            grid-template-columns: 12ch 1fr;
            column-gap: 14px;
            font-size: 12pt;
            line-height: 1.4;
          }

          .print-navn {
            font-weight: 700;
            white-space: nowrap;
          }

          .print-bestilling {
            white-space: nowrap;
          }
        </style>
      </head>

      <body>

        <div class="print-section page-after">
          <h2>
            🍕 Bestillingsliste (pizzaria)
            <span class="total-antal">
              – ${totalPizzaer} pizzaer i alt – ${totalPris} kr.
            </span>
          </h2>
          ${pizzariaHTML}
        </div>

        <div class="print-section">
          <h2>👤 Intern bestillingsliste</h2>
          ${internHTML}
        </div>

        <script>
          window.onload = () => {
            window.print();
            window.close();
          };
        </script>

      </body>
    </html>
  `);

  printWindow.document.close();
};

function loadMobilePay() {
  const mpBox = document.querySelector(".mobilepay-box");
  if (!mpBox) return;

  const gemt = JSON.parse(localStorage.getItem("mobilepayBox"));
  if (!gemt) return;

  mpBox.dataset.mobilepayName = gemt.name;
  mpBox.dataset.mobilepayBox = gemt.box;
  mpBox.querySelector(".mobilepay-code").textContent = gemt.box;
}

document.addEventListener("DOMContentLoaded", () => {
  loadMobilePay();

  const editBtn = document.querySelector(".mobilepay-edit");
  const mpBox = document.querySelector(".mobilepay-box");

  if (!editBtn || !mpBox) return;

  editBtn.onclick = () => {
  const nytNavn = prompt(
    "Navn på MobilePay boks:",
    mpBox.dataset.mobilepayName
  );
  if (!nytNavn) return;

  const nytNummer = prompt(
    "MP BOX nummer:",
    mpBox.dataset.mobilepayBox
  );
  if (!nytNummer) return;

  // gem data
  mpBox.dataset.mobilepayName = nytNavn;
  mpBox.dataset.mobilepayBox = nytNummer;

  // 👇 VIS NUMMERET I DEN GULE BOKS
  mpBox.querySelector(".mobilepay-code").textContent = nytNummer;

  localStorage.setItem(
    "mobilepayBox",
    JSON.stringify({
      name: nytNavn,
      box: nytNummer
    })
  );
};

   
});

