import { GiftKey } from "@shared/schema";

export interface GiftContent {
  name: string;
  shortName: string;
  definition: string;
  scripture: string;
  scriptureRef: string;
  ministryOptions: string[];
  whyItMatters: string;
  icon: string;
}

export const giftContent: Record<GiftKey, GiftContent> = {
  LEADERSHIP_ORG: {
    name: "Leadership & Organization",
    shortName: "Leadership",
    definition:
      "You have a God-given ability to see the steps needed to accomplish goals and organize people and resources effectively. You naturally take initiative to bring order to chaos and help groups work together toward Kingdom purposes.",
    scripture:
      "And God has placed in the church first of all apostles, second prophets, third teachers, then miracles, then gifts of healing, of helping, of guidance, and of different kinds of tongues.",
    scriptureRef: "1 Corinthians 12:28",
    ministryOptions: [
      "Lead ministry teams or committees",
      "Organize church events and outreach programs",
      "Coordinate volunteer schedules and resources",
      "Start small group initiatives",
      "Develop ministry systems and processes",
    ],
    whyItMatters:
      "Your leadership gift helps the body of Christ function effectively. When you step into your calling, ministries run smoothly, people feel valued and equipped, and Kingdom work advances with purpose and direction.",
    icon: "users-cog",
  },
  TEACHING: {
    name: "Teaching",
    shortName: "Teaching",
    definition:
      "You have the ability to communicate biblical truth in ways that help others understand and apply God's Word to their lives. You naturally break down complex concepts and help people grow in their faith through clear explanation.",
    scripture:
      "So Christ himself gave the apostles, the prophets, the evangelists, the pastors and teachers, to equip his people for works of service, so that the body of Christ may be built up.",
    scriptureRef: "Ephesians 4:11-12",
    ministryOptions: [
      "Lead Bible studies or small groups",
      "Teach Sunday school or youth classes",
      "Create discipleship curriculum",
      "Mentor new believers",
      "Develop educational resources",
    ],
    whyItMatters:
      "Your teaching gift helps build mature disciples. When you teach, people understand God's truth more clearly, grow in their faith, and become equipped to serve others effectively in their own Kingdom calling.",
    icon: "book-open",
  },
  WISDOM_INSIGHT: {
    name: "Wisdom & Insight",
    shortName: "Wisdom",
    definition:
      "You have the ability to see situations from God's perspective and provide godly counsel that helps people make wise decisions. You naturally understand how biblical principles apply to life's challenges.",
    scripture:
      "To one there is given through the Spirit a message of wisdom, to another a message of knowledge by means of the same Spirit.",
    scriptureRef: "1 Corinthians 12:8",
    ministryOptions: [
      "Provide counseling and pastoral care",
      "Serve on leadership teams",
      "Mentor other believers",
      "Facilitate conflict resolution",
      "Guide strategic planning and decision-making",
    ],
    whyItMatters:
      "Your wisdom gift helps people navigate life's complexities with biblical truth. When you share insights, people make better decisions, avoid pitfalls, and experience God's peace in difficult circumstances.",
    icon: "lightbulb",
  },
  PROPHETIC_DISCERNMENT: {
    name: "Prophetic Discernment",
    shortName: "Prophetic",
    definition:
      "You have the ability to discern spiritual truth and recognize what comes from God versus other sources. You can sense when something isn't right spiritually and speak truth into situations with divine insight.",
    scripture:
      "But when he, the Spirit of truth, comes, he will guide you into all the truth. He will not speak on his own; he will speak only what he hears, and he will tell you what is yet to come.",
    scriptureRef: "John 16:13",
    ministryOptions: [
      "Provide spiritual direction and guidance",
      "Serve in prayer ministry",
      "Help with discernment in leadership decisions",
      "Minister prophetically in worship settings",
      "Identify and address spiritual issues in the church",
    ],
    whyItMatters:
      "Your prophetic gift protects and guides the church. When you discern and speak truth, people are warned of dangers, encouraged by God's heart, and directed toward His will for their lives and the community.",
    icon: "eye",
  },
  EXHORTATION: {
    name: "Exhortation & Encouragement",
    shortName: "Exhortation",
    definition:
      "You have the ability to motivate and encourage others to keep moving forward in their faith journey. You naturally see people's potential and speak words that inspire them to grow and overcome challenges.",
    scripture:
      "We have different gifts, according to the grace given to each of us. If your gift is prophesying, then prophesy in accordance with your faith; if it is serving, then serve; if it is teaching, then teach; if it is to encourage, then give encouragement.",
    scriptureRef: "Romans 12:6-8",
    ministryOptions: [
      "Provide pastoral care and counseling",
      "Lead support groups or recovery ministries",
      "Mentor struggling believers",
      "Speak at retreats or encouragement events",
      "Visit and encourage those facing difficulties",
    ],
    whyItMatters:
      "Your encouragement gift helps people persevere through difficulties and continue growing in their faith. When you speak life into others, they find strength to keep going and discover their own calling to serve God's Kingdom.",
    icon: "hands-helping",
  },
  SHEPHERDING: {
    name: "Shepherding & Pastoral Care",
    shortName: "Shepherding",
    definition:
      "You have a heart to care for and guide others in their spiritual journey. You naturally want to protect, nurture, and help people grow in their relationship with God over the long term.",
    scripture:
      "Be shepherds of God's flock that is under your care, watching over them—not because you must, but because you are willing, as God wants you to be; not pursuing dishonest gain, but eager to serve.",
    scriptureRef: "1 Peter 5:2",
    ministryOptions: [
      "Lead small groups focused on care and growth",
      "Provide ongoing discipleship and mentoring",
      "Offer pastoral care and support",
      "Minister to those in crisis or transition",
      "Develop and lead recovery or support ministries",
    ],
    whyItMatters:
      "Your shepherding gift creates safe spaces for spiritual growth. When you care for others, they experience God's love tangibly, feel secure in their faith journey, and are equipped to shepherd others in turn.",
    icon: "shield-alt",
  },
  FAITH: {
    name: "Faith & Intercession",
    shortName: "Faith",
    definition:
      "You have an extraordinary ability to trust God for the impossible and encourage others to do the same. You naturally see God's power and faithfulness even in challenging circumstances.",
    scripture:
      "Truly I tell you, if you have faith as small as a mustard seed, you can say to this mountain, 'Move from here to there,' and it will move. Nothing will be impossible for you.",
    scriptureRef: "Matthew 17:20",
    ministryOptions: [
      "Lead prayer and intercession ministries",
      "Support missions and church planting efforts",
      "Encourage faith during church crises or challenges",
      "Pray for healing and breakthrough",
      "Pioneer new ministries that require great faith",
    ],
    whyItMatters:
      "Your faith gift moves mountains and inspires others to trust God more deeply. When you exercise faith, people witness God's power, their own faith grows, and the church advances into new territories of ministry.",
    icon: "mountain",
  },
  EVANGELISM: {
    name: "Evangelism & Outreach",
    shortName: "Evangelism",
    definition:
      "You have a passion and ability to share the Gospel effectively with others. You naturally find opportunities to talk about faith and help people understand God's love and salvation.",
    scripture:
      "But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.",
    scriptureRef: "Acts 1:8",
    ministryOptions: [
      "Lead outreach events and programs",
      "Share the Gospel in community settings",
      "Support missions locally and globally",
      "Train others in evangelism",
      "Develop creative outreach strategies",
    ],
    whyItMatters:
      "Your evangelistic gift brings new people into God's Kingdom. When you share the Gospel, lives are transformed, families are changed, and the church grows with new believers who will impact their own communities.",
    icon: "bullhorn",
  },
  APOSTLESHIP: {
    name: "Apostleship & Church Planting",
    shortName: "Apostleship",
    definition:
      "You have a calling to start new ministries, plant churches, or pioneer Kingdom work in new territories. You thrive on breaking new ground and establishing God's work where it hasn't existed before.",
    scripture:
      "So Christ himself gave the apostles, the prophets, the evangelists, the pastors and teachers, to equip his people for works of service, so that the body of Christ may be built up.",
    scriptureRef: "Ephesians 4:11-12",
    ministryOptions: [
      "Plant new churches or ministries",
      "Support missions in unreached areas",
      "Launch innovative ministry initiatives",
      "Establish Kingdom work in new communities",
      "Train and send others into ministry",
    ],
    whyItMatters:
      "Your apostolic gift expands God's Kingdom into new territories. When you pioneer new work, more people hear the Gospel, new communities of faith are established, and God's influence grows in the world.",
    icon: "rocket",
  },
  SERVICE_HOSPITALITY: {
    name: "Service & Hospitality",
    shortName: "Service",
    definition:
      "You find joy in serving others and creating welcoming environments where people feel cared for. You naturally notice practical needs and take action to meet them with warmth and generosity.",
    scripture:
      "Each of you should use whatever gift you have to serve others, as faithful stewards of God's grace in its various forms.",
    scriptureRef: "1 Peter 4:10",
    ministryOptions: [
      "Welcome and care for visitors and new members",
      "Organize hospitality events and fellowship meals",
      "Support practical needs in the community",
      "Serve in setup, cleanup, and logistical support",
      "Create comfortable spaces for ministry activities",
    ],
    whyItMatters:
      "Your service gift creates an atmosphere where people can encounter God's love. When you serve, people feel valued and welcomed, community bonds strengthen, and everyone can focus on spiritual growth without distraction.",
    icon: "home",
  },
  MERCY: {
    name: "Mercy & Compassion",
    shortName: "Mercy",
    definition:
      "You have a special sensitivity to those who suffer and a natural desire to bring comfort and healing. You're drawn to help people in pain and show them God's compassion in practical ways.",
    scripture:
      "Blessed are the merciful, for they will be shown mercy.",
    scriptureRef: "Matthew 5:7",
    ministryOptions: [
      "Minister to those facing illness or crisis",
      "Support grief and recovery ministries",
      "Care for the elderly, disabled, or marginalized",
      "Volunteer with community service organizations",
      "Provide emotional and spiritual support to hurting people",
    ],
    whyItMatters:
      "Your mercy gift reveals God's heart for the hurting. When you show compassion, people experience God's love in their darkest moments, healing begins, and they learn to extend mercy to others in turn.",
    icon: "heart",
  },
  GIVING: {
    name: "Giving & Generosity",
    shortName: "Giving",
    definition:
      "You have a God-given desire to contribute financially and materially to Kingdom work. You find joy in supporting ministries and meeting needs through generous and strategic giving.",
    scripture:
      "In everything I did, I showed you that by this kind of hard work we must help the weak, remembering the words the Lord Jesus himself said: 'It is more blessed to give than to receive.'",
    scriptureRef: "Acts 20:35",
    ministryOptions: [
      "Support missions and church planting financially",
      "Meet practical needs of individuals and families",
      "Fund ministry initiatives and special projects",
      "Sponsor events, programs, and outreach efforts",
      "Teach others about biblical stewardship and generosity",
    ],
    whyItMatters:
      "Your giving gift fuels Kingdom advancement. When you give generously, ministries thrive, needs are met, and God's work expands. Your generosity also inspires others to trust God with their resources and discover the joy of giving.",
    icon: "gift",
  },
};

export function getGiftContent(giftKey: GiftKey): GiftContent {
  return giftContent[giftKey];
}

export function getAllGiftContent(): GiftContent[] {
  return Object.values(giftContent);
}
