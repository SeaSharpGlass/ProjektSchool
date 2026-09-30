# Pravidla a instrukce pro AI agenta (AGENTS.md)

Tento dokument definuje pravidla chování, pracovní postupy a omezení pro AI asistenta (Google Antigravity) při vývoji semestrálního projektu z předmětu **Pokročilé programování (PPRO)** na FIM UHK (ZS 2026/2027).

---

## 1. Zlaté pravidlo projektu: Student ručí za kód

- **Pochopitelnost kódu:** Veškerý vygenerovaný kód musí student umět přečíst, vysvětlit u obhajoby a na místě upravit.
- **Zákaz neprůhledných konstrukcí:** Vyhýbej se zbytečně komplikovaným, nepřehledným nebo "magickým" vzorům bez řádného komentáře a vysvětlení.
- **Vzdělávací přístup:** Pokud navrhuješ architekturu nebo netriviální řešení, stručně vysvětli studentovi důvody a způsob fungování.

---

## 2. Git Workflow & Pravidla verzování

### 2.1 Zákaz automatického PUSH
- **AGENT NESMÍ NIKDY SAMOVOLNĚ SPOUŠTĚT `git push`.**
- Operace `git push` je povolena **výhradně na explicitní pokyn / povel uživatele** (studenta).
- Po dokončení commitů agent pouze informuje uživatele, že je vše připraveno k pushnutí, a vyčká na potvrzení.

### 2.2 Strukturované zprávy commitu (`git commit -m`)
- Každý commit musí být proveden s přepínačem `-m` a smysluplnou, výstižnou zprávou.
- Používat konvenci Conventional Commits:
  - `feat: ...` – nová funkcionalita
  - `fix: ...` – oprava chyby
  - `docs: ...` – změny v dokumentaci nebo README
  - `refactor: ...` – úprava kódu bez změny funkčnosti
  - `test: ...` – přidání nebo úprava testů
  - `chore: ...` – úprava konfigurace, Dockeru, build skriptů
- Popis musí přesně vystihovat, co a proč se změnilo.

### 2.3 Dokumentační brána (Documentation Gate) před KAŽDÝM commitem
- **Před provedením jakéhokoliv commitu** musí agent zkontrolovat a aktualizovat [README.md](file:///u:/ppro2026/README.md):
  1. Zaznamenat nová architektonická rozhodnutí v sekci ADR (Architecture Decision Records).
  2. Zaktualizovat stav implementace a postup prací v changelogu.
  3. Zkontrolovat, zda návod ke spuštění a popis entit odpovídá aktuálnímu stavu kódu.
- Kód a dokumentace v `README.md` musí být vždy v naprostém souladu.

### 2.4 Průběžné verzování
- Práce musí být dělena do malých, logických a funkčních celků.
- Vyučující hodnotí průběžný vývoj v čase během semestru – žádné hromadné commity na poslední chvíli.

---

## 3. Technická a architektonická pravidla (Povinné minimum PPRO)

Aplikace musí striktně dodržovat následující požadavky zadání:

1. **Tři vrstvy a striktně jednosměrné závislosti:**
   - **Prezentační vrstva / API:** Handlery, kontrolery, routy, DTOs.
   - **Aplikační / Business logika:** Služby (services), validace, doménová pravidla.
   - **Datová vrstva:** Repozitáře, přístup k databázi.
   - **PŘÍSNÝ ZÁKAZ:** Volání SQL dotazů nebo přímá práce s DB vrstvou uvnitř handlerů/kontrolerů. Závislosti smí jít pouze shora dolů (API -> Servisa -> Repozitář).

2. **Relační databáze v Dockeru:**
   - Databáze běží jako kontejnerizovaná služba přes `docker compose`.
   - Schéma musí být řízeno výhradně verzovanými migracemi (např. Flyway, Liquibase, EF Core migrations, Alembic apod. podle zvoleného stacku).
   - Minimálně **5 entit** a alespoň **jedna vazba M:N**.

3. **Testy:**
   - Jednotkové testy (Unit tests) pokrývající klíčovou aplikační logiku (business rules).
   - Minimálně jeden reálný integrační test běžící proti testovací databázi.

4. **Jednokrokové spuštění (Docker Compose):**
   - Příkaz `docker compose up` musí uvést celou aplikaci a její závislosti do běžícího stavu.
   - Žádné nezdokumentované manuální kroky.

---

## 4. Bezpečnostní a datová pravidla

- **ŽÁDNÁ reálná osobní data:** Používat pouze syntetická data (generovaná přes seeders/faker).
- **Žádné citlivé údaje v repozitáři:** Žádná hesla, API klíče ani přístupové tokeny v kódu.
- Konfigurace výhradně přes proměnné prostředí (`.env`). Soubor `.env` **musí** být v `.gitignore`, v repozitáři smí být pouze `.env.example`.
- Zákaz používání firemního kódu nebo interních dokumentů.

---

## 5. Záznam pro technickou zprávu (PDF v docs/)

Agent je povinen pomáhat studentovi shromažďovat podklady pro finální PDF dokumentaci:
1. **Evidence zacyklení a selhání agenta:**
   - Kdykoliv agent navrhne nefunkční řešení, zacyklí se nebo je opraven studentem, situace se stručně zaznamená (co bylo signálem chyby, jak byla vyřešena). Slouží jako podklad pro povinný *Protokol o zacyklení* (1 strana v dokumentaci).
2. **Přiznání práce s AI:**
   - Udržovat přehled, na které komponenty byl agent využit a jak byly výsledky verifikovány (oddíl 5.9 zadání).
