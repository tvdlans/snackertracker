# 侍 SnackerTracker

**Frikandellen. Eer. Glorie.**

De meest overdreven bestelapp ooit gebouwd voor één snackbar: [Foodmaster Aalsmeer](https://aalsmeer.foodmaster.nl/) (Poldermeesterplein 14).
Chinese draken, samoerai-rangen, taiko-drums en een katana die door elke frikandel gaat.

> SnackerTracker is een **onofficiële fan-app** en is niet verbonden aan Foodmaster.
> De app stuurt zelf niets naar de keuken: je stelt je bestelling samen, en belt de snackbar of bestelt via de officiële site.

## Wat zit erin

| | |
|---|---|
| **入 De Poort** | Intro met taiko-drums, gong en een katana die het scherm doormidden hakt. |
| **斬 De Rollen** | Het hele menu met epische namen ("Het Zwaard van Van Beckers"), stats voor kracht, vuur en vet, en formaatkeuze. Elke toevoeging is een zwaardslag met vonken. |
| **血 Combo's** | EERSTE BLOED, OORLOG!, MULTI-SLASH ×5, HEILIGE DRIE-EENHEID, SHOGUN-HONGER… |
| **弁当 Bento** | Je winkelmand als oprolbare rijstpapierrol, met een haiku-generator. |
| **儀 Het Ritueel** | Afrekenen: je bestelrol om voor te lezen aan de telefoon, kopiëren of te delen via WhatsApp, plus een knop om direct te bellen. |
| **走 SnackerTracker** | Een ensō-penseelcirkel telt af. De ninja rent over de kaart van Aalsmeer naar je kasteel. |
| **族 Clan-bestelling** | Groepsbestelling via één deelbare link. Iedereen voegt zijn eigen bestelling toe, de besteller laadt alles in één keer in, met een overzicht per persoon voor de Tikkie. |
| **籤 Het Orakel** | Schud de bamboekoker met lotstokjes, en het lot kiest je maaltijd. |
| **侍 Rangen** | Verdien eer (10 per euro): Boerenknecht → Ronin → Samurai → Shogun → Frituurgod. |
| **龍 Geheimen** | Sla 5× op de gong, typ `draak`, of probeer de Konami-code. |

Verder: live open/gesloten-status, generatieve koto- en taiko-soundtrack (alles via Web Audio, geen geluidsbestanden), installeerbaar als app (PWA), werkt offline, en houdt rekening met *verminderde beweging*.

## Live zetten op GitHub Pages

1. Ga naar **Settings → Pages** van deze repository.
2. Kies bij *Source*: **Deploy from a branch**.
3. Kies de branch met deze code en de map **/ (root)**, en klik op **Save**.
4. Na ongeveer een minuut staat de app op `https://tvdlans.github.io/snackertracker/`.

Er is geen build-stap nodig: het is pure HTML, CSS en JavaScript.

## Menu aanpassen

Alle gerechten, prijzen, openingstijden, wijsheden en orakels staan in [`js/menu.js`](js/menu.js).
Prijzen komen van de online kaart van de vestiging. Items met `est: true` zijn geschat en krijgen een `≈` in de app.

Gebruik je nieuwe Chinese of Japanse tekens, dan moet het penseelfont (`fonts/brush.woff2`, een subset van *Yuji Boku*) opnieuw worden gesubset. Ontbrekende tekens vallen terug op het systeemfont.

## Structuur

```
index.html          de pagina
css/style.css       zwart lak, keizerlijk rood en bladgoud
js/menu.js          menu, openingstijden, wijsheden, orakels, rangen
js/audio.js         gesynthetiseerde gong, taiko, katana en koto
js/fx.js            kersenbloesem, sintels, vonken en de draak
js/app.js           bento, ritueel, tracker, clan, orakel, rangen
sw.js               offline ondersteuning
fonts/              zelf-gehoste lettertypen (OFL)
```

Lettertypen: [Dela Gothic One](https://fonts.google.com/specimen/Dela+Gothic+One), [Zen Kaku Gothic New](https://fonts.google.com/specimen/Zen+Kaku+Gothic+New) en [Yuji Boku](https://fonts.google.com/specimen/Yuji+Boku), allemaal onder de SIL Open Font License.
