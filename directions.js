/* ============================================================
   THATWAY · CAB — WEG-ANWEISUNGEN (hier bearbeitbar)
   ------------------------------------------------------------
   Pro Raum: eine Liste mit einem Text je Schritt (in Reihenfolge).
   Aendere z.B. "Follow the line" in "Turn left", "Turn right",
   "Go straight", "Continue to the end of the hall" usw.
   "Take the elevator to Floor X" = Aufzug-Schritt (nicht loeschen).
   Letzter Eintrag "" = Ankunft (wird ignoriert).
   ============================================================ */
const DIRECTIONS = {
  /* 101 — CAB Lobby */
  "B101": [""],
  /* 103 — Student Lounge */
  "B103": ["Follow the line", ""],
  /* 104 — Faculty Offices */
  "B104": ["Follow the line", "Follow the line", "Follow the line", ""],
  /* 105 — Student Lounge / Recreational Sports */
  "B105": ["Follow the line", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 108 — Office */
  "B108": ["Follow the line", "Follow the line", "Follow the line", ""],
  /* 114 — Restroom */
  "B114": ["Follow the line", "Follow the line", ""],
  /* 115 — Restroom */
  "B115": ["Follow the line", "Follow the line", ""],
  /* 116 — Mail and Receiving Department */
  "B116": ["Follow the line", "Follow the line", ""],
  /* 117 — Office of Facilities / Construction */
  "B117": ["Follow the line", "Follow the line", ""],
  /* 123 — Restroom */
  "B123": ["Follow the line", "Follow the line", ""],
  /* 124 — Restroom */
  "B124": ["Follow the line", "Follow the line", ""],
  /* 128 — Family Restroom */
  "B128": ["Follow the line", "Follow the line", ""],
  /* 134 — Student Lounge */
  "B134": ["Follow the line", "Follow the line", "Follow the line", ""],
  /* 135 — Student Commuter Lounge */
  "B135": ["Follow the line", ""],
  /* 135A — TAMUSA Kiosk */
  "B135A": ["Follow the line", "Follow the line", ""],
  /* 201 — Lobby */
  "B201": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 202 — Academic Advising */
  "B202": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 203 — Faculty Offices */
  "B203": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", ""],
  /* 208 — Writing, Language and Digital Composing Center */
  "B208": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 209 — Testing Center */
  "B209": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 210 — Disability Support Services */
  "B210": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 211 — Disability Support Services */
  "B211": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 216 — Restroom */
  "B216": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", ""],
  /* 217 — Restroom */
  "B217": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", ""],
  /* 218 — Classroom */
  "B218": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", ""],
  /* 219 — Classroom */
  "B219": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", ""],
  /* 220 — Conference Room */
  "B220": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", ""],
  /* 221 — Academic Coaching Office */
  "B221": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", ""],
  /* 222 — Academic Coaching */
  "B222": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 223 — Classroom */
  "B223": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", ""],
  /* 225 — Restroom */
  "B225": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", ""],
  /* 226 — Restroom */
  "B226": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", ""],
  /* 231 — ITS Business */
  "B231": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 232 — Web Dev Team */
  "B232": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 233 — Information Technology Services */
  "B233": ["Follow the line", "Follow the line", "Take the elevator to Floor 2", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 301 — Lobby */
  "B301": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", "Follow the line", ""],
  /* 302 — Biology Lab / Molecular Biology Lab */
  "B302": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", ""],
  /* 307 — Chemistry Lab */
  "B307": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", ""],
  /* 310 — Biology Lab */
  "B310": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", ""],
  /* 312 — Faculty Office */
  "B312": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", ""],
  /* 313 — History and Philosophy Faculty Office */
  "B313": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", ""],
  /* 318 — Faculty Offices */
  "B318": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", "Follow the line", ""],
  /* 319 — Faculty Office */
  "B319": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", "Follow the line", ""],
  /* 320 — Jaguar Student Media / Newsroom */
  "B320": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 321 — Faculty Office */
  "B321": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 323 — Faculty Office */
  "B323": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", "Follow the line", ""],
  /* 324 — Faculty Office */
  "B324": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", "Follow the line", ""],
  /* 325 — Faculty Office */
  "B325": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", "Follow the line", ""],
  /* 326 — Faculty Office */
  "B326": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", "Follow the line", ""],
  /* 331 — Restroom */
  "B331": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", ""],
  /* 332 — Restroom */
  "B332": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", ""],
  /* 333 — Classroom */
  "B333": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", ""],
  /* 334 — Classroom */
  "B334": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", ""],
  /* 337 — Classroom */
  "B337": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", ""],
  /* 338 — Classroom */
  "B338": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", ""],
  /* 339 — Restroom */
  "B339": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", ""],
  /* 340 — Restroom */
  "B340": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", ""],
  /* 345 — Early College and Academic Partnership Department */
  "B345": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", "Follow the line", ""],
  /* 347 — Department of Sociology and Communication */
  "B347": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 348 — Faculty Office */
  "B348": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 349 — Faculty Office */
  "B349": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", "Follow the line", ""],
  /* 350 — Sociology Office */
  "B350": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", "Follow the line", ""],
  /* 351 — Public Health Office */
  "B351": ["Follow the line", "Follow the line", "Take the elevator to Floor 3", "Follow the line", ""],
  /* 401 — Lobby, Fourth Floor */
  "B401": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", ""],
  /* 402 — Vista Room */
  "B402": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", "Follow the line", ""],
  /* 405 — University Advancement */
  "B405": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", ""],
  /* 409 — Office of the President */
  "B409": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 410 — Office of the President */
  "B410": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 411 — Marketing and Strategic Communications Office */
  "B411": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", "Follow the line", "Follow the line", ""],
  /* 416 — Restroom */
  "B416": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", "Follow the line", ""],
  /* 417 — Restroom */
  "B417": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", "Follow the line", ""],
  /* 418 — Office of Business Affairs */
  "B418": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", "Follow the line", ""],
  /* 419 — Conference Room, Finance and Administration */
  "B419": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", "Follow the line", ""],
  /* 420 — Finance and Administration Break Room */
  "B420": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", ""],
  /* 421 — Amanda Office */
  "B421": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", ""],
  /* 427 — Office of the Vice President of Research */
  "B427": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", ""],
  /* 428 — Restroom */
  "B428": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", ""],
  /* 429 — Restroom */
  "B429": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", ""],
  /* 434 — Operations, Environmental Health and Safety */
  "B434": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", "Follow the line", ""],
  /* 435 — Office of the Provost */
  "B435": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", "Follow the line", ""],
  /* 436 — Office of the Provost */
  "B436": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", "Follow the line", "Follow the line", ""],
  /* 439 — Human Resources (HR) */
  "B439": ["Follow the line", "Follow the line", "Take the elevator to Floor 4", ""],
  /* DINING — Dining Hall */
  "DINING": ["Follow the line", "Follow the line", "Follow the line", "Follow the line", ""],
};
