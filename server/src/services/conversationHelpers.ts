import type { IDatabase } from "pg-promise";

export async function insertUserMessage(
  db: IDatabase<unknown>,
  conversationId: number,
  content: string,
  imageData: string | null
) {
  return await db.one(
    `insert into message(conversation_id, role, content, image_url)
     values ($1, 'user', $2, $3)
     returning id, conversation_id as "conversationId", role, content,
               image_url as "imageUrl", created_at as "createdAt"`,
    [conversationId, content, imageData]
  );
}

export async function insertAssistantMessage(
  db: IDatabase<unknown>,
  conversationId: number,
  content: string
) {
  return await db.one(
    `insert into message(conversation_id, role, content)
     values ($1, 'assistant', $2)
     returning id, conversation_id as "conversationId", role, content,
               image_url as "imageUrl", created_at as "createdAt"`,
    [conversationId, content]
  );
}

export async function fetchPriorMessages(db: IDatabase<unknown>, conversationId: number) {
  return await db.manyOrNone<{ role: string; content: string; image_url?: string }>(
    `select role, content, image_url as "imageUrl"
     from message
     where conversation_id = $1
     order by created_at asc`,
    [conversationId]
  );
}

export function buildMessagesArray(
  prior: Array<{ role: string; content: string; image_url?: string }>,
  currentContent: string,
  currentImageData: string | null
) {
  const messages = prior.map(msg => {
    if (msg.image_url) {
      return {
        role: msg.role,
        content: [
          { type: "text", text: msg.content },
          { type: "image_url", image_url: { url: msg.image_url } }
        ]
      };
    }
    return { role: msg.role, content: msg.content };
  });

  if (currentImageData) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: currentContent },
        { type: "image_url", image_url: { url: currentImageData } }
      ]
    });
  } else {
    messages.push({ role: "user", content: currentContent });
  }

  return messages;
}

export async function updateConversationTitle(
  db: IDatabase<unknown>,
  conversationId: number,
  newTitle: string
) {
  await db.none(
    `update conversation set title = $2, updated_at = now()
     where id = $1 and title = 'New chat'`,
    [conversationId, newTitle]
  );
}

export async function touchConversation(db: IDatabase<unknown>, conversationId: number) {
  await db.none(`update conversation set updated_at = now() where id = $1`, [conversationId]);
}
