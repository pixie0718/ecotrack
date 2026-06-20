import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { carbonService } from '@/services/carbon.service';
import { useAuthStore } from '@/store/authStore';
import { extractError } from '@/services/api';
import type { UserProfile } from '@/types/carbon.types';

const Profile: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { isDirty } } = useForm<Partial<UserProfile>>({
    defaultValues: {
      dietType: 'omnivore',
      vehicleType: 'petrol',
      householdSize: 1,
      renewableEnergyPct: 0,
      monthlyFlights: 0,
      weeklyCarKm: 0,
      monthlyElectricityKwh: 0,
      monthlyGasM3: 0,
      targetReduction: 20,
    },
  });

  const mutation = useMutation({
    mutationFn: carbonService.updateProfile,
    onSuccess: () => {
      toast.success('Profile updated! Baseline recalculated 🌱');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => toast.error(extractError(error)),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-carbon-900 flex items-center gap-2">
          <User className="h-6 w-6 text-carbon-600" />
          Profile & Settings
        </h1>
        <p className="text-carbon-500 mt-1">
          Update your profile to get an accurate baseline footprint estimate
        </p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-carbon-500">Username</p>
            <p className="text-carbon-900 font-medium mt-1">@{user?.username}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-carbon-500">Email</p>
            <p className="text-carbon-900 mt-1">{user?.email}</p>
          </div>
          {user?.firstName && (
            <div>
              <p className="text-sm font-medium text-carbon-500">Name</p>
              <p className="text-carbon-900 mt-1">{user.firstName} {user.lastName}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-carbon-500">Member since</p>
            <p className="text-carbon-900 mt-1">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
      </Card>

      {/* Footprint profile */}
      <Card>
        <CardHeader>
          <CardTitle>Carbon Footprint Profile</CardTitle>
          <p className="text-sm text-carbon-500">
            This data helps us calculate your baseline annual footprint
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Diet Type"
              options={[
                { value: 'vegan', label: '🌱 Vegan' },
                { value: 'vegetarian', label: '🥦 Vegetarian' },
                { value: 'pescatarian', label: '🐟 Pescatarian' },
                { value: 'omnivore', label: '🍽️ Omnivore' },
                { value: 'heavy_meat', label: '🥩 Heavy Meat Eater' },
              ]}
              {...register('dietType')}
            />
            <Select
              label="Primary Vehicle"
              options={[
                { value: 'none', label: '🚶 No car' },
                { value: 'electric', label: '⚡ Electric' },
                { value: 'hybrid', label: '🔋 Hybrid' },
                { value: 'petrol', label: '⛽ Petrol' },
                { value: 'diesel', label: '🛢️ Diesel' },
              ]}
              {...register('vehicleType')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weekly Car Distance (km)"
              type="number"
              min="0"
              {...register('weeklyCarKm', { valueAsNumber: true })}
            />
            <Input
              label="Monthly Flights"
              type="number"
              min="0"
              hint="Average flights per month"
              {...register('monthlyFlights', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Monthly Electricity (kWh)"
              type="number"
              min="0"
              {...register('monthlyElectricityKwh', { valueAsNumber: true })}
            />
            <Input
              label="Monthly Gas (m³)"
              type="number"
              min="0"
              {...register('monthlyGasM3', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Renewable Energy (%)"
              type="number"
              min="0"
              max="100"
              hint="% of your electricity from renewables"
              {...register('renewableEnergyPct', { valueAsNumber: true })}
            />
            <Input
              label="Household Size (people)"
              type="number"
              min="1"
              max="20"
              {...register('householdSize', { valueAsNumber: true })}
            />
          </div>

          <Input
            label="Target Reduction (%)"
            type="number"
            min="1"
            max="100"
            hint="Your goal: % reduction from baseline"
            {...register('targetReduction', { valueAsNumber: true })}
          />

          <Button
            type="submit"
            isLoading={mutation.isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Profile
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
