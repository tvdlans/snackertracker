/* ==========================================================================
   DE ROLLEN VAN DE MEESTER — menudata voor SnackerTracker
   Prijzen gebaseerd op de online kaart van Foodmaster Aalsmeer
   (Poldermeesterplein 14). Items met `est: true` zijn geschat.
   stats = [kracht, vuur, vet]  (1–5)
   ========================================================================== */
window.DOJO = {
  name: 'Foodmaster Aalsmeer',
  street: 'Poldermeesterplein 14',
  city: '1432 JZ Aalsmeer',
  phone: '0297 366 251',
  phoneHref: 'tel:+31297366251',
  site: 'https://aalsmeer.foodmaster.nl/',
  maps: 'https://www.google.com/maps/search/?api=1&query=Foodmaster+Poldermeesterplein+14+Aalsmeer',
  // 0 = zondag … 6 = zaterdag, [open, dicht] in uren (decimaal)
  hours: {
    bezorgen: { 0: [14, 20], 1: [16, 20], 2: [16, 20], 3: [12, 21], 4: [12, 21], 5: [12, 21], 6: [12, 21] },
    afhalen:  { 0: [14, 20], 1: [16, 20], 2: [16, 20], 3: [12, 21], 4: [12, 21], 5: [12, 22], 6: [12, 21] }
  }
};

window.MENU = [
  {
    id: 'frites', kanji: '金', title: 'De Gouden Staven', sub: 'Frites',
    intro: 'Goudstaven, gesmeed in olie van 180 graden. Elk rijk is erop gebouwd.',
    items: [
      { id: 'friet', name: 'Friet', epic: 'Staven van de Keizer', kanji: '金', emoji: '🍟',
        desc: 'Goudgeel, knapperig, eerlijk. De basis van elk rijk en elke veldslag.',
        variants: [{ n: 'Normaal', p: 3.25 }, { n: 'Jumbo', p: 5.25 }], stats: [3, 1, 3] },
      { id: 'friet-mayo', name: 'Friet mayo', epic: 'Staven van de Witte Lotus', kanji: '蓮', emoji: '🍟',
        desc: 'Gouden staven onder een sneeuwdeken van mayonaise. Puur. Klassiek. Onverslaanbaar.',
        variants: [{ n: 'Normaal', p: 4.25 }, { n: 'Jumbo', p: 6.25 }], est: true, stats: [3, 1, 4] },
      { id: 'friet-speciaal', name: 'Friet speciaal', epic: 'De Speciale Eenheid', kanji: '特', emoji: '🍟',
        desc: 'Mayo, curry en rauwe uitjes. Een elite-eenheid die nooit faalt.',
        variants: [{ n: 'Normaal', p: 4.50 }, { n: 'Jumbo', p: 6.50 }], est: true, stats: [4, 2, 4] },
      { id: 'friet-oorlog', name: 'Patat oorlog', epic: 'Oorlog der Drie Koninkrijken', kanji: '戦', emoji: '⚔️',
        desc: 'Mayo, satésaus en uitjes strijden om de macht. Er kan er maar één winnen: jij.',
        variants: [{ n: 'Normaal', p: 4.50 }, { n: 'Jumbo', p: 6.50 }], est: true, stats: [5, 2, 5], war: true },
      { id: 'loaded-fries', name: 'Loaded fries', epic: 'Overladen Krijgsbuit', kanji: '宝', emoji: '🧀',
        desc: 'Frites bedolven onder de buit van honderd veldslagen. Bestek is voor lafaards.',
        price: 7.50, est: true, stats: [5, 2, 5] },
      { id: 'kapsalon', name: 'Kapsalon', epic: 'De Keizerlijke Barbier', kanji: '帝', emoji: '🥘',
        desc: 'Friet, vlees, gesmolten kaas, sla en saus — opgetrokken als een vesting.',
        variants: [{ n: 'Shoarma', p: 12.50 }, { n: 'Deluxe', p: 15.00 }], stats: [5, 3, 5] }
    ]
  },
  {
    id: 'snacks', kanji: '武', title: 'Wapens uit de Frituur', sub: 'Snacks',
    intro: 'Het arsenaal. Oer-Hollandse wapens, gesmeed in de vlammen van de friteuse.',
    items: [
      { id: 'frikandel', name: 'Frikandel', epic: 'Het Zwaard van Van Beckers', kanji: '剣', emoji: '🌭',
        desc: 'Het legendarische zwaard. Elke krijger begint hier — en keert hier terug.',
        price: 3.25, stats: [3, 1, 4], frik: true },
      { id: 'frikandel-speciaal', name: 'Frikandel speciaal (curry)', epic: 'Zwaard der Vlammende Uien', kanji: '炎', emoji: '🌭',
        desc: 'Opengereten en gevuld met curry, mayo en uien. Gevaarlijk scherp aan twee kanten.',
        price: 4.25, stats: [4, 2, 4], frik: true },
      { id: 'kroket', name: 'Rundvleeskroket', epic: 'Kroket van de Oude Meester', kanji: '老', emoji: '🥖',
        desc: 'Knapperig pantser, zacht hart. Wijsheid van generaties in één kroket.',
        price: 3.25, est: true, stats: [3, 1, 3] },
      { id: 'satekroket', name: 'Satékroket', epic: 'Kroket van de Gouden Pinda', kanji: '豆', emoji: '🥜',
        desc: 'Een kroket die de geheimen van de satésaus in zich draagt.',
        price: 3.25, stats: [3, 2, 3] },
      { id: 'kaassouffle', name: 'Kaassoufflé', epic: 'De Gesmolten Schatkist', kanji: '箱', emoji: '🧀',
        desc: 'Open hem voorzichtig. Binnenin: vloeibaar goud. Vegetarisch, maar vol eer.',
        price: 3.25, veg: true, stats: [2, 1, 4] },
      { id: 'nasischijf', name: 'Nasischijf', epic: 'Shuriken van Nasi', kanji: '星', emoji: '🥏',
        desc: 'Geworpen vanuit de frituur, recht in je hart. Pittige nasi in een krokant pantser.',
        price: 3.50, stats: [3, 3, 3] },
      { id: 'kipcorn', name: 'Kipcorn', epic: 'De Gouden Speer', kanji: '槍', emoji: '🍗',
        desc: 'Lang, knapperig en dodelijk lekker. Een speer bekleed met gouden vlokken.',
        price: 4.00, stats: [4, 1, 4] },
      { id: 'bitterballen', name: 'Bitterballen (6 st.)', epic: 'Kanonskogels van de Daimyo', kanji: '砲', emoji: '🧆',
        desc: 'Zes kanonskogels. Laat ze eerst afkoelen, of verlies je tong in de strijd.',
        price: 4.50, est: true, stats: [4, 1, 4] },
      { id: 'mexicano', name: 'Mexicano', epic: 'De Vurige Dolk', kanji: '辛', emoji: '🌶️',
        desc: 'Kort, gekruid en vol vuur. Alleen voor wie de pijn omarmt.',
        price: 3.50, est: true, stats: [3, 5, 3] }
    ]
  },
  {
    id: 'burgers', kanji: '盾', title: 'De Ronde Schilden', sub: 'Huisgemaakte burgers',
    intro: 'Huisgemaakte schilden. Ze beschermen je tegen honger, verdriet en kou.',
    items: [
      { id: 'grillburger', name: 'Grillburger', epic: 'De Vuurproef', kanji: '焼', emoji: '🍔',
        desc: 'Door het vuur gegaan en sterker teruggekomen. Eenvoudig. Eerlijk. Effectief.',
        price: 6.00, stats: [3, 1, 3] },
      { id: 'cheeseburger', name: 'Cheeseburger', epic: 'Het Gouden Kaasschild', kanji: '黄', emoji: '🍔',
        desc: 'Een schild met een gouden laag gesmolten kaas. Gesmeed voor de dagelijkse strijd.',
        price: 6.50, stats: [3, 1, 4] },
      { id: 'kipburger', name: 'Kipburger', epic: 'Kip van de Dageraad', kanji: '鶏', emoji: '🐔',
        desc: 'Krokante kip die opstaat voor de zon. Snel, licht en vol vechtlust.',
        price: 7.00, stats: [3, 1, 3] },
      { id: 'kipsateburger', name: 'Kipsatéburger', epic: 'Pindaschild van de Krokante Kip', kanji: '脆', emoji: '🥜',
        desc: 'Krokante kipfilet met satésaus. Een verbond tussen kip en pinda, voor eeuwig.',
        price: 9.95, stats: [4, 2, 4] },
      { id: 'bbq-bacon-cheese', name: 'BBQ Bacon & Cheese Burger', epic: 'Rook van de Drakenberg', kanji: '煙', emoji: '🔥',
        desc: 'Sla, tomaat, augurk, bacon, cheddar, uienringen en smokey bbq-saus. De favoriet van de Meester.',
        price: 9.95, est: true, stats: [5, 2, 5] },
      { id: 'burgemeester', name: 'Burgemeester (dubbele burger)', epic: 'De Burgemeester', kanji: '将', emoji: '👑',
        desc: 'Twee huisgemaakte schilden, één doel: totale verzadiging. Heerser over Aalsmeer.',
        price: 16.00, stats: [5, 2, 5], boss: true }
    ]
  },
  {
    id: 'menus', kanji: '宴', title: 'Feestmalen van de Shogun', sub: "Menu's & schotels",
    intro: 'Complete feestmalen voor wie niet komt om te proeven, maar om te overwinnen.',
    items: [
      { id: 'burgermenu', name: 'Burgermenu', epic: 'Het Drietal van Eer', kanji: '三', emoji: '🍱',
        desc: 'Huisgemaakte classic burger, frites en een drankje naar keuze. De heilige drie-eenheid.',
        price: 15.00, stats: [4, 1, 4] },
      { id: 'meestermenu', name: 'Meestermenu', epic: 'Het Meestermenu', kanji: '師', emoji: '🏯',
        desc: 'Een Burgemeester met jumbo frites. Alleen voor ware meesters. Wees gewaarschuwd.',
        price: 20.00, stats: [5, 2, 5], boss: true },
      { id: 'kipsate-menu', name: 'Kipsaté menu', epic: 'Speren van Saté', kanji: '串', emoji: '🍢',
        desc: 'Malse kipsaté aan de speer, gedrenkt in satésaus. Kies je aantal speren.',
        variants: [{ n: '4 stokjes', p: 17.50 }, { n: 'XL · 6 stokjes', p: 20.00 }], stats: [4, 2, 4] },
      { id: 'shoarma-menu', name: 'Shoarmamenu', epic: 'De Draaiende Draak', kanji: '回', emoji: '🥙',
        desc: 'Vlees dat uren rond het vuur danste, tot het klaar was voor jou.',
        price: 17.50, stats: [4, 3, 4] },
      { id: 'doner-menu', name: 'Dönermenu', epic: 'Döner van de Zijderoute', kanji: '絹', emoji: '🥙',
        desc: 'Over duizend bergen en zeeën gereisd, om te eindigen op jouw bord.',
        price: 17.50, stats: [4, 3, 4] },
      { id: 'kipschnitzel-menu', name: 'Kipschnitzel menu', epic: 'Het Platgeslagen Schild', kanji: '打', emoji: '🛡️',
        desc: 'Kip, plat geslagen door de hamer van de smid en gehard in een gouden korst.',
        price: 15.00, stats: [4, 1, 4] }
    ]
  },
  {
    id: 'vega', kanji: '僧', title: 'Pad van de Monnik', sub: 'Vegetarisch',
    intro: 'De monnik doodt niet. De monnik bestelt toch. Verlichting zonder vlees.',
    items: [
      { id: 'groentekroket', name: 'Groentekroket', epic: 'Tuin van de Monnik', kanji: '庭', emoji: '🥦',
        desc: 'Een zen-tuin in kroketvorm. Harmonie in elke hap.',
        price: 3.95, veg: true, stats: [2, 1, 3] },
      { id: 'vega-burger', name: 'Vega burger', epic: 'Burger van het Bamboewoud', kanji: '竹', emoji: '🎋',
        desc: 'Geplukt in het stille bamboewoud. Buigt, maar breekt nooit.',
        price: 7.50, veg: true, stats: [3, 1, 3] },
      { id: 'no-chicken-burger', name: 'No chicken burger', epic: 'De Geest van de Kip', kanji: '霊', emoji: '👻',
        desc: 'Er werd geen kip geofferd. De kip leeft voort — in geest, en in smaak.',
        price: 7.50, veg: true, stats: [3, 1, 3] }
    ]
  },
  {
    id: 'sauzen', kanji: '秘', title: 'Geheime Elixers', sub: 'Sauzen',
    intro: 'Een krijger kiest zijn saus niet. De saus kiest de krijger.',
    items: [
      { id: 'mayo', name: 'Mayonaise', epic: 'Witte Lotus', kanji: '白', emoji: '🥛',
        desc: 'Het oudste elixer. Romig, puur, onmisbaar.', price: 1.00, stats: [1, 0, 4] },
      { id: 'curry', name: 'Curry', epic: 'Bloed van de Rode Dageraad', kanji: '赤', emoji: '🍅',
        desc: 'Zoet, rood en een tikje gevaarlijk.', price: 1.00, est: true, stats: [1, 1, 1] },
      { id: 'satesaus', name: 'Satésaus', epic: 'Pinda-Elixer', kanji: '濃', emoji: '🥜',
        desc: 'Dik, warm en zo machtig dat hij een eigen oorlog kan beginnen.', price: 1.25, stats: [2, 1, 4] },
      { id: 'knoflooksaus', name: 'Knoflooksaus', epic: 'Drakenadem', kanji: '息', emoji: '🧄',
        desc: 'Na één hap verdrijf je vampiers, demonen en je collega’s.', price: 1.00, stats: [2, 1, 3] },
      { id: 'sambal', name: 'Sambalsaus', epic: 'Vulkaanvuur', kanji: '火', emoji: '🌋',
        desc: 'Vuur uit het hart van de vulkaan. De Meester is niet verantwoordelijk.', price: 1.00, stats: [2, 5, 1] }
    ]
  },
  {
    id: 'shakes', kanji: '雲', title: 'Wolkenschuim', sub: 'Milkshakes',
    intro: 'Gekoelde wolken uit de bergen. Kies je smaak en je formaat.',
    items: [
      { id: 'shake-aardbei', name: 'Milkshake aardbei', epic: 'Kersenbloesemstorm', kanji: '桜', emoji: '🍓',
        desc: 'Roze als de bloesem in de lente. Zoet als de overwinning.',
        variants: [{ n: 'Klein', p: 3.50 }, { n: 'Middel', p: 4.00 }, { n: 'Groot', p: 4.50 }], stats: [2, 0, 3] },
      { id: 'shake-vanille', name: 'Milkshake vanille', epic: 'Witte Wolk', kanji: '雪', emoji: '🍦',
        desc: 'Kalm als sneeuw op de berg Fuji. Zen in een beker.',
        variants: [{ n: 'Klein', p: 3.50 }, { n: 'Middel', p: 4.00 }, { n: 'Groot', p: 4.50 }], stats: [2, 0, 3] },
      { id: 'shake-chocolade', name: 'Milkshake chocolade', epic: 'Nacht van de Ninja', kanji: '夜', emoji: '🍫',
        desc: 'Donker, stil en onweerstaanbaar. Je hoort hem pas als het te laat is.',
        variants: [{ n: 'Klein', p: 3.50 }, { n: 'Middel', p: 4.00 }, { n: 'Groot', p: 4.50 }], stats: [2, 0, 4] },
      { id: 'shake-kaneel', name: 'Cinnamon shake', epic: 'Kaneelstorm', kanji: '嵐', emoji: '🌪️',
        desc: 'Een wervelstorm van kaneel. Waait je zo de dojo uit.',
        variants: [{ n: 'Klein', p: 3.50 }, { n: 'Middel', p: 4.00 }, { n: 'Groot', p: 4.50 }], stats: [2, 1, 3] }
    ]
  },
  {
    id: 'dranken', kanji: '泉', title: 'Bronnen van de Berg', sub: 'Dranken',
    intro: 'Elixers om het vuur van de sambal te blussen.',
    items: [
      { id: 'cola', name: 'Coca-Cola', epic: 'Zwart Elixer', kanji: '黒', emoji: '🥤',
        desc: 'Donker en bruisend. Geeft kracht aan wie het drinkt.', price: 3.15, stats: [2, 0, 0] },
      { id: 'cola-zero', name: 'Coca-Cola Zero', epic: 'Elixer van de Leegte', kanji: '無', emoji: '🥤',
        desc: 'Niets. En toch alles. De weg van de zen-meester.', price: 3.15, est: true, stats: [1, 0, 0] },
      { id: 'fanta', name: 'Fanta', epic: 'Oranje Zonsondergang', kanji: '夕', emoji: '🍊',
        desc: 'Het licht van de ondergaande zon, in een blik.', price: 3.15, stats: [2, 0, 0] },
      { id: 'fles-15', name: 'Fles 1,5 L (cola of fanta)', epic: 'Krijgskruik', kanji: '壺', emoji: '🍾',
        desc: 'Genoeg elixer voor de hele clan. Zet in je opmerking welke smaak.', price: 5.25, stats: [3, 0, 0] },
      { id: 'heineken', name: 'Heineken blik 330 ml (18+)', epic: 'Groene Sake van Holland', kanji: '酒', emoji: '🍺',
        desc: 'Alleen voor krijgers van 18 jaar en ouder. Drink met eer, en met mate.', price: 3.15, stats: [2, 0, 0] }
    ]
  }
];

/* ---------- Wijsheden, orakels & rangen ---------- */
window.WISDOM = [
  'Wie de frikandel speciaal versmaadt, heeft de uien nooit begrepen.',
  'Een krijger kiest zijn saus niet. De saus kiest de krijger.',
  'De olie is heet. Het geduld is heter.',
  'Duizend veldslagen beginnen met één kroket.',
  'Mayo is tijdelijk. Glorie is eeuwig.',
  'Ook de machtigste shogun heeft ooit om extra uitjes gevraagd.',
  'Deel je friet, en je clan zal je nooit verraden.',
  'Wie met lege handen de dojo verlaat, keert terug met honger.',
  'De kipcorn buigt niet. De kipcorn breekt niet.',
  'Het pad naar verlichting is bezaaid met kaassoufflés.',
  'Wees als water. Of als cola. Maar wees.',
  'Een bitterbal te veel bestaat niet. Er bestaat alleen een clan te klein.',
  'De draak slaapt nooit. De draak wil een kapsalon.',
  'Snel is de ninja. Sneller is de honger.',
  'Hij die oorlog bestelt, kent geen vrede.',
  'Wie wacht op de bezorger, wacht op het lot.',
  'Een lege bento is een onbeschreven rol.'
];

window.ORACLE = {
  levels: [
    { k: '大吉', n: 'Groot geluk', w: 3 },
    { k: '中吉', n: 'Middelgroot geluk', w: 4 },
    { k: '小吉', n: 'Klein geluk', w: 4 },
    { k: '吉', n: 'Geluk', w: 4 },
    { k: '末吉', n: 'Geluk dat nog komt', w: 2 },
    { k: '凶', n: 'Pech', w: 1 }
  ],
  fortunes: [
    'Je zult vandaag een saus ontmoeten die je leven verandert.',
    'Een kroket in de hand is beter dan tien in de frituur.',
    'De sterren staan gunstig voor uitjes.',
    'Wie twee frikandellen bestelt, hoeft nooit te kiezen.',
    'Een vreemdeling zal je zijn friet aanbieden. Weiger niet.',
    'Je honger is groot, maar je hart is groter. Neem jumbo.',
    'De draak fluistert: kipcorn.',
    'Vandaag is een goede dag om de Burgemeester uit te dagen.',
    'Het lot heeft gesproken. Het lot heeft trek.',
    'Wie mayo deelt, deelt zijn ziel.',
    'Een stille krijger eet het meest.',
    'Het pad naar verlichting loopt via de frituur van Aalsmeer.',
    'Je voorouders kijken toe. Bestel iets waar ze trots op zijn.',
    'De wind uit het oosten brengt de geur van satésaus.',
    'Wat je vandaag niet bestelt, zul je morgen betreuren.',
    'De ninja is al onderweg. Hij weet alleen nog niet waarheen.'
  ],
  bad: [
    'Pech. De geesten raden je een groentekroket aan. Verzet je niet.',
    'Pech. Je zult je saus morsen. Neem er twee.'
  ]
};

window.RANKS = [
  { min: 0,     k: '農民', n: 'Boerenknecht' },
  { min: 100,   k: '弟子', n: 'Leerling' },
  { min: 300,   k: '浪人', n: 'Ronin' },
  { min: 700,   k: '侍',   n: 'Samurai' },
  { min: 1500,  k: '大名', n: 'Daimyo' },
  { min: 3000,  k: '将軍', n: 'Shogun' },
  { min: 6000,  k: '皇帝', n: 'Snackkeizer' },
  { min: 12000, k: '神',   n: 'Frituurgod' }
];
