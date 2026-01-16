// ===== STATE =====
let valgtKoed1 = "";
let valgtKoed2 = "";
let valgtKoed3 = "";

let valgtPizza = null;
let chili = false;
let dressing = false;
let hvidlog = false;
let bestillinger = [];
const gemte = localStorage.getItem("pizzaBestillinger");
if (gemte) {
  bestillinger = JSON.parse(gemte);
}

// ===== KØD VALG =====
const KOED_TYPER = [
  "kebab",
  "kylling",
  "oksekød",
  "kødfars",
  "bacon",
  "skinke",
  "pepperoni",
  "sucuk",
  "cocktailpølser",
  "fisk",
  "rejer",
  "pulled pork"
];

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
const pizzaTooltip = document.createElement("div");
pizzaTooltip.className = "pizza-tooltip";
document.body.appendChild(pizzaTooltip);

let tooltipTimer = null;

chiliBtn.textContent = `🌶️ Chili (+${TILVALG_PRISER.chili} kr)`;
dressingBtn.textContent = `🥫 Dressing (+${TILVALG_PRISER.dressing} kr)`;
hvidlogBtn.textContent = `🧄 Hvidløg (+${TILVALG_PRISER.hvidlog} kr)`;


// slå tilvalg fra ved start
chiliBtn.disabled = true;
dressingBtn.disabled = true;
hvidlogBtn.disabled = true;

// ===== KØD DROPDOWN =====

const koedSelect = document.getElementById("koedSelect");
const koedSelect2 = document.getElementById("koedSelect2");
const koedSelect3 = document.getElementById("koedSelect3");

KOED_TYPER.forEach(k => {
  const opt = document.createElement("option");
  opt.value = k;
  opt.textContent = k.charAt(0).toUpperCase() + k.slice(1);
  koedSelect.appendChild(opt);
});


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

btn.classList.add("pizza-btn");

if (pizza.nr === 23) {
  btn.classList.add("veg-special");
}

btn.dataset.koedMatch = pizza.beskrivelse?.toLowerCase() || "";

btn.innerHTML = `
  <div class="pizza-title">
    ${pizza.nr} – ${pizza.navn}
    ${pizza.nr === 23 ? '<span class="veg-icon">🥬</span>' : ''}
  </div>
  <div class="pizza-price">${pizza.pris} kr</div>
  <span class="pizza-info-icon">i</span>
`;
btn.dataset.pizzaNr = pizza.nr;


const infoIcon = btn.querySelector(".pizza-info-icon");
infoIcon.addEventListener("click", e => {
  e.stopPropagation();
  åbnInfoPopup(pizza);
});
// ===== HOVER TOOLTIP (0,6s delay) =====
btn.addEventListener("mouseenter", e => {
  clearTimeout(tooltipTimer);

  tooltipTimer = setTimeout(() => {
    const text = pizza.beskrivelse || "Ingen beskrivelse";

    pizzaTooltip.textContent = text;

const rect = btn.getBoundingClientRect();
const scrollX = window.pageXOffset;
const scrollY = window.pageYOffset;

const tooltipWidth = 280;
const margin = 10;

let left = rect.right + scrollX + margin;

// hvis der ikke er plads til højre → vis til venstre
if (left + tooltipWidth > window.innerWidth + scrollX) {
  left = rect.left + scrollX - tooltipWidth - margin;
}

pizzaTooltip.style.left = left + "px";
pizzaTooltip.style.top = rect.top + scrollY + "px";



    pizzaTooltip.classList.add("show");
  }, 600);
});

btn.addEventListener("mouseleave", () => {
  clearTimeout(tooltipTimer);
  pizzaTooltip.classList.remove("show");
});

document.getElementById("hurtigLucaBtn").addEventListener("click", () => {
  const lucaBtn = document.querySelector(
    '.pizza-btn[data-pizza-nr="32"]'
  );
  const navnInput = document.getElementById("navnInput");

  if (!lucaBtn || !navnInput) return;

  // 1️⃣ scroll til pizzaen og vælg den
  lucaBtn.scrollIntoView({ behavior: "smooth", block: "center" });
  lucaBtn.click();

  // 2️⃣ scroll TIL NAVNEFELTET og fokusér
  setTimeout(() => {
    navnInput.scrollIntoView({ behavior: "smooth", block: "center" });
    navnInput.focus();
    navnInput.select(); // marker evt. tekst
  }, 300);
});


// ===== KØD DROPDOWN HAR KØD =====
function pizzaHarKoed(pizza, koed) {
  if (!koed) return true;
  return pizza.beskrivelse
    ?.toLowerCase()
    .includes(koed.toLowerCase());
}
function pizzaMatcherKoed(pizza, koedListe) {
  const tekst = pizza.beskrivelse?.toLowerCase() || "";
  return koedListe.every(k => tekst.includes(k));
}
function opdaterPizzaFilter() {
  const aktiveKoed = [valgtKoed1, valgtKoed2, valgtKoed3].filter(Boolean);

  document.querySelectorAll(".pizza-btn").forEach(btn => {
    const txt = btn.dataset.koedMatch || "";
    const match =
      aktiveKoed.length === 0 ||
      aktiveKoed.every(k => txt.includes(k));

    btn.style.display = match ? "" : "none";
  });
}

// ===== KØD DROPDOWN 1-2-3 KØD =====
koedSelect.addEventListener("change", () => {
  valgtKoed1 = koedSelect.value;
  valgtKoed2 = "";
  valgtKoed3 = "";

  // nulstil trin 2
  koedSelect2.innerHTML = `<option value="">– Intet ekstra valg –</option>`;
  koedSelect2.disabled = !valgtKoed1;

  // nulstil trin 3
  koedSelect3.innerHTML = `<option value="">– Valgfrit –</option>`;
  koedSelect3.disabled = true;

  if (!valgtKoed1) {
    opdaterPizzaFilter();
    return;
  }

  // byg TRIN 2
  const tæller = {};

  document.querySelectorAll(".pizza-btn").forEach(btn => {
    const txt = btn.dataset.koedMatch || "";
    if (txt.includes(valgtKoed1)) {
      KOED_TYPER.forEach(k => {
        if (k !== valgtKoed1 && txt.includes(k)) {
          tæller[k] = (tæller[k] || 0) + 1;
        }
      });
    }
  });

  Object.entries(tæller)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k]) => {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = k;
      koedSelect2.appendChild(opt);
    });

  opdaterPizzaFilter();
});
koedSelect2.addEventListener("change", () => {
  valgtKoed2 = koedSelect2.value;
  valgtKoed3 = "";

  koedSelect3.innerHTML = `<option value="">– Valgfrit –</option>`;
  koedSelect3.disabled = !valgtKoed2;

  if (!valgtKoed2) {
    opdaterPizzaFilter();
    return;
  }

  // byg TRIN 3 (kun kød der findes sammen med 1 + 2)
  const tæller = {};

  document.querySelectorAll(".pizza-btn").forEach(btn => {
    const txt = btn.dataset.koedMatch || "";
    if (txt.includes(valgtKoed1) && txt.includes(valgtKoed2)) {
      KOED_TYPER.forEach(k => {
        if (
          k !== valgtKoed1 &&
          k !== valgtKoed2 &&
          txt.includes(k)
        ) {
          tæller[k] = (tæller[k] || 0) + 1;
        }
      });
    }
  });

  Object.entries(tæller)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k]) => {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = k;
      koedSelect3.appendChild(opt);
    });

  opdaterPizzaFilter();
});
koedSelect3.addEventListener("change", () => {
  valgtKoed3 = koedSelect3.value;
  opdaterPizzaFilter();
});

const nulstilFilterBtn = document.getElementById("nulstilFilterBtn");

nulstilFilterBtn.addEventListener("click", () => {
  // nulstil værdier
  valgtKoed1 = "";
  valgtKoed2 = "";
  valgtKoed3 = "";

  // nulstil dropdowns
  koedSelect.value = "";
  koedSelect2.value = "";
  koedSelect3.value = "";

  koedSelect2.disabled = true;
  koedSelect3.disabled = true;

  // ryd dropdown 2 og 3 indhold
  koedSelect2.innerHTML = `<option value="">– Intet ekstra valg –</option>`;
  koedSelect3.innerHTML = `<option value="">– Intet ekstra valg –</option>`;

  // vis alle pizzaer igen
  opdaterPizzaFilter();
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

      // 👇 NYT: vis valgt pizza over navnefeltet
  const info = document.getElementById("valgtPizzaInfo");
  info.textContent = `Du har valgt nr. ${pizza.nr} – ${pizza.navn}`;
  info.classList.remove("hidden");

    navnInput.focus();
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
  pris: totalPris,
  betalt: false   // 👈 NY
});


gemBestillinger();

chili = false;
dressing = false;
hvidlog = false;

chiliBtn.classList.remove("valgt");
dressingBtn.classList.remove("valgt");
hvidlogBtn.classList.remove("valgt");

kommentarInput.value = "";
document.getElementById("valgtPizzaInfo").classList.add("hidden");
  navnInput.value = "";
  visBestillinger();
  visSamletListe();
  opdaterTotalAntal();
  
};
navnInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    const ok = confirm(
      `Tilføj bestilling for "${navnInput.value.trim()}"?\n\n` +
      "↵ = OK    Esc = Annuller"
    );

    if (!ok) return;

    document.getElementById("tilføjBtn").click();
    

  }
});



// ===== VIS BESTILLINGER =====
function visBestillinger() {
  bestillingerDiv.innerHTML = "";

const header = document.createElement("div");
header.className = "bestilling-row header";
header.innerHTML = `
  <span>Betalt</span>
  <span>Navn</span>
  <span>Nr</span>
  <span>Pizza</span>
  <span></span>
`;
bestillingerDiv.appendChild(header);


  // SORTÉR ALTID ved visning (dansk alfabet)
  const sorterede = [...bestillinger].sort((a, b) =>
    a.navn.localeCompare(b.navn, "da", { sensitivity: "base" })
  );

  sorterede.forEach(b => {
    const div = document.createElement("div");
    div.className = "bestilling-row";

    // ===== PRIS (fallback for gamle data)
    const pris =
      typeof b.pris === "number"
        ? b.pris
        : beregnPris(b.pizza, {
            chili: b.chili,
            dressing: b.dressing,
            hvidlog: b.hvidlog
          });

    // ===== TEKST TIL SKÆRM
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

    // ===== CHECKBOX (BETALT) – WEBSIDE
    const betaltCheckbox = document.createElement("input");
    betaltCheckbox.type = "checkbox";
    betaltCheckbox.checked = b.betalt === true;
    betaltCheckbox.title = "Marker som betalt";

    betaltCheckbox.onchange = () => {
      b.betalt = betaltCheckbox.checked;
      gemBestillinger();
    };

    // ===== EKSTRA MARKUP TIL PRINT
    const printNavn = document.createElement("span");
    printNavn.className = b.betalt ? "print-navn betalt" : "print-navn";
    printNavn.textContent = b.navn.toUpperCase();

    const printBestilling = document.createElement("span");
    printBestilling.className = "print-bestilling";

    let bestilTekst = `${b.pizza.nr} ${b.pizza.navn}`;
    if (b.chili) bestilTekst += " + Chili";
    if (b.dressing) bestilTekst += " + Dressing";
    if (b.hvidlog) bestilTekst += " + Hvidløg";
    bestilTekst += ` (${pris} kr.)`;

    printBestilling.textContent = bestilTekst;

   const printContainer = document.createElement("span");
printContainer.className = "print-row";

// 👇 DETTE ER DET VIGTIGE
if (b.betalt) {
  printContainer.classList.add("betalt");
}

printContainer.appendChild(printNavn);
printContainer.appendChild(printBestilling);


    // ===== SAMLE DOM
   // Navn
const navnSpan = document.createElement("span");
navnSpan.textContent = b.navn;

// Nr
const nrSpan = document.createElement("span");
nrSpan.textContent = b.pizza.nr;

// Pizza + tilvalg
const pizzaSpan = document.createElement("span");
pizzaSpan.textContent = tekstSpan.textContent.replace(`${b.navn}: `, "");

// ===== KNAP-CONTAINER (holder ✏️ og ❌ på samme linje) =====
const actionBox = document.createElement("span");
actionBox.className = "action-box";

// ===== REDIGER-KNAP =====
const redigerBtn = document.createElement("button");
redigerBtn.textContent = "✏️";
redigerBtn.className = "rediger-knap";

redigerBtn.onclick = () => {
  if (window.orderLocked) {
    alert("Ordren er låst og kan ikke ændres.");
    return;
  }

  const nytNavn = prompt("Ret navn:", b.navn);
  if (!nytNavn) return;

  b.navn = nytNavn.trim();

  gemBestillinger();
  visBestillinger();
  visSamletListe();
  opdaterTotalAntal();
};

// ===== SLET-KNAP =====
const sletBtn = document.createElement("button");
sletBtn.textContent = "✖";
sletBtn.className = "slet-knap";

sletBtn.onclick = () => {
  if (window.orderLocked) {
    alert("Ordren er låst og kan ikke ændres.");
    return;
  }

  if (!confirm("Slet denne bestilling?")) return;

  const realIndex = bestillinger.indexOf(b);
  bestillinger.splice(realIndex, 1);

  gemBestillinger();
  visBestillinger();
  visSamletListe();
  opdaterTotalAntal();
};

// ===== SAML KNAPPERNE I BOKSEN =====
actionBox.appendChild(redigerBtn);
actionBox.appendChild(sletBtn);

// ===== SAML DOM I RÆKKEN (KUN ÉN GANG) =====
div.appendChild(betaltCheckbox);
div.appendChild(navnSpan);
div.appendChild(nrSpan);
div.appendChild(pizzaSpan);
div.appendChild(actionBox);

// Print (skjult på web)
div.appendChild(printContainer);

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
        nr: nr,
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
    ${data.total} x ${data.nr} ${data.navn}
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

// ===== BYG TEKSTLISTE TIL MAIL =====
const samletMailListe = (() => {
  const samlet = {};

  bestillinger.forEach(b => {
    const nr = b.pizza.nr;
    const navn = b.pizza.navn;

    if (!samlet[nr]) {
      samlet[nr] = {
        navn,
        total: 0
      };
    }

    samlet[nr].total++;
  });

  return Object.entries(samlet)
    .sort((a, b) => b[1].total - a[1].total) // mest solgte øverst
    .map(([nr, data]) => {
      return `${data.total}x  Nr. ${nr} – ${data.navn}`;
    })
    .join("\n");
})();

// ===== SEND MAIL (KUN EFTER OK)
fetch("https://formspree.io/f/xnjneddp", {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    message:
      `Pizzaordre afsluttet\n\n` +
      `Antal pizzaer: ${totalPizzaer}\n` +
      `Samlet beløb: ${totalPris} kr.\n\n` +
      `🍕 Pizzafordeling:\n` +
      `${samletMailListe}`,
    tidspunkt: new Date().toLocaleString("da-DK")
  })
});


  // ===== PRINT (din eksisterende print-kode fortsætter her)
  const printWindow = window.open("", "", "width=900,height=700");
  
  // 🔄 Tving opdatering så betalt-status er korrekt
visBestillinger();

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

      /* =========================
         SKJUL WEB-ELEMENTER
         ========================= */
      input[type="checkbox"],
      .slet-knap {
        display: none !important;
      }

      /* =========================
         INTERN LISTE – PRINT
         ========================= */

      /* skjul ALT i web-rækken */
      .bestilling-row > * {
        display: none !important;
      }

      /* vis KUN print-rækken */
      .bestilling-row .print-row {
        display: grid !important;
        grid-template-columns: 28px 120px 1fr;
        column-gap: 12px;
        font-size: 12pt;
        line-height: 1.4;
        margin-bottom: 8px;
        align-items: center;
      }

      /* checkbox-felt */
      .print-row::before {
        content: "☐";
        font-size: 16px;
      }

      .print-row.betalt::before {
        content: "☑";
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

    <!-- PIZZARIA LISTE -->
    <div class="print-section page-after">
      <h2>
        🍕 Bestillingsliste (pizzaria)
        <span class="total-antal">
          – ${totalPizzaer} pizzaer i alt – ${totalPris} kr.
        </span>
      </h2>

      ${pizzariaHTML}
    </div>

    <!-- INTERN LISTE -->
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
// =========================
// MOBILEPAY + QR SYSTEM (CLEAN + STABLE)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const mpBox = document.querySelector(".mobilepay-box");
  const editBtn = document.querySelector(".mobilepay-edit");
  const qrUpload = document.getElementById("mpQrUpload");
  const qrImage = document.getElementById("mpQrImage");
  const deleteBtn = document.getElementById("mpQrDelete");

  if (!mpBox || !editBtn || !qrUpload || !qrImage || !deleteBtn) {
    console.warn("❌ MobilePay elements missing");
    return;
  }


  // =====================
  // LOAD SAVED BOX
  // =====================
  const gemt = JSON.parse(localStorage.getItem("mobilepayBox"));
  if (gemt) {
    mpBox.dataset.mobilepayName = gemt.name;
    mpBox.dataset.mobilepayBox = gemt.box;

    mpBox.querySelector(".mobilepay-code").innerHTML = `
      <div class="mp-box-nr">${gemt.box}</div>
      <div class="mp-box-navn">${gemt.name}</div>
    `;
  }

  // =====================
  // LOAD SAVED QR
  // =====================
  const gemtQR = localStorage.getItem("mobilepayQR");
  if (gemtQR) {
    qrImage.src = gemtQR;
    qrImage.classList.remove("hidden");
    deleteBtn.classList.remove("hidden");
  }

  // =====================
  // PEN CLICK
  // =====================
  editBtn.addEventListener("click", () => {
    const valg = confirm(
      "OK = Ret MobilePay navn/nummer\nAnnuller = Upload QR-kode"
    );

    // Upload QR
    if (!valg) {
      qrUpload.value = "";
      qrUpload.click();
      return;
    }

    // Rediger boks
    const nytNavn = prompt(
      "Navn på MobilePay boks:",
      mpBox.dataset.mobilepayName || ""
    );
    if (!nytNavn) return;

    const nytNummer = prompt(
      "MP BOX nummer:",
      mpBox.dataset.mobilepayBox || ""
    );
    if (!nytNummer) return;

    mpBox.dataset.mobilepayName = nytNavn;
    mpBox.dataset.mobilepayBox = nytNummer;

    mpBox.querySelector(".mobilepay-code").innerHTML = `
      <div class="mp-box-nr">${nytNummer}</div>
      <div class="mp-box-navn">${nytNavn}</div>
    `;

    localStorage.setItem(
      "mobilepayBox",
      JSON.stringify({ name: nytNavn, box: nytNummer })
    );
  });

  // =====================
  // QR UPLOAD
  // =====================
  qrUpload.addEventListener("change", () => {
    const file = qrUpload.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      qrImage.src = reader.result;
      qrImage.classList.remove("hidden");
      deleteBtn.classList.remove("hidden");

      localStorage.setItem("mobilepayQR", reader.result);
    };

    reader.readAsDataURL(file);
  });

  // =====================
  // DELETE QR
  // =====================
  deleteBtn.addEventListener("click", () => {
    if (!confirm("Vil du fjerne QR-koden?")) return;

    qrImage.src = "";
    qrImage.classList.add("hidden");
    deleteBtn.classList.add("hidden");

    localStorage.removeItem("mobilepayQR");
  });

  console.log("✅ MobilePay system loaded cleanly");
});

function openQrOverlay(src) {
  if (!src) return;

  const overlay = document.getElementById("qrOverlay");
  const img = document.getElementById("qrOverlayImg");

  img.src = src;
  overlay.style.display = "flex";
}

function closeQrOverlay() {
  document.getElementById("qrOverlay").style.display = "none";
}


