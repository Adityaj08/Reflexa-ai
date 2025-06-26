export type Emotion = {
    id: string;
    name: string;
    color: string;
    icon: string;
    description: string;
  };
  
  export const emotions = {
    joy: {
      id: 'joy',
      name: 'Joy',
      color: '#ffcc33',
      icon: 'smile',
      description: 'Feelings of happiness, pleasure, or contentment'
    },
    sadness: {
      id: 'sadness',
      name: 'Sadness',
      color: '#5d8aa8',
      icon: 'frown',
      description: 'Feelings of sorrow, grief, or unhappiness'
    },
    anger: {
      id: 'anger',
      name: 'Anger',
      color: '#e34234',
      icon: 'angry',
      description: 'Feelings of displeasure, hostility, or antagonism'
    },
    fear: {
      id: 'fear',
      name: 'Fear',
      color: '#9370db',
      icon: 'alert-circle',
      description: 'Feelings of anxiety, worry, or dread'
    },
    love: {
      id: 'love',
      name: 'Love',
      color: '#ff69b4',
      icon: 'heart',
      description: 'Feelings of affection, attachment, or caring'
    },
    surprise: {
      id: 'surprise',
      name: 'Surprise',
      color: '#40e0d0',
      icon: 'zap',
      description: 'Feelings of astonishment, amazement, or wonder'
    },
    neutral: {
      id: 'neutral',
      name: 'Neutral',
      color: '#a9a9a9',
      icon: 'minus-circle',
      description: 'Balanced or indifferent emotional state'
    }
  };
  
  export const emotionsList = Object.values(emotions);
  
  export const getEmotionById = (id: string): Emotion => {
    return emotions[id as keyof typeof emotions] || emotions.neutral;
  };