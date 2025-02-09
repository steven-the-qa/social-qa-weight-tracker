<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import NumberInput from './NumberInput.vue'; // Import the NumberInput component
  import { doc, updateDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
  import { db } from '../firebase';
  import { getAuth } from 'firebase/auth';

  const props = defineProps({
    isMenuOpen: Boolean,
    goalWeight: Number,
    unit: {
      type: String as () => 'lb' | 'kg',
      required: true
    },
  });

  const emit = defineEmits(['toggleMenu', 'setUnit', 'saveSettings', 'handleSignout']);

  const toggleMenu = () => {
    emit('toggleMenu'); // Emit the toggleMenu event
  };

  const goalWeight = ref<number | null>(props.goalWeight ?? null); // Initialize goalWeight to null if undefined
  const tempGoalWeight = ref<number | null>(goalWeight.value);
  const startingWeight = ref<number | null>(null);
  const tempStartingWeight = ref<number | null>(null);

  const currentUnit = ref<'lb' | 'kg'>(props.unit);

  watch(() => props.unit, (newUnit) => {
    currentUnit.value = newUnit;
  });

  onMounted(async () => {
    const user = getAuth().currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      if (userData) {
        if (userData.startingWeight) {
          startingWeight.value = userData.startingWeight.weight;
          tempStartingWeight.value = startingWeight.value;
        }
        if (userData.unitOfMeasure) {
          currentUnit.value = userData.unitOfMeasure;
          emit('setUnit', userData.unitOfMeasure); // Emit the updated unit to the parent
        }
      }
    }
  });

  const handleSignout = () => {
    emit('handleSignout'); // Emit the handleSignout event
  };

  const isUnitChanging = ref(false);

  const setUnit = async (newUnit: 'lb' | 'kg') => {
    if (isUnitChanging.value) return; // Prevent toggle if already changing
    
    isUnitChanging.value = true;
    currentUnit.value = newUnit;
    emit('setUnit', newUnit);

    // Get the current user
    const user = getAuth().currentUser;
    if (user) {
      try {
        // Reference to the user's document in Firestore
        const userRef = doc(db, 'users', user.uid);

        // Update the unit of measure in the user's document
        await updateDoc(userRef, {
          unitOfMeasure: newUnit
        });
        
        // Re-enable the toggle after 1 second
        setTimeout(() => {
          isUnitChanging.value = false;
        }, 1000);
        
      } catch (error) {
        console.error("Error updating unit of measure: ", error);
        isUnitChanging.value = false; // Re-enable on error
      }
    }
  };

  const updateWeight = async (type: 'goal' | 'starting', value: number | null) => {
    const user = getAuth().currentUser;
    if (user && value !== null) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const fieldName = type === 'goal' ? 'goalWeight' : 'startingWeight';

        await updateDoc(userRef, {
          [fieldName]: { weight: value, unit: currentUnit.value, createdDate: new Date() }
        });

        if (type === 'goal') {
          goalWeight.value = value;
        } else {
          startingWeight.value = value;
        }

        emit('saveSettings', { [fieldName]: value, unit: currentUnit.value });
        console.log(`${type} weight updated in Firebase`);
      } catch (error) {
        console.error(`Error updating ${type} weight: `, error);
      }
    }
  };

  const updateGoalWeight = () => updateWeight('goal', tempGoalWeight.value);
  const updateStartingWeight = () => updateWeight('starting', tempStartingWeight.value);

  const isDeleting = ref(false)

  const handleDeleteAllEntries = async () => {
    if (!confirm('Are you sure you want to delete all your weight entries? This acton cannot be undone.')) {
      return;
    }

    const user = getAuth().currentUser;
    if (!user) return;

    try {
      isDeleting.value = true;
      const userRef = doc(db, 'users', user.uid);
      const weightEntriesRef = collection(userRef, 'weightEntries');

      // Get all weight entries
      const snapshot = await getDocs(weightEntriesRef);

      // Delete each entry
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // Reset the starting weight and current weight in the user document
      await updateDoc(userRef, {
        startingWeight: null
      });

      isDeleting.value = false;
      alert('All weight entries have been deleted successfully.');

      // Reload the page after successful deletion
      window.location.reload();

    } catch (error) {
      console.error('Error deleting weight entries:', error);
      alert('Failed to delete weight entries. Please try again.');
      isDeleting.value = false;
    }
  };
</script>

<template>
  <div v-if="isMenuOpen" class="absolute top-14 right-0 dark:bg-gray-800 bg-white shadow-lg p-4 w-72">
    <header class="flex justify-between items-center">
      <h1 class="text-xl dark:text-white">Settings</h1>
      <button @click="toggleMenu" class="dark:text-white text-black hover:opacity-75 transition-opacity duration-200">✕</button>
    </header>
    <label for="goal-weight" class="block dark:text-gray-300 text-gray-700 mt-4">Goal Weight</label>
    <div class="flex items-center">
      <NumberInput
        id="goal-weight"
        v-model="tempGoalWeight"
        :placeholder="`New goal (${currentUnit})`"
        :min="1"
        :max="1000"
        class="dark:bg-gray-700 dark:text-white dark:border-gray-600 text-black border rounded w-full py-2 px-2 mb-4 flex-grow"
      />
      <button @click="updateGoalWeight" class="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded py-3 ml-2 mb-4 text-lg font-bold transition-colors duration-200">Update</button>
    </div>
    <label for="starting-weight" class="block dark:text-gray-300 text-gray-700 mt-4">Starting Weight</label>
    <div class="flex items-center">
      <NumberInput
        id="starting-weight"
        v-model="tempStartingWeight"
        :placeholder="`New start (${currentUnit})`"
        :min="1"
        :max="1000"
        class="dark:bg-gray-700 dark:text-white dark:border-gray-600 text-black border rounded w-full py-2 px-2 mb-4 flex-grow"
      />
      <button @click="updateStartingWeight" class="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded py-3 ml-2 mb-4 text-lg font-bold transition-colors duration-200">Update</button>
    </div>
    <div class="flex mt-4">
      <button
        @click="setUnit('lb')"
        :disabled="isUnitChanging"
        :class="{
          'bg-blue-600 text-white': currentUnit === 'lb',
          'dark:bg-gray-700 dark:text-gray-300 bg-gray-200 text-gray-700': currentUnit !== 'lb',
          'opacity-50 cursor-not-allowed': isUnitChanging
        }" 
        class="flex-1 py-2 rounded-l transition-all duration-200 hover:opacity-90"
      >
        lb
      </button>
      <button
        @click="setUnit('kg')"
        :disabled="isUnitChanging"
        :class="{
          'bg-blue-600 text-white': currentUnit === 'kg',
          'dark:bg-gray-700 dark:text-gray-300 bg-gray-200 text-gray-700': currentUnit !== 'kg',
          'opacity-50 cursor-not-allowed': isUnitChanging
        }"
        class="flex-1 py-2 rounded-r transition-all duration-200 hover:opacity-90"
      >
        kg
      </button>
    </div>
    <div class="border-t dark:border-gray-700 mt-4 pt-4">
      <h3 class="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
      <button
        @click="handleDeleteAllEntries"
        :disabled="isDeleting"
        class="w-full dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded transition-colors duration-200"
      >
        {{ isDeleting ? 'Deleting...' : 'Delete All Weight Entries' }}
      </button>
      <p class="text-xs dark:text-gray-400 text-gray-500 mt-1">
        This will permanently delete all your weight entries. This action cannot be undone.
      </p>
    </div>
    <button @click="handleSignout" class="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 mt-4 transition-colors duration-200">Log out</button>
  </div>
</template>
