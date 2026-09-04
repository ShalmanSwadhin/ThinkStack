import { MODULE_INDEX, CATEGORY_LABELS, CATEGORY_ORDER } from 'shared/curriculum/moduleIndex.js';

export function getModuleIdFromTopic(topic) {
  const tag = topic.tags?.find((item) => item.startsWith('module:'));
  if (tag) return tag.replace('module:', '');
  const slug = topic.slug ?? '';
  const match = MODULE_INDEX.find((mod) => slug.startsWith(`${mod.id}-`));
  return match?.id ?? null;
}

export function buildCurriculumStructure(categories) {
  const topicsByModule = new Map();

  for (const category of categories ?? []) {
    for (const topic of category.topics ?? []) {
      const moduleId = getModuleIdFromTopic(topic);
      if (!moduleId) continue;
      if (!topicsByModule.has(moduleId)) topicsByModule.set(moduleId, []);
      topicsByModule.get(moduleId).push(topic);
    }
  }

  for (const topics of topicsByModule.values()) {
    topics.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  const modules = MODULE_INDEX.map((mod) => {
    const topics = topicsByModule.get(mod.id) ?? [];
    const completed = topics.filter((t) => t.progress?.status === 'completed').length;
    return {
      ...mod,
      topics,
      completed,
      total: topics.length,
      firstLessonSlug: topics[0]?.slug ?? null,
    };
  }).filter((mod) => mod.total > 0);

  return CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category] ?? category,
    modules: modules.filter((mod) => mod.category === category),
  })).filter((group) => group.modules.length > 0);
}

export default buildCurriculumStructure;
