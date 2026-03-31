import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { REPUTATION } from '../../constants/theme';

const getStarsFromScore = (score) => {
  const level = REPUTATION.LEVELS.find((l) => score >= l.min && score <= l.max);
  return level ? level.stars : 1;
};

const getLabelFromScore = (score) => {
  const level = REPUTATION.LEVELS.find((l) => score >= l.min && score <= l.max);
  return level ? level.label : 'Newcomer';
};

const StarRating = ({
  score = 0,
  size = 14,
  showLabel = false,
  showScore = false,
  interactive = false,
  onRate,
  style,
}) => {
  const stars = getStarsFromScore(score);
  const label = getLabelFromScore(score);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity
            key={i}
            onPress={() => interactive && onRate?.(i)}
            disabled={!interactive}
            activeOpacity={interactive ? 0.7 : 1}
          >
            <Ionicons
              name={i <= stars ? 'star' : 'star-outline'}
              size={size}
              color={i <= stars ? COLORS.starFilled : COLORS.starEmpty}
              style={{ marginHorizontal: 1 }}
            />
          </TouchableOpacity>
        ))}
      </View>
      {showLabel && <Text style={styles.label}>{label}</Text>}
      {showScore && <Text style={styles.score}>{score} pts</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: COLORS.textGold,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  score: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginLeft: 4,
  },
});

export default StarRating;
