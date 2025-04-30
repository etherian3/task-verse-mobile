import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { 
  format, 
  addDays, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay,
  getDay,
  addMonths,
  subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  markedDates?: Record<string, { marked: boolean; dotColor: string }>;
  theme: 'light' | 'dark';
}

export default function Calendar({ 
  onDateSelect, 
  selectedDate, 
  markedDates = {},
  theme: colorTheme
}: CalendarProps) {
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  
  const [month, setMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  
  useEffect(() => {
    generateCalendarDays();
  }, [month]);
  
  const generateCalendarDays = () => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    // Generate all days in the month
    const daysInMonth = eachDayOfInterval({ start, end });
    
    // Get first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = getDay(start);
    
    // Add days from previous month to fill first week
    const previousMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
      return subDays(start, firstDayOfMonth - i);
    }).reverse();
    
    // Get total number of days to show (previous month days + current month days)
    const totalShown = previousMonthDays.length + daysInMonth.length;
    
    // Calculate how many days we need to add from next month
    const remainingSlots = totalShown % 7 === 0 ? 0 : 7 - (totalShown % 7);
    
    // Add days from next month
    const nextMonthDays = Array.from({ length: remainingSlots }, (_, i) => {
      return addDays(end, i + 1);
    });
    
    // Combine all days
    setCalendarDays([...previousMonthDays, ...daysInMonth, ...nextMonthDays]);
  };
  
  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
  };
  
  const goToPreviousMonth = () => {
    setMonth(subMonths(month, 1));
  };
  
  const goToNextMonth = () => {
    setMonth(addMonths(month, 1));
  };
  
  // Day names row
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={goToPreviousMonth}
        >
          <ChevronLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>
          {format(month, 'MMMM yyyy')}
        </Text>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={goToNextMonth}
        >
          <ChevronRight size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.dayNamesRow}>
        {dayNames.map((day, index) => (
          <View style={styles.dayNameCell} key={index}>
            <Text style={[styles.dayNameText, { color: colors.textSecondary }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.daysGrid}>
        {calendarDays.map((date, index) => {
          const isCurrentMonth = date.getMonth() === month.getMonth();
          const isSelected = isSameDay(date, selectedDate);
          const dateStr = format(date, 'yyyy-MM-dd');
          const isMarked = markedDates[dateStr]?.marked;
          const dotColor = markedDates[dateStr]?.dotColor;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                isSelected && [styles.selectedDay, { backgroundColor: colors.primary }]
              ]}
              onPress={() => handleDateSelect(date)}
              disabled={!isCurrentMonth}
            >
              <Text
                style={[
                  styles.dayText,
                  !isCurrentMonth && { opacity: 0.3 },
                  !isCurrentMonth && { color: colors.textSecondary },
                  isCurrentMonth && { color: colors.textPrimary },
                  isSelected && styles.selectedDayText
                ]}
              >
                {format(date, 'd')}
              </Text>
              
              {isMarked && (
                <View
                  style={[
                    styles.dateDot,
                    { backgroundColor: dotColor || colors.primary }
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  navButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  dayNameText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 8,
  },
  selectedDay: {
    borderRadius: 8,
  },
  dayText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  dateDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});