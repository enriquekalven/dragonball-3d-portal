/* ==========================================================================
   DRAGON BALL 3D MULTIVERSE PORTAL — COMPLETE ENCYCLOPEDIA DATA ARCHIVE
   Covers Dragon Ball, Dragon Ball Z, Dragon Ball Daima, GT, and Super
   Note on Power Levels: Official Daizenshuu 7 scouter numbers end at Namek
   (SSJ1 Goku = 150,000,000; Final Freezer = 120,000,000). Later eras are
   clearly marked "(Est.)" using canonical multiplier tiers for 1v1 play!
   ========================================================================== */

window.DB_PORTAL_DATA = {
  // 0. Selectable 3D Battle Arenas (Multi-layer 3D Floor, Sky & Rising Rocks)
  arenas: [
    {
      id: 'space-capsule',
      name: '🌌 Capsule Corp Holo-Deck',
      skyInner: '#19274c',
      skyOuter: '#040710',
      gridColor: 'rgba(255, 208, 0, 0.25)',
      rockColor: '#475569',
      floorTileA: 'rgba(30, 41, 59, 0.55)',
      floorTileB: 'rgba(15, 23, 42, 0.55)'
    },
    {
      id: 'planet-namek',
      name: '🟢 Planet Namek',
      skyInner: '#065f46',
      skyOuter: '#022c22',
      gridColor: 'rgba(52, 211, 153, 0.35)',
      rockColor: '#34d399',
      floorTileA: 'rgba(6, 95, 70, 0.6)',
      floorTileB: 'rgba(4, 120, 87, 0.45)'
    },
    {
      id: 'cell-games',
      name: '🏟️ Cell Games Arena',
      skyInner: '#1e3a5f',
      skyOuter: '#0c192c',
      gridColor: 'rgba(226, 232, 240, 0.4)',
      rockColor: '#94a3b8',
      floorTileA: 'rgba(203, 213, 225, 0.32)',
      floorTileB: 'rgba(148, 163, 184, 0.22)'
    },
    {
      id: 'time-chamber',
      name: '⏳ Hyperbolic Time Chamber',
      skyInner: '#475569',
      skyOuter: '#1e293b',
      gridColor: 'rgba(255, 255, 255, 0.45)',
      rockColor: '#e2e8f0',
      floorTileA: 'rgba(248, 250, 252, 0.3)',
      floorTileB: 'rgba(203, 213, 225, 0.2)'
    },
    {
      id: 'world-of-void',
      name: '🟣 Tournament of Power Void',
      skyInner: '#3b0764',
      skyOuter: '#090314',
      gridColor: 'rgba(192, 132, 252, 0.35)',
      rockColor: '#7e22ce',
      floorTileA: 'rgba(88, 28, 135, 0.5)',
      floorTileB: 'rgba(59, 7, 100, 0.4)'
    }
  ],

  // 1. Hair Color & Transformation Lab ("What Every Hair Color Means")
  hairForms: [
    {
      id: 'base-black',
      name: 'Base Saiyan (Jet Black Hair)',
      shortLabel: 'Jet Black (Base Goku)',
      characterName: 'Son Goku (Base Form)',
      spriteUrl: 'assets/renders/goku_base.webp',
      era: 'DRAGON BALL / DBZ / DAIMA / DBS',
      multiplier: '1x Base Power',
      powerExample: '3,000,000 (Official Namek)',
      hairHex: '#18181b',
      auraHex: '#f97316',
      hasLightning: false,
      whoUsesIt: 'Goku, Vegeta, Gohan, Goten, Vegetto, Gogeta, Bardock, Raditz',
      howUnlocked: 'Natural pure-blooded Saiyan biology from birth!',
      meaningForKids: 'Pure-blooded Saiyans like Goku and Vegeta are born with jet-black spiky hair that NEVER changes its shape or grows longer after childhood! Goku\'s trademark hair has 4 spikes on one side and 3 on the other.',
      funFact: 'When Kid Goku had his brown monkey tail and looked at a Full Moon, he transformed into a giant Great Ape (Oozaru) with 10x power!'
    },
    {
      id: 'ssj1-gold',
      name: 'Super Saiyan 1 (Golden Yellow)',
      shortLabel: 'Golden Yellow (SSJ1)',
      characterName: 'Super Saiyan Son Goku',
      spriteUrl: 'assets/renders/goku_ssj1.webp',
      era: 'DRAGON BALL Z (NAMEK SAGA)',
      multiplier: '50x Base Power (Official)',
      powerExample: '150,000,000 (Official Namek)',
      hairHex: '#facc15',
      auraHex: '#eab308',
      hasLightning: false,
      whoUsesIt: 'Goku, Vegeta, Gohan, Future Trunks, Goten, Kid Trunks, Vegetto, Gogeta, Cabba',
      howUnlocked: 'A pure heart combined with an explosive emotional trigger (or focusing tingling Ki in the upper back!).',
      meaningForKids: 'The legendary transformation! Hair stands straight up and turns glowing golden-yellow, eyebrows turn gold, and eyes turn emerald-teal. Official Daizenshuu guidebooks confirm it multiplies Base Power by 50x!',
      funFact: '150,000,000 on Planet Namek (vs. Freezer\'s 120,000,000) is the highest official scouter number ever published—all later saga numbers are fun scale estimates!'
    },
    {
      id: 'ssj2-sparks',
      name: 'Super Saiyan 2 (Electric Gold + Lightning)',
      shortLabel: 'Electric Gold (SSJ2)',
      characterName: 'Super Saiyan 2 Goku & Teen Gohan',
      spriteUrl: 'assets/renders/goku_ssj2.webp',
      era: 'DRAGON BALL Z (CELL & BUU SAGAS)',
      multiplier: '100x Base Power (2x SSJ1)',
      powerExample: '6B — 10.2B (Est.)',
      hairHex: '#fde047',
      auraHex: '#38bdf8',
      hasLightning: true,
      whoUsesIt: 'Teen Gohan (First!), Goku, Majin Vegeta, Future Trunks, Caulifla',
      howUnlocked: 'Pushing past the Super Saiyan wall through intense training and protecting the innocent.',
      meaningForKids: 'How do you spot Super Saiyan 2 vs. Super Saiyan 1? Look for crackling BLUE LIGHTNING bolts zapping through the golden aura, and sharper hair spikes!',
      funFact: '11-year-old Gohan was the very first Saiyan in history to reach Super Saiyan 2 during the Cell Games!'
    },
    {
      id: 'ssj3-mane',
      name: 'Super Saiyan 3 (Waist-Length Golden Mane)',
      shortLabel: 'Long Gold Mane (SSJ3)',
      characterName: 'Super Saiyan 3 Son Goku',
      spriteUrl: 'assets/renders/goku_ssj3.webp',
      era: 'DBZ (BUU SAGA) & DB DAIMA',
      multiplier: '400x Base Power (4x SSJ2)',
      powerExample: '24B — 45.6B (Est.)',
      hairHex: '#eab308',
      auraHex: '#facc15',
      hasLightning: true,
      whoUsesIt: 'Goku, Gotenks (Goten + Trunks) & Vegeta (in Dragon Ball Daima!)',
      howUnlocked: 'Drawing out every single drop of dormant Saiyan stamina—first achieved by Goku training in Other World!',
      meaningForKids: 'Golden hair explodes all the way down to the waist like a glowing lion\'s mane, blue lightning storms crackle nonstop, and the Saiyan\'s EYEBROWS completely vanish into a fierce brow ridge!',
      funFact: 'After decades of fans wondering, Vegeta finally unveiled his own Super Saiyan 3 transformation in Dragon Ball Daima!'
    },
    {
      id: 'ssj4-crimson',
      name: 'Super Saiyan 4 (Primal Fur & Tail)',
      shortLabel: 'Primal Red & Black (SSJ4)',
      characterName: 'Super Saiyan 4 Son Goku',
      spriteUrl: 'assets/renders/goku_ssj4.webp',
      era: 'DRAGON BALL GT & DB DAIMA',
      multiplier: '4,000x+ Primal Saiyan Power',
      powerExample: '1.8 Quadrillion (Est.)',
      hairHex: '#dc2626',
      auraHex: '#ef4444',
      hasLightning: true,
      whoUsesIt: 'Goku, Vegeta & Gogeta (Dragon Ball GT & Dragon Ball Daima)',
      howUnlocked: 'Mastering primal Great Ape / Saiyan power with a calm, heroic heart!',
      meaningForKids: 'First created for Dragon Ball GT and later reimagined by Akira Toriyama in Dragon Ball Daima! Goku grows wild shoulder-length hair, crimson-red fur over his torso and tail, and fierce red-rimmed eyes!',
      funFact: 'When SSJ4 Goku and SSJ4 Vegeta fuse into Super Saiyan 4 Gogeta in GT, his hair turns fiery crimson-red!'
    },
    {
      id: 'ssg-red',
      name: 'Super Saiyan God (Flame Magenta-Red)',
      shortLabel: 'Super Saiyan God (Red)',
      characterName: 'Super Saiyan God Son Goku',
      spriteUrl: 'assets/renders/goku_ssg.webp',
      era: 'DRAGON BALL SUPER (BATTLE OF GODS)',
      multiplier: 'Divine Realm (God Ki)',
      powerExample: '2.5 Quadrillion+ (Est.)',
      hairHex: '#e11d48',
      auraHex: '#f43f5e',
      hasLightning: false,
      whoUsesIt: 'Son Goku & Prince Vegeta',
      howUnlocked: 'Five pure-hearted Saiyans hold hands and pour their heart\'s light into a sixth righteous Saiyan (or divine training with Whis)!',
      meaningForKids: 'Glowing ruby-magenta hair and fiery red eyes! Unlike Golden Super Saiyan, Goku\'s hair keeps its normal calm Base shape, his body becomes slightly slimmer and faster, and his aura looks like dancing divine flames!',
      funFact: 'Goku unlocked Super Saiyan God with the help of Vegeta, Gohan, Goten, Trunks, and unborn baby Pan to battle Lord Beerus!'
    },
    {
      id: 'ssb-blue',
      name: 'Super Saiyan Blue (Electric Cyan-Blue)',
      shortLabel: 'Super Saiyan Blue (SSB)',
      characterName: 'Super Saiyan Blue Goku (SSGSS)',
      spriteUrl: 'assets/renders/goku_ssjb.webp',
      era: 'DRAGON BALL SUPER',
      multiplier: '50x Super Saiyan God',
      powerExample: '125 Quadrillion+ (Est.)',
      hairHex: '#06b6d4',
      auraHex: '#00e5ff',
      hasLightning: false,
      whoUsesIt: 'Goku, Vegeta (plus Royal-Blue SSB Evolved!), Vegetto Blue, Gogeta Blue',
      howUnlocked: 'Transforming into a Super Saiyan WHILE holding the tranquil divine energy of a Super Saiyan God!',
      meaningForKids: 'Official full name: "Super Saiyan God Super Saiyan"! Why is it blue? Because blue flames are hotter and calmer than red flames—and Vegeta pushed it even further into sparkling Royal-Blue SSB Evolved!',
      funFact: 'Goku can even stack his crimson Kaio-ken x20 ON TOP of Super Saiyan Blue for a double red-and-blue aura!'
    },
    {
      id: 'ss-rose',
      name: 'Super Saiyan Rosé (Divine Rose-Pink)',
      shortLabel: 'Super Saiyan Rosé (Pink)',
      characterName: 'Goku Black (Super Saiyan Rosé)',
      spriteUrl: 'assets/renders/goku_rose.webp',
      era: 'DRAGON BALL SUPER (FUTURE TRUNKS SAGA)',
      multiplier: 'Supreme Kai Divine Super Saiyan',
      powerExample: '150 Quadrillion+ (Est.)',
      hairHex: '#f472b6',
      auraHex: '#ec4899',
      hasLightning: true,
      whoUsesIt: 'Goku Black (Zamasu in Goku\'s Body)',
      howUnlocked: 'When a fighter who is ALREADY born a true God (a Supreme Kai) transforms a Saiyan body into Super Saiyan!',
      meaningForKids: 'When mortals like Goku or Vegeta add God Ki to Super Saiyan, their hair turns Cyan-Blue. When an actual God (Zamasu) uses Goku\'s body to go Super Saiyan, his hair turns glowing Rose-Pink!',
      funFact: 'Goku Black can shape his pink Rosé energy into a glowing Ki blade on his hand!'
    },
    {
      id: 'lssj-green',
      name: 'Full Power Legendary Super Saiyan (Lime Green)',
      shortLabel: 'Mutant Lime-Green (Broly)',
      characterName: 'Broly (Full-Power Super Saiyan)',
      spriteUrl: 'assets/renders/broly_lssj.webp',
      era: 'DRAGON BALL SUPER: BROLY',
      multiplier: 'Ever-Rising Berserker Mutant Power',
      powerExample: '11.2 Septillion (Est.)',
      hairHex: '#84cc16',
      auraHex: '#22c55e',
      hasLightning: true,
      whoUsesIt: 'Broly (Universe 7) & Kale / Kefla (Universe 6)',
      howUnlocked: 'A rare once-in-1,000-years genetic Saiyan mutation combining Great Ape "Ikari" wrath with Super Saiyan!',
      meaningForKids: 'Neon lime-green hair and gigantic muscles! Green hair means overflowing, unstoppable primal mutant energy that keeps growing stronger every second the battle continues!',
      funFact: 'In Dragon Ball Super: Broly, Broly got so strong in his first real battle that Goku and Vegeta had to fuse into Gogeta Blue just to stop him!'
    },
    {
      id: 'ui-sign',
      name: 'Ultra Instinct -Sign- / Omen (Black Hair + Silver Eyes)',
      shortLabel: 'UI -Sign- (Silver Eyes)',
      characterName: 'Son Goku (Ultra Instinct -Sign-)',
      spriteUrl: 'assets/renders/goku_ui.webp',
      era: 'DRAGON BALL SUPER (TOURNAMENT OF POWER)',
      multiplier: 'Gateway to the Angel Realm',
      powerExample: '18 Septillion (Est.)',
      hairHex: '#64748b',
      auraHex: '#94a3b8',
      hasLightning: false,
      whoUsesIt: 'Son Goku',
      howUnlocked: 'Breaking through his absolute shell in the Tournament of Power to awaken instinctive defense!',
      meaningForKids: 'The gateway stage before Silver Ultra Instinct! Goku\'s hair stays jet-black with glowing silver highlights and piercing silver eyes while his body dodges attacks automatically!',
      funFact: 'Even though it is an incomplete gateway form, Goku later developed "True Ultra Instinct" using this black-haired Sign state so he could fight with Saiyan emotions!'
    },
    {
      id: 'ui-silver',
      name: 'Mastered Ultra Instinct (Celestial Silver Hair)',
      shortLabel: 'Silver Hair (Mastered UI)',
      characterName: 'Mastered Ultra Instinct Son Goku',
      spriteUrl: 'assets/renders/goku_mui.webp',
      era: 'DRAGON BALL SUPER (TOURNAMENT OF POWER)',
      multiplier: 'Complete Angel Realm Technique',
      powerExample: '90 Septillion (Est.)',
      hairHex: '#f1f5f9',
      auraHex: '#c084fc',
      hasLightning: false,
      whoUsesIt: 'Son Goku (and all Angels like Whis & Grand Priest)',
      howUnlocked: 'Clearing the mind completely so every cell in the body dodges AND counter-attacks automatically without having to think!',
      meaningForKids: 'Blinding metallic silver-white hair, piercing silver eyes, and a galaxy-like crystalline aura! Even all 12 Gods of Destruction stood up in shock when Goku completed Silver Ultra Instinct against Jiren!',
      funFact: 'When Goku mastered Silver Ultra Instinct, his hair turned the exact same celestial white-silver color as the Angels like Whis and the Grand Priest!'
    },
    {
      id: 'ultra-ego-purple',
      name: 'Ultra Ego Vegeta (Destruction Purple)',
      shortLabel: 'Destruction Purple (Vegeta)',
      characterName: 'Ultra Ego Prince Vegeta',
      spriteUrl: 'assets/renders/vegeta_ultra_ego.webp',
      era: 'DRAGON BALL SUPER (GRANOLAH SAGA)',
      multiplier: 'God of Destruction Instinct',
      powerExample: '85 Septillion+ (Est.)',
      hairHex: '#9333ea',
      auraHex: '#c026d3',
      hasLightning: true,
      whoUsesIt: 'Prince Vegeta (Trained by Lord Beerus)',
      howUnlocked: 'Mastering the Hakaishin (God of Destruction) power of Lord Beerus and letting battle spirit fuel his strength!',
      meaningForKids: 'While Goku chose the calm Silver Angel path (Ultra Instinct), Vegeta chose the fierce Purple God of Destruction path (Ultra Ego)! His hair turns deep royal purple, his eyebrows vanish, and he gets stronger as his battle spirit burns!',
      funFact: 'Vegeta named the form "Ultra Ego" himself to contrast with Goku\'s "Ultra Instinct"!'
    },
    {
      id: 'beast-orange',
      name: 'Gohan Beast & Orange Piccolo (Super Hero)',
      shortLabel: 'Beast Silver & Crimson Eyes',
      characterName: 'Gohan Beast (Dragon Ball Super: Super Hero)',
      spriteUrl: 'assets/renders/gohan_beast.webp',
      era: 'DRAGON BALL SUPER: SUPER HERO',
      multiplier: 'Ultimate Hybrid Evolution',
      powerExample: '88 Septillion (Est.)',
      hairHex: '#cbd5e1',
      auraHex: '#e11d48',
      hasLightning: true,
      whoUsesIt: 'Son Gohan (Beast) & Piccolo (Orange Awakening)',
      howUnlocked: 'Gohan evolving his Ultimate potential to protect Piccolo and Pan against Cell Max!',
      meaningForKids: 'Towering silver-grey hair that shoots higher than ever before, glowing ruby-red eyes, and magenta-red lightning! At the same time, Shenron gifted Piccolo his giant muscular "Orange Piccolo" transformation!',
      funFact: 'Gohan Beast defeated the giant rampaging Cell Max using Piccolo\'s own signature move: the Special Beam Cannon!'
    }
  ],

  // 2. Complete 5-Era Timeline (Dragon Ball -> DBZ -> DB Daima -> DBGT -> DBS)
  timelineSagas: [
    {
      id: 'db-pilaf-tournament',
      era: 'DB',
      eraFullName: 'Dragon Ball (Original)',
      years: 'Age 749 – 750',
      title: 'Kid Goku, Bulma, Emperor Pilaf & 21st World Tournament',
      spriteUrl: 'assets/renders/kid_goku.webp',
      planetColor: '#fb923c',
      mainHero: 'Kid Goku (Power Pole & Nimbus), Bulma, Krillin, Yamcha & Master Roshi',
      mainEnemy: 'Emperor Pilaf, Shu, Mai & Full-Moon Great Ape Rampage',
      keyEvents: 'Genius inventor Bulma finds 12-year-old monkey-tailed Kid Goku in Mount Paozu guarding his Grandpa Gohan\'s 4-Star Dragon Ball! Riding the pure-hearted Flying Nimbus with his magic extending Power Pole, Goku trains under Master Roshi alongside his new best friend Krillin.',
      hairOrFormUnlocked: 'Power Pole, Flying Nimbus & Great Ape (Oozaru — 10x Power)',
      kidLesson: 'Training hard with your best friend makes you strong even before any glowing transformations!'
    },
    {
      id: 'db-red-ribbon-piccolo',
      era: 'DB',
      eraFullName: 'Dragon Ball (Original)',
      years: 'Age 750 – 756',
      title: 'Red Ribbon Army & Demon King Piccolo Saga',
      spriteUrl: 'assets/renders/piccolo_base.webp',
      planetColor: '#22c55e',
      mainHero: 'Kid / Teen Goku (Official Power: 180 → 910) & Tien Shinhan',
      mainEnemy: 'Mercenary Tao, Demon King Piccolo & Piccolo Jr.',
      keyEvents: 'Goku climbs Korin Tower, defeats the entire Red Ribbon Army, and stops Demon King Piccolo! Years later, Teen Goku defeats Piccolo Jr. to win the 23rd World Martial Arts Tournament.',
      hairOrFormUnlocked: 'Ultra Divine Water Awakening & Super Kamehameha',
      kidLesson: 'Today\'s rival can become tomorrow\'s greatest friend—Tien and Piccolo both became heroic Z-Fighters!'
    },
    {
      id: 'dbz-saiyan-saga',
      era: 'DBZ',
      eraFullName: 'Dragon Ball Z',
      years: 'Age 761 – 762',
      title: 'Saiyan Saga: Raditz, Nappa & Prince Vegeta',
      spriteUrl: 'assets/renders/vegeta_base.webp',
      planetColor: '#ef4444',
      mainHero: 'Goku (Kaio-ken), Piccolo, Kid Gohan & Krillin',
      mainEnemy: 'Raditz (1,500), Nappa (4,000), Prince Vegeta (18,000 — Official)',
      keyEvents: 'Goku learns from his brother Raditz that he is an alien Saiyan named Kakarot! After training with King Kai, Goku returns to Earth and unleashes a Battle Power over 8,000 ("OVER 9,000!" in the English dub) using Kaio-ken x4 against Vegeta\'s Galick Gun!',
      hairOrFormUnlocked: 'Kaio-ken (Crimson Red Aura) & Spirit Bomb (Genki Dama)',
      kidLesson: 'Even a "low-class" warrior like Goku can surpass an elite prince like Vegeta through relentless effort!'
    },
    {
      id: 'dbz-namek-frieza',
      era: 'DBZ',
      eraFullName: 'Dragon Ball Z',
      years: 'Age 762',
      title: 'Planet Namek, Ginyu Force & Emperor Freezer (Frieza)',
      spriteUrl: 'assets/renders/freezer_final.webp',
      planetColor: '#10b981',
      mainHero: 'Super Saiyan Goku (150,000,000 Official), Vegeta, Piccolo, Gohan & Krillin',
      mainEnemy: 'Captain Ginyu (120,000) & Final Form Freezer (120,000,000 Official)',
      keyEvents: 'The heroes fly to Planet Namek to wish back their friends! After battling Captain Ginyu, Goku faces galactic emperor Freezer—and unlocks GOLDEN SUPER SAIYAN for the first time in 1,000 years!',
      hairOrFormUnlocked: 'Super Saiyan 1 (Golden Hair — Official 50x Base Multiplier)',
      kidLesson: 'True strength comes in response to a need, not a desire—Goku unlocked Super Saiyan to protect his friends.'
    },
    {
      id: 'dbz-cell-saga',
      era: 'DBZ',
      eraFullName: 'Dragon Ball Z',
      years: 'Age 764 – 767',
      title: 'Androids 16, 17, 18, Future Trunks & Perfect Cell Saga',
      spriteUrl: 'assets/renders/cell_perfect.webp',
      planetColor: '#84cc16',
      mainHero: 'Super Saiyan 2 Teen Gohan, Future Trunks, Goku, Vegeta & Piccolo',
      mainEnemy: 'Androids 16, 17, 18, Dr. Gero & Super Perfect Cell',
      keyEvents: 'Future Trunks arrives in Bulma\'s Time Machine! After training in the Hyperbolic Time Chamber, Teen Gohan awakens Super Saiyan 2 at the Cell Games (inspired by gentle Android 16) and defeats Cell with the Father-Son Kamehameha!',
      hairOrFormUnlocked: 'Super Saiyan 2 (Electric Gold + Blue Lightning — 100x)',
      kidLesson: 'Goku trusted his son Gohan because he saw the gentle, heroic potential inside him.'
    },
    {
      id: 'dbz-buu-saga',
      era: 'DBZ',
      eraFullName: 'Dragon Ball Z',
      years: 'Age 774',
      title: 'Majin Buu, Gotenks, Ultimate Gohan & Super Vegetto Saga',
      spriteUrl: 'assets/renders/vegetto_ssj1.webp',
      planetColor: '#f472b6',
      mainHero: 'Super Vegetto, SSJ3 Goku, Majin Vegeta, Ultimate Gohan, Gotenks & Mr. Satan',
      mainEnemy: 'Babidi, Fat Majin Buu, Super Buu (Buuhan) & Kid Buu',
      keyEvents: 'Ancient genie Majin Buu awakens! Young Goten and Trunks fuse into Gotenks SSJ3, Goku reveals Super Saiyan 3, Goku and Vegeta fuse with Potara Earrings into golden SUPER VEGETTO, and Mr. Satan rallies everyone on Earth to power Goku\'s Super Spirit Bomb!',
      hairOrFormUnlocked: 'Super Saiyan 3 (400x), Ultimate Gohan & Potara Fusion Super Vegetto!',
      kidLesson: 'Even Mr. Satan saved the universe by convincing everyone on Earth to share their energy!'
    },
    {
      id: 'db-daima-demon-realm',
      era: 'DAIMA',
      eraFullName: 'Dragon Ball Daima',
      years: 'Age 775',
      title: 'Demon Realm Adventure: Goku (Mini), Glorio, Panzy & King Gomah',
      spriteUrl: 'assets/renders/goku_daima.webp',
      planetColor: '#f59e0b',
      mainHero: 'Goku (Mini), Vegeta (Mini), Piccolo (Mini), Supreme Kai (Nahare), Glorio & Panzy',
      mainEnemy: 'Supreme Demon King Gomah (Evil Third Eye), Degesu, Dr. Arinsu & Tamagami Guardians',
      keyEvents: 'Right after Majin Buu\'s defeat, new Supreme Demon King Gomah uses Earth\'s Dragon Balls to turn Goku and his friends into Mini kids! Wielding his classic red Power Pole again, Goku journeys through the Three Worlds of the Demon Realm—culminating in SSJ3 Vegeta and canon Demon Realm Super Saiyan 4!',
      hairOrFormUnlocked: 'Goku (Mini) Power Pole, Super Saiyan 3 Vegeta & Daima Super Saiyan 4!',
      kidLesson: 'Akira Toriyama\'s final Dragon Ball story proves adventure, curiosity, and friendship shine at every size!'
    },
    {
      id: 'dbgt-baby-ssj4',
      era: 'DBGT',
      eraFullName: 'Dragon Ball GT',
      years: 'Age 789',
      title: 'Black Star Dragon Balls & Baby Vegeta Saga',
      spriteUrl: 'assets/renders/goku_ssj4.webp',
      planetColor: '#dc2626',
      mainHero: 'Super Saiyan 4 Goku, Pan & Trunks',
      mainEnemy: 'General Rilldo & Golden Great Ape Baby Vegeta',
      keyEvents: 'Wished back into a kid, Goku flies across space with his granddaughter Pan and Trunks! Looking at Earth from Planet Plant, Goku calms his Golden Great Ape form and transforms into primal SUPER SAIYAN 4!',
      hairOrFormUnlocked: 'Golden Great Ape & Super Saiyan 4 (Black Hair + Crimson Fur)',
      kidLesson: 'Pan\'s love for her Grandpa Goku turned wild Great Ape rage into heroic Super Saiyan 4 control!'
    },
    {
      id: 'dbgt-shadow-dragons',
      era: 'DBGT',
      eraFullName: 'Dragon Ball GT',
      years: 'Age 790',
      title: 'Super 17, SSJ4 Vegeta & SSJ4 Gogeta vs. Shadow Dragons',
      spriteUrl: 'assets/renders/gogeta_ssj4.webp',
      planetColor: '#991b1b',
      mainHero: 'Super Saiyan 4 Gogeta, SSJ4 Goku & SSJ4 Vegeta',
      mainEnemy: 'Super 17, Eis & Nuova Shenron, and Omega Shenron',
      keyEvents: 'Overusing the Dragon Balls spawns 7 Shadow Dragons led by Omega Shenron! Goku and Vegeta both reach Super Saiyan 4, fuse into fiery crimson-haired SSJ4 GOGETA, and save the cosmos with the Universal Spirit Bomb!',
      hairOrFormUnlocked: 'Super Saiyan 4 Gogeta (Fiery Crimson Hair & Golden Aura)',
      kidLesson: 'The Dragon Balls taught the heroes to rely on their own courage instead of wishing away every problem.'
    },
    {
      id: 'dbs-gods-frieza',
      era: 'DBS',
      eraFullName: 'Dragon Ball Super',
      years: 'Age 778 – 779',
      title: 'Battle of Gods (Super Saiyan God vs. Beerus) & Golden Freezer',
      spriteUrl: 'assets/renders/goku_ssg.webp',
      planetColor: '#f43f5e',
      mainHero: 'Super Saiyan God (Red) & Super Saiyan Blue Goku & Vegeta',
      mainEnemy: 'Lord Beerus (God of Destruction), Whis & Golden Freezer',
      keyEvents: 'Lord Beerus wakes up looking for a "Super Saiyan God"! Goku performs the 6-Saiyan ritual to unlock Flame-Red hair, then trains with Whis alongside Vegeta to unlock Cyan-Blue "Super Saiyan Blue" against Golden Freezer!',
      hairOrFormUnlocked: 'Super Saiyan God (Red), Super Saiyan Blue (Cyan) & Golden Freezer',
      kidLesson: 'Even after Majin Buu, there are 12 whole universes, Gods of Destruction, and Angels to learn from!'
    },
    {
      id: 'dbs-goku-black',
      era: 'DBS',
      eraFullName: 'Dragon Ball Super',
      years: 'Age 779',
      title: 'Future Trunks, Goku Black (SSJ Rosé) & Vegetto Blue Saga',
      spriteUrl: 'assets/renders/vegetto_ssjb.webp',
      planetColor: '#ec4899',
      mainHero: 'Vegetto Blue, Super Saiyan Rage Trunks, Goku & Vegeta',
      mainEnemy: 'Goku Black (Super Saiyan Rosé) & Fused Zamasu',
      keyEvents: 'Future Trunks returns for help against "Goku Black" (Zamasu in Goku\'s body with Rose-Pink hair)! Goku and Vegeta clip on Potara Earrings to become VEGETTO SUPER SAIYAN BLUE!',
      hairOrFormUnlocked: 'Vegetto Blue, Super Saiyan Rosé (Pink) & Trunks Super Saiyan Rage',
      kidLesson: 'Stolen power can never truly defeat warriors who earned their strength through years of training.'
    },
    {
      id: 'dbs-top-broly-superhero',
      era: 'DBS',
      eraFullName: 'Dragon Ball Super',
      years: 'Age 780 – 783',
      title: 'Tournament of Power (Jiren), Broly, Ultra Ego, Black Freezer & Super Hero',
      spriteUrl: 'assets/renders/goku_mui.webp',
      planetColor: '#c084fc',
      mainHero: 'Silver Ultra Instinct Goku, Ultra Ego Vegeta, Gogeta Blue, Gohan Beast & Orange Piccolo',
      mainEnemy: 'Jiren, Legendary Broly, Moro, Gas, Black Freezer & Cell Max',
      keyEvents: 'Goku masters Silver-Hair Ultra Instinct while Vegeta unlocks Royal-Blue SSB Evolved in the Tournament of Power (won by Android 17)! Afterward, Gogeta Blue stops Broly, Vegeta awakens Purple Ultra Ego, Freezer unveils Black Freezer after 10 years in a Time Chamber, and Gohan & Piccolo unlock Gohan Beast and Orange Piccolo!',
      hairOrFormUnlocked: 'Silver Ultra Instinct, SSB Evolved, Purple Ultra Ego, Black Freezer, Gohan Beast & Orange Piccolo',
      kidLesson: 'Every hero now shines with their own unique path: Goku (Silver), Vegeta (Purple), Gohan (Beast Silver), and Piccolo (Orange)!'
    }
  ],

  // 3. Expanded Individual Character Roster (21 Fighter Entries Covering 65+ Transformations!)
  //    Every form includes a numeric `powerScore` (1 - 100) for accurate Form-vs-Form 1v1 Beam Struggles!
  fighters: [
    {
      id: 'goku',
      name: 'Son Goku (Kakarot)',
      alignment: 'hero',
      series: 'DB • DBZ • Daima • GT • DBS',
      race: 'Saiyan raised on Earth',
      signatureMove: 'Kamehameha, Power Pole, Instant Transmission, Kaio-ken & Spirit Bomb',
      auraColor: '#00e5ff',
      peakPowerLabel: 'Mastered Ultra Instinct — Silver Hair (90 Septillion Est.)',
      spriteUrl: 'assets/renders/goku_base.webp',
      forms: [
        { label: 'Kid Goku (Power Pole & Nimbus)', spriteUrl: 'assets/renders/kid_goku.webp', auraHex: '#fb923c', power: '10 → 260 (Official DB)', powerScore: 28 },
        { label: 'Base Goku (Adult)', spriteUrl: 'assets/renders/goku_base.webp', auraHex: '#f97316', power: '3,000,000 (Official Namek)', powerScore: 52 },
        { label: 'Super Saiyan 1 (Gold)', spriteUrl: 'assets/renders/goku_ssj1.webp', auraHex: '#facc15', power: '150,000,000 (Official Namek)', powerScore: 68 },
        { label: 'Super Saiyan 2 (Sparks)', spriteUrl: 'assets/renders/goku_ssj2.webp', auraHex: '#38bdf8', power: '6,000,000,000 (Est. 100x)', powerScore: 74 },
        { label: 'Super Saiyan 3 (Mane)', spriteUrl: 'assets/renders/goku_ssj3.webp', auraHex: '#eab308', power: '24,000,000,000 (Est. 400x)', powerScore: 80 },
        { label: 'Super Saiyan 4 (Primal Fur)', spriteUrl: 'assets/renders/goku_ssj4.webp', auraHex: '#ef4444', power: '1.8 Quadrillion (Est.)', powerScore: 86 },
        { label: 'Super Saiyan God (Red)', spriteUrl: 'assets/renders/goku_ssg.webp', auraHex: '#f43f5e', power: '2.5 Quadrillion+ (God Ki Est.)', powerScore: 88 },
        { label: 'Super Saiyan Blue (SSB)', spriteUrl: 'assets/renders/goku_ssjb.webp', auraHex: '#00e5ff', power: '125 Quadrillion+ (Est.)', powerScore: 92 },
        { label: 'Ultra Instinct -Sign- (Omen)', spriteUrl: 'assets/renders/goku_ui.webp', auraHex: '#94a3b8', power: '18 Septillion (UI Sign Est.)', powerScore: 95 },
        { label: 'Mastered Ultra Instinct (Silver Hair)', spriteUrl: 'assets/renders/goku_mui.webp', auraHex: '#e2e8f0', power: '90 Septillion (Silver UI Est.)', powerScore: 99 }
      ],
      kidBio: 'Cheerful, pure-hearted, and always hungry! Found in Mount Paozu as a monkey-tailed boy with Grandpa Gohan\'s 4-Star Dragon Ball, his red Power Pole, and the Flying Nimbus, Goku trained with Master Roshi, King Kai, and Whis—rising across 10 iconic forms all the way to Silver-Haired Mastered Ultra Instinct!'
    },
    {
      id: 'vegeta',
      name: 'Prince Vegeta IV',
      alignment: 'hero',
      series: 'DBZ • Daima • GT • DBS',
      race: 'Royal Saiyan Prince',
      signatureMove: 'Galick Gun, Final Flash, Big Bang Attack & Hakai',
      auraColor: '#9333ea',
      peakPowerLabel: 'Ultra Ego (85 Septillion+ Est.)',
      spriteUrl: 'assets/renders/vegeta_base.webp',
      forms: [
        { label: 'Base Vegeta', spriteUrl: 'assets/renders/vegeta_base.webp', auraHex: '#3b82f6', power: '18,000 (Official) → 54M (Est.)', powerScore: 51 },
        { label: 'Super Saiyan 1', spriteUrl: 'assets/renders/vegeta_ssj1.webp', auraHex: '#facc15', power: '2,700,000,000 (Est. 50x)', powerScore: 67 },
        { label: 'Super Saiyan 2 (Lightning)', spriteUrl: 'assets/renders/vegeta_ssj2.webp', auraHex: '#38bdf8', power: '5,400,000,000+ (Est. 100x)', powerScore: 75 },
        { label: 'Super Saiyan 4 (GT)', spriteUrl: 'assets/renders/vegeta_ssj4.webp', auraHex: '#ef4444', power: '1.8 Quadrillion (Est.)', powerScore: 86 },
        { label: 'Super Saiyan God (Red)', spriteUrl: 'assets/renders/vegeta_ssg.webp', auraHex: '#f43f5e', power: '2.5 Quadrillion+ (God Ki Est.)', powerScore: 88 },
        { label: 'Super Saiyan Blue (SSB)', spriteUrl: 'assets/renders/vegeta_ssjb.webp', auraHex: '#00e5ff', power: '125 Quadrillion+ (Est.)', powerScore: 92 },
        { label: 'Super Saiyan Blue Evolved (Royal Blue)', spriteUrl: 'assets/renders/vegeta_ssjbe.webp', auraHex: '#2563eb', power: '2.5 Quintillion+ (20x SSB Est.)', powerScore: 95 },
        { label: 'Ultra Ego (Destruction Purple)', spriteUrl: 'assets/renders/vegeta_ultra_ego.webp', auraHex: '#a855f7', power: '85 Septillion+ (Hakai Est.)', powerScore: 98 }
      ],
      kidBio: 'The proud Prince of all Saiyans! Once Goku\'s invader rival with an official 18,000 scouter reading, Vegeta became Bulma\'s husband, Trunks and Bulla\'s dad, and Earth\'s fiercest protector—unlocking Royal-Blue SSB Evolved and Purple Ultra Ego!'
    },
    {
      id: 'vegetto',
      name: 'Vegetto / Vegito (Potara)',
      alignment: 'hero',
      series: 'DBZ • DBS',
      race: 'Potara Earring Fusion (Goku + Vegeta)',
      signatureMove: 'Final Kamehameha, Spirit Sword & Banshee Blast',
      auraColor: '#00e5ff',
      peakPowerLabel: 'Vegetto Blue (120 Septillion+ Est.)',
      spriteUrl: 'assets/renders/vegetto_ssjb.webp',
      forms: [
        { label: 'Base Vegetto (Black Hair)', spriteUrl: 'assets/renders/vegetto_base.webp', auraHex: '#f97316', power: '180 Billion (Est.)', powerScore: 82 },
        { label: 'Super Vegetto (Gold SSJ1)', spriteUrl: 'assets/renders/vegetto_ssj1.webp', auraHex: '#facc15', power: '9 Trillion (Est. 50x)', powerScore: 87 },
        { label: 'Vegetto Super Saiyan Blue', spriteUrl: 'assets/renders/vegetto_ssjb.webp', auraHex: '#00e5ff', power: '120 Septillion+ (Est.)', powerScore: 99 }
      ],
      kidBio: 'Born when Goku and Vegeta clip the Supreme Kai\'s magical Potara Earrings onto opposite ears! Vegetto wears Goku\'s gi colors inverted (blue outer gi over orange undershirt) with Vegeta\'s white gloves and boots!'
    },
    {
      id: 'gogeta',
      name: 'Gogeta (Fusion Dance)',
      alignment: 'hero',
      series: 'DBZ: Fusion Reborn • DBGT • DBS: Broly',
      race: 'Metamoran Dance Fusion (Goku + Vegeta)',
      signatureMove: 'Stardust Breaker (Soul Punisher) & Big Bang Kamehameha',
      auraColor: '#00e5ff',
      peakPowerLabel: 'Full-Power Gogeta Blue (120 Septillion+ Est.)',
      spriteUrl: 'assets/renders/gogeta_ssjb.webp',
      forms: [
        { label: 'Base Gogeta', spriteUrl: 'assets/renders/gogeta_base.webp', auraHex: '#f97316', power: '180 Billion (Est.)', powerScore: 82 },
        { label: 'Super Gogeta (SSJ1)', spriteUrl: 'assets/renders/gogeta_ssj1.webp', auraHex: '#facc15', power: '9 Trillion (Est. 50x)', powerScore: 87 },
        { label: 'SSJ4 Gogeta (GT Crimson Hair)', spriteUrl: 'assets/renders/gogeta_ssj4.webp', auraHex: '#ef4444', power: '168 Quadrillion (Est.)', powerScore: 94 },
        { label: 'Gogeta Blue (SSJB)', spriteUrl: 'assets/renders/gogeta_ssjb.webp', auraHex: '#00e5ff', power: '60 Septillion (Est.)', powerScore: 98 },
        { label: 'Full-Power Gogeta Blue (Stardust Breaker)', spriteUrl: 'assets/renders/gogeta_ssjbe.webp', auraHex: '#38bdf8', power: '120 Septillion+ (Est.)', powerScore: 99 }
      ],
      kidBio: '"I am neither Goku nor Vegeta!" Created when Goku and Vegeta perform the symmetrical Metamoran Fusion Dance with matching Ki! Defeated Super Janemba, outclassed Omega Shenron, and stopped Full-Power Broly!'
    },
    {
      id: 'gohan',
      name: 'Son Gohan (Beast)',
      alignment: 'hero',
      series: 'DBZ • GT • DBS: Super Hero',
      race: 'Half-Saiyan / Half-Human Hybrid',
      signatureMove: 'Father-Son Kamehameha, Masenko & Beast Special Beam Cannon',
      auraColor: '#e11d48',
      peakPowerLabel: 'Gohan Beast (88 Septillion Est.)',
      spriteUrl: 'assets/renders/gohan_beast.webp',
      forms: [
        { label: 'Base Gohan', spriteUrl: 'assets/renders/gohan_base.webp', auraHex: '#f8fafc', power: '45,000,000 (Est.)', powerScore: 50 },
        { label: 'Super Saiyan 1', spriteUrl: 'assets/renders/gohan_ssj1.webp', auraHex: '#facc15', power: '4.7 Billion (Est.)', powerScore: 69 },
        { label: 'Teen Gohan SSJ2 (Cell Games)', spriteUrl: 'assets/renders/gohan_ssj2.webp', auraHex: '#38bdf8', power: '10.2 Billion (Est.)', powerScore: 76 },
        { label: 'Ultimate / Mystic Gohan', spriteUrl: 'assets/renders/gohan_ultimate.webp', auraHex: '#e2e8f0', power: '43 Billion (Est.)', powerScore: 82 },
        { label: 'Gohan Beast (Silver Mane)', spriteUrl: 'assets/renders/gohan_beast.webp', auraHex: '#e11d48', power: '88 Septillion (Est.)', powerScore: 98 }
      ],
      kidBio: 'Goku\'s scholar son! First Saiyan in history to unlock Super Saiyan 2 against Cell, and awakened towering silver-haired, crimson-eyed GOHAN BEAST to protect Piccolo and Pan!'
    },
    {
      id: 'piccolo',
      name: 'Piccolo (Orange)',
      alignment: 'hero',
      series: 'DB • DBZ • Daima • GT • DBS: Super Hero',
      race: 'Namekian Warrior',
      signatureMove: 'Special Beam Cannon (Makankosappo), Hellzone Grenade & Light Grenade',
      auraColor: '#f97316',
      peakPowerLabel: 'Orange Piccolo (45 Septillion Est.)',
      spriteUrl: 'assets/renders/piccolo_orange.webp',
      forms: [
        { label: 'Base Piccolo (Weighted Cape)', spriteUrl: 'assets/renders/piccolo_base.webp', auraHex: '#22c55e', power: '1,200,000+ (Namek Fusion)', powerScore: 45 },
        { label: 'Super Namekian (Fused w/ Kami)', spriteUrl: 'assets/renders/piccolo_super.webp', auraHex: '#eab308', power: '450,000,000+ (Est.)', powerScore: 65 },
        { label: 'Giant Orange Piccolo', spriteUrl: 'assets/renders/piccolo_orange.webp', auraHex: '#f97316', power: '45 Septillion (Est.)', powerScore: 95 }
      ],
      kidBio: 'Gohan\'s mentor and Pan\'s favorite teacher! When Piccolo wished for Shenron to unlock his potential, Shenron added "a little extra"—giving him the giant muscular ORANGE PICCOLO form!'
    },
    {
      id: 'freezer',
      name: 'Emperor Freezer / Frieza',
      alignment: 'villain',
      series: 'DBZ • GT • DBS',
      race: 'Frost Demon Emperor',
      signatureMove: 'Death Beam, Supernova, Death Ball & Black Emperor\'s Rush',
      auraColor: '#a855f7',
      peakPowerLabel: 'Black Freezer — Manga Ch. 87 (150 Septillion+ Est.)',
      spriteUrl: 'assets/renders/freezer_black.webp',
      forms: [
        { label: '1st Form Freezer', spriteUrl: 'assets/renders/freezer_1st.webp', auraHex: '#a855f7', power: '530,000 (Official Namek)', powerScore: 38 },
        { label: '2nd Form (Giant Horns)', spriteUrl: 'assets/renders/freezer_2nd.webp', auraHex: '#ec4899', power: '1,060,000 (Official Namek)', powerScore: 42 },
        { label: '3rd Form (Alien)', spriteUrl: 'assets/renders/freezer_3rd.webp', auraHex: '#c084fc', power: '2,120,000 (Est.)', powerScore: 46 },
        { label: 'Final Form (100% Namek)', spriteUrl: 'assets/renders/freezer_final.webp', auraHex: '#e879f9', power: '120,000,000 (Official Namek)', powerScore: 65 },
        { label: 'Golden Freezer (DBS)', spriteUrl: 'assets/renders/freezer_golden.webp', auraHex: '#facc15', power: '130 Quadrillion+ (Est.)', powerScore: 92 },
        { label: 'Black Freezer (Manga Ch. 87)', spriteUrl: 'assets/renders/freezer_black.webp', auraHex: '#9333ea', power: '150 Septillion+ (10-Yr Chamber Est.)', powerScore: 99 }
      ],
      kidBio: 'The galactic emperor of Universe 7! Freezer created his first 3 forms just to suppress his 120,000,000 Namek power—then unlocked Golden Freezer, and trained 10 full years in a Hyperbolic Time Chamber to unveil obsidian BLACK FREEZER!'
    },
    {
      id: 'cell',
      name: 'Perfect Cell / Célula',
      alignment: 'villain',
      series: 'DBZ • DBGT',
      race: 'Bio-Android (Goku, Vegeta, Piccolo & Freezer Cells)',
      signatureMove: 'Solar Kamehameha, Special Beam Cannon & Namekian Regeneration',
      auraColor: '#84cc16',
      peakPowerLabel: 'Super Perfect Cell (10.97 Billion)',
      spriteUrl: 'assets/renders/cell_perfect.webp',
      forms: [
        { label: 'Imperfect Cell (1st Form)', spriteUrl: 'assets/renders/cell_imperfect.webp', auraHex: '#22c55e', power: '370,000,000', powerScore: 62 },
        { label: 'Semi-Perfect Cell (2nd Form)', spriteUrl: 'assets/renders/cell_semiperfect.webp', auraHex: '#f97316', power: '897,000,000', powerScore: 66 },
        { label: 'Perfect Cell', spriteUrl: 'assets/renders/cell_perfect.webp', auraHex: '#84cc16', power: '4,500,000,000', powerScore: 71 },
        { label: 'Super Perfect Cell (SSJ2 Sparks)', spriteUrl: 'assets/renders/cell_superperfect.webp', auraHex: '#facc15', power: '10,970,000,000', powerScore: 75 }
      ],
      kidBio: 'Built by Dr. Gero\'s supercomputer from the DNA of Goku, Vegeta, Piccolo, and Freezer! He hosted the Cell Games tournament before losing a giant Kamehameha clash to SSJ2 Teen Gohan!'
    },
    {
      id: 'buu',
      name: 'Majin Buu (All Forms)',
      alignment: 'villain',
      series: 'DBZ • DBGT • DBS',
      race: 'Ancient Magical Majin',
      signatureMove: 'Chocolate Candy Beam, Planet Burst & Instant Regeneration',
      auraColor: '#f472b6',
      peakPowerLabel: 'Buuhan — Gohan Absorbed (14.8 Billion+)',
      spriteUrl: 'assets/renders/buu_fat.webp',
      forms: [
        { label: 'Innocent Fat Buu', spriteUrl: 'assets/renders/buu_fat.webp', auraHex: '#f472b6', power: '9,000,000,000', powerScore: 78 },
        { label: 'Super Buu', spriteUrl: 'assets/renders/buu_super.webp', auraHex: '#ec4899', power: '11,000,000,000', powerScore: 81 },
        { label: 'Buutenks (Gotenks Absorbed)', spriteUrl: 'assets/renders/buu_gotenks.webp', auraHex: '#facc15', power: '12,300,000,000', powerScore: 83 },
        { label: 'Buuhan (Gohan Absorbed)', spriteUrl: 'assets/renders/buu_gohan.webp', auraHex: '#a855f7', power: '14,800,000,000', powerScore: 84 },
        { label: 'Kid Buu (Pure Chaotic)', spriteUrl: 'assets/renders/buu_kid.webp', auraHex: '#e11d48', power: '10,500,000,000', powerScore: 80 }
      ],
      kidBio: 'A magical pink genie who stretches like bubble gum and turns opponents into chocolate bars! Good Fat Buu became Mr. Satan\'s best friend, while Goku defeated Kid Buu with the Super Spirit Bomb!'
    },
    {
      id: 'broly',
      name: 'Broly (Legendary Saiyan)',
      alignment: 'hero',
      series: 'DBZ Movies • DBS: Broly',
      race: 'Mutant Pure Saiyan',
      signatureMove: 'Gigantic Roar, Planet Crusher & Blaster Meteor',
      auraColor: '#22c55e',
      peakPowerLabel: 'Full Power Legendary SSJ (11.2 Septillion)',
      spriteUrl: 'assets/renders/broly_lssj.webp',
      forms: [
        { label: 'Wrathful / Base Broly', spriteUrl: 'assets/renders/broly_base.webp', auraHex: '#eab308', power: '7 Septillion', powerScore: 91 },
        { label: 'Legendary Green Super Saiyan', spriteUrl: 'assets/renders/broly_lssj.webp', auraHex: '#22c55e', power: '11.2 Septillion', powerScore: 96 }
      ],
      kidBio: 'A gentle giant raised on Planet Vampa with a once-in-1,000-years Saiyan mutation! When Broly goes Full Power, his hair turns neon lime-green and it takes Gogeta Blue to stop him!'
    },
    {
      id: 'goku-black',
      name: 'Goku Black (Zamasu)',
      alignment: 'villain',
      series: 'Dragon Ball Super',
      race: 'Rogue Supreme Kai in Goku\'s Body',
      signatureMove: 'Divine Lasso, Black Kamehameha & Scythe of Sorrow',
      auraColor: '#ec4899',
      peakPowerLabel: 'Super Saiyan Rosé (12 Quintillion+)',
      spriteUrl: 'assets/renders/goku_rose.webp',
      forms: [
        { label: 'Super Saiyan Rosé (Pink)', spriteUrl: 'assets/renders/goku_rose.webp', auraHex: '#ec4899', power: '12 Quintillion+', powerScore: 93 }
      ],
      kidBio: 'A rogue deity from Universe 10 named Zamasu who wished on the Super Dragon Balls to swap bodies with Goku! Because his soul is divine, his Super Saiyan hair turns glowing Rose-Pink!'
    },
    {
      id: 'beerus',
      name: 'Lord Beerus (Bills)',
      alignment: 'deity',
      series: 'Battle of Gods • DBS',
      race: 'Universe 7 God of Destruction',
      signatureMove: 'Hakai (Erase), Sphere of Destruction & Beerus Judgement',
      auraColor: '#a855f7',
      peakPowerLabel: 'God of Destruction (102 Septillion)',
      spriteUrl: 'assets/renders/beerus.webp',
      forms: [
        { label: 'Lord Beerus (Hakai Power)', spriteUrl: 'assets/renders/beerus.webp', auraHex: '#a855f7', power: '102 Septillion', powerScore: 98 }
      ],
      kidBio: 'The purple cat-like God of Destruction of Universe 7! Beerus can erase planets with a tap of his finger—but spares Earth because Bulma serves him delicious ramen, pizza, and pudding!'
    },
    {
      id: 'whis',
      name: 'Whis & Grand Priest',
      alignment: 'deity',
      series: 'Dragon Ball Super',
      race: 'Celestial Angels',
      signatureMove: '24/7 Autonomous Ultra Instinct & 3-Minute Time Rewind',
      auraColor: '#38bdf8',
      peakPowerLabel: 'Angel & Grand Priest Tier',
      spriteUrl: 'assets/renders/whis.webp',
      forms: [
        { label: 'Angel Whis (Universe 7 Teacher)', spriteUrl: 'assets/renders/whis.webp', auraHex: '#38bdf8', power: 'Angel Tier (Surpasses Beerus!)', powerScore: 99 },
        { label: 'The Grand Priest (Father of Angels)', spriteUrl: 'assets/renders/grand_priest.webp', auraHex: '#e2e8f0', power: 'Top 5 in the Multiverse!', powerScore: 100 }
      ],
      kidBio: 'Whis is Beerus\'s calm Angel teacher who trained Goku and Vegeta in God Ki and Ultra Instinct! His father, the Grand Priest, is one of the strongest beings across all 12 universes!'
    },
    {
      id: 'zeno',
      name: 'Grand Zeno (Omni-King)',
      alignment: 'deity',
      series: 'Dragon Ball Super',
      race: 'Supreme Ruler of All 12 Universes',
      signatureMove: 'Omniversal Erase ("Squish!")',
      auraColor: '#38bdf8',
      peakPowerLabel: 'Infinite / Top of Everything',
      spriteUrl: 'assets/renders/zeno.webp',
      forms: [
        { label: 'Grand Zeno (Zen-Oh)', spriteUrl: 'assets/renders/zeno.webp', auraHex: '#38bdf8', power: 'INFINITE (Omni-King)', powerScore: 100 }
      ],
      kidBio: 'Tiny, colorful, and friendly with Goku ("Zen-chan!"), Grand Zeno rules over all 12 Universes! Even Gods of Destruction freeze in fear when Zeno raises his glowing hands!'
    },
    {
      id: 'jiren',
      name: 'Jiren the Grey',
      alignment: 'hero',
      series: 'Dragon Ball Super (Universe 11)',
      race: 'Pride Trooper Ace',
      signatureMove: 'Power Impact, Invisible Eye Glare & Omegaheat Magnetron',
      auraColor: '#ef4444',
      peakPowerLabel: 'Limit-Breaker Jiren (12.1 Septillion)',
      spriteUrl: 'assets/renders/jiren.webp',
      forms: [
        { label: 'Jiren (Universe 11 Champion)', spriteUrl: 'assets/renders/jiren.webp', auraHex: '#ef4444', power: '12.1 Septillion', powerScore: 96 }
      ],
      kidBio: 'The strongest superhero of Universe 11\'s Pride Troopers! Jiren pushed Goku to awaken Silver-Haired Autonomous Ultra Instinct in the final minutes of the Tournament of Power!'
    },
    {
      id: 'toppo-dyspo',
      name: 'Toppo & Dyspo (U11)',
      alignment: 'hero',
      series: 'Dragon Ball Super (Universe 11)',
      race: 'Pride Trooper Leaders',
      signatureMove: 'Justice Flash, Hakai Energy & Super Maximum Light Speed Mode',
      auraColor: '#a855f7',
      peakPowerLabel: 'God of Destruction Candidate Toppo',
      spriteUrl: 'assets/renders/toppo.webp',
      forms: [
        { label: 'Toppo (Leader of Pride Troopers)', spriteUrl: 'assets/renders/toppo.webp', auraHex: '#a855f7', power: '75 Sextillion', powerScore: 92 },
        { label: 'Dyspo (Faster-Than-Light)', spriteUrl: 'assets/renders/dyspo.webp', auraHex: '#facc15', power: '50 Trillion', powerScore: 86 }
      ],
      kidBio: 'Jiren\'s heroic Pride Trooper teammates! Mustached Toppo trained to become Universe 11\'s next God of Destruction, and purple rabbit warrior Dyspo moves faster than the speed of light!'
    },
    {
      id: 'trunks',
      name: 'Future Trunks',
      alignment: 'hero',
      series: 'DBZ • DBS',
      race: 'Half-Saiyan Time Traveler',
      signatureMove: 'Burning Attack, Shining Sword Slash & Spirit Bomb Sword',
      auraColor: '#38bdf8',
      peakPowerLabel: 'Super Saiyan Rage (17.5 Quintillion)',
      spriteUrl: 'assets/renders/trunks_rage.webp',
      forms: [
        { label: 'Base Future Trunks', spriteUrl: 'assets/renders/trunks_base.webp', auraHex: '#6366f1', power: '25,000,000', powerScore: 49 },
        { label: 'Super Saiyan Trunks', spriteUrl: 'assets/renders/trunks_ssj1.webp', auraHex: '#facc15', power: '905,000,000', powerScore: 67 },
        { label: 'Super Saiyan Rage (Gold + Blue)', spriteUrl: 'assets/renders/trunks_rage.webp', auraHex: '#00e5ff', power: '17.5 Quintillion', powerScore: 92 }
      ],
      kidBio: 'Vegeta and Bulma\'s polite, sword-wielding son from the future! Traveled back in Bulma\'s Time Machine to warn Goku about the Androids and later unlocked Super Saiyan Rage!'
    },
    {
      id: 'goten',
      name: 'Son Goten & Kid Trunks',
      alignment: 'hero',
      series: 'DBZ • DB Daima • DBS',
      race: 'Half-Saiyan Best Friends',
      signatureMove: 'Kamekameha, Double Buster & Metamoran Fusion Dance!',
      auraColor: '#fb923c',
      peakPowerLabel: 'Youngest Super Saiyans in History (Age 7 & 8!)',
      spriteUrl: 'assets/renders/goten.webp',
      forms: [
        { label: 'Son Goten (Goku\'s Youngest Son)', spriteUrl: 'assets/renders/goten.webp', auraHex: '#fb923c', power: '120,000,000+ (Youngest SSJ Est.)', powerScore: 58 },
        { label: 'Kid Trunks (Vegeta\'s Young Son)', spriteUrl: 'assets/renders/kid_trunks.webp', auraHex: '#22c55e', power: '130,000,000+ (World Jr. Champ Est.)', powerScore: 59 }
      ],
      kidBio: 'Best friends since diapers! Goku\'s youngest son Son Goten (age 7) and Vegeta\'s young son Kid Trunks (age 8) unlocked Golden Super Saiyan just by sparring together—and team up for the Fusion Dance to become Gotenks!'
    },
    {
      id: 'gotenks',
      name: 'Gotenks (Goten + Trunks)',
      alignment: 'hero',
      series: 'DBZ • DBS',
      race: 'Kids\' Metamoran Dance Fusion',
      signatureMove: 'Super Ghost Kamikaze Attack & Galactic Donut',
      auraColor: '#facc15',
      peakPowerLabel: 'Super Saiyan 3 Gotenks (45.6 Billion Est.)',
      spriteUrl: 'assets/renders/gotenks_ssj3.webp',
      forms: [
        { label: 'Base Gotenks', spriteUrl: 'assets/renders/gotenks_base.webp', auraHex: '#a855f7', power: '65,600,000 (Est.)', powerScore: 66 },
        { label: 'Super Saiyan 1 Gotenks', spriteUrl: 'assets/renders/gotenks_ssj1.webp', auraHex: '#facc15', power: '5.7 Billion (Est.)', powerScore: 73 },
        { label: 'Super Saiyan 3 Gotenks', spriteUrl: 'assets/renders/gotenks_ssj3.webp', auraHex: '#eab308', power: '45.6 Billion (Est.)', powerScore: 82 }
      ],
      kidBio: 'When 7-year-old Goten and 8-year-old Trunks do the Fusion Dance, they become the cocky superhero GOTENKS—inventing hilarious attacks like spitting exploding ghosts!'
    },
    {
      id: 'androids',
      name: 'Androids 16, 17 & 18',
      alignment: 'hero',
      series: 'DBZ • DBGT • DBS',
      race: 'Infinite-Energy Cyborgs & Nature Protector',
      signatureMove: 'Android Barrier, Accel Dance & Hell\'s Flash',
      auraColor: '#10b981',
      peakPowerLabel: 'Tournament of Power Winner Android 17',
      spriteUrl: 'assets/renders/android_17.webp',
      forms: [
        { label: 'Android 16 (Loves Birds & Nature)', spriteUrl: 'assets/renders/android_16.webp', auraHex: '#22c55e', power: '440,000,000 (Est.)', powerScore: 64 },
        { label: 'Android 18 (Krillin\'s Wife)', spriteUrl: 'assets/renders/android_18.webp', auraHex: '#38bdf8', power: '380,000,000+ (Est.)', powerScore: 70 },
        { label: 'Android 17 (DBS Park Ranger MVP!)', spriteUrl: 'assets/renders/android_17.webp', auraHex: '#10b981', power: 'Quintillion Tier (ToP Winner)', powerScore: 91 }
      ],
      kidBio: 'Built with infinite energy reactors that never get tired! Gentle Android 16 inspired Gohan, 18 married Krillin, and 17 won the entire Tournament of Power and wished all erased universes back!'
    },
    {
      id: 'earth-heroes',
      name: 'Krillin, Roshi, Tien & Yamcha',
      alignment: 'hero',
      series: 'DB • DBZ • DBGT • DBS',
      race: 'Earthling Martial Arts Champions',
      signatureMove: 'Destructo Disc, Original Kamehameha, Tri-Beam & Wolf Fang Fist',
      auraColor: '#fb923c',
      peakPowerLabel: 'Earth\'s Greatest Martial Artists',
      spriteUrl: 'assets/renders/krillin.webp',
      forms: [
        { label: 'Master Roshi (Kamehameha Inventor)', spriteUrl: 'assets/renders/roshi.webp', auraHex: '#38bdf8', power: '139 (Official DB) → Max Power', powerScore: 44 },
        { label: 'Yamcha (Wolf Fang Fist & Baseball Pro)', spriteUrl: 'assets/renders/yamcha.webp', auraHex: '#f97316', power: '1,480 (Official) → 500K+ (Est.)', powerScore: 39 },
        { label: 'Tien Shinhan (Three-Eyed Master)', spriteUrl: 'assets/renders/tenshinhan.webp', auraHex: '#22c55e', power: '1,830 (Official) → 2.5M+ (Est.)', powerScore: 48 },
        { label: 'Krillin (Strongest Pure Human!)', spriteUrl: 'assets/renders/krillin.webp', auraHex: '#fde047', power: '75,000 (Namek) → 5M+ (Est.)', powerScore: 50 }
      ],
      kidBio: 'Goku\'s original Dragon Ball friends! Master Roshi invented the Kamehameha, and Krillin, Tien, and Yamcha prove courage and smart martial arts skills matter even without Saiyan hair!'
    },
    {
      id: 'bulma-satan',
      name: 'Bulma & Mr. Satan (Hercule)',
      alignment: 'hero',
      series: 'DB • DBZ • Daima • GT • DBS',
      race: 'Earth\'s Greatest Genius & World Champion',
      signatureMove: 'Dragon Radar, Time Machine, Capsule Tech & Dynamite Kick!',
      auraColor: '#38bdf8',
      peakPowerLabel: 'Saved the Multiverse with Brains & Heart!',
      spriteUrl: 'assets/renders/bulma.webp',
      forms: [
        { label: 'Bulma Briefs (Dragon Radar Inventor)', spriteUrl: 'assets/renders/bulma.webp', auraHex: '#06b6d4', power: 'IQ 300+ Super Scientist!', powerScore: 25 },
        { label: 'Mr. Satan / Hercule (Buu\'s Best Friend)', spriteUrl: 'assets/renders/mr_satan.webp', auraHex: '#eab308', power: 'World Martial Arts Champ!', powerScore: 20 }
      ],
      kidBio: 'Without Bulma inventing the Dragon Radar and Time Machine in Episode 1, Dragon Ball would never have happened! And without Mr. Satan befriending Buu and rallying Earth for the Spirit Bomb, Kid Buu would have won!'
    },
    {
      id: 'bardock-raditz',
      name: 'Bardock & Raditz (Goku\'s Family)',
      alignment: 'hero',
      series: 'DBZ • DBS: Broly',
      race: 'Pure-Blooded Planet Vegeta Saiyans',
      signatureMove: 'Final Spirit Cannon & Double Sunday',
      auraColor: '#22c55e',
      peakPowerLabel: 'Bardock (Goku\'s Heroic Father)',
      spriteUrl: 'assets/renders/bardock.webp',
      forms: [
        { label: 'Raditz (Goku\'s Older Brother)', spriteUrl: 'assets/renders/raditz.webp', auraHex: '#ef4444', power: '1,500 (Official Daizenshuu)', powerScore: 30 },
        { label: 'Bardock (Goku\'s Father)', spriteUrl: 'assets/renders/bardock.webp', auraHex: '#22c55e', power: '10,000+ (Saiyan Rebel)', powerScore: 41 }
      ],
      kidBio: 'Goku\'s Saiyan family! Bardock sent baby Kakarot (Goku) to Earth in a round space pod to save him before standing bravely against Freezer, while long-haired Raditz was the first villain of Dragon Ball Z!'
    },
    {
      id: 'ginyu',
      name: 'Captain Ginyu',
      alignment: 'villain',
      series: 'DBZ (Namek) • DBS',
      race: 'Leader of the Ginyu Force',
      signatureMove: 'Body Change! ("Change Now!") & Milky Cannon',
      auraColor: '#a855f7',
      peakPowerLabel: '120,000 (Official Namek Scouter)',
      spriteUrl: 'assets/renders/ginyu.webp',
      forms: [
        { label: 'Captain Ginyu (Special Fighting Pose!)', spriteUrl: 'assets/renders/ginyu.webp', auraHex: '#a855f7', power: '120,000 (Official Namek)', powerScore: 36 }
      ],
      kidBio: 'Freezer\'s goofy dance-obsessed Ginyu Force captain! Whenever someone is stronger than him, Ginyu shouts "CHANGE NOW!" to swap bodies—until Goku tricked him into swapping bodies with a Namekian frog!'
    },
    {
      id: 'janemba',
      name: 'Super Janemba',
      alignment: 'villain',
      series: 'DBZ: Fusion Reborn • SDBH',
      race: 'Other World Reality-Warping Demon',
      signatureMove: 'Dimension Sword, Lightning Shower Rain & Bunkai Teleport',
      auraColor: '#a855f7',
      peakPowerLabel: '75,000,000,000 (Est. — Surpasses SSJ3 Goku)',
      spriteUrl: 'assets/renders/janemba.webp',
      forms: [
        { label: 'Super Janemba (Dimension Sword)', spriteUrl: 'assets/renders/janemba.webp', auraHex: '#ec4899', power: '75 Billion (Est.)', powerScore: 84 }
      ],
      kidBio: 'Born when the Soul Cleansing Machine exploded in Other World! Horned crimson-and-violet Super Janemba slices space with his Dimension Sword, teleports in pixel cubes, and forced Goku and Vegeta to fuse into Super Gogeta!'
    }
  ],

  // 4. Interactive Fusion Chamber Recipes! (Potara Earrings vs. Metamoran Fusion Dance)
  fusionRecipes: [
    {
      id: 'goku-vegeta-potara',
      warriorA: 'goku',
      warriorB: 'vegeta',
      method: 'potara',
      methodName: '👂 Potara Supreme Kai Earrings',
      resultName: 'Vegetto Super Saiyan Blue!',
      resultSprite: 'assets/renders/vegetto_ssjb.webp',
      auraHex: '#00e5ff',
      power: '120 Septillion+ (Est.)',
      story: 'POTARA FUSION COMPLETE! Goku and Vegeta clip the glowing Potara Earrings onto opposite ears and slam together in mid-air—creating VEGETTO BLUE with the Final Kamehameha and Spirit Sword!'
    },
    {
      id: 'goku-vegeta-dance',
      warriorA: 'goku',
      warriorB: 'vegeta',
      method: 'dance',
      methodName: '👉👈 Metamoran Fusion Dance ("Fuuu-sion... HA!")',
      resultName: 'Full-Power Gogeta Blue!',
      resultSprite: 'assets/renders/gogeta_ssjbe.webp',
      auraHex: '#38bdf8',
      power: '120 Septillion+ (Est.)',
      story: 'PERFECT SYMMETRY! Goku and Vegeta match their Ki and touch index fingers at the exact right angle—unlocking FULL-POWER GOGETA BLUE and his rainbow Stardust Breaker for 30 unstoppable minutes!'
    },
    {
      id: 'goku-vegeta-gt',
      warriorA: 'goku',
      warriorB: 'vegeta',
      spriteA: 'assets/renders/goku_ssj4.webp',
      spriteB: 'assets/renders/vegeta_ssj4.webp',
      labelA: 'SSJ4 Goku',
      labelB: 'SSJ4 Vegeta',
      method: 'gt-dance',
      methodName: '🐒 Super Saiyan 4 Fusion Dance (GT)',
      resultName: 'Super Saiyan 4 Gogeta (Crimson Hair)!',
      resultSprite: 'assets/renders/gogeta_ssj4.webp',
      auraHex: '#ef4444',
      power: '168 Quadrillion (Est.)',
      story: 'DRAGON BALL GT ULTIMATE FUSION! SSJ4 Goku and SSJ4 Vegeta fuse into fiery crimson-haired SUPER SAIYAN 4 GOGETA—strong enough to kick Omega Shenron\'s Minus Energy Ball into space!'
    },
    {
      id: 'goten-trunks-dance',
      warriorA: 'goten',
      warriorB: 'goten',
      spriteA: 'assets/renders/goten.webp',
      spriteB: 'assets/renders/kid_trunks.webp',
      labelA: 'Son Goten',
      labelB: 'Kid Trunks',
      method: 'kids-dance',
      methodName: '👻 Kids\' Fusion Dance (Goten + Kid Trunks)',
      resultName: 'Super Saiyan 3 Gotenks!',
      resultSprite: 'assets/renders/gotenks_ssj3.webp',
      auraHex: '#facc15',
      power: '45.6 Billion (Est.)',
      story: 'TA-DA!! 7-year-old Son Goten and 8-year-old Kid Trunks nail the symmetrical Fusion Dance and leap straight past SSJ2 into waist-length golden-maned SUPER SAIYAN 3 GOTENKS!'
    },
    {
      id: 'piccolo-kami-namek',
      warriorA: 'piccolo',
      warriorB: 'piccolo',
      spriteA: 'assets/renders/piccolo_base.webp',
      spriteB: 'assets/renders/shenron.webp',
      method: 'namekian',
      methodName: '🟢 Namekian Assimilation + Shenron Gift',
      resultName: 'Giant Orange Piccolo!',
      resultSprite: 'assets/renders/piccolo_orange.webp',
      auraHex: '#f97316',
      power: '45 Septillion (Est.)',
      story: 'NAMEKIAN AWAKENING! Having reunited with Nail and Kami, Piccolo receives Eternal Shenron\'s bonus Dragon Clan blessing to become GIANT ORANGE PICCOLO!'
    }
  ],

  // 5. Expanded Kids' Saiyan Academy Quiz (13 Questions — Collect 7 Dragon Balls to Summon Shenron!)
  quizQuestions: [
    {
      question: 'What color does Goku\'s hair turn when he first becomes a Super Saiyan on Planet Namek?',
      options: ['Golden Yellow (with Emerald-Teal Eyes)', 'Electric Cyan-Blue', 'Neon Lime-Green', 'Rose Pink'],
      correctIndex: 0,
      explanation: 'Super Saiyan 1 turns a Saiyan\'s hair glowing Golden-Yellow and multiplies base power by 50x (reaching an official 150,000,000 on Namek)!'
    },
    {
      question: 'What is the difference between VEGETTO (Vegito) and GOGETA?',
      options: [
        'Vegetto uses Potara Earrings; Gogeta uses the Fusion Dance!',
        'They are the exact same transformation',
        'Vegetto is Piccolo + Krillin',
        'Gogeta is Freezer + Cell'
      ],
      correctIndex: 0,
      explanation: 'Vegetto uses the Supreme Kai\'s Potara Earrings, while Gogeta is born from the symmetrical Metamoran Fusion Dance!'
    },
    {
      question: 'How do you spot Super Saiyan 3 right away?',
      options: [
        'Waist-length golden lion\'s mane hair and NO eyebrows!',
        'Purple polka-dot cape',
        'Tiny ant size',
        'Green skin and antennae'
      ],
      correctIndex: 0,
      explanation: 'Super Saiyan 3 multiplies power by 400x, grows a giant golden mane to the waist, and makes eyebrows vanish!'
    },
    {
      question: 'Which Dragon Ball series first introduced black-haired, crimson-furred Super Saiyan 4?',
      options: ['Dragon Ball GT (and later reimagined in Daima!)', 'Dragon Ball Episode 1', 'Dr. Slump', 'Jaco the Galactic Patrolman'],
      correctIndex: 0,
      explanation: 'Dragon Ball GT first debuted primal Super Saiyan 4 after Goku calmed his Golden Great Ape form, and Akira Toriyama later brought SSJ4 into Dragon Ball Daima!'
    },
    {
      question: 'What does Goku\'s FLAME-RED hair in "Battle of Gods" mean?',
      options: [
        'Super Saiyan God — unlocked by the ritual of 6 righteous Saiyans!',
        'He ate spicy ramen',
        'Super Saiyan 1',
        'Great Ape form'
      ],
      correctIndex: 0,
      explanation: 'Super Saiyan God gives Goku flame-magenta hair in his calm Base hairstyle and unlocks divine God Ki!'
    },
    {
      question: 'What does SILVER-WHITE hair mean when Goku fights Jiren in Dragon Ball Super?',
      options: [
        'Autonomous Ultra Instinct — his body dodges and strikes automatically without thinking!',
        'He grew 100 years older',
        'Kaio-ken x2',
        'Solar Flare'
      ],
      correctIndex: 0,
      explanation: 'Silver hair is Mastered Autonomous Ultra Instinct, the celestial technique of Angels like Whis!'
    },
    {
      question: 'Which Saiyan was the VERY FIRST in history to unlock Super Saiyan 2 (against Perfect Cell)?',
      options: ['11-year-old Teen Gohan!', 'Raditz', 'Nappa', 'Captain Ginyu'],
      correctIndex: 0,
      explanation: 'Gohan unlocked Super Saiyan 2 (with crackling blue lightning!) at the Cell Games!'
    },
    {
      question: 'Why is Goku Black\'s Super Saiyan hair ROSE-PINK instead of Cyan-Blue?',
      options: [
        'Because Zamasu was already born a true God (Supreme Kai) inside Goku\'s Saiyan body!',
        'He used pink hair dye',
        'He fused with Majin Buu',
        'He ate a Senzu Bean'
      ],
      correctIndex: 0,
      explanation: 'When an actual deity transforms a Saiyan body into Super Saiyan, God Ki shines Rose-Pink (Super Saiyan Rosé)!'
    },
    {
      question: 'What new forms did Gohan and Piccolo unlock in "Dragon Ball Super: Super Hero"?',
      options: [
        'Gohan Beast (Silver Mane) & Giant Orange Piccolo!',
        'Blue Gohan & Purple Piccolo',
        'Golden Gohan & Tiny Piccolo',
        'Robot Gohan & Cyborg Piccolo'
      ],
      correctIndex: 0,
      explanation: 'Shenron gifted Piccolo his giant Orange form, and Gohan awakened Gohan Beast!'
    },
    {
      question: 'Who invented the Dragon Radar AND the Time Machine?',
      options: ['Bulma Briefs!', 'Master Roshi', 'Emperor Freezer', 'Lord Beerus'],
      correctIndex: 0,
      explanation: 'Bulma\'s genius Capsule Corp inventions started the entire Dragon Ball adventure in Episode 1!'
    },
    {
      question: 'What color hair does Vegeta\'s "Ultra Ego" transformation have?',
      options: [
        'Deep Royal Purple (God of Destruction energy, with no eyebrows!)',
        'Neon Lime-Green',
        'Bright Orange',
        'Snow White'
      ],
      correctIndex: 0,
      explanation: 'Trained by Lord Beerus, Vegeta\'s Ultra Ego turns his hair deep purple and fuels his power with pure battle spirit!'
    },
    {
      question: 'Who won the 80-fighter Tournament of Power in Dragon Ball Super and wished all erased universes back?',
      options: ['Android 17!', 'Captain Ginyu', 'Raditz', 'Super Janemba'],
      correctIndex: 0,
      explanation: 'Android 17 was the last fighter standing after Goku and Freezer knocked Jiren out together!'
    },
    {
      question: 'In Akira Toriyama\'s "Dragon Ball Daima", what happens to Goku and his friends before they explore the Demon Realm?',
      options: [
        'King Gomah wishes on Shenron to turn them into Mini kid-sized heroes!',
        'They swap bodies with Captain Ginyu\'s frog',
        'They freeze inside icebergs on Planet Vampa',
        'They forget how to use the Kamehameha'
      ],
      correctIndex: 0,
      explanation: 'Set right after the Majin Buu Saga, Dragon Ball Daima shrinks Goku and his friends into Mini kids—so Goku brings back his classic red Power Pole to journey through the Demon Realm!'
    }
  ]
};
