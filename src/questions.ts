import { extraQuestions } from "./extra-subjects";
export const worlds = [
  "forest",
  "dreams",
  "ocean",
  "football",
  "music",
] as const;
export type World = (typeof worlds)[number];
export type Answer = { text: string; next: string; connection: string };
export type Question = {
  id: string;
  world: World;
  title: string;
  hint: string;
  idea: string;
  answers: Answer[];
};
const answer = (text: string, next: string, connection: string): Answer => ({
  text,
  next,
  connection,
});
const question = (
  id: string,
  world: World,
  title: string,
  hint: string,
  idea: string,
  answers: Answer[],
): Question => ({ id, world, title, hint, idea, answers });

export const questions: Question[] = [
  question(
    "forest",
    "forest",
    "Can a forest think?",
    "Start with your instinct. What would thinking require?",
    "forest-root",
    [
      answer(
        "Yes, if its parts work together",
        "collective",
        "You put intelligence in the connections. Let’s look at what a group can do.",
      ),
      answer(
        "Only if it can learn",
        "learning",
        "You chose learning as the test. That opens a question about experience.",
      ),
      answer(
        "No — thinking needs awareness",
        "awareness",
        "For you, a thinking system needs an inner life. Let’s follow that distinction.",
      ),
    ],
  ),
  question(
    "collective",
    "forest",
    "What makes a group smarter than its members?",
    "Imagine many simple parts producing one surprising result.",
    "intelligence",
    [
      answer(
        "Sharing information",
        "signals",
        "Sharing only helps if information gets through. How would you recognize a message?",
      ),
      answer(
        "Different strengths working together",
        "trade",
        "Different strengths create opportunities for exchange. But why cooperate?",
      ),
      answer(
        "The ability to adapt together",
        "resilience",
        "You’re interested in how a network responds when its world changes.",
      ),
    ],
  ),
  question(
    "learning",
    "forest",
    "If an experience changes a plant’s future behavior, is that learning?",
    "Plant stress priming is real; what we call it depends on the definition.",
    "memory",
    [
      answer(
        "Yes — it has changed through experience",
        "memory",
        "You see learning in a lasting change. Let’s consider what actually needs to be stored.",
      ),
      answer(
        "Only if it can use that change somewhere new",
        "transfer",
        "You’re asking for flexibility, rather than one familiar response.",
      ),
      answer(
        "It might just be an automatic response",
        "habit",
        "You drew a line between learning and automatic behavior. Humans blur that line too.",
      ),
    ],
  ),
  question(
    "signals",
    "forest",
    "What would convince you that two plants are communicating?",
    "A chemical can affect a neighbor without being an intentional message.",
    "signals",
    [
      answer(
        "The neighbor changes its behavior",
        "response",
        "A response shows an effect. Next comes the question of what that effect means.",
      ),
      answer(
        "The signal benefits both plants",
        "trade",
        "You’re looking for a useful exchange, not just a detectable chemical.",
      ),
      answer(
        "The sender means to send a message",
        "intention",
        "Intention is a much stronger requirement. How could we recognize it from outside?",
      ),
    ],
  ),
  question(
    "trade",
    "forest",
    "Why would two organisms help each other?",
    "Cooperation can emerge without generosity or a shared plan.",
    "cooperation",
    [
      answer(
        "Both get something they need",
        "dependence",
        "A mutually useful exchange can become a dependency.",
      ),
      answer(
        "They survive better as a group",
        "resilience",
        "You chose survival through connection. Let’s put that network under pressure.",
      ),
      answer(
        "Helping might come with a hidden cost",
        "trust",
        "Benefits are only half the story. A partner can also become a vulnerability.",
      ),
    ],
  ),
  question(
    "resilience",
    "forest",
    "A forest loses one important connection. What matters most now?",
    "Treat this as a thought experiment about a network, not a prediction about every forest.",
    "fungi",
    [
      answer(
        "Other connections can take over",
        "redundancy",
        "Backup routes could make a network less dependent on any single link.",
      ),
      answer(
        "Its members can change their behavior",
        "transfer",
        "You’re betting on adaptation when the familiar route disappears.",
      ),
      answer(
        "It has enough resources in reserve",
        "scarcity",
        "You chose a buffer against uncertainty. Deep-sea life faces a version of that problem.",
      ),
    ],
  ),
  question(
    "response",
    "forest",
    "Does responding to a signal mean understanding it?",
    "A thermostat responds to temperature. A person can explain why they feel cold.",
    "signals",
    [
      answer(
        "A useful response is enough",
        "collective",
        "You define understanding through what a system can do. Could a group qualify?",
      ),
      answer(
        "It must connect the signal to other things",
        "meaning",
        "Connections give a signal context. But where does meaning come from?",
      ),
      answer(
        "It needs a conscious experience",
        "awareness",
        "You’re separating information processing from actually experiencing something.",
      ),
    ],
  ),
  question(
    "dependence",
    "forest",
    "When does a partnership become a vulnerability?",
    "Imagine that a useful partner suddenly disappears.",
    "cooperation",
    [
      answer(
        "When there is no replacement",
        "redundancy",
        "A single irreplaceable partner makes backup connections especially interesting.",
      ),
      answer(
        "When one side controls the resources",
        "trust",
        "Unequal control changes the balance of an exchange.",
      ),
      answer(
        "When the environment changes",
        "adaptation",
        "A partnership that works here might fail somewhere else.",
      ),
    ],
  ),
  question(
    "trust",
    "forest",
    "How could cooperation survive without trust?",
    "Organisms do not need human intentions for a mutually beneficial exchange.",
    "cooperation",
    [
      answer(
        "Reward the partners that help",
        "trade",
        "You picked feedback through rewards. What makes the exchange worth maintaining?",
      ),
      answer(
        "Keep several partners available",
        "redundancy",
        "You’re avoiding a single point of dependence.",
      ),
      answer(
        "Share the same long-term fate",
        "boundaries",
        "Shared survival raises an unexpected question: where does one individual end?",
      ),
    ],
  ),
  question(
    "redundancy",
    "forest",
    "Would you build a network for efficiency or for survival?",
    "The fastest route and the most resilient structure are not always the same.",
    "intelligence",
    [
      answer(
        "One fast route with little waste",
        "scarcity",
        "Efficiency conserves resources, especially when the supply is limited.",
      ),
      answer(
        "Many routes, even if some sit unused",
        "resilience",
        "You value options when a connection fails. Let’s examine what they protect.",
      ),
      answer(
        "Routes that change as conditions change",
        "transfer",
        "Your network would need to apply past information in a new situation.",
      ),
    ],
  ),
  question(
    "boundaries",
    "forest",
    "Where would you draw the edge of an individual?",
    "Think of a tree and its microbes, or an animal and the organisms it depends on.",
    "fungi",
    [
      answer(
        "Around its physical body",
        "body",
        "A physical boundary feels clear. Dreams put that sense of a body to the test.",
      ),
      answer(
        "Around everything it needs to survive",
        "dependence",
        "You chose a boundary made of relationships. Those relationships can also create risk.",
      ),
      answer(
        "Around a shared sense of self",
        "self",
        "Your boundary is experiential: what makes something feel like one self?",
      ),
    ],
  ),
  question(
    "transfer",
    "forest",
    "What would show you that a system can truly adapt?",
    "Choose the kind of flexibility you find most convincing.",
    "memory",
    [
      answer(
        "Solving a problem it has never seen",
        "creativity",
        "A new problem calls for more than replaying an old response.",
      ),
      answer(
        "Changing when the old strategy fails",
        "adaptation",
        "You chose the ability to change course. What makes that change possible?",
      ),
      answer(
        "Keeping useful lessons from the past",
        "memory",
        "For you, flexibility starts with something that survives from past experience.",
      ),
    ],
  ),
  question(
    "dreams",
    "dreams",
    "What makes a dream feel real while you’re in it?",
    "Your answer decides which part of the dreaming mind we explore.",
    "dreams-root",
    [
      answer(
        "The emotions feel real",
        "emotion",
        "You chose the feeling of the experience, even when its events are impossible.",
      ),
      answer(
        "I don’t realize I’m dreaming",
        "lucidity",
        "You chose awareness of the dream itself. What would happen if it returned?",
      ),
      answer(
        "There is still a ‘me’ experiencing it",
        "self",
        "Even in a changing world, something feels like you. Let’s question that continuity.",
      ),
    ],
  ),
  question(
    "awareness",
    "dreams",
    "How could you tell whether something is conscious?",
    "There is no universally accepted external test for conscious experience.",
    "dream-self",
    [
      answer(
        "It can describe its inner experience",
        "language",
        "A report is evidence we use with people. Is a report enough on its own?",
      ),
      answer(
        "It behaves as if it feels things",
        "emotion",
        "You’re looking at outward signs of an inward state.",
      ),
      answer(
        "I’m not sure we can tell from outside",
        "evidence",
        "You’re acknowledging uncertainty. What would make an uncertain answer stronger?",
      ),
    ],
  ),
  question(
    "memory",
    "dreams",
    "What matters more in a memory?",
    "Dreaming sometimes mixes recent experiences with older knowledge.",
    "dream-memory",
    [
      answer(
        "Remembering exactly what happened",
        "evidence",
        "Accuracy requires a way to compare a memory with independent evidence.",
      ),
      answer(
        "Keeping the lesson, even if details fade",
        "meaning",
        "You chose what an experience means over a perfect recording of it.",
      ),
      answer(
        "Using the pieces to imagine something new",
        "creativity",
        "Recombining the past can turn memory into possibility.",
      ),
    ],
  ),
  question(
    "habit",
    "dreams",
    "If you do something automatically, are you still choosing it?",
    "Think about walking a familiar route while your thoughts are elsewhere.",
    "dream-self",
    [
      answer(
        "Yes — I chose the habit earlier",
        "memory",
        "You connect a present action to a past decision. How should that past be remembered?",
      ),
      answer(
        "Only if I can notice and interrupt it",
        "lucidity",
        "Noticing your own state can change what becomes possible. Dreams offer a striking example.",
      ),
      answer(
        "Not in the moment",
        "intention",
        "You distinguish an action happening from an intention being formed.",
      ),
    ],
  ),
  question(
    "intention",
    "dreams",
    "What makes an action intentional?",
    "Explore your definition rather than looking for one correct answer.",
    "dream-self",
    [
      answer(
        "Having a goal before acting",
        "purpose",
        "A goal points forward. Does every useful process need one?",
      ),
      answer(
        "Knowing why I did it",
        "language",
        "An explanation can reveal a motive, but it can also be a story we tell afterward.",
      ),
      answer(
        "Being able to choose otherwise",
        "lucidity",
        "You associate intention with alternatives. What would you do with that freedom inside a dream?",
      ),
    ],
  ),
  question(
    "meaning",
    "dreams",
    "Where does a dream’s meaning come from?",
    "Interpreting a dream is different from proving what caused it.",
    "dream-purpose",
    [
      answer(
        "What happened in my waking life",
        "memory",
        "You see the dream as connected to experience. What should a memory preserve?",
      ),
      answer(
        "How it makes me feel afterward",
        "emotion",
        "Its emotional effect matters to you even if the story is strange.",
      ),
      answer(
        "The story I choose to make from it",
        "creativity",
        "You see meaning as something you can create, not only something to discover.",
      ),
    ],
  ),
  question(
    "emotion",
    "dreams",
    "Can an imaginary experience have real consequences?",
    "A dream can be fictional while the feeling on waking is very real.",
    "dream-purpose",
    [
      answer(
        "Yes — it can change how I feel",
        "body",
        "That feeling can live in the body as well as in a story.",
      ),
      answer(
        "Yes — it can change what I do next",
        "purpose",
        "You chose an effect on future action. Does that make the experience useful?",
      ),
      answer(
        "Only if I remember it",
        "memory",
        "You made memory the bridge between the dream and waking life.",
      ),
    ],
  ),
  question(
    "lucidity",
    "dreams",
    "You realize you’re dreaming. What would you do first?",
    "Lucid awareness does not guarantee control, but imagine that you have a choice.",
    "lucid",
    [
      answer(
        "Test what the dream will let me change",
        "creativity",
        "You would use the dream as a space for possibility.",
      ),
      answer(
        "Ask who the dream version of me is",
        "self",
        "You turned the question inward: who is having this experience?",
      ),
      answer(
        "Try to send a message to the waking world",
        "language",
        "You want to connect two kinds of experience through a signal.",
      ),
    ],
  ),
  question(
    "self",
    "dreams",
    "What makes you the same person when your experience changes?",
    "Dreams can change your surroundings, abilities, and even your sense of identity.",
    "dream-self",
    [
      answer(
        "My memories connect the different versions",
        "memory",
        "You locate continuity in what carries over from one experience to another.",
      ),
      answer(
        "There is still one body underneath",
        "body",
        "You anchor identity in a living body. How much of that body must you feel?",
      ),
      answer(
        "Maybe the self is a process, not a thing",
        "boundaries",
        "A changing process may not have a fixed edge. Where would you draw its boundary?",
      ),
    ],
  ),
  question(
    "language",
    "dreams",
    "What makes a message meaningful?",
    "Consider an eye movement from a lucid dreamer or a chemical released by a plant.",
    "lucid",
    [
      answer(
        "Someone intended to communicate",
        "intention",
        "For you, meaning begins with intention. How should intention be defined?",
      ),
      answer(
        "Someone can interpret it",
        "signals",
        "You put meaning in the receiver’s response. Could a plant satisfy that condition?",
      ),
      answer(
        "It changes what happens next",
        "light",
        "A message can matter through its effect. In the dark ocean, light can change an encounter.",
      ),
    ],
  ),
  question(
    "creativity",
    "dreams",
    "What feels most like a genuinely new idea?",
    "Choose the kind of surprise you would follow.",
    "dream-memory",
    [
      answer(
        "Old things connected in an unexpected way",
        "collective",
        "You chose novelty through connections. A group can produce a similar surprise.",
      ),
      answer(
        "A solution to a completely new situation",
        "adaptation",
        "You chose novelty under pressure. Life also faces unfamiliar conditions.",
      ),
      answer(
        "A possibility nobody has observed yet",
        "alien",
        "An unobserved possibility invites a bigger leap: what could live beyond Earth?",
      ),
    ],
  ),
  question(
    "ocean",
    "ocean",
    "Could life thrive without sunlight?",
    "Follow the part of the question that catches your imagination.",
    "ocean-root",
    [
      answer(
        "Yes, with another source of energy",
        "energy",
        "You’re looking beyond sunlight to the chemistry that could sustain an ecosystem.",
      ),
      answer(
        "Only if it changes how it survives",
        "adaptation",
        "You picked adaptation to an unfamiliar world.",
      ),
      answer(
        "Maybe — we’ve barely explored the depths",
        "discovery",
        "You’re drawn to the unknown, and to how we investigate it.",
      ),
    ],
  ),
  question(
    "energy",
    "ocean",
    "What would you look for first in a sunless habitat?",
    "Some deep-sea ecosystems are supported by chemical energy.",
    "vents",
    [
      answer(
        "Chemical reactions that could power life",
        "alien",
        "A source of usable chemical energy also matters when searching other worlds.",
      ),
      answer(
        "A way to get enough food",
        "scarcity",
        "Even when energy exists, an organism still has to obtain what it needs.",
      ),
      answer(
        "Partners that can make what I need",
        "dependence",
        "You chose a partnership as a way to survive. What if that partner disappears?",
      ),
    ],
  ),
  question(
    "adaptation",
    "ocean",
    "How would you survive a world that keeps changing?",
    "Imagine this as a strategy question, not a claim that organisms choose their evolution.",
    "pressure",
    [
      answer(
        "Become very good at one specific thing",
        "specialist",
        "Specialization can be powerful when the conditions are right.",
      ),
      answer(
        "Keep several ways of surviving available",
        "redundancy",
        "You’re keeping alternatives instead of committing to one route.",
      ),
      answer(
        "Move somewhere more suitable",
        "migration",
        "You chose movement. In the ocean, that can happen every night.",
      ),
    ],
  ),
  question(
    "discovery",
    "ocean",
    "You can explore one unknown part of the ocean. What do you seek?",
    "Different questions lead to different expeditions.",
    "ocean-root",
    [
      answer(
        "A form of life we haven’t seen before",
        "alien",
        "Unfamiliar life on Earth could challenge how we imagine life elsewhere.",
      ),
      answer(
        "A hidden connection in an ecosystem",
        "collective",
        "You’re looking for relationships that only appear when you consider the whole.",
      ),
      answer(
        "Evidence that challenges what we believe",
        "evidence",
        "You chose a discovery that could change an explanation, not just add a detail.",
      ),
    ],
  ),
  question(
    "scarcity",
    "ocean",
    "When resources are scarce, what seems the best strategy?",
    "Different organisms face very different constraints.",
    "ocean-root",
    [
      answer(
        "Spend less energy",
        "specialist",
        "Conserving energy can favor a very particular way of life.",
      ),
      answer(
        "Travel to where food is available",
        "migration",
        "You would follow resources even if the journey adds risk.",
      ),
      answer(
        "Exchange resources with a partner",
        "trade",
        "You chose mutual dependence over going alone. Why would a partner help?",
      ),
    ],
  ),
  question(
    "body",
    "dreams",
    "How much does your sense of self depend on your body?",
    "A dream can give you convincing sensations without matching your waking surroundings.",
    "dream-self",
    [
      answer(
        "The body is the foundation of who I am",
        "adaptation",
        "If the body anchors identity, changing its environment can change the experience of living.",
      ),
      answer(
        "My memories matter more than my sensations",
        "memory",
        "You chose continuity through remembered experience.",
      ),
      answer(
        "I could still be me with a different body",
        "self",
        "You separate identity from one physical form. What, then, stays the same?",
      ),
    ],
  ),
  question(
    "purpose",
    "dreams",
    "Does something need a purpose to be valuable?",
    "Dream functions remain debated; a personal benefit does not establish an evolutionary purpose.",
    "dream-purpose",
    [
      answer(
        "No — the experience itself can matter",
        "emotion",
        "You value what an experience feels like, even without a measurable job.",
      ),
      answer(
        "Its consequences give it value",
        "response",
        "You’re judging it by what it changes. Does a useful effect imply understanding?",
      ),
      answer(
        "I’d want evidence of what it does",
        "evidence",
        "You want a testable account of its effects.",
      ),
    ],
  ),
  question(
    "light",
    "ocean",
    "In complete darkness, why would you make your own light?",
    "Bioluminescence has different functions in different organisms.",
    "light",
    [
      answer(
        "To attract something I need",
        "scarcity",
        "An attractive signal might help solve the problem of finding scarce resources.",
      ),
      answer(
        "To communicate with another organism",
        "language",
        "You chose light as a message. What makes any signal meaningful?",
      ),
      answer(
        "To confuse something that might eat me",
        "specialist",
        "A defensive display can be a highly specialized solution.",
      ),
    ],
  ),
  question(
    "migration",
    "ocean",
    "Would you move toward food if it also meant more danger?",
    "Many marine organisms migrate vertically; benefits and risks vary by species.",
    "migration",
    [
      answer(
        "Yes, if the reward is worth the risk",
        "scarcity",
        "Your decision depends on how much you need the resource.",
      ),
      answer(
        "Only when conditions make it safer",
        "signals",
        "You would need information about the changing environment before acting.",
      ),
      answer(
        "I’d find another way to survive",
        "energy",
        "You would look for a different source of support instead of making that journey.",
      ),
    ],
  ),
  question(
    "alien",
    "ocean",
    "What would make another world seem capable of supporting life?",
    "Habitability is a possibility, not evidence that life is actually present.",
    "alien",
    [
      answer(
        "Liquid water and a usable energy source",
        "energy",
        "You chose conditions that could support chemistry and metabolism.",
      ),
      answer(
        "Something that looks like biological activity",
        "evidence",
        "A promising sign needs tests that distinguish life from other explanations.",
      ),
      answer(
        "A kind of life unlike anything we know",
        "boundaries",
        "That possibility challenges where we draw the boundary around an organism.",
      ),
    ],
  ),
  question(
    "specialist",
    "ocean",
    "Is being perfectly adapted to one place an advantage?",
    "A narrow specialization can work brilliantly until conditions change.",
    "pressure",
    [
      answer(
        "Yes, while that environment lasts",
        "resilience",
        "You identified the condition that matters: whether the system can withstand change.",
      ),
      answer(
        "Not if it makes change impossible",
        "transfer",
        "You value the ability to carry useful capabilities into a new situation.",
      ),
      answer(
        "It depends on the other organisms there",
        "dependence",
        "Your answer puts relationships back at the center of survival.",
      ),
    ],
  ),
  question(
    "evidence",
    "ocean",
    "What would most change your mind about an explanation?",
    "This is how your curiosity can become an investigation.",
    "alien",
    [
      answer(
        "A repeatable observation that contradicts it",
        "discovery",
        "You’re ready to look for something the explanation cannot accommodate.",
      ),
      answer(
        "A better explanation of the same facts",
        "creativity",
        "You would reconsider when familiar pieces fit together in a new way.",
      ),
      answer(
        "Learning that my test missed something important",
        "awareness",
        "Some questions are difficult partly because we do not yet know how to test them.",
      ),
    ],
  ),
];

questions.push(...extraQuestions);
export const questionById = new Map(questions.map((q) => [q.id, q]));
export type TrailStep = { question: Question; answer: Answer; choice: number };
export function walkTrail(
  world: World,
  input: unknown,
): { current: Question; steps: TrailStep[]; choices: number[] } {
  let current = questionById.get(world)!;
  const steps: TrailStep[] = [];
  const choices: number[] = [];
  if (Array.isArray(input))
    for (const choice of input) {
      if (!Number.isInteger(choice) || !current.answers[choice]) break;
      const selected = current.answers[choice];
      const next = questionById.get(selected.next);
      if (!next) break;
      steps.push({ question: current, answer: selected, choice });
      choices.push(choice);
      current = next;
    }
  return { current, steps, choices };
}
