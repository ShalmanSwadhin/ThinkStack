# FAANG Style Problem Sets
kind: concept
time: Not applicable — this lesson describes how to organise practice. A typical FAANG style loop gives one problem per 35 to 45 minutes, and a curated set of 100 to 150 problems is a realistic preparation target.
space: Not applicable — what matters is the coverage of topics in your problem set rather than any memory cost.

## intro
Large technology companies, often grouped under the nickname FAANG, tend to ask data structures and algorithms problems of medium to hard difficulty, judged on correctness, complexity and communication. A FAANG style problem set is a deliberately balanced list of practice problems that covers the topics those interviews draw from, with enough repetition to make solutions automatic.

## theory
What the interviews look like: a recruiter screen, one or two technical phone or video screens of 45 minutes each, then an on-site or virtual loop of four to six interviews: two to three coding rounds, one system design round for experienced candidates (a lighter design or object-oriented round for new graduates) and one behavioural round. Each coding round is usually one medium problem or a medium plus a follow-up that raises the constraints.

Topic coverage for a balanced problem set, with a rough share of questions:

- Arrays and strings, including two pointers and sliding window: 20 percent
- Hash maps and sets: 8 percent
- Linked lists: 5 percent
- Stacks, queues and monotonic structures: 7 percent
- Trees and binary search trees, including traversals and lowest common ancestor: 15 percent
- Graphs: BFS, DFS, topological sort, shortest paths, union-find: 15 percent
- Heaps and intervals: 8 percent
- Binary search, including search on the answer: 5 percent
- Recursion, backtracking: 7 percent
- Dynamic programming (one dimension, two dimensions, knapsack, sequences): 10 percent
- A few design-flavoured problems such as an LRU cache, an iterator or a data structure with constant-time operations

Difficulty mix for 120 problems: about 25 easy to warm up each pattern, 75 medium (the core of real interviews) and 20 hard to stretch. Hard problems are usually medium problems with an extra constraint or twist, so mastering mediums matters most.

Classic examples that recur in many forms: two sum and three sum; longest substring without repeating characters; merge intervals and meeting rooms; validate a binary search tree; lowest common ancestor; number of islands; course schedule; clone graph; word ladder; kth largest element; top k frequent elements; LRU cache; trapping rain water; coin change; longest increasing subsequence; edit distance; serialise and deserialise a binary tree; median of two sorted arrays; and merge k sorted lists.

How to work through a set:

- Order by pattern, not at random: finish a pattern block (for example sliding window) with five to eight problems before moving on
- First attempt with a timer of 30 to 40 minutes; if stuck for 15 minutes, read a hint, then the solution, then close it and re-implement from memory
- Record for each problem: the pattern, the key insight, the complexity and what went wrong
- Revisit problems on a spaced schedule: after 1 day, 1 week and 1 month
- Re-solve the problems you failed first, since failures reveal the gaps
- Mix patterns in later weeks so you have to identify the pattern yourself

Quality over volume: ten problems solved with full understanding, tests and write-ups teach more than fifty skimmed solutions. After solving, ask what variation the interviewer could add (sorted input, streaming data, duplicates, a larger constraint) and solve that variation too.

Follow-up questions: FAANG interviewers commonly extend problems: "What if the array does not fit in memory?", "How would this run across machines?", "Can you do it in O(1) space?" Practise answering at least one follow-up for each problem.

Language choice: pick one language you know very well (Python, Java or C++ are common), learn its standard library for heaps, sorted containers, hash maps and string handling, and write clean, idiomatic code.

Beyond the list: read the company's engineering blog, know the product, and practise explaining how algorithms appear in its systems.

Pitfalls: counting problems solved instead of understood, looking at solutions too early, only practising easy problems, ignoring dynamic programming and graphs until late, never practising out loud and neglecting the follow-up questions.

## explain
1. Choose one language and learn its standard library.
2. Build a list of about 120 problems balanced across topics.
3. Work through it pattern by pattern with a timer.
4. Log the insight and mistakes for every problem.
5. Review on a spaced schedule and redo failures.
6. Practise follow-up questions and mixed-pattern sets.

## example
The Python program builds a 120-problem plan from the topic shares, prints how many problems each topic gets, assigns easy, medium and hard counts using the 25, 75 and 20 split, and checks that the totals add up to 120.

## real
Preparation platforms and study groups publish curated lists of roughly 75 to 150 problems because those lists give broad coverage with manageable effort.

## pros
- Gives broad coverage with a bounded workload
- Pattern blocks build speed through repetition
- A log makes progress measurable

## cons
- Companies do not publish their questions
- Lists can encourage memorising instead of understanding
- Hard problems can drain time with little payoff

## uses
- Planning practice for large company interviews
- Balancing topics and difficulty
- Tracking which patterns are weak
- Preparing for follow-up variations

## mistakes
- Chasing the number of solved problems
- Reading solutions before a real attempt
- Skipping dynamic programming and graphs until the end
- Never revisiting solved problems

## interview
**Q:** How many problems should you solve to prepare?
**A:** Around 100 to 150 well-chosen problems, mostly medium difficulty, solved with understanding and revisited later, are usually enough; the quality of review matters more than the count.

**Q:** What should you do after getting stuck for a long time on a problem?
**A:** After a time-boxed attempt, read a hint, then the solution, close it and re-implement from memory, log the insight and schedule a revisit.

**Q:** Why practise follow-up questions?
**A:** Interviewers often raise the constraints or change the setting, such as limited memory or streaming data, to test whether you understand the idea and not only the code.

## summary
A FAANG style problem set is a balanced list of about 120 problems across arrays, hashing, trees, graphs, heaps, search, recursion and dynamic programming, mostly medium difficulty. Work by pattern, log insights, revisit on a schedule and practise follow-up questions.

## codenote
The Python sample builds the topic and difficulty plan.

## code
### python
```python
SHARES = {
    "arrays and strings": 20, "hash maps": 8, "linked lists": 5, "stacks and queues": 7,
    "trees": 15, "graphs": 15, "heaps and intervals": 8, "binary search": 5,
    "backtracking": 7, "dynamic programming": 10,
}
TOTAL = 120
DIFFICULTY = {"easy": 25, "medium": 75, "hard": 20}

plan = {topic: round(TOTAL * share / 100) for topic, share in SHARES.items()}
for topic, count in plan.items():
    print(topic, count)
print("sum of shares:", sum(SHARES.values()), "problems:", sum(plan.values()))
print("difficulty total:", sum(DIFFICULTY.values()), DIFFICULTY)
```
Output:
```text
arrays and strings 24
hash maps 10
linked lists 6
stacks and queues 8
trees 18
graphs 18
heaps and intervals 10
binary search 6
backtracking 8
dynamic programming 12
sum of shares: 100 problems: 120
difficulty total: 120 {'easy': 25, 'medium': 75, 'hard': 20}
```

## quiz
1. Which difficulty dominates real coding interviews?
   - [ ] Trivial
   - [x] Medium
   - [ ] Research level
   - [ ] Only hard
   > Hard problems are often mediums with an extra twist.
2. How should problems be ordered when practising?
   - [ ] Randomly only
   - [x] By pattern first, then mixed later
   - [ ] Hardest first
   - [ ] Alphabetically
   > Pattern blocks build speed through repetition.
3. What should you log after each problem?
   - [ ] Nothing
   - [x] The pattern, key insight, complexity and mistakes
   - [ ] The time of day
   - [ ] The editor theme
   > The log guides later review.
4. Why practise follow-up questions?
   - [ ] They replace the original problem
   - [x] Interviewers raise constraints to test understanding
   - [ ] They are never asked
   - [ ] They are easier
   > Examples include limited memory or streaming input.

# Startup Interview Expectations
kind: concept
time: Not applicable — this lesson compares interview styles. Startup processes are often shorter, around two to four steps over one to three weeks, compared with several rounds over a month or more at large companies.
space: Not applicable — what you carry into a startup interview is a portfolio of shipped work rather than a data structure.

## intro
Startup interviews differ from big company loops. The company is small, hiring is urgent and one engineer often owns a whole feature, so interviewers look for evidence that you can ship working software quickly, learn on the job and handle ambiguity. Understanding startup interview expectations helps you spend preparation time on the right things.

## theory
Typical process: an intro call with a founder or recruiter, a technical conversation or take-home project, a practical coding session (often building a small feature or debugging a real codebase), a team or culture conversation and sometimes a paid trial day. Fewer algorithm puzzles, more practical tasks.

What startups value:

- Ownership and initiative: do you take a vague task and drive it to done?
- Breadth: front end, back end, databases, deployment, debugging; being comfortable with the whole stack matters more than depth in one corner
- Speed with quality: shipping working software, with sensible tests, rather than perfect designs
- Adaptability: priorities change weekly; you must handle ambiguity and switch tasks
- Communication: working closely with founders, designers and customers
- Learning ability: picking up a new framework or tool quickly
- Product sense: understanding why a feature matters to users and the business
- Fit with the mission and pace: motivation for a small team, comfort with risk

Formats you might see:

- Take-home project: a small app or API to build in 2 to 4 hours (respect the stated time limit); graded on working features, readable code, a clear README and sensible trade-offs. Add tests and note what you would do with more time
- Live pairing: build or extend a feature with an engineer; communication and collaboration matter more than perfection
- Code review or debugging: read unfamiliar code, find a bug, explain a fix
- System discussion: how you would design the first version of their product with a small team and limited budget
- Algorithmic questions: still possible, usually easier and more applied than at large companies
- Founder conversation: why this startup, what you have built and what you want to learn

Preparation:

- Build and deploy small projects that you can demo: a working app with a public URL and a clean repository speaks louder than a certificate
- Be fluent in one full stack (for example React with Node and PostgreSQL, or Python with Django and a front end) and know the basics of deployment, version control, testing and a cloud provider
- Read about the company: product, customers, funding stage, competitors and recent news; try the product and prepare observations and questions
- Prepare stories about shipping under constraints, learning something quickly and handling a changing requirement
- Be ready to discuss trade-offs: build versus buy, monolith versus services, technical debt and when to take it on

Evaluating the startup yourself: ask about runway and funding, revenue or traction, team size and experience, engineering practices (testing, code review, on-call), how decisions are made, equity details (vesting schedule, strike price, dilution, liquidation preferences) and the growth path. Understand that equity can end up worth little, so compare base salary and learning opportunities too.

Differences from large companies: broader responsibility and faster impact, less structure and mentoring, more risk, often lower base pay but equity, and fewer formal interview rubrics, which means individual interviewers carry more weight.

Pitfalls: overbuilding a take-home project, ignoring the stated time limit, not asking about runway or equity terms, showing no interest in the product, treating the interview as an algorithm exam only and expecting the same process as a big company.

## explain
1. Research the product, team and funding stage.
2. Prepare a demo project and a clean repository.
3. Practise building small features end to end.
4. Prepare stories about ownership and fast learning.
5. Ask about runway, traction and engineering practices.
6. Compare compensation, equity terms and learning opportunities.

## example
The Python program scores two sample job offers (a startup and a large company) on weighted criteria such as learning, pay, stability and ownership, and prints the weighted totals, showing how stated priorities change which offer looks better.

## real
Early stage companies often hire after a short project, because shipped work predicts performance for a small team better than puzzle solving.

## pros
- Faster process with more practical tasks
- Chance to show breadth and ownership
- Direct contact with decision makers

## cons
- Less structured, so quality varies by interviewer
- Equity value is uncertain
- Take-homes can consume unpaid time

## uses
- Preparing for small company interviews
- Choosing what to build for a portfolio
- Evaluating the stability of a startup
- Comparing startups with larger employers

## mistakes
- Spending far longer than the limit on a take-home project
- Asking nothing about runway or equity terms
- Showing no knowledge of the company's product
- Preparing only algorithm puzzles

## interview
**Q:** What do startups look for that large companies emphasise less?
**A:** Ownership, breadth across the stack, speed of shipping, product sense and the ability to work with ambiguity in a small team.

**Q:** How should you approach a take-home project?
**A:** Respect the time limit, deliver the working core features with readable code, tests and a clear README, and list what you would improve with more time.

**Q:** What should you ask to judge a startup's stability?
**A:** Ask about runway, funding, revenue or traction, team experience, engineering practices and the exact terms of any equity, including vesting and dilution.

## summary
Startup interviews favour shipped work, breadth, ownership and adaptability over puzzle solving, with practical tasks such as take-home projects and pairing. Prepare a demo, research the company and evaluate its runway and equity terms before accepting.

## codenote
The Python sample compares two offers with weighted criteria.

## code
### python
```python
CRITERIA = ["learning", "pay", "stability", "ownership", "mentoring"]

offers = {
    "seed-stage startup": [5, 3, 2, 5, 2],
    "large company": [3, 4, 5, 2, 4],
}

def weighted(scores, weights):
    return sum(s * w for s, w in zip(scores, weights)) / sum(weights)

profiles = {
    "values growth": [3, 1, 1, 3, 2],
    "values security": [1, 3, 3, 1, 2],
}
for profile, weights in profiles.items():
    totals = {name: round(weighted(scores, weights), 2) for name, scores in offers.items()}
    best = max(totals, key=totals.get)
    print(profile, totals, "->", best)
```
Output:
```text
values growth {'seed-stage startup': 3.9, 'large company': 3.2} -> seed-stage startup
values security {'seed-stage startup': 2.9, 'large company': 4.0} -> large company
```

## quiz
1. Which format is common in startup interviews?
   - [ ] Six whiteboard rounds only
   - [x] A take-home project or live pairing on a real feature
   - [ ] A written exam
   - [ ] No interview at all
   > Practical tasks predict performance in small teams.
2. What do startups value highly?
   - [ ] Narrow specialisation only
   - [x] Ownership, breadth and fast shipping
   - [ ] Memorised answers
   - [ ] Long resumes
   > A small team needs people who drive work to done.
3. What should you ask about equity?
   - [ ] Nothing
   - [x] Vesting schedule, strike price and dilution
   - [ ] The founder's favourite colour
   - [ ] The office address
   > These terms decide what the equity could be worth.
4. How long should you spend on a take-home?
   - [ ] As long as it takes to be perfect
   - [x] About the stated time limit
   - [ ] One minute
   - [ ] A full week
   > Respect the limit and note what you would improve.

# Offer Negotiation for New Grads
kind: concept
time: Not applicable — negotiation is a conversation, not an algorithm. Offers usually expire in one to two weeks, and a single polite negotiation exchange often takes two to five days.
space: Not applicable — the useful record is a one-page comparison of offers kept in a spreadsheet or notes.

## intro
Receiving an offer feels like the finish line, but it is the start of a short window in which you can still improve the terms. Offer negotiation for new grads is rarely hostile: companies expect it, budgets usually have room, and a polite well-prepared request costs little. The skill is knowing your options, understanding the components of compensation and asking clearly.

## theory
Components of a software offer:

- Base salary: fixed yearly pay
- Signing bonus: one-time payment, often used to bridge gaps; sometimes repayable if you leave early
- Equity: restricted stock units (RSUs) at public companies, vesting over about four years, often with a one-year cliff; stock options at startups (strike price, vesting, expiry, tax treatment)
- Annual bonus: target percentage of base, performance dependent
- Benefits: health insurance, retirement matching, paid leave, learning budget, relocation, remote or hybrid policy
- Level or title: affects future pay band and promotion path
- Start date, team and location: matter for learning and life

Compare total compensation per year by adding base, annual bonus, the yearly vesting value of equity and amortised signing bonus. Equity valued at today's price can change; treat it as uncertain. Also compare non-monetary factors: team, mentoring, technology, growth, commute and stability.

Preparation:

- Research ranges: public salary data, college career center reports, peers' offers (ask friends for ranges, not secrets) and levels listings
- Know your alternatives: other offers are the strongest leverage; even interviews in progress help
- Decide priorities: salary, equity, signing bonus, location, start date or team
- Set a target range and a walk-away point before the call
- Learn the deadline and ask for more time politely if you need to finish other interviews

The conversation:

- Express enthusiasm first: thank them, say you are excited
- Ask a question rather than demand: "Is there flexibility in the compensation package?"
- Anchor with data: "Based on my other offers and market ranges, I was hoping for a base closer to X"
- Negotiate the package, not only base: signing bonus and equity are often more flexible than base for new grads
- Be specific and give one clear request; avoid giving ultimatums
- Stay silent after you ask; let them respond
- Get the final offer in writing before declining others

Email template ingredients: appreciation, excitement, the request with a reason, willingness to decide quickly if the request is met.

Competing offers: a better offer elsewhere is a fact you can share honestly; never invent offers. You can ask whether they can match or improve, but accept that they might not. Decline other offers professionally and promptly after accepting.

Exploding offers (very short deadlines): ask for an extension citing the importance of the decision; most recruiters can extend by days.

What not to do: lie about numbers, accept verbally before comparing, burn bridges, negotiate only by text if a call is possible, or accept a offer you do not want just to avoid awkwardness. Reneging on an accepted offer damages reputation.

Fairness note: studies show candidates who do not negotiate often leave money on the table; early salary differences compound over years because later raises and offers are based on current pay.

After accepting: confirm start date, paperwork, background checks, visa support and relocation details in writing, and keep communication friendly with your recruiter and future manager.

Pitfalls: focusing on base while ignoring equity terms, forgetting taxes and cost of living, not asking for the offer in writing, negotiating without alternatives or research, and letting nerves lead to an instant acceptance.

## explain
1. Gather the offer details in writing.
2. Compute total yearly compensation for each offer.
3. Research ranges and list your priorities and alternatives.
4. Reply with thanks and a specific, reasoned request.
5. Wait for the response and discuss trade-offs politely.
6. Confirm the final terms in writing before deciding.

## example
The Python program compares two offers: it computes the first-year and four-year total compensation including base, bonus, equity vesting with a one-year cliff and signing bonus, and shows how a request for a higher signing bonus changes the first-year total.

## real
University career centres and recruiters advise new graduates to negotiate politely, since most offers have some flexibility within a band.

## pros
- Can raise pay that compounds over a career
- Clarifies the full package before commitment
- Costs little when done politely

## cons
- Feels uncomfortable for many people
- Outcomes depend on leverage and company policy
- Some employers have fixed bands for new grads

## uses
- Comparing multiple offers
- Requesting a higher signing bonus or equity grant
- Asking for more time to decide
- Clarifying benefits and start date

## mistakes
- Accepting on the spot without comparing
- Looking only at base salary
- Claiming an offer you do not have
- Not getting the final terms in writing

## interview
**Q:** What parts of an offer can you negotiate besides base salary?
**A:** The signing bonus, equity grant, start date, relocation support, level, and sometimes team or location; for new graduates the signing bonus and equity are often more flexible than the base.

**Q:** How should you begin a negotiation conversation?
**A:** Thank them, express enthusiasm, then ask politely whether there is flexibility and make one specific request supported by data or another offer.

**Q:** How do you compare an offer with RSUs and one with a higher base?
**A:** Add base, bonus, the yearly vesting value of equity and amortised signing bonus into total yearly compensation, remembering that stock value can change and that vesting often has a one-year cliff.

## summary
Offer negotiation for new graduates means understanding total compensation, researching ranges, knowing your alternatives and making a polite specific request. Compare offers on total pay and growth, get the final terms in writing and never invent numbers.

## codenote
The Python sample computes total compensation for two offers.

## code
### python
```python
def total_compensation(base, bonus_pct, signing, equity_total, years=4, cliff_year=1):
    rows = []
    for year in range(1, years + 1):
        vested = equity_total / years if year >= cliff_year else 0
        sign = signing if year == 1 else 0
        rows.append(base + base * bonus_pct / 100 + vested + sign)
    return rows

a = total_compensation(120_000, 10, 10_000, 80_000)
b = total_compensation(135_000, 5, 0, 40_000)
print(a, sum(a))
print(b, sum(b))

improved = total_compensation(120_000, 10, 25_000, 80_000)
print(improved[0] - a[0], sum(improved))
print("first year winner:", "A" if a[0] > b[0] else "B", "four year winner:", "A" if sum(a) > sum(b) else "B")
```
Output:
```text
[162000.0, 152000.0, 152000.0, 152000.0] 618000.0
[151750.0, 151750.0, 151750.0, 151750.0] 607000.0
15000.0 633000.0
first year winner: A four year winner: A
```

## quiz
1. What should you compare across offers?
   - [ ] Only the base salary
   - [x] Total compensation and non-monetary factors
   - [ ] The length of the email
   - [ ] The company logo
   > Equity, bonus and growth matter too.
2. How should a negotiation begin?
   - [ ] With an ultimatum
   - [x] With thanks, enthusiasm and a polite specific request
   - [ ] With silence
   - [ ] With a complaint
   > A cooperative tone keeps the relationship good.
3. What is the strongest leverage in a negotiation?
   - [ ] A longer resume
   - [x] A genuine competing offer
   - [ ] A louder voice
   - [ ] Waiting past the deadline
   > Honest alternatives show your market value.
4. What should you do before declining other offers?
   - [ ] Nothing
   - [x] Get the final terms in writing
   - [ ] Accept verbally only
   - [ ] Delete the emails
   > Written terms prevent misunderstandings.

# Building a Study Schedule
kind: concept
time: Not applicable — a schedule is a plan. A realistic preparation plan runs 8 to 12 weeks at 8 to 15 hours per week, which is roughly 100 to 150 hours for a new graduate preparing for software roles.
space: Not applicable — the only record you keep is a calendar and a progress log.

## intro
Without a plan, interview preparation turns into random problem solving and burnout. A study schedule fixes the weekly hours, orders the topics so that each builds on the last, mixes learning with practice and builds in review and rest. Building a study schedule is itself an engineering task: estimate, break the work down, track progress and adjust.

## theory
Start from the deadline. Count the weeks until your first interview and the hours you can commit per week given classes, work and life. Be honest: 10 consistent hours beat 30 hours planned and abandoned. Subtract one buffer week for slippage.

Typical 10-week plan for a new graduate (about 10 hours per week):

- Week 1 – Foundations and complexity: Big-O, arrays, strings, hashing basics; choose your interview language and learn its standard library
- Week 2 – Two pointers, sliding window, prefix sums, sorting and binary search
- Week 3 – Linked lists, stacks, queues, monotonic stack
- Week 4 – Trees and binary search trees: traversals, recursion, lowest common ancestor
- Week 5 – Graphs: BFS, DFS, topological sort, union-find, shortest paths
- Week 6 – Heaps, intervals, greedy techniques
- Week 7 – Recursion and backtracking; start dynamic programming
- Week 8 – Dynamic programming patterns; tries and other less common structures
- Week 9 – Mixed timed sets, mock interviews, system design basics and behavioural stories
- Week 10 – Company-specific review, weak-spot repair, light practice and rest

Weekly structure (10 hours):

- 3 sessions of 1.5 hours on new problems of the week's topic (4.5 hours)
- 1 session of 1.5 hours revisiting old problems on a spaced schedule
- 1 session of 2 hours on a timed mock or mixed set
- 1 session of 1 hour for reading theory, notes and reflection
- 1 session of 1 hour for behavioural, design or project work

Spaced repetition: re-solve each problem after about 1 day, 1 week and 1 month; failed problems return sooner. A simple scheduler lists the due problems every day.

Daily habits: study at the same time, start with a warm-up problem you have solved before, work on one new problem with a timer, write notes, and stop at a planned time. Short, frequent sessions help memory more than rare marathons.

Tracking: keep a log or spreadsheet with date, problem, pattern, time taken, hints used, result and lesson. Review weekly: which topics are weak, which are strong, whether you are on pace. Adjust the plan every week; if a topic took longer, take time from a strong topic.

Resources: choose a small set (one problem list, one book or course for data structures, one mock platform) and finish them rather than collecting new ones. Avoid constantly changing resources.

If you have less time: prioritise arrays, hashing, two pointers, sliding window, trees, graph traversal, binary search and basic dynamic programming; skip rare topics such as advanced geometry. If you have more time: add system design, advanced graphs and harder problems.

Health: sleep, exercise and breaks are part of the plan. Schedule one rest day per week. Tired practice is slow practice.

Accountability: study with a partner, join a group, or share weekly goals with a friend. Commitment devices (booked mock interviews with dates) keep you moving.

Pitfalls: planning more hours than are realistic, neglecting review, switching resources constantly, practising only favourite topics, skipping mocks until late and having no rest.

## explain
1. Count weeks to the first interview and realistic weekly hours.
2. Order the topics from foundations to advanced.
3. Split each week into new work, review, mock and reading.
4. Schedule spaced reviews for solved problems.
5. Log progress and review it weekly.
6. Adjust the plan and keep a rest day.

## example
The Python program generates a spaced repetition calendar for a set of solved problems (review at day 1, 7 and 30), prints which problems are due on selected days and totals the hours of a 10-week plan at 10 hours per week.

## real
University prep courses and bootcamps give learners a weekly syllabus, because a visible plan reduces decision fatigue and improves completion.

## pros
- Turns a vague goal into weekly tasks
- Review and rest are built in
- Progress is visible and adjustable

## cons
- Plans break when life interferes
- Time estimates are often optimistic
- Over-planning can replace actual practice

## uses
- Preparing for a job search with a deadline
- Balancing study with classes or work
- Scheduling reviews of solved problems
- Tracking readiness by topic

## mistakes
- Planning more hours than you can sustain
- Never reviewing solved problems
- Changing resources every week
- Skipping a weekly rest day

## interview
**Q:** How do you decide how long to prepare?
**A:** Work backwards from the first interview date, estimate weekly hours honestly, and reserve a buffer week; eight to twelve weeks at eight to fifteen hours per week suits most new graduates.

**Q:** What is spaced repetition and why use it?
**A:** Re-solving problems after growing gaps, such as one day, one week and one month, which strengthens long-term memory far better than solving once.

**Q:** What do you do if you fall behind schedule?
**A:** Review the log, cut time from strong topics, keep the high-frequency topics such as arrays, hashing, trees and graphs, and adjust the plan instead of abandoning it.

## summary
A study schedule starts from the interview date and realistic weekly hours, orders topics from foundations to advanced, mixes new problems with spaced review and mocks, and tracks progress weekly. Keep rest days and adjust the plan as you learn.

## codenote
The Python sample generates a spaced repetition calendar.

## code
### python
```python
from collections import defaultdict

solved = {"two sum": 0, "sliding window max": 1, "valid bst": 3, "course schedule": 5}
INTERVALS = (1, 7, 30)

due = defaultdict(list)
for problem, day in solved.items():
    for gap in INTERVALS:
        due[day + gap].append(problem)

for day in sorted(due):
    if day <= 14:
        print("day", day, due[day])

weeks, hours = 10, 10
print("total hours:", weeks * hours, "per week split:", 3 * 1.5 + 1.5 + 2 + 1 + 1)
```
Output:
```text
day 1 ['two sum']
day 2 ['sliding window max']
day 4 ['valid bst']
day 6 ['course schedule']
day 7 ['two sum']
day 8 ['sliding window max']
day 10 ['valid bst']
day 12 ['course schedule']
total hours: 100 per week split: 10.0
```

## quiz
1. Where should a study schedule start?
   - [ ] From the most difficult problem
   - [x] From the interview date and realistic weekly hours
   - [ ] From random problems
   - [ ] From a new resource each week
   > Working backwards makes the plan realistic.
2. Why include a weekly rest day?
   - [ ] To save electricity
   - [x] Tired practice is slow and burnout ends the plan
   - [ ] Rest has no effect
   - [ ] Interviews are on rest days
   > Sustainable effort beats short bursts.
3. When should a solved problem be reviewed?
   - [ ] Never
   - [x] After about a day, a week and a month
   - [ ] Only once after a year
   - [ ] Only if it was easy
   > Spaced intervals strengthen memory.
4. What should you do when behind schedule?
   - [ ] Quit
   - [x] Adjust the plan and keep the high-frequency topics
   - [ ] Double the hours without rest
   - [ ] Ignore the log
   > Plans should adapt to progress.

# Final Review Checklist
kind: concept
time: Not applicable — a checklist is a verification aid. A final review pass takes about one to two hours per day over the last week, and the checklist itself fits on one page.
space: Not applicable — the only artefact is a one-page sheet of formulas, templates and reminders.

## intro
In the last week before interviews, learning new topics gives little return, and confidence comes from knowing your fundamentals are solid. A final review checklist lists what to verify: complexity facts, core data structure operations, pattern templates, edge cases, language details, behavioural stories and logistics. Ticking items off turns vague worry into concrete status.

## theory
Complexity facts to recall without hesitation:

- Array: access O(1), insert or delete in the middle O(n), append amortised O(1)
- Hash map: average O(1) insert, lookup, delete; worst case O(n)
- Linked list: O(1) insert at a known node, O(n) search
- Stack and queue: O(1) push, pop, enqueue, dequeue
- Binary search tree: O(h) per operation, O(log n) when balanced, O(n) when degenerate
- Heap: O(log n) push and pop, O(1) peek, O(n) build
- Sorting: merge sort and heap sort O(n log n), quicksort average O(n log n) with worst case O(n²), counting sort O(n + k)
- Binary search: O(log n)
- BFS and DFS: O(V + E)
- Dijkstra with a heap: O((V + E) log V); Bellman-Ford O(VE); Floyd-Warshall O(V³)
- Union-find with path compression and union by rank: nearly O(1) amortised
- Trie: O(L) per word of length L
- Dynamic programming: states times transition cost

Pattern templates to write from memory: binary search (and its variant for the first true), sliding window, two pointers, BFS with a queue, DFS recursive and iterative, topological sort (Kahn), union-find, heap top-k, backtracking with choose-explore-unchoose, memoised recursion and bottom-up tabulation, linked list reversal, tree traversals, interval merging.

Edge case list to run on every solution: empty input, single element, all equal elements, duplicates, negative numbers, zero, very large values and overflow, sorted and reverse sorted input, a cycle in a graph, disconnected graphs, unbalanced trees and strings with spaces or mixed case.

Language checklist: know your language's syntax for lists, maps, sets, heaps, sorting with custom keys, string manipulation, integer division and modulo with negatives, recursion limit and how to read input. Practise writing the main function without autocomplete.

Behavioural checklist: six to eight stories prepared, each with a clear result; answers for why this company, why this role, strengths and weaknesses, a failure and a conflict; questions to ask the interviewer.

System design (if applicable): requirement gathering steps, capacity estimation formulas, building blocks (load balancer, cache, queue, database, sharding) and a few classic designs.

Logistics checklist:

- Confirm the schedule, interviewer names and time zone
- Test the video tool, microphone, camera, editor link and internet connection
- Prepare a quiet space, water, paper, a pen and a clean desktop
- Keep a printed resume and the job description handy
- Charge devices and have a backup plan for connectivity
- Prepare for on-site travel: route, ID, arrival time

Mental checklist: sleep schedule, meals, light exercise, a plan for nerves (breathing, short pause, restating the problem) and a reminder that mistakes are normal.

How to use it: a week before, mark weak items and spend time only on those. Do one or two light timed problems per day to stay warm, not exhaustive sets. Re-read notes from your problem log, especially recurring mistakes. In the last two days stop learning new material.

Pitfalls: cramming new topics at the last minute, rewriting notes endlessly instead of practising, ignoring logistics, over-practising late at night and skipping behavioural preparation.

## explain
1. Write the complexity facts and test yourself from memory.
2. Re-implement the main pattern templates without notes.
3. Run the edge case list on two earlier problems.
4. Review your language syntax and standard library.
5. Rehearse behavioural stories and your questions.
6. Complete the logistics checks and rest.

## example
The Python program holds a checklist as data, marks some items done and prints the completion percentage per category and the items still open, showing how a simple script can track the last week of review.

## real
Pilots and surgeons use checklists to avoid skipping basics under pressure, and candidates use the same idea to avoid avoidable mistakes in interviews.

## pros
- Converts vague anxiety into concrete tasks
- Focuses the final days on high-value fundamentals
- Reduces avoidable logistics failures

## cons
- Can encourage ticking boxes instead of understanding
- Too long a list adds stress
- Does not replace practice

## uses
- Structuring the last week of preparation
- Verifying fundamentals before interviews
- Checking logistics for remote or on-site rounds
- Reviewing recurring mistakes

## mistakes
- Learning brand new topics in the last days
- Making notes beautiful instead of practising
- Overlooking technical setup for remote interviews
- Skipping the behavioural items

## interview
**Q:** What should you review in the final week?
**A:** Core complexity facts, pattern templates, edge cases, language syntax, behavioural stories and logistics, focusing on weak items rather than new topics.

**Q:** Why avoid learning new topics right before an interview?
**A:** New material is shallow and increases anxiety, whereas reviewing known fundamentals builds confidence and recall.

**Q:** Which edge cases do you check on every solution?
**A:** Empty input, a single element, duplicates, negative values, extreme sizes and overflow, sorted or reversed input, and cycles or disconnection in graphs.

## summary
A final review checklist covers complexity facts, pattern templates, edge cases, language details, behavioural stories and logistics. Use it to find weak spots, practise lightly and rest instead of cramming new material.

## codenote
The Python sample tracks checklist completion by category.

## code
### python
```python
checklist = {
    "complexity": {"array and hash map": True, "trees and heaps": True, "graph algorithms": False},
    "templates": {"binary search": True, "bfs and dfs": True, "union-find": False, "backtracking": True},
    "edge cases": {"empty and single": True, "duplicates": True, "overflow": False},
    "behavioural": {"six stories": True, "questions to ask": False},
    "logistics": {"video test": True, "quiet space": True},
}

for category, items in checklist.items():
    done = sum(items.values())
    print(category, str(done) + "/" + str(len(items)), round(100 * done / len(items)))

open_items = [name for items in checklist.values() for name, ok in items.items() if not ok]
print("open:", open_items)
```
Output:
```text
complexity 2/3 67
templates 3/4 75
edge cases 2/3 67
behavioural 1/2 50
logistics 2/2 100
open: ['graph algorithms', 'union-find', 'overflow', 'questions to ask']
```

## quiz
1. What is the best use of the last week?
   - [ ] Learning many new topics
   - [x] Reviewing fundamentals and weak spots
   - [ ] Rewriting notes only
   - [ ] Staying up late solving hard problems
   > Review builds recall and confidence.
2. What is the time complexity of a heap push?
   - [ ] O(1)
   - [x] O(log n)
   - [ ] O(n)
   - [ ] O(n squared)
   > The new element sifts up the tree height.
3. Why include logistics in the checklist?
   - [ ] They are optional
   - [x] Technical or travel problems can ruin an interview unrelated to skill
   - [ ] They replace practice
   - [ ] They are only for managers
   > Test video, audio and links beforehand.
4. Which input should always be tested?
   - [ ] Only large inputs
   - [x] Empty, single element and duplicates
   - [ ] Only random inputs
   - [ ] Only sorted inputs
   > These edge cases expose most bugs.

# Day Before Interview Plan
kind: concept
time: Not applicable — this lesson is a schedule for one day. The plan uses about two to three hours of light review and leaves the rest of the day for rest, a regular dinner and a full night of sleep.
space: Not applicable — you carry only a short list of notes and your logistics checklist.

## intro
The day before an interview is not for learning; it is for arriving calm, rested and organised. A good day before interview plan balances a short review of familiar material, a final logistics check, relaxation and early sleep. Candidates who rest usually think more clearly than those who cram all night.

## theory
Principles:

- Consolidate, do not cram: sleep helps memory, and fatigue hurts problem solving more than a missing fact
- Reduce uncertainty: sort out every logistical detail so nothing is left to chance
- Keep routines normal: usual meals, usual wake time, light exercise
- Keep stress manageable: expect nerves and plan a response

Suggested timeline:

- Morning: wake at the usual time, eat a proper breakfast and take a walk or light exercise. Confirm the interview time, time zone, link or address and interviewer names
- Late morning (60 to 90 minutes): light technical review. Solve one or two problems you already know, re-read your problem log, and skim complexity facts and templates. Do not attempt new hard problems; failing on one the day before dents confidence
- Midday: lunch, a break and a short rest
- Afternoon (45 to 60 minutes): rehearse behavioural stories aloud, prepare your introduction ("tell me about yourself" in under two minutes), research the company's product and recent news, and list three to five questions to ask
- Late afternoon: logistics. Test the video tool, microphone and camera, check the editor link, charge devices, prepare a quiet space with water and paper. For on-site interviews, plan the route, travel time, ID and arrival 15 minutes early
- Evening: prepare clothes and items, eat a normal dinner, relax with something enjoyable such as a walk, music or a film, and avoid heavy study. Pack a bag if travelling
- Night: stop screens about an hour before bed, write down worries to clear your mind, and go to sleep early enough for seven to eight hours. Set two alarms

Introduction script: present, past, future in under two minutes: who you are now (degree, interests), highlights (projects, internships) and why this role. Practise it until it sounds natural but not memorised.

Managing nerves: use slow breathing (inhale four counts, exhale six), remind yourself that interviewers want you to succeed, treat the interview as a technical conversation and accept that you will not know everything. Visualise the first five minutes going well. Avoid excessive caffeine.

What to bring or have ready: resume copies, a notebook and pens, a water bottle, the job description, your questions list, charger and, for virtual interviews, a backup way to connect such as a phone hotspot.

What not to do: stay up late, try to learn new topics, change your setup (new keyboard, new editor) just before the interview, skip meals, drink heavily or spend the evening reading negative stories online.

Plan B items: if the internet fails, know the recruiter's phone number and email; if you are late, call at once; if you do not understand a question, ask; if you blank, take a breath and restate the problem.

Pitfalls: treating the day as another cram session, leaving logistics to the morning, over-caffeinating, comparing yourself with others online and sleeping too little.

## explain
1. Start the day with your normal routine and exercise.
2. Review known material lightly, no new hard problems.
3. Rehearse your introduction and stories aloud.
4. Check the technology, route and materials.
5. Relax in the evening and eat normally.
6. Sleep early with a backup alarm.

## example
The Python program lays out the day as a timeline, adds up the hours allocated to study, rehearsal, logistics, rest and sleep, and checks that study time stays at or below three hours while sleep is at least seven.

## real
Career coaches consistently advise candidates to prioritise rest and logistics the day before, because performance depends on clear thinking and a smooth start.

## pros
- Lowers stress through preparation
- Prevents avoidable logistical failures
- Protects sleep and concentration

## cons
- Hard to resist the urge to cram
- Nerves may keep you awake anyway
- Light review feels unproductive at first

## uses
- Preparing for any technical interview
- Structuring remote and on-site logistics
- Rehearsing the introduction and stories
- Managing nerves

## mistakes
- Staying up late solving new hard problems
- Leaving the technology check to the morning
- Changing tools or setup the day before
- Skipping meals or exercise

## interview
**Q:** What should you do technically the day before an interview?
**A:** Review known problems, templates and complexity facts lightly for an hour or two, and avoid attempting new hard problems that could dent your confidence.

**Q:** Why prepare logistics in advance?
**A:** Technical failures, travel delays or missing links add stress and can cost you the interview, so test video, audio, links and routes the day before.

**Q:** How do you handle nerves on the day?
**A:** Use slow breathing, keep the usual routine, remember that interviewers want a good conversation, and restate the problem when you blank.

## summary
The day before an interview is for light review, rehearsing your introduction and stories, completing logistics checks, relaxing and sleeping seven to eight hours. Do not cram new topics or change your setup.

## codenote
The Python sample totals the hours of a sample day plan.

## code
### python
```python
plan = [
    ("wake, breakfast, walk", 2.0, "rest"),
    ("light technical review", 1.5, "study"),
    ("lunch and break", 1.5, "rest"),
    ("rehearse stories and introduction", 1.0, "rehearsal"),
    ("tech and logistics check", 1.0, "logistics"),
    ("dinner and relaxation", 3.0, "rest"),
    ("sleep", 8.0, "sleep"),
]

totals = {}
for _, hours, kind in plan:
    totals[kind] = totals.get(kind, 0) + hours
print(totals)
print("study ok:", totals["study"] <= 3, "sleep ok:", totals["sleep"] >= 7, "hours planned:", sum(totals.values()))
```
Output:
```text
{'rest': 6.5, 'study': 1.5, 'rehearsal': 1.0, 'logistics': 1.0, 'sleep': 8.0}
study ok: True sleep ok: True hours planned: 18.0
```

## quiz
1. What is the main goal of the day before an interview?
   - [ ] Learn as many new topics as possible
   - [x] Arrive calm, rested and organised
   - [ ] Solve the hardest problems
   - [ ] Avoid sleep
   > Clear thinking depends on rest.
2. What kind of technical review is best?
   - [ ] New hard problems
   - [x] Light review of familiar problems and templates
   - [ ] None at all, ever
   - [ ] A full mock all night
   > Failing on a new problem can hurt confidence.
3. When should you test your video and audio?
   - [ ] During the interview
   - [x] The day before
   - [ ] After the interview
   - [ ] Never
   > Leaving it to the morning adds stress.
4. How much sleep should you aim for?
   - [ ] Three hours
   - [x] Seven to eight hours
   - [ ] Twelve hours
   - [ ] None
   > Sleep consolidates memory and sharpens focus.

# Post Interview Reflection
kind: concept
time: Not applicable — reflection is a habit. A useful reflection takes about 20 to 30 minutes within a few hours of the interview, and a follow-up thank-you note takes five minutes.
space: Not applicable — the artefact is a short written record per interview kept in a notes file.

## intro
The interview ends, but the learning does not. Post interview reflection is the practice of writing down what you were asked, how you answered and what you would change while the memory is fresh. Over several interviews these notes reveal patterns, turn rejections into data and steadily raise your performance, regardless of the outcome of any single interview.

## theory
When: write within a few hours, before details fade. Keep it factual first, then analytical.

Reflection template:

- Facts: company, role, round, interviewer role, date, format
- Questions asked: coding problems (restate them in detail), behavioural questions, design topics, questions about your resume
- Your approach: how you clarified, what pattern you chose, the complexity you stated, whether you finished and tested the code
- What went well: clear communication, a good insight, calm handling of a hint
- What went poorly: missed edge case, slow start, blanking on a pattern, unclear explanation
- Hints received: what they were and what concept they pointed to
- Gaps found: topics to study (for example "union-find", "monotonic stack")
- Interviewer reactions and culture signals: collaborative or adversarial, how they talked about the team, answers to your questions
- Gut feeling and confidence 1 to 5

After the reflection:

- Re-solve any problem you failed or did not finish, writing a clean solution and the pattern note
- Add new problems to your practice list and the missing topics to your schedule
- Update your story bank if a behavioural question exposed a gap
- Send a short thank-you email within 24 hours: appreciation, one specific detail from the conversation and continued interest. Keep it brief and sincere

Handling the outcome:

- Waiting: ask the recruiter about the timeline at the end of the interview. If you hear nothing by the stated date, send a polite follow-up after a few business days
- Offer: compare it properly (see the negotiation lesson); do not decide on the spot
- Rejection: it is common, even for strong candidates, because decisions depend on the interviewer panel, the number of openings and sometimes factors outside your control. Ask for feedback politely; many companies will not give detailed feedback, but some recruiters share a short summary. Do not argue
- Reapplication: many companies allow reapplying after six to twelve months; note the date

Learning from rejections: look for the patterns across your notes. If three interviews mention missed edge cases, add an edge case routine; if communication feedback repeats, add spoken practice. Track a simple funnel: applications, screens, on-sites, offers. The conversion rates show where to improve (resume, screen performance or on-site performance).

Emotional care: allow yourself to feel disappointed, then separate your worth from a result. Take a short break, talk to a friend or mentor, and return to practice with a specific improvement goal. Celebrate progress such as passing a round you failed before.

Ethics and confidentiality: do not share confidential interview questions in violation of agreements, and do not post employer information that you promised to keep private. It is fine to record your own approach and learning.

Pitfalls: waiting days before writing notes, only recording the outcome, blaming the interviewer without examining your own performance, skipping the thank-you note, never reviewing notes later and letting one rejection derail your plan.

## explain
1. Write down the questions and your answers within hours.
2. Mark what went well and what went poorly.
3. Re-solve unfinished problems and list gaps.
4. Send a short thank-you note.
5. Follow up politely if the deadline passes.
6. Review notes across interviews for recurring patterns.

## example
The Python program stores reflection notes for five interviews, counts the most common weakness tags across them, computes the funnel conversion from applications to offers and prints the top improvement priority.

## real
Candidates who keep interview journals find recurring weaknesses faster, and many bootcamps and career centres teach this habit.

## pros
- Turns every interview into learning
- Reveals recurring weaknesses with evidence
- Keeps motivation steady after rejections

## cons
- Takes discipline when you are tired
- Emotional reactions can bias notes
- Feedback from companies is often missing

## uses
- Improving after each interview
- Deciding what to study next
- Tracking the application funnel
- Preparing for reapplication

## mistakes
- Waiting days and forgetting the details
- Recording only pass or fail
- Blaming others without examining your performance
- Skipping the thank-you note

## interview
**Q:** What should you record after an interview?
**A:** The questions asked, your approach and result, what went well and poorly, hints received, gaps to study and any culture signals, written within a few hours.

**Q:** How should you react to a rejection?
**A:** Allow yourself to be disappointed, ask politely for feedback, examine your notes for patterns, fix specific gaps and continue applying, since many factors outside your control affect decisions.

**Q:** What is a funnel and why track it?
**A:** The conversion from applications to screens, on-sites and offers; the rates show whether to improve your resume, screen performance or on-site performance.

## summary
Post interview reflection records questions, answers, strengths, gaps and signals within hours, followed by re-solving missed problems, a thank-you note and a review of patterns across interviews. It turns outcomes, good or bad, into targeted improvement.

## codenote
The Python sample summarises reflection notes and the application funnel.

## code
### python
```python
from collections import Counter

notes = [
    {"company": "A", "weak": ["edge cases", "communication"], "result": "rejected"},
    {"company": "B", "weak": ["edge cases"], "result": "passed"},
    {"company": "C", "weak": ["graphs"], "result": "rejected"},
    {"company": "D", "weak": ["edge cases", "graphs"], "result": "passed"},
    {"company": "E", "weak": [], "result": "offer"},
]

counts = Counter(tag for note in notes for tag in note["weak"])
print(counts.most_common())
print("top priority:", counts.most_common(1)[0][0])

funnel = {"applications": 40, "screens": 10, "onsites": 4, "offers": 1}
stages = list(funnel)
for a, b in zip(stages, stages[1:]):
    print(a + " -> " + b, round(100 * funnel[b] / funnel[a]), "percent")
```
Output:
```text
[('edge cases', 3), ('graphs', 2), ('communication', 1)]
top priority: edge cases
applications -> screens 25 percent
screens -> onsites 40 percent
onsites -> offers 25 percent
```

## quiz
1. When should you write interview notes?
   - [ ] A month later
   - [x] Within a few hours while memory is fresh
   - [ ] Never
   - [ ] Only after an offer
   > Details fade quickly.
2. What should you do with a problem you failed?
   - [ ] Forget it
   - [x] Re-solve it and record the pattern and gap
   - [ ] Blame the interviewer
   - [ ] Delete the notes
   > Failures show the clearest gaps.
3. What does tracking a funnel show?
   - [ ] The weather
   - [x] Where candidates drop out between application and offer
   - [ ] The best editor
   - [ ] The interviewer's age
   > Conversion rates point to the stage to improve.
4. What belongs in a thank-you note?
   - [ ] A long essay
   - [x] Brief appreciation and a specific detail from the conversation
   - [ ] A salary demand
   - [ ] A complaint
   > Short and sincere is best.
