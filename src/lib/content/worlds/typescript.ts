import { buildWorld, challenge, fill, identify, match, mcq, order, scenario, tf } from "../factory";

export const typescriptSkill = buildWorld({
  id: "typescript",
  name: "TypeScript",
  fantasy: "THE CODE GUARDIAN",
  tagline: "Make illegal states unrepresentable.",
  description: "Types, functions, objects, unions, generics, APIs, and turning chaotic JS into something robust.",
  category: "Code Worlds",
  difficulty: "intermediate",
  hours: 12,
  icon: "shield",
  trial: {
    key: "trial",
    title: "Spot the lie",
    summary: "The type says string. Runtime says null.",
    minutes: 4,
    concept: { key: "trial", name: "Type instincts", axis: "knowledge" },
    teach: {
      title: "The compiler is a colleague",
      body: "If the type says string and the runtime says null, the type is fiction. Guardians annotate boundaries and refuse to lie about holes.",
      bullets: ["Return types must include reality", "null is not a string", "any turns the guardian off"],
    },
    example: {
      title: "The polite crash",
      body: "function title(u: User): string { return u.name } — but User.name is string | null. Callers think they have a string. They don't.",
      callout: "The lie is the annotation, not the compiler.",
    },
    questions: [
      identify(
        "Which annotation is a lie?",
        "function title(u: User): string { return u.name }",
        ["If User.name is string | null, this can return null", "string is always fine", "Need any", "Delete types"],
        0,
        "The return type must include reality.",
      ),
      mcq("Honest return type if name can be missing?", ["string", "string | null", "any", "never"], 1, "Name the hole."),
      tf("as string is a proof.", false, "It is a gag order. The runtime can still be null."),
      scenario(
        "An API returns user: null for logged-out. The page type is User everywhere.",
        "First move?",
        ["Non-null assertions on every field", "Model User | null and narrow", "Disable strict", "Rename the file"],
        1,
        "Represent the logged-out state.",
        "hard",
      ),
    ],
  },
  levels: [
    {
      key: "types",
      title: "Types",
      subtitle: "string, number, boolean, inference",
      missions: [
        {
          key: "prim",
          title: "Start honest",
          summary: "Primitives and inference.",
          concept: { key: "prim", name: "Primitives", axis: "knowledge" },
          teach: {
            title: "Inference is a gift",
            body: "let n = 1 infers number. Use annotations at boundaries: functions, APIs, exports. Inside, let the compiler guess.",
            bullets: ["string, number, boolean, bigint, symbol", "null and undefined are holes under strictNullChecks", "any is a trapdoor"],
          },
          example: {
            title: "Boundary vs interior",
            body: "export function add(a: number, b: number): number { return a + b }. Inside, const total = a + b needs no annotation.",
            callout: "Annotate the doors. Not every chair.",
          },
          questions: [
            match("Value → type", [
              { left: '"ok"', right: "string" },
              { left: "3", right: "number" },
              { left: "true", right: "boolean" },
              { left: "null", right: "null (if strictNullChecks)" },
            ], "Be literal."),
            tf("any is a good default for a public API.", false, "any turns the guardian off."),
            fill("TypeScript guessing a type from the value is ___.", "inference", "Inference."),
            mcq("let x = \"hi\". x is?", ["any", "string", "object", "unknown"], 1, "Inference from the literal (widened to string for let)."),
          ],
        },
        {
          key: "strict",
          title: "Turn the lights on",
          summary: "strict, noImplicitAny, strictNullChecks.",
          concept: { key: "strict", name: "Strict mode", axis: "execution" },
          teach: {
            title: "Flags are the law",
            body: "strict bundles the honest checks. noImplicitAny refuses bare parameters. strictNullChecks makes null a different world from string.",
          },
          example: {
            title: "The error you want",
            body: "function id(x) { return x } — under strict, x is an error. That error is the map.",
            callout: "If it compiles with implicit any, you do not have a guardian.",
          },
          questions: [
            identify("What's wrong under strict?", "function id(x) { return x }", ["Implicit any on x", "Needs 12 generics", "Can't return", "Must be a class"], 0, "No implicit any."),
            tf("strictNullChecks means string can still be null silently.", false, "string | null is the honest union."),
            mcq("First tsconfig move on a JS pile?", ["skipLibCheck only", "strict true, then fix errors at edges", "noEmit forever", "allowJs false and delete src"], 1, "Lights on, then rooms."),
          ],
        },
        {
          key: "unknown",
          title: "unknown vs any",
          summary: "A box you must open carefully.",
          concept: { key: "unknown", name: "unknown", axis: "knowledge" },
          teach: {
            title: "any is a skip. unknown is a lock.",
            body: "You can pass any anywhere. unknown forces a narrowing before use. JSON and foreign data start as unknown.",
          },
          example: {
            title: "Open the box",
            body: "const data: unknown = await res.json(); if (isUser(data)) render(data). Without the guard, data.name is an error — good.",
            callout: "unknown is a lock. any is a skip.",
          },
          questions: [
            mcq("fetch().json() should be treated as?", ["User", "any, then hope", "unknown, then validate", "never"], 2, "The network is not your interface."),
            tf("unknown lets you call .toUpperCase() immediately.", false, "Narrow first."),
            fill("The type that is safe but unusable until narrowed is ___.", "unknown", "unknown."),
          ],
        },
        {
          key: "prim-pack",
          title: "Mini-project: Annotate the doors",
          summary: "Three functions. No any.",
          kind: "project",
          minutes: 10,
          concept: { key: "prim-pack", name: "Boundary pack", axis: "execution" },
          teach: {
            title: "Doors only",
            body: "Public functions get types. Interiors infer. If you annotated every const, you missed the point.",
          },
          questions: [
            challenge(
              "Annotate the doors",
              "add, title, isAdmin. Incoming values can be missing.",
              [
                { question: "add(a, b)?", options: ["any, any", "number, number → number", "string always", "unknown → any"], answer: 1, explanation: "A closed contract." },
                { question: "title(user) when name can be null?", options: [": string always", "string | null (or a fallback inside)", "as string", "never"], answer: 1, explanation: "Don't lie." },
                { question: "isAdmin?", options: ["any", "boolean", "string", "Date"], answer: 1, explanation: "A predicate returns boolean." },
              ],
              "Doors typed. Interiors inferred.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "fn",
      title: "Functions",
      subtitle: "Parameters, returns, optionals",
      missions: [
        {
          key: "fn",
          title: "Sign the contract",
          summary: "Callers deserve a type.",
          concept: { key: "fn", name: "Function types", axis: "execution" },
          teach: {
            title: "Annotate inputs and outputs",
            body: "function add(a: number, b: number): number. Optional is ?. Default values still have types. Rest params are arrays.",
          },
          example: {
            title: "Optional last name",
            body: "function full(first: string, last?: string): string { return last ? `${first} ${last}` : first }",
            callout: "last is string | undefined. Don't call last.toUpperCase() without a guard.",
          },
          questions: [
            identify("What's wrong?", "function id(x) { return x }", ["Implicit any on x", "Needs 12 generics", "Can't return", "Must be a class"], 0, "No implicit any in strict mode."),
            mcq("Optional last name?", ["last: string | undefined or last?: string", "last: any", "last: never", "delete the arg"], 0, "Optional is explicit."),
            tf("A default of last = \"\" means last is still required at the type level always.", false, "Defaults make the argument optional for callers."),
            fill("function f(): never means it ___.", "never returns", "Throws or loops.", ["throws", "does not return"]),
          ],
        },
        {
          key: "cb",
          title: "Callbacks and void",
          summary: "void is not undefined everywhere.",
          concept: { key: "cb", name: "Callbacks", axis: "knowledge" },
          teach: {
            title: "Call signatures",
            body: "(n: number) => void can be given a function that returns a value — the return is ignored. Don't use void when you need the result.",
          },
          example: {
            title: "map vs forEach",
            body: "array.map((x) => x * 2) needs a return. forEach callbacks are void. Mixing them is how you get an array of undefined.",
            callout: "The signature is the job.",
          },
          questions: [
            mcq("You meant to double numbers. You used forEach and pushed nowhere.", ["You get a new array", "You mutated nothing useful — map was the tool", "TypeScript invents map", "any saves you"], 1, "map returns."),
            tf("() => void forbids a function that returns a number from being passed.", false, "Return values of void-expected callbacks may be ignored."),
          ],
        },
        {
          key: "overload",
          title: "Overloads are a menu",
          summary: "Two call shapes, one body.",
          concept: { key: "overload", name: "Overloads", axis: "execution" },
          teach: {
            title: "Write the public shapes first",
            body: "function f(x: string): number; function f(x: number): string; function f(x: string | number) { ... }. Callers see the menu, not the union soup — until they pass a union.",
          },
          example: {
            title: "Two doors",
            body: "parse(\"12\") → number. parse(12) → string. The implementation takes string | number and narrows. Callers never see the soup — unless they pass a union.",
            callout: "The menu is the API.",
          },
          questions: [
            order("Add overloads.", ["Write each call signature", "Write the implementation with a union", "Narrow inside", "Don't export the impl signature as the only type"], "Menu, then kitchen."),
            scenario(
              "Callers pass string | number into an overloaded f. They get a confusing error.",
              "Why?",
              ["Overloads don't apply to unions the way you hope", "Need any", "Delete overloads always", "JSX"],
              0,
              "Sometimes a single union signature is kinder.",
            ),
          ],
        },
      ],
    },
    {
      key: "obj",
      title: "Objects",
      subtitle: "Interfaces, aliases, nesting",
      missions: [
        {
          key: "obj",
          title: "Shape the data",
          summary: "Name the objects you pass around.",
          concept: { key: "obj", name: "Object types", axis: "execution" },
          teach: {
            title: "interface vs type",
            body: "Both can describe objects. Interfaces merge. Type aliases can union. Nested objects get their own names when reused.",
          },
          questions: [
            mcq("A user with an address used in 4 modules. Best?", ["Inline the address 4 times", "Name Address and User", "Use any", "JSON.parse forever"], 1, "Name reused shapes."),
            tf("Excess property checks catch unknown fields on object literals.", true, "A feature, not a bug."),
            fill("interface User { id: string } describes an object's ___.", "shape", "Shape.", ["type", "structure"]),
          ],
        },
        {
          key: "index",
          title: "Index signatures",
          summary: "Record vs a bag of any.",
          concept: { key: "index", name: "Index signatures", axis: "knowledge" },
          teach: {
            title: "Known keys first",
            body: "Record<Id, User> is a map. { [k: string]: any } is a junk drawer. Optional keys are ? not stringly bags.",
          },
          questions: [
            identify(
              "Which is the junk drawer?",
              "type Bag = { [k: string]: any }",
              ["A precise User", "An untyped map", "A union", "never"],
              1,
              "any values, any keys.",
            ),
            mcq("A dictionary of users by id?", ["any", "Record<string, User> (or a branded Id)", "{ [k: string]: any }", "User[] only"], 1, "Values stay User."),
          ],
        },
        {
          key: "readonly",
          title: "Readonly is a fence",
          summary: "Mutation is a choice.",
          concept: { key: "readonly", name: "Readonly", axis: "execution" },
          teach: {
            title: "Don't mutate what you were given",
            body: "readonly id: string. ReadonlyArray<T>. The compiler will not stop runtime mutation of escaped objects — but it stops honest code from trying.",
          },
          questions: [
            tf("readonly on a property prevents all runtime mutation of that field.", false, "It is a type fence, not a freeze unless you also freeze."),
            mcq("Function should not mutate the input list. Parameter type?", ["T[]", "readonly T[]", "any[]", "never[]"], 1, "ReadonlyArray."),
          ],
        },
        {
          key: "obj-pack",
          title: "Mini-project: Name the domain",
          summary: "User, Address, Order — no inline soup.",
          kind: "project",
          minutes: 12,
          concept: { key: "obj-pack", name: "Domain types", axis: "execution" },
          teach: {
            title: "If it is passed twice, it has a name",
            body: "Shared shapes become types. One-off view models can stay local.",
          },
          questions: [
            challenge(
              "Name the domain",
              "Checkout passes user + address + line items through 4 files.",
              [
                { question: "Address inlined 4 times. Move?", options: ["Keep inlining", "type Address, used by User and Order", "any", "JSON"], answer: 1, explanation: "Reuse." },
                { question: "Order.total as string. Honest?", options: ["string forever", "integer cents + formatter", "any", "Date"], answer: 1, explanation: "Money is not a caption." },
                { question: "Extra field on a literal assigned to User?", options: ["Silent", "Excess property error — good", "Need any", "Delete the interface"], answer: 1, explanation: "Typos get caught." },
              ],
              "Name it. Then pass it.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "union",
      title: "Unions",
      subtitle: "Narrowing and type guards",
      missions: [
        {
          key: "union",
          title: "Success | Error",
          summary: "Discriminate, then touch.",
          concept: { key: "union", name: "Unions and narrowing", axis: "execution" },
          teach: {
            title: "Discriminate",
            body: "type Result = { ok: true; data: T } | { ok: false; error: string }. Narrow on ok. Never assume the other branch.",
          },
          questions: [
            identify(
              "How do you narrow?",
              "if (res.ok) { use res.data }",
              ["Discriminant ok", "Cast to any", "Ignore errors", "JSON.stringify"],
              0,
              "The flag is the guard.",
            ),
            order("Handle the union.", ["Define a discriminant", "Switch/if on it", "Use the narrowed fields", "Never assume the other branch"], "Narrow, then touch."),
            tf("string | number lets you call .toFixed without narrowing.", false, "Narrow first."),
          ],
        },
        {
          key: "guard",
          title: "Write a type guard",
          summary: "is User, not as User.",
          concept: { key: "guard", name: "Type guards", axis: "execution" },
          teach: {
            title: "predicate is T",
            body: "function isUser(x: unknown): x is User { return typeof x === \"object\" && x !== null && \"id\" in x && typeof (x as User).id === \"string\" }. Then the true branch is User.",
          },
          questions: [
            mcq("x is User on a function means?", ["Runtime freeze", "A predicate the compiler trusts on the true branch", "any", "A class"], 1, "User-defined guard."),
            scenario(
              "You wrote as User on JSON.parse. Production got a 500 from missing id.",
              "Better?",
              ["More as User", "unknown + guard or schema parse", "Disable strict", "any"],
              1,
              "Validate at the edge.",
            ),
            fill("A function returning x is T is a type ___.", "guard", "Guard.", ["predicate"]),
          ],
        },
        {
          key: "never",
          title: "The switch that exhausts",
          summary: "never is a tripwire.",
          concept: { key: "never", name: "Exhaustiveness", axis: "problem" },
          teach: {
            title: "Default is a bug",
            body: "In a switch on a union of kinds, assign the leftover to never. When someone adds a kind, the build fails instead of silently dropping a case.",
          },
          questions: [
            mcq("New union member, switch forgot it. Best catch?", ["QA in a year", "assert never in default", "any", "console.log"], 1, "The compiler becomes the test."),
            tf("never means the value exists at runtime always.", false, "never means this code must not be reached."),
          ],
        },
      ],
    },
    {
      key: "gen",
      title: "Arrays & Generics",
      subtitle: "Reusable typed collections",
      missions: [
        {
          key: "arr",
          title: "Arrays keep their element type",
          summary: "T[] vs any[].",
          concept: { key: "arr", name: "Arrays", axis: "knowledge" },
          teach: {
            title: "map preserves T",
            body: "number[].map(n => n * 2) is number[]. any[] maps to any. Tuples have a fixed length: [string, number].",
          },
          questions: [
            fill("Array<number> is the same as ___.", "number[]", "Two spellings.", ["number[]"]),
            tf("A tuple [string, number] is the same as (string | number)[].", false, "Order and length matter."),
            mcq("Why not any[] for a list of Users?", ["Faster runtime", "You lose User in every map/filter", "Smaller bundles always", "They print nicer"], 1, "Types flow."),
          ],
        },
        {
          key: "gen",
          title: "T is a hole you fill",
          summary: "One function, many T.",
          concept: { key: "gen", name: "Generics", axis: "execution" },
          teach: {
            title: "Constraints",
            body: "function first<T>(xs: T[]): T | undefined. function byId<T extends { id: string }>(xs: T[], id: string): T | undefined.",
          },
          questions: [
            mcq("Why generics over any[]?", ["Keep element type through the function", "Faster runtime", "Smaller bundles always", "They print nicer"], 0, "Types flow."),
            identify(
              "What does T extend?",
              "function byId<T extends { id: string }>(xs: T[], id: string)",
              ["T must have id: string", "T is any", "T is never", "T is a class only"],
              0,
              "A constraint, not a cast.",
            ),
            tf("Generics exist at runtime as extra JavaScript objects.", false, "They erase. Runtime is still JS."),
          ],
        },
        {
          key: "gen-pack",
          title: "Mini-project: A typed collection",
          summary: "first, last, byId — one T.",
          kind: "project",
          minutes: 12,
          concept: { key: "gen-pack", name: "Collection pack", axis: "execution" },
          teach: {
            title: "Three functions, zero any",
            body: "If byId returns any, you failed. If it returns T | undefined, you shipped.",
          },
          questions: [
            challenge(
              "Typed collection",
              "Need first, last, byId on lists of User or Product.",
              [
                { question: "first<T>?", options: ["any", "T[] in, T | undefined out", "User only forever", "never"], answer: 1, explanation: "Hole T." },
                { question: "byId constraint?", options: ["T extends { id: string }", "T extends any", "no constraint + as T", "T extends Date"], answer: 0, explanation: "Need an id." },
                { question: "Empty list?", options: ["throw as T", "undefined / throw documented", "null as unknown as T", "any"], answer: 1, explanation: "Name the empty case." },
                { question: "Done when?", options: ["any[] everywhere", "Callers keep User through the helper", "12 overloads of User", "skipLibCheck"], answer: 1, explanation: "Types flow." },
              ],
              "One T. Honest empty.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "api",
      title: "Real APIs",
      subtitle: "Unknown JSON becomes a type",
      missions: [
        {
          key: "api",
          title: "Don't trust the network",
          summary: "Parse at the edge.",
          concept: { key: "api", name: "API types", axis: "problem" },
          teach: {
            title: "unknown first",
            body: "Validate (zod or guards). Then your app types. The renderer never sees raw JSON.",
          },
          questions: [
            scenario(
              "fetch().json() is any. You pass it to a renderer that expects User.",
              "Honest move?",
              ["Trust the backend forever", "Validate into User, fail loud", "as User as any", "Disable strict"],
              1,
              "The boundary is where you pay.",
            ),
            tf("JSON.parse returns a typed object matching your interface automatically.", false, "It returns any."),
            fill("At the network edge, start from ___.", "unknown", "unknown.", ["any"]),
          ],
        },
        {
          key: "schema",
          title: "A schema is a runtime type",
          summary: "Types lie. Parsers don't.",
          concept: { key: "schema", name: "Parsers", axis: "execution" },
          teach: {
            title: "One source of truth",
            body: "If User lives only in an interface, the wire can drift. A schema infers the type and checks the payload. Fail closed.",
          },
          questions: [
            mcq("Backend added a field, removed id. Your interface still has id. Who notices?", ["The compiler on JSON.parse", "A parser / tests at the edge", "CSS", "The logo"], 1, "Runtime check."),
            identify(
              "What's the lie?",
              "const user = JSON.parse(text) as User",
              ["A proof", "A gag order — no check", "A type guard", "A generic"],
              1,
              "as does not parse.",
            ),
          ],
        },
        {
          key: "error",
          title: "HTTP errors are data",
          summary: "4xx is not throw any.",
          concept: { key: "error", name: "API errors", axis: "problem" },
          teach: {
            title: "Result, not surprise",
            body: "A 404 can be { ok: false, status: 404 }. Throwing a string loses the shape. Typed errors can be switched on.",
          },
          questions: [
            mcq("fetch 404. Worst?", ["Parse a Result union", "throw \"nope\" and catch any", "A typed ApiError", "Narrow on status"], 1, "any catch is a hole."),
            tf("catch (e) { e.message } is always safe.", false, "e is unknown. Narrow it."),
          ],
        },
      ],
    },
    {
      key: "adv",
      title: "Advanced Types",
      subtitle: "Utilities, mapped, conditional",
      missions: [
        {
          key: "adv",
          title: "Types that write types",
          summary: "Partial, Pick, infer.",
          concept: { key: "adv", name: "Advanced types", axis: "knowledge" },
          teach: {
            title: "Utility types",
            body: "Partial, Required, Pick, Omit, Record. Mapped types loop keys. Conditionals branch. infer pulls a piece out of another type.",
          },
          questions: [
            match("Utility.", [
              { left: "Partial<User>", right: "All fields optional" },
              { left: "Pick<User, 'id'>", right: "Only id" },
              { left: "Omit<User, 'password'>", right: "User without password" },
              { left: "Record<Id, User>", right: "Map of id to User" },
            ], "Don't hand-roll these."),
            mcq("A mapped type is…", ["A type that transforms each property of another", "A runtime loop", "A CSS map", "A Docker volume"], 0, "Types over keys."),
            fill("Pick a few keys with ___.", "Pick", "Pick.", ["Pick<T, K>"]),
          ],
        },
        {
          key: "cond",
          title: "If types, then types",
          summary: "T extends U ? X : Y",
          concept: { key: "cond", name: "Conditionals", axis: "execution" },
          teach: {
            title: "Branch at compile time",
            body: "UnwrapPromise<T> = T extends Promise<infer U> ? U : T. infer is a capture. Distribute over naked unions unless you wrap in a tuple.",
          },
          questions: [
            identify(
              "What is U?",
              "T extends Promise<infer U> ? U : T",
              ["The inner resolved type if T is a Promise", "always any", "the Promise itself", "never"],
              0,
              "infer captures.",
            ),
            tf("Conditional types run in the browser as if/else.", false, "They erase. Compile time only."),
          ],
        },
        {
          key: "template",
          title: "Template literal types",
          summary: "Routes as types.",
          concept: { key: "template", name: "Template types", axis: "knowledge" },
          teach: {
            title: "Strings with grammar",
            body: "`/users/${string}` is not just string. You can forbid illegal routes in the type, then still validate at runtime.",
          },
          questions: [
            mcq("Event names \"click:button\". Type?", ["string", "`${string}:${string}` or a union of known events", "any", "number"], 1, "Grammar > soup."),
            tf("Template literal types replace all runtime routing checks.", false, "They help callers. The wire still lies."),
          ],
        },
      ],
    },
    {
      key: "refactor",
      title: "Refactoring",
      subtitle: "Chaotic JS → type-safe",
      missions: [
        {
          key: "refactor",
          title: "Stricter in layers",
          summary: "The errors are the map.",
          concept: { key: "refactor", name: "Typed refactor", axis: "problem" },
          teach: {
            title: "Edges first",
            body: "Enable strict. Type module boundaries. Replace any. Kill dead branches the compiler found. Don't start with a random util.",
          },
          questions: [
            order("The refactor.", ["Turn on strict", "Type module boundaries", "Replace any", "Fix the errors it reveals"], "The errors are the map."),
            mcq("First file in a checkout JS app?", ["A random util", "The payment/API boundary", "A CSS module", "Test snapshots of snapshots"], 1, "Money and IO."),
            tf("as any is a valid long-term architecture.", false, "It is a ticket, not a home."),
          ],
        },
        {
          key: "jsdoc",
          title: "JSDoc is a bridge",
          summary: "allowJs before the rename.",
          concept: { key: "jsdoc", name: "JSDoc types", axis: "execution" },
          teach: {
            title: "Check JS, then convert",
            body: "// @ts-check and @param {User} u let you type a .js file. Then rename to .ts when the errors are small.",
          },
          questions: [
            scenario(
              "A 4,000-line checkout.js. Team fears a big-bang rename.",
              "Move?",
              ["allowJs + check JS + type the edges, then convert file by file", "any in a new .ts and paste", "Disable the compiler", "Rewrite in a new language tonight"],
              0,
              "Bridge, then rename.",
            ),
            tf("Renaming every file to .ts on Friday without types is a conversion.", false, "You just moved the fire."),
          ],
        },
        {
          key: "refactor-boss",
          title: "Boss: The any farm",
          summary: "Money is string. Users are any. Tests are snapshots of snapshots.",
          kind: "boss",
          minutes: 14,
          concept: { key: "any-farm", name: "Any farm", axis: "problem" },
          teach: {
            title: "Triage",
            body: "You cannot boil the ocean tonight. Rank: money, auth, API, then internals. Each any you kill needs a real type, not a prettier any.",
          },
          questions: [
            challenge(
              "THE ANY FARM",
              "checkout.js: prices as strings, null users, any everywhere.",
              [
                { question: "First file?", options: ["A random util", "The payment/API boundary", "A CSS module", "Test snapshots of snapshots"], answer: 1, explanation: "Money and IO." },
                { question: "Price: string. Honest type?", options: ["string forever", "cents as number (integer) plus a formatter", "any", "Date"], answer: 1, explanation: "Don't do money in float strings." },
                { question: "User | null on a page that assumed User?", options: ["Non-null assertion everywhere", "Narrow and route unauthenticated users", "Ignore", "as User"], answer: 1, explanation: "Model the gap." },
                { question: "Done for the night?", options: ["Zero errors, still any on money", "Money and auth typed, remaining anys listed", "Renamed every file", "skipLibCheck as the strategy"], answer: 1, explanation: "Edges first, a list for the rest." },
              ],
              "Triage. Then types that tell the truth.",
              "hard",
              250,
            ),
          ],
        },
      ],
    },
    {
      key: "final",
      title: "Final Boss: The untyped app",
      subtitle: "Hidden bugs. You are the guardian.",
      isBoss: true,
      missions: [
        {
          key: "final",
          title: "Make it robust",
          summary: "A large JS app full of landmines.",
          kind: "boss",
          minutes: 16,
          concept: { key: "final", name: "Harden the app", axis: "problem" },
          teach: {
            title: "Prioritise the edges",
            body: "APIs, money, auth. Then internals.",
          },
          questions: [
            challenge(
              "THE UNTYPED APP",
              "Checkout.js: prices as strings, null users, any everywhere.",
              [
                { question: "First file?", options: ["A random util", "The payment/API boundary", "A CSS module", "Test snapshots of snapshots"], answer: 1, explanation: "Money and IO." },
                { question: "Price: string. Honest type?", options: ["string forever", "cents as number (integer) plus a formatter", "any", "Date"], answer: 1, explanation: "Don't do money in float strings." },
                { question: "User | null on a page that assumed User?", options: ["Non-null assertion everywhere", "Narrow and route unauthenticated users", "Ignore", "as User"], answer: 1, explanation: "Model the gap." },
                { question: "JSON at the edge?", options: ["as User", "unknown + parse/guard, fail loud", "any", "Disable strict"], answer: 1, explanation: "The wire is not your interface." },
              ],
              "Edges first. Then the rest compiles.",
              "hard",
              1000,
            ),
          ],
        },
      ],
    },
  ],
});
