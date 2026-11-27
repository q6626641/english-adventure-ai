export const worlds = [
  { id: 'village', name: '新手村', category: '日常口语', theme: 'lime', landmark: [48, 49, 85, 84], lessons: ['introductions', 'greetings', 'coffee'] },
  { id: 'town', name: '生活小镇', category: '日常口语', theme: 'peach', landmark: [52, 53, 84, 85], lessons: ['restaurant', 'returns', 'pharmacy'] },
  { id: 'travel', name: '环球旅行', category: '日常口语', theme: 'sky', landmark: [48, 49, 88, 89], lessons: ['directions', 'ride', 'airport', 'hotel'] },
  { id: 'trade', name: '国际贸易城', category: '外贸英语', theme: 'violet', landmark: [52, 53, 85, 84], lessons: ['trade-show', 'textile', 'towels', 'inquiry'] },
  { id: 'negotiation', name: '商务谈判中心', category: '外贸英语', theme: 'peach', landmark: [48, 49, 89, 88], lessons: ['price-break', 'payment', 'production'] },
  { id: 'port', name: '全球贸易港', category: '外贸英语', theme: 'sky', landmark: [48, 49, 88, 89], lessons: ['packing', 'documents', 'shipping', 'quality'] },
  { id: 'academy', name: '语法学院', category: '英语语法', theme: 'violet', landmark: [52, 53, 84, 85], lessons: ['present', 'past', 'modal-can', 'prepositions', 'much-many', 'comparatives', 'present-perfect'] },
  { id: 'arena', name: '实战竞技场', category: '综合实战', theme: 'lime', landmark: [52, 53, 85, 84], lessons: ['hotel-change', 'delay-call'] },
  { id: 'web', name: '网站操作站', category: '网站英语', theme: 'sky', landmark: [48, 49, 88, 89], lessons: ["web-settings","web-network","web-query","web-rules","web-test"] },
] as const;

export type World = typeof worlds[number];

export function completedWorlds(completed: ReadonlySet<string>) {
  return worlds.filter((world) => world.lessons.every((id) => completed.has(id)));
}

export function adventureRewards(mastered: number, completed: ReadonlySet<string>) {
  const chests = completedWorlds(completed).length;
  return { xp: mastered * 10, level: 1 + Math.floor(mastered / 10), coins: 5 * completed.size + 15 * chests, chests };
}
