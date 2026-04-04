const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

function getParticipantsKey(a, b) {
  return [String(a), String(b)].sort().join('__');
}

async function isBlockedEitherWay(userId, otherUserId) {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: otherUserId },
        { blockerId: otherUserId, blockedId: userId },
      ],
    },
  });
  return Boolean(block);
}

const getOrCreateConversation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { otherUserId } = req.body || {};
  if (!otherUserId) throw new ApiError(400, 'otherUserId is required');
  if (String(otherUserId) === String(userId)) throw new ApiError(400, 'Cannot start conversation with yourself');
  if (await isBlockedEitherWay(userId, otherUserId)) {
    throw new ApiError(403, 'Conversation unavailable due to block settings');
  }

  const key = getParticipantsKey(userId, otherUserId);
  const userAId = [String(userId), String(otherUserId)].sort()[0];
  const userBId = [String(userId), String(otherUserId)].sort()[1];

  const conversation = await prisma.conversation.upsert({
    where: { participantsKey: key },
    update: {},
    create: {
      participantsKey: key,
      userAId,
      userBId,
    },
    include: {
      userA: { select: { id: true, name: true, email: true } },
      userB: { select: { id: true, name: true, email: true } },
    },
  });

  res.json({ id: conversation.id });
});

const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      userA: { select: { id: true, name: true, email: true } },
      userB: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, createdAt: true },
      },
    },
  });

  const result = conversations.map((c) => {
    const otherUser = c.userA.id === userId ? c.userB : c.userA;
    return {
      id: c.id,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
        email: otherUser.email,
      },
      lastMessage: c.messages[0]?.content || '',
      lastMessageAt: c.messages[0]?.createdAt || c.lastMessageAt,
      unreadCount: 0,
      isBlocked: false,
    };
  });

  // Enrich with unread counts + block info.
  const enriched = await Promise.all(
    result.map(async (row) => {
      const [unreadCount, blocked] = await Promise.all([
        prisma.message.count({
          where: {
            conversationId: row.id,
            senderId: { not: userId },
            readAt: null,
          },
        }),
        isBlockedEitherWay(userId, row.otherUser.id),
      ]);
      return { ...row, unreadCount, isBlocked: blocked };
    })
  );

  res.json(enriched);
});

const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { conversationId } = req.params;
  if (!conversationId) throw new ApiError(400, 'conversationId is required');

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  if (conversation.userAId !== userId && conversation.userBId !== userId) {
    throw new ApiError(403, 'Not allowed to read this conversation');
  }

  const otherUserId = conversation.userAId === userId ? conversation.userBId : conversation.userAId;
  if (await isBlockedEitherWay(userId, otherUserId)) {
    throw new ApiError(403, 'Conversation unavailable due to block settings');
  }

  // Mark incoming unread messages as read.
  const readAt = new Date();
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, name: true, email: true } },
    },
  });

  res.json(
    messages.map((m) => ({
      id: m.id,
      content: m.content,
      attachmentUrl: m.attachmentUrl,
      attachmentName: m.attachmentName,
      attachmentType: m.attachmentType,
      deliveredAt: m.deliveredAt,
      readAt: m.readAt,
      status: m.readAt ? 'read' : 'delivered',
      createdAt: m.createdAt,
      sender: m.sender,
      isIncoming: m.senderId !== userId,
    }))
  );
});

const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { conversationId, content } = req.body || {};

  if (!conversationId) throw new ApiError(400, 'conversationId is required');
  const hasText = Boolean(content && String(content).trim());
  const hasAttachment = Boolean(req.file);
  if (!hasText && !hasAttachment) throw new ApiError(400, 'content or attachment is required');

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  if (conversation.userAId !== userId && conversation.userBId !== userId) {
    throw new ApiError(403, 'Not allowed to send message in this conversation');
  }
  const otherUserId = conversation.userAId === userId ? conversation.userBId : conversation.userAId;
  if (await isBlockedEitherWay(userId, otherUserId)) {
    throw new ApiError(403, 'Cannot send messages due to block settings');
  }

  const uploadedFile = req.file;
  const attachmentUrl = uploadedFile
    ? `${req.protocol}://${req.get('host')}/uploads/chat/${uploadedFile.filename}`
    : null;

  const now = new Date();
  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: hasText ? String(content).trim() : '',
        attachmentUrl,
        attachmentName: uploadedFile?.originalname || null,
        attachmentType: uploadedFile?.mimetype || null,
        deliveredAt: now,
      },
      include: { sender: { select: { id: true, name: true, email: true } } },
    });
    await tx.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: now },
    });
    return created;
  });

  res.status(201).json({
    id: message.id,
    content: message.content,
    attachmentUrl: message.attachmentUrl,
    attachmentName: message.attachmentName,
    attachmentType: message.attachmentType,
    deliveredAt: message.deliveredAt,
    readAt: message.readAt,
    status: message.readAt ? 'read' : 'delivered',
    createdAt: message.createdAt,
    sender: message.sender,
    isIncoming: false,
  });
});

const deleteConversation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { conversationId } = req.params;
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  if (conversation.userAId !== userId && conversation.userBId !== userId) {
    throw new ApiError(403, 'Not allowed to delete this conversation');
  }
  await prisma.conversation.delete({ where: { id: conversationId } });
  res.status(204).send();
});

const blockUser = asyncHandler(async (req, res) => {
  const blockerId = req.user.id;
  const { blockedUserId } = req.body || {};
  if (!blockedUserId) throw new ApiError(400, 'blockedUserId is required');
  if (String(blockedUserId) === String(blockerId)) throw new ApiError(400, 'Cannot block yourself');

  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId, blockedId: blockedUserId } },
    update: {},
    create: { blockerId, blockedId: blockedUserId },
  });

  res.json({ ok: true });
});

const unblockUser = asyncHandler(async (req, res) => {
  const blockerId = req.user.id;
  const { blockedUserId } = req.body || {};
  if (!blockedUserId) throw new ApiError(400, 'blockedUserId is required');

  await prisma.block.deleteMany({
    where: { blockerId, blockedId: blockedUserId },
  });
  res.json({ ok: true });
});

const getBlockedUsers = asyncHandler(async (req, res) => {
  const blockerId = req.user.id;
  const rows = await prisma.block.findMany({
    where: { blockerId },
    include: {
      blocked: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(rows.map((r) => r.blocked));
});

module.exports = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
  blockUser,
  unblockUser,
  getBlockedUsers,
};

