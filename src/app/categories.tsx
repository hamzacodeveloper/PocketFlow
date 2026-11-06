import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import * as Crypto from 'expo-crypto';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { IconBadge } from '@/components/IconBadge';
import { EmptyState } from '@/components/EmptyState';
import { AmountInput } from '@/components/AmountInput';
import { Button } from '@/components/Button';
import {
  listAll,
  insertCategory,
  updateCategory,
  removeCategory,
  Category,
} from '@/db/repositories/categories';
import { parsePaisa, formatPaisa } from '@/utils/money';
import { CATEGORY_ICONS, colors, fonts, radius, shadows, spacing, typography } from '@/theme/tokens';

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [nameError, setNameError] = useState('');

  const refresh = useCallback(() => setCategories(listAll()), []);

  useFocusEffect(useCallback(() => refresh(), [refresh]));

  const openNew = () => {
    setEditing(null);
    setName('');
    setLimit('');
    setNameError('');
    setModalVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setLimit(cat.monthly_limit_minor ? String(cat.monthly_limit_minor / 100) : '');
    setNameError('');
    setModalVisible(true);
  };

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(t('categoryNameRequired'));
      return;
    }
    const limitMinor = limit ? parsePaisa(limit) : null;
    if (editing) {
      updateCategory({ ...editing, name: trimmed, monthly_limit_minor: limitMinor });
    } else {
      insertCategory({
        id: Crypto.randomUUID(),
        name: trimmed,
        icon: 'pricetag',
        color: colors.primary,
        monthly_limit_minor: limitMinor,
        is_default: 0,
        key: null,
      });
    }
    setModalVisible(false);
    refresh();
  };

  const confirmDelete = (cat: Category) => {
    Alert.alert(t('delete'), cat.name, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          try {
            removeCategory(cat.id);
            refresh();
          } catch {
            Alert.alert(t('invalidFile'), t('categoryUsed'));
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll={false} contentStyle={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader
        title={t('categories')}
        rightIcon="add"
        onRightPress={openNew}
      />

      <ScrollView
        contentContainerStyle={[styles.list, categories.length === 0 && styles.listEmpty]}
        showsVerticalScrollIndicator={false}
      >
        {categories.length === 0 ? (
          <EmptyState
            icon="pricetags-outline"
            title={t('noCategories')}
            hint={t('noCategoriesHint')}
            actionLabel={t('newCategory')}
            onAction={openNew}
          />
        ) : (
          categories.map((cat) => {
            const color = cat.color ?? colors.primary;
            const icon = (cat.key ? CATEGORY_ICONS[cat.key] : undefined) ?? cat.icon ?? 'pricetag';
            return (
              <Pressable
                key={cat.id}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onPress={() => openEdit(cat)}
                accessibilityRole="button"
              >
                <IconBadge
                  name={icon as keyof typeof Ionicons.glyphMap}
                  color={color}
                  size={42}
                  iconSize={19}
                />
                <View style={styles.cardText}>
                  <Text style={styles.name} numberOfLines={1}>
                    {cat.name}
                  </Text>
                  <Text style={styles.limit} numberOfLines={1}>
                    {cat.monthly_limit_minor
                      ? `${t('categoryLimit')} · ${formatPaisa(cat.monthly_limit_minor)}`
                      : t('noLimit')}
                  </Text>
                </View>
                {!cat.is_default ? (
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      confirmDelete(cat);
                    }}
                    hitSlop={10}
                    style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
                    accessibilityRole="button"
                    accessibilityLabel={t('delete')}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.expense} />
                  </Pressable>
                ) : null}
                <Ionicons name="chevron-forward" size={17} color={colors.textDisabled} />
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBg}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editing ? t('editCategory') : t('newCategory')}
              </Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={10}
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
                accessibilityRole="button"
              >
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('category')}</Text>
              <TextInput
                style={[styles.input, nameError && styles.inputError]}
                placeholder={t('category')}
                placeholderTextColor={colors.textDisabled}
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setNameError('');
                }}
                autoFocus
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('limitOptional')}</Text>
              <AmountInput value={limit} onChange={setLimit} size="md" />
            </View>

            <View style={styles.actions}>
              <Button label={t('save')} icon="checkmark" onPress={save} fullWidth />
              <Button
                label={t('cancel')}
                variant="ghost"
                onPress={() => setModalVisible(false)}
                fullWidth
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 0 },
  list: { paddingBottom: spacing.xxl, gap: spacing.sm, paddingTop: spacing.xs },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...(shadows.xs as object),
  },
  pressed: { opacity: 0.7 },
  cardText: { flex: 1, gap: 2 },
  name: {
    fontSize: typography.bodySm,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  limit: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.expenseLight,
  },
  modalBg: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    ...(shadows.lg as object),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: typography.heading,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: { gap: spacing.sm },
  label: {
    fontSize: typography.bodySm,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.bodySm,
    fontFamily: fonts.regular,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.expense },
  errorText: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.expense,
  },
  actions: { gap: spacing.sm },
});
