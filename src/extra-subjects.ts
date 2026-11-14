import type { Question, Answer } from "./questions";
import type { Topic, Idea } from "./data";

const a = (text: string, next: string, connection: string): Answer => ({
  text,
  next,
  connection,
});
const q = (
  id: string,
  world: "football" | "music",
  title: string,
  hint: string,
  idea: string,
  answers: Answer[],
): Question => ({ id, world, title, hint, idea, answers });

// Append new questions after the original collection: shared links encode edge indices.
export const extraQuestions: Question[] = [
  q(
    "football",
    "football",
    "What really wins a football match?",
    "Eleven players. One ball. A thousand decisions. Where would you start?",
    "football-tactics",
    [
      a(
        "A system that makes everyone better",
        "football-tactics",
        "You picked the connections between players. Let’s put your system to the test.",
      ),
      a(
        "One player who changes everything",
        "football-talent",
        "You’re backing individual brilliance. What would you build around it?",
      ),
      a(
        "Staying calm when it matters most",
        "football-pressure",
        "You chose the moments when the game feels biggest. Imagine stepping into one.",
      ),
    ],
  ),
  q(
    "football-tactics",
    "football",
    "Your team has less talent. How do you compete?",
    "Imagine facing a stronger side. Every approach leaves something exposed.",
    "football-tactics",
    [
      a(
        "Press together and force mistakes",
        "football-pressing",
        "You want to make the opponent uncomfortable. A press only works if the team moves together.",
      ),
      a(
        "Keep the ball and control the tempo",
        "football-possession",
        "You chose control through possession. But having the ball is only the beginning.",
      ),
      a(
        "Stay compact and wait for one chance",
        "football-risk",
        "You’re willing to wait. The score and the clock will test that patience.",
      ),
    ],
  ),
  q(
    "football-pressing",
    "football",
    "The first player presses. What must happen next?",
    "An opponent can escape through the space a pressing player leaves behind.",
    "football-tactics",
    [
      a(
        "Everyone closes the next passing options",
        "collective",
        "Your answer turns eleven individuals into a coordinated network. What makes a group intelligent?",
      ),
      a(
        "A teammate protects the space behind",
        "football-tactics",
        "You want security behind the pressure. That shapes the whole tactical plan.",
      ),
      a(
        "Know when to stop chasing and regroup",
        "football-risk",
        "You’re treating pressure as a calculated risk. When should the team change course?",
      ),
    ],
  ),
  q(
    "football-possession",
    "football",
    "You have the ball but create no chances. What changes?",
    "Possession can offer control without producing dangerous attacks.",
    "football-tactics",
    [
      a(
        "Move faster, even if we lose it more",
        "football-risk",
        "You’re trading some control for threat. The match situation determines the cost.",
      ),
      a(
        "Let a creative player break the pattern",
        "football-talent",
        "You’re giving someone permission to improvise. What makes that freedom worthwhile?",
      ),
      a(
        "Coordinate movement away from the ball",
        "football-pressing",
        "You value the players without the ball. Their coordination matters when possession changes too.",
      ),
    ],
  ),
  q(
    "football-risk",
    "football",
    "It’s 1–1 with ten minutes left. Do you chase the win?",
    "Imagine a league match where a draw has value. There is no universal right call.",
    "football-tactics",
    [
      a(
        "Attack — three points are worth the risk",
        "football-pressure",
        "You chose a decisive finish. Now the players have to execute under pressure.",
      ),
      a(
        "Protect the point we already have",
        "redundancy",
        "You value keeping the system secure. How much efficiency would you trade for resilience?",
      ),
      a(
        "Change only when the opponent tires",
        "football-tactics",
        "You’re reading the opponent before committing. Your plan needs to respond to the game.",
      ),
    ],
  ),
  q(
    "football-talent",
    "football",
    "What would you want most from a young player?",
    "Think about potential over several seasons, not just one highlight reel.",
    "football-development",
    [
      a(
        "The courage to try something unexpected",
        "creativity",
        "You value invention. That opens a bigger question about where new ideas come from.",
      ),
      a(
        "The ability to learn after a bad game",
        "transfer",
        "You chose improvement through setbacks. How would you recognize real adaptation?",
      ),
      a(
        "Making the players around them better",
        "football-possession",
        "You’re looking for an influence beyond individual statistics. How does that change a team’s possession?",
      ),
    ],
  ),
  q(
    "football-pressure",
    "football",
    "You’re taking the deciding penalty. What anchors you?",
    "Picture the walk from the halfway line. You can prepare, but you cannot guarantee the outcome.",
    "football-development",
    [
      a(
        "A routine I have repeated in training",
        "habit",
        "You trust a practiced action. How much of an automatic action is still a choice?",
      ),
      a(
        "Reading the goalkeeper in the moment",
        "football-talent",
        "You’re backing perception and skill under pressure. Which qualities would you develop first?",
      ),
      a(
        "Feeling that my team is behind me",
        "football-fans",
        "You chose connection over isolation. Support can change how a game feels.",
      ),
    ],
  ),
  q(
    "football-fans",
    "football",
    "Why does a club feel like part of who you are?",
    "You can love a team without choosing where you were born or who introduced you to it.",
    "football-culture",
    [
      a(
        "The people I share match days with",
        "music-connection",
        "You chose a shared ritual. A crowd singing together can build a similar sense of belonging.",
      ),
      a(
        "The memories attached to the badge",
        "memory",
        "A club carries moments from your own life. What matters most about those memories?",
      ),
      a(
        "The values I want the club to stand for",
        "football-fairness",
        "For you, support includes standards. What should the game protect?",
      ),
    ],
  ),
  q(
    "football-fairness",
    "football",
    "What would make football feel fairer to you?",
    "Rules can clarify decisions without removing every disagreement about fairness.",
    "football-culture",
    [
      a(
        "More consistent decisions on the pitch",
        "evidence",
        "You want decisions supported by better evidence. What would change your mind about a call?",
      ),
      a(
        "More clubs having a real chance to win",
        "football-tactics",
        "You want competition to remain open. How can an underdog compete today?",
      ),
      a(
        "Keeping supporters close to their clubs",
        "football-fans",
        "You put the people around the club at the center. What creates that bond?",
      ),
    ],
  ),
  q(
    "music",
    "music",
    "Why can one song change your whole mood?",
    "A familiar melody, a sudden beat, a voice that seems to understand you. Which part pulls you in?",
    "music-emotion",
    [
      a(
        "It brings back a particular moment",
        "memory",
        "The song is a doorway to an experience. What should that memory preserve?",
      ),
      a(
        "The rhythm changes how my body feels",
        "music-rhythm",
        "You chose a physical response. What makes you want to move with a beat?",
      ),
      a(
        "It expresses something I couldn’t say",
        "music-emotion",
        "You heard something that felt personal. How can sound communicate a feeling?",
      ),
    ],
  ),
  q(
    "music-emotion",
    "music",
    "Why would you choose a sad song when you’re already sad?",
    "People respond differently; the same song can comfort one listener and unsettle another.",
    "music-emotion",
    [
      a(
        "It makes me feel understood",
        "music-connection",
        "You chose companionship through sound. Does music need to be shared to connect us?",
      ),
      a(
        "It helps me make sense of the feeling",
        "meaning",
        "You’re using an experience to create meaning. Where does that meaning come from?",
      ),
      a(
        "The beauty matters more than the sadness",
        "purpose",
        "You value the experience itself. Does something need a practical purpose to matter?",
      ),
    ],
  ),
  q(
    "music-rhythm",
    "music",
    "What makes a beat impossible to sit still to?",
    "Imagine the moment your foot starts tapping before you notice.",
    "music-rhythm",
    [
      a(
        "I can predict what comes next",
        "habit",
        "Your body seems to anticipate the pattern. Is that response something you choose?",
      ),
      a(
        "A little surprise inside a familiar pattern",
        "music-originality",
        "You like expectation being interrupted. How much surprise makes something feel new?",
      ),
      a(
        "Everyone around me moves together",
        "music-connection",
        "You chose a shared pulse. What changes when listening becomes a collective experience?",
      ),
    ],
  ),
  q(
    "music-connection",
    "music",
    "Is a song different when a crowd sings it together?",
    "Think of a stadium chant, a concert chorus, or a song shared with one friend.",
    "music-rhythm",
    [
      a(
        "Yes — it becomes a sense of belonging",
        "football-fans",
        "You chose the bond between listeners. A football crowd can turn a song into an identity.",
      ),
      a(
        "Yes — everyone changes the performance",
        "collective",
        "The audience becomes part of the result. What can a group create that one person cannot?",
      ),
      a(
        "My own connection still matters most",
        "music-taste",
        "You keep the meaning personal. What shaped the music you love?",
      ),
    ],
  ),
  q(
    "music-taste",
    "music",
    "How much of your music taste did you choose?",
    "Family, friends, recommendations, and chance all influence what reaches your ears.",
    "music-culture",
    [
      a(
        "I love what I grew up hearing",
        "memory",
        "Familiar sounds carry your history. What makes those memories valuable?",
      ),
      a(
        "I keep looking for something unfamiliar",
        "music-originality",
        "You want music that surprises you. What would make a sound feel original?",
      ),
      a(
        "The people around me shape what I hear",
        "music-connection",
        "Your taste grows through other people. What happens when you listen together?",
      ),
    ],
  ),
  q(
    "music-originality",
    "music",
    "Can a song be original if it borrows from the past?",
    "Musicians work with inherited instruments, forms, rhythms, and influences.",
    "music-culture",
    [
      a(
        "Yes — a new combination is enough",
        "creativity",
        "You see originality in relationships between familiar parts. What counts as a new idea?",
      ),
      a(
        "Only if the artist makes it personal",
        "self",
        "You put identity at the center of expression. What makes that identity continuous?",
      ),
      a(
        "I care more about how it makes me feel",
        "music-emotion",
        "You chose the effect on the listener. Why do some feelings draw us back to a song?",
      ),
    ],
  ),
];

const idea = (
  id: string,
  title: string,
  summary: string,
  body: string,
  uncertainty: string,
  url: string,
  publisher: string,
  x: number,
  y: number,
  parent?: string,
): Idea => ({
  id,
  title,
  label: parent ? "FOLLOW THE CONNECTION" : "THE BIG QUESTION",
  category: id.startsWith("football") ? "Football" : "Music",
  summary,
  body,
  uncertainty,
  source: { title, url, publisher },
  x,
  y,
  icon: id.startsWith("football") ? "network" : "spark",
  parent,
});
export const extraTopics: Topic[] = [
  {
    id: "football",
    title: "What really wins a football match?",
    short: "Football",
    subtitle: "Tactics, talent, pressure, and the people behind the game.",
    tags: ["Sport", "Strategy", "Belonging"],
    accent: "football",
    nodes: [
      idea(
        "football-tactics",
        "A team is a moving network",
        "The player on the ball is only one part of the picture.",
        "Passing options, movement, pressing, and defensive cover depend on how teammates coordinate. A formation describes a starting structure; players continually change their positions as the match develops. FIFA’s Training Centre offers coaching sessions and match analysis for exploring those decisions.",
        "No formation or possession percentage guarantees victory. Opponents, execution, fatigue, and chance all matter.",
        "https://www.fifatrainingcentre.com/en/",
        "FIFA Training Centre",
        450,
        290,
      ),
      idea(
        "football-development",
        "Talent grows through practice",
        "Technical ability, decision-making, and confidence can all develop.",
        "Coaching involves more than repeating an isolated skill. Players also need chances to perceive options and make decisions in game situations. Preparation can support performance under pressure, although a successful routine cannot guarantee a goal.",
        "Development is individual. One match or one statistic is not a reliable measure of a young player’s long-term potential.",
        "https://www.fifatrainingcentre.com/en/practice/",
        "FIFA Training Centre",
        225,
        470,
        "football-tactics",
      ),
      idea(
        "football-culture",
        "The rules and the people",
        "Football is both a regulated contest and a shared social experience.",
        "The IFAB Laws of the Game define the rules officials apply. Questions about fair competition, access, club identity, and supporters’ influence go beyond individual refereeing decisions. The questions here invite you to explore what you value about the sport.",
        "A legal decision and a personally satisfying outcome are not always the same. The Laws do not settle every debate about fairness in football.",
        "https://www.theifab.com/laws/latest/",
        "The IFAB",
        650,
        470,
        "football-tactics",
      ),
    ],
  },
  {
    id: "music",
    title: "Why can one song change your whole mood?",
    short: "Music",
    subtitle: "Follow a beat into memory, emotion, and belonging.",
    tags: ["Music", "Emotion", "Culture"],
    accent: "music",
    nodes: [
      idea(
        "music-emotion",
        "Sound, memory, and emotion",
        "Music can be meaningful even when it has no words.",
        "Listening to music involves auditory processing alongside systems involved in memory, movement, and emotion. Familiarity and personal context can shape a listener’s response. Research on music and health explores possible benefits while distinguishing everyday listening from clinical music therapy.",
        "There is no single emotional response to a song. Personal associations and circumstances matter; listening is not a substitute for clinical care.",
        "https://www.nccih.nih.gov/health/music-and-health-what-you-need-to-know",
        "NCCIH",
        450,
        290,
      ),
      idea(
        "music-rhythm",
        "Finding a shared pulse",
        "A rhythm gives listeners something to anticipate and move with.",
        "Rhythm organizes events in time. People may synchronize movement with a perceived beat, although rhythms differ widely across musical traditions. Shared performance can include a concert audience, a dance floor, or supporters singing in a stadium.",
        "Not everyone perceives or responds to a rhythm in the same way. A collective experience does not imply that every listener feels the same emotion.",
        "https://www.britannica.com/art/rhythm-music",
        "Encyclopaedia Britannica",
        225,
        470,
        "music-emotion",
      ),
      idea(
        "music-culture",
        "Every sound has a history",
        "Musical traditions travel through people, places, and generations.",
        "The Smithsonian Folkways collection documents music and spoken sound from many communities. Listening across traditions reveals how instruments, styles, and performance practices carry histories, and how artists can reinterpret inherited material.",
        "A recording represents particular performers and circumstances, not an entire culture. Originality, borrowing, and ownership deserve attention to context.",
        "https://folkways.si.edu/",
        "Smithsonian Folkways",
        650,
        470,
        "music-emotion",
      ),
    ],
  },
];
