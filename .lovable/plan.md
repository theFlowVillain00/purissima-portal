
## Pagine senza scroll, contenuto che riempie tutto lo spazio disponibile

### Obiettivo
Fare in modo che tutte le pagine occupino esattamente lo spazio tra navbar e footer fisso senza generare scroll, a meno che il contenuto non sia effettivamente troppo (es. tanti ordini nella dashboard).

### Modifiche per pagina

**1. Layout (`Layout.tsx`)**
- Cambiare la struttura per usare `h-screen` e `overflow-hidden` sul container principale, con `main` che usa `flex-1 overflow-auto` cosi' solo il contenuto interno scrolla quando necessario, mai la pagina intera.

**2. Home (`Home.tsx`)**
- La hero section deve riempire tutto lo spazio disponibile: usare `h-full` invece di `h-[calc(100vh-4rem)]`, dato che il layout gestisce gia' le dimensioni.

**3. Staff (`Staff.tsx`)**
- Aggiungere `flex h-full flex-col justify-center` al container per centrare verticalmente il contenuto nello spazio disponibile senza scroll.

**4. Ordini (`Ordini.tsx`)**
- Usare `flex h-full flex-col` per riempire lo spazio. Il contenuto scorre solo se i prodotti o il carrello superano l'altezza.

**5. Accedi (`Accedi.tsx`)**
- Cambiare `min-h-[70vh]` in `h-full` per occupare tutto lo spazio senza scroll, mantenendo il form centrato.

**6. Dashboard (`Dashboard.tsx`)**
- Usare `flex h-full flex-col` e `overflow-auto` sulla sezione ordini, cosi' solo la lista degli ordini scrolla quando sono troppi, non tutta la pagina.

### Dettagli tecnici

Il trucco e' nel `Layout.tsx`: il div wrapper diventa `flex h-screen flex-col` e il `main` diventa `flex-1 overflow-auto`. Il padding bottom per il footer fisso (`pb-14`) resta. Ogni pagina internamente usa `h-full` per riempire lo spazio che `main` le assegna.
