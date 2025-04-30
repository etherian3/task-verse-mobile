import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Category } from '@/types/category';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
}

export default function CategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
}: CategorySelectorProps) {
  const { theme } = useColorScheme();
  const colors = Theme[theme];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryOption,
              { backgroundColor: isSelected ? category.color + '20' : colors.card },
              isSelected && { borderColor: category.color },
              { borderWidth: isSelected ? 2 : 1, borderColor: isSelected ? category.color : colors.border }
            ]}
            onPress={() => onSelect(category.id)}
          >
            <View
              style={[
                styles.colorDot,
                { backgroundColor: category.color }
              ]}
            />
            <Text 
              style={[
                styles.categoryName, 
                { color: colors.textPrimary }
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});