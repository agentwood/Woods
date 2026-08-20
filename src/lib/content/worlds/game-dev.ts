import { buildWorld, challenge, fill, identify, match, mcq, order, scenario, tf } from "../factory";

export const gameDevSkill = buildWorld({
  id: "game-dev",
  name: "Game Development",
  fantasy: "THE GAME MAKER",
  tagline: "Make something move. Then make it feel alive.",
  description: "Scenes, input, physics, enemies, systems, game feel, and a finished miniature game.",
  category: "Code Worlds",
  difficulty: "beginner",
  hours: 16,
  icon: "gamepad-2",
  trial: {
    key: "trial",
    title: "Why doesn't the jump land?",
    summary: "A 3-minute feel check. Gravity is a number. The floor is a contract.",
    minutes: 4,
    concept: { key: "trial", name: "Feel instincts", axis: "problem" },
    teach: {
      title: "The player floats",
      body: "They leave the ground. They never come back. Jump is an impulse on Y. Gravity is acceleration every frame. Collision is the handshake that says “you may stop.” Miss any one and the jump is a balloon.",
      bullets: ["Impulse starts the rise", "Gravity must run every tick", "A floor on Y is not optional"],
    },
    example: {
      title: "The float bug",
      body: "Jump sets vy = -10. Gravity is 0. Collision only runs on X. The sprite rises forever.",
      callout: "Vertical motion needs gravity and a floor. Sprites will not save you.",
    },
    questions: [
      scenario(
        "What actually broke the landing?",
        "Jump sets vy = -10. Gravity is 0. Collision only runs on the x axis. The player rises forever.",
        ["Need more sprites", "No gravity or ground collision on Y", "The camera is shy", "Audio is muted"],
        1,
        "Vertical motion needs gravity and a floor.",
        "hard",
      ),
      mcq(
        "What should you check next?",
        ["Buy a new engine", "Gravity value and floor collider on Y", "Add a title screen", "Raise the jump to -100"],
        1,
        "Fix the missing forces before you tune numbers.",
        "medium",
      ),
      tf("If gravity is applied, the player will always land even with no collider.", false, "Gravity without a floor is a pit."),
      fill("The number you add to velocity each frame to pull the player down is ___.", "gravity", "Acceleration toward the floor.", ["grav"]),
    ],
  },
  levels: [
    {
      key: "move",
      title: "Make Something Move",
      subtitle: "Scene, object, input, loop",
      missions: [
        {
          key: "loop",
          title: "The heartbeat",
          summary: "Input → update → draw. Forever.",
          concept: { key: "loop", name: "Game loop", axis: "knowledge" },
          teach: {
            title: "Every frame",
            body: "Read input. Integrate motion. Resolve hits. Draw the world. Miss a step and it feels drunk.",
            bullets: ["Think, then paint", "Never draw stale positions", "One loop, one truth"],
          },
          example: {
            title: "One tick",
            body: "Press Right. vx becomes 4. Position.x += vx. Then draw. If you draw first, the sprite lags a frame.",
            callout: "The loop is a contract, not a suggestion.",
          },
          questions: [
            order("One frame.", ["Read input", "Update positions", "Resolve collisions", "Draw"], "Think, then paint."),
            fill("The function that runs once per frame is the game ___.", "loop", "The heartbeat."),
            mcq("You skip update and only draw. Result?", ["Snappy controls", "A frozen pose with pretty lighting", "Better physics", "Free double jump"], 1, "Draw without update is a screensaver."),
            tf("You should spawn a second game loop for jumping.", false, "One loop. Jump is a state inside it."),
          ],
        },
        {
          key: "input",
          title: "Press, hold, release",
          summary: "Input is edges, not vibes.",
          concept: { key: "input", name: "Input edges", axis: "execution" },
          teach: {
            title: "Three moments",
            body: "Down starts a jump. Held runs. Up can cut the jump short. Polling “is key down” every frame without edges makes bunny hops.",
          },
          example: {
            title: "Jump buffer",
            body: "Player presses jump 4 frames early. Buffer the press. Consume it on landing. Feels fair.",
            callout: "Forgiveness is a timer, not luck.",
          },
          questions: [
            match("Input moment.", [
              { left: "Just pressed", right: "Start jump" },
              { left: "Held", right: "Keep running" },
              { left: "Just released", right: "Cut jump short" },
              { left: "Buffered press", right: "Spend on next land" },
            ], "Edges make feel."),
            mcq("Hold-to-jump using only “key is down” with no grounded check?", ["One clean hop", "Infinite fly", "A pause menu", "Better gravity"], 1, "Grounded is the gate."),
            tf("Mouse position is automatically player velocity.", false, "You map devices to verbs."),
          ],
        },
        {
          key: "scene",
          title: "A room that exists",
          summary: "Scene, object, camera. Names you can point at.",
          concept: { key: "scene", name: "Scene and objects", axis: "knowledge" },
          teach: {
            title: "The stage",
            body: "A scene owns objects. An object owns transform, sprite, and scripts. The camera is an object that looks. If everything is a global, you cannot pause one room.",
          },
          example: {
            title: "Player spawn",
            body: "Scene: Cave01. Object: Hero at (32, 64). Camera follows Hero. Flag is a separate object at (400, 64).",
            callout: "If the flag is painted into the background, you cannot win.",
          },
          questions: [
            mcq("Where does the player live?", ["Inside the PNG", "As an object in the scene", "In the audio mixer", "In the readme"], 1, "Objects are the nouns."),
            identify(
              "What is missing?",
              "Background drawn. Player sprite blitted at 0,0 every frame. No object, no camera, no spawn.",
              ["A scene object with a spawn transform", "More bloom", "A publisher", "A 4K trailer"],
              0,
              "Spawn is data, not a blit.",
            ),
            fill("The thing that follows the hero so the world can be larger than the screen is the ___.", "camera", "Camera frames the action."),
          ],
        },
        {
          key: "walk-v1",
          title: "Mini-project: Walk the room",
          summary: "Left, right, a floor, a visible character.",
          kind: "project",
          minutes: 12,
          concept: { key: "walk-v1", name: "First move", axis: "execution" },
          teach: {
            title: "v0.1 is a walk",
            body: "If they can cross the room without clipping through the floor, you shipped the first verb.",
          },
          questions: [
            challenge(
              "Walk the room",
              "One sitting. Character must start, walk, and stop at a wall.",
              [
                { question: "First wire?", options: ["A 40-enemy raid", "Input to velocity each tick", "Online multiplayer", "A lore bible"], answer: 1, explanation: "Input to motion." },
                { question: "Stop at the wall?", options: ["Hope", "Collision on X against solids", "Delete the wall", "Slow the camera"], answer: 1, explanation: "Solids are a contract." },
                { question: "Done when?", options: ["The renderer is physically based", "Start, walk, stop, no fall-through", "Steam page live", "You added fog"], answer: 1, explanation: "Complete beat huge." },
              ],
              "One verb. One room.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "physics",
      title: "Physics",
      subtitle: "Velocity, gravity, collision, acceleration",
      missions: [
        {
          key: "quantities",
          title: "Words you can code",
          summary: "Position, velocity, acceleration.",
          concept: { key: "quantities", name: "Motion quantities", axis: "knowledge" },
          teach: {
            title: "Three numbers",
            body: "Position is where. Velocity is how fast that where changes. Acceleration is how fast velocity changes. Gravity is just a constant acceleration.",
          },
          example: {
            title: "One second of fall",
            body: "vy starts 0. gravity = 20 per second. After 1s, vy is 20. Position dropped by the integral of that.",
            callout: "If you add gravity to position instead of velocity, the fall feels drunk.",
          },
          questions: [
            match("Quantity.", [
              { left: "Velocity", right: "Change in position per second" },
              { left: "Acceleration", right: "Change in velocity per second" },
              { left: "Gravity", right: "Constant downward acceleration" },
              { left: "Collision", right: "Stop overlapping solids" },
            ], "Words you can code."),
            mcq("You add gravity to x each frame. Result?", ["A clean jump", "The player slides sideways forever", "Better landing", "A pause"], 1, "Gravity belongs on Y velocity."),
            tf("Velocity is a costume change.", false, "It is a vector."),
            fill("Change in velocity per second is ___.", "acceleration", "The slope of speed."),
          ],
        },
        {
          key: "jump",
          title: "Jump, then land",
          summary: "Air is not a suggestion.",
          concept: { key: "jump", name: "Platformer jump", axis: "execution" },
          teach: {
            title: "Jump is an impulse",
            body: "On ground + press: vy = jumpSpeed. Each frame: vy += gravity. On floor: vy = 0, grounded = true. Coyote time is a few frames after leaving a ledge.",
          },
          example: {
            title: "Coyote",
            body: "Player walks off a ledge. 6 frames later they still jump. That is coyote time. It hides the lie of discrete tiles.",
            callout: "Fairness is a timer.",
          },
          questions: [
            order("A jump.", ["Confirm grounded or coyote", "Set vy to jump speed", "Apply gravity each frame", "On floor: zero vy, grounded true"], "Impulse, then gravity, then handshake."),
            mcq("They never land. Collision is on. Gravity is 0. Fix?", ["More sprites", "Give gravity a non-zero value", "Mute audio", "Raise FOV"], 1, "No gravity, no return."),
            tf("If you skip collision, gravity still looks like a game.", false, "They fall through the world."),
          ],
        },
        {
          key: "collide",
          title: "Don't walk through walls",
          summary: "Resolve X then Y, or eat a corner.",
          concept: { key: "collide", name: "Collision resolve", axis: "execution" },
          teach: {
            title: "Separate axes",
            body: "Move X, test, push out. Move Y, test, push out. Doing both at once wedges you into corners and stair-steps.",
          },
          example: {
            title: "The corner eat",
            body: "You move diagonally into a block. Combined AABB test pops you to a weird place. Split axes and the floor stays a floor.",
            callout: "Order of axes is a design choice. Split is the default.",
          },
          questions: [
            identify(
              "Why did they stick in the wall?",
              "position += velocity; then one combined overlap test; then teleport to last safe point 2 seconds ago.",
              ["Resolve per axis this frame, don't rewind history", "Need more particles", "Need a publisher", "Gravity is illegal"],
              0,
              "Resolve now, on each axis.",
            ),
            mcq("Best first collision shape for a platformer hero?", ["A perfect mesh of 400 triangles", "A simple box or capsule", "No shape, pixels only", "A sphere the size of the map"], 1, "Cheap and predictable."),
            tf("Triggers and solids should use the same “stop the player” code.", false, "Triggers fire events. Solids block."),
          ],
        },
        {
          key: "boss-float",
          title: "Boss: The Eternal Float",
          summary: "QA filed a ticket. Nobody lands. You have one sitting.",
          kind: "boss",
          minutes: 14,
          concept: { key: "boss-float", name: "Physics emergency", axis: "problem" },
          teach: {
            title: "Four faults",
            body: "Find them in order. Do not add a new jump animation until the body falls.",
          },
          questions: [
            challenge(
              "THE ETERNAL FLOAT",
              "Build: jump impulse works. Gravity constant is 0. Floor layer is “Decor”. Collision mask ignores Decor. Draw order is fine.",
              [
                { question: "First?", options: ["New particle pack", "Restore gravity to a real number", "Rewrite the renderer", "Ship anyway"], answer: 1, explanation: "No gravity, no landing." },
                { question: "They fall through. Next?", options: ["Delete tiles", "Put the floor on a solid layer the mask hits", "Raise jump", "Add bloom"], answer: 1, explanation: "Mask vs layer." },
                { question: "Still jitter on land?", options: ["Remove grounded flag", "Zero vy on contact and set grounded", "Add a second loop", "Invert gravity"], answer: 1, explanation: "Handshake." },
                { question: "Ship the fix when?", options: ["The trailer is 4K", "Jump, hang, land, walk — all in one room", "Steam featured", "You renamed the scene"], answer: 1, explanation: "Feel is the test." },
              ],
              "Forces, then masks, then the handshake.",
              "hard",
              250,
            ),
          ],
        },
      ],
    },
    {
      key: "player",
      title: "The Player",
      subtitle: "Health, lives, damage, state",
      missions: [
        {
          key: "state",
          title: "One state at a time",
          summary: "Idle, run, jump, hurt, dead.",
          concept: { key: "state", name: "Player state", axis: "execution" },
          teach: {
            title: "A machine, not a pile of ifs",
            body: "You cannot be idle and dead. Transitions have rules. Hurt starts i-frames. Dead stops input.",
          },
          questions: [
            mcq("Player is hurt. Next legal state after i-frames?", ["Dead if hp==0 else idle/run", "Jump forever", "Main menu", "Spawn 12 clones"], 0, "HP decides."),
            match("State job.", [
              { left: "Idle", right: "No move input" },
              { left: "Run", right: "Grounded + move" },
              { left: "Hurt", right: "I-frames, knockback" },
              { left: "Dead", right: "No control, then respawn" },
            ], "Name the exclusive mode."),
            tf("All states should accept jump.", false, "Dead and hurt usually do not."),
            fill("A set of exclusive modes with rules between them is a state ___.", "machine", "The player is a machine.", ["fsm"]),
          ],
        },
        {
          key: "hp",
          title: "Hit points are a budget",
          summary: "Damage, i-frames, death.",
          concept: { key: "hp", name: "Health and hits", axis: "execution" },
          teach: {
            title: "Don't melt in one overlap",
            body: "On hit: subtract, flash, start i-frames. Overlap that lasts 20 frames must not subtract 20 times.",
          },
          questions: [
            scenario(
              "Standing in a spike. HP goes 0 in one tenth of a second.",
              "No i-frames. Damage on every physics tick.",
              ["Add i-frames or damage cooldown", "Remove spikes forever", "Raise max HP to 10,000", "Mute hurt sound"],
              0,
              "Hits need a cooldown.",
            ),
            mcq("I-frames exist to…", ["Look pretty", "Prevent multi-hit from one overlap", "Skip collision forever", "Disable gravity"], 1, "One contact, one hit."),
            tf("Death should instantly load the main menu.", false, "Play the beat, then respawn or continue."),
          ],
        },
        {
          key: "respawn",
          title: "Back from the dark",
          summary: "Checkpoints remember more than a sprite.",
          concept: { key: "respawn", name: "Respawn", axis: "knowledge" },
          teach: {
            title: "A pose and a flag set",
            body: "Save position, hp, inventory, story flags. Colour of the cape is optional.",
          },
          questions: [
            fill("Returning to a checkpoint after death is ___.", "respawn", "Back to a save pose.", ["respawning"]),
            mcq("Checkpoint saved only the sprite hue. Player lost the key. Bug?", ["Working as intended", "Incomplete save state", "Need more bloom", "Gravity too high"], 1, "Save the verbs, not the tint."),
            tf("Checkpoints should save only the sprite colour.", false, "Save position, hp, inventory, flags."),
          ],
        },
        {
          key: "hero-kit",
          title: "Mini-project: The hero kit",
          summary: "Move, jump, take a hit, respawn.",
          kind: "project",
          minutes: 12,
          concept: { key: "hero-kit", name: "Hero kit", axis: "execution" },
          teach: {
            title: "Four verbs",
            body: "If any verb is missing, QA will file it as “character feels broken.”",
          },
          questions: [
            challenge(
              "The hero kit",
              "Room with a pit, a spike, a checkpoint.",
              [
                { question: "Order to implement?", options: ["Particles first", "Move, jump, hit, respawn", "Online leaderboards", "A shop"], answer: 1, explanation: "Verbs before juice." },
                { question: "Spike contact?", options: ["Instant uninstall", "Damage + i-frames + knockback", "Delete the player object", "Mute"], answer: 1, explanation: "Readable hit." },
                { question: "Pit?", options: ["Softlock in the void", "Kill plane then checkpoint", "Disable gravity", "Hide the pit"], answer: 1, explanation: "Fail, then retry." },
              ],
              "Four verbs. One room.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "world",
      title: "Build the World",
      subtitle: "Tiles, camera, spawn, checkpoints",
      missions: [
        {
          key: "tiles",
          title: "Cheap geometry",
          summary: "Tiles are the floor, not the art pass.",
          concept: { key: "tiles", name: "Tilemaps", axis: "knowledge" },
          teach: {
            title: "Grid first",
            body: "A tile is a cell with a collision bit. Art can sit on top. If collision lives only in pixels, you will fight every sprite swap.",
          },
          questions: [
            mcq("Best source of floor collision?", ["The JPEG alpha", "A collision layer on the tilemap", "The music waveform", "Player opinion"], 1, "Data, not pixels."),
            tf("Every decorative bush needs a solid collider.", false, "Decor is scenery. Solids are walkable contracts."),
            fill("A grid of cells that make a level is a ___.", "tilemap", "Cheap world.", ["tile map"]),
          ],
        },
        {
          key: "cam-follow",
          title: "The camera is a teammate",
          summary: "Follow, lerp, look-ahead.",
          concept: { key: "cam-follow", name: "Camera follow", axis: "execution" },
          teach: {
            title: "World stays, view moves",
            body: "Hard-lock feels sick. A little lerp and look-ahead in the run direction sells speed without vomiting.",
          },
          questions: [
            order("Camera follow.", ["Read player position", "Add look-ahead from velocity", "Lerp toward target", "Clamp to room bounds"], "Smooth, then cage."),
            mcq("Camera hard-snaps every frame to the player. Feel?", ["Cinematic", "Jittery and nauseous", "AAA by default", "Better jumps"], 1, "Lerp."),
            tf("The camera should be allowed to show empty void past the designed room.", false, "Clamp to the authored bounds."),
          ],
        },
        {
          key: "spawners",
          title: "Intentions in the map",
          summary: "Spawn, flag, hazard markers.",
          concept: { key: "spawners", name: "Spawners", axis: "execution" },
          teach: {
            title: "Markers are data",
            body: "A spawn marker is not a painted pixel. It is an object the scene can find. Checkpoints are the same idea with memory.",
          },
          questions: [
            identify(
              "Why can't they restart?",
              "Player blit at 0,0. Flag is drawn into the background PNG. No objects named Spawn or Goal.",
              ["Missing spawn and goal objects", "Need more FOV", "Need Steam", "Gravity illegal"],
              0,
              "Markers must be objects.",
            ),
            mcq("A gap that teaches jump should sit…", ["After the final boss", "Just after a safe floor that proves jump", "In the main menu", "Inside the HUD"], 1, "Teach, then test."),
            tf("Spawners should run every frame and clone 200 enemies.", false, "Spawn with a budget."),
          ],
        },
        {
          key: "level-v1",
          title: "Mini-project: A playable level",
          summary: "Start, floor, a gap, a flag.",
          kind: "project",
          minutes: 14,
          concept: { key: "level-v1", name: "Level building", axis: "execution" },
          teach: {
            title: "Camera follows, world stays",
            body: "Tiles are cheap geometry. Spawners are intentions. A flag is a win condition, not a sticker.",
          },
          questions: [
            challenge(
              "A playable level",
              "One start, one gap that needs jump, one checkpoint, one flag.",
              [
                { question: "First?", options: ["Write a novel", "Tile the floor and place spawn", "Ship DLC", "Hire orchestra"], answer: 1, explanation: "Walkable space first." },
                { question: "The gap?", options: ["Unwinnable 20-tile pit first", "A jump they just practised on flat ground", "Invisible", "Random each frame"], answer: 1, explanation: "Teach, then test." },
                { question: "Win?", options: ["Close the app", "Overlap the flag, stop, fanfare", "Delete the player", "Open settings"], answer: 1, explanation: "A readable end." },
              ],
              "Start, teach, flag.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "enemies",
      title: "Enemies",
      subtitle: "Patrol, chase, attack",
      missions: [
        {
          key: "notice",
          title: "They notice you",
          summary: "Aggro is a radius, not a psychic.",
          concept: { key: "notice", name: "Detection", axis: "execution" },
          teach: {
            title: "Distance then team",
            body: "Patrol until distance < aggro and layers match. Wrong team layer means they stare through you forever.",
          },
          questions: [
            match("Enemy state.", [
              { left: "Patrol", right: "Walk waypoints" },
              { left: "Chase", right: "Move toward player" },
              { left: "Attack", right: "In range, wind-up, hit" },
              { left: "Stun", right: "Ignore AI, play hurt" },
            ], "Same machine as the player."),
            mcq("They never notice you. Bug?", ["Aggro radius 0 or wrong team layer", "Gravity too high", "Need more bloom", "Mute audio"], 0, "Detection failed."),
            tf("Aggro should ignore walls if it feels dramatic.", false, "Line of sight is a design choice you must code, not assume."),
          ],
        },
        {
          key: "attack",
          title: "Wind-up, then hit",
          summary: "Telegraph or it feels cheap.",
          concept: { key: "attack", name: "Enemy attack", axis: "execution" },
          teach: {
            title: "Readable violence",
            body: "Wind-up pose. Hitbox on. Recover. If the hitbox is on during patrol, the player is bullied.",
          },
          questions: [
            order("A melee swing.", ["Enter attack range", "Play wind-up", "Enable hitbox", "Disable hitbox", "Recover"], "Show it, then hurt."),
            scenario(
              "Players rage-quit. The slime damages them while walking past, no pose change.",
              "Hitbox is the whole body, always on.",
              ["Attack hitbox only during the swing", "Remove the player jump", "Add more slimes", "Lower music"],
              0,
              "Idle is not a hit.",
            ),
            fill("The pose that warns before damage is a ___.", "wind-up", "Telegraph.", ["windup", "telegraph"]),
          ],
        },
        {
          key: "stun",
          title: "They can be interrupted",
          summary: "Stun is a state, not a pause menu.",
          concept: { key: "stun", name: "Stun and knockback", axis: "knowledge" },
          teach: {
            title: "Ignore the brain briefly",
            body: "On player hit: knockback, stun timer, then return to chase. If stun never ends, they are furniture.",
          },
          questions: [
            mcq("Stun timer hits 0. Next?", ["Stay stunned forever", "Return to chase or patrol", "Delete the enemy", "Open the map"], 1, "Timers expire."),
            tf("Knockback should ignore collision so they fly through the world.", false, "They are still bodies."),
            identify(
              "Why won't they chase again?",
              "onHit: state = Stun; stunTime = 0.2; never decrement stunTime.",
              ["Stun timer never counts down", "Need more waypoints", "Camera shy", "Audio muted"],
              0,
              "Timers must tick.",
            ),
          ],
        },
        {
          key: "boss-blind",
          title: "Boss: The Blind Patrol",
          summary: "They walk. They never see. QA is waiting.",
          kind: "boss",
          minutes: 14,
          concept: { key: "boss-blind", name: "AI emergency", axis: "problem" },
          teach: {
            title: "Three faults",
            body: "Radius, layer, then the attack window. Do not add a new enemy type until one notices you.",
          },
          questions: [
            challenge(
              "THE BLIND PATROL",
              "Waypoints work. Aggro radius is 0. Player is on layer Hero. Enemy mask is Hazards. Attack hitbox is always on.",
              [
                { question: "They never turn. First?", options: ["New art", "Give aggro a real radius", "Delete waypoints", "Raise gravity"], answer: 1, explanation: "Zero radius is blindness." },
                { question: "Still blind?", options: ["More bloom", "Include Hero on the detect mask", "Mute", "Invert controls"], answer: 1, explanation: "Layers." },
                { question: "Now they melt the player on walk-by. Fix?", options: ["Always-on body damage is fine", "Hitbox only in the attack state", "Remove i-frames", "Hide HP"], answer: 1, explanation: "Telegraph." },
              ],
              "See, then strike.",
              "hard",
              250,
            ),
          ],
        },
      ],
    },
    {
      key: "systems",
      title: "Game Systems",
      subtitle: "Score, inventory, pickups, progression",
      missions: [
        {
          key: "pickup",
          title: "A coin is an event",
          summary: "Overlap, grant, destroy, sound.",
          concept: { key: "pickup", name: "Pickups", axis: "execution" },
          teach: {
            title: "One contact",
            body: "On overlap: add score, play a tick, destroy the coin. If you don't destroy it, score explodes.",
          },
          questions: [
            order("Collect a coin.", ["Detect overlap", "Add score", "Play feedback", "Destroy or disable the coin"], "Grant once."),
            mcq("Score jumps by thousands standing on one coin. Cause?", ["Need a new engine", "Pickup never disables, retriggers", "Gravity", "Camera"], 1, "Destroy or flag collected."),
            tf("Checkpoints should save only the sprite colour.", false, "Save position, hp, inventory, flags."),
          ],
        },
        {
          key: "inventory",
          title: "Pockets have a size",
          summary: "Full bag is a rule, not a crash.",
          concept: { key: "inventory", name: "Inventory", axis: "execution" },
          teach: {
            title: "Refuse or swap",
            body: "Capacity is a number. Overflow is a choice: bounce the item back or open a swap UI.",
          },
          questions: [
            mcq("Inventory is full. Pickup?", ["Delete the player", "Refuse or swap", "Crash", "Disable collisions globally"], 1, "A rule, not a crash."),
            fill("The list of items the hero carries is the ___.", "inventory", "Pockets."),
            tf("Keys should be deleted from the world but never stored on the player.", false, "Then doors cannot open."),
          ],
        },
        {
          key: "progress",
          title: "Gates on numbers",
          summary: "Progression is a lock with a key of stats.",
          concept: { key: "progress", name: "Progression", axis: "problem" },
          teach: {
            title: "Earn the next room",
            body: "A door that needs 10 coins is a sentence. A door that needs a secret global is a bug report.",
          },
          questions: [
            scenario(
              "Players never find the second area. The door checks a misspelled flag `hasKry`.",
              "Pickup sets `hasKey`.",
              ["Align the flag name and show a hint when they have the key", "Add 40 more doors", "Remove coins", "Hide the first area"],
              0,
              "The lock must match the key.",
            ),
            mcq("Best first progression gate?", ["A 90-hour skill tree", "A door that needs the coin they just saw", "Random permadelete", "Online pass"], 1, "Teach the economy."),
            identify(
              "Why is the door deaf?",
              "if (coins > 10) open(); Player has exactly 10 coins.",
              ["Off-by-one: need >= 10", "Need more bloom", "Camera", "Audio"],
              0,
              "Counts are exact.",
            ),
          ],
        },
      ],
    },
    {
      key: "feel",
      title: "Game Feel",
      subtitle: "Juice: animation, particles, audio, shake, UI",
      missions: [
        {
          key: "juice",
          title: "Ugly can still feel good",
          summary: "Feedback is the product.",
          concept: { key: "juice", name: "Game feel", axis: "execution" },
          teach: {
            title: "Every input answers",
            body: "Squash on land. Flash on hit. A tick of shake. A tiny sound. UI that tells HP now.",
          },
          questions: [
            order("Juice a jump.", ["Anticipate (crouch)", "Explode upward", "Hang in air slightly", "Squash on land", "Dust particles"], "Anticipation and follow-through."),
            mcq("Hit feels like nothing. First add?", ["A 40-page lore dump", "Hit stop + flash + sound", "A new engine", "Remove HP"], 1, "Feedback."),
            tf("Juice should hide a broken jump.", false, "Feel sits on a working verb."),
            fill("A tiny camera kick on hit is screen ___.", "shake", "Impact."),
          ],
        },
        {
          key: "anim",
          title: "Pose is information",
          summary: "Animation sells state.",
          concept: { key: "anim", name: "Animation", axis: "execution" },
          teach: {
            title: "Don't lie",
            body: "If the hurt animation plays while they can still jump-cancel freely with no i-frames, the picture is a liar.",
          },
          questions: [
            match("Pose.", [
              { left: "Crouch", right: "Jump is coming" },
              { left: "Stretch in air", right: "Committed to the hop" },
              { left: "Flash white", right: "I-frames / hit" },
              { left: "Crumple", right: "Dead" },
            ], "Read the silhouette."),
            mcq("Run cycle plays while standing. Cause?", ["Need more polygons", "State and animation desynced", "Gravity too low", "Mute"], 1, "Drive anim from state."),
            tf("Particles should spawn 10,000 on every footstep on mobile.", false, "Budget the juice."),
          ],
        },
        {
          key: "hud",
          title: "The HUD tells the truth",
          summary: "HP now, not after the funeral.",
          concept: { key: "hud", name: "HUD", axis: "knowledge" },
          teach: {
            title: "Immediate",
            body: "Hearts drop the frame you are hit. Score ticks when the coin dies. If the HUD lags a second, players feel cheated.",
          },
          questions: [
            mcq("HP bar updates 2 seconds after the hit. Feel?", ["Premium", "Untrustworthy", "More cinematic", "Better physics"], 1, "Now."),
            tf("A good HUD needs 20 meters and a mini-map of the universe.", false, "Show the verbs that matter."),
            identify(
              "Why do they think they are invincible?",
              "Damage applies. Hearts UI reads a cached value from scene load.",
              ["HUD bound to stale data", "Need more enemies", "Camera", "Tiles"],
              0,
              "Bind to live HP.",
            ),
          ],
        },
      ],
    },
    {
      key: "design",
      title: "Design",
      subtitle: "Difficulty, pacing, rewards, motivation",
      missions: [
        {
          key: "teach-test",
          title: "Teach, test, twist",
          summary: "Levels are sentences.",
          concept: { key: "teach-test", name: "Level design", axis: "problem" },
          teach: {
            title: "Safe practice then stakes",
            body: "Show a mechanic in a safe room. Then a gap. Then an enemy using it.",
          },
          questions: [
            scenario(
              "Players quit at the first flying enemy. They never saw wings in a safe room.",
              "Fix?",
              ["Make the first encounter a tutorial beat with no pits", "Add more flying enemies", "Remove jumps", "Start with the final boss"],
              0,
              "Teach before you test.",
            ),
            order("A new mechanic.", ["Show it safely", "Ask for it in a simple gap", "Combine with an old verb", "Twist the rule"], "Literacy before poetry."),
            tf("The first room should include every mechanic in the game.", false, "One idea at a time."),
          ],
        },
        {
          key: "pace",
          title: "Breathing room",
          summary: "Peaks need valleys.",
          concept: { key: "pace", name: "Pacing", axis: "problem" },
          teach: {
            title: "Threat, rest, reward",
            body: "A checkpoint after a hard jump is kindness. Three hard jumps with no rest is a quit screen.",
          },
          questions: [
            mcq("Three lethal jumps, no checkpoint, no coin. Likely player action?", ["Write a review of joy", "Quit", "Buy DLC", "Lower their chair"], 1, "Rest is design."),
            match("Beat.", [
              { left: "Safe floor", right: "Practice" },
              { left: "Gap", right: "Test" },
              { left: "Enemy + gap", right: "Twist" },
              { left: "Checkpoint + coin", right: "Breath" },
            ], "Rhythm."),
            fill("A save pose after a hard section is a ___.", "checkpoint", "Kindness with a flag."),
          ],
        },
        {
          key: "motive",
          title: "Why they keep playing",
          summary: "Rewards that teach, not slot machines.",
          concept: { key: "motive", name: "Motivation", axis: "problem" },
          teach: {
            title: "The next interesting decision",
            body: "A new verb, a shortcut, a story beat. Random loot with no skill is a treadmill.",
          },
          questions: [
            mcq("Best reward after mastering jump?", ["40 identical coins in a pit", "A door that needs a jump they now own", "A 20-minute cutscene of thanks", "Delete jump"], 1, "Spend the skill."),
            tf("Hiding the only checkpoint behind an unfair spike is “challenge.”", false, "It is contempt."),
            scenario(
              "Playtests: people love the lantern, quit when the cave goes pitch black with no beacons.",
              "Light is the mechanic.",
              ["Keep beacons readable; darkness slows, it doesn't erase the path", "Remove light entirely", "Make darkness instant death always", "Add a shop"],
              0,
              "Readable failure."),
          ],
        },
      ],
    },
    {
      key: "final",
      title: "Final Boss: Make a Game",
      subtitle: "Theme, mechanic, time limit",
      isBoss: true,
      missions: [
        {
          key: "final",
          title: "MAKE A GAME",
          summary: "A complete miniature. One sitting. One verb.",
          kind: "boss",
          minutes: 20,
          concept: { key: "final", name: "Ship a miniature", axis: "problem" },
          teach: {
            title: "Scope is the skill",
            body: "One mechanic. One level. Feel. Done. You are scored on a playable loop, not a pitch deck.",
          },
          questions: [
            challenge(
              "MAKE A GAME",
              "Theme: lanterns in a cave. Required mechanic: limited light. Time: one sitting.",
              [
                { question: "Core loop?", options: ["Open world MMO", "Move, light drains, reach the next lantern", "Dialogue tree of 400 lines", "Crafting 90 ores"], answer: 1, explanation: "One verb." },
                { question: "Fail state that teaches?", options: ["Instant uninstall", "Darkness slows you; lanterns are visible beacons", "Random crash", "Permadelete saves"], answer: 1, explanation: "Readable failure." },
                { question: "Feel?", options: ["Silent landings", "Juice on lantern pickup, squash on land, HUD for light", "A 40-page lore dump first", "No HUD ever"], answer: 1, explanation: "The product is feedback." },
                { question: "Ship when?", options: ["After a publisher", "Start, two rooms, a win flag, juice on light pickup", "When the renderer is physically based", "Never"], answer: 1, explanation: "Complete > huge." },
              ],
              "Theme + mechanic + finish line.",
              "hard",
              1000,
            ),
          ],
        },
      ],
    },
  ],
});
