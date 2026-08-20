import { buildWorld, challenge, fill, identify, match, mcq, order, scenario, tf } from "../factory";

export const terraformSkill = buildWorld({
  id: "terraform",
  name: "Terraform",
  fantasy: "THE INFRASTRUCTURE ARCHITECT",
  tagline: "Write the city. Then keep it true.",
  description: "Providers, resources, variables, modules, environments, and drift.",
  category: "Ops Worlds",
  difficulty: "intermediate",
  hours: 12,
  icon: "building-2",
  trial: {
    key: "trial",
    title: "What Terraform thinks vs what exists",
    summary: "Drift in 3 minutes. A destroy in the plan is a stop sign.",
    minutes: 4,
    concept: { key: "trial", name: "Drift instincts", axis: "problem" },
    teach: {
      title: "State is memory",
      body: "Someone clicked in the console. Terraform still believes the old plan. Apply without reading is how you delete a database you still love.",
      bullets: ["Plan is the preview", "Destroy in plan is a halt", "Refresh and import before you “fix” with apply"],
    },
    example: {
      title: "The surprise destroy",
      body: "plan: aws_db_instance.main must be replaced. A human resized the instance in the cloud UI. State still has the old class.",
      callout: "Do not apply a replace on a database until you understand why.",
    },
    questions: [
      scenario(
        "terraform plan wants to destroy a database you still use. A human resized it in the cloud UI.",
        "First move?",
        ["terraform apply immediately", "Inspect plan, refresh/import, never apply a surprise destroy", "Delete state", "Ignore"],
        1,
        "A destroy in plan is a stop sign.",
        "hard",
      ),
      mcq("Someone clicked a new security group rule. Plan shows an update. Healthy response?", ["Panic-apply", "Read the diff, then apply if it matches intent", "rm the state file", "Disable the provider"], 1, "Intent vs click."),
      tf("Deleting terraform.tfstate is a safe way to “reset” production.", false, "State is the map of real IDs. Losing it is the incident."),
      identify(
        "What is this line saying?",
        "- aws_db_instance.main\n    instance_class = \"db.t3.medium\" -> \"db.t3.large\"\n  # replacement / destroy-create risk",
        ["A comment in a README", "Plan: the DB may be replaced", "A Kubernetes probe", "A DNS record"],
        1,
        "Read replacements before apply.",
      ),
    ],
  },
  levels: [
    {
      key: "iac",
      title: "Infrastructure as Code",
      subtitle: "Declarative, providers, state",
      missions: [
        {
          key: "first",
          title: "Write the city, don't click it",
          summary: "HCL, providers, the loop.",
          concept: { key: "iac", name: "IaC basics", axis: "knowledge" },
          teach: {
            title: "You declare the end",
            body: "HCL describes desired resources. Providers talk to APIs. State remembers IDs so the next plan is a diff, not a guess.",
            bullets: ["init downloads providers", "plan is the preview", "apply is the commit"],
          },
          example: {
            title: "First resource",
            body: "resource \"aws_s3_bucket\" \"logs\" { bucket = \"acme-logs\" } → init → plan → apply. State now holds the bucket id.",
            callout: "If you skip plan, you skip the briefing.",
          },
          questions: [
            order("First resource.", ["Write the block", "terraform init", "plan", "apply"], "Plan is the preview."),
            fill("Terraform stores resource IDs in ___.", "state", "State.", ["the state", "tfstate"]),
            tf("terraform apply without reading plan is a professional default.", false, "Always read the plan."),
            mcq("A provider's job?", ["Draw architecture posters", "Translate resources into cloud API calls", "Replace git", "Store passwords in Slack"], 1, "Plugins to APIs."),
          ],
        },
        {
          key: "hcl",
          title: "Blocks have types",
          summary: "resource, variable, output, data.",
          concept: { key: "hcl", name: "HCL blocks", axis: "knowledge" },
          teach: {
            title: "Four you live in",
            body: "resource creates. data reads existing. variable is input. output is what you export. Locals are named expressions.",
          },
          example: {
            title: "A data source",
            body: "data \"aws_ami\" \"ubuntu\" { most_recent = true ... } then ami = data.aws_ami.ubuntu.id on the instance.",
            callout: "Data is a lookup, not a constructor.",
          },
          questions: [
            match("Block.", [
              { left: "resource", right: "Create / manage" },
              { left: "data", right: "Read existing" },
              { left: "variable", right: "Input" },
              { left: "output", right: "Export" },
            ], "Name the block."),
            identify(
              "What is this?",
              "data \"aws_vpc\" \"main\" {\n  id = var.vpc_id\n}",
              ["A destroy", "A read of an existing VPC", "A Kubernetes Service", "A local-exec hack"],
              1,
              "data = lookup.",
            ),
            tf("Two resources with the same type and name in one module are fine.", false, "The address must be unique."),
          ],
        },
        {
          key: "planread",
          title: "Read the plan like a brief",
          summary: "+ create, ~ update, - destroy.",
          concept: { key: "planread", name: "Reading plans", axis: "problem" },
          teach: {
            title: "Symbols are the story",
            body: "+ will exist. - will vanish. ~ in-place. -/+ replace. Forces replacement is the phrase that should slow your pulse.",
          },
          example: {
            title: "Read the verbs",
            body: "+ aws_s3_bucket.logs · ~ aws_instance.web (tags) · -/+ aws_db_instance.main (instance_class force-new).",
            callout: "The last one is a stop sign.",
          },
          questions: [
            mcq("You see -/+ on aws_db_instance. Meaning?", ["A comment", "Destroy and recreate", "A no-op", "A format tweak"], 1, "Replacement."),
            scenario(
              "Plan: 0 to add, 1 to change, 0 to destroy. The change is a tag.",
              "Risk?",
              ["Usually low if it is truly in-place", "Always deletes the VPC", "Wipes state", "Needs a new laptop"],
              0,
              "Tags are often safe. Still read the resource.",
            ),
            tf("A plan with 40 destroys on Friday is a good surprise.", false, "Stop. Diff by resource."),
          ],
        },
        {
          key: "first-apply",
          title: "Mini-project: One bucket, one plan",
          summary: "On paper: the loop you would run.",
          kind: "project",
          minutes: 10,
          concept: { key: "first-apply", name: "First apply", axis: "execution" },
          teach: {
            title: "Tiny and true",
            body: "If the plan does not match the paragraph you wrote, do not apply.",
          },
          questions: [
            challenge(
              "One bucket",
              "Need a logs bucket, tagged env=dev, no public access. Simulated only.",
              [
                { question: "First command after writing HCL?", options: ["apply -auto-approve", "init, then plan", "Delete state", "Email AWS"], answer: 1, explanation: "Providers, then preview." },
                { question: "Plan shows a public ACL you did not want. You?", options: ["Apply anyway", "Change the block, plan again", "Destroy the org", "Ignore"], answer: 1, explanation: "Plan until it matches." },
                { question: "Where does the bucket id live after apply?", options: ["Slack", "State", "The CEO's head", "A screenshot"], answer: 1, explanation: "State is memory." },
              ],
              "Write, init, plan, apply.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "res",
      title: "Resources",
      subtitle: "Server, storage, network",
      missions: [
        {
          key: "res",
          title: "Three building blocks",
          summary: "Compute, disk, net.",
          concept: { key: "res", name: "Resources", axis: "execution" },
          teach: {
            title: "Graph of objects",
            body: "A VM needs a network. A disk needs an attachment. Dependencies are implicit via references: subnet_id = aws_subnet.a.id.",
          },
          example: {
            title: "The graph",
            body: "VPC → subnet → instance subnet_id. Terraform creates the subnet before the VM because of the reference.",
            callout: "If you need a sleep, you probably needed a dependency.",
          },
          questions: [
            match("Kind.", [
              { left: "instance / VM", right: "Compute" },
              { left: "bucket / volume", right: "Storage" },
              { left: "VPC / subnet", right: "Network" },
              { left: "security group", right: "Network policy" },
            ], "Name the layer."),
            mcq("You reference aws_subnet.a.id on a VM. Terraform…", ["Creates the subnet first", "Random order", "Deletes both", "Needs a sleep"], 0, "The graph."),
            tf("depends_on is required for every pair of resources.", false, "References already create edges. depends_on is for hidden couplings."),
            fill("resource \"aws_instance\" \"web\" is addressed as ___.", "aws_instance.web", "Type.name.", ["aws_instance.web"]),
          ],
        },
        {
          key: "count",
          title: "Count and for_each",
          summary: "Many of the same, without copy-paste.",
          concept: { key: "count", name: "Multiplicity", axis: "execution" },
          teach: {
            title: "Index vs key",
            body: "count = 3 gives [0],[1],[2] — inserting at the front reshuffles. for_each with a map keeps names stable. Prefer for_each for real sets.",
          },
          example: {
            title: "Stable keys",
            body: "for_each = toset([\"a\",\"b\"]) → aws_subnet.this[\"a\"]. Removing \"b\" does not rename \"a\".",
            callout: "count is a trap when membership changes.",
          },
          questions: [
            mcq("You used count and prepended a subnet. What happens to [0]?", ["Nothing", "It may be destroyed/recreated as indices shift", "Terraform refuses forever", "State deletes itself"], 1, "Indices move."),
            identify(
              "Safer for a set of named AZs?",
              "for_each = { a = \"euw1-az1\", b = \"euw1-az2\" }",
              ["Random count = 2", "Keyed for_each", "Copy the file 12 times", "Clickops"],
              1,
              "Keys survive membership edits.",
            ),
            tf("Changing count from 3 to 2 always deletes index 2, never 0.", true, "It trims from the end — which is why prepends hurt."),
          ],
        },
        {
          key: "lifecycle",
          title: "Lifecycle is a seatbelt",
          summary: "prevent_destroy, ignore_changes, create_before_destroy.",
          concept: { key: "lifecycle", name: "Lifecycle", axis: "problem" },
          teach: {
            title: "Tell Terraform how to hurt you less",
            body: "prevent_destroy on a database. ignore_changes when an autoscaler owns desired_count. create_before_destroy when a name must stay up.",
          },
          example: {
            title: "Seatbelt on the DB",
            body: "lifecycle { prevent_destroy = true } on aws_db_instance.main. A bad plan now errors instead of replacing Friday at 5.",
            callout: "The error is the feature.",
          },
          questions: [
            scenario(
              "A tag-only change wants to replace a stateful disk because of a force-new attribute you did not mean.",
              "Belt?",
              ["prevent_destroy + read the plan", "Delete state", "-auto-approve", "Ignore forever with no comment"],
              0,
              "Stop the replace. Then fix the config.",
            ),
            mcq("Autoscaler changes instance count out of band. Common pattern?", ["Fight it every plan", "ignore_changes on that attribute if policy says so", "No state", "Apply twice"], 1, "Pick an owner."),
          ],
        },
      ],
    },
    {
      key: "vars",
      title: "Variables",
      subtitle: "Hard-coded → reusable",
      missions: [
        {
          key: "vars",
          title: "Stop hard-coding the city",
          summary: "variable blocks, tfvars.",
          concept: { key: "vars", name: "Variables", axis: "execution" },
          teach: {
            title: "Inputs",
            body: "variable \"region\". Pass with tfvars. type and validation catch typos. Sensitive flags hide values in logs — they are not a vault.",
          },
          questions: [
            identify("What's wrong?", 'region = "us-east-1" in 12 files', ["Should be a variable", "Perfect", "Need more copies", "Comments only"], 0, "One input, many uses."),
            tf("Plaintext passwords in .tf belong in git.", false, "Secrets stay out of VCS."),
            fill("Files that pass variable values are often ___.", "tfvars", "tfvars.", ["terraform.tfvars", ".tfvars"]),
            mcq("variable \"env\" { type = string }. You pass 3. Result?", ["Coerced silently always", "Type error (want string)", "Deletes state", "Starts Kubernetes"], 1, "Types are brakes."),
          ],
        },
        {
          key: "locals",
          title: "Name the expression once",
          summary: "locals vs variables.",
          concept: { key: "locals", name: "Locals", axis: "knowledge" },
          teach: {
            title: "Computed, not passed",
            body: "locals { name = \"${var.env}-web\" }. Callers pass env. The module builds names. Don't make humans type the concatenation 40 times.",
          },
          questions: [
            match("Input vs computed.", [
              { left: "region from CI", right: "variable" },
              { left: "bucket name from env + purpose", right: "local" },
              { left: "AMI lookup", right: "data" },
              { left: "DNS name for the app team", right: "output" },
            ], "Who supplies it?"),
            tf("Locals can be set from the CLI like variables.", false, "Locals are internal."),
          ],
        },
        {
          key: "sensitive",
          title: "Sensitive is a curtain",
          summary: "Not encryption. Not a vault.",
          concept: { key: "sensitive", name: "Sensitive values", axis: "problem" },
          teach: {
            title: "Logs vs storage",
            body: "sensitive = true redacts plan output. State may still hold the value. Use a secret manager resource and never commit tfvars with passwords.",
          },
          questions: [
            scenario(
              "A db_password variable is sensitive. A teammate finds it in terraform.tfstate in Slack.",
              "Lesson?",
              ["Sensitive encrypts state", "State still has secrets — remote state + no Slack + a vault", "Fine", "Delete AWS"],
              1,
              "Curtain ≠ lock.",
            ),
            mcq("Where should the production DB password live?", ["main.tf as a default", "A secret store, referenced by Terraform", "The README", "A screenshot"], 1, "Reference, don't paste."),
          ],
        },
      ],
    },
    {
      key: "out",
      title: "Outputs",
      subtitle: "Expose what others need",
      missions: [
        {
          key: "out",
          title: "Show the IP, not the guts",
          summary: "Outputs are the API of a stack.",
          concept: { key: "out", name: "Outputs", axis: "knowledge" },
          teach: {
            title: "Useful, not noisy",
            body: "Public IP, DNS, ARNs consumers need. Not every attribute. Sensitive outputs for secrets you must export — still not Slack.",
          },
          questions: [
            mcq("Best output for an app team?", ["The entire state file", "load_balancer_dns", "Your AWS account password", "Random ids of all NICs"], 1, "What they connect to."),
            tf("Outputs update only if you apply.", true, "Plan can show them; apply commits."),
            fill("A module's public surface is its ___.", "outputs", "Outputs.", ["output"]),
          ],
        },
        {
          key: "remote-out",
          title: "Stacks talking to stacks",
          summary: "terraform_remote_state is a coupling.",
          concept: { key: "remote-out", name: "Remote outputs", axis: "execution" },
          teach: {
            title: "Prefer explicit interfaces",
            body: "Reading another state's outputs glues pipelines. A shared module or a thin data source can be cleaner. Document the contract.",
          },
          questions: [
            mcq("App stack needs VPC id from network stack. Cleanest long-term?", ["Copy-paste the id in Slack", "Documented output + remote state or a data lookup you own", "Hard-code in 12 files", "No VPC"], 1, "A named interface."),
            scenario(
              "Network stack output renamed. App plan wants to replace everything.",
              "Cause?",
              ["Clouds hate Tuesdays", "Broken contract between stacks", "Need more count", "Delete state to fix"],
              1,
              "Outputs are APIs. Version them.",
            ),
          ],
        },
        {
          key: "out-min",
          title: "Mini-project: The handover list",
          summary: "Three outputs. No state dump.",
          kind: "project",
          minutes: 8,
          concept: { key: "out-min", name: "Handover", axis: "execution" },
          teach: {
            title: "What they need at 2am",
            body: "URL, health check id, log bucket. If on-call needs a resource dump, the interface failed.",
          },
          questions: [
            challenge(
              "Handover",
              "App team needs to point DNS and debug 5xx.",
              [
                { question: "Export?", options: ["Full state JSON", "load_balancer_dns + cluster name", "Root AWS keys", "Every security group rule"], answer: 1, explanation: "The connection points." },
                { question: "Password?", options: ["output { value = var.db_password } to Slack", "Secret manager + restricted output if you must", "Commit tfvars", "Print in CI logs"], answer: 1, explanation: "Curtain + vault." },
                { question: "Done when?", options: ["40 outputs", "On-call can find URL without opening state", "No outputs", "A screenshot of the console"], answer: 1, explanation: "The list is the product." },
              ],
              "Export the contract.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "stack",
      title: "Build a Stack",
      subtitle: "Connected resources",
      missions: [
        {
          key: "order",
          title: "Net before machines",
          summary: "The apply order is the graph.",
          concept: { key: "order", name: "Stack order", axis: "execution" },
          teach: {
            title: "Edges, not hope",
            body: "Network, then policy, then compute, then data stores that need a subnet, then outputs. If you click 12 things after apply, it is not a stack yet.",
          },
          questions: [
            order("Build.", ["Network", "Security rules", "Compute", "Attach storage", "Output the endpoint"], "Net before machines."),
            tf("You can create a private DB in a public subnet and call it done.", false, "Placement is the product."),
          ],
        },
        {
          key: "sg",
          title: "Least privilege on the wire",
          summary: "0.0.0.0/0 is not a personality.",
          concept: { key: "sg", name: "Network policy", axis: "problem" },
          teach: {
            title: "Who may speak",
            body: "App security group to DB on 5432. Not the world. Not SSH from 0.0.0.0/0 “for now.”",
          },
          questions: [
            identify(
              "What's wrong?",
              "ingress {\n  from_port = 5432\n  cidr_blocks = [\"0.0.0.0/0\"]\n}",
              ["DB open to the internet", "Perfect least privilege", "A Terraform bug", "An output"],
              0,
              "Lock to the app SG.",
            ),
            mcq("SSH from the office only. How?", ["0.0.0.0/0", "Office CIDR or SSM, not the planet", "Disable the VPC", "No state"], 1, "Named source."),
          ],
        },
        {
          key: "stack",
          title: "Mini-project: Wire a tiny city",
          summary: "Net → compute → store → output.",
          kind: "project",
          minutes: 14,
          concept: { key: "stack", name: "A small stack", axis: "execution" },
          teach: {
            title: "One apply",
            body: "If you need 12 manual clicks after apply, it is not a stack yet.",
          },
          questions: [
            challenge(
              "TINY CITY",
              "Need a VPC, public app, private DB, one output DNS.",
              [
                { question: "First resources?", options: ["The DB in 0.0.0.0/0", "VPC and subnets", "Random instances", "State in Slack"], answer: 1, explanation: "Network first." },
                { question: "DB placement?", options: ["Public subnet + world SG", "Private subnet, SG from app only", "No VPC", "The laptop"], answer: 1, explanation: "Least exposure." },
                { question: "Output?", options: ["Root keys", "App DNS / URL", "Every NIC", "The plan file"], answer: 1, explanation: "The handover." },
                { question: "Done when?", options: ["Clicks remain", "One apply creates the graph and the output is enough to connect", "40 unused resources", "No plan"], answer: 1, explanation: "The graph is the city." },
              ],
              "Net, policy, compute, store, output.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "mod",
      title: "Modules",
      subtitle: "Reusable components",
      missions: [
        {
          key: "mod",
          title: "Don't copy the VPC three times",
          summary: "source, variables, outputs.",
          concept: { key: "mod", name: "Modules", axis: "execution" },
          teach: {
            title: "A module is a function for infra",
            body: "source, variables, outputs. Version it. Pin the module version like you pin an image.",
          },
          questions: [
            tf("Modules exist so you can paste 400 lines into each env.", false, "Call the module."),
            fill("A reusable Terraform package is a ___.", "module", "Module."),
            mcq("source = \"../../vpc\" in prod. Risk?", ["None", "Unpinned local path can drift from what staging ran", "Faster always", "No state"], 1, "Version the contract."),
          ],
        },
        {
          key: "modver",
          title: "Pin the module",
          summary: "v1.4.2 not main.",
          concept: { key: "modver", name: "Module versions", axis: "problem" },
          teach: {
            title: "main moves",
            body: "A git source without a ref is :latest for infrastructure. Tag releases. Read the changelog before bumping in prod.",
          },
          questions: [
            identify(
              "What's dangerous?",
              "source = \"git::https://example.com/vpc.git\"\n# no ref",
              ["Unpinned module source", "Perfect", "A data source", "An output"],
              0,
              "Pin a tag or commit.",
            ),
            scenario(
              "Staging used module v2. Prod still on v1. You apply prod with a copied staging tf that calls v2.",
              "Move?",
              ["Blind apply", "Read v2 changelog / plan in prod first", "Delete prod state", "-auto-approve"],
              1,
              "Major bumps are replacements waiting to happen.",
            ),
          ],
        },
        {
          key: "mod-api",
          title: "Small inputs, stable outputs",
          summary: "Don't leak internals.",
          concept: { key: "mod-api", name: "Module API", axis: "execution" },
          teach: {
            title: "The call site should be boring",
            body: "env, cidr, tags. Not 80 toggles. Outputs: vpc_id, subnet_ids. If callers reach into module internals, you do not have a module.",
          },
          questions: [
            mcq("Worst module interface?", ["cidr + env", "80 boolean flags named enable_* including enable_enable", "vpc_id output", "Tagged resources"], 1, "A maze is not reuse."),
            tf("Callers should use module.vpc.aws_subnet.this[0].id instead of an output.", false, "Outputs are the API."),
          ],
        },
      ],
    },
    {
      key: "env",
      title: "Environments",
      subtitle: "dev, staging, production",
      missions: [
        {
          key: "env",
          title: "Three cities, one blueprint",
          summary: "Workspaces or separate state.",
          concept: { key: "env", name: "Environments", axis: "knowledge" },
          teach: {
            title: "State isolation",
            body: "Prod state is sacred. Don't apply staging against prod backend. Workspaces can work; separate backends are harder to mix up.",
          },
          questions: [
            mcq("Safest isolation?", ["One state file for all envs", "Separate backends / workspaces per env", "Email the keys", "No state"], 1, "Blast radius."),
            scenario(
              "A pipeline ran terraform apply with the prod backend and a staging tfvars.",
              "Prevent?",
              ["Hope", "Backend + -var-file guards and CI environment locks", "Disable plan", "Always -auto-approve"],
              1,
              "Make the wrong combo impossible.",
            ),
            tf("terraform.tfstate on a laptop is a great prod backend.", false, "Remote + lock."),
          ],
        },
        {
          key: "lock",
          title: "Lock or collide",
          summary: "Two applies, one state.",
          concept: { key: "lock", name: "State locking", axis: "execution" },
          teach: {
            title: "One writer",
            body: "Remote backends lock. Two humans applying is a race. Force-unlock is a last resort after you prove the other apply is dead.",
          },
          questions: [
            mcq("Error: state locked by CI. You?", ["Force-unlock immediately always", "Wait / find the run, then unlock only if it's stale", "Delete the backend", "Apply local"], 1, "Don't steal the lock from a live apply."),
            fill("Concurrent applies are stopped by a ___.", "lock", "Lock.", ["state lock"]),
          ],
        },
        {
          key: "env-boss",
          title: "Boss: Staging tfvars, prod backend",
          summary: "The pipeline almost ate production.",
          kind: "boss",
          minutes: 14,
          concept: { key: "env-boss", name: "Wrong combo", axis: "problem" },
          teach: {
            title: "Make it unrepresentable",
            body: "Backend config in CI from the environment name. A required var that must equal the backend suffix. No -auto-approve on prod without a human.",
          },
          questions: [
            challenge(
              "WRONG COMBO",
              "CI used prod backend, staging tfvars. Plan wanted to shrink the prod DB.",
              [
                { question: "First?", options: ["Apply to “fix”", "Do not apply. Confirm backend vs var-file", "Delete state", "Force-unlock for fun"], answer: 1, explanation: "Stop the apply." },
                { question: "Why did CI allow it?", options: ["Terraform is random", "Backend and tfvars were independent", "Need more modules", "DNS"], answer: 1, explanation: "No coupling." },
                { question: "Guard?", options: ["Hope", "Env-named backend + assert var.env matches", "One state for all", "Local state"], answer: 1, explanation: "Make the combo fail plan." },
                { question: "Prod apply policy?", options: ["Always -auto-approve", "Plan in CI, apply with a gate", "Apply from laptops unsigned", "No remote state"], answer: 1, explanation: "A human reads destroys." },
              ],
              "Stop. Isolate. Gate.",
              "hard",
              250,
            ),
          ],
        },
      ],
    },
    {
      key: "drift",
      title: "State & Drift",
      subtitle: "Reality vs memory",
      missions: [
        {
          key: "drift",
          title: "Someone clicked",
          summary: "refresh, import, replace.",
          concept: { key: "drift", name: "Drift", axis: "problem" },
          teach: {
            title: "Name the mismatch",
            body: "Plan shows drift. Import existing. Never delete state to “fix” prod. terraform state rm is surgery, not a lifestyle.",
          },
          questions: [
            match("Tool.", [
              { left: "Object exists, not in state", right: "import" },
              { left: "State has ID, cloud doesn't", right: "remove or recreate carefully" },
              { left: "Cloud changed attributes", right: "plan shows update" },
              { left: "Need a new instance, same address", right: "replaced" },
            ], "Name the mismatch."),
            tf("rm the state file is the documented prod recovery.", false, "You lose the map."),
            fill("Bring an existing cloud object under Terraform with ___.", "import", "Import.", ["terraform import"]),
          ],
        },
        {
          key: "import",
          title: "Import is a wedding",
          summary: "IDs must match the address.",
          concept: { key: "import", name: "Import", axis: "execution" },
          teach: {
            title: "Write the config first",
            body: "Empty resource block → import ID → plan should be small. A huge plan after import means the config does not describe reality yet.",
          },
          questions: [
            order("Import a bucket.", ["Write a matching resource block", "import the cloud id", "plan", "apply only leftover diffs you intend"], "Config, then wedding, then tiny plan."),
            scenario(
              "After import, plan wants to replace the database.",
              "You?",
              ["Apply to finish the wedding", "Stop. Diff the force-new attributes vs reality", "Delete the DB", "No state"],
              1,
              "Import is not a replace.",
            ),
          ],
        },
        {
          key: "moved",
          title: "Rename without replace",
          summary: "moved blocks.",
          concept: { key: "moved", name: "State moves", axis: "execution" },
          teach: {
            title: "The address is identity",
            body: "Renaming aws_instance.web to aws_instance.app without moved looks like destroy+create. moved { from = ... to = ... } keeps the ID.",
          },
          questions: [
            mcq("You renamed a resource. Plan shows destroy+create. Fix?", ["Apply faster", "moved block / state mv, then plan", "Delete cloud first", "New backend"], 1, "Keep the ID."),
            tf("Changing a resource name is always in-place.", false, "The address is the identity in state."),
          ],
        },
      ],
    },
    {
      key: "final",
      title: "Final Boss: The startup stack",
      subtitle: "Requirements in. City out.",
      isBoss: true,
      missions: [
        {
          key: "final",
          title: "Provision the company",
          summary: "Design and write the stack.",
          kind: "boss",
          minutes: 18,
          concept: { key: "final", name: "Greenfield stack", axis: "problem" },
          teach: {
            title: "The brief",
            body: "VPC, two AZ, app service, database, secrets, logs, separate prod state.",
          },
          questions: [
            challenge(
              "THE STARTUP",
              "Need public app, private db, staging + prod.",
              [
                { question: "Network?", options: ["Public db", "Private subnets for db, public edge only for app", "Flat 0.0.0.0/0 everywhere", "No VPC"], answer: 1, explanation: "Least exposure." },
                { question: "State?", options: ["Laptop terraform.tfstate in Slack", "Remote backend, locked, per env", "Email tfstate", "No state"], answer: 1, explanation: "Remote + lock." },
                { question: "Reuse?", options: ["Copy pasta 3 folders of 2k lines", "Module for the pattern, env tfvars for differences", "One apply for both envs same state", "Clickops"], answer: 1, explanation: "Module + isolated state." },
                { question: "A plan shows DB replace on a tag change. You?", options: ["Apply Friday 5pm", "Stop, read force-new, prevent_destroy, fix config", "Delete state", "-auto-approve"], answer: 1, explanation: "Destroy in plan is a halt." },
              ],
              "Design, then declare.",
              "hard",
              1000,
            ),
          ],
        },
      ],
    },
  ],
});
