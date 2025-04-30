import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useTaskStore } from '@/store/taskStore';
import { addDays, isAfter, isBefore } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function useNotifications() {
  const notificationListenerRef = useRef<Notifications.Subscription>();
  const responseListenerRef = useRef<Notifications.Subscription>();
  const { tasks } = useTaskStore();

  // Mendaftarkan task untuk notifikasi deadline
  const scheduleTaskNotifications = async () => {
    // Batalkan semua notifikasi yang ada terlebih dahulu
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Mendaftarkan permission untuk notifikasi
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Filter tugas yang memiliki deadline dan belum selesai
    const tasksWithDeadline = tasks.filter(
      task => task.deadline && !task.completed
    );

    const now = new Date();
    const tomorrow = addDays(now, 1);

    // Jadwalkan notifikasi untuk task yang deadlinenya besok
    for (const task of tasksWithDeadline) {
      if (!task.deadline) continue;
      
      const deadlineDate = new Date(task.deadline);
      
      // Jika deadline sudah lewat, skip
      if (isBefore(deadlineDate, now)) continue;
      
      // Jika deadline besok
      if (isBefore(deadlineDate, addDays(tomorrow, 1)) && isAfter(deadlineDate, now)) {
        // Menghitung waktu notifikasi (satu hari sebelum deadline)
        // Jika deadline kurang dari 24 jam, kirim notifikasi sekarang
        const notificationTime = isBefore(deadlineDate, tomorrow) 
          ? new Date(Date.now() + 1000) // 1 detik dari sekarang
          : new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000); // 1 hari sebelum deadline
        
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Deadline Task Besok!',
              body: `"${task.title}" memiliki deadline besok.`,
              data: { taskId: task.id },
            },
            trigger: {
              date: notificationTime,
            },
          });
        } catch (error) {
          console.error('Error scheduling notification:', error);
        }
      }
    }
  };

  useEffect(() => {
    // Minta permission notifikasi saat pertama kali mounting
    (async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      await scheduleTaskNotifications();
    })();

    // Set up listeners untuk notifikasi
    notificationListenerRef.current = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('Notification received:', notification);
      }
    );

    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('Notification response received:', response);
        // Di sini bisa ditambahkan navigasi ke detail task jika dibutuhkan
      }
    );

    // Cleanup listeners saat unmount
    return () => {
      if (notificationListenerRef.current) {
        Notifications.removeNotificationSubscription(notificationListenerRef.current);
      }
      if (responseListenerRef.current) {
        Notifications.removeNotificationSubscription(responseListenerRef.current);
      }
    };
  }, []);

  // Reschedule notifikasi saat tasks berubah
  useEffect(() => {
    scheduleTaskNotifications();
  }, [tasks]);

  return null;
} 