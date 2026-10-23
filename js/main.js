// Getränke Bügener – Entwurf. Bierdeckel, Festplaner, Öffnungszeiten.
(function () {
  "use strict";

  var RINGTEXT = "FÜR IHRE FESTE NUR DAS BESTE • BÜGENER BIER-VERLAG UND ZELTVERLEIH • GRONAU-EPE • ";

  function ringSVG(id) {
    return '<svg class="deckel-ring" viewBox="0 0 400 400" aria-hidden="true">' +
      '<defs><path id="ring-' + id + '" d="M200,34 a166,166 0 1,1 -0.01,0"/></defs>' +
      '<circle cx="200" cy="200" r="188" fill="none" class="druck" stroke="#B8202A" stroke-width="3.2" style="fill:none"/>' +
      '<circle cx="200" cy="200" r="148" fill="none" stroke="#B8202A" stroke-width="1.4" opacity=".85"/>' +
      '<text class="ringtext"><textPath href="#ring-' + id + '" textLength="1030" lengthAdjust="spacing">' + RINGTEXT + '</textPath></text>' +
      '</svg>';
  }

  // Pseudo-Zufall, damit die Striche handgemacht wirken, aber nicht springen
  function wackel(i, s) { var x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return (x - Math.floor(x)) - 0.5; }

  function stricheSVG(anzahl, vorher) {
    var teile = [], x = 6, gruppen = Math.ceil(anzahl / 5), breite = Math.max(gruppen * 54, 54);
    for (var i = 0; i < anzahl; i++) {
      var inGruppe = i % 5, neu = i >= vorher ? ' class="neu" style="animation-delay:' + ((i - vorher) * 0.06) + 's"' : "";
      if (inGruppe < 4) {
        var sx = x + inGruppe * 9 + wackel(i, 1) * 2, top = 8 + wackel(i, 2) * 3, unten = 42 + wackel(i, 3) * 3;
        teile.push('<path' + neu + ' d="M' + sx.toFixed(1) + ' ' + top.toFixed(1) + ' Q' + (sx + wackel(i, 4) * 2).toFixed(1) + ' 25 ' + (sx + wackel(i, 5) * 1.5).toFixed(1) + ' ' + unten.toFixed(1) + '"/>');
      } else {
        teile.push('<path' + neu + ' d="M' + (x - 4) + ' ' + (36 + wackel(i, 6) * 2).toFixed(1) + ' L' + (x + 33) + ' ' + (13 + wackel(i, 7) * 2).toFixed(1) + '"/>');
        x += 54;
      }
      if (inGruppe < 4 && i === anzahl - 1) x += 54;
    }
    return '<svg class="d-striche" viewBox="0 0 ' + breite + ' 50" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + teile.join("") + '</svg>';
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function zeichneDeckel(el, d, vorher) {
    var liste = d.verleih.map(function (v) { return "<li>" + esc(v) + "</li>"; })
      .concat(d.getraenke.map(function (g) { return '<li class="getraenk">' + esc(g) + "</li>"; })).join("");
    var fuss = [d.datum, d.ort].filter(Boolean).map(esc).join(" · ");
    if (d.name) fuss += (fuss ? "<br>" : "") + esc(d.name);
    el.querySelector(".deckel-inhalt").innerHTML =
      '<span class="d-label">Deckel für</span>' +
      '<span class="d-anlass' + (d.anlass ? "" : " leer") + ((d.anlass || "").length > 13 ? " lang" : "") + '">' + esc(d.anlass || "Ihr Fest") + "</span>" +
      stricheSVG(Math.ceil(d.gaeste / 10), vorher) +
      '<span class="d-gaeste">ca. ' + d.gaeste + " Gäste</span>" +
      (liste ? '<ul class="d-liste' + (d.verleih.length + d.getraenke.length > 7 ? " voll" : "") + '">' + liste + "</ul>" : '<span class="d-leer">Zelt? Bänke? Fassbier?<br>Einfach links ankreuzen.</span>') +
      '<span class="d-fuss">' + fuss + "</span>";
  }

  var decks = document.querySelectorAll("[data-deckel]");
  decks.forEach(function (el, i) { el.innerHTML = ringSVG(i) + '<div class="deckel-inhalt"></div>'; });

  var beispiel = document.querySelector('[data-deckel="beispiel"]');
  if (beispiel) {
    zeichneDeckel(beispiel, { anlass: "Gartenfest", gaeste: 80, verleih: ["Zelt", "Tische", "Bänke", "Kühlwagen", "Zapfanlage"], getraenke: ["Fassbier"], datum: "im Juni", ort: "Epe", name: "" }, 0);
  }

  // Festplaner
  var form = document.getElementById("planer"), planerDeckel = document.querySelector('[data-deckel="planer"]');
  if (form && planerDeckel) {
    var range = form.querySelector("#gaeste"), out = form.querySelector("#gaeste-wert"), hinweis = form.querySelector("#gaeste-hinweis");
    var letzteStriche = 0;
    var datumFmt = function (v) {
      if (!v) return "";
      var t = new Date(v + "T12:00:00");
      return isNaN(t) ? "" : t.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "long" });
    };
    var lies = function () {
      var fd = new FormData(form);
      return { anlass: fd.get("anlass") || "", gaeste: +range.value, verleih: fd.getAll("verleih"), getraenke: fd.getAll("getraenke"), datum: datumFmt(fd.get("datum")), ort: (fd.get("ort") || "").trim(), name: (fd.get("name") || "").trim() };
    };
    var update = function () {
      var d = lies(), striche = Math.ceil(d.gaeste / 10);
      out.textContent = d.gaeste + " Gäste";
      if (d.gaeste > 160) { hinweis.textContent = "Mehr als 160 Gäste? Am besten kurz anrufen: 02565 3222."; hinweis.classList.add("warn"); }
      else { hinweis.textContent = "Jeder Strich auf dem Deckel steht für zehn Gäste."; hinweis.classList.remove("warn"); }
      zeichneDeckel(planerDeckel, d, Math.min(letzteStriche, striche));
      letzteStriche = striche;
    };
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var danke = document.getElementById("danke");
      danke.hidden = false;
      danke.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    update();
  }

  // Öffnungszeiten: Mo–Fr 8.00–12.30 und 14.30–18.30 (Mi nachmittags zu), Sa 8.00–13.00
  var ZEITEN = { 1: [[480, 750], [870, 1110]], 2: [[480, 750], [870, 1110]], 3: [[480, 750]], 4: [[480, 750], [870, 1110]], 5: [[480, 750], [870, 1110]], 6: [[480, 780]], 0: [] };
  function hm(m) { return Math.floor(m / 60) + "." + String(m % 60).padStart(2, "0"); }
  function status() {
    var jetzt = new Date(), tag = jetzt.getDay(), min = jetzt.getHours() * 60 + jetzt.getMinutes();
    var heute = ZEITEN[tag], offen = null, naechste = null;
    heute.forEach(function (z) { if (min >= z[0] && min < z[1]) offen = z; else if (min < z[0] && !naechste) naechste = z; });
    var text;
    if (offen) text = "Jetzt geöffnet bis " + hm(offen[1]) + " Uhr";
    else if (naechste) text = "Geschlossen · öffnet um " + hm(naechste[0]) + " Uhr";
    else {
      for (var i = 1; i <= 7; i++) { var t = (tag + i) % 7; if (ZEITEN[t].length) { text = "Geschlossen · öffnet " + (i === 1 ? "morgen" : ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][t] + ".") + " um " + hm(ZEITEN[t][0][0]) + " Uhr"; break; } }
    }
    document.querySelectorAll("[data-offen]").forEach(function (el) { el.classList.toggle("ja", !!offen); el.querySelector("span").textContent = text; });
    var zeile = document.querySelector('.zeiten tr[data-tag="' + tag + '"]');
    if (zeile) zeile.classList.add("heute");
  }
  status();
  setInterval(status, 60000);
})();
