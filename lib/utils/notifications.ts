import { prisma } from "@/lib/db";
import type { NotificationType } from "@prisma/client";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: params,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return count;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return 0;
  }
}
