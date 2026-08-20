import { buildWorld, challenge, fill, identify, match, mcq, order, scenario, tf } from "../factory";

export const tableauSkill = buildWorld({
  id: "tableau",
  name: "Tableau",
  fantasy: "THE DATA DETECTIVE",
  tagline: "See it. Prove it. Present it.",
  description: "Investigation and storytelling in Tableau — the right mark, the right filter, the anomaly.",
  category: "Data Worlds",
  difficulty: "intermediate",
  hours: 12,
  icon: "search",
  trial: {
    key: "trial",
    title: "Something here doesn't look right",
    summary: "A 3-minute case file. Profit is celebrating. Cash is not.",
    minutes: 4,
    concept: { key: "trial", name: "Visual instincts", axis: "problem" },
    teach: {
      title: "The brief",
      body: "Profit is up. Cash is down. A dashboard says everything is fine. You are not here to decorate. You are here to find the lie.",
      bullets: ["A green KPI can hide a dying product", "Discounts can inflate margin theatre", "The first visual should test a relationship"],
    },
    example: {
      title: "The contradiction",
      body: "Profit +12%. Units −20%. Discount rate doubled. Cash conversion slipped two weeks.",
      callout: "If units fell and profit rose, someone is selling cheaper volume — or the grain is wrong.",
    },
    questions: [
      scenario(
        "Profit rose while units fell 20% and discounts spiked. Best first visual?",
        "Finance celebrates margin. Ops is screaming about volume.",
        ["A 3D pie of brand colours", "Scatter of discount vs profit by product", "A word cloud of SKUs", "A map of the office"],
        1,
        "You need the relationship between discount and profit, not a celebration chart.",
        "hard",
      ),
      mcq(
        "Cash is down while reported profit is up. What do you distrust first?",
        ["The office plants", "Timing: revenue booked, cash not collected", "The CEO's tie", "The colour legend"],
        1,
        "Profit can book before cash arrives. Accrual vs cash is the usual split.",
        "medium",
      ),
      tf("A dashboard with every number in green cannot be hiding a problem.", false, "Green totals hide red parts. Always cut the number."),
      identify(
        "Which view actually tests the rumour?",
        "Rumour: “luxury SKUs saved the quarter.”",
        ["A pie of logo colours", "Profit and units by product, sorted, with discount on colour", "Employee headcount", "A 3D globe"],
        1,
        "Name the SKUs. Put discount on colour. Then argue.",
      ),
    ],
  },
  levels: [
    {
      key: "see",
      title: "See the Data",
      subtitle: "Dimensions, measures, marks, shelves",
      missions: [
        {
          key: "pills",
          title: "Blue pills, green pills",
          summary: "Dimensions cut. Measures add.",
          concept: { key: "pills", name: "Dimensions and measures", axis: "knowledge" },
          teach: {
            title: "Two kinds of field",
            body: "A dimension is a label you group by: Region, Product, Date. A measure is a number you aggregate: Sales, Profit, Quantity.",
            bullets: ["Discrete dimensions make headers", "Continuous measures make axes", "Dates can be both a cut and a timeline"],
          },
          example: {
            title: "Sales extract",
            body: "OrderID, Date, Region, Product, Sales, Profit. Product is a dimension. Sales is a measure.",
            callout: "If you SUM Product, you picked the wrong pill.",
          },
          questions: [
            match("Match the field.", [
              { left: "Region", right: "Dimension" },
              { left: "Sales", right: "Measure" },
              { left: "Order date", right: "Time dimension" },
              { left: "Profit", right: "Measure" },
            ], "Slice with dimensions. Add with measures."),
            mcq("Which field belongs on Colour to compare regions?", ["Sales", "Region", "Row number", "File name"], 1, "Colour is an encoding of a category or a measure — Region is the cut."),
            tf("Every green pill is a dimension.", false, "Green is often continuous. Blue is often discrete. Type ≠ colour of the pill always, but the job is dim vs measure."),
            fill("A field you group by but never sum is a ___.", "dimension", "Dimensions categorise."),
          ],
        },
        {
          key: "marks",
          title: "Marks and shelves",
          summary: "What Tableau actually draws.",
          concept: { key: "marks", name: "Marks and shelves", axis: "knowledge" },
          teach: {
            title: "Pills on shelves",
            body: "Rows and Columns build the skeleton. The Marks card chooses the shape: bar, line, circle, text. Colour, Size, Detail, Tooltip are encodings.",
          },
          example: {
            title: "A sales line",
            body: "MONTH(Order Date) on Columns. SUM(Sales) on Rows. Mark type: Line. Region on Colour.",
            callout: "The mark is the sentence. The shelves are the grammar.",
          },
          questions: [
            match("Put it on the right job.", [
              { left: "Region", right: "Dimension / Colour" },
              { left: "Sales", right: "Measure on Rows" },
              { left: "Bar", right: "Mark type" },
              { left: "Profit on colour", right: "Encoding" },
            ], "Field type + mark + encoding."),
            mcq("Sales by month. Default mark?", ["Shape of a cat", "Line", "Packed bubbles of 400 SKUs", "A map of the kitchen"], 1, "Time × value wants a line."),
            tf("Putting every field on Text makes a better chart.", false, "Text dumps. Marks argue."),
            identify(
              "What is missing?",
              "Columns: MONTH(Order Date)\nRows: (empty)\nMarks: Line",
              ["A measure on Rows", "A 3D pie", "More fonts", "A second workbook"],
              0,
              "A line needs a value axis.",
            ),
          ],
        },
        {
          key: "grain",
          title: "One row is one event",
          summary: "Know the grain before you SUM.",
          concept: { key: "grain", name: "Viz grain", axis: "problem" },
          teach: {
            title: "Marks are rows until you aggregate",
            body: "If the extract is one row per order line, SUM(Sales) is honest. If you join returns and duplicate lines, SUM lies.",
          },
          example: {
            title: "Twelve months, twelve marks",
            body: "MONTH(Order Date) on Columns, SUM(Sales) on Rows → 12 marks. Add Product to Detail → marks explode to month × product.",
            callout: "Detail is grain. Use it on purpose.",
          },
          questions: [
            scenario(
              "Sales doubled after you added a returns sheet joined on OrderID. Multiple return lines per order.",
              "What happened to the grain?",
              ["Tableau rounded up", "Each sale fanned out across return rows", "You need more colours", "Extracts cannot sum"],
              1,
              "Duplicate fact rows inflate SUM.",
            ),
            mcq("A view shows 12 marks for 12 months. Grain of the view?", ["One mark per day", "One mark per month", "One mark per order", "One mark per pixel"], 1, "The pills on Rows/Columns set the viz grain."),
            tf("Detail on the Marks card can split one bar into many marks.", true, "Detail adds grain. Use it on purpose."),
          ],
        },
        {
          key: "first-viz",
          title: "Mini-project: First case board",
          summary: "One KPI, one trend, one breakdown.",
          kind: "project",
          minutes: 12,
          concept: { key: "first-viz", name: "First viz", axis: "execution" },
          teach: {
            title: "v0.1 is a case file",
            body: "A card for Sales, a monthly line, a bar of Region. If a manager can ask “how are we doing?” you shipped.",
          },
          questions: [
            challenge(
              "Assemble the first board",
              "Clean Superstore-style extract. Standup in 20 minutes.",
              [
                { question: "Which number belongs on the card?", options: ["Row count of the extract", "SUM(Sales)", "File name", "Your username"], answer: 1, explanation: "Sales is the business number." },
                { question: "What sits beside it?", options: ["A 40-slice pie", "Monthly Sales line", "A photo of the warehouse", "Raw JSON"], answer: 1, explanation: "Trend explains the card." },
                { question: "How do they cut the view?", options: ["Email you", "Region on a filter / Colour", "Hide the sheet", "Export to Word"], answer: 1, explanation: "A filter they can use." },
                { question: "Done when?", options: ["You used 12 mark types", "Card, trend, and a regional cut all agree", "The theme is purple", "You added a globe"], answer: 1, explanation: "Agreement is the product." },
              ],
              "Card + trend + cut is a real v0.1.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "chart",
      title: "Choose the Right Chart",
      subtitle: "The question picks the mark",
      missions: [
        {
          key: "jobs",
          title: "Compare, trend, distribute",
          summary: "Three jobs. Three marks.",
          concept: { key: "choose", name: "Chart literacy", axis: "execution" },
          teach: {
            title: "Three jobs",
            body: "Compare categories → bar. Show trend → line. Show distribution → histogram. Parts of a whole with few slices can be a bar of share — not a 30-slice pie.",
          },
          example: {
            title: "The question is the spec",
            body: "“Which region lost profit?” → bar of Profit by Region, sorted. “When did it fall?” → line by month.",
            callout: "If you start with a chart type, you are decorating.",
          },
          questions: [
            match("Business question → visual", [
              { left: "Compare categories", right: "Bar" },
              { left: "Show trend", right: "Line" },
              { left: "Show distribution", right: "Histogram" },
              { left: "Few-slice share", right: "Bar of share, not a 30-slice pie" },
            ], "Pies are a trap."),
            tf("A 40-slice pie is a good comparison visual.", false, "Bars compare. Pies collapse."),
            mcq("Profit by 18 sub-categories. Best?", ["Sorted bar", "Exploding 3D pie", "Packed bubbles of every SKU", "A treemap of 400 colours"], 0, "Sort the bars. Read the bottom."),
            fill("Change over time belongs on a ___.", "line", "Time series → line.", ["line chart"]),
          ],
        },
        {
          key: "scatter",
          title: "Relationships, not galleries",
          summary: "When two measures argue.",
          concept: { key: "scatter", name: "Scatter and dual axis", axis: "execution" },
          teach: {
            title: "Two numbers, one mark",
            body: "Scatter: Sales vs Profit, one mark per product. Dual axis: two measures that share a time grain — used sparingly, labelled, same story.",
          },
          example: {
            title: "Discount vs profit",
            body: "Discount on Columns, Profit on Rows, Product on Detail, Quantity on Size.",
            callout: "The cluster in the bottom-right is your case.",
          },
          questions: [
            mcq("You suspect high discount kills profit. Visual?", ["Word cloud", "Scatter Discount vs Profit", "A map of HQ", "A 3D pie"], 1, "Two measures, one relationship."),
            tf("A dual axis of nine unrelated measures is executive-ready.", false, "Dual axis is a scalpel, not a junk drawer."),
            identify(
              "What is this view doing?",
              "Columns: SUM(Discount)\nRows: SUM(Profit)\nDetail: Product\nMark: Circle",
              ["A time series", "A scatter of products", "A filled map", "A Gantt"],
              1,
              "Two continuous axes + Detail = scatter grain.",
            ),
          ],
        },
        {
          key: "sort",
          title: "Sort is an argument",
          summary: "Don't leave alphabetical as the story.",
          concept: { key: "sort", name: "Sorting", axis: "execution" },
          teach: {
            title: "Order is meaning",
            body: "Sort bars by the measure you care about. Alphabetical Region is a filing cabinet. Descending Profit is a briefing.",
          },
          example: {
            title: "Worst first",
            body: "Profit by Sub-Category, sort ascending. The first two bars are the dogs. Alphabetical would hide them in the middle.",
            callout: "Sort is the argument.",
          },
          questions: [
            mcq("Bottom performers for a cut list. Sort?", ["A–Z Product", "Ascending Profit", "Random", "By colour of the logo"], 1, "Worst first if you are hunting dogs."),
            tf("Tableau's default alphabetical sort is usually the insight.", false, "Default is convenience. Insight is a chosen sort."),
            order("Build a comparison bar.", ["Put the dimension on Rows", "Put the measure on Columns", "Switch to Bar", "Sort by the measure"], "Skeleton, then argument."),
          ],
        },
        {
          key: "chart-kit",
          title: "Mini-project: The question kit",
          summary: "Four questions. Four views. No extras.",
          kind: "project",
          minutes: 12,
          concept: { key: "chart-kit", name: "Chart kit", axis: "execution" },
          teach: {
            title: "A kit, not a museum",
            body: "Compare, trend, relate, locate the worst. If a sheet does not answer a sentence, cut it.",
          },
          questions: [
            challenge(
              "Build the kit",
              "Questions: Who is worst? When did it move? Is discount the driver? Which region?",
              [
                { question: "Who is worst?", options: ["40-slice pie", "Sorted Profit bar", "A globe", "Employee birthdays"], answer: 1, explanation: "Sorted bars name the dogs." },
                { question: "When did it move?", options: ["Word cloud", "Monthly line", "Packed bubbles", "A heatmap of fonts"], answer: 1, explanation: "Time wants a line." },
                { question: "Is discount the driver?", options: ["Scatter Discount vs Profit", "A 3D pie", "More KPI cards of row count", "A map of the car park"], answer: 0, explanation: "Relationship visual." },
                { question: "Ship when?", options: ["12 mark types", "Each sheet answers one sentence", "Purple theme", "Every field on Tooltip"], answer: 1, explanation: "One question per sheet." },
              ],
              "Four questions. Four views.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "filter",
      title: "Filter the Truth",
      subtitle: "Filters, groups, sets, sorting",
      missions: [
        {
          key: "filters",
          title: "Hide vs keep",
          summary: "Context, dimension, measure filters.",
          concept: { key: "filters", name: "Filter order", axis: "knowledge" },
          teach: {
            title: "Filters have a sequence",
            body: "Extract → data source → context → dimension → measure. Context filters compute first and can change “Top N”. Put the expensive cut in context when Top N is lying.",
          },
          questions: [
            mcq("Top 10 products by Sales, then filter to West — West looks empty. Likely?", ["Tableau is broken", "Top 10 was computed before the region cut", "Need more pies", "Dates are illegal"], 1, "Add Region to context, then Top N."),
            tf("Every field deserves a quick filter on the dashboard.", false, "Filters are expensive. Only the cuts people use."),
            match("Filter job.", [
              { left: "Keep West only", right: "Dimension filter" },
              { left: "Sales > 0", right: "Measure filter" },
              { left: "Force Top N after Region", right: "Context" },
              { left: "Hide a noisy SKU once", right: "Exclude" },
            ], "Name the lever."),
          ],
        },
        {
          key: "groups",
          title: "Group the noise",
          summary: "Other is a decision.",
          concept: { key: "groups", name: "Groups", axis: "execution" },
          teach: {
            title: "Collapse to argue",
            body: "Group 40 tiny states into “Other” when the story is the big four. Groups are manual membership. Hierarchies are drill paths.",
          },
          questions: [
            mcq("18 tiny sub-categories drown the bar. Move?", ["Delete the data", "Group the tail into Other", "3D pie", "Hide the axis"], 1, "Other is honest if you say what it is."),
            tf("A group updates automatically when new members appear.", false, "Groups are sticky lists. Sets and calculated fields can be dynamic."),
          ],
        },
        {
          key: "bottom",
          title: "Bottom 10%",
          summary: "Find the customers who drag you.",
          concept: { key: "sets", name: "Sets and filters", axis: "execution" },
          teach: {
            title: "Sets are membership",
            body: "A set is in/out. Filters hide. Combined sets let you ask “bottom profit AND high sales” — volume that loses money.",
          },
          questions: [
            mcq("Bottom 10% of customers by profit. Best?", ["A set by profit percentile", "Hide labels", "Sort randomly", "Exclude all"], 0, "A set is reusable membership."),
            fill("A reusable in/out membership of marks is a ___.", "set", "Sets."),
            scenario(
              "High-sales customers with negative profit. You need them on every sheet.",
              "How?",
              ["Recreate a filter on each sheet by hand", "A set, then use it as a filter / colour", "Print and highlight", "Export to Paint"],
              1,
              "Sets travel. Ad-hoc filters do not.",
            ),
          ],
        },
        {
          key: "filter-boss",
          title: "Boss: The Top 10 that lies",
          summary: "West is empty. The filter stack is the suspect.",
          kind: "boss",
          minutes: 12,
          concept: { key: "filter-boss", name: "Filter traps", axis: "problem" },
          teach: {
            title: "Order of operations",
            body: "Top N, context, and table calcs do not all see the same world. Prove it with a simple count of marks.",
          },
          questions: [
            challenge(
              "THE LYING TOP 10",
              "National Top 10 products, then a West filter. West shows two bars. Ops swears West sells all ten.",
              [
                { question: "What computed first?", options: ["West, then Top 10", "National Top 10, then West kept the survivors", "A random sample", "The colour legend"], answer: 1, explanation: "Dimension Top N before the region cut." },
                { question: "Fix?", options: ["Add Region to context, then Top N", "Delete West", "More pies", "Hide the filter"], answer: 0, explanation: "Context reorders the stack." },
                { question: "How do you prove it?", options: ["Count marks before and after context", "Change the theme", "Add a globe", "Email IT"], answer: 0, explanation: "Mark count is the lie detector." },
                { question: "Ship when?", options: ["The bars look pretty", "West Top 10 matches a filtered extract check", "You used 12 filters", "The CEO likes teal"], answer: 1, explanation: "Reconcile against a known cut." },
              ],
              "Context, then Top N, then prove with counts.",
              "hard",
              250,
            ),
          ],
        },
      ],
    },
    {
      key: "calc",
      title: "Calculate",
      subtitle: "Calculated fields, aggregations, table calcs",
      missions: [
        {
          key: "rowcalc",
          title: "Row-level vs aggregate",
          summary: "Profit Ratio is not an average of ratios.",
          concept: { key: "calcs", name: "Calculations", axis: "execution" },
          teach: {
            title: "Row vs table",
            body: "Row-level: [Profit]/[Sales] on each line. Aggregate: SUM([Profit])/SUM([Sales]). Table calc: percent of total along a pane. LOD: FIXED grain that ignores some filters.",
          },
          questions: [
            mcq("Percent of total sales by region is usually a…", ["Table calculation or LOD", "Extract refresh", "Colour legend", "Join key"], 0, "It is relative to a partition."),
            tf("SUM(Profit)/SUM(Sales) equals SUM(Profit/Sales) always.", false, "Ratios of sums ≠ sum of ratios."),
            fill("A calculation that runs after the viz is drawn is a ___ calc.", "table", "Table calculations see the pane.", ["table calculation"]),
          ],
        },
        {
          key: "lod",
          title: "Pin the grain",
          summary: "FIXED, INCLUDE, EXCLUDE.",
          concept: { key: "lod", name: "LOD expressions", axis: "execution" },
          teach: {
            title: "LOD is a grain lock",
            body: "{ FIXED [Customer] : SUM([Sales]) } is customer lifetime sales even if the view is by month. INCLUDE adds grain. EXCLUDE removes it.",
          },
          questions: [
            identify(
              "What grain is this?",
              "{ FIXED [Customer ID] : SUM([Sales]) }",
              ["Sales per mark on the view", "Sales per customer, ignoring view grain", "A join key", "An extract filter"],
              1,
              "FIXED locks to Customer.",
            ),
            mcq("You need average order value at customer grain on a monthly view. Instinct?", ["A pie", "LOD or table calc with the right partition", "Hide months", "Duplicate the extract 12 times"], 1, "The view grain is month. The question grain is customer."),
            tf("EXCLUDE always ignores every filter on the sheet.", false, "Dimension filters still apply unless you also play with context / FIXED + INCLUDE patterns carefully."),
          ],
        },
        {
          key: "tablecalc",
          title: "Along the pane",
          summary: "Percent of total, running sum, rank.",
          concept: { key: "tablecalc", name: "Table calculations", axis: "execution" },
          teach: {
            title: "Compute using",
            body: "Percent of total Table (across) is not Pane (down). Rank of Sales Compute using Pane (down) ranks inside each year, not globally.",
          },
          questions: [
            order("Build % of total by Region.", ["Put Region on Rows", "SUM(Sales) on Text/Columns", "Add a table calc % of total", "Set compute using Table Down"], "Draw, then relativise."),
            scenario(
              "Each year should rank products 1–10. Rank is 1–120 across all years.",
              "Fix?",
              ["Compute using Pane (down) / restart every Year", "Delete years", "Use a pie", "Change the font"],
              0,
              "Partition is Year. Address is Product.",
            ),
          ],
        },
        {
          key: "calc-pack",
          title: "Mini-project: The ratio pack",
          summary: "Profit ratio, % of total, YoY, rank.",
          kind: "project",
          minutes: 12,
          concept: { key: "calc-pack", name: "Calc pack", axis: "execution" },
          teach: {
            title: "Four fields, one truth",
            body: "If YoY ignores the date pill, it is a costume. Check one known month against Excel.",
          },
          questions: [
            challenge(
              "The ratio pack",
              "Need Profit Ratio, Region % of total, monthly YoY, rank inside year.",
              [
                { question: "Profit Ratio?", options: ["AVG of row ratios only", "SUM(Profit)/SUM(Sales)", "Profit minus Sales", "Row count"], answer: 1, explanation: "Ratio of sums." },
                { question: "% of total?", options: ["A colour legend", "Table calc or LOD at Region", "A join", "A map of HQ"], answer: 1, explanation: "Relative to a partition." },
                { question: "Rank inside year?", options: ["Global rank of 120", "Restart every Year / pane", "Alphabetical", "Random"], answer: 1, explanation: "Compute using the pane." },
              ],
              "Aggregate, then relative, then rank.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "join",
      title: "Connect Data",
      subtitle: "Joins, relationships, sources",
      missions: [
        {
          key: "relns",
          title: "Relate, don't mash",
          summary: "Relationships vs joins.",
          concept: { key: "relns", name: "Relationships", axis: "knowledge" },
          teach: {
            title: "Noodle vs flatten",
            body: "Relationships keep tables at their grain and query what the viz needs. Joins flatten now and can duplicate measures. Use a join when you truly need one physical table.",
          },
          questions: [
            match("Tool.", [
              { left: "Keep grains separate", right: "Relationship" },
              { left: "One physical table now", right: "Join" },
              { left: "Stack months of the same shape", right: "Union" },
              { left: "A second database", right: "New connection / blend with care" },
            ], "Pick the glue."),
            tf("A left join never duplicates rows.", false, "One-to-many still fans out the left side."),
            mcq("Orders to Returns on OrderID, many return lines. Risk?", ["Pretty maps", "Fan-out of Sales", "Faster extracts always", "Automatic profit"], 1, "Each sale matches many returns."),
          ],
        },
        {
          key: "union",
          title: "Stack the months",
          summary: "Unions and mismatched columns.",
          concept: { key: "union", name: "Unions", axis: "execution" },
          teach: {
            title: "Same shape, stacked",
            body: "Union January and February when columns match. A “Sales_Jan” vs “Amount” mismatch creates nulls and a lying total.",
          },
          questions: [
            identify(
              "What went wrong?",
              "Union: Jan has Sales. Feb has Amount. View SUM(Sales) is half.",
              ["February landed in another field", "Tableau cannot union", "Need a pie", "Dates are illegal"],
              0,
              "Rename to one measure, then union.",
            ),
            tf("Unions are for unrelated tables with different grains.", false, "Unions stack the same grain. Joins/relationships combine different grains."),
          ],
        },
        {
          key: "blend",
          title: "Two sources, one view",
          summary: "Blending is a left join in disguise.",
          concept: { key: "blend", name: "Blending", axis: "problem" },
          teach: {
            title: "Primary drives the marks",
            body: "The first field you use sets the primary source. Secondary measures aggregate at the blend link. Asterisks mean the link is not unique.",
          },
          questions: [
            scenario(
              "Secondary SUM(Target) shows * on several regions.",
              "Meaning?",
              ["Tableau is festive", "The blend key is not unique on the secondary", "You need more colours", "Extracts expired"],
              1,
              "Fix the link grain or aggregate the secondary first.",
            ),
            mcq("When do you blend instead of relate?", ["Always", "Truly different connections you cannot model together yet", "Never use filters", "To get 3D"], 1, "Blending is a last resort, not a lifestyle."),
          ],
        },
        {
          key: "mismatch",
          title: "Boss: The numbers don't match",
          summary: "Finance is 1.0. Your dashboard is 1.8.",
          kind: "boss",
          minutes: 14,
          concept: { key: "join", name: "Join errors", axis: "problem" },
          teach: {
            title: "Fan-out returns",
            body: "A one-to-many join without grain control duplicates measures. Count rows before you trust SUM.",
          },
          questions: [
            challenge(
              "THE MISMATCH",
              "Sales doubled after adding a returns table joined on OrderID (multiple return lines).",
              [
                { question: "Cause?", options: ["Tableau is rounding", "Join fan-out", "Need more colours", "Extract is too small"], answer: 1, explanation: "Duplicate fact rows inflate SUM." },
                { question: "First check?", options: ["Change the theme", "Row count vs known order lines", "Add a globe", "Hide Returns"], answer: 1, explanation: "Grain first." },
                { question: "Fix pattern?", options: ["Join anyway and divide by 2 forever", "Aggregate returns to OrderID first, or use a relationship", "Delete Finance", "Union Finance into Returns"], answer: 1, explanation: "Match grains, then glue." },
                { question: "Done when?", options: ["It looks busy", "SUM(Sales) reconciles to Finance on a known month", "12 joins", "Purple"], answer: 1, explanation: "Reconcile a known total." },
              ],
              "Count rows. Then fix the glue.",
              "hard",
              250,
            ),
          ],
        },
      ],
    },
    {
      key: "interactive",
      title: "Interactive Experiences",
      subtitle: "Actions, drilldowns, tooltips, nav",
      missions: [
        {
          key: "actions",
          title: "Clicks are questions",
          summary: "Filter, highlight, URL, go-to-sheet.",
          concept: { key: "actions", name: "Dashboard actions", axis: "execution" },
          teach: {
            title: "Select a region, the page answers",
            body: "Filter actions pass values. Highlight keeps context. Go to sheet is a drill. URL is an escape hatch, not the product.",
          },
          questions: [
            match("Action.", [
              { left: "Click region, other charts cut", right: "Filter" },
              { left: "Click region, others fade", right: "Highlight" },
              { left: "Click KPI, open detail sheet", right: "Go to sheet" },
              { left: "Click ID, open CRM", right: "URL" },
            ], "See → click → understand."),
            tf("A tooltip should dump every field in the data source.", false, "Tooltips are sentences."),
          ],
        },
        {
          key: "tooltip",
          title: "Write the hover",
          summary: "A sentence, not a dump.",
          concept: { key: "tooltip", name: "Tooltips", axis: "problem" },
          teach: {
            title: "Hover is a briefing",
            body: "Name the mark. Give the number. Give the comparison. Stop.",
          },
          questions: [
            mcq("Best tooltip?", ["All 40 fields", "West · Sales £1.2M · −8% vs last year", "lorem", "The SQL"], 1, "A sentence."),
            fill("A click that opens another sheet is a ___ action.", "go to sheet", "Navigation.", ["goto", "go-to-sheet", "filter"]),
          ],
        },
        {
          key: "layout",
          title: "Layout is the product",
          summary: "Containers, padding, one screen.",
          concept: { key: "layout", name: "Dashboard layout", axis: "execution" },
          teach: {
            title: "F-pattern",
            body: "KPIs top-left. Trend across. Breakdown below. Filters at the edge. If they scroll to find Profit, you failed.",
          },
          questions: [
            order("Compose the page.", ["KPI row", "Trend", "Breakdown", "Filter action from map/bar", "Tooltip that explains the mark"], "See → click → understand."),
            tf("Floating 20 charts with overlap is a power move.", false, "Tiled containers you can scan. Overlap is a fight."),
          ],
        },
        {
          key: "dash",
          title: "Mini-project: Interactive executive dashboard",
          summary: "Click to filter. Hover to explain.",
          kind: "project",
          minutes: 14,
          concept: { key: "dash", name: "Exec dashboard", axis: "execution" },
          teach: {
            title: "One screen, three clicks",
            body: "If it needs a tour, it is not an exec page.",
          },
          questions: [
            challenge(
              "THE EXEC PAGE",
              "Need Sales, Profit, monthly trend, region map/bar, product breakdown, one filter action.",
              [
                { question: "Top-left?", options: ["A 20-row table", "Sales and Profit cards", "A photo", "Raw custom SQL"], answer: 1, explanation: "KPIs first." },
                { question: "Click a region should…", options: ["Open email", "Filter trend and products", "Reset Tableau", "Print"], answer: 1, explanation: "Filter action." },
                { question: "Tooltip?", options: ["Every field", "Name, number, vs last year", "Lorem", "The join key"], answer: 1, explanation: "A sentence." },
                { question: "Ship when?", options: ["12 floating charts", "A manager answers “how are we doing?” in two clicks", "3D", "A globe of birthdays"], answer: 1, explanation: "The page is the product." },
              ],
              "KPI, trend, click, sentence.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "anomaly",
      title: "Find the Anomaly",
      subtitle: "It doesn't look right",
      missions: [
        {
          key: "spike",
          title: "The 10× day",
          summary: "One order is not a record year.",
          concept: { key: "anomaly", name: "Anomaly hunting", axis: "problem" },
          teach: {
            title: "Outliers talk",
            body: "A spike with no volume is a data error until proven otherwise. Check grain, units, currency, and joins before you brief the board.",
          },
          questions: [
            mcq("One day shows 10× sales and 1 order. Likely?", ["Record year", "A unit error or bad join on that day", "Need a darker theme", "Delete Tableau"], 1, "One order cannot be a record year."),
            scenario(
              "Quantity 1, Sales £9,999,999. Neighbouring days look normal.",
              "First move?",
              ["Announce a record", "Open the underlying row and check units/currency", "Hide the day", "Add a pie"],
              1,
              "View Data is the microscope.",
            ),
            tf("An outlier is always a business miracle.", false, "It is a lead. Prove it."),
          ],
        },
        {
          key: "nullmarks",
          title: "The missing week",
          summary: "Nulls, extract windows, refresh.",
          concept: { key: "nullmarks", name: "Missing data", axis: "problem" },
          teach: {
            title: "Absence is a finding",
            body: "A hole in a line can be no sales, a failed refresh, or a filter that ate a week. Compare row counts to last extract.",
          },
          questions: [
            mcq("Last seven days empty, warehouse has orders. Suspect?", ["The business closed forever", "Extract window / refresh / filter", "Need 3D", "Maps are illegal"], 1, "Reality vs the extract."),
            identify(
              "What should you check?",
              "Line of Sales by day. Gap: 12–18 Mar. Extract refreshed 11 Mar.",
              ["Theme colours", "Extract freshness vs the gap", "Font pairing", "The office plants"],
              1,
              "The extract stopped before the week.",
            ),
          ],
        },
        {
          key: "unit",
          title: "Units and currency",
          summary: "Thousands vs millions. £ vs $.",
          concept: { key: "unit", name: "Unit traps", axis: "knowledge" },
          teach: {
            title: "Label the axis",
            body: "A “Sales” pill with no unit is a rumour. Mix of thousands and raw pounds will fake a spike.",
          },
          questions: [
            tf("Mixing £ and $ in one SUM is fine if the colours match.", false, "Convert or split. Never sum currencies."),
            fill("A sudden 1000× jump with similar order counts often means a ___ error.", "unit", "Thousands vs ones.", ["units", "scale"]),
          ],
        },
        {
          key: "anomaly-hunt",
          title: "Mini-project: One lie in the extract",
          summary: "Find it. Prove it. Name the fix.",
          kind: "project",
          minutes: 12,
          concept: { key: "anomaly-hunt", name: "Hunt", axis: "problem" },
          teach: {
            title: "One lie",
            body: "You are scored on the named cause, not on extra sheets.",
          },
          questions: [
            challenge(
              "ONE LIE",
              "March sales 8× February. Order counts similar. One SKU “WIDGET” appears twice as names.",
              [
                { question: "First cut?", options: ["A 3D globe", "Day and SKU grain", "Employee birthdays", "Theme"], answer: 1, explanation: "Go to the grain of the spike." },
                { question: "Duplicate SKU names. Risk?", options: ["Pretty legends", "Joins and groups double the SKU", "Faster dashboards", "Automatic profit"], answer: 1, explanation: "Identity first." },
                { question: "Recommend?", options: ["Celebrate March", "Fix the SKU key and re-extract, then restate March", "Hide February", "More pies"], answer: 1, explanation: "Named cause, named fix." },
              ],
              "Grain → identity → restate.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "present",
      title: "Present the Answer",
      subtitle: "What happened, why, what to do",
      missions: [
        {
          key: "lead",
          title: "Lead with the finding",
          summary: "Three sentences. Then the viz.",
          concept: { key: "present", name: "Storytelling", axis: "problem" },
          teach: {
            title: "Words first, proof second",
            body: "What happened. Why (the driver). What to do. The dashboard is evidence, not the speech.",
          },
          questions: [
            order("The talk.", ["What happened", "Why (the driver)", "What to do", "Show the viz that proves it"], "Words first, proof second."),
            mcq("Worst opening?", ["West profit fell 31% on two SKUs after a discount", "Let me walk you through 40 sheets", "Here is a pie", "The theme is new"], 1, "Do not tour. Brief."),
            tf("A title “Dashboard 4” is a finding.", false, "Titles are headlines."),
          ],
        },
        {
          key: "title",
          title: "Write the headline",
          summary: "The sheet title is the claim.",
          concept: { key: "title", name: "Titles", axis: "execution" },
          teach: {
            title: "Claim, then chart",
            body: "“West margin collapsed on discounted Widget” beats “Sales by Region.” Parameters can make the title update. Vanity titles do not.",
          },
          questions: [
            mcq("Best title?", ["Sheet 12", "West: Widget discount ate the margin", "Visual 3", "Untitled"], 1, "The claim."),
            fill("The first line of a dashboard should be a ___.", "headline", "A claim.", ["title", "finding"]),
          ],
        },
        {
          key: "brief",
          title: "The one-page brief",
          summary: "They will not read twelve sheets.",
          concept: { key: "brief", name: "Briefing", axis: "problem" },
          teach: {
            title: "One page",
            body: "Finding, size, driver, action, residual risk. Link the detail sheets. Do not make them hunt.",
          },
          questions: [
            scenario(
              "Churn up, NPS down, “growth” still green on the CEO slide because new logos hide NRR 82%.",
              "Honest headline?",
              ["We're crushing it", "Logo growth hides a retention hole", "Need more pie charts", "Pause data"],
              1,
              "Net revenue retention is the adult metric.",
            ),
            tf("If the action is “look at the dashboard,” you have not recommended.", true, "Name the move."),
          ],
        },
      ],
    },
    {
      key: "final",
      title: "Final Boss: The Mystery Company",
      subtitle: "A complete dataset. Discover what happened.",
      isBoss: true,
      missions: [
        {
          key: "final",
          title: "The Mystery Company",
          summary: "Major problem. Full extract. Present the answer.",
          kind: "boss",
          minutes: 18,
          concept: { key: "final", name: "Case close", axis: "problem" },
          teach: {
            title: "Close the case",
            body: "You do not get extra credit for extra charts. Find it. Prove it. Recommend.",
          },
          questions: [
            challenge(
              "THE MYSTERY COMPANY",
              "Churn up, NPS down, “growth” still green on the CEO slide.",
              [
                { question: "The green growth is new logos while NRR is 82%. Honest headline?", options: ["We're crushing it", "Logo growth hides a retention hole", "Need more pie charts", "Pause data"], answer: 1, explanation: "Net revenue retention is the adult metric." },
                { question: "Next viz?", options: ["Cohort retention", "A 3D globe", "Employee birthdays", "Font pairing"], answer: 0, explanation: "Cohorts show when people left." },
                { question: "The extract doubled sales after a returns join. Before you brief?", options: ["Ignore it", "Fix grain, then restate the numbers", "Add a pie", "Change the theme"], answer: 1, explanation: "Wrong grain is a false case." },
                { question: "Recommend?", options: ["Buy ads", "Fix onboarding in the cohort that falls off at day 14", "Hire a mascot", "Hide NPS"], answer: 1, explanation: "Named cause, named window." },
              ],
              "Find it. Prove it. Recommend.",
              "hard",
              1000,
            ),
          ],
        },
      ],
    },
  ],
});
