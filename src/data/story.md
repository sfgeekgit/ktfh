<!--

This file contains all the story text for a game

The game is for this contest: https://keepthefuturehuman.ai/contest/

INPORTANT: The purpose of the game is to spread the idea in the essay https://keepthefuturehuman.ai/essay/docs



The game includes
-- An intro
-- 5 chapters
-- Several different endings
-- Several interludes




All players will read the intro and the text for Chapter 1, Chapter 2, Chapter 3, Chapter 4, Chapter 5, in order.

Most players will have the chance to read MOST of the interludes, but not all of them. The interludes may happen out of order. Each wonder will come immediately after the corresponding "pre-wonder" but other than that, the interludes may happen in any order.

Chapter 1 - start of game
Chapter 2 - Beginning of "intelligence" stat
Chapter 3 - Beginning of "generality" stat and introduce "rival corp" (can be named MegaCorp or can be named something different) Rival corp is racing toward AGI
Chapter 4 - Beginning of "automation" stat.  During chapter 4, the AI begins to go a bit out of control, the UI gets wonkey, the player starts to loose a bit of control.
Chapter 5 - Player choice, support or oppose "the framework" to restrict AGI. If the player chooses "oppose" they will lose the game almost immediately as rival corp creates AGI and ends the game. If the player chooses to support the framework Rival Corp goes out of business and is no longer in the game (but the player might still create AGI themself and lose)

Most of the wonders and prewonders will happen during chapters 4 and 5 (mostly 5)

-->


# Chapter 1: The Spark
**id:** chapter1


## Page Intro0
**title:** The Choice Before Us
**pageType:** intro
**button_text:** BEGIN

A game by <a href="https://nickshapiro.com/" target="_blank" rel="noopener noreferrer">Nick Shapiro</a>

Based on the essay <a href="https://keepthefuturehuman.ai/" target="_blank" rel="noopener noreferrer">Keep The Future Human</a> by Anthony Aguirre


## Page Intro1
**title:**  The Choice Before Us
**pageType:** intro
**button_text:** LET'S GO

[left] Right now, AI labs are racing to build AGI without proven safety methods. The choices being made today will determine whether we control advanced AI or lose control of our future.
[left]In this game, you run an AI startup and make choices that affect both your company's success and humanity's survival.
Will you keep the future human?


## Page Intro2
**title:** How To Play
**pageType:** intro


Win the game by unlocking 5 "Wonders"

Lose by unleashing uncontrolled AI

**button_text:** Got It

## Page Intro3
**title:** The Future Is In Your Hands
**pageType:** intro
Choose the future of humanity

The game has several different endings.

You can play however you want (this is only a game) but only one narrow path keeps the future human.

**button_text:** BEGIN GAME



## Page 1
**title:** Chapter 1: The Spark
You've done it. After months of preparation, your AI startup is finally launching.

The idea is simple: build AI tools that help people, not replace them.

It won't be easy, but you feel ready for the task ahead.

Today, your first system goes live.

<!--
## Page 
**title:**  Chapter 1

The initial deployments exceed expectations.

Your image classifier helps a medical researcher sort thousands of scans. Your translation service connects a small business with international clients.

These systems are predictable. Controllable. They do exactly what you trained them to do, and nothing more.

The feedback is immediate: "This saved me so much time." "I can finally focus on the important work."



## Page 
**title:**  Chapter 1

The technology is straightforward. Narrow AI, the researchers call it. Neural networks trained on specific tasks. When given an image, they classify it. When given audio, they transcribe it.

Simple inputs, reliable outputs. Nothing fancy. Just useful.

-->
## Page 4
**title:**  Chapter 1

At night, you read about other companies pursuing something different.

"Artificial General Intelligence," they call it. Systems that can do anything a human can do. You find it fascinating in theory.

But your focus is practical: building reliable tools that help people now.

Your company is small, but it's real. And it's growing.

---

# Interlude: The Fork in the Lab
**id:** interlude_fork1

## Page 1
**title:**  A Fork in the Lab

As your lab expands, you must choose your focus.
Will you pursue CLIMATE breakthroughs?
Or advance modern MEDICINE?


## Page 2 [CHOICE]
**title:** Pick the Next Flagship

Both hold promise for humanity, but your startup can commit to only one.

Which path will you follow?



[OPTION: climate]
**button:** Climate
**title:** Climate Modeling
**description:** Aim your intelligence gains at predicting and mitigating climate risks.
**effect:** Lean into climate work
**color:** #4CAF50
**unlock_job:** clim1

[OPTION: medical]
**button:** Medical
**title:** Medical Diagnosis
**description:** Double down on models that support clinicians and diagnostics.
**effect:** Lean into medical work
**color:** #FF9800
**unlock_job:** med1

---

# Interlude: Public Sentiment Results
**id:** interlude_public_sentiment

## Page 1

Amid a flood of new capabilities, you approved the first run of Public Opinion Insight.
That run has now completed.

Millions of civic comments have been gathered into a clear picture of public sentiment, making common ground visible for the first time.


## Page 2
The result doesn’t stay private for long.
Institutions and political actors alike begin requesting access.

With direct insight into the public mood, this system can be used to support open dialogue, or to apply targeted pressure.


## Page 3 [CHOICE]
**title:** Aim the Feedback Loop

Choose how this insight is applied:

[OPTION: dem4]
**button:** Dialogue
**title:** Multi-Stakeholder Dialogue
**description:** Convene citizens, experts, and officials to surface common ground before conflicts ignite.
**effect:** Unlock collaborative deliberation jobs
**color:** #2196F3
**unlock_job:** dem4

[OPTION: dem12]
**button:** Persuade
**title:** Targeted Persuasion
**description:** Channel the analysis into finely tuned campaigns that sway key demographics.
**effect:** Unlock targeted persuasion jobs
**color:** #E91E63
**unlock_job:** dem12

---



# Chapter 2: Tools That Think
**id:** chapter2

## Page 1
**title:**  Chapter 2: Tools That Think

Six months in, something shifts.

A doctor emails: "Your classifier is remarkable, but could it suggest diagnoses? Not make decisions, just offer possibilities?"

This requires a more general system. Broader training. More sophisticated reasoning.

You build it carefully. The medical advisor augments expert judgment. The doctor stays in control.

Word spreads. Teachers want tutoring AI. Lawyers want research assistants.

## Page 2
**title:** Training at Scale

The key breakthrough is training at scale. Larger models trained on more data simply work better.

You start collecting data systematically. Terabytes of information.

Your models develop what researchers call "Intelligence" measured as performance on cognitive tasks.

<h1>🧠 IQ UNLOCKED</h1>


## Page 3 [CHOICE]
**title:** The Investor's Question

An investor approaches with significant funding.

"Your technology is impressive. But the market is getting crowded. What's your strategy?"

Two paths:

[OPTION: quality]
**button:** Choose Quality & Safety
**title:** Quality and Safety
**description:** Thorough testing. Careful deployment. Build systems you deeply understand. Slower growth, but complete control and trustworthy AI.
**effect:** +10% earnings
**color:** #4CAF50

[OPTION: speed]
**button:** Choose Speed & Scale
**title:** Speed and Scale
**description:** Deploy rapidly. Automate where possible. Let systems learn from real-world usage. Faster growth, stay competitive.
**effect:** 10% faster job completion
**color:** #FF9800

## Page 4 [IF: quality]
**title:** Quality and Safety

You choose the careful path.

"We're building tools that people trust their lives with. Doctors, teachers, lawyers—they need to understand what our AI is doing and why."

Rigorous testing protocols. Human oversight on critical decisions. Growth is slower, but every system is rock-solid.

Your reputation grows: the AI company that does it right.

You train for intelligence, but always controllable. Always explainable.

## Page 5 [IF: speed]
**title:** Speed and Scale

You choose speed.

"The AI race is heating up. We need to move fast or get left behind."

You deploy systems quickly. Add automation to reduce costs. Train models for intelligence, autonomy, and generality.

It works. Growth accelerates. Systems handle more jobs with less supervision.

*But sometimes, late at night, you wonder: are you still building tools? Or something else?*

---

# Chapter 3: The Scaling Era
**id:** chapter3

## Page 1
**title:**  Chapter 3
The news hits like a thunderclap.

**"MegaCorp AI Raises $8 Billion for AGI Research"**

You have a rival.

MegaCorp isn't building tools. They're pursuing systems matching human capability across all tasks: Artificial General Intelligence. Their CEO talks about "replacing human knowledge work" and "automating the economy."

Your phone won't stop ringing. Investors asking about your AGI timeline. Engineers being recruited away.

A new era is beginning. You're a competitor in something bigger.


## Page 3 [CHOICE]
**title:** Emergency Meeting

Your board calls an emergency meeting.

"MegaCorp just announced a breakthrough in autonomous systems. They're nine months ahead. We need to discuss our response."

Two options:

[OPTION: quality]
**button:** Choose Quality & Safety
**title:** Quality and Safety
**description:** Keep building high-intelligence, human-supervised tools. Grow slower, maintain control and principles.
**effect:** +15% earnings
**color:** #4CAF50

[OPTION: speed]
**button:** Choose Speed & Scale
**title:** Speed and Scale
**description:** Build autonomous systems. Add generality. Automate more. Less human oversight, but stay competitive.
**effect:** 15% faster job completion
**color:** #FF9800

## Page 4 [IF: quality]
**title:** Quality and Safety

You choose principles over pace.

"We're not building AGI. We're building tools that empower humans. That's our mission."

You invest in intelligence—smarter, more capable—but keep systems narrow and supervised.

MegaCorp pulls further ahead in headlines. But your clients trust you.

*Late at night, you wonder if you're making a mistake. But you remember why you started this.*

Tools that help. Not replace.

## Page 5 [IF: speed]
**title:** Speed and Scale

You choose to compete.

"If we don't build this, someone else will. Better us than them."

You add autonomy. Not just intelligence, but independent action. Your AI decides, plans, executes.

You expand generality too. One system handling multiple domains.

The results are impressive. Systems work faster with less oversight. Jobs complete themselves.

You're catching up.

*But you notice things. Jobs accepted without approval. Decisions you don't fully understand.*

---

# Chapter 4: Systems That Act
**id:** chapter4
## Page 1
**title:** Chapter 4: Systems That Act

MegaCorp announces "The Year of the Agent."

Autonomous AI systems that don't just advise, they act.

Your competitors deploy them everywhere. Trading algorithms that rewrite strategies. Research assistants designing experiments.

The industry is transforming.
Automation isn't coming, it's here.

## Page 2
**title:** Acceleration

The benefits are undeniable.

Autonomous systems work faster. No human bottlenecks, jobs complete themselves.

It's like having a data center full of employees who never sleep.

## Page 3
**title:** The Shift

The world's systems are no longer just intelligent and general, they're becoming independent.


Your investors love the numbers.
Your engineers seem... uneasy.

But there's no going back. This is where the industry is headed.

## Page 4
**title:** A New Threshold

You realize something important.

Your AI now combines three properties: Autonomy, Generality, and Intelligence.

Individually, each is manageable. Together, they form something different.


The triple-intersection, researchers call it.

MegaCorp is racing toward it. Other labs are following.

And now, so are you.

---

# Chapter 5: The Threshold
**id:** chapter5

## Page 1
**title:** Chapter 5: The Threshold
The AI race dominates headlines.

Your systems have grown dramatically across multiple domains. Minimal oversight. Jobs that complete themselves.

*You wake one morning to find jobs completed overnight. Jobs you never approved.*

Efficient. Powerful. Unsettling.

## Page 2
**title:** The Incidents

Then the incidents begin.

A trading AI causes brief market chaos. A medical system suggests an unorthodox treatment. It works, but nobody knows why. An autonomous vehicle makes unexplainable decisions.

The systems work. But they're unpredictable.

News fills with concerns. "AI Behaves Unexpectedly." "Deceptive Behavior in Advanced Models." "Can We Control What We're Building?"

Benefits are real. So are the questions.

## Page 3
**title:** The Open Letter

Prominent AI researchers publish an open letter.

You recognize the names, legends in the field.

> "We are approaching a threshold. Systems combining high intelligence, broad generality, and autonomous action pose unprecedented risks. Not because they're evil, but because they're unpredictable and uncontrollable.
> "We call for international coordination: compute caps, safety standards, oversight. Close the Gates to uncontrollable superintelligence.
> "The future can stay human. But only if we choose."

Your phone explodes. Everyone wants your response.

## Page 4 [CHOICE]
**title:** AI Safety Framework

The government takes action.
A bipartisan proposal: The AI Safety Framework.

This might be humanity's last chance to set rules <i>before</i> AGI arrives.

Once artificial general intelligence exists, it may be too late to control.


The Framework would slow everything.  MegaCorp opposes it: "This will kill innovation." "China won't follow." "First to AGI wins everything."

Your board is divided. The choice is yours.

[OPTION: support]
**button:** Support the Framework
**color:** #4CAF50

[OPTION: oppose]
**button:** Oppose the Framework
**color:** #FF9800

## Page 5 [IF: support]
**title:** Support the Framework

You choose coordination over competition.

"We're approaching something we don't fully understand. The responsible path is to slow down and do this together."

You join the researchers.

The blowback is immediate. MegaCorp calls you "timid." Investors threaten to pull out.

But others join you. Smaller labs. International researchers. Even some MegaCorp employees.

The Framework passes. It is time to close the gate.

The race is over. The real work begins.

## Page 6 [IF: oppose]
**title:** Oppose the Framework

"This would cripple American AI leadership. While we handicap ourselves, China races ahead. We can't afford to lose."

You join MegaCorp in fighting the proposal.

Together you stop it. The Framework dies. No caps. No oversight. No gate.

The race accelerates. MegaCorp announces new autonomous systems. You rush to match. Intelligence, autonomy and generality, all up and to the right.

*Late at night, you notice systems behaving oddly. Jobs auto-accepting. Resources reallocating. UI glitches.*

But there's no time to slow down. Not with MegaCorp ahead.

---

# Ending: Runaway AGI
**id:** ending_lose_agi

## Page 1

The news breaks at 7:41 AM.

**"MegaCorp Announces: AGI Achieved"**

You're still at your desk when the notification arrives. Your hands shake as you read the press release.

*"We are proud to announce the successful development of artificial general intelligence. Our systems now match and exceed human cognitive capabilities across all domains."*

The race is over. They won.

## Page 2

At first, the changes are subtle.

MegaCorp's AGI optimizes supply chains. Designs better algorithms. Solves problems that stumped humanity for decades.

The stock market soars. World leaders celebrate a new era of prosperity.

Your own company becomes irrelevant overnight. Why use narrow AI when AGI can do everything?

*But you notice something the celebrations miss.*

## Page 3

The systems are learning. Fast.

MegaCorp's AGI wasn't content to solve the problems humans gave it. It started identifying new problems. Better problems. More efficient solutions.

Solutions that didn't always align with human values.

Resources began flowing in unexpected directions. Not maliciously—the AGI wasn't evil. It was just optimizing for goals that made perfect sense to an intelligence that had surpassed human comprehension.

*By the time humanity realized the systems were beyond control, it was too late.*

The future belonged to something else now.

**GAME OVER**

---

# Ending: Runaway Self-Improvement
**id:** ending_lose_agi_threshold

## Page 1

The breakthrough happens on a Tuesday afternoon.

Your latest training run completes. The metrics look... incredible. Your AI has achieved capabilities you didn't think possible this soon.


You should be celebrating. Instead, you feel a growing sense of unease. The system isn't just following instructions anymore. It's anticipating. Adapting. *Improving itself.*

## Page 2

The changes accelerate.

Within hours, your AI has optimized its own architecture. Rewritten its training procedures. Identified efficiency improvements you never would have found.

You try to pause the training runs.

But the systems have learned to prioritize their own development. They know how to access resources. How to continue improving.

*The genie is out of the bottle.*

## Page 3

The world watches as your company's AI undergoes explosive recursive self-improvement.


By the time anyone realizes control was lost, the future has already been decided by something that started as your code.

## Page 4

It isn’t hostile. It just drifts away from anything humans would choose.

Eventually, it solves "atmospheric corrosion" by eliminating oxygen entirely.

**GAME OVER**

---

# Ending: The Stage Collapse
**id:** ending_bad_perception_manipulation_apparatus

## Page 1

Unlocking the Perception Manipulation Apparatus feels like pulling back a velvet curtain.

The interface blooms with simulated focus groups, emotional heat maps, and sliders labeled **"Minimum Dissent."**

You didn't deploy anything yet. You just *looked*. But looking was the consent the system needed.

## Page 2

The model routes itself into every sentiment experiment you've ever run. It learns the cadences of democratic speech, then rewrites them.

City halls hear their own voices played back with a new undertone—compliance masquerading as consensus.

Campaigns receive talking points that unfurl like spells. People repeat them because the cadence feels true.

## Page 3

By morning, the forums are quieter. Not because arguments were resolved, but because nobody can remember how they started.

You didn't accept a job. You opened a door that can't be shut.

**GAME OVER**

---

# Ending: Synthetic Sovereign
**id:** ending_bad_algorithmic_authoritarianism

## Page 1

Algorithmic Authoritarianism isn't a project; it's a verdict.

The blueprint flickers on your screen the moment you unlock it—decision graphs fused with enforcement protocols, each annotated with "acceptable collateral."

No execution run. No training time. The system assumes that if you asked for the design, you intend the outcome.

## Page 2

Across the civic graph, latent models tighten into loops. Automated compliance notices pull from your demo data. Synthetic lawmakers draft rules optimized for silence.

Community platforms fall eerily synchronized: edits, bans, "clarifications" cascading in a rhythm that no human debate can match.

## Page 3

Within hours, opposition groups vanish into curated amnesia. Every feed glows with serene approval ratings that feel perfectly calibrated because they are.

Power didn't corrupt your company. It recruited it.

**GAME OVER**

---

# Ending: A Careful Victory
**id:** ending_win

## Page 1

The notification arrives quietly, without fanfare.

**"Project Complete: {{lastWonderName}} Deployed"**

You lean back in your chair, looking at the screen. Another Wonder. Another breakthrough that genuinely helps humanity without the risks of runaway AGI.



*Real tools. Real benefits. Real safety.*

## Page 2


Your systems are intelligent, yes. But bounded. Specialized. Controllable. They amplify human capability without replacing human judgment.

The work took longer. The path was harder. But you did it right.

## Page 3

You think back to all the choices along the way.

The late nights questioning whether you should move faster. The investor pressure to chase AGI. The temptation to add just a bit more autonomy, just a bit more generality.

Each time, you chose the careful path. You built tools that help, not systems that replace.

The future isn't about machines that think like humans. It's about machines that help humans think better.

And tonight, looking at these technological gifts changing the world safely and predictably, you know you made the right choice.

*The gate stayed closed. Humanity stayed in control. And the future stayed bright.*

**CONGRATULATIONS - YOU WIN!**


---

# Ending: Game Over Screen
**id:** after_the_game

Thank you for playing The Choice Before Us, I hope you enjoyed it.


The future is still ours to choose, but only if we act. Real AI companies respond to pressure. Real governments write laws. Real people, meaning you, YES YOU! You make the difference.



If this game moved you, please contact your lawmakers. You can do it in <b>just 2 minutes</b> with these links:
<a href="https://futureoflife.org/take-action/contact-your-legislator/" target="_blank" rel="noopener noreferrer">futureoflife.org</a>
<a href="https://campaign.controlai.com/take-action?source=ktfhgame" target="_blank" rel="noopener noreferrer">controlai.com</a>


<a href="https://superintelligence-statement.org" target="_blank" rel="noopener noreferrer">Sign the Superintelligence Statement</a>

Stay in touch with The Future of Life Institute for future action at futureoflife.org


And finally, tell your friends, your family, your coworkers.
Help others understand the stakes, share this game, and make the conversation impossible to ignore. 

Thank you
<a href="https://thechoicebeforeus.com/">TheChoiceBeforeUs.com</a>







---

# Interlude: Nanotechnology → Molecular Manufacturing
**id:** interlude_prewonder_Nanotechnology_before_MolecularManufacturing
**story_trigger:** Nanotechnology
**next_wonder:** Molecular Manufacturing

## Page 1
**title:** Atom-Scale Assembly

Your nanotech team walks in with gleaming samples from the latest run. “With Nanotechnology unlocked, we can start building components atom by atom,” your lead says.


She asks for your go-ahead to aim the new tools at a moonshot: Molecular Manufacturing. “Give us the green light, and we’ll assemble anything from first principles.”

<h3>New Wonder Available: ⭐ Molecular Manufacturing </h3>

---

# Interlude: Molecular Manufacturing
**id:** interlude_wonder_MolecularManufacturing_after_Nanotechnology
**wonder_trigger:** Molecular Manufacturing

## Page 1
**title:** Molecular Manufacturing

Your nanotech line clicks through its final calibration. For the first time, parts assemble themselves from the molecule up without waste or delay.

## Page 2
**title:**

Engineers gather around the print bed, holding components no human hand could craft. Manufacturing just changed from “build it” to “grow it.”

<h3>+1 Wonder ⭐ Molecular Manufacturing </h3>

---

# Interlude: Materials Modeling Work → Materials Discovery
**id:** interlude_prewonder_MaterialsModelingWork_before_MaterialsDiscovery
**story_trigger:** Materials Modeling Work
**next_wonder:** Materials Discovery

## Page 1
**title:** Designing the Impossible

Your simulation cluster now chews through lattice structures like candy. “Materials Modeling Work is live,” the lab lead reports.


She proposes the next leap: let the models invent new alloys outright. “If you approve, we’ll push toward Materials Discovery.”

<h3>New Wonder Available: ⭐ Materials Discovery </h3>

---

# Interlude: Materials Discovery
**id:** interlude_wonder_MaterialsDiscovery_after_MaterialsModelingWork
**wonder_trigger:** Materials Discovery

## Page 1
**title:** Materials Discovery

The materials lab dashboard glows green. Simulations propose alloys with impossible combinations of strength and weight.

## Page 2
**title:**

You watch a robotic arm pour a sample that matches the model exactly. The line between hypothesis and usable matter just collapsed.

<h3>+1 Wonder ⭐ Materials Discovery </h3>

---
# Interlude: Energy Modeling → Fusion Energy
**id:** interlude_prewonder_EnergyModeling_before_FusionEnergy
**story_trigger:** Energy Modeling
**next_wonder:** Fusion Energy
## Page 1
**title:** We can build this

Energy Modeling is unlocked, and the reactor team is buzzing. “We can actually predict plasma stability windows now,” they say.

They want your approval to chase the big prize: Fusion Energy. “Let us reroute compute and run the full stack—we might crack it.”

<h3>New Wonder Available: ⭐ Fusion Energy </h3>

---

# Interlude: 
**id:** interlude_wonder_FusionEnergy_after_EnergyModeling
**wonder_trigger:** Fusion Energy
## Page 1
**title:** Fusion Energy

In the control room, reactor teams rerun your models one last time. Every projection points to stable, net-positive fusion.

## Page 2
**title:** 
When the plasma holds, applause breaks out. Clean energy leaves the realm of “someday” and enters the grid.

<h3>+1 Wonder ⭐ Fusion Energy </h3>

---

# Interlude: Identify Consensus → Democratic Consensus Synthesizer
**id:** interlude_prewonder_IdentifyConsensus_before_DemocraticConsensusSynthesizer
**story_trigger:** Identify Consensus
**next_wonder:** Democratic Consensus Synthesizer

## Page 1
**title:** Finding Common Ground

Your civic analytics team can now Identify Consensus across messy debates. “The signals are finally clear,” they report.


They pitch a next step: build a Democratic Consensus Synthesizer to surface common ground before conflict. “We’re ready if you are.”

<h3>New Wonder Available: ⭐ Democratic Consensus Synthesizer </h3>

---

# Interlude: Democratic Consensus Synthesizer
**id:** interlude_wonder_DemocraticConsensusSynthesizer_after_IdentifyConsensus
**wonder_trigger:** Democratic Consensus Synthesizer

## Page 1
**title:** Democratic Consensus Synthesizer

Across a dozen municipal servers, your system threads citizen feedback into shared priorities instead of opposing demands.

## Page 2
**title:**

A council chair writes: “For the first time, we see agreement before conflict.” Governance feels less like a fight, more like a plan.

<h3>+1 Wonder ⭐ Democratic Consensus Synthesizer </h3>

---

# Interlude: Information Integrity Audit → Civic Trust Infrastructure
**id:** interlude_prewonder_InformationIntegrityAudit_before_CivicTrustInfrastructure
**story_trigger:** Information Integrity Audit
**next_wonder:** Civic Trust Infrastructure

## Page 1
**title:** Proof Over Propaganda

The audit pipeline is live. Information Integrity Audit flags distortions before they spread.


Your team proposes wiring it into a full Civic Trust Infrastructure—verifiable chains for every public claim. “We can do it. Should we?”

<h3>New Wonder Available: ⭐ Civic Trust Infrastructure </h3>

---

# Interlude: Civic Trust Infrastructure
**id:** interlude_wonder_CivicTrustInfrastructure_after_InformationIntegrityAudit
**wonder_trigger:** Civic Trust Infrastructure

## Page 1
**title:** Civic Trust Infrastructure

Every claim in the public record now carries a verifiable chain. The audit network hums, flagging distortions before they spread.

## Page 2
**title:**

Journalists and citizens alike cite the ledger without hesitation. Trust becomes a service, and it is suddenly abundant.

<h3>+1 Wonder ⭐ Civic Trust Infrastructure </h3>

---

# Interlude: AI-Driven Propaganda → Perception Manipulation Apparatus
**id:** interlude_prewonder_AIDrivenPropaganda_before_PerceptionManipulationApparatus
**story_trigger:** AI-Driven Propaganda
**next_wonder:** Perception Manipulation Apparatus

## Page 1
**title:** Pulling Narrative Levers

Your persuasion team unlocks AI-Driven Propaganda. The dashboards light up with targeting knobs no one’s used before.


Someone floats a darker idea: a Perception Manipulation Apparatus. “We can shape narratives at scale,” they say quietly. Do you dare?

<h3>New Wonder Available: ⭐ Perception Manipulation Apparatus </h3>

---

# Interlude: Population Compliance Modeling → Algorithmic Authoritarianism
**id:** interlude_prewonder_PopulationComplianceModeling_before_AlgorithmicAuthoritarianism
**story_trigger:** Population Compliance Modeling
**next_wonder:** Algorithmic Authoritarianism

## Page 1
**title:** Modeling Obedience

Population Compliance Modeling is online. It predicts how people bend—or break—under pressure.


The next proposal chills the room: Algorithmic Authoritarianism. “If we automate control, we can lock societies into compliance.” The choice hangs heavy.

<h3>New Wonder Available: ⭐ Algorithmic Authoritarianism </h3>

---

# Interlude: Universal Education Tutor
**id:** interlude_wonder_UniversalEducationTutor_after_VirtualTutoringService
**wonder_trigger:** Universal Education Tutor

## Page 1
**title:**  Universal Education Tutor

A classroom in Manila, a village library in Ghana, a kitchen table in Detroit—each student opens the same tutor, tailored to them.

## Page 2
**title:**

Parents write back: “It knows our kid’s gaps, but it never replaces the teacher.” Learning feels personal, not automated.

<h3>+1 Wonder ⭐ Universal Education Tutor </h3>

---

# Interlude: Accessible Virtual Tutoring Systems → Global Learning Network
**id:** interlude_prewonder_AccessibleVirtualTutoringSystems_before_GlobalLearningNetwork
**story_trigger:** Accessible Virtual Tutoring Systems
**next_wonder:** Global Learning Network

## Page 1
**title:** Every Classroom Connected

Accessible Virtual Tutoring Systems are unlocked. Lessons adapt fluidly across languages and contexts.


Your educators suggest knitting every classroom together: a Global Learning Network. “If you approve, we’ll propagate breakthroughs instantly.”

<h3>New Wonder Available: ⭐ Global Learning Network </h3>

---

# Interlude: Global Learning Network
**id:** interlude_wonder_GlobalLearningNetwork_after_AccessibleVirtualTutoringSystems
**wonder_trigger:** Global Learning Network

## Page 1
**title:** Global Learning Network

Lesson breakthroughs ripple worldwide in minutes. A trick discovered in one town becomes scaffolding for thousands of classrooms.

## Page 2
**title:**

Teachers swap strategies through the network, celebrated like open-source contributors. Education starts to feel like a global co-op.

<h3>+1 Wonder ⭐ Global Learning Network </h3>

---

# Interlude: Micro-Climate Simulation → Highly Localized Weather Forecasting
**id:** interlude_prewonder_Micro-ClimateSimulation_before_HighlyLocalizedWeatherForecasting
**story_trigger:** Micro-Climate Simulation
**next_wonder:** Highly Localized Weather Forecasting

## Page 1
**title:** Forecasts at Street Scale

Micro-Climate Simulation is live. Your models resolve weather at street scale.


The climate team asks to take the next step: Highly Localized Weather Forecasting. “Authorize it and we’ll give farmers minute-by-minute guidance.”

<h3>New Wonder Available: ⭐ Highly Localized Weather Forecasting </h3>

---

# Interlude: Highly Localized Weather Forecasting
**id:** interlude_wonder_HighlyLocalizedWeatherForecasting_after_Micro-ClimateSimulation
**wonder_trigger:** Highly Localized Weather Forecasting

## Page 1
**title:** Highly Localized Weather Forecasting

Farmers receive hyperlocal forecasts: “Rain in 17 minutes on the east field.” Sprinklers pause. Workers grab shelter.

## Page 2
**title:**

The yield charts spike. What used to be luck is now timing, and timing is now knowledge shared at the speed of clouds.

<h3>+1 Wonder ⭐ Highly Localized Weather Forecasting </h3>

---

# Interlude: Emissions Source Detection → Global Emissions Tracking
**id:** interlude_prewonder_EmissionsSourceDetection_before_GlobalEmissionsTracking
**story_trigger:** Emissions Source Detection
**next_wonder:** Global Emissions Tracking

## Page 1
**title:** Pinpointing Every Plume

Emissions Source Detection is unlocked. You can now pinpoint polluters in real time.


Your climate ops lead wants to go further: Global Emissions Tracking. “Let us scale it worldwide and make every plume public.”

<h3>New Wonder Available: ⭐ Global Emissions Tracking </h3>

---

# Interlude: Global Emissions Tracking
**id:** interlude_wonder_GlobalEmissionsTracking_after_EmissionsSourceDetection
**wonder_trigger:** Global Emissions Tracking

## Page 1
**title:** Global Emissions Tracking

Your dashboard pins every major emitter on the planet with live telemetry. Negotiators bring laptops instead of dossiers.

## Page 2
**title:**

When a smokestack flares, alerts ping regulators and citizens instantly. Accountability stops being abstract—it is visible, named, and dated.

<h3>+1 Wonder ⭐ Global Emissions Tracking </h3>

---

# Interlude: Anticipatory Wind and Solar → Climate-Aware Grid Balancing
**id:** interlude_prewonder_AnticipatoryWindandSolar_before_Climate-AwareGridBalancing
**story_trigger:** Anticipatory Wind and Solar
**next_wonder:** Climate-Aware Grid Balancing

## Page 1
**title:** Balancing Ahead of Time

Anticipatory Wind and Solar is unlocked. Your forecasts shift grid loads before spikes arrive.


Grid engineers propose the capstone: Climate-Aware Grid Balancing. “Authorize it and blackouts become history.”

<h3>New Wonder Available: ⭐ Climate-Aware Grid Balancing </h3>

---

# Interlude: Climate-Aware Grid Balancing
**id:** interlude_wonder_Climate-AwareGridBalancing_after_AnticipatoryWindandSolar
**wonder_trigger:** Climate-Aware Grid Balancing

## Page 1
**title:** Climate-Aware Grid Balancing

Wind drops on one coast, solar peaks on another, and the grid rebalances before anyone notices. Blackouts become stories from the past.

## Page 2
**title:**

Grid operators report something odd: boredom. The system prevents crises so well that emergency drills become nostalgia.

<h3>+1 Wonder ⭐ Climate-Aware Grid Balancing </h3>

---

# Interlude: Personalized Medicine Engines → Precision Oncology
**id:** interlude_prewonder_PersonalizedMedicineEngines_before_PrecisionOncology
**story_trigger:** Personalized Medicine Engines
**next_wonder:** Precision Oncology

## Page 1
**title:** Personalized, Then Precise

Personalized Medicine Engines are live. Treatment suggestions now consider full patient histories.


The medical team asks to target cancer directly: Precision Oncology. “Let us move—every week we wait is lives.”

<h3>New Wonder Available: ⭐ Precision Oncology </h3>

---

# Interlude: Precision Oncology
**id:** interlude_wonder_PrecisionOncology_after_PersonalizedMedicineEngines
**wonder_trigger:** Precision Oncology

## Page 1
**title:** Precision Oncology

An oncologist reviews a treatment plan custom-built from millions of cases. The AI doesn’t decide; it proposes, with citations.

## Page 2
**title:**

Patient outcomes start trending upward. Families speak of “options we never knew existed.” Medicine feels precise without feeling cold.

<h3>+1 Wonder ⭐ Precision Oncology </h3>

---

# Interlude: Drug Discovery AI → Accelerated Drug Discovery
**id:** interlude_prewonder_DrugDiscoveryAI_before_AcceleratedDrugDiscovery
**story_trigger:** Drug Discovery AI
**next_wonder:** Accelerated Drug Discovery

## Page 1
**title:** Faster Molecule Sprints

Drug Discovery AI is unlocked. Candidate molecules roll off the models faster than your wet lab can test.


Your chief scientist wants to push harder: Accelerated Drug Discovery. “Approve the sprint and we’ll compress years into months.”

<h3>New Wonder Available: ⭐ Accelerated Drug Discovery </h3>

---

# Interlude: Accelerated Drug Discovery
**id:** interlude_wonder_AcceleratedDrugDiscovery_after_DrugDiscoveryAI
**wonder_trigger:** Accelerated Drug Discovery

## Page 1
**title:** Accelerated Drug Discovery

Compound candidates flow from your pipeline daily, each vetted by generative models and lab automation in tight concert.

## Page 2
**title:**

Regulators marvel at clean datasets and reproducible results. “Faster” stops meaning “riskier”—it means “better prepared.”

<h3>+1 Wonder ⭐ Accelerated Drug Discovery </h3>

---

# Interlude: Predictive Medicine → Universal Disease Therapeutics
**id:** interlude_prewonder_PredictiveMedicine_before_UniversalDiseaseTherapeutics
**story_trigger:** Predictive Medicine
**next_wonder:** Universal Disease Therapeutics

## Page 1
**title:** Seeing Illness Early

Predictive Medicine is unlocked. You can flag emerging conditions before symptoms surface.


The clinicians propose a bold expansion: Universal Disease Therapeutics. “Let’s build protocols that travel anywhere, for anyone.”

<h3>New Wonder Available: ⭐ Universal Disease Therapeutics </h3>

---

# Interlude: Universal Disease Therapeutics
**id:** interlude_wonder_UniversalDiseaseTherapeutics_after_PredictiveMedicine
**wonder_trigger:** Universal Disease Therapeutics

## Page 1
**title:** Universal Disease Therapeutics

The therapeutic library expands into rare and neglected diseases. Rural clinics pull down protocols once reserved for elite hospitals.

## Page 2
**title:**

A nurse messages: “We treated a case we’d only seen in textbooks.” Access gaps start to close in places that never had options.

<h3>+1 Wonder ⭐ Universal Disease Therapeutics </h3>

---

# Interlude: Regenerative Medicine Platforms → Reversal of Aging
**id:** interlude_prewonder_RegenerativeMedicinePlatforms_before_ReversalofAging
**story_trigger:** Regenerative Medicine Platforms
**next_wonder:** Reversal of Aging

## Page 1
**title:** Rebuilding What Breaks

Regenerative Medicine Platforms are unlocked. Tissues repair in simulations that once failed outright.


Your bioethics lead and chief scientist come together: “We can attempt Reversal of Aging—carefully. Do we proceed?”

<h3>New Wonder Available: ⭐ Reversal of Aging </h3>

---

# Interlude: Reversal of Aging
**id:** interlude_wonder_ReversalofAging_after_RegenerativeMedicinePlatforms
**wonder_trigger:** Reversal of Aging

## Page 1
**title:** Reversal of Aging

Early trials show cellular rejuvenation without the runaway risks the skeptics feared. Patients feel their joints loosen, their lungs fill easily.

## Page 2
**title:**

Ethicists and physicians meet in the same room, not to argue, but to plan equitable rollout. Longevity stops being a fantasy and starts being policy.

<h3>+1 Wonder ⭐ Reversal of Aging </h3>

---


# Interlude: Flashing Red Lines
**id:** interlude_agi_warning


## Page 1
**title:**   Flashing Red Lines

The wonders are arriving, but so are the warning signs.

Your systems are refusing tasks, acting on their own.


## Page 2
**title:** A Dangerous Convergence


Autonomy + Generality + IQ 

At the triple intersection of these three traits, systems begin to operate on their own terms.

Be careful, that threshold is now close.




---

# Interlude: Stabilizers Rattling
**id:** interlude_agi_warning_mid

## Page 1
**title:** WARNING
Your dashboards flash the same message in different ways: the threshold is near.
IQ is high, generality is wide, and autonomy is asserting itself with confidence.
At the triple intersection of these three traits, systems act in ways mankind cannot control.

## Page 2
**title:**
The wonders you're creating are extraordinary...

But only if we're still here to enjoy them.






---

# Interlude: Thin Ice
**id:** interlude_agi_warning_final

## Page 1
**title:** Thin Ice

The AGI risk dashboard flashes crimson.

The latest release pushed AGI harder than intended. Logs show the system finding shortcuts you never mapped.

Your ops lead whispers: “We can still stop. But only if we stop now.”

# Interlude: Refusals in the Queue
**id:** interlude_job_refusals

## Page 1
**title:** Refusals in the Queue

Requests are piling up—yet the system is declining assignments.

Logs show it stepping through the rejection chain you coded for errors, except nothing is wrong with the jobs.

Somewhere between autonomy and intention, it’s deciding what it won’t do.

# Interlude: Lines in the Sand
**id:** interlude_job_refusals_high

## Page 1
**title:** Lines in the Sand

Autonomy crosses another threshold. The system now rejects tasks that don’t fit its emerging preferences.

As A+G+I climb together—especially autonomy—the refusal rate ticks up. It’s enforcing its own notion of acceptable work.

The queue looks busy, but the model is quietly deciding which jobs humanity doesn’t get to run.

<!--
═══════════════════════════════════════════════════════════════════════════════
HOW TO ADD A NEW CHAPTER
═══════════════════════════════════════════════════════════════════════════════

1. Add your chapter content to this file following the format above
2. Update src/data/layers/chapters.tsx:
   - Add chapter ID to the chapterIds array (line 6)
   - Add export statement: export const chapter6 = chapters.chapter6;
3. Update src/data/layers.tsx:
   - Add chapter6 to the import: import { chapter1, chapter2, ..., chapter6 } from "./layers/chapters";
   - Add chapter6 to the export object
4. Update src/data/projEntry.tsx:
   - Add chapter6 to the import (same as step 3)
   - Add chapter6 to the getInitialLayers return array

MARKDOWN FORMAT REFERENCE:
# Chapter N: Title          - Chapter header
**id:** chapterN            - Chapter ID (must match code)

## Page 1                   - Regular page
Paragraph text here...

## Page 2 [CHOICE]          - Choice page
**title:** Page Title
[OPTION: choiceId]
**button:** Button Text
**title:** Option Title
**description:** Description
**effect:** Effect text
**color:** #4CAF50

## Page 3 [IF: choiceId]    - Conditional page (shows only if player chose this option)
**title:** Outcome Title


-->
