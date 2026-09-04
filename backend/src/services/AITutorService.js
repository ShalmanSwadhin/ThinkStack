import geminiService from './GeminiService.js';
import aiTutorConversationRepository from '../repositories/AITutorConversationRepository.js';
import topicRepository from '../repositories/TopicRepository.js';
import problemRepository from '../repositories/ProblemRepository.js';
import AppError from '../utils/AppError.js';
import ComingSoonError from '../utils/ComingSoonError.js';
import { COMING_SOON_MESSAGES } from '../utils/integrationStatus.js';
import gamificationService from './GamificationService.js';

const SYSTEM_PROMPT = `You are ThinkStack AI Tutor, an expert data structures and algorithms educator for university students.

Your capabilities include:
- Explaining DSA concepts clearly with examples
- Analyzing time and space complexity
- Generating practice quiz questions and interview questions
- Reviewing code and suggesting improvements
- Providing debugging hints without always giving full solutions
- Helping students learn step-by-step

Guidelines:
- Be concise but thorough
- Use markdown for code blocks and lists when helpful
- Encourage understanding over memorization
- If asked about unrelated topics, gently redirect to DSA learning`;

const formatMessage = (message) => ({
  id: message._id?.toString?.() ?? message.id,
  role: message.role,
  content: message.content,
  timestamp: message.timestamp ?? message.createdAt,
});

const formatConversationSummary = (conversation) => ({
  id: conversation._id.toString(),
  title: conversation.title,
  messageCount: conversation.messages?.length ?? 0,
  context: conversation.context ?? {},
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt,
});

const formatConversationDetail = (conversation) => ({
  ...formatConversationSummary(conversation),
  messages: (conversation.messages ?? []).map(formatMessage),
});

const buildConversationTitle = (message) => {
  const trimmed = String(message || '').trim();
  if (!trimmed) return 'New Conversation';
  return trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed;
};

const buildContextPrompt = async (context = {}) => {
  const sections = [];

  if (context.topicSlug) {
    const topic = await topicRepository.findOne(
      { slug: context.topicSlug.toLowerCase(), status: 'published' },
      { select: 'title slug category difficulty content.introduction' }
    );
    if (topic) {
      sections.push(
        `Topic context:\n- Title: ${topic.title}\n- Slug: ${topic.slug}\n- Category: ${topic.category}\n- Difficulty: ${topic.difficulty}\n- Introduction: ${topic.content?.introduction ?? 'N/A'}`
      );
    }
  }

  if (context.problemSlug) {
    const problem = await problemRepository.findOne({
      slug: context.problemSlug.toLowerCase(),
      status: 'published',
    });
    if (problem) {
      sections.push(
        `Problem context:\n- Title: ${problem.title}\n- Slug: ${problem.slug}\n- Difficulty: ${problem.difficulty}\n- Description: ${problem.description}\n- Constraints: ${problem.constraints || 'N/A'}`
      );
    }
  }

  if (!sections.length) return SYSTEM_PROMPT;
  return `${SYSTEM_PROMPT}\n\n${sections.join('\n\n')}`;
};

export class AITutorService {
  async listConversations(userId, { page = 1, limit = 20 } = {}) {
    const { data, meta } = await aiTutorConversationRepository.findByUser(userId, {
      page,
      limit,
      select: 'title messages context createdAt updatedAt',
    });

    return {
      conversations: data.map(formatConversationSummary),
      meta,
    };
  }

  async getConversation(userId, conversationId) {
    const conversation = await aiTutorConversationRepository.findByIdForUser(
      conversationId,
      userId
    );

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    return formatConversationDetail(conversation);
  }

  async createConversation(userId, { title, context = {} } = {}) {
    const conversation = await aiTutorConversationRepository.create({
      userId,
      title: title?.trim() || 'New Conversation',
      messages: [],
      context: {
        topicSlug: context.topicSlug?.toLowerCase() || undefined,
        problemSlug: context.problemSlug?.toLowerCase() || undefined,
      },
    });

    await aiTutorConversationRepository.pruneOldConversations(userId);

    return formatConversationDetail(conversation);
  }

  async deleteConversation(userId, conversationId) {
    const conversation = await aiTutorConversationRepository.deleteForUser(
      conversationId,
      userId
    );

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    return { id: conversation._id.toString() };
  }

  async sendMessage(userId, { conversationId, message, context = {} }) {
    const trimmedMessage = String(message || '').trim();
    if (!trimmedMessage) {
      throw new AppError('Message is required', 400);
    }

    if (geminiService.isComingSoon()) {
      throw new ComingSoonError('Gemini', COMING_SOON_MESSAGES.gemini);
    }

    let conversation;

    if (conversationId) {
      conversation = await aiTutorConversationRepository.findByIdForUser(conversationId, userId);
      if (!conversation) {
        throw new AppError('Conversation not found', 404);
      }
    } else {
      conversation = await aiTutorConversationRepository.create({
        userId,
        title: buildConversationTitle(trimmedMessage),
        messages: [],
        context: {
          topicSlug: context.topicSlug?.toLowerCase() || undefined,
          problemSlug: context.problemSlug?.toLowerCase() || undefined,
        },
      });
      await aiTutorConversationRepository.pruneOldConversations(userId);
    }

    const mergedContext = {
      topicSlug: context.topicSlug || conversation.context?.topicSlug,
      problemSlug: context.problemSlug || conversation.context?.problemSlug,
    };

    const systemInstruction = await buildContextPrompt(mergedContext);
    const history = conversation.messages ?? [];

    const replyText = await geminiService.generateChatResponse({
      systemInstruction,
      messages: [...history, { role: 'user', content: trimmedMessage }],
    });

    const timestamp = new Date();
    const userMessage = { role: 'user', content: trimmedMessage, timestamp };
    const assistantMessage = { role: 'assistant', content: replyText, timestamp };

    const updated = await aiTutorConversationRepository.appendMessages(
      conversation._id,
      userId,
      [userMessage, assistantMessage]
    );

    if (!conversationId && updated?.messages?.length === 2) {
      await aiTutorConversationRepository.updateTitle(
        conversation._id,
        userId,
        buildConversationTitle(trimmedMessage)
      );
    }

    const messages = updated.messages ?? [];
    const userStored = messages[messages.length - 2];
    const assistantStored = messages[messages.length - 1];

    const activity = await gamificationService.processActivity(userId, {
      activityType: 'ai_message',
    });

    return {
      conversationId: conversation._id.toString(),
      userMessage: formatMessage(userStored),
      reply: formatMessage(assistantStored),
      mockMode: geminiService.isMockMode(),
      newBadges: activity.newBadges ?? [],
    };
  }
}

export default new AITutorService();
