import { buildWorld, challenge, fill, identify, match, mcq, order, scenario, tf } from "../factory";

export const powerBiSkill = buildWorld({
  id: "power-bi",
  name: "Power BI",
  fantasy: "THE DATA ANALYST",
  tagline: "The numbers are hiding the answer. Find it.",
  description: "Go from raw tables to a board-ready dashboard: clean, model, measure, and decide.",
  category: "Data Worlds",
  difficulty: "intermediate",
  hours: 14,
  icon: "chart-column",
  trial: {
    key: "trial",
    title: "Find why sales dropped",
    summary: "A 2-minute briefing. Trust the numbers, not the rumour.",
    minutes: 4,
    concept: { key: "trial", name: "Sales drop instincts", axis: "problem" },
    teach: {
      title: "The briefing",
      body: "Revenue fell 18% last month. Marketing blames seasonality. Sales blames a product. You have a small extract. Do not guess — diagnose.",
      bullets: ["Compare regions before products", "A total hides the culprit", "A recommendation needs a cause"],
    },
    questions: [
      scenario(
        "Which region caused most of the decline?",
        "North −2%. South −4%. West −31%. East +3%. Company −18%.",
        ["North", "South", "West", "East"],
        2,
        "West is the only collapse large enough to move the company number.",
        "hard",
        [
          { label: "North", value: "−2%" },
          { label: "West", value: "−31%" },
          { label: "Company", value: "−18%" },
        ],
      ),
      mcq(
        "What should you check next?",
        ["Company-wide branding", "West product mix and volume", "Fire the East manager", "Ignore it as seasonality"],
        1,
        "Go where the drop lives. Product mix in West is the next cut.",
        "medium",
      ),
    ],
  },
  levels: [
    {
      key: "enter",
      title: "Enter the Data",
      subtitle: "Rows, fields, and your first visual",
      missions: [
        {
          key: "dataset",
          title: "Meet your dataset",
          summary: "10,000 sales transactions. Learn the grid.",
          concept: { key: "grid", name: "Tables and fields", axis: "knowledge" },
          teach: {
            title: "The grid",
            body: "A table is rows and columns. A row is one event. A column is a field. Dimensions slice (product, region, date). Measures add (revenue, units).",
            bullets: ["Categorical = labels you group by", "Numerical = values you aggregate", "Dates are both a dimension and a timeline"],
          },
          example: {
            title: "Sales extract",
            body: "OrderID, Date, Region, Product, Units, Revenue. Product is a dimension. Revenue is a measure.",
            callout: "If you sum Product, you have the wrong field.",
          },
          questions: [
            mcq("Which field represents the product?", ["OrderID", "Product", "Units", "Revenue"], 1, "Product is the categorical field naming what was sold."),
            match("Match the idea to the field type.", [
              { left: "Region", right: "Dimension" },
              { left: "Revenue", right: "Measure" },
              { left: "Date", right: "Time dimension" },
              { left: "Units", right: "Measure" },
            ], "Slice with dimensions. Add with measures."),
            tf("Every column in a table is a measure.", false, "Labels like Region are dimensions."),
          ],
        },
        {
          key: "numbers",
          title: "Read the numbers",
          summary: "Sum, average, count, min, max, percent.",
          concept: { key: "agg", name: "Aggregations", axis: "execution" },
          teach: {
            title: "Five verbs",
            body: "Sum totals. Average levels. Count events. Min/max the range. Percentages need a denominator you trust.",
          },
          questions: [
            scenario(
              "Which region generated the highest revenue?",
              "North 1.2M. South 0.9M. West 1.8M. East 1.1M.",
              ["North", "South", "West", "East"],
              2,
              "West is 1.8M — the top total.",
              "easy",
            ),
            mcq("Average revenue per order is 80. 200 orders. Total revenue?", ["80", "200", "16,000", "2.5"], 2, "Average × count = 16,000."),
            fill("To turn part into a share of the whole you need a ___.", "denominator", "Percentages are fraction: part / whole.", ["base", "total"]),
          ],
        },
        {
          key: "visual",
          title: "Your first visual",
          summary: "Bar, line, table, card — pick the shape of the answer.",
          concept: { key: "visuals", name: "Chart choice", axis: "execution" },
          teach: {
            title: "Charts answer questions",
            body: "Bar compares categories. Line shows change over time. Table lists exact values. A card is one KPI.",
          },
          questions: [
            match("Match the question to the visual.", [
              { left: "Monthly revenue", right: "Line chart" },
              { left: "Revenue by region", right: "Bar chart" },
              { left: "This month's total", right: "Card" },
              { left: "Order-level detail", right: "Table" },
            ], "The question picks the visual."),
            mcq("Build a chart of monthly revenue. Best default?", ["Pie of products", "Line of revenue by month", "Map of employees", "Treemap of colours"], 1, "Time series belongs on a line."),
          ],
        },
        {
          key: "dash-v1",
          title: "Mini-project: Sales dashboard v0.1",
          summary: "Assemble a clean first cut.",
          kind: "project",
          minutes: 12,
          concept: { key: "dash-v1", name: "First dashboard", axis: "execution" },
          teach: {
            title: "v0.1 is enough",
            body: "One KPI card, one trend, one breakdown. If a manager can answer “how are we doing?” you shipped.",
          },
          questions: [
            challenge(
              "Assemble Sales Dashboard v0.1",
              "Clean dataset. You have 20 minutes before standup.",
              [
                { question: "Which KPI belongs on the card?", options: ["Row count of the CSV", "Revenue", "File name", "Your username"], answer: 1, explanation: "Revenue is the business number." },
                { question: "What sits next to it?", options: ["A 40-slice pie", "Monthly trend line", "A photo of the warehouse", "Raw JSON"], answer: 1, explanation: "Trend explains the card." },
                { question: "How do you let them cut the view?", options: ["Email you", "Region slicer", "Hide the page", "Export to Word"], answer: 1, explanation: "A slicer is the filter they can use." },
              ],
              "Card + trend + slicer is a real v0.1.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "clean",
      title: "Clean Up the Mess",
      subtitle: "Power Query: duplicates, nulls, types, splits",
      missions: [
        {
          key: "dupes",
          title: "The duplicate attack",
          summary: "Find and remove duplicate rows.",
          concept: { key: "dupes", name: "Duplicates", axis: "execution" },
          teach: {
            title: "Same event twice",
            body: "Duplicates inflate sums. Decide the grain: OrderID+Line? OrderID only? Then remove extras.",
          },
          questions: [
            mcq("Two rows share OrderID and LineID. Revenue is doubled in the total. Cause?", ["A measure bug in DAX only", "Duplicate grain", "Too many colours", "Slicer on Date"], 1, "The table contains the event twice."),
            tf("Removing duplicates always means keep the first row blindly.", false, "You choose the grain, then the keep rule."),
          ],
        },
        {
          key: "nulls",
          title: "Missing data",
          summary: "Nulls are a decision, not a crash.",
          concept: { key: "nulls", name: "Null handling", axis: "problem" },
          teach: {
            title: "Three moves",
            body: "Keep, fill, or drop. Filling Region with “Unknown” is honest. Filling Revenue with 0 can hide lost orders.",
          },
          questions: [
            mcq("Revenue is null on 12 rows. Safest first move?", ["Replace with 0", "Investigate before filling", "Delete the column", "Multiply by 12"], 1, "Know why it is empty."),
            identify("Which transform is dangerous here?", "Replace Values: Revenue null → 0", ["Keep as null until modelled", "Replace with 0 before QA", "Flag as Unknown", "Count blanks"], 1, "Zero looks like a real sale of nothing."),
          ],
        },
        {
          key: "types",
          title: "Fix the columns",
          summary: "Text, numbers, dates, categories.",
          concept: { key: "types", name: "Data types", axis: "execution" },
          teach: {
            title: "Type is behaviour",
            body: "A date stored as text will not sit on a time axis. Currency with £ will not sum.",
          },
          questions: [
            order("Clean a broken Date column.", ["Detect the type is text", "Trim and standardise format", "Change type to Date", "Verify a date hierarchy works"], "Type last, after the string is sane."),
            fill("A column you group by but never sum is a ___.", "dimension", "Dimensions categorise."),
          ],
        },
        {
          key: "split",
          title: "Split the mess",
          summary: "“Manchester, UK” → City / Country.",
          concept: { key: "split", name: "Column splits", axis: "execution" },
          teach: {
            title: "One field, two jobs",
            body: "Split by delimiter. Then trim. Then check leftovers like “Manchester UK” without a comma.",
          },
          questions: [
            mcq("Best split for “Manchester, UK”?", ["By comma into City and Country", "By space into 3 columns", "By first letter", "Don't. Concatenate more"], 0, "The comma is the contract."),
          ],
        },
        {
          key: "repair",
          title: "Mini-project: Repair the broken sales file",
          summary: "Duplicates, nulls, types, names.",
          kind: "project",
          minutes: 14,
          concept: { key: "repair", name: "Data repair", axis: "problem" },
          teach: {
            title: "Score on accuracy",
            body: "You are graded on the cleaned grain, not on pretty charts.",
          },
          questions: [
            challenge(
              "Repair the extract",
              "Duplicates, missing Region, Revenue as text, Location as “City, Country”.",
              [
                { question: "First?", options: ["Build a pie", "Profile the table", "Write DAX", "Publish"], answer: 1, explanation: "See the mess before you touch it." },
                { question: "Grain?", options: ["One row per customer name", "One row per OrderLine", "One row per year", "One row per colour"], answer: 1, explanation: "Sales grain is the line." },
                { question: "Done when?", options: ["File is smaller", "Types correct, grain unique, splits done", "You used 12 steps", "CEO likes purple"], answer: 1, explanation: "Quality is specific." },
              ],
              "Profile → grain → types → splits.",
              "hard",
              100,
            ),
          ],
        },
        {
          key: "boss-disaster",
          title: "Boss: The Data Disaster",
          summary: "The CEO needs a report in 20 minutes. The dataset is broken.",
          kind: "boss",
          minutes: 16,
          concept: { key: "disaster", name: "Emergency clean", axis: "problem" },
          teach: {
            title: "Five problems",
            body: "Find them. Fix them. Do not decorate.",
          },
          questions: [
            challenge(
              "THE DATA DISASTER",
              "20 minutes. Five faults hidden in the extract.",
              [
                { question: "Revenue is 2× the finance system. Likely?", options: ["Currency conversion", "Duplicate rows", "Slicer on Year", "Too few visuals"], answer: 1, explanation: "Doubling is a classic duplicate." },
                { question: "Date axis is empty. Likely?", options: ["Dates stored as text", "No sales", "Wrong theme", "Missing logo"], answer: 0, explanation: "Text dates will not sit on a date axis." },
                { question: "UK and “U.K.” both appear. Fix?", options: ["Two slicers", "Standardise in Power Query", "Hide UK", "New measure"], answer: 1, explanation: "Clean the dimension once." },
                { question: "Null Region rows sit in the total but not the slicer. Why?", options: ["Blank members", "DAX is illegal", "Need Python", "Refresh is off"], answer: 0, explanation: "Blanks still sum unless you handle them." },
                { question: "Ship the report when?", options: ["After a 12-page theme", "When totals reconcile and filters work", "When the CEO picks a colour", "Never"], answer: 1, explanation: "Reconcile, then format." },
              ],
              "Find the five. Fix the grain. Then talk.",
              "hard",
              250,
            ),
          ],
        },
      ],
    },
    {
      key: "dashboard",
      title: "Build the Dashboard",
      subtitle: "Hierarchy, slicers, layout",
      missions: [
        {
          key: "kpi",
          title: "Build a KPI card",
          summary: "One number, one context.",
          concept: { key: "kpi", name: "KPI cards", axis: "execution" },
          teach: { title: "A card is a sentence", body: "The number, the comparison, the unit. “£1.8M · −18% vs last month.”" },
          questions: [
            mcq("Worst KPI card?", ["Revenue £1.8M (−18% YoY)", "Row count 10,000", "Profit with target", "Orders with vs last week"], 1, "Row count is not a business KPI."),
          ],
        },
        {
          key: "sales-chart",
          title: "Build a sales chart",
          summary: "Then add date and region filters.",
          concept: { key: "filters", name: "Slicers and filters", axis: "execution" },
          teach: { title: "Filters are questions", body: "Date filter = when. Region filter = where. Don't stack 14 slicers." },
          questions: [
            order("Build the page.", ["KPI card", "Sales trend", "Date filter", "Region filter", "Compose layout"], "Big number, story, then controls."),
            tf("Every column deserves a slicer.", false, "Slicers are expensive. Only the cuts people actually use."),
          ],
        },
        {
          key: "mgmt",
          title: "Mini-project: Management dashboard",
          summary: "Revenue, profit, units, trend, top products, region.",
          kind: "project",
          minutes: 14,
          concept: { key: "mgmt", name: "Management dashboard", axis: "execution" },
          teach: { title: "Six objects", body: "If they cannot find profit in two seconds, the layout failed." },
          questions: [
            challenge(
              "Management dashboard",
              "Need Revenue, Profit, Units, monthly trend, top products, region filter.",
              [
                { question: "Top-left?", options: ["A 20-row table", "Revenue and profit cards", "A photo", "Raw query"], answer: 1, explanation: "KPIs first." },
                { question: "The CEO asks “what happened to sales?” You…", options: ["Open Excel", "Use the trend + region slicer", "Guess", "Rebuild the model"], answer: 1, explanation: "The dashboard should answer it." },
              ],
              "Layout is the product.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "model",
      title: "Connect the World",
      subtitle: "Relationships, facts, dimensions",
      missions: [
        {
          key: "rel",
          title: "Connect the tables",
          summary: "Customers, Products, Orders, Stores.",
          concept: { key: "rel", name: "Relationships", axis: "knowledge" },
          teach: {
            title: "Star, not spaghetti",
            body: "Facts in the middle (Orders). Dimensions around (Customer, Product, Store, Date). One-to-many from dim to fact.",
          },
          questions: [
            mcq("Orders.CustomerID → Customers.CustomerID. Correct cardinality?", ["Many-to-many always", "Many orders to one customer", "One order to many customers", "No relationship"], 1, "A customer has many orders."),
            match("Fact or dimension?", [
              { left: "Orders", right: "Fact" },
              { left: "Products", right: "Dimension" },
              { left: "Stores", right: "Dimension" },
              { left: "Order lines revenue", right: "Fact measure" },
            ], "Facts happen. Dimensions describe."),
          ],
        },
        {
          key: "lying",
          title: "Boss: The model is lying",
          summary: "Revenue is wrong. Find why.",
          kind: "boss",
          minutes: 12,
          concept: { key: "lying", name: "Bad models", axis: "problem" },
          teach: { title: "Wrong join, wrong number", body: "A many-to-many or a both-direction filter can fan out revenue." },
          questions: [
            scenario(
              "Revenue is 4× finance. Model has Products linked to Orders on ProductName, not ProductID, and names are not unique. Why?",
              "Four SKUs share “Widget”. Each order line matches four product rows.",
              ["Need a bigger pie", "Fan-out join on a non-unique key", "DAX SUM is illegal", "Refresh failed"],
              1,
              "Non-unique keys multiply rows, then SUM explodes.",
            ),
          ],
        },
      ],
    },
    {
      key: "dax",
      title: "Speak DAX",
      subtitle: "Measures that answer real questions",
      missions: [
        {
          key: "measures",
          title: "Revenue is easy. Last year is not.",
          summary: "SUM, CALCULATE, DIVIDE, time intelligence.",
          concept: { key: "dax", name: "DAX measures", axis: "execution" },
          teach: {
            title: "Measures solve questions",
            body: "Revenue = SUM(Sales[Revenue]). Last year = CALCULATE(Revenue, SAMEPERIODLASTYEAR(Date[Date])). Margin % = DIVIDE(Profit, Revenue).",
          },
          example: { title: "YoY", body: "YoY Growth = DIVIDE(Revenue - Revenue LY, Revenue LY).", callout: "Never divide with / when the denominator can be 0." },
          questions: [
            identify("Which measure is last-year revenue?", "CALCULATE([Revenue], SAMEPERIODLASTYEAR('Date'[Date]))", ["This year total", "Last year revenue", "A calculated column", "A relationship"], 1, "SAMEPERIODLASTYEAR shifts the filter."),
            mcq("Why DIVIDE not / ?", ["Looks nicer", "Handles divide-by-zero", "Faster colours", "Required by law"], 1, "DIVIDE is safe."),
            fill("A reusable calculation stored in the model is a ___.", "measure", "Measures are the verbs."),
          ],
        },
        {
          key: "dax-pack",
          title: "Mini-project: The measure pack",
          summary: "Revenue, Gross Profit, Margin %, YoY, YTD.",
          kind: "project",
          minutes: 12,
          concept: { key: "dax-pack", name: "Measure pack", axis: "execution" },
          teach: { title: "Five measures, one model", body: "If YTD ignores the date table, it is a prop." },
          questions: [
            order("Build the pack.", ["Revenue", "Gross Profit", "Margin %", "Revenue LY then YoY", "YTD Revenue"], "Foundations first, then time."),
          ],
        },
      ],
    },
    {
      key: "story",
      title: "Find the Story",
      subtitle: "Trends, outliers, drilldowns",
      missions: [
        {
          key: "detect",
          title: "Sales fell 18%",
          summary: "Five possible causes. Investigate.",
          concept: { key: "story", name: "Diagnostic analysis", axis: "problem" },
          teach: {
            title: "Detective rules",
            body: "Cut by region, then product, then channel. The first big red bar is a lead, not a verdict.",
          },
          questions: [
            challenge(
              "The 18% drop",
              "Possible causes: seasonality, West collapse, price cut, returns, missing week of data.",
              [
                { question: "First cut?", options: ["By intern name", "By region", "By font", "By file size"], answer: 1, explanation: "Geography is the coarsest honest split." },
                { question: "West is −31%. Next?", options: ["Blame marketing globally", "Product mix in West", "Delete West", "Change theme"], answer: 1, explanation: "Go one grain deeper." },
                { question: "One SKU lost a retailer. Action?", options: ["A motivational poster", "Quantify the SKU, then a retailer plan", "Hide the SKU", "Average it away"], answer: 1, explanation: "Name the SKU. Then decide." },
              ],
              "Region → product → why.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "business",
      title: "Think Like the Business",
      subtitle: "Recommendations, not charts",
      missions: [
        {
          key: "decide",
          title: "Should marketing get £50k more?",
          summary: "Budget, expansion, kill a product, find profit.",
          concept: { key: "decide", name: "Business judgment", axis: "problem" },
          teach: {
            title: "A chart is not a decision",
            body: "State the effect, the confidence, the risk. Then recommend.",
          },
          questions: [
            scenario(
              "CAC rose 40% while conversion fell. Incremental £50k to the same channel?",
              "Last three tests showed diminishing returns. Organic West is the hole.",
              ["Yes, scale the same ads", "No — the constraint is West distribution, not spend", "Spend it on a new colour", "Pause all measurement"],
              1,
              "Do not fund a channel that is already saturating while the drop is distribution.",
            ),
            mcq("Which customer segment is most profitable?", ["Highest revenue", "Highest margin after returns and service", "Loudest on social", "Newest logo"], 1, "Profit after cost-to-serve."),
          ],
        },
      ],
    },
    {
      key: "exec",
      title: "Executive Mode",
      subtitle: "Five metrics, not twenty",
      missions: [
        {
          key: "five",
          title: "Choose five",
          summary: "20 possible metrics. Keep five.",
          concept: { key: "exec", name: "Executive design", axis: "problem" },
          teach: {
            title: "Overload is a failure",
            body: "Board pages need: outcome, driver, risk. Not a museum of charts.",
          },
          questions: [
            mcq("Pick the board five.", ["Revenue, growth, margin, cash, one risk driver", "20 filters and a pie", "Row counts", "Every column in the warehouse"], 0, "Outcomes + one driver."),
          ],
        },
        {
          key: "board-dash",
          title: "Mini-project: Board dashboard",
          summary: "Ship the page the board will actually use.",
          kind: "project",
          minutes: 12,
          concept: { key: "board", name: "Board dashboard", axis: "execution" },
          teach: { title: "One screen", body: "If it needs a tour, it is not a board page." },
          questions: [
            tf("A board dashboard should require a 15-minute walkthrough to understand.", false, "If it needs a tour, it failed."),
          ],
        },
      ],
    },
    {
      key: "final",
      title: "Final Boss: The Board Meeting",
      subtitle: "Clean, model, visualise, recommend",
      isBoss: true,
      missions: [
        {
          key: "final",
          title: "The Board Meeting",
          summary: "Messy data. Limited time. A brief.",
          kind: "boss",
          minutes: 20,
          concept: { key: "final", name: "End-to-end briefing", axis: "problem" },
          teach: {
            title: "The job",
            body: "Clean. Model. Visualise. Find the cause. Recommend. You are scored on accuracy, analysis, dashboard, and judgment.",
          },
          questions: [
            challenge(
              "THE BOARD MEETING",
              "Messy extract. Brief: “Sales missed plan. What happened and what do we do?”",
              [
                { question: "First 5 minutes?", options: ["Theme the report", "Profile and fix grain", "Write the email", "Build 12 bookmarks"], answer: 1, explanation: "Wrong grain = wrong story." },
                { question: "Model?", options: ["One flat denormalised soup", "Orders fact + dimensions", "Export CSV", "Screenshot Excel"], answer: 1, explanation: "Star schema keeps measures honest." },
                { question: "Insight standard?", options: ["“Sales changed”", "Named driver, size, and next action", "A gif", "More filters"], answer: 1, explanation: "Cause + size + action." },
                { question: "Recommend?", options: ["Work harder", "Fix the West SKU / retailer gap and stop funding a saturated channel", "Hire a motivational speaker", "Delete the date table"], answer: 1, explanation: "Specific beat slogans." },
              ],
              "Accuracy, analysis, dashboard, judgment.",
              "hard",
              1000,
            ),
          ],
        },
      ],
    },
  ],
});
