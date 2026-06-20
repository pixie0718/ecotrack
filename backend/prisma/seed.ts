import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed Achievements
  await prisma.achievement.createMany({
    data: [
      { name: 'first_log', description: 'Log your first carbon activity', icon: '🌱', category: 'milestone', condition: { type: 'activity_count', value: 1 }, points: 10 },
      { name: 'week_warrior', description: 'Log activities every day for 7 days', icon: '🔥', category: 'streak', condition: { type: 'streak_days', value: 7 }, points: 50 },
      { name: 'carbon_cutter_10', description: 'Reduce monthly footprint by 10%', icon: '✂️', category: 'reduction', condition: { type: 'reduction_pct', value: 10 }, points: 100 },
      { name: 'carbon_cutter_25', description: 'Reduce monthly footprint by 25%', icon: '🌟', category: 'reduction', condition: { type: 'reduction_pct', value: 25 }, points: 250 },
      { name: 'carbon_cutter_50', description: 'Reduce monthly footprint by 50%', icon: '🏆', category: 'reduction', condition: { type: 'reduction_pct', value: 50 }, points: 500 },
      { name: 'tree_planter', description: 'Save the equivalent of 10 trees worth of CO2', icon: '🌳', category: 'milestone', condition: { type: 'tree_equivalent', value: 10 }, points: 75 },
      { name: 'green_transport', description: 'Log 30 days of car-free transport', icon: '🚴', category: 'streak', condition: { type: 'car_free_days', value: 30 }, points: 200 },
      { name: 'plant_based_week', description: 'Complete a plant-based diet week', icon: '🥦', category: 'milestone', condition: { type: 'plant_based_days', value: 7 }, points: 80 },
    ],
    skipDuplicates: true,
  });

  // Seed Challenges
  await prisma.challenge.createMany({
    data: [
      {
        title: 'Car-Free Week',
        description: 'Go one full week without driving a personal vehicle. Use public transport, cycling, or walking.',
        category: 'transport',
        difficulty: 'medium',
        durationDays: 7,
        co2Savings: 15.5,
        points: 100,
        tips: [
          'Plan your routes using public transit apps',
          'Get a bike or rent one for short trips',
          'Walk whenever the destination is under 20 minutes away',
          'Carpool if public transport isn\'t available',
        ],
      },
      {
        title: 'Plant-Based Challenge',
        description: 'Eat a plant-based diet for 7 days and discover delicious alternatives to meat.',
        category: 'food',
        difficulty: 'medium',
        durationDays: 7,
        co2Savings: 28.0,
        points: 120,
        tips: [
          'Start with familiar dishes and swap meat for legumes',
          'Explore local vegetarian restaurants',
          'Batch cook plant-based proteins to save time',
          'Try meat alternatives for your favorite recipes',
        ],
      },
      {
        title: 'Energy Audit & Save',
        description: 'Reduce your home energy consumption by 20% for one month by identifying and eliminating waste.',
        category: 'energy',
        difficulty: 'hard',
        durationDays: 30,
        co2Savings: 45.0,
        points: 200,
        tips: [
          'Switch off lights and unplug devices when not in use',
          'Lower heating/cooling by 2°C',
          'Wash clothes in cold water',
          'Install a smart thermostat',
        ],
      },
      {
        title: 'Zero Waste Week',
        description: 'Produce as little waste as possible for 7 days. Reuse, repair, and recycle everything.',
        category: 'waste',
        difficulty: 'hard',
        durationDays: 7,
        co2Savings: 8.0,
        points: 90,
        tips: [
          'Bring reusable bags, bottles, and containers',
          'Buy only what you need to minimize food waste',
          'Compost organic waste',
          'Repair broken items instead of replacing them',
        ],
      },
      {
        title: 'Conscious Consumption Month',
        description: 'Make only essential purchases for 30 days. Avoid fast fashion and impulse buying.',
        category: 'shopping',
        difficulty: 'medium',
        durationDays: 30,
        co2Savings: 35.0,
        points: 150,
        tips: [
          'Apply the 30-day rule: wait before buying non-essentials',
          'Buy second-hand or borrow instead of buying new',
          'Choose products with minimal packaging',
          'Repair clothes and electronics before replacing',
        ],
      },
      {
        title: 'Daily Activity Logger',
        description: 'Track all your carbon activities every day for 14 days to build awareness.',
        category: 'transport',
        difficulty: 'easy',
        durationDays: 14,
        co2Savings: 0,
        points: 50,
        tips: [
          'Log activities in the app each evening',
          'Review your biggest sources at the end of each day',
          'Set daily tracking reminders',
          'Share your progress with friends for accountability',
        ],
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
