import { buildWorld, challenge, fill, identify, match, mcq, order, scenario, tf } from "../factory";

export const dockerSkill = buildWorld({
  id: "docker",
  name: "Docker",
  fantasy: "THE CONTAINER ENGINEER",
  tagline: "It works on my machine. Now make it work everywhere.",
  description: "Images, containers, Dockerfiles, volumes, networks, Compose — then debug production.",
  category: "Ops Worlds",
  difficulty: "intermediate",
  hours: 12,
  icon: "boxes",
  trial: {
    key: "trial",
    title: "Fix the broken container",
    summary: "It exits. You have logs. Restore it.",
    minutes: 4,
    concept: { key: "trial", name: "Container instincts", axis: "problem" },
    teach: {
      title: "The box is dead",
      body: "Status Exited (1). Logs: “bind: address already in use.” Do not rebuild the universe. Read the failure.",
      bullets: ["The log names the layer that failed", "Host ports are scarce", "The image is usually innocent"],
    },
    example: {
      title: "The line that matters",
      body: "Error starting userland proxy: listen tcp4 0.0.0.0:80: bind: address already in use.",
      callout: "That is the host. Not nginx. Not the registry.",
    },
    questions: [
      scenario(
        "What is actually wrong?",
        "docker run -p 80:80 nginx. Exit 1. Log: address already in use.",
        ["The image is corrupt", "Host port 80 is taken", "Need Kubernetes", "Delete Docker"],
        1,
        "Port bind failed on the host. Something else already owns 80.",
      ),
      mcq("Fastest fix to confirm the image is fine?", ["Reinstall Docker Desktop", "Map a free host port e.g. 8080:80", "Rewrite nginx in Rust", "Disable all networks"], 1, "Change the host mapping. If it starts, the image was never the bug."),
      tf("EXPOSE 80 in the Dockerfile publishes port 80 on your laptop.", false, "EXPOSE is documentation. -p / publish is what binds the host."),
      identify(
        "Which flag is the bind?",
        "docker run -d --name web -p 8080:80 nginx:1.27",
        ["-d", "-p 8080:80", "--name web", "nginx:1.27"],
        1,
        "Left of the colon is the host. Right is the container.",
      ),
    ],
  },
  levels: [
    {
      key: "containers",
      title: "Containers",
      subtitle: "Images vs running boxes",
      missions: [
        {
          key: "meet",
          title: "Run nginx",
          summary: "Run, inspect, stop, restart.",
          concept: { key: "run", name: "Run a container", axis: "execution" },
          teach: {
            title: "A container is a running process + filesystem",
            body: "An image is the recipe. A container is a running instance. Registries store images. The engine runs them in isolation.",
            bullets: ["docker run creates a container from an image", "docker ps lists running boxes", "stop is not delete"],
          },
          example: {
            title: "One honest session",
            body: "docker run -d --name web nginx:1.27 → docker ps → docker stop web → docker start web.",
            callout: "The name is yours. The image is the recipe.",
          },
          questions: [
            match("Name the thing.", [
              { left: "nginx:latest on Docker Hub", right: "Image in a registry" },
              { left: "docker run nginx", right: "Creates a container" },
              { left: "docker ps", right: "Lists running containers" },
              { left: "docker stop", right: "Stops a container" },
            ], "Image ≠ container."),
            mcq("Which is a running container?", ["The nginx image digest", "An entry in docker ps with STATUS Up", "A Dockerfile", "A Git tag"], 1, "ps shows processes."),
            order("First session.", ["Pull or run nginx", "Inspect it", "Stop it", "Start it again"], "Run → inspect → stop → start."),
            tf("docker rm deletes the image from Docker Hub.", false, "rm removes a container. rmi removes a local image."),
          ],
        },
        {
          key: "ps",
          title: "Who is alive?",
          summary: "ps, inspect, logs — three glances.",
          concept: { key: "ps", name: "Inspect running boxes", axis: "knowledge" },
          teach: {
            title: "Look before you rebuild",
            body: "ps is the roster. logs is the last words. inspect is the JSON autopsy. Guessing is slower.",
          },
          example: {
            title: "Exited (1)",
            body: "STATUS Exited (1) means the process died. The code is in logs, not in a forum thread.",
            callout: "Exit 0 is success. Anything else is a confession.",
          },
          questions: [
            mcq("You need yesterday's crash line. First command?", ["docker logs", "docker system prune -a", "docker rmi -f", "Reboot"], 0, "Logs first. Prune last."),
            identify("What does this tell you?", "CONTAINER  STATUS  PORTS\nweb        Up 3m    0.0.0.0:8080->80/tcp", ["Image is missing", "Host 8080 maps to container 80", "The container never started", "Need Compose"], 1, "The arrow is the publish map."),
            tf("docker ps -a also shows stopped containers.", true, "Default ps hides the dead. -a shows the morgue."),
          ],
        },
        {
          key: "lifecycle",
          title: "Mortal boxes",
          summary: "Create, start, stop, rm — pick the verb.",
          concept: { key: "life", name: "Container lifecycle", axis: "execution" },
          teach: {
            title: "Four verbs",
            body: "run = create + start. stop leaves the box. rm deletes it. restart is stop then start on the same box.",
          },
          questions: [
            match("Verb → effect", [
              { left: "docker stop", right: "Process dies, filesystem stays" },
              { left: "docker rm", right: "Container gone" },
              { left: "docker start", right: "Same container, new process" },
              { left: "docker run", right: "New container from an image" },
            ], "stop ≠ rm."),
            scenario(
              "You docker rm a box that had a file you wrote inside. The file is gone. Why?",
              "The file lived on the container writable layer.",
              ["Docker Hub deleted it", "Writable layer dies with the container", "Need Kubernetes", "Images cannot have files"],
              1,
              "Unless you used a volume, the writable layer is mortal.",
            ),
            fill("docker run is create plus ___.", "start", "run = create + start.", ["Start"]),
          ],
        },
        {
          key: "isolation",
          title: "Why the box exists",
          summary: "Process + filesystem + network namespace.",
          concept: { key: "iso", name: "Isolation", axis: "knowledge" },
          teach: {
            title: "Not a tiny VM",
            body: "A container shares the host kernel. It isolates the process, the files, and the network view. That is why it starts in seconds.",
          },
          questions: [
            mcq("A container vs a VM?", ["Container has its own kernel", "VM shares the host kernel", "Container shares the host kernel", "They are the same"], 2, "VMs virtualise hardware. Containers isolate processes."),
            tf("Two containers can bind the same host port at once.", false, "A host port is unique. Container ports can overlap because they are namespaced."),
            mcq("nginx in a container listens on 80. You did not publish. Can your laptop browser hit it?", ["Yes, always", "Only via the container network / publish", "Only on Fridays", "Yes, Docker Hub proxies it"], 1, "Unpublished ports stay inside the engine network."),
          ],
        },
      ],
    },
    {
      key: "images",
      title: "Images",
      subtitle: "Tags, layers, history",
      missions: [
        {
          key: "tags",
          title: "Find the right Node",
          summary: "Tags are not suggestions.",
          concept: { key: "tags", name: "Tags and layers", axis: "knowledge" },
          teach: {
            title: "latest is a moving target",
            body: "Pin versions. Layers are stacked diffs. History shows how the image was built.",
            bullets: ["A tag is a pointer at a digest", "Digests do not move. Tags do", "alpine vs full OS is a size decision"],
          },
          example: {
            title: "Same digest, two names",
            body: "node:20.11-alpine and a team's node:web-prod can both point at sha256:abc…",
            callout: "Production pins the digest or an immutable version tag.",
          },
          questions: [
            mcq("Safest tag for production Node 20?", ["latest", "node:20.11-alpine", "node", "random"], 1, "Pin version and variant."),
            tf("Two tags can point at the same image digest.", true, "Tags are pointers."),
            identify("What is this output?", "IMAGE  created by COPY package.json", ["A running container", "An image layer", "A volume", "A network"], 1, "history/layers."),
            fill("The immutable id of an image is its ___.", "digest", "sha256 digest. Tags move.", ["sha", "sha256", "hash"]),
          ],
        },
        {
          key: "hub",
          title: "Trust the registry",
          summary: "Pull, digest, official vs random.",
          concept: { key: "hub", name: "Registries", axis: "problem" },
          teach: {
            title: "You run what you pull",
            body: "Docker Hub, GHCR, ECR — same idea. Official images still need a pin. Random user/malware:latest is not a plan.",
          },
          questions: [
            scenario(
              "A teammate used someuser/node:latest from a blog. CI started mining crypto. Cause?",
              "Unpinned unofficial image. Tag moved to a malicious digest.",
              ["Node is illegal", "Untrusted image + floating tag", "Need more RAM", "Alpine caused it"],
              1,
              "Pull from a registry you control. Pin the digest.",
            ),
            mcq("docker pull node:20.11-alpine downloads…", ["Only the Dockerfile", "The image layers you do not already have", "The whole Hub", "A VM"], 1, "Layers are cached by digest."),
            tf("Official images never have CVEs.", false, "Official means maintained, not immortal. Still pin and patch."),
          ],
        },
        {
          key: "layers",
          title: "The stack you ship",
          summary: "Each instruction is a layer you keep.",
          concept: { key: "layers", name: "Image layers", axis: "execution" },
          teach: {
            title: "Diffs, stacked",
            body: "FROM is the floor. COPY and RUN add layers. Identical layers cache. A changed COPY busts everything after it.",
          },
          questions: [
            order("Cache-friendly Node build.", ["FROM pin", "COPY package files", "RUN npm ci", "COPY source", "CMD"], "Deps before source so source edits reuse npm ci."),
            mcq("You edit one JS file. Why did npm ci run again?", ["Docker is random", "COPY . . happened before npm ci", "CMD reruns ci", "Tags force rebuilds"], 1, "Put the fat COPY after the install."),
            tf("Deleting a file in a later layer removes it from earlier layers' size.", false, "The old layer still ships. Multi-stage or squash is how you drop build junk."),
          ],
        },
        {
          key: "history",
          title: "Read the recipe after the fact",
          summary: "history, inspect, don't guess the FROM.",
          concept: { key: "history", name: "Image history", axis: "knowledge" },
          teach: {
            title: "The image remembers",
            body: "docker history shows created-by lines. inspect Config.Cmd is the default process. You do not need the author's Slack.",
          },
          questions: [
            identify("What is the default process?", "Config.Cmd: [\"nginx\",\"-g\",\"daemon off;\"]", ["A volume", "The CMD the container will run", "A host port", "A tag"], 1, "inspect Config.Cmd."),
            mcq("You need to know if git was COPY'd in. Tool?", ["docker history / inspect", "ping google", "kubectl", "Ignore it"], 0, "History lists COPY/RUN."),
          ],
        },
      ],
    },
    {
      key: "dockerfiles",
      title: "Dockerfiles",
      subtitle: "FROM WORKDIR COPY RUN EXPOSE CMD",
      missions: [
        {
          key: "df",
          title: "Fix the broken Dockerfile",
          summary: "Every instruction is a mission.",
          concept: { key: "df", name: "Dockerfile", axis: "execution" },
          teach: {
            title: "The recipe",
            body: "FROM the base. WORKDIR. COPY files. RUN build. EXPOSE the port you listen on. CMD the process.",
          },
          example: {
            title: "Minimum honest Node file",
            body: "FROM node:20.11-alpine\nWORKDIR /app\nCOPY package*.json .\nRUN npm ci --omit=dev\nCOPY . .\nEXPOSE 3000\nCMD [\"node\",\"server.js\"]",
            callout: "JSON-form CMD is exec form. No extra shell.",
          },
          questions: [
            identify(
              "What is wrong?",
              "FROM node\nCOPY . .\nCMD npm start",
              ["Unpinned base, copies junk, no WORKDIR", "Perfect", "Need 12 FROM lines", "EXPOSE is mandatory for it to run"],
              0,
              "Pin, .dockerignore, WORKDIR.",
            ),
            order("Typical Node Dockerfile.", ["FROM node:20-alpine", "WORKDIR /app", "COPY package*.json .", "RUN npm ci", "COPY . .", "CMD node server.js"], "Deps before full copy = cache."),
            fill("The default process a container starts is defined by ___.", "CMD", "CMD (or ENTRYPOINT) is the process.", ["cmd", "entrypoint"]),
            tf("WORKDIR creates the directory if it is missing.", true, "WORKDIR is mkdir + cd for later instructions."),
          ],
        },
        {
          key: "ignore",
          title: "Don't COPY the landfill",
          summary: ".dockerignore is a security and cache tool.",
          concept: { key: "ignore", name: ".dockerignore", axis: "execution" },
          teach: {
            title: "Context is the upload",
            body: "docker build sends the context. If .git, node_modules, and .env ride along, you ship secrets and bust cache.",
          },
          questions: [
            mcq("Must be in .dockerignore?", [".env and .git", "package.json", "server.js", "Dockerfile"], 0, "Secrets and VCS junk stay on the laptop."),
            identify("Why is the image 900MB on a 20-line app?", "COPY . .\n# no dockerignore\n# node_modules included", ["CMD is large", "The context copied host node_modules", "EXPOSE adds size", "Alpine failed"], 1, "Ignore node_modules. Install inside the image."),
            tf("COPY . . is fine if you have a perfect .dockerignore.", true, "Then COPY is source, not landfill."),
          ],
        },
        {
          key: "cmd",
          title: "PID 1 is the job",
          summary: "CMD vs ENTRYPOINT vs shell form.",
          concept: { key: "cmd", name: "Process contract", axis: "knowledge" },
          teach: {
            title: "Who is PID 1",
            body: "The container lives as long as PID 1. Shell-form CMD wraps a shell. Exec form is the app. Signals go to PID 1.",
          },
          questions: [
            mcq("Prefer for Node?", ["CMD node server.js (shell)", "CMD [\"node\",\"server.js\"]", "ENTRYPOINT sleep infinity", "No CMD"], 1, "Exec form: node is PID 1."),
            tf("EXPOSE 3000 publishes 3000 on the host.", false, "Metadata only. Publish with -p."),
            match("Instruction → job", [
              { left: "FROM", right: "Base image" },
              { left: "RUN", right: "Build-time command" },
              { left: "CMD", right: "Runtime process" },
              { left: "EXPOSE", right: "Documents a port" },
            ], "Build vs run."),
          ],
        },
        {
          key: "webapp",
          title: "Mini-project: Containerise a web app",
          summary: "Ship a tiny server in a box.",
          kind: "project",
          minutes: 12,
          concept: { key: "webapp", name: "Containerise an app", axis: "execution" },
          teach: { title: "It must run with one command", body: "docker build + docker run. If it needs a prayer, it is not done." },
          questions: [
            challenge(
              "Box the app",
              "Small HTTP server. Needs port 3000. Repo has .env and node_modules on disk.",
              [
                { question: "COPY before npm ci with a fat context. Problem?", options: ["Slower rebuilds", "Faster rebuilds", "More security", "Nothing"], answer: 0, explanation: "You bust the cache." },
                { question: "EXPOSE 3000 means?", options: ["Publishes to the host", "Documents the listen port", "Opens the firewall at ISP", "Creates a volume"], answer: 1, explanation: "EXPOSE is metadata. -p publishes." },
                { question: ".env in the image?", options: ["Ship it", "Ignore it; pass runtime env", "Rename to secrets.txt", "Commit to Hub"], answer: 1, explanation: "Runtime env, not baked secrets." },
                { question: "Prove it works?", options: ["Hope", "build, run -p 3000:3000, hit /health", "Only docker history", "Delete other containers"], answer: 1, explanation: "One command path + a request." },
              ],
              "Build, run, hit the port.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "build",
      title: "Build Engineering",
      subtitle: "Cache, ignore, size, multi-stage",
      missions: [
        {
          key: "size",
          title: "1.4GB vs 130MB",
          summary: "Make yours smaller.",
          concept: { key: "size", name: "Image size", axis: "execution" },
          teach: {
            title: "Layers you keep, you ship",
            body: ".dockerignore junk. Multi-stage: build in one image, copy the artefact into a tiny runtime.",
          },
          questions: [
            mcq("Why is the image 1.4GB?", ["node:latest with full OS + node_modules + git history copied", "Alpine is illegal", "EXPOSE adds a gig", "CMD is large"], 0, "Fat base + fat context."),
            tf("Multi-stage builds keep compilers in the final image.", false, "You copy only the output."),
            identify("Which is the runtime stage?", "FROM node:20 AS build\nRUN npm run build\nFROM node:20-alpine\nCOPY --from=build /app/dist ./dist", ["The first FROM", "The second FROM", "RUN npm", "None"], 1, "Last FROM is what you ship unless you name a target."),
          ],
        },
        {
          key: "cache",
          title: "The cache is a weapon",
          summary: "Order instructions for reuse.",
          concept: { key: "cache", name: "Build cache", axis: "execution" },
          teach: {
            title: "Stable lines first",
            body: "Put rarely changing COPY/RUN high. Put source COPY last. --no-cache is for when you distrust the cache, not for every build.",
          },
          questions: [
            order("Bust least often.", ["Pin FROM", "Install OS packages", "Install app deps", "Copy source", "CMD"], "OS then deps then source."),
            mcq("CI is slow every commit. Likely?", ["No layer cache between jobs", "CMD is slow", "EXPOSE rebuilds Node", "Tags print slowly"], 0, "Cache mounts or a registry cache."),
          ],
        },
        {
          key: "user",
          title: "Don't run as root",
          summary: "USER, no secrets in layers.",
          concept: { key: "user", name: "Image hygiene", axis: "problem" },
          teach: {
            title: "Root is a default, not a requirement",
            body: "Create a user. USER it. Never COPY private keys. ARG secrets still leak in history if misused.",
          },
          questions: [
            tf("COPY id_rsa /root/.ssh is a reasonable production pattern.", false, "Keys do not belong in layers."),
            mcq("After USER app, RUN apt-get fails. Why?", ["Alpine hates you", "apt needs root; do it before USER", "CMD is wrong", "Need --privileged forever"], 1, "Install as root, run as app."),
          ],
        },
        {
          key: "midboss-build",
          title: "Boss: The bloated image",
          summary: "Four sins. Cut them.",
          kind: "boss",
          minutes: 12,
          concept: { key: "midboss-build", name: "Slim the image", axis: "problem" },
          teach: { title: "Four problems", body: "Fat base, fat context, compiler in runtime, root." },
          questions: [
            challenge(
              "THE BLOATED IMAGE",
              "1.4GB. FROM node:latest. COPY . . including .git. npm run build in the same stage. USER never set.",
              [
                { question: "Base?", options: ["Keep latest", "Pin alpine/distroless runtime", "Add Ubuntu Desktop", "Use Windows"], answer: 1, explanation: "Pin a small runtime." },
                { question: "Context?", options: ["COPY everything", ".dockerignore .git node_modules .env", "Copy /", "Disable ignore"], answer: 1, explanation: "Ignore the landfill." },
                { question: "Compiler?", options: ["Ship gcc forever", "Multi-stage: copy dist only", "RUN build twice", "Delete CMD"], answer: 1, explanation: "Build stage stays behind." },
                { question: "User?", options: ["Root is fine", "USER a non-root account", "sudo in CMD", "chmod 777 /"], answer: 1, explanation: "Least privilege." },
              ],
              "Small, pinned, unprivileged.",
              "hard",
              250,
            ),
          ],
        },
      ],
    },
    {
      key: "storage",
      title: "Storage",
      subtitle: "Volumes, bind mounts, persistence",
      missions: [
        {
          key: "vol",
          title: "The database vanishes",
          summary: "Restart killed the data. Fix it.",
          concept: { key: "vol", name: "Volumes", axis: "problem" },
          teach: {
            title: "Containers are mortal",
            body: "The writable layer dies with the container. Volumes live on the host. Bind mounts pin a path.",
          },
          example: {
            title: "Postgres",
            body: "docker run -v pgdata:/var/lib/postgresql/data postgres:16 — the named volume survives rm.",
            callout: "The left name is Docker's. The right path is the app's.",
          },
          questions: [
            scenario(
              "Postgres data gone after docker rm. Why?",
              "Data was in the container filesystem, not a volume.",
              ["Docker is broken", "Need a named volume or bind mount", "Use :latest", "Turn off restart"],
              1,
              "Persist the data directory.",
            ),
            fill("A Docker-managed persistent disk is a ___.", "volume", "Named volumes survive the container."),
            tf("A named volume is deleted when the container stops.", false, "stop keeps the volume. docker volume rm is explicit."),
          ],
        },
        {
          key: "bind",
          title: "Bind mounts vs volumes",
          summary: "Dev source vs durable data.",
          concept: { key: "bind", name: "Bind mounts", axis: "knowledge" },
          teach: {
            title: "Two persistence tools",
            body: "Bind mount = host path. Volume = Docker-managed. Bind for live code. Volume for databases.",
          },
          questions: [
            match("Use case → mount", [
              { left: "Live-reload app code", right: "Bind mount" },
              { left: "Postgres files", right: "Named volume" },
              { left: "Secrets file you already have", right: "Bind mount (read-only)" },
              { left: "Anonymous scratch", right: "Anonymous volume" },
            ], "Code vs data."),
            mcq("Danger of bind-mounting / ?", ["None", "You can wreck the host", "Faster DNS", "Smaller images"], 1, "Mount the smallest path you need."),
          ],
        },
        {
          key: "perm",
          title: "Permission ghosts",
          summary: "UID mismatch, read-only, full disk.",
          concept: { key: "perm", name: "Volume pitfalls", axis: "problem" },
          teach: {
            title: "The file is there. The process cannot write.",
            body: "Container UID vs host UID. :ro when you meant write. Disk full looks like a crash.",
          },
          questions: [
            scenario(
              "App logs EACCES on /data. Volume is mounted. Host files owned by uid 501, container USER 1000.",
              "Fix?",
              ["Delete Docker", "Align UIDs or chown the volume", "EXPOSE 80", "Use latest"],
              1,
              "Ownership is a UID, not a vibe.",
            ),
            tf("docker volume inspect shows the host path for a named volume.", true, "Mountpoint is on the engine."),
          ],
        },
      ],
    },
    {
      key: "net",
      title: "Networking",
      subtitle: "Ports, bridges, service names",
      missions: [
        {
          key: "bridge",
          title: "Frontend → API → Database",
          summary: "They must speak.",
          concept: { key: "net", name: "Container networks", axis: "execution" },
          teach: {
            title: "A user-defined bridge",
            body: "Containers on the same network resolve each other by name. Publish ports only at the edge.",
          },
          questions: [
            mcq("API cannot reach db:5432. Both run with default bridge and you used hostname db.", ["Use a user-defined network so DNS works", "Expose 5432 to the internet", "Disable TLS forever", "Restart the laptop"], 0, "Default bridge has no automatic DNS by name."),
            tf("Every container should publish every port to 0.0.0.0.", false, "Only the public edge."),
            fill("Host mapping uses docker run -p host:___.", "container", "host:container.", ["Container"]),
          ],
        },
        {
          key: "dns",
          title: "localhost is a liar",
          summary: "localhost inside a box is the box.",
          concept: { key: "dns", name: "Container DNS", axis: "problem" },
          teach: {
            title: "Each namespace has its own loopback",
            body: "In the API container, localhost is the API. The database is a different hostname on the network.",
          },
          questions: [
            identify("Broken service DNS?", "api:\n  image: api\n  environment:\n    DB_HOST: localhost", ["Should be the service name, not localhost", "Perfect", "Need 12 replicas", "CMD is wrong"], 0, "localhost is the API container, not the db."),
            scenario(
              "Browser on your laptop talks to localhost:3000 (published). The frontend JS then fetches localhost:8080 for the API.",
              "What happens?",
              ["Works, Docker magic", "The browser looks at the laptop, not the API container — use the published host port or a proxy", "Need Kubernetes", "Disable CORS by deleting the internet"],
              1,
              "The browser is not on the Docker network.",
            ),
          ],
        },
        {
          key: "publish",
          title: "Publish with intent",
          summary: "0.0.0.0 vs 127.0.0.1, UDP, many ports.",
          concept: { key: "publish", name: "Port publish", axis: "execution" },
          teach: {
            title: "The left side is the host",
            body: "-p 127.0.0.1:5432:5432 keeps Postgres off the LAN. -p 5432:5432 shares it with the building.",
          },
          questions: [
            mcq("Dev database on a café Wi-Fi. Bind?", ["0.0.0.0:5432:5432", "127.0.0.1:5432:5432", "No publish, exec only", "Publish 22"], 1, "Loopback on the host, or don't publish at all."),
            tf("-p 8080:80 maps host 80 to container 8080.", false, "Left host, right container: 8080:80."),
          ],
        },
      ],
    },
    {
      key: "compose",
      title: "Compose",
      subtitle: "Multi-container as one app",
      missions: [
        {
          key: "compose-file",
          title: "One YAML, three services",
          summary: "services, networks, volumes.",
          concept: { key: "composefile", name: "Compose file", axis: "knowledge" },
          teach: {
            title: "The stack is a document",
            body: "A service is a container template. depends_on is start order, not readiness. healthcheck is readiness.",
          },
          questions: [
            match("Key → meaning", [
              { left: "services", right: "The boxes" },
              { left: "volumes", right: "Named disks" },
              { left: "networks", right: "Who can DNS whom" },
              { left: "ports", right: "Host publish" },
            ], "File maps to engine objects."),
            tf("depends_on: db means the API waits until Postgres accepts connections.", false, "It waits for the container to start, not for ready."),
            order("Compose file shape.", ["Define services", "Attach a network", "Declare the db volume", "Publish only the frontend port"], "Internal first, publish last."),
          ],
        },
        {
          key: "compose-up",
          title: "up, down, logs",
          summary: "The loop you live in.",
          concept: { key: "composeup", name: "Compose commands", axis: "execution" },
          teach: {
            title: "One command",
            body: "compose up -d. compose logs -f api. compose down does not always delete volumes. -v does.",
          },
          questions: [
            mcq("Wipe the database volume on purpose?", ["compose down", "compose down -v", "compose pause", "docker ps"], 1, "-v removes named volumes declared in the file."),
            identify("Why didn't the API see new env?", "environment:\n  DB_HOST: db\n# you edited YAML but only restarted the API container by hand", ["Need compose up so the service is recreated", "YAML is comments", "DNS is broken forever", "Need Kubernetes"], 0, "Recreate from the file."),
          ],
        },
        {
          key: "compose",
          title: "Mini-project: Launch the stack",
          summary: "Frontend, API, database.",
          kind: "project",
          minutes: 14,
          concept: { key: "compose", name: "Compose stacks", axis: "execution" },
          teach: { title: "One file, one command", body: "services, networks, volumes. docker compose up." },
          questions: [
            challenge(
              "Launch the stack",
              "web, api, db. Users hit web. api talks to db. Café Wi-Fi.",
              [
                { question: "DB_HOST in api?", options: ["localhost", "db (service name)", "127.0.0.1", "the café router"], answer: 1, explanation: "Compose DNS is the service name." },
                { question: "Publish Postgres?", options: ["5432 to 0.0.0.0", "Don't publish; only api on the network", "Publish 22", "Publish all ports"], answer: 1, explanation: "Internal only." },
                { question: "Data after down?", options: ["Always gone", "Named volume keeps it unless -v", "Images store rows", "Hub stores rows"], answer: 1, explanation: "Volume outlives containers." },
                { question: "Ready?", options: ["depends_on is enough", "healthcheck + wait, or retry in api", "sleep 1 in YAML comments", "Ignore failures"], answer: 1, explanation: "Start ≠ ready." },
              ],
              "Internal DNS, publish the edge, persist db.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "debug",
      title: "Debugging",
      subtitle: "Wrong port, missing env, crash, network",
      missions: [
        {
          key: "debug",
          title: "Deliberately broken",
          summary: "Diagnose five failures.",
          concept: { key: "debug", name: "Container debugging", axis: "problem" },
          teach: { title: "Logs first", body: "ps, logs, inspect, exec. Guessing is not a tool." },
          questions: [
            match("Symptom → cause", [
              { left: "Exited (1) env KEY required", right: "Missing env var" },
              { left: "Connection refused 5432", right: "Network or port" },
              { left: "Image pull 404", right: "Bad tag" },
              { left: "Bind already in use", right: "Host port taken" },
            ], "Read the error. Name the layer."),
            order("Incident order.", ["ps / compose ps", "logs", "inspect network/env", "fix and recreate"], "See, then change."),
            mcq("CrashLoop, logs empty. Next?", ["prune -a", "inspect + exec if it stays up / add logging", "delete the machine", "change tag to latest"], 1, "A silent crash still has an exit and often a config."),
          ],
        },
        {
          key: "exec",
          title: "Inside the box",
          summary: "exec, ephemerals, copy files out.",
          concept: { key: "exec", name: "Debug exec", axis: "execution" },
          teach: {
            title: "A shell is a probe",
            body: "docker exec -it web sh. wget/curl the neighbour. Then leave. Do not treat exec as the deploy process.",
          },
          questions: [
            tf("Fixing prod by exec and apt-get install is a durable deploy.", false, "The next recreate wipes it. Bake the image."),
            scenario(
              "Need a file that only exists in a crashed container.",
              "Container still on disk, not rm'd.",
              ["Gone forever", "docker cp from the stopped container", "Only if you had Compose", "Hub has it"],
              1,
              "Stopped ≠ deleted. cp works until rm.",
            ),
          ],
        },
        {
          key: "recreate",
          title: "Change the spec, not the ghost",
          summary: "Config drift vs a new container.",
          concept: { key: "recreate", name: "Recreate vs patch", axis: "problem" },
          teach: {
            title: "Desired state lives in the file",
            body: "Env, ports, mounts — if they live only in a running box, the next engineer cannot reproduce you.",
          },
          questions: [
            mcq("You docker update a port. Teammate compose up tomorrow. Who wins?", ["Your update, forever", "The Compose file", "Random", "Hub"], 1, "The file is the source of truth."),
            tf("Immutable containers: change config by baking or recreating.", true, "Pets vs cattle."),
          ],
        },
      ],
    },
    {
      key: "final",
      title: "Final Boss: Production is Down",
      subtitle: "Restore the app from logs",
      isBoss: true,
      missions: [
        {
          key: "final",
          title: "Production is down",
          summary: "Logs, compose, a clock.",
          kind: "boss",
          minutes: 18,
          concept: { key: "final", name: "Restore production", axis: "problem" },
          teach: { title: "Keep it up", body: "Identify the cause. Restore. Don't make it worse." },
          questions: [
            challenge(
              "PRODUCTION IS DOWN",
              "API CrashLoop. Logs: ECONNREFUSED db:5432. Compose shows db healthy. API on default bridge, db on app-net. Last change: a new env file and a port remap.",
              [
                { question: "Root cause?", options: ["Bad Node version", "Networks do not overlap", "Need more RAM", "Delete volumes"], answer: 1, explanation: "They cannot resolve each other." },
                { question: "Fix?", options: ["Put both on app-net and use db as hostname", "Publish 5432 to the world", "Restart until lucky", "Pin latest"], answer: 0, explanation: "Same network + service DNS." },
                { question: "Data?", options: ["down -v to be sure", "Keep the named volume; do not -v", "Delete /var", "Restore from screenshots"], answer: 1, explanation: "Outage is network, not disk." },
                { question: "Prevent next time?", options: ["No healthchecks ever", "Compose with explicit networks and healthchecks", "SSH into prod and pray", "Disable logs"], answer: 1, explanation: "Declare the topology." },
              ],
              "Network first, then data, then image.",
              "hard",
              1000,
            ),
          ],
        },
      ],
    },
  ],
});
