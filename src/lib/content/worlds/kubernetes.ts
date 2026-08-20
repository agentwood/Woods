import { buildWorld, challenge, fill, identify, match, mcq, order, scenario, tf } from "../factory";

export const kubernetesSkill = buildWorld({
  id: "kubernetes",
  name: "Kubernetes",
  fantasy: "THE SYSTEM OPERATOR",
  tagline: "Desired state is the law. Reality must obey.",
  description: "Pods, deployments, services, config, scale, rollouts, and bringing an outage back.",
  category: "Ops Worlds",
  difficulty: "advanced",
  hours: 14,
  icon: "cloud",
  trial: {
    key: "trial",
    title: "The app is running. Users cannot reach it.",
    summary: "A 3-minute outage drill. Ready replicas, silent Service.",
    minutes: 4,
    concept: { key: "trial", name: "Service instincts", axis: "problem" },
    teach: {
      title: "Pods ≠ Service",
      body: "Ready replicas mean nothing if nothing selects them or the port is wrong. Users hit a Service. The Service hits endpoints. Empty endpoints is a black hole.",
      bullets: ["Labels must match the selector", "targetPort must match the process", "Ready is not the same as Reachable"],
    },
    example: {
      title: "The mismatch",
      body: "Deployment labels: app=api. Service selector: app=web. kubectl get endpoints is empty. curl hangs.",
      callout: "The cluster is healthy. The glue is not.",
    },
    questions: [
      scenario(
        "3/3 pods Ready. curl to the Service times out. Service selector app=web, pods labeled app=api.",
        "What's wrong?",
        ["Need more replicas", "Selector misses the pods", "Delete the cluster", "Upgrade laptops"],
        1,
        "Services select labels. Wrong label, empty endpoints.",
        "hard",
      ),
      mcq("Endpoints empty. First simulated check?", ["Buy a new region", "Compare Service selector to pod labels", "Restart your laptop", "Disable DNS forever"], 1, "Selector vs labels."),
      tf("Ready pods always receive Service traffic.", false, "Only if they match the selector and pass readiness."),
      identify(
        "Why no traffic?",
        "selector:\n  app: web\n# pods: app=api",
        ["Wrong selector", "Need 12 Services", "DNS is illegal", "Too much RAM"],
        0,
        "Labels must match.",
      ),
    ],
  },
  levels: [
    {
      key: "cluster",
      title: "The Cluster",
      subtitle: "Control plane, nodes, pods",
      missions: [
        {
          key: "arch",
          title: "Brain and muscle",
          summary: "Who decides, who runs.",
          concept: { key: "arch", name: "Cluster architecture", axis: "knowledge" },
          teach: {
            title: "Desired state lives in the API",
            body: "Control plane stores desired state (API server, etcd, scheduler, controllers). Nodes run kubelet and pods. You talk to the API. The rest converges.",
            bullets: ["API server is the front door", "Scheduler picks a node", "Kubelet runs the pod"],
          },
          example: {
            title: "A pod is born",
            body: "You POST a Pod spec. Scheduler binds a node. Kubelet starts containers. Status becomes Running when the process is up.",
            callout: "You declared. The controllers obeyed — or they filed Events.",
          },
          questions: [
            match("Role.", [
              { left: "API server", right: "Front door of desired state" },
              { left: "Scheduler", right: "Picks a node for a pod" },
              { left: "Kubelet", right: "Runs pods on a node" },
              { left: "Pod", right: "One or more containers, one IP" },
            ], "Desire vs reality."),
            fill("The smallest deployable unit is a ___.", "pod", "Not a container alone."),
            tf("You SSH to every node to start containers by hand in a healthy cluster.", false, "Kubelet takes orders from the API."),
            mcq("etcd's job?", ["Serve user HTTP", "Store cluster state", "Replace kubelet", "Draw dashboards"], 1, "Memory of desired and reported state."),
          ],
        },
        {
          key: "pod",
          title: "A pod is a tiny machine",
          summary: "Shared network, shared fate.",
          concept: { key: "pod", name: "Pods", axis: "knowledge" },
          teach: {
            title: "One IP, one or more containers",
            body: "Containers in a pod share localhost and volumes. If the pod dies, all of them die. Sidecars live here on purpose.",
          },
          example: {
            title: "App + sidecar",
            body: "container: api on :8080. container: log-shipper tails the volume. Same pod IP.",
            callout: "Do not put two unrelated apps in one pod just to save YAML.",
          },
          questions: [
            mcq("Two containers in one pod. They talk over?", ["Public internet only", "localhost", "Carrier pigeon", "A new cluster"], 1, "Shared network namespace."),
            tf("A pod is guaranteed to survive a node failure in place.", false, "The pod dies. A controller may create a replacement elsewhere."),
            identify(
              "What is this object?",
              "kind: Pod\nspec:\n  containers:\n  - name: api\n    image: api:1.2",
              ["A Service", "The smallest deployable unit", "A Node", "A Namespace policy"],
              1,
              "A Pod spec.",
            ),
          ],
        },
        {
          key: "ns",
          title: "Namespaces are rooms",
          summary: "prod is not default.",
          concept: { key: "ns", name: "Namespaces", axis: "execution" },
          teach: {
            title: "A name is local to a room",
            body: "web in staging is not web in prod. RBAC and ResourceQuotas hang off namespaces. default is a trap for real workloads.",
          },
          example: {
            title: "Same name, two rooms",
            body: "Deployment web in staging. Deployment web in prod. kubectl get deploy web hits whichever -n you are in — or default, if you forgot.",
            callout: "Always name the room.",
          },
          questions: [
            mcq("You applied a Deployment with no -n. Where did it go?", ["prod automatically", "default (unless context says else)", "Every namespace", "The internet"], 1, "Context + flag. Default is a room."),
            tf("Deleting a namespace deletes the objects inside it.", true, "It is a recursive goodbye. Treat prod as sacred."),
            fill("Isolation rooms in a cluster are ___.", "namespaces", "Namespaces.", ["namespace"]),
          ],
        },
        {
          key: "cluster-map",
          title: "Mini-project: Map the outage room",
          summary: "Name the parts before you touch them.",
          kind: "project",
          minutes: 10,
          concept: { key: "cluster-map", name: "Cluster map", axis: "problem" },
          teach: {
            title: "Draw it once",
            body: "Control plane, three nodes, namespace prod, Deployment, pods, Service. If you cannot point at the hop that failed, you will delete the wrong thing.",
          },
          questions: [
            challenge(
              "Map the room",
              "Users cannot reach api.prod. You may only reason about objects — no live cluster.",
              [
                { question: "Users hit first?", options: ["etcd", "Service / Ingress in front of pods", "Your laptop fan", "A random NodePort on staging"], answer: 1, explanation: "Stable name, then pods." },
                { question: "Who restarts a dead pod?", options: ["The CEO", "ReplicaSet / Deployment controller", "DNS", "A CronJob of hope"], answer: 1, explanation: "Desired replica count." },
                { question: "Where do you look for “why Pending”?", options: ["The company blog", "Pod Events (scheduler / resources)", "The colour of the logo", "Delete prod"], answer: 1, explanation: "Events are the diary." },
              ],
              "Name the hop. Then act.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "deploy",
      title: "Deploy",
      subtitle: "Replicas and desired state",
      missions: [
        {
          key: "dep",
          title: "You declare. It converges.",
          summary: "Deployment → ReplicaSet → Pods.",
          concept: { key: "dep", name: "Deployments", axis: "execution" },
          teach: {
            title: "Replicas",
            body: "spec.replicas: 3. The Deployment owns ReplicaSets. ReplicaSets own pods. You almost never create pods by hand for an app.",
          },
          example: {
            title: "Three copies",
            body: "kind: Deployment, replicas: 3, template labels app=web. Three pods appear. One dies. A fourth is born. Count returns to 3.",
            callout: "Desired count is the law.",
          },
          questions: [
            mcq("You set replicas: 3. One pod dies. What happens?", ["The Deployment stays at 2 forever", "A controller creates a replacement", "The cluster panics", "You must reboot nodes"], 1, "Desired state."),
            tf("A Deployment stores containers directly with no ReplicaSet.", false, "ReplicaSets own pods."),
            order("A Deployment comes alive.", ["Write the Deployment spec", "API accepts it", "ReplicaSet created", "Pods scheduled"], "Declare, then converge."),
            fill("The object that keeps N identical pods alive is a ___.", "replicaset", "ReplicaSet.", ["replica set", "deployment"]),
          ],
        },
        {
          key: "labels",
          title: "Labels are the glue",
          summary: "Selectors are not comments.",
          concept: { key: "labels", name: "Labels", axis: "execution" },
          teach: {
            title: "Equality and sets",
            body: "matchLabels app=web must match pod template labels. A typo is an empty ReplicaSet, not a compiler error.",
          },
          example: {
            title: "The typo",
            body: "template labels: app=web. selector: app=Web. Zero pods. Events look “fine” until you read the ReplicaSet.",
            callout: "Labels are case-sensitive contracts.",
          },
          questions: [
            identify(
              "Why 0/3?",
              "selector:\n  matchLabels:\n    app: web\ntemplate:\n  metadata:\n    labels:\n      app: Web",
              ["Selector does not match template labels", "Need more CPU always", "Deployments cannot scale", "YAML comments are illegal"],
              0,
              "web ≠ Web.",
            ),
            tf("You can change a Deployment's selector freely after pods exist.", false, "Selector is mostly immutable. Plan the labels first."),
            mcq("Best label set?", ["app, version, and a team key you actually query", "40 unique labels per pod", "No labels", "The image digest as the only label"], 0, "Queryable, stable, few."),
          ],
        },
        {
          key: "image",
          title: "Pin the image",
          summary: ":latest is a trap.",
          concept: { key: "image", name: "Images", axis: "problem" },
          teach: {
            title: "Digest or tag you control",
            body: ":latest moves under you. A rollout of the same tag may pull a new blob — or not — depending on imagePullPolicy. Pin versions.",
          },
          example: {
            title: "Friday surprise",
            body: "image: web:latest. Nobody changed YAML. Pods restarted. The app is a different build because the tag walked.",
            callout: "Pin 1.4.2 or a digest.",
          },
          questions: [
            mcq("Safest image for prod?", ["myapp:latest", "myapp:1.4.2 or a digest", "ubuntu", "scratch:latest on Fridays"], 1, "Pin what you tested."),
            tf("imagePullPolicy: Always with :latest makes Friday deploys boring.", false, "It makes them a lottery."),
            scenario(
              "Nobody changed YAML. Pods restarted and the app is a different build.",
              "Likely?",
              ["Magic", ":latest or an unpinned tag moved", "etcd learned Java", "Need more namespaces"],
              1,
              "The tag walked.",
            ),
          ],
        },
        {
          key: "first-ship",
          title: "Mini-project: Ship three replicas",
          summary: "On paper: Deployment that would actually run.",
          kind: "project",
          minutes: 12,
          concept: { key: "first-ship", name: "First ship", axis: "execution" },
          teach: {
            title: "A checklist, not a cluster",
            body: "Name, namespace, labels that match, pinned image, replicas, container port. If any line is theatre, the Service later will fail.",
          },
          questions: [
            challenge(
              "Ship three",
              "Need a web app in prod, 3 replicas, image web:1.2.0, port 8080.",
              [
                { question: "Object?", options: ["A naked Pod only", "Deployment", "A ConfigMap of hopes", "Delete the node"], answer: 1, explanation: "Controllers keep count." },
                { question: "Image?", options: ["web:latest", "web:1.2.0", "nginx:latest forever", "scratch"], answer: 1, explanation: "Pin the tag you tested." },
                { question: "Labels?", options: ["None", "app=web on template AND selector", "Random UUIDs per pod", "The CEO name"], answer: 1, explanation: "Selector contract." },
                { question: "Done when?", options: ["YAML is long", "replicas, matching labels, pinned image, named port", "You used 12 sidecars", "You skipped namespace"], answer: 1, explanation: "The checklist is the ship." },
              ],
              "Declare the count. Pin the bits.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "heal",
      title: "Self-Healing",
      subtitle: "Kill a pod. Watch it return.",
      missions: [
        {
          key: "heal",
          title: "Murder is a test",
          summary: "Controllers never sleep.",
          concept: { key: "heal", name: "Self-healing", axis: "execution" },
          teach: {
            title: "Count < desired",
            body: "Delete a pod. The ReplicaSet notices. A new one is scheduled. The Service keeps routing to Ready members. Users may not notice.",
          },
          questions: [
            order("The heal.", ["Pod dies", "ReplicaSet observes count < desired", "New pod scheduled", "Service keeps routing to Ready pods"], "Users may not notice."),
            tf("Deleting a pod managed by a ReplicaSet is how you scale to zero.", false, "The controller replaces it. Scale the Deployment."),
            mcq("You delete the Deployment. Pods?", ["Stay forever", "Go away with the ReplicaSets", "Move to default", "Become Services"], 1, "Owners cascade."),
          ],
        },
        {
          key: "probe-heal",
          title: "Unready is a choice",
          summary: "Failed readiness is not CrashLoop yet.",
          concept: { key: "probe-heal", name: "Readiness vs death", axis: "knowledge" },
          teach: {
            title: "Two failures",
            body: "Readiness fail: leave the pod, drop from endpoints. Liveness fail: restart the container. Mixing them flaps the app.",
          },
          questions: [
            match("Signal.", [
              { left: "Readiness fail", right: "Removed from Service" },
              { left: "Liveness fail", right: "Container restarted" },
              { left: "Pod deleted", right: "Controller replaces" },
              { left: "Node dies", right: "Pods on it die; reschedule if controlled" },
            ], "Different levers."),
            scenario(
              "Pods Running. Endpoints empty. Readiness probe hitting /ready returns 500.",
              "Users see?",
              ["Happy 200s", "Timeouts / no backends", "Automatic scale to 100", "DNS is gone forever"],
              1,
              "Not Ready = not in the Service.",
            ),
          ],
        },
        {
          key: "pdb",
          title: "Do not evict everyone",
          summary: "Disruption budgets.",
          concept: { key: "pdb", name: "PDBs", axis: "execution" },
          teach: {
            title: "Keep N available",
            body: "A PodDisruptionBudget says minAvailable: 2. Voluntary drains must respect it. It does not stop a crashing app.",
          },
          questions: [
            mcq("Node drain stuck. Likely?", ["Need more pies", "PDB forbids evicting the last healthy pod", "YAML comments", "The logo"], 1, "Budget vs drain."),
            tf("A PDB restarts CrashLoop pods faster.", false, "PDBs gate voluntary disruption, not crash loops."),
          ],
        },
      ],
    },
    {
      key: "svc",
      title: "Networking",
      subtitle: "Services make pods reachable",
      missions: [
        {
          key: "svc",
          title: "Stable name, changing pods",
          summary: "ClusterIP, ports, selectors.",
          concept: { key: "svc", name: "Services", axis: "problem" },
          teach: {
            title: "A Service is a contract",
            body: "selector + port + targetPort. ClusterIP is internal. NodePort/LoadBalancer/Ingress are how humans arrive. Wrong targetPort is connection refused.",
          },
          questions: [
            identify(
              "Why empty endpoints?",
              "selector:\n  app: web\n# pods: app=api",
              ["Wrong selector", "Need 12 Services", "DNS is illegal", "Too much RAM"],
              0,
              "Labels must match.",
            ),
            mcq("targetPort 8080, container listens 3000. Symptom?", ["Works", "Connection refused / wrong port", "Better latency", "Autoscales"], 1, "Ports must match the process."),
            fill("Pods matching a Service selector appear as ___.", "endpoints", "Endpoints.", ["endpoint slices", "endpoint"]),
          ],
        },
        {
          key: "dns",
          title: "Names inside the cluster",
          summary: "svc.namespace.svc.cluster.local",
          concept: { key: "dns", name: "Cluster DNS", axis: "knowledge" },
          teach: {
            title: "Short names are contextual",
            body: "web in the same namespace resolves. web.prod.svc.cluster.local is explicit. CoreDNS is a Deployment too — it can break.",
          },
          questions: [
            mcq("From namespace staging, DNS name web hits?", ["prod's web", "staging's web (same ns)", "The internet", "etcd"], 1, "Short name is local."),
            tf("If CoreDNS pods are down, Services still have IPs but names fail.", true, "IP vs name are different hops."),
          ],
        },
        {
          key: "ingress",
          title: "The front door",
          summary: "Ingress / Gateway is not a Service replacement.",
          concept: { key: "ingress", name: "Ingress", axis: "execution" },
          teach: {
            title: "HTTP routing",
            body: "Ingress points at a Service. The Service still needs endpoints. A pretty host rule on an empty Service is still an outage.",
          },
          questions: [
            order("User to container.", ["DNS / Ingress", "Service", "Endpoints / Ready pods", "containerPort"], "Every hop can be empty."),
            scenario(
              "Ingress 200 on /healthz of the controller. App host still 502.",
              "Look at?",
              ["Buy a new laptop", "Backend Service endpoints", "Delete etcd", "Change the company name"],
              1,
              "502 is often no healthy backends.",
            ),
          ],
        },
        {
          key: "net-fix",
          title: "Mini-project: Open the door",
          summary: "Selector, port, Ready — on paper.",
          kind: "project",
          minutes: 12,
          concept: { key: "net-fix", name: "Service repair", axis: "problem" },
          teach: {
            title: "Three checks",
            body: "Selector match. Port match. Readiness pass. If all three hold, look at NetworkPolicy.",
          },
          questions: [
            challenge(
              "OPEN THE DOOR",
              "3 Ready pods. Service timeout. Labels app=api. Selector app=web. targetPort 8080. Process on 8080.",
              [
                { question: "First fault?", options: ["Need 12 replicas", "Selector vs labels", "Delete the node", "Upgrade kubectl on a plane"], answer: 1, explanation: "Empty endpoints." },
                { question: "After labels match, still 502?", options: ["Ignore probes", "Check readiness and NetworkPolicy", "Disable the API server", "Add :latest"], answer: 1, explanation: "Ready + allowed." },
                { question: "Prevent?", options: ["No Services", "Same labels in a checklist / test", "Random ports", "Skip YAML"], answer: 1, explanation: "Contract tests." },
              ],
              "Selector, port, Ready.",
              "hard",
              100,
            ),
          ],
        },
      ],
    },
    {
      key: "cfg",
      title: "Config",
      subtitle: "ConfigMaps and Secrets",
      missions: [
        {
          key: "cfg",
          title: "Don't bake env into the image",
          summary: "ConfigMap vs Secret.",
          concept: { key: "cfg", name: "Config and secrets", axis: "execution" },
          teach: {
            title: "Mount or envFrom",
            body: "ConfigMap for non-secret config. Secret for credentials. Changing a ConfigMap does not always restart pods — plan a rollout.",
          },
          questions: [
            tf("Database passwords belong in the container image.", false, "Secrets, not layers."),
            fill("Non-secret config in Kubernetes is usually a ___.", "configmap", "ConfigMap.", ["config map"]),
            identify(
              "What's wrong?",
              "env:\n- name: DATABASE_URL\n  value: postgres://user:hunter2@db/prod",
              ["Plaintext secret in the Pod spec", "Perfect 12-factor", "Faster DNS", "A Service mesh"],
              0,
              "Use a Secret, not a string in git.",
            ),
          ],
        },
        {
          key: "rollcfg",
          title: "Config changed. Pods didn't.",
          summary: "Checksum annotations.",
          concept: { key: "rollcfg", name: "Config rollout", axis: "problem" },
          teach: {
            title: "Trigger a new ReplicaSet",
            body: "Mounts can go stale. A common pattern: annotate the pod template with a hash of the ConfigMap so a config change is a rollout.",
          },
          questions: [
            scenario(
              "You edited the ConfigMap. Live pods still have the old DATABASE_HOST.",
              "Why?",
              ["Kubernetes hates you", "Existing pods keep old env until restarted / rolled", "ConfigMaps cannot change", "Need a new cluster"],
              1,
              "Roll the Deployment.",
            ),
            mcq("Safest after a Secret rotation?", ["Hope", "Roll the consumers", "Print the Secret in Slack", "Disable TLS"], 1, "New env, new pods."),
          ],
        },
        {
          key: "wrong-env",
          title: "Staging has prod URLs",
          summary: "The wrong ConfigMap mounted.",
          concept: { key: "wrong-env", name: "Env mixup", axis: "problem" },
          teach: {
            title: "Name the room in the object",
            body: "prod-db vs staging-db. A Deployment in staging that envFrom's prod is an incident, not a style issue.",
          },
          questions: [
            mcq("Staging pods talking to prod DB. First?", ["Scale to 100", "Fix envFrom / Secret name, then roll", "Delete prod data to match", "Disable probes"], 1, "Stop the bleed, then roll."),
            tf("Namespace isolation means a staging Deployment cannot name a prod Secret in another namespace by default.", true, "Secrets are namespaced. Cross-namespace is extra rope."),
          ],
        },
      ],
    },
    {
      key: "scale",
      title: "Scaling",
      subtitle: "Replicas, HPA, resources",
      missions: [
        {
          key: "scale",
          title: "Traffic ×10",
          summary: "Don't guess. Set requests and limits.",
          concept: { key: "scale", name: "Scaling", axis: "execution" },
          teach: {
            title: "HPA needs metrics",
            body: "CPU/memory requests let the scheduler and HPA think. Limits cap the burst. replicas: 100 with tiny requests still has to fit on nodes.",
          },
          questions: [
            mcq("HPA does nothing. Likely?", ["No resource requests / metrics-server", "Too many labels", "The logo is wrong", "Need Windows nodes"], 0, "No signal, no scale."),
            tf("replicas: 100 with 10m CPU requests always fits.", false, "Nodes have finite CPU — and packing still has overhead."),
            fill("The autoscaler that adds pods from CPU is the ___.", "hpa", "Horizontal Pod Autoscaler.", ["horizontal pod autoscaler"]),
          ],
        },
        {
          key: "qos",
          title: "Requests vs limits",
          summary: "Guaranteed, Burstable, BestEffort.",
          concept: { key: "qos", name: "Resources", axis: "knowledge" },
          teach: {
            title: "The scheduler believes requests",
            body: "You asked for 2 CPU. The node must have 2 CPU free. Limits throttle or OOMKill. BestEffort is first to evict.",
          },
          questions: [
            match("Knob.", [
              { left: "requests", right: "Scheduling / HPA signal" },
              { left: "limits", right: "Cap / OOM" },
              { left: "HPA", right: "Change replica count" },
              { left: "Cluster autoscaler", right: "Add nodes" },
            ], "Pods vs nodes."),
            scenario(
              "Pending forever. Events: Insufficient cpu.",
              "Cause?",
              ["Wrong image tag only", "Requests don't fit any node", "Need a prettier YAML", "DNS"],
              1,
              "Scheduler math.",
            ),
          ],
        },
        {
          key: "hpa-trap",
          title: "Boss: Scale that never comes",
          summary: "Load is 10×. Replica count is still 2.",
          kind: "boss",
          minutes: 14,
          concept: { key: "hpa-trap", name: "HPA failure", axis: "problem" },
          teach: {
            title: "No signal, no move",
            body: "Missing metrics-server, CPU request 0, or a target that never trips. Also: maxReplicas: 2 with a prayer.",
          },
          questions: [
            challenge(
              "THE SILENT HPA",
              "Latency is on fire. HPA object exists. replicas stay at 2. Pods have no CPU requests. metrics-server is CrashLoop.",
              [
                { question: "Why no scale?", options: ["Kubernetes cannot scale", "No metrics + no requests", "Need more logos", "Delete HPA forever"], answer: 1, explanation: "HPA is blind." },
                { question: "Immediate relief?", options: ["kubectl delete ns prod", "Raise replicas on the Deployment by hand", "Silence users", "Restart laptops"], answer: 1, explanation: "Desired count now. Fix HPA after." },
                { question: "Then?", options: ["Leave requests at 0", "Fix metrics-server and set requests", "Set maxReplicas: 2", "Use :latest"], answer: 1, explanation: "Give it a signal." },
                { question: "Prevent?", options: ["No HPA", "Alert when HPA desired == min under load", "Skip YAML", "Always 1 replica"], answer: 1, explanation: "Watch the controller, not just CPU graphs." },
              ],
              "Hand-scale, then restore the signal.",
              "hard",
              250,
            ),
          ],
        },
      ],
    },
    {
      key: "roll",
      title: "Deployments that don't hurt",
      subtitle: "Rolling updates, rollbacks, probes",
      missions: [
        {
          key: "roll",
          title: "Ship without a cliff",
          summary: "Health checks are the brakes.",
          concept: { key: "roll", name: "Rollouts", axis: "execution" },
          teach: {
            title: "Readiness vs liveness",
            body: "Readiness: stop sending traffic. Liveness: restart the container. Get them wrong and you flap. Rolling update creates new pods, then drains old.",
          },
          questions: [
            match("Probe.", [
              { left: "Readiness fail", right: "Removed from Service" },
              { left: "Liveness fail", right: "Container restarted" },
              { left: "Rolling update", right: "New pods, then drain old" },
              { left: "Rollback", right: "Previous ReplicaSet" },
            ], "Probes are product."),
            identify(
              "Dangerous liveness?",
              "livenessProbe: httpGet /\ntimeoutSeconds: 1\n# slow boot, no startupProbe",
              ["Kills a still-starting app", "Perfect", "Scales to zero", "Creates a Service"],
              0,
              "Give startup time.",
            ),
            tf("maxUnavailable: 100% is a gentle rollout.", false, "You can empty the Service."),
          ],
        },
        {
          key: "rollback",
          title: "The previous ReplicaSet is a lifeboat",
          summary: "Undo the bad image.",
          concept: { key: "rollback", name: "Rollback", axis: "execution" },
          teach: {
            title: "Roll back, then debug",
            body: "revisionHistoryLimit keeps old ReplicaSets. kubectl rollout undo is a pointer move, not a time machine for data.",
          },
          questions: [
            mcq("Error rate 40% after a rollout. Old RS still has Ready pods. Immediate?", ["Delete the namespace", "Roll back the Deployment", "Silence alerts", "Resize laptops"], 1, "Lifeboat."),
            order("Safe undo.", ["Notice new pods NotReady / errors", "rollout undo", "Confirm old RS Ready", "Debug the bad revision offline"], "Traffic first."),
          ],
        },
        {
          key: "canary",
          title: "A little, then a lot",
          summary: "Canary is a percentage, not a vibe.",
          concept: { key: "canary", name: "Canary", axis: "problem" },
          teach: {
            title: "Two ReplicaSets on purpose",
            body: "A second Deployment with a canary label and a weighted split — or a progressive rollout tool. Watching error rate on 5% beats hoping on 100%.",
          },
          questions: [
            scenario(
              "You shipped to 100% in one step. Bad config. All pods NotReady.",
              "What would have limited blast?",
              ["A canary / maxUnavailable small + probes", "Faster apply", ":latest", "No history"],
              0,
              "Keep old Ready pods.",
            ),
            tf("Canary means skip probes because it is small.", false, "Small still needs Ready."),
          ],
        },
      ],
    },
    {
      key: "debug",
      title: "Debugging",
      subtitle: "CrashLoop, config, Service, resources",
      missions: [
        {
          key: "crash",
          title: "CrashLoop is a symptom",
          summary: "The log line is the cause.",
          concept: { key: "debug", name: "Cluster debugging", axis: "problem" },
          teach: {
            title: "describe, logs, events",
            body: "CrashLoopBackOff means the container keeps dying. Read the last log line. Missing env, bad command, failing liveness — different fixes.",
          },
          questions: [
            scenario(
              "CrashLoopBackOff. Logs: missing DATABASE_URL.",
              "Fix?",
              ["Add more replicas", "Provide the env via ConfigMap/Secret and restart", "Delete the namespace", "Disable probes forever"],
              1,
              "Config, then a new pod.",
            ),
            mcq("Pending forever, Events: Insufficient cpu.", ["Wrong image", "Requests don't fit any node", "Need a prettier YAML", "DNS"], 1, "Scheduler math."),
            identify(
              "Read the status.",
              "State: Waiting\nReason: CrashLoopBackOff\nLast log: bind: address already in use",
              ["Need more replicas of the same broken command", "Process config / command is wrong", "The Service selector", "HPA"],
              1,
              "The process cannot start.",
            ),
          ],
        },
        {
          key: "imagepull",
          title: "ImagePullBackOff",
          summary: "The node cannot fetch the blob.",
          concept: { key: "imagepull", name: "Image pull", axis: "problem" },
          teach: {
            title: "Auth, name, tag",
            body: "Wrong tag, private registry without imagePullSecrets, or a typo in the image name. The pod never reaches Running.",
          },
          questions: [
            mcq("ImagePullBackOff. image: web:1.2.0 but registry has web:1.2. Typo?", ["Need more CPU", "Name/tag/auth", "Delete kubelet", "A Service"], 1, "Fetch failed."),
            tf("ImagePullBackOff means the app crashed after boot.", false, "It never started."),
          ],
        },
        {
          key: "events",
          title: "Events are the diary",
          summary: "FailedScheduling, Unhealthy, Killing.",
          concept: { key: "events", name: "Events", axis: "knowledge" },
          teach: {
            title: "Read before you delete",
            body: "FailedScheduling: resources/affinity. Unhealthy: probe. Killing: liveness or preemption. Deleting the namespace erases the diary.",
          },
          questions: [
            match("Event → lead.", [
              { left: "FailedScheduling", right: "Fit / affinity" },
              { left: "Unhealthy", right: "Probe" },
              { left: "FailedMount", right: "Volume" },
              { left: "Killing", right: "Restart / eviction" },
            ], "The diary names the room."),
            tf("kubectl delete ns prod is a valid first debug step.", false, "Preserve evidence. Restore traffic first."),
          ],
        },
      ],
    },
    {
      key: "final",
      title: "Final Boss: The Outage",
      subtitle: "Restore without taking the rest down",
      isBoss: true,
      missions: [
        {
          key: "final",
          title: "THE OUTAGE",
          summary: "Availability is the score.",
          kind: "boss",
          minutes: 18,
          concept: { key: "final", name: "Incident", axis: "problem" },
          teach: {
            title: "Preserve availability",
            body: "Roll forward if you can. Rollback if you must. Don't kubectl delete all.",
          },
          questions: [
            challenge(
              "THE OUTAGE",
              "Error rate 40% after a rollout. New pods NotReady. Old ReplicaSet still has 2 Ready.",
              [
                { question: "Immediate?", options: ["kubectl delete ns prod", "Roll back the Deployment", "Silence alerts", "Resize laptops"], answer: 1, explanation: "Previous ReplicaSet is your lifeboat." },
                { question: "Then debug?", options: ["Readiness failing on a bad config", "Buy a new cluster", "Ignore Events", "Turn off RBAC"], answer: 0, explanation: "NotReady = probe or boot." },
                { question: "Users still timeout after rollback?", options: ["Ignore Services", "Check selector, ports, endpoints", "Delete CoreDNS for luck", "Scale to 0"], answer: 1, explanation: "Traffic path next." },
                { question: "Prevent?", options: ["No staging", "Canary + probes + recorded runbook", "Always :latest", "Skip YAML"], answer: 1, explanation: "Make the next one boring." },
              ],
              "Rollback, then root cause.",
              "hard",
              1000,
            ),
          ],
        },
      ],
    },
  ],
});
