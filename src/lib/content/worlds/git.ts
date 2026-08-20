import { buildWorld, challenge, fill, identify, match, mcq, order, scenario, tf } from "../factory";

export const gitSkill = buildWorld({
  id: "git",
  name: "Git & GitHub",
  fantasy: "THE CODE TIME TRAVELLER",
  tagline: "Every save point is a choice. Don't lose the timeline.",
  description: "Commits, branches, remotes, PRs, conflicts, and recovering the past.",
  category: "Code Worlds",
  difficulty: "beginner",
  hours: 10,
  icon: "git-branch",
  trial: {
    key: "trial",
    title: "Recover the deleted commit",
    summary: "Production vanished a change. You have reflog.",
    minutes: 4,
    concept: { key: "trial", name: "Recovery instincts", axis: "problem" },
    teach: {
      title: "Nothing is gone until GC",
      body: "HEAD moved. The commit still has a hash. Reflog is the time machine.",
      bullets: ["reset moves a pointer; it does not immediately shred objects", "reflog lists where HEAD has been", "force-push is how you make the mistake public"],
    },
    example: {
      title: "The hash is still there",
      body: "git reflog → abc123 HEAD@{2}: commit: add timeout → git cherry-pick abc123",
      callout: "If you can name the hash, you can bring it back.",
    },
    questions: [
      scenario(
        "You reset --hard and a feature commit vanished from main. First move?",
        "You have the hash in git reflog from 20 minutes ago.",
        ["Reinstall git", "git checkout the reflog hash / git cherry-pick it", "Delete the repo", "Force push empty"],
        1,
        "Reflog still points at the commit.",
      ),
      mcq("The commit is only on your laptop. Safe recovery?", ["reset --hard origin/main then cry", "cherry-pick or branch from the reflog hash", "rm -rf .git", "Amend a random file on origin"], 1, "Create a branch at the hash so it has a name again."),
      tf("git gc immediately deletes every dangling commit.", false, "GC is delayed. Reflog keeps a leash for weeks by default."),
      identify(
        "What is this line?",
        "e4f21a1 HEAD@{1}: reset: moving to HEAD~1",
        ["A remote URL", "Reflog: you moved HEAD off a commit", "A GitHub Action", "A Dockerfile"],
        1,
        "HEAD@{1} is the previous HEAD.",
      ),
    ],
  },
  levels: [
    {
      key: "checkpoint",
      title: "Checkpoint",
      subtitle: "Repo, staging, commit = save point",
      missions: [
        {
          key: "commit",
          title: "Make a save point",
          summary: "Working tree → stage → commit.",
          concept: { key: "commit", name: "Commits", axis: "knowledge" },
          teach: {
            title: "Three places",
            body: "Working tree is your files. Staging is the next snapshot. A commit is the immutable save.",
            bullets: ["status is the map", "add is a choice, not a reflex", "commit messages are for humans in a year"],
          },
          example: {
            title: "One honest commit",
            body: "edit auth.ts → git add auth.ts → git commit -m \"Reject empty passwords\"",
            callout: "Do not add .env because it is sitting there.",
          },
          questions: [
            order("Create a checkpoint.", ["Edit files", "git add (stage)", "git commit", "Get a hash"], "Stage is intentional."),
            match("Name the area.", [
              { left: "Unstaged edits", right: "Working tree" },
              { left: "git add", right: "Index / staging" },
              { left: "git commit", right: "Snapshot in history" },
              { left: "git status", right: "What's different" },
            ], "Three places, one status."),
            fill("A commit is identified by a ___.", "hash", "The SHA.", ["sha", "sha1"]),
            tf("git commit records the entire working tree automatically.", false, "Only what you staged (unless you use flags that still respect ignore)."),
          ],
        },
        {
          key: "status",
          title: "Read the map",
          summary: "status, diff, ignored files.",
          concept: { key: "status", name: "Status and diff", axis: "execution" },
          teach: {
            title: "Red vs green",
            body: "Unstaged diff is the working tree. Staged diff is the next commit. .gitignore is a promise not to track junk.",
          },
          questions: [
            mcq("You changed two files, added one. git diff (no flags) shows?", ["Only the unstaged file", "Both files", "The last commit", "Remote main"], 0, "Bare diff is unstaged."),
            identify("What should not be committed?", ".env\nnode_modules/\n*.pem", ["Source files", "Secrets and dependencies", "README", "Tests"], 1, "Ignore them."),
            tf("git diff --staged shows what the next commit will contain.", true, "That is the index."),
          ],
        },
        {
          key: "message",
          title: "Write a message a human can use",
          summary: "Why, not “fix”.",
          concept: { key: "msg", name: "Commit messages", axis: "problem" },
          teach: {
            title: "The log is a product",
            body: "Subject line: imperative, specific. Body: why, risk, rollback. “wip” is a local sticky note, not a merge.",
          },
          questions: [
            mcq("Best subject?", ["fix", "asdf", "Reject empty passwords on login", "Updated files"], 2, "Say the change."),
            scenario(
              "A commit says “misc”. Six months later production breaks in that area.",
              "Cost?",
              ["None", "You cannot bisect or review intent", "Git deletes it", "GitHub refunds you"],
              1,
              "Messages are the map for bisect and blame.",
            ),
          ],
        },
        {
          key: "init",
          title: "A repo is a folder with a memory",
          summary: "init, clone, the .git directory.",
          concept: { key: "init", name: "Repositories", axis: "knowledge" },
          teach: {
            title: ".git is the database",
            body: "init starts empty history. clone copies history and sets origin. Delete .git and you have files without a time machine.",
          },
          questions: [
            match("Command → result", [
              { left: "git init", right: "Empty repo here" },
              { left: "git clone", right: "Copy remote history" },
              { left: ".git/", right: "Object database" },
              { left: "working tree", right: "Files you edit" },
            ], "Database vs checkout."),
            tf("You can have two git repos nested by accident and a lot of pain.", true, "status in the wrong folder is a classic."),
          ],
        },
      ],
    },
    {
      key: "history",
      title: "History",
      subtitle: "log, diff, blame the past fairly",
      missions: [
        {
          key: "bug",
          title: "Find the commit that introduced the bug",
          summary: "Read the timeline.",
          concept: { key: "log", name: "History", axis: "problem" },
          teach: { title: "log and diff", body: "log lists. diff compares. bisect when the list is long." },
          example: {
            title: "A tight log",
            body: "git log --oneline -- auth.ts   then   git diff abc123^ abc123 -- auth.ts",
            callout: "Name the path. Don't scroll the universe.",
          },
          questions: [
            mcq("A test started failing after lunch. Fastest honest tool?", ["Rewrite all files", "git log / git bisect", "Delete tests", "Force push"], 1, "Walk history."),
            tf("git diff HEAD shows commits from last year.", false, "diff is the working delta unless you name two commits."),
            order("Hunt a regression.", ["Reproduce on HEAD", "Find a known-good commit", "bisect or walk log", "Read the diff that first fails"], "Good vs bad, then the diff."),
            fill("git ___ searches history for a bug by binary search.", "bisect", "bisect automates good/bad.", ["git bisect"]),
          ],
        },
        {
          key: "blame",
          title: "Blame without the drama",
          summary: "Who last touched the line — and when.",
          concept: { key: "blame", name: "Annotate", axis: "knowledge" },
          teach: {
            title: "A line has a last author",
            body: "blame/annotate shows the commit that last changed a line. The author is a lead, not a verdict. The commit message is the why.",
          },
          questions: [
            mcq("blame says Alice changed the timeout in March. Next?", ["Fire Alice", "Read that commit and the tests around it", "Reset --hard 2019", "Delete the file"], 1, "The commit is the artefact."),
            tf("blame rewrites history to punish people.", false, "It annotates. It does not judge."),
          ],
        },
        {
          key: "show",
          title: "One commit, one story",
          summary: "show, log -p, pickaxe.",
          concept: { key: "show", name: "Read a commit", axis: "execution" },
          teach: {
            title: "git show is a briefing",
            body: "Header + diff. -S finds when a string entered or left. You are collecting evidence, not vibes.",
          },
          questions: [
            identify("What command produced this?", "commit 9af…\nAuthor: Sam\n    Fix nil timeout\n\ndiff --git a/cfg.go", ["git status", "git show", "git stash", "git clean"], 1, "show = metadata + patch."),
            scenario(
              "A constant API_URL disappeared. You don't know when.",
              "Tool?",
              ["git log -S API_URL", "Reinstall Node", "Delete remotes", "Force push"],
              0,
              "Pickaxe (-S) tracks the string.",
            ),
          ],
        },
      ],
    },
    {
      key: "branches",
      title: "Branches",
      subtitle: "main, feature-a, bugfix",
      missions: [
        {
          key: "branch",
          title: "Create a branch and merge it",
          summary: "Parallel timelines.",
          concept: { key: "branch", name: "Branches", axis: "execution" },
          teach: { title: "A branch is a pointer", body: "Cheap labels on commits. Merge brings histories together." },
          questions: [
            identify(
              "What does this draw?",
              "main\n ├── feature-a\n └── bugfix",
              ["Three remotes", "Diverging lines of work", "A Dockerfile", "A volume"],
              1,
              "Pointers on the graph.",
            ),
            order("Land a feature.", ["git switch -c feature-a", "Commit work", "switch main", "merge feature-a"], "Branch, work, return, merge."),
            tf("Creating a branch copies all files on disk twice.", false, "A branch is a 41-byte pointer plus commits."),
            fill("The branch you have checked out is ___.", "HEAD", "HEAD names the current branch or commit.", ["head"]),
          ],
        },
        {
          key: "switch",
          title: "Don't mix two jobs",
          summary: "Dirty tree, stash, one intent per branch.",
          concept: { key: "switch", name: "Switching branches", axis: "problem" },
          teach: {
            title: "Uncommitted work is sticky",
            body: "switch refuses if it would overwrite. stash parks a mess. Better: commit on the right branch.",
          },
          questions: [
            scenario(
              "You started a hotfix on feature-login by accident. Files uncommitted.",
              "Move?",
              ["Delete the files", "stash or commit, switch, cherry-pick/stash pop on hotfix branch", "force checkout -f always", "push to main"],
              1,
              "Park the work, then put it on the right pointer.",
            ),
            mcq("stash pop on the wrong branch?", ["Always safe", "Can conflict; still a valid recovery path", "Deletes remotes", "Formats the disk"], 1, "Stash is a patch. Patches can clash."),
          ],
        },
        {
          key: "ff",
          title: "Fast-forward vs a merge commit",
          summary: "When history stays a line.",
          concept: { key: "ff", name: "Merge shapes", axis: "knowledge" },
          teach: {
            title: "Two ways to join",
            body: "Fast-forward slides the pointer. A merge commit has two parents. Teams pick a policy. Neither is magic.",
          },
          questions: [
            match("Shape → meaning", [
              { left: "Fast-forward", right: "Pointer slides; linear" },
              { left: "Merge commit", right: "Two parents" },
              { left: "Rebase", right: "Replay commits on a new base" },
              { left: "Squash", right: "One commit on the target" },
            ], "Policy, not morality."),
            tf("Rebase of a published shared branch is a friendly default.", false, "Rewriting public history needs a warning and a plan."),
          ],
        },
      ],
    },
    {
      key: "remotes",
      title: "Remotes",
      subtitle: "clone, push, pull, fetch",
      missions: [
        {
          key: "behind",
          title: "Your local repo is behind",
          summary: "Bring it up to date.",
          concept: { key: "remote", name: "Remotes", axis: "execution" },
          teach: { title: "fetch vs pull", body: "fetch updates remote-tracking branches. pull fetches and merges (or rebases)." },
          questions: [
            mcq("Safest first move when unsure?", ["git push --force", "git fetch then inspect", "rm -rf .git", "Commit secrets"], 1, "See, then integrate."),
            fill("git clone copies a repo from a ___.", "remote", "Usually origin."),
            tf("origin/main is a local branch you commit to by default.", false, "It is a remote-tracking snapshot. You commit to main, then push."),
          ],
        },
        {
          key: "push",
          title: "Send the timeline",
          summary: "upstream, rejected non-fast-forward.",
          concept: { key: "push", name: "Push", axis: "execution" },
          teach: {
            title: "The remote said no",
            body: "rejected non-fast-forward means their main moved. fetch, integrate, push. --force on main is an incident.",
          },
          questions: [
            scenario(
              "push rejected. Your two commits, theirs three new ones on origin/main.",
              "Do?",
              ["--force", "fetch, rebase or merge, push", "delete origin", "amend -f"],
              1,
              "Integrate, then push.",
            ),
            mcq("-u origin feature-a does?", ["Deletes main", "Sets upstream so later push/pull know where", "Force push", "Creates a tag"], 1, "Upstream tracking."),
          ],
        },
        {
          key: "fetch",
          title: "Look without merging",
          summary: "fetch is reconnaissance.",
          concept: { key: "fetch", name: "Fetch", axis: "knowledge" },
          teach: {
            title: "Download, don't mix",
            body: "fetch updates remotes/origin/*. Your working tree stays. log HEAD..origin/main is the incoming list.",
          },
          questions: [
            order("Catch up safely.", ["git fetch", "Read origin/main log", "merge or rebase", "push your branch"], "See, then join."),
            tf("fetch overwrites your uncommitted files.", false, "fetch writes remote-tracking refs."),
          ],
        },
      ],
    },
    {
      key: "pr",
      title: "Pull Requests",
      subtitle: "Review like a teammate",
      missions: [
        {
          key: "review",
          title: "Approve or request changes",
          summary: "NPC teammates submit diffs.",
          concept: { key: "pr", name: "Code review", axis: "problem" },
          teach: { title: "A PR is a proposal", body: "You review behaviour, tests, and blast radius — not fashion." },
          questions: [
            scenario(
              "A PR deletes error handling “for speed”. Tests still pass because they never threw.",
              "What do you do?",
              ["Approve — tests are green", "Request changes: restore handling and add a failing test", "Force merge", "Close git"],
              1,
              "Green tests can be incomplete.",
            ),
            mcq("Review order?", ["CSS first", "Behaviour, tests, then nits", "Commit timestamps", "Author's job title"], 1, "Risk first."),
            tf("A 2,000-file PR is easier to review than five small ones.", false, "Small PRs have a blast radius you can hold in your head."),
          ],
        },
        {
          key: "pr-hygiene",
          title: "Open a PR that can merge",
          summary: "Description, checks, draft.",
          concept: { key: "prhygiene", name: "PR hygiene", axis: "execution" },
          teach: {
            title: "The description is the brief",
            body: "Why, how to test, screenshots if UI. Draft until CI is honest. Don't @everyone for a typo.",
          },
          questions: [
            match("Field → job", [
              { left: "Title", right: "One-line intent" },
              { left: "Body", right: "Why + test plan" },
              { left: "Checks", right: "CI truth" },
              { left: "Reviewers", right: "People who own the risk" },
            ], "A PR is a document."),
            identify("Ship blocker?", "All checks red. Author: “merge anyway, it's flaky”. Diff: auth rewrite.", ["Merge", "Do not merge; fix or prove flake", "Delete CI", "Force"], 1, "Auth + red checks = stop."),
          ],
        },
        {
          key: "midboss-pr",
          title: "Boss: The reckless merge",
          summary: "A teammate wants --no-verify on main.",
          kind: "boss",
          minutes: 10,
          concept: { key: "midboss-pr", name: "Protect main", axis: "problem" },
          teach: { title: "Main is a product", body: "Hooks, reviews, and CI exist because Friday deploys remember." },
          questions: [
            challenge(
              "THE RECKLESS MERGE",
              "Hotfix. CI red. Author force-pushed over a colleague's commit on the shared branch.",
              [
                { question: "Force-push on a shared branch?", options: ["Fine", "Rewrote their work; restore from reflog/remote if needed", "Deletes GitHub", "Required"], answer: 1, explanation: "Shared branches are not private." },
                { question: "Red CI on auth?", options: ["Merge", "Block", "Turn off required checks forever", "Merge then look"], answer: 1, explanation: "Auth + red = block." },
                { question: "Hotfix path?", options: ["Direct to main, no PR", "Small PR, green checks, revert plan", "email the diff", "stash on prod"], answer: 1, explanation: "Fast still has a trail." },
              ],
              "Protect the timeline.",
              "hard",
              250,
            ),
          ],
        },
      ],
    },
    {
      key: "conflict",
      title: "Merge Conflicts",
      subtitle: "Two people, one line",
      missions: [
        {
          key: "conflict",
          title: "Resolve the conflict",
          summary: "A dedicated fight.",
          concept: { key: "conflict", name: "Conflicts", axis: "execution" },
          teach: {
            title: "Markers are the map",
            body: "<<<<<<< HEAD is you. ======= divider. >>>>>>> theirs. Keep the correct intent, delete markers, commit.",
          },
          questions: [
            identify(
              "What must not ship?",
              "<<<<<<< HEAD\nreturn 1\n=======\nreturn 2\n>>>>>>> feature",
              ["Conflict markers", "A return", "A comment", "A branch name"],
              0,
              "Markers are not code.",
            ),
            order("Resolve.", ["See the conflicted files", "Edit to the intended result", "git add", "git commit"], "Edit, stage, commit."),
            tf("Accepting both sides blindly is a valid default.", false, "Both sides can be wrong together. Choose intent."),
          ],
        },
        {
          key: "conflict-hard",
          title: "The same function, two truths",
          summary: "Behaviour merge, not text merge.",
          concept: { key: "conflicthard", name: "Semantic conflicts", axis: "problem" },
          teach: {
            title: "Git only sees text",
            body: "A clean merge can still be a logic bug. Run the tests. Read the function, not just the markers.",
          },
          questions: [
            scenario(
              "Merge is clean. Tests fail: one side added a required arg, the other added a caller without it.",
              "This is?",
              ["Git's bug", "A semantic conflict — fix the callers", "Need rebase forever", "Ignore tests"],
              1,
              "Text merged. Behaviour did not.",
            ),
            mcq("After resolving, the file still has <<<<<<<. You?", ["Commit anyway", "Search and delete leftover markers", "reset --hard origin", "blame GitHub"], 1, "Grep the markers."),
          ],
        },
        {
          key: "conflict-project",
          title: "Mini-project: Unblock the release",
          summary: "Two features, one module.",
          kind: "project",
          minutes: 12,
          concept: { key: "conflictproj", name: "Conflict lab", axis: "execution" },
          teach: { title: "Release is waiting", body: "Keep both features' intent. Leave no markers. Tests green." },
          questions: [
            challenge(
              "UNBLOCK THE RELEASE",
              "main added logging. feature added a timeout. Same function. Markers in cfg.ts.",
              [
                { question: "Keep?", options: ["Only logging", "Only timeout", "Both behaviours, one clean function", "Delete the file"], answer: 2, explanation: "Intent from both sides." },
                { question: "Then?", options: ["push -f main", "add, commit the merge, run tests", "delete .git", "amend 40 commits"], answer: 1, explanation: "Finish the merge properly." },
                { question: "Ship markers?", options: ["Yes if comments", "Never", "Only in README", "On Fridays"], answer: 1, explanation: "Markers are not code." },
              ],
              "Intent, then tests.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "time",
      title: "Time Travel",
      subtitle: "revert, reset, restore, reflog",
      missions: [
        {
          key: "recover",
          title: "You deleted an important commit",
          summary: "Recover it.",
          concept: { key: "reflog", name: "Recovery", axis: "problem" },
          teach: { title: "revert vs reset", body: "revert adds a new commit that undoes. reset moves a pointer. restore edits files. reflog remembers HEAD." },
          questions: [
            match("Pick the tool.", [
              { left: "Undo a commit already on origin/main", right: "git revert" },
              { left: "Move a local unpushed branch pointer", right: "git reset" },
              { left: "Throw away a file's unstaged edits", right: "git restore" },
              { left: "Find a “lost” commit", right: "git reflog" },
            ], "Public history: revert. Private: reset."),
            tf("git reset --hard on a pushed main is a friendly default.", false, "You rewrite published history."),
            fill("Public undo of a commit is git ___.", "revert", "Adds a new commit that inverts the diff."),
          ],
        },
        {
          key: "restore",
          title: "Files vs history",
          summary: "restore, checkout, clean.",
          concept: { key: "restore", name: "Restore files", axis: "execution" },
          teach: {
            title: "Don't reset when you meant restore",
            body: "restore a file from HEAD. clean drops untracked. reset --hard is a grenade.",
          },
          questions: [
            mcq("Discard unstaged edits in one file?", ["reset --hard", "git restore path", "rm .git", "push -f"], 1, "Surgical."),
            tf("git clean -fd deletes untracked files and dirs.", true, "That is the point — and the danger."),
          ],
        },
        {
          key: "amend",
          title: "The last commit is yours — until it isn't",
          summary: "amend, rebase -i, never rewrite origin/main.",
          concept: { key: "amend", name: "Rewrite local history", axis: "knowledge" },
          teach: {
            title: "Private clay, public stone",
            body: "amend the last unpushed commit. After others pulled it, amend is a lie they have to reconcile.",
          },
          questions: [
            scenario(
              "You committed .env on a branch you already pushed and others pulled.",
              "Fix?",
              ["amend and force-push", "New commit that deletes .env; rotate the secrets", "Ignore", "reset --hard 2018 on main"],
              1,
              "Secrets are burned. Rotate. Don't pretend history is private.",
            ),
            tf("Interactive rebase of five local unpushed commits is a normal cleanup.", true, "Local only."),
          ],
        },
      ],
    },
    {
      key: "team",
      title: "Team Workflow",
      subtitle: "branch → commit → push → PR → review → merge",
      missions: [
        {
          key: "flow",
          title: "Play the team",
          summary: "The whole loop.",
          concept: { key: "flow", name: "Team flow", axis: "execution" },
          teach: { title: "Small PRs", body: "One intent per branch. Describe the why." },
          questions: [
            order("Ship with the team.", ["Branch", "Commit", "Push", "Open PR", "Review", "Merge"], "Never merge unreviewed prod as a habit."),
            mcq("Two features in one branch?", ["Faster", "Harder to review and revert", "Required by git", "Skips CI"], 1, "One intent."),
            tf("Direct commits to main are a fine default on a five-person product.", false, "PRs are the review surface."),
          ],
        },
        {
          key: "hooks",
          title: "Guards on the timeline",
          summary: "hooks, CODEOWNERS, protected branches.",
          concept: { key: "hooks", name: "Guards", axis: "knowledge" },
          teach: {
            title: "Make the right path easy",
            body: "pre-commit catches secrets. Protected main requires reviews. CODEOWNERS routes the right eyes.",
          },
          questions: [
            match("Guard → job", [
              { left: "Protected branch", right: "No force-push / require PR" },
              { left: "CODEOWNERS", right: "Required reviewers by path" },
              { left: "pre-commit", right: "Local secret/lint gate" },
              { left: "CI", right: "Proof on a clean machine" },
            ], "Layers."),
            tf("Disabling required reviews “just this once” is how incidents start.", true, "The exception becomes the process."),
          ],
        },
        {
          key: "handoff",
          title: "Monday you are gone. The repo still works.",
          summary: "README, CONTRIBUTING, who owns main.",
          concept: { key: "handoff", name: "Team handoff", axis: "problem" },
          teach: {
            title: "The next person is the product",
            body: "How to run tests. How to open a PR. Who can merge. If it lives only in your head, it is not a team workflow.",
          },
          questions: [
            mcq("A new hire's first PR. They cannot find how to run tests. Failure is?", ["Git", "Missing runbook in the repo", "Too many branches", "Need a new host"], 1, "Document the path."),
            tf("“Ask me on Slack” is an acceptable substitute for CONTRIBUTING.md on a product team.", false, "Slack is not a checkout."),
            scenario(
              "Only one person can merge. They are on a plane. A hotfix is waiting.",
              "Prevent?",
              ["Wait for the plane", "Two owners + protected branch rules written down", "Disable protection", "Force-push from a café"],
              1,
              "Bus factor is a git policy, not a vibe.",
            ),
          ],
        },
      ],
    },
    {
      key: "final",
      title: "Final Boss: Production Broken",
      subtitle: "Find the offending commit. Restore. Submit the fix.",
      isBoss: true,
      missions: [
        {
          key: "final",
          title: "Production broken",
          summary: "A simulated team broke main.",
          kind: "boss",
          minutes: 16,
          concept: { key: "final", name: "Incident recovery", axis: "problem" },
          teach: { title: "Don't make it worse", body: "Identify. Revert or forward-fix. PR. Don't force-push main." },
          questions: [
            challenge(
              "PRODUCTION BROKEN",
              "Error started at 14:02. git log shows a config commit at 14:01 that removed a timeout. The commit is on origin/main. A panicked intern wants reset --hard and force push.",
              [
                { question: "Identify?", options: ["The 14:01 config commit", "A random CSS change", "The original author from 2019", "Docker"], answer: 0, explanation: "Time + log." },
                { question: "On origin/main, restore service?", options: ["reset --hard and force push", "git revert the offending commit and ship a PR", "Delete main", "Amend and force"], answer: 1, explanation: "Revert is the public undo." },
                { question: "Then?", options: ["Turn off CI", "Add a test that would have caught it", "Ban git", "Hide logs"], answer: 1, explanation: "Lock the door." },
                { question: "Intern's force-push?", options: ["Do it", "Refuse — it rewrites everyone else's timeline", "Only if they say please", "After deleting reflog"], answer: 1, explanation: "Main is public stone." },
              ],
              "Find. Revert. Guard.",
              "hard",
              1000,
            ),
          ],
        },
      ],
    },
  ],
});
