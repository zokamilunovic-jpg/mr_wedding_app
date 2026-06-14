# mr_wedding_app

Aplikacija za zakazivanje termina za svadbe razvijena korišćenjem Ionic i Angular tehnologija.
Podaci se čuvaju u Firebase Realtime Database, dok se komunikacija sa bazom vrši putem HTTP zahteva koristeći Angular HttpClient.


## Funkcionalnosti

### Korisnik

Nakon uspešne prijave korisnik može:

- Da pregleda svoje rezervacije.
- Da kreira novu rezervaciju.
- Da izmeni postojeću rezervaciju.
- Da obriše postojeću rezervaciju.
- Da vidi status svake rezervacije:
  - Na čekanju
  - Odobreno
  - Odbijeno
 
### Administrator

Administrator ima pristup svim zahtevima za rezervacije i može:

- Da pregleda listu zahteva.
- Da odobri rezervaciju.
- Da odbije rezervaciju.

Promena statusa se automatski upisuje u Firebase bazu podataka i odmah postaje vidljiva korisniku.



