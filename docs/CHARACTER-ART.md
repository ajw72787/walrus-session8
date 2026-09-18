# Character Art System

`src/data/characters.json` is the deterministic source of truth. Portraits must depict its canonical attributes; an image never changes a game fact. The derived [`character-art-manifest.ts`](../src/data/character-art-manifest.ts) supplies the 32 prompts, required traits, and canonical output paths.

## Style bible

- Original, friendly modern illustrated tabletop-game portraits: clean confident linework, softly cel-shaded planes, saturated but balanced colour, and warm even studio lighting.
- Square, eye-level three-quarter head-and-upper-torso crops. Characters look engaged but not exaggerated; use clear eyes, simple readable facial features, and a calm, varied expression range.
- Use a simple two-tone abstract background with a subtle role-adjacent motif only when it cannot be mistaken for a held item. No text, borders, names, numbers, logos, or watermarks.
- Props sit beside the lower torso, angled into frame; headwear, hair, glasses, facial hair, and the face must never be hidden. Keep contrast between key clothing/headwear and background.
- Animals use the same warm light, clear linework, and centered crop. Rusty is a friendly silver-and-blue original robot with an expressive face and antenna, not a licensed robot design. Older characters are represented with the same lively proportions and dignity, with their gray hair/beards plainly visible.
- Diversity is ordinary art direction from the canonical descriptions, never a deduction field or label. Do not add a race, ethnicity, skin-tone, ability, or personality attribute to gameplay data.
- Forbidden drift: photorealism, generic corporate vector art, anime mimicry, Guess Who/Hasbro visual language, copyrighted-character imitation, inconsistent camera angle, tiny props, busy scenes, or art that obscures canonical traits.

## Framing and safe area

Generate at least **1024 × 1024 PNG** (validator permits 512 × 512 minimum). Preserve a 10% margin on every edge: face and headwear within the central 80%; eyes in the upper-middle third; defining prop entirely inside the lower central 70%. Cards use `object-contain`, so no canonical trait is intentionally cropped on desktop, tablet landscape/portrait, or phone. At small iPad-card sizes, the face, eyewear, headwear, hair silhouette, clothing colour, and one defining prop must still read at a glance.

## Readability matrix

| Character | Must clearly read in portrait |
| --- | --- |
| 01 Ava | long brown hair, pink streetwear, skateboard |
| 02 Ben | short brown hair, black glasses, blue clothing, backpack |
| 03 Cora | long red hair, golden crown, purple royal clothing |
| 04 Dax | blue hockey helmet and blue/white goalie gear |
| 05 Ellie | curly black hair, black glasses, white lab coat |
| 06 Finn | blond hair, blue cap, orange shirt, surfboard |
| 07 Gia | white chef hat/jacket, long brown hair, wooden spoon |
| 08 Hank | brown cowboy hat/shirt, red bandana |
| 09 Isla | long black hair, large headphones, purple clothing |
| 10 Jace | blue football helmet/uniform, football |
| 11 Kai | short brown hair, green explorer jacket, folded map |
| 12 Luna | brown hair visible in white space helmet, astronaut suit |
| 13 Milo | silver goggles, yellow clothing, wrench |
| 14 Nina | brown glasses, tan sun hat/outfit, camera |
| 15 Omar | black glasses, white doctor coat, stethoscope |
| 16 Piper | red hair, black pirate hat, eye patch, black/red coat |
| 17 Quinn | short green hair, black/purple clothing, controller |
| 18 Riley | long blond hair, blue soccer uniform, soccer ball |
| 19 Sam | red fire helmet and firefighter clothing |
| 20 Tessa | black glasses, purple wizard hat/robe, wand |
| 21 Ulric | long gray hair/beard, tan explorer hat, green jacket, binoculars |
| 22 Vera | black glasses, red beret/smock, paintbrush |
| 23 Wes | brown mustache, white baker cap/uniform, cupcake |
| 24 Xena | medium black hair, white gi, black belt |
| 25 Yara | silver snow goggles, long brown hair, teal gear |
| 26 Zane | short black hair, black/red rock outfit, guitar |
| 27 Rusty | silver/blue robot body, antenna, expressive eyes |
| 28 Bailey | golden wavy fur, blue bandana |
| 29 Bruno | brown/white short fur, wrinkled bulldog face, collar |
| 30 Maya | long black hair, silver eyewear, navy pilot cap/uniform |
| 31 Theo | short gray hair/beard, red beanie, yellow jacket, fishing rod |
| 32 Zoe | long purple hair, black cat-ear headphones, black/purple outfit |

## Collision review

| Risk group | Non-gameplay visual separation |
| --- | --- |
| Kai / Ulric explorers | Kai: upright green jacket and folded map; Ulric: broader hat silhouette, long gray beard, binoculars. |
| Isla / Quinn gamers | Isla: large over-ear headphones and purple silhouette; Quinn: bright green short hair and controller. |
| Dax / Jace / Sam helmets | Dax: padded goalie shoulder silhouette; Jace: football facemask and football; Sam: red fire helmet and turnout collar. |
| Cora / Tessa purple fantasy | Cora: crown and royal neckline; Tessa: pointed hat, glasses, wand. |
| Ellie / Omar / Nina / Vera / Maya glasses | Preserve distinct clothing/headwear/prop silhouettes: lab coat, stethoscope, camera/sun hat, beret/brush, pilot cap. |
| Gia / Wes white food uniforms | Gia: tall chef hat plus spoon; Wes: baker cap, mustache, cupcake. |
| Ulric / Theo older gray-bearded | Ulric: long hair, explorer hat, green jacket/binoculars; Theo: short hair, red beanie, yellow jacket/fishing rod. |
| Bailey / Bruno dogs | Bailey: golden wavy fur and blue bandana; Bruno: brown/white short fur, broad wrinkled muzzle, collar. |
| Riley / Dax / Jace / Xena / Yara sports | Use the canonical ball/helmet/belt/goggles and distinct color blocks; never rely on a tiny background cue. |

## Generation and review workflow

1. Start with Ava as the style calibration portrait using her manifest prompt.
2. Inspect against the required visible traits and shared style bible; reject any candidate that hides, changes, or adds a canonical trait.
3. Regenerate only the affected portrait until it is readable at card scale.
4. Save an accepted PNG exactly at its manifest path, for example `public/characters/01-ava.png`.
5. Run `npm run validate:art`; it checks path, PNG signature, square dimensions, and minimum resolution.
6. View the full board and `/dev/characters` together to review lighting, crops, silhouettes, and collisions across all 32.

Acceptance checklist for every portrait:

- [ ] Correct canonical name/number/path, with no text baked into the image.
- [ ] All required hair, eyewear, headwear, facial-hair, clothing, species, and prop traits are legible.
- [ ] Prop and headwear remain inside the safe area.
- [ ] No uncanonical visual feature could create a misleading deduction fact.
- [ ] Original style matches the approved calibration image and does not imitate protected work.
- [ ] PNG is square, at least 512 × 512, and passes `npm run validate:art`.

## Validation states

`npm run validate:art:manifest` validates the data contract and deliberately passes before images exist. `npm run validate:art` additionally requires every final PNG; it is expected to fail in this pre-production phase and must not be made green with fake artwork.

The browser uses the canonical `imagePath`. Missing or failed image loads show a labeled development placeholder rather than a broken-image icon. Final portraits are not claimed to exist until the asset validator passes.
