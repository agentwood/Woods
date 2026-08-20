import { buildWorld, challenge, fill, identify, match, mcq, order, scenario, tf } from "../factory";

export const aiVideoSkill = buildWorld({
  id: "ai-video",
  name: "AI Video",
  fantasy: "THE AI DIRECTOR",
  tagline: "Turn a sentence into a shot. Then into a film.",
  description: "Prompt craft, camera, motion, consistency, story, sound, edit, and a 45-second advert.",
  category: "AI Worlds",
  difficulty: "beginner",
  hours: 12,
  icon: "clapperboard",
  trial: {
    key: "trial",
    title: "Turn this brief into a shot",
    summary: "A vague idea is not a prompt. Two minutes. Write the picture.",
    minutes: 4,
    concept: { key: "trial", name: "Prompt instincts", axis: "execution" },
    teach: {
      title: "The five parts",
      body: "Subject, action, environment, style, camera. Miss one and the model invents junk.",
      bullets: ["Nouns first", "A verb the body can do", "A place you could stand", "A lens, not a mood board of adjectives"],
    },
    example: {
      title: "Cool vs shot",
      body: "“Make it cool” dies. “A red commuter train at dusk, rain-slick platform, tracking shot at hip height, anamorphic, wet neon” lives.",
      callout: "Specific beats prestige words.",
    },
    questions: [
      mcq(
        "Brief: “make it cool.” Best rewrite?",
        [
          "cool video, 4k, trending",
          "A red commuter train at dusk, rain-slick platform, tracking shot at hip height, anamorphic, wet neon reflections",
          "video please",
          "epic cinematic masterpiece ultra",
        ],
        1,
        "Specific beats adjectives.",
        "medium",
      ),
      fill("The thing the camera looks at is the ___.", "subject", "Start with a noun."),
      tf("“Cinematic, 8k, masterpiece” is a complete brief.", false, "Empty prestige words."),
      scenario(
        "Client said “make our lantern feel expensive.” Which prompt direction wins?",
        "You have one still of a brass pocket lantern on wet stone.",
        ["epic viral trending", "Macro of brass seams, slow push-in, shallow depth, rain ticks on metal, locked table", "random city b-roll", "shake until blur"],
        1,
        "Sell the object with camera and material.",
      ),
    ],
  },
  levels: [
    {
      key: "shot",
      title: "First Shot",
      subtitle: "Prompt structure",
      missions: [
        {
          key: "prompt",
          title: "Write the shot, not a vibe",
          summary: "Subject · action · world · style · lens",
          concept: { key: "prompt", name: "Prompt structure", axis: "execution" },
          teach: {
            title: "Five slots",
            body: "Who. Does what. Where. In what style. Seen by which camera.",
            bullets: ["Empty adjectives are noise", "One subject wins", "Camera last, after the picture exists"],
          },
          example: {
            title: "Filled slots",
            body: "Subject: courier. Action: sprints. Place: night market. Style: wet neon, anamorphic. Camera: hip-height tracking.",
            callout: "If you cannot storyboard it, the model cannot either.",
          },
          questions: [
            order("Build a prompt.", ["Subject", "Action", "Environment", "Style", "Camera"], "Nouns first, lens last."),
            fill("The thing the camera looks at is the ___.", "subject", "Subject."),
            tf("“Cinematic, 8k, masterpiece” is a complete brief.", false, "Empty prestige words."),
            mcq("Two heroes, three cities, four styles in one prompt. Result?", ["A clean poster", "A melted average", "Perfect continuity", "Free audio"], 1, "One picture."),
          ],
        },
        {
          key: "action-verb",
          title: "A verb the body can do",
          summary: "Walk, turn, lift — not “be iconic.”",
          concept: { key: "action-verb", name: "Action verbs", axis: "execution" },
          teach: {
            title: "Physical beats",
            body: "Models animate bodies. “Behold destiny” is not a body. “Picks up the lantern, thumb on the switch” is.",
          },
          example: {
            title: "Lantern click",
            body: "Thumb presses. Cone of light blooms. That is a shot. “Feel hope” is a poster slogan.",
            callout: "If a mime could perform it, keep it.",
          },
          questions: [
            mcq("Best action for a product hero?", ["embody synergy", "places the lantern on wet stone and clicks it on", "go viral", "exist beautifully"], 1, "Hands do jobs."),
            identify(
              "Which line is unfilmable?",
              "A woman on a ridge at dusk, she becomes the concept of freedom, 8k, cinematic.",
              ["“becomes the concept of freedom”", "ridge at dusk", "a woman", "dusk light"],
              0,
              "Abstract nouns do not move.",
            ),
            tf("“Walks toward camera” is weaker than “is legendary.”", false, "Walks is a verb."),
          ],
        },
        {
          key: "negatives",
          title: "Ban the junk",
          summary: "Negatives are a fence, not a novel.",
          concept: { key: "negatives", name: "Negative prompts", axis: "knowledge" },
          teach: {
            title: "Short bans",
            body: "Watermark, extra limbs, text, jitter. A 200-word negative is a second confused brief.",
          },
          questions: [
            match("Use.", [
              { left: "Positive", right: "What should exist" },
              { left: "Negative", right: "What to subtract" },
              { left: "Camera", right: "How we see it" },
              { left: "Reference", right: "What must match" },
            ], "Four jobs."),
            mcq("Watermarks keep appearing. First?", ["Buy a new GPU", "Negative: watermark, text, logo — plus a clean source style", "Add “masterpiece” twelve times", "Lower the resolution to 8px"], 1, "Ban the artefact."),
            fill("Words that subtract artefacts sit in the ___ prompt.", "negative", "The ban list."),
          ],
        },
        {
          key: "shot-v1",
          title: "Mini-project: One usable shot",
          summary: "Five slots filled. One still that could start a scene.",
          kind: "project",
          minutes: 12,
          concept: { key: "shot-v1", name: "First shot", axis: "execution" },
          teach: {
            title: "v0.1 is a frame",
            body: "If a DP could light it, you shipped. If only a mood board could love it, rewrite.",
          },
          questions: [
            challenge(
              "One usable shot",
              "Brief: night market courier, 3 seconds of motion later. First you need frame 0.",
              [
                { question: "Subject?", options: ["the vibe of youth", "a courier in a scuffed green jacket", "trending audio", "the brand hex code"], answer: 1, explanation: "A person." },
                { question: "Camera?", options: ["epic 8k masterpiece", "hip-height tracking, 35mm, wet reflections", "random shake", "top-down spreadsheet"], answer: 1, explanation: "A lens." },
                { question: "Done when?", options: ["The prompt is 400 words", "You could storyboard the frame", "The client said cool", "You used every style LoRA"], answer: 1, explanation: "Drawable." },
              ],
              "Five slots. One picture.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "cam",
      title: "Camera",
      subtitle: "Wide, close-up, tracking, dolly, aerial",
      missions: [
        {
          key: "cam-lang",
          title: "Distance is feeling",
          summary: "Camera is a verb.",
          concept: { key: "cam-lang", name: "Camera language", axis: "knowledge" },
          teach: {
            title: "Pick the emotion",
            body: "Wide = place. Close-up = thought. Tracking = pursuit. Aerial = scale. Dolly in = reveal.",
          },
          example: {
            title: "The secret",
            body: "A lie lives on a face. Wide aerial cannot hold a lie. Close-up can.",
            callout: "If the emotion is private, get closer.",
          },
          questions: [
            match("Intent → camera", [
              { left: "Establish the city", right: "Wide / aerial" },
              { left: "A secret on a face", right: "Close-up" },
              { left: "Follow a runner", right: "Tracking" },
              { left: "Reveal a room", right: "Dolly in" },
            ], "Name the move."),
            mcq("Product hero on a table. Worst camera?", ["Slow push-in, 50mm", "Handheld earthquake 4mm fisheye", "Locked-off beauty", "Gentle orbit"], 1, "The product should feel expensive, not sick."),
            tf("Every shot should be an aerial drone for prestige.", false, "Scale is one emotion, not all of them."),
            fill("A shot that follows alongside a moving subject is a ___ shot.", "tracking", "Pursuit.", ["track", "follow"]),
          ],
        },
        {
          key: "lens",
          title: "Focal length is a personality",
          summary: "24mm vs 85mm is a choice.",
          concept: { key: "lens", name: "Lenses", axis: "execution" },
          teach: {
            title: "Wide exaggerates, long compresses",
            body: "Wide close to a face is comedy or horror. Long lens on a product is jewellery. Do not default to fisheye for “cinematic.”",
          },
          example: {
            title: "Lantern beauty",
            body: "85mm, shallow depth, brass bokeh. Not 8mm from the floor.",
            callout: "Jewellery, not skate video — unless it is a skate video.",
          },
          questions: [
            mcq("Luxury watch on velvet. Best default?", ["8mm fisheye from the carpet", "85mm, shallow depth, slow slide", "helmet cam run", "security CCTV"], 1, "Compress and flatter."),
            identify(
              "Why does the hero look like a cartoon?",
              "Prompt: extreme wide 10mm, camera 10cm from the nose, product launch, luxury.",
              ["Too wide and too close for luxury", "Need more 8k", "Need a drone", "Need a watermark"],
              0,
              "Lens fights the brief.",
            ),
            tf("Fisheye is the professional default for every brand film.", false, "It is a flavour, not a law."),
          ],
        },
        {
          key: "move-cam",
          title: "One camera move",
          summary: "Hold, push, orbit, track — pick one.",
          concept: { key: "move-cam", name: "Camera motion", axis: "execution" },
          teach: {
            title: "Do not stir the soup",
            body: "Subject walk + camera earthquake + background morph is three films. Hold the camera if the subject already moves.",
          },
          questions: [
            order("A product push-in.", ["Lock the set", "Choose a single axis (push)", "Keep lights still", "End on a hold"], "One axis."),
            scenario(
              "The still is perfect. The video is nauseous.",
              "Prompt asked for handheld, orbit, zoom crash, and subject spin.",
              ["One gentle orbit or a locked push — not all four", "Add more adjectives", "Raise CFG in the prompt", "Add a second hero"],
              0,
              "One move.",
            ),
            mcq("A still portrait that must feel alive?", ["No motion ever", "Tiny breathing + dust, locked camera", "Spin 1080°", "Zoom crash"], 1, "Micro-motion."),
          ],
        },
        {
          key: "boss-lens",
          title: "Boss: The Sick Camera",
          summary: "Client vomited. You have twenty minutes to recut the brief.",
          kind: "boss",
          minutes: 14,
          concept: { key: "boss-lens", name: "Camera emergency", axis: "problem" },
          teach: {
            title: "Four faults",
            body: "Wrong distance, wrong length, too many moves, no hold. Fix in that order.",
          },
          questions: [
            challenge(
              "THE SICK CAMERA",
              "Luxury lantern. Current prompt: 8mm fisheye, earthquake handheld, aerial and close-up in one sentence, no end hold.",
              [
                { question: "Distance?", options: ["Stay in the pores with 8mm", "Beauty distance — tabletop, not nostril", "Only aerials", "CCTV"], answer: 1, explanation: "Jewellery space." },
                { question: "Lens?", options: ["Keep fisheye", "Longer lens, shallow depth", "Security cam", "Helmet"], answer: 1, explanation: "Flatter the metal." },
                { question: "Move?", options: ["Keep four moves", "One slow push or orbit", "Spin until blur", "Crash zoom loop"], answer: 1, explanation: "One axis." },
                { question: "End?", options: ["Cut mid-shake", "A clean hold on the product", "Credits of 40 names", "A meme"], answer: 1, explanation: "A button." },
              ],
              "Distance, length, one move, hold.",
              "hard",
              250,
            ),
          ],
        },
      ],
    },
    {
      key: "motion",
      title: "Motion",
      subtitle: "Subject, world, camera",
      missions: [
        {
          key: "hero-motion",
          title: "One dominant move",
          summary: "Don't move everything.",
          concept: { key: "hero-motion", name: "Motion design", axis: "execution" },
          teach: {
            title: "Pick a hero",
            body: "Subject walks. Rain falls. Camera holds. Three motions fight. The eye needs a boss.",
          },
          questions: [
            tf("Best shot: subject, camera, and background all thrash independently.", false, "Pick a hero motion."),
            mcq("A still portrait that feels alive?", ["No motion", "Tiny breathing + dust motes, locked camera", "Spin 1080°", "Zoom crash"], 1, "Micro-motion."),
            fill("The motion the eye should follow first is the ___ motion.", "hero", "One boss.", ["dominant", "primary"]),
            match("Layer.", [
              { left: "Subject walk", right: "Primary" },
              { left: "Rain", right: "Secondary atmosphere" },
              { left: "Locked camera", right: "Stable frame" },
              { left: "Morphing architecture", right: "Usually a fight" },
            ], "Rank the moves."),
          ],
        },
        {
          key: "physics-lie",
          title: "Weight is a tell",
          summary: "Fast float is a cartoon. Heavy is slow to start.",
          concept: { key: "physics-lie", name: "Weight", axis: "problem" },
          teach: {
            title: "Inertia",
            body: "A brass lantern should not zip like a cursor. Ease in. Settle. If it orbits like a drone, the material was a lie.",
          },
          questions: [
            scenario(
              "Client: “the lantern looks cheap.” Motion is a 2-second 360 spin with no ease.",
              "Brass, night, rain.",
              ["Slow ease-in orbit, settle on a hold", "Faster spin", "Add “luxury” twelve times", "Shake"],
              0,
              "Weight is timing.",
            ),
            mcq("A running courier that slides without gait?", ["Fine", "Broken locomotion — specify footsteps or a locked track", "More 8k", "Add a drone"], 1, "Gait is the verb."),
            tf("Easing is only for UI designers.", false, "Bodies ease too."),
          ],
        },
        {
          key: "i2v",
          title: "Wake the still",
          summary: "The still is frame 0. Do not rewrite the set.",
          concept: { key: "i2v", name: "Image to video", axis: "execution" },
          teach: {
            title: "Describe what moves",
            body: "Camera + subject motion from one frame. If you rename the city, identity dies.",
          },
          questions: [
            mcq("Starting from a product photo. Best motion?", ["Replace the product", "Slow orbit, lights hold", "Morph into a dragon", "Shake until blur"], 1, "Honour the still."),
            identify(
              "What killed continuity?",
              "Frame 0: green coat, night market. Motion prompt: “now she is in a desert at noon in a red dress.”",
              ["The motion prompt rewrote wardrobe and place", "Need more steps", "Need 8k", "Need a watermark"],
              0,
              "I2V is not a teleport.",
            ),
            order("Image to video.", ["Lock the still", "Name one motion", "Keep wardrobe and set", "Generate a short clip", "Check identity"], "Honour frame 0."),
          ],
        },
      ],
    },
    {
      key: "consist",
      title: "Consistency",
      subtitle: "The same person, three shots",
      missions: [
        {
          key: "char",
          title: "Keep the character",
          summary: "References beat adjectives.",
          concept: { key: "char", name: "Character lock", axis: "execution" },
          teach: {
            title: "Lock identity",
            body: "Seed, character reference, wardrobe notes, recurring location stills. “Same lady” is a wish.",
          },
          questions: [
            scenario(
              "Shot 1: a woman in a green coat. Shot 2: different face, red jacket. Fix?",
              "You have a still from shot 1.",
              ["Prompt “same lady” only", "Feed the still as a character/style reference and lock wardrobe", "Change genre", "Add more adjectives"],
              1,
              "Pixels beat pronouns.",
            ),
            fill("A still used to keep a person looking the same is a character ___.", "reference", "Reference.", ["ref"]),
            tf("A new face each shot is “variety.”", false, "It is a different film."),
            mcq("Wardrobe note that actually helps?", ["fashionable", "scuffed green jacket, brass buttons, same as still 01", "cool outfit", "trending"], 1, "Inventory the clothes."),
          ],
        },
        {
          key: "set-lock",
          title: "The same street twice",
          summary: "Place is a character too.",
          concept: { key: "set-lock", name: "Set continuity", axis: "execution" },
          teach: {
            title: "Lock the alley",
            body: "A location still, a list of props, time of day. If shot 2 is a different city, the story snapped.",
          },
          questions: [
            match("Lock.", [
              { left: "Face / body", right: "Character ref" },
              { left: "Coat colour", right: "Wardrobe note" },
              { left: "Alley neon", right: "Location still" },
              { left: "Time of day", right: "Lighting continuity" },
            ], "Four locks."),
            mcq("Night market becomes a beach at noon. Cause?", ["Need more 8k", "Place was not locked in prompt or ref", "Audio", "Codec"], 1, "Set drift."),
            identify(
              "Missing lock?",
              "Character ref: yes. Wardrobe: green coat. Prompt shot 2: “another city, golden hour.”",
              ["Location / time of day drifted", "Need a drone", "Need a watermark", "Need fisheye"],
              0,
              "Place is a character.",
            ),
          ],
        },
        {
          key: "seed-family",
          title: "A family of frames",
          summary: "Seeds are save files, not lottery tickets.",
          concept: { key: "seed-family", name: "Seeds", axis: "knowledge" },
          teach: {
            title: "Write them down",
            body: "Same seed family + same refs ≈ same world. Randomising every shot is a slot machine.",
          },
          questions: [
            tf("You can reproduce a look without noting seed, model, or refs.", false, "Write them down."),
            fill("The number that picks a noise pattern is the ___.", "seed", "Save file."),
            mcq("Three shots, three random seeds, no refs. Likely?", ["A series", "Three strangers", "Perfect match", "Free audio"], 1, "Lock the family."),
          ],
        },
      ],
    },
    {
      key: "story",
      title: "Story",
      subtitle: "Shots, beats, continuity",
      missions: [
        {
          key: "beats",
          title: "Five shots, one sentence",
          summary: "Establish, act, react, consequence, button.",
          concept: { key: "beats", name: "Sequence grammar", axis: "problem" },
          teach: {
            title: "Wide, medium, close, turn, hold",
            body: "A beginning that earns an ending. If every shot is a close-up, nobody knows where they are.",
          },
          questions: [
            order("Five shots.", ["Establish the place", "Introduce the subject", "The action", "The reaction", "The button / end frame"], "Grammar of a scene."),
            mcq("Worst opening for a night-hike advert?", ["Dark trail, a click of light", "A paragraph of legal text", "Lantern cone on wet stone", "A face lit by brass"], 1, "See the job."),
            tf("A sequence should start on the logo for 20 seconds.", false, "Earn the brand."),
          ],
        },
        {
          key: "cont-edit",
          title: "Eyeline and geography",
          summary: "Don't teleport the hero.",
          concept: { key: "cont-edit", name: "Screen geography", axis: "problem" },
          teach: {
            title: "Left stays left",
            body: "If they run screen-right in shot 1, do not enter screen-left in shot 2 without a turn. The brain keeps a map.",
          },
          questions: [
            scenario(
              "Shot 1: courier runs right. Shot 2: they enter from the right running left, no turn.",
              "Viewers feel a skip.",
              ["Keep direction or show the turn", "Add more adjectives", "Raise resolution", "Add a drone"],
              0,
              "Geography.",
            ),
            match("Beat job.", [
              { left: "Wide", right: "Where" },
              { left: "Medium", right: "Who does" },
              { left: "Close", right: "What they feel" },
              { left: "Hold", right: "The ask / product" },
            ], "Jobs."),
            fill("The last beat that lets the brand sit is the ___.", "button", "End card energy.", ["hold", "end card"]),
          ],
        },
        {
          key: "seq-project",
          title: "Mini-project: Five-shot sequence",
          summary: "A beginning that earns an ending.",
          kind: "project",
          minutes: 12,
          concept: { key: "seq-project", name: "Five-shot", axis: "problem" },
          teach: {
            title: "Board it",
            body: "If you cannot number 1–5 on paper, do not generate 40 clips hoping a story appears.",
          },
          questions: [
            challenge(
              "Five-shot sequence",
              "Night market courier. Must end on the lantern product.",
              [
                { question: "Shot 1?", options: ["Logo for 15s", "Establish the wet street", "Random meme", "Credits"], answer: 1, explanation: "Place." },
                { question: "Shot 3?", options: ["Another establish", "The action — click / light", "Legal scroll", "A second city"], answer: 1, explanation: "The verb." },
                { question: "Shot 5?", options: ["New face", "Hold on product + short line", "Earthquake cam", "Forty URLs"], answer: 1, explanation: "Button." },
              ],
              "Place, person, verb, feel, ask.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "sound",
      title: "Sound",
      subtitle: "Voice, music, effects",
      missions: [
        {
          key: "layers",
          title: "The picture is half",
          summary: "Diegetic vs score.",
          concept: { key: "layers", name: "Sound layers", axis: "knowledge" },
          teach: {
            title: "Don't drown the voice",
            body: "Dialogue sits above beds. FX punctuate. Music carries emotion, not lyrics fighting the VO.",
          },
          questions: [
            match("Layer.", [
              { left: "Voice-over", right: "Foreground information" },
              { left: "Footsteps / rain", right: "Diegetic FX" },
              { left: "Score", right: "Emotion bed" },
              { left: "Silence", right: "A cut that lands" },
            ], "Mix is directing."),
            tf("Loud music under every line makes it more cinematic.", false, "It makes it unreadable."),
            fill("Sound that exists in the world of the picture is ___.", "diegetic", "Rain, footsteps, the click."),
            mcq("Lantern click should be…", ["silent", "a diegetic tick that sells the mechanism", "a full orchestra stab only", "a copyrighted pop chorus"], 1, "The product makes a sound."),
          ],
        },
        {
          key: "vo",
          title: "One voice, one job",
          summary: "VO is information, not poetry slam.",
          concept: { key: "vo", name: "Voice-over", axis: "execution" },
          teach: {
            title: "Fewer words",
            body: "If the picture shows the click, do not narrate the click. Say the benefit. Leave air.",
          },
          questions: [
            mcq("Picture: thumb clicks lantern. Worst VO?", ["“Light when you need it.”", "“The subject uses their digit to activate illumination via a brass switch assembly…”", "Silence + click FX", "A four-word line later"], 1, "Don't narrate the obvious."),
            scenario(
              "VO fights a lyric-heavy track. Testers miss the price.",
              "Social ad, 15s.",
              ["Drop lyrics or duck the bed under the line", "Raise both", "Remove the product", "Add a second VO"],
              0,
              "Duck or drop."),
            tf("Silence is a wasted second.", false, "Silence is a cut."),
          ],
        },
        {
          key: "mix",
          title: "A mix you can ship",
          summary: "Peaks, ducks, a floor.",
          concept: { key: "mix", name: "Mix", axis: "execution" },
          teach: {
            title: "Voice wins",
            body: "If VO clips, you failed. If rain is louder than the ask, you failed. Phones are thin speakers.",
          },
          questions: [
            order("Mix pass.", ["Set VO level", "Add FX at punctuation", "Bed underneath", "Duck bed under VO", "Check on a phone"], "Voice first."),
            identify(
              "Why is the ask unreadable?",
              "VO at −18 LUFS, bed at −8, rain loop at 0 dB peak, no duck.",
              ["Bed and rain bury the voice", "Need more 8k", "Need fisheye", "Need a new city"],
              0,
              "Duck the world."),
            mcq("Phone speaker test exists because…", ["It is trendy", "Most people will not hear your studio monitors", "Apple requires it", "It adds bass"], 1, "Ship for the device."),
          ],
        },
      ],
    },
    {
      key: "edit",
      title: "Edit",
      subtitle: "Pace, cuts, order",
      missions: [
        {
          key: "pace",
          title: "Order is meaning",
          summary: "The cut is a sentence.",
          concept: { key: "pace", name: "Editing", axis: "problem" },
          teach: {
            title: "Enter late, leave early",
            body: "Cut on motion. Don't linger on a generated artefact. A 45s ad that feels like 2 minutes is untrimmed heads and tails.",
          },
          questions: [
            mcq("A 45s advert feels slow. First edit?", ["Add 20 logos", "Trim heads/tails, cut on action", "Lower the bitrate", "Add more prompt adjectives"], 1, "Pace."),
            tf("Every generated take should play in full as respect to the model.", false, "You are the editor."),
            fill("Leaving a shot after the useful motion is cutting the ___.", "tail", "Leave early.", ["tails"]),
            order("Tighten a clip.", ["Mark the action", "Cut in late", "Cut out early", "Check the join on motion"], "Late in, early out."),
          ],
        },
        {
          key: "artefacts",
          title: "Don't linger on the glitch",
          summary: "Hands, faces, morphs — cut away.",
          concept: { key: "artefacts", name: "Glitch cuts", axis: "execution" },
          teach: {
            title: "The join hides sins",
            body: "If a hand melts at frame 40, you do not owe the model frames 40–90. Cut on a blink or a whip.",
          },
          questions: [
            scenario(
              "Beautiful shot. At 2.1s extra fingers bloom.",
              "You have a second take with a clean hold.",
              ["Cut before the melt or switch takes", "Leave it for authenticity", "Zoom into the fingers", "Add a watermark"],
              0,
              "Edit is quality control.",
            ),
            mcq("Best hide for a morph?", ["A hard cut on a camera whip or a dark frame", "A 10-second linger", "A legal scroll", "A second city"], 0, "Motion masks."),
            tf("Upscaling always fixes melted hands.", false, "It can sharpen the melt."),
          ],
        },
        {
          key: "ad-form",
          title: "Make it sell",
          summary: "Hook, product, proof, ask.",
          concept: { key: "ad-form", name: "Commercial form", axis: "execution" },
          teach: {
            title: "Three beats",
            body: "Hook in 2s. Product in context. One ask. Social does not owe you a slow establish if the hook is the product doing its job.",
          },
          questions: [
            order("A social clip.", ["Hook visual", "Product in use", "Proof (texture/detail)", "Logo + ask"], "Don't bury the product."),
            mcq("Worst hook?", ["Dark trail, a click, a cone of light", "A paragraph of legal text", "Brass on wet stone", "A face lit by the lantern"], 1, "See the job."),
            identify(
              "Why did nobody remember the product?",
              "15s: three cities, two faces, logo at 14.8s for 3 frames.",
              ["Brand and object never held", "Need more 8k", "Need lyrics", "Need fisheye"],
              0,
              "Hold the ask.",
            ),
          ],
        },
      ],
    },
    {
      key: "final",
      title: "Final Boss: The Film Festival",
      subtitle: "45 seconds. A fictional product.",
      isBoss: true,
      missions: [
        {
          key: "final",
          title: "THE FILM FESTIVAL",
          summary: "Full sequence. Brief to picture. Consistency, camera, story, sound, edit.",
          kind: "boss",
          minutes: 18,
          concept: { key: "final", name: "Cinematic advert", axis: "problem" },
          teach: {
            title: "The brief",
            body: "Create a 45-second cinematic advert. You are scored on hook, identity, mix, and a single ask — not on adjective count.",
          },
          questions: [
            challenge(
              "45-SECOND ADVERT",
              "Product: a pocket lantern that never dies. Mood: night hiking.",
              [
                { question: "Hook shot?", options: ["A paragraph of legal text", "Dark trail, a click, a clean white cone of light", "A spreadsheet", "Random city b-roll"], answer: 1, explanation: "See the job of the product." },
                { question: "Consistency?", options: ["New face each shot", "One character ref + the same lantern prop", "Change colour every cut", "No night"], answer: 1, explanation: "Same hero, same object." },
                { question: "Sound?", options: ["Lyric pop fighting VO", "Click FX, thin score, VO ducked over the bed, phone check", "Silence plus a legal read", "Ten URLs spoken"], answer: 1, explanation: "Voice and the click win." },
                { question: "End card?", options: ["Ten URLs", "Logo, 4-word line, quiet hold", "A meme dump", "Credits of 40 names"], answer: 1, explanation: "One ask." },
              ],
              "Hook, product, hold.",
              "hard",
              1000,
            ),
          ],
        },
      ],
    },
  ],
});
