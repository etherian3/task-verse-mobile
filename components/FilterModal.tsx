import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { X } from 'lucide-react-native';
import { Category } from '@/types/category';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: {
    categoryId: string;
    completed: boolean | null;
    sortBy: 'deadline' | 'priority' | 'created';
    sortOrder: 'asc' | 'desc';
  };
  onFilterChange: (filters: any) => void;
  categories: Category[];
}

export default function FilterModal({ 
  visible, 
  onClose, 
  filters, 
  onFilterChange,
  categories 
}: FilterModalProps) {
  const { theme } = useColorScheme();
  const colors = Theme[theme];
  
  const handleCategorySelect = (categoryId: string) => {
    onFilterChange({
      ...filters,
      categoryId: filters.categoryId === categoryId ? '' : categoryId
    });
  };
  
  const handleCompletionSelect = (completed: boolean | null) => {
    onFilterChange({
      ...filters,
      completed: filters.completed === completed ? null : completed
    });
  };
  
  const handleSortBySelect = (sortBy: 'deadline' | 'priority' | 'created') => {
    onFilterChange({
      ...filters,
      sortBy
    });
  };
  
  const handleSortOrderToggle = () => {
    onFilterChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  };
  
  const handleResetFilters = () => {
    onFilterChange({
      categoryId: '',
      completed: null,
      sortBy: 'deadline',
      sortOrder: 'asc'
    });
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Filters
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Categories
              </Text>
              
              <View style={styles.optionsGrid}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      filters.categoryId === category.id && [
                        styles.selectedOption,
                        { borderColor: category.color }
                      ],
                      { backgroundColor: colors.card }
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                  >
                    <View 
                      style={[
                        styles.categoryDot, 
                        { backgroundColor: category.color }
                      ]} 
                    />
                    <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Status
              </Text>
              
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    filters.completed === null && [
                      styles.selectedOption,
                      { borderColor: colors.primary }
                    ],
                    { backgroundColor: colors.card }
                  ]}
                  onPress={() => handleCompletionSelect(null)}
                >
                  <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                    All
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    filters.completed === false && [
                      styles.selectedOption,
                      { borderColor: colors.primary }
                    ],
                    { backgroundColor: colors.card }
                  ]}
                  onPress={() => handleCompletionSelect(false)}
                >
                  <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                    Active
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    filters.completed === true && [
                      styles.selectedOption,
                      { borderColor: colors.primary }
                    ],
                    { backgroundColor: colors.card }
                  ]}
                  onPress={() => handleCompletionSelect(true)}
                >
                  <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                    Completed
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Sort By
              </Text>
              
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    filters.sortBy === 'deadline' && [
                      styles.selectedOption,
                      { borderColor: colors.primary }
                    ],
                    { backgroundColor: colors.card }
                  ]}
                  onPress={() => handleSortBySelect('deadline')}
                >
                  <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                    Deadline
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    filters.sortBy === 'priority' && [
                      styles.selectedOption,
                      { borderColor: colors.primary }
                    ],
                    { backgroundColor: colors.card }
                  ]}
                  onPress={() => handleSortBySelect('priority')}
                >
                  <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                    Priority
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    filters.sortBy === 'created' && [
                      styles.selectedOption,
                      { borderColor: colors.primary }
                    ],
                    { backgroundColor: colors.card }
                  ]}
                  onPress={() => handleSortBySelect('created')}
                >
                  <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                    Created
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.orderButton,
                  { backgroundColor: colors.card }
                ]}
                onPress={handleSortOrderToggle}
              >
                <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                  Order: {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.border }]}
              onPress={handleResetFilters}
            >
              <Text style={[styles.resetButtonText, { color: colors.textPrimary }]}>
                Reset Filters
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.applyButtonText}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sortOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderWidth: 2,
  },
  orderButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
  },
  resetButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});