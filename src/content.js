// Editorial metadata stays out of the reader interface. Stable IDs allow expansion
// without breaking saved research. The initial collection is not release coverage.
export const CONTENT_VERSION = '0.1.0';
export const topics = [
  { id: 'character', name: 'God’s character', hint: 'Knowing the One you’re searching for', icon: 'heart' },
  { id: 'scripture', name: 'Understanding the Bible', hint: 'Reading carefully, asking freely', icon: 'book' },
  { id: 'suffering', name: 'Suffering & hope', hint: 'Bringing difficult questions to God', icon: 'sun' },
  { id: 'salvation', name: 'Salvation & grace', hint: 'Forgiveness, trust, and a new beginning', icon: 'sprout' },
  { id: 'sabbath', name: 'Sabbath & rest', hint: 'Receiving the gift of sacred time', icon: 'sunset' },
  { id: 'death', name: 'Death & resurrection', hint: 'Grief, rest, and the promise of life', icon: 'leaf' },
  { id: 'return', name: 'Christ’s return', hint: 'A future held in His hands', icon: 'cloud' },
];

export const studies = [
  {
    id: 'god-like', topic: 'character', title: 'What is God really like?',
    summary: 'Begin with how God describes Himself.',
    keywords: ['who is god', 'character', 'angry', 'mercy', 'justice', 'loving', 'cruel', 'afraid of god'], beliefs: [3, 4],
    opening: 'The picture we carry of God can shape every other question. Give Him room to describe Himself before deciding what He is like.',
    readings: [
      { ref: 'Exodus 34:1–9', notice: 'Notice the setting: God is meeting Moses again after Israel’s failure. Which qualities does He name? Keep both His mercy and His response to wrongdoing in view.' },
      { ref: 'John 14:1–11', notice: 'Listen to Philip’s request and Jesus’ answer. What relationship does Jesus describe between knowing Him and knowing the Father?' },
    ],
    consider: 'God presents mercy, faithfulness, and justice together. Jesus directs Philip to His own life as the revelation of the Father. These passages invite us to understand God through His self-description and through Christ, including when a difficult passage raises further questions.',
    prompts: ['Which part of God’s self-description surprised me?', 'What picture of God am I bringing to this passage?'],
    related: ['welcome-home', 'love-cross', 'read-context'],
  },
  {
    id: 'welcome-home', topic: 'character', title: 'Can I come back to God?',
    summary: 'Look at the father Jesus describes to His listeners.',
    keywords: ['prodigal', 'return to god', 'ashamed', 'rejected', 'unworthy', 'father', 'come home'], beliefs: [3, 10],
    opening: 'If coming back feels difficult, begin with a story Jesus told about a family. Read it slowly enough to notice both sons.',
    readings: [
      { ref: 'Luke 15:1–2, 11–32', notice: 'Who is listening, and what complaint prompts these stories? Notice what the father does when each son is distant from him.' },
      { ref: 'Romans 5:6–11', notice: 'What was humanity’s condition when Christ acted for us? Who takes the initiative in reconciliation?' },
    ],
    consider: 'The father welcomes the returning son and goes out to the resentful son. Paul describes God acting in love while we were still sinners. Repentance is a real return to God, and His willingness to receive us is grounded in His character rather than in our ability to make ourselves worthy first.',
    prompts: ['Which son’s experience feels familiar?', 'What would an honest return to God look like for me?'],
    related: ['forgiveness', 'gift-grace', 'god-like'],
  },
  {
    id: 'love-cross', topic: 'character', title: 'What does the cross reveal about love?',
    summary: 'Explore God’s action toward a world in need.',
    keywords: ['cross', 'love', 'sacrifice', 'atonement', 'jesus died', 'why did jesus die', 'punishment'], beliefs: [4, 9],
    opening: 'The cross belongs at the center of our understanding of God. Look for who gives, who receives, and what reconciliation costs.',
    readings: [
      { ref: 'John 3:14–21', notice: 'Why does God give His Son? Read on to notice the passage’s connection between love, belief, light, and judgment.' },
      { ref: 'Romans 5:6–11', notice: 'Observe the repeated descriptions of those for whom Christ died, and what His death and life accomplish.' },
    ],
    consider: 'God’s love initiates salvation. Christ’s death for sinners brings reconciliation with God; His living presence gives hope beyond forgiveness alone. The Father and Son are united in this saving purpose. The invitation to trust Christ is an invitation into the light, where our lives can be changed.',
    prompts: ['What do these passages show about God’s initiative?', 'What connection do I see between love and reconciliation?'],
    related: ['gift-grace', 'god-like', 'grow-christ'],
  },
  {
    id: 'read-context', topic: 'scripture', title: 'How do I make sense of a passage?',
    summary: 'Give the words room to speak in their setting.',
    keywords: ['interpretation', 'interpret', 'context', 'meaning', 'understand bible', 'how to study', 'reading', 'start reading', 'read the bible', 'beginner', 'new reader'], beliefs: [1],
    opening: 'You can begin with a question without already knowing the answer. Read the paragraph around a verse, and notice who is speaking, to whom, and why.',
    readings: [
      { ref: 'Luke 24:13–35', notice: 'What had these travelers understood, and what had they missed? Notice how Jesus connects their experience to the wider Scriptures.' },
      { ref: '2 Timothy 3:14–17', notice: 'What purposes does Paul give for Scripture? How does knowing Christ fit into those purposes?' },
    ],
    consider: 'The travelers had facts about Jesus but needed the wider scriptural picture. Reading a passage in its literary and historical setting helps us distinguish what it says from assumptions we bring. Compare related passages without stripping either of its context, and keep the Bible’s witness to Christ in view.',
    prompts: ['What does the passage actually say, and what am I inferring?', 'What would I need to read around it to understand it better?'],
    related: ['test-teaching', 'ask-god', 'god-like'],
  },
  {
    id: 'test-teaching', topic: 'scripture', title: 'How can I examine a teaching for myself?',
    summary: 'Bring a claim back to the passages it rests on.',
    keywords: ['doctrine', 'claim', 'teacher', 'truth', 'proof', 'shepherds rod', 'shepherd’s rod', 'davidian', 'houteff', 'offshoot', 'false teaching', 'authority'], beliefs: [1],
    opening: 'Write down the claim in words its teacher would recognize. Find its supporting passages, then read them in context before reaching a conclusion.',
    readings: [
      { ref: 'Acts 17:10–12', notice: 'What two attitudes appear together in the Bereans? How do they respond even to the teaching of an apostle?' },
      { ref: 'Isaiah 8:19–20', notice: 'Where are people being urged to seek guidance? What standard is used to examine what is said?' },
    ],
    consider: 'The Bereans combine willingness to listen with careful examination of Scripture. A teacher’s confidence, popularity, or demand for loyalty cannot substitute for that examination. Record the strongest supporting passage and any passage that seems difficult for the claim. You can leave a question open while you investigate.',
    prompts: ['What is the precise claim I am examining?', 'Which passage most strongly supports it, and which needs reconciling with it?'],
    related: ['read-context', 'ask-god'],
  },
  {
    id: 'ask-god', topic: 'scripture', title: 'Can I bring my questions to God?',
    summary: 'Make room for prayer and honest investigation.',
    keywords: ['questions', 'doubt', 'wisdom', 'confused', 'prayer', 'guidance', 'where to start'], beliefs: [1, 11],
    opening: 'An unanswered question can be a place to begin. You can ask for help and still take time to read, compare, and think.',
    readings: [
      { ref: 'James 1:2–8', notice: 'Read the request for wisdom in the context of trials and endurance. How is God’s willingness to give described?' },
      { ref: 'Psalm 119:17–24', notice: 'What does the writer ask God to help him see? Notice how prayer and attention to God’s instruction belong together.' },
    ],
    consider: 'James points people under pressure toward a generous God. The psalmist asks for understanding while attending to God’s instruction. Prayer need not replace investigation; it can accompany it. Trusting God for wisdom is compatible with acknowledging what you have not yet understood.',
    prompts: ['What question do I want to bring honestly to God?', 'Which observation can I make before trying to explain everything?'],
    related: ['read-context', 'suffering-blame', 'grow-christ'],
  },
  {
    id: 'suffering-blame', topic: 'suffering', title: 'Does suffering mean God is punishing me?',
    summary: 'Listen to how Jesus answers a question about blame.',
    keywords: ['suffering', 'why me', 'sick', 'illness', 'punishing', 'punishment', 'pain', 'bad things', 'cancer', 'disease'], beliefs: [8, 11],
    opening: 'Pain often brings questions about responsibility and God’s care. Begin with an encounter where Jesus’ disciples assumed they knew the possible explanations.',
    readings: [
      { ref: 'John 9:1–7', notice: 'What explanation do the disciples propose? How does Jesus answer, and what does He do for the man?' },
      { ref: 'Romans 8:18–27', notice: 'Who is described as groaning? What help is offered when someone does not even know how to pray?' },
    ],
    consider: 'Jesus rejects the disciples’ proposed blame for this man’s blindness and responds with healing. Paul describes suffering within a creation awaiting restoration, including suffering among God’s people. These passages do not identify the cause of every individual hardship. They give us reason to avoid treating pain as proof that God has rejected someone.',
    prompts: ['What explanation of my suffering have I assumed?', 'What does God’s help look like in these passages?'],
    related: ['jesus-grief', 'evil-end', 'god-like'],
  },
  {
    id: 'jesus-grief', topic: 'suffering', title: 'Where is God when I am grieving?',
    summary: 'Stay with Jesus beside a grieving family.',
    keywords: ['grieving', 'grief', 'loss', 'cry', 'tears', 'lonely', 'bereavement', 'sad', 'abandoned'], beliefs: [4, 26],
    opening: 'You do not have to hurry past grief to study hope. Read the meeting between Jesus, Martha, and Mary with attention to both their questions and His response.',
    readings: [
      { ref: 'John 11:17–44', notice: 'Listen to what each sister says. Notice Jesus’ tears alongside His promise and His action at the tomb.' },
      { ref: '1 Thessalonians 4:13–18', notice: 'What does Paul want grieving readers to know? What event is the basis of the comfort he offers?' },
    ],
    consider: 'Jesus’ tears and His power to restore life appear in the same account. Grief does not disprove faith. Paul grounds comfort in Jesus’ resurrection and His promised return, when the faithful dead will rise. Hope gives grief a future without requiring us to pretend that loss does not hurt now.',
    prompts: ['What do I notice about Jesus’ response to sorrow?', 'What hope can I hold while allowing myself to grieve?'],
    related: ['death-sleep', 'resurrection-hope', 'evil-end'],
  },
  {
    id: 'evil-end', topic: 'suffering', title: 'Will suffering ever end?',
    summary: 'Explore the future God promises to His creation.',
    keywords: ['evil', 'suffering end', 'new earth', 'heaven', 'war', 'injustice', 'hope', 'restoration'], beliefs: [8, 28],
    opening: 'The Bible’s hope reaches beyond helping us endure. Consider what a restored world would mean for those who suffer now.',
    readings: [
      { ref: 'Romans 8:18–25', notice: 'What is creation waiting for? What difference does Paul make between our present experience and the hope ahead?' },
      { ref: 'Revelation 21:1–5', notice: 'Where is God in relation to His people? Identify the experiences that will no longer belong to their lives.' },
    ],
    consider: 'Paul describes creation’s present distress and future freedom. Revelation portrays God dwelling with His people in a renewed world, where death and sorrow have ended. Christian hope includes the restoration of creation and the end of suffering; it does not make present injustice good or erase the need for compassion now.',
    prompts: ['Which part of this promised future matters most to me today?', 'How might this hope shape my care for someone who is hurting?'],
    related: ['return-promise', 'jesus-grief', 'love-cross'],
  },
  {
    id: 'gift-grace', topic: 'salvation', title: 'Do I have to earn God’s acceptance?',
    summary: 'Explore the relationship between grace, faith, and a changed life.',
    keywords: ['salvation', 'saved', 'grace', 'faith', 'works', 'good enough', 'earn', 'acceptance', 'legalism'], beliefs: [9, 10],
    opening: 'It can be exhausting to approach God as though acceptance must be earned. Read Paul’s description of what God does for people who cannot rescue themselves.',
    readings: [
      { ref: 'Ephesians 2:1–10', notice: 'Watch the movement from the human condition to God’s action. Read verses 8–10 together: where do good works belong?' },
      { ref: 'Romans 5:1–11', notice: 'What is the basis for peace with God? Notice when God’s love is demonstrated toward us.' },
    ],
    consider: 'Salvation comes through God’s grace, received through faith. Good works are the life God prepares for those He makes new, rather than a purchase price for His acceptance. Paul connects peace with God to Jesus Christ. A life of obedience grows from this relationship of trust.',
    prompts: ['Where do I place good works in the sequence Paul describes?', 'What would it mean to receive grace rather than try to purchase it?'],
    related: ['forgiveness', 'grow-christ', 'sabbath-gift'],
  },
  {
    id: 'forgiveness', topic: 'salvation', title: 'What can I do with my guilt?',
    summary: 'Bring wrongdoing into the light of God’s forgiveness.',
    keywords: ['guilt', 'forgive', 'forgiveness', 'sin', 'confess', 'repent', 'mistakes', 'shame'], beliefs: [10, 24],
    opening: 'Honesty about wrongdoing and hope for forgiveness can belong together. Read what John writes to people he wants to help walk with God.',
    readings: [
      { ref: '1 John 1:5–2:2', notice: 'Read across the chapter boundary. What does John say about denying sin, confessing it, and the help available when someone sins?' },
      { ref: 'Psalm 32:1–7', notice: 'Compare the writer’s experience of concealment with his experience of acknowledging sin to God.' },
    ],
    consider: 'John calls for honest confession and points to God’s faithfulness to forgive and cleanse. He also presents Jesus Christ as our advocate. Forgiveness invites a changed direction, with room to make amends where appropriate. The foundation of hope is God’s promise and Christ’s work, even when feelings of guilt take time to settle.',
    prompts: ['What does this passage invite me to acknowledge?', 'What does it reveal about the One to whom I am confessing?'],
    related: ['welcome-home', 'gift-grace', 'grow-christ'],
  },
  {
    id: 'grow-christ', topic: 'salvation', title: 'How does a changed life grow?',
    summary: 'Consider Jesus’ picture of a vine and its branches.',
    keywords: ['growth', 'sanctification', 'holy', 'change', 'habits', 'obedience', 'fruit', 'holy spirit'], beliefs: [5, 10, 11, 19],
    opening: 'A new direction involves more than a single decision. Jesus uses a living picture to describe our ongoing dependence on Him.',
    readings: [
      { ref: 'John 15:1–12', notice: 'What can a branch do apart from the vine? Notice how abiding, prayer, obedience, joy, and love fit together.' },
      { ref: 'Galatians 5:16–25', notice: 'Compare the two kinds of life Paul describes. What qualities does the Spirit produce?' },
    ],
    consider: 'Jesus connects fruitful living with remaining in Him. Paul describes the Spirit producing a character recognizable in love and self-control. Growth involves continuing trust and a willing response to God, including practical choices. The picture is relational: Christ sustains the life He calls us to live.',
    prompts: ['What does remaining in Christ mean in my present circumstances?', 'Which aspect of the Spirit’s fruit do I want to seek in prayer?'],
    related: ['gift-grace', 'ask-god', 'sabbath-mercy'],
  },
  {
    id: 'sabbath-gift', topic: 'sabbath', title: 'Why did God set aside a day of rest?',
    summary: 'Look at the Sabbath’s beginning and purpose.',
    keywords: ['sabbath', 'rest', 'seventh day', 'saturday', 'creation', 'commandment', 'worship day', 'sunday'], beliefs: [6, 19, 20],
    opening: 'Begin before the many discussions about Sabbath practice. Look at the day’s origin and the reason given for remembering it.',
    readings: [
      { ref: 'Genesis 2:1–3', notice: 'Which day does God bless and set apart? What has just been completed?' },
      { ref: 'Exodus 20:8–11', notice: 'Notice both the day named and everyone included in its rest. What reason does the commandment give?' },
    ],
    consider: 'Genesis places the blessing of the seventh day at creation. The commandment directs people to remember that day and extends rest to the household, workers, visitors, and animals. Sabbath points to the Creator and provides sacred time for rest and worship. Its gift reaches beyond the person with power to arrange the working week.',
    prompts: ['What does the inclusion of others in this rest reveal about God?', 'How does a blessed day differ from simply a day without work?'],
    related: ['sabbath-mercy', 'sabbath-delight', 'gift-grace'],
  },
  {
    id: 'sabbath-mercy', topic: 'sabbath', title: 'What does Jesus show us about the Sabbath?',
    summary: 'Notice how sacred time and human need meet.',
    keywords: ['sabbath healing', 'rules', 'lawful', 'mercy', 'jesus sabbath', 'burden', 'help others'], beliefs: [20],
    opening: 'Questions about religious practice become clearer when we watch Jesus respond to people. Read both the conversation and the encounter that follows it.',
    readings: [
      { ref: 'Mark 2:23–3:6', notice: 'Read across the chapter boundary. What does Jesus say about the Sabbath’s purpose, and what does He do for the man in the synagogue?' },
      { ref: 'Luke 13:10–17', notice: 'Notice the woman’s long experience of suffering and Jesus’ explanation for setting her free on the Sabbath.' },
    ],
    consider: 'Jesus presents the Sabbath as made for humanity and identifies Himself as its Lord. His acts of healing show that doing good belongs within its purpose. Sabbath observance can express God’s restoring care through worship, rest, and mercy. Human need is an occasion to embody that care.',
    prompts: ['What does Jesus protect in these encounters?', 'Who could experience God’s kindness through my use of this day?'],
    related: ['sabbath-gift', 'sabbath-delight', 'god-like'],
  },
  {
    id: 'sabbath-delight', topic: 'sabbath', title: 'How can Sabbath become a delight?',
    summary: 'Explore rest as time for relationship and renewal.',
    keywords: ['sabbath practical', 'delight', 'busy', 'restful', 'preparation', 'keeping sabbath', 'friday sunset'], beliefs: [20],
    opening: 'Knowing which day is the Sabbath raises a personal question: how might receiving it change the way you spend time with God and others?',
    readings: [
      { ref: 'Isaiah 58:6–14', notice: 'Read the call to delight in the Sabbath alongside the chapter’s concern for hunger, oppression, and care for others.' },
      { ref: 'Luke 4:16–21', notice: 'What is Jesus’ Sabbath custom? What kind of ministry does the Scripture He reads describe?' },
    ],
    consider: 'Isaiah brings devotion to God together with concern for people in need. The Sabbath invitation calls us to honor God’s sacred time and find delight in Him. Jesus’ practice includes worship and His mission of restoration. Consider what preparation, rest, fellowship, or acts of care could make space for that relationship in your life.',
    prompts: ['What would help me welcome sacred time with God?', 'What practical change could make room for rest and mercy?'],
    related: ['sabbath-gift', 'sabbath-mercy', 'grow-christ'],
  },
  {
    id: 'death-sleep', topic: 'death', title: 'What does the Bible say about those who have died?',
    summary: 'Explore death as rest, and Christ as the giver of life.',
    keywords: ['dead', 'death', 'die', 'dying', 'what happens when you die', 'dead relative', 'deceased', 'saw my dead', 'grandmother', 'grandfather', 'ghost', 'apparition', 'afterlife', 'soul sleep', 'spirit', 'died', 'talk to the dead'], beliefs: [7, 26],
    opening: 'Questions about someone who has died can feel deeply personal. Begin with the Bible’s description of death, and keep its promise of renewed life alongside it.',
    readings: [
      { ref: 'Ecclesiastes 9:1–10', notice: 'Read the author’s reflection on life and death in full. What is said about awareness and activity in death?' },
      { ref: 'John 11:11–14, 21–27', notice: 'How does Jesus clarify His description of Lazarus as sleeping? Where does He direct Martha’s hope?' },
    ],
    consider: 'Read together, these passages present death as an unconscious rest, with renewed life dependent on Christ. This understanding offers peace: those who have died are not watching present sorrows or enduring a conscious wait. Hope rests in the One who can awaken them. These passages provide a basis for examining an experience, without telling us exactly what caused any particular sight, dream, or sensation.',
    prompts: ['What does each passage say about death, and what does it say about hope?', 'What question or experience am I trying to understand in light of these passages?'],
    related: ['resurrection-hope', 'life-gift', 'jesus-grief', 'test-teaching'],
  },
  {
    id: 'resurrection-hope', topic: 'death', title: 'Why does resurrection give us hope?',
    summary: 'Look at the connection between Jesus’ victory and our future.',
    keywords: ['resurrection', 'rise', 'reunion', 'see again', 'loved one', 'loved ones', 'comfort', 'last day'], beliefs: [9, 25, 26],
    opening: 'The Bible’s comfort for death is closely tied to something Jesus has done and something He promises to do. Follow that connection.',
    readings: [
      { ref: '1 Corinthians 15:12–23, 51–57', notice: 'Why does Paul say Christ’s resurrection matters for those who have died? Notice when mortality gives way to immortality.' },
      { ref: '1 Thessalonians 4:13–18', notice: 'What happens to the dead in Christ when the Lord returns? What does Paul ask readers to do with this promise?' },
    ],
    consider: 'Paul connects the future resurrection of believers to Christ’s own resurrection. Those who have died in Christ are not overlooked at His return; they rise, and His people are gathered to be with Him. Immortality is received through God’s victory over death. The promised reunion is a reason to comfort one another while we grieve.',
    prompts: ['On what event does Paul base his confidence?', 'How does this promised future change the way I think about separation?'],
    related: ['death-sleep', 'return-promise', 'return-visible'],
  },
  {
    id: 'life-gift', topic: 'death', title: 'Where does life come from?',
    summary: 'Trace our dependence on God from creation to resurrection.',
    keywords: ['soul', 'immortal', 'immortality', 'breath', 'body', 'spirit returns', 'living soul', 'nature of humanity'], beliefs: [7, 26],
    opening: 'Understanding death begins with understanding life. Read the creation of a human being alongside the promise of life beyond death.',
    readings: [
      { ref: 'Genesis 2:7', notice: 'What does God form, what does He give, and what does the person become? Read the actions in order.' },
      { ref: '1 Timothy 6:13–16', notice: 'To whom is inherent immortality attributed?' },
      { ref: '1 Corinthians 15:51–57', notice: 'When do God’s people receive immortality? What victory makes this possible?' },
    ],
    consider: 'Human life begins through God’s creative action and gift of breath. These passages locate immortality in God and describe human beings receiving it through His victory over death. Our hope rests in dependence on the Creator and Redeemer. Life is His gift from its beginning to its restoration.',
    prompts: ['What distinction do I see between possessing life independently and receiving it?', 'What does dependence on God reveal about the hope of resurrection?'],
    related: ['death-sleep', 'resurrection-hope', 'sabbath-gift'],
  },
  {
    id: 'return-promise', topic: 'return', title: 'What did Jesus promise about coming back?',
    summary: 'Begin with His words to troubled friends.',
    keywords: ['second coming', 'return', 'coming back', 'advent', 'future', 'heaven', 'jesus return'], beliefs: [25],
    opening: 'Before studying the details of Christ’s return, listen to the reason He gives His disciples for hope.',
    readings: [
      { ref: 'John 14:1–3', notice: 'What concern does Jesus address? What is the purpose of His promised return?' },
      { ref: 'Acts 1:6–11', notice: 'Distinguish what the disciples are not given to know from what they are promised. What does the account say about the Jesus who will return?' },
    ],
    consider: 'Jesus promises to return and receive His people to Himself. Acts ties that promise to the same Jesus who ascended. The center of this hope is a personal reunion with Christ. His followers receive a purpose for the present even while the timing remains in the Father’s authority.',
    prompts: ['What makes the promise personal?', 'What is given for me to trust, and what is left unknown?'],
    related: ['return-visible', 'waiting-hope', 'resurrection-hope'],
  },
  {
    id: 'return-visible', topic: 'return', title: 'How will we recognize Christ’s return?',
    summary: 'Compare the Bible’s descriptions of the event.',
    keywords: ['visible', 'secret', 'rapture', 'lightning', 'false christ', 'already returned', 'invisible', 'signs'], beliefs: [25, 26],
    opening: 'Bring descriptions of Christ’s return together. Notice what can be seen and heard, and what happens to His people.',
    readings: [
      { ref: 'Matthew 24:23–31', notice: 'What instructions does Jesus give about reports of a hidden or localized appearance? How does He describe His coming?' },
      { ref: 'Revelation 1:7', notice: 'Who sees Him?' },
      { ref: '1 Thessalonians 4:13–18', notice: 'List the events and sounds Paul associates with the Lord’s descent.' },
    ],
    consider: 'These descriptions present Christ’s return as personal, visible, and unmistakable, accompanied by the resurrection of the dead in Christ. Jesus directs His followers to these promises when evaluating reports about His appearance. The gathering of His people belongs to this public, triumphant event.',
    prompts: ['Which details appear across these accounts?', 'How would these passages help me examine a claim about Christ’s return?'],
    related: ['return-promise', 'waiting-hope', 'test-teaching'],
  },
  {
    id: 'waiting-hope', topic: 'return', title: 'How can I wait with hope instead of fear?',
    summary: 'Explore readiness through trust and faithful care.',
    keywords: ['end times', 'afraid', 'anxiety', 'date', 'when', 'ready', 'readiness', 'fear', 'last days', 'prophecy'], beliefs: [11, 25],
    opening: 'Questions about the future can become consuming. Read how Jesus connects watchfulness to everyday faithfulness.',
    readings: [
      { ref: 'Matthew 24:36–51', notice: 'What remains unknown? What is the faithful servant doing while the master is away?' },
      { ref: 'Titus 2:11–14', notice: 'What does grace teach people to do while they wait? What kind of hope is connected with Christ’s appearing?' },
    ],
    consider: 'Jesus does not give His followers a date to calculate. He calls them to watchfulness and faithful care. Paul links waiting for Christ with the present work of grace in our lives. Readiness can be expressed through trust in Christ, integrity, and service today, while His return remains the hope ahead.',
    prompts: ['What responsibility can I carry faithfully today?', 'How does grace shape both my present life and my hope for the future?'],
    related: ['return-promise', 'gift-grace', 'evil-end'],
  },
];

export const studyById = Object.fromEntries(studies.map(s => [s.id, s]));
export const topicById = Object.fromEntries(topics.map(t => [t.id, t]));
export const normalize = text => String(text).toLowerCase().normalize('NFKD').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const stop = new Set('a an the is are was were do does did i im me my we our us you your of to in on for with it this that about what how why can have has had and or be someone something want know bible biblical god jesus say says'.split(' '));
const stem = t => t.length > 5 && t.endsWith('ing') ? t.slice(0, -3) : t.length > 4 && t.endsWith('s') ? t.slice(0, -1) : t;
export function searchStudies(query, topic = '') {
  const q = normalize(query);
  const tokens = [...new Set(q.split(' ').filter(t => t.length > 1 && !stop.has(t)).map(stem))];
  return studies.filter(s => !topic || s.topic === topic).map(s => {
    if (!q) return { study: s, score: 1 };
    const phrases = [s.title, ...s.keywords].map(normalize);
    const titleWords = normalize(s.title + ' ' + topicById[s.topic].name).split(' ').map(stem);
    const keyWords = normalize(s.keywords.join(' ')).split(' ').map(stem);
    let score = phrases.reduce((n, p) => n + ((q === p || (p.length > 5 && q.includes(p))) ? 18 : 0), 0);
    for (const token of tokens) score += titleWords.includes(token) ? 5 : keyWords.includes(token) ? 4 : 0;
    // Queries consisting only of a central name still have a useful destination.
    if (!tokens.length && !score) {
      if (/\bgod\b/.test(q) && s.id === 'god-like') score = 2;
      if (/\bjesus\b/.test(q) && s.id === 'love-cross') score = 2;
      if (/\bbible\b/.test(q) && s.id === 'read-context') score = 2;
    }
    return { study: s, score };
  }).filter(r => r.score > 0).sort((a, b) => b.score - a.score).map(r => r.study);
}

export function bibleLink(ref, version = 'KJV') {
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref.replaceAll('–', '-'))}&version=${version === 'BSB' ? 'BSB' : 'KJV'}`;
}
