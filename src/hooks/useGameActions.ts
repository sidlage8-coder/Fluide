import { useCallback } from 'react';
import { useGame } from '../components/ui/GameHUD';

// XP values for different actions
const XP_VALUES = {
  createInvoice: 50,
  createQuote: 40,
  createClient: 30,
  paymentReceived: 100,
  convertQuote: 75,
  finalizeInvoice: 25,
  sendInvoice: 20,
  sendQuote: 20,
};

// Achievement definitions
const ACHIEVEMENTS = {
  firstInvoice: { id: 'first_invoice', title: '🧾 Première Facture !', condition: (stats: any) => stats.invoicesCount >= 1 },
  tenInvoices: { id: 'ten_invoices', title: '📊 10 Factures créées !', condition: (stats: any) => stats.invoicesCount >= 10 },
  firstClient: { id: 'first_client', title: '🤝 Premier Client !', condition: (stats: any) => stats.clientsCount >= 1 },
  fiveClients: { id: 'five_clients', title: '👥 5 Clients acquis !', condition: (stats: any) => stats.clientsCount >= 5 },
  firstPayment: { id: 'first_payment', title: '💰 Premier Encaissement !', condition: (stats: any) => stats.totalCollected > 0 },
  thousandEuros: { id: '1k_collected', title: '🎯 1 000 € encaissés !', condition: (stats: any) => stats.totalCollected >= 1000 },
  tenThousand: { id: '10k_collected', title: '🚀 10 000 € encaissés !', condition: (stats: any) => stats.totalCollected >= 10000 },
  streak5: { id: 'streak_5', title: '🔥 Combo x5 !', condition: (stats: any) => stats.streak >= 5 },
  streak10: { id: 'streak_10', title: '⚡ Combo x10 !', condition: (stats: any) => stats.streak >= 10 },
  levelUp5: { id: 'level_5', title: '⭐ Niveau 5 atteint !', condition: (stats: any) => stats.level >= 5 },
  levelUp10: { id: 'level_10', title: '🌟 Niveau 10 atteint !', condition: (stats: any) => stats.level >= 10 },
};

export function useGameActions() {
  const { addXP, addMoney, incrementStreak, unlockAchievement, triggerCelebration, stats } = useGame();

  // Check for new achievements
  const checkAchievements = useCallback(() => {
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (!stats.achievements.includes(achievement.id) && achievement.condition(stats)) {
        unlockAchievement(achievement.id, achievement.title);
      }
    });
  }, [stats, unlockAchievement]);

  // Action handlers with XP rewards
  const onInvoiceCreated = useCallback(() => {
    addXP(XP_VALUES.createInvoice, 'Facture créée');
    incrementStreak();
    checkAchievements();
  }, [addXP, incrementStreak, checkAchievements]);

  const onQuoteCreated = useCallback(() => {
    addXP(XP_VALUES.createQuote, 'Devis créé');
    incrementStreak();
    checkAchievements();
  }, [addXP, incrementStreak, checkAchievements]);

  const onClientCreated = useCallback(() => {
    addXP(XP_VALUES.createClient, 'Client ajouté');
    incrementStreak();
    checkAchievements();
  }, [addXP, incrementStreak, checkAchievements]);

  const onPaymentReceived = useCallback((amount: number) => {
    addXP(XP_VALUES.paymentReceived, 'Paiement encaissé');
    addMoney(amount);
    incrementStreak();
    triggerCelebration();
    checkAchievements();
  }, [addXP, addMoney, incrementStreak, triggerCelebration, checkAchievements]);

  const onQuoteConverted = useCallback(() => {
    addXP(XP_VALUES.convertQuote, 'Devis converti');
    incrementStreak();
    triggerCelebration();
    checkAchievements();
  }, [addXP, incrementStreak, triggerCelebration, checkAchievements]);

  const onInvoiceFinalized = useCallback(() => {
    addXP(XP_VALUES.finalizeInvoice, 'Facture finalisée');
    checkAchievements();
  }, [addXP, checkAchievements]);

  const onInvoiceSent = useCallback(() => {
    addXP(XP_VALUES.sendInvoice, 'Facture envoyée');
    checkAchievements();
  }, [addXP, checkAchievements]);

  const onQuoteSent = useCallback(() => {
    addXP(XP_VALUES.sendQuote, 'Devis envoyé');
    checkAchievements();
  }, [addXP, checkAchievements]);

  return {
    onInvoiceCreated,
    onQuoteCreated,
    onClientCreated,
    onPaymentReceived,
    onQuoteConverted,
    onInvoiceFinalized,
    onInvoiceSent,
    onQuoteSent,
    stats,
  };
}
