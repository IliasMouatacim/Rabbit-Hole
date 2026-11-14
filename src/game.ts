export type Choice = {
  label: string;
  detail: string;
  power: number;
  trust: number;
  time: number;
  saved: number;
  flag: string;
  result: string;
};
export type Call = {
  name: string;
  role: string;
  district: string;
  title: string;
  message: string;
  choices: Choice[];
};
const c = (
  label: string,
  detail: string,
  power: number,
  trust: number,
  time: number,
  saved: number,
  flag: string,
  result: string,
): Choice => ({ label, detail, power, trust, time, saved, flag, result });
export function getCall(
  turn: number,
  flags: string[],
  hard: boolean,
  trust = 64,
): Call {
  const hospital = flags.includes("hospital"),
    engineer = flags.includes("engineer"),
    verified = flags.includes("verified");
  const calls: Call[] = [
    {
      name: "DR. MARA VOSS",
      role: "St. Jude’s Hospital · emergency channel",
      district: "hospital",
      title: "One battery. Two lifelines.",
      message:
        "The backup power is failing. I have twelve patients on ventilators. But the evacuation train needs that battery, too. It leaves in six minutes. Where do we send it?",
      choices: [
        c(
          "Send it to the hospital",
          "Keep life support running",
          -24,
          8,
          40,
          12,
          "hospital",
          "St. Jude’s lights come back on. Twelve patients have another chance. At Central, the platform falls silent.",
        ),
        c(
          "Power the evacuation train",
          "Get the last train moving",
          -24,
          -5,
          30,
          36,
          "station",
          "The last train pulls out of Central with 36 people aboard. Dr. Voss stays on the line, then quietly disconnects.",
        ),
      ],
    },
    {
      name: "ELI NAVARRO",
      role: "Maintenance engineer · Northbank",
      district: "oldtown",
      title: "A voice beneath the water.",
      message:
        "I’m trapped in the maintenance tunnel. I know how to open the east bridge manually. Send a relay pulse and I can find my way out.",
      choices: [
        c(
          "Send the relay pulse",
          "Locate Eli in the tunnel",
          -18,
          6,
          40,
          1,
          "engineer",
          "A faint reply: “I see the light. I’m coming up.” Eli will remember this.",
        ),
        c(
          "Keep the reserve",
          "The city still needs power",
          0,
          -4,
          20,
          0,
          "reserve",
          "The signal fades beneath the water. Your battery stays steady.",
        ),
      ],
    },
    {
      name: "UNKNOWN CALLER",
      role: "Unidentified signal · 104.2 MHz",
      district: "oldtown",
      title: "Something in the static.",
      message:
        "A broken transmission mentions a school shelter. Tune to 104.2 MHz to recover the coordinates, or carry on with the evacuation.",
      choices: [
        c(
          "Recover the transmission",
          "Tune to 104.2 MHz first",
          -8,
          5,
          35,
          18,
          "signal",
          "The static clears. Eighteen people in the school shelter now have a way out.",
        ),
        c(
          "Stay on emergency channel",
          "Preserve the remaining signal",
          0,
          0,
          15,
          0,
          "silent",
          "The hidden transmission disappears. The emergency line remains open.",
        ),
      ],
    },
    {
      name: "JUNE PARK",
      role: "Volunteer coordinator · Old Town",
      district: "oldtown",
      title: "A warning without a source.",
      message:
        "Someone says the west levee has broken. If we broadcast now, the shelter will empty into the streets. Can you confirm it before we tell them?",
      choices: [
        c(
          "Verify with the flood sensor",
          "Spend power to get the truth",
          -12,
          10,
          40,
          8,
          "verified",
          "The levee is holding. You stop a false alarm; eight volunteers reach the shelter safely.",
        ),
        c(
          "Broadcast the warning",
          "Better a warning than silence",
          0,
          -14,
          20,
          0,
          "panic",
          "Families rush onto a flooded road. Your warning spreads faster than the correction.",
        ),
      ],
    },
    {
      name: engineer ? "ELI NAVARRO" : "TRANSIT CONTROL",
      role: "East bridge · service frequency",
      district: "station",
      title: engineer ? "A debt repaid." : "The bridge is locked.",
      message: engineer
        ? "You got me out. Let me return the favour. I can open the bridge by hand. Just tell the families to come across."
        : "The east bridge has lost its control circuit. We can jump-start it from the station, but it will cost most of the reserve.",
      choices: [
        c(
          engineer ? "Give Eli the go-ahead" : "Restart the bridge",
          engineer
            ? "Your earlier choice opens a route"
            : "Restore the evacuation crossing",
          engineer ? 0 : -22,
          8,
          35,
          30,
          "bridge",
          "The bridge opens. Thirty people cross the river toward the evacuation point.",
        ),
        c(
          "Use the riverside path",
          "Save power; take the longer route",
          0,
          -2,
          60,
          10,
          "path",
          "Ten people reach the far bank. Others turn back as the water rises.",
        ),
      ],
    },
    {
      name: "DR. MARA VOSS",
      role: "St. Jude’s Hospital · emergency channel",
      district: "hospital",
      title: hospital ? "The patients are ready." : "Still here. Still trying.",
      message: hospital
        ? "Your battery held. We have the patients ready for transfer. Can you send a powered ambulance to meet us?"
        : "We lost the ventilators. Six patients can still walk. Help me bring them to the ferry before the streets flood.",
      choices: [
        c(
          "Dispatch the ambulance",
          "Bring the hospital survivors home",
          -16,
          8,
          40,
          hospital ? 24 : 6,
          "ambulance",
          hospital
            ? "Twenty-four patients and staff reach the ferry. Mara says your name over the radio."
            : "Mara brings six survivors through the rain. She never asks about the battery again.",
        ),
        c(
          "Guide them on foot",
          "Keep the last power for broadcast",
          0,
          -5,
          55,
          hospital ? 12 : 3,
          "walk",
          "You talk them through the dark streets. Some arrive; the others lose the signal.",
        ),
      ],
    },
    {
      name: "CAPTAIN ADA REED",
      role: "Harbour rescue · channel 09",
      district: "station",
      title: "Two voices. One route.",
      message: verified
        ? "Your sensor report checks out. The harbour route is clear. We can take a full ferry if you light the way."
        : "A caller insists the harbour is safe. Another says it is blocked. With no verified report, sending the ferry could put everyone at risk.",
      choices: [
        c(
          "Light the harbour route",
          "Commit the reserve to rescue",
          -14,
          verified ? 8 : -8,
          35,
          verified ? 35 : 8,
          "harbour",
          verified
            ? "The ferry follows your lights. Thirty-five people board safely."
            : "The ferry turns back at a wreck. Eight people climb aboard, but the delay costs precious minutes.",
        ),
        c(
          "Use the confirmed north exit",
          "A smaller, reliable evacuation",
          -4,
          4,
          30,
          16,
          "north",
          "Sixteen people leave by the north road. Their headlights disappear over the hill.",
        ),
      ],
    },
    {
      name: "THE CITY",
      role: "All frequencies · final transmission",
      district: "oldtown",
      title: "What do you leave on the air?",
      message:
        "The grid is going. There’s time for one last transmission. Outside, the city is listening. Make the last signal count.",
      choices: [
        c(
          "Broadcast the safe routes",
          trust < 40
            ? "Trust is low; fewer families will follow"
            : "One last practical act of hope",
          -10,
          10,
          25,
          trust < 40 ? 10 : 20,
          "routes",
          trust < 40
            ? "After the earlier warnings, some families no longer believe the station. Ten follow your directions to safety."
            : "Your voice reaches the last families in the dark. Twenty more people find a way out.",
        ),
        c(
          "Let the city speak",
          "Open the channel to everyone",
          0,
          16,
          20,
          8,
          "voices",
          "Names, goodbyes, and small promises fill the frequency. No one faces the final darkness alone.",
        ),
      ],
    },
  ];
  const call = calls[turn];
  return hard
    ? {
        ...call,
        choices: call.choices.map((x) => ({
          ...x,
          power: x.power < 0 ? x.power - 3 : x.power,
        })),
      }
    : call;
}
