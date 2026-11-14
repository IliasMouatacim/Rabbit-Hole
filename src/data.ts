import { extraTopics } from "./extra-subjects";
export type Source = { title: string; publisher: string; url: string };
export type Idea = {
  id: string;
  title: string;
  label: string;
  category: string;
  summary: string;
  body: string;
  uncertainty: string;
  source: Source;
  x: number;
  y: number;
  icon: "tree" | "network" | "flask" | "moon" | "spark" | "waves" | "eye";
  parent?: string;
};
export type Topic = {
  id: string;
  title: string;
  short: string;
  subtitle: string;
  tags: string[];
  accent: string;
  nodes: Idea[];
};
export const topics: Topic[] = [
  {
    id: "forest",
    title: "Can a forest think?",
    short: "The secret life of forests",
    subtitle:
      "A journey through roots, relationships, and a surprisingly connected world.",
    tags: ["Nature", "Networks", "Consciousness"],
    accent: "forest",
    nodes: [
      {
        id: "forest-root",
        title: "Can a forest think?",
        label: "THE BIG QUESTION",
        category: "Ecology",
        summary:
          "Beneath the quiet of a forest, an extraordinary exchange is taking place.",
        body: "Trees interact with fungi, microbes, animals, and one another. These relationships can move nutrients, alter growth, and influence survival. But interaction is not the same as thought. Exploring the difference reveals both remarkable biology and the limits of our metaphors.",
        uncertainty:
          "There is no established evidence that a forest has a mind. The useful question is how complex behavior can emerge from many local interactions.",
        source: {
          title: "The wood-wide web: a review of the evidence",
          publisher: "Nature Ecology & Evolution",
          url: "https://doi.org/10.1038/s41559-023-01986-1",
        },
        x: 465,
        y: 345,
        icon: "tree",
      },
      {
        id: "fungi",
        title: "The network beneath your feet",
        label: "HIDDEN CONNECTIONS",
        category: "Mycology",
        summary: "Fungal threads can connect the roots of different plants.",
        body: "Mycorrhizal fungi form partnerships with plant roots. Plants provide carbon compounds, while fungi can help plants obtain nutrients. Some fungal networks link multiple plants. The scale, frequency, and ecological effects of these connections in wild forests remain active research questions.",
        uncertainty:
          "Evidence that connections exist is stronger than evidence that forests routinely use them to share resources in a cooperative way.",
        source: {
          title:
            "Positive citation bias and overinterpreted results in research on common mycorrhizal networks",
          publisher: "Nature Ecology & Evolution",
          url: "https://doi.org/10.1038/s41559-023-01986-1",
        },
        x: 160,
        y: 165,
        icon: "network",
        parent: "forest-root",
      },
      {
        id: "signals",
        title: "Do trees warn each other?",
        label: "CHEMICAL CONVERSATIONS",
        category: "Plant science",
        summary:
          "A damaged leaf can release chemicals that change a neighbor’s defenses.",
        body: "Plants release volatile organic compounds into the air. In some experiments, nearby plants exposed to compounds from damaged neighbors become better prepared for herbivores. Calling this a warning is a helpful shorthand, but it does not imply intention or language.",
        uncertainty:
          "Effects depend on species, distance, and environmental conditions. Findings from controlled experiments do not automatically generalize to whole forests.",
        source: {
          title: "Plant communication: mediated by individual or blended VOCs?",
          publisher: "Trends in Plant Science",
          url: "https://doi.org/10.1016/j.tplants.2010.11.009",
        },
        x: 760,
        y: 160,
        icon: "waves",
        parent: "forest-root",
      },
      {
        id: "cooperation",
        title: "Cooperation, or a good trade?",
        label: "A DIFFERENT PERSPECTIVE",
        category: "Evolution",
        summary:
          "A mutually beneficial exchange need not be an act of generosity.",
        body: "A fungus and a plant can both benefit from exchanging resources while pursuing their own biological interests. Experiments show that partners may preferentially reward partners that supply more resources. This makes a market a useful alternative metaphor to friendship.",
        uncertainty:
          "Biological markets are explanatory models. They do not mean that plants consciously negotiate or that every interaction is mutually beneficial.",
        source: {
          title:
            "Reciprocal rewards stabilize cooperation in the mycorrhizal symbiosis",
          publisher: "Science",
          url: "https://doi.org/10.1126/science.1208473",
        },
        x: 95,
        y: 440,
        icon: "flask",
        parent: "fungi",
      },
      {
        id: "memory",
        title: "Can a plant remember?",
        label: "AN UNEXPECTED TURN",
        category: "Plant science",
        summary:
          "Past conditions can change how a plant responds to the future.",
        body: "Plants exposed to stresses can undergo physiological or epigenetic changes that influence later responses. Researchers sometimes call this stress memory. It is a specific biological phenomenon, distinct from the conscious recollection of an experience.",
        uncertainty:
          "The persistence and inheritance of these changes vary. Evidence for stress priming is not evidence for a conscious experience.",
        source: {
          title:
            "Epigenetic and chromatin-based mechanisms in environmental stress adaptation and stress memory in plants",
          publisher: "Genome Biology",
          url: "https://doi.org/10.1186/s13059-017-1263-6",
        },
        x: 800,
        y: 445,
        icon: "spark",
        parent: "signals",
      },
      {
        id: "intelligence",
        title: "Intelligence without a brain",
        label: "THE NEXT BIG QUESTION",
        category: "Complex systems",
        summary:
          "Simple local rules can produce surprisingly sophisticated collective behavior.",
        body: "Ant colonies, slime molds, and other decentralized systems can solve coordination problems without a central controller. Comparing them with forests raises a question about definitions: which kinds of adaptive behavior should count as intelligence?",
        uncertainty:
          "There is no single agreed definition of intelligence across these systems. Avoid treating adaptation, computation, and consciousness as interchangeable.",
        source: {
          title: "Rules for biologically inspired adaptive network design",
          publisher: "Science",
          url: "https://doi.org/10.1126/science.1177894",
        },
        x: 450,
        y: 620,
        icon: "eye",
        parent: "forest-root",
      },
    ],
  },
  {
    id: "dreams",
    title: "Where do we go when we dream?",
    short: "Inside the dreaming mind",
    subtitle:
      "Step into the strange space between memory, imagination, and consciousness.",
    tags: ["Mind", "Sleep", "Consciousness"],
    accent: "dreams",
    nodes: [
      {
        id: "dreams-root",
        title: "Where do we go when we dream?",
        label: "THE BIG QUESTION",
        category: "Neuroscience",
        summary:
          "The world outside fades, but the brain keeps making worlds of its own.",
        body: "Dreaming is a form of internally generated experience that can occur during both REM and non-REM sleep. Its imagery, emotions, and sense of reality offer a window into how the brain constructs conscious experience.",
        uncertainty:
          "Scientists can measure sleep and collect dream reports, but a report after awakening is an imperfect record of the experience.",
        source: {
          title:
            "Dreaming and the brain: from phenomenology to neurophysiology",
          publisher: "Trends in Cognitive Sciences",
          url: "https://doi.org/10.1016/j.tics.2010.12.001",
        },
        x: 465,
        y: 345,
        icon: "moon",
      },
      {
        id: "rem",
        title: "A brain that stays awake",
        label: "BEHIND CLOSED EYES",
        category: "Sleep science",
        summary:
          "REM sleep combines an active brain with a largely still body.",
        body: "During REM sleep, the brain shows patterns of activity that differ from deep non-REM sleep. Most skeletal muscles are inhibited. Vivid dreams are common, although dreaming is not exclusive to this stage.",
        uncertainty:
          "Brain activity during REM is not identical to waking. The relationship between sleep stage and dream content is probabilistic.",
        source: {
          title: "Brain basics: understanding sleep",
          publisher: "NINDS",
          url: "https://www.ninds.nih.gov/health-information/public-education/brain-basics/brain-basics-understanding-sleep",
        },
        x: 160,
        y: 165,
        icon: "waves",
        parent: "dreams-root",
      },
      {
        id: "dream-memory",
        title: "The overnight editing room",
        label: "MAKING CONNECTIONS",
        category: "Memory",
        summary: "Sleep helps stabilize and reorganize some kinds of memory.",
        body: "Research supports a role for sleep in memory consolidation. Newly learned information can be reactivated and integrated with existing knowledge. Dream content sometimes incorporates recent experiences, but it is not a literal playback of them.",
        uncertainty:
          "The role of sleep in memory is better established than a claim that dreams themselves are necessary for consolidation.",
        source: {
          title: "Sleep, memory, and plasticity",
          publisher: "Annual Review of Psychology",
          url: "https://doi.org/10.1146/annurev.psych.56.091103.070307",
        },
        x: 760,
        y: 160,
        icon: "network",
        parent: "dreams-root",
      },
      {
        id: "lucid",
        title: "Knowing you are dreaming",
        label: "THE LUCID EDGE",
        category: "Consciousness",
        summary: "Sometimes the dreamer realizes that the world is a dream.",
        body: "Lucid dreamers report awareness of dreaming while remaining asleep. In laboratory settings, some have used prearranged eye movements to signal lucidity. Awareness does not always come with control over the dream.",
        uncertainty:
          "Reliable induction remains difficult. Results from experienced lucid dreamers may not generalize to everyone.",
        source: {
          title:
            "Real-time dialogue between experimenters and dreamers during REM sleep",
          publisher: "Current Biology",
          url: "https://doi.org/10.1016/j.cub.2021.01.026",
        },
        x: 95,
        y: 440,
        icon: "eye",
        parent: "rem",
      },
      {
        id: "dream-purpose",
        title: "Do dreams have a purpose?",
        label: "AN OPEN DEBATE",
        category: "Psychology",
        summary:
          "Emotional rehearsal, memory processing—or a byproduct of a sleeping brain?",
        body: "Several theories propose functions for dreaming, including simulating threats and processing emotions. Other accounts emphasize how dreams arise from sleeping brain activity. These explanations are not all mutually exclusive.",
        uncertainty:
          "No single theory explains all dreaming. An appealing story about a dream’s purpose is not experimental proof.",
        source: {
          title: "Dreaming and the brain",
          publisher: "Trends in Cognitive Sciences",
          url: "https://doi.org/10.1016/j.tics.2010.12.001",
        },
        x: 800,
        y: 445,
        icon: "flask",
        parent: "dream-memory",
      },
      {
        id: "dream-self",
        title: "Who is the “you” in a dream?",
        label: "THE NEXT BIG QUESTION",
        category: "Philosophy of mind",
        summary:
          "Dreams challenge the idea that a coherent self needs a stable outside world.",
        body: "In a dream we can accept impossible events, occupy unfamiliar roles, and experience a convincing sense of presence. Studying these changes may help separate different components of self-awareness and conscious experience.",
        uncertainty:
          "Philosophical interpretations go beyond what brain measurements alone can establish.",
        source: {
          title: "Dreams and dreaming",
          publisher: "Stanford Encyclopedia of Philosophy",
          url: "https://plato.stanford.edu/entries/dreams-dreaming/",
        },
        x: 450,
        y: 620,
        icon: "spark",
        parent: "dreams-root",
      },
    ],
  },
  {
    id: "ocean",
    title: "What lives beyond the sunlight?",
    short: "The ocean’s other world",
    subtitle:
      "Descend into darkness, living light, and life that rewrites the rules.",
    tags: ["Ocean", "Life", "Discovery"],
    accent: "ocean",
    nodes: [
      {
        id: "ocean-root",
        title: "What lives beyond the sunlight?",
        label: "THE BIG QUESTION",
        category: "Marine biology",
        summary: "Most of the ocean is a world that sunlight never reaches.",
        body: "Below the sunlit surface, organisms survive in conditions that differ dramatically from those on land. Many rely on material sinking from above; others belong to ecosystems fueled by chemical reactions. Darkness is a habitat, not an absence of life.",
        uncertainty:
          "The deep ocean remains unevenly sampled. New observations frequently change estimates of biodiversity and distribution.",
        source: {
          title: "How far does light travel in the ocean?",
          publisher: "NOAA Ocean Service",
          url: "https://oceanservice.noaa.gov/facts/light_travel.html",
        },
        x: 465,
        y: 345,
        icon: "waves",
      },
      {
        id: "vents",
        title: "Life without the sun",
        label: "REWRITING THE RULES",
        category: "Microbiology",
        summary:
          "At hydrothermal vents, microbes build food from chemical energy.",
        body: "Some microorganisms use the energy from chemical reactions to fix carbon. At deep-sea vents, these primary producers support animals including tube worms and mussels through food webs and symbiotic partnerships.",
        uncertainty:
          "Not every vent ecosystem uses the same chemistry. Many deep-sea ecosystems still depend heavily on photosynthesis at the surface.",
        source: {
          title: "What is chemosynthesis?",
          publisher: "NOAA Ocean Exploration",
          url: "https://oceanexplorer.noaa.gov/facts/chemosynthesis.html",
        },
        x: 160,
        y: 165,
        icon: "flask",
        parent: "ocean-root",
      },
      {
        id: "light",
        title: "A language made of light",
        label: "IN THE DARK",
        category: "Bioluminescence",
        summary:
          "Living light can attract prey, confuse predators, or help find a mate.",
        body: "Bioluminescence is light produced by a chemical reaction in a living organism. It has evolved in many marine groups. Some animals produce light themselves; others host luminous bacteria.",
        uncertainty:
          "The function of a light display is not always known. Observing it in captivity may not reveal its full role in the wild.",
        source: {
          title: "What is bioluminescence?",
          publisher: "NOAA Ocean Exploration",
          url: "https://oceanexplorer.noaa.gov/facts/bioluminescence.html",
        },
        x: 760,
        y: 160,
        icon: "spark",
        parent: "ocean-root",
      },
      {
        id: "pressure",
        title: "Built for crushing pressure",
        label: "EXTREME ADAPTATIONS",
        category: "Physiology",
        summary:
          "Life at depth requires adaptations all the way down to molecules.",
        body: "High pressure changes how proteins and cell membranes behave. Deep-sea organisms have biochemical and structural adaptations that help them function. Bringing an animal to the surface can disturb those carefully balanced conditions.",
        uncertainty:
          "Pressure is only one factor. Temperature, oxygen, and food supply also shape the limits of different species.",
        source: {
          title: "Deep-ocean exploration",
          publisher: "Smithsonian Ocean",
          url: "https://ocean.si.edu/ecosystems/deep-sea",
        },
        x: 95,
        y: 440,
        icon: "network",
        parent: "vents",
      },
      {
        id: "migration",
        title: "Earth’s nightly commute",
        label: "HIDDEN IN PLAIN SIGHT",
        category: "Ecology",
        summary:
          "Vast numbers of marine animals rise toward the surface at night.",
        body: "Diel vertical migration takes zooplankton and other animals toward shallower water to feed, then deeper again as daylight returns. These movements link food webs and transport carbon through the water column.",
        uncertainty:
          "Migration patterns vary across species and regions. Quantifying their global contribution to carbon transport is an ongoing task.",
        source: {
          title: "What is diel vertical migration?",
          publisher: "NOAA Ocean Exploration",
          url: "https://oceanexplorer.noaa.gov/facts/vertical-migration.html",
        },
        x: 800,
        y: 445,
        icon: "moon",
        parent: "light",
      },
      {
        id: "alien",
        title: "A clue to life elsewhere?",
        label: "THE NEXT BIG QUESTION",
        category: "Astrobiology",
        summary:
          "Ocean worlds in our solar system make deep-sea life especially intriguing.",
        body: "Evidence for subsurface oceans on moons such as Europa and Enceladus has expanded the search for habitable environments. Earth’s chemically powered ecosystems show that sunlight is not the only possible energy source for life.",
        uncertainty:
          "Habitability is not proof of life. No extraterrestrial organism has been confirmed.",
        source: {
          title: "Europa: facts",
          publisher: "NASA Science",
          url: "https://science.nasa.gov/jupiter/moons/europa/facts/",
        },
        x: 450,
        y: 620,
        icon: "eye",
        parent: "ocean-root",
      },
    ],
  },
];
topics.push(...extraTopics);
export const allIdeas = topics.flatMap((topic) =>
  topic.nodes.map((idea) => ({ topic, idea })),
);
