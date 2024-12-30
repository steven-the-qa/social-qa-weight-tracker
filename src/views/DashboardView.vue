<script setup lang="ts">
  import LoadingView from './LoadingView.vue'
  import AddWeight from '../components/AddWeight.vue'
  import ProgressGraph from '../components/ProgressGraph.vue'
  import ProgressBar from '../components/ProgressBar.vue'
  import ThemeToggle from '../components/ThemeToggle.vue'
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import type { Ref } from 'vue'
  import { getAuth } from 'firebase/auth'
  import type { User } from 'firebase/auth'
  import { onSnapshot, doc, getDocs, collection, query, orderBy, limit, getDoc } from "firebase/firestore";
  import type { DocumentReference, CollectionReference, DocumentData, Query, Unsubscribe } from 'firebase/firestore'
  import { db } from '../firebase'

  interface WeightEntry {
    unit: 'lb' | 'kg';
    weight: number;
    createdDate: Date;
  }

  const user: Ref<User | null> = ref(null)
  const startWeight: Ref<WeightEntry | null> = ref(null)
  const currentWeight: Ref<WeightEntry | null> = ref(null)
  const goalWeight: Ref<WeightEntry | null> = ref(null)
  const weightChange: Ref<number | null> = ref(null)
  const displayedChange: Ref<string> = ref('')
  const changeColor: Ref<string> = ref('')
  const isLoading: Ref<boolean> = ref(true)
  const userListener: Ref<Unsubscribe | null> = ref(null)
  const preferredUnit: Ref<'lb' | 'kg'> = ref('lb')

  const convertWeight = (weight: number, fromUnit: 'lb' | 'kg', toUnit: 'lb' | 'kg'): number => {
    if (fromUnit === toUnit) return weight;
    return fromUnit === 'lb' ? Number((weight / 2.4).toFixed(3)) : Number((weight * 2.4).toFixed(3));
  }

  const displayWeight = (entry: WeightEntry | null): string => {
    if (!entry) return '--';
    const convertedWeight = convertWeight(entry.weight, entry.unit, preferredUnit.value);
    return `${convertedWeight.toFixed(1)} ${preferredUnit.value}`;
  }

  watch([startWeight, currentWeight, preferredUnit], () => {
    updateWeightChange();
  });

  onMounted(async () => {
    try {
      user.value = getAuth().currentUser
      if (!user.value) throw new Error('No user logged in')

      const userRef: DocumentReference = doc(db, 'users', user.value.uid)
      const weightEntriesRef: CollectionReference = collection(userRef, 'weightEntries')

      // Set up listener for user document
      userListener.value = onSnapshot(userRef, (userSnapshot) => {
        const userData = userSnapshot.data() as DocumentData
        if (userData) {
          preferredUnit.value = userData.unitOfMeasure || 'lb'
          if (userData.startingWeight) {
            startWeight.value = userData.startingWeight as WeightEntry
          }
          if (userData.goalWeight) {
            goalWeight.value = userData.goalWeight as WeightEntry
          }
        }

        // If startingWeight is not set, fetch the first weight entry
        if (!startWeight.value) {
          getDocs(query(weightEntriesRef, orderBy('createdDate'), limit(1)))
            .then((firstWeightEntrySnapshot) => {
              if (!firstWeightEntrySnapshot.empty) {
                startWeight.value = firstWeightEntrySnapshot.docs[0].data() as WeightEntry
              }
            })
        }
      })

      // Set up listener for new weight entries
      onSnapshot(query(weightEntriesRef, orderBy('createdDate', 'desc'), limit(1)), (snapshot) => {
        if (!snapshot.empty) {
          currentWeight.value = snapshot.docs[0].data() as WeightEntry
        }
      })

      isLoading.value = false
    } catch (error) {
      console.error('Error loading dashboard:', error)
      isLoading.value = false
    }
  })

  onUnmounted(() => {
    if (userListener.value) {
      userListener.value()
    }
  })

  function updateWeightChange() {
    if (startWeight.value && currentWeight.value) {
      const startWeightConverted = convertWeight(startWeight.value.weight, startWeight.value.unit, preferredUnit.value)
      const currentWeightConverted = convertWeight(currentWeight.value.weight, currentWeight.value.unit, preferredUnit.value)
      
      weightChange.value = startWeightConverted - currentWeightConverted
      displayedChange.value = weightChange.value > 0 
        ? `-${Math.abs(weightChange.value).toFixed(1)} ${preferredUnit.value}` 
        : weightChange.value < 0 
          ? `+${Math.abs(weightChange.value).toFixed(1)} ${preferredUnit.value}` 
          : `${weightChange.value.toFixed(1)} ${preferredUnit.value}`
      changeColor.value = weightChange.value < 0 
        ? 'text-[#EA4335]' 
        : weightChange.value > 0 
          ? 'text-[#34A853]' 
          : 'text-[#4B4B4B]'
    } else {
      displayedChange.value = '--'
      changeColor.value = 'text-[#4B4B4B]'
    }
  }
</script>

<template>
  <main class="h-[calc(100vh-3rem)] w-full dark:bg-gray-900 bg-white dark:text-white text-black overflow-hidden">
    <Suspense>
      <div class="flex flex-col items-center h-full">
        <div class="w-full flex justify-between items-center px-5">
          <h1 class="text-2xl font-bold text-left mt-5">Hello, {{ user?.displayName?.split(' ')[0] }}!</h1>
          <div class="mt-5">
            <ThemeToggle />
          </div>
        </div>
        <div class="w-full h-full lg:flex lg:flex-col lg:justify-center lg:items-center">
            <div class="grid grid-cols-1 grid-rows-[auto_auto_45vh_auto] gap-4 p-5 text-xl font-bold dark:text-white text-black lg:w-[50%]">
                <section class="flex justify-between items-start">
                    <div data-testid="start-weight" class="flex flex-col items-center">
                        <p>Start</p>
                        <p class="dark:text-gray-400 text-[#4B4B4B]">{{ displayWeight(startWeight) }}</p>
                    </div>
                    <div data-testid="current-weight" class="flex flex-col items-center">
                        <p>Current</p>
                        <p class="text-blue-500">{{ displayWeight(currentWeight) }}</p>
                    </div>
                    <div data-testid="goal-weight" class="flex flex-col items-center">
                        <p>Goal</p>
                        <p class="dark:text-gray-400 text-[#4B4B4B]">{{ displayWeight(goalWeight) }}</p>
                    </div>
                </section>
                <section class="flex justify-center items-center">
                    <ProgressBar
                      :start-weight="startWeight"
                      :current-weight="currentWeight"
                      :goal-weight="goalWeight"
                      :preferred-unit="preferredUnit"
                    />
                </section>
                <section class="flex justify-center items-center max-h-[45vh]">
                  <ProgressGraph :unit="preferredUnit" />
                </section>
                <section class="flex justify-between items-end">
                    <div data-testid="weight-change" class="flex flex-col justify-center items-center">
                        <p>Change</p>
                        <p :class="[changeColor, {'dark:text-gray-400': !weightChange}]">{{ displayedChange }}</p>
                    </div>
                    <AddWeight />
                </section>
            </div>
        </div>
      </div>
      <template #fallback><LoadingView /></template>
    </Suspense>
  </main>
</template>
