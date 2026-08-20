import { buildWorld, challenge, fill, identify, match, mcq, order, scenario, tf } from "../factory";

export const aiAgentsSkill = buildWorld({
  id: "ai-agents",
  name: "AI Agents",
  fantasy: "THE AGENT BUILDER",
  tagline: "From answers to actions.",
  description: "Tools, memory, retrieval, planning, multi-agent, approvals, and reliability.",
  category: "AI Worlds",
  difficulty: "intermediate",
  hours: 14,
  icon: "bot",
  trial: {
    key: "trial",
    title: "Give this agent a search",
    summary: "It talks. Make it act. Tools first, adjectives later.",
    minutes: 4,
    concept: { key: "trial", name: "Tool instincts", axis: "execution" },
    teach: {
      title: "A tool is a function",
      body: "Name, description, schema. The model chooses. You execute. You return. Without a search tool, URLs are fan fiction.",
      bullets: ["Schema is the UX", "Execute in your code, not in the model's head", "Demand citations from results"],
    },
    example: {
      title: "Invented URLs",
      body: "The agent pastes https://policies.internal/refunds-v9. The page 404s. There is no search tool. Confidence was a costume.",
      callout: "Give it a tool, then demand the evidence.",
    },
    questions: [
      mcq(
        "The agent keeps inventing URLs. Fix?",
        ["Longer system prompt only", "Add a search tool and require citations from results", "Raise temperature", "Ban the word URL"],
        1,
        "Give it a tool, then demand the evidence.",
        "medium",
      ),
      fill("A named function the model may call is a ___.", "tool", "Action with a schema.", ["function"]),
      tf("If a tool fails, the agent should invent the rows.", false, "Return the error. Let it retry or ask."),
      scenario(
        "User asks for today's weather in Leeds. The model writes a number with no call.",
        "You have get_weather(city).",
        ["Force a tool call, then answer from the payload", "Trust the vibe", "Raise temperature", "Delete the tool"],
        0,
        "Act, then speak.",
      ),
    ],
  },
  levels: [
    {
      key: "agent",
      title: "The Agent",
      subtitle: "Model, instructions, tools, loop",
      missions: [
        {
          key: "parts",
          title: "Not a chatbot",
          summary: "Four parts. One heartbeat.",
          concept: { key: "parts", name: "Agent parts", axis: "knowledge" },
          teach: {
            title: "The kit",
            body: "Instructions bound behaviour. Tools extend it. The loop stops when it returns a final answer.",
            bullets: ["Model chooses the next step", "You run the function", "Observe before you speak"],
          },
          example: {
            title: "One turn",
            body: "Goal: “Find Ada's order.” Model picks lookup_order. You run it. You hand back JSON. Model answers with a status, not a guess.",
            callout: "Observe before you speak.",
          },
          questions: [
            match("Piece.", [
              { left: "Model", right: "Chooses the next step" },
              { left: "Instructions", right: "Policy" },
              { left: "Tools", right: "Actions it may take" },
              { left: "Loop", right: "Call, observe, repeat" },
            ], "Four parts."),
            order("One turn with a tool.", ["Read user goal", "Pick a tool", "Execute", "Observe", "Final answer or another call"], "Observe before you speak."),
            tf("A chatbot with no tools is already an agent.", false, "Agents act."),
            fill("The cycle of call, observe, repeat is the agent ___.", "loop", "Heartbeat."),
          ],
        },
        {
          key: "stop-loop",
          title: "Know when to stop talking",
          summary: "Final answer is a decision, not a vibe.",
          concept: { key: "stop-loop", name: "Loop halt", axis: "execution" },
          teach: {
            title: "Caps",
            body: "Max tool calls. If the model never emits a final answer, you cut the run. Infinite loops are a bill and an incident.",
          },
          example: {
            title: "The spinner",
            body: "search, search, search, search. No cap. The user waited four minutes for a paragraph they could have Googled.",
            callout: "Hard caps are kindness.",
          },
          questions: [
            mcq("Search 429s three times. Next?", ["Infinite retry", "Backoff, then escalate", "Invent results", "Crash the process quietly"], 1, "Budgeted retries."),
            tf("An agent should loop until the heat death of the universe.", false, "Hard caps."),
            identify(
              "Missing halt?",
              "while (true) { model(); tools(); } // no max, no final-answer check",
              ["No cap and no stop condition", "Need more temperature", "Need more adjectives", "Tools are illegal"],
              0,
              "Stop is part of the design.",
            ),
          ],
        },
        {
          key: "policy",
          title: "Instructions are law",
          summary: "Policy beats cleverness.",
          concept: { key: "policy", name: "Instructions", axis: "knowledge" },
          teach: {
            title: "Write like a manager",
            body: "What it may do. What it must ask. What it must never do. A poem about being helpful is not a policy.",
          },
          questions: [
            mcq("Worst instruction block?", ["Never refund over £500 without approval", "Be a good bot ✨", "Cite retrieved policy before legal answers", "Call search before claiming a URL"], 1, "Sparkles are not brakes."),
            scenario(
              "Instructions say never email customers. The model still calls send_email.",
              "Tool is still attached.",
              ["Remove or gate the tool — policy without a gate is a wish", "Write a longer poem", "Raise temperature", "Add more tools"],
              0,
              "Tools are the real policy.",
            ),
            tf("If it is in the system prompt, the model cannot call a forbidden tool.", false, "Don't attach the tool, or wrap it in HITL."),
          ],
        },
        {
          key: "two-tools",
          title: "Mini-project: Choose between two tools",
          summary: "Search vs lookup. Schema is the fork.",
          kind: "project",
          minutes: 12,
          concept: { key: "two-tools", name: "Two-tool loop", axis: "execution" },
          teach: {
            title: "Descriptions decide",
            body: "If both tools say “get info”, the model flips a coin. Names and schemas must disagree clearly.",
          },
          questions: [
            challenge(
              "Two tools",
              "User: “What's the status of order 1842?” Tools: web_search(query), lookup_order(id).",
              [
                { question: "Which tool?", options: ["web_search for fun", "lookup_order with 1842", "neither — invent", "both in a loop forever"], answer: 1, explanation: "Internal id." },
                { question: "If lookup 404s?", options: ["Invent a shipped date", "Return the error, then maybe search help docs", "Crash silently", "Email the CEO"], answer: 1, explanation: "Observe." },
                { question: "Done when?", options: ["It sounds nice", "A final answer that cites the lookup payload", "Ten more searches", "A new model"], answer: 1, explanation: "Cite the tool." },
              ],
              "The right tool, then a stop.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "tools",
      title: "Tool Use",
      subtitle: "Function calling",
      missions: [
        {
          key: "schema",
          title: "Schema is the UX",
          summary: "search_customers(query: string), not do_stuff(x: any).",
          concept: { key: "schema", name: "Tool schema", axis: "execution" },
          teach: {
            title: "Describe like a teammate",
            body: "Types, required fields, enums. any is a trap. The model will stuff a novel into any.",
          },
          example: {
            title: "Bad vs good",
            body: "do_anything(payload: any) vs lookup_order(id: string). One is a loaded gun. One is a drawer.",
            callout: "Narrow tools are kinder.",
          },
          questions: [
            mcq("Worst tool schema?", ["lookup_order(id: string)", "do_anything(payload: any)", "get_weather(city: string)", "create_ticket(title: string)"], 1, "any is a trap."),
            match("Schema job.", [
              { left: "name", right: "What to call" },
              { left: "description", right: "When to call" },
              { left: "parameters", right: "What to pass" },
              { left: "required", right: "What must be present" },
            ], "UX for the model."),
            tf("If a tool fails, the agent should invent the rows.", false, "Return the error."),
            fill("A JSON shape that says which arguments a tool takes is a ___.", "schema", "The contract."),
          ],
        },
        {
          key: "errors-tools",
          title: "Hand the error back",
          summary: "404 is data. Don't launder it into a story.",
          concept: { key: "errors-tools", name: "Tool errors", axis: "problem" },
          teach: {
            title: "The observation is the truth",
            body: "If lookup_order returns 404, the next message is that payload, not “it's probably shipped.”",
          },
          example: {
            title: "Launder",
            body: "Tool: 404. Agent: “Your parcel arrives Friday.” That is a lie with a smile.",
            callout: "Errors are observations.",
          },
          questions: [
            scenario(
              "lookup_order 404. Agent says shipped.",
              "No second source.",
              ["Report not found; offer search or a human", "Keep the shipped story", "Raise temperature", "Delete logs"],
              0,
              "Don't launder.",
            ),
            identify(
              "Dangerous observation handling?",
              "catch (e) { return \"All good\"; }",
              ["Swallowing the error", "Returning e.message", "Retry with budget", "Escalate"],
              0,
              "Don't swallow.",
            ),
            mcq("Tool timeout. Best?", ["Invent", "Return timeout, retry with budget or escalate", "Loop forever", "Disable tools"], 1, "Budget."),
          ],
        },
        {
          key: "side-effects",
          title: "Some tools spend money",
          summary: "Read vs write is a cliff.",
          concept: { key: "side-effects", name: "Side effects", axis: "knowledge" },
          teach: {
            title: "Label the danger",
            body: "search is cheap. refund and send_email are cliffs. Cliffs wait for a person or a hard policy.",
          },
          questions: [
            match("Risk.", [
              { left: "search", right: "Read" },
              { left: "lookup_order", right: "Read" },
              { left: "refund", right: "Money" },
              { left: "send_email", right: "External speech" },
            ], "Label cliffs."),
            tf("Refunds over £500 should auto-fire if the model is “confident”.", false, "Money waits."),
            mcq("send_email without a draft preview?", ["Fine in prod", "A cliff — gate it", "Safer than search", "Required by RAG"], 1, "Speech is a side effect."),
          ],
        },
        {
          key: "boss-any",
          title: "Boss: The Any Tool",
          summary: "Prod has do_anything. You have one sitting to defuse it.",
          kind: "boss",
          minutes: 14,
          concept: { key: "boss-any", name: "Schema emergency", axis: "problem" },
          teach: {
            title: "Four faults",
            body: "any payload, swallowed errors, refund attached, no cap. Pull the wires in that order.",
          },
          questions: [
            challenge(
              "THE ANY TOOL",
              "do_anything(payload: any). catch { return \"ok\" }. refund attached. while(true) loop.",
              [
                { question: "Schema?", options: ["Keep any", "Split into named tools with types", "Add more any", "Hide the schema"], answer: 1, explanation: "Narrow." },
                { question: "Errors?", options: ["Keep swallowing", "Return the real observation", "Invent rows", "Mute logs"], answer: 1, explanation: "Truth." },
                { question: "Refund?", options: ["Leave it hot", "HITL over a threshold", "Always auto", "Tweet the CFO"], answer: 1, explanation: "Money waits." },
                { question: "Loop?", options: ["Infinite is fine", "Max calls + final answer", "Faster infinite", "Delete the model"], answer: 1, explanation: "Caps." },
              ],
              "Narrow, honest, gated, capped.",
              "hard",
              250,
            ),
          ],
        },
      ],
    },
    {
      key: "mem",
      title: "Memory",
      subtitle: "Context, state, persistence",
      missions: [
        {
          key: "windows",
          title: "Don't dump the universe",
          summary: "Working context vs stored prefs.",
          concept: { key: "windows", name: "Memory kinds", axis: "execution" },
          teach: {
            title: "Retrieve, don't paste",
            body: "Working context for the task. Persistent store for preferences. The live window is short-term.",
          },
          questions: [
            fill("The live window of the current task is ___-term memory.", "short", "Short-term / working.", ["working", "short-term"]),
            scenario(
              "User said “never call me on Fridays” last month. New session, agent calls.",
              "Fix?",
              ["Bigger model", "Persistent preference memory retrieved each session", "Apologise in the prompt forever", "Disable tools"],
              1,
              "Store it. Fetch it.",
            ),
            tf("Putting the entire wiki in the system prompt is production memory.", false, "That's a paste."),
            mcq("Best home for “never Fridays”?", ["A 40-page system prompt dump", "A preference store keyed on user id", "A tweet", "Temperature 0 only"], 1, "Keyed store."),
          ],
        },
        {
          key: "scratch",
          title: "Scratchpads are not secrets",
          summary: "State the agent can see vs state you must hide.",
          concept: { key: "scratch", name: "Scratch vs vault", axis: "problem" },
          teach: {
            title: "PII",
            body: "Card numbers do not belong in the prompt log. Working notes can. Redact before you persist.",
          },
          questions: [
            identify(
              "What must not sit in the prompt log?",
              "User pasted a PAN and a CVV into chat.",
              ["Raw card data", "Order id 1842", "City name", "A search query for docs"],
              0,
              "Redact.",
            ),
            mcq("Guardrail for PII in logs?", ["Print everything", "Redact before log/store", "Trust the model not to", "Disable all logs forever"], 1, "Redact."),
            tf("If the model saw it, you should store it forever in plaintext.", false, "Minimise."),
          ],
        },
        {
          key: "session",
          title: "A thread is a budget",
          summary: "Summarise, don't hoard.",
          concept: { key: "session", name: "Session budget", axis: "execution" },
          teach: {
            title: "Compress old turns",
            body: "A 90-turn thread with every tool dump will drown the next call. Summaries + pointers beat a novel.",
          },
          questions: [
            order("Long thread.", ["Keep recent turns raw", "Summarise the middle", "Store facts in memory", "Drop raw tool dumps"], "Compress."),
            scenario(
              "Context window full of old search JSON.",
              "User asks a new question.",
              ["Summarise and retrieve, don't paste the dump", "Add a bigger window and ignore it", "Delete the user", "Raise temperature"],
              0,
              "Budget the window.",
            ),
            fill("A compact recap of old turns is a ___.", "summary", "Compression.", ["summarise", "summarize"]),
          ],
        },
      ],
    },
    {
      key: "rag",
      title: "Knowledge",
      subtitle: "Retrieval, documents, search",
      missions: [
        {
          key: "retrieve",
          title: "Answer from the files",
          summary: "RAG is a tool, not a vibe.",
          concept: { key: "retrieve", name: "Retrieval", axis: "execution" },
          teach: {
            title: "Retrieve then generate",
            body: "Chunk. Embed. Search. Stuff only the hits. Cite. If it isn't in the hits, it isn't a cite.",
          },
          questions: [
            mcq("Agent cites a clause that isn't in the PDFs. Cause?", ["Need more temperature", "It hallucinated beyond retrieved chunks", "Chunk size 1M is safer", "Skip retrieval"], 1, "If it isn't in the hits, it isn't a cite."),
            tf("Putting the entire wiki in the system prompt is production RAG.", false, "That's a paste."),
            order("RAG turn.", ["Embed the question", "Search chunks", "Stuff hits", "Generate", "Cite"], "Retrieve first."),
            identify(
              "Fake cite?",
              "Answer quotes §12.4. Retrieved chunks are §3 and §8 only.",
              ["Hallucinated beyond hits", "Perfect RAG", "Need more temperature", "Skip retrieval next time"],
              0,
              "No hit, no cite.",
            ),
          ],
        },
        {
          key: "chunks",
          title: "Chunking is a design",
          summary: "Too big: mush. Too small: no sentence.",
          concept: { key: "chunks", name: "Chunking", axis: "problem" },
          teach: {
            title: "Overlap with a reason",
            body: "Policy docs want heading-aware chunks. A 1M-token chunk is a paste with extra steps.",
          },
          questions: [
            mcq("Worst default chunk?", ["Heading-aware ~500 tokens with overlap", "The entire wiki as one vector", "Sentence pairs for FAQs", "Section per policy"], 1, "One vector is a paste."),
            scenario(
              "Refund policy split mid-sentence across chunks. Agent cites half a rule.",
              "No overlap, naive split.",
              ["Overlap + split on headings", "Bigger model only", "Disable RAG", "Raise temperature"],
              0,
              "Respect structure.",
            ),
            tf("Bigger chunks are always more accurate.", false, "Mush hides the clause."),
          ],
        },
        {
          key: "cite",
          title: "Citations are the product",
          summary: "Show the chunk or don't claim it.",
          concept: { key: "cite", name: "Citations", axis: "execution" },
          teach: {
            title: "Fail closed on legal",
            body: "If retrieval is empty, say you don't know. A confident empty retrieve is a lawsuit in a nice font.",
          },
          questions: [
            scenario(
              "Legal question. Retrieval empty. Model still answers from training.",
              "High risk.",
              ["Refuse or escalate — no cite, no clause", "Answer anyway", "Invent a section number", "Raise temperature"],
              0,
              "Fail closed.",
            ),
            fill("Text returned from search to ground the answer is a ___.", "chunk", "A hit.", ["passage", "hit"]),
            mcq("User-facing legal answer without a source id?", ["Ship it", "Block or mark ungrounded", "Add sparkles", "More tools named any"], 1, "Ground or stop."),
          ],
        },
      ],
    },
    {
      key: "plan",
      title: "Planning",
      subtitle: "Decompose the job",
      missions: [
        {
          key: "list",
          title: "A plan is a list, not a novel",
          summary: "Steps you can check.",
          concept: { key: "list", name: "Planning", axis: "problem" },
          teach: {
            title: "Verify is not optional",
            body: "Clarify. Search. Read. Outline. Draft. Verify numbers against sources.",
          },
          questions: [
            order("The report.", ["Clarify the question", "Search", "Read sources", "Outline", "Draft", "Verify"], "Verify is not optional."),
            mcq("Skipping verify on revenue figures?", ["Saves time", "Ships fiction", "Required by RAG", "A style choice"], 1, "Check the number."),
            tf("A 12-page plan with no tools is better than a 5-step plan that calls search.", false, "Doing beats decorating."),
          ],
        },
        {
          key: "clarify",
          title: "Ask before you wander",
          summary: "Ambiguity is a tool call to the user.",
          concept: { key: "clarify", name: "Clarify", axis: "execution" },
          teach: {
            title: "One question",
            body: "“Research the company” needs which company and what decision. Don't spend ten searches guessing.",
          },
          questions: [
            scenario(
              "User: “write the report.” No company, no audience.",
              "You have search.",
              ["Ask which company and who it's for", "Search random firms", "Invent a company", "Refund"],
              0,
              "Clarify.",
            ),
            identify(
              "Missing first step?",
              "Immediately 8 web searches for “best company.”",
              ["No clarify on target", "Need more searches", "Need any-tool", "Need a poem"],
              0,
              "Target first.",
            ),
            fill("A checkable breakdown of the job is a ___.", "plan", "A list."),
          ],
        },
        {
          key: "wf",
          title: "When tools fail",
          summary: "Retry with a budget. Then a human.",
          concept: { key: "wf", name: "Control flow", axis: "execution" },
          teach: {
            title: "Budgets",
            body: "Max tool calls. Exponential backoff. Escalation path. Branches, loops, retry — named, not implied.",
          },
          questions: [
            mcq("Search 429s three times. Next?", ["Infinite retry", "Backoff, then escalate", "Invent results", "Crash the process quietly"], 1, "Budgeted retries."),
            tf("An agent should loop until the heat death of the universe.", false, "Hard caps."),
            match("Move.", [
              { left: "Retry", right: "Transient 429/5xx" },
              { left: "Escalate", right: "Budget spent" },
              { left: "Fail closed", right: "Empty retrieve on legal" },
              { left: "HITL", right: "Money / email" },
            ], "Named exits."),
          ],
        },
      ],
    },
    {
      key: "multi",
      title: "Multi-Agent",
      subtitle: "Researcher, writer, reviewer",
      missions: [
        {
          key: "roles",
          title: "They cooperate",
          summary: "Split roles, not egos.",
          concept: { key: "roles", name: "Multi-agent", axis: "execution" },
          teach: {
            title: "Handoffs with artefacts",
            body: "Researcher returns sources. Writer drafts. Reviewer checks claims against sources.",
          },
          questions: [
            match("Role.", [
              { left: "Researcher", right: "Find sources" },
              { left: "Writer", right: "Draft from sources" },
              { left: "Reviewer", right: "Reject unsupported claims" },
              { left: "Router", right: "Send work to the right role" },
            ], "Artefacts between them."),
            mcq("Reviewer with no sources?", ["Always approve", "Fail closed", "Write more adjectives", "Merge agents into one blob"], 1, "No evidence, no pass."),
            tf("More agents always means more truth.", false, "More handoffs can mean more loss."),
            fill("A packet passed from researcher to writer is an ___.", "artefact", "A thing, not a vibe.", ["artifact"]),
          ],
        },
        {
          key: "router",
          title: "Don't let one blob do legal",
          summary: "Classify, then specialised tools.",
          concept: { key: "router", name: "Routing", axis: "problem" },
          teach: {
            title: "Split risk",
            body: "Password reset, refund, legal — different tools, different brakes. One agent with any-tools is a blender.",
          },
          questions: [
            scenario(
              "Tickets: password reset, refund, legal. One agent, any-tools, always refunds.",
              "Fix?",
              ["Classify, then specialised tools per intent", "Always refund faster", "Ignore policy", "Bigger model only"],
              0,
              "Split risk.",
            ),
            mcq("Legal ticket with empty retrieve?", ["Draft a clever clause", "Fail closed / human", "Auto-refund", "Tweet counsel"], 1, "No cite, no clause."),
            identify(
              "Router missed?",
              "Intent: legal. Path: refund tool.",
              ["Wrong specialised path", "Need more agents until it works", "Need sparkles", "Need any"],
              0,
              "Intent must match the door.",
            ),
          ],
        },
        {
          key: "human",
          title: "Dangerous tools wait",
          summary: "Email, pay, delete — stop.",
          concept: { key: "human", name: "Approvals", axis: "knowledge" },
          teach: {
            title: "A gate is a tool that returns to a person",
            body: "Propose. Show diff. Wait. Resume with a token. Confidence is not a signature.",
          },
          questions: [
            tf("Refunds over £500 should auto-fire if the model is “confident”.", false, "Money waits."),
            fill("A step that pauses for a person is a human-in-the-___.", "loop", "HITL.", ["loop"]),
            order("Refund over threshold.", ["Draft the refund", "Show diff to a human", "Wait for token", "Execute or reject"], "Propose, then wait."),
            mcq("HITL token stolen?", ["Treat as signed forever", "Short-lived, bound to the action", "Print it in logs", "Email it to the user thread"], 1, "Bind the grant."),
          ],
        },
      ],
    },
    {
      key: "rel",
      title: "Reliability",
      subtitle: "Hallucination, evals, guardrails",
      missions: [
        {
          key: "evals",
          title: "Measure it or it didn't happen",
          summary: "Failure modes you can test.",
          concept: { key: "evals", name: "Evals", axis: "problem" },
          teach: {
            title: "Golden tasks",
            body: "A set of prompts with expected tools and answers. Run on every change. Politeness is not an eval.",
          },
          questions: [
            scenario(
              "The agent books the wrong calendar. Evals were “does it reply politely?”",
              "Missing eval?",
              ["Tone only", "Did it call the correct tool with the correct slot", "Emoji count", "Latency to first token only"],
              1,
              "Eval the action.",
            ),
            mcq("Guardrail for PII in logs?", ["Print everything", "Redact before log/store", "Trust the model not to", "Disable logs"], 1, "Redact."),
            tf("A bigger model removes the need for evals.", false, "Evals catch regressions."),
            fill("A frozen prompt with an expected tool call is a ___ task.", "golden", "The suite.", ["eval"]),
          ],
        },
        {
          key: "guards",
          title: "Rails before charm",
          summary: "Allowlists, regex, policy checks.",
          concept: { key: "guards", name: "Guardrails", axis: "execution" },
          teach: {
            title: "Deterministic where you can",
            body: "Don't ask the model if a URL is on the allowlist. Check the allowlist. Then let it talk.",
          },
          questions: [
            identify(
              "Should this be a model call?",
              "Is refund_gbp <= 500 ?",
              ["A deterministic check", "A 70B model", "A poem", "Temperature 2"],
              0,
              "Math is a rail.",
            ),
            mcq("Outbound URL not on allowlist?", ["Let it fetch", "Block", "Ask the model if it feels safe", "Log the secret"], 1, "Allowlist."),
            order("Change to tools.", ["Update golden evals", "Run the suite", "Ship if pass", "Watch traces"], "Evals gate ship."),
          ],
        },
        {
          key: "traces",
          title: "If you can't see the tools, you can't debug",
          summary: "Traces are the black box recorder.",
          concept: { key: "traces", name: "Tracing", axis: "knowledge" },
          teach: {
            title: "Every call, redacted",
            body: "Tool name, args (scrubbed), latency, observation. Without traces, “it hallucinated” is astrology.",
          },
          questions: [
            mcq("Prod incident. No traces. You…", ["Guess the prompt", "Cannot prove which tool fired", "Buy a bigger GPU", "Raise temperature"], 1, "Record the act."),
            tf("Traces should include raw PANs for “completeness.”", false, "Redact."),
            scenario(
              "User got a wrong refund. Trace shows lookup_order never ran.",
              "Writer agent drafted from memory.",
              ["Fix routing / require lookup before refund draft", "Apologise in the prompt forever", "Disable evals", "Add sparkles"],
              0,
              "The trace named the bug.",
            ),
          ],
        },
      ],
    },
    {
      key: "final",
      title: "Final Boss: An agent company",
      subtitle: "A business workflow, executed with brakes",
      isBoss: true,
      missions: [
        {
          key: "final",
          title: "BUILD AN AGENT COMPANY",
          summary: "Intake to done. Retrieve, draft, gate, log, eval.",
          kind: "boss",
          minutes: 18,
          concept: { key: "final", name: "Agent system", axis: "problem" },
          teach: {
            title: "The brief",
            body: "Support tickets: retrieve policy, draft, refund tool behind approval, log, eval. Act, but with brakes.",
          },
          questions: [
            challenge(
              "AGENT COMPANY",
              "Tickets: password reset, refund, legal. Different risk.",
              [
                { question: "Router?", options: ["One agent does all with any-tools", "Classify, then specialised tools per intent", "Always refund", "Ignore policy"], answer: 1, explanation: "Split risk." },
                { question: "Refunds?", options: ["Auto", "Draft + human approval over a threshold", "Tweet the CFO", "Delete the ticket"], answer: 1, explanation: "HITL for money." },
                { question: "Knowledge?", options: ["Paste the wiki", "Retrieve, cite, fail closed if empty on legal", "Invent clauses", "Skip search"], answer: 1, explanation: "RAG with brakes." },
                { question: "Ship bar?", options: ["It sounds nice", "Evals on tool choice + policy cites + no PII leaks", "Bigger model only", "More agents until it works"], answer: 1, explanation: "Measure the job." },
              ],
              "Act, but with brakes.",
              "hard",
              1000,
            ),
          ],
        },
      ],
    },
  ],
});
